import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConsumerAccountDto } from './dto/account.dto';
import { PurchasedCourseDto } from './dto/purchasedCourse.dto';
import { CourseInfoDto, CourseInfoResponseDto } from './dto/courseInfo.dto';
import { TransactionResponse } from './dto/transaction.dto';
import { FeedbackDto } from './dto/feedback.dto';
import { CreateNotificationDto, NotificationResponseDto } from './dto/notification.dto';
import { CourseProgressStatus, NotificationStatus } from '@prisma/client';
import { CreateRequestDto, RequestDto, RequestStatus, RequestType } from './dto/create-request.dto';
import axios from 'axios';
import { PurchaseCourseDto, PurchaseDto } from './dto/purchase.dto';
import { ConsumerSignupDto } from './dto/signup.dto';
import { CourseResponse } from './dto/course-response.dto';

@Injectable()
export class ConsumerService {
    constructor(
        private prisma: PrismaService
    ) {}

    async getConsumer(consumerId: string) {
        const consumer = await this.prisma.consumerMetadata.findUnique({
            where: {
                consumerId
            }
        });
        if (!consumer)
            throw new NotFoundException("consumer does not exist");
        return consumer;
    }

    async createConsumer(signupDto: ConsumerSignupDto) {
        await this.prisma.consumerMetadata.create({
            data: signupDto
        });
    }

    async getAccountDetails(consumerId: string): Promise<ConsumerAccountDto> {
        
        // Fetch and validate consumer
        const consumer = await this.prisma.consumerMetadata.findUnique({
            where: {
                consumerId
            },
            include: {
                _count: {
                    select: {
                        ConsumerCourseMetadata: true
                    }
                }
            }
        });
        if(!consumer)
            throw new NotFoundException("consumer does not exist");

        // forward to wallet service for fetching credits
        let credits: number;
        const endpoint = `/api/consumers/${consumerId}/credits`;

        const response = await axios.get(process.env.WALLET_SERVICE_URL + endpoint);
        // console.log(response.data);
        credits = response.data.data.credits;

        // forward to user service


        return {
            consumerId,
            emailId: consumer.email,
            phoneNumber: consumer.phoneNumber,
            createdAt: consumer.createdAt,
            updatedAt: consumer.updatedAt,
            credits,
            numberOfPurchasedCourses: consumer._count.ConsumerCourseMetadata
        }       
    }

    async viewCoursePurchaseHistory(consumerId: string): Promise<PurchasedCourseDto[]> {

        return this.prisma.consumerCourseMetadata.findMany({
            where: {
                consumerId
            },
            include: {
                CourseInfo: true
            }
        });
    }

    async saveOrUnsaveCourse(consumerId: string, courseId: number, courseInfoDto?: CourseInfoDto) {

        const consumer = await this.getConsumer(consumerId);

        let savedCourses = consumer.savedCourses;

        // Add the course to the list of saved courses if it is not present
        // Remove if present
        const courseIdx = savedCourses.findIndex((c) => c == courseId)

        if(courseIdx != -1) {
            savedCourses[courseIdx] = savedCourses[savedCourses.length - 1];
            savedCourses.pop();
        } else {
            savedCourses.push(courseId)
        }
        await this.prisma.consumerMetadata.update({
            where: {
                consumerId
            },
            data: {
                savedCourses: {
                    set: savedCourses
                }
            }
        });
        if(courseIdx != -1 || !courseInfoDto)
            return;

        //  Create an entry if it does not exist and update it if it does.
        //  There may be a race condition for inserting courseInfo for the same course.
        //  In such a case, insertion happens once and no error is thrown
        try {
            await this.prisma.courseInfo.upsert({
                where: {
                    courseId: courseInfoDto.courseId
                },
                create: courseInfoDto,
                update: courseInfoDto
            });
        } catch {}
    }

    async viewTransactionHistory(consumerId: string): Promise<TransactionResponse[]> {

        const endpoint = `/api/consumers/${consumerId}/transactions`;
        try {
            const response = await axios.get(process.env.WALLET_SERVICE_URL + endpoint);
            // console.log(response.data);
            return response.data.data.transactions;
        } catch(e) {
            throw new HttpException(e.response.data, e.status)
        }
    }

    async giveFeedback(consumerId: string, feedbackDto: FeedbackDto) {

        const consumerCourseData = await this.prisma.consumerCourseMetadata.findUnique({
            where: {
                consumerId_courseId: {
                    consumerId,
                    courseId: feedbackDto.courseId
                }
            },
        });
        if(!consumerCourseData)
            throw new NotFoundException("This user has not subscribed to this course");
        
        if(consumerCourseData.status != CourseProgressStatus.COMPLETED)
            throw new BadRequestException("User has not completed the course");

        // forward to course manager
        if(!process.env.COURSE_MANAGER_URL)
            throw new HttpException("Course Manager URL not defined", 500);
        
        const endpoint = `/api/course/${feedbackDto.courseId}/feedback/${consumerId}`;

        await axios.patch(process.env.COURSE_MANAGER_URL + endpoint);

        // update marketplace metadata model
        await this.prisma.consumerCourseMetadata.update({
            where: {
                consumerId_courseId: {
                    consumerId,
                    courseId: feedbackDto.courseId
                }
            },
            data: {
                rating: feedbackDto.rating,
                feedback: feedbackDto.feedback
            }
        });

        // forward to passbook to issue credential
        
    }

