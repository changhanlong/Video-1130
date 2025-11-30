import { SavedProject, VideoBrief, ProjectDeliverables, Message, USAGE_FORMATS, SHOT_COUNTS } from '../types';

const STORAGE_KEY = 'dreamcrew_projects';

export const getProjects = (): SavedProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load projects", e);
    return [];
  }
};

export const saveProject = (project: SavedProject): void => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  
  if (index >= 0) {
    projects[index] = { ...project, updatedAt: Date.now() };
  } else {
    projects.push({ ...project, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const deleteProject = (id: string): void => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const createNewProject = (): SavedProject => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: '未命名项目',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    step: 1,
    brief: {
        industry: "通用科技 (General Tech)",
        topic: '',
        contentDetails: '',
        targetAudience: '',
        visualStyle: "未来主义 / 赛博朋克 (Futuristic)",
        duration: '3 分钟 (标准展项演示)',
        keyMessage: '',
        usageFormat: USAGE_FORMATS[0],
        shotCount: SHOT_COUNTS[1]
    },
    discussionHistory: [],
    deliverables: null
  };
};