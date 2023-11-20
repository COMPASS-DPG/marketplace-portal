import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';

@Module({
    imports: [PrismaModule],
    controllers: [ConsumerController],
    providers: [ConsumerService]
})
export class ConsumerModule {}