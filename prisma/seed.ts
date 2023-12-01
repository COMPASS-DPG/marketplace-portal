import { CourseProgressStatus, PrismaClient } from "@prisma/client"


const prisma = new PrismaClient();

const main = async () => {
    // const response = await  prisma.consumerMetadata.findMany();

    const admin = await prisma.admin.create({
        data: {
            name: "Sanchit Uke",
            email: "sanchit@esmagico.in",
            password: "asdfghjkl",
            id: "123e4567-e89b-42d3-a456-556642440020"
        }
    });

    const consumers = await prisma.consumerMetadata.createMany({
        data: [{
            consumerId: "123e4567-e89b-42d3-a456-556642440000",
            email: "abc0@gmail.com",
            phoneNumber: "9999999990"
        }, {
            consumerId: "123e4567-e89b-42d3-a456-556642440001",
            email: "abc1@gmail.com",
            phoneNumber: "9999999991"
        }, {
            consumerId: "123e4567-e89b-42d3-a456-556642440002",
            email: "abc2@gmail.com",
            phoneNumber: "9999999992"
        }, {
            consumerId: "123e4567-e89b-42d3-a456-556642440003",
            email: "abc3@gmail.com",
            phoneNumber: "9999999993"
        }]
    });
    const courses = await prisma.courseInfo.createMany({
        data: [{
            courseId: 1,
            title: "NestJS Complete",
            courseLink: "https://www.udemy.com/course/nestjs-the-complete-developers-guide/",
            credits: 20,
            description: "Build full featured backend APIs incredibly quickly with Nest, TypeORM, and Typescript. Includes testing and deployment!",
            imageLink: "https://courses.nestjs.com/img/logo.svg",
            providerName: "Udemy",
            language: ["en"],
            bppUrl: "xyz",
            avgRating: 4.5,
            author: "Stephen Grider",
            competency: {
                "API Development": ["Level1", "Level2"],
                "Typescript": ["Level1"],
                "Backend engineering": ["Level1"]
            }
        }, {
            courseId: 2,
            title: "Graphic Design Masterclass",
            courseLink: "https://www.udemy.com/course/graphic-design-masterclass-everything-you-need-to-know/",
            credits: 25,
            description: "The Ultimate Graphic Design Course Which Covers Photoshop, Illustrator, InDesign, Design Theory, Branding & Logo Design",
            imageLink: "https://www.unite.ai/wp-content/uploads/2023/05/emily-bernal-v9vII5gV8Lw-unsplash.jpg",
            providerName: "Udemy",
            language: ["en"],
            bppUrl: "xyz",
            avgRating: 4.5,
            author: "Lindsay Marsh",
            competency: {
                "API Development": ["Level1", "Level2"],
                "Typescript": ["Level1"],
                "Backend engineering": ["Level1"]
            }
        }, {
            courseId: 3,
            title: "Python for Data Science",
            courseLink: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
            credits: 30,
            description: "Learn how to use NumPy, Pandas, Seaborn , Matplotlib , Plotly , Scikit-Learn , Machine Learning, Tensorflow , and more",
            imageLink: "https://blog.imarticus.org/wp-content/uploads/2021/12/learn-Python-for-data-science.jpg",
            providerName: "Coursera",
            language: ["en"],
            bppUrl: "xyz",
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
            courseId: 1,
            consumerId: "123e4567-e89b-42d3-a456-556642440000",
            walletTransactionId: 0,
            becknTransactionId: 0
        }, {
            courseId: 2,
            consumerId: "123e4567-e89b-42d3-a456-556642440001",
            walletTransactionId: 0,
            becknTransactionId: 0,
            status: CourseProgressStatus.COMPLETED,

        }, {
            courseId: 1,
            consumerId: "123e4567-e89b-42d3-a456-556642440001",
            walletTransactionId: 0,
            becknTransactionId: 0,
            status: CourseProgressStatus.COMPLETED,
            rating: 4,
            feedback: "Great course"
        }, {
            courseId: 3,
            consumerId: "123e4567-e89b-42d3-a456-556642440001",
            walletTransactionId: 0,
            becknTransactionId: 0
        }]
    })
    const notifs = await prisma.notification.createMany({
        data: [{
            consumerId: "123e4567-e89b-42d3-a456-556642440000",
            link: "/",
            text: "",
        }]
    })
}

main();
