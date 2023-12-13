import { BadRequestException, HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConsumerAccountDto } from './dto/account.dto';
import { PurchaseStatusDto, PurchasedCourseDto } from './dto/purchasedCourse.dto';
import { CourseInfoDto, CourseInfoResponseDto } from './dto/courseInfo.dto';
import { TransactionResponse } from './dto/transaction.dto';
import { FeedbackDto, RatingRequestDto } from './dto/feedback.dto';
import { CreateNotificationDto, NotificationResponseDto } from './dto/notification.dto';
import { CourseProgressStatus, NotificationStatus } from '@prisma/client';
import { CreateRequestDto, RequestDto, RequestStatus, RequestType } from './dto/create-request.dto';
import axios from 'axios';
import { ConsumerSignupDto } from './dto/signup.dto';
import { CourseResponse } from './dto/course-response.dto';
import { COURSE_MANAGER_BPP_ID } from 'src/utils/constants';
import { SearchResponseDto } from './dto/search-response.dto';
import { CourseIdDto } from './dto/course-id.dto';
import { getPrismaErrorStatusAndMessage } from 'src/utils/utils';

@Injectable()
export class ConsumerService {
    private readonly logger = new Logger(ConsumerService.name);

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

    async getConsumerFromUserService(consumerId: string) {

        if(!process.env.USER_SERVICE_URL)
            throw new HttpException("User Service URL not defined", 500);

        const endpoint = `/api/mockFracService/user/${consumerId}`;
        const response = await axios.get(process.env.USER_SERVICE_URL + endpoint);
        const consumer = response.data.data;
        if(!consumer)
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
        const consumerResponse = await this.getConsumerFromUserService(consumerId);

        return {
            consumerId,
            name: consumerResponse.name,
            designation: consumerResponse.designation,
            profilePicture: consumerResponse.profilePicture,
            emailId: consumer.email,
            phoneNumber: consumer.phoneNumber,
            createdAt: consumer.createdAt,
            updatedAt: consumer.updatedAt,
            credits,
            numberOfPurchasedCourses: consumer._count.ConsumerCourseMetadata
        }       
    }

    async viewCoursePurchaseHistory(
        consumerId: string, 
        courseProgressStatus?: CourseProgressStatus
    ): Promise<PurchasedCourseDto[]> {

        const consumerCourses = await this.prisma.consumerCourseMetadata.findMany({
            where: {
                consumerId,
                status: courseProgressStatus
            },
            include: {
                CourseInfo: {
                    include: {
                        _count: {
                            select: {
                                ConsumerCourseMetadata: true
                            }
                        }
                    
                    }
                }
            }
        });
        return consumerCourses.map((c) => {
            return {
                id: c.id,
                courseInfoId: c.courseInfoId,
                becknTransactionId: c.becknTransactionId,
                consumerId: c.consumerId,
                feedback: c.feedback,
                purchasedAt: c.purchasedAt,
                rating: c.rating,
                status: c.status,
                becknMessageId: c.becknMessageId,
                completedAt: c.completedAt,
                CourseInfo: {
                    title: c.CourseInfo.title,
                    description: c.CourseInfo.description,
                    credits: c.CourseInfo.credits,
                    imageLink: c.CourseInfo.imageLink,
                    language: c.CourseInfo.language,
                    courseLink: c.CourseInfo.courseLink,
                    providerName: c.CourseInfo.providerName,
                    author: c.CourseInfo.author,
                    avgRating: c.CourseInfo.avgRating,
                    bppId: c.CourseInfo.bppId,
                    bppUri: c.CourseInfo.bppUri,
                    providerId: c.CourseInfo.providerId,
                    competency: c.CourseInfo.competency,
                    courseId: c.CourseInfo.courseId,
                    numberOfPurchases: c.CourseInfo._count.ConsumerCourseMetadata,
                }
            }
        });
    }

