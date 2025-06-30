
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createStaff, updateStaff } from "@/services/staffApiService";

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
  hireDate?: string;
  salary?: number;
  qualifications?: string;
  specializations?: string;
}

interface StaffFormProps {
  staff?: Staff;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StaffForm({ staff, onSuccess, onCancel }: StaffFormProps) {
  const [formData, setFormData] = useState<Staff>({
    firstName: '',
    lastName: '',
    employeeId: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    employmentStatus: 'ACTIVE',
    hireDate: new Date().toISOString().split('T')[0],
    salary: 0,
    qualifications: '',
    specializations: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        ...staff,
        hireDate: staff.hireDate ? staff.hireDate.split('T')[0] : ''
      });
    }
  }, [staff]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (staff?.id) {
        await updateStaff(staff.id, formData);
        toast.success('Staff member updated successfully');
      } else {
        await createStaff(formData);
        toast.success('Staff member created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error('Failed to save staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employeeId">Employee ID *</Label>
          <Input
            id="employeeId"
            value={formData.employeeId}
            onChange={(e) => handleChange('employeeId', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="hireDate">Hire Date</Label>
          <Input
            id="hireDate"
            type="date"
            value={formData.hireDate}
            onChange={(e) => handleChange('hireDate', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MATHEMATICS">Mathematics</SelectItem>
              <SelectItem value="SCIENCE">Science</SelectItem>
              <SelectItem value="ENGLISH">English</SelectItem>
              <SelectItem value="HISTORY">History</SelectItem>
              <SelectItem value="PHYSICAL_EDUCATION">Physical Education</SelectItem>
              <SelectItem value="ART">Art</SelectItem>
              <SelectItem value="MUSIC">Music</SelectItem>
              <SelectItem value="ADMINISTRATION">Administration</SelectItem>
              <SelectItem value="SUPPORT">Support</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employmentStatus">Employment Status *</Label>
          <Select value={formData.employmentStatus} onValueChange={(value) => handleChange('employmentStatus', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              <SelectItem value="TERMINATED">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            type="number"
            value={formData.salary}
            onChange={(e) => handleChange('salary', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="qualifications">Qualifications</Label>
        <Input
          id="qualifications"
          value={formData.qualifications}
          onChange={(e) => handleChange('qualifications', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="specializations">Specializations</Label>
        <Input
          id="specializations"
          value={formData.specializations}
          onChange={(e) => handleChange('specializations', e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (staff ? 'Update Staff' : 'Create Staff')}
        </Button>
      </div>
    </form>
  );
}
