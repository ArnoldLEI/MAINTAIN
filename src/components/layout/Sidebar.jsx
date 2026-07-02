import React from 'react';
import { Briefcase, Plus, Search, Building2, Clock, Pencil, Trash2, Database } from 'lucide-react';
import { getProjectQuarterData } from '../../utils/dateUtils';

export default function Sidebar({
    projects,
    selectedProjectId,
    onSelectProject,
    onAddProject,
    onEditProject,
    onDeleteProject,
    searchTerm,
    setSearchTerm
}) {
    // Filter projects locally for display
    const filteredProjects = projects.filter(p =>
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.includes(searchTerm) ||
        (p.clientName && p.clientName.includes(searchTerm))
    );

    return (
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0 h-full">
            <div className="p-4 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-blue-700">
                        <Briefcase className="w-6 h-6" />
                        <h1 className="text-xl font-bold tracking-tight">維護管理</h1>
                    </div>
                    <button
                        onClick={onAddProject}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg shadow-sm transition-colors"
                        title="新增案號"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="搜尋案號、客戶..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredProjects.map(project => {
                    const qInfo = getProjectQuarterData(project);
                    return (
                        <button
                            key={project.id}
                            onClick={() => onSelectProject(project.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 border group relative ${selectedProjectId === project.id
                                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedProjectId === project.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {project.id}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                    {qInfo.range}
                                </span>
                            </div>
                            <h3 className={`font-medium truncate ${selectedProjectId === project.id ? 'text-blue-900' : 'text-slate-700'}`}>
                                {project.name}
                            </h3>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Building2 className="w-3 h-3" /> {project.clientName}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                    <Clock className="w-3 h-3" />
                                    <span>剩 {qInfo.daysLeft} 天</span>
                                </div>
                            </div>
                            <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${project.progress === 100 ? 'bg-emerald-500' :
                                            project.progress > 80 ? 'bg-blue-500' : 'bg-orange-400'
                                        }`}
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>

                            <div
                                onClick={(e) => onEditProject(e, project)}
                                className="absolute bottom-2 right-9 p-1.5 rounded-full text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-500 transition-all z-10"
                                title="編輯案號與點位"
                            >
                                <Pencil className="w-4 h-4" />
                            </div>

                            <div
                                onClick={(e) => onDeleteProject(e, project)}
                                className="absolute bottom-2 right-2 p-1.5 rounded-full text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all z-10"
                                title="刪除案號"
                            >
                                <Trash2 className="w-4 h-4" />
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="p-2 border-t border-slate-100 flex items-center justify-center text-xs text-slate-400 bg-slate-50">
                <Database className="w-3 h-3 mr-1 text-green-500" />
                系統狀態: 準備就緒 (S)
            </div>
        </div>
    );
}
