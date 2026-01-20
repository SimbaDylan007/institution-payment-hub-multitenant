import React, { useState, FC } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have a Checkbox component
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import InstitutionSelect from "./InstitutionSelect"; // Import the institution selector

export interface BulkUserImportModalProps {
    onUsersImported: () => void;
}

export const BulkUserImportModal: FC<BulkUserImportModalProps> = ({ onUsersImported }) => {
    const { isSuperAdmin } = useAuth(); // <-- Get super-admin status
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [csvData, setCsvData] = useState("");
    const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false);

    // --- NEW STATE for the super-admin's institution selection ---
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // --- TENANCY VALIDATION ---
        if (isSuperAdmin && !selectedInstitutionId) {
            toast.error("As a Super Admin, you must select an institution to import users into.");
            setIsLoading(false);
            return;
        }

        try {
            const lines = csvData.trim().split('\n');
            const users = lines.map(line => {
                const [username, email, password, roles] = line.split(',');
                return {
                    username: username?.trim(),
                    email: email?.trim(),
                    password: password?.trim(),
                    enabled: true,
                    roleNames: roles ? roles.split(';').map(r => r.trim()) : ['ROLE_STUDENT']
                };
            });

            // Prepare the final payload for the backend
            const payload: any = {
                users,
                sendWelcomeEmail
            };

            // If super-admin, add the selected institution ID to the payload
            if (isSuperAdmin) {
                payload.institutionId = parseInt(selectedInstitutionId);
            }

            const response = await apiFetch('/api/users/bulk-import', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(`${data.length} users imported successfully`);
                setCsvData(""); // Clear form on success
                setSelectedInstitutionId('');
                setOpen(false);
                onUsersImported();
            } else {
                const errorData = await response.json().catch(() => ({ message: "Failed to import users. Please check the data format." }));
                throw new Error(errorData.message);
            }
        } catch (error) {
            console.error('Error importing users:', error);
            toast.error((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Bulk Import Users</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-gray-900 text-white border-gray-700">
                <DialogHeader>
                    <DialogTitle>Bulk User Import</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* --- Conditionally render the InstitutionSelect for super-admins --- */}
                    <InstitutionSelect
                        value={selectedInstitutionId}
                        onValueChange={setSelectedInstitutionId}
                    />

                    <div>
                        <Label htmlFor="csvData">CSV Data (username,email,password,roles)</Label>
                        <Textarea
                            id="csvData"
                            placeholder="john.doe,john@example.com,password123,ROLE_STUDENT&#10;jane.smith,jane@example.com,password456,ROLE_TEACHER;ROLE_FINANCE_ADMIN"
                            value={csvData}
                            onChange={(e) => setCsvData(e.target.value)}
                            rows={6}
                            required
                            className="bg-gray-800 border-gray-600"
                        />
                        <p className="text-sm text-gray-400 mt-1">
                            Separate multiple roles with a semicolon (;).
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="sendWelcomeEmail"
                            checked={sendWelcomeEmail}
                            onCheckedChange={(checked) => setSendWelcomeEmail(checked === true)}
                        />
                        <Label htmlFor="sendWelcomeEmail">Send Welcome Email</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Importing..." : "Import Users"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};