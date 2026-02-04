'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  Settings,
  Bell,
  User,
  Plug,
  Check,
  ArrowLeft,
  Loader2,
  Workflow,
  Sparkles,
  Camera,
  Building2,
  Package,
  Clock,
  Mail,
  Save
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

// Sidebar component
function Sidebar() {
  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-stone-50/50 backdrop-blur-md border-r border-stone-200/50 flex flex-col z-20">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo size="sm" />
        </Link>
      </div>

      {/* Back to Dashboard */}
      <div className="px-4 mb-6">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-white border border-transparent hover:border-stone-200/50 rounded-xl transition-all shadow-sm hover:shadow-smooth"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Agent
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <Link
          href="/dashboard/data"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100/50 transition-colors text-sm font-medium"
        >
          <TrendingUp size={18} strokeWidth={1.5} />
          <span>Data Dashboard</span>
        </Link>
        <Link
          href="/settings"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white text-stone-900 shadow-smooth border border-stone-200/50 text-sm font-medium"
        >
          <Settings size={18} strokeWidth={1.5} />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}

// Settings navigation
const settingsNav = [
  { id: 'integrations', icon: Plug, label: 'Integrations' },
  { id: 'workflows', icon: Workflow, label: 'Automations' },
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
];

// Integration Data - Ticket Creation Platforms First
const TOOLS = [
  { id: 'linear', name: 'Linear', type: 'Issue Tracking', desc: 'Create and sync issues directly', icon: '📐', color: '#5E6AD2', canCreateTickets: true },
  { id: 'github', name: 'GitHub Issues', type: 'Issue Tracking', desc: 'Push feedback to GitHub repos', icon: '🐙', color: '#24292f', canCreateTickets: true },
  { id: 'jira', name: 'Jira', type: 'Issue Tracking', desc: 'Create tickets from insights', icon: '📋', color: '#0052CC', canCreateTickets: true },
  { id: 'notion', name: 'Notion', type: 'Knowledge Base', desc: 'Save insights to databases', icon: '📝', color: '#000000', canCreateTickets: true },
  { id: 'slack', name: 'Slack', type: 'Communication', desc: 'Listen to #feedback channels', icon: '💬', color: '#4A154B', canCreateTickets: false },
  { id: 'zoom', name: 'Zoom', type: 'Calls', desc: 'Transcribe customer calls', icon: '🎥', color: '#2D8CFF', canCreateTickets: false },
  { id: 'intercom', name: 'Intercom', type: 'Support', desc: 'Analyze support tickets', icon: '🔷', color: '#1F8CED', canCreateTickets: false },
];

// Integration card component
function IntegrationCard({
  tool,
  connected,
  onToggle,
}: {
  tool: typeof TOOLS[0];
  connected: boolean;
  onToggle: () => void;
}) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (connected) {
      onToggle();
      return;
    }

    setIsConnecting(true);
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnecting(false);
    onToggle();
  };

  return (
    <div className={`group glass-panel p-5 rounded-2xl hover:border-stone-300 transition-all ${tool.canCreateTickets ? 'ring-1 ring-indigo-100' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-stone-100"
            style={{ backgroundColor: connected ? `${tool.color}15` : '#f5f5f4' }}
          >
            {tool.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stone-900">{tool.name}</h3>
              {tool.canCreateTickets && (
                <span className="text-[9px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  Tickets
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">{tool.type}</p>
          </div>
        </div>
        {connected && (
          <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        )}
      </div>

      <p className="text-sm text-stone-500 mb-6 min-h-[40px]">{tool.desc}</p>

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
          connected
            ? 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300'
            : 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-900/10'
        }`}
      >
        {isConnecting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Connecting...
          </span>
        ) : connected ? (
          'Disconnect'
        ) : (
          'Connect'
        )}
      </button>
    </div>
  );
}

interface WorkflowCardProps {
  title: string;
  desc: string;
  active: boolean;
  onToggle: () => void;
  steps: string[];
}

