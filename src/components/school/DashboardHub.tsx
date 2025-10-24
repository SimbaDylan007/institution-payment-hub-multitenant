// src/components/school/DashboardHub.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";

// --- Interfaces to match backend DTOs ---
interface HubAlert { text: string; value: string; icon: string; color: string; }
interface QuickAction { text: string; link: string; icon: string; }
interface HubData { greeting: string; alerts: HubAlert[]; quickActions: QuickAction[]; }

export default function DashboardHub() {
    const [hubData, setHubData] = useState<HubData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHubData = async () => {
            setLoading(true); // Ensure loading state is true at the start
            try {
                const response = await apiFetch('http://194.163.141.113:8082/api/dashboard/hub'); // This should be the new endpoint
                if (response.ok) {
                    setHubData(await response.json());
                } else {
                    setHubData({ greeting: "Welcome!", alerts: [], quickActions: [] });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard hub data", error);
                setHubData({ greeting: "Welcome!", alerts: [], quickActions: [] });
            } finally {
                setLoading(false);
            }
        };
        fetchHubData();
    }, []);

    if (loading) {
        return <Skeleton className="h-48 w-full rounded-xl bg-gray-800" />;
    }

    if (!hubData) {
        return <div className="text-center p-8 text-gray-400">Could not load dashboard data.</div>;
    }

    const Icon = ({ name, ...props }) => {
        const LucideIcon = LucideIcons[name];
        if (!LucideIcon) return null;
        return <LucideIcon {...props} />;
    };

    return (
        <div className="p-6 bg-gradient-to-br from-red-900/50 to-white-900/50 border border-gray-700 rounded-xl space-y-6">
            <h2 className="text-2xl font-bold text-white">{hubData.greeting}</h2>

            {/* Alerts Section - Defensive check added */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(hubData.alerts || []).map(alert => (
                    <div key={alert.text} className="p-4 bg-gray-800/50 rounded-lg flex items-center gap-4">
                        <Icon name={alert.icon} className={`h-8 w-8 ${alert.color}`} />
                        <div>
                            <div className="text-2xl font-bold">{alert.value}</div>
                            <div className="text-sm text-gray-400">{alert.text}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions Section - Defensive check added */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    {(hubData.quickActions || []).map(action => (
                        <Button key={action.link} asChild variant="outline">
                            <Link to={action.link} className="flex items-center gap-2">
                                <Icon name={action.icon} size={16} /> {action.text}
                            </Link>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}