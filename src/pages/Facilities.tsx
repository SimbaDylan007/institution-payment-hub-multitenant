import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Building, Wrench, MapPin, Plus } from "lucide-react";
import AddFacilityModal from "@/components/forms/AddFacilityModal";

export default function Facilities() {
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
            <h1 className="text-2xl font-bold">Facilities Management</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Manage school infrastructure and resources
            </p>
          </div>
          <div className="flex gap-2">
            <AddFacilityModal />
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

        <Tabs defaultValue="rooms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rooms">Rooms & Spaces</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Rooms & Spaces Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-400">42</div>
                      <p className="text-sm text-gray-400">Classrooms</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-400">8</div>
                      <p className="text-sm text-gray-400">Laboratories</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-purple-400">15</div>
                      <p className="text-sm text-gray-400">Special Rooms</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Room and space management will be implemented here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Equipment Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Equipment inventory management will be implemented here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Maintenance tracking and scheduling will be implemented here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle>Facility Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Facility booking system will be implemented here.</p>
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
