// src/components/forms/ManageRolesModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiClient';
import { Badge } from '@/components/ui/badge';

interface Role { id: number; name: string; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageRolesModal = ({ isOpen, onClose }: Props) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/users/roles');
      if(response.ok) setRoles(await response.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return toast.warning("Role name cannot be empty.");
    setLoading(true);
    try {
      const response = await apiFetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/users/roles', {
        method: 'POST',
        body: newRoleName // Sending as raw string as per backend
      });

      if (response.ok) {
        toast.success(`Role "${newRoleName}" created successfully.`);
        setNewRoleName('');
        fetchRoles(); // Refresh the list
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create role.");
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
            <DialogTitle>Manage System Roles</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-semibold mb-2">Existing Roles</h3>
              <div className="flex flex-wrap gap-2 p-2 bg-gray-800 rounded-md min-h-[50px]">
                {loading && !roles.length ? <p>Loading...</p> : roles.map(r => <Badge key={r.id}>{r.name.replace('ROLE_', '')}</Badge>)}
              </div>
            </div>
            <form onSubmit={handleCreateRole} className="space-y-2">
              <Label htmlFor="newRoleName">Create New Role</Label>
              <div className="flex gap-2">
                <Input id="newRoleName" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="e.g., LIBRARIAN" className="bg-gray-800" />
                <Button type="submit" disabled={loading}>Create</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
  );
};