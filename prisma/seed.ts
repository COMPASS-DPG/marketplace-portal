import { CourseProgressStatus, PrismaClient } from "@prisma/client"
import { COURSE_MANAGER_BPP_ID } from "../src/utils/constants";


const prisma = new PrismaClient();

const main = async () => {
    // const response = await  prisma.consumerMetadata.findMany();

    const admin = await prisma.admin.create({
        data: {
            id: "123e4567-e89b-42d3-a456-556642440020"
        }
    });

    const consumers = await prisma.consumerMetadata.createMany({
        data: [{
            consumerId: "4d45a9e9-4a4d-4c92-aaea-7b5abbd6ff98",
            email: "neha.patil@example.com",
            phoneNumber: "9999999990"
        }, {
            consumerId: "abaa7220-5d2e-4e05-842a-95b2c4ce1876",
            email: "rajesh.kumar@example.com",
            phoneNumber: "9999999991"
        }, {
            consumerId: "0f5d0b13-8d72-46c9-a7c4-c1f7e5aa1f17",
            email: "priya.jain@example.com",
            phoneNumber: "9999999992"
        }, {
            consumerId: "bbf1f7cf-4216-458e-8d98-0d9204ae57ef",
            email: "arjun.singh@example.com",
            phoneNumber: "9999999993"
        }]
    });
    const courses = await prisma.courseInfo.createMany({
        data: [{
            id: 1,
            courseId: "123e4567-e89b-42d3-a456-556642440050",
            title: "NestJS Complete",
            courseLink: "https://www.udemy.com/course/nestjs-the-complete-developers-guide/",
            credits: 20,
            description: "Build full featured backend APIs incredibly quickly with Nest, TypeORM, and Typescript. Includes testing and deployment!",
            imageLink: "https://courses.nestjs.com/img/logo.svg",
            providerName: "Udemy",
            language: ["en"],
            bppUri: process.env.COURSE_MANAGER_URL ?? "http://localhost:3000",
            bppId: COURSE_MANAGER_BPP_ID,
            providerId: "123e4567-e89b-42d3-a456-556642440011",
            avgRating: 4.5,
            author: "Stephen Grider",
            competency: {
                "API Development": ["Level1", "Level2"],
                "Typescript": ["Level1"],
                "Backend engineering": ["Level1"]
            }
        }, {
            id: 2,
            courseId: "123e4567-e89b-42d3-a456-556642440051",
            title: "Graphic Design Masterclass",
            courseLink: "https://www.udemy.com/course/graphic-design-masterclass-everything-you-need-to-know/",
            credits: 25,
            description: "The Ultimate Graphic Design Course Which Covers Photoshop, Illustrator, InDesign, Design Theory, Branding & Logo Design",
            imageLink: "https://www.unite.ai/wp-content/uploads/2023/05/emily-bernal-v9vII5gV8Lw-unsplash.jpg",
            providerName: "Udemy",
            language: ["en"],
            bppUri: process.env.COURSE_MANAGER_URL ?? "http://localhost:3000",
            bppId: COURSE_MANAGER_BPP_ID,
            providerId: "123e4567-e89b-42d3-a456-556642440011",
            avgRating: 4.5,
            author: "Lindsay Marsh",
            competency: {
                "API Development": ["Level1", "Level2"],
                "Typescript": ["Level1"],
                "Backend engineering": ["Level1"]
            }
        }, {
            id: 3,
            courseId: "123e4567-e89b-42d3-a456-556642440052",
            title: "Python for Data Science",
            courseLink: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
            credits: 30,
            description: "Learn how to use NumPy, Pandas, Seaborn , Matplotlib , Plotly , Scikit-Learn , Machine Learning, Tensorflow , and more",
            imageLink: "https://blog.imarticus.org/wp-content/uploads/2021/12/learn-Python-for-data-science.jpg",
            providerName: "Coursera",
            language: ["en"],
            bppUri: process.env.COURSE_MANAGER_URL ?? "http://localhost:3000",
            bppId: COURSE_MANAGER_BPP_ID,
            providerId: "123e4567-e89b-42d3-a456-556642440011",
            author: "Jose Portilla",
            avgRating: 4.5,
            competency: {
                "API Development": ["Level1", "Level2"],
                "Typescript": ["Level1"],
                "Backend engineering": ["Level1"]
            }
        }]
    })
    const purchasedCourses = await prisma.consumerCourseMetadata.createMany({
        data: [{
            courseInfoId: 1,
            consumerId: "4d45a9e9-4a4d-4c92-aaea-7b5abbd6ff98",
            becknTransactionId: "123e4567-e89b-42d3-a456-556642440070",
            status: CourseProgressStatus.COMPLETED,
            completedAt: new Date(),
            rating: 4,
        },{
            courseInfoId: 2,
            consumerId: "4d45a9e9-4a4d-4c92-aaea-7b5abbd6ff98",
            becknTransactionId: "123e4567-e89b-42d3-a456-556642440071",
            status: CourseProgressStatus.COMPLETED,
            completedAt: new Date(),
        },{
            courseInfoId: 2,
            consumerId: "abaa7220-5d2e-4e05-842a-95b2c4ce1876",
            becknTransactionId: "123e4567-e89b-42d3-a456-556642440072",
        }, {
            courseInfoId: 1,
            consumerId: "abaa7220-5d2e-4e05-842a-95b2c4ce1876",
            becknTransactionId: "123e4567-e89b-42d3-a456-556642440073",
            status: CourseProgressStatus.COMPLETED,
            rating: 4,
            feedback: "Great course"
        }, {
            courseInfoId: 3,
            consumerId: "abaa7220-5d2e-4e05-842a-95b2c4ce1876",
            becknTransactionId: "123e4567-e89b-42d3-a456-556642440074"
        }]
    })
    const notifs = await prisma.notification.createMany({
        data: [{
            consumerId: "4d45a9e9-4a4d-4c92-aaea-7b5abbd6ff98",
            link: "/",
            text: "",
        }]
    })
}

main();
