import React from 'react';
import { CheckCircle2, FileEdit, Trash2, AlertTriangle, RefreshCcw, Save, X } from 'lucide-react';

// Base Modal Component
export const Modal = ({ isOpen, onClose, children, title, icon: Icon, iconColor = 'text-blue-400', iconBg = 'bg-blue-950/40 border border-blue-900/30', width = 'w-[400px]' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`bg-slate-900 rounded-xl shadow-2xl ${width} p-6 border border-slate-800 flex flex-col max-h-[90vh]`}>
                {title && (
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            {Icon && <div className={`${iconBg} p-2 rounded-full`}><Icon className={`w-6 h-6 ${iconColor}`} /></div>}
                            <h3 className="text-xl font-bold text-slate-100">{title}</h3>
                        </div>
                        {onClose && (
                            <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

// Confirm Completion Modal
export const ConfirmCompletionModal = ({ isOpen, onClose, checkDate, setCheckDate, taskName, onConfirm }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="確認回報完成？" icon={CheckCircle2} iconColor="text-blue-400" iconBg="bg-blue-950/40 border border-blue-900/30">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-700 font-bold text-white mb-4">{taskName}</div>
            <div className="mb-6">
                <label className="block text-sm font-bold text-slate-300 mb-1.5">完工日期</label>
                <input type="date" value={checkDate} onChange={(e) => setCheckDate(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button onClick={onClose} className="px-4 py-2 text-slate-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700">取消</button>
                <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-md">確認完成</button>
            </div>
        </Modal>
    );
};

// Edit Task Date Modal
export const EditTaskDateModal = ({ isOpen, onClose, currentDate, setCurrentDate, taskName, onSave, onRevert }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="修改完工紀錄" icon={FileEdit} iconColor="text-purple-450" iconBg="bg-purple-950/40 border border-purple-900/30">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-700 font-bold text-white mb-6">{taskName}</div>
            <div className="mb-6">
                <label className="block text-sm font-bold text-slate-300 mb-1.5">更正完工日期</label>
                <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button onClick={onRevert} className="px-4 py-2 text-red-400 bg-red-950/30 hover:bg-red-950/60 rounded-lg font-bold flex items-center gap-2 text-sm border border-red-900/30"><RefreshCcw className="w-4 h-4" />變更為未完成</button>
                <div className="flex gap-3">
                    <button onClick={onClose} className="px-3 py-2 text-slate-300 hover:text-white font-medium">取消</button>
                    <button onClick={onSave} className="px-4 py-2 bg-purple-650 text-white rounded-lg hover:bg-purple-550 flex items-center gap-2 shadow-md"><Save className="w-4 h-4" />儲存變更</button>
                </div>
            </div>
        </Modal>
    );
};

// Delete Project Modal
export const DeleteProjectModal = ({ isOpen, onClose, projectName, onConfirm }) => {
    const [deleteInputText, setDeleteInputText] = React.useState('');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="確認刪除案號？" icon={Trash2} iconColor="text-red-450" iconBg="bg-red-950/40 border border-red-900/30">
            <p className="text-slate-200 mb-2 leading-relaxed font-medium">您即將 <span className="font-bold text-red-400">永久刪除</span> 以下案號：</p>
            <div className="p-3 bg-red-950/30 rounded-lg border border-red-800 font-bold text-red-100 mb-4">{projectName}</div>
            <div className="mb-6">
                <label className="block text-sm font-bold text-slate-300 mb-1.5 flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-orange-450" />安全驗證</label>
                <input type="text" value={deleteInputText} onChange={(e) => setDeleteInputText(e.target.value)} placeholder="請輸入 DELETE" className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-lg outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button onClick={onClose} className="px-4 py-2 text-slate-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700">取消</button>
                <button onClick={onConfirm} disabled={deleteInputText !== 'DELETE'} className={`px-4 py-2 text-white rounded-lg shadow-md font-medium flex items-center gap-2 ${deleteInputText === 'DELETE' ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}><Trash2 className="w-4 h-4" />確認刪除</button>
            </div>
        </Modal>
    );
};
