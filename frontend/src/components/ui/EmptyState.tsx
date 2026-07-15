import React from 'react';
import clsx from 'clsx';
import { FileX, Search, Inbox } from 'lucide-react';

type EmptyStateIcon = 'file' | 'search' | 'inbox';

interface EmptyStateBaseProps {
  title?: string;
  description?: string;
  /** Icon yang ditampilkan */
  icon?: EmptyStateIcon | React.ReactNode;
  /** Tombol aksi (misalnya "Hapus filter") */
  action?: React.ReactNode;
  className?: string;
}

interface EmptyStateDivProps extends EmptyStateBaseProps {
  /** Render sebagai div biasa (default) */
  as?: 'div';
}

interface EmptyStateTrProps extends EmptyStateBaseProps {
  /** Render sebagai table row (untuk konteks `<tbody>`) */
  as: 'tr';
  /** Jumlah kolom tabel (wajib jika as="tr") */
  cols: number;
}

type EmptyStateProps = EmptyStateDivProps | EmptyStateTrProps;

const iconMap: Record<EmptyStateIcon, React.ComponentType<{ className?: string }>> = {
  file: FileX,
  search: Search,
  inbox: Inbox,
};

function EmptyStateContent({
  title = 'Tidak ada data ditemukan',
  description,
  icon = 'file',
  action,
  className,
}: EmptyStateBaseProps) {
  const IconComponent = typeof icon === 'string' ? iconMap[icon as EmptyStateIcon] : null;

  return (
    <div className={clsx('flex flex-col items-center justify-center py-14 text-center', className)}>
      <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        {IconComponent ? (
          <IconComponent className="w-5 h-5 text-gray-400" aria-hidden="true" />
        ) : (
          <span aria-hidden="true">{icon as React.ReactNode}</span>
        )}
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-gray-400 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/**
 * Komponen empty state yang dapat digunakan di konteks div maupun tabel.
 *
 * @example
 * // Div biasa
 * <EmptyState title="Tidak ada data" />
 *
 * // Di dalam tbody tabel
 * <EmptyState as="tr" cols={5} title="Tidak ada berkas" />
 *
 * // Dengan aksi hapus filter
 * <EmptyState
 *   icon="search"
 *   title='Tidak ada hasil untuk "abc"'
 *   action={<button onClick={clear}>Hapus filter</button>}
 * />
 */
export function EmptyState(props: EmptyStateProps) {
  if (props.as === 'tr') {
    const { cols, as: _as, ...rest } = props;
    return (
      <tr>
        <td colSpan={cols} className="p-0">
          <EmptyStateContent {...rest} />
        </td>
      </tr>
    );
  }

  const { as: _as, ...rest } = props;
  return <EmptyStateContent {...rest} />;
}

export default EmptyState;
