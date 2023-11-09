import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Res } from "@nestjs/common";
import { ConsumerService } from "./consumer.service";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ConsumerAccountDto, CreditsDto } from "./dto/account.dto";
import { PurchasedCourseDto } from "./dto/purchasedCourse.dto";
import { CourseInfoDto } from "./dto/courseInfo.dto";
import { TransactionResponse } from "./dto/transaction.dto";
import { FeedbackDto } from "./dto/feedback.dto";
import { NotificationDto } from "./dto/notification.dto";
import { CreateRequestDto } from "./dto/create-request.dto";


@Controller('consumer')
export class ConsumerController {
    constructor(
        private consumerService: ConsumerService,
    ) {}

    // view account details
    @ApiOperation({ summary: 'view account details' })
    @ApiResponse({ status: HttpStatus.OK, type: ConsumerAccountDto })
    @Get("/:consumerId/profile")
    async viewAccount(
        @Param("consumerId") consumerId: string,
        @Res() res
    ) {
        const consumer = await this.consumerService.getAccountDetails(consumerId);

        res.status(HttpStatus.OK).json({
            message: "fetch successful",
            data: {
                consumer
            }
        })
    }

    // View course history
    @ApiOperation({ summary: 'View course history' })
    @ApiResponse({ status: HttpStatus.OK, type: [PurchasedCourseDto] })
    @Get("/:consumerId/course/purchases")
    async viewCourseHistory(
        @Param("consumerId") consumerId: string,
        @Res() res
    ) {
        const consumerCourses = await this.consumerService.viewCoursePurchaseHistory(consumerId);

        res.status(HttpStatus.OK).json({
            message: "fetch successful",
            data: {
                consumerCourses
            }
        })
    }

    // Save a course for later reference
    // This API will also be used to unsave a course if it was previously saved
    @ApiOperation({ summary: 'Save or unsave a course' })
    @ApiResponse({ status: HttpStatus.OK })
    @Post("/:consumerId/course/save")
    async saveCourse(
        @Param("consumerId") consumerId: string,
        @Body() courseInfoDto: CourseInfoDto,
        @Res() res
    ) {
        await this.consumerService.saveCourse(consumerId, courseInfoDto);

        res.status(HttpStatus.OK).json({
            message: "course saved successfully",
        });
    }

    // View remaining credits
    @ApiOperation({ summary: 'View credits' })
    @ApiResponse({ status: HttpStatus.OK, type: CreditsDto })
    @Get("/:consumerId/wallet/credits")
    async viewCredits(
        @Param("consumerId") consumerId: string,
        @Res() res
    ) {
        const consumer = await this.consumerService.getAccountDetails(consumerId);

        res.status(HttpStatus.OK).json({
            message: "fetch successful",
            data: {
                credits: consumer.credits
            }
        });
    }

    // View transaction history
    @ApiOperation({ summary: 'View transaction history' })
    @ApiResponse({ status: HttpStatus.OK, type: [TransactionResponse] })
    @Get("/:consumerId/wallet/transactions")
    async viewTransactionHistory(
        @Param("consumerId") consumerId: string,
        @Res() res
    ) {
        const transactions = await this.consumerService.viewTransactionHistory(consumerId);

        res.status(HttpStatus.OK).json({
            message: "fetch successful",
            data: {
                transactions
            }
        });
    }

    // Give feedback
    @ApiOperation({ summary: 'Give feedback' })
    @ApiResponse({ status: HttpStatus.OK })
    @Patch("/:consumerId/course/feedback")
    async giveFeedback(
        @Param("consumerId") consumerId: string,
        @Body() feedbackDto: FeedbackDto,
        @Res() res
    ) {
        await this.consumerService.giveFeedback(consumerId,  feedbackDto);

        res.status(HttpStatus.OK).json({
            message: "feedback saved successfully",
        });
    }

    // Select/View course information
    @ApiOperation({ summary: 'View course information' })
    @ApiResponse({ status: HttpStatus.OK })
    @Get("/courses/:courseId")
    async viewCourse(
        @Param("courseId", ParseIntPipe) courseId: number,
        @Res() res
    ) {
        await this.consumerService.viewCourse(courseId);

        res.status(HttpStatus.OK).json({
            message: "fetch successful"
        });
    }

    // Search for courses
    @ApiOperation({ summary: 'Search for courses' })
    @ApiResponse({ status: HttpStatus.OK })
    @Get("/course/search?q=<query/competency>")
    async searchCourses(
        @Query() competency: string,
        @Res() res
    ) {
        const course = await this.consumerService.searchCourses(competency);

        res.status(HttpStatus.OK).json({
            message: "fetch successful"
        });
    }

    // Purchase a course
    @ApiOperation({ summary: 'Purchase a course' })
    @ApiResponse({ status: HttpStatus.OK })
    @Post("/:consumerId/course/purchase")
    async purchaseCourse(
        @Param("consumerId") consumerId: string,
        @Body() courseInfoDto: CourseInfoDto,
        @Res() res
    ) {
        await this.consumerService.purchaseCourse(consumerId, courseInfoDto);

        res.status(HttpStatus.OK).json({
            message: "purchase successful",
        });
    }

    // Get all saved courses
    @ApiOperation({ summary: 'Get all saved courses' })
    @ApiResponse({ status: HttpStatus.OK, type: [CourseInfoDto] })
    @Get("/:consumerId/course/saved")
    async getSavedCourses(
        @Param("consumerId") consumerId: string,
        @Res() res
    ) {
        const consumerCourses = await this.consumerService.getSavedCourses(consumerId);

        res.status(HttpStatus.OK).json({
            message: "fetch successful",
            data: {
                consumerCourses
            }
        })
    }

    // View notifications
    @ApiOperation({ summary: 'View notifications' })
    @ApiResponse({ status: HttpStatus.OK, type: [NotificationDto] })
    @Get("/:consumerId/notifications")
    async viewNotifications(
        @Param("consumerId") consumerId: string,
        @Res() res
    ) {
        const notifications = await this.consumerService.getNotifications(consumerId);

        res.status(HttpStatus.OK).json({
            message: "fetch successful",
            data: {
                notifications
            }
        })
    }

    // Record course completion
    @ApiOperation({ summary: 'Record course completion' })
    @ApiResponse({ status: HttpStatus.OK })
    @Patch("/:consumerId/course/:courseId/complete")
    async onCourseCompletion(
        @Param("consumerId") consumerId: string,
        @Param("courseId", ParseIntPipe) courseId: number,
        @Res() res
    ) {
        await this.consumerService.completeCourse(consumerId, courseId);

        res.status(HttpStatus.OK).json({
            message: "course completion successful",
        });
    }

    // Request credits to admin
    @ApiOperation({ summary: 'Request credits' })
    @ApiResponse({ status: HttpStatus.OK })
    @Post("/:consumerId/request")
    async requestCredits(
        @Param("consumerId") consumerId: string,
        @Body() createRequestDto: CreateRequestDto,
        @Res() res
    ) {
        await this.consumerService.requestCredits(consumerId, createRequestDto);

        res.status(HttpStatus.OK).json({
            message: "credit request successful",
        });
    }
}