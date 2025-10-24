import React, { useState, useEffect, useCallback, FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import { Institution } from "@/types";
import { InstitutionModal } from './forms/InstitutionModal';

const InstitutionManagement: FC = () => {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [institutionToEdit, setInstitutionToEdit] = useState<Institution | null>(null);

    const fetchInstitutions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/api/institutions');
            if (response.ok) {
                setInstitutions(await response.json());
            } else {
                toast.error("Failed to load institutions.");
            }
        } catch (error) { /* Handled by apiFetch */ } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInstitutions();
    }, [fetchInstitutions]);

    const handleOpenCreateModal = () => {
        setInstitutionToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (institution: Institution) => {
        setInstitutionToEdit(institution);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure? This action cannot be undone.")) return;
        try {
            const response = await apiFetch(`/api/institutions/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("Institution deleted.");
                fetchInstitutions();
            } else {
                const error = await response.json().catch(() => ({ message: "Failed to delete institution." }));
                throw new Error(error.message);
            }
        } catch (error) {
            toast.error((error as Error).message);
        }
    };

    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <Card className="bg-gradient-to-br from-red-900/50 to-white-900/50 border-red-700">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2"><Building />Institution Management</CardTitle>
                        <Button onClick={handleOpenCreateModal} className="bg-white-600 hover:bg-white-700"><Plus className="h-4 w-4 mr-2" />Add Institution</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto max-h-60">
                        <Table>
                            <TableHeader><TableRow className="border-gray-700 hover:bg-transparent"><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {loading && <TableRow><TableCell colSpan={3} className="text-center py-4 text-gray-400">Loading...</TableCell></TableRow>}
                                {!loading && institutions.map(inst => (
                                    <TableRow key={inst.id} className="border-gray-800">
                                        <TableCell className="font-medium">{inst.name}</TableCell>
                                        <TableCell>{inst.schoolEmail}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" onClick={() => handleOpenEditModal(inst)}><Edit className="h-4 w-4"/></Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(inst.id)}><Trash2 className="h-4 w-4"/></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <InstitutionModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={() => { closeModal(); fetchInstitutions(); }}
                institutionToEdit={institutionToEdit}
            />
        </>
    );
};

export default InstitutionManagement;