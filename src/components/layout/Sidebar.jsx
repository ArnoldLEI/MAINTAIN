import React from 'react';
import { Briefcase, Plus, Search, Building2, Clock, Pencil, Trash2, Database } from 'lucide-react';
import { getProjectQuarterData } from '../../utils/dateUtils';

export default function Sidebar({
    projects,
    tasks = [],
    selectedProjectId,
    selectedDistrict,
    viewType = 'project',
    setViewType,
    onSelectProject,
    onSelectDistrict,
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

    // Extract unique districts from tasks
    const districts = React.useMemo(() => {
        const dSet = new Set(tasks.map(t => t.district).filter(Boolean));
        return Array.from(dSet).sort();
    }, [tasks]);

    const filteredDistricts = React.useMemo(() => {
        return districts.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [districts, searchTerm]);

    const districtStats = React.useMemo(() => {
        const stats = {};
        districts.forEach(d => {
            const dTasks = tasks.filter(t => t.district === d);
            const total = dTasks.length;
            const completed = dTasks.filter(t => t.status === 'Completed').length;
            const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
            stats[d] = { total, completed, progress };
        });
        return stats;
    }, [districts, tasks]);

    return (
        <div className="w-full lg:w-80 bg-slate-900 border-r border-slate-800 flex flex-col shadow-lg z-10 shrink-0 h-full">
            <div className="p-4 border-b border-slate-800">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Briefcase className="w-6 h-6" />
                        <h1 className="text-xl font-bold tracking-tight text-slate-100">維護管理</h1>
                    </div>
                    {viewType === 'project' && (
                        <button
                            onClick={onAddProject}
                            className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg shadow-md transition-colors"
                            title="新增案號"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Segment Toggle */}
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold mb-3">
                    <button
                        onClick={() => setViewType('project')}
                        className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${viewType === 'project' ? 'bg-slate-800 text-blue-450 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-350'}`}
                    >
                        <Briefcase className="w-3.5 h-3.5" />
                        依案號
                    </button>
                    <button
                        onClick={() => setViewType('district')}
                        className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${viewType === 'district' ? 'bg-slate-800 text-purple-400 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-355'}`}
                    >
                        <Building2 className="w-3.5 h-3.5" />
                        依行政區
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder={viewType === 'project' ? "搜尋案號、客戶..." : "搜尋行政區..."}
                        className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-505 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {viewType === 'project' ? (
                    filteredProjects.map(project => {
                        const qInfo = getProjectQuarterData(project);
                        const isSelected = selectedProjectId === project.id;
                        return (
                            <button
                                key={project.id}
                                onClick={() => onSelectProject(project.id)}
                                className={`w-full text-left p-3 rounded-xl transition-all duration-200 border group relative ${isSelected
                                        ? 'bg-slate-800/80 border-blue-500 shadow-md'
                                        : 'bg-slate-900/55 border-transparent hover:bg-slate-800/40 hover:border-slate-700'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-900/60 text-blue-300 border border-blue-800' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                        {project.id}
                                    </span>
                                    <span className="text-xs text-slate-500 font-mono">
                                        {qInfo.range}
                                    </span>
                                </div>
                                <h3 className={`font-medium truncate ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                                    {project.name}
                                </h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Building2 className="w-3 h-3 text-slate-500" /> {project.clientName}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/40 border border-amber-900/30 px-1.5 py-0.5 rounded">
                                        <Clock className="w-3 h-3" />
                                        <span>剩 {qInfo.daysLeft} 天</span>
                                    </div>
                                </div>
                                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${project.progress === 100 ? 'bg-emerald-500' :
                                                project.progress > 80 ? 'bg-blue-500' : 'bg-orange-500'
                                            }`}
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>

                                <div
                                    onClick={(e) => onEditProject(e, project)}
                                    className="absolute bottom-2 right-9 p-1.5 rounded-full text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-slate-700 hover:text-blue-400 transition-all z-10"
                                    title="編輯案號與點位"
                                >
                                    <Pencil className="w-4 h-4" />
                                </div>

                                <div
                                    onClick={(e) => onDeleteProject(e, project)}
                                    className="absolute bottom-2 right-2 p-1.5 rounded-full text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-slate-700 hover:text-red-400 transition-all z-10"
                                    title="刪除案號"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </div>
                            </button>
                        );
                    })
                ) : (
                    filteredDistricts.map(districtName => {
                        const isSelected = selectedDistrict === districtName;
                        const stats = districtStats[districtName] || { total: 0, completed: 0, progress: 0 };
                        return (
                            <button
                                key={districtName}
                                onClick={() => onSelectDistrict(districtName)}
                                className={`w-full text-left p-3 rounded-xl transition-all duration-200 border group relative ${isSelected
                                        ? 'bg-slate-800/80 border-purple-500 shadow-md'
                                        : 'bg-slate-900/55 border-transparent hover:bg-slate-800/40 hover:border-slate-700'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1 font-bold">
                                        行政區
                                    </span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${stats.progress === 100 ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-purple-400'
                                        }`}>
                                        {stats.progress}%
                                    </span>
                                </div>
                                <h3 className={`font-medium truncate ${isSelected ? 'text-purple-300' : 'text-slate-200'}`}>
                                    {districtName}
                                </h3>
                                <div className="flex justify-between items-center mt-2 text-xs text-slate-400 font-semibold">
                                    <span>共 {stats.total} 筆點位</span>
                                    <span>已保養 {stats.completed} 筆</span>
                                </div>
                                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${stats.progress === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                        style={{ width: `${stats.progress}%` }}
                                    />
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            <div className="p-2 border-t border-slate-800 flex items-center justify-center text-xs text-slate-500 bg-slate-950">
                <Database className="w-3 h-3 mr-1 text-green-500" />
                系統狀態: 準備就緒 (S)
            </div>
        </div>
    );
}
