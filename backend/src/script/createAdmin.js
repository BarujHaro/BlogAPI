import prisma from '../db/db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
// node src/script/createAdmin.js

async function main() {
    const adminUsername = process.env.USERADMIN;
    const adminEmail = process.env.EMAILADMIN; 
    const adminPassword = process.env.PASSADMIN;

    if (!adminUsername || !adminEmail || !adminPassword) {
        console.error('Missing env variables (USERADMIN, EMAILADMIN o PASSADMIN)');
        return;
    }

    console.log(`Creating user: "${adminUsername}" (${adminEmail})...`);
 
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { username: adminUsername },
                { email: adminEmail }
            ]
        },
    });

    if (existingUser) {
        console.log(`The user "${adminUsername}" email "${adminEmail}" already exists.`);
        return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    await prisma.user.create({
        data: {
            username: adminUsername,
            email: adminEmail,  
            password: hashedPassword,
            admin: true,
        },
    });

    console.log('Admin User created successfully!');
}

main()
    .catch((e) => {
        console.error('Error creating the admin: ', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });