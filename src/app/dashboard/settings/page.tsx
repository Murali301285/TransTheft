'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Bell, Lock, User, Globe, Moon, Sun, Save } from 'lucide-react';
import { clsx } from 'clsx';

const TABS = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage your account preferences and system configurations.</p>
                </div>
                <Button>
                    <Save size={16} className="mr-2" /> Save Changes
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm min-h-[500px]">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 border-r border-[hsl(var(--border))] p-4 bg-slate-50/50">
                    <nav className="space-y-1">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                                        activeTab === tab.id
                                            ? "bg-white text-[hsl(var(--primary))] shadow-sm border border-[hsl(var(--border))]"
                                            : "text-[hsl(var(--muted-foreground))] hover:bg-slate-100 hover:text-[hsl(var(--foreground))]"
                                    )}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-8">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-lg font-bold border-b pb-2">General Settings</h2>

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Application Name</label>
                                    <Input defaultValue="Transformer Guard" />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Language</label>
                                    <select className="h-10 px-3 rounded-md border text-sm">
                                        <option>English (US)</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                    </select>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Appearance</label>
                                    <div className="flex gap-4">
                                        <div className="border-2 border-[hsl(var(--primary))] bg-slate-50 p-4 rounded-lg flex flex-col items-center gap-2 w-32 cursor-pointer">
                                            <Sun size={24} />
                                            <span className="text-xs font-bold">Light</span>
                                        </div>
                                        <div className="border border-gray-200 p-4 rounded-lg flex flex-col items-center gap-2 w-32 cursor-pointer hover:bg-gray-50 text-gray-400">
                                            <Moon size={24} />
                                            <span className="text-xs font-bold">Dark</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-lg font-bold border-b pb-2">Profile Information</h2>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                    AD
                                </div>
                                <Button variant="outline" size="sm">Change Avatar</Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <Input defaultValue="Admin" />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <Input defaultValue="User" />
                                </div>
                                <div className="grid gap-2 col-span-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input defaultValue="admin@transformerguard.com" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-lg font-bold border-b pb-2">Notification Preferences</h2>
                            <div className="space-y-4">
                                {['Email Alerts for Critical Failures', 'Weekly Report Summaries', 'Maintenance Reminders', 'System Updates'].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-2">
                                        <span className="text-sm font-medium">{item}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[hsl(var(--primary))]"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center py-10 text-gray-400">
                                <Lock size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Security settings are managed by the System Administrator.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
