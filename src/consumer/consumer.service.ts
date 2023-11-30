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
import { PurchaseDto } from './dto/purchase.dto';
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

    async fetchOngoingCourses(consumerId: string): Promise<PurchasedCourseDto[]> {

        return this.prisma.consumerCourseMetadata.findMany({
            where: {
                consumerId,
                status: CourseProgressStatus.IN_PROGRESS
            },
            include: {
                CourseInfo: true
            }
        });
    }

    async saveCourse(consumerId: string, courseId: number, courseInfoDto: CourseInfoDto) {

        const consumer = await this.getConsumer(consumerId);

        if(consumer.savedCourses.find((c) => c == courseId))
            throw new BadRequestException("Course already saved");
        await this.prisma.consumerMetadata.update({
            where: {
                consumerId,
            },
            data: {
                savedCourses: {
                    push: courseId
                }
            }
        });
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

    async unsaveCourse(consumerId: string, courseId: number) {

        const consumer = await this.getConsumer(consumerId);

        if(!consumer.savedCourses.find((c) => c == courseId))
            throw new BadRequestException("Course not saved");

        await this.prisma.consumerMetadata.update({
            where: {
                consumerId,
            },
            data: {
                savedCourses: consumer.savedCourses.filter((c) => c != courseId)
            }
        });
    }

    async checkSaveStatus(consumerId: string, courseId: number) {

        const consumer = await this.getConsumer(consumerId);

        if(consumer.savedCourses.find((c) => c == courseId))
            return true;

        return false;
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

        // forward to Credential MS to issue certificate
        // if(!process.env.CREDENTIAL_SERVICE_URL)
        //     throw new HttpException("Credential Service URL not defined", 500);
        
        // let endpoint = `/credentials/issue`;
        
        // const requestDto = JSON.parse(`{
        //     "credential": {
        //         "@context": [
        //             "https://www.w3.org/2018/credentials/v1",
        //             "https://www.w3.org/2018/credentials/examples/v1"
        //         ],
        //         "type": [
        //             "VerifiableCredential",
        //             "UniversityDegreeCredential"
        //         ],
        //         "issuer": "did:rcw:6b9d7b31-bc7f-454a-be30-b6c7447b1cff",
        //         "issuanceDate": "2023-02-06T11:56:27.259Z",
        //         "expirationDate": "2023-02-08T11:56:27.259Z",
        //         "credentialSubject": {
        //             "id": "did:rcw:6b9d7b31-bc7f-454a-be30-b6c7447b1cff",
        //             "grade": "9.23",
        //             "programme": "B.Tech",
        //             "certifyingInstitute": "IIIT Sonepat",
        //             "evaluatingInstitute": "NIT Kurukshetra"
        //         },
        //         "options": {
        //             "created": "2020-04-02T18:48:36Z",
        //             "credentialStatus": {
        //                 "type": "RevocationList2020Status"
        //             }
        //         }
        //     },
        //     "credentialSchemaId": "did:schema:b22f7835-0255-412b-8663-d1131c48aa66",
        //     "credentialSchemaVersion": "3.0.0",
        //     "tags": ["tag1", "tag2", "tag3"],
        //     "method": "cbse"
        // }`)

        // const response = await axios.post(process.env.CREDENTIAL_SERVICE_URL + endpoint, requestDto);

        // const credentialId = response.data.data.credential.id;

        // forward to passbook to save certificate


        // forward to course manager
        if(!process.env.COURSE_MANAGER_URL)
            throw new HttpException("Course Manager URL not defined", 500);
        
        const endpoint = `/api/course/${feedbackDto.courseId}/feedback/${consumerId}`;
        const feedbackBody = {
            rating: feedbackDto.rating
        }

        await axios.patch(process.env.COURSE_MANAGER_URL + endpoint, feedbackBody);

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

    async purchaseCourse(consumerId: string, courseInfoDto: CourseInfoDto) {

        await this.getConsumer(consumerId);

        let consumerCourseData = await this.prisma.consumerCourseMetadata.findUnique({
            where: {
                consumerId_courseId: {
                    consumerId,
                    courseId: courseInfoDto.courseId
                }
            }
        });
        if(consumerCourseData)
            throw new BadRequestException("Course Already purchased");

        // forward to bpp


        // forward to course manager for purchase
        // wallet transaction handled in course manager
        if(!process.env.COURSE_MANAGER_URL)
            throw new HttpException("Course manager URL not defined", 500);
        const endpoint = `/api/course/${courseInfoDto.courseId}/purchase`;
        const purchaseDto: PurchaseDto = {
            consumerId,
            transactionDescription: `Purchased course ${courseInfoDto.title}`
        }

        const response = await axios.post(process.env.COURSE_MANAGER_URL + endpoint, purchaseDto);
        
        // Rest of the updates can be done in on_confirm

        //  Create an entry to add the course info if it does not exist and update it if it does. 
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

        // Record transaction in marketplace metadata model
        await this.prisma.consumerCourseMetadata.create({
            data: {
                consumerId,
                courseId: courseInfoDto.courseId,
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
                    status: CourseProgressStatus.COMPLETED,
                    completedAt: new Date()
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