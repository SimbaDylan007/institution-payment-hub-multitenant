// src/components/forms/AddFacilityModal.tsx

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiClient';

interface Facility {
  id?: number;
  name: string;
  description?: string;
  type: string;
  capacity?: number;
  location?: string;
  status: string;
  equipment?: string;
}

interface Props {
  facilityToEdit?: Facility | null;
  onSuccess: () => void;
}

export default function AddFacilityModal({ facilityToEdit, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Facility>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(facilityToEdit || { type: 'CLASSROOM', status: 'AVAILABLE' });
    }
  }, [isOpen, facilityToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      return toast.error("Name and Type are required.");
    }
    setLoading(true);

    const url = facilityToEdit ? `/api/facilities/${facilityToEdit.id}` : '/api/facilities';
    const method = facilityToEdit ? 'PUT' : 'POST';

    try {
      const response = await apiFetch(url, { method, body: JSON.stringify(formData) });
      if (response.ok) {
        toast.success(`Facility successfully ${facilityToEdit ? 'updated' : 'created'}.`);
        onSuccess();
        setIsOpen(false);
      } else {
        throw new Error("Failed to save facility.");
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {facilityToEdit ? (
              <Button variant="outline" size="sm">Edit</Button>
          ) : (
              <Button className="bg-green-600 hover:bg-green-700 text-white"><Plus size={16} className="mr-2"/>Add Facility</Button>
          )}
        </DialogTrigger>
        <DialogContent className="dark:bg-gray-900 dark:text-white dark:border-gray-700">
          <DialogHeader><DialogTitle>{facilityToEdit ? 'Edit Facility' : 'Create New Facility'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div><Label htmlFor="name">Name</Label><Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="dark:bg-gray-800"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="type">Type</Label><Select name="type" value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}><SelectTrigger className="dark:bg-gray-800"><SelectValue/></SelectTrigger><SelectContent className="dark:bg-gray-800"><SelectItem value="CLASSROOM">Classroom</SelectItem><SelectItem value="LABORATORY">Laboratory</SelectItem><SelectItem value="LIBRARY">Library</SelectItem><SelectItem value="AUDITORIUM">Auditorium</SelectItem><SelectItem value="SPORTS">Sports</SelectItem><SelectItem value="OFFICE">Office</SelectItem></SelectContent></Select></div>
              <div><Label htmlFor="status">Status</Label><Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}><SelectTrigger className="dark:bg-gray-800"><SelectValue/></SelectTrigger><SelectContent className="dark:bg-gray-800"><SelectItem value="AVAILABLE">Available</SelectItem><SelectItem value="OCCUPIED">Occupied</SelectItem><SelectItem value="MAINTENANCE">Under Maintenance</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="location">Location</Label><Input id="location" name="location" value={formData.location || ''} onChange={handleChange} className="dark:bg-gray-800"/></div>
              <div><Label htmlFor="capacity">Capacity</Label><Input id="capacity" name="capacity" type="number" value={formData.capacity || ''} onChange={handleChange} className="dark:bg-gray-800"/></div>
            </div>
            <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} className="dark:bg-gray-800"/></div>
            <div><Label htmlFor="equipment">Key Equipment</Label><Input id="equipment" name="equipment" value={formData.equipment || ''} onChange={handleChange} placeholder="e.g., Projector, Whiteboard" className="dark:bg-gray-800"/></div>
            <div className="flex justify-end pt-2 gap-2"><Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
  );
}