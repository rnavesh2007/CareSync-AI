import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { User, Mail, Phone, MapPin, Shield, Heart, FileText, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then((res) => {
      setData(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const patient = data?.patient;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-brand-600" />
          Patient Demographic Profile & Credentials
        </h1>
        <p className="text-xs text-slate-500">
          Electronic health record master identification, emergency contacts, and insurance data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left card: Identification */}
        <Card className="p-6 flex flex-col items-center text-center">
          <img
            src={data?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt=""
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-brand-100 shadow-soft"
          />
          <h2 className="text-base font-bold text-slate-900 mt-4">
            {data?.firstName} {data?.lastName}
          </h2>
          <p className="text-xs text-brand-600 font-medium">{data?.email}</p>
          <div className="mt-2">
            <Badge variant="brand" size="sm">MRN: CS-948201-P</Badge>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Date of Birth:</span>
              <span className="font-semibold text-slate-800">
                {patient?.dob ? new Date(patient.dob).toLocaleDateString() : 'May 14, 1990'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Biological Sex:</span>
              <span className="font-semibold text-slate-800">{patient?.gender || 'Female'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Blood Type:</span>
              <span className="font-semibold text-slate-800">{patient?.bloodGroup || 'A+'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Primary Care:</span>
              <span className="font-semibold text-slate-800">Dr. Marcus Vance, MD</span>
            </div>
          </div>
        </Card>

        {/* Right 2 columns: Details & Insurance */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              Contact & Emergency Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Primary Phone</span>
                <p className="font-semibold text-slate-800">{data?.phone || '+91 98401 23456'}</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Emergency Contact</span>
                <p className="font-semibold text-slate-800">
                  {patient?.emergencyContact || 'Meena Kumar (Daughter / Caregiver) - +91 98404 56789'}
                </p>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400 block mb-1">Residential Address</span>
                <p className="font-semibold text-slate-800">
                  {patient?.address || '42 Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600" />
              Health Insurance & Coverage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Insurance Provider</span>
                <p className="font-semibold text-slate-800">BlueCross Comprehensive Preferred</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Policy Member ID</span>
                <p className="font-semibold text-slate-800">BC-88492019-01</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Group Number</span>
                <p className="font-semibold text-slate-800">GRP-74892</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Coverage Status</span>
                <Badge variant="success" size="sm">Active (In-Network)</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
