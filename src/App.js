import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './features/auth/authSlice';
import Login from './components/Login';
import BicycleList from './components/BicycleList';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <img src="/bicycle.png" alt="Bicycle Logo" className="header-logo" />
            </div>
            <h1 className="header-title">Akarsu Bicycle Inventory Management</h1>
            {isAuthenticated && (
              <div className="header-right">
                <span className="username-badge">{user?.username}</span>
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/admin" replace /> : <Login />
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <BicycleList />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;