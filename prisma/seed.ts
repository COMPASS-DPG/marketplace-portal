import { CourseProgressStatus, PrismaClient } from "@prisma/client"
import { COURSE_MANAGER_BPP_ID } from "../src/utils/constants";


const prisma = new PrismaClient();

const main = async () => {
    // const response = await  prisma.consumerMetadata.findMany();

    const admin = await prisma.admin.create({
        data: {
            id: "87fd80a9-63e9-4e90-81bb-4b6956c2561b"
        }
    });

    const consumers = await prisma.consumerMetadata.createMany({
        data: [{
            consumerId: "4d45a9e9-4a4d-4c92-aaea-7b5abbd6ff98",
            name: "Neha Patil",
            email: "neha.patil@example.com",
            phoneNumber: "9999999990"
        }, {
            consumerId: "890f2839-866f-4524-9eac-bebe0d35d607",
            name: "Favas",
            email: "favas@yopmail.com",
            phoneNumber: "9999999991"
        }, {
            consumerId: "0f5d0b13-8d72-46c9-a7c4-c1f7e5aa1f17",
            name: "Priya Jain",
            email: "priya.jain@example.com",
            phoneNumber: "9999999992"
        }, {
            consumerId: "bbf1f7cf-4216-458e-8d98-0d9204ae57ef",
            name: "Arjun Singh",
            email: "arjun.singh@example.com",
            phoneNumber: "9999999993"
        }, {
            consumerId: "9f4611d4-ab92-4acd-b3ce-13594e362eca",
            name: "Reviewer One",
            email: "reviewer.one@yopmail.com",
            phoneNumber: "9999999994"
        }, {
            consumerId: "836ba369-fc24-4464-95ec-505d61b67ef0",
            name: "Santosh",
            email: "santhosh.reviewer@yopmail.com",
            phoneNumber: "9999999995"
        }, {
            consumerId: "c8a43816-5a1b-4e29-9e1f-e8ef22efc669",
            name: "Praveen",
            email: "praveen.reviewer@yopmail.com",
            phoneNumber: "9999999996"
        }]
    });
    const courses = await prisma.courseInfo.createMany({
        data: [{
            id: 1,
            courseId: "123e4567-e89b-42d3-a456-556642440050",
            title: "Comprehensive Floor Inspection Techniques",
            courseLink: "https://www.udemy.com/course/nestjs-the-complete-developers-guide/",
            credits: 20,
            description: "Develop skills for thorough and accurate floor inspections.",
            imageLink: "https://courses.nestjs.com/img/logo.svg",
            providerName: "Udemy",
            language: ["en"],
            bppUri: process.env.COURSE_MANAGER_URL ?? "http://localhost:3000",
            bppId: COURSE_MANAGER_BPP_ID,
            providerId: "123e4567-e89b-42d3-a456-556642440011",
            avgRating: 4.5,
            author: "Stephen Grider",
            competency: [{
                "id": 1,
                "name": "Floor Planning and Mapping",
                "levels": [
                  {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                  },
                  {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
                  }
                ]
              }, {
                "id": 8,
                "name": "Floor Inspection",
                "levels": [
                  {
                     "levelNumber": 1,
                     "name": "Level 1",
                     "id": 1
                  },
                  {
                      "levelNumber": 2,
                      "name": "Level 2",
                      "id": 2
                  },
                  {
                      "levelNumber": 3,
                      "name": "Level 3",
                      "id": 3
                  }
                ]
              }, {
                "id": 7,
                "name": "Survey",
                "levels": null
              }
            ]
        }, {
            id: 2,
            courseId: "123e4567-e89b-42d3-a456-556642440051",
            title: "Advanced Floor Planning and Inspection",
            courseLink: "https://www.udemy.com/course/graphic-design-masterclass-everything-you-need-to-know/",
            credits: 25,
            description: "Master the skills of creating detailed floor plans and conducting thorough floor inspections.",
            imageLink: "https://www.unite.ai/wp-content/uploads/2023/05/emily-bernal-v9vII5gV8Lw-unsplash.jpg",
            providerName: "Udemy",
            language: ["en"],
            bppUri: process.env.COURSE_MANAGER_URL ?? "http://localhost:3000",
            bppId: COURSE_MANAGER_BPP_ID,
            providerId: "123e4567-e89b-42d3-a456-556642440011",
            avgRating: 4.5,
            author: "Lindsay Marsh",
            competency: [{
                "id": 8,
                "name": "Floor Inspection",
                "levels": [
                    {
                        "levelNumber": 1,
                        "name": "Level 1",
                        "id": 1
                    },
                    {
                        "levelNumber": 2,
                        "name": "Level 2",
                        "id": 2
                    },
                    {
                        "levelNumber": 3,
                        "name": "Level 3",
                        "id": 3
                    }
                ]
            }, {
                "id": 1,
                "name": "Floor Planning and Mapping",
                "levels": [
                    {
                        "levelNumber": 2,
                        "name": "Level 2",
                        "id": 2
                    },
                    {
                        "levelNumber": 3,
                        "name": "Level 3",
                        "id": 3
                    }
                ]
            }]
        }, {
            id: 3,
            courseId: "123e4567-e89b-42d3-a456-556642440052",
            title: "Strategic Coverage and Survey Techniques",
            courseLink: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
            credits: 30,
            description: "Learn to plan effective surveillance coverage and conduct comprehensive site surveys.",
            imageLink: "https://blog.imarticus.org/wp-content/uploads/2021/12/learn-Python-for-data-science.jpg",
            providerName: "Coursera",
            language: ["en"],
            bppUri: process.env.COURSE_MANAGER_URL ?? "http://localhost:3000",
            bppId: COURSE_MANAGER_BPP_ID,
            providerId: "123e4567-e89b-42d3-a456-556642440011",
            author: "Jose Portilla",
            avgRating: 4.5,
            competency: [{
                "id": 2,
                "name": "Coverage and surveillance",
                "levels": [
                    {
                        "levelNumber": 1,
                        "name": "Level 1",
                        "id": 1
                    },
                    {
                        "levelNumber": 2,
                        "name": "Level 2",
                        "id": 2
                    },
                    {
                        "levelNumber": 3,
                        "name": "Level 3",
                        "id": 3
                    }
                ]
            }, {
                "id": 7,
                "name": "Survey",
                "levels": null
            }
        ]
        }]
    })
    const purchasedCourses = await prisma.consumerCourseMetadata.createMany({
        data: [{
            courseInfoId: 1,
            consumerId: "9f4611d4-ab92-4acd-b3ce-13594e362eca",
            becknTransactionId: "123e4567-e89b-42d3-a456-556642440070",
            status: CourseProgressStatus.COMPLETED,
            completedAt: new Date(),
            rating: 4,
        },{
            courseInfoId: 2,
            consumerId: "9f4611d4-ab92-4acd-b3ce-13594e362eca",
            becknTransactionId: "123e4567-e89b-42d3-a456-556642440071",
            status: CourseProgressStatus.COMPLETED,
            completedAt: new Date(),
        },{
            courseInfoId: 2,
            consumerId: "836ba369-fc24-4464-95ec-505d61b67ef0",
            becknTransactionId: "123e4567-e89b-42d3-a456-556642440072",
        }, {
            courseInfoId: 1,
            consumerId: "836ba369-fc24-4464-95ec-505d61b67ef0",
            becknTransactionId: "123e4567-e89b-42d3-a456-556642440073",
            status: CourseProgressStatus.COMPLETED,
            rating: 4,
            feedback: "Great course"
        }, {
            courseInfoId: 3,
            consumerId: "836ba369-fc24-4464-95ec-505d61b67ef0",
            becknTransactionId: "123e4567-e89b-42d3-a456-556642440074"
        }]
    })
    const notifs = await prisma.notification.createMany({
        data: [{
            consumerId: "9f4611d4-ab92-4acd-b3ce-13594e362eca",
            link: "/",
            text: "",
        }]
    })
}

main();
