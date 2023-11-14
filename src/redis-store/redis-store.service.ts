import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService, DEFAULT_REDIS_NAMESPACE } from '@liaoliaots/nestjs-redis';
import { Redis } from'ioredis';

@Injectable()
export class RedisStoreService {
    private readonly redis: Redis;

    constructor(private readonly redisService: RedisService) {
        this.redis = this.redisService.getClient();
    }

    async set(key: string, value: any, expiresIn: number) {
        const client = this.redisService.getClient();
        await client.set(key, JSON.stringify(value), 'EX', expiresIn);
    }
    
    async get(key: string) {
        const client = this.redisService.getClient();
        const result = await client.get(key);
        if(result == null)
            throw new NotFoundException("No Value found");
        return JSON.parse(result);
    }
}
