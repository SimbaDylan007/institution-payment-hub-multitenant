import React, { FC } from 'react'; // Import FC (Functional Component) type from React
import { useAuth } from "@/contexts/AuthContext";
import InstitutionSwitcher from "./InstitutionSwitcher";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { Skeleton } from './ui/skeleton'; // Import Skeleton for loading state

const Header: FC = () => {
    const { user, isLoading, logout } = useAuth();

    return (
        <header className="bg-gradient-to-r from-red-900 via-white-900 to-red border-b border-red-700 p-4">
            <div className="flex justify-between items-center">
                <div className="text-xl font-bold">Methodist Group of Schools</div>

                <div className="flex items-center gap-4">
                    {/* Institution Switcher will be displayed here */}
                    <InstitutionSwitcher />

                    {/* Show a skeleton loader while the auth state is loading */}
                    {isLoading ? (
                        <Skeleton className="h-6 w-24 bg-gray-700" />
                    ) : (
                        <span className="text-gray-300">{user?.name}</span>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={logout}
                        aria-label="Logout"
                        className="h-9 w-9"
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Header;