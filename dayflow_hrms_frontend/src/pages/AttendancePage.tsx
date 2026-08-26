import { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import type { AttendanceRecord, Role } from '../types/hrms';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatDate, formatDateTime, formatDuration } from '../lib/utils';

interface AttendancePageProps {
  attendance: AttendanceRecord[];
  role: Role;
  isCheckedIn: boolean;
  activeAttendance: AttendanceRecord | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
  loadingClock: boolean;
}

export function AttendancePage({
  attendance,
  role,
  isCheckedIn,
  activeAttendance,
  onCheckIn,
  onCheckOut,
  loadingClock,
}: AttendancePageProps) {
  const isManager = role === 'ADMIN' || role === 'HR_MANAGER';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredAttendance = attendance.filter((a) => {
    const matchesSearch =
      a.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.attendanceDate.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPresent = attendance.filter((a) => a.status === 'PRESENT').length;
  const totalHalfDay = attendance.filter((a) => a.status === 'HALF_DAY').length;
  const totalHours = Math.round(
    attendance.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) / 60
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* Top Workday Console Card */}
      <Card className="bg-white border border-slate-200/80 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge status={isCheckedIn ? 'PRESENT' : 'ABSENT'} />
              <span className="text-xs text-slate-500 font-medium">
                {isCheckedIn ? 'Active Work Shift' : 'Off-the-clock'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isCheckedIn ? 'Currently Clocked In' : 'Ready to Start Workday?'}
            </h2>
            <p className="text-xs text-slate-500">
              {isCheckedIn && activeAttendance?.checkIn
                ? `Clocked in at ${formatDateTime(activeAttendance.checkIn)}`
                : 'Click below to register today’s check-in timestamp.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isCheckedIn ? (
              <Button
                variant="danger"
                size="lg"
                loading={loadingClock}
                onClick={onCheckOut}
                className="shadow-sm font-bold"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Punch Out
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                loading={loadingClock}
                onClick={onCheckIn}
                className="shadow-sm font-bold"
                icon={<CheckCircle2 className="w-5 h-5" />}
              >
                Punch In
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Present Days</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalPresent}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Half-day / Partial</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalHalfDay}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Recorded Time</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalHours} hrs</p>
          </div>
        </div>
      </div>

      {/* Attendance History Table Card */}
      <Card className="shadow-card bg-white border-slate-200/80">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base text-slate-900">
                {isManager ? 'Organization Attendance Records' : 'My Attendance History'}
              </CardTitle>
              <CardDescription>Daily check-in, check-out, and total duration logs</CardDescription>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              {isManager && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter employee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 shadow-subtle"
                  />
                </div>
              )}

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-brand-500 shadow-subtle"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold">
                {isManager && <th className="py-3 px-4">Employee</th>}
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td
                    colSpan={isManager ? 6 : 5}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    {isManager && (
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{rec.employeeName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rec.employeeCode}
                        </span>
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {formatDate(rec.attendanceDate)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">
                      {formatDateTime(rec.checkIn)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">
                      {rec.checkOut ? formatDateTime(rec.checkOut) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {formatDuration(rec.durationMinutes)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge status={rec.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
