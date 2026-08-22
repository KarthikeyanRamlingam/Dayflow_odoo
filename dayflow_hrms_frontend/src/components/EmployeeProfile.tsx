import { useState } from 'react';
import type { Employee } from '../types/employee';

export function EmployeeProfile({ employee, onSave }: { employee: Employee; onSave: (id: number, payload: Partial<Employee>) => void }) {
  const [form, setForm] = useState<Employee>({ ...employee });

  const handleChange = (k: keyof Employee, v: any) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <div>
      <h3>Employee details</h3>
      <div className="form-row">
        <label>First name</label>
        <input value={form.firstName || ''} onChange={(e) => handleChange('firstName', e.target.value)} />
      </div>
      <div className="form-row">
        <label>Last name</label>
        <input value={form.lastName || ''} onChange={(e) => handleChange('lastName', e.target.value)} />
      </div>
      <div className="form-row">
        <label>Email</label>
        <input value={form.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
      </div>
      <div className="form-row">
        <label>Phone</label>
        <input value={form.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
      </div>
      <div className="form-row">
        <label>Job title</label>
        <input value={form.jobTitle || ''} onChange={(e) => handleChange('jobTitle', e.target.value)} />
      </div>
      <div className="form-row">
        <label>Department</label>
        <input value={form.department || ''} onChange={(e) => handleChange('department', e.target.value)} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => onSave(employee.id, form)}>Save</button>
      </div>
    </div>
  );
}
