'use client';

import { useState } from 'react';
import { useContentStore, CategoryType } from '@/lib/content-store';
import { clsx } from 'clsx';
import { Plus, Settings, FileText, BookOpen, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContentManagementPage() {
    const [selectedType, setSelectedType] = useState<CategoryType>('course');
    const { content, categories } = useContentStore();

    // Filtered Content
    const filteredContent = content.filter(c => {
        const cat = categories.find(cat => cat.id === c.categoryId);
        return cat?.type === selectedType;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                        Content Management
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage courses, libraries, and upload new materials.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200">
                        <Settings size={16} />
                        Manage Categories
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20 transition-all">
                        <Plus size={16} />
                        Upload Content
                    </button>
                </div>
            </div>

            {/* Awesome Toggle */}
            <div className="flex justify-center">
                <div className="bg-slate-100 p-1.5 rounded-xl flex items-center gap-1 shadow-inner border border-white/50 w-full max-w-md">
                    <button
                        onClick={() => setSelectedType('course')}
                        className={clsx(
                            "flex-1 py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden",
                            selectedType === 'course'
                                ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        <BookOpen size={18} />
                        Courses
                        {selectedType === 'course' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-blue-500/5 z-[-1]"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setSelectedType('library')}
                        className={clsx(
                            "flex-1 py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden",
                            selectedType === 'library'
                                ? "bg-white text-purple-600 shadow-sm ring-1 ring-black/5"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        <FileText size={18} />
                        Library
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredContent.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <p>No content found in {selectedType === 'course' ? 'Courses' : 'Library'}.</p>
                        <button className="mt-2 text-blue-600 hover:underline text-sm font-medium">Upload your first item</button>
                    </div>
                ) : (
                    filteredContent.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                            <div className="flex justify-between items-start mb-3">
                                <div className={clsx(
                                    "p-2 rounded-lg",
                                    selectedType === 'course' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                                )}>
                                    {selectedType === 'course' ? <BookOpen size={20} /> : <FileText size={20} />}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Edit2 size={14} /></button>
                                    <button className="p-1.5 hover:bg-red-50 text-red-400 rounded"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">{item.title}</h3>
                            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{item.description || 'No description'}</p>
                            <div className="flex items-center justify-between text-xs text-slate-400 border-t pt-3 border-slate-50">
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                <span className={clsx("px-2 py-0.5 rounded uppercase font-bold text-[10px]", item.status === 'active' ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500")}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
