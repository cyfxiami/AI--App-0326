
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  Menu, User, ChevronDown, Plus, MoreHorizontal, ChevronUp, ChevronsUp, AlarmClock, FolderOpen, Quote, FileText, Layout, BarChart3, Briefcase, Mic2, X, Mic, Building2, Users, List, Image, Mail, MessageSquare, Check, Headset, Palette, Sparkles, Search, Cpu, UserCircle, Send, ThumbsUp, ThumbsDown, Copy, Share2, ArrowLeft, ArrowRight, Globe, ChevronsDown, Edit2, Pin, Trash2, ChevronLeft, ChevronRight,
  Settings, CheckCircle2, PlusCircle, Banknote, Megaphone, Paperclip, Target, ClipboardList, Calendar, TrendingUp, Activity, Star, UserCheck, Clock, PieChart
} from 'lucide-react';

// --- Types ---

interface CarouselItem {
  id: string;
  title: string;
  type: 'news' | 'poster' | 'doc' | 'project-list' | 'knowledge' | 'bubble-list';
  subTitle?: string;
  titlePrefix?: string;
  contentTitle?: string;
  contentBody?: string;
  imageUrl?: string;
  listItems?: { label?: string; text: string }[];
  bubbleItems?: { text: string; color: string; textColor: string }[];
  buttonText?: string;
  buttonIcon?: React.ReactNode;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
  isPinned?: boolean;
  messages: any[];
}

// --- Constants (Moved outside to prevent re-renders) ---

const AVATAR_LIST = [
  { id: 1, name: '资产管理', avatar: 'https://i.postimg.cc/253xM93r/23586b9a0516f38b1609846cc310cab6.png' },
  { id: 2, name: '销售交易', avatar: 'https://i.postimg.cc/CKd4Xr54/b9780ddc8c4ff15e32b0dc9976f0497a.png' },
  { id: 3, name: '信用交易', avatar: 'https://i.postimg.cc/CKd4Xr54/b9780ddc8c4ff15e32b0dc9976f0497a.png' },
  { id: 4, name: '机构经纪', avatar: 'https://i.postimg.cc/CKd4Xr54/b9780ddc8c4ff15e32b0dc9976f0497a.png' },
  { id: 5, name: '投行智能', avatar: 'https://i.postimg.cc/CKd4Xr54/b9780ddc8c4ff15e32b0dc9976f0497a.png' },
  { id: 6, name: '硏究智能', avatar: 'https://i.postimg.cc/CKd4Xr54/b9780ddc8c4ff15e32b0dc9976f0497a.png' },
  { id: 7, name: '财富管理', avatar: 'https://i.postimg.cc/CKd4Xr54/b9780ddc8c4ff15e32b0dc9976f0497a.png' },
  { id: 8, name: '固收智能', avatar: 'https://i.postimg.cc/CKd4Xr54/b9780ddc8c4ff15e32b0dc9976f0497a.png' },
];

const DAILY_TASKS: CarouselItem[] = [
  {
    id: 'task-knowledge',
    type: 'knowledge',
    title: "每日给我讲一个金融小知识",
    subTitle: "什么是“T+0”交易机制",
    contentBody: "T+0交易是指当天买入的证券当天即可卖出。目前A股实行T+1，而可转债、权证等品种实行T+0。",
    buttonText: "订阅"
  },
  {
    id: 'task-market',
    type: 'poster',
    title: "订阅每日股市行情",
    contentBody: "每日股市行情订阅涵盖全球主要指数表现、行业板块涨跌幅、个股龙虎榜及宏观经济数据。",
    buttonText: "订阅"
  },
  {
    id: 'task-strategy',
    type: 'poster',
    title: "每天生成一张投资策略海报",
    imageUrl: "https://images.unsplash.com/photo-1611974717483-5828d116bd85?q=80&w=1000&auto=format&fit=crop", 
    buttonText: "订阅"
  }
];

const ACTIVE_TASKS = [
  {
    id: 'task-2',
    category: "财富管理",
    title: "客户李毅燃：800万闲置资金激活",
    description: "系统监测到大额资金空仓，AI已生成配置建议。",
    steps: [
      { label: "资产评估", subLabel: "高净值稳健型", status: "completed", file: "账户分析报告.pdf" },
      { label: "方案生成", subLabel: "固收+增强", status: "completed", file: "配置建议书_v1.docx" },
      { label: "员工确认", subLabel: "需确认方案细节", status: "current" },
      { label: "触达客户", subLabel: "APP/企微", status: "pending" }
    ],
    actionText: "客户服务",
    type: 'wealth-management',
    color: "bg-white",
    accentColor: "text-red-500",
    buttonBg: "bg-red-50",
    icon: <User className="w-3.5 h-3.5 text-white" />,
    iconBg: "bg-red-500"
  },
  {
    id: 'task-3',
    category: "财富管理",
    title: "重点产品：华创稳赢3号推广",
    description: "公司本周重点代销产品，AI已筛选目标客户群。",
    steps: [
      { label: "销售方案生成", subLabel: "策略已定", status: "completed", file: "销售服务方案.pptx" },
      { label: "客户匹配", subLabel: "25位高意向", status: "completed", file: "目标客户名单.xlsx" },
      { label: "话术生成", subLabel: "个性化推荐", status: "current" },
      { label: "批量触达", subLabel: "企业微信", status: "pending" }
    ],
    actionText: "产品销售",
    type: 'product-sales',
    color: "bg-white",
    accentColor: "text-blue-600",
    buttonBg: "bg-blue-50",
    icon: <BarChart3 className="w-3.5 h-3.5 text-white" />,
    iconBg: "bg-blue-600"
  },
  {
    id: 'task-4',
    category: "销售交易",
    title: "一级债销售：24国开15分销",
    description: "一级市场新债发行，AI辅助生成销售方案。",
    steps: [
      { label: "市场分析", subLabel: "利率曲线", status: "completed" },
      { label: "方案生成", subLabel: "定价策略", status: "completed", file: "销售方案.docx" },
      { label: "客户路演", subLabel: "机构对接", status: "current" },
      { label: "投标缴款", subLabel: "确认额度", status: "pending" }
    ],
    actionText: "债券销售",
    type: 'bond-sales',
    color: "bg-white",
    accentColor: "text-red-600",
    buttonBg: "bg-red-50",
    icon: <Briefcase className="w-3.5 h-3.5 text-white" />,
    iconBg: "bg-red-600"
  },
  {
    id: 'task-new-4',
    category: "投行智能",
    title: "并购项目：芯源微电子尽职调查",
    description: "芯源微电子并购案，AI辅助生成尽调报告。",
    steps: [
      { label: "尽调分析", subLabel: "大纲确认", status: "current", file: "尽调大纲.pdf" },
      { label: "数据采集", subLabel: "工商/财务", status: "pending" },
      { label: "风险分析", subLabel: "法律/合规", status: "pending" },
      { label: "报告生成&复核", subLabel: "人工复核", status: "pending" }
    ],
    actionText: "去尽调",
    type: 'investment-banking',
    color: "bg-white",
    accentColor: "text-blue-500",
    buttonBg: "bg-blue-50",
    icon: <Briefcase className="w-3.5 h-3.5 text-white" />,
    iconBg: "bg-blue-500"
  },
  {
    id: 'task-1',
    category: "资产管理",
    title: "迪阿股份有限公司",
    description: "上市公司迪阿股份在2026年一季度将有8亿左右银行结构性存款到期。该客户自有资金充裕，透过其他券商资管计划，存量产品业绩基准在1.6%-4.6%之间，是公司资管业务的潜在客户。请尽快安排...",
    tags: ["1天", "商机线索", "线索跟进", "初步了解"],
    aiAssistant: {
      title: "智能体已为您准备好:",
      actions: ["客户调研报告", "路演方案"]
    },
    actionText: "立即处理",
    type: 'asset-management',
    color: "bg-white",
    accentColor: "text-blue-600",
    icon: <Cpu className="w-3.5 h-3.5 text-white" />,
    iconBg: "bg-blue-500"
  },
  {
    id: 'task-5',
    category: "信用交易",
    title: "反洗钱风险排查：异常交易预警",
    description: "系统检测到3笔跨境大额转账，需在24小时内完成初步核查并提交报告。",
    tags: ["紧急", "合规", "24h"],
    aiAssistant: {
      title: "AI已提取关键信息:",
      actions: ["交易链路图", "风险点摘要"]
    },
    actionText: "开始核查",
    type: 'compliance',
    color: "bg-white",
    accentColor: "text-amber-600",
    icon: <Search className="w-3.5 h-3.5 text-white" />,
    iconBg: "bg-amber-500"
  },
  {
    id: 'task-6',
    category: "机构经纪",
    title: "高净值客户：张总季度资产回顾",
    description: "张总近期资产波动较大，建议进行深度沟通，同步最新市场观点。",
    steps: [
      { label: "报告准备", subLabel: "Q1业绩回顾", status: "completed" },
      { label: "预约时间", subLabel: "本周五下午", status: "current" },
      { label: "现场沟通", subLabel: "陆家嘴办公室", status: "pending" }
    ],
    actionText: "预约客户",
    type: 'client-service',
    color: "bg-white",
    accentColor: "text-emerald-600",
    icon: <Users className="w-3.5 h-3.5 text-white" />,
    iconBg: "bg-emerald-500"
  },
  {
    id: 'task-7',
    category: "硏究智能",
    title: "美联储议息会议：深度点评与策略",
    description: "美联储维持利率不变，但释放鸽派信号。AI已生成对固收及权益市场的策略建议。",
    tags: ["深度", "投研", "策略"],
    aiAssistant: {
      title: "AI投研助手:",
      actions: ["核心观点总结", "持仓调整建议"]
    },
    actionText: "查看报告",
    type: 'research',
    color: "bg-white",
    accentColor: "text-indigo-600",
    icon: <Globe className="w-3.5 h-3.5 text-white" />,
    iconBg: "bg-indigo-500"
  },
  {
    id: 'task-8',
    category: "固收智能",
    title: "持仓预警：某城投债评级展望下调",
    description: "中诚信国际将XX城投评级展望由稳定下调至负面，需评估对相关资管计划的影响。",
    steps: [
      { label: "风险评估", subLabel: "敞口测算", status: "current" },
      { label: "处置建议", subLabel: "减持或持有", status: "pending" }
    ],
    actionText: "风险处置",
    type: 'risk-management',
    color: "bg-white",
    accentColor: "text-rose-600",
    icon: <AlarmClock className="w-3.5 h-3.5 text-white" />,
    iconBg: "bg-rose-500"
  },
  {
    id: 'task-9',
    category: "投行智能",
    title: "周一投研晨会：重点项目同步",
    description: "本周将讨论大消费板块投资机会，请各研究员准备好汇报材料。",
    tags: ["会议", "协作", "周一"],
    actionText: "进入会议",
    type: 'collaboration',
    color: "bg-white",
    accentColor: "text-slate-600",
    icon: <MessageSquare className="w-3.5 h-3.5 text-white" />,
    iconBg: "bg-slate-500"
  },
  {
    id: 'task-10',
    category: "硏究智能",
    title: "AI工具使用：提示词工程进阶",
    description: "提升投研效率的10个AI提示词技巧，完成课程可获得学分。",
    steps: [
      { label: "视频学习", subLabel: "共45分钟", status: "pending" },
      { label: "实操练习", subLabel: "撰写研报摘要", status: "pending" }
    ],
    actionText: "开始学习",
    type: 'training',
    color: "bg-white",
    accentColor: "text-purple-600",
    icon: <Cpu className="w-3.5 h-3.5 text-white" />,
    iconBg: "bg-purple-500"
  }
];

