import { useState, useEffect, useCallback } from 'react';
import { INITIAL_PROJECTS, generateTasks } from '../utils/mockData';
import { getQuarterStart, getPastDate } from '../utils/dateUtils';

export const useMaintenanceData = () => {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Load initial data from localStorage or mock data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            // Simulate subtle delay for better UX (optional, but keeps consistent feel)
            await new Promise(resolve => setTimeout(resolve, 500));

            try {
                const storedProjects = localStorage.getItem('MAINTAINSYS_PROJECTS');
                const storedTasks = localStorage.getItem('MAINTAINSYS_TASKS');

                if (storedProjects && storedTasks) {
                    setProjects(JSON.parse(storedProjects));
                    setTasks(JSON.parse(storedTasks));
                } else {
                    // First time load: use mock data
                    const initialProjects = INITIAL_PROJECTS;
                    const initialTasks = generateTasks();

                    setProjects(initialProjects);
                    setTasks(initialTasks);

                    // Save to storage immediately
                    localStorage.setItem('MAINTAINSYS_PROJECTS', JSON.stringify(initialProjects));
                    localStorage.setItem('MAINTAINSYS_TASKS', JSON.stringify(initialTasks));
                }
            } catch (error) {
                console.error("Failed to load data from localStorage:", error);
                // Fallback to mock data on error
                setProjects(INITIAL_PROJECTS);
                setTasks(generateTasks());
            }

            setIsLoadingData(false);
        };
        fetchData();
    }, []);

    // Persist data whenever it changes
    useEffect(() => {
        if (!isLoadingData) {
            localStorage.setItem('MAINTAINSYS_PROJECTS', JSON.stringify(projects));
            localStorage.setItem('MAINTAINSYS_TASKS', JSON.stringify(tasks));
        }
    }, [projects, tasks, isLoadingData]);

    const addProject = (newProjectData, importedPoints) => {
        const newProj = {
            ...newProjectData,
            mainDistrict: importedPoints.length > 0 ? importedPoints[0].district : '未定',
            endDate: '2025-12-31'
        };

        const quarterStartDate = getQuarterStart(newProj.startDate);

        const newTasks = importedPoints.map((pt, idx) => {
            const isCompleted = pt.lastServiceDate ? new Date(pt.lastServiceDate) >= quarterStartDate : false;
            return {
                id: `T-${newProj.id}-${String(idx).padStart(3, '0')}`,
                projectId: newProj.id,
                district: pt.district,
                location: pt.location,
                status: isCompleted ? 'Completed' : 'Pending',
                completedDate: isCompleted ? pt.lastServiceDate : null,
                note: isCompleted ? '匯入時自動判定完成' : '新匯入點位',
                lastServiceDate: pt.lastServiceDate
            };
        });

        setProjects(prev => [...prev, newProj]);
        setTasks(prev => [...prev, ...newTasks]);
        return newProj.id;
    };

    const updateProject = (projectId, updatedData, updatedTasks) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return updatedData;
            }
            return p;
        }));

        // In the original code, `updatedTasks` replaces only the tasks for this project.
        // We need to merge them back into the main `tasks` array.
        // Filter out ALL tasks for the original projectId (or new one if ID changed? The original code handled ID change via `originalProjectId`)
        // Wait, the hook needs to know if ID changed.
        // Let's assume the component handles the ID change logic mapping before calling this, OR we pass `originalProjectId`.
        // Simplified for now: We assume the caller handles the task list preparation.

        // Actually, let's keep it robust.
        // If ID changed, we need to remove old tasks and add new ones with new ID.
        // The passed `updatedTasks` should already have the correct new `projectId`.

        const newProjectId = updatedData.id;
        // We need to know the OLD projectId to filter out old tasks. 
        // But here we rely on the tasks having the correct ProjectId. 

        // It's safer if we pass `originalProjectId`.
        return (originalProjectId) => {
            setTasks(prev => {
                const otherTasks = prev.filter(t => t.projectId !== originalProjectId);
                return [...otherTasks, ...updatedTasks];
            });
        };
    };

    const deleteProject = (projectId) => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setTasks(prev => prev.filter(t => t.projectId !== projectId));
    };

    const updateTask = (taskId, updates) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    };

    return {
        projects,
        tasks,
        isLoadingData,
        setProjects,
        setTasks,
        addProject,
        updateProject,
        deleteProject,
        updateTask
    };
};
