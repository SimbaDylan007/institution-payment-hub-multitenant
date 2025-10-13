import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { User, LoginCredentials, RegisterData, Institution } from "../types";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient"; // Assuming you have this for other calls

// --- Context Type Definition ---
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => void;
    isSuperAdmin: boolean;
    selectedInstitution: Institution | 'all' | null;
    setSelectedInstitution: React.Dispatch<React.SetStateAction<Institution | 'all' | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

// --- AuthProvider Component ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInstitution, setSelectedInstitution] = useState<Institution | 'all' | null>('all');

    const isSuperAdmin = user?.role.includes('ROLE_SUPER_ADMIN') ?? false;

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        if (token) {
            try {
                const decodedToken: any = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    localStorage.removeItem("user");
                    localStorage.removeItem("jwt_token");
                    setUser(null);
                    return;
                }
                const authUser: User = {
                    enabled: false,
                    id: decodedToken.sub,
                    name: decodedToken.sub,
                    username: decodedToken.sub,
                    email: decodedToken.email || '',
                    // --- FINAL FIX ---
                    // Read from the plural 'roles' key in the token
                    role: decodedToken.roles || [],
                    institutionId: decodedToken.institutionId || null,
                    institutionName: decodedToken.institutionName || null
                };
                setUser(authUser);

                if (!authUser.role.includes('ROLE_SUPER_ADMIN') && authUser.institutionId) {
                    setSelectedInstitution({ id: authUser.institutionId, name: authUser.institutionName! });
                }
            } catch (e) {
                localStorage.removeItem("user");
                localStorage.removeItem("jwt_token");
                setUser(null);
            }
        }
        setIsLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: credentials.username, password: credentials.password })
            });
            if (!response.ok) throw new Error("Invalid credentials");

            const data = await response.json();
            const token = data.jwttoken;
            localStorage.setItem("jwt_token", token);

            const decodedToken: any = jwtDecode(token);
            const authUser: User = {
                enabled: false,
                id: decodedToken.sub, name: decodedToken.sub, username: decodedToken.sub,
                email: decodedToken.email || '',
                // --- FINAL FIX ---
                // Read from the plural 'roles' key in the token
                role: decodedToken.roles || [],
                institutionId: decodedToken.institutionId || null,
                institutionName: decodedToken.institutionName || null
            };
            setUser(authUser);
            localStorage.setItem("user", JSON.stringify(authUser));

            if (!authUser.role.includes('ROLE_SUPER_ADMIN') && authUser.institutionId) {
                setSelectedInstitution({ id: authUser.institutionId, name: authUser.institutionName! });
            } else {
                setSelectedInstitution('all');
            }

            toast.success("Login successful! Redirecting...");
            return true;
        } catch (error) {
            toast.error((error as Error).message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.username || data.email.split('@')[0],
                    email: data.email,
                    password: data.password,
                    roleNames: ["ROLE_STUDENT"]
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
        setSelectedInstitution('all');
        localStorage.removeItem("user");
        localStorage.removeItem("jwt_token");
        toast.info("You have been logged out.");
        window.location.href = '/auth';
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, isSuperAdmin, selectedInstitution, setSelectedInstitution }}>
            {children}
        </AuthContext.Provider>
    );
};