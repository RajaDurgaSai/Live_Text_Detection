import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Menu from './menu';
import '../App.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/forgot-password', { email });
      setMessage(response.data.message);
      if (response.data.message === 'Password reset email sent') {
        navigate('/reset', { state: { email } });  // Navigate to reset page with email in state
      }
    } catch (error) {
      setMessage(error.response.data.error || 'Failed to send reset email');
    }
  };

  const handleLogin = () => {
    navigate('/login');  // Redirect to login page
  };

  return (
    <>
      <Menu />
      <div className="container">
        <div className="card">
          <h2>Forgot Password</h2>
          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit">Reset Password</button>
          </form>
          {message && <p className="message">{message}</p>}
          <p>
            <button onClick={handleLogin} className='stopButton'>Back to Login</button>
          </p>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
