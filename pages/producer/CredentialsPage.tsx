import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { useToast } from '@components/Toast';
import { Icons } from '@components/Icon';
import { producerNav } from './nav';
import { producerService, type Credentials, type AbacateEnvironment } from '@services/producerService';
import type { ApiError } from '@services/api';

export function CredentialsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [secretKey, setSecretKey] = useState('');
  const [environment, setEnvironment] = useState<AbacateEnvironment>('sandbox');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    producerService.credentials()
      .then((r) => { setCredentials(r.data); setEnvironment(r.data.environment); })
      .catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const trimmedSecret = secretKey.trim();
      const payload: Parameters<typeof producerService.saveCredentials>[0] = { environment };
      if (trimmedSecret !== '') payload.secret_key = trimmedSecret;
      const res = await producerService.saveCredentials(payload);
      setCredentials(res.data);
      setSecretKey('');
      if (res.data.validated_at) toast.success(t('producer.credentialsSaved'));
      else if (res.data.validation_error) toast.error(res.data.validation_error);
      else toast.success(t('producer.credentialsSavedSimple'));
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title={t('producer.panel')} nav={producerNav}>
      <PageHeader title={t('producer.credentialsPage')} description={t('producer.credentialsDesc')} />

      {credentials && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="glass-card flex items-center gap-3 px-4 py-3 text-sm">
            <span className="text-slate-500">{t('producer.statusLabel')}</span>
            {credentials.validated_at ? (
              <span className="chip bg-emerald-100 text-emerald-700">{t('producer.credentialValid')}</span>
            ) : credentials.has_secret ? (
              <span className="chip bg-rose-100 text-rose-700">{credentials.validation_error ?? t('producer.credentialInvalid')}</span>
            ) : (
              <span className="chip bg-slate-100 text-slate-600">{t('producer.notConfigured')}</span>
            )}
          </div>
          <div className="glass-card flex items-center gap-3 px-4 py-3 text-sm">
            <span className="text-slate-500">{t('producer.activeEnv')}</span>
            <EnvironmentChip value={credentials.environment} />
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card max-w-2xl space-y-5 p-6 animate-fade-up">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">{t('producer.environment')}</p>
          <div className="grid grid-cols-2 gap-3">
            <EnvironmentOption
              active={environment === 'sandbox'}
              onClick={() => setEnvironment('sandbox')}
              title={t('producer.sandbox')}
              description={t('producer.sandboxDesc')}
              icon={<Icons.sparkles className="h-5 w-5" />}
              accent="from-amber-500 to-orange-600"
            />
            <EnvironmentOption
              active={environment === 'production'}
              onClick={() => setEnvironment('production')}
              title={t('producer.production')}
              description={t('producer.productionDesc')}
              icon={<Icons.shield className="h-5 w-5" />}
              accent="from-emerald-500 to-teal-600"
            />
          </div>
          {environment === 'production' && (
            <p className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
              <Icons.sparkles className="h-4 w-4 flex-shrink-0" />
              {t('producer.productionWarning')}
            </p>
          )}
        </div>

        <label className="block">
          <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
            {t('producer.apiKey')}
            {credentials?.has_secret && <span className="chip bg-emerald-100 text-emerald-700">{t('producer.configured')}</span>}
          </span>
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            required={!credentials?.has_secret}
            placeholder={credentials?.has_secret ? t('producer.leaveBlankKeep') : environment === 'sandbox' ? 'abc_dev_...' : 'abc_prod_...'}
            className="input font-mono"
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-slate-500">
            {t('producer.apiKeyDesc')}
            {credentials?.has_secret && t('producer.apiKeyDescKeep')}
          </p>
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? t('producer.validating') : t('producer.saveAndValidate')}
        </button>
      </form>

      <ApiKeyInstructions environment={environment} />
      <WebhookInstructions />
    </AppLayout>
  );
}

