'use client';

import { FileBarChart, Download, Calendar, FileText, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';
import { formatDate } from '@/lib/date-utils';

const REPORTS = [
    { title: 'Daily Operational Summary', type: 'PDF', date: '2024-05-20', size: '1.2 MB' },
    { title: 'Weekly Maintenance Log', type: 'Excel', date: '2024-05-19', size: '2.4 MB' },
    { title: 'Alert History - May 2024', type: 'CSV', date: '2024-05-18', size: '856 KB' },
    { title: 'Voltage Fluctuation Analysis', type: 'PDF', date: '2024-05-15', size: '5.5 MB' },
    { title: 'Transformer Health Index', type: 'PDF', date: '2024-05-10', size: '3.1 MB' },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileBarChart className="text-[hsl(var(--primary))]" /> Reports & Analytics
                    </h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Generate, view, and download system reports.</p>
                </div>
                <Button>
                    <FileText size={16} className="mr-2" /> Generate New Report
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Featured Report Card */}
                <div className="md:col-span-2 bg-[hsl(var(--primary))] text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none" />
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Monthly Performance Review</h3>
                        <p className="opacity-90 mb-6 max-w-lg">
                            The comprehensive performance review for April 2024 is ready. This report includes uptime analysis, alert distribution, and maintenance efficiency metrics.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="secondary" className="bg-white text-[hsl(var(--primary))] hover:bg-white/90 border-none">
                                <Download size={16} className="mr-2" /> Download Full PDF
                            </Button>
                            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                View Summary
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col justify-center gap-4">
                    <h4 className="font-semibold text-gray-500 uppercase text-xs">Reports Generated (This Month)</h4>
                    <p className="text-4xl font-bold text-[hsl(var(--foreground))]">24</p>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[70%]" />
                    </div>
                    <p className="text-xs text-gray-400">70% increase vs last month</p>
                </div>
            </div>

            {/* Recent Reports List */}
            <div className="bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm">
                <div className="p-4 border-b border-[hsl(var(--border))] bg-slate-50">
                    <h3 className="font-semibold flex items-center gap-2 bg-white w-fit px-3 py-1 rounded-md border shadow-sm text-sm">
                        <Clock size={14} className="text-gray-500" /> Recent Files
                    </h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {REPORTS.map((report, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={clsx(
                                    "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase",
                                    report.type === 'PDF' && "bg-red-50 text-red-600",
                                    report.type === 'Excel' && "bg-green-50 text-green-600",
                                    report.type === 'CSV' && "bg-blue-50 text-blue-600"
                                )}>
                                    {report.type}
                                </div>
                                <div>
                                    <p className="font-medium text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                                        {report.title}
                                    </p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                                        <Calendar size={10} /> {report.date} • {report.size}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <Share2 size={16} />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                    <Download size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
