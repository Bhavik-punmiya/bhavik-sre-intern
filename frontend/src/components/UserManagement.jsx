import React, { useState } from 'react';
import { Users, Mail, Plus, Shield, Trash2, BellRing } from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Bhavik Punmiya', email: 'bhavik@ims.local', role: 'Admin', alerts: 'Enabled' },
    { id: 2, name: 'On-Call Bot', email: 'alerts@ims.local', role: 'Service Account', alerts: 'Enabled' }
  ]);

  return (
    <div className="space-y-8 h-full overflow-y-auto pr-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="text-blue-600 dark:text-blue-500" size={24} />
            IAM & Alert Routing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage administrative users and their notification preferences.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20">
          <Plus size={18} />
          Invite User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Table */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Users size={18} className="text-slate-400 dark:text-slate-500" />
              Active Console Users
            </h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-slate-500 bg-slate-50/50 dark:bg-slate-950/50">
              <tr>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-900 dark:text-slate-200">{user.name}</div>
                    <div className="text-[10px] text-slate-500">{user.email}</div>
                  </td>
                  <td className="p-4 text-xs">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">{user.role}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trigger/Alert Config */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <BellRing size={18} className="text-orange-500" />
              Alert Routing Rules
            </h3>
            <button className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">New Trigger</button>
          </div>
          <div className="p-6 space-y-6">
            <div className="p-4 bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/20 rounded-lg relative overflow-hidden group">
              <div className="absolute right-0 top-0 h-full w-1 bg-orange-500"></div>
              <h4 className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-1 italic uppercase tracking-tighter">Critical DB Outage (P0)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">Triggered when any RDBMS service reports a CONNECTION_TIMEOUT.</p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <Mail size={12} />
                <span>Sends to: dev-team@ims.local</span>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-lg relative overflow-hidden opacity-60">
              <div className="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
              <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-tighter">Latency Warning (P2)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Triggered for CACHE latency > 500ms.</p>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded italic text-slate-600 dark:text-slate-300">Channel: Slack Webhook</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
