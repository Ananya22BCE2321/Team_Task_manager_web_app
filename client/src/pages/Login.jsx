import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, saveSession } from '../api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await login(email, password);
      saveSession(data.token, data.user);
      onLogin(data.user);
      navigate('/');
    } catch (err) {
      setError(err.error || 'Login failed');
    }
  };

  return (
    <section className="auth-view">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      <p>
        New user? <Link to="/signup">Signup</Link>
      </p>
    </section>
  );
}

export default Login;