function WorkflowCard({ title, desc, active, onToggle, steps }: WorkflowCardProps) {
    return (
        <div className={`p-6 rounded-2xl border transition-all ${active ? 'bg-white border-stone-200 shadow-smooth' : 'bg-stone-50 border-stone-100 opacity-70'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-indigo-50 text-indigo-600' : 'bg-stone-200 text-stone-400'}`}>
                        <Workflow size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-stone-900">{title}</h3>
                        <p className="text-xs text-stone-500">{desc}</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={active} onChange={onToggle} />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                </label>
            </div>
            
            <div className="relative pl-4 space-y-6 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-stone-200">
                {steps.map((step: string, i: number) => (
                    <div key={i} className="relative flex items-center gap-3 text-sm">
                        <div className={`absolute -left-[15px] w-2.5 h-2.5 rounded-full border-2 border-white ${active ? 'bg-indigo-500' : 'bg-stone-300'}`} />
                        <span className="text-stone-600">{step}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Profile data interface
interface ProfileData {
  fullName: string;
  email: string;
  role: string;
  company: string;
  productName: string;
  timezone: string;
  avatarInitials: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('integrations');
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({
    linear: false,
    github: false,
    jira: false,
    notion: false,
    slack: true,
    zoom: false,
    intercom: false,
  });

  // Set initial tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['integrations', 'workflows', 'profile', 'notifications'].includes(tab)) {
      setTimeout(() => setActiveTab(tab), 0);
    }
  }, [searchParams]);

  const [workflows, setWorkflows] = useState({
      triage: true,
      roadmap: false,
      meetings: false
  });

  // Profile state
  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'Alex Rivera',
    email: 'alex@startup.com',
    role: 'Head of Product',
    company: 'Acme Inc',
    productName: 'Acme Platform',
    timezone: 'America/Los_Angeles',
    avatarInitials: 'AR',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ProfileData>(profile);

  const handleProfileSave = () => {
    setProfile(editedProfile);
    setIsEditingProfile(false);
    setProfileSaved(true);
    // Auto-hide saved message after 3 seconds
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleProfileCancel = () => {
    setEditedProfile(profile);
    setIsEditingProfile(false);
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden">
       {/* Texture */}
       <div className="grain fixed inset-0 z-[100] pointer-events-none opacity-40"></div>
       <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-stone-200/40 rounded-full blur-[120px]" />
       </div>

      <Sidebar />

      {/* Main content */}
      <main className="relative z-10 flex-1 ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/50 px-8 py-5">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-serif text-stone-900">Settings</h1>
            <p className="text-sm text-stone-500">Manage your digital workspace and AI behaviors</p>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-10 p-1 bg-stone-200/50 rounded-xl w-fit backdrop-blur-sm">
            {settingsNav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-lg font-medium text-stone-900 mb-2">Connect Your Stack</h2>
                <p className="text-stone-500 text-sm max-w-2xl">
                    Lark acts as the connective tissue between your customer feedback and your product roadmap. 
                    Connect the tools you use daily.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TOOLS.map((tool) => (
                  <IntegrationCard
                    key={tool.id}
                    tool={tool}
                    connected={integrations[tool.id]}
                    onToggle={() => toggleIntegration(tool.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Automations Tab */}
          {activeTab === 'workflows' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-stone-900 mb-2">AI Junior PM Workflows</h2>
                    <p className="text-stone-500 text-sm max-w-2xl">
                        Configure how Lark autonomously manages your product operations. 
                        Enable these workflows to replace manual junior PM tasks.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                      <WorkflowCard 
                        title="Feedback Triage"
                        desc="Auto-capture and categorize customer feedback"
                        active={workflows.triage}
                        onToggle={() => setWorkflows(prev => ({...prev, triage: !prev.triage}))}
                        steps={[
                            "Listen to #feedback channels in Slack",
                            "Detect bugs, feature requests, or praise",
                            "Draft Linear issue if bug is verified"
                        ]}
                      />
                       <WorkflowCard 
                        title="Meeting Intelligence"
                        desc="Turn customer calls into actionable insights"
                        active={workflows.meetings}
                        onToggle={() => setWorkflows(prev => ({...prev, meetings: !prev.meetings}))}
                        steps={[
                            "Transcribe Zoom/Google Meet recording",
                            "Extract pain points and feature requests",
                            "Update customer CRM profile in Salesforce"
                        ]}
                      />
                      <WorkflowCard 
                        title="Roadmap Sync"
                        desc="Keep stakeholders updated automatically"
                        active={workflows.roadmap}
                        onToggle={() => setWorkflows(prev => ({...prev, roadmap: !prev.roadmap}))}
                        steps={[
                            "Monitor Linear/Jira for status changes",
                            "Generate weekly changelog draft",
                            "Post update to #product-announcements"
                        ]}
                      />
                  </div>
              </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
              {/* Success message */}
              {profileSaved && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check size={16} className="text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-emerald-800">Profile saved successfully!</p>
                </div>
              )}

              {/* Profile Card */}
              <div className="glass-panel p-8 rounded-2xl">
                {/* Header with Avatar */}
                <div className="flex items-start gap-6 mb-8 pb-8 border-b border-stone-100">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-stone-700 to-stone-900 border-4 border-white shadow-lg flex items-center justify-center text-2xl font-serif text-white">
                      {isEditingProfile ? editedProfile.avatarInitials : profile.avatarInitials}
                    </div>
                    {isEditingProfile && (
                      <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-stone-200 rounded-full shadow-sm flex items-center justify-center hover:bg-stone-50 transition-colors">
                        <Camera size={14} className="text-stone-500" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl text-stone-900">{profile.fullName}</h3>
                    <p className="text-stone-500">{profile.role} at {profile.company}</p>
                    <p className="text-sm text-stone-400 mt-1">{profile.email}</p>
                  </div>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => {
                        setEditedProfile(profile);
                        setIsEditingProfile(true);
                      }}
                      className="px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 hover:border-stone-300 transition-all"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleProfileCancel}
                        className="px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProfileSave}
                        className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-all flex items-center gap-2"
                      >
                        <Save size={14} />
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Personal Info Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4">Personal Information</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                          <User size={14} className="text-stone-400" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={isEditingProfile ? editedProfile.fullName : profile.fullName}
                          onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value, avatarInitials: e.target.value.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() })}
                          disabled={!isEditingProfile}
                          className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all ${
                            isEditingProfile
                              ? 'bg-white border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100'
                              : 'bg-stone-50 border-stone-100 text-stone-600'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                          <Mail size={14} className="text-stone-400" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={isEditingProfile ? editedProfile.email : profile.email}
                          onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                          disabled={!isEditingProfile}
                          className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all ${
                            isEditingProfile
                              ? 'bg-white border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100'
                              : 'bg-stone-50 border-stone-100 text-stone-600'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Info Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4">Work</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                          <Sparkles size={14} className="text-stone-400" />
                          Role
                        </label>
                        <input
                          type="text"
                          value={isEditingProfile ? editedProfile.role : profile.role}
                          onChange={(e) => setEditedProfile({ ...editedProfile, role: e.target.value })}
                          disabled={!isEditingProfile}
                          className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all ${
                            isEditingProfile
                              ? 'bg-white border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100'
                              : 'bg-stone-50 border-stone-100 text-stone-600'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                          <Building2 size={14} className="text-stone-400" />
                          Company
                        </label>
                        <input
                          type="text"
                          value={isEditingProfile ? editedProfile.company : profile.company}
                          onChange={(e) => setEditedProfile({ ...editedProfile, company: e.target.value })}
                          disabled={!isEditingProfile}
                          className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all ${
                            isEditingProfile
                              ? 'bg-white border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100'
                              : 'bg-stone-50 border-stone-100 text-stone-600'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Info Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4">Product Monitoring</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                          <Package size={14} className="text-stone-400" />
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={isEditingProfile ? editedProfile.productName : profile.productName}
                          onChange={(e) => setEditedProfile({ ...editedProfile, productName: e.target.value })}
                          disabled={!isEditingProfile}
                          placeholder="What product should Lark monitor?"
                          className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all ${
                            isEditingProfile
                              ? 'bg-white border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100'
                              : 'bg-stone-50 border-stone-100 text-stone-600'
                          }`}
                        />
                        <p className="text-xs text-stone-400 mt-1.5">Lark will search for mentions of this product</p>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                          <Clock size={14} className="text-stone-400" />
                          Timezone
                        </label>
                        <select
                          value={isEditingProfile ? editedProfile.timezone : profile.timezone}
                          onChange={(e) => setEditedProfile({ ...editedProfile, timezone: e.target.value })}
                          disabled={!isEditingProfile}
                          className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all ${
                            isEditingProfile
                              ? 'bg-white border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100'
                              : 'bg-stone-50 border-stone-100 text-stone-600'
                          }`}
                        >
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Paris (CET)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                          <option value="Asia/Singapore">Singapore (SGT)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-8 p-6 border border-red-100 bg-red-50/50 rounded-2xl">
                <h4 className="text-sm font-semibold text-red-800 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-600/80 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}