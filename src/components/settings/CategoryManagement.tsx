// src/components/settings/CategoryManagement.tsx

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookCopy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiClient';

// Interface for the category object from the backend
interface Category {
    id: number;
    name: string;
}

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [loading, setLoading] = useState(false);

    // --- Fetches all categories from the backend ---
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiFetch('http://pachedujuniorschool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/student-categories');
            if (response.ok) {
                setCategories(await response.json());
            } else {
                toast.error("Failed to fetch student categories.");
            }
        } catch (error) {
            // Generic network/auth errors are handled by apiFetch
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // --- Handles adding a new category ---
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.warning("Category name cannot be empty.");
            return;
        }
        setLoading(true);
        try {
            const response = await apiFetch('http://pachedujuniorschool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/student-categories', {
                method: 'POST',
                body: JSON.stringify({ name: newCategoryName.trim() }),
            });
            if (response.ok) {
                toast.success(`Category "${newCategoryName.trim()}" added successfully.`);
                setNewCategoryName(""); // Clear the input field
                fetchCategories(); // Refresh the list
            } else {
                toast.error("Failed to add category. It may already exist.");
            }
        } catch (error) {
            // Handled by apiFetch
        } finally {
            setLoading(false);
        }
    };

    // --- Handles deleting a category ---
    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) return;
        setLoading(true);
        try {
            const response = await apiFetch(`http://pachedujuniorschool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/student-categories/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("Category deleted successfully.");
                fetchCategories(); // Refresh the list
            } else {
                toast.error("Failed to delete category. It might be in use by students.");
            }
        } catch (error) {
            // Handled by apiFetch
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white"><BookCopy />Student Category Management</CardTitle>
                <p className="text-gray-300 text-sm">Add or remove student categories like 'Day', 'Boarder', etc.</p>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder="New category name (e.g., International)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="bg-gray-800 border-gray-600"
                        disabled={loading}
                    />
                    <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Category'}
                    </Button>
                </div>
                <div className="overflow-x-auto max-h-60 border border-purple-800 rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-purple-700 hover:bg-transparent">
                                <TableHead className="text-purple-300">Category Name</TableHead>
                                <TableHead className="text-right text-purple-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && !categories.length ? (
                                <TableRow><TableCell colSpan={2} className="text-center py-4 text-gray-400">Loading...</TableCell></TableRow>
                            ) : categories.length === 0 ? (
                                <TableRow><TableCell colSpan={2} className="text-center py-4 text-gray-400">No categories found. Add one above.</TableCell></TableRow>
                            ) : (
                                categories.map(cat => (
                                    <TableRow key={cat.id} className="border-gray-800">
                                        <TableCell className="font-medium text-white">{cat.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(cat.id)} disabled={loading}>
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}