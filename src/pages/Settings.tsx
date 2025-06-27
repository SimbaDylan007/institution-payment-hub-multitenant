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
import { Users, UserPlus, Settings as SettingsIcon } from "lucide-react";
import { AddUserModal } from "@/components/forms/AddUserModal";
import { BulkUserImportModal } from "@/components/forms/BulkUserImportModal";
import { ManageRolesModal } from "@/components/forms/ManageRolesModal";

const data = [
  { name: "Jan", Students: 4000, Teachers: 2400, Admins: 2400 },
  { name: "Feb", Students: 3000, Teachers: 1398, Admins: 2210 },
  { name: "Mar", Students: 2000, Teachers: 9800, Admins: 2290 },
  { name: "Apr", Students: 2780, Teachers: 3908, Admins: 2000 },
  { name: "May", Students: 1890, Teachers: 4800, Admins: 2181 },
  { name: "Jun", Students: 2390, Teachers: 3800, Admins: 2500 },
  { name: "Jul", Students: 3490, Teachers: 4300, Admins: 2100 },
  { name: "Aug", Students: 4000, Teachers: 2400, Admins: 2400 },
  { name: "Sep", Students: 3000, Teachers: 1398, Admins: 2210 },
  { name: "Oct", Students: 2000, Teachers: 9800, Admins: 2290 },
  { name: "Nov", Students: 2780, Teachers: 3908, Admins: 2000 },
  { name: "Dec", Students: 1890, Teachers: 4800, Admins: 2181 },
];

const tableData = [
  { name: "John Doe", role: "Student", status: "Active", lastLogin: "2024-03-15" },
  { name: "Jane Smith", role: "Teacher", status: "Active", lastLogin: "2024-03-14" },
  { name: "Alice Johnson", role: "Admin", status: "Inactive", lastLogin: "2024-03-10" },
  { name: "Bob Williams", role: "Librarian", status: "Active", lastLogin: "2024-03-16" },
];

const Settings = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    administrators: 0,
    teachers: 0,
  });

  useEffect(() => {
    fetchUserStats();
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

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your institution settings and configurations.
        </p>
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
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.lastLogin}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    {tableData.length} users in total
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
