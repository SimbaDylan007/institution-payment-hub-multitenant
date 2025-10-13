import React, { useState, useEffect, FC } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import { User, Staff } from "@/types"; // Import your existing types

interface Recipient {
    id: number; // This will be the User ID
    name: string;
    type: 'Student' | 'Staff';
}

interface NewMessageModalProps {
    onMessageSent?: () => void;
}

const initialFormData = {
    recipientId: "",
    subject: "",
    content: "",
};

export const NewMessageModal: FC<NewMessageModalProps> = ({ onMessageSent }) => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        const fetchRecipients = async () => {
            setLoading(true);
            try {
                const [usersRes, staffRes] = await Promise.all([
                    apiFetch('http://localhost:8082/api/users?size=1000'),
                    apiFetch('http://localhost:8082/api/staff?size=1000')
                ]);

                if (!usersRes.ok || !staffRes.ok) throw new Error("Failed to load recipient lists.");

                const usersData = await usersRes.json();
                const staffData = await staffRes.json();

                // --- FIX #1: Check 'role' (singular string) instead of 'roles' (array) ---
                const studentRecipients: Recipient[] = (usersData.content || [])
                    .filter((u: User) => u.role === 'ROLE_STUDENT') // Check the string property
                    .map((u: User) => ({ id: u.id, name: u.username, type: 'Student' }));

                // --- FIX #2: Get the user ID from the Staff object's associated User ---
                // This assumes your backend Staff DTO includes the nested user object as we designed.
                // If not, we'll need to adjust. For now, let's assume it does.
                const staffRecipients: Recipient[] = (staffData.content || [])
                    .map((s: Staff & { user: { id: number } }) => ({ // Type assertion for clarity
                        id: s.user.id,
                        name: `${s.firstName} ${s.lastName}`,
                        type: 'Staff'
                    }));

                setRecipients([...studentRecipients, ...staffRecipients]);

            } catch (error) {
                toast.error((error as Error).message || "Failed to load recipients.");
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchRecipients();
        } else {
            setFormData(initialFormData);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!user) {
            toast.error("You must be logged in to send a message.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                senderId: user.id,
                recipientId: parseInt(formData.recipientId),
            };

            const response = await apiFetch('http://localhost:8082/api/communication/messages', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success("Message sent successfully!");
                setOpen(false);
                if (onMessageSent) onMessageSent();
            } else {
                const error = await response.json().catch(() => ({ message: 'Failed to send message.' }));
                throw new Error(error.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600">
                    <Send className="h-4 w-4 mr-2" />
                    New Message
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-gray-900 text-white border-gray-700">
                <DialogHeader>
                    <DialogTitle>Compose New Message</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
                    <div>
                        <Label htmlFor="recipient">Recipient *</Label>
                        <Select required value={formData.recipientId} onValueChange={(value) => setFormData({ ...formData, recipientId: value })}>
                            <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue placeholder="Select a recipient..." /></SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                                {loading ? <div className="p-2">Loading recipients...</div> : (
                                    <>
                                        <SelectGroup>
                                            <SelectLabel>Staff</SelectLabel>
                                            {recipients.filter(r => r.type === 'Staff').map(r => (
                                                <SelectItem key={`staff-${r.id}`} value={r.id.toString()}>{r.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                        <SelectGroup>
                                            <SelectLabel>Students</SelectLabel>
                                            {recipients.filter(r => r.type === 'Student').map(r => (
                                                <SelectItem key={`student-${r.id}`} value={r.id.toString()}>{r.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Input id="subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required className="bg-gray-800 border-gray-600"/>
                    </div>

                    <div>
                        <Label htmlFor="content">Message *</Label>
                        <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Type your message here..." rows={6} required className="bg-gray-800 border-gray-600"/>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Sending..." : "Send Message"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}