// src/components/forms/AddUserModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiClient';

interface Role { id: number; name: string; }
interface User { id: number; username: string; email: string; enabled: boolean; roles: Role[]; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit: User | null;
}

export const AddUserModal = ({ isOpen, onClose, onSuccess, userToEdit }: Props) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setUsername(userToEdit.username);
      setEmail(userToEdit.email);
      setEnabled(userToEdit.enabled);
      setPassword(''); // Don't show existing password hash
    } else {
      // Reset form for new user
      setUsername('');
      setEmail('');
      setPassword('');
      setEnabled(true);
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || (!userToEdit && !password)) {
      return toast.error("Please fill in all required fields.");
    }
    setLoading(true);

    const userData = {
      username,
      email,
      password: password || null, // Send null if password is not being changed
      enabled,
      roleNames: userToEdit ? userToEdit.roles.map(r => r.name) : ["ROLE_STUDENT"] // Assign default role on creation
    };

    const url = userToEdit ? `http://localhost:8080/api/users/${userToEdit.id}` : 'http://localhost:8080/api/users';
    const method = userToEdit ? 'PUT' : 'POST';

    try {
      const response = await apiFetch(url, { method, body: JSON.stringify(userData) });
      if (response.ok) {
        toast.success(`User successfully ${userToEdit ? 'updated' : 'created'}.`);
        onSuccess();
      } else {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${userToEdit ? 'update' : 'create'} user.`);
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
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} className="bg-gray-800" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-800" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={userToEdit ? "Leave blank to keep current password" : "Required"} className="bg-gray-800" required={!userToEdit} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
              <Label htmlFor="enabled">User Enabled</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save User'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
};