import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { PrismaService } from "./prisma/prisma.service";
import { AdminModule } from './admin/admin.module';
import { RedisStoreModule } from './redis-store/redis-store.module';
import { RedisStoreService } from "./redis-store/redis-store.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AdminModule,
    RedisStoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
