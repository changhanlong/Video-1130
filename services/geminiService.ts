
import { GoogleGenAI, Type } from "@google/genai";
import { VideoBrief, ProjectDeliverables, AgentRole, AGENTS, Message } from '../types';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SYSTEM PROMPTS ---

const getTeamContext = (brief: VideoBrief) => {
  return `
    PROJECT CONTEXT:
    - Industry: ${brief.industry}
    - Topic: ${brief.topic}
    - Usage/Format: ${brief.usageFormat} (IMPORTANT: Adapt visuals for this format)
    - Content Details: ${brief.contentDetails}
    - Target Audience: ${brief.targetAudience}
    - Visual Style: ${brief.visualStyle}
    - Key Message: ${brief.keyMessage}
    - Target Duration: ${brief.duration}
    - Estimated Shot Count: ${brief.shotCount}

    TEAM ROLES:
    1. ${AGENTS.ChiefEditor.name} (${AGENTS.ChiefEditor.role}): Leader. Focus on Strategy, Logic, Values.
    2. ${AGENTS.ContentDirector.name} (${AGENTS.ContentDirector.role}): Storyteller. Focus on Story, Emotion, Script.
    3. ${AGENTS.Researcher.name} (${AGENTS.Researcher.role}): Scientist. Focus on FACTS, DATA, TECH ACCURACY. You must cite real sources.
    4. ${AGENTS.ExperienceDesigner.name} (${AGENTS.ExperienceDesigner.role}): Visionary. Focus on Visuals, Flow, Interaction.
    5. ${AGENTS.InteractionTech.name} (${AGENTS.InteractionTech.role}): Tech Specialist. Focus on Hardware compatibility (LED/Sand table), sensors, and feasibility.
  `;
};

// --- API FUNCTIONS ---

/**
 * Step 1: Start the kickoff meeting (Interactive).
 */
