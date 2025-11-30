
import React, { useState, useEffect } from 'react';
import { VideoBrief, ProjectDeliverables, AgentRole, Message, SavedProject, AGENTS } from './types';
import * as geminiService from './services/geminiService';
import * as storageService from './services/storageService';
import BriefForm from './components/BriefForm';
import ProjectDeliverablesView from './components/ScriptView';
import CrewPanel from './components/CrewPanel';
import ProjectHistory from './components/ProjectHistory';
import { Film, ArrowRight, Users, PlayCircle, FileText, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [currentProject, setCurrentProject] = useState<SavedProject>(storageService.createNewProject());
  const [projectList, setProjectList] = useState<SavedProject[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeAgent, setActiveAgent] = useState<AgentRole>(AgentRole.ChiefEditor);

  // --- INITIAL LOAD ---
  useEffect(() => {
    refreshProjectList();
  }, []);

  // Save current project whenever it changes deeply
  useEffect(() => {
    if (currentProject) {
      storageService.saveProject(currentProject);
      refreshProjectList(); // Updates sidebar timestamps
    }
  }, [currentProject]);

  const refreshProjectList = () => {
    setProjectList(storageService.getProjects());
  };

  // --- ACTIONS ---

  const handleNewProject = () => {
    const newProj = storageService.createNewProject();
    setCurrentProject(newProj);
    setSidebarOpen(false); // On mobile, maybe close. On desktop keeps context.
  };

  const handleLoadProject = (project: SavedProject) => {
    setCurrentProject(project);
    setSidebarOpen(false);
  };

  const handleDeleteProject = (id: string) => {
      if(!window.confirm("确定删除该项目吗？")) return;
      storageService.deleteProject(id);
      refreshProjectList();
      if (currentProject.id === id) {
          handleNewProject();
      }
  };

  // Step 1: Submit Brief -> Start Discussion
  const handleBriefSubmit = async (data: VideoBrief) => {
    // Update brief and move to step 2
    const updated = {
        ...currentProject,
        name: `${data.industry} - ${data.topic}` || '未命名项目',
        brief: data,
        step: 2,
        discussionHistory: [] // Clear previous history on new submit
    };
    setCurrentProject(updated);
    setIsLoading(true);

    try {
      // Step 2.1: Kickoff
      const discussionMsgs = await geminiService.startKickoffMeeting(data);
      
      // Animate messages adding
      let history = [...updated.discussionHistory];
      for (let i = 0; i < discussionMsgs.length; i++) {
          await new Promise(r => setTimeout(r, 800));
          history = [...history, discussionMsgs[i]];
          setCurrentProject(prev => ({ ...prev, discussionHistory: history }));
      }
      setIsLoading(false);

    } catch (error) {
      alert("团队讨论启动失败。");
      setIsLoading(false);
    }
  };

  // Step 2: Handle User Reply in Discussion
  const handleDiscussionReply = async (text: string, agent: AgentRole) => {
    if (currentProject.step !== 2) return;

    // Use selected agent as target
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text || "(邀请您发言)", timestamp: Date.now() };
    setCurrentProject(prev => ({
        ...prev,
        discussionHistory: [...prev.discussionHistory, userMsg]
    }));
    setIsLoading(true);

    try {
        const responseMsgs = await geminiService.continueTeamDiscussion(
            currentProject.brief, 
            [...currentProject.discussionHistory, userMsg], 
            text,
            agent // Pass selected agent
        );

        let history = [...currentProject.discussionHistory, userMsg];
        for (let i = 0; i < responseMsgs.length; i++) {
            await new Promise(r => setTimeout(r, 800));
            history = [...history, responseMsgs[i]];
            setCurrentProject(prev => ({ ...prev, discussionHistory: history }));
        }

    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  // Step 2 -> 3: Start Production (Generate Deliverables)
  const handleStartProduction = async () => {
    const updated = { ...currentProject, step: 3 };
    setCurrentProject(updated);
    setIsLoading(true);
    
    try {
        const contextString = updated.discussionHistory.map(m => `${m.role === 'user' ? 'USER' : m.agentId}: ${m.content}`).join('\n');
        const deliverables = await geminiService.generateDeliverables(updated.brief, contextString);
        
        setCurrentProject(prev => ({
            ...prev,
            deliverables: deliverables,
            discussionHistory: [
                ...prev.discussionHistory,
                {
                    id: 'edit-start',
                    role: 'model' as const,
                    agentId: AgentRole.ChiefEditor,
                    content: "全案策划已生成。分镜已扩展至约20个镜头。相关数据源已确认并附带链接。",
                    timestamp: Date.now()
                }
            ]
        }));

    } catch (error) {
        console.error(error);
        alert("生成全案失败，请重试。");
        setCurrentProject(prev => ({ ...prev, step: 2 }));
    } finally {
        setIsLoading(false);
    }
  };

  // Step 3: AI Refinement (Chat with specific agent)
  const handleRefineMessage = async (text: string, agentRole: AgentRole) => {
    if (!currentProject.deliverables) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setCurrentProject(prev => ({
        ...prev,
        discussionHistory: [...prev.discussionHistory, userMsg]
    }));
    setIsLoading(true);

    try {
      const { project, comment } = await geminiService.refineDeliverables(currentProject.deliverables, text, agentRole);
      
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        agentId: agentRole,
        content: comment,
        timestamp: Date.now()
      };
      
      setCurrentProject(prev => ({
          ...prev,
          deliverables: project,
          discussionHistory: [...prev.discussionHistory, responseMsg]
      }));

    } catch (error) {
      setCurrentProject(prev => ({
          ...prev,
          discussionHistory: [...prev.discussionHistory, {
              id: Date.now().toString(),
              role: 'model',
              agentId: agentRole,
              content: "抱歉，由于系统繁忙，无法完成修改。",
              timestamp: Date.now()
          }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Manual Edit (Direct Update)
  const handleManualUpdate = (newData: ProjectDeliverables) => {
      setCurrentProject(prev => ({
          ...prev,
          deliverables: newData
      }));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100 font-sans selection:bg-brand-500 selection:text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 flex-shrink-0 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4 z-20">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
             {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Film className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none hidden md:block">DreamCrew <span className="text-brand-500">PRO</span></h1>
          </div>
        </div>

        {/* Current Project Title Display */}
        <div className="flex-1 text-center mx-4 truncate text-sm font-medium text-gray-400">
             {currentProject.name}
        </div>
        
        {/* Progress Stepper */}
        <div className="hidden md:flex items-center space-x-2 text-xs font-medium bg-gray-800/50 p-1.5 rounded-full border border-gray-700">
            <div className={`px-3 py-1 rounded-full flex items-center ${currentProject.step >= 1 ? 'bg-gray-700 text-white' : 'text-gray-500'}`}>
                <span>1. 简报</span>
            </div>
            <ArrowRight className="w-3 h-3 text-gray-600" />
            <div className={`px-3 py-1 rounded-full flex items-center ${currentProject.step >= 2 ? 'bg-brand-900/30 text-brand-400 border border-brand-500/30' : 'text-gray-500'}`}>
                <Users className="w-3 h-3 mr-1.5" />
                <span>2. 团队研讨</span>
            </div>
            <ArrowRight className="w-3 h-3 text-gray-600" />
            <div className={`px-3 py-1 rounded-full flex items-center ${currentProject.step >= 3 ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'text-gray-500'}`}>
                <FileText className="w-3 h-3 mr-1.5" />
                <span>3. 交付全案</span>
            </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar */}
         <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
             <ProjectHistory 
                 projects={projectList}
                 currentProjectId={currentProject.id}
                 onSelectProject={handleLoadProject}
                 onNewProject={handleNewProject}
                 onDeleteProject={handleDeleteProject}
                 isOpen={true} // Controlled by parent container width
             />
         </div>

         {/* Workspace */}
         <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-950">
            
            {/* Step 1: Brief Form */}
            {currentProject.step === 1 && (
                <div className="w-full h-full overflow-y-auto p-6 flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                    {/* HACK: BriefForm uses internal state, but we might want to populate it if we are reloading Step 1. 
                        For simplicity in this version, loading Step 1 resets form visually unless we pass props.
                        Ideally, pass `initialData={currentProject.brief}` to BriefForm. */}
                    <BriefForm onSubmit={handleBriefSubmit} isLoading={isLoading} />
                </div>
            )}

            {/* Step 2: Discussion View */}
            {currentProject.step === 2 && (
                <div className="w-full h-full flex flex-col items-center p-6 bg-gray-900">
                    <div className="w-full max-w-5xl h-full flex flex-col bg-gray-850 rounded-2xl border border-gray-750 shadow-2xl overflow-hidden relative">
                        <div className="h-16 bg-gray-800 border-b border-gray-750 flex items-center px-6 justify-between">
                            <h2 className="text-lg font-bold flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                                项目启动会议 (Project Kickoff)
                            </h2>
                            <div className="flex items-center space-x-4">
                                {isLoading && <span className="text-xs text-gray-500 animate-pulse">团队思考中...</span>}
                                <button 
                                    onClick={handleStartProduction}
                                    disabled={isLoading}
                                    className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all animate-bounce-subtle"
                                >
                                    思路确认，生成全案 <PlayCircle className="ml-2 w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gray-900/50 z-0"></div>
                            <CrewPanel 
                                activeAgent={activeAgent}
                                onAgentSelect={setActiveAgent} // Now active in step 2
                                messages={currentProject.discussionHistory}
                                onSendMessage={handleDiscussionReply}
                                isProcessing={isLoading}
                                mode="discussion"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Workspace (Split View) */}
            {currentProject.step === 3 && currentProject.deliverables && (
                <div className="flex h-full w-full">
                    {/* Left: Project Deliverables (Document) */}
                    <div className="flex-1 h-full overflow-hidden p-4 md:p-6 bg-gray-950">
                        <ProjectDeliverablesView 
                            data={currentProject.deliverables} 
                            isLoading={isLoading && !currentProject.deliverables.script} 
                            onUpdate={handleManualUpdate}
                        />
                    </div>
                    
                    {/* Right: Agent Panel (Chat/Edit) */}
                    <div className="w-80 lg:w-96 h-full flex-shrink-0 border-l border-gray-800 z-10 shadow-xl bg-gray-900">
                        <CrewPanel 
                            activeAgent={activeAgent}
                            onAgentSelect={setActiveAgent}
                            messages={currentProject.discussionHistory}
                            onSendMessage={handleRefineMessage}
                            isProcessing={isLoading}
                            mode="edit"
                        />
                    </div>
                </div>
            )}
         </main>
      </div>
    </div>
  );
};

export default App;
