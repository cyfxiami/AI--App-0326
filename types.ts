
export interface Task {
  id: string;
  title: string;
  type: 'subscription' | 'opportunity' | 'info';
  status: 'pending' | 'completed';
  time?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: {
    label: string;
    completed: boolean;
  }[];
}

export interface DataMetric {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

export type TabType = 'AI好生意' | '光明月' | '贵州好酒' | '定制酒';
