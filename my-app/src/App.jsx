import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Menu, Search, Download, Settings, Play, Pause, Square, 
  ChevronLeft, MoreVertical, Clock, FileText, CheckCircle2, 
  Share, Bookmark, Sparkles, Mail, Loader2, ArrowRight
} from 'lucide-react';

// --- Global Config ---
const apiKey = ""; // Gemini API Key will be injected by the environment

// --- API Helper ---
const callGemini = async (prompt, schema = null) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  if (schema) {
    payload.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: schema,
    };
  }

  // Exponential backoff retry
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response");
      return schema ? JSON.parse(text) : text;
    } catch (e) {
      if (i === 4) throw e;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
};

// --- UI Components ---
const StatusBar = ({ theme = 'dark' }) => (
  <div className={`h-12 w-full flex justify-between items-center px-6 text-[13px] font-semibold absolute top-0 z-50 pointer-events-none ${theme === 'light' ? 'text-white' : 'text-[#0A1931]'}`}>
    <span>9:41</span>
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-2.5 border border-current rounded-[3px] p-[1px] flex justify-end">
        <div className="w-0.5 h-full bg-current rounded-[1px]"></div>
      </div>
      <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-current"></div>
    </div>
  </div>
);

const GlassCard = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl ${className}`}
  >
    {children}
  </div>
);

// --- Screen 1: Home ---
const HomeScreen = ({ onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full h-full bg-[#F5F7FA] relative overflow-y-auto overflow-x-hidden pb-8">
      <StatusBar theme="dark" />
      
      {/* Header */}
      <div className="pt-16 pb-4 px-6 flex justify-between items-center">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors text-[#0A1931]"
        >
          <Menu size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-[#0A1931]">纪要通</h1>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A1931] to-slate-700 flex items-center justify-center text-white shadow-md border-2 border-white">
          <span className="font-medium text-sm">李</span>
        </div>
      </div>

      {/* Hero / Big Record Button */}
      <div className="px-6 py-4 flex justify-center">
        <button 
          onClick={() => onNavigate('recording')}
          className="relative group w-full max-w-[280px]"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] rounded-[32px] blur opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-gradient-to-br from-[#FF6B00] to-[#FF5500] text-white rounded-[32px] p-8 flex flex-col items-center justify-center shadow-[0_10px_40px_rgba(255,107,0,0.3)] border border-white/20">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
              <Mic size={32} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-wide">开始录音</span>
            <span className="text-white/80 text-sm mt-1 font-medium">点击体验录音流程</span>
          </div>
        </button>
      </div>

      {/* Today's Meetings */}
      <div className="px-6 mt-6">
        <h2 className="text-[15px] font-bold text-[#0A1931]/70 mb-3 flex items-center gap-2">
          <Clock size={16} />
          今日会议
        </h2>
        <div className="space-y-4">
          <GlassCard 
            onClick={() => onNavigate('detail')}
            className="p-5 relative overflow-hidden group cursor-pointer hover:bg-white/80 transition-all"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF6B00]"></div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-[#0A1931] text-lg leading-tight">Q3产品规划与设计冲刺讨论会</h3>
              <span className="text-xs font-semibold bg-[#FF6B00]/10 text-[#FF6B00] px-2 py-1 rounded-lg">10:00 AM</span>
            </div>
            <p className="text-sm text-[#0A1931]/60 line-clamp-2 leading-relaxed">
              点击进入查看完整会议记录，并体验基于 Gemini 大模型的自动摘要提取与邮件起草功能...
            </p>
            <div className="mt-3 flex gap-2">
              <span className="text-[11px] font-medium px-2.5 py-1 bg-[#FF6B00]/10 text-[#FF6B00] rounded-md flex items-center gap-1">
                <Sparkles size={12} /> 未生成摘要
              </span>
              <span className="text-[11px] font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">45分钟</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* History */}
      <div className="px-6 mt-8">
        <h2 className="text-[15px] font-bold text-[#0A1931]/70 mb-3 flex items-center gap-2">
          <FileText size={16} />
          历史纪要
        </h2>
        <div className="space-y-4">
          {[
            { title: '市场部投放复盘周会', time: '昨天 14:00', duration: '1小时20分' },
            { title: '客户A需求对接', time: '周一 09:30', duration: '30分钟' }
          ].map((item, idx) => (
            <GlassCard key={idx} onClick={() => onNavigate('detail')} className="p-4 flex gap-4 items-center cursor-pointer hover:bg-white/80 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#0A1931]/5 flex items-center justify-center shrink-0">
                <Mic size={20} className="text-[#0A1931]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#0A1931] truncate">{item.title}</h3>
                <div className="flex gap-3 text-xs text-[#0A1931]/50 mt-1 font-medium">
                  <span>{item.time}</span>
                  <span>{item.duration}</span>
                </div>
              </div>
              <MoreVertical size={20} className="text-slate-400" />
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="absolute inset-0 z-[100] flex">
          <div 
            className="absolute inset-0 bg-[#0A1931]/20 backdrop-blur-sm transition-opacity" 
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="w-[280px] bg-white/90 backdrop-blur-2xl h-full relative shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-left-4">
            <div className="pt-16 pb-6 px-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A1931] to-slate-700 flex items-center justify-center text-white text-xl font-bold shadow-lg mb-4">
                李
              </div>
              <h2 className="text-xl font-bold text-[#0A1931]">李明达</h2>
              <p className="text-sm text-slate-500 font-medium">高级产品经理</p>
            </div>
            
            <div className="flex-1 py-6 px-4 space-y-2">
              <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-100 rounded-2xl text-[#0A1931] font-semibold transition-colors">
                <Search size={22} className="text-slate-500" /> 全局搜索
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-100 rounded-2xl text-[#0A1931] font-semibold transition-colors">
                <Bookmark size={22} className="text-slate-500" /> 我的收藏
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-100 rounded-2xl text-[#0A1931] font-semibold transition-colors">
                <Download size={22} className="text-slate-500" /> 批量导出
              </button>
              <div className="h-px w-full bg-slate-100 my-4"></div>
              <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-100 rounded-2xl text-[#0A1931] font-semibold transition-colors">
                <Settings size={22} className="text-slate-500" /> 系统设置
              </button>
            </div>
            
            <div className="p-6">
              <button className="w-full py-3.5 bg-slate-100 text-[#0A1931] font-bold rounded-2xl flex justify-center items-center gap-2">
                升级专业版
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Screen 2: Recording ---
const RecordingScreen = ({ onNavigate }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="w-full h-full bg-[#0A1931] relative overflow-hidden flex flex-col items-center justify-between py-12">
      <StatusBar theme="light" />
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#FF6B00]/20 rounded-full blur-[80px]"></div>

      {/* Header */}
      <div className="w-full px-6 pt-6 flex justify-between items-center z-10">
        <button onClick={() => onNavigate('home')} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse"></div>
          <span className="text-white text-sm font-semibold">录音中</span>
        </div>
        <div className="w-10 h-10"></div> {/* Spacer */}
      </div>

      {/* Center Visualization */}
      <div className="flex-1 w-full flex flex-col items-center justify-center z-10">
        <h2 className="text-white/80 text-lg font-medium mb-2">Q3产品规划讨论</h2>
        <div className="text-6xl font-light text-white tracking-widest tabular-nums font-mono mb-16">
          {formatTime(seconds)}
        </div>

        {/* Waveform Mock */}
        <div className="flex items-center justify-center gap-1.5 h-32">
          {[40, 60, 30, 80, 100, 50, 70, 30, 60, 90, 40].map((height, i) => (
            <div 
              key={i} 
              className="w-1.5 bg-[#FF6B00] rounded-full animate-pulse"
              style={{ 
                height: `${height}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full px-8 pb-10 z-10">
        <GlassCard className="!bg-white/10 !border-white/20 p-6 flex justify-between items-center">
          <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <Bookmark size={24} fill="currentColor" className="text-white/80" />
          </button>
          
          <button className="w-20 h-20 rounded-full bg-gradient-to-b from-[#FF6B00] to-[#FF4500] flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,107,0,0.5)] border-4 border-white/10 transform hover:scale-105 transition-all">
            <Pause size={32} fill="currentColor" />
          </button>
          
          <button 
            onClick={() => onNavigate('detail')}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#0A1931] hover:bg-slate-200 transition-colors shadow-lg"
          >
            <Square size={20} fill="currentColor" />
          </button>
        </GlassCard>
        <div className="flex justify-between px-6 mt-4 text-xs font-medium text-white/50">
          <span>标记重点</span>
          <span className="ml-2">暂停</span>
          <span>结束保存</span>
        </div>
      </div>
    </div>
  );
};

