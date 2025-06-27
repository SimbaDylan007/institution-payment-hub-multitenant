
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export interface BulkUserImportModalProps {
  onUsersImported: () => void;
}

export const BulkUserImportModal: React.FC<BulkUserImportModalProps> = ({ onUsersImported }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Parse CSV data (simple format: username,email,password,roles)
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

      const response = await fetch('http://localhost:8080/api/users/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        toast.error("Failed to import users");
      }
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error("Error importing users");
    } finally {
      setIsLoading(false);
    }
  };

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
