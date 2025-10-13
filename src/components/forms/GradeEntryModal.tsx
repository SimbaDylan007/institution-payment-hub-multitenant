import React, { useState, useEffect, FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import { GradeDTO } from "@/types"; // This will now import the correct type
import { academicYears, currentAcademicYear, semesters, currentSemester } from "@/config/academicConfig";

interface GradeEntryModalProps {
    onGradeAdded: () => void;
}

const initialFormData: GradeDTO = {
    studentId: "",
    subjectId: "", // <-- CORRECTED: Use subjectId
    assessmentType: "FINAL",
    marksObtained: 0,
    maxMarks: 100,
    letterGrade: "",
    academicYear: currentAcademicYear,
    semester: currentSemester
};

export const GradeEntryModal: FC<GradeEntryModalProps> = ({ onGradeAdded }) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<GradeDTO>(initialFormData);

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // The formData object already matches the DTO, so we can send it directly
            const response = await apiFetch('http://localhost:8082/api/academic/grades', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Grade added successfully");
                setOpen(false);
                onGradeAdded();
            } else {
                const error = await response.json().catch(() => ({ message: "Failed to add grade." }));
                throw new Error(error.message);
            }
        } catch (error) {
            console.error('Error adding grade:', error);
            toast.error((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2"/>
                    Enter Grades
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-gray-900 text-white border-gray-700">
                <DialogHeader>
                    <DialogTitle>Add New Grade Entry</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
                    <div>
                        <Label htmlFor="studentId">Student ID *</Label>
                        <Input id="studentId" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} required className="bg-gray-800 border-gray-600"/>
                    </div>
                    <div>
                        {/* --- CORRECTED: Use 'subjectId' --- */}
                        <Label htmlFor="subjectId">Subject Code *</Label>
                        <Input id="subjectId" value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} required className="bg-gray-800 border-gray-600"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="marksObtained">Marks Obtained *</Label>
                            <Input id="marksObtained" type="number" value={formData.marksObtained} onChange={(e) => setFormData({ ...formData, marksObtained: Number(e.target.value) })} required className="bg-gray-800 border-gray-600"/>
                        </div>
                        <div>
                            <Label htmlFor="maxMarks">Max Marks *</Label>
                            <Input id="maxMarks" type="number" value={formData.maxMarks} onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })} required className="bg-gray-800 border-gray-600"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="assessmentType">Assessment Type *</Label>
                            <Select value={formData.assessmentType} onValueChange={(value) => setFormData({ ...formData, assessmentType: value })}>
                                <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                                    <SelectItem value="QUIZ">Quiz</SelectItem>
                                    <SelectItem value="MIDTERM">Midterm Exam</SelectItem>
                                    <SelectItem value="FINAL">Final Exam</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="letterGrade">Letter Grade</Label>
                            <Input id="letterGrade" value={formData.letterGrade} onChange={(e) => setFormData({ ...formData, letterGrade: e.target.value })} placeholder="e.g., A+" className="bg-gray-800 border-gray-600"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="academicYear">Academic Year *</Label>
                            <Select value={formData.academicYear} onValueChange={(value) => setFormData({ ...formData, academicYear: value })}>
                                <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue/></SelectTrigger>
                                <SelectContent>{academicYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="semester">Term / Semester *</Label>
                            <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                                <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue/></SelectTrigger>
                                <SelectContent>{semesters.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
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