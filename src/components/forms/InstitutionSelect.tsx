import { FC } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/utils/apiClient";
import { Institution } from "@/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const fetchInstitutions = async (): Promise<Institution[]> => {
    const response = await apiFetch('/api/institutions');
    if (!response.ok) throw new Error("Failed to fetch institutions");
    return response.json();
};

interface InstitutionSelectProps {
    value: string;
    onValueChange: (value: string) => void;
}

const InstitutionSelect: FC<InstitutionSelectProps> = ({ value, onValueChange }) => {
    const { isSuperAdmin } = useAuth();

    const { data: institutions, isLoading } = useQuery<Institution[], Error>({
        queryKey: ['institutions'],
        queryFn: fetchInstitutions,
        enabled: isSuperAdmin, // Only run this query if the user is a super-admin
    });

    // If not a super-admin, this component renders nothing
    if (!isSuperAdmin) {
        return null;
    }

    if (isLoading) {
        return (
            <div>
                <Label>Institution *</Label>
                <Skeleton className="h-10 w-full bg-gray-700" />
            </div>
        );
    }

    return (
        <div>
            <Label htmlFor="institution">Institution *</Label>
            <Select name="institutionId" required value={value} onValueChange={onValueChange}>
                <SelectTrigger className="bg-gray-800">
                    <SelectValue placeholder="Select an institution..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800">
                    {institutions?.map(inst => (
                        <SelectItem key={inst.id} value={inst.id.toString()}>{inst.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default InstitutionSelect;