const MY_PROJECTS: CarouselItem[] = [
  {
    id: 'proj-private-bank',
    type: 'project-list',
    titlePrefix: "高净值客户",
    title: "成为私行会员",
    listItems: [
      { text: "账户资产达到600万元以上，申请私行客户资格" },
      { text: "配备专属投资顾问，定制全球资产配置方案" },
      { text: "享受高端医疗、机场贵宾厅等增值服务" }
    ],
    buttonText: "创建",
    buttonIcon: <Layout className="w-2.5 h-2.5 text-white" />
  },
  {
    id: 'proj-quant',
    type: 'bubble-list',
    titlePrefix: "机构投资者",
    title: "开通量化交易",
    bubbleItems: [
      { text: "申请极速交易席位，降低报单延迟", color: "#323232", textColor: "text-white" },
      { text: "接入实时行情API，实现毫秒级响应", color: "#FFFFFF", textColor: "text-gray-500" },
      { text: "部署量化策略，实现自动化交易监控", color: "#D7EAEA", textColor: "text-gray-600" }
    ],
    buttonText: "创建",
    buttonIcon: <Layout className="w-2.5 h-2.5 text-white" />
  },
  {
    id: 'proj-regular',
    type: 'project-list',
    titlePrefix: "普通投资者",
    title: "开启定投计划",
    listItems: [
      { label: "选基", text: "挑选3-5只长期业绩稳健的指数基金或主动基金" },
      { label: "设置", text: "设定每月固定扣款金额及扣款日期，平摊成本" },
      { label: "坚持", text: "长期持有，利用复利效应实现财富稳步增长" }
    ],
    buttonText: "创建",
    buttonIcon: <Layout className="w-2.5 h-2.5 text-white" />
  }
];

const AVATAR_LIST_OLD = []; // Removed from here


// --- Helper Components ---