    async saveCourse(consumerId: string, courseInfoDto: CourseInfoDto) {

        const consumer = await this.getConsumer(consumerId);

        let courseInfo = await this.prisma.courseInfo.findUnique({
            where: {
                courseId_bppId: {
                    courseId: courseInfoDto.courseId,
                    bppId: courseInfoDto.bppId ?? COURSE_MANAGER_BPP_ID
                }
            }
        });
        if(courseInfo != null) {
            if(consumer.savedCourses.find((c) => c == courseInfo!.id))
                return
        } else {
            const {bppId, bppUri, ...rest} = courseInfoDto;
            courseInfo = await this.prisma.courseInfo.create({
                data: {
                    ...rest,
                    bppId: bppId ?? COURSE_MANAGER_BPP_ID,
                    bppUri: bppUri ?? process.env.COURSE_MANAGER_URL!
                }
            });
        }
        await this.prisma.consumerMetadata.update({
            where: {
                consumerId,
            },
            data: {
                savedCourses: {
                    push: courseInfo.id
                }
            }
        });
    }

    async unsaveCourse(consumerId: string,  courseIdDto: CourseIdDto) {

        const consumer = await this.getConsumer(consumerId);

        const courseInfo = await this.prisma.courseInfo.findUnique({
            where: {
                courseId_bppId: {
                    courseId: courseIdDto.courseId,
                    bppId: courseIdDto.bppId ?? COURSE_MANAGER_BPP_ID
                }
            }
        });
        if(!courseInfo || !consumer.savedCourses.find((c) => c == courseInfo.id))
            throw new BadRequestException("Course not saved");

        await this.prisma.consumerMetadata.update({
            where: {
                consumerId,
            },
            data: {
                savedCourses: consumer.savedCourses.filter((c) => c != courseInfo.id)
            }
        });
    }

