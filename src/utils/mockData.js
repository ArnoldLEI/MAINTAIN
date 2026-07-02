import { getPastDate } from './dateUtils';

export const CLIENTS = [
    { id: 'C001', name: '台北捷運公司' },
    { id: 'C002', name: '信義新光三越' },
    { id: 'C003', name: '台大醫院' },
    { id: 'C004', name: '南港軟體園區' },
    { id: 'C005', name: '中華郵政' },
];

export const INITIAL_PROJECTS = [
    {
        id: 'JS121-J084',
        clientId: 'C005',
        name: '各局所機電設備維護',
        mainDistrict: '跨行政區',
        startDate: '2025-01-01',
        endDate: '2025-12-31'
    },
    {
        id: 'P-2025-001',
        clientId: 'C001',
        name: '文湖線空調維護案',
        mainDistrict: '文山區',
        startDate: '2025-01-01',
        endDate: '2025-12-31'
    },
];

export const generateTasks = () => {
    const tasks = [];
    const locationTypes = ['營業廳', 'ATM區', '郵務機房', '包裹分揀區', '主管辦公室', '員工休息室', '頂樓水塔', '地下停車場'];
    const taiepiDistricts = ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'];

    const now = new Date();
    const currentYear = now.getFullYear();
    let quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const quarterStartDate = new Date(currentYear, quarterStartMonth, 1);

    INITIAL_PROJECTS.forEach(project => {
        const count = project.id === 'JS121-J084' ? 50 : 15; // Reduced default count for cleaner demo, or keep 500/30 as original? Original was 500/30. I'll stick close to original but maybe slightly less for performance if needed, but original used 500.
        // Keeping original 500 might trigger "too large file" warning if I try to debug print it, but for generation it's fine.
        // Let's stick to original implementation logic.
        const loopCount = project.id === 'JS121-J084' ? 500 : 30;

        for (let i = 0; i < loopCount; i++) {
            const district = project.id === 'JS121-J084'
                ? taiepiDistricts[Math.floor(Math.random() * taiepiDistricts.length)]
                : project.mainDistrict;

            const locType = locationTypes[i % locationTypes.length];
            const branchName = project.id === 'JS121-J084' ? `${district}${i + 1}支局` : '';

            const lastServiceDateStr = getPastDate(Math.floor(Math.random() * 90) + 30);
            const lastServiceDate = new Date(lastServiceDateStr);

            let isCompleted = false;
            if (lastServiceDate >= quarterStartDate) {
                isCompleted = true;
            } else {
                isCompleted = Math.random() > 0.6;
            }

            tasks.push({
                id: `T-${project.id}-${String(i).padStart(3, '0')}`,
                projectId: project.id,
                district: district,
                location: branchName ? `${branchName} - ${locType}` : `${locType} ${i + 1}`,
                status: isCompleted ? 'Completed' : 'Pending',
                completedDate: isCompleted ? '2025-11-15' : null,
                note: isCompleted ? '檢修正常' : '待排程',
                lastServiceDate: lastServiceDateStr,
            });
        }
    });
    return tasks;
};
