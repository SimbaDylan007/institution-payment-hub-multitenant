import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AccessDeniedPage from "@/pages/AccessDeniedPage"; // We will create this simple page next

interface ProtectedRouteProps {
    allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { user, isLoading } = useAuth();

    // While checking the user's auth status, show nothing or a loading spinner
    if (isLoading) {
        return null; // or <LoadingSpinner />;
    }

    // If the user is not logged in, redirect them to the auth page
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Check if the user has at least one of the allowed roles
    // The 'some' method is perfect for this check.
    const isAllowed = user.role.some(userRole => allowedRoles.includes(userRole));

    // If the user has the required role, render the child component (the page).
    // The <Outlet /> component from react-router-dom does this.
    if (isAllowed) {
        return <Outlet />;
    }

    // If the user does not have the required role, show the Access Denied page.
    return <AccessDeniedPage />;
};

export default ProtectedRoute;