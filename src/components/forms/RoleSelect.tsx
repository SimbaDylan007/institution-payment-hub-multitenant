import React, { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/utils/apiClient';
import { Role } from '@/types';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface RoleSelectProps {
    institutionId: string;
    selectedRoleNames: string[];
    onSelectionChange: (roleNames: string[]) => void;
}

const fetchRolesForInstitution = async (institutionId: string): Promise<Role[]> => {
    if (!institutionId) return [];
    const response = await apiFetch(`/api/users/roles?institutionId=${institutionId}`);

    if (!response.ok) throw new Error('Failed to fetch roles for the selected institution');
    return response.json();
};

const RoleSelect: FC<RoleSelectProps> = ({ institutionId, selectedRoleNames, onSelectionChange }) => {
    const { data: roles, isLoading } = useQuery<Role[], Error>({
        queryKey: ['roles', institutionId],
        queryFn: () => fetchRolesForInstitution(institutionId),
        enabled: !!institutionId,
    });

    const handleCheckboxChange = (roleName: string, checked: boolean) => {
        const newSelection = new Set(selectedRoleNames);
        if (checked) {
            newSelection.add(roleName);
        } else {
            newSelection.delete(roleName);
        }
        onSelectionChange(Array.from(newSelection));
    };

    return (
        <div>
            <Label>Roles *</Label>
            <div className="p-3 border border-gray-700 rounded-md max-h-40 overflow-y-auto space-y-2">
                {isLoading && <p className="text-gray-400 text-sm">Loading roles...</p>}

                {roles && roles.map(role => (
                    <div key={role.id} className="flex items-center gap-2">
                        <Checkbox
                            id={`role-${role.id}`}
                            checked={selectedRoleNames.includes(role.name)}
                            onCheckedChange={(checked) => handleCheckboxChange(role.name, !!checked)}
                        />
                        <Label htmlFor={`role-${role.id}`} className="font-normal">
                            {role.name.replace('ROLE_', '')}
                        </Label>
                    </div>
                ))}

                {!isLoading && roles?.length === 0 && institutionId && (
                    <p className="text-gray-400 text-sm">No roles found for this institution.</p>
                )}

                {!isLoading && !institutionId && (
                    <p className="text-gray-400 text-sm">Please select an institution to see available roles.</p>
                )}
            </div>
        </div>
    );
};

export default RoleSelect;