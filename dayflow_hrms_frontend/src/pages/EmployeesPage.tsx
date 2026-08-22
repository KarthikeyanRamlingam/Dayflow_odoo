import { useEffect, useState } from 'react';
import { employeeApi } from '../api/employeeApi';
import type { Employee } from '../types/employee';
import { EmployeeList } from '../components/EmployeeList';
import { EmployeeProfile } from '../components/EmployeeProfile';

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    employeeApi
      .list()
      .then((data) => setEmployees(data))
      .catch((err) => setError(err?.message || 'Failed to load employees'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (e: Employee) => {
    setSelected(e);
  };

  const handleSave = async (id: number, payload: Partial<Employee>) => {
    try {
      const updated = await employeeApi.update(id, payload);
      setEmployees((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelected(updated);
      alert('Employee updated');
    } catch (err: any) {
      alert('Failed to update employee: ' + (err?.message || ''));
    }
  };

  return (
    <div className="employees-page">
      <h2>Employees</h2>
      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      <div className="employees-grid">
        <EmployeeList employees={employees} onSelect={handleSelect} />

        <div className="panel">
          {selected ? (
            <EmployeeProfile employee={selected} onSave={handleSave} />
          ) : (
            <p>Select an employee to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
