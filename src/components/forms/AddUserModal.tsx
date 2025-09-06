import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient"; // 1. Import the centralized apiFetch

export interface AddUserModalProps {
  onUserAdded: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ onUserAdded }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    enabled: true,
    roleNames: [] as string[]
  });

  useEffect(() => {
    // Fetch roles when the component mounts or is first opened, if not already fetched.
    if (roles.length === 0) {
      fetchRoles();
    }
  }, []);

  // 2. Refactor fetchRoles
  const fetchRoles = async () => {
    try {
      const response = await apiFetch('http://localhost:8080/api/users/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        toast.error("Could not load user roles.");
      }
    } catch (error) {
      // apiFetch will have already shown a toast for network/auth errors
      console.error('Error fetching roles:', error);
    }
  };

  const handleRoleChange = (roleName: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, roleNames: [...formData.roleNames, roleName] });
    } else {
      setFormData({ ...formData, roleNames: formData.roleNames.filter(r => r !== roleName) });
    }
  };

  // 3. Refactor handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use apiFetch and remove the manual headers
      const response = await apiFetch('http://localhost:8080/api/users', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("User created successfully");
        setFormData({ // Reset form on success
          username: "",
          password: "",
          email: "",
          enabled: true,
          roleNames: []
        });
        setOpen(false);
        onUserAdded();
      } else {
        // Provide more specific error feedback from the server
        const errorData = await response.json().catch(() => ({ message: "Failed to create user. Please check the details and try again." }));
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // The JSX for the component remains unchanged
  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add User</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked === true })}
              />
              <Label htmlFor="enabled">User Enabled</Label>
            </div>
            <div>
              <Label>Roles</Label>
              <div className="space-y-2">
                {roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                          id={`role-${role.id}`}
                          checked={formData.roleNames.includes(role.name)}
                          onCheckedChange={(checked) => handleRoleChange(role.name, checked === true)}
                      />
                      <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
                    </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
};