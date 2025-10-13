import React, { useState, useEffect, FC } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CreateTimetableEntryRequest } from "@/types"; // Import the specific DTO type
import { apiFetch } from "@/utils/apiClient";
import InstitutionSelect from "./InstitutionSelect";
import { currentAcademicYear } from "@/config/academicConfig"; // Assuming you have this config

interface AddTimetableEntryModalProps {
    onEntryAdded: () => void;
}

const initialFormData: CreateTimetableEntryRequest = {
    subject: "",
    teacher: "",
    grade: "",
    section: "A",
    dayOfWeek: "MONDAY",
    startTime: "",
    endTime: "",
    room: "",
    academicYear: currentAcademicYear
};

const AddTimetableEntryModal: FC<AddTimetableEntryModalProps> = ({ onEntryAdded }) => {
    const { isSuperAdmin } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateTimetableEntryRequest>(initialFormData);

    // State for the super-admin's institution selection
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');

    // Reset form when the dialog is closed
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setSelectedInstitutionId('');
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (isSuperAdmin && !selectedInstitutionId) {
            toast.error("As a Super Admin, you must select an institution.");
            setLoading(false);
            return;
        }

        const payload: any = { ...formData };

        if (isSuperAdmin) {
            payload.institutionId = parseInt(selectedInstitutionId);
        }

        try {
            const response = await apiFetch('http://localhost:8082/api/timetables', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success('Timetable entry added successfully');
                setOpen(false);
                onEntryAdded();
            } else {
                const error = await response.json().catch(() => ({ message: "Failed to add timetable entry." }));
                throw new Error(error.message);
            }
        } catch (error) {
            console.error('Error adding timetable entry:', error);
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Timetable Entry
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border-purple-700 text-white backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle>Add Timetable Entry</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">

                    <InstitutionSelect
                        value={selectedInstitutionId}
                        onValueChange={setSelectedInstitutionId}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="subject">Subject</Label><Input id="subject" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required className="bg-purple-800/50 border-purple-600"/></div>
                        <div><Label htmlFor="teacher">Teacher</Label><Input id="teacher" value={formData.teacher} onChange={(e) => setFormData({...formData, teacher: e.target.value})} required className="bg-purple-800/50 border-purple-600"/></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="grade">Grade</Label><Select value={formData.grade} onValueChange={(value) => setFormData({...formData, grade: value})}><SelectTrigger className="bg-purple-800/50 border-purple-600"><SelectValue placeholder="Select grade" /></SelectTrigger><SelectContent>{[...Array(7)].map((_, i) => (<SelectItem key={i+1} value={`GRADE ${i+1}`}>{`Grade ${i+1}`}</SelectItem>))}<SelectItem value="ECD A">ECD A</SelectItem><SelectItem value="ECD B">ECD B</SelectItem></SelectContent></Select></div>
                        <div><Label htmlFor="section">Section</Label><Select value={formData.section} onValueChange={(value) => setFormData({...formData, section: value})}><SelectTrigger className="bg-purple-800/50 border-purple-600"><SelectValue placeholder="Select section" /></SelectTrigger><SelectContent>{['A', 'B', 'C', 'D'].map((section) => (<SelectItem key={section} value={section}>{section}</SelectItem>))}</SelectContent></Select></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div><Label htmlFor="dayOfWeek">Day</Label><Select value={formData.dayOfWeek} onValueChange={(value) => setFormData({...formData, dayOfWeek: value})}><SelectTrigger className="bg-purple-800/50 border-purple-600"><SelectValue placeholder="Select day" /></SelectTrigger><SelectContent>{['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map((day) => (<SelectItem key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</SelectItem>))}</SelectContent></Select></div>
                        <div><Label htmlFor="startTime">Start Time</Label><Input id="startTime" type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} required className="bg-purple-800/50 border-purple-600"/></div>
                        <div><Label htmlFor="endTime">End Time</Label><Input id="endTime" type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} required className="bg-purple-800/50 border-purple-600"/></div>
                    </div>

                    <div><Label htmlFor="room">Room / Venue</Label><Input id="room" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} required className="bg-purple-800/50 border-purple-600"/></div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-purple-600 text-white hover:bg-purple-700">Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">{loading ? 'Adding...' : 'Add'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}