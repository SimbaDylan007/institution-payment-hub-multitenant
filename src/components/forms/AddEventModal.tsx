import React, { useState, FC } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import InstitutionSelect from "./InstitutionSelect"; // Import the reusable component

interface AddEventModalProps {
    onEventAdded?: () => void;
}

const initialFormData = {
    title: "", description: "", eventType: "", targetAudience: "ALL",
    eventDate: "", startTime: "", endTime: "", venue: "",
    isPublic: true, status: "PLANNED"
};

const AddEventModal: FC<AddEventModalProps> = ({ onEventAdded }) => {
    const { isSuperAdmin } = useAuth(); // <-- Get super-admin status
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);

    // --- NEW STATE for the super-admin's institution selection ---
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // --- TENANCY VALIDATION ---
        if (isSuperAdmin && !selectedInstitutionId) {
            toast.error("As a Super Admin, you must select an institution to create an event for.");
            setLoading(false);
            return;
        }

        // Prepare the payload to send to the backend
        const payload: any = { ...formData };

        // If super-admin, add the selected institution ID to the payload
        if (isSuperAdmin) {
            payload.institutionId = parseInt(selectedInstitutionId);
        }
        // For regular admins, the backend will automatically use their institution.

        try {
            const response = await apiFetch('http://localhost:8082/api/events', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success('Event added successfully');
                setOpen(false);
                setFormData(initialFormData); // Reset form state
                setSelectedInstitutionId(''); // Reset institution selection
                if (onEventAdded) onEventAdded();
            } else {
                const error = await response.json().catch(() => ({ message: "Failed to add event." }));
                throw new Error(error.message);
            }
        } catch (error) {
            console.error('Error adding event:', error);
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            // Reset form when the dialog is closed
            setFormData(initialFormData);
            setSelectedInstitutionId('');
        }
        setOpen(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border-purple-700 text-white backdrop-blur-sm max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* --- Conditionally render the InstitutionSelect for super-admins --- */}
                    <InstitutionSelect
                        value={selectedInstitutionId}
                        onValueChange={setSelectedInstitutionId}
                    />

                    <div>
                        <Label htmlFor="title">Event Title *</Label>
                        <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="bg-purple-800/50 border-purple-600 text-white" />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-purple-800/50 border-purple-600 text-white" rows={3} />
                    </div>

                    {/* ... rest of the form inputs remain the same ... */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="eventType">Event Type</Label>
                            <Select value={formData.eventType} onValueChange={(value) => setFormData({...formData, eventType: value})}>
                                <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                                <SelectContent className="bg-purple-900 border-purple-700">
                                    <SelectItem value="ACADEMIC">Academic</SelectItem>
                                    <SelectItem value="SPORTS">Sports</SelectItem>
                                    <SelectItem value="CULTURAL">Cultural</SelectItem>
                                    <SelectItem value="MEETING">Meeting</SelectItem>
                                    <SelectItem value="EXAMINATION">Examination</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="targetAudience">Target Audience</Label>
                            <Select value={formData.targetAudience} onValueChange={(value) => setFormData({...formData, targetAudience: value})}>
                                <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white"><SelectValue placeholder="Select audience" /></SelectTrigger>
                                <SelectContent className="bg-purple-900 border-purple-700">
                                    <SelectItem value="STUDENTS">Students</SelectItem>
                                    <SelectItem value="STAFF">Staff</SelectItem>
                                    <SelectItem value="PARENTS">Parents</SelectItem>
                                    <SelectItem value="ALL">All</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="eventDate">Event Date *</Label>
                            <Input id="eventDate" type="date" value={formData.eventDate} onChange={(e) => setFormData({...formData, eventDate: e.target.value})} required className="bg-purple-800/50 border-purple-600 text-white" />
                        </div>
                        {/* ... other date/time inputs */}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="border-purple-600 text-white hover:bg-purple-700">Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                            {loading ? 'Adding...' : 'Add Event'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}