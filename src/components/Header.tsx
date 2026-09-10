'use client';

import { Bell, Menu, Search, User, LogOut, Sun, Moon, ArrowLeft, Camera, Trash2, KeyRound } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export function Header({ onMenuClick, hideMenuTrigger = false, hideSearch = false }: { onMenuClick: () => void, hideMenuTrigger?: boolean, hideSearch?: boolean }) {
    const { user, logout, updateUser } = useAppStore();
    const { t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();

    // Menu and Modal States
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Profile Details States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [remarks, setRemarks] = useState('');
    const [photo, setPhoto] = useState<string | undefined>(undefined);

    // Password States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state when profile modal opens
    useEffect(() => {
        if (isProfileOpen && user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setRemarks(user.remarks || '');
            setPhoto(user.photo);

            // Reset passwords
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    }, [isProfileOpen, user]);

    const handleLogout = () => {
        logout();
        router.push('/login');
        toast.success("Logged out successfully");
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 5MB Limit check
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size exceeds 5MB limit. Please select a smaller image.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhoto(reader.result as string);
            toast.success("Photo uploaded successfully");
        };
        reader.readAsDataURL(file);
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleRemovePhoto = () => {
        setPhoto(undefined);
        if (fileInputRef.current) fileInputRef.current.value = '';
        toast.info("Photo removed");
    };

    const handleSaveProfile = () => {
        // Validate Password update if any password field is touched
        if (currentPassword || newPassword || confirmPassword) {
            if (!currentPassword || !newPassword || !confirmPassword) {
                toast.error("Please fill in all password fields to change password.");
                return;
            }
            if (newPassword !== confirmPassword) {
                toast.error("New password and confirm password do not match.");
                return;
            }
            // Mock password save
            toast.success("Password changed successfully!");
        }

        // Save profile details
        const fullName = `${firstName} ${lastName}`.trim() || user?.name || 'Guest';
        updateUser({
            firstName,
            lastName,
            remarks,
            photo,
            name: fullName
        });

        setIsProfileOpen(false);
        toast.success("Profile updated successfully!");
    };

    return (
        <header className="h-16 border-b border-white/10 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 fixed top-0 w-full z-40 flex items-center justify-between px-4 lg:px-6 shadow-md text-white">
            {/* Left Corner: Menu & Brand Icon */}
            <div className="flex items-center gap-4">
                {!hideMenuTrigger && (
                    <button
                        onClick={onMenuClick}
                        className="p-2 hover:bg-white/10 rounded-full lg:hidden text-white"
                    >
                        <Menu size={24} />
                    </button>
                )}
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
                    title="Go Back"
                >
                    <ArrowLeft size={20} />
                </button>
                <Link href="/dashboard/home" className="flex items-center gap-2 text-white cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                        TG
                    </div>
                    <span className="font-bold text-lg hidden sm:block">{t('app.title')}</span>
                </Link>
            </div>

            {/* Right Corner: Utilities */}
            <div className="flex items-center gap-4">
                <LanguageSelector />

                <div className="h-8 w-[1px] bg-white/10" />

                <div className="flex items-center gap-3">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-medium text-white">{user?.name || 'Guest'}</p>
                        <p className="text-xs text-blue-300 uppercase">{user?.role || 'Viewer'}</p>
                    </div>
                    
                    {/* User Profile Context Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white ring-1 ring-white/20 overflow-hidden hover:bg-white/20 transition-colors"
                            title="User Menu"
                        >
                            {user?.photo ? (
                                <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User size={20} />
                            )}
                        </button>
                        
                        {isUserMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-fade-in text-slate-200">
                                    <div className="px-4 py-2 border-b border-white/5">
                                        <p className="text-xs text-blue-300 uppercase font-semibold tracking-wider">Signed In As</p>
                                        <p className="text-sm font-bold truncate text-white">{user?.name}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            setIsProfileOpen(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                                    >
                                        <User size={16} className="text-blue-400" />
                                        Profile Settings
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            setIsLogoutConfirmOpen(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2 border-t border-white/5"
                                    >
                                        <LogOut size={16} className="text-red-400" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Direct Logout Button */}
                    <button
                        onClick={() => setIsLogoutConfirmOpen(true)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={isLogoutConfirmOpen}
                onClose={() => setIsLogoutConfirmOpen(false)}
                title="Confirm Logout"
            >
                <div className="space-y-6 text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600 ring-4 ring-red-50">
                        <LogOut size={32} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-bold text-slate-900">Confirm Logout</h4>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                            Are you sure you want to log out of Transformer Guard? Your current session will end.
                        </p>
                    </div>
                    <div className="flex gap-3 justify-center pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsLogoutConfirmOpen(false)}
                            className="w-28 text-slate-700 bg-slate-100 hover:bg-slate-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleLogout}
                            className="w-28 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Profile Editing Modal */}
            <Modal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                title="User Profile Settings"
            >
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
                    {/* Avatar Upload Grid Section */}
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="relative group w-24 h-24 rounded-full ring-4 ring-blue-500/10 overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 shadow-inner">
                            {photo ? (
                                <img src={photo} alt="Avatar Preview" className="w-full h-full object-cover" />
                            ) : (
                                <User size={44} className="text-slate-400" />
                            )}
                            <button
                                type="button"
                                onClick={triggerFileSelect}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                title="Change Photo"
                            >
                                <Camera size={20} />
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={triggerFileSelect} className="h-8 text-xs font-semibold">
                                Upload Photo
                            </Button>
                            {photo && (
                                <Button variant="ghost" size="sm" onClick={handleRemovePhoto} className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 size={14} className="mr-1" /> Remove
                                </Button>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400">Max size 5MB (JPG, PNG, GIF)</p>
                    </div>

                    {/* Personal Details Form Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-1.5 flex items-center gap-2">
                            <User size={16} className="text-blue-500" /> Contact Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                placeholder="Enter first name"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                            />
                            <Input
                                label="Last Name"
                                placeholder="Enter last name"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                            />
                            <Input
                                label="Email Address"
                                value={user?.email || ''}
                                disabled
                                className="bg-slate-100 cursor-not-allowed opacity-75 text-slate-500 font-semibold border-slate-200"
                                title="Email address cannot be changed"
                            />
                            <Input
                                label="Mobile Number"
                                value={user?.mobile || '+91 98765 43210'}
                                disabled
                                className="bg-slate-100 cursor-not-allowed opacity-75 text-slate-500 font-semibold border-slate-200"
                                title="Mobile number cannot be changed"
                            />
                        </div>
                        <div className="space-y-1.5 w-full">
                            <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] block">Remarks</label>
                            <textarea
                                className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg py-2.5 px-4 text-[hsl(var(--foreground))] text-sm placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all min-h-[80px]"
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                placeholder="Add profile remarks..."
                            />
                        </div>
                    </div>

                    {/* Change Password Form Section */}
                    <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-1.5 flex items-center gap-2">
                            <KeyRound size={16} className="text-blue-500" /> Change Password
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                type="password"
                                label="Current Password"
                                placeholder="••••••••"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                            />
                            <Input
                                type="password"
                                label="New Password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                            <Input
                                type="password"
                                label="Confirm Password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Modal Footer Controls */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="ghost" onClick={() => setIsProfileOpen(false)} className="text-slate-600 bg-slate-100 hover:bg-slate-200">
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Modal>
        </header>
    );
}
