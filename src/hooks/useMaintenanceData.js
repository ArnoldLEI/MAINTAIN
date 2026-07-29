import { useState, useEffect, useCallback } from 'react';
import { INITIAL_PROJECTS, generateTasks } from '../utils/mockData';
import { getQuarterStart, getPastDate } from '../utils/dateUtils';

export const useMaintenanceData = () => {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Helper function to save to server
    const saveToServer = async (projectsData, tasksData) => {
        try {
            await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projects: projectsData, tasks: tasksData })
            });
        } catch (e) {
            console.error("Failed to save data to local server:", e);
        }
    };

    const autoResetNewQuarterTasks = (projectsList, tasksList) => {
        let hasChanges = false;
        const updatedTasks = tasksList.map(t => {
            const proj = projectsList.find(p => p.id === t.projectId);
            if (!proj) return t;

            const qStart = getQuarterStart(proj.startDate);
            // If task is Completed, but the completion date is older than the current quarter's start date
            if (t.status === 'Completed' && t.completedDate) {
                const compDate = new Date(t.completedDate);
                if (compDate < qStart) {
                    hasChanges = true;
                    return {
                        ...t,
                        status: 'Pending',
                        lastServiceDate: t.completedDate, // Rotate completedDate to lastServiceDate
                        completedDate: null,
                        note: '進入新季度，自動重設為未完成'
                    };
                }
            }
            return t;
        });
        return { updatedTasks, hasChanges };
    };

    // Load initial data from local server or localStorage or mock data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            await new Promise(resolve => setTimeout(resolve, 500));

            try {
                const response = await fetch('/api/data');
                if (response.ok) {
                    const data = await response.json();
                    if (data.projects && data.tasks) {
                        const { updatedTasks, hasChanges } = autoResetNewQuarterTasks(data.projects, data.tasks);
                        
                        setProjects(data.projects);
                        setTasks(updatedTasks);
                        
                        // Sync backup to localStorage
                        localStorage.setItem('MAINTAINSYS_PROJECTS', JSON.stringify(data.projects));
                        localStorage.setItem('MAINTAINSYS_TASKS', JSON.stringify(updatedTasks));
                        
                        if (hasChanges) {
                            saveToServer(data.projects, updatedTasks);
                        }
                        setIsLoadingData(false);
                        return;
                    }
                }
            } catch (apiError) {
                console.warn("Failed to fetch from API, trying localStorage fallback:", apiError);
            }

            try {
                const storedProjects = localStorage.getItem('MAINTAINSYS_PROJECTS');
                const storedTasks = localStorage.getItem('MAINTAINSYS_TASKS');

                if (storedProjects && storedTasks) {
                    const parsedProjects = JSON.parse(storedProjects);
                    const parsedTasks = JSON.parse(storedTasks);
                    
                    const { updatedTasks, hasChanges } = autoResetNewQuarterTasks(parsedProjects, parsedTasks);
                    
                    setProjects(parsedProjects);
                    setTasks(updatedTasks);
                    
                    if (hasChanges) {
                        localStorage.setItem('MAINTAINSYS_TASKS', JSON.stringify(updatedTasks));
                    }
                    saveToServer(parsedProjects, updatedTasks);
                } else {
                    // First time load: use mock data
                    const initialProjects = INITIAL_PROJECTS;
                    const initialTasks = generateTasks();
                    
                    const { updatedTasks } = autoResetNewQuarterTasks(initialProjects, initialTasks);
                    
                    setProjects(initialProjects);
                    setTasks(updatedTasks);
                    
                    // Save to both
                    localStorage.setItem('MAINTAINSYS_PROJECTS', JSON.stringify(initialProjects));
                    localStorage.setItem('MAINTAINSYS_TASKS', JSON.stringify(updatedTasks));
                    saveToServer(initialProjects, updatedTasks);
                }
            } catch (error) {
                console.error("Failed to load fallback data:", error);
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
            saveToServer(projects, tasks);
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

        // Filter out old tasks belonging to the original projectId, and append the updated tasks
        setTasks(prev => {
            const otherTasks = prev.filter(t => t.projectId !== projectId);
            return [...otherTasks, ...updatedTasks];
        });
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
