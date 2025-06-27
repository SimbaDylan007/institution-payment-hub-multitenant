
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, UserPlus, Settings as SettingsIcon, Home } from "lucide-react";
import { AddUserModal } from "@/components/forms/AddUserModal";
import { BulkUserImportModal } from "@/components/forms/BulkUserImportModal";
import { ManageRolesModal } from "@/components/forms/ManageRolesModal";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Settings = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    administrators: 0,
    teachers: 0,
  });
  const [users, setUsers] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchUserStats();
    fetchUsers();
    fetchChartData();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/statistics');
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      } else {
        console.error('Failed to fetch user statistics');
      }
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/monthly-stats');
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      } else {
        console.error('Failed to fetch chart data');
        // Fallback to empty array if API fails
        setChartData([]);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData([]);
    }
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
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
              <Toggle id="twoFactorAuth" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sessionTimeout">Session Timeout</Label>
              <Input type="number" id="sessionTimeout" className="w-24" defaultValue="30" />
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
