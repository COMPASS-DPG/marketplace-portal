import { Body, Controller, Get, HttpStatus, Logger, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, Res } from "@nestjs/common";
import { ConsumerService } from "./consumer.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ConsumerAccountDto, CreditsDto } from "./dto/account.dto";
import { PurchaseStatusDto, PurchasedCourseDto } from "./dto/purchasedCourse.dto";
import { CourseInfoDto, CourseInfoResponseDto } from "./dto/courseInfo.dto";
import { TransactionResponse } from "./dto/transaction.dto";
import { FeedbackDto } from "./dto/feedback.dto";
import { CreateNotificationDto, NotificationResponseDto } from "./dto/notification.dto";
import { RequestDto } from "./dto/create-request.dto";
import { getPrismaErrorStatusAndMessage } from "src/utils/utils";
import { ConsumerSignupDto } from "./dto/signup.dto";
import { CourseResponse, SaveStatusResDto } from "./dto/course-response.dto";
import { CourseProgressStatus } from "@prisma/client";
import { SearchResponseDto } from "./dto/search-response.dto";
import { CourseIdDto } from "./dto/course-id.dto";


@Controller('consumer')
@ApiTags('consumer')
export class ConsumerController {
    private readonly logger = new Logger(ConsumerController.name);

    constructor(
        private consumerService: ConsumerService,
    ) {}

    // Create consumer entry during signup
    @ApiOperation({ summary: 'Consumer sign up' })
    @ApiResponse({ status: HttpStatus.OK })
    @Post()
    async consumerSignUp(
        @Body() signupDto: ConsumerSignupDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Signing up consumer ${signupDto.consumerId}`);

            await this.consumerService.createConsumer(signupDto);

            this.logger.log(`Successfully signed up`);

            res.status(HttpStatus.OK).json({
                message: "sign up successful",
            })
        } catch (err) {
            this.logger.error(`Failed to sign up consumer`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to sign up consumer",
            });
        }
    }

    // view account details
    @ApiOperation({ summary: 'view account details' })
    @ApiResponse({ status: HttpStatus.OK, type: ConsumerAccountDto })
    @Get("/:consumerId")
    async viewAccount(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting consumer profile`);

            const consumer = await this.consumerService.getAccountDetails(consumerId);

            this.logger.log(`Successfully retrieved consumer profile`);

