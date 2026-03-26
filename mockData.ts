
import { Task, Project, DataMetric } from './types';

export const METRICS: DataMetric[] = [
  { label: '分享记录(条)', value: 25 },
  { label: '客户总数(人)', value: 48 },
  { label: '近30日订单(笔)', value: 25 },
  { label: '交易金额(元)', value: '4,521,901', color: 'text-orange-500' },
  { label: '收益(元)', value: '21,901' },
];

export const TASKS: Task[] = [
  { id: '1', title: '每天8点生成一张光明月宣传海报', type: 'subscription', status: 'pending' },
  { id: '2', title: '订阅白酒行业每日行情速报', type: 'subscription', status: 'pending' },
  { id: '3', title: '订阅新品发布预告', type: 'subscription', status: 'pending' },
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: '贵山宴客户专属用酒定制',
    category: '定制业务',
    description: '年度VIP客户定制项目',
    steps: [
      { label: '产品设计', completed: true },
      { label: '签约付款', completed: false },
      { label: '生产交付', completed: false },
    ]
  },
  {
    id: 'p2',
    title: '三个月冲刺成为创始会员',
    category: '创始会员',
    description: '通过个人口碑背书分享，聚焦少数关键好友复购',
    steps: [
      { label: '产品设计', completed: false },
      { label: '定制项目合同条款确认', completed: false },
    ]
  }
];

export const MENU_ITEMS = [
  { icon: '👤', label: '个人' },
  { icon: '🏢', label: '机构' },
  { icon: '👥', label: '商会' },
  { icon: '🍴', label: '餐厅' },
  { icon: '🏪', label: '商户' },
];
