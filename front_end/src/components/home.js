import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const HomePage = () => {
  return (
    <div className="homepage-container">
      <div className="welcome-card">
        <h1>Welcome to Our App</h1>
        <p>Your gateway to seamless text detection and more!</p>
        <div className="button-group">
          <Link to="/login" className="button">Login</Link>
          <Link to="/registration" className="button">Register</Link>
          {/* <Link to="/camera" className="button">Camera</Link> */}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
