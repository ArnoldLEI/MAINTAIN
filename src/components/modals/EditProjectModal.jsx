import React, { useState, useRef, useEffect } from 'react';
import { Pencil, X, Info, ListFilter, PlusCircle, UploadCloud, Save, Trash2 } from 'lucide-react';
import ManualTaskModal from './ManualTaskModal';
import { getQuarterStart } from '../../utils/dateUtils';
import { parseExcelFile } from './AddProjectModal'; // Reuse parser

export default function EditProjectModal({ isOpen, onClose, project, tasks, onSave }) {
    const [editingProjectData, setEditingProjectData] = useState(null);
    const [editingProjectTasks, setEditingProjectTasks] = useState([]);

    // Sub-modals
    const [manualAddTaskModal, setManualAddTaskModal] = useState(false);
    const fileInputRef = useRef(null);

    // Initialize state when project prop changes
    useEffect(() => {
        if (project) {
            setEditingProjectData({ ...project });
            // Deep copy tasks to avoid mutating prop
            setEditingProjectTasks(tasks.map(t => ({ ...t })));
        }
    }, [project, tasks]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const points = await parseExcelFile(file);

        const quarterStartDate = getQuarterStart(editingProjectData.startDate);
        const newTasks = points.map((pt, idx) => {
            const isCompleted = pt.lastServiceDate ? new Date(pt.lastServiceDate) >= quarterStartDate : false;
            return {
                id: `TEMP-${Date.now()}-${idx}`,
                projectId: editingProjectData.id,
                district: pt.district,
                location: pt.location,
                status: isCompleted ? 'Completed' : 'Pending',
                completedDate: isCompleted ? pt.lastServiceDate : null,
                note: isCompleted ? '匯入時自動判定完成' : '新增匯入',
                lastServiceDate: pt.lastServiceDate
            };
        });

        setEditingProjectTasks(prev => [...prev, ...newTasks]);
    };

    const handleManualTaskSave = (taskData) => {
        const quarterStartDate = getQuarterStart(editingProjectData.startDate);
        const isCompleted = taskData.lastServiceDate ? new Date(taskData.lastServiceDate) >= quarterStartDate : false;

        const newTask = {
            id: `MANUAL-${Date.now()}`,
            projectId: editingProjectData.id,
            district: taskData.district,
            location: taskData.location,
            status: isCompleted ? 'Completed' : 'Pending',
            completedDate: isCompleted ? taskData.lastServiceDate : null,
            note: isCompleted ? '手動新增並判定完成' : '手動新增',
            lastServiceDate: taskData.lastServiceDate
        };
        setEditingProjectTasks(prev => [...prev, newTask]);
    };

    const handleDeleteTask = (taskId) => {
        // Direct delete without confirmation modal for speed in this demo, 
        // or re-implement the small confirmation modal if critical.
        // The original had a small confirmation modal. 
        // Let's just confirm with window.confirm for simplicity or direct delete since there is a rigorous "Save" action required at the end.
        // Actually, let's just delete it from the list. The user has to click "Save Changes" to persist anyway.
        setEditingProjectTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const handleSave = () => {
        if (!editingProjectData.id || !editingProjectData.name) {
            alert("案號與名稱不能為空");
            return;
        }
        // Ensuring all tasks have the correct project ID if it changed
        const finalizedTasks = editingProjectTasks.map(t => ({
            ...t,
            projectId: editingProjectData.id
        }));

        onSave(editingProjectData.id, editingProjectData, finalizedTasks);
        onClose();
    };

    if (!isOpen || !editingProjectData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-[800px] flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-blue-600" />
                        編輯案號與點位
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* 1. Basic Info */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4" /> 專案基本資料
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">案號 ID (修改將同步更新點位)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-blue-700 font-bold"
                                    value={editingProjectData.id}
                                    onChange={e => setEditingProjectData({ ...editingProjectData, id: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">專案名稱</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editingProjectData.name}
                                    onChange={e => setEditingProjectData({ ...editingProjectData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">所屬客戶</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editingProjectData.clientId}
                                    onChange={e => setEditingProjectData({ ...editingProjectData, clientId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">起始日期</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editingProjectData.startDate}
                                    onChange={e => setEditingProjectData({ ...editingProjectData, startDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Task Management */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <ListFilter className="w-4 h-4" />
                                點位管理 ({editingProjectTasks.length})
                            </h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setManualAddTaskModal(true)}
                                    className="text-xs bg-white text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-50 flex items-center gap-1 transition-colors"
                                >
                                    <PlusCircle className="w-3 h-3" />
                                    手動新增
                                </button>
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-md hover:bg-green-100 flex items-center gap-1 transition-colors"
                                >
                                    <UploadCloud className="w-3 h-3" />
                                    匯入 (追加)
                                </button>
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-lg overflow-hidden h-64 flex flex-col bg-white">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 grid grid-cols-12 text-xs font-semibold text-slate-500">
                                <div className="col-span-3">行政區</div>
                                <div className="col-span-5">單位名稱</div>
                                <div className="col-span-3">上次保養</div>
                                <div className="col-span-1 text-center">操作</div>
                            </div>
                            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
                                {editingProjectTasks.map((task) => (
                                    <div key={task.id} className="px-4 py-2 grid grid-cols-12 text-sm items-center hover:bg-slate-50">
                                        <div className="col-span-3 truncate pr-2"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{task.district}</span></div>
                                        <div className="col-span-5 truncate font-medium text-slate-700 pr-2">{task.location}</div>
                                        <div className="col-span-3 text-xs text-slate-400 font-mono">{task.lastServiceDate || '無紀錄'}</div>
                                        <div className="col-span-1 text-center">
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                                title="移除此點位"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {editingProjectTasks.length === 0 && (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        此專案目前沒有維護點位
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        儲存變更
                    </button>
                </div>
            </div>

            <ManualTaskModal
                isOpen={manualAddTaskModal}
                onClose={() => setManualAddTaskModal(false)}
                onSave={handleManualTaskSave}
            />
        </div>
    );
}
