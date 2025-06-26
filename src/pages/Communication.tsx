import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, MessageSquare, Mail, Bell, Send, Plus, Users, FileText } from "lucide-react";
import NewMessageModal from "@/components/forms/NewMessageModal";

export default function Communication() {
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
            <h1 className="text-2xl font-bold">Communication Center</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Manage messages, announcements, and notifications
            </p>
          </div>
          <div className="flex gap-2">
            <NewMessageModal />
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
        </div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Internal Messaging System
                </CardTitle>
                <div className="flex gap-2">
                  <NewMessageModal />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Features</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Staff-to-staff messaging</li>
                        <li>• Staff-to-parent communication</li>
                        <li>• Group messaging</li>
                        <li>• Message history</li>
                        <li>• Read receipts</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Message Stats</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Inbox:</span>
                          <span className="font-bold text-blue-400">24</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unread:</span>
                          <span className="font-bold text-red-400">8</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sent:</span>
                          <span className="font-bold text-green-400">156</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Recent Messages</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <div>
                        <span className="font-medium">Sarah Johnson</span>
                        <p className="text-sm text-gray-400">Parent meeting request</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-sm text-blue-400">2h ago</span>
                        <Button size="sm" variant="outline">Reply</Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <div>
                        <span className="font-medium">Math Department</span>
                        <p className="text-sm text-gray-400">Curriculum update discussion</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-sm text-green-400">5h ago</span>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  School Announcements Management
                </CardTitle>
                <div className="flex gap-2">
                  <Button className="bg-green-500 hover:bg-green-600">
                    <Plus className="h-4 w-4 mr-2" />
                    New Announcement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-400">12</div>
                      <p className="text-sm text-gray-400">Active Announcements</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-400">156</div>
                      <p className="text-sm text-gray-400">Total Views</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-purple-400">3</div>
                      <p className="text-sm text-gray-400">Urgent</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Recent Announcements</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <div>
                        <span className="font-medium">School Closure - Weather Alert</span>
                        <p className="text-sm text-gray-400">Posted 2 hours ago</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-sm bg-red-500 text-white px-2 py-1 rounded text-xs">URGENT</span>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <div>
                        <span className="font-medium">Parent-Teacher Conference Schedule</span>
                        <p className="text-sm text-gray-400">Posted yesterday</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded text-xs">INFO</span>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email & SMS Notification System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Email Notifications</h3>
                      <div className="space-y-2">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600">
                          Send Email Blast
                        </Button>
                        <Button className="w-full bg-green-500 hover:bg-green-600">
                          View Email Templates
                        </Button>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600">
                          Email Reports
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">SMS Notifications</h3>
                      <div className="space-y-2">
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
                          Send SMS Alert
                        </Button>
                        <Button className="w-full bg-red-500 hover:bg-red-600">
                          Emergency Broadcast
                        </Button>
                        <Button className="w-full bg-indigo-500 hover:bg-indigo-600">
                          SMS Reports
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Notification Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">1,234</div>
                      <p className="text-sm text-gray-400">Emails Sent</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">567</div>
                      <p className="text-sm text-gray-400">SMS Sent</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">89%</div>
                      <p className="text-sm text-gray-400">Delivery Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">45%</div>
                      <p className="text-sm text-gray-400">Open Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle>Message Templates Management</CardTitle>
                <div className="flex gap-2">
                  <Button className="bg-green-500 hover:bg-green-600">
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Available Templates</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <div>
                        <span className="font-medium">Parent Meeting Request</span>
                        <p className="text-sm text-gray-400">Email template for scheduling meetings</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Use</Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <div>
                        <span className="font-medium">Emergency Alert</span>
                        <p className="text-sm text-gray-400">SMS template for urgent notifications</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Use</Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <div>
                        <span className="font-medium">Grade Report</span>
                        <p className="text-sm text-gray-400">Email template for grade notifications</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Use</Button>
                      </div>
                    </div>
                  </div>
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
