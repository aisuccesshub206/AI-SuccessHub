import React, { useState } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Edit2,
  Plus,
  Crown,
  CheckCircle2,
  X,
  Lock,
  Mail,
  User as UserIcon,
  Filter,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface UserManagementConsoleProps {
  users: UserProfile[];
  onUpdateUserRole: (userId: string, newRole: 'user' | 'admin') => void;
  onUpdateUserPlan: (userId: string, newPlan: string) => void;
  onToggleAccountStatus: (userId: string, newStatus: 'active' | 'suspended') => void;
  onAddUser: (newUser: UserProfile) => void;
}

export const UserManagementConsole: React.FC<UserManagementConsoleProps> = ({
  users,
  onUpdateUserRole,
  onUpdateUserPlan,
  onToggleAccountStatus,
  onAddUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Edit User Modal state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Add User Modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [newUserPlan, setNewUserPlan] = useState('Free');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesPlan = planFilter === 'all' || u.plan === planFilter;
    return matchesSearch && matchesRole && matchesPlan;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const created: UserProfile = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      plan: newUserPlan,
      storageUsedMB: 0,
      storageLimitMB: newUserPlan === 'Lifetime' ? 100000 : newUserPlan.includes('Pro') ? 10000 : 500,
      filesProcessedCount: 0,
      favorites: [],
      role: newUserRole,
      accountStatus: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    onAddUser(created);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Registered Users &amp; Access Controls</h2>
            <p className="text-xs text-slate-400">
              Manage roles (`user` vs `admin`), upgrade subscription plans, and suspend/activate user accounts.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full py-2.5 px-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all" className="bg-slate-900 text-white">All Roles</option>
            <option value="admin" className="bg-slate-900 text-white">Admins Only</option>
            <option value="user" className="bg-slate-900 text-white">Users Only</option>
          </select>
        </div>

        <div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full py-2.5 px-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all" className="bg-slate-900 text-white">All Plans</option>
            <option value="Free" className="bg-slate-900 text-white">Free Plan</option>
            <option value="Pro Monthly" className="bg-slate-900 text-white">Pro Monthly</option>
            <option value="Pro Yearly" className="bg-slate-900 text-white">Pro Yearly</option>
            <option value="Lifetime" className="bg-slate-900 text-white">Lifetime VIP</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">User Info</th>
                <th className="p-4">Role</th>
                <th className="p-4">Subscription Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No users matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30" />
                        <div>
                          <div className="font-bold text-white text-sm">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          <Shield className="w-3 h-3 text-purple-400" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          <UserIcon className="w-3 h-3 text-slate-400" />
                          USER
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                          u.plan === 'Lifetime'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : u.plan.includes('Pro')
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <Crown className="w-3 h-3" />
                        {u.plan}
                      </span>
                    </td>

                    <td className="p-4">
                      {u.accountStatus === 'suspended' ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <UserX className="w-3.5 h-3.5" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <UserCheck className="w-3.5 h-3.5" />
                          Active
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {u.joinedDate || '2026-01-01'}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Role Switch */}
                        <button
                          onClick={() => onUpdateUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold rounded-lg border border-white/10 transition-colors"
                          title="Toggle Role"
                        >
                          {u.role === 'admin' ? 'Make User' : 'Promote Admin'}
                        </button>

                        {/* Edit Plan Trigger */}
                        <button
                          onClick={() => setEditingUser(u)}
                          className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-[11px] font-semibold rounded-lg border border-indigo-800/60 transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Plan</span>
                        </button>

                        {/* Status Toggle */}
                        <button
                          onClick={() => onToggleAccountStatus(u.id, u.accountStatus === 'suspended' ? 'active' : 'suspended')}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                            u.accountStatus === 'suspended'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                              : 'bg-rose-950/80 text-rose-300 border-rose-800 hover:bg-rose-900'
                          }`}
                        >
                          {u.accountStatus === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0c0d1a] border border-white/10 text-white w-full max-w-md rounded-3xl p-6 relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-2">Edit Subscription &amp; Role</h3>
            <p className="text-xs text-slate-400 mb-4">
              Updating user profile for <span className="text-white font-bold">{editingUser.email}</span>
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Subscription Plan</label>
                <select
                  value={editingUser.plan}
                  onChange={(e) => {
                    onUpdateUserPlan(editingUser.id, e.target.value);
                    setEditingUser((prev) => prev ? { ...prev, plan: e.target.value } : null);
                  }}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Free" className="bg-slate-900">Free Starter</option>
                  <option value="Pro Monthly" className="bg-slate-900">Pro Monthly</option>
                  <option value="Pro Yearly" className="bg-slate-900">Pro Yearly</option>
                  <option value="Lifetime" className="bg-slate-900">Lifetime VIP</option>
                  <option value="Enterprise" className="bg-slate-900">Enterprise Dedicated</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">User Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => {
                    const newRole = e.target.value as 'user' | 'admin';
                    onUpdateUserRole(editingUser.id, newRole);
                    setEditingUser((prev) => prev ? { ...prev, role: newRole } : null);
                  }}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="user" className="bg-slate-900">Standard User</option>
                  <option value="admin" className="bg-slate-900">Administrator</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setEditingUser(null)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0c0d1a] border border-white/10 text-white w-full max-w-md rounded-3xl p-6 relative">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-2">Add New User Account</h3>
            <p className="text-xs text-slate-400 mb-4">Create a new user profile with assigned role and subscription plan.</p>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amina Hassan"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. amina@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="user" className="bg-slate-900">User</option>
                    <option value="admin" className="bg-slate-900">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Plan</label>
                  <select
                    value={newUserPlan}
                    onChange={(e) => setNewUserPlan(e.target.value)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Free" className="bg-slate-900">Free</option>
                    <option value="Pro Monthly" className="bg-slate-900">Pro Monthly</option>
                    <option value="Pro Yearly" className="bg-slate-900">Pro Yearly</option>
                    <option value="Lifetime" className="bg-slate-900">Lifetime VIP</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg mt-2"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
