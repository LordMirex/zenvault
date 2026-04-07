import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { Link } from 'react-router-dom';
import { X, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export const AdminCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'rounded-2xl border border-slate-200 bg-white shadow-[0_22px_55px_-35px_rgba(15,23,42,0.42)]',
      className,
    )}
  >
    {children}
  </div>
);

export const AdminBadge = ({
  value,
  className,
}: {
  value: string;
  className?: string;
}) => {
  const tone = getBadgeTone(value);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        tone,
        className,
      )}
    >
      {value}
    </span>
  );
};

export const AdminMetricCard = ({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: string;
}) => (
  <AdminCard className="p-5">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className={cn('mt-3 text-3xl font-black text-slate-900', accent)}>{value}</p>
    <p className="mt-2 text-sm text-slate-500">{detail}</p>
  </AdminCard>
);

export const AdminPageHeading = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <h2 className="text-2xl font-black text-slate-900 md:text-3xl">{title}</h2>
      {description && <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">{description}</p>}
    </div>
    {actions}
  </div>
);

export const AdminTextInput = ({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
    <input
      {...props}
      className={cn(
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200',
        props.className,
      )}
    />
  </label>
);

export const AdminSelect = ({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
    <select
      {...props}
      className={cn(
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200',
        props.className,
      )}
    >
      {children}
    </select>
  </label>
);

export const AdminTextArea = ({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
    <textarea
      {...props}
      className={cn(
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200',
        props.className,
      )}
    />
  </label>
);

export const AdminTableWrap = ({ children, className }: { children: ReactNode; className?: string }) => (
  <AdminCard className={cn('overflow-hidden', className)}>
    <div className="overflow-x-auto">{children}</div>
  </AdminCard>
);

export const AdminButton = ({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
}) => (
  <button
    {...props}
    className={cn(
      'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
      variant === 'primary' && 'bg-violet-600 text-white hover:bg-violet-700',
      variant === 'secondary' && 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
      variant === 'ghost' && 'text-slate-600 hover:bg-slate-100',
      className,
    )}
  >
    {children}
  </button>
);

export const AdminActionBar = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn('flex items-center gap-1.5', className)}>{children}</div>;

type AdminActionTone = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'slate';

type AdminIconActionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: LucideIcon;
  label: string;
  tone?: AdminActionTone;
  to?: string;
};

const adminActionToneClasses: Record<AdminActionTone, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100',
  violet: 'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300 hover:bg-violet-100',
  amber: 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100',
  rose: 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100',
  slate: 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100',
};

export const AdminIconAction = ({
  icon: Icon,
  label,
  tone = 'slate',
  to,
  className,
  disabled,
  type = 'button',
  ...props
}: AdminIconActionProps) => {
  const sharedClassName = cn(
    'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-violet-200',
    adminActionToneClasses[tone],
    disabled && 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 hover:bg-slate-100',
    className,
  );

  const content = (
    <>
      <Icon className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </>
  );

  if (to && !disabled) {
    return (
      <Link aria-label={label} title={label} to={to} className={sharedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button aria-label={label} title={label} type={type} className={sharedClassName} disabled={disabled} {...props}>
      {content}
    </button>
  );
};

export const AdminNotice = ({
  children,
  tone = 'success',
  className,
}: {
  children: ReactNode;
  tone?: 'success' | 'danger' | 'info';
  className?: string;
}) => (
  <AdminCard
    className={cn(
      'p-4 text-sm font-medium',
      tone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
      tone === 'danger' && 'border-rose-200 bg-rose-50 text-rose-700',
      tone === 'info' && 'border-sky-200 bg-sky-50 text-sky-700',
      className,
    )}
  >
    {children}
  </AdminCard>
);

export const AdminModal = ({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-950/55"
        onClick={onClose}
        type="button"
      />
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_35px_90px_-40px_rgba(15,23,42,0.6)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-xl font-black text-slate-900">{title}</h3>
            {description && <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>}
          </div>
          <button
            aria-label="Close modal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="border-t border-slate-200 px-6 py-5">{footer}</div>}
      </div>
    </div>
  );
};

const getBadgeTone = (value: string) => {
  const normalized = value.toLowerCase();

  if (normalized.includes('active') || normalized.includes('approved') || normalized.includes('completed') || normalized.includes('healthy') || normalized.includes('live') || normalized.includes('enabled')) {
    return 'bg-emerald-100 text-emerald-700';
  }

  if (normalized.includes('pending') || normalized.includes('review') || normalized.includes('watch')) {
    return 'bg-amber-100 text-amber-700';
  }

  if (normalized.includes('paused') || normalized.includes('suspended') || normalized.includes('draft') || normalized.includes('frozen') || normalized.includes('flagged')) {
    return 'bg-rose-100 text-rose-700';
  }

  return 'bg-slate-100 text-slate-700';
};
