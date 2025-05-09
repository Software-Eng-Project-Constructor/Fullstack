import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import axios from "axios";
// import { useLocation } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  privilege: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  checkSession: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  // const location = useLocation();

  const checkSession = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/auth/me", {
        withCredentials: true
      });
      if (response.data) {
        setUser(response.data);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const authPages = ['/signin', '/signup', '/sign-in-manually', '/sign-up-manually'];
    // Only check session if not on an auth page
    if (!authPages.some(page => location.pathname.startsWith(page))) {
      checkSession();
    }
  }, [location.pathname]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
