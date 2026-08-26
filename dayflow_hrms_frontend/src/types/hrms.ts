export type Role = 'EMPLOYEE' | 'HR_MANAGER' | 'ADMIN';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';

export interface UserProfile {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  department: string;
  jobTitle: string;
  employmentType: string;
  status: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
  baseSalary?: number;
  profilePhotoUrl?: string;
  role: Role;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  attendanceDate: string;
  checkIn: string;
  checkOut?: string | null;
  durationMinutes?: number | null;
  status: AttendanceStatus | string;
  notes?: string;
}

export interface LeaveRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: LeaveStatus;
  appliedAt?: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewComment?: string | null;
}

export interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  payrollMonth: string;
  paymentStatus: string;
  paymentDate?: string;
  remarks?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  pendingLeaves: number;
  monthlyPayrollExpenses: number;
  attendanceTrends: { date: string; present: number; target: number }[];
  departmentDistribution: { name: string; value: number }[];
  leaveTypeDistribution: { name: string; value: number }[];
  recentAttendance: AttendanceRecord[];
  recentLeaves: LeaveRecord[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'leave' | 'attendance' | 'payroll' | 'employee' | 'system';
  read: boolean;
  actionTab?: 'overview' | 'employees' | 'attendance' | 'leaves' | 'payroll' | 'profile';
}

