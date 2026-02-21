import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4003';
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${backendApiUrl}/api/check-auth`, {
          method: 'GET',
          credentials: 'include',
        });  
          
        if (response.ok) {
          const data = await response.json();
            setIsLoggedIn(data.isLoggedIn);
          setUser(data.user);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
          setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

 return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};