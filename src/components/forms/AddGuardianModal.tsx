
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddGuardianModalProps {
  studentId: number;
  onGuardianAdded?: () => void;
}

export default function AddGuardianModal({ studentId, onGuardianAdded }: AddGuardianModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    relationship: "",
    primaryPhone: "",
    secondaryPhone: "",
    email: "",
    occupation: "",
    address: "",
    isPrimary: false,
    isEmergencyContact: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/api/students/${studentId}/guardians`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Guardian added successfully!",
        });
        setFormData({
          firstName: "",
          lastName: "",
          relationship: "",
          primaryPhone: "",
          secondaryPhone: "",
          email: "",
          occupation: "",
          address: "",
          isPrimary: false,
          isEmergencyContact: false
        });
        setOpen(false);
        onGuardianAdded?.();
      } else {
        throw new Error("Failed to add guardian");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add guardian. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Guardian
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Guardian/Parent</DialogTitle>
          <DialogDescription>
            Add guardian or parent information for the student.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="relationship">Relationship</Label>
            <Select value={formData.relationship} onValueChange={(value) => handleInputChange("relationship", value)}>
              <SelectTrigger className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FATHER">Father</SelectItem>
                <SelectItem value="MOTHER">Mother</SelectItem>
                <SelectItem value="GUARDIAN">Guardian</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryPhone">Primary Phone</Label>
              <Input
                id="primaryPhone"
                value={formData.primaryPhone}
                onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="secondaryPhone">Secondary Phone</Label>
              <Input
                id="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={(e) => handleInputChange("secondaryPhone", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              required
            />
          </div>

          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={formData.occupation}
              onChange={(e) => handleInputChange("occupation", e.target.value)}
              className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) => handleInputChange("isPrimary", !!checked)}
              />
              <Label htmlFor="isPrimary">Primary Guardian</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isEmergencyContact"
                checked={formData.isEmergencyContact}
                onCheckedChange={(checked) => handleInputChange("isEmergencyContact", !!checked)}
              />
              <Label htmlFor="isEmergencyContact">Emergency Contact</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-700 dark:border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Guardian
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
