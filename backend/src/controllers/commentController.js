import prisma from '../db/db.js';

export const getCommentsByPost = async (req, res) => {
    try{
        const {postId} = req.params;

        const comments = await prisma.comments.findMany({
            where: {postId: Number(postId)},
            include: {author: {select: {username: true}}},
            orderBy: {createdAt: 'desc'}
        });
        res.json(comments);
    }catch(error){
        res.status(500).json({error: 'Error obtaining comments'});
    }
};

export const createComment = async (req, res) => {
    try{
        const {postId} = req.params;
        const {content} = req.body;
        const authorId = req.user;

        const newComment = await prisma.comment.create({
            data:{
                content,
                postId: Number(postId),
                authorId: Number(authorId)
            },
            include:{
                author: {select:{username: true}}
            }
        });
        res.status(201).json(newComment);
    }catch(error){
        res.status(500).json({error: 'Error creating comment'});
    }
};

export const deleteComment = async (req, res) => {
    try{
        const {commentId} =req.params;

        await prisma.comment.delete({
            where: {id: Number(commentId)}
        });
        res.json({message: 'Comment deleted successfully'});
    }catch(error){
        res.status(500).json({error: 'Error deleting comment'});
    }
};
 