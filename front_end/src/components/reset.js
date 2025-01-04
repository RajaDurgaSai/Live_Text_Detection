import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Menu from './menu';
import '../App.css';

function ResetPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/reset-password', {
        email,
        reset_token: resetToken,
        new_password: newPassword
      });
      setMessage(response.data.message);
      if (response.data.message === 'Password has been reset') {
        navigate('/login');
      }
    } catch (error) {
      setMessage(error.response.data.error || 'Failed to reset password');
    }
  };

  const handleLogin = () => {
    navigate('/login');  
  };

  return (
    <>
      <Menu />
      <div className="container">
        <div className="card">
          <h2>Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="text" placeholder="Reset Token" value={resetToken} onChange={(e) => setResetToken(e.target.value)} required />
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <button type="submit">Reset Password</button>
          </form>
          {message && <p className="message">{message}</p>}
          <p>
            <button onClick={handleLogin}>Back to Login</button>
          </p>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
