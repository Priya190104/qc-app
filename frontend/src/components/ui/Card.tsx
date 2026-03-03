import React from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className,
  noPadding = false,
}) => {
  return (
    <div className={clsx('bg-white rounded-lg shadow-md border border-gray-200', className)}>
      {(title || subtitle) && (
        <div className="border-b border-gray-200 px-6 py-4">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={noPadding ? '' : 'px-6 py-4'}>{children}</div>
    </div>
  );
};

export default Card;
