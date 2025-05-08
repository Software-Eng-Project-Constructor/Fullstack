import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  privilege: string;
}

// Create the context
interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  checkSession: () => Promise<void>;
}

// Define the props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
