
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, BarChart3, Download, FileText, TrendingUp, Users, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface ReportData {
  financialAnalytics: any;
  studentPerformance: any;
  attendanceAnalytics: any;
  resourceUtilization: any;
}

export default function Reports() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('financial');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [financial, performance, attendance, resources] = await Promise.all([
        fetch('http://localhost:8080/api/analytics/financial-analytics').then(res => res.json()).catch(() => ({})),
        fetch('http://localhost:8080/api/analytics/student-performance').then(res => res.json()).catch(() => ({})),
        fetch('http://localhost:8080/api/analytics/attendance-analytics').then(res => res.json()).catch(() => ({})),
        fetch('http://localhost:8080/api/analytics/resource-utilization').then(res => res.json()).catch(() => ({}))
      ]);

      setReportData({
        financialAnalytics: financial,
        studentPerformance: performance,
        attendanceAnalytics: attendance,
        resourceUtilization: resources
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: selectedReportType,
          period: selectedPeriod,
          format: 'PDF'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Report downloaded successfully');
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for visualization
  const mockFinancialData = [
    { month: 'Jan', revenue: 45000, expenses: 32000 },
    { month: 'Feb', revenue: 52000, expenses: 35000 },
    { month: 'Mar', revenue: 48000, expenses: 31000 },
    { month: 'Apr', revenue: 61000, expenses: 42000 },
    { month: 'May', revenue: 55000, expenses: 38000 },
    { month: 'Jun', revenue: 67000, expenses: 45000 }
  ];

  const mockStudentData = [
    { grade: 'Grade 1', students: 45, avgScore: 85 },
    { grade: 'Grade 2', students: 52, avgScore: 78 },
    { grade: 'Grade 3', students: 48, avgScore: 82 },
    { grade: 'Grade 4', students: 43, avgScore: 79 },
    { grade: 'Grade 5', students: 50, avgScore: 84 }
  ];

  const mockAttendanceData = [
    { name: 'Present', value: 85, color: '#10B981' },
    { name: 'Absent', value: 10, color: '#EF4444' },
    { name: 'Late', value: 5, color: '#F59E0B' }
  ];

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-gray-300">Generate comprehensive reports and view analytics</p>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2 items-center">
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger className="bg-purple-800 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-purple-800 border-purple-600">
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="academic">Academic Report</SelectItem>
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="bg-purple-800 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-purple-800 border-purple-600">
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={generateReport}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Download Report'}
              </Button>
            </div>
            <Button className="bg-purple-600 text-white hover:bg-purple-700" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-purple-900/50 border-purple-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-purple-600">Financial</TabsTrigger>
            <TabsTrigger value="academic" className="data-[state=active]:bg-purple-600">Academic</TabsTrigger>
            <TabsTrigger value="operational" className="data-[state=active]:bg-purple-600">Operational</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <DollarSign className="h-5 w-5" />
                    Financial Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockFinancialData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #6B7280',
                          borderRadius: '6px'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                      <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="h-5 w-5" />
                    Student Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockStudentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="grade" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #6B7280',
                          borderRadius: '6px'
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="avgScore" stroke="#8B5CF6" strokeWidth={2} name="Average Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5" />
                  Financial Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Revenue vs Expenses</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={mockFinancialData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #6B7280',
                            borderRadius: '6px'
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                        <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Key Metrics</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-800/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">$328,000</div>
                        <p className="text-sm text-gray-300">Total Revenue (YTD)</p>
                      </div>
                      <div className="p-4 bg-purple-800/30 rounded-lg">
                        <div className="text-2xl font-bold text-red-400">$223,000</div>
                        <p className="text-sm text-gray-300">Total Expenses (YTD)</p>
                      </div>
                      <div className="p-4 bg-purple-800/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">$105,000</div>
                        <p className="text-sm text-gray-300">Net Profit (YTD)</p>
                      </div>
                      <div className="p-4 bg-purple-800/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">32%</div>
                        <p className="text-sm text-gray-300">Profit Margin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                  Academic Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Grade-wise Performance</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={mockStudentData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="grade" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #6B7280',
                            borderRadius: '6px'
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="avgScore" fill="#8B5CF6" name="Average Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Attendance Distribution</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={mockAttendanceData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {mockAttendanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operational">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5" />
                  Operational Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                    <h3 className="font-semibold text-white mb-2">Staff Utilization</h3>
                    <p className="text-2xl font-bold text-blue-400">85%</p>
                    <p className="text-sm text-gray-300">Average capacity</p>
                  </div>
                  
                  <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                    <h3 className="font-semibold text-white mb-2">Resource Usage</h3>
                    <p className="text-2xl font-bold text-green-400">92%</p>
                    <p className="text-sm text-gray-300">Facility utilization</p>
                  </div>
                  
                  <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                    <h3 className="font-semibold text-white mb-2">System Efficiency</h3>
                    <p className="text-2xl font-bold text-purple-400">88%</p>
                    <p className="text-sm text-gray-300">Overall performance</p>
                  </div>
                  
                  <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                    <h3 className="font-semibold text-white mb-2">Library Usage</h3>
                    <p className="text-2xl font-bold text-amber-400">76%</p>
                    <p className="text-sm text-gray-300">Book circulation rate</p>
                  </div>
                  
                  <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                    <h3 className="font-semibold text-white mb-2">Event Participation</h3>
                    <p className="text-2xl font-bold text-rose-400">94%</p>
                    <p className="text-sm text-gray-300">Average attendance</p>
                  </div>
                  
                  <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                    <h3 className="font-semibold text-white mb-2">Parent Engagement</h3>
                    <p className="text-2xl font-bold text-cyan-400">82%</p>
                    <p className="text-sm text-gray-300">Communication rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-gradient-to-r from-purple-900 via-blue-900 to-black border-t border-purple-700 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-300">
          &copy; {new Date().getFullYear()} School Management System
        </div>
      </footer>
    </div>
  );
}
