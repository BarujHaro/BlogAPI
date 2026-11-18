import { useState, useEffect } from 'react';
import PostForm from "./components/PostForm";
import PostItem from './components/PostItem';
import CommentModeration from './components/CommentModeration'; 



export default function Dashboard({token, setToken}){
    const [posts, setPosts] = useState([]);
    const [postToEdit, setPostToEdit] = useState(null);
    const API_URL = import.meta.env.VITE_BACKEND_PORT;

    const fetchPosts = async () => {
        try{
            const res = await fetch(`${API_URL}/posts/admin`, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            const data = await res.json();
            if(res.ok) setPosts(data);
        }catch(err){
            console.error('Error loading the posts', err);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDeletePost = async (id) => {
        if(!confirm('Are you sure to delte this post?')) return;
        try{
            const res = await fetch(`${API_URL}/posts/${id}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${token}`}
            });
            if(res.ok) fetchPosts();
        }catch(err){
            console.error('Error deleting', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };


    return(

        <div>
            <div>
                <h2>Administration dahsboard</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>

            {/* Form to (create and update) */}
                <PostForm 
                    token={token} 
                    onSaveSuccess={fetchPosts} 
                    postToEdit={postToEdit} 
                    setPostToEdit={setPostToEdit} 
                />

                {/* List of posts */}
                <section>
                    <h3>Your Posts</h3>
                    {posts.map((post) => (
                    <PostItem 
                        key={post.id} 
                        post={post} 
                        onEdit={setPostToEdit} 
                        onDelete={handleDeletePost} 
                    />
                    ))}
                </section>

            <CommentModeration token={token} />

        </div>



    );
}