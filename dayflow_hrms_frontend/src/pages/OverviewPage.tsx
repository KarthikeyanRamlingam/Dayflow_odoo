import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import type { DashboardStats, Role, AttendanceRecord } from '../types/hrms';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDate, formatDateTime } from '../lib/utils';

interface OverviewPageProps {
  stats: DashboardStats | null;
  role: Role;
  isCheckedIn: boolean;
  activeAttendance: AttendanceRecord | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
  loadingClock: boolean;
  onDecideLeave?: (id: number, status: 'APPROVED' | 'REJECTED') => void;
}

const PIE_COLORS = ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

export function OverviewPage({
  stats,
  role,
  isCheckedIn,
  activeAttendance,
  onCheckIn,
  onCheckOut,
  loadingClock,
  onDecideLeave,
}: OverviewPageProps) {
  const isManager = role === 'ADMIN' || role === 'HR_MANAGER';

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
      {/* Top Stat Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={isManager ? 'Total Employees' : 'My Status'}
          value={isManager ? stats?.totalEmployees ?? 0 : 'Active'}
          subtitle={isManager ? 'Across all departments' : 'Full-time member'}
          icon={<Users className="w-6 h-6 text-brand-600" />}
          color="indigo"
          trend="+4.2%"
          trendPositive={true}
        />

        <StatCard
          title="Present Today"
          value={stats?.presentToday ?? 0}
          subtitle={isManager ? 'Checked-in staff members' : 'Workday in progress'}
          icon={<Clock className="w-6 h-6 text-emerald-600" />}
          color="emerald"
          trend="98% on-time"
          trendPositive={true}
        />

        <StatCard
          title={isManager ? 'Pending Requests' : 'My Pending Leaves'}
          value={stats?.pendingLeaves ?? 0}
          subtitle="Awaiting decision"
          icon={<CalendarDays className="w-6 h-6 text-amber-600" />}
          color="amber"
          trend={stats?.pendingLeaves ? 'Action needed' : 'All clear'}
          trendPositive={!stats?.pendingLeaves}
        />

        <StatCard
          title={isManager ? 'Payroll Run' : 'Latest Net Salary'}
          value={formatCurrency(stats?.monthlyPayrollExpenses ?? 0)}
          subtitle={isManager ? 'Total monthly expense' : 'Disbursed to account'}
          icon={<DollarSign className="w-6 h-6 text-purple-600" />}
          color="purple"
          trend="Processed"
          trendPositive={true}
        />
      </div>

      {/* Workday Check-in Widget & Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workday Punch Widget */}
        <Card className="lg:col-span-1 border-slate-200/80 relative overflow-hidden bg-white shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <Clock className="w-5 h-5 text-brand-600" />
                Workday Status
              </CardTitle>
              <Badge status={isCheckedIn ? 'PRESENT' : 'ABSENT'} />
            </div>
            <CardDescription>Record your daily check-in and check-out</CardDescription>
          </CardHeader>

          <div className="space-y-5 my-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {isCheckedIn ? 'Active Session Started' : 'Current Shift'}
              </p>
              <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                {isCheckedIn && activeAttendance?.checkIn
                  ? formatDateTime(activeAttendance.checkIn)
                  : 'Not checked in yet'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isCheckedIn
                  ? 'Your hours are currently being recorded'
                  : 'Click check-in when you begin work'}
              </p>
            </div>

            {isCheckedIn ? (
              <Button
                variant="danger"
                size="lg"
                loading={loadingClock}
                onClick={onCheckOut}
                className="w-full font-bold shadow-sm"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Punch Out Now
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                loading={loadingClock}
                onClick={onCheckIn}
                className="w-full font-bold shadow-sm"
                icon={<CheckCircle className="w-5 h-5" />}
              >
                Punch In Now
              </Button>
            )}
          </div>
        </Card>

        {/* 7-Day Attendance Trend Chart */}
        <Card className="lg:col-span-2 shadow-card bg-white border-slate-200/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                  <TrendingUp className="w-5 h-5 text-brand-600" />
                  7-Day Attendance Trend
                </CardTitle>
                <CardDescription>Daily presence records over the past week</CardDescription>
              </div>
            </div>
          </CardHeader>

          <div className="h-64 w-full pt-2">
            {stats?.attendanceTrends && stats.attendanceTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      color: '#0f172a',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="present" name="Present Staff" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No attendance logs found yet
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Analytics Breakdown & Recent Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution Chart */}
        <Card className="shadow-card bg-white border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Department Headcount</CardTitle>
            <CardDescription>Staff distribution across organization units</CardDescription>
          </CardHeader>
          <div className="h-60 w-full flex items-center justify-center">
            {stats?.departmentDistribution && stats.departmentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.departmentDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    label={(entry) => `${entry.name} (${entry.value})`}
                    labelLine={false}
                  >
                    {stats.departmentDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      color: '#0f172a',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 600,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">No department data recorded</p>
            )}
          </div>
        </Card>

        {/* Recent Leave Requests & Pending Approvals */}
        <Card className="shadow-card bg-white border-slate-200/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-slate-900">Recent Time Off Requests</CardTitle>
                <CardDescription>Latest leave applications and status updates</CardDescription>
              </div>
            </div>
          </CardHeader>

          <div className="space-y-3">
            {stats?.recentLeaves && stats.recentLeaves.length > 0 ? (
              stats.recentLeaves.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{l.employeeName}</p>
                      <Badge status={l.status} className="text-[10px]" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {l.type} • {formatDate(l.startDate)} - {formatDate(l.endDate)}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5 italic">"{l.reason}"</p>
                  </div>

                  {isManager && l.status === 'PENDING' && onDecideLeave && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onDecideLeave(l.id, 'APPROVED')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-subtle"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onDecideLeave(l.id, 'REJECTED')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors shadow-subtle"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                No leave requests filed yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
