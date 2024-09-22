import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { ConsumerModule } from "./consumer/consumer.module";
import { AdminModule } from './admin/admin.module';
// import { RedisStoreModule } from './redis-store/redis-store.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ConsumerModule,
    AdminModule,
    // RedisStoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