const Sidebar = ({ isOpen, onClose, history, onNewChat, onRename, onPin, onDelete, onSelect }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredHistory = history.filter((item: ChatHistoryItem) => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const groups = [
    { label: '今天', filter: (d: Date) => {
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }},
    { label: '最近7天', filter: (d: Date) => {
      const now = new Date();
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 7 && !(d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());
    }},
    { label: '最近30天', filter: (d: Date) => {
      const now = new Date();
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 7 && diff <= 30;
    }}
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-[#F8FAFC] z-[201] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-3 flex justify-between items-center bg-[#3B82F6]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                  张
                </div>
                <span className="text-lg font-bold text-white">张三</span>
              </div>
              <button onClick={onClose} className="p-2 text-white/70 hover:text-white">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32 space-y-6 scrollbar-hide">
              <div className="flex items-center space-x-2 px-2">
                <div className="w-1 h-5 bg-[#3B82F6] rounded-full" />
                <h2 className="text-lg font-bold text-[#1E293B]">历史记录</h2>
              </div>

              {/* Search */}
              <div className="px-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索对话..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* History List */}
              <div className="space-y-6">
                {groups.map(group => {
                  const items = sortedHistory.filter(item => group.filter(item.timestamp));
                  if (items.length === 0) return null;
                  return (
                    <div key={group.label} className="space-y-3">
                      <h3 className="px-2 text-[13px] font-medium text-gray-400">{group.label}</h3>
                      <div className="space-y-3">
                        {items.map(item => (
                          <div key={item.id} className="relative group">
                            <button
                              onClick={() => onSelect(item)}
                              className={`w-full text-left p-3.5 rounded-2xl bg-white border border-transparent hover:border-blue-100 hover:bg-blue-50/10 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col space-y-1 ${item.isPinned ? 'border-blue-200 bg-blue-50/30' : ''}`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[14px] font-bold text-[#1E293B] line-clamp-1 pr-8">{item.title}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                                <span>{item.timestamp.getHours()}:{item.timestamp.getMinutes().toString().padStart(2, '0')}</span>
                                <span>•</span>
                                <span>{item.messageCount}次对话</span>
                              </div>
                            </button>
                            
                            <div className="absolute top-3.5 right-3">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === item.id ? null : item.id);
                                }}
                                className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-gray-500 rounded-lg transition-colors"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </button>

                              <AnimatePresence>
                                {activeMenuId === item.id && (
                                  <>
                                    <div className="fixed inset-0 z-[210]" onClick={() => setActiveMenuId(null)} />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                      className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-50 overflow-hidden z-[211] py-1"
                                    >
                                      <button 
                                        onClick={() => { onRename(item); setActiveMenuId(null); }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                        <span>重命名</span>
                                      </button>
                                      <button 
                                        onClick={() => { onPin(item); setActiveMenuId(null); }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2"
                                      >
                                        <Pin className="w-4 h-4" />
                                        <span>{item.isPinned ? '取消置顶' : '置顶'}</span>
                                      </button>
                                      <button 
                                        onClick={() => { setActiveMenuId(null); }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2"
                                      >
                                        <Share2 className="w-4 h-4" />
                                        <span>分享</span>
                                      </button>
                                      <button 
                                        onClick={() => { onDelete(item); setActiveMenuId(null); }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center space-x-2"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span>删除</span>
                                      </button>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating Footer Button */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent pt-10 pointer-events-none">
              <button
                onClick={onNewChat}
                className="w-full bg-[#3B82F6] text-white rounded-2xl py-3.5 font-bold flex items-center justify-center space-x-2 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 pointer-events-auto"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[15px]">新建对话</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Components ---

const CustomerCard = () => {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 w-full">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-gray-900 truncate">迪阿股份</h3>
          <p className="text-[10px] text-gray-400 truncate">上市公司 | 股票代码: 301177.SZ</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <div className="flex items-center space-x-1.5 mb-0.5">
            <Briefcase className="w-3 h-3 text-blue-500" />
            <span className="text-[11px] font-bold text-gray-400">业务范围</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-tight">
            珠宝首饰品牌企业，主营业务为钻石镶嵌首饰的研发、设计和销售，产品涵盖婚恋钻石首饰、时尚首饰等
          </p>
        </div>

        <div>
          <div className="flex items-center space-x-1.5 mb-0.5">
            <Users className="w-3 h-3 text-blue-500" />
            <span className="text-[11px] font-bold text-gray-400">联系方式</span>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">客户公司</span>
              <span className="text-[11px] text-gray-600 font-medium">待确认</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">内部对接</span>
              <span className="text-[11px] text-gray-600 font-medium">佛山营业部-李经理 138****8888</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50/50 rounded-lg p-2 border border-amber-100/50">
          <div className="flex items-center space-x-1 mb-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="text-[11px] font-bold text-amber-700">关键提示</span>
          </div>
          <div className="space-y-1">
            <div className="bg-amber-100/30 px-1.5 py-0.5 rounded text-[10px] text-amber-800 font-medium inline-block">
              2026年一季度约8亿结构性存款到期
            </div>
            <div className="flex flex-wrap gap-1">
              <div className="bg-amber-100/30 px-1.5 py-0.5 rounded text-[10px] text-amber-800 font-medium">
                资管产品业绩基准1.6%-4.6%
              </div>
              <div className="bg-amber-100/30 px-1.5 py-0.5 rounded text-[10px] text-amber-800 font-medium">
                需尽快安排拜访
              </div>
            </div>
          </div>
        </div>

        <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-[12px] flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
          <FileText className="w-3.5 h-3.5" />
          <span>查看调研报告</span>
        </button>
      </div>
    </div>
  );
};

const ProjectDetailCard = ({ data, onToggleTask, onToggleMain, onArrowClick, readOnly = false }: any) => {
  const [prefix, ...rest] = data.title.split(' ');
  const mainTitle = rest.join(' ');

  return (
    <div className="bg-white rounded-[20px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-100/50">
      {/* Main Directory */}
      <div className="flex items-start space-x-3 mb-2">
        <button 
          onClick={onToggleMain}
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-all ${
            data.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 hover:border-blue-400'
          } ${readOnly ? 'cursor-default pointer-events-none' : ''}`}
        >
          {data.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-[15px] font-bold truncate ${data.completed ? 'text-gray-300 line-through' : 'text-gray-900'}`}>
              <span className={`${data.completed ? 'text-gray-300' : 'text-blue-500'} mr-2`}>{prefix}</span>
              {mainTitle}
            </h3>
            <button onClick={() => onArrowClick(data.title)}>
              <ArrowRight className={`w-4 h-4 ${data.completed ? 'text-gray-200' : 'text-gray-400'}`} />
            </button>
          </div>
          {data.subTitle && <p className={`text-[11px] mt-0.5 ${data.completed ? 'text-gray-200' : 'text-gray-400'}`}>{data.subTitle}</p>}
        </div>
      </div>

      {/* Sub Directories */}
      <div className="relative pl-2.5 ml-2.5 border-l border-gray-100 space-y-2">
        {data.tasks.map((task: any) => (
          <div key={task.id} className="flex items-center space-x-3 relative">
            {/* Connector Line */}
            <div className="absolute -left-[11px] top-1/2 w-2.5 h-[1px] bg-gray-100" />
            
            <button 
              onClick={() => onToggleTask(task.id)}
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'
              } ${readOnly ? 'cursor-default pointer-events-none' : ''}`}
            >
              {task.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div className="min-w-0">
                {task.title && (
                  <span className={`text-[13px] font-bold mr-2 ${task.completed ? 'text-gray-300 line-through' : 'text-blue-500'}`}>
                    {task.title}
                  </span>
                )}
                <span className={`text-[13px] ${task.completed ? 'text-gray-300 line-through' : 'text-gray-500'}`}>
                  {task.desc}
                </span>
              </div>
              <button onClick={() => onArrowClick(`${task.title} ${task.desc}`)}>
                <ArrowRight className={`w-4 h-4 ${task.completed ? 'text-gray-200' : 'text-gray-400'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectHistoryView = ({ history, onBack, onNewProject, onToggleTask, onToggleMain }: any) => {
  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      {/* Header */}
      <header className="px-4 pt-5 pb-1.5 bg-[#3B82F6] sticky top-0 z-50 flex items-center shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="flex-1 text-center text-[18px] font-bold text-white pr-8">我的项目</h1>
      </header>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-2">
            <FolderOpen className="w-12 h-12 opacity-20" />
            <p className="text-sm">暂无历史项目</p>
          </div>
        ) : (
          history.map((project: any) => (
            <div key={project.id} className="relative">
               <ProjectDetailCard 
                data={project}
                onToggleTask={(taskId: number) => onToggleTask(project.id, taskId)}
                onToggleMain={() => onToggleMain(project.id)}
                onArrowClick={() => {}}
                readOnly={true}
              />
            </div>
          ))
        )}
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent pt-10">
        <button
          onClick={onNewProject}
          className="w-full bg-[#3B82F6] text-white rounded-xl py-4 font-bold text-[16px] shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          新建项目
        </button>
      </div>
    </div>
  );
};

const AssetAgentView = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="flex flex-col h-full bg-[#F5F7FF] overflow-hidden font-sans">
      {/* Header */}
      <header className="px-6 pt-4 pb-2 flex justify-between items-center bg-[#F5F7FF] shrink-0 relative">
        <IconButton className="!p-0" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </IconButton>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <span className="text-[16px] font-bold tracking-tight">
            <span className="text-[#3B82F6]">产品销售</span>
            <span className="text-[#FF4D4F]">超级员工</span>
          </span>
        </div>
        <div className="w-5" />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-28 hide-scrollbar">
        {/* Top Card */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-4 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-[17px] font-bold text-gray-900 leading-tight pr-4">
              现金管理方案补件协调
            </h2>
            <div className="bg-[#FFF1F0] text-[#FF4D4F] text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap">
              现金管理方案补件协调
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="bg-gray-50 text-gray-500 text-[11px] px-2 py-0.5 rounded-md border border-gray-100">3小时前</span>
            <span className="bg-gray-50 text-gray-500 text-[11px] px-2 py-0.5 rounded-md border border-gray-100">高优先级</span>
            <span className="bg-gray-50 text-gray-500 text-[11px] px-2 py-0.5 rounded-md border border-gray-100">处理中</span>
            <span className="bg-gray-50 text-gray-500 text-[11px] px-2 py-0.5 rounded-md border border-gray-100">合规补件</span>
          </div>

          <p className="text-gray-500 text-[13px] leading-relaxed mb-4">
            客户要求今日 17:00 前补齐盖章材料，并同步审批口径。
          </p>

          <div className="flex justify-end">
            <button className="bg-[#FDF2F2] text-[#FF4D4F] text-[13px] font-bold px-4 py-1.5 rounded-full active:scale-95 transition-transform">
              立即处理
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-1 mt-3">
            <div className="w-3 h-1 bg-[#FF4D4F] rounded-full" />
            <div className="w-1 h-1 bg-gray-200 rounded-full" />
            <div className="w-1 h-1 bg-[#A7F3D0] rounded-full" />
          </div>
        </div>

        {/* Three Quick Actions */}
        <div className="flex justify-around mb-6">
          {[
            { label: '我的客户', icon: 'https://i.postimg.cc/QtcbS6b7/sheng-cheng-bu-men-ji-qi-ren-tu-biao-(11).png' },
            { label: '我的任务', icon: 'https://i.postimg.cc/QtcbS6b7/sheng-cheng-bu-men-ji-qi-ren-tu-biao-(11).png' },
            { label: '前端发起', icon: 'https://i.postimg.cc/QtcbS6b7/sheng-cheng-bu-men-ji-qi-ren-tu-biao-(11).png' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center space-y-1.5">
              <div className="w-14 h-14 rounded-full overflow-hidden shadow-sm border-2 border-white">
                <img src={item.icon} alt={item.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <span className="text-[12px] text-gray-600 font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Business Section */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-7 h-7 bg-[#E0F2FE] rounded-lg flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-[#0EA5E9]" />
            </div>
            <h3 className="text-[16px] font-bold text-gray-900">资管业务</h3>
          </div>

          <div className="space-y-3">
            {[
              { title: '机构客户理财', desc: '定制化资管方案', icon: <Building2 className="w-4.5 h-4.5 text-[#3B82F6]" />, bg: 'bg-[#EFF6FF]' },
              { title: '个人高净值理财', desc: '专属财富管理', icon: <UserCircle className="w-4.5 h-4.5 text-[#F97316]" />, bg: 'bg-[#FFF7ED]' },
              { title: '同业客户理财', desc: '同业合作方案', icon: <Building2 className="w-4.5 h-4.5 text-[#10B981]" />, bg: 'bg-[#ECFDF5]' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-50 active:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${item.bg} rounded-full flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-gray-900">{item.title}</div>
                    <div className="text-[12px] text-gray-400">{item.desc}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md px-4 py-2 border-t border-gray-100 z-[100]">
        <div className="flex flex-wrap gap-1.5 mb-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
          {['帮我梳理今日客户触达重点', '安排一场产品路演', '输出一份前端发起方案'].map((chip, idx) => (
            <div key={idx} className="bg-[#F3F4F6] text-gray-600 text-[12px] px-3 py-1.5 rounded-full font-medium">
              {chip}
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2 bg-[#F8F9FA] rounded-full px-3 py-1.5">
          <Paperclip className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="请输入消息..." 
            className="flex-1 bg-transparent border-none outline-none text-[13px] py-0.5"
          />
          <IconButton className="!p-0">
            <Send className="w-4.5 h-4.5 text-[#3B82F6]" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

const WorkbenchView = ({ onBackToAI }: { onBackToAI: () => void }) => {
  const [activeTab, setActiveTab] = useState('待处理(6)');
  
  const workItems = [
    { icon: <div className="w-12 h-12 bg-[#10B981] rounded-xl flex items-center justify-center text-white shadow-sm"><CheckCircle2 className="w-6 h-6" /></div>, label: 'OA审批' },
    { icon: <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center text-white shadow-sm"><Mail className="w-6 h-6" /></div>, label: 'OA邮箱' },
    { icon: <div className="w-12 h-12 bg-[#F59E0B] rounded-xl flex items-center justify-center text-white shadow-sm"><Sparkles className="w-6 h-6" /></div>, label: '一点触发全体响应' },
    { icon: <div className="w-12 h-12 bg-[#6366F1] rounded-xl flex items-center justify-center text-white shadow-sm"><List className="w-6 h-6" /></div>, label: '任务中心' },
    { icon: <div className="w-12 h-12 bg-[#FBBF24] rounded-xl flex items-center justify-center text-white shadow-sm"><Banknote className="w-6 h-6" /></div>, label: '智能费控' },
    { icon: <div className="w-12 h-12 bg-[#0EA5E9] rounded-xl flex items-center justify-center text-white shadow-sm"><Users className="w-6 h-6" /></div>, label: '客户团队作战管理' },
    { icon: <div className="w-12 h-12 bg-[#A855F7] rounded-xl flex items-center justify-center text-white shadow-sm"><Megaphone className="w-6 h-6" /></div>, label: '通知公告' },
    { icon: <div className="w-12 h-12 bg-[#EF4444] rounded-xl flex items-center justify-center text-white shadow-sm"><FileText className="w-6 h-6" /></div>, label: '正式发文' },
  ];

  const responseItems = [
    { title: '关于 2025 年第四季度配...', date: '2025年12月25日 08:51', status: 'red' },
    { title: '关于“引领”系列文化建...', date: '2025年10月22日 13:47', status: 'red' },
    { title: '关于科技研发中心《员...', date: '2025年10月16日 11:06', status: 'red' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] overflow-hidden font-sans">
      {/* Header */}
      <header className="px-4 h-14 bg-white flex justify-between items-center border-b border-gray-100 shrink-0">
        <div className="w-8" />
        <h1 className="text-[17px] font-semibold text-gray-800">工作台</h1>
        <Plus className="w-6 h-6 text-gray-600" />
      </header>

      <div className="flex-1 overflow-y-auto pb-20 hide-scrollbar">
        {/* Daily Work Section */}
        <section className="m-3 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center">
                <Layout className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <h2 className="text-[15px] font-bold text-gray-800">日常工作</h2>
            </div>
            <button className="text-[12px] text-blue-500 flex items-center font-medium">
              <Settings className="w-3.5 h-3.5 mr-1" /> 设置
            </button>
          </div>
          <div className="grid grid-cols-4 gap-y-6">
            {workItems.map((item, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                {item.icon}
                <span className="text-[11px] text-gray-600 text-center leading-tight px-1 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* My Response Section */}
        <section className="m-3 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-gray-50">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-emerald-50 rounded flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <h2 className="text-[15px] font-bold text-gray-800">我的响应</h2>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            <button className="text-[12px] text-blue-500 flex items-center font-medium">
              <PlusCircle className="w-3.5 h-3.5 mr-1" /> 添加
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-50 px-2">
            {['待处理(6)', '已完成(66)', '我发起的(19)', '抄送我(5)'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-3 text-[13px] relative transition-colors whitespace-nowrap ${activeTab === tab ? 'text-blue-500 font-bold' : 'text-gray-500'}`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-500 rounded-full" 
                  />
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="divide-y divide-gray-50">
            {responseItems.map((item, i) => (
              <div key={i} className="p-4 space-y-2 active:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start space-x-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.status === 'red' ? 'bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.4)]' : 'bg-gray-300'}`} />
                  <h3 className="text-[14px] font-medium text-gray-800 line-clamp-1 flex-1">{item.title}</h3>
                  <span className="text-[11px] text-gray-400 shrink-0 ml-2">{item.date}</span>
                </div>
                <div className="pl-4 space-y-1">
                  <p className="text-[12px] text-gray-400">关联事项 --</p>
                  <p className="text-[12px] text-gray-400">截止时间 2026年1月6日 17:00</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Nav */}
      <nav className="bg-white border-t border-gray-100 flex justify-around pt-0 pb-0.5 px-2 shrink-0 h-[52px]">
        <div className="flex flex-col items-center space-y-1 text-gray-400 cursor-pointer translate-y-2.5">
          <MessageSquare className="w-6 h-6 -mt-1" />
          <span className="text-[10px]">消息</span>
        </div>
        <div className="flex flex-col items-center space-y-1 text-blue-500 font-medium cursor-pointer translate-y-2.5">
          <Layout className="w-6 h-6 -mt-1" />
          <span className="text-[10px]">工作台</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 cursor-pointer relative" onClick={onBackToAI}>
          <div className="flex flex-col items-center -translate-y-4">
            <div className="w-14 h-14 bg-white rounded-full shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center border border-gray-50 mb-1 mt-[1px] overflow-hidden">
              <img src="https://i.postimg.cc/QtcbS6b7/sheng-cheng-bu-men-ji-qi-ren-tu-biao-(11).png" alt="AI" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-1 text-gray-400 cursor-pointer translate-y-2.5">
          <Users className="w-6 h-6 -mt-1" />
          <span className="text-[10px]">通讯录</span>
        </div>
        <div className="flex flex-col items-center space-y-1 text-gray-400 cursor-pointer translate-y-2.5">
          <User className="w-6 h-6 -mt-1" />
          <span className="text-[10px]">我</span>
        </div>
      </nav>
    </div>
  );
};

const ChatView = ({ messages, onClose, onPullDown, currentRole, roles, isRoleDropdownOpen, setIsRoleDropdownOpen, setIsSidebarOpen, chatEndRef, activeAgent, onSelectAgent, isAgentDropdownOpen, setIsAgentDropdownOpen, onQuickAction }: any) => {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <header className="px-4 pt-5 pb-1 bg-[#3B82F6] sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-b-[28px] border-b border-white/10">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2 relative">
            <div className="flex items-center space-x-3">
              <IconButton className="!p-0" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-6 h-6 text-white" />
              </IconButton>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
              <div 
                className="flex items-center space-x-1 cursor-pointer active:opacity-70 transition-opacity"
                onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
              >
                <span className="text-white font-bold text-[16px] tracking-wide whitespace-nowrap">
                  {activeAgent?.name || '资产管理'}
                </span>
                <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${isAgentDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            <AnimatePresence>
              {isAgentDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-[40]" 
                    onClick={() => setIsAgentDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                    exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
                    className="absolute top-full left-1/2 mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-50 overflow-hidden py-2 z-[50]"
                  >
                    {AVATAR_LIST.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          onSelectAgent(agent);
                          setIsAgentDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${activeAgent?.id === agent.id ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          <AvatarIcon avatar={agent.avatar} name={agent.name} />
                        </div>
                        <span className={`text-sm font-medium flex-1 text-left ${activeAgent?.id === agent.id ? 'text-blue-600' : 'text-gray-700'}`}>
                          {agent.name}
                        </span>
                        {activeAgent?.id === agent.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <IconButton className="!p-0" onClick={onClose}>
              <X className="w-6 h-6 text-white" />
            </IconButton>
          </div>

          <div className="h-[1px] bg-white/10 w-full mb-1" />
          
          <div className="flex justify-center pb-2">
            <button 
              onClick={onPullDown}
              className="flex items-center space-x-1 text-white/60 text-[13px] font-medium active:scale-95 transition-transform py-1.5 px-6"
            >
              <span>下拉查看工作台</span>
              <ChevronsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-32 space-y-6 bg-[#F8F9FA] hide-scrollbar">
        {messages.map((msg: any, idx: number) => (
          <div key={idx} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} space-y-1`}>
            <span className="text-[10px] text-gray-400 px-2">{msg.time}</span>
            <div className={`flex items-start max-w-[90%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                msg.type === 'user' 
                  ? 'bg-gray-200 text-gray-800 rounded-tr-none' 
                  : 'bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100'
              }`}>
                {msg.type === 'ai' && (
                  <div className="flex items-center space-x-1 mb-2 text-gray-400 text-[12px]">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-emerald-500" strokeWidth={4} />
                    </div>
                    <span className="font-bold">{msg.status}</span>
                  </div>
                )}
                <div className="font-medium text-gray-700 markdown-body">
                  <Markdown>{msg.text}</Markdown>
                </div>
                {msg.isCustomerCard && (
                  <div className="mt-4">
                    <CustomerCard />
                  </div>
                )}
                {msg.type === 'ai' && (
                  <div className="flex items-center space-x-4 mt-4 pt-3 border-t border-gray-50">
                    <IconButton className="!p-0"><Copy className="w-4 h-4 text-gray-300" /></IconButton>
                    <IconButton className="!p-0"><ThumbsUp className="w-4 h-4 text-gray-300" /></IconButton>
                    <IconButton className="!p-0"><ThumbsDown className="w-4 h-4 text-gray-300" /></IconButton>
                    <div className="flex-1" />
                    <IconButton className="!p-0"><Share2 className="w-4 h-4 text-gray-300" /></IconButton>
                  </div>
                )}
              </div>
            </div>
            {msg.quickActions && (
              <div className="flex flex-col space-y-2 mt-2 w-full max-w-[85%]">
                {msg.quickActions.map((action: string, aIdx: number) => (
                  <button 
                    key={aIdx}
                    onClick={() => onQuickAction && onQuickAction(action)}
                    className="bg-white border border-gray-100 rounded-xl py-2.5 px-4 text-[13px] font-bold text-blue-600 flex items-center justify-between shadow-sm active:scale-95 transition-all"
                  >
                    <span>{action}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

const SelectionPopup = ({ isOpen, onClose, onSelect, title, items, positionClassName = "left-0", triangleLeft = "left-10" }: { isOpen: boolean, onClose: () => void, onSelect: (item: string) => void, title: string, items: { text: string, icon?: React.ReactNode }[], positionClassName?: string, triangleLeft?: string }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className={`absolute bottom-full mb-3 w-[260px] bg-white rounded-[20px] shadow-[0_15px_45px_rgba(0,0,0,0.12)] border border-gray-100/50 overflow-hidden z-[110] p-4 pointer-events-auto ${positionClassName}`}
        >
          <div className="flex justify-between items-center mb-3 px-0.5">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full" />
              <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">{title}</h3>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect(item.text);
                  onClose();
                }}
                className="w-full text-left text-[13px] text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all py-2 px-2.5 rounded-xl font-medium flex items-center group border border-transparent hover:border-blue-100/30"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-blue-100/50 flex items-center justify-center mr-2.5 transition-colors shrink-0">
                  {item.icon || <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-400" />}
                </div>
                <span className="flex-1 leading-tight line-clamp-1">{item.text}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all -mr-0.5" />
              </button>
            ))}
          </div>
          {/* Triangle pointer */}
          <div className={`absolute -bottom-2 ${triangleLeft} w-4 h-4 bg-white border-b border-r border-gray-100/50 rotate-45 shadow-[4px_4px_10px_rgba(0,0,0,0.02)]`} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const InputOverlay = ({ 
  isOpen, 
  onClose, 
  onSend, 
  inputValue, 
  setInputValue, 
  currentFooterRole, 
  setCurrentFooterRole,
  footerRoles, 
  isTaskPopupOpen, 
  setIsTaskPopupOpen, 
  isBusinessPopupOpen, 
  setIsBusinessPopupOpen, 
  isSummaryPopupOpen, 
  setIsSummaryPopupOpen, 
  activeAgent,
  onSelectAgent
}: any) => {
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [localRole, setLocalRole] = useState(currentFooterRole);

  useEffect(() => {
    if (isOpen) {
      setLocalRole(currentFooterRole);
    }
  }, [isOpen, currentFooterRole]);

  const handleKeyClick = (char: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5);
    }
    setInputValue((prev: string) => prev + char);
  };

  const handleDelete = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5);
    }
    setInputValue((prev: string) => prev.slice(0, -1));
  };

  const handleAction = (action: () => void) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    action();
  };

  const handleLocalSend = () => {
    if (!inputValue.trim()) return;
    
    const selectedAgent = AVATAR_LIST.find(a => a.name === localRole);
    if (selectedAgent) {
      onSelectAgent(selectedAgent);
      onSend(inputValue, selectedAgent);
    } else {
      setCurrentFooterRole(localRole);
      onSend(inputValue);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col max-w-md mx-auto"
        >
          {/* Transparent Background */}
          <div 
            className="absolute inset-0 bg-transparent" 
            onClick={() => {
              if (isTaskPopupOpen || isBusinessPopupOpen || isSummaryPopupOpen) {
                setIsTaskPopupOpen(false);
                setIsBusinessPopupOpen(false);
                setIsSummaryPopupOpen(false);
              } else {
                onClose();
              }
            }}
          />

          <div 
            className="flex-1 flex flex-col justify-end pb-0 relative z-10"
            onClick={() => {
              if (isTaskPopupOpen || isBusinessPopupOpen || isSummaryPopupOpen) {
                setIsTaskPopupOpen(false);
                setIsBusinessPopupOpen(false);
                setIsSummaryPopupOpen(false);
              } else {
                onClose();
              }
            }}
          >
             <div onClick={(e) => e.stopPropagation()} className="flex flex-col">
              {/* Quick Action Pills (Horizontal) */}
             <div className="flex items-center space-x-2 px-5 mb-1.5 relative">
               <div className="relative">
                 <SelectionPopup 
                   title="任务执行"
                   items={[
                     { text: "今天有哪些我的任务重点", icon: <Target className="w-4 h-4 text-emerald-500" /> },
                     { text: "输出路演准备清单", icon: <ClipboardList className="w-4 h-4 text-blue-500" /> },
                     { text: "帮我梳理今日客户触达重点", icon: <Users className="w-4 h-4 text-indigo-500" /> },
                     { text: "安排一场产品路演", icon: <Calendar className="w-4 h-4 text-orange-500" /> },
                     { text: "输出一份前端发起方案", icon: <Send className="w-4 h-4 text-rose-500" /> }
                   ]}
                   isOpen={isTaskPopupOpen} 
                   onClose={() => setIsTaskPopupOpen(false)} 
                   onSelect={(task) => setInputValue(task)} 
                   positionClassName="-left-4"
                    triangleLeft="left-14"
                 />
                 <button onClick={() => handleAction(() => { setIsBusinessPopupOpen(false); setIsSummaryPopupOpen(false); setIsTaskPopupOpen(true); })} className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white border border-blue-100 rounded-full shadow-sm active:scale-95 transition-all">
                   <List className="w-3.5 h-3.5 text-blue-500" strokeWidth={2.5} />
                   <span className="text-[12px] font-medium text-blue-600">任务执行</span>
                 </button>
               </div>

               <div className="relative">
                 <SelectionPopup 
                   title="我的业务"
                   items={[
                     { text: "机构客户适合什么资管方案", icon: <Briefcase className="w-4 h-4 text-emerald-500" /> },
                     { text: "先帮我梳理机构客户服务流程", icon: <Activity className="w-4 h-4 text-blue-500" /> },
                     { text: "给我一个定制化方案框架", icon: <Layout className="w-4 h-4 text-indigo-500" /> },
                     { text: "给我看最新净值波动", icon: <TrendingUp className="w-4 h-4 text-orange-500" /> },
                     { text: "推荐适合续投的产品", icon: <Star className="w-4 h-4 text-rose-500" /> },
                     { text: "高优先客户有哪些", icon: <UserCheck className="w-4 h-4 text-emerald-600" /> },
                     { text: "需要升级的客户", icon: <ArrowRight className="w-4 h-4 text-blue-600" /> }
                   ]}
                   isOpen={isBusinessPopupOpen} 
                   onClose={() => setIsBusinessPopupOpen(false)} 
                   onSelect={(item) => setInputValue(item)} 
                   positionClassName="-left-24"
                    triangleLeft="left-[120px]"
                 />
                 <button onClick={() => handleAction(() => { setIsTaskPopupOpen(false); setIsSummaryPopupOpen(false); setIsBusinessPopupOpen(true); })} className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white border border-purple-100 rounded-full shadow-sm active:scale-95 transition-all">
                   <Briefcase className="w-3.5 h-3.5 text-purple-500" strokeWidth={2.5} />
                   <span className="text-[12px] font-medium text-purple-600">我的业务</span>
                 </button>
               </div>

               <div className="relative">
                 <SelectionPopup 
                   title="工作总结"
                   items={[
                     { text: "当前主线项目进展", icon: <Activity className="w-4 h-4 text-blue-500" /> },
                     { text: "查看我的项目进度", icon: <PieChart className="w-4 h-4 text-emerald-500" /> },
                     { text: "本周客户触达计划", icon: <Calendar className="w-4 h-4 text-orange-500" /> }
                   ]}
                   isOpen={isSummaryPopupOpen} 
                   onClose={() => setIsSummaryPopupOpen(false)} 
                   onSelect={(item) => setInputValue(item)} 
                   positionClassName="-right-4"
                    triangleLeft="right-14"
                 />
                 <button onClick={() => handleAction(() => { setIsTaskPopupOpen(false); setIsBusinessPopupOpen(false); setIsSummaryPopupOpen(true); })} className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white border border-orange-100 rounded-full shadow-sm active:scale-95 transition-all">
                   <FileText className="w-3.5 h-3.5 text-orange-500" strokeWidth={2.5} />
                   <span className="text-[12px] font-medium text-orange-600">工作总结</span>
                 </button>
               </div>
             </div>

             {/* Input Bar */}
             <div className="px-5 mb-3">
                <div className="bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.1)] border border-gray-100 p-1 flex items-center relative">
                  <div className="relative">
                    <button 
                      onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                      className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 ml-1 flex-shrink-0 active:scale-95 transition-transform"
                    >
                      {(() => {
                        const role = footerRoles.find((r: any) => r.name === localRole);
                        if (role) {
                          return <AvatarIcon 
                            avatar={role.avatar} 
                            name={role.name} 
                            className={role.name === '资产管理' ? "w-[26px] h-[33px] object-contain" : "w-full h-full object-cover"} 
                          />;
                        }
                        return <AvatarIcon 
                          avatar={activeAgent?.avatar || AVATAR_LIST[0].avatar} 
                          name={activeAgent?.name || AVATAR_LIST[0].name} 
                          className={activeAgent?.name === '资产管理' || (!activeAgent && AVATAR_LIST[0].name === '资产管理') ? "w-[26px] h-[33px] object-contain" : "w-full h-full object-cover"}
                        />;
                      })()}
                    </button>

                    {/* Agent Dropdown in Input Overlay */}
                    <AnimatePresence>
                      {isAgentDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-[-1]" 
                            onClick={() => setIsAgentDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: -10, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="absolute bottom-full left-0 mb-4 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden py-2 z-[120]"
                          >
                            <div className="max-h-[300px] overflow-y-auto hide-scrollbar">
                              {footerRoles.map((role: any, index: number) => (
                                <React.Fragment key={role.name}>
                                  <button
                                    onClick={() => {
                                      setLocalRole(role.name);
                                      setIsAgentDropdownOpen(false);
                                      onSelectAgent(role, true);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors active:bg-gray-100"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                                        <AvatarIcon 
                                          avatar={role.avatar} 
                                          name={role.name} 
                                          className={role.name === '资产管理' ? "w-[26px] h-[33px] object-contain" : "w-full h-full object-cover"}
                                        />
                                      </div>
                                      <span className={`text-[14px] font-medium ${localRole === role.name ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {role.name}
                                      </span>
                                    </div>
                                    {localRole === role.name && (
                                      <Check className="w-4 h-4 text-orange-400" strokeWidth={3} />
                                    )}
                                  </button>
                                  {index < footerRoles.length - 1 && (
                                    <div className="mx-4 h-[1px] bg-gray-50" />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                            {/* Triangle pointer */}
                            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45" />
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  <input 
                    autoFocus
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="请输入问题" 
                    className="flex-1 bg-transparent text-[14px] outline-none px-3 text-gray-800 placeholder:text-gray-400 font-medium"
                  />

                  <div className="flex items-center space-x-2 pr-1">
                    <IconButton 
                      onClick={() => handleAction(handleLocalSend)}
                      className="w-9 h-9 rounded-full bg-[#3B82F6] shadow-sm !p-0 flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Send className="w-4.5 h-4.5 text-white" />
                    </IconButton>
                  </div>
                </div>
             </div>

             {/* Keyboard Simulation - Shrunk and Functional */}
             <div className="w-full bg-[#D1D5DB] rounded-t-2xl p-3 pb-6 space-y-3">
                <div className="flex justify-between px-2">
                   {['我', '你', '好', '嗯', '对', '不', '那', '行'].map(char => (
                     <button 
                       key={char} 
                       onClick={() => handleKeyClick(char)}
                       className="text-gray-800 font-bold text-[16px] active:scale-90 transition-transform"
                     >
                       {char}
                     </button>
                   ))}
                   <ChevronDown className="w-5 h-5 text-gray-600" />
                </div>
                
                <div className="grid grid-cols-10 gap-1">
                   {/* Row 1 */}
                   <button onClick={() => handleKeyClick('123')} className="col-span-2 bg-[#9CA3AF] h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 active:bg-[#8B939F] transition-colors">123</button>
                   <button onClick={() => handleKeyClick('.')} className="col-span-2 bg-white h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-gray-100 transition-colors">.,?!</button>
                   <button onClick={() => handleKeyClick('ABC')} className="col-span-2 bg-white h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-gray-100 transition-colors">ABC</button>
                   <button onClick={() => handleKeyClick('DEF')} className="col-span-2 bg-white h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-gray-100 transition-colors">DEF</button>
                   <button 
                     onClick={handleDelete}
                     className="col-span-2 bg-[#9CA3AF] h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-[#8B939F] transition-colors"
                   >
                     <X className="w-4 h-4" />
                   </button>

                   {/* Row 2 */}
                   <button onClick={() => handleKeyClick('#')} className="col-span-2 bg-[#9CA3AF] h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 active:bg-[#8B939F] transition-colors">#@¥</button>
                   <button onClick={() => handleKeyClick('GHI')} className="col-span-2 bg-white h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-gray-100 transition-colors">GHI</button>
                   <button onClick={() => handleKeyClick('JKL')} className="col-span-2 bg-white h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-gray-100 transition-colors">JKL</button>
                   <button onClick={() => handleKeyClick('MNO')} className="col-span-2 bg-white h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-gray-100 transition-colors">MNO</button>
                   <button onClick={() => handleKeyClick('^')} className="col-span-2 bg-[#9CA3AF] h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-[#8B939F] transition-colors">^^</button>

                   {/* Row 3 & 4 with Row Span */}
                   <button onClick={() => handleKeyClick('ABC')} className="col-span-2 bg-[#9CA3AF] h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 active:bg-[#8B939F] transition-colors">ABC</button>
                   <button onClick={() => handleKeyClick('PQRS')} className="col-span-2 bg-white h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-gray-100 transition-colors">PQRS</button>
                   <button onClick={() => handleKeyClick('TUV')} className="col-span-2 bg-white h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-gray-100 transition-colors">TUV</button>
                   <button onClick={() => handleKeyClick('WXYZ')} className="col-span-2 bg-white h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-gray-100 transition-colors">WXYZ</button>
                   
                   <button 
                     onClick={() => handleAction(handleLocalSend)}
                     className="col-span-2 row-span-2 bg-[#9CA3AF] rounded-md flex items-center justify-center text-[14px] font-bold text-gray-800 shadow-sm active:bg-[#8B939F] active:scale-95 transition-all"
                   >
                     换行
                   </button>

                   {/* Row 4 (remaining buttons) */}
                   <button onClick={() => handleKeyClick('😊')} className="col-span-2 bg-[#9CA3AF] h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 active:bg-[#8B939F] transition-colors">😊</button>
                   <button onClick={() => handleKeyClick('拼音')} className="col-span-2 bg-white h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-gray-100 transition-colors">选拼音</button>
                   <button 
                     onClick={() => handleKeyClick(' ')}
                     className="col-span-4 bg-white h-10 rounded-md flex items-center justify-center text-[14px] font-medium text-gray-800 shadow-sm active:bg-gray-100 transition-colors"
                   >
                     空格
                   </button>
                </div>

                <div className="flex justify-between items-center px-6 pt-1">
                   <Globe className="w-6 h-6 text-gray-600 active:scale-90 transition-transform" />
                   <Mic className="w-6 h-6 text-gray-600 active:scale-90 transition-transform" />
                </div>
             </div>
          </div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

const AvatarIcon = ({ avatar, name, className = "w-full h-full object-cover" }: { avatar: string, name: string, className?: string }) => {
  if (avatar === 'ai-assistant-special') {
    return (
      <img 
        src="https://i.postimg.cc/QtcbS6b7/sheng-cheng-bu-men-ji-qi-ren-tu-biao-(11).png" 
        alt={name} 
        className={className} 
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <img 
      src={avatar} 
      alt={name} 
      className={className} 
      referrerPolicy="no-referrer"
    />
  );
};

const AvatarCarousel = ({ items, onSelectAgent }: { items: any[], onSelectAgent?: (agent: any) => void }) => {
  const aiAssistant = items.find(item => item.id === 0);
  const otherItems = items.filter(item => item.id !== 0);

  return (
    <div className="flex items-start px-6 overflow-hidden">
      {/* Fixed AI Assistant */}
      {aiAssistant && (
        <div 
          onClick={() => onSelectAgent?.(aiAssistant)}
          className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer mr-5 py-2"
        >
          <div className="flex items-center justify-center h-[66px]">
             <AvatarIcon 
               avatar={aiAssistant.avatar} 
               name={aiAssistant.name} 
               className="w-[64px] h-[64px] object-contain"
             />
          </div>
          <span className="text-[12px] font-bold text-gray-900 tracking-tight">{aiAssistant.name}</span>
        </div>
      )}

      {/* Draggable Others */}
      <div className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing">
        <motion.div 
          drag="x"
          dragConstraints={{ right: 0, left: -((otherItems.length * 84) - 260) }}
          className="flex space-x-5 py-2"
        >
          {otherItems.map((item) => (
            <motion.div 
              key={item.id} 
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectAgent?.(item)}
              className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
            >
              <div className="flex items-center justify-center h-[66px]">
                <AvatarIcon 
                  avatar={item.avatar} 
                  name={item.name} 
                  className={item.name === '资产管理' ? "w-[40px] h-[52px] object-contain" : "w-[48px] h-[48px] object-contain"}
                />
              </div>
              <span className="text-[12px] font-bold text-gray-600 tracking-tight">{item.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const IconButton = ({ children, onClick, className = "" }: { children?: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button 
    onClick={onClick}
    className={`p-2 active:scale-95 transition-transform duration-100 flex items-center justify-center ${className}`}
  >
    {children}
  </button>
);

// --- Generic 3D Carousel Card Component ---

interface CarouselCardProps extends CarouselItem {
  isActive: boolean;
  position: number;
  onClick: () => void;
  onButtonClick?: () => void;
}

const CarouselCard: React.FC<CarouselCardProps> = ({ 
  title, 
  titlePrefix,
  subTitle,
  contentBody, 
  imageUrl,
  listItems,
  bubbleItems,
  type,
  isActive, 
  position,
  buttonText = "订阅",
  buttonIcon,
  onClick,
  onButtonClick
}) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    top: '4%', 
    left: '20%', 
    width: '60%', 
    height: '92%', 
    
    transform: `
      translateX(${position * 48}%) 
      translateZ(${isActive ? 0 : -180}px) 
      rotateY(${position * -25}deg)
      rotateZ(${position * 6}deg)
      scale(${isActive ? 1 : 0.88})
    `,
    
    zIndex: isActive ? 10 : 5,
    opacity: isActive ? 1 : 0.8,
    filter: isActive ? 'none' : 'blur(0.4px)',
    
    // 优化：更快的 transition，更有活力的贝塞尔曲线
    transition: 'all 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    cursor: 'pointer',
    pointerEvents: isActive ? 'auto' : 'none',
    transformOrigin: 'center center',
    willChange: 'transform, opacity',
  };

  return (
    <div style={style} onClick={onClick} className="select-none">
      <div className={`
        h-full bg-white rounded-[24px] p-3.5 flex flex-col
        shadow-[0_15px_40px_rgba(0,0,0,0.14)] border border-gray-100/40
      `}>
        <div className="flex items-center space-x-1.5 mb-2.5 border-l-[3px] border-black pl-2.5 h-3.5">
          {titlePrefix && <span className="text-[11px] font-black text-[#5C89F3] italic whitespace-nowrap">{titlePrefix}</span>}
          <h3 className="text-[11px] font-bold text-gray-900 tracking-tight truncate leading-none">{title}</h3>
        </div>
        
        <div className={`
          flex-1 rounded-[16px] p-2 flex flex-col min-h-0
          ${type === 'knowledge' ? 'bg-[#FFE9E1]' : 
            (type === 'poster' || type === 'project-list' || type === 'bubble-list') ? 'bg-[#E3F2FD]' : 'bg-[#F1F8EB]'}
        `}>
          <div className="bg-white rounded-[12px] p-2 shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-white h-full relative flex flex-col overflow-hidden">
            
            {type === 'project-list' && listItems && (
              <div className="flex flex-col space-y-1 py-0.5 px-0.5">
                {listItems.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-[10px] p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-50 flex items-start space-x-2">
                    <div className="w-3.5 h-3.5 rounded-full border border-gray-200 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      {item.label && <p className="text-[9px] font-black text-blue-500 italic leading-none">{item.label}</p>}
                      <p className="text-[8px] text-gray-500 font-medium mt-0.5 leading-tight">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {type === 'bubble-list' && bubbleItems && (
              <div className="flex flex-col h-full items-center justify-center space-y-[-8px] relative">
                {bubbleItems.map((bubble, idx) => (
                  <div 
                    key={idx} 
                    className={`
                      px-3 py-2 rounded-full shadow-md text-center max-w-[95%] transform
                      ${idx === 0 ? '-rotate-2 z-30' : idx === 1 ? 'rotate-3 z-20' : '-rotate-1 z-10'}
                    `}
                    style={{ backgroundColor: bubble.color }}
                  >
                    <p className={`text-[8.5px] font-bold leading-tight ${bubble.textColor}`}>
                      {bubble.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {type === 'knowledge' && (
              <div className="flex flex-col h-full px-2 py-1">
                <h4 className="text-[10px] font-bold text-gray-700 text-center mt-1 mb-1">{subTitle}</h4>
                <div className="w-full h-[0.5px] bg-gray-100 mb-2" />
                <p className="text-[8.5px] leading-relaxed text-gray-500 font-medium text-justify">
                  {contentBody}
                </p>
              </div>
            )}

            {type === 'poster' && (
              <div className="flex flex-col h-full relative">
                {imageUrl ? (
                  <div className="h-full w-full flex items-center justify-center p-2 bg-gradient-to-tr from-[#E3F2FD] to-white/50">
                    <img 
                      src={imageUrl} 
                      alt="Product" 
                      decoding="async"
                      className="max-h-[95%] max-w-[95%] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)]" 
                    />
                  </div>
                ) : (
                  <div className="flex flex-col h-full justify-center relative px-2">
                    <Quote className="w-4 h-4 text-blue-100 mb-1 fill-current opacity-60 absolute top-1 left-2" />
                    <p className="text-[8.5px] leading-relaxed text-gray-500 font-bold text-justify px-1 z-10">
                      {contentBody}
                    </p>
                    <Quote className="w-4 h-4 text-blue-100 rotate-180 fill-current opacity-60 absolute bottom-1 right-2" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2.5 px-0.5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onButtonClick?.();
            }}
            className="w-full bg-[#F7F8F9] border border-gray-100 py-2 rounded-[16px] flex items-center justify-center space-x-1.5 active:scale-95 transition-transform shadow-sm"
          >
            <div className={`
               rounded-full p-1 shadow-sm flex items-center justify-center
               ${type === 'project-list' || type === 'bubble-list' ? 'bg-[#5C89F3]' : 'bg-[#FF5722]'}
            `}>
              {buttonIcon || <AlarmClock className="w-2.5 h-2.5 text-white fill-current" />}
            </div>
            <span className="text-[12px] font-bold text-gray-600">{buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Carousel Logic ---

const MasonryCard = ({ item, onSelectAgent }: { item: any, onSelectAgent?: (agent: any) => void }) => {
  const agent = AVATAR_LIST.find(a => a.name === item.category);
  const avatar = agent?.avatar;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col"
    >
      {/* Header Icon/Category */}
      <div className="flex items-center space-x-2 mb-2">
        {avatar ? (
          <img src={avatar} alt={item.category} className="w-6 h-6 rounded-full object-cover shadow-sm border border-gray-100" referrerPolicy="no-referrer" />
        ) : item.icon ? (
          <div className={`w-6 h-6 rounded-lg ${item.iconBg} flex items-center justify-center shadow-sm`}>
             {React.cloneElement(item.icon as React.ReactElement, { size: 12, className: "text-white" } as any)}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
            <Building2 className="w-3 h-3 text-gray-400" />
          </div>
        )}
        <span className="text-gray-400 font-bold text-[10px]">{item.category}</span>
      </div>

      {/* Title */}
      <h3 className="text-[14px] font-black text-gray-900 leading-tight mb-1.5 line-clamp-2">{item.title}</h3>

      {/* Tags */}
      {item.tags && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.tags.slice(0, 3).map((tag: string, tIdx: number) => (
            <span key={tIdx} className="px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-[8px] font-bold text-gray-400">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3 font-medium mb-3">
        {item.description}
      </p>

      {/* AI Assistant Section (Simplified for Masonry) */}
      {item.aiAssistant && (
        <div className="bg-[#F8FBFF] rounded-xl p-2 border border-blue-50/50 mb-2">
          <div className="flex items-center space-x-1 mb-1">
            <Sparkles className="w-2.5 h-2.5 text-blue-400" />
            <span className="text-[9px] font-bold text-gray-400">AI建议:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {item.aiAssistant.actions.map((action: string, aIdx: number) => (
              <div key={aIdx} className="flex items-center space-x-1 bg-white px-1.5 py-0.5 rounded-full border border-blue-100">
                <Check className="w-2 h-2 text-green-500" />
                <span className="text-[8px] font-bold text-green-600">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps (Simplified for Masonry) */}
      {item.steps && (
        <div className="space-y-1.5 mb-3">
          {item.steps.slice(0, 4).map((step: any, sIdx: number) => (
            <div key={sIdx} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${step.status === 'completed' ? 'bg-green-500' : step.status === 'current' ? 'bg-blue-500' : 'bg-gray-200'}`} />
                <span className={`text-[9px] font-bold truncate ${step.status === 'pending' ? 'text-gray-300' : 'text-gray-600'}`}>{step.label}</span>
              </div>
              {step.file && (
                <div className="flex items-center space-x-0.5 bg-gray-50 px-1 py-0.5 rounded border border-gray-100 flex-shrink-0 ml-1">
                  <FileText className="w-2 h-2 text-blue-400" />
                  <span className="text-[7px] font-bold text-blue-400 truncate max-w-[40px]">{step.file}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-auto">
        <button 
          onClick={() => onSelectAgent?.({ id: item.id, name: item.category })}
          className={`w-full py-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1 active:scale-95 transition-transform ${item.buttonBg || 'bg-gray-50'} ${item.accentColor || 'text-gray-600'}`}
        >
          <span>{item.actionText}</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

const MasonryTasks = ({ items, onSelectAgent }: { items: any[], onSelectAgent?: (agent: any) => void }) => {
  const leftColumn = items.filter((_, i) => i % 2 === 0);
  const rightColumn = items.filter((_, i) => i % 2 !== 0);

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-4">
      <div className="flex flex-col gap-3">
        {leftColumn.map((item) => (
          <MasonryCard key={item.id} item={item} onSelectAgent={onSelectAgent} />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {rightColumn.map((item) => (
          <MasonryCard key={item.id} item={item} onSelectAgent={onSelectAgent} />
        ))}
      </div>
    </div>
  );
};

const HorizontalCarousel = ({ items }: { items: any[] }) => {
  return (
    <div className="overflow-hidden cursor-grab active:cursor-grabbing px-1">
      <motion.div 
        drag="x"
        dragConstraints={{ right: 0, left: -((items.length * 280) - 340) }}
        className="flex space-x-4 py-2"
      >
        {items.map((item, idx) => {
          const agent = AVATAR_LIST.find(a => a.name === item.category);
          const avatar = agent?.avatar;
          
          return (
            <div key={idx} className={`flex-shrink-0 w-[280px] ${item.color} rounded-[24px] p-4 border border-gray-100 shadow-lg relative flex flex-col`}>
               {/* Header */}
               <div className="flex items-center space-x-2 mb-3">
                  {avatar ? (
                    <img src={avatar} alt={item.category} className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-100" referrerPolicy="no-referrer" />
                  ) : item.icon ? (
                    <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center shadow-sm`}>
                      {item.icon}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                      <Building2 className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <span className="text-gray-600 font-bold text-[13px]">{item.category}</span>
               </div>

             {/* Title & Description */}
             <div className="flex flex-col space-y-2 mb-3">
                <h3 className="text-[17px] font-black text-gray-900 leading-tight tracking-tight">{item.title}</h3>
                
                {item.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {item.tags.map((tag: string, tIdx: number) => (
                      <span key={tIdx} className="px-2.5 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold text-gray-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-3 font-medium">
                  {item.description}
                </p>
             </div>

             {/* Steps or AI Section */}
             <div className="flex-1">
                {item.aiAssistant && (
                  <div className="bg-[#F8FBFF] rounded-[18px] p-3 border border-blue-50/50 mb-3">
                    <div className="flex items-center space-x-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[11px] font-bold text-gray-400">{item.aiAssistant.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.aiAssistant.actions.map((action: string, aIdx: number) => (
                        <div key={aIdx} className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-full border border-blue-100 shadow-sm">
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-[10px] font-bold text-green-600">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.steps && (
                  <div className="space-y-3 mb-4 pl-1">
                    {item.steps.map((step: any, sIdx: number) => (
                      <div key={sIdx} className="flex items-start space-x-3 relative">
                        {sIdx !== item.steps.length - 1 && (
                          <div className="absolute left-[5px] top-[14px] w-[1px] h-[calc(100%+4px)] bg-gray-100" />
                        )}
                        <div className={`
                          w-[11px] h-[11px] rounded-full mt-1 z-10 border-2 border-white shadow-sm
                          ${step.status === 'completed' ? 'bg-green-500' : 
                            step.status === 'current' ? 'bg-blue-500 ring-4 ring-blue-50' : 'bg-gray-200'}
                        `} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-bold ${step.status === 'pending' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {step.label}
                            </span>
                            {step.file && (
                              <div className="flex items-center space-x-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                <FileText className="w-2.5 h-2.5 text-blue-400" />
                                <span className="text-[8px] font-bold text-blue-400 truncate max-w-[60px]">{step.file}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[9px] text-gray-400 font-medium leading-none mt-0.5">{step.subLabel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             {/* Footer Action */}
             <div className="mt-auto pt-2">
                <button className={`
                  w-full py-2.5 rounded-[16px] font-black text-[13px] flex items-center justify-center space-x-2 transition-all active:scale-[0.98]
                  ${item.type === 'asset-management' ? 'text-blue-600 bg-transparent justify-end' : 'bg-[#FDF2F2] text-red-500'}
                `}>
                  <span>{item.actionText}</span>
                  {item.type === 'asset-management' ? <ArrowRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
             </div>
           </div>
          );
        })}
      </motion.div>
    </div>
  );
};

const StackedCarousel = ({ items, defaultIndex = 0, onButtonClick }: { items: CarouselItem[], defaultIndex?: number, onButtonClick?: (item: CarouselItem) => void }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const startX = useRef(0);

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    startX.current = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
  };

  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    const endX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = startX.current - endX;

    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        setActiveIndex((prev) => (prev + 1) % items.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      }
    }
  };

  const renderedItems = useMemo(() => {
    return items.map((item, idx) => {
      let position = idx - activeIndex;
      if (position > 1) position -= items.length;
      else if (position < -1) position += items.length;

      return (
        <CarouselCard 
          key={item.id}
          position={position}
          isActive={idx === activeIndex}
          onClick={() => setActiveIndex(idx)}
          onButtonClick={() => onButtonClick?.(item)}
          {...item}
        />
      );
    });
  }, [items, activeIndex, onButtonClick]);

  return (
    <div className="relative h-[280px] w-full flex items-center justify-center overflow-visible">
      <div 
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        className="relative w-full h-full cursor-grab active:cursor-grabbing touch-pan-y"
        style={{ 
          perspective: '1200px', 
          transformStyle: 'preserve-3d' 
        }}
      >
        {renderedItems}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    { 
      id: '1', 
      title: '今日A股市场深度分析报告', 
      timestamp: new Date(), 
      messageCount: 1,
      messages: [
        { id: 1, type: 'user', text: '今日A股市场深度分析报告', time: '15:34:00' },
        { id: 2, type: 'ai', text: '今日A股三大指数集体走强，沪指重返3000点上方。成交额突破万亿，北向资金净流入超百亿。建议关注半导体及低空经济板块。', time: '15:35:00', status: '回答完成' }
      ]
    },
    { 
      id: '2', 
      title: '科创板新股申购策略建议', 
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 
      messageCount: 2,
      messages: [
        { id: 1, type: 'user', text: '科创板新股申购策略建议', time: '15:34:00' },
        { id: 2, type: 'ai', text: '近期科创板打新收益率有所回升。建议重点关注具有硬科技属性、估值合理的标的。同时注意上市首日的波动风险。', time: '15:36:00', status: '回答完成' }
      ]
    },
    { 
      id: '3', 
      title: '关于量化交易系统的开发需求', 
      timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), 
      messageCount: 5,
      messages: [
        { id: 1, type: 'user', text: '关于量化交易系统的开发需求', time: '10:00:00' },
        { id: 2, type: 'ai', text: '已为您整理系统需求文档。核心模块包括：实时行情接入、策略回测引擎、风险控制系统以及极速报盘接口。', time: '10:05:00', status: '回答完成' }
      ]
    },
  ]);

  const [isAssetAgentActive, setIsAssetAgentActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isWorkbenchActive, setIsWorkbenchActive] = useState(false);
  const [isRecommendOpen, setIsRecommendOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState('个人');
  const [isFooterRoleOpen, setIsFooterRoleOpen] = useState(false);
  const [currentFooterRole, setCurrentFooterRole] = useState('资产管理');
  const [isInputActive, setIsInputActive] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isProjectCreated, setIsProjectCreated] = useState(false);
  const [isProjectHistoryOpen, setIsProjectHistoryOpen] = useState(false);
  const [projectHistoryList, setProjectHistoryList] = useState<any[]>([
    {
      id: 'mock-private-bank',
      title: "高净值客户 成为私行会员",
      subTitle: "年度VIP客户定制项目",
      completed: true,
      tasks: [
        { id: 1, title: "评估", desc: "对客户名下资产进行全面梳理与风险承受能力评估", completed: false },
        { id: 2, title: "准入", desc: "提交私行客户准入申请，完成合格投资者认定", completed: false },
        { id: 3, title: "配置", desc: "制定专属资产配置方案，涵盖权益、固收及另类投资", completed: false },
      ],
      createdAt: new Date()
    },
    {
      id: 'mock-quant',
      title: "机构投资者 开通量化交易",
      subTitle: "",
      completed: true,
      tasks: [
        { id: 1, title: "", desc: "申请极速交易席位，完成系统联调测试", completed: true },
        { id: 2, title: "", desc: "接入实时行情API，部署风控策略模块", completed: true },
        { id: 3, title: "", desc: "实盘运行监控，根据市场波动优化算法参数", completed: false },
      ],
      createdAt: new Date(Date.now() - 86400000)
    }
  ]);
  const [activeTasks, setActiveTasks] = useState(ACTIVE_TASKS);
  const [projectData, setProjectData] = useState<any>({
    id: 'initial-project',
    title: "机构投资者 开通量化交易",
    subTitle: "",
    completed: false,
    tasks: [
      { id: 1, title: "", desc: "申请极速交易席位，完成系统联调测试", completed: false },
      { id: 2, title: "", desc: "接入实时行情API，部署风控策略模块", completed: false },
      { id: 3, title: "", desc: "实盘运行监控，根据市场波动优化算法参数", completed: false },
    ]
  });
  const [isTaskPopupOpen, setIsTaskPopupOpen] = useState(false);
  const [isBusinessPopupOpen, setIsBusinessPopupOpen] = useState(false);
  const [isSummaryPopupOpen, setIsSummaryPopupOpen] = useState(false);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const roles = [
    { name: '个人', icon: User },
    { name: '机构', icon: Building2 },
    { name: '企业', icon: Briefcase },
    { name: '同业', icon: Globe },
  ];

  const footerRoles = AVATAR_LIST.map(agent => ({
    id: agent.id,
    name: agent.name,
    avatar: agent.avatar,
  }));

  const products = [
    {
      id: 1,
      name: "华创稳赢",
      desc: "固收+增强型理财",
      image: "https://images.unsplash.com/photo-1611974717483-5828d116bd85?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "中证500ETF",
      desc: "紧跟中盘蓝筹表现",
      image: "https://images.unsplash.com/photo-1611974717483-5828d116bd85?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "科创精选",
      desc: "掘金硬科技成长股",
      image: "https://images.unsplash.com/photo-1611974717483-5828d116bd85?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 4,
      name: "纳指100",
      desc: "布局全球科技巨头",
      image: "https://images.unsplash.com/photo-1611974717483-5828d116bd85?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 5,
      name: "黄金ETF",
      desc: "避险资产首选配置",
      image: "https://images.unsplash.com/photo-1611974717483-5828d116bd85?q=80&w=200&auto=format&fit=crop"
    }
  ];

  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [activeAgent, setActiveAgent] = useState<any | null>(null);
  const [agentChats, setAgentChats] = useState<{ [key: string]: any[] }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSelectAgent = (agent: any, isPreview: boolean = false, source: string = 'other') => {
    if (agent.id !== 1 && typeof agent.id === 'number') {
      setToastMessage('正在建设中，敬请期待');
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }
    
    if (isPreview) {
      setActiveAgent(agent);
      setCurrentFooterRole(agent.name);
      return;
    }

    if (agent.id === 1 && source === 'carousel') {
      setIsAssetAgentActive(true);
      return;
    }
    
    setActiveAgent(agent);
    setCurrentFooterRole(agent.name);
    setIsChatActive(true);
    // If this agent doesn't have a chat history yet, initialize it
    if (!agentChats[agent.id]) {
      setAgentChats(prev => ({ ...prev, [agent.id]: [] }));
    }

    // Special case for task-1: auto-send "查看客户详情"
    if (agent.id === 'task-1') {
      setTimeout(() => {
        handleSend("查看客户详情", agent);
      }, 100);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatActive) {
      scrollToBottom();
    }
  }, [chatMessages, isChatActive]);

  const handleSend = async (text?: string, agentOverride?: any) => {
    const messageText = text || inputValue;
    const currentAgent = agentOverride || activeAgent;
    
    if (currentAgent?.id !== 1 && typeof currentAgent?.id === 'number') {
      setToastMessage('正在建设中，敬请期待');
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }
    
    if (messageText.trim()) {
      const userMessageText = messageText;
      const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      
      const userMessage = {
        id: Date.now(),
        type: 'user',
        text: userMessageText,
        time: time,
      };
      
      if (currentAgent) {
        setAgentChats(prev => ({
          ...prev,
          [currentAgent.id]: [...(prev[currentAgent.id] || []), userMessage]
        }));
      } else {
        setChatMessages(prev => [...prev, userMessage]);
      }

      if (!text) setInputValue('');
      setIsInputActive(false);
      setIsChatActive(true);

      // Special case for "确认接收需求" - return mock response
      if (userMessageText === "确认接收需求") {
        const aiMessageId = Date.now() + 1;
        const aiMessage = {
          id: aiMessageId,
          type: 'ai',
          text: '已为您完成业务立项，当前进入「准备材料」阶段。建议您生成路演方案后尽快安排客户拜访，或先联系内部对接人了解客户背景。',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          status: '回答完成',
          quickActions: ["生成路演方案", "联系内部对接人"]
        };
        
        setTimeout(() => {
          if (currentAgent) {
            setAgentChats(prev => ({
              ...prev,
              [currentAgent.id]: [...(prev[currentAgent.id] || []), aiMessage]
            }));
          } else {
            setChatMessages(prev => [...prev, aiMessage]);
          }
        }, 500);
        return;
      }

      // Special case for "查看客户详情" - return mock card response
      if (userMessageText === "查看客户详情") {
        const aiMessageId = Date.now() + 1;
        const aiMessage = {
          id: aiMessageId,
          type: 'ai',
          text: '好的，这是该客户的信息及调研报告。请阅读后点击「确认接收需求」立项跟踪，或联系内部对接人了解更多情况。',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          status: '回答完成',
          isCustomerCard: true,
          quickActions: ["确认接收需求", "联系内部联系人"]
        };
        
        setTimeout(() => {
          if (currentAgent) {
            setAgentChats(prev => ({
              ...prev,
              [currentAgent.id]: [...(prev[currentAgent.id] || []), aiMessage]
            }));
          } else {
            setChatMessages(prev => [...prev, aiMessage]);
          }
        }, 500);
        return;
      }

      // Update history (only for main chat for now)
      if (!currentAgent) {
        if (chatMessages.length === 0) {
          const newHistoryItem: ChatHistoryItem = {
            id: Date.now().toString(),
            title: userMessageText.slice(0, 20),
            timestamp: new Date(),
            messageCount: 1,
            messages: [userMessage]
          };
          setChatHistory([newHistoryItem, ...chatHistory]);
        } else {
          setChatHistory(chatHistory.map((h, i) => i === 0 ? { 
            ...h, 
            messageCount: h.messageCount + 1, 
            timestamp: new Date(),
            messages: [...h.messages, userMessage]
          } : h));
        }
      }

      // AI Response
      const aiMessageId = Date.now() + 1;
      const aiMessage = {
        id: aiMessageId,
        type: 'ai',
        text: '',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        status: '正在思考...'
      };
      
      if (activeAgent) {
        setAgentChats(prev => ({
          ...prev,
          [activeAgent.id]: [...(prev[activeAgent.id] || []), aiMessage]
        }));
      } else {
        setChatMessages(prev => [...prev, aiMessage]);
      }

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContentStream({
          model: "gemini-3-flash-preview",
          contents: userMessageText,
          config: {
            systemInstruction: activeAgent 
              ? `你是一个专业的智能体，名叫'${activeAgent.name}'。请根据你的身份为用户提供专业的建议和帮助。`
              : "你是一个专业的证券公司智能助手，名叫'证券通'。你精通证券市场、金融产品、投资策略和客户资产管理。请用专业、严谨且高效的语气回答用户的问题。如果用户提到具体的股票、基金或行业板块，请提供相关的市场分析和合规建议。",
          }
        });

        let fullText = '';
        for await (const chunk of response) {
          const chunkText = chunk.text;
          if (chunkText) {
            fullText += chunkText;
            if (activeAgent) {
              setAgentChats(prev => ({
                ...prev,
                [activeAgent.id]: prev[activeAgent.id].map(msg => 
                  msg.id === aiMessageId ? { ...msg, text: fullText, status: '正在回答...' } : msg
                )
              }));
            } else {
              setChatMessages(prev => {
                const newMessages = prev.map(msg => 
                  msg.id === aiMessageId ? { ...msg, text: fullText, status: '正在回答...' } : msg
                );
                setChatHistory(history => history.map((h, i) => i === 0 ? { ...h, messages: newMessages } : h));
                return newMessages;
              });
            }
          }
        }
        
        if (activeAgent) {
          setAgentChats(prev => ({
            ...prev,
            [activeAgent.id]: prev[activeAgent.id].map(msg => 
              msg.id === aiMessageId ? { ...msg, status: '回答完成' } : msg
            )
          }));
        } else {
          setChatMessages(prev => {
            const newMessages = prev.map(msg => 
              msg.id === aiMessageId ? { ...msg, status: '回答完成' } : msg
            );
            setChatHistory(history => history.map((h, i) => i === 0 ? { ...h, messages: newMessages } : h));
            return newMessages;
          });
        }
      } catch (error) {
        console.error("Gemini API Error:", error);
        if (activeAgent) {
          setAgentChats(prev => ({
            ...prev,
            [activeAgent.id]: prev[activeAgent.id].map(msg => 
              msg.id === aiMessageId ? { ...msg, text: '抱歉，我现在无法回答您的问题。请稍后再试。', status: '回答失败' } : msg
            )
          }));
        } else {
          setChatMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: '抱歉，我现在无法回答您的问题。请稍后再试。', status: '回答失败' } : msg
          ));
        }
      }
    }
  };

  const handleNewChat = () => {
    setIsChatActive(true);
    setIsSidebarOpen(false);
    setChatMessages([]);
  };

  const toggleProjectTask = (projectId: string, taskId: number) => {
    setProjectHistoryList(prev => prev.map(p => {
      if (p.id === projectId) {
        const newTasks = p.tasks.map((t: any) => t.id === taskId ? { ...t, completed: !t.completed } : t);
        const allTasksCompleted = newTasks.every((t: any) => t.completed);
        const updated = { ...p, tasks: newTasks, completed: allTasksCompleted };
        
        // If this is the active workbench project, update it too
        if (isProjectCreated && projectData.id === projectId) {
          setProjectData(updated);
          if (allTasksCompleted) {
            setIsProjectCreated(false);
          }
        }
        
        return updated;
      }
      return p;
    }));
  };

  const toggleProjectMain = (projectId: string) => {
    setProjectHistoryList(prev => prev.map(p => {
      if (p.id === projectId) {
        const newCompleted = !p.completed;
        // Manual selection of main checkbox should not automatically mark sub-tasks as completed
        const updated = { ...p, completed: newCompleted };

        if (isProjectCreated && projectData.id === projectId) {
          setProjectData(updated);
          if (newCompleted) {
            setIsProjectCreated(false);
          }
        }

        return updated;
      }
      return p;
    }));
  };

  const handleRenameChat = (item: ChatHistoryItem) => {
    const newTitle = prompt('请输入新名称', item.title);
    if (newTitle) {
      setChatHistory(chatHistory.map(h => h.id === item.id ? { ...h, title: newTitle } : h));
    }
  };

  const handlePinChat = (item: ChatHistoryItem) => {
    setChatHistory(chatHistory.map(h => h.id === item.id ? { ...h, isPinned: !h.isPinned } : h));
  };

  const handleDeleteChat = (item: ChatHistoryItem) => {
    if (confirm('确定删除该对话记录吗？')) {
      setChatHistory(chatHistory.filter(h => h.id !== item.id));
    }
  };

  const handleSelectChat = (item: ChatHistoryItem) => {
    setIsChatActive(true);
    setIsSidebarOpen(false);
    // Restore messages from history
    setChatMessages(item.messages);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] max-w-md mx-auto relative overflow-hidden font-sans select-none antialiased">
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        history={chatHistory}
        onNewChat={handleNewChat}
        onRename={handleRenameChat}
        onPin={handlePinChat}
        onDelete={handleDeleteChat}
        onSelect={handleSelectChat}
      />

      <AnimatePresence>
        {isChatActive && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-[55] bg-white flex flex-col"
          >
            <ChatView 
              messages={activeAgent ? (agentChats[activeAgent.id] || []) : chatMessages} 
              onClose={() => {
                setIsChatActive(false);
                setActiveAgent(null);
                setIsWorkbenchActive(true);
              }} 
              onPullDown={() => {
                setIsChatActive(false);
                setActiveAgent(null);
                setIsWorkbenchActive(false);
              }}
              activeAgent={activeAgent}
              onSelectAgent={handleSelectAgent}
              isAgentDropdownOpen={isAgentDropdownOpen}
              setIsAgentDropdownOpen={setIsAgentDropdownOpen}
              currentRole={currentRole}
              roles={roles}
              isRoleDropdownOpen={isRoleDropdownOpen}
              setIsRoleDropdownOpen={setIsRoleDropdownOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              chatEndRef={chatEndRef}
              onQuickAction={(action: string) => handleSend(action)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProjectHistoryOpen && (
          <motion.div
            key="project-history"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-[70] bg-[#F8F9FA] flex flex-col"
          >
            <ProjectHistoryView 
              history={projectHistoryList}
              onBack={() => setIsProjectHistoryOpen(false)}
              onNewProject={() => {
                setIsProjectHistoryOpen(false);
                setIsChatActive(true);
                handleSend("新建计划");
              }}
              onToggleTask={toggleProjectTask}
              onToggleMain={toggleProjectMain}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAssetAgentActive && (
          <motion.div
            key="asset-agent"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-[90] bg-white"
          >
            <AssetAgentView onBack={() => setIsAssetAgentActive(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWorkbenchActive && (
          <motion.div
            key="workbench"
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-[80] bg-white"
          >
            <WorkbenchView onBackToAI={() => setIsWorkbenchActive(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        {/* Header */}
        <header className="px-6 pt-5 pb-1.5 bg-[#3B82F6]">
          <div className="flex justify-between items-center relative">
            <IconButton className="!p-0" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-white" />
            </IconButton>
            <div className="absolute left-1/2 -translate-x-1/2 text-white font-bold text-[16px] tracking-wide whitespace-nowrap">
              AI工作台
            </div>
            <IconButton className="!p-0" onClick={() => setIsWorkbenchActive(true)}>
              <X className="w-6 h-6 text-white" />
            </IconButton>
          </div>
        </header>

        <div className="sticky top-0 z-40 bg-white pt-4 pb-2 shadow-sm">
          {/* Avatar Carousel (Replaced Dropdowns) */}
          <AvatarCarousel items={AVATAR_LIST} onSelectAgent={(agent) => handleSelectAgent(agent, false, 'carousel')} />
        </div>

        <div className="space-y-2 pt-2">

        {/* 瀑布流我的任务 Section */}
        <section className="px-2 relative overflow-visible">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-[18px] font-black text-gray-900 tracking-tight">我的任务</h2>
          </div>
          <MasonryTasks 
            items={activeTasks} 
            onSelectAgent={handleSelectAgent}
          />
        </section>

        </div>
      </main>
    </div>

      {/* Footer Floating Bar */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[60] px-5 pb-6 pt-4 pointer-events-none">
        <div className="flex flex-col space-y-4 pointer-events-auto">
          {/* Return to Chat Button */}
          <AnimatePresence>
            {!isChatActive && chatMessages.length > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => setIsChatActive(true)}
                className="self-start -ml-5 bg-white py-2.5 pl-6 pr-4 rounded-r-full shadow-[0_4px_15px_rgba(0,0,0,0.06)] flex items-center space-x-3 border border-gray-100 border-l-0 mb-1 active:scale-95 transition-transform"
              >
                <span className="text-[15px] font-medium text-[#4A4A4A]">返回对话</span>
                <ChevronsUp className="w-5 h-5 text-[#4A4A4A]" strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>

          <div className="flex flex-col space-y-1.5">
            {/* Quick Action Pills */}
            <div className="flex items-center space-x-2 px-1 relative">
              {(isTaskPopupOpen || isBusinessPopupOpen || isSummaryPopupOpen) && (
                <div 
                  className="fixed inset-0 z-[105]" 
                  onClick={() => {
                    setIsTaskPopupOpen(false);
                    setIsBusinessPopupOpen(false);
                    setIsSummaryPopupOpen(false);
                  }}
                />
              )}
              <div className="relative">
                <SelectionPopup 
                  title="任务执行"
                  items={[
                    { text: "今天有哪些我的任务重点", icon: <Target className="w-4 h-4 text-emerald-500" /> },
                    { text: "输出路演准备清单", icon: <ClipboardList className="w-4 h-4 text-blue-500" /> },
                    { text: "帮我梳理今日客户触达重点", icon: <Users className="w-4 h-4 text-indigo-500" /> },
                    { text: "安排一场产品路演", icon: <Calendar className="w-4 h-4 text-orange-500" /> },
                    { text: "输出一份前端发起方案", icon: <Send className="w-4 h-4 text-rose-500" /> }
                  ]}
                  isOpen={isTaskPopupOpen} 
                  onClose={() => setIsTaskPopupOpen(false)} 
                  onSelect={(task) => {
                    setInputValue(task);
                    setIsInputActive(true);
                  }} 
                  positionClassName="-left-4"
                  triangleLeft="left-14"
                />
                <button 
                  onClick={() => {
                    setIsBusinessPopupOpen(false);
                    setIsSummaryPopupOpen(false);
                    setIsTaskPopupOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white border border-blue-100 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-95 transition-all"
                >
                  <List className="w-3.5 h-3.5 text-blue-500" strokeWidth={2.5} />
                  <span className="text-[12px] font-medium text-blue-600">任务执行</span>
                </button>
              </div>

              <div className="relative">
                <SelectionPopup 
                  title="我的业务"
                  items={[
                    { text: "机构客户适合什么资管方案", icon: <Briefcase className="w-4 h-4 text-emerald-500" /> },
                    { text: "先帮我梳理机构客户服务流程", icon: <Activity className="w-4 h-4 text-blue-500" /> },
                    { text: "给我一个定制化方案框架", icon: <Layout className="w-4 h-4 text-indigo-500" /> },
                    { text: "给我看最新净值波动", icon: <TrendingUp className="w-4 h-4 text-orange-500" /> },
                    { text: "推荐适合续投的产品", icon: <Star className="w-4 h-4 text-rose-500" /> },
                    { text: "高优先客户有哪些", icon: <UserCheck className="w-4 h-4 text-emerald-600" /> },
                    { text: "需要升级的客户", icon: <ArrowRight className="w-4 h-4 text-blue-600" /> }
                  ]}
                  isOpen={isBusinessPopupOpen} 
                  onClose={() => setIsBusinessPopupOpen(false)} 
                  onSelect={(item) => {
                    setInputValue(item);
                    setIsInputActive(true);
                  }} 
                  positionClassName="-left-24"
                  triangleLeft="left-[120px]"
                />
                <button 
                  onClick={() => {
                    setIsTaskPopupOpen(false);
                    setIsSummaryPopupOpen(false);
                    setIsBusinessPopupOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white border border-purple-100 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-95 transition-all"
                >
                  <Briefcase className="w-3.5 h-3.5 text-purple-500" strokeWidth={2.5} />
                  <span className="text-[12px] font-medium text-purple-600">我的业务</span>
                </button>
              </div>

              <div className="relative">
                <SelectionPopup 
                  title="工作总结"
                  items={[
                    { text: "当前主线项目进展", icon: <Activity className="w-4 h-4 text-blue-500" /> },
                    { text: "查看我的项目进度", icon: <PieChart className="w-4 h-4 text-emerald-500" /> },
                    { text: "本周客户触达计划", icon: <Calendar className="w-4 h-4 text-orange-500" /> }
                  ]}
                  isOpen={isSummaryPopupOpen} 
                  onClose={() => setIsSummaryPopupOpen(false)} 
                  onSelect={(item) => {
                    setInputValue(item);
                    setIsInputActive(true);
                  }} 
                  positionClassName="-right-4"
                  triangleLeft="right-14"
                />
                <button 
                  onClick={() => {
                    setIsTaskPopupOpen(false);
                    setIsBusinessPopupOpen(false);
                    setIsSummaryPopupOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white border border-orange-100 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-95 transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-orange-500" strokeWidth={2.5} />
                  <span className="text-[12px] font-medium text-orange-600">工作总结</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-1.5 flex items-center relative">
            {/* Footer Role Dropdown */}
            <AnimatePresence>
              {isFooterRoleOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-[-1]" 
                    onClick={() => setIsFooterRoleOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: -10, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="absolute bottom-full left-2 mb-4 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden py-2"
                  >
                    <div className="max-h-[400px] overflow-y-auto hide-scrollbar">
                      {footerRoles.map((role, index) => (
                        <React.Fragment key={role.name}>
                          <button
                            onClick={() => {
                              const agent = AVATAR_LIST.find(a => a.name === role.name);
                              if (agent) handleSelectAgent(agent, true);
                              else setCurrentFooterRole(role.name);
                              setIsFooterRoleOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors active:bg-gray-100"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                                <AvatarIcon 
                                  avatar={role.avatar} 
                                  name={role.name} 
                                  className={role.name === '资产管理' ? "w-[26px] h-[33px] object-contain" : "w-full h-full object-cover"}
                                />
                              </div>
                              <span className={`text-[14px] font-medium ${currentFooterRole === role.name ? 'text-gray-900' : 'text-gray-600'}`}>
                                {role.name}
                              </span>
                            </div>
                            {currentFooterRole === role.name && (
                              <Check className="w-4 h-4 text-orange-400" strokeWidth={3} />
                            )}
                          </button>
                          {index < footerRoles.length - 1 && (
                            <div className="mx-4 h-[1px] bg-gray-50" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    {/* Triangle pointer */}
                    <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <button 
              onClick={() => setIsFooterRoleOpen(!isFooterRoleOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FDF5F2] overflow-hidden ml-0.5 active:scale-95 transition-transform"
            >
               {(() => {
                 const role = footerRoles.find(r => r.name === currentFooterRole);
                 if (role) {
                   return <AvatarIcon 
                     avatar={role.avatar} 
                     name={role.name} 
                     className={role.name === '资产管理' ? "w-[26px] h-[33px] object-contain" : "w-full h-full object-cover"}
                   />;
                 }
                 return <User className="w-5 h-5 text-gray-600" strokeWidth={2} />;
               })()}
            </button>
            
            <input 
              type="text" 
              placeholder="请输入问题" 
              onFocus={() => setIsInputActive(true)}
              className="flex-1 bg-transparent text-[14px] outline-none px-4 text-gray-800 placeholder:text-gray-400 font-medium"
            />

            <div className="flex items-center pr-1">
              <IconButton 
                onClick={() => setIsInputActive(true)}
                className="w-10 h-10 rounded-full bg-[#3B82F6] shadow-sm !p-0 flex items-center justify-center active:scale-95 transition-transform"
              >
                <Send className="w-5 h-5 text-white" />
              </IconButton>
            </div>
            </div>
          </div>
        </div>
      </footer>

      <InputOverlay 
        isOpen={isInputActive} 
        onClose={() => setIsInputActive(false)}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSend={handleSend}
        currentFooterRole={currentFooterRole}
        setCurrentFooterRole={setCurrentFooterRole}
        footerRoles={footerRoles}
        isTaskPopupOpen={isTaskPopupOpen}
        setIsTaskPopupOpen={setIsTaskPopupOpen}
        isBusinessPopupOpen={isBusinessPopupOpen}
        setIsBusinessPopupOpen={setIsBusinessPopupOpen}
        isSummaryPopupOpen={isSummaryPopupOpen}
        setIsSummaryPopupOpen={setIsSummaryPopupOpen}
        activeAgent={activeAgent}
        onSelectAgent={handleSelectAgent}
      />

      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-black/70 text-white px-6 py-3 rounded-xl text-[14px] font-medium backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
