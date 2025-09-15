// src/pages/Settings.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Home, Users, Edit, Trash2, Key, UserPlus, ShieldPlus, BookCopy } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import { AddUserModal } from "@/components/forms/AddUserModal";
import { ManageRolesModal } from "@/components/forms/ManageRolesModal";
import { AssignRolesModal } from "@/components/forms/AssignRolesModal";

// --- Interfaces ---
interface Role { id: number; name: string; }
interface User { id: number; username: string; email: string; enabled: boolean; roles: Role[]; }
interface UserStats { totalUsers: number; activeUsers: number; administrators: number; teachers: number; }
// --- NEW: Interface for Student Category ---
interface Category { id: number; name: string; }

// --- NEW: Category Management Component ---
const CategoryManagement = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiFetch('http://pachedujuniorschool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/student-categories');
            if (response.ok) {
                setCategories(await response.json());
            } else {
                toast.error("Failed to fetch student categories.");
            }
        } catch (error) { /* Handled by apiFetch */ } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.warning("Category name cannot be empty.");
            return;
        }
        try {
            const response = await apiFetch('http://pachedujuniorschool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/student-categories', {
                method: 'POST',
                body: JSON.stringify({ name: newCategoryName }),
            });
            if (response.ok) {
                toast.success(`Category "${newCategoryName}" added successfully.`);
                setNewCategoryName("");
                fetchCategories(); // Refresh the list
            } else {
                toast.error("Failed to add category. It may already exist.");
            }
        } catch (error) { /* Handled by apiFetch */ }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this category? This cannot be undone if students are assigned to it.")) return;
        try {
            const response = await apiFetch(`http://pachedujuniorschool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/student-categories/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("Category deleted successfully.");
                fetchCategories(); // Refresh the list
            } else {
                toast.error("Failed to delete category. It might be in use by students.");
            }
        } catch (error) { /* Handled by apiFetch */ }
    };

    return (
        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookCopy />Student Category Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder="New category name (e.g., International)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="bg-gray-800 border-gray-600"
                    />
                    <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700">Add Category</Button>
                </div>
                <div className="overflow-x-auto max-h-60">
                    <Table>
                        <TableHeader><TableRow className="border-gray-700 hover:bg-transparent"><TableHead>Category Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {loading && <TableRow><TableCell colSpan={2} className="text-center py-4">Loading...</TableCell></TableRow>}
                            {!loading && categories.map(cat => (
                                <TableRow key={cat.id} className="border-gray-800">
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(cat.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};


export default function Settings() {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isManageRolesModalOpen, setIsManageRolesModalOpen] = useState(false);
    const [isAssignRolesModalOpen, setIsAssignRolesModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes] = await Promise.all([
                apiFetch('http://pachedujuniorschool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/users/statistics'),
                apiFetch('http://pachedujuniorschool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/users')
            ]);
            if (statsRes.ok) setStats(await statsRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
            if (!statsRes.ok || !usersRes.ok) toast.error("Failed to load user management data.");
        } catch (error) { /* Handled by apiFetch */ } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (user?.role === 'ADMIN') fetchData();
    }, [user, fetchData]);

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const response = await apiFetch(`http://pachedujuniorschool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/users/${userId}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("User deleted.");
                fetchData();
            } else {
                toast.error("Failed to delete user.");
            }
        } catch (error) { /* Handled by apiFetch */ }
    };

    if (!user) return <Navigate to="/" replace />;
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
                        <h1 className="text-2xl font-bold">System Settings</h1>
                        <p className="text-gray-300">Manage users, roles, and global configurations.</p>
                    </div>
                    <Button asChild className="bg-purple-600 hover:bg-purple-700"><Link to="/dashboard" className="flex items-center gap-2"><Home className="h-4 w-4"/>Dashboard</Link></Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column for User Management */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
                                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddUserModalOpen(true)}><UserPlus className="h-4 w-4 mr-2"/>Add User</Button>
                                        <Button variant="outline" onClick={() => setIsManageRolesModalOpen(true)}><ShieldPlus className="h-4 w-4 mr-2"/>Manage Roles</Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader><TableRow className="border-gray-700 hover:bg-transparent"><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Roles</TableHead><TableHead>Status</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading users...</TableCell></TableRow> : users.map(u => (
                                                <TableRow key={u.id} className="border-gray-800">
                                                    <TableCell className="font-medium">{u.username}</TableCell>
                                                    <TableCell>{u.email}</TableCell>
                                                    <TableCell><div className="flex flex-wrap gap-1">{u.roles.map(role => <Badge key={role.id}>{role.name.replace('ROLE_', '')}</Badge>)}</div></TableCell>
                                                    <TableCell><Badge variant={u.enabled ? 'default' : 'destructive'}>{u.enabled ? 'Active' : 'Disabled'}</Badge></TableCell>
                                                    <TableCell className="text-center"><div className="flex gap-2 justify-center">
                                                        <Button size="sm" variant="outline" onClick={() => { setSelectedUser(u); setIsAssignRolesModalOpen(true); }}><Key className="h-4 w-4"/> Assign</Button>
                                                        <Button size="sm" variant="outline" onClick={() => { setSelectedUser(u); setIsAddUserModalOpen(true); }}><Edit className="h-4 w-4"/></Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.id)}><Trash2 className="h-4 w-4"/></Button>
                                                    </div></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column for New Management Panels */}
                    <div className="space-y-6">
                        <CategoryManagement />
                        {/* You can add more management cards here in the future */}
                    </div>
                </div>
            </main>

            {/* Modals */}
            <AddUserModal isOpen={isAddUserModalOpen} onClose={() => { setIsAddUserModalOpen(false); setSelectedUser(null); }} onSuccess={fetchData} userToEdit={selectedUser} />
            <ManageRolesModal isOpen={isManageRolesModalOpen} onClose={() => setIsManageRolesModalOpen(false)} />
            {selectedUser && ( <AssignRolesModal isOpen={isAssignRolesModalOpen} onClose={() => { setIsAssignRolesModalOpen(false); setSelectedUser(null); }} onSuccess={fetchData} user={selectedUser} /> )}
        </div>
    );
}

const StatCard = ({ title, value }: { title: string, value?: number }) => (
    <Card className="bg-purple-800/30 border-purple-700 col-span-1">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle></CardHeader>
        <CardContent><div className="text-2xl font-bold text-white">{value ?? <div className="h-8 w-12 bg-gray-600 rounded animate-pulse"/>}</div></CardContent>
    </Card>
);