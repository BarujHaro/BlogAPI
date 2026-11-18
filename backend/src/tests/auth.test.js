import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRouter from '../routes/authRoutes.js';
import prisma from '../db/db.js';
import passport from '../config/passport.js';


process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';

jest.mock('../config/passport.js', () => ({
    ...jest.requireActual('../config/passport.js'),
    authenticate: () => (req, res, next) => {
        req.user = { id: 1, username: 'testuser', email: 'test@example.com' };
        next();
    },
}));

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

    describe('POST /api/auth/register (createUser)', () => {
        it('Return 400 if username, email or password are missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser', email: 'test@example.com' }); // Falta password

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Username, email and password are required');
        });

        it('It succesfully creates user if the data is valid', async () => {
            // 1. Primera llamada a findUnique (verifica email) -> null (no existe)
            // 2. Segunda llamada a findUnique (verifica username) -> null (no existe)
            prisma.user.findUnique
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(null);

            prisma.user.create.mockResolvedValue({
                id: '1',
                username: 'nuevousuario',
                email: 'nuevo@example.com',
                admin: false,
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ 
                    username: 'nuevousuario', 
                    email: 'nuevo@example.com', 
                    password: 'password123' 
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User created successfully');
            expect(res.body.user).toHaveProperty('username', 'nuevousuario');
            expect(res.body.user).toHaveProperty('email', 'nuevo@example.com');
        });

        it('Should return 400 if the email exists', async () => {
            prisma.user.findUnique.mockResolvedValueOnce({ 
                id: '2', 
                email: 'repetido@example.com'
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ 
                    username: 'nuevousuario', 
                    email: 'repetido@example.com', 
                    password: 'password123' 
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Email is already in use');
        });

        it('debería retornar 400 si el username ya existe', async () => {
            // 1. El email está libre (null)
            // 2. El username ya está ocupado
            prisma.user.findUnique
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: '1', username: 'repetido', email: 'otro@example.com' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ 
                    username: 'repetido', 
                    email: 'libre@example.com', 
                    password: 'password123' 
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Username are invalid');
        });
    });

    describe('GET /api/auth/profile (getUser con Passport JWT)', () => {
        it('debería rechazar con 401 si no hay token o usuario autenticado', async () => {
            const res = await request(app).get('/api/auth/profile');
            expect(res.statusCode).toEqual(401);
        });
    });

});

describe('Auth Protected Routes (getUser, updateProfile, deleteProfile)', () => {
    let token;
    const mockUser = { 
        id: '111', 
        username: 'testuser', 
        email: 'testuser@example.com', 
        admin: false 
    };

    beforeEach(() => {
        jest.clearAllMocks();

        token = jwt.sign(
            { id: mockUser.id, email: mockUser.email, username: mockUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

        describe('GET /api/auth/profile (getUser)', () => {
        it('Return user data', async () => {
            const jwt = await import('jsonwebtoken'); // Usa import dinámico o impórtalo arriba del archivo
            
            // Aseguramos que mockUser tenga un id válido
            const userWithId = { id: '1', username: 'testuser', email: 'test@example.com', ...mockUser };

            const token = jwt.default.sign(
                { id: userWithId.id }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Passport llama a prisma.user.findUnique({ where: { id: jwtPayload.id } })
            prisma.user.findUnique.mockResolvedValue(userWithId);

            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('user');
            expect(res.body.user.username).toEqual('testuser');
        });

        it('Return 401 if the token doesnt send', async () => {
            const res = await request(app).get('/api/auth/profile');
            expect(res.statusCode).toEqual(401);
        });
    });


    describe('PUT /api/auth/profile/:id (updateProfile)', () => {
        it('Returns 400 if there are not data to update', async () => {
            // Passport JWT llama primero a findUnique para autenticar el token
            prisma.user.findUnique.mockResolvedValue(mockUser);

            const res = await request(app)
                .put(`/api/auth/profile/${mockUser.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'No data to update');
        });

        it('It should update the profile (200)', async () => {
            const updatedMockUser = { 
                id: mockUser.id, 
                username: 'nuevoNombre', 
                email: 'nuevoemail@example.com', 
                admin: false 
            };
            
            // 1. Passport JWT autentica al usuario con findUnique
            prisma.user.findUnique.mockResolvedValue(mockUser);
            // 2. updateProfile verifica que ni username ni email estén ocupados (findFirst)
            prisma.user.findFirst
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(null);
            // 3. Prisma actualiza el usuario
            prisma.user.update.mockResolvedValue(updatedMockUser);

            const res = await request(app)
                .put(`/api/auth/profile/${mockUser.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ username: 'nuevoNombre', email: 'nuevoemail@example.com' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Profile updated');
            expect(res.body.user.username).toEqual('nuevoNombre');
            expect(res.body.user.email).toEqual('nuevoemail@example.com');
        });
    });

    describe('DELETE /api/auth/profile/:id (deleteProfile)', () => {
        it('Should delete the account (200)', async () => {
            // Passport JWT autentica al usuario
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.user.delete.mockResolvedValue(mockUser);

            const res = await request(app)
                .delete(`/api/auth/profile/${mockUser.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Account deleted');
            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: mockUser.id }
            });
        });
    });

});