function ApiKeyInstructions({ environment }: { environment: AbacateEnvironment }) {
  const { t } = useTranslation();
  const envLabel = environment === 'sandbox' ? t('producer.sandbox').toLowerCase() : t('producer.production').toLowerCase();
  const prefix = environment === 'sandbox' ? 'abc_dev_' : 'abc_prod_';

  return (
    <section className="mt-10 max-w-3xl">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <Icons.key className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-600">Primeiro passo</p>
          <h3 className="text-lg font-semibold text-slate-900">Como criar sua API Key no Abacate Pay</h3>
        </div>
      </div>
      <p className="mb-4 text-sm text-slate-600">
        Se ainda não tem uma chave, siga os passos abaixo no painel do Abacate Pay para gerar uma chave V2 de {envLabel}.
      </p>
      <div className="glass-card space-y-4 p-6">
        <ol className="space-y-3 text-sm text-slate-700">
          <Step n={1}>Acesse <a href="https://app.abacatepay.com" target="_blank" rel="noreferrer" className="font-medium text-brand-600 underline hover:text-brand-700">app.abacatepay.com</a> e faça login.</Step>
          <Step n={2}>No canto superior direito, alterne para <span className="font-medium">{envLabel}</span>.</Step>
          <Step n={3}>No menu lateral vá em <span className="font-medium">Desenvolvedores</span> → <span className="font-medium">Chaves de API</span>.</Step>
          <Step n={4}>Clique em <span className="font-medium">Nova chave</span>, selecione a versão <span className="chip bg-brand-100 text-brand-700">API V2</span> e dê um nome descritivo.</Step>
          <Step n={5}>Copie a chave que começa com <code className="chip bg-slate-100 text-slate-700 font-mono">{prefix}</code>. Ela é exibida <span className="font-medium">apenas uma vez</span>.</Step>
          <Step n={6}>Cole a chave no campo <span className="font-medium">{t('producer.apiKey')}</span> acima e clique em <span className="font-medium">{t('producer.saveAndValidate')}</span>.</Step>
        </ol>
      </div>
    </section>
  );
}

function WebhookInstructions() {
  const webhookUrl = useMemo(() => `${window.location.origin}/api/webhooks/abacate-pay`, []);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  function copyUrl() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success('URL do webhook copiada.');
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <section className="mt-10 max-w-3xl">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-600 text-white">
          <Icons.sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-600">Integração</p>
          <h3 className="text-lg font-semibold text-slate-900">Configurar webhook no Abacate Pay</h3>
        </div>
      </div>
      <p className="mb-4 text-sm text-slate-600">
        Depois de salvar as credenciais, registre o webhook abaixo no painel do Abacate Pay.
      </p>
      <div className="glass-card space-y-4 p-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">URL do webhook</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1 overflow-x-auto rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 font-mono text-xs text-slate-800">{webhookUrl}</div>
            <button type="button" onClick={copyUrl} className="btn btn-primary whitespace-nowrap">{copied ? 'Copiado ✓' : 'Copiar URL'}</button>
          </div>
        </div>
        <ol className="space-y-3 text-sm text-slate-700">
          <Step n={1}>Acesse <a href="https://app.abacatepay.com" target="_blank" rel="noreferrer" className="font-medium text-brand-600 underline hover:text-brand-700">app.abacatepay.com</a> e faça login.</Step>
          <Step n={2}>No menu lateral vá em <span className="font-medium">Desenvolvedores</span> → <span className="font-medium">Webhooks</span>. Selecione <span className="chip bg-brand-100 text-brand-700">API V2</span>.</Step>
          <Step n={3}>Clique em <span className="font-medium">Novo webhook</span> e cole a URL acima.</Step>
          <Step n={4}>Selecione os eventos <code className="chip bg-slate-100 text-slate-700">transparent.completed</code>, <code className="chip bg-slate-100 text-slate-700">checkout.completed</code> e <code className="chip bg-slate-100 text-slate-700">transparent.refunded</code>.</Step>
          <Step n={5}>Salve o webhook. A autenticação é feita automaticamente via assinatura HMAC (API V2).</Step>
        </ol>
      </div>
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-accent-600 text-xs font-semibold text-white shadow">{n}</span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}

function EnvironmentChip({ value }: { value: AbacateEnvironment }) {
  const { t } = useTranslation();
  if (value === 'production') return <span className="chip bg-gradient-to-r from-emerald-500 to-teal-600 text-white">● {t('producer.production')}</span>;
  return <span className="chip bg-gradient-to-r from-amber-500 to-orange-600 text-white">◐ {t('producer.sandbox')}</span>;
}

function EnvironmentOption({ active, onClick, title, description, icon, accent }: { active: boolean; onClick: () => void; title: string; description: string; icon: React.ReactNode; accent: string }) {
  return (
    <button type="button" onClick={onClick} className={`group relative overflow-hidden rounded-xl border p-4 text-left transition ${active ? 'border-transparent bg-white shadow-glass' : 'border-slate-200 bg-white/60 hover:bg-white/80'}`}>
      {active && <div className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${accent} opacity-10`} />}
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}>{icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-semibold ${active ? 'text-slate-900' : 'text-slate-800'}`}>{title}</p>
            {active && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">✓</span>}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </button>
  );
}
