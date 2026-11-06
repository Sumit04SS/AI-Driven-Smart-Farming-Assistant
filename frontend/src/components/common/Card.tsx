import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  icon,
  children,
  className = '',
  headerClassName = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200/80 transition-all duration-300 overflow-hidden ${className}`}
    >
      {(title || action || icon) && (
        <div
          className={`px-6 py-4.5 border-b border-slate-100 flex items-center justify-between gap-4 ${headerClassName}`}
        >
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2.5 bg-emerald-50/80 text-emerald-700 rounded-xl shrink-0 border border-emerald-100/80 shadow-2xs">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="font-bold text-slate-900 text-base tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
