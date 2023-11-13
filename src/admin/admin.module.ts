import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisStoreModule } from 'src/redis-store/redis-store.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [PrismaModule]
})
export class AdminModule {}
