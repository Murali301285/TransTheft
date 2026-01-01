'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
    const router = useRouter();
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')} className="mb-2 pl-0 hover:bg-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                        <ArrowLeft size={16} className="mr-2" /> Back to Administration
                    </Button>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                        System Settings
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))]">Global configuration parameters.</p>
                </div>
                <Button>
                    <Save size={16} className="mr-2" /> Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                    <h3 className="font-bold mb-4">General Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">System Name</label>
                            <Input defaultValue="Transformer Guard" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Default Language</label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option>English</option>
                                <option>Kannada</option>
                                <option>Hindi</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Timezone</label>
                            <Input defaultValue="Asia/Kolkata (IST)" disabled />
                        </div>
                    </div>
                </div>

                <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                    <h3 className="font-bold mb-4">Integration Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">API Base URL</label>
                            <Input defaultValue="https://api.ttm-guard.com/v1" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Map Provider</label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option>OpenStreetMap (Leaflet)</option>
                                <option>Google Maps</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Alert Refresh Rate (sec)</label>
                            <Input type="number" defaultValue="30" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
