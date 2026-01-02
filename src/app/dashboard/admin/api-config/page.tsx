'use client';

import { useState, useEffect } from 'react';
import { ApiConfigService, ApiEndpoint } from '@/lib/api-config-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TokenService, API_BASE_URL } from '@/services/api';
import {
    Search, ServerCog, Plus, Trash2, Save, Play,
    CheckCircle, XCircle, ArrowLeft, RefreshCw, Copy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { toast } from 'sonner';

export default function ApiConfigPage() {
    const router = useRouter();
    const [apis, setApis] = useState<ApiEndpoint[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'config' | 'test'>('config');

    // Editor State
    const [editForm, setEditForm] = useState<Partial<ApiEndpoint>>({});

    // Test State
    const [isTesting, setIsTesting] = useState(false);
    const [testResponse, setTestResponse] = useState<any>(null);
    const [testStatus, setTestStatus] = useState<number | null>(null);

    useEffect(() => {
        // Load initial data
        setApis(ApiConfigService.getAll());
    }, []);

    const handleSelect = (api: ApiEndpoint) => {
        setSelectedId(api.id);
        setEditForm({ ...api }); // Clone to avoid direct mutation
        setTestResponse(null);
        setTestStatus(null);
        setActiveTab('config');
    };

    const handleNew = () => {
        const newApi: ApiEndpoint = {
            id: Date.now().toString(),
            name: 'New Endpoint',
            group: 'General',
            method: 'GET',
            url: '/api/',
            description: '',
            isActive: true,
            defaultBody: '{}'
        };
        setApis([...apis, newApi]);
        handleSelect(newApi);
        setActiveTab('config');
    };

    const handleSave = () => {
        if (!selectedId || !editForm) return;

        const updatedList = apis.map(api =>
            api.id === selectedId ? { ...api, ...editForm } as ApiEndpoint : api
        );

        setApis(updatedList);
        ApiConfigService.save(updatedList);
        toast.success('Configuration saved');
    };

    const handleDelete = () => {
        if (!selectedId) return;
        if (!confirm('Delete this API configuration?')) return;

        const updatedList = apis.filter(a => a.id !== selectedId);
        setApis(updatedList);
        ApiConfigService.save(updatedList);
        setSelectedId(null);
        setEditForm({});
        toast.success('API deleted');
    };

    const handleTest = async () => {
        if (!editForm.url) return;
        setIsTesting(true);
        setTestResponse(null);
        setTestStatus(null);

        try {
            const token = TokenService.getToken();
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const fullUrl = `${API_BASE_URL}${editForm.url}`;

            const options: RequestInit = {
                method: editForm.method,
                headers
            };

            if (editForm.method !== 'GET' && editForm.defaultBody) {
                try {
                    // Validate JSON
                    JSON.parse(editForm.defaultBody);
                    options.body = editForm.defaultBody;
                } catch (e) {
                    toast.error('Invalid JSON Body');
                    setIsTesting(false);
                    return;
                }
            }

            const startTime = performance.now();
            const res = await fetch(fullUrl, options);
            const duration = Math.round(performance.now() - startTime);

            setTestStatus(res.status);

            let data;
            const text = await res.text();
            try {
                data = JSON.parse(text);
            } catch {
                data = text; // Fallback to text if not JSON
            }

            setTestResponse({
                status: res.status,
                statusText: res.statusText,
                duration: `${duration}ms`,
                data: data
            });

            if (res.ok) toast.success(`Request Success (${res.status})`);
            else toast.error(`Request Failed (${res.status})`);

        } catch (error: any) {
            setTestResponse({ error: error.message });
            toast.error('Network Error');
        } finally {
            setIsTesting(false);
        }
    };

    // Filter Logic
    const filteredApis = apis.filter(api =>
        api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in -m-6">
            {/* Negative margin to fill container if parent has padding, else adjust */}

            {/* Header */}
            <div className="bg-white border-b px-6 py-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <ServerCog className="text-blue-600" /> API Configuration
                        </h1>
                        <p className="text-xs text-muted-foreground">Manage and test backend endpoints</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" onClick={handleNew} className="gap-2">
                        <Plus size={16} /> Add Endpoint
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden bg-slate-50">
                {/* Left Sidebar: List */}
                <div className="w-80 bg-white border-r flex flex-col shrink-0">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                className="w-full bg-slate-50 border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                                placeholder="Search endpoints..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredApis.map(api => (
                            <div
                                key={api.id}
                                onClick={() => handleSelect(api)}
                                className={clsx(
                                    "p-4 border-b cursor-pointer transition-colors hover:bg-slate-50 relative group",
                                    selectedId === api.id ? "bg-blue-50 border-blue-200" : "border-slate-100"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={clsx(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                                        api.method === 'GET' && "bg-blue-100 text-blue-700 border-blue-200",
                                        api.method === 'POST' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                                        api.method === 'PUT' && "bg-amber-100 text-amber-700 border-amber-200",
                                        api.method === 'DELETE' && "bg-red-100 text-red-700 border-red-200",
                                    )}>
                                        {api.method}
                                    </span>
                                    {api.isActive ?
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" title="Active"></div> :
                                        <div className="h-2 w-2 rounded-full bg-slate-300" title="Inactive"></div>
                                    }
                                </div>
                                <h4 className="font-semibold text-sm truncate text-slate-700 mb-0.5">{api.name}</h4>
                                <p className="text-[10px] text-slate-400 font-mono truncate">{api.url}</p>
                            </div>
                        ))}
                        {filteredApis.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm">No APIs found</div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {selectedId && editForm ? (
                        <>
                            {/* Toolbar */}
                            <div className="bg-white border-b px-6 py-2 flex gap-6">
                                <button
                                    onClick={() => setActiveTab('config')}
                                    className={clsx(
                                        "py-2 text-sm font-medium border-b-2 transition-colors",
                                        activeTab === 'config' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Configuration
                                </button>
                                <button
                                    onClick={() => setActiveTab('test')}
                                    className={clsx(
                                        "py-2 text-sm font-medium border-b-2 transition-colors",
                                        activeTab === 'test' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Test & Debug
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="max-w-4xl mx-auto space-y-6">

                                    {activeTab === 'config' && (
                                        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6 animate-fade-in">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Friendly Name"
                                                    value={editForm.name || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                />
                                                <Input
                                                    label="Group / Module"
                                                    value={editForm.group || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, group: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="w-32">
                                                    <label className="text-sm font-medium text-slate-500 mb-1.5 block">Method</label>
                                                    <select
                                                        className="w-full bg-white border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                                        value={editForm.method}
                                                        onChange={(e) => setEditForm({ ...editForm, method: e.target.value as any })}
                                                    >
                                                        <option>GET</option>
                                                        <option>POST</option>
                                                        <option>PUT</option>
                                                        <option>DELETE</option>
                                                    </select>
                                                </div>
                                                <div className="flex-1">
                                                    <Input
                                                        label="Endpoint URL (Relative)"
                                                        value={editForm.url || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                                                        className="font-mono text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-slate-500 mb-1.5 block">Description</label>
                                                <textarea
                                                    className="w-full bg-white border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none h-20 resize-none"
                                                    value={editForm.description || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="isActive"
                                                    checked={editForm.isActive}
                                                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active Endpoint</label>
                                            </div>

                                            <div className="pt-4 border-t flex justify-between">
                                                <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
                                                    <Trash2 size={16} className="mr-2" /> Delete API
                                                </Button>
                                                <Button onClick={handleSave} className="gap-2">
                                                    <Save size={16} /> Save Changes
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'test' && (
                                        <div className="space-y-6 animate-fade-in">
                                            {/* Request Config */}
                                            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                                                <div className="flex items-center gap-3 font-mono text-sm bg-slate-50 p-3 rounded-lg border">
                                                    <span className={clsx(
                                                        "font-bold px-2 py-0.5 rounded text-xs",
                                                        editForm.method === 'GET' && "bg-blue-100 text-blue-700",
                                                        editForm.method === 'POST' && "bg-emerald-100 text-emerald-700",
                                                    )}>{editForm.method}</span>
                                                    <span className="text-slate-600">{API_BASE_URL}</span>
                                                    <span className="font-semibold text-slate-900">{editForm.url}</span>
                                                </div>

                                                {editForm.method !== 'GET' && (
                                                    <div>
                                                        <label className="text-xs font-semibold uppercase text-slate-400 mb-2 block tracking-wider">Request Body (JSON)</label>
                                                        <textarea
                                                            className="w-full bg-slate-900 text-slate-50 font-mono text-xs p-4 rounded-lg h-40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                            value={editForm.defaultBody || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, defaultBody: e.target.value })}
                                                            spellCheck={false}
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex justify-end">
                                                    <Button
                                                        onClick={handleTest}
                                                        disabled={isTesting}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                                                    >
                                                        {isTesting ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Play className="mr-2" size={16} />}
                                                        Send Request
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Response Viewer */}
                                            {testResponse && (
                                                <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-slide-up">
                                                    <div className={clsx(
                                                        "px-4 py-2 border-b flex justify-between items-center",
                                                        (testStatus && testStatus >= 200 && testStatus < 300) ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
                                                    )}>
                                                        <div className="flex items-center gap-3">
                                                            {testStatus && testStatus >= 200 && testStatus < 300 ?
                                                                <CheckCircle size={18} className="text-emerald-600" /> :
                                                                <XCircle size={18} className="text-red-600" />
                                                            }
                                                            <span className={clsx("font-bold", (testStatus && testStatus >= 200 && testStatus < 300) ? "text-emerald-700" : "text-red-700")}>
                                                                {testStatus} {testResponse.statusText}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-slate-500 font-mono">Time: {testResponse.duration}</span>
                                                    </div>
                                                    <div className="p-0 relative group">
                                                        <button
                                                            className="absolute top-2 right-2 p-1.5 bg-slate-700/50 text-white rounded hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(JSON.stringify(testResponse.data, null, 2));
                                                                toast.success('Copied to clipboard');
                                                            }}
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                        <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[500px]">
                                                            {JSON.stringify(testResponse.data, null, 2)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                            <ServerCog size={64} className="mb-4 opacity-20" />
                            <p className="font-medium">Select an API Endpoint to configure</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
