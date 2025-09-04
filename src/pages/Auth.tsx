
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const { user, login, isLoading } = useAuth();
  
  // Login form state
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation messages
  const [errorMessage, setErrorMessage] = useState("");
  
  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!username || !password) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    
    // Now try to login
    const success = await login({ username, password });
    
    if (!success) {
      // The error toast is handled in the AuthContext, so we don't need to show it here
      console.log("Login failed");
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen flex bg-[#121828] text-white">
      {/* Left side - login form */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center mb-8">
            <div className="bg-purple-600 p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" x2="16" y1="21" y2="21"></line>
                <line x1="12" x2="12" y1="17" y2="21"></line>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pachedu Junior School</h1>
              <p className="text-gray-400">Student Payment Management</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Sign In</h2>
          <p className="text-gray-400 mb-6">Enter your credentials to access your dashboard</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#1A1F2C] border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <button 
                  type="button" 
                  onClick={() => {}} 
                  className="text-sm text-purple-400 hover:text-purple-300"
                  title="Hint: Administrator credentials"
                >

                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1A1F2C] border-gray-700 text-white pr-10"
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember" className="text-sm text-gray-400">Remember me</Label>
            </div>
            
            {errorMessage && (
              <div className="text-sm text-red-500">{errorMessage}</div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
      
      {/* Right side - purple gradient */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-purple-600 to-purple-800 p-12 flex flex-col justify-center">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Pachedu Junior School</h2>
          <ul className="space-y-4">
            <li className="flex items-center">
              <div className="mr-4 text-xl">•</div>
              <div>Track and manage student payments efficiently</div>
            </li>
            <li className="flex items-center">
              <div className="mr-4 text-xl">•</div>
              <div>Streamlined payment validation and processing</div>
            </li>
            <li className="flex items-center">
              <div className="mr-4 text-xl">•</div>
              <div>Comprehensive reporting and analytics</div>
            </li>
            <li className="flex items-center">
              <div className="mr-4 text-xl">•</div>
              <div>Secure and reliable payment data management</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Auth;
