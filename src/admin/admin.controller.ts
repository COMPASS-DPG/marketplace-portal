import { Body, Controller, Get, HttpStatus, NotFoundException, Param, ParseIntPipe, Patch, Post, Res, Logger, ParseUUIDPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { ConsumerDtoResponse } from './dto/consumer-response.dto';
import { EditConsumerDto } from './dto/edit-consumer.dto';
import { CreditRequestDto } from './dto/credit-request.dto';
import { ConsumerWalletDto } from './dto/consumer-wallet.dto';
import { getPrismaErrorStatusAndMessage } from '../utils/utils';

@Controller('admin')
export class AdminController {

    private readonly logger = new Logger(AdminController.name);

    constructor(private adminService: AdminService){}

    @ApiOperation({ summary: 'Login for admin' })
    @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDto })
    @Post("/login")
    // admin login
    async login(
        @Body() loginDto: LoginDto,
        @Res() res
    ) {
        try {
            const email = loginDto.email;
            const password = loginDto.password;

            this.logger.log(`Logging in as admin`)

            const adminId = await this.adminService.login(email, password);

            this.logger.log(`Successfully logged in as admin`)

            res.status(HttpStatus.OK).json({
                message: "login successful",
                data: {
                    adminId
                }
            });
        } catch (err) {
            this.logger.error(`Failed to login the admin with the given credentials`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to login as admin",
            });
        }
    }

    @ApiOperation({ summary: 'View all consumers on marketplace' })
    @ApiResponse({ status: HttpStatus.OK, type: ConsumerDtoResponse, isArray: true })
    @Get("/:adminId/consumers")
    // View all consumers on marketplace
    async getAllConsumers(
        @Param("adminId", ParseUUIDPipe) adminId: string,
        @Res() res
    ) {
        
        // validate the adminId

        try {

            this.logger.log(`Fetching all consumers`);

            this.logger.log(`Validating the adminId`);
            const admin = await this.adminService.getAdmin(adminId);
            if(!admin) {
                throw new NotFoundException("Admin not found with the given id");
            }

            this.logger.log(`AdminId is valid`)

            const consumers = this.adminService.getAllConsumers();

            this.logger.log(`Fetched all consumers successfully`);

            res.status(HttpStatus.OK).json({
                message: "Fetched all consumers successful",
                data: {
                    consumers
                }
            });
        } catch (err) {
            this.logger.error(`Failed to fetch all the consumers info.`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to fetch all consumers",
            });
        }
    }

    @ApiOperation({ summary: 'View a consumer information on marketplace' })
    @ApiResponse({ status: HttpStatus.OK, type: ConsumerDtoResponse })
    @Get("/:adminId/consumers/:consumerId")
    // View all consumers on marketplace
    async getConsumer(
        @Param("adminId", ParseUUIDPipe) adminId: string,
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Res() res
    ) {
        
        try {

            // validate the adminId
            this.logger.log(`Fetching consumer information with consumerId: ${consumerId}`);
            this.logger.log(`Validating adminId`);
            const admin = await this.adminService.getAdmin(adminId);
            if(!admin) {
                throw new NotFoundException("Admin not found with the given id");
            }
            this.logger.log(`adminId validation successful`);

            // validate consumerId
            this.logger.log(`Validating consumerId`);

            const consumer = await this.adminService.getConsumer(consumerId);

            if(!consumer) {
                throw new NotFoundException("Consumer not foudn with the given id");
            }
            this.logger.log(`consumerId validation successful`);
            this.logger.log(`Fetched consumer information successfully`);
            res.status(HttpStatus.OK).json({
                message: `Fetched the consumer with id ${consumerId} `,
                data: {
                    consumer
                }
            });
        } catch (err) {
            this.logger.error(`Failed to fetch the consumer info with id: ${consumerId}`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to fetch the consumer Info",
            });
        }
    }

    @ApiOperation({ summary: 'Edit consumer profile information' })
    @ApiResponse({ status: HttpStatus.OK, type: ConsumerDtoResponse })
    @Patch("/:adminId/consumers/:consumerId")
    // View all consumers on marketplace
    async editConsumer(
        @Param("adminId", ParseUUIDPipe) adminId: string,
        @Param("consumerId", ParseUUIDPipe) consumerId: string,
        @Body() editConsumerDto: EditConsumerDto,
        @Res() res
    ) {
        
        // validate the adminId
        try {
            this.logger.log(`Updating consumer information with consumerId: ${consumerId}`);
            this.logger.log(`Validating adminId`);
            const admin = await this.adminService.getAdmin(adminId);
            if(!admin) {
                throw new NotFoundException("Admin not found with the given id");
            }
            this.logger.log(`adminId validation successful`);


            // validate consumerId

            this.logger.log(`Validating consumerId`);

            const consumer = await this.adminService.getConsumer(consumerId);

            if(!consumer) {
                throw new NotFoundException("Consumer not found with the given id");
            }

            this.logger.log(`consumerId validation successful`);

            const updatedConsumer = await this.adminService.updateConsumer(editConsumerDto);

            this.logger.log(`Consumer information updated successfully`);
            res.status(HttpStatus.OK).json({
                message: `Updated the consumer information with id ${consumerId} `,
                data: {
                    updatedConsumer
                }
            });
        } catch (err) {
            this.logger.error(`Failed to update the consumer info with id: ${consumerId}`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to update the consumer Info",
            });
        }
    }

    @ApiOperation({ summary: 'Add credits to consumer wallet' })
    @ApiResponse({ status: HttpStatus.OK })
    @Post('/:adminId/addCredits')
    async addCredits(@Param('adminId', ParseUUIDPipe) adminId: string, @Body() creditRequestDto: CreditRequestDto, @Res() res) {
        
        try {
            this.logger.log(`Adding credits to the consumer wallet with id: ${creditRequestDto.consumerId}`)
            this.logger.log(`Validating adminId`);

            const admin = this.adminService.getAdmin(adminId);
            if(!admin) {
                throw new NotFoundException(`Invalid adminId`);
            }

            this.logger.log(`adminId validation successful`);

            await this.adminService.addCredits(adminId, creditRequestDto.consumerId, creditRequestDto.credits);

            this.logger.log(`Successfully added credits to the consumer with id: ${creditRequestDto.consumerId}`)

            res.status(HttpStatus.OK).json({
                message: `Added credits successfully`
            });
        } catch (err) {
            this.logger.error(`Failed to add credits to the consumer wallet`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to add credits the consumer wallet",
            });
        }
    }

    @ApiOperation({ summary: 'Remove credits from consumer wallet' })
    @ApiResponse({ status: HttpStatus.OK })
    @Post('/:adminId/reduceCredits')
    async reduceCredits(@Param('adminId', ParseUUIDPipe) adminId: string, @Body() creditRequestDto: CreditRequestDto, @Res() res) {
        try {
            this.logger.log(`Reducing credits from consumer wallet with id: ${creditRequestDto.consumerId}`);
            this.logger.log(`Validating adminId`);
            const admin = this.adminService.getAdmin(adminId);
            if(!admin) {
                throw new NotFoundException(`Invalid adminId`);
            }
            this.logger.log(`adminId validation successful`);

            await this.adminService.reduceCredits(adminId, creditRequestDto.consumerId, creditRequestDto.credits);

            this.logger.log(`Reduced credits successfully from consumer wallet with id: ${creditRequestDto.consumerId}`);

            res.status(HttpStatus.OK).json({
                message: `Removed credits successfully`
            });
        } catch (err) {
            this.logger.error(`Failed to reduce credits from the consumer wallet`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to reduce credits from the consumer wallet",
            });
        }
    }

    @ApiOperation({ summary: "Get all users' wallet info "})
    @ApiResponse({ status: HttpStatus.OK, type: ConsumerWalletDto, isArray: true })
    @Get('/:adminId/userWallets')
    async getAllConsumerWallets(@Param('adminId', ParseUUIDPipe) adminId: string, @Res() res) {

        try {
            this.logger.log(`Fetching wallet info of all the consumers`);
            this.logger.log(`Validating adminId`);
            const admin = this.adminService.getAdmin(adminId);
            if(!admin) {
                throw new NotFoundException(`Invalid adminId`);
            }
            this.logger.log(`adminId validation successful`);

            const consumerWallets = this.adminService.getAllConsumerWallets();

            this.logger.log(`Successfully fetched the wallet info of all the consumers on the marketplace`)
            res.status(HttpStatus.OK).json({
                message: `Fetched user wallet info`,
                data: consumerWallets
            });
        } catch (err) {
            this.logger.error(`Failed to fetch wallet info of all the consumers on the marketplace.`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to fetch the wallet info of all the consumers on marketplace",
            });
        }
    }

    @ApiOperation({ summary: "Get a user wallet info"})
    @ApiResponse({ status: HttpStatus.OK, type: ConsumerWalletDto, isArray: true })
    @Get('/:adminId/userWallets/:consumerId')
    async getPurchaseHistory(@Param('adminId', ParseUUIDPipe) adminId: string, @Param('consumerId') consumerId: string, @Res() res) {
        
        
        try {
            this.logger.log(`Fetching transaction history of a consumer with id: ${consumerId}`);
            this.logger.log(`Validating adminId`);
            const admin = this.adminService.getAdmin(adminId);
            if(!admin) {
                throw new NotFoundException(`Invalid adminId`);
            }
            this.logger.log(`adminId validation successful`);
            // validate consumerId
            this.logger.log(`Validating consumerId`);
            const consumer = await this.adminService.getConsumer(consumerId);

            if(!consumer) {
                throw new NotFoundException("Consumer not found with the given id");
            }
            this.logger.log(`consumerId validation successful`);

            const consumerWallets = this.adminService.getTransactions(adminId, consumerId);
            this.logger.log(`Successfully fetched the transaction history of the consumer with id: ${consumerId}`);
            res.status(HttpStatus.OK).json({
                message: `Fetched user wallet info`,
                data: consumerWallets
            });
        } catch (err) {
            this.logger.error(`Failed to fetch transaction history of the given consumer.`);

            const {errorMessage, statusCode} = getPrismaErrorStatusAndMessage(err);
            res.status(statusCode).json({
                statusCode, 
                message: errorMessage || "Failed to fetch transaction history of the given consumer",
            });
        }
    }


}