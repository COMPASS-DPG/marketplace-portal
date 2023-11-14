-- CreateEnum
CREATE TYPE "CourseProgressStatus" AS ENUM ('inProgress', 'completed');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('viewed', 'notViewed');

-- CreateTable
CREATE TABLE "ConsumerMetadata" (
    "consumerId" TEXT NOT NULL,
    "walletId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "coursesPurchased" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "savedCourses" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "ConsumerMetadata_pkey" PRIMARY KEY ("consumerId")
);

-- CreateTable
CREATE TABLE "ConsumerCourseMetadata" (
    "id" SERIAL NOT NULL,
    "consumerId" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "status" "CourseProgressStatus" NOT NULL DEFAULT 'inProgress',
    "walletTransactionId" INTEGER NOT NULL,
    "becknTransactionId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,

    CONSTRAINT "ConsumerCourseMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseInfo" (
    "courseId" INTEGER NOT NULL,
    "bppId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "imageLink" TEXT NOT NULL,
    "language" TEXT[],
    "courseLink" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,

    CONSTRAINT "CourseInfo_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "walletId" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL,
    "consumerId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'notViewed',

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerMetadata_walletId_key" ON "ConsumerMetadata"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerCourseMetadata_consumerId_courseId_key" ON "ConsumerCourseMetadata"("consumerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_walletId_key" ON "Admin"("walletId");

-- AddForeignKey
ALTER TABLE "ConsumerCourseMetadata" ADD CONSTRAINT "ConsumerCourseMetadata_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "CourseInfo"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "ConsumerMetadata"("consumerId") ON DELETE RESTRICT ON UPDATE CASCADE;
