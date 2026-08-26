import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Briefcase,
  Building,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import type { UserProfile, Role } from '../types/hrms';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatCurrency, formatDate } from '../lib/utils';

interface EmployeesPageProps {
  employees: UserProfile[];
  role: Role;
  loading: boolean;
  onRefresh: () => void;
  onCreateEmployee: (payload: Partial<UserProfile>) => Promise<void>;
  onUpdateEmployee: (id: number, payload: Partial<UserProfile>) => Promise<void>;
  onDeleteEmployee: (id: number) => Promise<void>;
}

export function EmployeesPage({
  employees,
  role,
  loading,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}: EmployeesPageProps) {
  const isManager = role === 'ADMIN' || role === 'HR_MANAGER';
  const isAdmin = role === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Modals
  const [selectedEmp, setSelectedEmp] = useState<UserProfile | null>(null);
  const [editingEmp, setEditingEmp] = useState<UserProfile | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add Employee Form State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newJobTitle, setNewJobTitle] = useState('Software Engineer');
  const [newRole, setNewRole] = useState<Role>('EMPLOYEE');
  const [newSalary, setNewSalary] = useState('75000');

  // Edit Employee Form State
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editRole, setEditRole] = useState<Role>('EMPLOYEE');
  const [editSalary, setEditSalary] = useState('0');

  const departments = ['ALL', ...Array.from(new Set(employees.map((e) => e.department).filter(Boolean)))];

  const filteredEmployees = employees.filter((emp) => {
    const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const openEditModal = (emp: UserProfile) => {
    setEditingEmp(emp);
    setEditFirstName(emp.firstName);
    setEditLastName(emp.lastName);
    setEditEmail(emp.email);
    setEditPhone(emp.phone || '');
    setEditAddress(emp.address || '');
    setEditDept(emp.department);
    setEditJobTitle(emp.jobTitle);
    setEditStatus(emp.status);
    setEditRole(emp.role);
    setEditSalary(String(emp.baseSalary || 0));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onCreateEmployee({
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        phone: newPhone,
        department: newDept,
        jobTitle: newJobTitle,
        role: newRole,
        baseSalary: Number(newSalary) || 0,
      });
      setIsAddOpen(false);
      // Reset
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewPhone('');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    setSaving(true);
    try {
      await onUpdateEmployee(editingEmp.id, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
        department: editDept,
        jobTitle: editJobTitle,
        status: editStatus,
        role: editRole,
        baseSalary: Number(editSalary) || 0,
      });
      setEditingEmp(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this employee profile?')) {
      await onDeleteEmployee(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, code, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-subtle"
          />
        </div>

        {/* Action button for HR/Admin */}
        {isManager && (
          <Button
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            icon={<Plus className="w-4 h-4" />}
            className="shadow-sm font-semibold"
          >
            Add New Employee
          </Button>
        )}
      </div>

      {/* Department Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 border ${
              selectedDept === dept
                ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-subtle'
                : 'bg-white text-slate-600 border-slate-200/80 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading employee directory...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl shadow-card">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">No employees matched your filter</p>
          <p className="text-xs text-slate-500 mt-1">Try refining your search query or department filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => (
            <Card
              key={emp.id}
              className="hover:border-slate-300 transition-all duration-200 group relative flex flex-col justify-between shadow-card hover:shadow-card-hover bg-white border-slate-200/80"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white text-base shadow-sm uppercase">
                      {emp.firstName[0]}
                      {emp.lastName ? emp.lastName[0] : ''}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {emp.firstName} {emp.lastName}
                      </h4>
                      <p className="text-xs font-mono font-semibold text-brand-600">{emp.employeeCode}</p>
                    </div>
                  </div>
                  <Badge status={emp.status} className="text-[10px]" />
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-800 font-medium">{emp.jobTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedEmp(emp)}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View Profile
                </button>

                {isManager && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(emp)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit Employee"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Employee Profile Modal */}
      <Modal
        isOpen={!!selectedEmp}
        onClose={() => setSelectedEmp(null)}
        title="Employee Profile Details"
        description="Comprehensive personal, job, and compensation summary"
        maxWidth="lg"
      >
        {selectedEmp && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xl shadow-md uppercase">
                {selectedEmp.firstName[0]}
                {selectedEmp.lastName ? selectedEmp.lastName[0] : ''}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedEmp.firstName} {selectedEmp.lastName}
                </h3>
                <p className="text-xs text-brand-600 font-mono font-semibold">{selectedEmp.employeeCode}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge status={selectedEmp.status} />
                  <Badge status={selectedEmp.role} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Department</span>
                <p className="text-slate-900 font-semibold text-sm">{selectedEmp.department}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Job Title</span>
                <p className="text-slate-900 font-semibold text-sm">{selectedEmp.jobTitle}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Email</span>
                <p className="text-slate-900 font-semibold text-sm truncate">{selectedEmp.email}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Phone</span>
                <p className="text-slate-900 font-semibold text-sm">{selectedEmp.phone || '—'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Address</span>
                <p className="text-slate-900 font-semibold text-sm">{selectedEmp.address || '—'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Joining Date</span>
                <p className="text-slate-900 font-semibold text-sm">{formatDate(selectedEmp.dateOfJoining)}</p>
              </div>
              {isManager && (
                <div className="col-span-full p-4 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-between">
                  <div>
                    <span className="text-brand-700 uppercase font-bold text-[11px]">Base Salary Rate</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-0.5">{formatCurrency(selectedEmp.baseSalary)}</p>
                  </div>
                  <span className="text-xs font-semibold text-brand-700">Annual Gross</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedEmp(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add New Employee Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Onboard New Employee"
        description="Register a new staff member profile in the organization"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="name@dayflow.local"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Department"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              options={[
                { label: 'Engineering', value: 'Engineering' },
                { label: 'Human Resources', value: 'Human Resources' },
                { label: 'Design', value: 'Design' },
                { label: 'Marketing', value: 'Marketing' },
                { label: 'Finance & Ops', value: 'Finance & Ops' },
              ]}
            />
            <Input
              label="Job Title"
              placeholder="e.g. Lead Software Engineer"
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="System Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              options={[
                { label: 'Employee', value: 'EMPLOYEE' },
                { label: 'HR Manager', value: 'HR_MANAGER' },
                { label: 'Administrator', value: 'ADMIN' },
              ]}
            />
            <Input
              label="Annual Base Salary ($)"
              type="number"
              value={newSalary}
              onChange={(e) => setNewSalary(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Create Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={!!editingEmp}
        onClose={() => setEditingEmp(null)}
        title={`Edit Employee: ${editingEmp?.firstName} ${editingEmp?.lastName}`}
        description="Update role, job specifications, and compensation structure"
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
            <Input
              label="Phone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
          </div>

          <Input
            label="Address"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department"
              value={editDept}
              onChange={(e) => setEditDept(e.target.value)}
              required
            />
            <Input
              label="Job Title"
              value={editJobTitle}
              onChange={(e) => setEditJobTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              options={[
                { label: 'Active', value: 'ACTIVE' },
                { label: 'On Leave', value: 'ON_LEAVE' },
                { label: 'Inactive', value: 'INACTIVE' },
              ]}
            />
            <Select
              label="Role"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as Role)}
              options={[
                { label: 'Employee', value: 'EMPLOYEE' },
                { label: 'HR Manager', value: 'HR_MANAGER' },
                { label: 'Admin', value: 'ADMIN' },
              ]}
            />
            <Input
              label="Base Salary ($)"
              type="number"
              value={editSalary}
              onChange={(e) => setEditSalary(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setEditingEmp(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
