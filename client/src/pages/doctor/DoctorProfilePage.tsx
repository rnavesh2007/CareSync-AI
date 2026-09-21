import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Stethoscope, Award, Building, Mail, Phone, CheckCircle2 } from 'lucide-react';

export const DoctorProfilePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then((res) => {
      setData(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const doctor = data?.doctor;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-teal-600" />
          Physician Profile & Professional Credentials
        </h1>
        <p className="text-xs text-slate-500">
          State medical board licensure, department allocations, and clinical consultation settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center text-center">
          <img
            src={data?.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'}
            alt=""
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-teal-100 shadow-soft"
          />
          <h2 className="text-base font-bold text-slate-900 mt-4">
            Dr. {data?.firstName} {data?.lastName}, MD, FACC
          </h2>
          <p className="text-xs text-teal-600 font-medium">Cardiovascular Specialist</p>
          <div className="mt-2">
            <Badge variant="teal" size="sm">License: MD-849204-OR</Badge>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="font-semibold text-slate-800">{doctor?.department || 'Cardiology'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Consultation Room:</span>
              <span className="font-semibold text-slate-800">{doctor?.roomNumber || 'Suite 302'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <Badge variant="success" size="sm">Available / On Duty</Badge>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              Specialization & Hospital Privileges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Primary Specialty</span>
                <p className="font-semibold text-slate-800">Cardiovascular Disease & Advanced Echocardiography</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Secondary Board Certification</span>
                <p className="font-semibold text-slate-800">Internal Medicine (ABIM Certified)</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Affiliated Hospital</span>
                <p className="font-semibold text-slate-800">CareSync Memorial Medical Center</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Consultation Office Hours</span>
                <p className="font-semibold text-slate-800">Mon - Fri: 08:30 AM - 04:30 PM</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-600" />
              Clinical Communication & Paging
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Clinical Email</span>
                <p className="font-semibold text-slate-800">{data?.email}</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Emergency Hospital Ext</span>
                <p className="font-semibold text-slate-800">Ext 4402 (Direct Pager)</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
