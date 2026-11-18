import { useState, useEffect } from 'react';

export default function CommentModeration({ token }) {
    const [comments, setComments] = useState([]);
    const API_URL = import.meta.env.VITE_BACKEND_PORT;
        
    const fetchComments = async () => {
        try {
        
        const res = await fetch(`${API_URL}/comments/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setComments(data);
        } catch (err) {
        console.error('Error loading comments', err);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure about deleting this comment?')) return;
        
        try {

        const res = await fetch(`${API_URL}/comments/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            setComments(comments.filter(comment => comment.id !== commentId));
        } else {
            alert('It could not delete the comment');
        }
        } catch (err) {
        console.error('Error deleting the comment', err);
        }
    };

    return (
        <section>
        <h3>Comments moderation</h3>
        {comments.length === 0 ? (
            <p>There are no comments</p>
        ) : (
            comments.map((comment) => (
            <div key={comment.id}>
                <p>
                <strong>{comment.author?.username || 'Anonymous'}:</strong> {comment.content}
                </p>
                <small>
                On the post: <em>{comment.post?.title || 'Post Unknown'}</em>
                </small>
                <div>
                <button 
                    onClick={() => handleDeleteComment(comment.id)} 
                >
                    Delete comment
                </button>
                </div>
            </div>
            ))
        )}
        </section>
    );
}