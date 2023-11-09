import { PrismaClient } from "@prisma/client";



const test = async () => {
    const prisma = new PrismaClient()

    const consumers = await prisma.consumerMetadata.findMany({
        // data: {
        //     consumerId: "123e4567-e89b-42d3-a456-556642440000",
        //     walletId: 1,
        // }
    });
    console.log(consumers)

    // const course = await prisma.courseInfo.create({
    //     data: {
    //         courseId: 2,
    //         title: "course6",
    //         description: "course6",
    //         courseLink: "abc",
    //         imageLink: "qwe",
    //         credits: 4,
    //         bppId: "abc",
    //         providerName: "xyz",
    //         language: ["en"]
    //     }
    // })
    // console.log(course)

    // const course = await prisma.consumerCourseMetadata.create({
    //     data: {
    //         becknTransactionId: 0,
    //         walletTransactionId: 0,
    //         consumerId: "123e4567-e89b-42d3-a456-556642440000",
    //         courseId: 2
    //     }
    // })
    // console.log(course)
    const courses = await prisma.courseInfo.findMany();
    console.log(courses)

    const notifications = await prisma.notification.create({
        data: {
            consumerId: "123e4567-e89b-42d3-a456-556642440000",
            link: "google.com",
            text: "notification2",
        }
    })
}
test();