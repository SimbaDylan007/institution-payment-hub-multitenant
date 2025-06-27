
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BulkUserImportModalProps {
  onUsersImported: () => void;
}

export default function BulkUserImportModal({ onUsersImported }: BulkUserImportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const users = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const user: any = {};
        headers.forEach((header, index) => {
          if (header === 'roleNames') {
            user[header] = values[index] ? values[index].split(';') : [];
          } else if (header === 'enabled') {
            user[header] = values[index]?.toLowerCase() === 'true';
          } else {
            user[header] = values[index];
          }
        });
        return user;
      });

      const response = await fetch("http://localhost:8080/api/users/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          users,
          sendWelcomeEmail
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully imported ${result.length} users!`);
        setCsvData("");
        setIsOpen(false);
        onUsersImported();
      } else {
        toast.error("Failed to import users");
      }
    } catch (error) {
      console.error("Error importing users:", error);
      toast.error("Error importing users");
    } finally {
      setIsLoading(false);
    }
  };

  const sampleCsv = `username,password,email,enabled,roleNames
john.doe,password123,john@school.com,true,ROLE_TEACHER
jane.smith,password456,jane@school.com,true,ROLE_STUDENT
admin.user,admin123,admin@school.com,true,ROLE_ADMIN;ROLE_TEACHER`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Users</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="csvData">CSV Data</Label>
            <Textarea
              id="csvData"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste your CSV data here..."
              className="min-h-[200px]"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Format: username,password,email,enabled,roleNames (separated by semicolons)
            </p>
          </div>

          <div>
            <Label>Sample CSV Format:</Label>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
              {sampleCsv}
            </pre>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendWelcomeEmail"
              checked={sendWelcomeEmail}
              onCheckedChange={(checked) => setSendWelcomeEmail(checked as boolean)}
            />
            <Label htmlFor="sendWelcomeEmail">Send Welcome Email</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Import Users
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
