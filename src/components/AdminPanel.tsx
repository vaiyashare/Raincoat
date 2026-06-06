import React, { useState, useEffect } from 'react';
import { 
  Eye, ShieldAlert, Trash2, ClipboardCopy, FileSpreadsheet, Search, 
  RefreshCw, X, ShieldCheck, CheckSquare, Globe, Database, Sparkles, 
  Check, ExternalLink, HelpCircle, Flame, ChevronDown, ChevronUp 
} from 'lucide-react';
import { RaincoatOrder, Size, ProductColor } from '../types';
import { 
  getSheetsConfig, 
  saveSheetsConfig, 
  disconnectSheets, 
  getAccessToken, 
  initiateSheetsAuth, 
  createNewSpreadsheet, 
  syncAllOrdersToSheet 
} from '../lib/googleSheets';

interface AdminPanelProps {
  onClose: () => void;
  onRefreshOrdersCount: () => void;
}

export default function AdminPanel({ onClose, onRefreshOrdersCount }: AdminPanelProps) {
  const [orders, setOrders] = useState<RaincoatOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSize, setFilterSize] = useState<string>('All');
  const [copiedMessage, setCopiedMessage] = useState('');

  // Google Sheets state handling
  const [showSheetsSection, setShowSheetsSection] = useState(false);
  const [sheetsConfig, setSheetsConfig] = useState(getSheetsConfig());
  const [clientId, setClientId] = useState(sheetsConfig.clientId);
  const [spreadsheetId, setSpreadsheetId] = useState(sheetsConfig.spreadsheetId);
  const [autoSync, setAutoSync] = useState(sheetsConfig.autoSync);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [sheetsFeedback, setSheetsFeedback] = useState<{ message: string; type: 'info' | 'success' | 'error' | null }>({ message: '', type: null });

  const loadOrders = () => {
    const listJson = localStorage.getItem('raincoat_orders') || '[]';
    setOrders(JSON.parse(listJson));
    onRefreshOrdersCount();
  };

  useEffect(() => {
    loadOrders();
    // Pre-expand Google Sheets section if already integrated to show status
    const config = getSheetsConfig();
    if (config.connectedEmail || config.spreadsheetId) {
      setShowSheetsSection(true);
    }
  }, []);

  const handleConnectSheets = async () => {
    setSheetsFeedback({ message: '', type: null });
    if (!clientId.trim()) {
      setSheetsFeedback({ message: 'অনুগ্রহ করে প্রথমে আপনার গুগল ক্লাউড কনসোল থেকে প্রাপ্ত Client ID দিন।', type: 'error' });
      return;
    }
    setIsAuthorizing(true);
    setSheetsFeedback({ message: 'গুগল অ্যাকাউন্ট কানেক্ট করা হচ্ছে, অনুগ্রহ করে পপআপ উইন্ডোটি লক্ষ্য করুন...', type: 'info' });
    try {
      await initiateSheetsAuth(clientId);
      const updatedConfig = getSheetsConfig();
      setSheetsConfig(updatedConfig);
      setSheetsFeedback({ message: 'আপনার গুগল অ্যাকাউন্টটি সফলভাবে কানেক্ট হয়েছে!', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setSheetsFeedback({ message: err.message || 'গুগল অ্যাকাউন্ট কানেক্ট করা সম্ভব হয়নি। আবার চেষ্টা করুন।', type: 'error' });
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleCreateNewSheet = async () => {
    setSheetsFeedback({ message: '', type: null });
    const token = getAccessToken();
    if (!token) {
      setSheetsFeedback({ message: 'প্লিজ গুগল অ্যাকাউন্ট রি-অথরাইজ বা কানেক্ট করুন। সেশন টোকেন পাওয়া যায়নি।', type: 'error' });
      return;
    }
    setIsCreatingSheet(true);
    setSheetsFeedback({ message: 'আপনার গুগল ড্রাইভে নতুন স্প্রেডশিট ডেটাব্যাস তৈরি করছি। দয়া করে অপেক্ষা করুন...', type: 'info' });
    try {
      const newSpreadId = await createNewSpreadsheet(token, 'Monsoon Gear - রেইনকোট অর্ডার ডেটাবেস');
      setSpreadsheetId(newSpreadId);
      setSheetsConfig(getSheetsConfig());
      setSheetsFeedback({ message: 'দারুণ! রেইনকোট অর্ডারের জন্য নতুন গুগল স্প্রেডশিট সফলভাবে তৈরি হয়েছে।', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setSheetsFeedback({ message: err.message || 'নতুন গুগল শিট তৈরি করতে ব্যর্থ। ক্লায়েন্ট আইডি ও স্কোপস চেক করুন।', type: 'error' });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSyncAllOrders = async () => {
    setSheetsFeedback({ message: '', type: null });
    const token = getAccessToken();
    if (!token) {
      setSheetsFeedback({ message: 'গুগল অ্যাকাউন্ট কানেক্টেড নেই বা অথরাইজেশন সেশন শেষ। পুনরায় কানেক্ট বাটনে চাপ দিন।', type: 'error' });
      return;
    }
    if (!spreadsheetId.trim()) {
      setSheetsFeedback({ message: 'সিঙ্ক করার জন্য গুগল স্প্রেডশিট আইডি প্রদান করুন বা বা পাশে থেকে অটো-ক্রিয়েট করুন।', type: 'error' });
      return;
    }
    setIsSyncing(true);
    setSheetsFeedback({ message: `মোট ${orders.length} টি অর্ডার ডেটা গুগল রেইনকোট শিটে সিঙ্ক হচ্ছে...`, type: 'info' });
    try {
      // Save manually defined spreadsheet ID before sync
      saveSheetsConfig({ spreadsheetId: spreadsheetId.trim() });
      const success = await syncAllOrdersToSheet(token, spreadsheetId.trim(), orders);
      if (success) {
        setSheetsConfig(getSheetsConfig());
        setSheetsFeedback({ message: 'অভিনন্দন! সবগুলো অর্ডারের ডেটা গুগল স্প্রেডশিটে সফলভাবে সিঙ্ক ও আপডেট করা হয়েছে।', type: 'success' });
      } else {
        setSheetsFeedback({ message: 'সিঙ্কিং ব্যর্থ হয়েছে। গুগল স্প্রেডশিট এডিটর লিংক এবং কলাম স্ট্যাটাস পরখ করুন।', type: 'error' });
      }
    } catch (err: any) {
      console.error(err);
      setSheetsFeedback({ message: err.message || 'সিঙ্কিং সেশনে ত্রুটি ঘটেছে।', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectSheets = () => {
    disconnectSheets();
    setSheetsConfig(getSheetsConfig());
    setClientId('');
    setSpreadsheetId('');
    setAutoSync(false);
    setSheetsFeedback({ message: 'গুগল শিট ইন্টিগ্রেশন সেশন সফলভাবে ডিসকানেক্ট করা হয়েছে।', type: 'info' });
  };

  const handleToggleAutoSync = (checked: boolean) => {
    setAutoSync(checked);
    saveSheetsConfig({ autoSync: checked });
    setSheetsConfig(getSheetsConfig());
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবেই এই অর্ডারটি মুছে ফেলতে চান?')) {
      const updated = orders.filter(o => o.id !== id);
      localStorage.setItem('raincoat_orders', JSON.stringify(updated));
      setOrders(updated);
      onRefreshOrdersCount();
    }
  };

  const handleChangeStatus = (id: string, newStatus: any) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    localStorage.setItem('raincoat_orders', JSON.stringify(updated));
    setOrders(updated);
  };

  const handleCopyCSV = () => {
    if (orders.length === 0) {
      setCopiedMessage('কোনো অর্ডার নেই কপি করার মতো!');
      setTimeout(() => setCopiedMessage(''), 2000);
      return;
    }

    // CSV header translation
    let csvContent = "Order ID,Name,Phone,Address/Village,Police Station,District,Size,Color,Weight(kg),Height,Price,Status,Date\n";
    orders.forEach(o => {
      const formattedDate = new Date(o.createdAt).toLocaleDateString();
      const row = `"${o.id}","${o.name}","${o.phone}","${o.village}","${o.policeStation || ''}","${o.district || ''}","${o.size}","${o.color}",${o.weight},"${o.heightFeet}'${o.heightInches}\"",${o.price},"${o.status}","${formattedDate}"`;
      csvContent += row + "\n";
    });

    navigator.clipboard.writeText(csvContent).then(() => {
      setCopiedMessage('অর্ডার ডাটা CSV ফরম্যাটে ক্লিপবোর্ডে কপি হয়েছে!');
      setTimeout(() => setCopiedMessage(''), 2000);
    });
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = 
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm) ||
      o.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSize = filterSize === 'All' || o.size === filterSize;
    return matchSearch && matchSize;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.price, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 justify-between flex items-center">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-yellow-400 shrink-0" />
            <div>
              <h3 className="text-xl font-bold font-sans">অর্ডার কিউ ও অ্যাডমিন ড্যাশবোর্ড</h3>
              <p className="text-slate-400 text-xs">গ্রাহকদের সাবমিট করা অর্ডার ও বুকিং ডাটাবেস (Local Storage Engine)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            id="close-admin-panel"
          >
            <X className="h-5.5 w-5.5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6">
          {/* Quick stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">মোট অর্ডার সংখ্যা</span>
              <span className="text-2xl font-black text-slate-800 font-mono">{orders.length} টি</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">মোট সম্ভাব্য বিক্রি</span>
              <span className="text-2xl font-black text-indigo-700 font-mono">{totalRevenue} TK</span>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <span className="text-[10px] text-emerald-600 font-bold uppercase block">ডেলিভারি চার্জ</span>
              <span className="text-2xl font-black text-emerald-800 font-mono">০ টাকা (ফ্রি)</span>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <span className="text-[10px] text-blue-500 font-bold uppercase block">ডিলিভারি সোর্স</span>
              <span className="text-2xl font-black text-blue-800 font-sans">সারাদেশে ক্যাশ অন</span>
            </div>
          </div>

          {/* Google Sheets Integration Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => setShowSheetsSection(!showSheetsSection)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-200/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-800 font-sans flex items-center gap-2">
                    📊 গুগল শিট লাইভ সিঙ্ক ড্যাশবোর্ড (Google Sheets Sync)
                    {sheetsConfig.connectedEmail ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200 rounded-full">
                        কানেক্টেড (Connected)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200 rounded-full">
                        ডিসকানেক্টেড
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-sans">
                    রেইনকোট অর্ডারগুলোকে সরাসরি গুগল স্প্রেডশিটে সিঙ্ক করুন এবং সংরক্ষণ করুন।
                  </p>
                </div>
              </div>
              <div>
                {showSheetsSection ? (
                  <ChevronUp className="h-4.5 w-4.5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4.5 w-4.5 text-slate-400" />
                )}
              </div>
            </button>

            {showSheetsSection && (
              <div className="p-5 space-y-4 font-sans bg-white text-slate-700 border-t border-slate-100">
                {/* Connection status notification */}
                {sheetsFeedback.message && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${
                    sheetsFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    sheetsFeedback.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                    'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}>
                    {sheetsFeedback.message}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Column: Config Panel */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        ১. গুগল ক্লায়েন্ট আইডি (Google Client ID)
                        <HelpCircle className="h-3 w-3 text-slate-400 font-bold" />
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 123456-abcdef.apps.googleusercontent.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        disabled={!!getAccessToken()}
                      />
                      <p className="text-[9px] text-slate-400 mt-1">
                        নিরাপত্তা বজায় রাখতে ক্লায়েন্ট আইডিটি লোকাল ব্রাউজারে সংরক্ষিত থাকবে।
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        ২. গুগল স্প্রেডশিট আইডি (Spreadsheet ID)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="পেস করুন অথবা নিজে তৈরি করুন"
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                          value={spreadsheetId}
                          onChange={(e) => setSpreadsheetId(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={handleCreateNewSheet}
                          disabled={isCreatingSheet || !getAccessToken()}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
                        >
                          <Sparkles className="h-3.5 w-3.5" /> শিট তৈরি করুন
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">
                        স্প্রেডশিটের URL থেকে আইডিটি সংগ্রহ করুন (যেমন: d/<strong>SPREADSHEET_ID</strong>/edit) অথবা নতুন শিট তৈরিতে ক্লিক করুন।
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Connection State Card & Sync Actions */}
                  <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-700 font-sans">ইন্টিগ্রেশন স্ট্যাটাস ও তথ্য</h5>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">গুগল অ্যাকাউন্ট:</span>
                          <span className="font-semibold text-slate-800">{sheetsConfig.connectedEmail || 'কানেক্টেড নেই'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">স্প্রেডশিট আইডি:</span>
                          <span className="font-mono text-slate-600 truncate max-w-[150px]" title={sheetsConfig.spreadsheetId || ''}>
                            {sheetsConfig.spreadsheetId || 'খালি (নথিভুক্ত করতে হবে)'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">সর্বশেষ সিঙ্ক সময়:</span>
                          <span className="text-slate-600 font-mono text-[9px]">
                            {sheetsConfig.lastSyncTime ? new Date(sheetsConfig.lastSyncTime).toLocaleString('bn-BD') : 'সিঙ্ক করা হয়নি'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 space-y-3">
                      {/* Authorized Redirect URIs Info section */}
                      <div className="p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-[9px] text-yellow-800 space-y-1">
                        <span className="font-bold flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5 text-amber-600" /> গুগল ক্লাউড কনসোল রিমাইন্ডার:</span>
                        <p>আপনার কনসোলে <strong>Authorized redirect URIs</strong> বক্সে নিচের লিংকটি হুবহু পেস্ট করুন:</p>
                        <div className="bg-white/85 p-1 rounded font-mono text-[8.5px] border border-yellow-300 flex items-center justify-between select-all">
                          <span>{window.location.origin}</span>
                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.origin);
                              alert('লিংকটি ক্লিপবোর্ডে কপি করা হয়েছে!');
                            }} 
                            className="text-blue-600 font-bold hover:underline ml-1 cursor-pointer text-[8px]"
                          >
                            কপি
                          </button>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        {!getAccessToken() ? (
                          <button
                            type="button"
                            onClick={handleConnectSheets}
                            disabled={isAuthorizing}
                            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Globe className="h-3.5 w-3.5 animate-pulse" /> গুগল অ্যাকাউন্ট কানেক্ট করুন
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={handleSyncAllOrders}
                              disabled={isSyncing || !spreadsheetId}
                              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} /> ডাটা শিটে আপডেট করুন
                            </button>
                            <button
                              type="button"
                              onClick={handleDisconnectSheets}
                              className="py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer border border-rose-200"
                              title="ডিসকানেক্ট করুন"
                            >
                              রিসেট/লগআউট
                            </button>
                          </>
                        )}
                      </div>

                      {/* Auto Sync Toggle */}
                      {getAccessToken() && spreadsheetId && (
                        <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={autoSync}
                            onChange={(e) => handleToggleAutoSync(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5 text-xs"
                          />
                          <span className="text-[10px] font-bold text-slate-600 font-sans flex items-center gap-1">
                            🚀 নতুন অর্ডারে রিয়েল-টাইম লাইভ সিঙ্ক সক্রিয় করুন (Auto Append)
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filters shelf */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="নাম, ফোন বা জেলা দিয়ে খুজুন..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-sans"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status filtering */}
              <select
                className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
                value={filterSize}
                onChange={(e) => setFilterSize(e.target.value)}
              >
                <option value="All">সকল সাইজ (All Sizes)</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="3XL">3XL</option>
                <option value="4XL">4XL</option>
              </select>
            </div>

            {/* Admin utilities */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto justify-end">
              <button
                onClick={loadOrders}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> রিলোড
              </button>
              <button
                onClick={handleCopyCSV}
                className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
              >
                <ClipboardCopy className="h-3.5 w-3.5" /> CSV ডুপ্লিকেট বুকিং কপি
              </button>
            </div>
          </div>

          {copiedMessage && (
            <div className="p-3 bg-emerald-500 text-white font-sans text-xs font-bold rounded-xl text-center shadow-xs">
              {copiedMessage}
            </div>
          )}

          {/* Orders log table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96">
            <table className="w-full text-xs text-left text-slate-500">
              <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[10px] tracking-wider stick top-0 z-10">
                <tr>
                  <th scope="col" className="px-4 py-3">গ্রাহক ও ফোন</th>
                  <th scope="col" className="px-4 py-3">ঠিকানা</th>
                  <th scope="col" className="px-3 py-3 text-center">সাইজ/কালার</th>
                  <th scope="col" className="px-3 py-3 text-center">ওজন ও উচ্চতা</th>
                  <th scope="col" className="px-3 py-3 text-right">মূল্য</th>
                  <th scope="col" className="px-4 py-3 text-center">স্থিতি (Status)</th>
                  <th scope="col" className="px-4 py-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs font-sans">
                      কোনো কাস্টমার অর্ডার ডাটাবেসে পাওয়া যায়নি! অর্ডার ফর্মটি সাবমিট করে চেক করুন।
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{order.name}</div>
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5">{order.phone}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">আইডি: {order.id}</div>
                      </td>
                      <td className="px-4 py-3.5 max-w-[180px]">
                        <div className="text-slate-800 line-clamp-1">{order.village}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {[order.policeStation, order.district].filter(Boolean).join(', ') || <span className="text-slate-400 italic">ঠিকানা উল্লেখ নেই</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded font-mono block w-fit mx-auto text-[10px]">
                          {order.size}
                        </span>
                        <span className="text-[9px] text-slate-500 mt-1 block">
                          ({order.color === 'Black' ? 'কালো' : 'নেভি ব্লু'})
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center font-mono text-[10px] text-slate-600">
                        <div>{order.weight} kg</div>
                        <div className="text-slate-400">{order.heightFeet}’{order.heightInches}”</div>
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono font-bold text-slate-900">
                        {order.price} TK
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <select
                          value={order.status}
                          onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                          className={`px-2 py-1 text-[10px] rounded-lg border font-bold ${
                            order.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <option value="Pending">অপেক্ষমাণ (Pending)</option>
                          <option value="Shipped">পথে রয়েছে (Shipped)</option>
                          <option value="Delivered">ডেলিভারড (Delivered)</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg hover:text-rose-700 transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-100 p-4 px-6 text-slate-500 text-[11px] font-sans flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>🔒 এই প্যানেলটি শুধুমাত্র সাইটের ডেমো অ্যাডমিনিস্ট্রেটিভ কাস্টমার ভিউ ট্র্যাকিং এর জন্য তৈরি।</span>
          <span className="flex items-center gap-1 text-slate-600 font-semibold">
            <CheckSquare className="h-3.5 w-3.5" /> ১০০০+ সুফল সম্পূর্ণ রেইন কোট অর্ডার
          </span>
        </div>

      </div>
    </div>
  );
}
