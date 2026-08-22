import type { Employee } from '../types/employee';

export function EmployeeList({ employees, onSelect }: { employees: Employee[]; onSelect: (e: Employee) => void }) {
  return (
    <div className="panel employee-list">
      <h3>Employee list</h3>
      <ul>
        {employees.map((e) => (
          <li key={e.id} className="employee-item" onClick={() => onSelect(e)}>
            <div>
              <strong>
                {e.firstName} {e.lastName}
              </strong>
              <div className="muted">{e.jobTitle} — {e.department}</div>
            </div>
            <div className="muted">{e.email}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
