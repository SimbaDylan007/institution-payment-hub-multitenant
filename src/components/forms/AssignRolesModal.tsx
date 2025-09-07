// src/components/forms/AssignRolesModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiClient';

interface Role { id: number; name: string; }
interface User { id: number; username: string; email: string; enabled: boolean; roles: Role[]; }

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User;
}

export const AssignRolesModal = ({ isOpen, onClose, onSuccess, user }: Props) => {
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAllRoles = async () => {
            const response = await apiFetch('http://localhost:8080/api/users/roles');
            if (response.ok) {
                setAllRoles(await response.json());
            }
        };

        if (isOpen) {
            fetchAllRoles();
            // Initialize selected roles from the user prop
            const initialRoles = new Set(user.roles.map(r => r.name));
            setSelectedRoles(initialRoles);
        }
    }, [isOpen, user]);

    const handleRoleChange = (roleName: string, isChecked: boolean) => {
        const newSelectedRoles = new Set(selectedRoles);
        if (isChecked) {
            newSelectedRoles.add(roleName);
        } else {
            newSelectedRoles.delete(roleName);
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
            const response = await apiFetch('http://localhost:8080/api/users/assign-roles', {
                method: 'POST',
                body: JSON.stringify(assignmentData)
            });
            if (response.ok) {
                toast.success(`Roles for ${user.username} updated successfully.`);
                onSuccess();
            } else {
                throw new Error("Failed to assign roles.");
            }
        } catch (error) {
            // apiFetch handles generic error toasts
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gray-900 text-white border-gray-700">
                <DialogHeader>
                    <DialogTitle>Assign Roles to {user.username}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    {allRoles.map(role => (
                        <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`role-${role.id}`}
                                checked={selectedRoles.has(role.name)}
                                onCheckedChange={(checked) => handleRoleChange(role.name, !!checked)}
                            />
                            <Label htmlFor={`role-${role.id}`}>{role.name.replace('ROLE_', '')}</Label>
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