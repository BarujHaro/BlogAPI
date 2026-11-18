import {useState} from 'react';
 

export default function Login({setToken}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try{
            const response = await fetch(`${import.meta.env.VITE_BACKEND_PORT}/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password}),
            });

            const data = await response.json();
            if(!response.ok) throw new Error(data.message || 'There was a problem signing in');

            setSuccess(true);

            setTimeout(() => {
                 localStorage.setItem('token', data.token);
                setToken(data.token);
            }, 3000);

        }catch(err){
            setError(err.message);
        }
    };

    return (
        <div>
            <h2>Admin Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>¡Login succesful! Redirecting to dashboard...</p>}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                type="text" placeholder="Email" 
                value={email} onChange={(e) => setEmail(e.target.value)} disabled={success} required 
                />
                <input 
                type="password" placeholder="password" 
                value={password} onChange={(e) => setPassword(e.target.value)} disabled={success} required 
                />
                <button type="submit" disabled={success}>
                    {success ? 'Loading...' : 'Enter'}
                </button>
            </form>
        </div>


    );
}