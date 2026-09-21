import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Stethoscope, Search, Plus, Award } from 'lucide-react';

export const AdminDoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/doctors').then((res) => {
      setDoctors(res.data.doctors || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter((d) =>
    `${d.user?.firstName} ${d.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    d.department.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-600" />
            Medical Staff & Physician Credentialing
          </h1>
          <p className="text-xs text-slate-500">
            Physician credential status, department appointments, room assignments, and patient loads.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
          Credential New Doctor
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search physicians by name, department, or specialization..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((d) => (
          <Card key={d.id} hoverable className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={d.user?.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100'}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Dr. {d.user?.firstName} {d.user?.lastName}, MD
                    </h3>
                    <p className="text-xs text-brand-600 font-medium">{d.specialization}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {d.department} • Room {d.roomNumber || 'N/A'}
                    </p>
                  </div>
                </div>
                <Badge variant="teal" size="sm">{d.availability}</Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">License Number</span>
                  <span className="font-semibold text-slate-800">{d.licenseNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Active Patient Load</span>
                  <span className="font-semibold text-slate-800">
                    {d._count?.assignedPatients || 2} Patients
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm">
                Edit Allocation
              </Button>
              <Button variant="secondary" size="sm">
                View Schedule
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