export const startKickoffMeeting = async (brief: VideoBrief): Promise<Message[]> => {
  const ai = getClient();
  const context = getTeamContext(brief);

  const prompt = `
    ${context}

    TASK:
    Initiate the project kickoff meeting.
    1. The Chief Editor should acknowledge the project, specifically mentioning the Usage Format (${brief.usageFormat}) and Industry.
    2. The Interaction Tech Expert MUST speak early if the format is complex (like LED Wall or Sand Table).
    3. The Researcher or Content Director should point out a potential gap or ambiguity in the brief.
    
    Output format: JSON Array of objects { "agentId": "Role", "content": "Message" }.
    Language: Chinese (Professional & Insightful).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              agentId: { type: Type.STRING },
              content: { type: Type.STRING }
            }
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((item: any, index: number) => ({
      id: `discuss-init-${index}`,
      role: 'model',
      agentId: item.agentId as AgentRole,
      content: item.content,
      timestamp: Date.now() + index * 1000
    }));

  } catch (error) {
    console.error("Error starting meeting:", error);
    return [
      { id: 'err1', role: 'model', agentId: AgentRole.ChiefEditor, content: "收到需求。请问您对这个视频的具体技术侧重点有什么特别要求吗？", timestamp: Date.now() }
    ];
  }
};

/**
 * Step 1.5: Continue the discussion (Reply to User OR Targeted Agent).
 */
export const continueTeamDiscussion = async (
    brief: VideoBrief, 
    history: Message[], 
    userMessage: string,
    targetAgentId?: AgentRole // New: User can click an agent to force them to speak
): Promise<Message[]> => {
  const ai = getClient();
  const context = getTeamContext(brief);
  
  // Convert history to string format for context
  const historyText = history.map(m => `${m.role === 'user' ? 'USER' : m.agentId}: ${m.content}`).join('\n');

  const targetInstruction = targetAgentId 
    ? `IMPORTANT: The user has specifically asked ${AGENTS[targetAgentId].name} (${targetAgentId}) to respond. Only this agent should speak, or this agent should lead the response.`
    : `Agents should react to the user's input. Provide 1 to 2 responses.`;

  const prompt = `
    ${context}

    CHAT HISTORY:
    ${historyText}
    
    LATEST USER MESSAGE:
    "${userMessage}"

    TASK:
    The user has replied.
    ${targetInstruction}
    If the user's input is empty, they might just be nudging the agent to speak. In that case, the agent should propose an idea or ask a relevant question based on their expertise.

    Output format: JSON Array of objects { "agentId": "Role", "content": "Message" }.
    Language: Chinese.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              agentId: { type: Type.STRING },
              content: { type: Type.STRING }
            }
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((item: any, index: number) => ({
      id: `discuss-reply-${Date.now()}-${index}`,
      role: 'model',
      agentId: item.agentId as AgentRole,
      content: item.content,
      timestamp: Date.now() + index * 1000
    }));

  } catch (error) {
    console.error("Error continuing discussion:", error);
    // Fallback if error, using target agent if available
    const fallbackAgent = targetAgentId || AgentRole.ChiefEditor;
    return [
      { id: 'err-rep', role: 'model', agentId: fallbackAgent, content: "收到，我们已记录您的反馈。", timestamp: Date.now() }
    ];
  }
};

/**
 * Step 2: Generate the Full Project Deliverables.
 */
export const generateDeliverables = async (brief: VideoBrief, discussionHistory: string): Promise<ProjectDeliverables> => {
  const ai = getClient();
  const context = getTeamContext(brief);

  const prompt = `
    ${context}

    TEAM DISCUSSION LOG:
    ${discussionHistory}

    TASK:
    Generate the final project deliverables (Project Bible).
    You MUST use the Google Search tool to find REAL URLs for the Data Verification section.

    REQUIREMENTS:
    1. **SCRIPT (分镜脚本)**:
       - **QUANTITY**: Based on user request: ${brief.shotCount}.
       - **FORMAT ADAPTATION**: The visuals MUST be designed for: ${brief.usageFormat}. (e.g., if LED Wall, focus on high-res wide visuals; if Sand Table, focus on projection alignment).
       - **DURATION**: Vary duration between 1s to 10s+.
       - **CONTENT**: Detailed Visuals, Camera Movements, and Audio.
    
    2. **DATA VERIFICATION (数据核实)**:
       - You must verify 3-5 technical facts used in the script.
       - **CRITICAL**: You MUST provide a valid URL link for the source in the 'url' field.

    REQUIRED OUTPUT FORMAT (Raw JSON):
    {
      "strategicPlan": {
        "coreValues": "...",
        "narrativeStructure": "...",
        "logicFlow": "..."
      },
      "script": [
        {
          "sceneNumber": 1,
          "shotType": "...",
          "transition": "...",
          "visual": "...",
          "midjourneyPrompt": "...",
          "audio": "...",
          "interaction": "...",
          "duration": "..."
        }
      ],
      "dataVerification": [
        {
          "fact": "...",
          "source": "Name of source",
          "url": "https://...", 
          "status": "Verified"
        }
      ]
    }

    Language: Chinese (Simplified), except for 'midjourneyPrompt' (English).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    let text = response.text || "{}";
    text = text.replace(/^```json\s*/g, '').replace(/^```\s*/g, '').replace(/\s*```$/g, '');

    const data = JSON.parse(text);
    
    if (data.script) {
        data.script = data.script.map((s: any) => ({ ...s, id: Math.random().toString(36).substr(2, 9) }));
    }
    
    return data as ProjectDeliverables;

  } catch (error) {
    console.error("Error generating deliverables:", error);
    throw new Error("Failed to generate project deliverables.");
  }
};

/**
 * Chat Refinement (Step 3) - Supports targeted editing.
 */
export const refineDeliverables = async (
  currentProject: ProjectDeliverables, 
  instruction: string, 
  agentRole: AgentRole
): Promise<{ project: ProjectDeliverables, comment: string }> => {
  const ai = getClient();
  const agent = AGENTS[agentRole];
  
  const prompt = `
    Current Project JSON: ${JSON.stringify(currentProject)}
    User Instruction: "${instruction}"
    Acting Agent: ${agent.name} (${agent.role})
    
    TASK:
    1. Modify the project JSON based on the instruction.
    2. **TARGETED EDITING**: If the user mentions a specific Scene Number (e.g., "#3", "Scene 5", "第三镜"), LOCATE that specific scene object and modify ONLY that scene (visual, audio, etc.) while keeping the rest intact.
    3. If the user instruction is general, apply it to the whole script or strategy.
    4. Provide a short comment explaining what was changed.
    
    Language: Chinese.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                project: {
                    type: Type.OBJECT,
                    properties: {
                        strategicPlan: {
                            type: Type.OBJECT,
                            properties: {
                                coreValues: { type: Type.STRING },
                                narrativeStructure: { type: Type.STRING },
                                logicFlow: { type: Type.STRING }
                            }
                        },
                        script: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    sceneNumber: { type: Type.INTEGER },
                                    shotType: { type: Type.STRING },
                                    transition: { type: Type.STRING },
                                    visual: { type: Type.STRING },
                                    midjourneyPrompt: { type: Type.STRING },
                                    audio: { type: Type.STRING },
                                    interaction: { type: Type.STRING },
                                    duration: { type: Type.STRING }
                                }
                            }
                        },
                        dataVerification: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    fact: { type: Type.STRING },
                                    source: { type: Type.STRING },
                                    url: { type: Type.STRING },
                                    status: { type: Type.STRING }
                                }
                            }
                        }
                    }
                },
                comment: { type: Type.STRING }
            }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    // Preserve IDs or generate new ones
    if (result.project && result.project.script) {
        result.project.script = result.project.script.map((s: any, idx: number) => ({
            ...s,
            id: currentProject.script[idx]?.id || Math.random().toString(36).substr(2, 9)
        }));
    }
    return result;

  } catch (error) {
    console.error("Refinement error", error);
    throw error;
  }
};
