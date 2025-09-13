import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient"; // 1. Import the centralized apiFetch

export interface BulkUserImportModalProps {
  onUsersImported: () => void;
}

export const BulkUserImportModal: React.FC<BulkUserImportModalProps> = ({ onUsersImported }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false);

  // 2. Refactor the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // The client-side CSV parsing logic remains the same
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

      // Replace `fetch` with `apiFetch` and remove the manual headers.
      const response = await apiFetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/users/bulk-import', {
        method: 'POST',
        body: JSON.stringify({
          users,
          sendWelcomeEmail
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.length} users imported successfully`);
        setCsvData("");
        setOpen(false);
        onUsersImported();
      } else {
        // Provide more specific error feedback by parsing the server's response
        const errorData = await response.json().catch(() => ({ message: "Failed to import users. Please check the data format." }));
        throw new Error(errorData.message);
      }
    } catch (error) {
      // apiFetch will handle generic network/auth errors with its own toast.
      // This catch block will display more specific error messages from the server.
      console.error('Error importing users:', error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // The JSX for the component remains unchanged
  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Bulk Import</Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk User Import</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="csvData">CSV Data</Label>
              <Textarea
                  id="csvData"
                  placeholder="username,email,password,roles&#10;john.doe,john@example.com,password123,ROLE_STUDENT&#10;jane.smith,jane@example.com,password456,ROLE_TEACHER"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={6}
                  required
              />
              <p className="text-sm text-gray-500 mt-1">
                Format: username,email,password,roles (separated by semicolon for multiple roles)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                  type="checkbox"
                  id="sendWelcomeEmail"
                  checked={sendWelcomeEmail}
                  onChange={(e) => setSendWelcomeEmail(e.target.checked)}
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