import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Settings, Building2, Shield, Bell, Database, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Hospital System Settings & Facility Configuration
        </h1>
        <p className="text-xs text-slate-500">
          Global clinical parameters, role permissions, encryption policies, and hospital facility details.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Facility configurations successfully synchronized!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Facility Info */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            Hospital Facility Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Facility Name</label>
              <input
                type="text"
                defaultValue="CareSync Memorial Health System"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hospital NPI Number</label>
              <input
                type="text"
                defaultValue="NPI-1948201948"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Trauma Designation</label>
              <input
                type="text"
                defaultValue="Level II Adult & Pediatric Trauma Center"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Operations Region</label>
              <input
                type="text"
                defaultValue="Pacific Northwest (Oregon / Washington)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Security & Access */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" />
            Clinical Security & Access Controls
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Role-Based Access Control (RBAC)</p>
                <p className="text-slate-500 text-[11px]">Strict boundary isolation between Patient, Doctor, and Admin</p>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Automated Patient Vital Anomaly Triage</p>
                <p className="text-slate-500 text-[11px]">Flag vitals exceeding systolic &gt;140 or SpO2 &lt;95%</p>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Outpatient Live Queue Ticker Broadcast</p>
                <p className="text-slate-500 text-[11px]">Synchronize waiting room monitors with doctor desks</p>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md">
            Save System Configurations
          </Button>
        </div>
      </form>
    </div>
  );
};
