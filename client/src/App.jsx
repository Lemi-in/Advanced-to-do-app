import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CollectionTasks from './pages/CollectionTasks';
import ThemeProvider from './ThemeContext'; // <- Add this
import UserProfile from './pages/UserProfile'; // <- Add this


function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/collection/:id" element={<CollectionTasks />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/collection/:id" element={<CollectionTasks />} />


        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
