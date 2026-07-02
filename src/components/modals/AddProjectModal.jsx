import React, { useRef, useState } from 'react';
import { Plus, X, FileSpreadsheet, CheckCircle2, UploadCloud } from 'lucide-react';
import { Modal } from './TaskModals';
import { getQuarterStart, getPastDate } from '../../utils/dateUtils';

import { read, utils } from 'xlsx';

// Helper to parse excel
const parseExcelFile = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = read(data, { type: 'array', cellDates: true });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Get JSON data
                const jsonData = utils.sheet_to_json(worksheet, { defval: '' });

                const newPoints = jsonData.map(row => {
                    // Extract data based on columns: "行政區", "單位", "上次保養"
                    const district = row['行政區'] ? String(row['行政區']).trim() : '';
                    const location = row['單位'] ? String(row['單位']).trim() : '';
                    let lastServiceDate = row['上次保養'];

                    // Handle Date formatting
                    if (lastServiceDate instanceof Date) {
                        // Convert Date object to YYYY-MM-DD
                        // Handle timezone offset to ensure correct date
                        const offset = lastServiceDate.getTimezoneOffset();
                        const date = new Date(lastServiceDate.getTime() - (offset * 60 * 1000));
                        lastServiceDate = date.toISOString().split('T')[0];
                    } else if (typeof lastServiceDate === 'string') {
                        // Handle string date "2025/4/18" -> "2025-04-18"
                        if (lastServiceDate.includes('/')) {
                            const parts = lastServiceDate.split('/');
                            if (parts.length === 3) {
                                const y = parts[0];
                                const m = parts[1].padStart(2, '0');
                                const d = parts[2].padStart(2, '0');
                                lastServiceDate = `${y}-${m}-${d}`;
                            }
                        }
                    } else {
                        // Fallback or empty
                        lastServiceDate = '';
                    }

                    if (!district && !location) return null; // Skip empty rows

                    return {
                        district: district || '未分區',
                        location: location || '未命名單位',
                        lastServiceDate: lastServiceDate || '2000-01-01' // Default if missing
                    };
                }).filter(Boolean); // Remove nulls

                resolve(newPoints);
            } catch (error) {
                console.error("Error parsing Excel:", error);
                alert("Excel 解析失敗，請確認格式正確 (需包含：行政區、單位、上次保養)");
                resolve([]);
            }
        };

        reader.readAsArrayBuffer(file);
    });
};

export default function AddProjectModal({ isOpen, onClose, onAdd }) {
    const [newProjectData, setNewProjectData] = useState({
        id: '', name: '', client: '', startDate: new Date().toISOString().split('T')[0]
    });
    const [importedPoints, setImportedPoints] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsImporting(true);
        const points = await parseExcelFile(file);
        setImportedPoints(points);
        setIsImporting(false);
    };

    const handleSubmit = () => {
        if (!newProjectData.id || !newProjectData.name) {
            alert("請填寫案號與名稱");
            return;
        }
        onAdd(newProjectData, importedPoints);
        onClose();
        // Reset
        setNewProjectData({ id: '', name: '', client: '', startDate: new Date().toISOString().split('T')[0] });
        setImportedPoints([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-[600px] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" />
                        新增維護案號
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">案號 ID</label>
                            <input
                                type="text"
                                placeholder="例如：P-2025-005"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newProjectData.id}
                                onChange={e => setNewProjectData({ ...newProjectData, id: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">專案名稱</label>
                            <input
                                type="text"
                                placeholder="例如：南港展覽館消防巡檢"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newProjectData.name}
                                onChange={e => setNewProjectData({ ...newProjectData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">所屬客戶</label>
                            <input
                                type="text"
                                placeholder="客戶名稱"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newProjectData.client}
                                onChange={e => setNewProjectData({ ...newProjectData, client: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">起始日期 (季週期基準)</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newProjectData.startDate}
                                onChange={e => setNewProjectData({ ...newProjectData, startDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Import Area */}
                    <div className="border-t border-slate-100 pt-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            匯入維護點位 (Excel)
                        </label>

                        <div
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${importedPoints.length > 0 ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                                }`}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                            />

                            {isImporting ? (
                                <div className="text-blue-600 flex flex-col items-center animate-pulse">
                                    <UploadCloud className="w-8 h-8 mb-2" />
                                    <span className="text-sm font-medium">讀取檔案中...</span>
                                </div>
                            ) : importedPoints.length > 0 ? (
                                <div className="text-green-700 flex flex-col items-center">
                                    <CheckCircle2 className="w-8 h-8 mb-2" />
                                    <span className="text-lg font-bold">{importedPoints.length} 筆點位</span>
                                    <span className="text-xs mt-1">匯入成功！包含行政區、單位、上次保養日</span>
                                </div>
                            ) : (
                                <div className="text-slate-400 flex flex-col items-center">
                                    <UploadCloud className="w-8 h-8 mb-2" />
                                    <span className="text-sm font-medium text-slate-600">點擊上傳 Excel 檔案</span>
                                    <span className="text-xs mt-1">格式：行政區 | 單位 | 上次保養日期</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={importedPoints.length === 0}
                        className={`px-4 py-2 text-white rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2 ${importedPoints.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        確認建立專案
                    </button>
                </div>
            </div>
        </div>
    );
}

// Re-export parseExcelFile helper if needed, but for now I kept it local.
// In a real app it should be in utils.
export { parseExcelFile };
