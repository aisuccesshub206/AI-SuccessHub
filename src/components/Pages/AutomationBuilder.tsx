import React, { useState } from 'react';
import {
  Workflow,
  WorkflowStep,
  AgentType,
} from '../../types';
import {
  Zap,
  Play,
  Plus,
  Save,
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bot,
  FileText,
  Mail,
  Sliders,
  Trash2,
  ArrowRight,
  Sparkles,
  Layers,
  Copy,
  Calendar,
  Search,
} from 'lucide-react';

import { INITIAL_WORKFLOWS } from '../../data/v2Data';

interface AutomationBuilderProps {
  workflows?: Workflow[];
  onSaveWorkflow?: (workflow: Workflow) => void;
  onRunWorkflow?: (workflowId: string) => void;
}

const AGENT_CATALOG: { type: AgentType; name: string; desc: string; icon: string }[] = [
  { type: 'Research Agent', name: 'AI Research Agent', desc: 'Performs deep multi-document web and text extraction, fact extraction, and citation compiling.', icon: 'Search' },
  { type: 'Task Manager', name: 'AI Task Manager', desc: 'Automates scheduling, task breakdown, status tracking, and file routing.', icon: 'Zap' },
  { type: 'Content Creator', name: 'AI Content Creator', desc: 'Drafts articles, social posts, emails, and marketing copy based on input document briefs.', icon: 'Sparkles' },
  { type: 'Report Generator', name: 'AI Report Generator', desc: 'Synthesizes raw data and text into structured executive PDFs, markdown digests, or presentation slides.', icon: 'FileText' },
  { type: 'Data Analysis Assistant', name: 'AI Data Analysis Assistant', desc: 'Parses tables, CSVs, and financial PDFs to extract metrics, trends, and risk scores.', icon: 'Sliders' },
  { type: 'Business Assistant', name: 'AI Business Assistant', desc: 'Handles client communications, invoice parsing, redline recommendations, and contract audits.', icon: 'Bot' },
];

