import React from 'react';
import Modal from './Modal';
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const iconConfig = {
    danger: {
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    warning: {
      icon: HelpCircle,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    primary: {
      icon: HelpCircle,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
  };

  const config = iconConfig[variant] || iconConfig.danger;
  const Icon = config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 ${config.btn}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div className={`p-3 rounded-2xl border ${config.color} shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