    async checkSaveStatus(consumerId: string, courseIdDto: CourseIdDto) {

        const consumer = await this.getConsumer(consumerId);

        const courseInfo = await this.prisma.courseInfo.findUnique({
            where: {
                courseId_bppId: {
                    courseId: courseIdDto.courseId,
                    bppId: courseIdDto.bppId ?? COURSE_MANAGER_BPP_ID
                }
            }
        });
        if(courseInfo && consumer.savedCourses.find((c) => c == courseInfo.id))
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
                consumerId_courseInfoId: {
                    consumerId,
                    courseInfoId: feedbackDto.courseInfoId
                }
            },
            include: {
                CourseInfo: {
                    select: {
                        bppId: true,
                        bppUri: true,
                        courseId: true,
                        competency: true
                    }
                }
            }
        });
        if(!consumerCourseData)
            throw new NotFoundException("This user has not subscribed to this course");
        
        if(consumerCourseData.status != CourseProgressStatus.COMPLETED)
            throw new BadRequestException("User has not completed the course");

        if(consumerCourseData.CourseInfo.bppId != COURSE_MANAGER_BPP_ID) {
            // `/rating` to BAP
            const ratingEndpoint = `/courses/rating`;
            const ratingBody: RatingRequestDto = {
                courseId: consumerCourseData.CourseInfo.courseId,
                rating: feedbackDto.rating,
                bppId: consumerCourseData.CourseInfo.bppId,
                bppUri: consumerCourseData.CourseInfo.bppUri
            }

            await axios.post(process.env.BAP_URI + ratingEndpoint, ratingBody);
        } else {
            // forward to course manager
            if(!process.env.COURSE_MANAGER_URL)
                throw new HttpException("Course Manager URL not defined", 500);
            
            const endpoint = `/api/course/${consumerCourseData.CourseInfo.courseId}/feedback/${consumerId}`;
            const feedbackBody = {
                rating: feedbackDto.rating
            }
            await axios.patch(process.env.COURSE_MANAGER_URL + endpoint, feedbackBody);
        }

        const competencyMap = {};

        // fetch all competencies
        if(process.env.USER_SERVICE_URL) {

            let endpoint = `/api/mockFracService/competency`;
            try {
                const competencyResponse = await axios.get(process.env.USER_SERVICE_URL + endpoint);
                const competency = competencyResponse.data.data;
                competency.map((c) => {
                    competencyMap[c.name] = c.id;
                });
            } catch(err) {
                const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
                this.logger.error(`Error while fetching competencies`);
                this.logger.error(`Error ${statusCode}: ${errorMessage}`);
            }
        }

        // forward to passbook to save certificate
        if(!process.env.PASSBOOK_SERVICE_URL)
            throw new HttpException("Passbook Service URL not defined", 500);

        const endpoint = `/api/user/assessment`;

        const competencies = (typeof consumerCourseData.CourseInfo.competency == "string") 
            ? JSON.parse(consumerCourseData.CourseInfo.competency) 
            : consumerCourseData.CourseInfo.competency;
        consumerCourseData.CourseInfo.competency
        console.log(competencies);

        for(const competency in competencies) {
            const levels = competencies[competency];
            for(const level of levels) {
                const addAssessmentBody = {
                    userId: "1246", // consumerId,
                    competencyId: competencyMap[competency] ?? 0,
                    competency: competency,
                    levelNumber: (typeof level == "number") ? level : 1,
                    type: "CBP",
                    score: "100",
                    certificateId: consumerCourseData.certificateCredentialId,
                    dateOfIssuance: new Date().toISOString()
                }
                console.log(addAssessmentBody);
                const response = await axios.post(process.env.PASSBOOK_SERVICE_URL + endpoint, addAssessmentBody);
                console.log(response.data);
            }
        }

        // update marketplace metadata model
        await this.prisma.consumerCourseMetadata.update({
            where: {
                id: consumerCourseData.id
            },
            data: {
                rating: feedbackDto.rating,
                feedback: feedbackDto.feedback,
            }
        });
    }

    async viewCourse(courseId: string): Promise<CourseResponse> {

        // code to directly forward to course manager
        if(!process.env.COURSE_MANAGER_URL)
            throw new HttpException("Course manager URL not defined", 500);
        const endpoint = `/api/course/${courseId}`;
        const response = await axios.get(process.env.COURSE_MANAGER_URL + endpoint);
        return response.data.data;
    }

    async getPollResults(messageId: string) {
        const url = process.env.BAP_URL;
        const endpoint = `/on_search/poll/${messageId}`;
        const searchResults = await axios.get(url + endpoint);
        return searchResults;
    }

    async searchCourses(searchInput: string): Promise<SearchResponseDto> {

        // forward to BAP(`/search)
        if(!process.env.BAP_URI)
            throw new HttpException("BAP URI not defined", 500);
        
        const searchEndpoint = `/courses/search?searchText=${searchInput}`;

        const searchResponse = await axios.get(process.env.BAP_URI + searchEndpoint);
        const messageId = searchResponse.data.messageId;

        // forward to course manager
        if(!process.env.COURSE_MANAGER_URL)
            throw new HttpException("Course manager URL not defined", 500);
        const endpoint = `/api/course/search`;
        const queryParams = `?searchInput=${searchInput}`
        const response = await axios.get(process.env.COURSE_MANAGER_URL + endpoint + queryParams);

        return {
            courses: response.data.data,
            messageId
        }
    }

    async purchaseCourse(consumerId: string, courseInfoDto: CourseInfoDto) {

        const consumer = await this.getConsumer(consumerId);

        const consumerCourseData = await this.prisma.consumerCourseMetadata.findFirst({
            where: {
                consumerId,
                CourseInfo: {
                    courseId: courseInfoDto.courseId,
                    bppId: courseInfoDto.bppId ?? COURSE_MANAGER_BPP_ID
                }
            }
        });
        if(consumerCourseData)
            throw new BadRequestException("Course Already purchased");

        // forward to wallet service for fetching credits
        if(!process.env.WALLET_SERVICE_URL)
            throw new HttpException("Wallet Service URI not defined", 500);
        
        let credits: number;
        const walletEndpoint = `/api/consumers/${consumerId}/credits`;

        const walletResponse = await axios.get(process.env.WALLET_SERVICE_URL + walletEndpoint);
        // console.log(response.data);
        credits = walletResponse.data.data.credits;

        if(credits < courseInfoDto.credits)
            throw new BadRequestException("Not enough credits");

        let courseLink: string | undefined;
        if(courseInfoDto.bppId && courseInfoDto.bppUri) {
            // fetch user details from user service
            const consumerResponse = await this.getConsumerFromUserService(consumerId);

            // `/confirm` to BAP
            if(!process.env.BAP_URI)
                throw new HttpException("BAP URI not defined", 500);
            const confirmEndpoint = `/courses/confirm`;
            const confirmBody = {
                providerId: courseInfoDto.providerId,
                courseId: courseInfoDto.courseId,
                amount: courseInfoDto.credits,
                bppId: courseInfoDto.bppId,
                bppUri: courseInfoDto.bppUri,
                applicantProfile: {
                    name: consumerResponse.name,
                    email: consumerResponse.email,
                    phone: consumer.phoneNumber
                }
            }
            await axios.post(process.env.BAP_URI + confirmEndpoint, confirmBody);
        } else {
            // forward to course manager for purchase
            if(!process.env.COURSE_MANAGER_URL)
                throw new HttpException("Course manager URL not defined", 500);

            const endpoint = `/api/course/${courseInfoDto.courseId}/purchase/${consumerId}`;

            const purchaseResponse = await axios.post(process.env.COURSE_MANAGER_URL + endpoint);
            courseLink = purchaseResponse.data.data.courseLink;
        }

        // forward to wallet service for transaction
        const endpoint = `/api/consumers/${consumerId}/purchase`;
        const walletPurchaseBody = {
            providerId: courseInfoDto.providerId,
            credits: courseInfoDto.credits,
            description: `Purchased course ${courseInfoDto.title}`
        }
        await axios.post(process.env.WALLET_SERVICE_URL + endpoint, walletPurchaseBody);

        //  Create an entry to add the course info if it does not exist and update it if it does.
        const {bppId, bppUri, ...clone} = courseInfoDto;
        const courseInfo = await this.prisma.courseInfo.upsert({
            where: {
                courseId_bppId: {
                    courseId: courseInfoDto.courseId,
                    bppId: courseInfoDto.bppId ?? COURSE_MANAGER_BPP_ID
                }
            },
            create: {
                ...clone,
                bppId: courseInfoDto.bppId ?? COURSE_MANAGER_BPP_ID,
                bppUri: courseInfoDto.bppUri ?? process.env.COURSE_MANAGER_URL!,
                courseLink
            },
            update: {
                ...courseInfoDto,
                courseLink
            }
        });
        // Record transaction in marketplace metadata model
        await this.prisma.consumerCourseMetadata.create({
            data: {
                consumerId,
                courseInfoId: courseInfo.id,
                becknTransactionId: null, //  confirmResponse.data.data.transactionId,
                becknMessageId: null, //  confirmResponse.data.data.messageId,
            }
        });
    }

    async reversePurchase(consumerId: string, courseIdDto: CourseIdDto) {
        await this.getConsumer(consumerId);

        const courseInfo = await this.prisma.courseInfo.findUnique({
            where: {
                courseId_bppId: {
                    courseId: courseIdDto.courseId,
                    bppId: courseIdDto.bppId ?? COURSE_MANAGER_BPP_ID
                }
            }
        });
        if(!courseInfo)
            throw new NotFoundException("Course does not exist");

        await this.prisma.consumerCourseMetadata.delete({
            where: {
                consumerId_courseInfoId: {
                    consumerId,
                    courseInfoId: courseInfo.id
                }
            }
        });
        // forward to wallet service for transaction
        if(!process.env.WALLET_SERVICE_URL)
            throw new HttpException("Wallet Service URI not defined", 500);
        
        const endpoint = `/api/consumers/${consumerId}/refund`;
        const walletPurchaseBody = {
            providerId: courseInfo.providerId,
            credits: courseInfo.credits,
            description: `Refund for course ${courseInfo.title}`
        }
        await axios.post(process.env.WALLET_SERVICE_URL + endpoint, walletPurchaseBody);
    }

    async getPurchaseStatus(consumerId: string, courseIdDto: CourseIdDto): Promise<PurchaseStatusDto> {
        const consumerCourse = await this.prisma.consumerCourseMetadata.findFirst({
            where: {
                consumerId,
                CourseInfo: {
                    courseId: courseIdDto.courseId,
                    bppId: courseIdDto.bppId ?? COURSE_MANAGER_BPP_ID
                }
            },
            include: {
                CourseInfo: true
            }
        });
        if(!consumerCourse)
            return {
                purchased: false,
                courseLink: null
            }

        return {
            purchased: true,
            courseLink: consumerCourse.CourseInfo.courseLink
        }
    }

    async getSavedCourses(consumerId: string): Promise<CourseInfoResponseDto[]> {

        const consumer = await this.getConsumer(consumerId);

        const courses = await this.prisma.courseInfo.findMany({
            where: {
                id: {
                    in: consumer.savedCourses
                }
            },
            include: {
                _count: {
                    select: {
                        ConsumerCourseMetadata: true
                    }
                
                }
            }
        });
        return courses.map((course) => {
            return {
                title: course.title,
                description: course.description,
                credits: course.credits,
                imageLink: course.imageLink,
                language: course.language,
                providerName: course.providerName,
                author: course.author,
                avgRating: course.avgRating,
                bppUri: course.bppUri,
                bppId: course.bppId,
                providerId: course.providerId,
                competency: course.competency,
                courseId: course.courseId,
                numberOfPurchases: course._count.ConsumerCourseMetadata,
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

    async completeCourse(consumerId: string, courseIdDto: CourseIdDto) {

        await this.getConsumer(consumerId);
        
        const courseInfo = await this.prisma.courseInfo.findUnique({
            where: {
                courseId_bppId: {
                    courseId: courseIdDto.courseId,
                    bppId: courseIdDto.bppId ?? COURSE_MANAGER_BPP_ID
                }
            }
        });
        if(!courseInfo)
            throw new NotFoundException("Course does not exist");

        const consumer = await this.getConsumerFromUserService(consumerId);

        // forward to Credential MS to issue certificate
        if(!process.env.CREDENTIAL_SERVICE_URL)
            throw new HttpException("Credential Service URL not defined", 500);
        
        let endpoint = `/credentials/issue`;
        
        const competency = JSON.stringify(courseInfo.competency);

        const requestDto = `{
            "credential": {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://www.w3.org/2018/credentials/examples/v1"
                ],
                "type": [
                    "VerifiableCredential"
                ],
                "issuer": "${process.env.CREDENTIAL_ISSUER_DID}",
                "expirationDate": "${new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10).toISOString()}",
                "credentialSubject": {
                    "id": "${process.env.CREDENTIAL_SCHEMA_DID}",
                    "completionScore": 100,
                    "courseName": "${courseInfo.title}",
                    "courseProvider": "${courseInfo.providerName}",
                    "username": "${consumer.userName}",
                    "competency": ${competency},
                    "courseCompletionDate": "${new Date().toISOString()}"
                },
                "options": {
                    "created": "2020-04-02T18:48:36Z",
                    "credentialStatus": {
                        "type": "RevocationList2020Status"
                    }
                }
            },
            "credentialSchemaId": "${process.env.CREDENTIAL_SCHEMA_DID}",
            "credentialSchemaVersion":"${process.env.CREDENTIAL_SCHEMA_VERSION}",
            "tags": ["courseCompletionCredential"]
        }`
        const response = await axios.post(process.env.CREDENTIAL_SERVICE_URL + endpoint, JSON.parse(requestDto));

        // console.log(response.data)
        const credentialId = response.data.credential.id;

        await this.prisma.consumerCourseMetadata.update({
            where: {
                consumerId_courseInfoId: {
                    consumerId,
                    courseInfoId: courseInfo.id
                }
            },
            data: {
                status: CourseProgressStatus.COMPLETED,
                completedAt: new Date(),
                certificateCredentialId: credentialId
            },
        });
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

    async mostPopularCourses(limit?: number, offset?: number): Promise<CourseResponse> {

        if(!process.env.COURSE_MANAGER_URL)
            throw new HttpException("Course manager URL not defined", 500);

        const endpoint = `/api/course/popular`;
        const queryParams = `?limit=${limit}&offset=${offset}`;
        
        const response = await axios.get(process.env.COURSE_MANAGER_URL + endpoint + queryParams);
        return response.data.data;
    }
}