
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, BarChart3, FileText, TrendingUp, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerateReport = async (reportType: string) => {
    try {
      toast({
        title: "Generating Report",
        description: `${reportType} report is being generated...`,
      });
      
      // Simulate report generation
      setTimeout(() => {
        toast({
          title: "Success",
          description: `${reportType} report generated successfully!`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportReport = () => {
    toast({
      title: "Exporting Report",
      description: "Report is being exported to PDF...",
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
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Generate reports and view analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={handleExportReport}
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

        <Tabs defaultValue="academic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="academic">Academic Reports</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Reports</TabsTrigger>
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
            <TabsTrigger value="custom">Custom Reports</TabsTrigger>
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
                      <div className="text-lg font-semibold">Grade Analysis</div>
                      <p className="text-sm text-gray-400">Class-wise performance</p>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleGenerateReport('Grade Analysis')}
                      >
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold">Subject Reports</div>
                      <p className="text-sm text-gray-400">Subject-wise analysis</p>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleGenerateReport('Subject Reports')}
                      >
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold">Progress Cards</div>
                      <p className="text-sm text-gray-400">Student progress</p>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleGenerateReport('Progress Cards')}
                      >
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attendance Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold">Daily Attendance</div>
                      <p className="text-sm text-gray-400">Daily attendance summary</p>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleGenerateReport('Daily Attendance')}
                      >
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold">Monthly Report</div>
                      <p className="text-sm text-gray-400">Monthly attendance trends</p>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleGenerateReport('Monthly Attendance')}
                      >
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold">Absenteeism</div>
                      <p className="text-sm text-gray-400">Chronic absenteeism report</p>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleGenerateReport('Absenteeism Report')}
                      >
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
                  <TrendingUp className="h-5 w-5" />
                  Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold">Fee Collection</div>
                      <p className="text-sm text-gray-400">Fee collection summary</p>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleGenerateReport('Fee Collection')}
                      >
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold">Outstanding Dues</div>
                      <p className="text-sm text-gray-400">Pending payments report</p>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleGenerateReport('Outstanding Dues')}
                      >
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-lg font-semibold">Revenue Analysis</div>
                      <p className="text-sm text-gray-400">Monthly revenue trends</p>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleGenerateReport('Revenue Analysis')}
                      >
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle>Custom Report Builder</CardTitle>
                <Button 
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => handleGenerateReport('Custom Report')}
                >
                  Build Custom Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Advanced report builder for creating custom reports with filters and parameters.</p>
                  <div className="mt-4 space-y-2">
                    <Button className="w-full max-w-xs bg-blue-500 hover:bg-blue-600">
                      Create New Report
                    </Button>
                    <Button className="w-full max-w-xs bg-purple-500 hover:bg-purple-600">
                      Saved Templates
                    </Button>
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
