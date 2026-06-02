import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { useToast } from '@components/Toast';
import { adminNav } from './nav';
import { adminService, type UpdateEmailPayload } from '@services/adminService';
import type { ApiError } from '@services/api';

type Gateway = 'abacate_pay' | 'stripe';

export function SettingsPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [pixCommission, setPixCommission] = useState('10.00');
  const [pixFixed, setPixFixed] = useState('0');
  const [cardCommission, setCardCommission] = useState('10.00');
  const [cardFixed, setCardFixed] = useState('0');
  const [savingFees, setSavingFees] = useState(false);

  const [activeGateway, setActiveGateway] = useState<Gateway>('abacate_pay');
  const [abacatepayPublicKey, setAbacatepayPublicKey] = useState('');
  const [abacatepaySecretKey, setAbacatepaySecretKey] = useState('');
  const [abacatepaySecretKeySet, setAbacatepaySecretKeySet] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripeSecretKeySet, setStripeSecretKeySet] = useState(false);
  const [savingGateway, setSavingGateway] = useState(false);

  const [mailgunDomain, setMailgunDomain] = useState('');
  const [mailgunSecret, setMailgunSecret] = useState('');
  const [mailgunSecretSet, setMailgunSecretSet] = useState(false);
  const [mailgunEndpoint, setMailgunEndpoint] = useState('api.mailgun.net');
  const [mailFromAddress, setMailFromAddress] = useState('');
  const [mailFromName, setMailFromName] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    adminService
      .getSettings()
      .then((r) => {
        const s = r.data;
        setPixCommission(s.pix_commission_percent);
        setPixFixed(s.pix_fixed_fee_cents);
        setCardCommission(s.card_commission_percent);
        setCardFixed(s.card_fixed_fee_cents);
        setActiveGateway(s.active_gateway ?? 'abacate_pay');
        setAbacatepayPublicKey(s.abacatepay_public_key ?? '');
        setAbacatepaySecretKeySet(s.abacatepay_secret_key_set ?? false);
        setStripePublicKey(s.stripe_public_key ?? '');
        setStripeSecretKeySet(s.stripe_secret_key_set ?? false);
        setMailgunDomain(s.mailgun_domain ?? '');
        setMailgunSecretSet(s.mailgun_secret_set ?? false);
        setMailgunEndpoint(s.mailgun_endpoint ?? 'api.mailgun.net');
        setMailFromAddress(s.mail_from_address ?? '');
        setMailFromName(s.mail_from_name ?? '');
      })
      .catch((err: ApiError) => toast.error(err.message));
  }, [toast]);

  async function handleFeesSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingFees(true);
    try {
      await adminService.updateSettings({
        pix_commission_percent: parseFloat(pixCommission),
        pix_fixed_fee_cents: parseFloat(pixFixed),
        card_commission_percent: parseFloat(cardCommission),
        card_fixed_fee_cents: parseFloat(cardFixed),
      });
      toast.success(t('admin.feesUpdated'));
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setSavingFees(false);
    }
  }

  async function handleGatewaySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingGateway(true);
    try {
      const result = await adminService.updateGateway({
        active_gateway: activeGateway,
        abacatepay_public_key: abacatepayPublicKey || null,
        abacatepay_secret_key: abacatepaySecretKey || undefined,
        stripe_public_key: stripePublicKey || null,
        stripe_secret_key: stripeSecretKey || undefined,
      });
      setAbacatepaySecretKeySet(result.data.abacatepay_secret_key_set);
      setStripeSecretKeySet(result.data.stripe_secret_key_set);
      setAbacatepaySecretKey('');
      setStripeSecretKey('');
      toast.success(t('admin.gatewayUpdated'));
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setSavingGateway(false);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingEmail(true);
    try {
      const payload: UpdateEmailPayload = {
        mailgun_domain: mailgunDomain || null,
        mailgun_endpoint: mailgunEndpoint,
        mail_from_address: mailFromAddress || null,
        mail_from_name: mailFromName || null,
      };
      if (mailgunSecret) payload.mailgun_secret = mailgunSecret;
      const result = await adminService.updateEmail(payload);
      setMailgunSecretSet(result.data.mailgun_secret_set);
      setMailgunSecret('');
      toast.success(t('admin.emailSettingsSaved'));
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setSavingEmail(false);
    }
  }

  return (
    <AppLayout title={t('admin.panel')} nav={adminNav}>
      <PageHeader title={t('admin.settingsPage')} description={t('admin.settingsDesc')} />

      <div className="space-y-10">
        <form onSubmit={handleFeesSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
              <legend className="px-2 text-sm font-semibold text-slate-700">{t('admin.pix')}</legend>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.commissionPercent')}</span>
                <input type="number" step="0.01" min="0" max="100" value={pixCommission} onChange={(e) => setPixCommission(e.target.value)} required className="input" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.fixedFee')}</span>
                <input type="number" step="0.01" min="0" value={pixFixed} onChange={(e) => setPixFixed(e.target.value)} required className="input" />
              </label>
            </fieldset>

            <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
              <legend className="px-2 text-sm font-semibold text-slate-700">{t('admin.card')}</legend>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.commissionPercent')}</span>
                <input type="number" step="0.01" min="0" max="100" value={cardCommission} onChange={(e) => setCardCommission(e.target.value)} required className="input" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.fixedFee')}</span>
                <input type="number" step="0.01" min="0" value={cardFixed} onChange={(e) => setCardFixed(e.target.value)} required className="input" />
              </label>
            </fieldset>
          </div>

          <button type="submit" disabled={savingFees} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {savingFees ? t('common.saving') : t('common.save')}
          </button>
        </form>

        <form onSubmit={handleGatewaySubmit} className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-800">{t('admin.gatewaySection')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('admin.gatewayDesc')}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
            <button
              type="button"
              onClick={() => setActiveGateway('stripe')}
              className={`rounded-xl border-2 p-4 text-left transition-colors ${activeGateway === 'stripe' ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <span className="block text-sm font-semibold text-slate-800">{t('admin.stripe')}</span>
              {activeGateway === 'stripe' && <span className="mt-1 block text-xs font-medium text-brand-600">{t('admin.active')}</span>}
            </button>
            <button
              type="button"
              onClick={() => setActiveGateway('abacate_pay')}
              className={`rounded-xl border-2 p-4 text-left transition-colors ${activeGateway === 'abacate_pay' ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <span className="block text-sm font-semibold text-slate-800">{t('admin.abacatepay')}</span>
              {activeGateway === 'abacate_pay' && <span className="mt-1 block text-xs font-medium text-brand-600">{t('admin.active')}</span>}
            </button>
          </div>

          {activeGateway === 'stripe' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:max-w-2xl">
              {t('admin.stripeWarning')}
            </div>
          )}

          {activeGateway === 'abacate_pay' && (
            <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 sm:max-w-md">
              <legend className="px-2 text-sm font-semibold text-slate-700">{t('admin.abacatepay')}</legend>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.publicKey')}</span>
                <input
                  type="text"
                  value={abacatepayPublicKey}
                  onChange={(e) => setAbacatepayPublicKey(e.target.value)}
                  className="input font-mono text-sm"
                  placeholder="abacatepay_pk_..."
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.secretKey')}</span>
                {abacatepaySecretKeySet && !abacatepaySecretKey && (
                  <p className="mb-1 text-xs text-slate-400">{t('admin.secretKeySet')}</p>
                )}
                <input
                  type="password"
                  value={abacatepaySecretKey}
                  onChange={(e) => setAbacatepaySecretKey(e.target.value)}
                  className="input font-mono text-sm"
                  placeholder={abacatepaySecretKeySet ? t('admin.secretKeyPlaceholder') : 'abacatepay_sk_...'}
                />
              </label>
            </fieldset>
          )}

          {activeGateway === 'stripe' && (
            <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 sm:max-w-md">
              <legend className="px-2 text-sm font-semibold text-slate-700">{t('admin.stripe')}</legend>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.publicKey')}</span>
                <input
                  type="text"
                  value={stripePublicKey}
                  onChange={(e) => setStripePublicKey(e.target.value)}
                  className="input font-mono text-sm"
                  placeholder="pk_live_..."
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.secretKey')}</span>
                {stripeSecretKeySet && !stripeSecretKey && (
                  <p className="mb-1 text-xs text-slate-400">{t('admin.secretKeySet')}</p>
                )}
                <input
                  type="password"
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                  className="input font-mono text-sm"
                  placeholder={stripeSecretKeySet ? t('admin.secretKeyPlaceholder') : 'sk_live_...'}
                />
              </label>
            </fieldset>
          )}

          <button type="submit" disabled={savingGateway} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {savingGateway ? t('common.saving') : t('common.save')}
          </button>
        </form>
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-800">{t('admin.emailSection')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('admin.emailDesc')}</p>
          </div>

          <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 sm:max-w-md">
            <legend className="px-2 text-sm font-semibold text-slate-700">Mailgun</legend>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.mailgunDomain')}</span>
              <input
                type="text"
                value={mailgunDomain}
                onChange={(e) => setMailgunDomain(e.target.value)}
                className="input font-mono text-sm"
                placeholder="mg.seudominio.com.br"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.mailgunSecret')}</span>
              {mailgunSecretSet && !mailgunSecret && (
                <p className="mb-1 text-xs text-slate-400">{t('admin.secretKeySet')}</p>
              )}
              <input
                type="password"
                value={mailgunSecret}
                onChange={(e) => setMailgunSecret(e.target.value)}
                className="input font-mono text-sm"
                placeholder={mailgunSecretSet ? t('admin.secretKeyPlaceholder') : 'key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.mailgunRegion')}</span>
              <select
                value={mailgunEndpoint}
                onChange={(e) => setMailgunEndpoint(e.target.value)}
                className="input text-sm"
              >
                <option value="api.mailgun.net">EUA (api.mailgun.net)</option>
                <option value="api.eu.mailgun.net">Europa (api.eu.mailgun.net)</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.mailFromAddress')}</span>
              <input
                type="email"
                value={mailFromAddress}
                onChange={(e) => setMailFromAddress(e.target.value)}
                className="input text-sm"
                placeholder="noreply@seudominio.com.br"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{t('admin.mailFromName')}</span>
              <input
                type="text"
                value={mailFromName}
                onChange={(e) => setMailFromName(e.target.value)}
                className="input text-sm"
                placeholder="Ticketeira"
              />
            </label>
          </fieldset>

          <button type="submit" disabled={savingEmail} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {savingEmail ? t('common.saving') : t('common.save')}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
