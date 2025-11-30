
export enum AgentRole {
  ChiefEditor = 'ChiefEditor', // 总策划
  ContentDirector = 'ContentDirector', // 资深策划
  Researcher = 'Researcher', // 调研编辑
  ExperienceDesigner = 'ExperienceDesigner', // 体验脚本
  InteractionTech = 'InteractionTech', // 互动专家 (New)
}

export interface Agent {
  id: AgentRole;
  name: string;
  role: string;
  avatar: string;
  color: string;
  bgColor: string;
  expertise: string;
}

export interface VideoBrief {
  industry: string;
  topic: string;
  contentDetails: string;
  targetAudience: string;
  visualStyle: string;
  duration: string;
  keyMessage: string;
  // New Fields
  usageFormat: string; // 用途 (LED, Sand Table, etc.)
  shotCount: string; // 预计分镜数量
}

export interface Scene {
  id: string;
  sceneNumber: number;
  shotType: string;
  transition: string;
  visual: string;
  midjourneyPrompt: string;
  audio: string;
  interaction: string;
  duration: string;
}

export interface ProjectDeliverables {
  strategicPlan: {
    coreValues: string;
    narrativeStructure: string;
    logicFlow: string;
  };
  script: Scene[];
  dataVerification: {
    id?: string;
    fact: string;
    source: string;
    url?: string;
    status: 'Verified' | 'Needs Check' | 'Manual';
  }[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  agentId?: AgentRole;
  content: string;
  timestamp: number;
}

export interface SavedProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  step: number;
  brief: VideoBrief;
  discussionHistory: Message[];
  deliverables: ProjectDeliverables | null;
}

export const INDUSTRIES = [
  "通用科技 (General Tech)",
  "航空航天 (Aerospace)",
  "机器人 (Robotics)",
  "自动驾驶 (Autonomous Driving)",
  "集成电路/芯片 (IC/Chips)",
  "生物医药 (BioTech)",
  "新能源 (New Energy)",
  "量子计算 (Quantum Computing)",
  "智慧城市 (Smart City)"
];

export const VISUAL_STYLES = [
  "未来主义 / 赛博朋克 (Futuristic)",
  "极简科技 / 苹果风 (Minimalist Tech)",
  "硬核工业 / 机械感 (Industrial)",
  "人文纪录 / 温暖 (Documentary)",
  "数据可视化 / 抽象 (Data Viz)",
  "3D 动画 / 概念演示 (3D Concept)",
  "国潮 / 东方美学 (Oriental)"
];

export const USAGE_FORMATS = [
  "标准屏幕 / 手机 / PC (Standard 16:9)",
  "大型 LED 大屏 (Large LED Wall)",
  "沉浸式折幕 / L幕 (Immersive L-Shape)",
  "数字沙盘 (Digital Sand Table)",
  "展厅互动展墙 (Interactive Wall)",
  "球幕 / 环幕 (Dome / 360 Ring)",
  "全息投影 (Hologram)"
];

export const SHOT_COUNTS = [
  "10-15 镜 (精简 / 节奏快)",
  "20-25 镜 (标准 / 叙事完整)",
  "30-40 镜 (细腻 / 深度展示)",
  "50+ 镜 (电影级 / 复杂分镜)"
];

export const AGENTS: Record<AgentRole, Agent> = {
  [AgentRole.ChiefEditor]: {
    id: AgentRole.ChiefEditor,
    name: "老张 (Chief)",
    role: "总策划 / 内容总监",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chief&backgroundColor=c0aede",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    expertise: "定战略、定叙事结构、定义展项逻辑、控制价值观与表达方式。"
  },
  [AgentRole.ContentDirector]: {
    id: AgentRole.ContentDirector,
    name: "Amanda",
    role: "资深策划 / 文案导演",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda&backgroundColor=ffdfbf",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    expertise: "展项故事线、体验逻辑脚本、多媒体内容脚本、情绪调动。"
  },
  [AgentRole.Researcher]: {
    id: AgentRole.Researcher,
    name: "Dr. Chen",
    role: "调研编辑 / 数据研究",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chen&backgroundColor=b6e3f4",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    expertise: "行业资料整理、专业数据核查、技术背景资料撰写、出处引用。"
  },
  [AgentRole.ExperienceDesigner]: {
    id: AgentRole.ExperienceDesigner,
    name: "Neo",
    role: "体验脚本编写",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neo&backgroundColor=c1f5d6",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    expertise: "动线设计、分镜描述、交互参与方式、视觉落地。"
  },
  [AgentRole.InteractionTech]: {
    id: AgentRole.InteractionTech,
    name: "Geek. Wu",
    role: "互动技术专家",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wu&backgroundColor=ffb3b3",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    expertise: "硬件载体适配 (LED/沙盘)、交互逻辑实现、传感器应用、技术可行性评估。"
  }
};
