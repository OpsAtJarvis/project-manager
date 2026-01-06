import { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  status?: string;
}

export function Badge({
  className = '',
  variant,
  status,
  children,
  ...props
}: BadgeProps) {
  let badgeVariant = variant || 'default';

  // Map status to variant if status is provided
  if (status) {
    switch (status.toLowerCase()) {
      case 'active':
        badgeVariant = 'success';
        break;
      case 'completed':
        badgeVariant = 'info';
        break;
      case 'pending':
        badgeVariant = 'warning';
        break;
      case 'archived':
        badgeVariant = 'default';
        break;
      case 'approved':
        badgeVariant = 'success';
        break;
      case 'rejected':
        badgeVariant = 'danger';
        break;
      default:
        badgeVariant = 'default';
    }
  }

  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[badgeVariant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
