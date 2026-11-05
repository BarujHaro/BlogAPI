import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import commentRouter from '../routes/commentRoutes.js';  
import prisma from '../db/db.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';

jest.mock('../db/db.js', () => ({
    __esModule: true,
    default: {
        comments: {
        findMany: jest.fn(),
        },
        comment: {
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        },
    },
}));

const app = express();
app.use(express.json());

app.use('/api', commentRouter);

describe('Comment Controller & Routes', () => {
    let token;
    const mockUser = { id: 1, username: 'testuser' };

    beforeEach(() => {
        jest.clearAllMocks();
        token = jwt.sign(
        { id: mockUser.id, username: mockUser.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
        );
    });

    describe('GET /api/:postId/comments (getCommentsByPost)', () => {
        it('Should return a list of comments for a post(200)', async () => {
        const mockComments = [
            { id: 1, content: 'Excelente post!', postId: 10, author: { username: 'user1' } }
        ];

        prisma.comments.findMany.mockResolvedValue(mockComments);

        const res = await request(app).get('/api/10/comments');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0].content).toEqual('Excelente post!');
        
         
        expect(prisma.comments.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { postId: 10 } })
        );
        });

        it('Should return 500 if the database fail to get the comments', async () => {
        prisma.comments.findMany.mockRejectedValue(new Error('DB Error'));

        const res = await request(app).get('/api/10/comments');

        expect(res.statusCode).toEqual(500);
        expect(res.body).toHaveProperty('error', 'Error obtaining comments');
        });
    });

    describe('POST /api/:postId/comments (createComment)', () => {
        it('Should create a succesful comment(201)', async () => {
        const nuevoComentarioData = { content: 'My test comment' };
        const comentarioCreado = { 
            id: 1, 
            content: nuevoComentarioData.content, 
            postId: 5, 
            authorId: mockUser.id,
            author: { username: mockUser.username }
        };

        prisma.comment.create.mockResolvedValue(comentarioCreado);

        const res = await request(app)
            .post('/api/5/comments')
            .set('Authorization', `Bearer ${token}`)
            .send(nuevoComentarioData);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('content', 'My test comment');
        });
    });

    describe('DELETE /api/comments/:commentId (deleteComment)', () => {
        it('Should delete a comment(200)', async () => {
        prisma.comment.delete.mockResolvedValue({ id: 12 });

        const res = await request(app).delete('/api/comments/12');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Comment deleted successfully');
        expect(prisma.comment.delete).toHaveBeenCalledWith({
            where: { id: 12 }
        });
        });

        it('Should return 500 if there is an error when deleting', async () => {
        prisma.comment.delete.mockRejectedValue(new Error('Delete error'));

        const res = await request(app).delete('/api/comments/999');

        expect(res.statusCode).toEqual(500);
        expect(res.body).toHaveProperty('error', 'Error deleting comment');
        });
    });

});