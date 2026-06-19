interface AdminButtonProps {
  onClick: () => void;
  className?: string;
  active?: boolean;
}

export function AdminButton({ onClick, className = '', active }: AdminButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
        active
          ? 'border-brand-500 bg-brand-50 text-brand-700'
          : 'border-surface-200 bg-white text-surface-600 hover:border-brand-300 hover:text-brand-700',
        className,
      ].join(' ')}
    >
      Acceso admin
    </button>
  );
}
