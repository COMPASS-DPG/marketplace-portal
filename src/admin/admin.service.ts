import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditConsumerDto } from './dto/edit-consumer.dto';
import axios from 'axios';

@Injectable()
export class AdminService {

    constructor(private prisma: PrismaService) {}

    async login(email: string, password: string) {
        const admin = await this.prisma.admin.findUnique({
            where: { email: email, password: password }
        });
        if(admin == null) {
            throw new Error(`Admin not found with email ${email} and password ${password}`);
        }
        return admin.id;
    }

    async getAdmin(adminId: string) {
        const admin = await this.prisma.admin.findUnique({
            where: { id: adminId }
        });

        return admin;
    }

    async getAllConsumers() {
        return await this.prisma.consumerMetadata.findMany({});
    }

    async getConsumer(consumerId: string) {
        return await this.prisma.consumerMetadata.findUnique({
            where: {consumerId: consumerId}
        });
    }

    async updateConsumer(consumerId: string, editConsumerDto: EditConsumerDto) {
        return this.prisma.consumerMetadata.update({
            where: { consumerId: consumerId },
            data: editConsumerDto
        });
    }

    async addCredits(adminId: string, consumerId: string, credits: number) {
        const walletService = process.env.WALLET_SERVICE_URL;
        const endpoint = `/api/admin/${adminId}/add-credits`;
        const url = walletService + endpoint;
        const reqBody = {
            consumerId: consumerId,
            credits: credits
        };
        await axios.post(url, reqBody);
    }

    async reduceCredits(adminId: string, consumerId: string, credits: number) {
        const walletService = process.env.WALLET_SERVICE_URL;
        const endpoint = `/api/admin/${adminId}/reduce-credits`;
        const url = walletService + endpoint;
        const reqBody = {
            consumerId: consumerId,
            credits: credits
        };
        return axios.post(url, reqBody)
    }

    async getAllConsumerWallets() {
        const walletService = process.env.WALLET_SERVICE_URL;
        const allUsers = await this.prisma.consumerMetadata.findMany({});
        const allWalletsPromise = allUsers.map(async (user) => {
            const url = walletService + `/api/consumers/${user.consumerId}/credits`;
            let resp = await axios.get(url);
            return {
                userId: user.consumerId,
                // userName: fetch from userService,
                // role: fetch from userService,
                // CoursePurchased: user.coursesPurchased.length,
                walletBalance: resp.data.data.credits
            }
        });
        return Promise.all(allWalletsPromise);
    }

    async getTransactions(adminId: string, consumerId: string) {
        const walletService = process.env.WALLET_SERVICE_URL;
        const url = walletService + `/api/admin/${adminId}/transactions/consumers/${consumerId}`;
        const consumerTransactions = await axios.get(url);
        return consumerTransactions.data.data.transactions;
    }

}
