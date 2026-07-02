export const getPastDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

export const getDaysDiff = (dateStr) => {
    if (!dateStr) return 999;
    const targetDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today - targetDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getQuarterStart = (projectStartDate) => {
    if (!projectStartDate) return new Date(0);

    const start = new Date(projectStartDate);
    const now = new Date();
    const startMonth = start.getMonth();
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();

    const monthOffset = (nowMonth - startMonth + 12) % 12;
    const qIndex = Math.floor(monthOffset / 3);

    const currentQStartMonth = (startMonth + qIndex * 3) % 12;

    let qStartYear = nowYear;
    if (currentQStartMonth > nowMonth) {
        qStartYear = nowYear - 1;
    }

    return new Date(qStartYear, currentQStartMonth, 1);
};

export const getProjectQuarterData = (project) => {
    if (!project) return { qName: '', range: '', rangeText: '', daysLeft: 0 };

    const start = new Date(project.startDate);
    const now = new Date();
    const startMonth = start.getMonth();

    const monthOffset = (now.getMonth() - startMonth + 12) % 12;
    const qIndex = Math.floor(monthOffset / 3);
    const currentQStartMonth = (startMonth + qIndex * 3) % 12;
    const currentQEndMonth = (currentQStartMonth + 2) % 12;

    let endYear = now.getFullYear();

    if (currentQEndMonth < currentQStartMonth) {
        if (now.getMonth() >= currentQStartMonth) {
            endYear += 1;
        }
    }

    const qEndDate = new Date(endYear, currentQEndMonth + 1, 0);

    const diffTime = qEndDate - now;
    let daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) daysLeft = 0;

    const m1 = currentQStartMonth + 1;
    const m3 = currentQEndMonth + 1;
    const range = `${m1}-${m3}月`;
    const rangeText = `${endYear}-${String(m1).padStart(2, '0')} ~ ${qEndDate.toISOString().split('T')[0]}`;

    return {
        qName: `Q${qIndex + 1}`,
        range,
        rangeText,
        daysLeft
    };
};
