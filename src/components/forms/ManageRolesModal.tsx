import React, { useState, useEffect, FC } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiClient';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/types';
import { ShieldPlus } from 'lucide-react';

type Props = object

export const ManageRolesModal: FC<Props> = () => {
    // Get the selected institution from the context. This is crucial.
    const { isSuperAdmin, selectedInstitution } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [newRoleName, setNewRoleName] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchRoles = async () => {
        // Only fetch roles if a specific institution is selected.
        if (!selectedInstitution || selectedInstitution === 'all') {
            setRoles([]); // Clear roles if no institution is selected
            return;
        }
        const institutionId = selectedInstitution.id;

        setLoading(true);
        try {
            // Use the correct, tenant-aware endpoint.
            const response = await apiFetch(`/api/users/roles?institutionId=${institutionId}`);
            if (response.ok) {
                setRoles(await response.json());
            } else {
                toast.error("Failed to fetch roles for the selected institution.");
            }
        } catch (error) {
            // apiFetch handles network error toasts
        } finally {
            setLoading(false);
        }
    };

    // Refetch the roles whenever the modal is opened OR the selected institution changes.
    useEffect(() => {
        if (isOpen) {
            fetchRoles();
        }
    }, [isOpen, selectedInstitution]); // Add selectedInstitution as a dependency

    // --- THIS IS THE CORRECTED FUNCTION ---
    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) {
            return toast.warning("Role name cannot be empty.");
        }

        // 1. Validate that an institution has been selected.
        if (!selectedInstitution || selectedInstitution === 'all') {
            return toast.error("Please select a specific institution before creating a role.");
        }
        const institutionId = selectedInstitution.id;

        setLoading(true);
        try {
            // 2. Pass the institutionId as a query parameter to the backend.
            const response = await apiFetch(`/api/users/roles?institutionId=${institutionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: newRoleName
            });

            if (response.ok) {
                toast.success(`Role "${newRoleName.toUpperCase()}" created successfully.`);
                setNewRoleName('');
                fetchRoles(); // Refresh the list for the current institution
            } else {
                const error = await response.json().catch(() => ({ message: "Failed to create role." }));
                throw new Error(error.message);
            }
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Only a Super Admin should be able to see and use this feature.
    if (!isSuperAdmin) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><ShieldPlus className="h-4 w-4 mr-2"/>Manage Roles</Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white border-gray-700">
                <DialogHeader>
                    <DialogTitle>Manage Roles for '{selectedInstitution === 'all' ? '...' : selectedInstitution?.name}'</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <h3 className="font-semibold mb-2">Existing Roles</h3>
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-800 rounded-md min-h-[60px] border border-gray-700">
                            {loading && <p className="text-sm text-gray-400">Loading...</p>}
                            {!loading && roles.length === 0 && <p className="text-sm text-gray-400">No roles found. Select an institution or create one.</p>}
                            {!loading && roles.map(r => <Badge key={r.id} variant="secondary">{r.name.replace('ROLE_', '')}</Badge>)}
                        </div>
                    </div>
                    <form onSubmit={handleCreateRole} className="space-y-3 pt-4 border-t border-gray-700">
                        <Label htmlFor="newRoleName" className="font-semibold">Create New Role</Label>
                        <div className="flex gap-2">
                            <Input
                                id="newRoleName"
                                value={newRoleName}
                                onChange={e => setNewRoleName(e.target.value.toUpperCase().replace(/ /g, '_'))}
                                placeholder="e.g., LIBRARIAN"
                                className="bg-gray-800 border-gray-600"
                                disabled={!selectedInstitution || selectedInstitution === 'all'} // Disable if no institution is chosen
                            />
                            <Button type="submit" disabled={loading || !newRoleName.trim() || !selectedInstitution || selectedInstitution === 'all'}>
                                Create
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400">Select an institution from the header to manage its roles.</p>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};