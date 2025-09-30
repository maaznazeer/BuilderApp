import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('domusUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedAllUsers = localStorage.getItem('domusAllUsers');
      if (storedAllUsers) {
        setAllUsers(JSON.parse(storedAllUsers));
      } else {
        // Initialize with some mock users if none exist
        const mockUsers = [
          { user_id: 1, name: 'John Contractor', email: 'john.c@example.com', role: 'homebuilder', active_status: true, subscription: 'Premium', promo_expiry: null },
          { user_id: 2, name: 'Mary Architect', email: 'mary.a@example.com', role: 'homeowner', active_status: true, subscription: 'Basic', promo_expiry: null },
          { user_id: 3, name: 'David Supervisor', email: 'david.s@example.com', role: 'subcontractor', active_status: false, subscription: 'Freemium', promo_expiry: null },
          { user_id: 4, name: 'Admin User', email: 'admin@example.com', role: 'admin', active_status: true, subscription: 'Lifetime', promo_expiry: null },
        ];
        setAllUsers(mockUsers);
        localStorage.setItem('domusAllUsers', JSON.stringify(mockUsers));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('domusUser');
      localStorage.removeItem('domusAllUsers');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email, password, role) => {
    // Mock login
    if (email === 'admin@example.com' && password === 'adminpassword') {
      const adminData = { user_id: 4, name: 'Admin User', email: 'admin@example.com', role: 'admin', active_status: true, subscription: 'Lifetime', promo_expiry: null };
      localStorage.setItem('domusUser', JSON.stringify(adminData));
      setUser(adminData);
      toast({ title: "Admin Login Successful", description: "Welcome back, Admin!" });
      return adminData;
    }
    if (email === 'user@example.com' && password === 'password') {
      const userData = { 
        user_id: Date.now(),
        name: 'Test User', 
        email: 'user@example.com', 
        phone: '123-456-7890',
        role: role,
        subscription: 'Freemium',
        active_status: true,
        promo_expiry: null,
        profilePhoto: null,
      };
      localStorage.setItem('domusUser', JSON.stringify(userData));
      setUser(userData);
      toast({ title: "Login Successful", description: `Welcome back, ${role}!` });
      return userData;
    } else {
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
      return null;
    }
  };
  
  const signup = (name, email, password, role = 'homeowner', phone = '') => {
    // Mock signup
    const userData = { 
        user_id: Date.now(),
        name,
        email,
        phone,
        role: role,
        subscription: 'Freemium', // New users start on Freemium
        active_status: true,
        promo_expiry: null,
        profilePhoto: null,
     };
    localStorage.setItem('domusUser', JSON.stringify(userData));
    setUser(userData);
    
    const updatedAllUsers = [...allUsers, userData];
    setAllUsers(updatedAllUsers);
    localStorage.setItem('domusAllUsers', JSON.stringify(updatedAllUsers));

    toast({ title: "Sign Up Successful", description: "Welcome to DomusBuilder Hub!" });
    return userData;
  };

  const oauthLogin = (provider, role) => {
    // Mock OAuth login
    const mockUserData = {
      Google: { name: 'Google User', email: 'google.user@example.com', avatar: 'https://i.pravatar.cc/150?img=12' },
      Facebook: { name: 'Facebook User', email: 'facebook.user@example.com', avatar: 'https://i.pravatar.cc/150?img=13' },
      Apple: { name: 'Apple User', email: 'apple.user@example.com', avatar: 'https://i.pravatar.cc/150?img=14' },
    };

    const userData = {
      user_id: Date.now(),
      ...mockUserData[provider],
      phone: '',
      role: role,
      subscription: 'Freemium',
      active_status: true,
      promo_expiry: null,
      profilePhoto: mockUserData[provider].avatar,
    };

    localStorage.setItem('domusUser', JSON.stringify(userData));
    setUser(userData);
    
    const updatedAllUsers = [...allUsers, userData];
    setAllUsers(updatedAllUsers);
    localStorage.setItem('domusAllUsers', JSON.stringify(updatedAllUsers));

    toast({ title: `Signed in with ${provider}`, description: `Welcome, ${userData.name}!` });
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('domusUser');
    setUser(null);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };
  
  const updateUser = (updatedData) => {
    if(!user) return;
    const updatedUser = { ...user, ...updatedData };
    localStorage.setItem('domusUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
  };

  const updatePlan = (newPlan) => {
    if (user) {
      const updatedUser = { ...user, subscription: newPlan };
      localStorage.setItem('domusUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast({ title: "Plan Updated!", description: `You are now on the ${newPlan} plan.` });
    }
  };

  const updateAllUsers = (newUsersList) => {
    setAllUsers(newUsersList);
    localStorage.setItem('domusAllUsers', JSON.stringify(newUsersList));
  }


  const value = {
    user,
    allUsers,
    loading,
    login,
    signup,
    oauthLogin,
    logout,
    updateUser,
    updatePlan,
    updateAllUsers,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};