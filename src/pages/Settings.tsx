import { useState, useEffect, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import { Users, Settings as SettingsIcon, Home } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import {ManageRolesModal} from "@/components/forms/ManageRolesModal.tsx";
import {BulkUserImportModal} from "@/components/forms/BulkUserImportModal.tsx";
import {AddUserModal} from "@/components/forms/AddUserModal.tsx"; // 1. Import the secure fetch wrapper

// --- Interfaces ---
interface UserStats { totalUsers: number; activeUsers: number; administrators: number; teachers: number; }
interface User { id: number; username: string; enabled: boolean; roles: { name: string }[]; createdAt: string; }

// --- Main Component ---
const Settings = () => {
  const { user } = useAuth(); // Assuming useAuth provides the logged-in user context
  const [userStats, setUserStats] = useState<UserStats>({ totalUsers: 0, activeUsers: 0, administrators: 0, teachers: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [chartData, setChartData] = useState([]);
  const [settings, setSettings] = useState({ maintenanceMode: false, twoFactorEnabled: false });

  useEffect(() => {
    if (user) { // Only fetch data if the user is logged in
      fetchUserStats();
      fetchUsers();
      fetchChartData();
    }
  }, [user]);

  // --- CORRECTED: All fetch functions now use apiFetch ---
  const fetchUserStats = async () => {
    try {
      const response = await apiFetch('http://localhost:8080/api/users/statistics');
      if (response.ok) setUserStats(await response.json());
      else console.error('Failed to fetch user statistics');
    } catch (error) { console.error('Error fetching user statistics:', error); }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiFetch('http://localhost:8080/api/users');
      if (response.ok) setUsers(await response.json());
      else console.error('Failed to fetch users');
    } catch (error) { console.error('Error fetching users:', error); }
  };

  const fetchChartData = async () => {
    try {
      const response = await apiFetch('http://localhost:8080/api/users/monthly-stats');
      if (response.ok) setChartData(await response.json());
      else setChartData([]);
    } catch (error) { setChartData([]); }
  };

  const handleMaintenanceMode = async () => {
    try {
      const response = await apiFetch('http://localhost:8080/api/settings/maintenance-mode', {
        method: 'POST',
        body: JSON.stringify({ enabled: !settings.maintenanceMode }),
      });
      if (response.ok) {
        setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
        toast.success(`Maintenance mode ${!settings.maintenanceMode ? 'enabled' : 'disabled'}`);
      } else { throw new Error("Failed to toggle"); }
    } catch (error) { toast.error('Failed to toggle maintenance mode'); }
  };

  const handleTwoFactorAuth = async () => {
    try {
      const response = await apiFetch('http://localhost:8080/api/settings/two-factor-auth', {
        method: 'POST',
        body: JSON.stringify({ enabled: !settings.twoFactorEnabled }),
      });
      if (response.ok) {
        setSettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
        toast.success(`Two-factor authentication ${!settings.twoFactorEnabled ? 'enabled' : 'disabled'}`);
      } else { throw new Error("Failed to toggle"); }
    } catch (error) { toast.error('Failed to toggle two-factor authentication'); }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your institution settings and configurations.
          </p>
        </div>
        <Button
          className="bg-purple-500 text-white hover:bg-purple-600"
          asChild
        >
          <Link to="/dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* General Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure basic settings for your institution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <Toggle id="maintenanceMode" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowRegistrations">Allow New Registrations</Label>
              <Toggle id="allowRegistrations" defaultChecked />
            </div>
            <div>
              <Label htmlFor="defaultLanguage">Default Language</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* User Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <AddUserModal onUserAdded={fetchUserStats} />
              <BulkUserImportModal onUsersImported={fetchUserStats} />
              <ManageRolesModal onRolesUpdated={fetchUserStats} />
            </div>
            <div>
              <p>Total Users: {userStats.totalUsers}</p>
              <p>Active Users: {userStats.activeUsers}</p>
              <p>Administrators: {userStats.administrators}</p>
              <p>Teachers: {userStats.teachers}</p>
            </div>
            <Table>
              <TableCaption>A list of your institution users.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.slice(0, 10).map((user: any, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.roles?.map((role: any) => role.name).join(', ') || 'No roles'}</TableCell>
                    <TableCell>{user.enabled ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    {users.length} users in total
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        {/* Security Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security settings for your institution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                <div>
                  <h3 className="font-medium text-white">Maintenance Mode</h3>
                  <p className="text-sm text-gray-300">Enable maintenance mode to restrict access</p>
                </div>
                <Button
                  onClick={handleMaintenanceMode}
                  variant={settings.maintenanceMode ? "destructive" : "default"}
                  className={settings.maintenanceMode ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {settings.maintenanceMode ? 'Disable' : 'Enable'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                <div>
                  <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-300">Add an extra layer of security to accounts</p>
                </div>
                <Button
                  onClick={handleTwoFactorAuth}
                  variant={settings.twoFactorEnabled ? "destructive" : "default"}
                  className={settings.twoFactorEnabled ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {settings.twoFactorEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                <div>
                  <h3 className="font-medium text-white">Session Timeout</h3>
                  <p className="text-sm text-gray-300">Set the duration for user sessions</p>
                </div>
                <Input type="number" id="sessionTimeout" className="w-24" defaultValue="30" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics and Reporting Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Analytics and Reporting
            </CardTitle>
            <CardDescription>
              View analytics and reporting data for your institution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Students" stroke="#8884d8" name="Students" />
                  <Line type="monotone" dataKey="Teachers" stroke="#82ca9d" name="Teachers" />
                  <Line type="monotone" dataKey="Admins" stroke="#ffc658" name="Admins" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No chart data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
