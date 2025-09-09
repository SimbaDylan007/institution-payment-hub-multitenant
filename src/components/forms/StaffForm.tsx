// src/components/forms/StaffForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient"; // Use the central apiFetch

interface Staff {
  id?: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  employmentStatus: string;
  hireDate?: string; // Expect "YYYY-MM-DD" string from backend
  salary?: number;
  qualifications?: string;
  specializations?: string;
}

interface StaffFormProps {
  staff?: Staff | null; // Allow null for clarity
  onSuccess: () => void;
  onCancel: () => void;
}

// Initial state for creating a new staff member
const initialFormData: Partial<Staff> = {
  firstName: '',
  lastName: '',
  // employeeId is handled by the backend
  email: '',
  phone: '',
  address: '',
  department: 'ADMINISTRATION',
  position: '',
  employmentStatus: 'ACTIVE',
  hireDate: new Date().toISOString().split('T')[0],
  salary: 0,
  qualifications: '',
  specializations: ''
};

export default function StaffForm({ staff, onSuccess, onCancel }: StaffFormProps) {
  // Use Partial<Staff> to allow for an empty initial state
  const [formData, setFormData] = useState<Partial<Staff>>(initialFormData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staff) {
      // If editing, populate the form with the staff member's data.
      // The backend now sends hireDate as a "yyyy-MM-dd" string, which is exactly
      // what the <input type="date"> needs. No splitting required.
      setFormData({
        ...staff,
        hireDate: staff.hireDate || new Date().toISOString().split('T')[0],
      });
    } else {
      // If adding a new staff member, reset the form.
      setFormData(initialFormData);
    }
  }, [staff]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("First Name, Last Name, and Email are required.");
      setLoading(false);
      return;
    }

    try {
      const url = staff?.id ? `/api/staff/${staff.id}` : '/api/staff';
      const method = staff?.id ? 'PUT' : 'POST';

      const response = await apiFetch(url, { method, body: JSON.stringify(formData) });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "An unknown server error occurred." }));
        throw new Error(errorData.message);
      }

      toast.success(`Staff member successfully ${staff ? 'updated' : 'created'}.`);
      onSuccess();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
        {/* --- All inputs are now controlled and use dark theme classes --- */}
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="firstName">First Name *</Label><Input id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleChange} required className="bg-gray-800"/></div>
          <div><Label htmlFor="lastName">Last Name *</Label><Input id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleChange} required className="bg-gray-800"/></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Conditional rendering for Employee ID */}
          {staff && (
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input id="employeeId" name="employeeId" value={formData.employeeId || ''} readOnly disabled className="bg-gray-900 cursor-not-allowed"/>
              </div>
          )}
          <div className={staff ? "" : "col-span-2"}>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required className="bg-gray-800" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} className="bg-gray-800"/></div>
          <div><Label htmlFor="hireDate">Hire Date</Label><Input id="hireDate" name="hireDate" type="date" value={formData.hireDate || ''} onChange={handleChange} className="bg-gray-800"/></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={formData.department || ''} onValueChange={(value) => handleSelectChange('department', value)}><SelectTrigger className="bg-gray-800"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACADEMICS">Academics</SelectItem>
                <SelectItem value="ADMINISTRATION">Administration</SelectItem>
                <SelectItem value="FINANCE">Finance</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="SUPPORT">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="position">Position</Label><Input id="position" name="position" value={formData.position || ''} onChange={handleChange} className="bg-gray-800"/></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employmentStatus">Employment Status *</Label>
            <Select value={formData.employmentStatus || 'ACTIVE'} onValueChange={(value) => handleSelectChange('employmentStatus', value)}><SelectTrigger className="bg-gray-800"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="salary">Salary</Label><Input id="salary" type="number" value={formData.salary || ''} name="salary" onChange={handleChange} className="bg-gray-800"/></div>
        </div>

        <div><Label htmlFor="address">Address</Label><Input id="address" name="address" value={formData.address || ''} onChange={handleChange} className="bg-gray-800"/></div>
        <div><Label htmlFor="qualifications">Qualifications</Label><Input id="qualifications" name="qualifications" value={formData.qualifications || ''} onChange={handleChange} className="bg-gray-800"/></div>
        <div><Label htmlFor="specializations">Specializations</Label><Input id="specializations" name="specializations" value={formData.specializations || ''} onChange={handleChange} className="bg-gray-800"/></div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (staff ? 'Update Staff' : 'Create Staff')}</Button>
        </div>
      </form>
  );
}