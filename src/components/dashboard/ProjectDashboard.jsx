import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, AlertCircle, Calendar, Building2, BarChart3, ListFilter, CheckCircle2, Filter, History, Ban, FileEdit, Clock, AlertTriangle, Info } from 'lucide-react';
import { getProjectQuarterData, getDaysDiff } from '../../utils/dateUtils';
import { ConfirmCompletionModal, EditTaskDateModal } from '../modals/TaskModals';

export default function ProjectDashboard({ project, tasks, updateTask, viewType = 'project' }) {
    const [viewMode, setViewMode] = useState('pending');
    const [taskDistrictFilter, setTaskDistrictFilter] = useState('All');

    // Modals state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, taskId: null, taskName: null });
    const [completionDate, setCompletionDate] = useState('');
    const [editModal, setEditModal] = useState({ isOpen: false, taskId: null, taskName: null, currentDate: '' });

    // Reset filter when project changes
    useEffect(() => {
        setTaskDistrictFilter('All');
        setViewMode('pending');
    }, [project?.id, project?.name]);

    const projectQuarterInfo = useMemo(() => getProjectQuarterData(project), [project]);

    const projectStats = useMemo(() => {
        if (!project) return null;
        const projectTasks = tasks;
        const completedCount = projectTasks.filter(t => t.status === 'Completed').length;
        const totalCount = projectTasks.length;
        const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
        const involvedDistricts = [...new Set(projectTasks.map(t => t.district))].sort();
        const involvedProjects = [...new Set(projectTasks.map(t => t.projectId))].sort();

        return { completedCount, totalCount, progress, involvedDistricts, involvedProjects };
    }, [project, tasks]);

    const displayedTasks = useMemo(() => {
        if (!project) return [];
        const targetStatus = viewMode === 'pending' ? 'Pending' : 'Completed';
        let filteredTasks = tasks.filter(t => t.status === targetStatus);

        if (taskDistrictFilter !== 'All') {
            if (viewType === 'project') {
                filteredTasks = filteredTasks.filter(t => t.district === taskDistrictFilter);
            } else {
                filteredTasks = filteredTasks.filter(t => t.projectId === taskDistrictFilter);
            }
        }

        return filteredTasks.map(t => {
            const daysSince = t.lastServiceDate ? getDaysDiff(t.lastServiceDate) : 999;
            const isLocked = daysSince < 61;
            return { ...t, daysSince, isLocked };
        });
    }, [project, tasks, viewMode, taskDistrictFilter, viewType]);

    if (!project) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-lg font-medium text-slate-450">
                    請從左側選擇一個{viewType === 'project' ? '案號' : '行政區'}以檢視詳細資料
                </p>
            </div>
        );
    }

    const handleReportClick = (task) => {
        const today = new Date().toISOString().split('T')[0];
        setCompletionDate(today);
        setConfirmModal({ isOpen: true, taskId: task.id, taskName: `${task.location} (${task.district})` });
    };

    const confirmCompletion = () => {
        if (!confirmModal.taskId) return;
        updateTask(confirmModal.taskId, { status: 'Completed', completedDate: completionDate, note: '手動回報完成' });
        setConfirmModal({ isOpen: false, taskId: null, taskName: null });
    };

    const handleEditClick = (task) => {
        setEditModal({ isOpen: true, taskId: task.id, taskName: `${task.location} (${task.district})`, currentDate: task.completedDate });
    };

    const saveDateChange = () => {
        if (!editModal.taskId) return;
        updateTask(editModal.taskId, { completedDate: editModal.currentDate });
        setEditModal({ isOpen: false, taskId: null, taskName: null, currentDate: '' });
    };

    const revertToPending = () => {
        if (!editModal.taskId) return;
        // Keep original lastServiceDate if possible or default
        const task = tasks.find(t => t.id === editModal.taskId);
        updateTask(editModal.taskId, {
            status: 'Pending',
            completedDate: null,
            note: '待排程',
        });
        setEditModal({ isOpen: false, taskId: null, taskName: null, currentDate: '' });
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 min-w-0 h-full">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-md shrink-0">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-slate-100 truncate max-w-md">{project.name}</h2>
                        <span className={`text-sm px-2 py-0.5 rounded-md font-medium whitespace-nowrap border ${viewType === 'district'
                            ? 'bg-purple-950/40 text-purple-400 border-purple-900/50'
                            : 'bg-blue-950/40 text-blue-400 border-blue-900/50'
                            }`}>
                            {project.id}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4 text-slate-500" /> {project.clientName}
                        </span>
                        <span className="flex items-center gap-1 text-slate-700">|</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="font-medium text-slate-300">當前季區間：{projectQuarterInfo.rangeText}</span>
                        </span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl flex items-center gap-4 shrink-0 shadow-md">
                    <div className="text-center">
                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-bold">
                            {projectQuarterInfo.qName} ({projectQuarterInfo.range}) 結束倒數
                        </div>
                        <div className={`text-3xl font-mono font-black leading-none ${projectQuarterInfo.daysLeft > 60 ? 'text-emerald-400' :
                            projectQuarterInfo.daysLeft >= 30 ? 'text-amber-500' : 'text-rose-500'
                            }`}>
                            {projectQuarterInfo.daysLeft} <span className="text-sm text-slate-400 font-bold">天</span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-slate-800 mx-1"></div>
                    <Clock className={`w-8 h-8 opacity-80 ${projectQuarterInfo.daysLeft > 60 ? 'text-emerald-400' :
                        projectQuarterInfo.daysLeft >= 30 ? 'text-amber-500' : 'text-rose-500'
                        }`} />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-hidden p-6">
                <div className="grid grid-cols-12 gap-6 h-full max-w-7xl mx-auto">
                    {/* Left Stats */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
                        <div className="bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-800 shrink-0">
                            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-blue-400" />
                                維護完成度
                            </h3>
                            <div className="flex flex-col items-center justify-center py-2">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="12" fill="none" />
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            stroke={projectStats.progress === 100 ? '#10b981' : '#3b82f6'}
                                            strokeWidth="12"
                                            fill="none"
                                            strokeDasharray={2 * Math.PI * 70}
                                            strokeDashoffset={2 * Math.PI * 70 * ((100 - projectStats.progress) / 100)}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-slate-100">{projectStats.progress}%</span>
                                        <span className="text-xs text-slate-400">已完成</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button
                                    onClick={() => setViewMode('pending')}
                                    className={`p-3 rounded-xl border text-center transition-all duration-200 ${viewMode === 'pending'
                                        ? 'bg-orange-950/30 border-orange-500/80 ring-2 ring-orange-900/30 shadow-md text-orange-300'
                                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-orange-950/20 hover:border-orange-700/50 hover:text-orange-300'
                                        }`}
                                >
                                    <div className="text-xl font-bold">{projectStats.totalCount - projectStats.completedCount}</div>
                                    <div className="text-xs font-medium">剩餘點位</div>
                                </button>
                                <button
                                    onClick={() => setViewMode('completed')}
                                    className={`p-3 rounded-xl border text-center transition-all duration-200 ${viewMode === 'completed'
                                        ? 'bg-emerald-950/30 border-emerald-500/80 ring-2 ring-emerald-900/30 shadow-md text-emerald-300'
                                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-emerald-950/20 hover:border-emerald-700/50 hover:text-emerald-300'
                                        }`}
                                >
                                    <div className="text-xl font-bold">{projectStats.completedCount}</div>
                                    <div className="text-xs font-medium">完成點位</div>
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-800 shrink-0">
                            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                案號資訊
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm">總維護點數</span>
                                    <span className="font-medium text-slate-200">{projectStats.totalCount} 處</span>
                                </div>
                                <div className="py-2">
                                    <span className="text-slate-400 text-sm block mb-1">區域分佈概況</span>
                                    <div className="flex flex-wrap gap-1">
                                        {projectStats.involvedDistricts.map(d => (
                                            <span key={d} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700/50">
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Task List */}
                    <div className="col-span-12 lg:col-span-8 h-full flex flex-col min-h-0">
                        <div className="bg-slate-900 rounded-2xl shadow-md border border-slate-800 flex flex-col h-full overflow-hidden">
                            <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0 transition-colors duration-300 ${viewMode === 'pending' ? 'bg-red-950/20 border-slate-800' : 'bg-emerald-950/20 border-slate-800'
                                }`}>
                                <div className="flex items-center gap-2">
                                    {viewMode === 'pending' ? (
                                        <>
                                            <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2"><AlertCircle className="w-5 h-5" />未完成清單</h3>
                                            <span className="px-2 py-0.5 bg-red-900/60 text-red-300 text-xs rounded-full font-bold border border-red-800/40">{displayedTasks.length}</span>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" />已完成清單</h3>
                                            <span className="px-2 py-0.5 bg-emerald-900/60 text-emerald-300 text-xs rounded-full font-bold border border-emerald-800/40">{displayedTasks.length}</span>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                                        <button onClick={() => setViewMode('pending')} className={`p-1.5 rounded-md transition-all ${viewMode === 'pending' ? 'bg-slate-850 shadow-sm text-red-450 font-bold' : 'text-slate-500 hover:text-slate-450'}`}><ListFilter className="w-4 h-4" /></button>
                                        <button onClick={() => setViewMode('completed')} className={`p-1.5 rounded-md transition-all ${viewMode === 'completed' ? 'bg-slate-850 shadow-sm text-emerald-450 font-bold' : 'text-slate-500 hover:text-slate-450'}`}><CheckCircle2 className="w-4 h-4" /></button>
                                    </div>
                                    {viewType === 'project' ? (
                                        projectStats.involvedDistricts.length > 1 && (
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-4 h-4 text-slate-500" />
                                                <select className="text-sm border border-slate-700 rounded-md px-2 py-1 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500" value={taskDistrictFilter} onChange={(e) => setTaskDistrictFilter(e.target.value)}>
                                                    <option value="All">所有區域</option>
                                                    {projectStats.involvedDistricts.map(d => (<option key={d} value={d}>{d}</option>))}
                                                </select>
                                            </div>
                                        )
                                    ) : (
                                        projectStats.involvedProjects.length > 1 && (
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-4 h-4 text-slate-500" />
                                                <select className="text-sm border border-slate-700 rounded-md px-2 py-1 bg-slate-800 text-slate-200 focus:outline-none focus:border-blue-500" value={taskDistrictFilter} onChange={(e) => setTaskDistrictFilter(e.target.value)}>
                                                    <option value="All">所有案號</option>
                                                    {projectStats.involvedProjects.map(pId => (<option key={pId} value={pId}>{pId}</option>))}
                                                </select>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto flex flex-col">
                                <div className="sticky top-0 z-10 bg-slate-950 border-b border-slate-800 grid grid-cols-12 px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                                    <div className="col-span-2 text-center">{viewType === 'district' ? '專案案號' : '行政區'}</div>
                                    <div className="col-span-4">單位</div>
                                    <div className="col-span-3 text-center">上次保養</div>
                                    <div className="col-span-3 text-center">{viewMode === 'pending' ? '操作' : '完工日期'}</div>
                                </div>

                                {displayedTasks.length > 0 ? (
                                    <div className="divide-y divide-slate-800">
                                        {displayedTasks.map((task) => (
                                            <div key={task.id} className={`grid grid-cols-12 px-6 py-3 items-center transition-colors group ${task.isLocked && viewMode === 'pending' ? 'bg-slate-950/40 text-slate-500' : 'hover:bg-slate-800/40'}`}>
                                                <div className="col-span-2 flex justify-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${viewType === 'district'
                                                        ? (viewMode === 'pending' ? 'bg-purple-950/40 text-purple-400 border-purple-900/30' : 'bg-emerald-950/40 text-emerald-450 border-emerald-900/30')
                                                        : (viewMode === 'pending' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-emerald-950/40 text-emerald-450 border-emerald-900/30')
                                                        }`}>
                                                        {viewType === 'district' ? task.projectId : task.district}
                                                    </span>
                                                </div>
                                                <div className="col-span-4 pr-2">
                                                    <div className={`font-medium truncate ${task.isLocked && viewMode === 'pending' ? 'text-slate-500' : 'text-slate-200'}`} title={task.location}>{task.location}</div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">{task.id}</div>
                                                </div>
                                                <div className="col-span-3 flex justify-center">
                                                    {viewMode === 'pending' ? (
                                                        <div className="flex flex-col gap-1 items-center">
                                                            <div className="text-xs text-slate-400 flex items-center gap-1"><History className="w-3 h-3 text-slate-500" /> {task.lastServiceDate || '無紀錄'}</div>
                                                            {task.isLocked ? (
                                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50 w-fit"><Ban className="w-3 h-3" />未達保養間隔</span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded-full border border-rose-900/30 w-fit"><AlertTriangle className="w-3 h-3" />未完成</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-slate-400 flex items-center gap-1"><History className="w-3 h-3 text-slate-500" /> {task.lastServiceDate || '無紀錄'}</div>
                                                    )}
                                                </div>
                                                <div className="col-span-3 flex justify-center">
                                                    {viewMode === 'pending' ? (
                                                        <button disabled={task.isLocked} onClick={() => handleReportClick(task)} className={`text-xs px-3 py-1.5 rounded-md transition-all shadow-sm border flex items-center gap-1 ${task.isLocked ? 'bg-slate-850 text-slate-650 border-slate-800 cursor-not-allowed' : 'bg-slate-800 border-slate-700 text-slate-350 hover:text-blue-450 hover:border-blue-800 hover:bg-blue-950/30'}`}><FileEdit className="w-3 h-3" />回報</button>
                                                    ) : (
                                                        <button onClick={() => handleEditClick(task)} className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 hover:bg-emerald-950/60 px-2 py-1 rounded-md font-mono flex items-center justify-center gap-1 transition-colors cursor-pointer group/btn" title="點擊修改日期或狀態"><Calendar className="w-3 h-3 text-emerald-500 group-hover/btn:text-emerald-400" />{task.completedDate}</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center flex-1 text-slate-500 min-h-[300px]">
                                        {viewMode === 'pending' ? (
                                            <><CheckCircle2 className="w-16 h-16 text-emerald-900/40 mb-4" /><p className="text-lg font-medium text-slate-400">目前無待辦事項</p></>
                                        ) : (
                                            <><AlertCircle className="w-16 h-16 text-slate-800/40 mb-4" /><p className="text-lg font-medium text-slate-400">目前尚無已完成記錄</p></>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-950 p-3 border-t border-slate-850 text-xs text-slate-500 flex justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <span>資料筆數: {displayedTasks.length} 筆</span>
                                    <span className="flex items-center gap-1"><Info className="w-3 h-3 text-slate-600" />維護區間定義: {projectQuarterInfo.range} (以案號起始日推算)</span>
                                </div>
                                {viewMode === 'pending' && (<span>綠色代表未達保養間隔 (61天)，回報功能暫時鎖定</span>)}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ConfirmCompletionModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, taskId: null, taskName: null })}
                checkDate={completionDate}
                setCheckDate={setCompletionDate}
                taskName={confirmModal.taskName}
                onConfirm={confirmCompletion}
            />

            <EditTaskDateModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, taskId: null, taskName: null, currentDate: '' })}
                currentDate={editModal.currentDate}
                setCurrentDate={(d) => setEditModal({ ...editModal, currentDate: d })}
                taskName={editModal.taskName}
                onSave={saveDateChange}
                onRevert={revertToPending}
            />
        </div>
    );
}
