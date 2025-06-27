
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, BarChart3, FileText, TrendingUp, Download, Calendar, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async (reportType: string) => {
    setLoading(true);
    try {
      toast({
        title: "Generating Report",
        description: `${reportType} report is being generated...`,
      });
      
      // Simulate API call
      setTimeout(() => {
        toast({
          title: "Success",
          description: `${reportType} report generated successfully!`,
        });
        setLoading(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      toast({
        title: "Exporting Report",
        description: "Report is being exported to PDF...",
      });
      
      // Simulate export
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Report exported successfully!",
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyticsView = async (analyticsType: string) => {
    try {
      toast({
        title: "Loading Analytics",
        description: `Loading ${analyticsType} analytics...`,
      });
      
      setTimeout(() => {
        toast({
          title: "Success",
          description: `${analyticsType} analytics loaded successfully!`,
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics. Please try again.",
        variant: "destructive",
      });
    }
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
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Generate reports and view analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={handleExportReport}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-400">156</div>
              <p className="text-gray-400 dark:text-gray-600">Total Reports</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-400">24</div>
              <p className="text-gray-400 dark:text-gray-600">This Month</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-400">89%</div>
              <p className="text-gray-400 dark:text-gray-600">Completion Rate</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-orange-400">12</div>
              <p className="text-gray-400 dark:text-gray-600">Scheduled</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="academic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="academic">Academic Reports</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Reports</TabsTrigger>
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="academic">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Academic Performance Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold mb-2">Grade Analysis</div>
                      <p className="text-sm text-gray-400 mb-4">Class-wise performance analysis</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        onClick={() => handleGenerateReport('Grade Analysis')}
                        disabled={loading}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold mb-2">Subject Reports</div>
                      <p className="text-sm text-gray-400 mb-4">Subject-wise analysis</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={() => handleGenerateReport('Subject Reports')}
                        disabled={loading}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold mb-2">Progress Cards</div>
                      <p className="text-sm text-gray-400 mb-4">Student progress tracking</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-purple-500 hover:bg-purple-600"
                        onClick={() => handleGenerateReport('Progress Cards')}
                        disabled={loading}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={() => handleGenerateReport('Semester Report')}
                      disabled={loading}
                    >
                      Semester Reports
                    </Button>
                    <Button 
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleGenerateReport('Annual Report')}
                      disabled={loading}
                    >
                      Annual Reports
                    </Button>
                    <Button 
                      className="bg-purple-500 hover:bg-purple-600"
                      onClick={() => handleGenerateReport('Comparative Analysis')}
                      disabled={loading}
                    >
                      Comparative Analysis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Attendance Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold mb-2">Daily Attendance</div>
                      <p className="text-sm text-gray-400 mb-4">Daily attendance summary</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        onClick={() => handleGenerateReport('Daily Attendance')}
                        disabled={loading}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold mb-2">Monthly Report</div>
                      <p className="text-sm text-gray-400 mb-4">Monthly attendance trends</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={() => handleGenerateReport('Monthly Attendance')}
                        disabled={loading}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold mb-2">Staff Attendance</div>
                      <p className="text-sm text-gray-400 mb-4">Staff attendance tracking</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-purple-500 hover:bg-purple-600"
                        onClick={() => handleGenerateReport('Staff Attendance')}
                        disabled={loading}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold mb-2">Fee Collection</div>
                      <p className="text-sm text-gray-400 mb-4">Fee collection summary</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        onClick={() => handleGenerateReport('Fee Collection')}
                        disabled={loading}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold mb-2">Outstanding Dues</div>
                      <p className="text-sm text-gray-400 mb-4">Pending payments report</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        onClick={() => handleGenerateReport('Outstanding Dues')}
                        disabled={loading}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold mb-2">Revenue Analysis</div>
                      <p className="text-sm text-gray-400 mb-4">Monthly revenue trends</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={() => handleGenerateReport('Revenue Analysis')}
                        disabled={loading}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Advanced Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Performance Analytics</h3>
                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-blue-500 hover:bg-blue-600"
                          onClick={() => handleAnalyticsView('Student Performance')}
                        >
                          Student Performance Trends
                        </Button>
                        <Button 
                          className="w-full bg-green-500 hover:bg-green-600"
                          onClick={() => handleAnalyticsView('Class Performance')}
                        >
                          Class Performance Comparison
                        </Button>
                        <Button 
                          className="w-full bg-purple-500 hover:bg-purple-600"
                          onClick={() => handleAnalyticsView('Subject Analytics')}
                        >
                          Subject-wise Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Operational Analytics</h3>
                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          onClick={() => handleAnalyticsView('Attendance Analytics')}
                        >
                          Attendance Patterns
                        </Button>
                        <Button 
                          className="w-full bg-pink-500 hover:bg-pink-600"
                          onClick={() => handleAnalyticsView('Financial Analytics')}
                        >
                          Financial Trends
                        </Button>
                        <Button 
                          className="w-full bg-indigo-500 hover:bg-indigo-600"
                          onClick={() => handleAnalyticsView('Resource Utilization')}
                        >
                          Resource Utilization
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Quick Insights</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">95%</div>
                      <p className="text-sm text-gray-400">Average Attendance</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">3.7</div>
                      <p className="text-sm text-gray-400">Average GPA</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">89%</div>
                      <p className="text-sm text-gray-400">Fee Collection</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-400">24</div>
                      <p className="text-sm text-gray-400">Active Programs</p>
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
