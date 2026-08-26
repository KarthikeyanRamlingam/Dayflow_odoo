import React, { useState } from 'react';
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { LeaveRecord, Role, LeaveStatus } from '../types/hrms';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatDate } from '../lib/utils';

interface LeavePageProps {
  leaves: LeaveRecord[];
  role: Role;
  loading: boolean;
  onApplyLeave: (payload: { startDate: string; endDate: string; type: string; reason: string }) => Promise<void>;
  onDecideLeave: (id: number, status: LeaveStatus, reviewComment?: string) => Promise<void>;
}

export function LeavePage({
  leaves,
  role,
  onApplyLeave,
  onDecideLeave,
}: LeavePageProps) {
  const isManager = role === 'ADMIN' || role === 'HR_MANAGER';

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [activeDecisionLeave, setActiveDecisionLeave] = useState<LeaveRecord | null>(null);
  const [decisionType, setDecisionType] = useState<LeaveStatus>('APPROVED');
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Apply Form
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Paid time off');
  const [reason, setReason] = useState('');
  const [applyError, setApplyError] = useState('');

  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const filteredLeaves = leaves.filter((l) => {
    if (filterTab === 'ALL') return true;
    return l.status === filterTab;
  });

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter((l) => l.status === 'REJECTED').length;

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      setApplyError('Please fill out all required fields.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setApplyError('End date cannot be prior to start date.');
      return;
    }
    setSubmitting(true);
    setApplyError('');
    try {
      await onApplyLeave({
        startDate,
        endDate,
        type: leaveType,
        reason: reason.trim(),
      });
      setIsApplyOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err: any) {
      setApplyError(err?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDecisionLeave) return;
    setSubmitting(true);
    try {
      await onDecideLeave(activeDecisionLeave.id, decisionType, reviewComment.trim());
      setActiveDecisionLeave(null);
      setReviewComment('');
    } finally {
      setSubmitting(false);
    }
  };

  const openDecisionModal = (leave: LeaveRecord, type: LeaveStatus) => {
    setActiveDecisionLeave(leave);
    setDecisionType(type);
    setReviewComment('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Time Off & Leave Requests</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {isManager
              ? 'Manage and approve team leave applications'
              : 'Submit vacation, sick leave, and track approval status'}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsApplyOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-sm font-semibold"
        >
          Request Time Off
        </Button>
      </div>

      {/* Leave Balances / Status Badges Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Requests</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{pendingCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Approved Requests</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{approvedCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Declined Requests</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Leave Requests Table Card */}
      <Card className="shadow-card bg-white border-slate-200/80">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base text-slate-900">
                {isManager ? 'All Team Leave Applications' : 'My Leave Applications'}
              </CardTitle>
              <CardDescription>Comprehensive history and active reviews</CardDescription>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filterTab === tab
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold">
                {isManager && <th className="py-3 px-4">Employee</th>}
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date Range</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Applied On</th>
                <th className="py-3 px-4">Status</th>
                {isManager && <th className="py-3 px-4 text-right">Review Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td
                    colSpan={isManager ? 7 : 6}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    No leave requests found in this view.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    {isManager && (
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{l.employeeName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {l.employeeCode}
                        </span>
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-brand-700 font-semibold">{l.type}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {formatDate(l.startDate)} – {formatDate(l.endDate)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                      <p className="truncate" title={l.reason}>
                        {l.reason}
                      </p>
                      {l.reviewComment && (
                        <p className="text-[11px] text-slate-500 mt-0.5 italic truncate" title={l.reviewComment}>
                          Review: {l.reviewComment}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(l.appliedAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={l.status} />
                    </td>
                    {isManager && (
                      <td className="py-3.5 px-4 text-right">
                        {l.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openDecisionModal(l, 'APPROVED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold transition-colors shadow-subtle"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openDecisionModal(l, 'REJECTED')}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold transition-colors shadow-subtle"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Decided</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title="Apply for Time Off"
        description="Select your requested dates and specify the reason for absence"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          {applyError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {applyError}
            </div>
          )}

          <Select
            label="Leave Type"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            options={[
              { label: 'Paid Time Off (Annual Vacation)', value: 'Paid time off' },
              { label: 'Sick Leave (Medical)', value: 'Sick leave' },
              { label: 'Unpaid Leave (Personal)', value: 'Unpaid leave' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Reason / Remarks
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a brief explanation for your leave..."
              rows={3}
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none shadow-subtle"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsApplyOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manager Leave Decision Modal */}
      <Modal
        isOpen={!!activeDecisionLeave}
        onClose={() => setActiveDecisionLeave(null)}
        title={`${decisionType === 'APPROVED' ? 'Approve' : 'Reject'} Leave Request`}
        description={`Applicant: ${activeDecisionLeave?.employeeName} (${activeDecisionLeave?.type})`}
      >
        <form onSubmit={handleDecisionSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <p className="text-slate-600">
              <span className="font-bold text-slate-900">Dates:</span> {formatDate(activeDecisionLeave?.startDate)} - {formatDate(activeDecisionLeave?.endDate)}
            </p>
            <p className="text-slate-600">
              <span className="font-bold text-slate-900">Reason:</span> "{activeDecisionLeave?.reason}"
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Reviewer Feedback / Comments
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder={
                decisionType === 'APPROVED'
                  ? 'e.g. Approved. Please ensure task handover is complete.'
                  : 'e.g. Declined due to scheduled sprint release.'
              }
              rows={3}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none shadow-subtle"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setActiveDecisionLeave(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={decisionType === 'APPROVED' ? 'success' : 'danger'}
              loading={submitting}
            >
              Confirm {decisionType === 'APPROVED' ? 'Approval' : 'Rejection'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
