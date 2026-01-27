import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading, user } = useContext(AuthContext);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
    // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login-page" replace />;
  }
  
  // If logged in, render the protected component
  return children;
};

export default ProtectedRoute;