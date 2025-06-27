
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Users, Shield, Database, Bell, School, Settings as SettingsIcon } from "lucide-react";
import AddUserModal from "@/components/forms/AddUserModal";
import BulkUserImportModal from "@/components/forms/BulkUserImportModal";
import ManageRolesModal from "@/components/forms/ManageRolesModal";

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  
  // Settings state
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: "",
    schoolAddress: "",
    schoolPhone: ""
  });
  
  const [systemPrefs, setSystemPrefs] = useState({
    academicYear: "",
    timeZone: "",
    language: ""
  });
  
  const [notifications, setNotifications] = useState({
    newStudentEmail: false,
    gradeUpdatesEmail: false,
    attendanceEmail: false,
    emergencyEmail: false,
    emergencySMS: false,
    attendanceSMS: false,
    eventReminderSMS: false,
    gradeSMS: false
  });
  
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireSpecialChars: false,
    requireNumbers: false,
    requireUppercase: false,
    requireLowercase: false
  });
  
  const [securityFeatures, setSecurityFeatures] = useState({
    enableTwoFactorAuth: false,
    enableSessionTimeout: false,
    logSecurityEvents: false
  });

  useEffect(() => {
    if (user) {
      fetchAllSettings();
      fetchUsers();
      fetchUserStats();
    }
  }, [user]);

  const fetchAllSettings = async () => {
    try {
      // Fetch school information
      const schoolResponse = await fetch("http://localhost:8080/api/settings/school-info");
      if (schoolResponse.ok) {
        const schoolData = await schoolResponse.json();
        setSchoolInfo(schoolData);
      }

      // Fetch system preferences
      const systemResponse = await fetch("http://localhost:8080/api/settings/system-preferences");
      if (systemResponse.ok) {
        const systemData = await systemResponse.json();
        setSystemPrefs(systemData);
      }

      // Fetch notification preferences
      const notificationResponse = await fetch("http://localhost:8080/api/settings/notification-preferences");
      if (notificationResponse.ok) {
        const notificationData = await notificationResponse.json();
        setNotifications(notificationData);
      }

      // Fetch password policy
      const passwordResponse = await fetch("http://localhost:8080/api/settings/security/password-policy");
      if (passwordResponse.ok) {
        const passwordData = await passwordResponse.json();
        setPasswordPolicy(passwordData);
      }

      // Fetch security features
      const securityResponse = await fetch("http://localhost:8080/api/settings/security/features");
      if (securityResponse.ok) {
        const securityData = await securityResponse.json();
        setSecurityFeatures(securityData);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users");
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users/statistics");
      if (response.ok) {
        const statsData = await response.json();
        setUserStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching user statistics:", error);
    }
  };

  const saveSchoolInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/settings/school-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schoolInfo)
      });
      
      if (response.ok) {
        toast.success("School information saved successfully");
      } else {
        toast.error("Failed to save school information");
      }
    } catch (error) {
      console.error("Error saving school info:", error);
      toast.error("Error saving school information");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSystemPrefs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/settings/system-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(systemPrefs)
      });
      
      if (response.ok) {
        toast.success("System preferences saved successfully");
      } else {
        toast.error("Failed to save system preferences");
      }
    } catch (error) {
      console.error("Error saving system preferences:", error);
      toast.error("Error saving system preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/settings/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications)
      });
      
      if (response.ok) {
        toast.success("Notification preferences saved successfully");
      } else {
        toast.error("Failed to save notification preferences");
      }
    } catch (error) {
      console.error("Error saving notifications:", error);
      toast.error("Error saving notification preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const savePasswordPolicy = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/settings/security/password-policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordPolicy)
      });
      
      if (response.ok) {
        toast.success("Password policy saved successfully");
      } else {
        toast.error("Failed to save password policy");
      }
    } catch (error) {
      console.error("Error saving password policy:", error);
      toast.error("Error saving password policy");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSecurityFeatures = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/settings/security/features", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(securityFeatures)
      });
      
      if (response.ok) {
        toast.success("Security features saved successfully");
      } else {
        toast.error("Failed to save security features");
      }
    } catch (error) {
      console.error("Error saving security features:", error);
      toast.error("Error saving security features");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
          method: "DELETE"
        });
        
        if (response.ok) {
          toast.success("User deleted successfully");
          fetchUsers();
          fetchUserStats();
        } else {
          toast.error("Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Error deleting user");
      }
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#121828] text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            School Settings
          </h1>
          <p className="text-gray-400">Configure your school management system</p>
        </div>

        <Tabs defaultValue="school" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="school">School Info</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          <TabsContent value="school">
            <Card className="bg-[#1A1F2C] border-gray-800">
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
                      value={schoolInfo.schoolName}
                      onChange={(e) => setSchoolInfo(prev => ({ ...prev, schoolName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="schoolPhone">Phone Number</Label>
                    <Input
                      id="schoolPhone"
                      value={schoolInfo.schoolPhone}
                      onChange={(e) => setSchoolInfo(prev => ({ ...prev, schoolPhone: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="schoolAddress">School Address</Label>
                  <Input
                    id="schoolAddress"
                    value={schoolInfo.schoolAddress}
                    onChange={(e) => setSchoolInfo(prev => ({ ...prev, schoolAddress: e.target.value }))}
                  />
                </div>
                <Button onClick={saveSchoolInfo} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Save School Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="bg-[#1A1F2C] border-gray-800">
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      value={systemPrefs.academicYear}
                      onChange={(e) => setSystemPrefs(prev => ({ ...prev, academicYear: e.target.value }))}
                      placeholder="e.g., 2024-2025"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeZone">Time Zone</Label>
                    <Select value={systemPrefs.timeZone} onValueChange={(value) => setSystemPrefs(prev => ({ ...prev, timeZone: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={systemPrefs.language} onValueChange={(value) => setSystemPrefs(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={saveSystemPrefs} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Save System Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-6">
              <Card className="bg-[#1A1F2C] border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <AddUserModal onUserAdded={() => { fetchUsers(); fetchUserStats(); }} />
                    <BulkUserImportModal onUsersImported={() => { fetchUsers(); fetchUserStats(); }} />
                    <ManageRolesModal onRolesUpdated={() => { fetchUsers(); fetchUserStats(); }} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-500/10 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-400">Total Users</h3>
                      <p className="text-2xl font-bold">{userStats.totalUsers || 0}</p>
                    </div>
                    <div className="bg-green-500/10 p-4 rounded-lg">
                      <h3 className="font-medium text-green-400">Active Users</h3>
                      <p className="text-2xl font-bold">{userStats.activeUsers || 0}</p>
                    </div>
                    <div className="bg-purple-500/10 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-400">Administrators</h3>
                      <p className="text-2xl font-bold">{userStats.administrators || 0}</p>
                    </div>
                    <div className="bg-orange-500/10 p-4 rounded-lg">
                      <h3 className="font-medium text-orange-400">Teachers</h3>
                      <p className="text-2xl font-bold">{userStats.teachers || 0}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-2">Username</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Roles</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id} className="border-b border-gray-800">
                            <td className="p-2">{user.username}</td>
                            <td className="p-2">{user.email || 'N/A'}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                user.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {user.enabled ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-2">
                              {user.roles?.map((role: any) => (
                                <span key={role.id} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs mr-1">
                                  {role.name.replace('ROLE_', '')}
                                </span>
                              ))}
                            </td>
                            <td className="p-2">
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteUser(user.id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-[#1A1F2C] border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'newStudentEmail', label: 'New Student Registration' },
                      { key: 'gradeUpdatesEmail', label: 'Grade Updates' },
                      { key: 'attendanceEmail', label: 'Attendance Alerts' },
                      { key: 'emergencyEmail', label: 'Emergency Notifications' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key}>{label}</Label>
                        <Switch
                          id={key}
                          checked={notifications[key as keyof typeof notifications] as boolean}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">SMS Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emergencySMS', label: 'Emergency Alerts' },
                      { key: 'attendanceSMS', label: 'Attendance Alerts' },
                      { key: 'eventReminderSMS', label: 'Event Reminders' },
                      { key: 'gradeSMS', label: 'Grade Notifications' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key}>{label}</Label>
                        <Switch
                          id={key}
                          checked={notifications[key as keyof typeof notifications] as boolean}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={saveNotifications} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notification Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="bg-[#1A1F2C] border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Password Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="minLength">Minimum Password Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      value={passwordPolicy.minLength}
                      onChange={(e) => setPasswordPolicy(prev => ({ ...prev, minLength: parseInt(e.target.value) }))}
                      min="4"
                      max="20"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'requireSpecialChars', label: 'Require Special Characters' },
                      { key: 'requireNumbers', label: 'Require Numbers' },
                      { key: 'requireUppercase', label: 'Require Uppercase Letters' },
                      { key: 'requireLowercase', label: 'Require Lowercase Letters' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key}>{label}</Label>
                        <Switch
                          id={key}
                          checked={passwordPolicy[key as keyof typeof passwordPolicy] as boolean}
                          onCheckedChange={(checked) => setPasswordPolicy(prev => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>

                  <Button onClick={savePasswordPolicy} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Password Policy
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1F2C] border-gray-800">
                <CardHeader>
                  <CardTitle>Security Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {[
                      { key: 'enableTwoFactorAuth', label: 'Enable Two-Factor Authentication' },
                      { key: 'enableSessionTimeout', label: 'Enable Session Timeout' },
                      { key: 'logSecurityEvents', label: 'Log Security Events' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key}>{label}</Label>
                        <Switch
                          id={key}
                          checked={securityFeatures[key as keyof typeof securityFeatures] as boolean}
                          onCheckedChange={(checked) => setSecurityFeatures(prev => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>

                  <Button onClick={saveSecurityFeatures} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Security Features
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database">
            <Card className="bg-[#1A1F2C] border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline">
                    Backup Database
                  </Button>
                  <Button variant="outline">
                    Restore Database
                  </Button>
                  <Button variant="outline">
                    Export Data
                  </Button>
                  <Button variant="outline">
                    Import Data
                  </Button>
                </div>
                <div className="bg-yellow-500/10 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-400 mb-2">Database Status</h3>
                  <p className="text-sm">Connection: Active</p>
                  <p className="text-sm">Last Backup: Today at 2:00 AM</p>
                  <p className="text-sm">Storage Used: 2.4 GB</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
