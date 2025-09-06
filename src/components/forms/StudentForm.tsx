import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient"; // 1. Import the centralized apiFetch

interface Student {
  id?: number;
  studentId?: string;
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
}

interface StudentFormProps {
  student?: Student | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function StudentForm({ student, onSave, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentGrade: "",
    section: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    enrollmentDate: new Date().toISOString().split('T')[0],
    enrollmentStatus: "active"
  });

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        phone: student.phone || "",
        currentGrade: student.currentGrade || "",
        section: student.section || "",
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : "",
        gender: student.gender || "",
        address: student.address || "",
        enrollmentDate: student.enrollmentDate ? student.enrollmentDate.split('T')[0] : new Date().toISOString().split('T')[0],
        enrollmentStatus: student.enrollmentStatus || "active"
      });
    }
  }, [student]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 2. Refactor the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields: First Name, Last Name, and Email.");
      return;
    }

    try {
      const url = student ? `http://localhost:8080/api/students/${student.id}` : 'http://localhost:8080/api/students';
      const method = student ? 'PUT' : 'POST';

      // Replace `fetch` with `apiFetch`.
      // The 'Content-Type' header is no longer needed as apiFetch handles it automatically.
      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        // Handle application-level errors (e.g., validation failure from the server)
        const errorData = await response.json().catch(() => ({ message: "An unknown server error occurred." }));
        throw new Error(errorData.message || "Failed to save student data.");
      }
      onSave(); // Signal parent component to refresh and close the form
    } catch (error) {
      // apiFetch will handle generic network/auth errors with a toast.
      // This catch block will display more specific error messages from the server.
      toast.error((error as Error).message);
    }
  };

  // The JSX for the form remains unchanged.
  return (
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="firstName" className="text-white">First Name *</Label><Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className="bg-gray-800 border-gray-600 text-white" required /></div>
          <div><Label htmlFor="lastName" className="text-white">Last Name *</Label><Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className="bg-gray-800 border-gray-600 text-white" required /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="email" className="text-white">Email *</Label><Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="bg-gray-800 border-gray-600 text-white" required /></div>
          <div><Label htmlFor="phone" className="text-white">Phone</Label><Input id="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className="bg-gray-800 border-gray-600 text-white" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="currentGrade" className="text-white">Grade</Label><Input id="currentGrade" value={formData.currentGrade} onChange={(e) => handleInputChange("currentGrade", e.target.value)} className="bg-gray-800 border-gray-600 text-white" placeholder="e.g., Grade 10" /></div>
          <div><Label htmlFor="section" className="text-white">Section</Label><Input id="section" value={formData.section} onChange={(e) => handleInputChange("section", e.target.value)} className="bg-gray-800 border-gray-600 text-white" placeholder="e.g., A" /></div>
        </div>
        <div><Label htmlFor="address" className="text-white">Address</Label><Textarea id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} className="bg-gray-800 border-gray-600 text-white" rows={2} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label><Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} className="bg-gray-800 border-gray-600 text-white" /></div>
          <div><Label htmlFor="gender" className="text-white">Gender</Label><Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}><SelectTrigger className="bg-gray-800 border-gray-600 text-white"><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent className="bg-gray-800 border-gray-600"><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="enrollmentDate" className="text-white">Enrollment Date</Label><Input id="enrollmentDate" type="date" value={formData.enrollmentDate} onChange={(e) => handleInputChange("enrollmentDate", e.target.value)} className="bg-gray-800 border-gray-600 text-white" /></div>
          <div><Label htmlFor="enrollmentStatus" className="text-white">Status</Label><Select value={formData.enrollmentStatus} onValueChange={(value) => handleInputChange("enrollmentStatus", value)}><SelectTrigger className="bg-gray-800 border-gray-600 text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-gray-800 border-gray-600"><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="graduated">Graduated</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select></div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="border-gray-600 text-gray-300">Cancel</Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">{student ? 'Update Student' : 'Add Student'}</Button>
        </div>
      </form>
  );
}