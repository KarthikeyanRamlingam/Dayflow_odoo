import React, { useState } from 'react';
import {
  Phone,
  Briefcase,
  DollarSign,
  Edit3,
  CheckCircle,
  Save,
} from 'lucide-react';
import type { UserProfile, Role } from '../types/hrms';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { formatCurrency, formatDate } from '../lib/utils';

interface ProfilePageProps {
  profile: UserProfile | null;
  role: Role;
  onUpdateProfile: (payload: Partial<UserProfile>) => Promise<void>;
}

export function ProfilePage({ profile, onUpdateProfile }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Editable fields
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(profile?.emergencyContact || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await onUpdateProfile({
        firstName,
        lastName,
        phone,
        address,
        emergencyContact,
      });
      setIsEditing(false);
      setSuccessMsg('Profile details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="py-20 text-center text-slate-400 font-sans">Loading your profile information...</div>
    );
  }

  const monthlyGross = profile.baseSalary ? Math.round(profile.baseSalary / 12) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl font-sans">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-8 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-brand-500/20 uppercase">
              {profile.firstName[0]}
              {profile.lastName ? profile.lastName[0] : ''}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {profile.firstName} {profile.lastName}
                </h2>
                <Badge status={profile.role} />
              </div>
              <p className="text-sm text-brand-600 font-mono font-bold mt-0.5">{profile.employeeCode}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {profile.jobTitle} • {profile.department}
              </p>
            </div>
          </div>

          <Button
            variant={isEditing ? 'ghost' : 'outline'}
            onClick={() => setIsEditing(!isEditing)}
            icon={<Edit3 className="w-4 h-4" />}
            className="shadow-sm font-semibold"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Contact Details'}
          </Button>
        </div>

        {successMsg && (
          <div className="mt-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {isEditing ? (
        /* Edit Profile Form Card */
        <Card className="border-slate-200/80 shadow-card bg-white">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Edit Personal & Contact Information</CardTitle>
            <CardDescription>
              Employees can update address, phone number, and emergency contact
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Emergency Contact"
                placeholder="Name & Contact (Relationship)"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>

            <Input
              label="Home / Residential Address"
              placeholder="123 Street Name, City, State, ZIP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={saving} icon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        /* Profile Details Breakdown Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Specifications Card */}
          <Card className="shadow-card bg-white border-slate-200/80">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <Briefcase className="w-4 h-4 text-brand-600" />
                Employment & Organization
              </CardTitle>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-bold text-slate-900">{profile.department}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Job Title</span>
                <span className="font-bold text-slate-900">{profile.jobTitle}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Employment Type</span>
                <span className="font-bold text-slate-900">{profile.employmentType || 'Full-time'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Employment Status</span>
                <Badge status={profile.status} className="text-[10px]" />
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Date of Joining</span>
                <span className="font-bold text-slate-900">{formatDate(profile.dateOfJoining)}</span>
              </div>
            </div>
          </Card>

          {/* Contact Details Card */}
          <Card className="shadow-card bg-white border-slate-200/80">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <Phone className="w-4 h-4 text-emerald-600" />
                Personal Contact Info
              </CardTitle>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Email Address</span>
                <span className="font-bold text-slate-900">{profile.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Phone Number</span>
                <span className="font-bold text-slate-900">{profile.phone || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Residential Address</span>
                <span className="font-bold text-slate-900 text-right max-w-[200px] truncate">
                  {profile.address || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Emergency Contact</span>
                <span className="font-bold text-slate-900">{profile.emergencyContact || 'Not set'}</span>
              </div>
            </div>
          </Card>

          {/* Compensation Structure Card */}
          <Card className="col-span-full shadow-card bg-white border-slate-200/80">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <DollarSign className="w-4 h-4 text-purple-600" />
                Compensation & Structure
              </CardTitle>
              <CardDescription>Annual gross remuneration package</CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Annual Base Salary</p>
                <p className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {formatCurrency(profile.baseSalary)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Monthly Gross Baseline</p>
                <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
                  {formatCurrency(monthlyGross)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Net Pay (Monthly)</p>
                <p className="text-2xl font-black text-brand-700 font-mono mt-1">
                  {formatCurrency(Math.round(monthlyGross * 0.85))}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
