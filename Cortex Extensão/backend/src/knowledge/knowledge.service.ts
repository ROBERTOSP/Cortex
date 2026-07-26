import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class KnowledgeService {
  constructor(private readonly database: DatabaseService) {}

  async getGraph(userId: string, contestId: string) {
    const contest = await this.database.contest.findFirst({
      where: { id: contestId, userId },
      include: {
        nodes: {
          where: { parentId: null },
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
      },
    });

    if (!contest) {
      throw new NotFoundException('Mapa de conhecimento não encontrado');
    }

    const nodes: Array<{
      id: string;
      name: string;
      type: string;
      parentId: string | null;
      mastery: number;
      retention: number;
      difficulty: number;
    }> = [];
    const edges: Array<{ source: string; target: string }> = [];

    const visit = (
      node: {
        id: string;
        name: string;
        type: string;
        parentId: string | null;
        mastery: number;
        retention: number;
        difficulty: number;
        children?: any[];
      },
      parentId: string | null = null,
    ) => {
      nodes.push({
        id: node.id,
        name: node.name,
        type: node.type,
        parentId,
        mastery: node.mastery,
        retention: node.retention,
        difficulty: node.difficulty,
      });

      for (const child of node.children || []) {
        edges.push({ source: node.id, target: child.id });
        visit(child, node.id);
      }
    };

    for (const root of contest.nodes) {
      visit(root);
    }

    return {
      contest: {
        id: contest.id,
        name: contest.name,
        targetJob: contest.targetJob,
        board: contest.board,
      },
      nodes,
      edges,
    };
  }
}
