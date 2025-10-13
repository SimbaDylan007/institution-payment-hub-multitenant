import React, { useState, useEffect, FC } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiClient';
import InstitutionSelect from "./InstitutionSelect";
import RoleSelect from './RoleSelect'; // 1. Import the new component
import { User, Role } from '@/types';

interface UserToEdit extends User {
    enabled: boolean;
    roles: Role[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit: UserToEdit | null;
}

export const AddUserModal: FC<Props> = ({ isOpen, onClose, onSuccess, userToEdit }) => {
    const { isSuperAdmin, user } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [enabled, setEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
    const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([]); // 2. Add state for roles

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setUsername(userToEdit.username);
                setEmail(userToEdit.email);
                setEnabled(userToEdit.enabled);
                setPassword('');
                if (userToEdit.institution) {
                    setSelectedInstitutionId(userToEdit.institution.id.toString());
                }
                // Pre-fill roles for editing
                setSelectedRoleNames(userToEdit.roles.map(r => r.name));
            } else {
                // Reset form for a new user
                setUsername('');
                setEmail('');
                setPassword('');
                setEnabled(true);
                setSelectedInstitutionId('');
                setSelectedRoleNames([]); // Reset roles
            }
        }
    }, [userToEdit, isOpen]);

    // When the selected institution changes, reset the selected roles
    useEffect(() => {
        setSelectedRoleNames([]);
    }, [selectedInstitutionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!username || !email || (!userToEdit && !password)) {
            toast.error("Username, Email, and Password are required.");
            setLoading(false);
            return;
        }

        if (!userToEdit && selectedRoleNames.length === 0) {
            toast.error("You must select at least one role for the new user.");
            setLoading(false);
            return;
        }

        let finalInstitutionId: number | null = null;
        if (!userToEdit) {
            if (isSuperAdmin) {
                if (!selectedInstitutionId) {
                    toast.error("As a Super Admin, you must select an institution.");
                    setLoading(false);
                    return;
                }
                finalInstitutionId = parseInt(selectedInstitutionId);
            } else {
                if (user?.institutionId) {
                    finalInstitutionId = user.institutionId;
                } else {
                    toast.error("Your user profile is missing an institution.");
                    setLoading(false);
                    return;
                }
            }
        }

        const userData: any = {
            username,
            email,
            password: password || undefined,
            enabled,
            roleNames: selectedRoleNames, // 3. Use the state for selected roles
        };

        if (!userToEdit) {
            userData.institutionId = finalInstitutionId;
        }

        const url = userToEdit ? `/api/users/${userToEdit.id}` : '/api/users';
        const method = userToEdit ? 'PUT' : 'POST';

        try {
            const response = await apiFetch(url, { method, body: JSON.stringify(userData) });
            if (response.ok) {
                toast.success(`User successfully ${userToEdit ? 'updated' : 'created'}.`);
                onSuccess();
            } else {
                const error = await response.json().catch(() => ({ message: `Failed to ${userToEdit ? 'update' : 'create'} user.` }));
                throw new Error(error.message);
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
                    <DialogTitle>{userToEdit ? 'Edit User' : 'Create New User'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto p-1 pr-4">
                    {isSuperAdmin && !userToEdit && (
                        <InstitutionSelect
                            value={selectedInstitutionId}
                            onValueChange={setSelectedInstitutionId}
                        />
                    )}
                    <div><Label htmlFor="username">Username *</Label><Input id="username" value={username} onChange={e => setUsername(e.target.value)} className="bg-gray-800" required /></div>
                    <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-800" required /></div>
                    <div><Label htmlFor="password">Password {userToEdit ? '(Optional)' : '*'}</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={userToEdit ? "Leave blank to keep current password" : ""} className="bg-gray-800" required={!userToEdit} /></div>

                    {/* 4. Add the RoleSelect component to the form */}
                    <RoleSelect
                        // For a new user by a super admin, use the selected ID.
                        // For a new user by a normal admin, use their own ID.
                        // For an existing user, use their existing ID.
                        institutionId={
                            userToEdit?.institution?.id.toString() ||
                            (isSuperAdmin ? selectedInstitutionId : user?.institutionId?.toString() || '')
                        }
                        selectedRoleNames={selectedRoleNames}
                        onSelectionChange={setSelectedRoleNames}
                    />

                    <div className="flex items-center space-x-2 pt-2"><Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} /><Label htmlFor="enabled">User Enabled / Active</Label></div>
                    <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save User'}</Button></div>
                </form>
            </DialogContent>
        </Dialog>
    );
};