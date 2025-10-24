import React, { useState, useEffect, FC } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import InstitutionSelect from "./InstitutionSelect";
import { Student, StudentCategory as Category } from "@/types";

interface StudentFormData extends Omit<Partial<Student>, 'category'> {
    categoryId?: string;
}

interface StudentFormProps {
    student?: Student | null;
    onSave: () => void;
    onCancel: () => void;
}

const initialFormData: StudentFormData = {
    firstName: "", lastName: "", email: "", phone: "", currentGrade: "",
    section: "", dateOfBirth: "", gender: "Male", address: "",
    enrollmentDate: new Date().toISOString().split('T')[0],
    enrollmentStatus: "ACTIVE", categoryId: "",
};

const StudentForm: FC<StudentFormProps> = ({ student, onSave, onCancel }) => {
    const { isSuperAdmin, selectedInstitution } = useAuth(); // <-- Get tenancy context
    const [formData, setFormData] = useState<StudentFormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // State for the super-admin's institution selection
    const [formInstitutionId, setFormInstitutionId] = useState<string>('');

    useEffect(() => {
        const fetchCategories = async () => {
            const params = new URLSearchParams();
            // If super-admin is using the form to create a student, filter categories by the selected institution
            if (isSuperAdmin && formInstitutionId) {
                params.append('institutionId', formInstitutionId);
            }
            // For regular admins, the backend filter will apply automatically

            try {
                const response = await apiFetch(`http://194.163.141.113:8082/api/student-categories?${params.toString()}`);
                if (response.ok) {
                    setCategories(await response.json());
                } else {
                    toast.error("Could not load student categories.");
                }
            } catch (error) { /* Handled by apiFetch */ }
        };

        // Fetch categories when the component mounts or when the super-admin changes the selected institution in the form
        fetchCategories();
    }, [isSuperAdmin, formInstitutionId]);

    useEffect(() => {
        if (student) {
            setFormData({
                ...student,
                categoryId: String(student.category?.id || ''),
            });
            // If editing, set the initial institution ID for the dropdown
            if (isSuperAdmin && student.institution) {
                setFormInstitutionId(student.institution.id.toString());
            }
        } else {
            setFormData(initialFormData);
            // If super admin is creating, don't set a default. If a regular admin is creating, it's handled by backend.
            setFormInstitutionId('');
        }
    }, [student, isSuperAdmin]);

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

        // --- TENANCY LOGIC ---
        const payload: any = {
            ...formData,
            category: { id: Number(formData.categoryId) }
        };
        delete payload.categoryId;

        if (isSuperAdmin && !student?.id) { // Only on creation for super-admin
            if (!formInstitutionId) {
                toast.error("As a Super Admin, you must select an institution.");
                setLoading(false);
                return;
            }
            payload.institutionId = parseInt(formInstitutionId);
        }

        try {
            const url = student ? `http://194.163.141.113:8082/api/students/${student.id}` : 'http://194.163.141.113:8082/api/students';
            const method = student ? 'PUT' : 'POST';

            const response = await apiFetch(url, { method, body: JSON.stringify(payload) });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to save student data." }));
                throw new Error(errorData.message);
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

            {/* Conditionally render the InstitutionSelect for super-admins creating a new student */}
            {!student?.id && (
                <InstitutionSelect
                    value={formInstitutionId}
                    onValueChange={setFormInstitutionId}
                />
            )}

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

export default StudentForm;