
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, LoginCredentials, RegisterData } from "../types";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Real login function using your backend
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      // First, get all users from your backend
      const usersResponse = await fetch('http://localhost:8080/api/users');
      
      if (!usersResponse.ok) {
        toast.error("Unable to connect to authentication server");
        return false;
      }

      const users = await usersResponse.json();
      
      // Find user by username
      const foundUser = users.find((u: any) => 
        u.username === credentials.username && u.enabled
      );

      if (!foundUser) {
        toast.error("Invalid username or user is disabled");
        return false;
      }

      // In a real application, you would verify the password hash
      // For now, we'll use a simple password check
      if (credentials.password !== foundUser.password) {
        toast.error("Invalid password");
        return false;
      }

      // Convert backend user to frontend user format
      const authUser: User = {
        id: foundUser.id.toString(),
        email: foundUser.email || `${foundUser.username}@school.edu`,
        name: foundUser.username,
        role: foundUser.roles && foundUser.roles.length > 0 
          ? foundUser.roles[0].name.replace('ROLE_', '').toLowerCase()
          : "user",
        username: foundUser.username
      };
      
      setUser(authUser);
      localStorage.setItem("user", JSON.stringify(authUser));
      toast.success("Login successful!");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function using your backend
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username || data.email.split('@')[0],
          email: data.email,
          password: data.password,
          enabled: true,
          roleNames: ['ROLE_STUDENT'] // Default role for new registrations
        })
      });

      if (response.ok) {
        const createdUser = await response.json();
        
        // Convert backend user to frontend user format
        const authUser: User = {
          id: createdUser.id.toString(),
          email: createdUser.email || data.email,
          name: data.name,
          role: "student",
          username: createdUser.username
        };
        
        setUser(authUser);
        localStorage.setItem("user", JSON.stringify(authUser));
        toast.success("Registration successful!");
        return true;
      } else {
        toast.error("Registration failed. Username may already exist.");
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
