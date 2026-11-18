import {useState, useEffect} from 'react';

export default function PostForm({token, onSaveSuccess, postToEdit, setPostToEdit}){
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [published, setPublished] = useState(false);
    const API_URL = import.meta.env.VITE_BACKEND_PORT;

    //If we are editing, we fill the form with the data of the post
    useEffect(() => {
        if(postToEdit){
            setTitle(postToEdit.title);
            setContent(postToEdit.content);
            setPublished(postToEdit.published);
        }else{
            setTitle('');
            setContent('');
            setPublished(false);
        }
    }, [postToEdit]);

const handleSubmit = async (e) => {
    e.preventDefault();
    const url = postToEdit ? `${API_URL}/posts/${postToEdit.id}` : `${API_URL}/posts`;
    const method = postToEdit ? 'PUT' : 'POST';

    try{
        console.log(url);
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({title, content, published})
        });

        if(res.ok){
            setTitle('');
            setContent('');
            setPublished(false);
            if (postToEdit) setPostToEdit(null);  
            onSaveSuccess();  
        }else {
            const errorData = await res.json();
            console.error('Error on the server:', errorData);
        }

    }catch(err){
        console.error('Error saving the post', err)
    }

};

return(

<section>
    <h3>{postToEdit ? 'Edit Post' : 'Create New Post'}</h3>
    <form onSubmit={handleSubmit}>
        <div className='formField'>
            <input 
            type="text" placeholder="Post Title"
            value={title} onChange={(e) => setTitle(e.target.value)} required
            />
        </div>

        <div className='formField'>
            <textarea 
                placeholder="Content..." rows="4"
                value={content} onChange={(e) => setContent(e.target.value)} required 
            />
        </div>

        <div className='formField'>
            <label>
            <input 
                type="checkbox" 
                checked={published} onChange={(e) => setPublished(e.target.checked)} 
            /> Published
            </label>
        </div>

        <div className='formField'>
            <div>
                <button type="submit">{postToEdit ? 'Update Post' : 'Save Post'}</button>
                {postToEdit && (
                    <button type="button" onClick={() => { setPostToEdit(null); setTitle(''); setContent(''); setPublished(false); }}>
                    Cancel 
                    </button>
                )}
            </div>
        </div>
        
    </form>
</section>

);
}