import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, saveSession } from '../api';

function Signup({ onSignup }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await signup(name, email, password);
      saveSession(data.token, data.user);
      onSignup(data.user);
      navigate('/');
    } catch (err) {
      setError(err.error || 'Signup failed');
    }
  };

  return (
    <section className="auth-view">
      <h1>Signup</h1>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Signup</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}

export default Signup;
