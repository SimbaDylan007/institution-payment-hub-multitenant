// src/components/forms/StudentForm.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";

// --- UPDATED INTERFACES ---
interface Category {
    id: number;
    name: string;
}

interface Student {
    id?: number;
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    currentGrade: string;
    section?: string;
    dateOfBirth: string;
    gender: string;
    address?: string;
    enrollmentDate: string;
    enrollmentStatus: string;
    category: Category; // Now an object
}

// Updated FormData to handle categoryId
interface StudentFormData extends Omit<Partial<Student>, 'category'> {
    categoryId?: string;
}

interface StudentFormProps {
    student?: Student | null;
    onSave: () => void;
    onCancel: () => void;
}

const initialFormData: StudentFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentGrade: "",
    section: "",
    dateOfBirth: "",
    gender: "Male",
    address: "",
    enrollmentDate: new Date().toISOString().split('T')[0],
    enrollmentStatus: "ACTIVE",
    categoryId: "", // Default to empty, user must select
};

export default function StudentForm({ student, onSave, onCancel }: StudentFormProps) {
    const [formData, setFormData] = useState<StudentFormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    // --- NEW STATE for dynamic categories ---
    const [categories, setCategories] = useState<Category[]>([]);

    // --- NEW useEffect to fetch categories ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiFetch('http://pachedujuniorschool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/student-categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                    if (!student) {
                        // Set default category for new students once categories are loaded
                        setFormData(prev => ({ ...prev, categoryId: String(data[0]?.id || '') }));
                    }
                } else {
                    toast.error("Could not load student categories.");
                }
            } catch (error) {
                // Error is handled by apiFetch
            }
        };
        fetchCategories();
    }, [student]);


    useEffect(() => {
        if (student) {
            setFormData({
                ...student,
                dateOfBirth: student.dateOfBirth || "",
                enrollmentDate: student.enrollmentDate || new Date().toISOString().split('T')[0],
                // Set the categoryId from the nested student object
                categoryId: String(student.category?.id || ''),
            });
        } else {
            // Reset form, but wait for categories to load for default
            setFormData(initialFormData);
        }
    }, [student]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.categoryId) {
            toast.error("Please fill in all required fields marked with *.");
            setLoading(false);
            return;
        }

        // Prepare data for the backend, converting categoryId back to a nested object
        const payload = {
            ...formData,
            category: {
                id: Number(formData.categoryId)
            }
        };
        delete (payload as any).categoryId; // Clean up the temporary field

        try {
            const url = student ? `http://pachedujuniorschool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/students/${student.id}` : 'http://pachedujuniorschool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/students';
            const method = student ? 'PUT' : 'POST';

            const response = await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "An unknown server error occurred." }));
                throw new Error(errorData.message || "Failed to save student data.");
            }
            toast.success(`Student data successfully ${student ? 'updated' : 'created'}.`);
            onSave();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="firstName">First Name *</Label><Input id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} required className="bg-gray-800" /></div>
                <div><Label htmlFor="lastName">Last Name *</Label><Input id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} required className="bg-gray-800" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {student && (
                    <div>
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input id="studentId" name="studentId" value={formData.studentId || ''} readOnly disabled className="bg-gray-900 border-gray-700 cursor-not-allowed" />
                    </div>
                )}
                <div className={student ? "" : "col-span-2"}>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} required className="bg-gray-800" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="currentGrade">Grade</Label><Input id="currentGrade" name="currentGrade" value={formData.currentGrade || ''} onChange={handleInputChange} className="bg-gray-800" /></div>
                <div><Label htmlFor="section">Section</Label><Input id="section" name="section" value={formData.section || ''} onChange={handleInputChange} className="bg-gray-800" /></div>
            </div>
            <div><Label htmlFor="address">Address</Label><Textarea id="address" name="address" value={formData.address || ''} onChange={handleInputChange} className="bg-gray-800" rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="bg-gray-800" /></div>
                <div><Label htmlFor="dateOfBirth">Date of Birth</Label><Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleInputChange} className="bg-gray-800" /></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label>Gender</Label>
                    <Select name="gender" value={formData.gender} onValueChange={(v) => handleSelectChange('gender', v)}>
                        <SelectTrigger className="bg-gray-800"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 text-white"><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Enrollment Status</Label>
                    <Select name="enrollmentStatus" value={formData.enrollmentStatus} onValueChange={(v) => handleSelectChange('enrollmentStatus', v)}>
                        <SelectTrigger className="bg-gray-800"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 text-white"><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem><SelectItem value="GRADUATED">Graduated</SelectItem></SelectContent>
                    </Select>
                </div>

                {/* --- DYNAMIC CATEGORY DROPDOWN --- */}
                <div>
                    <Label>Student Category *</Label>
                    <Select name="categoryId" value={formData.categoryId} onValueChange={(v) => handleSelectChange('categoryId', v)} required>
                        <SelectTrigger className="bg-gray-800"><SelectValue placeholder="Select a category..." /></SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 text-white">
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? (student ? 'Updating...' : 'Adding...') : (student ? 'Update Student' : 'Add Student')}</Button>
            </div>
        </form>
    );
}