            res.status(HttpStatus.OK).json({
                message: "fetch successful",
                data: {
                    consumer
                }
            })
        } catch (err) {
            this.logger.error(`Failed to retreive consumer's profile`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to retreive consumer's profile",
            });
        }
    }

    // View course purchase history
    @ApiOperation({ summary: 'View course purchase history' })
    @ApiResponse({ status: HttpStatus.OK, type: [PurchasedCourseDto] })
    @Get("/:consumerId/course/purchases")
    async viewCourseHistory(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting consumer course history`);

            const consumerCourses = await this.consumerService.viewCoursePurchaseHistory(consumerId);

            this.logger.log(`Successfully fetched consumer course history`);

            res.status(HttpStatus.OK).json({
                message: "fetch successful",
                data: {
                    consumerCourses
                }
            })
        } catch (err) {
            this.logger.error(`Failed to retreive consumer's course history`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to retreive consumer's course history",
            });
        }
    }

    // View ongoing courses
    @ApiOperation({ summary: 'View ongoing courses' })
    @ApiResponse({ status: HttpStatus.OK, type: [PurchasedCourseDto] })
    @Get("/:consumerId/course/ongoing")
    async fetchOngoingCourses(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting consumer ongoing courses`);

            const consumerCourses = await this.consumerService.viewCoursePurchaseHistory(consumerId, CourseProgressStatus.IN_PROGRESS);

            this.logger.log(`Successfully fetched consumer ongoing courses`);

            res.status(HttpStatus.OK).json({
                message: "fetch successful",
                data: {
                    consumerCourses
                }
            })
        } catch (err) {
            this.logger.error(`Failed to retreive consumer's ongoing courses`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to retreive consumer's ongoing courses",
            });
        }
    }

    // Save a course for later reference
    @ApiOperation({ summary: 'Save a course' })
    @ApiResponse({ status: HttpStatus.OK })
    @Post("/:consumerId/course/save")
    async saveCourse(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Body() courseInfoDto: CourseInfoDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Saving course`);

            await this.consumerService.saveCourse(consumerId, courseInfoDto);

            this.logger.log(`Successfully saved the course`);

            res.status(HttpStatus.OK).json({
                message: "course saved successfully",
            });
        } catch (err) {
            this.logger.error(`Failed to save the course`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to save the course",
            });
        }
    }

    @ApiOperation({ summary: 'Unsave a course' })
    @ApiResponse({ status: HttpStatus.OK })
    @Patch("/:consumerId/course/unsave")
    async unsaveCourse(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Body() courseIdDto: CourseIdDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Removing course from saved courses`);

            await this.consumerService.unsaveCourse(consumerId, courseIdDto);

            this.logger.log(`Successfully unsaved the course`);

            res.status(HttpStatus.OK).json({
                message: "course unsaved successfully",
            });
        } catch (err) {
            this.logger.error(`Failed to unsave course`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to unsave course",
            });
        }
    }

    @ApiOperation({ summary: 'check if course is saved' })
    @ApiResponse({ status: HttpStatus.OK, type: SaveStatusResDto })
    @Post("/:consumerId/course/save/status")
    async checkSaveStatus(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Body() courseIdDto: CourseIdDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Checking course from saved courses`);

            const saved = await this.consumerService.checkSaveStatus(consumerId, courseIdDto);

            this.logger.log(`Successfully checked the course`);

            res.status(HttpStatus.OK).json({
                message: "course checked successfully",
                saved
            });
        } catch (err) {
            this.logger.error(`Failed to check course`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to check course",
            });
        }
    }

    // View remaining credits
    @ApiOperation({ summary: 'View credits' })
    @ApiResponse({ status: HttpStatus.OK, type: CreditsDto })
    @Get("/:consumerId/wallet/credits")
    async viewCredits(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting remaining credits`);

            const consumer = await this.consumerService.getAccountDetails(consumerId);

            this.logger.log(`Successfully fetched credits`);

            res.status(HttpStatus.OK).json({
                message: "fetch successful",
                data: {
                    credits: consumer.credits
                }
            });
        } catch (err) {
            this.logger.error(`Failed to retreive consumer's credits`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to retreive consumer's credits",
            });
        }
    }

    // View transaction history
    @ApiOperation({ summary: 'View transaction history' })
    @ApiResponse({ status: HttpStatus.OK, type: [TransactionResponse] })
    @Get("/:consumerId/wallet/transactions")
    async viewTransactionHistory(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting the consumer transaction history`);

            const transactions = await this.consumerService.viewTransactionHistory(consumerId);

            this.logger.log(`Successfully fetched the transaction history`);
            
            res.status(HttpStatus.OK).json({
                message: "fetch successful",
                data: {
                    transactions
                }
            });
        } catch (err) {
            this.logger.error(`Failed to retreive transaction history`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to retreive transaction history",
            });
        }
    }

    // Give feedback
    @ApiOperation({ summary: 'Give feedback' })
    @ApiResponse({ status: HttpStatus.OK })
    @Patch("/:consumerId/course/feedback")
    async giveFeedback(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Body() feedbackDto: FeedbackDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Giving feedback to course`);

            await this.consumerService.giveFeedback(consumerId,  feedbackDto);

            this.logger.log(`Feedback saved successfully`);

            res.status(HttpStatus.OK).json({
                message: "feedback saved successfully",
            });
        } catch (err) {
            this.logger.error(`Failed to give feedback`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to give feedback",
            });
        }
    }

    // Search for courses
    @ApiOperation({ summary: 'Search for courses' })
    @ApiResponse({ status: HttpStatus.OK, type: SearchResponseDto })
    @Get("/course/search")
    async searchCourses(
        @Query('searchInput') searchInput: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Searching for courses`);

            const searchResponse = await this.consumerService.searchCourses(searchInput);

            this.logger.log(`Successfully fetched the courses`);
            
            res.status(HttpStatus.OK).json({
                message: "fetch successful",
                data: {
                    searchResponse
                }
            });
        } catch (err) {
            this.logger.error(`Search failed`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Search failed",
            });
        }
    }

    @ApiOperation({ summary: 'Poll for new search responses' })
    @ApiResponse({ status: HttpStatus.OK })
    @Get("/course/search/poll/:messageId")
    async pollResponses(
        @Param('messageId') messageId: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Polling for new search responses`);

            const courses = await this.consumerService.getPollResults(messageId);

            this.logger.log(`Successfully fetched the courses`);
            
            res.status(HttpStatus.OK).json({
                message: "fetch successful",
                data: {
                    courses
                }
            });
        } catch (err) {
            this.logger.error(`Poll failed`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Poll failed",
            });
        }
    }

    // Select/View course information
    @ApiOperation({ summary: 'View course information' })
    @ApiResponse({ status: HttpStatus.OK, type: CourseResponse })
    @Get("/course/:courseId")
    async viewCourse(
        @Param("courseId", ParseUUIDPipe) courseId: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting course information`);

            const course = await this.consumerService.viewCourse(courseId);

            this.logger.log(`Successfully fetched the course information`);

            res.status(HttpStatus.OK).json({
                message: "fetch successful",
                data: {
                    course
                }
            });
        } catch (err) {
            this.logger.error(`Failed to retreive course information`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to retreive course information",
            });
        }
    }

    // Purchase a course
    @ApiOperation({ summary: 'Purchase a course' })
    @ApiResponse({ status: HttpStatus.OK })
    @Post("/:consumerId/course/purchase")
    async purchaseCourse(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Body() courseInfoDto: CourseInfoDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Purchasing course`);

            await this.consumerService.purchaseCourse(consumerId, courseInfoDto);

            this.logger.log(`Purchase successful`);
            
            res.status(HttpStatus.OK).json({
                message: "purchase successful",
            });
        } catch (err) {
            this.logger.error(`Purchase failed`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Purchase failed",
            });
        }
    }

    // Reverse the transaction of a failed purchase
    @ApiOperation({ summary: 'Reverse failed purchase transaction' })
    @ApiResponse({ status: HttpStatus.OK })
    @Post("/:consumerId/course/purchase/reverse")
    async reversePurchase(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Body() courseIdDto: CourseIdDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Reversing course purchase transaction`);

            await this.consumerService.reversePurchase(consumerId, courseIdDto);

            this.logger.log(`reverse purchase successful`);
            
            res.status(HttpStatus.OK).json({
                message: "transaction reversal successful",
            });
        } catch (err) {
            this.logger.error(`transaction reversal failed`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "transaction reversal failed",
            });
        }
    }

    // Check whether the course is purchased by the consumer
    @ApiOperation({ summary: 'Check course purchase status' })
    @ApiResponse({ status: HttpStatus.OK, type: PurchaseStatusDto })
    @Post("/:consumerId/course/purchase/status")
    async getPurchaseStatus(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Body() courseIdDto: CourseIdDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Checking course purchase status`);

            const response = await this.consumerService.getPurchaseStatus(consumerId, courseIdDto);

            this.logger.log(`Purchase check successful`);
            
            res.status(HttpStatus.OK).json({
                message: "purchase check successful",
                data: response
            });
        } catch (err) {
            this.logger.error(`Purchase check failed`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Purchase check failed",
            });
        }
    }

    // Get all saved courses
    @ApiOperation({ summary: 'Get all saved courses' })
    @ApiResponse({ status: HttpStatus.OK, type: [CourseInfoResponseDto] })
    @Get("/:consumerId/course/saved")
    async getSavedCourses(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting all saved courses`);

            const consumerCourses = await this.consumerService.getSavedCourses(consumerId);

            this.logger.log(`Successfully fetched all the saved courses`);

            res.status(HttpStatus.OK).json({
                message: "fetch successful",
                data: {
                    consumerCourses
                }
            })
        } catch (err) {
            this.logger.error(`Failed to retrieve saved courses`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to retrieve saved courses",
            });
        }
    }

    // View notifications
    @ApiOperation({ summary: 'View notifications' })
    @ApiResponse({ status: HttpStatus.OK, type: [NotificationResponseDto] })
    @Get("/:consumerId/notifications")
    async viewNotifications(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Res() res
    ) {
        try {
            this.logger.log(`Getting all notifications of the consumer`);

            const notifications = await this.consumerService.getNotifications(consumerId);

            this.logger.log(`Successfully retrieved all the consumer's notifications`);

            res.status(HttpStatus.OK).json({
                message: "fetch successful",
                data: {
                    notifications
                }
            })
        } catch (err) {
            this.logger.error(`Failed to retrieve notifications`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to retrieve notifications",
            });
        }
    }

    // Generate notifications
    @ApiOperation({ summary: 'Generate notification' })
    @ApiResponse({ status: HttpStatus.CREATED })
    @Post("/:consumerId/notifications")
    async createConsumerNotification(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Body() createNotificationDto: CreateNotificationDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Generating a notification`);

            await this.consumerService.createNotification(consumerId, createNotificationDto);

            this.logger.log(`Successfully generated notification`);

            res.status(HttpStatus.CREATED).json({
                message: "notification saved successfully",
            })
        } catch (err) {
            this.logger.error(`Failed to generate notification`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to generate notification",
            });
        }
    }

    // Mark Notification as viewed
    @ApiOperation({ summary: 'Mark Notification as viewed' })
    @ApiResponse({ status: HttpStatus.OK })
    @Patch("/:consumerId/notifications/:notificationId")
    async markNotificationViewed(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Param("notificationId", ParseIntPipe) notificationId: number,
        @Res() res
    ) {
        try {
            this.logger.log(`Marking notification as viewed`);

            await this.consumerService.markNotificationViewed(notificationId, consumerId);

            this.logger.log(`Successfully marked notification as viewed`);

            res.status(HttpStatus.OK).json({
                message: "Notification viewed successfully",
            })
        } catch (err) {
            this.logger.error(`Failed to mark notification as viewed`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to mark notification as viewed",
            });
        }
    }

    // Record course completion
    @ApiOperation({ summary: 'Record course completion' })
    @ApiResponse({ status: HttpStatus.OK })
    @Patch("/:consumerId/course/complete")
    async onCourseCompletion(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Body() courseIdDto: CourseIdDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Recording completion of a course`);

            await this.consumerService.completeCourse(consumerId, courseIdDto);

            this.logger.log(`Course completion recorded successfully`);
            
            res.status(HttpStatus.OK).json({
                message: "course completion successful",
            });
        } catch (err) {
            this.logger.error(`Failed to record course completion`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to record course completion",
            });
        }
    }

    // Request credits to admin
    @ApiOperation({ summary: 'Request credits' })
    @ApiResponse({ status: HttpStatus.OK })
    @Post("/:consumerId/request")
    async requestCredits(
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Body() requestDto: RequestDto,
        @Res() res
    ) {
        try {
            this.logger.log(`Requesting credits to admin`);

            await this.consumerService.requestCredits(consumerId, requestDto);

            this.logger.log(`Successfully sent the request for credits`);

            res.status(HttpStatus.OK).json({
                message: "credit request successful",
            });
        } catch (err) {
            this.logger.error(`Failed to send the credit request`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to send the credit request",
            });
        }
    }
}