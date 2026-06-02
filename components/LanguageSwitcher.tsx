import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith('pt') ? 'pt-BR' : 'en';

  function toggle() {
    const next = current === 'en' ? 'pt-BR' : 'en';
    void i18n.changeLanguage(next);
    localStorage.setItem('ticketeira_lang', next);
  }

  return (
    <button
      onClick={toggle}
      title={current === 'en' ? 'Switch to Portuguese' : 'Mudar para Inglês'}
      className="flex h-8 items-center gap-1.5 rounded-full border border-white/50 bg-white/60 px-3 text-xs font-semibold text-slate-700 backdrop-blur transition hover:bg-white"
    >
      {current === 'en' ? (
        <><span>🇧🇷</span><span>PT</span></>
      ) : (
        <><span>🇺🇸</span><span>EN</span></>
      )}
    </button>
  );
}
