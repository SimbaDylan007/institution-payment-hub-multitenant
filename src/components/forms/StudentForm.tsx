
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createStudent, updateStudent } from "@/services/studentApiService";

interface Student {
  id?: number;
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  enrollmentStatus: string;
  enrollmentDate: string;
  currentGrade?: string;
  section?: string;
}

interface StudentFormProps {
  student?: Student;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState<Student>({
    firstName: '',
    lastName: '',
    studentId: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    enrollmentStatus: 'ACTIVE',
    enrollmentDate: new Date().toISOString().split('T')[0],
    currentGrade: '',
    section: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
        enrollmentDate: student.enrollmentDate ? student.enrollmentDate.split('T')[0] : ''
      });
    }
  }, [student]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (student?.id) {
        await updateStudent(student.id, formData);
        toast.success('Student updated successfully');
      } else {
        await createStudent(formData);
        toast.success('Student created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student');
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
          <Label htmlFor="studentId">Student ID *</Label>
          <Input
            id="studentId"
            value={formData.studentId}
            onChange={(e) => handleChange('studentId', e.target.value)}
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
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="enrollmentStatus">Enrollment Status *</Label>
          <Select value={formData.enrollmentStatus} onValueChange={(value) => handleChange('enrollmentStatus', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="GRADUATED">Graduated</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currentGrade">Current Grade</Label>
          <Select value={formData.currentGrade} onValueChange={(value) => handleChange('currentGrade', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({length: 12}, (_, i) => (
                <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="section">Section</Label>
          <Select value={formData.section} onValueChange={(value) => handleChange('section', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
            </SelectContent>
          </Select>
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
        <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
        <Input
          id="enrollmentDate"
          type="date"
          value={formData.enrollmentDate}
          onChange={(e) => handleChange('enrollmentDate', e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (student ? 'Update Student' : 'Create Student')}
        </Button>
      </div>
    </form>
  );
}
