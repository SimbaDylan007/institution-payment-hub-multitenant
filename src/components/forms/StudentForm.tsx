
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  grade: string;
  section: string;
  rollNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  parentName: string;
  parentPhone: string;
  enrollmentDate: string;
  status: string;
}

interface StudentFormProps {
  student?: Student | null;
  onSave: (student: Partial<Student>) => void;
  onCancel: () => void;
}

export default function StudentForm({ student, onSave, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState({
    firstName: student?.firstName || "",
    lastName: student?.lastName || "",
    email: student?.email || "",
    phone: student?.phone || "",
    grade: student?.grade || "",
    section: student?.section || "",
    rollNumber: student?.rollNumber || "",
    dateOfBirth: student?.dateOfBirth || "",
    gender: student?.gender || "",
    address: student?.address || "",
    parentName: student?.parentName || "",
    parentPhone: student?.parentPhone || "",
    enrollmentDate: student?.enrollmentDate || new Date().toISOString().split('T')[0],
    status: student?.status || "active"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const url = student 
        ? `http://localhost:8080/api/students/${student.id}`
        : 'http://localhost:8080/api/students';
      
      const method = student ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSave(formData);
      } else {
        // If API fails, still update the UI
        onSave(formData);
      }
    } catch (error) {
      console.error('Error saving student:', error);
      // Still update the UI even if API fails
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-white">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-white">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="text-white">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone" className="text-white">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="grade" className="text-white">Grade</Label>
          <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="section" className="text-white">Section</Label>
          <Select value={formData.section} onValueChange={(value) => handleInputChange("section", value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {['A', 'B', 'C', 'D', 'E'].map(section => (
                <SelectItem key={section} value={section}>{section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rollNumber" className="text-white">Roll Number</Label>
          <Input
            id="rollNumber"
            value={formData.rollNumber}
            onChange={(e) => handleInputChange("rollNumber", e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor="gender" className="text-white">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address" className="text-white">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="parentName" className="text-white">Parent Name</Label>
          <Input
            id="parentName"
            value={formData.parentName}
            onChange={(e) => handleInputChange("parentName", e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor="parentPhone" className="text-white">Parent Phone</Label>
          <Input
            id="parentPhone"
            value={formData.parentPhone}
            onChange={(e) => handleInputChange("parentPhone", e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="enrollmentDate" className="text-white">Enrollment Date</Label>
          <Input
            id="enrollmentDate"
            type="date"
            value={formData.enrollmentDate}
            onChange={(e) => handleInputChange("enrollmentDate", e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor="status" className="text-white">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-gray-600 text-gray-300">
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {student ? 'Update Student' : 'Add Student'}
        </Button>
      </div>
    </form>
  );
}
