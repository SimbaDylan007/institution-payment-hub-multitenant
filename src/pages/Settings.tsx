import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Settings as SettingsIcon, Users, Shield, Database, Bell, School, Save } from "lucide-react";
import AddUserModal from "@/components/forms/AddUserModal";
import BulkUserImportModal from "@/components/forms/BulkUserImportModal";
import ManageRolesModal from "@/components/forms/ManageRolesModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: "ABC International School",
    address: "123 Education Street, Learning City",
    phone: "+1-234-567-8900",
    email: "admin@abcschool.edu",
    website: "www.abcschool.edu"
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "School settings have been updated successfully.",
    });
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#121828] text-white dark:bg-gray-100 dark:text-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">System Settings</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Configure system preferences and manage users
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

        <Tabs defaultValue="school" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="school">School Info</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          <TabsContent value="school">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  School Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      value={schoolSettings.schoolName}
                      onChange={(e) => setSchoolSettings({...schoolSettings, schoolName: e.target.value})}
                      className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={schoolSettings.email}
                      onChange={(e) => setSchoolSettings({...schoolSettings, email: e.target.value})}
                      className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={schoolSettings.address}
                    onChange={(e) => setSchoolSettings({...schoolSettings, address: e.target.value})}
                    className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={schoolSettings.phone}
                      onChange={(e) => setSchoolSettings({...schoolSettings, phone: e.target.value})}
                      className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={schoolSettings.website}
                      onChange={(e) => setSchoolSettings({...schoolSettings, website: e.target.value})}
                      className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSettings} className="bg-green-500 hover:bg-green-600">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <div className="flex gap-2">
                  <AddUserModal />
                  <BulkUserImportModal />
                  <ManageRolesModal />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Manage system users, roles, and permissions</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 dark:text-gray-600">Enable maintenance mode to temporarily disable the system for updates.</p>
                    <Switch id="maintenanceMode" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="logLevel">Log Level</Label>
                  <Input
                    id="logLevel"
                    defaultValue="INFO"
                    className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                  />
                </div>
                <Button className="bg-green-500 hover:bg-green-600">
                  <Save className="h-4 w-4 mr-2" />
                  Save System Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 dark:text-gray-600">Enable email notifications for important events.</p>
                    <Switch id="emailNotifications" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 dark:text-gray-600">Enable SMS notifications for urgent alerts.</p>
                    <Switch id="smsNotifications" />
                  </div>
                </div>
                <Button className="bg-green-500 hover:bg-green-600">
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="passwordPolicy">Password Policy</Label>
                  <Input
                    id="passwordPolicy"
                    defaultValue="Strong"
                    className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                  <Textarea
                    id="ipWhitelist"
                    placeholder="Enter whitelisted IPs"
                    className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                  />
                </div>
                <Button className="bg-green-500 hover:bg-green-600">
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="backupSchedule">Backup Schedule</Label>
                  <Input
                    id="backupSchedule"
                    defaultValue="Daily"
                    className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="storageLocation">Storage Location</Label>
                  <Input
                    id="storageLocation"
                    defaultValue="/var/backups"
                    className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                  />
                </div>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Database className="h-4 w-4 mr-2" />
                  Backup Database
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-[#1A1F2C] dark:bg-white border-t border-gray-800 dark:border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-600">
          &copy; {new Date().getFullYear()} School Management System
        </div>
      </footer>
    </div>
  );
}
