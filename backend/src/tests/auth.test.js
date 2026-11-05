import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRouter from '../routes/authRoutes.js';
import prisma from '../db/db.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';

//Mock prisma to avoid the connection with the real DB
jest.mock('../db/db.js', () => ({
    __esModule: true,
    default: {
        user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        }
    },

}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Controller & Routes', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/sign-up (createUser)', () => {
        it('Return 400 if username or password are missing', async () => {
            const res = await request(app)
            .post('/api/auth/sign-up')
            .send({username: 'testuser'});

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Username and password are required');
        });

        it('It succesfully creates user if the data is valid', async () => {
            prisma.user.create.mockResolvedValue(null);

            prisma.user.create.mockResolvedValue({
                id: '1',
                username: 'nuevousuario',
                admin: false,
            });

            const res = await request(app)
            .post('/api/auth/sign-up')
            .send({ username: 'nuevousuario', password: 'password123' });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User created succefully');
            expect(res.body.user).toHaveProperty('username', 'nuevousuario');
        });

        it('debería retornar 400 si el usuario ya existe', async () => {
            // Simulamos que el usuario ya existe en la BD
            prisma.user.findUnique.mockResolvedValue({ id: '1', username: 'repetido' });

            const res = await request(app)
                .post('/api/auth/sign-up')
                .send({ username: 'repetido', password: 'password123' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Username are invalid');
        });
    });

    describe('GET /api/auth/profile (getUser con Passport JWT)', () => {
        
        it('debería rechazar con 401 si no hay token o usuario autenticado', async () => {
        const res = await request(app).get('/api/auth/profile');
        
        // Como passport-jwt rechazará la petición por no tener token válido:
        expect(res.statusCode).toEqual(401);
        });

    });

});

describe('Auth Protected Routes (getUser, updateProfile, deleteProfile', () => {
    let token;
    const mockUser = {id: '111', username: 'testuser', admin: false};

    beforeEach(() => {
        jest.clearAllMocks();

        token = jwt.sign(
            {id: mockUser.id, username: mockUser.username},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );
    });

    describe('GET /api/Auth/profile (getUser)', () => {
        it('Return user data', async () => {
            prisma.user.findUnique.mockResolvedValue(mockUser);

            const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('user');
            expect(res.body.user.username).toEqual(mockUser.username);
        });

        it('Return 401 if the token doesnt send', async () => {
            const res = await request(app).get('/api/auth/profile');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('PUT /api/auth/profile/:id updateprofile', () => {
        it('Returns 400 if there are not data to update', async () => {
            const res = await request(app)
            .put(`/api/auth/profile/${mockUser.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({});

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'No data to update');
        });

        it('It should update the profile (200)', async () => {
            const updatedMockUser = { id: mockUser.id, username: 'nuevoNombre', admin: false };
            
            // Simulamos que Prisma actualiza el usuario
            prisma.user.update.mockResolvedValue(updatedMockUser);

            const res = await request(app)
                .put(`/api/auth/profile/${mockUser.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ username: 'nuevoNombre' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Profile updated');
            expect(res.body.user.username).toEqual('nuevoNombre');
        });
    });

    describe('DELETE /api/auth/profile/:id (deleteProfile)', () => {
        it('debería eliminar la cuenta del usuario autenticado (200)', async () => {
        // Simulamos que Prisma elimina el usuario exitosamente
        prisma.user.delete.mockResolvedValue(mockUser);

        const res = await request(app)
            .delete(`/api/auth/profile/${mockUser.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Account deleted');
        // Verificamos que Prisma llamó al método delete con el ID correcto
        expect(prisma.user.delete).toHaveBeenCalledWith({
            where: { id: mockUser.id }
        });
        });
    });

});
