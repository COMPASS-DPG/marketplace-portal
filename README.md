# Marketplace Portal

[Compass Product Flow](https://miro.com/app/board/uXjVMkv3bh4=/?share_link_id=179469421530)
[Compass Services Diagram](https://app.diagrams.net/#G1ZcWAg558z88DcWNC4b2NKt1Q3MAPHSZu)

## About
This repository is a part of the Compass Marketplace where consumers and purchase courses and upskill their competencies and third party course providers and onboard and add their courses. It handles the backend server dealing with the use cases of the end user and partially the admin. Particularly, the entire end user flow on the marketplace which includes searching for and purhcasing courses and admin use cases related to consumers.
The tech stack used is NestJS with Prisma ORM and PostgreSQL.

The Marketplace portal module is dependent on the modules Course Manager and the Marketplace Wallet Service of Compass.

## Installation
1. Install the necessary package dependencies
    `npm i`
2. Set up a PostgreSQL in your local environment
3. Set up the environment variables as suggested in the example file
4. Generate Prisma migrations
    `npx prisma migrate dev`
    If seed data is required, it can be populated by running
    `npx prisma db seed` 
    or 
    `npx prisma migrate reset` 
    (The latter will also reset the database and delete all previous data)

## Running A Local Development Server
An auto compiled running server can then be initialized using,
    `npm run start:dev`
The Swagger API documentation could be found at `YOUR_APP_PORT/api/docs`