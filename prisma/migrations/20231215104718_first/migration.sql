-- CreateEnum
CREATE TYPE "CourseProgressStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('VIEWED', 'NOT_VIEWED');

-- CreateTable
CREATE TABLE "ConsumerMetadata" (
    "consumerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "savedCourses" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "ConsumerMetadata_pkey" PRIMARY KEY ("consumerId")
);

-- CreateTable
CREATE TABLE "ConsumerCourseMetadata" (
    "id" SERIAL NOT NULL,
    "consumerId" TEXT NOT NULL,
    "courseInfoId" INTEGER NOT NULL,
    "becknTransactionId" TEXT,
    "becknMessageId" TEXT,
    "status" "CourseProgressStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "rating" INTEGER,
    "feedback" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "certificateCredentialId" TEXT,

    CONSTRAINT "ConsumerCourseMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseInfo" (
    "id" SERIAL NOT NULL,
    "courseId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "bppId" TEXT NOT NULL,
    "bppUri" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "imageLink" TEXT NOT NULL,
    "language" TEXT[],
    "courseLink" TEXT,
    "providerName" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "avgRating" DOUBLE PRECISION,
    "competency" JSONB NOT NULL,

    CONSTRAINT "CourseInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "consumerId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'NOT_VIEWED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerMetadata_email_key" ON "ConsumerMetadata"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerMetadata_phoneNumber_key" ON "ConsumerMetadata"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerCourseMetadata_becknTransactionId_key" ON "ConsumerCourseMetadata"("becknTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerCourseMetadata_becknMessageId_key" ON "ConsumerCourseMetadata"("becknMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerCourseMetadata_consumerId_courseInfoId_key" ON "ConsumerCourseMetadata"("consumerId", "courseInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseInfo_courseId_bppId_key" ON "CourseInfo"("courseId", "bppId");

-- AddForeignKey
ALTER TABLE "ConsumerCourseMetadata" ADD CONSTRAINT "ConsumerCourseMetadata_courseInfoId_fkey" FOREIGN KEY ("courseInfoId") REFERENCES "CourseInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumerCourseMetadata" ADD CONSTRAINT "ConsumerCourseMetadata_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "ConsumerMetadata"("consumerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "ConsumerMetadata"("consumerId") ON DELETE RESTRICT ON UPDATE CASCADE;
