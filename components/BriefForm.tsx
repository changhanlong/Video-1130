
import React, { useState } from 'react';
import { VideoBrief, INDUSTRIES, VISUAL_STYLES, USAGE_FORMATS, SHOT_COUNTS } from '../types';
import { Play, ClipboardList, Clock, Hash, Target, MessageSquare, Layers, PenTool, Monitor, Film } from 'lucide-react';

interface Props {
  onSubmit: (brief: VideoBrief) => void;
  isLoading: boolean;
}

const BriefForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [brief, setBrief] = useState<VideoBrief>({
    industry: INDUSTRIES[0],
    topic: '',
    contentDetails: '',
    targetAudience: '',
    visualStyle: VISUAL_STYLES[0],
    duration: '3 分钟 (标准展项演示)',
    keyMessage: '',
    usageFormat: USAGE_FORMATS[0],
    shotCount: SHOT_COUNTS[1] // Default 20-25
  });

  const handleChange = (field: keyof VideoBrief, value: string) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(brief);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-gray-850 p-8 rounded-xl shadow-2xl border border-gray-750">
      <div className="mb-8 border-b border-gray-800 pb-6">
        <h2 className="text-3xl font-bold text-white mb-2">新建项目简报 / New Brief</h2>
        <p className="text-gray-400">请详细填写以下信息，我们的专家团队（总策划、文案、调研、视觉、互动技术）将为您服务。</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Row 1: Industry, Topic, Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-brand-400">
                <Layers className="w-4 h-4 mr-2" /> 所属行业 (Industry)
                </label>
                <select
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                value={brief.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                >
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
            </div>
            
             <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-brand-400">
                <Monitor className="w-4 h-4 mr-2" /> 视频用途/载体 (Usage)
                </label>
                <select
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                value={brief.usageFormat}
                onChange={(e) => handleChange('usageFormat', e.target.value)}
                >
                {USAGE_FORMATS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-300">
                <ClipboardList className="w-4 h-4 mr-2 text-brand-500" /> 核心主题 (Topic)
                </label>
                <input
                required
                type="text"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="例如：新一代量子计算原型机发布"
                value={brief.topic}
                onChange={(e) => handleChange('topic', e.target.value)}
                />
            </div>
        </div>

        {/* Row 2: Detailed Content (Important) */}
        <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <PenTool className="w-4 h-4 mr-2 text-brand-500" /> 内容详情 & 背景资料 (Content Details)
            </label>
            <textarea
              required
              rows={4}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none placeholder-gray-600"
              placeholder="请提供更多细节：技术参数、核心优势、竞争对手对比、由于哪些具体技术突破？越详细，调研编辑的校核越准确。"
              value={brief.contentDetails}
              onChange={(e) => handleChange('contentDetails', e.target.value)}
            />
        </div>

        {/* Row 3: Audience, Style, Duration, Shot Count */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <Target className="w-4 h-4 mr-2 text-brand-500" /> 目标受众
            </label>
            <input
              required
              type="text"
              className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="例如：政府领导, 投资人"
              value={brief.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <Hash className="w-4 h-4 mr-2 text-brand-500" /> 视觉画风
            </label>
            <select
              className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={brief.visualStyle}
              onChange={(e) => handleChange('visualStyle', e.target.value)}
            >
              {VISUAL_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <Clock className="w-4 h-4 mr-2 text-brand-500" /> 视频时长
            </label>
            <select
               className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
               value={brief.duration}
               onChange={(e) => handleChange('duration', e.target.value)}
            >
              <option>1 分钟 (预热/先导)</option>
              <option>3 分钟 (标准展项演示)</option>
              <option>5 分钟 (深度专题片)</option>
              <option>10 分钟+ (纪录片)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <Film className="w-4 h-4 mr-2 text-brand-500" /> 预计分镜数
            </label>
            <select
               className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
               value={brief.shotCount}
               onChange={(e) => handleChange('shotCount', e.target.value)}
            >
              {SHOT_COUNTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Row 4: Key Message */}
        <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <MessageSquare className="w-4 h-4 mr-2 text-brand-500" /> 核心传达目标 (Key Message)
            </label>
            <input
              required
              className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="一句话总结：观众看完必须记住什么？"
              value={brief.keyMessage}
              onChange={(e) => handleChange('keyMessage', e.target.value)}
            />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center transition-all shadow-lg hover:shadow-brand-500/20 mt-4 ${
            isLoading 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-brand-600 hover:bg-brand-500 text-white'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在召集专家团队...
            </span>
          ) : (
            <span className="flex items-center">
              启动项目 & 团队研讨 <Play className="ml-2 w-5 h-5 fill-current" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default BriefForm;
