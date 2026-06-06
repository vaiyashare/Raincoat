import React, { useState, useEffect } from 'react';
import { Lock, UserPlus, Trash2, Key, Users, AlertCircle, Save } from 'lucide-react';

interface TeamUser {
  id: string;
  username: string;
  passwordHash: string; // Plain password for ease of demo persistence
  role: 'Admin' | 'Editor' | 'ReadOnly';
  canEdit?: boolean;
  canDelete?: boolean;
}

interface UsersAdminProps {
  currentUser: string;
  onRefreshUsers: () => void;
  userRole: string; // 'Admin' | 'Editor' | 'ReadOnly'
}

export default function UsersAdmin({ currentUser, onRefreshUsers, userRole }: UsersAdminProps) {
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  
  // User creator form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Editor' | 'ReadOnly'>('Editor');
  const [canEdit, setCanEdit] = useState(true);
  const [canDelete, setCanDelete] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Main login password changes states
  const [adminUsername, setAdminUsername] = useState(() => localStorage.getItem('admin_username') || 'admin');
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('admin_password') || '123456');
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  const loadTeamUsers = () => {
    const list = localStorage.getItem('raincoat_team_users');
    if (list) {
      setTeamUsers(JSON.parse(list));
    } else {
      // Seed default accounts
      const defaults: TeamUser[] = [
        { id: '1', username: 'admin', passwordHash: '123456', role: 'Admin', canEdit: true, canDelete: true },
        { id: '2', username: 'editor', passwordHash: '123456', role: 'Editor', canEdit: true, canDelete: false },
        { id: '3', username: 'viewer', passwordHash: '123455', role: 'ReadOnly', canEdit: false, canDelete: false },
      ];
      localStorage.setItem('raincoat_team_users', JSON.stringify(defaults));
      setTeamUsers(defaults);
    }
  };

  useEffect(() => {
    loadTeamUsers();
  }, []);

  const handleUpdateAdminMain = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg('');

    if (userRole !== 'Admin') {
      return setPwdMsg('দুঃখিত! মূল এডমিন ব্যতিত পাসওয়ার্ড ও ইউজারনেম পরিবর্তনাধিকার নেই।');
    }

    if (!newAdminUser.trim() || !newAdminPass.trim()) {
      return setPwdMsg('দয়া করে সঠিক ইউজারনেম ও স্ট্রং পাসওয়ার্ড টাইপ করুন!');
    }

    localStorage.setItem('admin_username', newAdminUser.trim());
    localStorage.setItem('admin_password', newAdminPass.trim());
    
    // Also update in the team users table if it matches id-1
    const list = localStorage.getItem('raincoat_team_users');
    if (list) {
      const parsed: TeamUser[] = JSON.parse(list);
      const updated = parsed.map(u => {
        if (u.username === adminUsername) {
          return { ...u, username: newAdminUser.trim(), passwordHash: newAdminPass.trim() };
        }
        return u;
      });
      localStorage.setItem('raincoat_team_users', JSON.stringify(updated));
      setTeamUsers(updated);
    }

    setAdminUsername(newAdminUser.trim());
    setAdminPassword(newAdminPass.trim());
    setNewAdminUser('');
    setNewAdminPass('');
    setPwdMsg('মূল অ্যাডমিন অ্যাকাউন্ট ইউজার ও পাসওয়ার্ড সফলভাবে হালনাগাদ হয়েছে!');
    onRefreshUsers();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (userRole !== 'Admin') {
      return setError('শুধুমাত্র মূল অ্যাডমিন নতুন টিম মেম্বারদের রোল তৈরি কর‍তে পারেন!');
    }

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || !password.trim()) {
      return setError('ইউজারনেম ও পাসওয়ার্ড খালি রাখা যাবে না!');
    }

    if (teamUsers.some(u => u.username === cleanUser)) {
      return setError('এই নামের ইউজার ইতিমধ্যে তৈরি করা আছে!');
    }

    const newUser: TeamUser = {
      id: 'usr-' + Math.floor(Math.random() * 10000),
      username: cleanUser,
      passwordHash: password.trim(),
      role: role,
      canEdit: canEdit,
      canDelete: canDelete
    };

    const updated = [...teamUsers, newUser];
    localStorage.setItem('raincoat_team_users', JSON.stringify(updated));
    setTeamUsers(updated);

    setUsername('');
    setPassword('');
    setCanEdit(true);
    setCanDelete(false);
    setSuccess(`নতুন টিম ইউজার "${cleanUser}" (${role}) সফলভাবে নিবন্ধিত হয়েছে!`);
    onRefreshUsers();
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (userRole !== 'Admin') {
      alert('টিম ইউজার ডিলিট করার ক্ষমতা শুধুমাত্র মূল অ্যাডমিনের রয়েছে!');
      return;
    }

    if (name === currentUser) {
      alert('আপনি নিজের রানিং একাউন্ট ডিলিট করতে পারবেন না!');
      return;
    }

    if (name === 'admin') {
      alert('মূল সুপার-অ্যাডমিন একাউন্ট ট্র্যাশ বিনে ফেলা যাবে না!');
      return;
    }

    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${name}" কে টিম থেকে রিমুভ করতে চান?`)) return;

    const updated = teamUsers.filter(u => u.id !== id);
    localStorage.setItem('raincoat_team_users', JSON.stringify(updated));
    setTeamUsers(updated);
    onRefreshUsers();
  };

  return (
    <div className="space-y-6 font-sans text-xs sm:text-sm text-slate-705">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Register New Account */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Main super-admin account editor */}
          <form onSubmit={handleUpdateAdminMain} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase">
              <Key className="h-4 w-4 text-orange-500" /> অ্যাডমিন লগইন পরিবর্তন করুন
            </h3>
            <p className="text-[10px] text-slate-400">আপনার মূল অ্যাডমিন ইউজার ও মেম্বার এক্সেস এখান থেকে পরিবর্তন করতে পারবেন।</p>

            {pwdMsg && (
              <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] rounded-lg font-bold">
                {pwdMsg}
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">রানিং ইউজারনেম: <span className="font-mono text-slate-650 font-bold bg-slate-200 px-1 py-0.2 rounded">{adminUsername}</span></label>
                <input 
                  type="text" 
                  placeholder="নতুন অ্যাডমিন ইউজার স্লট"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                  value={newAdminUser}
                  onChange={(e) => setNewAdminUser(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">রানিং পাসওয়ার্ড: <span className="font-mono text-slate-650 font-bold bg-slate-200 px-1 py-0.2 rounded">{adminPassword}</span></label>
                <input 
                  type="password" 
                  placeholder="নতুন পাসওয়ার্ড টাইপ করুন"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-1.8 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg transition"
            >
              ইউজার ও পাসওয়ার্ড পরিবর্তন করুন
            </button>
          </form>

          {/* User registration */}
          <form onSubmit={handleCreateUser} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase">
              <UserPlus className="h-4 w-4 text-emerald-600" /> নতুন ইউজার ও রোল তৈরি করুন
            </h3>
            
            {error && <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 font-bold text-[11px]">{error}</div>}
            {success && <div className="p-2 bg-emerald-50 border border-emerald-250 rounded-lg text-emerald-800 font-bold text-[11px]">{success}</div>}

            <div className="space-y-2">
              <div>
                <label className="block text-[9px] text-slate-500 font-bold mb-1">ইউজারনেম (Username)</label>
                <input 
                  type="text" 
                  placeholder="যেমন: operational_team"
                  className="w-full px-2.5 py-1.5 bg-white border rounded-lg focus:outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-500 font-bold mb-1">লগইন পাসওয়ার্ড (Password)</label>
                <input 
                  type="text" 
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="w-full px-2.5 py-1.5 bg-white border rounded-lg focus:outline-none font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-500 font-bold mb-1">অ্যাক্সেস লেভেল / রোল (Role Permission)</label>
                <select 
                  value={role} 
                  onChange={(e) => {
                    const newRole = e.target.value as any;
                    setRole(newRole);
                    if (newRole === 'Admin') {
                      setCanEdit(true);
                      setCanDelete(true);
                    } else if (newRole === 'Editor') {
                      setCanEdit(true);
                      setCanDelete(false);
                    } else {
                      setCanEdit(false);
                      setCanDelete(false);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border rounded-lg focus:outline-none text-xs"
                >
                  <option value="Editor">সহ-সম্পাদক (Editor - কন্টেন্ট ও রিভিউ এডিট করতে পারবেন)</option>
                  <option value="ReadOnly">দর্শক (ReadOnly - দেখতে পারবেন, চেঞ্জ বা ডিলিট পারবেন না)</option>
                  <option value="Admin">সহ-অ্যাডমিন (Admin - পূর্ণ প্রবেশাধিকার পাবেন)</option>
                </select>
              </div>

              {/* Custom manual overrides for permissions */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5 bg-white p-2.5 rounded-lg border">
                <span className="block text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">কাস্টম অ্যাকশন পারমিশন:</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input 
                    type="checkbox" 
                    checked={canEdit} 
                    onChange={(e) => setCanEdit(e.target.checked)}
                    className="rounded text-emerald-500"
                  />
                  <span>কনটেন্ট বা প্রোডাক্ট এডিট করতে পারবে (Can Edit)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input 
                    type="checkbox" 
                    checked={canDelete} 
                    onChange={(e) => setCanDelete(e.target.checked)}
                    className="rounded text-rose-500"
                  />
                  <span>অর্ডার বা পেজ ডিলিট করতে পারবে (Can Delete)</span>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-1.8 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-lg shadow-sm transition"
            >
              টিম মেম্বারের অ্যাক্সেস যোগ করুন
            </button>
          </form>

        </div>

        {/* Right Column: User accounts overview */}
        <div className="flex-1 bg-white border border-slate-200 p-5 rounded-2xl">
          <div className="flex items-center gap-1.5 pb-2.5 border-b mb-4">
            <Users className="h-4.5 w-4.5 text-indigo-650" />
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">নিবন্ধিত টিম এবং ইউজার রোল কন্ট্রোল</h3>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-slate-500">
              <thead className="bg-slate-50 text-[10px] text-slate-700 uppercase font-bold border-b">
                <tr>
                  <th className="px-4 py-2">ইউজারনেম (Username)</th>
                  <th className="px-4 py-2">পাসওয়ার্ড (Demo Hash)</th>
                  <th className="px-4 py-2">অ্যাক্সেস লেভেল</th>
                  <th className="px-4 py-2">অনুমতিসমূহ (Permissions)</th>
                  <th className="px-4 py-2 text-center">মুছে ফেলুন</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs text-slate-800">
                {teamUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-extrabold flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      {user.username}
                      {user.username === currentUser && (
                        <span className="text-[8px] bg-slate-900 text-white font-black rounded-sm px-1 font-mono uppercase">You</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px]">{user.passwordHash}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        user.role === 'Admin' ? 'bg-red-50 text-red-700 border border-red-200' :
                        user.role === 'Editor' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-slate-100 text-slate-650 border border-slate-200'
                      }`}>
                        {user.role === 'Admin' ? 'Administrator' : user.role === 'Editor' ? 'Editor' : 'ReadOnly Viewer'}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-1.5 min-w-[150px]">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${user.canEdit !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'} border`}>
                        {user.canEdit !== false ? '✓ এডিট' : '✗ এডিট'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${user.canDelete === true ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'} border`}>
                        {user.canDelete === true ? '✓ ডিলিট' : '✗ ডিলিট'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.username !== 'admin' && user.username !== currentUser && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 flex items-start gap-2 rounded-xl text-[10px] sm:text-xs">
            <AlertCircle className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-slate-650 font-medium">
              <strong className="text-blue-900 block font-bold">💡 টিম মেম্বারদের রোল সিস্টেমের বিশদ বিবরণ:</strong>
              <p>১. <strong>सह-एडमिन (Admin):</strong> সর্বজনীন অনুমতি থাকবে; যেকোনো পেজ এডিটর এবং সব পিক্সেল ট্র্যাকার পরিবর্তন করতে পারবে।</p>
              <p>২. <strong>সহ-সম্পাদক (Editor):</strong> পেজেস, প্রোডাক্টস বা রিভিউগুলো ইচ্ছেমোট এডিট বা আপডেট করতে পারেন, তবে হেডার/ফুটার ইন্টিগ্রেশন বা এডমিন সেটিংস এক্সেস করতে পারেন না।</p>
              <p>৩. <strong>সহ-পর্যবেক্ষক (ReadOnly):</strong> শুধু সফল বা আংশিক অর্ডার দেখতে পারবেন। ডেটাবেস পরিচ্ছন্ন ও সুরক্ষিত রাখতে কোনো ডাটা এডিট বা ডিলিট করতে পারবেন না।</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
