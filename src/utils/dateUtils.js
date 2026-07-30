export const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(dateStr);
};

export const getPastDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

export const getDaysDiff = (dateStr) => {
    if (!dateStr) return 999;
    const targetDate = parseLocalDate(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = today - targetDate;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getQuarterStart = (projectStartDate) => {
    if (!projectStartDate) return new Date(0);

    const start = parseLocalDate(projectStartDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const addMonths = (date, months) => {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    };

    let k = 0;
    while (true) {
        const nextQStart = addMonths(start, 3 * (k + 1));
        if (nextQStart <= today) {
            k++;
        } else {
            break;
        }
    }

    return addMonths(start, 3 * k);
};

export const getProjectQuarterData = (project) => {
    if (!project) return { qName: '', range: '', rangeText: '', daysLeft: 0 };

    const start = parseLocalDate(project.startDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const addMonths = (date, months) => {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    };

    let k = 0;
    while (true) {
        const nextQStart = addMonths(start, 3 * (k + 1));
        if (nextQStart <= today) {
            k++;
        } else {
            break;
        }
    }

    const qStart = addMonths(start, 3 * k);
    const nextQStart = addMonths(start, 3 * (k + 1));
    const qEnd = new Date(nextQStart);
    qEnd.setDate(qEnd.getDate() - 1);

    const diffTime = qEnd - today;
    let daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) daysLeft = 0;

    const formatLocal = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const rangeText = `${formatLocal(qStart)} ~ ${formatLocal(qEnd)}`;
    const m1 = qStart.getMonth() + 1;
    const d1 = qStart.getDate();
    const m2 = qEnd.getMonth() + 1;
    const d2 = qEnd.getDate();
    const range = `${m1}/${d1}~${m2}/${d2}`;

    return {
        qName: `Q${k + 1}`,
        range,
        rangeText,
        daysLeft
    };
};
