'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Settings,
  Zap,
  Bug,
  Sparkles,
  MessageSquare,
  BarChart3,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useCompanyStore, getCompanyContextForAI } from '@/lib/stores/companyStore';

interface AnalyzedItem {
  id: string;
  content: string;
  category: string;
  sentiment: string;
  priority: string;
  priorityScore: number;
  suggestedTitle: string;
  summary: string;
  tags: string[];
  productArea?: string;
}

interface AnalysisResult {
  items: AnalyzedItem[];
  summary: {
    total: number;
    byCategory: Record<string, number>;
    bySentiment: Record<string, number>;
    byPriority: Record<string, number>;
    topTags: { tag: string; count: number }[];
    topProductAreas: { area: string; count: number }[];
  };
  recommendations: string[];
}

interface UploadedFile {
  name: string;
  content: string;
  size: number;
  rows?: number;
}

const PLATFORMS = [
  { id: 'linear', name: 'Linear', icon: '📐' },
  { id: 'github', name: 'GitHub', icon: '🐙' },
  { id: 'jira', name: 'Jira', icon: '📋' },
  { id: 'notion', name: 'Notion', icon: '📝' },
] as const;

export default function AutomationPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [runResult, setRunResult] = useState<{ ticketsCreated: number; slackSent: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const company = useCompanyStore(state => state.company);

  const [config, setConfig] = useState({
    productContext: '',
    ticketing: {
      enabled: false,
      platform: 'linear' as string,
      accessToken: '',
      teamId: '',
      projectId: '',
      owner: '',
      repo: '',
      minPriority: 'high' as string,
      categories: ['bug', 'feature_request'],
      dryRun: true,
    },
    slack: { enabled: false, webhookUrl: '', mentionOnUrgent: '' },
  });

  useEffect(() => {
    const companyContext = getCompanyContextForAI();
    if (companyContext && !config.productContext) {
      setConfig(prev => ({ ...prev, productContext: companyContext }));
    }
  }, [company.productName]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const content = await file.text();
      newFiles.push({ name: file.name, content, size: file.size });
    }
    setFiles(prev => [...prev, ...newFiles]);
    setAnalysis(null);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setAnalysis(null);
  };

  const analyzeFiles = async () => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch('/api/automation/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: files[0].content, fileName: files[0].name, productContext: config.productContext }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Analysis failed');
      setAnalysis(data.analysis);
      setFiles(prev => prev.map((f, i) => i === 0 ? { ...f, rows: data.parsed.totalRows } : f));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runPipeline = async () => {
    if (files.length === 0) return;
    setIsRunning(true);
    setError(null);
    setRunResult(null);
    try {
      const response = await fetch('/api/automation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map(f => ({ content: f.content, fileName: f.name })),
          productContext: config.productContext,
          ticketing: config.ticketing.enabled ? { ...config.ticketing, enabled: true } : undefined,
          slack: config.slack.enabled ? { webhookUrl: config.slack.webhookUrl, mentionOnUrgent: config.slack.mentionOnUrgent || undefined } : undefined,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Pipeline failed');
      setAnalysis(data.result.analysis);
      setRunResult({ ticketsCreated: data.result.tickets?.created?.length || 0, slackSent: data.result.notificationsSent?.slack || false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pipeline failed');
    } finally {
      setIsRunning(false);
    }
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    bug: <Bug size={14} className="text-red-500" />,
    feature_request: <Sparkles size={14} className="text-purple-500" />,
    complaint: <AlertCircle size={14} className="text-orange-500" />,
    praise: <CheckCircle2 size={14} className="text-green-500" />,
    question: <MessageSquare size={14} className="text-blue-500" />,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Automation Pipeline</h1>
          <p className="text-sm text-stone-500 mt-1">Upload feedback files, analyze with AI, and create tickets automatically</p>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            showConfig ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Settings size={16} />
          Configure
        </button>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="font-semibold text-stone-900 mb-4">Pipeline Configuration</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Product Context</label>
              <textarea
                value={config.productContext}
                onChange={e => setConfig(prev => ({ ...prev, productContext: e.target.value }))}
                placeholder="Describe your product so AI can better analyze feedback..."
                rows={3}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-stone-700">Auto-Create Tickets</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.ticketing.enabled}
                    onChange={e => setConfig(prev => ({ ...prev, ticketing: { ...prev.ticketing, enabled: e.target.checked } }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900" />
                </label>
              </div>
              {config.ticketing.enabled && (
                <div className="space-y-3 p-4 bg-stone-50 rounded-xl">
                  <div className="grid grid-cols-4 gap-2">
                    {PLATFORMS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setConfig(prev => ({ ...prev, ticketing: { ...prev.ticketing, platform: p.id } }))}
                        className={`p-2 rounded-lg border text-center text-xs ${
                          config.ticketing.platform === p.id ? 'border-stone-400 bg-white shadow-sm' : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-lg">{p.icon}</span>
                        <span className="block mt-1">{p.name}</span>
                      </button>
                    ))}
                  </div>
                  <input
                    type="password"
                    placeholder="Access Token"
                    value={config.ticketing.accessToken}
                    onChange={e => setConfig(prev => ({ ...prev, ticketing: { ...prev.ticketing, accessToken: e.target.value } }))}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
                  />
                  <label className="flex items-center gap-2 text-xs text-stone-600">
                    <input
                      type="checkbox"
                      checked={config.ticketing.dryRun}
                      onChange={e => setConfig(prev => ({ ...prev, ticketing: { ...prev.ticketing, dryRun: e.target.checked } }))}
                      className="rounded"
                    />
                    Dry Run (preview only)
                  </label>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-stone-700">Slack Notifications</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.slack.enabled}
                    onChange={e => setConfig(prev => ({ ...prev, slack: { ...prev.slack, enabled: e.target.checked } }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900" />
                </label>
              </div>
              {config.slack.enabled && (
                <input
                  type="text"
                  placeholder="Slack Webhook URL"
                  value={config.slack.webhookUrl}
                  onChange={e => setConfig(prev => ({ ...prev, slack: { ...prev.slack, webhookUrl: e.target.value } }))}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Upload */}
        <div className="lg:col-span-1 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-stone-300 rounded-2xl bg-white hover:border-stone-400 hover:bg-stone-50 transition-all cursor-pointer text-center"
          >
            <Upload size={32} className="mx-auto text-stone-400 mb-3" />
            <p className="font-medium text-stone-700">Upload Feedback Files</p>
            <p className="text-sm text-stone-500 mt-1">CSV, JSON, or TXT</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.txt"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white border border-stone-200 rounded-xl">
                  <FileText size={20} className="text-stone-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{file.name}</p>
                    <p className="text-xs text-stone-500">
                      {(file.size / 1024).toFixed(1)} KB{file.rows && ` · ${file.rows} items`}
                    </p>
                  </div>
                  <button onClick={() => removeFile(i)} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
                    <Trash2 size={16} className="text-stone-400" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={analyzeFiles}
                  disabled={isAnalyzing || files.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-stone-200 text-stone-700 rounded-xl font-medium hover:bg-stone-50 disabled:opacity-50 transition-all"
                >
                  {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <BarChart3 size={18} />}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Only'}
                </button>
                <button
                  onClick={runPipeline}
                  disabled={isRunning || files.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 transition-all"
                >
                  {isRunning ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                  {isRunning ? 'Running...' : 'Run Pipeline'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {runResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span className="font-medium text-emerald-800">Pipeline Complete!</span>
              </div>
              <p className="text-sm text-emerald-700">
                {runResult.ticketsCreated} tickets created{config.ticketing.dryRun && ' (dry run)'}
                {runResult.slackSent && ' · Slack notified'}
              </p>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2">
          {analysis ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-stone-200 rounded-xl">
                  <p className="text-2xl font-semibold text-stone-900">{analysis.summary.total}</p>
                  <p className="text-sm text-stone-500">Total Items</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-2xl font-semibold text-red-700">
                    {(analysis.summary.byPriority.urgent || 0) + (analysis.summary.byPriority.high || 0)}
                  </p>
                  <p className="text-sm text-red-600">Urgent/High</p>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <p className="text-2xl font-semibold text-purple-700">{analysis.summary.byCategory.feature_request || 0}</p>
                  <p className="text-sm text-purple-600">Feature Requests</p>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  <p className="text-2xl font-semibold text-orange-700">{analysis.summary.bySentiment.negative || 0}</p>
                  <p className="text-sm text-orange-600">Negative</p>
                </div>
              </div>

              {analysis.recommendations.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    AI Recommendations
                  </h3>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                        <ChevronRight size={14} className="text-amber-400 mt-0.5 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-stone-100">
                  <h3 className="font-medium text-stone-900">Analyzed Feedback</h3>
                </div>
                <div className="divide-y divide-stone-100 max-h-[500px] overflow-y-auto">
                  {analysis.items.slice(0, 50).map((item, i) => (
                    <div key={i} className="p-4 hover:bg-stone-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {categoryIcons[item.category] || <FileText size={14} className="text-stone-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-900 text-sm">{item.suggestedTitle}</p>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{item.summary}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-stone-100 text-stone-600'
                            }`}>
                              {item.priority}
                            </span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              item.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                              item.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                              'bg-stone-100 text-stone-600'
                            }`}>
                              {item.sentiment}
                            </span>
                            {item.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-semibold text-stone-400">{item.priorityScore}</span>
                          <p className="text-[10px] text-stone-400">score</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 bg-white border border-stone-200 rounded-2xl min-h-[300px]">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <Zap size={32} className="text-stone-400" />
                </div>
                <h3 className="font-semibold text-stone-700 mb-2">Upload files to get started</h3>
                <p className="text-sm text-stone-500 max-w-md">
                  Upload CSV, JSON, or TXT files with customer feedback.
                  The AI will analyze, categorize, and prioritize everything automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
