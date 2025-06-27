
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export interface ManageRolesModalProps {
  onRolesUpdated: () => void;
}

export const ManageRolesModal: React.FC<ManageRolesModalProps> = ({ onRolesUpdated }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchRoles();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find(u => u.id.toString() === userId);
    if (user && user.roles) {
      setSelectedRoles(user.roles.map((r: any) => r.name));
    } else {
      setSelectedRoles([]);
    }
  };

  const handleRoleChange = (roleName: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleName]);
    } else {
      setSelectedRoles(selectedRoles.filter(r => r !== roleName));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/users/assign-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(selectedUserId),
          roleNames: selectedRoles
        })
      });

      if (response.ok) {
        toast.success("User roles updated successfully");
        setSelectedUserId("");
        setSelectedRoles([]);
        setOpen(false);
        onRolesUpdated();
      } else {
        toast.error("Failed to update user roles");
      }
    } catch (error) {
      console.error('Error updating user roles:', error);
      toast.error("Error updating user roles");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Roles</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage User Roles</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="user">Select User</Label>
            <Select value={selectedUserId} onValueChange={handleUserSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.username} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedUserId && (
            <div>
              <Label>Assign Roles</Label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.name)}
                      onCheckedChange={(checked) => handleRoleChange(role.name, checked === true)}
                    />
                    <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedUserId}>
              {isLoading ? "Updating..." : "Update Roles"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