    async viewCourse(courseId: number): Promise<CourseResponse> {

        // forward to BPP

        // code to directly forward to course manager
        if(!process.env.COURSE_MANAGER_URL)
            throw new HttpException("Course manager URL not defined", 500);
        const endpoint = `/api/course/${courseId}`;
        const response = await axios.get(process.env.COURSE_MANAGER_URL + endpoint);
        return response.data.data;
    }

    async searchCourses(searchInput: string): Promise<CourseResponse[]> {

        // forward to BPP

        // code to directly forward to course manager
        if(!process.env.COURSE_MANAGER_URL)
            throw new HttpException("Course manager URL not defined", 500);
        const endpoint = `/api/course/search`;
        const queryParams = `?searchInput=${searchInput}`
        const response = await axios.get(process.env.COURSE_MANAGER_URL + endpoint + queryParams);
        // console.log(response.data);
        return response.data.data;
    }

    async purchaseCourse(consumerId: string, purchaseCourseDto: PurchaseCourseDto) {

        await this.getConsumer(consumerId);

        let consumerCourseData = await this.prisma.consumerCourseMetadata.findUnique({
            where: {
                consumerId_courseId: {
                    consumerId,
                    courseId: purchaseCourseDto.courseId
                }
            }
        });
        if(consumerCourseData)
            throw new BadRequestException("Course Already purchased");

        // forward to course manager for purchase
        // wallet transaction handled in course manager
        const endpoint = `/api/course/${purchaseCourseDto.courseId}/purchase`;
        const purchaseDto: PurchaseDto = {
            consumerId,
            providerId: purchaseCourseDto.providerId,
            credits: purchaseCourseDto.credits,
            transactionDescription: `Purchased course ${purchaseCourseDto.title}`
        }

        const response = await axios.post(process.env.COURSE_MANAGER_URL + endpoint, purchaseDto);

        //  Create an entry to add the course info if it does not exist and update it if it does. 
        //  There may be a race condition for inserting courseInfo for the same course.
        //  In such a case, insertion happens once and no error is thrown
        try {
            const {providerId, ...clone} = purchaseCourseDto;
            await this.prisma.courseInfo.upsert({
                where: {
                    courseId: clone.courseId
                },
                create: clone,
                update: clone
            });
        } catch {}

        // Record transaction in marketplace metadata model
        await this.prisma.consumerCourseMetadata.create({
            data: {
                consumerId,
                courseId: purchaseCourseDto.courseId,
                walletTransactionId: response.data.data.walletTransactionId,
                becknTransactionId: 0, 
            }
        });
    }

    async getSavedCourses(consumerId: string): Promise<CourseInfoResponseDto[]> {

        const consumer = await this.getConsumer(consumerId);

        return this.prisma.courseInfo.findMany({
            where: {
                courseId: {
                    in: consumer.savedCourses
                }
            }
        });
    }

    async getNotifications(consumerId: string): Promise<NotificationResponseDto[]> {

        return this.prisma.notification.findMany({
            where: {
                consumerId
            }
        });
    }

    async createNotification(consumerId: string, createNotificationDto: CreateNotificationDto) {

        await this.prisma.notification.create({
            data: {
                consumerId,
                ...createNotificationDto
            }
        });
    }

    async markNotificationViewed(notificationId: number, consumerId: string) {

        const notification = await this.prisma.notification.findUnique({
            where: {
                id: notificationId
            }
        });
        if(!notification)
            throw new NotFoundException("Notification does not exist");
        if(notification.consumerId != consumerId)
            throw new BadRequestException("Notification does not belong to this user");
        
        await this.prisma.notification.update({
            where: {
                id: notificationId
            },
            data: {
                status: NotificationStatus.VIEWED
            }
        });
    }

    async completeCourse(consumerId: string, courseId: number) {

        await this.getConsumer(consumerId);
        try {
            await this.prisma.consumerCourseMetadata.update({
                where: {
                    consumerId_courseId: {
                        consumerId,
                        courseId
                    }
                },
                data: {
                    status: CourseProgressStatus.COMPLETED
                }
            });
        } catch {
            throw new NotFoundException("This user has not subscribed to this course");
        }
    }

    async requestCredits(consumerId: string, requestDto: RequestDto) {

        await this.getConsumer(consumerId);

        const createRequestDto: CreateRequestDto = {
            userId: consumerId,
            status: RequestStatus.Pending,
            type: RequestType.Credit,
            ...requestDto,
        }
        const endpoint = `/api/requests/`;
        const response = await axios.post(process.env.REQUEST_SERVICE_URL + endpoint, createRequestDto);
        return response;
    }
}