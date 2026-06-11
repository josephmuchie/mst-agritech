import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EventsGateway } from './gateways/events.gateway';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      },
    }),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  controllers: [HealthController],
  providers: [EventsGateway],
})
export class AppModule {}
