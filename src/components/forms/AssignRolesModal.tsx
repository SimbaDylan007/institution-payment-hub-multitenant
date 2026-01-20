import React, { useState, useEffect, FC } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiClient';
import { User, Role } from '@/types'; // Import your existing types

// --- THIS IS THE FIX ---
// We create a more specific type for the user prop in this component.
// It includes all properties of your global `User` type, PLUS the `roles` array.
interface UserWithRoles extends User {
    roles: Role[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: UserWithRoles; // Use the more specific type for the user prop
}

export const AssignRolesModal: FC<Props> = ({ isOpen, onClose, onSuccess, user }) => {
    const { isSuperAdmin } = useAuth();
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAllRoles = async () => {
            try {
                const response = await apiFetch('/api/users/roles');
                if (response.ok) {
                    let roles: Role[] = await response.json();
                    if (!isSuperAdmin) {
                        roles = roles.filter(role => role.name !== 'ROLE_SUPER_ADMIN');
                    }
                    setAllRoles(roles);
                } else {
                    toast.error("Failed to fetch available roles.");
                }
            } catch (error) { /* Handled by apiFetch */ }
        };

        if (isOpen) {
            fetchAllRoles();
            // --- THIS IS ALSO FIXED ---
            // Now that TypeScript knows `user.roles` is an array of Role objects, this line is valid.
            const initialRoles = new Set(user.roles.map(r => r.name));
            setSelectedRoles(initialRoles);
        }
    }, [isOpen, user, isSuperAdmin]);

    const handleRoleChange = (roleName: string, isChecked: boolean) => {
        const newSelectedRoles = new Set(selectedRoles);
        if (isChecked) {
            newSelectedRoles.add(roleName);
        } else {
            if (newSelectedRoles.size > 1) {
                newSelectedRoles.delete(roleName);
            } else {
                toast.warning("A user must have at least one role.");
            }
        }
        setSelectedRoles(newSelectedRoles);
    };

    const handleSubmit = async () => {
        setLoading(true);
        const assignmentData = {
            userId: user.id,
            roleNames: Array.from(selectedRoles)
        };

        try {
            const response = await apiFetch('/api/users/assign-roles', {
                method: 'POST',
                body: JSON.stringify(assignmentData)
            });
            if (response.ok) {
                toast.success(`Roles for ${user.username} updated successfully.`);
                onSuccess();
            } else {
                const errorData = await response.json().catch(() => ({ message: "Failed to assign roles." }));
                throw new Error(errorData.message);
            }
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gray-900 text-white border-gray-700">
                <DialogHeader>
                    <DialogTitle>Assign Roles to: {user.username}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    {allRoles.length === 0 && <p className="text-center text-gray-400">Loading roles...</p>}
                    {allRoles.map(role => (
                        <div key={role.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-800">
                            <Checkbox
                                id={`role-${role.id}`}
                                checked={selectedRoles.has(role.name)}
                                onCheckedChange={(checked) => handleRoleChange(role.name, !!checked)}
                            />
                            <Label htmlFor={`role-${role.id}`} className="flex-1 cursor-pointer">
                                {role.name.replace('ROLE_', '')}
                            </Label>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};