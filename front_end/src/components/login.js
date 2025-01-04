import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Menu from './menu';
import '../App.css';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password
      });
      setMessage(response.data.message);
      setUsername(response.data.username);
      setToken(response.data.access_token);
      navigate('/camera');
    } catch (error) {
      setMessage(error.response.data.error || 'Invalid credentials');
    }
  };

  return (
    <div className="card-container">
      <Menu/>
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Login</button>
        </form>
        {message && <p className="message">{message}</p>}
        {username && <p className="welcome">Welcome, {username}!</p>}
        
        <div>
          <p>
            <Link to="/forget_pass">Forgot Password?</Link>
          </p>
          <p>
            <Link to="/registration">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
