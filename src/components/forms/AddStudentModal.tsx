import React, { useState, useEffect, FC } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import InstitutionSelect from "./InstitutionSelect";
import { Student, StudentCategory as Category } from "@/types";

// Define the shape of the form's state object
interface StudentFormData extends Omit<Partial<Student>, 'category'> {
    categoryId?: string;
}

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Define the initial clean state for the form
const initialFormData: StudentFormData = {
    firstName: "", lastName: "", studentId: "", email: "", phone: "",
    dateOfBirth: "", gender: "MALE", address: "",
    enrollmentStatus: "ACTIVE",
    enrollmentDate: new Date().toISOString().split('T')[0],
    currentGrade: "", section: "", categoryId: ""
};

const AddStudentModal: FC<AddStudentModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { isSuperAdmin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<StudentFormData>(initialFormData);
    const [categories, setCategories] = useState<Category[]>([]);

    // State for the super-admin's institution selection
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');

    // Fetch categories when the modal opens or when a super-admin changes the selected institution
    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                const params = new URLSearchParams();
                if (isSuperAdmin && selectedInstitutionId) {
                    params.append('institutionId', selectedInstitutionId);
                }
                // For regular admins, the backend's automatic tenant filter will apply

                try {
                    const response = await apiFetch(`/api/student-categories?${params.toString()}`);
                    if (response.ok) {
                        const data = await response.json();
                        setCategories(data);
                        // Set a default category if creating a new student and categories have loaded
                        if (data.length > 0) {
                            setFormData(prev => ({ ...prev, categoryId: String(data[0].id) }));
                        }
                    } else {
                        toast.error("Could not load student categories.");
                    }
                } catch (error) { /* Error is handled by apiFetch */ }
            };
            fetchCategories();
        }
    }, [isOpen, isSuperAdmin, selectedInstitutionId]);

    // Reset form state completely when the dialog is closed
    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormData);
            setSelectedInstitutionId('');
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.categoryId) {
            toast.error("Please fill in all required fields.");
            setIsLoading(false);
            return;
        }

        if (isSuperAdmin && !selectedInstitutionId) {
            toast.error("As a Super Admin, you must select an institution.");
            setIsLoading(false);
            return;
        }

        const payload: any = {
            ...formData,
            category: { id: Number(formData.categoryId) }
        };
        delete payload.categoryId;

        if (isSuperAdmin) {
            payload.institutionId = parseInt(selectedInstitutionId);
        }

        try {
            const response = await apiFetch('/api/students', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to add student."}));
                throw new Error(errorData.message);
            }

            toast.success("Student added successfully");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-[#1A1F2C] text-white border-gray-800">
                <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">

                    <InstitutionSelect
                        value={selectedInstitutionId}
                        onValueChange={setSelectedInstitutionId}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="firstName">First Name *</Label><Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="bg-[#252e3e] border-gray-700"/></div>
                        <div><Label htmlFor="lastName">Last Name *</Label><Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="bg-[#252e3e] border-gray-700"/></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="studentId">Student ID (auto-generated)</Label><Input id="studentId" readOnly disabled className="bg-[#1A1F2C] cursor-not-allowed"/></div>
                        <div><Label htmlFor="email">Email *</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className="bg-[#252e3e] border-gray-700"/></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="dateOfBirth">Date of Birth</Label><Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} className="bg-[#252e3e] border-gray-700"/></div>
                        <div><Label htmlFor="gender">Gender</Label><Select name="gender" value={formData.gender} onValueChange={(v) => handleSelectChange('gender', v)}><SelectTrigger className="bg-[#252e3e] border-gray-700"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="MALE">Male</SelectItem><SelectItem value="FEMALE">Female</SelectItem></SelectContent></Select></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="currentGrade">Grade *</Label>
                            <Select value={formData.currentGrade} onValueChange={(value) => handleSelectChange('currentGrade', value)}>
                                <SelectTrigger className="bg-[#252e3e] border-gray-700"><SelectValue placeholder="Select grade" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GRADE 1">Grade 1</SelectItem>
                                    <SelectItem value="GRADE 2">Grade 2</SelectItem>
                                    <SelectItem value="GRADE 3">Grade 3</SelectItem>
                                    <SelectItem value="GRADE 4">Grade 4</SelectItem>
                                    <SelectItem value="GRADE 5">Grade 5</SelectItem>
                                    <SelectItem value="GRADE 6">Grade 6</SelectItem>
                                    <SelectItem value="GRADE 7">Grade 7</SelectItem>
                                    <SelectItem value="ECD A">ECD A</SelectItem>
                                    <SelectItem value="ECD B">ECD B</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div><Label htmlFor="section">Section</Label><Input id="section" name="section" value={formData.section} onChange={handleInputChange} className="bg-[#252e3e] border-gray-700"/></div>
                        <div><Label>Student Category *</Label><Select name="categoryId" value={formData.categoryId} onValueChange={(v) => handleSelectChange('categoryId', v)} required><SelectTrigger className="bg-[#252e3e] border-gray-700"><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>))}</SelectContent></Select></div>
                    </div>

                    <div><Label htmlFor="address">Address</Label><Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} className="bg-[#252e3e] border-gray-700" rows={2}/></div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="bg-green-500 hover:bg-green-600">{isLoading ? "Adding..." : "Add Student"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};