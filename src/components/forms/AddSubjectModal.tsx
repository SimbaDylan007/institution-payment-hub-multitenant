import React, { useState, useEffect, FC } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import InstitutionSelect from "./InstitutionSelect";
import { Subject } from "@/types"; // Import the Subject type

interface AddSubjectModalProps {
    onSubjectAdded: () => void;
}

// Define the shape of the form's state object
const initialFormData: Partial<Subject> = {
    name: "",
    code: "",
    description: "",
    credits: 0,
    grade: "1", // Default to Grade 1
    isActive: true,
};

export const AddSubjectModal: FC<AddSubjectModalProps> = ({ onSubjectAdded }) => {
    const { isSuperAdmin } = useAuth();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);

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
        setIsLoading(true);

        if (isSuperAdmin && !selectedInstitutionId) {
            toast.error("As a Super Admin, you must select an institution.");
            setIsLoading(false);
            return;
        }

        const payload: any = {
            ...formData,
            credits: formData.credits ? Number(formData.credits) : 0,
        };

        if (isSuperAdmin) {
            payload.institutionId = parseInt(selectedInstitutionId);
        }

        try {
            const response = await apiFetch('/api/academic/subjects', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success("Subject added successfully");
                setOpen(false);
                onSubjectAdded();
            } else {
                const errorData = await response.json().catch(() => ({ message: "Failed to add subject." }));
                throw new Error(errorData.message);
            }
        } catch (error) {
            console.error('Error adding subject:', error);
            toast.error((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2"/>
                    Add Subject
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-gray-900 text-white border-gray-700">
                <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">

                    <InstitutionSelect
                        value={selectedInstitutionId}
                        onValueChange={setSelectedInstitutionId}
                    />

                    <div>
                        <Label htmlFor="name">Subject Name *</Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-gray-800 border-gray-600"/>
                    </div>
                    <div>
                        <Label htmlFor="code">Subject Code *</Label>
                        <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required className="bg-gray-800 border-gray-600"/>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-gray-800 border-gray-600"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="credits">Credits *</Label>
                            <Input id="credits" type="number" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })} required className="bg-gray-800 border-gray-600"/>
                        </div>
                        <div>
                            <Label htmlFor="grade">Grade Level *</Label>
                            <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                                <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[...Array(7)].map((_, i) => <SelectItem key={i} value={`GRADE ${i + 1}`}>{`Grade ${i + 1}`}</SelectItem>)}
                                    <SelectItem value="ECD A">ECD A</SelectItem>
                                    <SelectItem value="ECD B">ECD B</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Adding..." : "Add Subject"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};