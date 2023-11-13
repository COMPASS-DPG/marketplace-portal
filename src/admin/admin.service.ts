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

    async updateConsumer(editConsumerDto: EditConsumerDto) {
        return await this.prisma.consumerMetadata.update({
            where: { consumerId: editConsumerDto.consumerId },
            data: editConsumerDto
        });
    }

    async addCredits(adminId: string, consumerId: string, credits: number) {
        const walletService = process.env.WALLET_SERVICE_URL;
        const endpoint = `/${adminId}/add-credits`;
        const url = walletService + endpoint;
        const reqBody = {
            consumerId: consumerId,
            credits: credits
        };
        axios.post(url, reqBody).then((res) => {
            return res;
        }).catch(err => {
            throw new Error('add-credits request to walletservice failed');
        });
    }

    async reduceCredits(adminId: string, consumerId: string, credits: number) {
        const walletService = process.env.WALLET_SERVICE_URL;
        const endpoint = `/${adminId}/reduce-credits`;
        const url = walletService + endpoint;
        const reqBody = {
            consumerId: consumerId,
            credits: credits
        };
        axios.post(url, reqBody).then((res) => {
            return res;
        }).catch(err => {
            throw new Error('reduce-credits request to walletservice failed');
        });
    }

    async getAllConsumerWallets() {
        const walletService = process.env.WALLET_SERVICE_URL;
        const allUsers = await this.prisma.consumerMetadata.findMany({});
        return allUsers.map(async (user) => {
            const url = walletService + `/${user.consumerId}/credits`;
            let resp = await axios.get(url);
            return {
                userId: user.consumerId,
                // userName: fetch from userService,
                // role: fetch from userService,
                CoursePurchased: user.coursesPurchased.length,
                walletBalance: resp.data.data.credits
            }
        })
    }

    async getTransactions(adminId: string, consumerId: string) {
        const walletService = process.env.WALLET_SERVICE_URL;
        const url = walletService + `/${adminId}/transactions/consumers/${consumerId}`;
        const consumerTransactions = await axios.get(url);
        return consumerTransactions;
    }

}
