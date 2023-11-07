import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConsumerAccountDto } from './dto/account.dto';
import { PurchasedCourseDto } from './dto/purchasedCourse.dto';
import { CourseInfoDto } from './dto/courseInfo.dto';
import { TransactionResponse } from './dto/transaction.dto';
import { FeedbackDto } from './dto/feedback.dto';
import { NotificationDto } from './dto/notification.dto';
import { CourseProgressStatus } from '@prisma/client';

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

    async getAccountDetails(consumerId: string): Promise<ConsumerAccountDto> {
        
        const consumer = await this.prisma.consumerMetadata.findUnique({
            where: {
                consumerId
            },
            include: {
                wallet: {
                    select: {
                        credits: true
                    }
                },
                _count: {
                    select: {
                        coursesPurchased: true
                    }
                }
            }
        });
        if(!consumer)
            throw new NotFoundException("consumer does not exist");

        // forward to user service


        return {
            consumerId,
            createdAt: consumer.createdAt,
            updatedAt: consumer.updatedAt,
            walletId: consumer.walletId,
            credits: consumer.wallet.credits,
            numberOfPurchasedCourses: consumer._count.coursesPurchased
        }
    }

    async viewCoursePurchaseHistory(consumerId: string): Promise<PurchasedCourseDto[]> {

        return this.prisma.consumerCourseMetadata.findMany({
            where: {
                consumerId
            },
            include: {
                course: true
            }
        });
    }

    async saveCourse(consumerId: string, courseInfoDto: CourseInfoDto) {

        const consumer = await this.getConsumer(consumerId);

        let savedCourses = consumer.savedCourses;

        // add the course to the list of saved courses if it is not present
        // remove if present
        const courseIdx = savedCourses.findIndex((c) => c == courseInfoDto.courseId)

        if(courseIdx != -1) {
            savedCourses[courseIdx] = savedCourses[savedCourses.length - 1];
            savedCourses.pop();
        } else {
            savedCourses.push(courseInfoDto.courseId)
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
        if(courseIdx != -1)
            return;

        //  Create an entry if it does not exist. No action if it is already present. 
        //  There may be a race condition for inserting courseInfo for the same course.
        //  In such a case, insertion happens once and no error is thrown
        try {
            await this.prisma.courseInfo.upsert({
                where: {
                    courseId: courseInfoDto.courseId
                },
                create: {
                    ...courseInfoDto
                },
                update: {}
            });
        } catch {}
    }

    async viewTransactionHistory(consumerId: string): Promise<TransactionResponse[]> {

        return this.prisma.transaction.findMany({
            where: {
                OR: [{
                    from: {
                        consumer: {
                            consumerId
                        }
                    }
                }, {
                    to: {
                        consumer: {
                            consumerId
                        }
                    }
                }]
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
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
        
        if(consumerCourseData.status != CourseProgressStatus.completed)
            throw new BadRequestException("Course not complete");

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

        // forward to course manager

    }

    async viewCourse(courseId: number) {

        // forward to BPP
    }

    async searchCourses() {

        // forward to BPP
    }

    async purchaseCourse(consumerId: string, courseInfoDto: CourseInfoDto) {

        const consumer = await this.getConsumer(consumerId);

        // forward to wallet service for credit transfer

        // forward to course manager for purchase

        await this.prisma.consumerCourseMetadata.create({
            data: {
                consumerId,
                courseId: courseInfoDto.courseId,
                walletTransactionId: 0,
                becknTransactionId: 0,
            }
        });

        //  Create an entry if it does not exist. No action if it is already present. 
        //  There may be a race condition for inserting courseInfo for the same course.
        //  In such a case, insertion happens once and no error is thrown
        try {
            await this.prisma.courseInfo.upsert({
                where: {
                    courseId: courseInfoDto.courseId
                },
                create: {
                    ...courseInfoDto
                },
                update: {}
            });
        } catch {}
    }

    async getSavedCourses(consumerId: string): Promise<CourseInfoDto[]> {

        const consumer = await this.getConsumer(consumerId);

        return this.prisma.courseInfo.findMany({
            where: {
                courseId: {
                    in: consumer.savedCourses
                }
            }
        });
    }

    async getNotifications(consumerId: string): Promise<NotificationDto[]> {

        return this.prisma.notification.findMany({
            where: {
                consumerId
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
                    status: 'completed'
                }
            });
        } catch {
            throw new NotFoundException("This user has not subscribed to this course");
        }
    }
}