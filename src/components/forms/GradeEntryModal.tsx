
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface GradeEntryModalProps {
  onGradeAdded: () => void;
}

export const GradeEntryModal: React.FC<GradeEntryModalProps> = ({ onGradeAdded }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    subjectId: "",
    grade: "",
    marks: "",
    academicYear: "",
    semester: "",
    examType: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Grade added successfully");
        setFormData({
          studentId: "",
          subjectId: "",
          grade: "",
          marks: "",
          academicYear: "",
          semester: "",
          examType: ""
        });
        setOpen(false);
        onGradeAdded();
      } else {
        toast.error("Failed to add grade");
      }
    } catch (error) {
      console.error('Error adding grade:', error);
      toast.error("Error adding grade");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Grade</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Grade Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="subjectId">Subject ID</Label>
            <Input
              id="subjectId"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="marks">Marks</Label>
            <Input
              id="marks"
              type="number"
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="grade">Grade</Label>
            <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C+">C+</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="F">F</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="academicYear">Academic Year</Label>
            <Input
              id="academicYear"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              placeholder="2024"
              required
            />
          </div>
          <div>
            <Label htmlFor="semester">Semester</Label>
            <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="examType">Exam Type</Label>
            <Select value={formData.examType} onValueChange={(value) => setFormData({ ...formData, examType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="midterm">Midterm</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Grade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
