import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/registration';
import Login from './components/login';
import Camera from './components/camera';
import Menu from './components/menu';
import ForgotPassword from './components/forget_pass';
import HomePage from './components/home';
import ResetPassword from './components/reset';
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <div className='App'>
      <BrowserRouter>
        <Menu />
        <Routes>
          <Route path='/' element={<HomePage/>}/>
          <Route path="/registration" element={<Register />} />
          <Route path="/login" element={<Login setToken={setToken} />} /> 
          <Route 
            path="/camera" 
            element={token ? <Camera token={token} /> : <Navigate to="/login" />} />
            <Route path="/forget_pass" element={<ForgotPassword/>}/>
            <Route path='/reset' element={<ResetPassword/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

