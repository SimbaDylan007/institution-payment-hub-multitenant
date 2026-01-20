import React, { useState, useEffect, FC } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import InstitutionSelect from "./InstitutionSelect";
import { Staff } from "@/types";

interface AddStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Updated initial state to include all fields
const initialFormData: Partial<Staff> = {
    firstName: "", lastName: "", employeeId: "", email: "", phone: "",
    dateOfBirth: "", gender: "MALE", // Default value
    address: "", hireDate: new Date().toISOString().split('T')[0],
    department: "", position: "", employmentStatus: "ACTIVE", salary: "",
    qualifications: "", specializations: ""
};

const AddStaffModal: FC<AddStaffModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { isSuperAdmin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');

    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormData);
            setSelectedInstitutionId('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (isSuperAdmin && !selectedInstitutionId) {
            toast.error("As a Super Admin, you must select an institution.");
            setIsLoading(false);
            return;
        }

        const payload: any = {
            ...formData,
            salary: formData.salary ? parseFloat(String(formData.salary)) : undefined
        };

        if (isSuperAdmin) {
            payload.institutionId = parseInt(selectedInstitutionId);
        }

        try {
            const response = await apiFetch('/api/staff', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to add staff member."}));
                throw new Error(errorData.message);
            }

            toast.success("Staff member added successfully");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error((error as Error).message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-[#1A1F2C] text-white border-gray-800">
                <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">

                    <InstitutionSelect
                        value={selectedInstitutionId}
                        onValueChange={setSelectedInstitutionId}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="firstName">First Name *</Label><Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required className="bg-[#252e3e] border-gray-700"/></div>
                        <div><Label htmlFor="lastName">Last Name *</Label><Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required className="bg-[#252e3e] border-gray-700"/></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="employeeId">Employee ID (auto)</Label><Input id="employeeId" value={formData.employeeId} readOnly disabled className="bg-[#1A1F2C] cursor-not-allowed"/></div>
                        <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="bg-[#252e3e] border-gray-700"/></div>
                    </div>

                    {/* --- ADDED FORM FIELDS FOR GENDER and DOB --- */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="bg-[#252e3e] border-gray-700" />
                        </div>
                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                                <SelectTrigger className="bg-[#252e3e] border-gray-700"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

          <div>
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-500 hover:bg-green-600">
              {isLoading ? "Adding..." : "Add Staff Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