// --- Screen 3: Detail (AI Features) ---
const DetailScreen = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('transcript'); // 'transcript' | 'summary'
  
  // Default transcript simulating a meeting
  const defaultTranscript = `今天我们主要同步一下纪要通移动端公测的发版计划。
李明达（产品）：目前产品的核心流程已经跑通了。设计部，你们能保证周五前完成录音页面的高保真UI设计交付吗？
王小美（设计部）：没问题，周四下班前就能给到研发。
张伟（研发部）：好的。另外，由于移动端的网络环境复杂，本地缓存的技术方案需要单独开个会评估，我下周一提交这个技术方案。
李明达（产品）：好的。市场部那边，测试用的种子用户招募推文准备得怎么样了？
陈强（市场部）：初稿已经写好了，这周五之前修改完毕就可以发出去。
李明达（产品）：好，那就按这个节点推进。大家辛苦了。`;

  const [transcript, setTranscript] = useState(defaultTranscript);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null); // { summary: "", actionItems: [] }
  
  // For AI email generation
  const [emailDrafts, setEmailDrafts] = useState({});
  const [isDraftingEmail, setIsDraftingEmail] = useState({});

  // Feature 1: Generate Summary using Gemini with JSON Schema
  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const schema = {
        type: "OBJECT",
        properties: {
          summary: { 
            type: "STRING", 
            description: "A concise, professional core summary of the meeting's main conclusions." 
          },
          actionItems: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                text: { type: "STRING", description: "The specific task to be completed." },
                owner: { type: "STRING", description: "The person or department responsible for the task." }
              }
            }
          }
        },
        required: ["summary", "actionItems"]
      };

      const prompt = `你是一个专业的会议助理。请分析以下会议记录文字，提取核心结论（简明扼要）和所有的待办事项（Action Items），并指出每个待办的负责人。
      会议记录：\n${transcript}`;

      const result = await callGemini(prompt, schema);
      setSummaryData(result);
      setActiveTab('summary');
    } catch (error) {
      console.error("Failed to generate summary:", error);
      alert("生成纪要失败，请稍后重试。");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Feature 2: Generate Email Draft based on Action Item
  const handleDraftEmail = async (taskIndex, task) => {
    setIsDraftingEmail(prev => ({ ...prev, [taskIndex]: true }));
    try {
      const prompt = `你是一个专业的职场助理。请根据以下待办事项，为负责人起草一封简短的跟进/确认邮件。
      要求：语气专业、礼貌、简洁，直接说明需要完成的任务。
      待办事项：${task.text}
      负责人：${task.owner}
      
      注意：只需返回邮件正文内容，不包含主题行，不要有任何多余的解释性文字。`;

      const result = await callGemini(prompt);
      setEmailDrafts(prev => ({ ...prev, [taskIndex]: result }));
    } catch (error) {
      console.error("Failed to draft email:", error);
      alert("起草邮件失败，请稍后重试。");
    } finally {
      setIsDraftingEmail(prev => ({ ...prev, [taskIndex]: false }));
    }
  };

  return (
    <div className="w-full h-full bg-[#F5F7FA] relative flex flex-col">
      <StatusBar theme="dark" />
      
      {/* Header */}
      <div className="pt-14 pb-4 px-4 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-40">
        <button onClick={() => onNavigate('home')} className="p-2 rounded-full hover:bg-slate-100 text-[#0A1931]">
          <ChevronLeft size={28} />
        </button>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-slate-100 text-[#0A1931]">
            <Share size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 text-[#0A1931]">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        {/* Title & Player */}
        <div className="px-6 py-6 bg-white rounded-b-[40px] shadow-sm relative z-30">
          <h1 className="text-2xl font-bold text-[#0A1931] leading-tight mb-2">Q3产品规划与设计冲刺讨论会</h1>
          <div className="flex items-center gap-3 text-sm text-slate-500 font-medium mb-6">
            <span>2024年8月15日</span>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <span>时长 45:23</span>
          </div>

          {/* Mini Player */}
          <div className="bg-[#F5F7FA] rounded-2xl p-3 flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center text-white shrink-0 shadow-md">
              <Play size={18} fill="currentColor" className="ml-1" />
            </button>
            <div className="flex-1">
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-[#FF6B00] rounded-full relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow border border-slate-200"></div>
                </div>
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-400 font-semibold tabular-nums">
                <span>15:02</span>
                <span>45:23</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="px-6 pt-6">
          <div className="flex gap-6 border-b border-slate-200 mb-6 relative">
            <button 
              onClick={() => setActiveTab('transcript')}
              className={`pb-3 text-[15px] font-semibold transition-colors ${activeTab === 'transcript' ? 'text-[#0A1931] border-b-2 border-[#0A1931]' : 'text-slate-400'}`}
            >
              完整文字
            </button>
            <button 
              onClick={() => setActiveTab('summary')}
              className={`pb-3 text-[15px] font-bold flex items-center gap-1.5 transition-colors ${activeTab === 'summary' ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]' : 'text-slate-400'}`}
            >
              <Sparkles size={16} className={activeTab === 'summary' ? 'text-[#FF6B00]' : 'text-slate-400'} />
              AI摘要
            </button>
          </div>

          {/* Transcript View */}
          {activeTab === 'transcript' && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <p className="text-xs text-slate-500 font-medium mb-3">您可以编辑以下识别内容：</p>
              <textarea 
                className="w-full h-48 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-sm text-slate-700 leading-relaxed focus:ring-2 focus:ring-[#FF6B00]/50 outline-none resize-none"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
              
              <button 
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary || !transcript.trim()}
                className="w-full mt-6 py-4 bg-[#0A1931] hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg"
              >
                {isGeneratingSummary ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Sparkles size={20} className="text-[#FF6B00]" />
                )}
                {isGeneratingSummary ? 'AI 正在深入分析中...' : '✨ 一键提取核心纪要与待办'}
              </button>
            </div>
          )}

          {/* Summary View */}
          {activeTab === 'summary' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {!summaryData ? (
                <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles size={28} className="text-slate-300" />
                  </div>
                  <h3 className="text-slate-500 font-medium mb-2">暂无摘要内容</h3>
                  <p className="text-xs text-slate-400 mb-6">点击下方按钮让 Gemini 为您总结会议内容</p>
                  <button 
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="px-6 py-2.5 bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 font-bold rounded-xl flex items-center gap-2 transition-colors"
                  >
                    {isGeneratingSummary ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    立即提取
                  </button>
                </div>
              ) : (
                <div className="space-y-6 pb-6">
                  {/* Summary Section */}
                  <section>
                    <h3 className="text-sm font-bold text-[#0A1931] mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-[#FF6B00] rounded-full"></div>
                      核心结论
                    </h3>
                    <p className="text-[14px] text-slate-700 leading-relaxed bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                      {summaryData.summary}
                    </p>
                  </section>

                  {/* Action Items Section */}
                  <section>
                    <h3 className="text-sm font-bold text-[#0A1931] mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                      待办事项 (Action Items)
                    </h3>
                    <div className="space-y-3">
                      {summaryData.actionItems.map((task, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                          <div className="p-4 flex items-start gap-3">
                            <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-slate-300" />
                            <div className="flex-1">
                              <p className="text-[14px] leading-snug text-[#0A1931] font-medium">
                                {task.text}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <span className="inline-block text-[11px] font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">
                                  @{task.owner}
                                </span>
                                {!emailDrafts[idx] && (
                                  <button 
                                    onClick={() => handleDraftEmail(idx, task)}
                                    disabled={isDraftingEmail[idx]}
                                    className="text-[11px] font-bold text-[#FF6B00] bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors disabled:opacity-50"
                                  >
                                    {isDraftingEmail[idx] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                    ✨ 起草催办邮件
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Email Draft Result */}
                          {emailDrafts[idx] && (
                            <div className="bg-[#F5F7FA] border-t border-slate-100 p-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                <Mail size={14} /> AI 邮件草稿：
                              </div>
                              <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {emailDrafts[idx]}
                              </p>
                              <div className="flex justify-end mt-3">
                                <button className="text-xs bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg font-medium text-[#0A1931] hover:bg-slate-50">
                                  复制邮件
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Controller ---
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');

  return (
    <div className="min-h-screen bg-[#E5E9F0] py-12 px-8 flex flex-col items-center font-sans">
      <div className="mb-8 text-center max-w-2xl">
        <div className="inline-flex items-center justify-center gap-2 bg-[#FF6B00]/10 text-[#FF6B00] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
          <Sparkles size={16} /> Powered by hbdaily API
        </div>
        <h1 className="text-3xl font-bold text-[#0A1931] mb-3">纪要通 (JiYaoTong) 交互原型</h1>
        <p className="text-slate-600 text-sm">
          点击 <b>开始录音</b> 模拟会议记录，或在详情页体验 <b>✨ 一键提取纪要</b> 与 <b>✨ 自动起草邮件</b> 功能。
        </p>
      </div>

      {/* Interactive Phone Frame */}
      <div className="relative">
        <div className="w-[375px] h-[812px] rounded-[45px] border-[12px] border-[#0A1931] shadow-2xl relative overflow-hidden bg-white ring-1 ring-slate-900/5 transition-all duration-300">
          
          {/* Dynamic Screen Rendering */}
          {currentScreen === 'home' && <HomeScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'recording' && <RecordingScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'detail' && <DetailScreen onNavigate={setCurrentScreen} />}
          
        </div>
        
        {/* Helper Badge */}
        <div className="absolute -right-32 top-1/4 max-w-[120px] hidden lg:block animate-bounce">
          <div className="bg-white p-3 rounded-2xl shadow-xl text-xs font-medium text-slate-600 relative border border-slate-100">
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white transform rotate-45 border-b border-l border-slate-100"></div>
            尝试在详情页生成 AI 摘要！
          </div>
        </div>
      </div>
    </div>
  );
}