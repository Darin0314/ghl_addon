import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { mockKPIs, mockPipelineSummary, mockActivity } from '../data/mockData';

const stageColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#ef4444'];

function KPICard({ label, value, change, prefix = '', suffix = '' }) {
  const up = change >= 0;
  return (
    <div className="bg-[#141923] border border-[#1e2535] rounded-xl p-5">
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      <p className="text-white text-3xl font-bold">
        {prefix}{typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}{suffix}
      </p>
      <p className={`text-sm mt-2 font-medium ${up ? 'text-emerald-400' : 'text-red-400'}`}>
        {up ? '▲' : '▼'} {Math.abs(change)}{typeof change === 'number' && label.includes('Revenue') ? '%' : ''} this month
      </p>
    </div>
  );
}

const activityIconMap = {
  user:     { bg: 'bg-blue-500/20',   text: 'text-blue-400',   icon: '👤' },
  deal:     { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: '💼' },
  calendar: { bg: 'bg-amber-500/20',  text: 'text-amber-400',  icon: '📅' },
  email:    { bg: 'bg-pink-500/20',   text: 'text-pink-400',   icon: '✉️' },
  tag:      { bg: 'bg-teal-500/20',   text: 'text-teal-400',   icon: '🏷️' },
};

function ActivityItem({ item }) {
  const style = activityIconMap[item.icon] ?? activityIconMap.user;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#1e2535] last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${style.bg}`}>
        {style.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm leading-snug">{item.text}</p>
      </div>
      <p className="text-slate-500 text-xs shrink-0 mt-0.5">{item.time}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2535] border border-[#2a3347] rounded-lg px-3 py-2 text-sm">
      <p className="text-white font-medium mb-1">{label}</p>
      <p className="text-slate-300">{payload[0].name}: <span className="text-white font-semibold">{payload[0].value}</span></p>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Contacts"      value={mockKPIs.totalContacts}    change={mockKPIs.totalContactsChange} />
        <KPICard label="Revenue"             value={mockKPIs.revenue}          change={mockKPIs.revenueChange} prefix="$" />
        <KPICard label="Open Deals"          value={mockKPIs.openDeals}        change={mockKPIs.openDealsChange} />
        <KPICard label="Appointments Today"  value={mockKPIs.appointmentsToday} change={mockKPIs.appointmentsTodayChange} />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Pipeline Chart */}
        <div className="xl:col-span-3 bg-[#141923] border border-[#1e2535] rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">Pipeline Summary</h2>
            <span className="text-slate-400 text-xs bg-[#1e2535] px-3 py-1 rounded-full">Deal Count</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockPipelineSummary} barSize={32}>
              <XAxis
                dataKey="stage"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
              <Bar dataKey="count" name="Deals" radius={[6, 6, 0, 0]}>
                {mockPipelineSummary.map((_, i) => (
                  <Cell key={i} fill={stageColors[i % stageColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Stage legend totals */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {mockPipelineSummary.map((s, i) => (
              <div key={s.stage} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: stageColors[i] }} />
                <span className="text-slate-400 text-xs truncate">{s.stage}</span>
                <span className="text-slate-300 text-xs font-medium ml-auto">${(s.value / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="xl:col-span-2 bg-[#141923] border border-[#1e2535] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
          <div className="overflow-y-auto max-h-[340px] pr-1">
            {mockActivity.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
