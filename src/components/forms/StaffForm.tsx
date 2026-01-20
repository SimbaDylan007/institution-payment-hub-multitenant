import { useState, useEffect, FC } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth to get user context
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import InstitutionSelect from "./InstitutionSelect"; // Import the reusable InstitutionSelect component
import { Staff } from "@/types"; // Import the Staff type

interface StaffFormProps {
    staff?: Staff | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const initialFormData: Partial<Staff> = {
    firstName: '', lastName: '', email: '', phone: '', address: '',
    department: 'ADMINISTRATION', position: '', employmentStatus: 'ACTIVE',
    hireDate: new Date().toISOString().split('T')[0],
    salary: "", qualifications: '', specializations: ''
};

const StaffForm: FC<StaffFormProps> = ({ staff, onSuccess, onCancel }) => {
    const { isSuperAdmin } = useAuth(); // <-- Get super-admin status
    const [formData, setFormData] = useState<Partial<Staff>>(initialFormData);
    const [loading, setLoading] = useState(false);

    // --- NEW STATE for the super-admin's institution selection ---
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');

    useEffect(() => {
        if (staff) {
            setFormData({
                ...staff,
                hireDate: staff.hireDate || new Date().toISOString().split('T')[0],
            });
            // If editing, set the initial institution ID for the dropdown
            // This assumes your Staff type from the API includes the institution object
            if (isSuperAdmin && staff.institution) {
                setSelectedInstitutionId(staff.institution.id.toString());
            }
        } else {
            // If adding a new staff member, reset the form.
            setFormData(initialFormData);
            setSelectedInstitutionId('');
        }
    }, [staff, isSuperAdmin]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.firstName || !formData.lastName || !formData.email) {
            toast.error("First Name, Last Name, and Email are required.");
            setLoading(false);
            return;
        }

        // --- TENANCY LOGIC ---
        // Prepare the data payload to send to the backend
        const payload: never = { ...formData };

        // If the user is a super-admin and is CREATING a new staff member,
        // they must have selected an institution.
        if (isSuperAdmin && !staff?.id) {
            if (!selectedInstitutionId) {
                toast.error("As a Super Admin, you must select an institution when creating new staff.");
                setLoading(false);
                return;
            }
            payload.institutionId = parseInt(selectedInstitutionId);
        }
        // For regular admins, the backend will automatically use their own institution.
        // For super-admin edits, the institution is not changed.

        try {
            // Use the full URL as per your other components
            const url = staff?.id
                ? `/api/staff/${staff.id}`
                : '/api/staff';

            const method = staff?.id ? 'PUT' : 'POST';

            const response = await apiFetch(url, { method, body: JSON.stringify(payload) });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "An unknown server error occurred." }));
                throw new Error(errorData.message);
            }

            toast.success(`Staff member successfully ${staff ? 'updated' : 'created'}.`);
            onSuccess();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">

            {/* --- ADD THE REUSABLE INSTITUTION SELECTOR --- */}
            {/* It will only render if the user is a super-admin and is CREATING a new staff member. */}
            {!staff?.id && (
                <InstitutionSelect
                    value={selectedInstitutionId}
                    onValueChange={setSelectedInstitutionId}
                />
            )}

            <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="firstName">First Name *</Label><Input id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleChange} required className="bg-gray-800"/></div>
                <div><Label htmlFor="lastName">Last Name *</Label><Input id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleChange} required className="bg-gray-800"/></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {staff && (
                    <div>
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input id="employeeId" name="employeeId" value={formData.employeeId || ''} readOnly disabled className="bg-gray-900 cursor-not-allowed"/>
                    </div>
                )}
                <div className={staff ? "" : "col-span-2"}>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required className="bg-gray-800" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} className="bg-gray-800"/></div>
                <div><Label htmlFor="hireDate">Hire Date</Label><Input id="hireDate" name="hireDate" type="date" value={formData.hireDate || ''} onChange={handleChange} className="bg-gray-800"/></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={formData.department || ''} onValueChange={(value) => handleSelectChange('department', value)}><SelectTrigger className="bg-gray-800"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACADEMICS">Academics</SelectItem>
                            <SelectItem value="ADMINISTRATION">Administration</SelectItem>
                            <SelectItem value="FINANCE">Finance</SelectItem>
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="SUPPORT">Support</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="position">Position</Label><Input id="position" name="position" value={formData.position || ''} onChange={handleChange} className="bg-gray-800"/></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="employmentStatus">Employment Status *</Label>
                    <Select value={formData.employmentStatus || 'ACTIVE'} onValueChange={(value) => handleSelectChange('employmentStatus', value)}><SelectTrigger className="bg-gray-800"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="salary">Salary</Label><Input id="salary" type="number" value={formData.salary || ''} name="salary" onChange={handleChange} className="bg-gray-800"/></div>
            </div>

            <div><Label htmlFor="address">Address</Label><Input id="address" name="address" value={formData.address || ''} onChange={handleChange} className="bg-gray-800"/></div>
            <div><Label htmlFor="qualifications">Qualifications</Label><Input id="qualifications" name="qualifications" value={formData.qualifications || ''} onChange={handleChange} className="bg-gray-800"/></div>
            <div><Label htmlFor="specializations">Specializations</Label><Input id="specializations" name="specializations" value={formData.specializations || ''} onChange={handleChange} className="bg-gray-800"/></div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (staff ? 'Update Staff' : 'Create Staff')}</Button>
            </div>
        </form>
    );
}

export default StaffForm;