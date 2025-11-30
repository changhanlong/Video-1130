
import React from 'react';
import { SavedProject } from '../types';
import { Folder, Plus, Trash2, Clock, FileText } from 'lucide-react';

interface Props {
  projects: SavedProject[];
  currentProjectId: string | null;
  onSelectProject: (project: SavedProject) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  isOpen: boolean;
}

const ProjectHistory: React.FC<Props> = ({ projects, currentProjectId, onSelectProject, onNewProject, onDeleteProject, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-full animate-slideRight">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">项目库 / Library</h2>
        <button 
            onClick={onNewProject}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white rounded-lg py-2 px-3 flex items-center justify-center text-sm font-medium transition-colors"
        >
            <Plus className="w-4 h-4 mr-2" /> 新建项目
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {projects.length === 0 && (
            <div className="text-center p-4 text-gray-600 text-xs">暂无历史项目</div>
        )}
        
        {projects.sort((a,b) => b.updatedAt - a.updatedAt).map(project => (
          <div 
            key={project.id}
            onClick={() => onSelectProject(project)}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                currentProjectId === project.id 
                    ? 'bg-gray-800 border border-gray-700 shadow-sm' 
                    : 'hover:bg-gray-800/50 border border-transparent'
            }`}
          >
            <div className="flex-1 min-w-0">
                <div className={`flex items-center text-sm font-medium truncate ${currentProjectId === project.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                    <Folder className={`w-4 h-4 mr-2 ${currentProjectId === project.id ? 'text-brand-500 fill-brand-500/20' : 'text-gray-600'}`} />
                    {project.name || "未命名项目"}
                </div>
                <div className="flex items-center mt-1 space-x-2">
                    <span className="text-[10px] text-gray-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                    {project.step === 3 && (
                         <span className="text-[10px] bg-green-900/30 text-green-500 px-1 rounded">已完成</span>
                    )}
                </div>
            </div>
            
            <button 
                onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                title="删除项目"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectHistory;
