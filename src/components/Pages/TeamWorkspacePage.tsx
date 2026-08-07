import React, { useState } from 'react';
import { TeamWorkspace, TeamMember, TeamRole } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  HardDrive,
  FileText,
  Activity,
  Layers,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface TeamWorkspacePageProps {
  workspace: TeamWorkspace;
  onInviteMember: (email: string, role: TeamRole) => void;
  onRemoveMember: (id: string) => void;
  onChangeRole: (id: string, role: TeamRole) => void;
}

export const TeamWorkspacePage: React.FC<TeamWorkspacePageProps> = ({
  workspace,
  onInviteMember,
  onRemoveMember,
  onChangeRole,
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('Editor');

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    onInviteMember(inviteEmail, inviteRole);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Team & Enterprise Workspace V2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {workspace.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Collaborate on shared PDF documents, centralized AI workflows, and role-based workspace permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* Workspace Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Seat Allocation</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {workspace.members.length} / {workspace.maxSeats} Seats
          </div>
          <div className="text-[11px] text-indigo-300 font-semibold">{workspace.plan} Plan</div>
        </div>

        <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Team Shared Storage</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {workspace.storageUsedGB} GB / {workspace.storageLimitGB} GB
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">Automatic Cloud Backup</div>
        </div>

        <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Shared AI Workflows</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">14 Workflows</div>
          <div className="text-[11px] text-slate-400">Synced across team</div>
        </div>

        <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Monthly Processing</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">849 Documents</div>
          <div className="text-[11px] text-emerald-400 font-semibold">+22% productivity</div>
        </div>
      </div>

      {/* Main Table: Team Members Roster */}
      <div className="p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            Team Roster & Permission Roles
          </h3>
          <span className="text-xs text-slate-400 font-mono">Enterprise Audit Logging Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Member Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5">Files Processed</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {workspace.members.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-bold text-white flex items-center gap-3">
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    <span>{member.name}</span>
                  </td>

                  <td className="p-3.5 text-indigo-300">{member.email}</td>
                  <td className="p-3.5 text-slate-400">{member.joinedDate}</td>
                  <td className="p-3.5 font-bold text-white">{member.filesProcessed} docs</td>

                  <td className="p-3.5">
                    <select
                      value={member.role}
                      onChange={(e) => onChangeRole(member.id, e.target.value as TeamRole)}
                      disabled={member.role === 'Owner'}
                      className="px-2.5 py-1 bg-black/50 border border-white/10 rounded-lg text-xs font-bold text-indigo-300 focus:outline-none disabled:opacity-60"
                    >
                      <option value="Owner">Owner</option>
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </td>

                  <td className="p-3.5 text-right">
                    {member.role !== 'Owner' && (
                      <button
                        onClick={() => onRemoveMember(member.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form onSubmit={handleInviteSubmit} className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                Invite Team Member
              </h3>
              <button type="button" onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Role Permission</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                  className="w-full px-3 py-2.5 bg-[#07070e] border border-white/10 rounded-xl text-white focus:outline-none"
                >
                  <option value="Admin">Admin (Full Access & Billing)</option>
                  <option value="Editor">Editor (Can Create & Edit Workflows)</option>
                  <option value="Viewer">Viewer (Read & Run Only)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md">
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
