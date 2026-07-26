import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const databaseUrl = process.env.DATABASE_URL || '';
    const shouldUseSsl = (urlString: string) => {
      try {
        const url = new URL(urlString);
        const host = (url.hostname || '').toLowerCase();
        const sslmode = (url.searchParams.get('sslmode') || '').toLowerCase();

        if (host === 'localhost' || host === '127.0.0.1') return false;
        if (sslmode === 'disable') return false;
        if (sslmode === 'require' || sslmode === 'verify-ca' || sslmode === 'verify-full') return true;

        return true;
      } catch {
        return isProduction;
      }
    };

    const pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: shouldUseSsl(databaseUrl) ? { rejectUnauthorized: false } : undefined
    });
    
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
