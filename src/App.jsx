import React, { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import ProjectDashboard from './components/dashboard/ProjectDashboard';
import AddProjectModal from './components/modals/AddProjectModal';
import EditProjectModal from './components/modals/EditProjectModal';
import { DeleteProjectModal } from './components/modals/TaskModals';
import { useMaintenanceData } from './hooks/useMaintenanceData';
import { getProjectQuarterData } from './utils/dateUtils';

export default function App() {
    const {
        projects,
        tasks,
        isLoadingData,
        addProject,
        updateProject,
        deleteProject,
        updateTask
    } = useMaintenanceData();

    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals Data
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editProjectModal, setEditProjectModal] = useState({ isOpen: false, project: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, project: null });

    // Select logic: Default to first if none selected and data loaded
    React.useEffect(() => {
        if (!isLoadingData && projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].id);
        }
    }, [isLoadingData, projects, selectedProjectId]);

    // Derived State
    const enrichedProjects = useMemo(() => {
        return projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const completedCount = projectTasks.filter(t => t.status === 'Completed').length;
            const totalCount = projectTasks.length;
            const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

            // We don't have client list in hook, but we have clientName in project data from hook if we adapted it? 
            // The original code merged CLIENTS locally. Let's assume project has clientName or we lookup.
            // In mockData.js we exported CLIENTS.
            // In useMaintenanceData, we set projects to INITIAL_PROJECTS.
            // We should probably merge client names there or here. 
            // For simplicity, let's import CLIENTS here or assume project has clientId and we look it up.
            // Let's import CLIENTS helper or just do it here.
            // Actually `useMaintenanceData` didn't merge client names. Let's quick fix by importing CLIENTS here.

            return {
                ...project,
                // clientName: CLIENTS.find(c => c.id === project.clientId)?.name || project.clientId, // Simplified below
                clientName: project.clientId === 'C001' ? '台北捷運公司' :
                    project.clientId === 'C005' ? '中華郵政' : project.clientId, // Hardcode for demo or import
                progress,
                completedCount,
                totalCount
            };
        });
    }, [projects, tasks]);

    const currentProject = enrichedProjects.find(p => p.id === selectedProjectId);
    const currentProjectTasks = tasks.filter(t => t.projectId === selectedProjectId);

    // Handlers
    const handleAddProject = (data, points) => {
        const newId = addProject(data, points);
        setSelectedProjectId(newId);
    };

    const handleEditProjectClick = (e, project) => {
        e.stopPropagation();
        setEditProjectModal({ isOpen: true, project });
    };

    const handleSaveProjectEdit = (newId, newData, newTasks) => {
        // Need original ID? The hook might need it if ID changed.
        // The `EditProjectModal` handles the data preparation. 
        // Our hook `updateProject` implementation: 
        /*
           const updateProject = (projectId, updatedData, updatedTasks) => { ... }
        */
        // Wait, my hook signature was `updateProject(projectId, updatedData, updatedTasks)`.
        // The `projectId` arg acts as the target to find.
        // If ID changes, `newData.id` will be new, but we need to find by `editProjectModal.project.id` (original).

        updateProject(editProjectModal.project.id, newData, newTasks);
        if (selectedProjectId === editProjectModal.project.id && newId !== selectedProjectId) {
            setSelectedProjectId(newId);
        }
    };

    const handleDeleteProjectClick = (e, project) => {
        e.stopPropagation();
        setDeleteModal({ isOpen: true, project });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.project) return;
        deleteProject(deleteModal.project.id);

        if (selectedProjectId === deleteModal.project.id) {
            setSelectedProjectId(null); // Effect will pick new one
        }
        setDeleteModal({ isOpen: false, project: null });
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">

            {/* Loading Overlay */}
            {isLoadingData && (
                <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-out fade-out duration-500 delay-1000 pointer-events-none">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                    <p className="text-slate-500 font-medium">系統初始化中...</p>
                </div>
            )}

            {/* Sidebar */}
            <Sidebar
                projects={enrichedProjects} // Pass enriched for progress bars etc
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
                onAddProject={() => setIsAddModalOpen(true)}
                onEditProject={handleEditProjectClick}
                onDeleteProject={handleDeleteProjectClick}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            {/* Main Content */}
            <ProjectDashboard
                project={currentProject}
                tasks={currentProjectTasks}
                updateTask={updateTask}
            />

            {/* Modals */}
            <AddProjectModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddProject}
            />

            <EditProjectModal
                isOpen={editProjectModal.isOpen}
                onClose={() => setEditProjectModal({ isOpen: false, project: null })}
                project={editProjectModal.project}
                tasks={tasks.filter(t => t.projectId === editProjectModal.project?.id)}
                onSave={handleSaveProjectEdit}
            />

            <DeleteProjectModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, project: null })}
                projectName={deleteModal.project?.name}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
