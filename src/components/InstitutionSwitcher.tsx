import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/utils/apiClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Using ShadCN Select
import { Institution } from "@/types";

const fetchInstitutions = async (): Promise<Institution[]> => {
    const response = await apiFetch('/api/institutions');
    if (!response.ok) throw new Error("Failed to fetch institutions");
    return response.json();
};

const InstitutionSwitcher = () => {
    // --- FIX #1: Use the correct variable names from the context ---
    const { user, isSuperAdmin, selectedInstitution, setSelectedInstitution } = useAuth();

    const { data: institutions, isLoading } = useQuery<Institution[], Error>({
        queryKey: ['institutions'],
        queryFn: fetchInstitutions,
        enabled: isSuperAdmin, // Only run this query if the user is a super-admin
    });

    // If the user is NOT a super-admin, just display their assigned institution name
    if (!isSuperAdmin) {
        return (
            <div className="font-semibold text-white px-3 py-1 bg-red-600/50 rounded-md">
                {user?.institutionName}
            </div>
        );
    }

    // --- FIX #2: Handler for when the super-admin changes the selection ---
    const handleSelectionChange = (value: string) => {
        if (value === 'all') {
            setSelectedInstitution('all');
        } else {
            // Find the full institution object from the fetched data
            const institution = institutions?.find(inst => inst.id.toString() === value);
            if (institution) {
                setSelectedInstitution(institution);
            }
        }
    };

    // --- FIX #3: Determine the current value for the Select component ---
    // The value must be a string.
    const currentValue = selectedInstitution === 'all'
        ? 'all'
        : selectedInstitution?.id.toString() ?? 'all';

    return (
        <Select onValueChange={handleSelectionChange} value={currentValue}>
            <SelectTrigger className="w-[220px] bg-red-800/50 border-red-600 text-white">
                <SelectValue placeholder="Select Institution..." />
            </SelectTrigger>
            <SelectContent className="bg-red-900 border-red-700 text-white">
                <SelectItem value="all">All Institutions View</SelectItem>
                {isLoading ? (
                    <div className="p-2 text-center text-gray-400">Loading...</div>
                ) : (
                    institutions?.map(inst => (
                        <SelectItem key={inst.id} value={inst.id.toString()}>{inst.name}</SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    );
};

export default InstitutionSwitcher;