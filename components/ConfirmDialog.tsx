import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Icons } from './Icon';

type Variant = 'default' | 'danger' | 'success' | 'warning' | 'info';

interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
}

interface PromptOptions extends Omit<ConfirmOptions, 'variant'> {
  variant?: Variant;
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'textarea';
  required?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;
type PromptFn = (options: PromptOptions) => Promise<string | null>;

interface DialogContextValue {
  confirm: ConfirmFn;
  prompt: PromptFn;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

interface InternalState {
  options: ConfirmOptions | PromptOptions;
  kind: 'confirm' | 'prompt';
  resolver: (value: never) => void;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InternalState | null>(null);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setState({ options, kind: 'confirm', resolver: resolve as (value: never) => void });
    });
  }, []);

  const prompt = useCallback<PromptFn>((options) => {
    setValue(options.defaultValue ?? '');
    return new Promise<string | null>((resolve) => {
      setState({ options, kind: 'prompt', resolver: resolve as (value: never) => void });
    });
  }, []);

  useEffect(() => {
    if (!state) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(null);
    };
    document.addEventListener('keydown', onKey);
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function close(result: boolean | string | null) {
    if (!state) return;
    (state.resolver as unknown as (v: boolean | string | null) => void)(result);
    setState(null);
    setValue('');
  }

  function handleConfirm() {
    if (state?.kind === 'prompt') {
      if ((state.options as PromptOptions).required && !value.trim()) return;
      close(value);
    } else {
      close(true);
    }
  }

  function handleCancel() {
    close(state?.kind === 'prompt' ? null : false);
  }

  const variant = state?.options.variant ?? 'default';
  const headerGradient = {
    default: 'from-brand-500 to-accent-600',
    danger: 'from-rose-500 to-red-600',
    success: 'from-emerald-500 to-teal-600',
    warning: 'from-amber-500 to-orange-600',
    info: 'from-sky-500 to-indigo-600',
  }[variant];

  const ringColor = {
    default: 'bg-white/20',
    danger: 'bg-white/20',
    success: 'bg-white/20',
    warning: 'bg-white/20',
    info: 'bg-white/20',
  }[variant];

  const confirmBtnClass = {
    default: 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-500/30 hover:brightness-110',
    danger: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30 hover:brightness-110',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:brightness-110',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:brightness-110',
    info: 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 hover:brightness-110',
  }[variant];

  const icon = state?.kind === 'prompt'
    ? <Icons.sparkles className="h-6 w-6" />
    : variant === 'danger'
    ? <Icons.shield className="h-6 w-6" />
    : variant === 'success'
    ? <Icons.sparkles className="h-6 w-6" />
    : variant === 'warning'
    ? <Icons.clock className="h-6 w-6" />
    : <Icons.sparkles className="h-6 w-6" />;

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) handleCancel();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/50 bg-white/90 shadow-[0_30px_80px_-20px_rgba(30,42,138,0.45)] backdrop-blur-xl animate-fade-up"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && state.kind !== 'prompt') handleConfirm();
            }}
          >
            <div className={`relative flex flex-col items-center gap-3 bg-gradient-to-br ${headerGradient} px-6 pb-5 pt-8 text-center text-white`}>
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${ringColor} backdrop-blur-sm ring-1 ring-white/40`}>
                {icon}
              </div>
              <h2 className="text-lg font-semibold">{state.options.title}</h2>
              {state.options.description && (
                <p className="max-w-sm text-sm text-white/90">{state.options.description}</p>
              )}
            </div>

            {state.kind === 'prompt' && (
              <div className="px-6 py-4">
                {(state.options as PromptOptions).inputType === 'textarea' ? (
                  <textarea
                    ref={(el) => {
                      inputRef.current = el;
                    }}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    rows={3}
                    placeholder={(state.options as PromptOptions).placeholder}
                    className="input"
                  />
                ) : (
                  <input
                    ref={(el) => {
                      inputRef.current = el;
                    }}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={(state.options as PromptOptions).placeholder}
                    className="input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirm();
                      }
                    }}
                  />
                )}
              </div>
            )}

            <div className="flex gap-2 border-t border-slate-200/60 px-5 py-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {state.options.cancelText ?? 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                autoFocus={state.kind === 'confirm'}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${confirmBtnClass}`}
              >
                {state.options.confirmText ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm(): ConfirmFn {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useConfirm must be used within DialogProvider');
  return ctx.confirm;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePrompt(): PromptFn {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('usePrompt must be used within DialogProvider');
  return ctx.prompt;
}
