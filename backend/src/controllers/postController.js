import prisma from '../db/db.js';

export const getPublishedPosts = async (req, res) => {
    try{
        const posts = await prisma.post.findMany({
            where: {published: true},
            include: {author: {select: {username: true}}},
            orderBy: {createdAt: 'desc'}
        });
        res.json(posts);
    }catch(error){
        res.status(500).json({error: 'Error obtaining posts'});
    }
};

export const createPost = async (req, res) => {
    try{
        const {title, content, published} = req.body;
        const authorId = req.user.id; 
         
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                published: published || false,
                authorId
            }
        });
        res.status(201).json(newPost);
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Error creating the post'});
    }
};


export const deletePost = async (req, res) => {
    try{
        const {id} = req.params;

        const deletedPost = await prisma.post.delete({
            where:{
                id: Number(id)
            }
        });
        res.json({message: 'Post deleted successfully', deletedPost});
    }catch(error){
        if(error.code==='P2025'){
            return res.status(404).json({error: 'Post not found'});
        }
        res.status(500).json({error: 'Error deleting the post'});
    }
};
 
export const updatePost = async (req, res) => {
    try{
        const {id} = req.params;
        const {title, content, published} = req.body;

        const updatedPost = await prisma.post.update({
            where: {
                id: Number(id)
            },
            data: {
                title,
                content, 
                published
            }
        });

        res.json({ message: 'Post updated successfully', updatedPost });

    }catch(error){
        if(error.code === 'P2025'){
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(500).json({ error: 'Error updating the post' });
    }
};

export const getAllPostsForAdmin = async (req, res) => {
    try{
        const posts = await prisma.post.findMany({
            include: {author: {select: {username: true}}},
            orderBy: {createdAt: 'desc'}
        });
        res.json(posts);
    }catch(error){
        res.status(500).json({error: 'Error obtaining posts'});
    }
};