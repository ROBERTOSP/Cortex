import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ScraperService } from './scraper.service';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ScraperGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer() server: Server;

  constructor(private scraperService: ScraperService) {}

  onModuleInit() {
    this.scraperService.logs$.subscribe((log) => {
      this.server.emit('scraper_log', log);
    });
  }

  afterInit(server: Server) {
    console.log('Scraper WebSocket Gateway inicializado no servidor principal');
  }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado ao Scraper: ${client.id}`);
    client.emit('scraper_status', { running: this.scraperService.isRunning() });
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado do Scraper: ${client.id}`);
  }

  @SubscribeMessage('start_scraper')
  handleStartScraper(client: Socket, config: any) {
    this.scraperService.startScraper(config);
    return { event: 'scraper_status', data: { running: true } };
  }

  @SubscribeMessage('stop_scraper')
  handleStopScraper() {
    this.scraperService.stopScraper();
    return { event: 'scraper_status', data: { running: false } };
  }

  @SubscribeMessage('get_database_stats')
  async handleGetStats() {
    const stats = await this.scraperService.getStats();
    return { event: 'database_stats', data: stats };
  }

  @SubscribeMessage('clear_database')
  async handleClearDatabase() {
    const result = await this.scraperService.clearDatabase();
    return { event: 'database_cleared', data: result };
  }
}
