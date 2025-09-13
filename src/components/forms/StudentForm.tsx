// src/components/forms/StudentForm.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";

// Define the shape of the Student object
interface Student {
  id?: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentGrade: string;
  section?: string;
  dateOfBirth: string; // "yyyy-MM-dd"
  gender: string;
  address?: string;
  enrollmentDate: string; // "yyyy-MM-dd"
  enrollmentStatus: string;
}

interface StudentFormProps {
  student?: Student | null; // The student to edit, if any
  onSave: () => void;      // Callback to refresh data
  onCancel: () => void;     // Callback to close the modal
}

// Initial state for a new, empty form
const initialFormData: Partial<Student> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  currentGrade: "",
  section: "",
  // studentId is intentionally omitted for new students
  dateOfBirth: "",
  gender: "Male",
  address: "",
  enrollmentDate: new Date().toISOString().split('T')[0],
  enrollmentStatus: "ACTIVE"
};

export default function StudentForm({ student, onSave, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState<Partial<Student>>(initialFormData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      // If editing, populate the form with the student's data
      setFormData({
        ...student,
        dateOfBirth: student.dateOfBirth || "",
        enrollmentDate: student.enrollmentDate || new Date().toISOString().split('T')[0],
      });
    } else {
      // If adding, reset to the initial empty state
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

    // The studentId is only required for new students on the backend,
    // but we can remove it from the frontend validation as it's auto-assigned.
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields marked with *.");
      setLoading(false);
      return;
    }

    try {
      const url = student ? `http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/students/${student.id}` : 'http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/students';
      const method = student ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
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

        {/* --- THIS IS THE CONDITIONAL LOGIC FOR studentId --- */}
        <div className="grid grid-cols-2 gap-4">
          {/* If we are editing a student, show the studentId field but disable it */}
          {student && (
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input id="studentId" name="studentId" value={formData.studentId || ''} readOnly disabled className="bg-gray-900 border-gray-700 cursor-not-allowed" />
              </div>
          )}
          {/* The Email field will take up the full row if creating a new student, or half if editing */}
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
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Gender</Label><Select name="gender" value={formData.gender} onValueChange={(v) => handleSelectChange('gender', v)}><SelectTrigger className="bg-gray-800"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
          <div><Label>Enrollment Status</Label><Select name="enrollmentStatus" value={formData.enrollmentStatus} onValueChange={(v) => handleSelectChange('enrollmentStatus', v)}><SelectTrigger className="bg-gray-800"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem><SelectItem value="GRADUATED">Graduated</SelectItem></SelectContent></Select></div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? (student ? 'Updating...' : 'Adding...') : (student ? 'Update Student' : 'Add Student')}</Button>
        </div>
      </form>
  );
}