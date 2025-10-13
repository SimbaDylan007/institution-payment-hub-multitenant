import React, { useState, useEffect, FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiClient';
import { Institution } from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    institutionToEdit: Institution | null;
}

export const InstitutionModal: FC<Props> = ({ isOpen, onClose, onSuccess, institutionToEdit }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [schoolEmail, setSchoolEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (institutionToEdit) {
                setName(institutionToEdit.name);
                setAddress(institutionToEdit.address || '');
                setSchoolEmail(institutionToEdit.schoolEmail || '');
            } else {
                setName('');
                setAddress('');
                setSchoolEmail('');
            }
        }
    }, [institutionToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return toast.error("Institution name is required.");
        setLoading(true);

        const payload = { name, address, schoolEmail };
        const url = institutionToEdit ? `/api/institutions/${institutionToEdit.id}` : '/api/institutions';
        const method = institutionToEdit ? 'PUT' : 'POST';

        try {
            const response = await apiFetch(url, { method, body: JSON.stringify(payload) });
            if (response.ok) {
                toast.success(`Institution successfully ${institutionToEdit ? 'updated' : 'created'}.`);
                onSuccess(); // Refresh the list in the parent component
            } else {
                const error = await response.json().catch(() => ({ message: `Failed to ${institutionToEdit ? 'update' : 'create'} institution.` }));
                throw new Error(error.message);
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
                    <DialogTitle>{institutionToEdit ? 'Edit Institution' : 'Create New Institution'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div><Label htmlFor="name">Institution Name *</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required className="bg-gray-800" /></div>
                    <div><Label htmlFor="address">Address</Label><Input id="address" value={address} onChange={e => setAddress(e.target.value)} className="bg-gray-800" /></div>
                    <div><Label htmlFor="email">School Email</Label><Input id="email" type="email" value={schoolEmail} onChange={e => setSchoolEmail(e.target.value)} className="bg-gray-800" /></div>
                    <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Institution'}</Button></div>
                </form>
            </DialogContent>
        </Dialog>
    );
};