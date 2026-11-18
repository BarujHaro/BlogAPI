export default function PostItem({ post, onEdit, onDelete }) {
    return (
        <div>
        <h4>{post.title} {post.published ? '🟢 (Published)' : '🟡 (Draft)'}</h4>
        <p>{post.content.substring(0, 100)}...</p>
        <div>
            <button onClick={() => onEdit(post)}>
            Edit
            </button>
            <button onClick={() => onDelete(post.id)}>
            Delete
            </button>
        </div>
        </div>
    );
}