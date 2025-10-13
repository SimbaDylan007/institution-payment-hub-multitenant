import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AccessDeniedPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
            <p className="text-lg text-gray-400 mb-8">You do not have permission to view this page.</p>
            <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
        </div>
    );
};

export default AccessDeniedPage;