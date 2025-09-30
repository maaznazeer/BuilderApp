import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('domusUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('domusUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email, password) => {
    if (email === 'user@example.com' && password === 'password') {
      const userData = { 
        name: 'Test User', 
        email: 'user@example.com', 
        phone: '123-456-7890',
        role: 'Home Builder'
      };
      localStorage.setItem('domusUser', JSON.stringify(userData));
      setUser(userData);
      toast({ title: "Login Successful", description: "Welcome back!" });
      return userData;
    } else {
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
      return null;
    }
  };
  
  const signup = (name, email, password) => {
    const userData = { 
        name,
        email,
        phone: '',
        role: 'Homeowner'
     };
    localStorage.setItem('domusUser', JSON.stringify(userData));
    setUser(userData);
    toast({ title: "Sign Up Successful", description: "Welcome to DomusBuilder Hub!" });
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('domusUser');
    setUser(null);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };
  
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    localStorage.setItem('domusUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
  };


  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};