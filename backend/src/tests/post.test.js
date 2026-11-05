import request from 'supertest';
import express from 'express';
import postRouter from '../routes/postRoutes.js'; 
import prisma from '../db/db.js';

jest.mock('../db/db.js', () => ({
    __esModule: true,
    default: {
        post: {
            findMany: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

const app = express();
app.use(express.json());
app.use('/api/posts', postRouter);

describe('Post controller & routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/posts getPublishedPosts', () => {
        it('It should return a list of posts (200)', async () => {
            const mockPosts = [{id: 1, title: 'First post', content: 'Content 1', published: true, author: { username: 'testuser' } }];
        

        prisma.post.findMany.mockResolvedValue(mockPosts);

        const res = await request(app).get('/api/posts');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0].title).toEqual('First post');
         
        expect(prisma.post.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { published: true } })
        );
        });


        it('It return 500 as an error from the database', async () => {
        prisma.post.findMany.mockRejectedValue(new Error('Database error'));

        const res = await request(app).get('/api/posts');

        expect(res.statusCode).toEqual(500);
        expect(res.body).toHaveProperty('error', 'Error obtaining posts');
        });

    });

    describe('POST /api/posts createposts', () => {
        it('It should create a post 201', async () => {
            const nuevoPostData = {title: 'Nuevo post', content: 'Texto de prueba', authorId: 1 };
            const postCreado = { id: 1, ...nuevoPostData, published: false };

            prisma.post.create.mockResolvedValue(postCreado);

            const res = await request(app)
            .post('/api/posts')
            .send(nuevoPostData);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id', 1);
            expect(res.body.title).toEqual('Nuevo post');
        });
    });

    describe('DELETE /api/posts/:id (deletePost)', () => {
        it('Should delete a post (200)', async () => {
            const postEliminado = { id: 1, title: 'Post a borrar' };

            prisma.post.delete.mockResolvedValue(postEliminado);

            const res = await request(app).delete('/api/posts/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Post deleted successfully');
            expect(prisma.post.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
        });

        it('Should return 404 if the post to delete does not exist', async () => {
            const errorP2025 = new Error('Record to delete does not exist.');
            errorP2025.code = 'P2025'; 

            prisma.post.delete.mockRejectedValue(errorP2025);

            const res = await request(app).delete('/api/posts/999');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Post not found');
        });
    });

});