interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
};

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 font-semibold text-white shadow-lg shadow-brand-500/30 ring-2 ring-white/60 ${SIZE[size]}`}
    >
      {initials}
    </div>
  );
}
