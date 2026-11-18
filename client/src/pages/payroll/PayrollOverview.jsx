import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { triggerPrint } from '../../utils/exportUtils';
import {
  CreditCard,
  Printer,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  FileCheck,
} from 'lucide-react';

const PayrollOverview = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('November 2026');

  const baseSalary = user?.salary || 85000;
  const basicPay = Math.round(baseSalary * 0.5);
  const hra = Math.round(basicPay * 0.4);
  const specialAllowance = Math.round(baseSalary * 0.25);
  const conveyanceAllowance = Math.max(0, baseSalary - basicPay - hra - specialAllowance);
  const grossEarnings = basicPay + hra + specialAllowance + conveyanceAllowance;

  // Indian Statutory Deductions
  const epfDeduction = Math.round(basicPay * 0.12);
  const professionalTax = 200; // Standard Indian PT
  const tdsDeduction = Math.round(baseSalary * 0.08); // TDS
  const totalDeductions = epfDeduction + professionalTax + tdsDeduction;

  const netPay = grossEarnings - totalDeductions;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Payroll Overview & Payslips' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Payroll & Payslip Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent breakdown of earnings, statutory deductions, and monthly salary remittances
          </p>
        </div>

        <button
          onClick={triggerPrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Payslip</span>
        </button>
      </div>

      {/* Printable Payslip Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
        {/* Payslip Corporate Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              ₹
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {user?.organization?.name || 'INDIAN ENTERPRISE HRMS'}
              </h2>
              <p className="text-xs text-slate-400">
                CIN: {user?.organization?.cin || user?.organization?.registrationNumber || 'U72200MH2021PTC123456'} • GSTIN: {user?.organization?.gstin || '27AAPFU0939F1ZV'}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Disbursed via NEFT/IMPS
            </span>
            <p className="text-xs font-mono font-bold text-slate-800 mt-1.5">
              Pay Period: {selectedMonth}
            </p>
          </div>
        </div>

        {/* Employee Summary & Indian Statutory Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <p className="text-slate-400 font-medium">Employee Name</p>
            <p className="font-bold text-slate-900 mt-0.5">{user?.name}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Employee ID</p>
            <p className="font-bold text-slate-900 font-mono mt-0.5">
              EMP-{user?._id?.slice(-6).toUpperCase() || '00109'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Income Tax PAN</p>
            <p className="font-bold text-slate-900 font-mono mt-0.5">
              {user?.pan || 'ABCDE1234F'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">EPFO UAN</p>
            <p className="font-bold text-slate-900 font-mono mt-0.5">
              {user?.uan || '101234567890'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Department</p>
            <p className="font-bold text-slate-900 mt-0.5">
              {user?.department?.name || 'Engineering'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Designation</p>
            <p className="font-bold text-slate-900 mt-0.5">{user?.designation}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Bank A/C No.</p>
            <p className="font-bold text-slate-900 font-mono mt-0.5">
              {user?.bankAccount ? `•••• ${user.bankAccount.slice(-4)}` : '•••• •••• 4892'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Bank IFSC Code</p>
            <p className="font-bold text-slate-900 font-mono mt-0.5">
              {user?.ifsc || 'HDFC0001234'}
            </p>
          </div>
        </div>

        {/* Earnings & Deductions Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Earnings */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 pb-2 border-b border-slate-200 text-sm">
              Earnings & Allowances (Monthly)
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Basic Pay (50% CTC)</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(basicPay)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">House Rent Allowance (HRA 40%)</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(hra)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Special Allowance</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(specialAllowance)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Conveyance & Medical Allowance</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(conveyanceAllowance)}
                </span>
              </div>
              <div className="flex justify-between pt-2 font-black text-slate-900 text-sm">
                <span>Gross Monthly Earnings</span>
                <span className="font-mono text-emerald-600">
                  {formatCurrency(grossEarnings)}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 pb-2 border-b border-slate-200 text-sm">
              Statutory Deductions & Taxes
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Employees' Provident Fund (EPF 12%)</span>
                <span className="font-mono font-bold text-rose-600">
                  - {formatCurrency(epfDeduction)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Professional Tax (PT - State Govt)</span>
                <span className="font-mono font-bold text-rose-600">
                  - {formatCurrency(professionalTax)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Tax Deducted at Source (TDS - Income Tax)</span>
                <span className="font-mono font-bold text-rose-600">
                  - {formatCurrency(tdsDeduction)}
                </span>
              </div>
              <div className="flex justify-between pt-2 font-black text-slate-900 text-sm">
                <span>Total Statutory Deductions</span>
                <span className="font-mono text-rose-600">
                  - {formatCurrency(totalDeductions)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
              Net Take-Home Remittance
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Credited directly to Indian Bank Account on the 1st of every month via NEFT/IMPS
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              {formatCurrency(netPay)}
            </span>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              Verified & Cleared by Accounts
            </p>
          </div>
        </div>

        {/* Footnote */}
        <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          This is a computer-generated payroll summary document. No physical signature is required.
        </div>
      </div>
    </div>
  );
};

export default PayrollOverview;
