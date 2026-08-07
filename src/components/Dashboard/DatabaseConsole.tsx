import React, { useState } from 'react';
import {
  Database,
  Table,
  Code,
  Search,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  Shield,
  FileText,
  CreditCard,
  HardDrive,
  Cpu,
  Activity,
  Layers,
  Download,
  Filter,
} from 'lucide-react';
import {
  DbUser,
  DbSubscription,
  DbPayment,
  DbFile,
  DbAiUsage,
  DbActivityLog,
  SEED_DB_USERS,
  SEED_DB_SUBSCRIPTIONS,
  SEED_DB_PAYMENTS,
  SEED_DB_FILES,
  SEED_DB_AI_USAGE,
  SEED_DB_ACTIVITY_LOGS,
  PRISMA_SCHEMA_STRING,
  POSTGRES_SCHEMA_SQL,
} from '../../data/dbSchema';

export const DatabaseConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tables' | 'schema_prisma' | 'schema_sql'>('tables');
  const [selectedTable, setSelectedTable] = useState<
    'users' | 'subscriptions' | 'payments' | 'files' | 'ai_usage' | 'activity_logs'
  >('users');

  // In-memory Database Records State
  const [users, setUsers] = useState<DbUser[]>(SEED_DB_USERS);
  const [subscriptions, setSubscriptions] = useState<DbSubscription[]>(SEED_DB_SUBSCRIPTIONS);
  const [payments, setPayments] = useState<DbPayment[]>(SEED_DB_PAYMENTS);
  const [files, setFiles] = useState<DbFile[]>(SEED_DB_FILES);
  const [aiUsage, setAiUsage] = useState<DbAiUsage[]>(SEED_DB_AI_USAGE);
  const [activityLogs, setActivityLogs] = useState<DbActivityLog[]>(SEED_DB_ACTIVITY_LOGS);

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  // New Record Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [newUserPlan, setNewUserPlan] = useState<'Free' | 'Pro Monthly' | 'Pro Yearly' | 'Lifetime'>('Free');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserFullName) return;

    const newRecord: DbUser = {
      id: `usr_${Date.now().toString(36)}`,
      full_name: newUserFullName,
      email: newUserEmail,
      phone_number: newUserPhone || '+252 61 000 0000',
      password_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      role: newUserRole,
      subscription_plan: newUserPlan,
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + 365 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUsers([newRecord, ...users]);

    // Also add log
    setActivityLogs([
      {
        id: `act_${Date.now()}`,
        user_id: newRecord.id,
        action: `USER_CREATED (${newRecord.email})`,
        ip_address: '127.0.0.1',
        timestamp: new Date().toISOString(),
      },
      ...activityLogs,
    ]);

    setIsAddModalOpen(false);
    setNewUserEmail('');
    setNewUserFullName('');
    setNewUserPhone('');
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>PostgreSQL & Supabase Architecture Engine</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                Prisma ORM
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage live production tables, inspect schemas, DDL scripts, and trace security activity logs.
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'tables'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table Inspector</span>
          </button>
          <button
            onClick={() => setActiveTab('schema_prisma')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'schema_prisma'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>Prisma Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('schema_sql')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'schema_sql'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>PostgreSQL DDL</span>
          </button>
        </div>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          {/* Table Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { id: 'users', name: 'Users Table', count: users.length, icon: Shield, color: 'text-indigo-400' },
              { id: 'subscriptions', name: 'Subscriptions', count: subscriptions.length, icon: FileText, color: 'text-cyan-400' },
              { id: 'payments', name: 'Payments', count: payments.length, icon: CreditCard, color: 'text-emerald-400' },
              { id: 'files', name: 'Files Table', count: files.length, icon: HardDrive, color: 'text-amber-400' },
              { id: 'ai_usage', name: 'AI Usage', count: aiUsage.length, icon: Cpu, color: 'text-purple-400' },
              { id: 'activity_logs', name: 'Activity Logs', count: activityLogs.length, icon: Activity, color: 'text-rose-400' },
            ].map((tbl) => {
              const Icon = tbl.icon;
              const isSelected = selectedTable === tbl.id;
              return (
                <button
                  key={tbl.id}
                  onClick={() => setSelectedTable(tbl.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${tbl.color}`} />
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {tbl.count}
                    </span>
                  </div>
                  <div className="mt-2 font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                    {tbl.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Search & Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search in ${selectedTable.replace('_', ' ')}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-3">
              {selectedTable === 'users' && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Insert Row</span>
                </button>
              )}
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Showing live PostgreSQL state</span>
              </div>
            </div>
          </div>

          {/* TABLE DATA GRID */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
            {selectedTable === 'users' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">User Details</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Subscription</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Created At</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {users
                    .filter(
                      (u) =>
                        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">{u.id}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img src={u.profile_image} alt={u.full_name} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">{u.full_name}</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</div>
                              <div className="text-[10px] text-slate-400">{u.phone_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{u.subscription_plan}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {u.subscription_status}
                          </span>
                        </td>
                        <td className="p-3.5 text-[11px] text-slate-500">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'subscriptions' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-3.5">Sub ID</th>
                    <th className="p-3.5">User ID</th>
                    <th className="p-3.5">Plan Name</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Payment Reference</th>
                    <th className="p-3.5">Approved By</th>
                    <th className="p-3.5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{sub.id}</td>
                      <td className="p-3.5 font-mono text-[11px] text-indigo-400">{sub.user_id}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{sub.plan_name}</td>
                      <td className="p-3.5 font-semibold text-emerald-500">${sub.price.toFixed(2)}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">{sub.payment_reference}</td>
                      <td className="p-3.5 text-slate-400">{sub.approved_by}</td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'payments' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-3.5">Txn ID</th>
                    <th className="p-3.5">User ID</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Note</th>
                    <th className="p-3.5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-indigo-400 font-bold">{p.transaction_id}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">{p.user_id}</td>
                      <td className="p-3.5 font-bold text-emerald-500">${p.amount.toFixed(2)}</td>
                      <td className="p-3.5 uppercase font-semibold text-slate-300">{p.payment_method}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : p.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">{p.admin_note || '-'}</td>
                      <td className="p-3.5 text-slate-500 text-[11px]">{new Date(p.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'files' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-3.5">File ID</th>
                    <th className="p-3.5">Original Filename</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Size</th>
                    <th className="p-3.5">Storage URL</th>
                    <th className="p-3.5">Processing Status</th>
                    <th className="p-3.5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {files.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{f.id}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{f.original_filename}</td>
                      <td className="p-3.5 uppercase font-mono text-[10px] text-indigo-400">{f.file_type}</td>
                      <td className="p-3.5 text-slate-400">{(f.file_size / (1024 * 1024)).toFixed(2)} MB</td>
                      <td className="p-3.5 font-mono text-[10px] text-slate-500 max-w-xs truncate">{f.storage_url}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {f.processing_status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">{new Date(f.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'ai_usage' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-3.5">Log ID</th>
                    <th className="p-3.5">User ID</th>
                    <th className="p-3.5">AI Tool Name</th>
                    <th className="p-3.5">Requests Used</th>
                    <th className="p-3.5">Credits Deducted</th>
                    <th className="p-3.5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {aiUsage.map((ai) => (
                    <tr key={ai.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{ai.id}</td>
                      <td className="p-3.5 font-mono text-[11px] text-indigo-400">{ai.user_id}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{ai.tool_name}</td>
                      <td className="p-3.5 font-semibold text-slate-300">{ai.requests_used} requests</td>
                      <td className="p-3.5 font-bold text-purple-400">{ai.credits_used} credits</td>
                      <td className="p-3.5 text-slate-500 text-[11px]">{new Date(ai.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTable === 'activity_logs' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-3.5">Log ID</th>
                    <th className="p-3.5">User ID</th>
                    <th className="p-3.5">Action Executed</th>
                    <th className="p-3.5">IP Address</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{log.id}</td>
                      <td className="p-3.5 font-mono text-[11px] text-indigo-400">{log.user_id}</td>
                      <td className="p-3.5 font-mono font-semibold text-rose-400">{log.action}</td>
                      <td className="p-3.5 font-mono text-slate-400">{log.ip_address}</td>
                      <td className="p-3.5 text-slate-500 text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* SCHEMA PRISMA TAB */}
      {activeTab === 'schema_prisma' && (
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-bold">
              <Code className="w-5 h-5" />
              <span>prisma/schema.prisma</span>
            </div>
            <button
              onClick={() => copyToClipboard(PRISMA_SCHEMA_STRING)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Copied to Clipboard' : 'Copy Prisma Schema'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 rounded-2xl text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed border border-slate-800">
            {PRISMA_SCHEMA_STRING}
          </pre>
        </div>
      )}

      {/* SCHEMA SQL TAB */}
      {activeTab === 'schema_sql' && (
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-bold">
              <Layers className="w-5 h-5" />
              <span>schema.sql (PostgreSQL / Supabase DDL Migration)</span>
            </div>
            <button
              onClick={() => copyToClipboard(POSTGRES_SCHEMA_SQL)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Copied SQL Script' : 'Copy SQL Script'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 rounded-2xl text-xs font-mono text-amber-300/90 overflow-x-auto leading-relaxed border border-slate-800">
            {POSTGRES_SCHEMA_SQL}
          </pre>
        </div>
      )}

      {/* INSERT USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>Insert New Database User</span>
            </h3>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                  placeholder="e.g. Hassan Mohamed"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. hassan@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+252 61 XXX XXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Plan</label>
                  <select
                    value={newUserPlan}
                    onChange={(e) => setNewUserPlan(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"
                  >
                    <option value="Free">Free</option>
                    <option value="Pro Monthly">Pro Monthly</option>
                    <option value="Pro Yearly">Pro Yearly</option>
                    <option value="Lifetime">Lifetime</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
