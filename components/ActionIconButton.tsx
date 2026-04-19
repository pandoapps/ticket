import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

interface ActionIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  tone?: Tone;
  label: string;
}

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
  brand: 'border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100 hover:text-brand-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700',
};

export function ActionIconButton({
  icon,
  tone = 'neutral',
  label,
  className = '',
  ...rest
}: ActionIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${TONE_CLASSES[tone]} ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}
