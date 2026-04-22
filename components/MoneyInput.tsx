import { useMemo, type InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: number;
  onValueChange: (value: number) => void;
};

function formatFromCents(cents: number): string {
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  const reaisStr = reais.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${reaisStr},${centavos.toString().padStart(2, '0')}`;
}

export function MoneyInput({ value, onValueChange, className, ...rest }: Props) {
  const displayValue = useMemo(() => {
    const cents = Math.round((Number.isFinite(value) ? value : 0) * 100);
    return formatFromCents(cents);
  }, [value]);

  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    const cents = digits === '' ? 0 : parseInt(digits, 10);
    onValueChange(cents / 100);
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">R$</span>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        className={`${className ?? 'input'} pl-10 text-right tabular-nums`}
        {...rest}
      />
    </div>
  );
}
