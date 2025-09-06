import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, LoginCredentials, RegisterData } from "../types";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";

// --- Context Type Definition ---
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

// --- AuthProvider Component ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On initial app load, check if user data and token are in storage
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("jwt_token");
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // If stored data is corrupt, clear it
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    const loginUsername = credentials.username || credentials.email;
    if (!loginUsername) {
      toast.error("Username or email is required.");
      setIsLoading(false);
      return false;
    }

    try {
      // The login endpoint is a special case that doesn't use the apiFetch wrapper
      // because we don't have a token yet. We use the raw fetch here.
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: credentials.password
        })
      });

      if (!response.ok) {
        toast.error("Invalid username or password.");
        return false;
      }

      const data = await response.json();
      const token = data.token;
      const foundUser = data.user;

      if (!token || !foundUser) {
        toast.error("Login failed: Invalid response from server.");
        return false;
      }

      const userRole = foundUser.roles && Array.isArray(foundUser.roles) && foundUser.roles.length > 0
          ? foundUser.roles[0].name.replace('ROLE_', '')
          : "USER";

      const authUser: User = {
        id: foundUser.id.toString(),
        email: foundUser.email,
        name: foundUser.username,
        role: userRole.toUpperCase(),
        username: foundUser.username,
      };

      setUser(authUser);

      // Store the token and user details separately in localStorage
      localStorage.setItem("jwt_token", token);
      localStorage.setItem("user", JSON.stringify(authUser));

      toast.success("Login successful! Redirecting...");
      return true;

    } catch (error) {
      toast.error("Unable to connect to the authentication server.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      // Registration is an unauthenticated endpoint, so we use raw fetch.
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username || data.email.split('@')[0],
          email: data.email,
          password: data.password
        })
      });

      if (response.ok) {
        toast.success("Registration successful! Please sign in.");
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: "Registration failed." }));
        toast.error(errorData.message || "Registration failed. Username or email may already exist.");
        return false;
      }
    } catch (error) {
      toast.error("An error occurred during registration");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("jwt_token");
    toast.info("You have been logged out.");
    // Force a redirect to the login page to clear all state
    window.location.href = '/auth';
  };

  return (
      <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
        {children}
      </AuthContext.Provider>
  );
};