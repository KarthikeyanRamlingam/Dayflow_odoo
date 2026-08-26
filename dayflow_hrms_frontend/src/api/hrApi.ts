import axios from 'axios';
const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const headers = () => {
  const token = localStorage.getItem('dayflow_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export type Attendance = { id:number; employeeName:string; checkIn:string; checkOut?:string; status:string };
export type Leave = { id:number; employeeName:string; startDate:string; endDate:string; type:string; reason:string; status:string };
export type Payroll = { id:number; employeeName:string; basicSalary:number; allowances:number; deductions:number; netSalary:number; payrollMonth:string };

export const hrApi = {
  dashboard: () => axios.get<Record<string, number>>(`${base}/dashboard`, { headers: headers() }).then(r => r.data),
  attendance: () => axios.get<Attendance[]>(`${base}/attendance`, { headers: headers() }).then(r => r.data),
  checkIn: () => axios.post(`${base}/attendance/check-in`, {}, { headers: headers() }),
  checkOut: () => axios.post(`${base}/attendance/check-out`, {}, { headers: headers() }),
  leaves: () => axios.get<Leave[]>(`${base}/leaves`, { headers: headers() }).then(r => r.data),
  requestLeave: (data:{startDate:string;endDate:string;type:string;reason:string}) => axios.post(`${base}/leaves`, data, { headers: headers() }),
  decideLeave: (id:number,status:'APPROVED'|'REJECTED') => axios.patch(`${base}/leaves/${id}/${status}`, {}, { headers: headers() }),
  payroll: () => axios.get<Payroll[]>(`${base}/payroll`, { headers: headers() }).then(r => r.data)
};
