// src/pages/Settings.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Edit, Trash2, Key, UserPlus, ShieldPlus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import { AddUserModal } from "@/components/forms/AddUserModal";
import { ManageRolesModal } from "@/components/forms/ManageRolesModal";
import { AssignRolesModal } from "@/components/forms/AssignRolesModal";

// --- Interfaces ---
interface Role { id: number; name: string; }
interface User { id: number; username: string; email: string; enabled: boolean; roles: Role[]; }
interface UserStats { totalUsers: number; activeUsers: number; administrators: number; teachers: number; }

export default function Settings() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isManageRolesModalOpen, setIsManageRolesModalOpen] = useState(false);
  const [isAssignRolesModalOpen, setIsAssignRolesModalOpen] = useState(false);

  // State for selected user to edit or assign roles
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        apiFetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/users/statistics'),
        apiFetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/users')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());

      if (!statsRes.ok || !usersRes.ok) {
        toast.error("Failed to load user management data.");
      }
    } catch (error) {
      // apiFetch handles generic error toasts
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user, fetchData]);

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const response = await apiFetch(`http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/users/${userId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success("User deleted successfully.");
        fetchData(); // Refresh data
      } else {
        toast.error("Failed to delete user.");
      }
    } catch (error) { /* Handled by apiFetch */ }
  };

  if (!user) return <Navigate to="/" replace />;
  // This is a protected Admin page
  if (user.role !== 'ADMIN') {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
          <p className="mt-4">You do not have permission to view this page.</p>
          <Button asChild className="mt-6"><Link to="/dashboard">Go to Dashboard</Link></Button>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">User & Role Management</h1>
              <p className="text-gray-300">Create users, define roles, and manage permissions.</p>
            </div>
            <Button asChild className="bg-purple-600 hover:bg-purple-700"><Link to="/dashboard" className="flex items-center gap-2"><Home className="h-4 w-4"/>Dashboard</Link></Button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="Total Users" value={stats?.totalUsers} />
            <StatCard title="Active Users" value={stats?.activeUsers} />
            <StatCard title="Administrators" value={stats?.administrators} />
            <StatCard title="Teachers" value={stats?.teachers} />
          </div>

          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><Users/>System Users</CardTitle>
                <div className="flex gap-2">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddUserModalOpen(true)}><UserPlus className="h-4 w-4 mr-2"/>Add New User</Button>
                  <Button variant="outline" onClick={() => setIsManageRolesModalOpen(true)}><ShieldPlus className="h-4 w-4 mr-2"/>Manage All Roles</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-transparent">
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-8">Loading users...</TableCell></TableRow>
                    ) : (
                        users.map(u => (
                            <TableRow key={u.id} className="border-gray-800">
                              <TableCell className="font-medium">{u.username}</TableCell>
                              <TableCell>{u.email}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {u.roles.map(role => <Badge key={role.id}>{role.name.replace('ROLE_', '')}</Badge>)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={u.enabled ? 'default' : 'destructive'}>{u.enabled ? 'Active' : 'Disabled'}</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex gap-2 justify-center">
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedUser(u); setIsAssignRolesModalOpen(true); }}><Key className="h-4 w-4"/> Assign Roles</Button>
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedUser(u); setIsAddUserModalOpen(true); }}><Edit className="h-4 w-4"/></Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Modals */}
        <AddUserModal
            isOpen={isAddUserModalOpen}
            onClose={() => { setIsAddUserModalOpen(false); setSelectedUser(null); }}
            onSuccess={fetchData}
            userToEdit={selectedUser}
        />
        <ManageRolesModal
            isOpen={isManageRolesModalOpen}
            onClose={() => setIsManageRolesModalOpen(false)}
        />
        {selectedUser && (
            <AssignRolesModal
                isOpen={isAssignRolesModalOpen}
                onClose={() => { setIsAssignRolesModalOpen(false); setSelectedUser(null); }}
                onSuccess={fetchData}
                user={selectedUser}
            />
        )}
      </div>
  );
}

// Helper component for stat cards
const StatCard = ({ title, value }: { title: string, value?: number }) => (
    <Card className="bg-purple-800/30 border-purple-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value ?? <div className="h-8 w-12 bg-gray-600 rounded animate-pulse"/>}</div>
      </CardContent>
    </Card>
);