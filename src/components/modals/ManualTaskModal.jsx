import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Modal } from './TaskModals';
import { getPastDate } from '../../utils/dateUtils';

export default function ManualTaskModal({ isOpen, onClose, onSave }) {
    const [manualTaskData, setManualTaskData] = useState({ district: '', location: '', lastServiceDate: '' });

    const handleSave = () => {
        if (!manualTaskData.district || !manualTaskData.location) {
            alert('請填寫行政區與單位名稱');
            return;
        }
        const inputDateStr = manualTaskData.lastServiceDate || getPastDate(90);

        onSave({
            district: manualTaskData.district,
            location: manualTaskData.location,
            lastServiceDate: inputDateStr
        });

        // Reset
        setManualTaskData({ district: '', location: '', lastServiceDate: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} width="w-[400px]" title="手動新增點位" icon={PlusCircle} iconColor="text-blue-600" iconBg="bg-blue-100">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">行政區</label>
                    <input
                         type="text"
                         className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                         placeholder="例如：大安區"
                         value={manualTaskData.district}
                         onChange={e => setManualTaskData({ ...manualTaskData, district: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">單位名稱 / 位置</label>
                    <input
                         type="text"
                         className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                         placeholder="例如：機房 A"
                         value={manualTaskData.location}
                         onChange={e => setManualTaskData({ ...manualTaskData, location: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">上次保養日期</label>
                    <input
                         type="date"
                         className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                         value={manualTaskData.lastServiceDate}
                         onChange={e => setManualTaskData({ ...manualTaskData, lastServiceDate: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex gap-3 justify-end pt-5 border-t border-slate-800 mt-4">
                <button onClick={onClose} className="px-4 py-2 text-slate-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700">取消</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-md">加入清單</button>
            </div>
        </Modal>
    );
}
