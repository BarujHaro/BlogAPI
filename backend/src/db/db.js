import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Cargamos la URL de conexión desde tus variables de entorno (.env)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Inicializamos Prisma pasándole el adaptador requerido por la v7
const prisma = new PrismaClient({ adapter });

export default prisma;