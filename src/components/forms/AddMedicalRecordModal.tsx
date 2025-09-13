
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
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddMedicalRecordModalProps {
  studentId: number;
  onRecordAdded?: () => void;
}

export default function AddMedicalRecordModal({ studentId, onRecordAdded }: AddMedicalRecordModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    recordType: "",
    title: "",
    description: "",
    recordDate: "",
    doctorName: "",
    hospitalName: "",
    medications: "",
    allergies: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/students/${studentId}/medical-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Medical record added successfully!",
        });
        setFormData({
          recordType: "",
          title: "",
          description: "",
          recordDate: "",
          doctorName: "",
          hospitalName: "",
          medications: "",
          allergies: "",
          notes: ""
        });
        setOpen(false);
        onRecordAdded?.();
      } else {
        throw new Error("Failed to add medical record");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add medical record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Medical Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
        <DialogHeader>
          <DialogTitle>Add Medical Record</DialogTitle>
          <DialogDescription>
            Add a new medical record for the student.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recordType">Record Type</Label>
              <Select value={formData.recordType} onValueChange={(value) => handleInputChange("recordType", value)}>
                <SelectTrigger className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VACCINATION">Vaccination</SelectItem>
                  <SelectItem value="ALLERGY">Allergy</SelectItem>
                  <SelectItem value="MEDICATION">Medication</SelectItem>
                  <SelectItem value="CHECKUP">Checkup</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recordDate">Record Date</Label>
              <Input
                id="recordDate"
                type="date"
                value={formData.recordDate}
                onChange={(e) => handleInputChange("recordDate", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="doctorName">Doctor Name</Label>
              <Input
                id="doctorName"
                value={formData.doctorName}
                onChange={(e) => handleInputChange("doctorName", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="hospitalName">Hospital Name</Label>
              <Input
                id="hospitalName"
                value={formData.hospitalName}
                onChange={(e) => handleInputChange("hospitalName", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medications">Medications</Label>
              <Textarea
                id="medications"
                value={formData.medications}
                onChange={(e) => handleInputChange("medications", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange("allergies", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
                rows={2}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              rows={2}
            />
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
              Add Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
