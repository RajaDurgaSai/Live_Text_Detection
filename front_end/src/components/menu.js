import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Menu() {
  return (
    <div className="navbar">
      <ul>
        <li>
          <Link to="/">HomePage</Link>
        </li>
        <li>
          <Link to="/registration">Register</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/camera">Camera</Link>
        </li>
        
      </ul>
    </div>
  );
}

export default Menu;
