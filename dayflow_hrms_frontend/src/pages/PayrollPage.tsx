import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Plus,
  Printer,
  Eye,
} from 'lucide-react';
import type { PayrollRecord, Role, UserProfile } from '../types/hrms';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatCurrency, formatDate } from '../lib/utils';

interface PayrollPageProps {
  payroll: PayrollRecord[];
  employees: UserProfile[];
  role: Role;
  loading: boolean;
  onCreatePayroll: (payload: {
    employeeId: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    payrollMonth: string;
    remarks?: string;
  }) => Promise<void>;
}

export function PayrollPage({
  payroll,
  employees,
  role,
  onCreatePayroll,
}: PayrollPageProps) {
  const isManager = role === 'ADMIN' || role === 'HR_MANAGER';

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Generate Payroll Form
  const [selectedEmpId, setSelectedEmpId] = useState<number>(employees[0]?.id || 1);
  const [basicSalary, setBasicSalary] = useState('8000');
  const [allowances, setAllowances] = useState('1000');
  const [deductions, setDeductions] = useState('1500');
  const [payrollMonth, setPayrollMonth] = useState('2026-08');
  const [remarks, setRemarks] = useState('Regular monthly disbursement');

  const totalDisbursed = payroll.reduce((acc, p) => acc + (p.netSalary || 0), 0);
  const totalAllowances = payroll.reduce((acc, p) => acc + (p.allowances || 0), 0);
  const totalDeductions = payroll.reduce((acc, p) => acc + (p.deductions || 0), 0);

  const handleEmpChange = (empId: number) => {
    setSelectedEmpId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp && emp.baseSalary) {
      const monthly = Math.round(emp.baseSalary / 12);
      setBasicSalary(String(monthly));
      setAllowances(String(Math.round(monthly * 0.12)));
      setDeductions(String(Math.round(monthly * 0.15)));
    }
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreatePayroll({
        employeeId: Number(selectedEmpId),
        basicSalary: Number(basicSalary) || 0,
        allowances: Number(allowances) || 0,
        deductions: Number(deductions) || 0,
        payrollMonth,
        remarks,
      });
      setIsGenerateOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isManager ? 'Payroll Management & Salary Runs' : 'My Salary Slips'}
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {isManager
              ? 'Calculate and disburse monthly employee compensation'
              : 'View and download itemized monthly salary stubs'}
          </p>
        </div>

        {isManager && (
          <Button
            variant="primary"
            onClick={() => setIsGenerateOpen(true)}
            icon={<Plus className="w-4 h-4" />}
            className="shadow-sm font-semibold"
          >
            Generate Payroll Run
          </Button>
        )}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Net Disbursed</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{formatCurrency(totalDisbursed)}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Allowances</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{formatCurrency(totalAllowances)}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Taxes & Deductions</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{formatCurrency(totalDeductions)}</p>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <Card className="shadow-card bg-white border-slate-200/80">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            {isManager ? 'Organization Payroll Register' : 'Salary Statement History'}
          </CardTitle>
          <CardDescription>Itemized compensation records by month</CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold">
                {isManager && <th className="py-3 px-4">Employee</th>}
                <th className="py-3 px-4">Payroll Month</th>
                <th className="py-3 px-4">Basic Pay</th>
                <th className="py-3 px-4">Allowances</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payroll.length === 0 ? (
                <tr>
                  <td
                    colSpan={isManager ? 8 : 7}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    No payroll disbursements found.
                  </td>
                </tr>
              ) : (
                payroll.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    {isManager && (
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{p.employeeName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.employeeCode}
                        </span>
                      </td>
                    )}
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-bold">
                      {p.payrollMonth}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{formatCurrency(p.basicSalary)}</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-semibold">+{formatCurrency(p.allowances)}</td>
                    <td className="py-3.5 px-4 text-rose-600 font-semibold">-{formatCurrency(p.deductions)}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {formatCurrency(p.netSalary)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={p.paymentStatus || 'PAID'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedSlip(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors shadow-subtle"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Slip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Itemized Payslip Modal */}
      <Modal
        isOpen={!!selectedSlip}
        onClose={() => setSelectedSlip(null)}
        title="Official Salary Statement"
        description={`Month: ${selectedSlip?.payrollMonth} | Ref #${selectedSlip?.id}`}
        maxWidth="lg"
      >
        {selectedSlip && (
          <div className="space-y-6" id="printable-payslip">
            {/* Header branding */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">DAYFLOW HRMS</h3>
                <p className="text-xs text-slate-500 font-medium">Salary Slip & Tax Deduction Breakdown</p>
              </div>
              <Badge status="PAID" />
            </div>

            {/* Employee details strip */}
            <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Employee Name</span>
                <p className="font-bold text-slate-900 text-sm">{selectedSlip.employeeName}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Employee ID</span>
                <p className="font-bold text-brand-600 font-mono text-sm">{selectedSlip.employeeCode}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Department</span>
                <p className="text-slate-700 font-medium">{selectedSlip.department || 'Engineering'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Disbursement Date</span>
                <p className="text-slate-700 font-medium">{formatDate(selectedSlip.paymentDate || new Date().toISOString())}</p>
              </div>
            </div>

            {/* Compensation breakdown grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Earnings column */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="font-bold text-emerald-700 uppercase text-[11px] border-b border-slate-200 pb-2">
                  Earnings (Gross)
                </p>
                <div className="flex justify-between text-slate-700">
                  <span>Basic Salary</span>
                  <span className="font-mono font-medium">{formatCurrency(selectedSlip.basicSalary)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Allowances & Perks</span>
                  <span className="font-mono font-medium text-emerald-600">+{formatCurrency(selectedSlip.allowances)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Gross Earnings</span>
                  <span className="font-mono">
                    {formatCurrency(Number(selectedSlip.basicSalary) + Number(selectedSlip.allowances))}
                  </span>
                </div>
              </div>

              {/* Deductions column */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="font-bold text-rose-700 uppercase text-[11px] border-b border-slate-200 pb-2">
                  Deductions & Taxes
                </p>
                <div className="flex justify-between text-slate-700">
                  <span>Income Tax / Withholding</span>
                  <span className="font-mono font-medium text-rose-600">-{formatCurrency(Number(selectedSlip.deductions) * 0.7)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Provident / Insurance</span>
                  <span className="font-mono font-medium text-rose-600">-{formatCurrency(Number(selectedSlip.deductions) * 0.3)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-600">-{formatCurrency(selectedSlip.deductions)}</span>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                  Net Take-Home Pay
                </p>
                <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {formatCurrency(selectedSlip.netSalary)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Electronic Transfer</span>
                <p className="text-xs text-emerald-700 font-bold mt-0.5">Direct Deposit Verified</p>
              </div>
            </div>

            {selectedSlip.remarks && (
              <p className="text-xs text-slate-500 italic">Remarks: {selectedSlip.remarks}</p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
                Print Payslip
              </Button>
              <Button variant="secondary" onClick={() => setSelectedSlip(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Generate Payroll Run Modal (Admin/HR) */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Employee Payroll Run"
        description="Calculate monthly salary components, allowances, and taxes"
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <Select
            label="Select Employee"
            value={selectedEmpId}
            onChange={(e) => handleEmpChange(Number(e.target.value))}
            options={employees.map((e) => ({
              label: `${e.firstName} ${e.lastName} (${e.employeeCode}) - ${e.department}`,
              value: e.id,
            }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Payroll Month"
              type="month"
              value={payrollMonth}
              onChange={(e) => setPayrollMonth(e.target.value)}
              required
            />
            <Input
              label="Basic Monthly Salary ($)"
              type="number"
              value={basicSalary}
              onChange={(e) => setBasicSalary(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Allowances ($)"
              type="number"
              value={allowances}
              onChange={(e) => setAllowances(e.target.value)}
            />
            <Input
              label="Deductions / Taxes ($)"
              type="number"
              value={deductions}
              onChange={(e) => setDeductions(e.target.value)}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-xs">
            <span className="text-emerald-800 font-bold">Calculated Net Salary:</span>
            <span className="font-extrabold text-base text-emerald-700 font-mono">
              {formatCurrency(
                Math.max(0, Number(basicSalary) + Number(allowances) - Number(deductions))
              )}
            </span>
          </div>

          <Input
            label="Payment Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Disburse & Save Slip
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