export const AutomationBuilder: React.FC<AutomationBuilderProps> = ({
  workflows = INITIAL_WORKFLOWS,
  onSaveWorkflow,
  onRunWorkflow,
}) => {
  const safeWorkflows = workflows && workflows.length > 0 ? workflows : INITIAL_WORKFLOWS;
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow>(safeWorkflows[0] || {
    id: `wf-${Date.now()}`,
    name: 'New Custom AI Workflow',
    description: 'Automates document ingestion, AI agent analysis, and report generation.',
    category: 'Custom Automation',
    steps: [
      { id: 's1', title: 'File Trigger', stepType: 'trigger', actionName: 'PDF or Document Ingestion', config: {} },
      { id: 's2', title: 'Research & Extract', stepType: 'ai_agent', agentType: 'Research Agent', actionName: 'Deep OCR & Summary', config: {} },
    ],
    isScheduled: false,
    status: 'draft',
    author: 'Sarah Jenkins',
    runsCount: 0,
    isPublic: true,
  });

  const [runningStepId, setRunningStepId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cronInput, setCronInput] = useState(selectedWorkflow.cronExpression || '0 9 * * 1-5');

  const handleAddStep = (type: WorkflowStep['stepType'], agentType?: AgentType) => {
    const newStep: WorkflowStep = {
      id: `s-${Date.now()}`,
      title: agentType || (type === 'trigger' ? 'Event Trigger' : type === 'notification' ? 'Email / Slack Dispatch' : 'PDF Processing Step'),
      stepType: type,
      agentType: agentType,
      actionName: agentType ? `${agentType} Automated Task` : type === 'notification' ? 'Send Webhook/Email' : 'Process Document',
      config: {},
      status: 'idle',
    };

    setSelectedWorkflow((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const handleRemoveStep = (stepId: string) => {
    setSelectedWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== stepId),
    }));
  };

  const handleExecuteWorkflow = () => {
    setIsExecuting(true);
    setLogs(['[SYSTEM] Initializing AI Automation Pipeline...', `[TRIGGER] ${selectedWorkflow.steps[0]?.title || 'Ingesting document...'}`]);

    let delay = 600;
    selectedWorkflow.steps.forEach((step, index) => {
      setTimeout(() => {
        setRunningStepId(step.id);
        setLogs((prev) => [
          ...prev,
          `[STEP ${index + 1}] Executing ${step.title}...`,
          `[AI AGENT] ${step.agentType ? `Active: ${step.agentType}` : 'Processing document rules...'}`,
          `[SUCCESS] Step ${index + 1} completed with 100% confidence.`,
        ]);

            if (index === selectedWorkflow.steps.length - 1) {
              setTimeout(() => {
                setRunningStepId(null);
                setIsExecuting(false);
                setLogs((prev) => [...prev, '🎉 [WORKFLOW COMPLETE] All AI agent tasks executed successfully!']);
                if (onRunWorkflow) {
                  onRunWorkflow(selectedWorkflow.id);
                }
              }, 800);
            }
          }, delay);
          delay += 1000;
        });
      };

      const handleSave = () => {
        if (onSaveWorkflow) {
          onSaveWorkflow({
            ...selectedWorkflow,
            status: 'active',
            lastRun: 'Just now',
          });
        }
        alert('Workflow saved successfully!');
      };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            AI Automation Platform V2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Workflow & Drag & Drop Automation Creator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Build multi-step AI pipelines powered by autonomous AI Agents (Research, Task Manager, Content, Report, Data Analysis).
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{selectedWorkflow.isScheduled ? 'Scheduled' : 'Schedule Cron'}</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          >
            <Share2 className="w-4 h-4 text-purple-400" />
            <span>Share</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Workflow</span>
          </button>

          <button
            onClick={handleExecuteWorkflow}
            disabled={isExecuting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 transition-all"
          >
            <Play className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Running AI...' : 'Run Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Saved Workflows & Agent Palette */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Saved Workflows Selector */}
          <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Saved AI Workflows ({safeWorkflows.length})</span>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {safeWorkflows.map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedWorkflow.id === wf.id
                      ? 'bg-indigo-950/60 border-indigo-500/60 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold text-xs truncate">{wf.name}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>{wf.steps.length} Steps</span>
                    <span className="text-emerald-400">{wf.runsCount} runs</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Agents Catalog */}
          <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>AI Agents (Click to Add)</span>
            </h3>

            <div className="space-y-2">
              {AGENT_CATALOG.map((agent) => (
                <button
                  key={agent.type}
                  onClick={() => handleAddStep('ai_agent', agent.type)}
                  className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/40 rounded-xl transition-all group flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-400 group-hover:scale-105 transition-transform">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center justify-between">
                      <span>{agent.name}</span>
                      <Plus className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{agent.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Canvas: Visual Drag & Drop Steps Diagram */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Workflow Header Info */}
          <div className="p-6 bg-[#0A0A10]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-3">
            <input
              type="text"
              value={selectedWorkflow.name}
              onChange={(e) => setSelectedWorkflow({ ...selectedWorkflow, name: e.target.value })}
              className="w-full bg-transparent text-xl font-bold text-white focus:outline-none focus:border-b border-indigo-500 pb-1"
            />
            <input
              type="text"
              value={selectedWorkflow.description}
              onChange={(e) => setSelectedWorkflow({ ...selectedWorkflow, description: e.target.value })}
              className="w-full bg-transparent text-xs text-slate-400 focus:outline-none focus:border-b border-indigo-500"
            />
          </div>

          {/* Visual Step Nodes */}
          <div className="space-y-4">
            {selectedWorkflow.steps.map((step, idx) => {
              const isRunning = runningStepId === step.id;

              return (
                <React.Fragment key={step.id}>
                  {idx > 0 && (
                    <div className="flex justify-center">
                      <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-indigo-400 rotate-90" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`p-5 rounded-2xl border transition-all ${
                      isRunning
                        ? 'bg-indigo-950/80 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.4)] scale-[1.01]'
                        : 'bg-[#07070e]/80 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{step.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                              {step.stepType.toUpperCase()}
                            </span>
                            {step.agentType && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60">
                                {step.agentType}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{step.actionName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isRunning ? (
                          <div className="flex items-center gap-1.5 text-xs text-indigo-400 animate-pulse font-semibold">
                            <Sparkles className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRemoveStep(step.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Add Step Action Bar */}
            <div className="p-4 bg-white/5 border border-dashed border-white/15 rounded-2xl flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Add Next Step:</span>
              <button
                onClick={() => handleAddStep('ai_agent', 'Research Agent')}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/60 rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" /> + AI Agent
              </button>
              <button
                onClick={() => handleAddStep('pdf_action')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> + PDF Action
              </button>
              <button
                onClick={() => handleAddStep('notification')}
                className="px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/60 rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" /> + Email Notification
              </button>
            </div>
          </div>

          {/* Real-time Execution Console Logs */}
          {logs.length > 0 && (
            <div className="p-5 bg-black/90 border border-white/10 rounded-2xl font-mono text-xs text-emerald-400 space-y-1.5 max-h-52 overflow-y-auto shadow-inner">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Live AI Execution Terminal Output</div>
              {logs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Schedule AI Task (Cron)
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="text-slate-300 font-semibold block">Cron Schedule Expression</label>
              <input
                type="text"
                value={cronInput}
                onChange={(e) => setCronInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono"
              />
              <p className="text-slate-400 text-[11px]">Example: <code className="text-indigo-400">0 9 * * 1-5</code> (Runs every weekday at 9:00 AM)</p>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableCron"
                  checked={selectedWorkflow.isScheduled}
                  onChange={(e) => setSelectedWorkflow({ ...selectedWorkflow, isScheduled: e.target.checked, cronExpression: cronInput })}
                  className="rounded bg-white/5 border-white/10 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="enableCron" className="text-slate-300 font-semibold">Enable Automated Cron Schedule</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-400" />
                Share Workflow
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Anyone with this link can fork and run this AI workflow in their workspace.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://aisuccesshub.com/wf/${selectedWorkflow.id}`}
                className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://aisuccesshub.com/wf/${selectedWorkflow.id}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
