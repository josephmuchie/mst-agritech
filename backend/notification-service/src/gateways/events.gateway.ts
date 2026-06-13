import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      /^https:\/\/.*\.mst\.co\.zw$/,
      /^https:\/\/.*\.mstagritech\.co\.zw$/,
      /^https:\/\/.*\.vercel\.app$/,
    ],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private redisSubscriber: Redis;

  onModuleInit() {
    this.redisSubscriber = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
    });

    // Subscribe to channels published by the Spring Boot core-api
    this.redisSubscriber.subscribe(
      'order-events',
      'shipment-events',
      'payment-events',
      'notification-events',
      (err) => {
        if (err) this.logger.error('Redis subscribe error', err);
        else this.logger.log('Subscribed to Redis channels');
      },
    );

    this.redisSubscriber.on('message', (channel: string, message: string) => {
      try {
        const payload = JSON.parse(message);
        this.server.emit(channel, payload);
        if (channel !== 'notification-events') {
          this.server.emit('notification-events', payload);
        }
      } catch (err) {
        this.logger.warn(`Failed to forward Redis message on ${channel}`, err);
      }
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe-order')
  handleSubscribeOrder(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`order-${data.orderId}`);
    return { event: 'subscribed', data: `order-${data.orderId}` };
  }
}
