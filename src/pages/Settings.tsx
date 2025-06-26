
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Settings as SettingsIcon, Users, Shield, Bell, School, Globe, Palette } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();

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
              Configure school management system settings
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

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  General System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <School className="h-5 w-5" />
                        School Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="schoolName">School Name</Label>
                        <Input
                          id="schoolName"
                          defaultValue="Springfield Elementary School"
                          className="bg-[#1A1F2C] dark:bg-white border-gray-600 dark:border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="schoolAddress">Address</Label>
                        <Input
                          id="schoolAddress"
                          defaultValue="123 Education Street, Learning City"
                          className="bg-[#1A1F2C] dark:bg-white border-gray-600 dark:border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="schoolPhone">Phone</Label>
                        <Input
                          id="schoolPhone"
                          defaultValue="+1 (555) 123-4567"
                          className="bg-[#1A1F2C] dark:bg-white border-gray-600 dark:border-gray-300"
                        />
                      </div>
                      <Button className="w-full bg-green-500 hover:bg-green-600">
                        Save School Info
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Globe className="h-5 w-5" />
                        System Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="academicYear">Academic Year</Label>
                        <Select defaultValue="2023-2024">
                          <SelectTrigger className="bg-[#1A1F2C] dark:bg-white border-gray-600 dark:border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2023-2024">2023-2024</SelectItem>
                            <SelectItem value="2024-2025">2024-2025</SelectItem>
                            <SelectItem value="2025-2026">2025-2026</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timezone">Time Zone</Label>
                        <Select defaultValue="UTC-5">
                          <SelectTrigger className="bg-[#1A1F2C] dark:bg-white border-gray-600 dark:border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                            <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                            <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                            <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger className="bg-[#1A1F2C] dark:bg-white border-gray-600 dark:border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full bg-blue-500 hover:bg-blue-600">
                        Save Preferences
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="h-5 w-5" />
                      System Themes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border border-gray-600 dark:border-gray-300 rounded-lg cursor-pointer hover:bg-[#1A1F2C] dark:hover:bg-gray-100">
                        <div className="w-full h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded mb-2"></div>
                        <p className="text-center text-sm">Default Theme</p>
                      </div>
                      <div className="p-4 border border-gray-600 dark:border-gray-300 rounded-lg cursor-pointer hover:bg-[#1A1F2C] dark:hover:bg-gray-100">
                        <div className="w-full h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded mb-2"></div>
                        <p className="text-center text-sm">Nature Theme</p>
                      </div>
                      <div className="p-4 border border-gray-600 dark:border-gray-300 rounded-lg cursor-pointer hover:bg-[#1A1F2C] dark:hover:bg-gray-100">
                        <div className="w-full h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded mb-2"></div>
                        <p className="text-center text-sm">Warm Theme</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Account Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">User Statistics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Users:</span>
                          <span className="font-bold text-blue-400">2,456</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Users:</span>
                          <span className="font-bold text-green-400">2,289</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Administrators:</span>
                          <span className="font-bold text-purple-400">12</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Teachers:</span>
                          <span className="font-bold text-orange-400">84</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">User Management</h3>
                      <div className="space-y-2">
                        <Button className="w-full bg-green-500 hover:bg-green-600">
                          Add New User
                        </Button>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600">
                          Manage Roles
                        </Button>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600">
                          User Permissions
                        </Button>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
                          Bulk User Import
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Password Policy</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="minLength">Minimum Length</Label>
                          <Input
                            id="minLength"
                            type="number"
                            defaultValue="8"
                            className="bg-[#1A1F2C] dark:bg-white border-gray-600 dark:border-gray-300"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="requireSpecialChars" defaultChecked />
                          <Label htmlFor="requireSpecialChars">Require special characters</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="requireNumbers" defaultChecked />
                          <Label htmlFor="requireNumbers">Require numbers</Label>
                        </div>
                        <Button className="w-full bg-green-500 hover:bg-green-600">
                          Update Policy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Security Features</h3>
                      <div className="space-y-2">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600">
                          Two-Factor Authentication
                        </Button>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600">
                          Session Management
                        </Button>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
                          Security Audit Log
                        </Button>
                        <Button className="w-full bg-red-500 hover:bg-red-600">
                          Backup & Recovery
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="newStudentEmail">New Student Registration</Label>
                          <input type="checkbox" id="newStudentEmail" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="gradeUpdatesEmail">Grade Updates</Label>
                          <input type="checkbox" id="gradeUpdatesEmail" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="attendanceEmail">Attendance Alerts</Label>
                          <input type="checkbox" id="attendanceEmail" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="emergencyEmail">Emergency Notifications</Label>
                          <input type="checkbox" id="emergencyEmail" defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">SMS Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="emergencySMS">Emergency Alerts</Label>
                          <input type="checkbox" id="emergencySMS" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="attendanceSMS">Attendance Alerts</Label>
                          <input type="checkbox" id="attendanceSMS" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="reminderSMS">Event Reminders</Label>
                          <input type="checkbox" id="reminderSMS" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="gradeSMS">Grade Notifications</Label>
                          <input type="checkbox" id="gradeSMS" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full bg-green-500 hover:bg-green-600">
                    Save Notification Preferences
                  </Button>
                </div>
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
