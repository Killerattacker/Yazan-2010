import React from 'react';
import { UserRole, Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  currentView: string;
  lang: Language;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onToggleLang: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  role,
  currentView,
  lang,
  onNavigate,
  onLogout,
  onToggleLang
}) => {
  const isAr = lang === 'ar';

  const t = {
    ar: {
      adminLogin: '\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0645\u0634\u0631\u0641',
      controlPanel: '\u0645\u0631\u0643\u0632 \u0627\u0644\u0625\u062F\u0627\u0631\u0629',
      home: '\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629',
      about: '\u0639\u0646 \u0627\u0644\u0645\u0646\u0635\u0629',
      title: '\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0633\u0645\u0627\u0631\u062A',
      tagline: '\u062A\u0639\u0644\u064A\u0645 \u062A\u0641\u0627\u0639\u0644\u064A \u0645\u062F\u0639\u0648\u0645 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A',
      footer: '\u00A9 2026 \u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0633\u0645\u0627\u0631\u062A. \u062A\u0639\u0644\u064A\u0645 \u0630\u0643\u064A \u0644\u0645\u0633\u062A\u0642\u0628\u0644 \u0623\u0641\u0636\u0644.',
      langName: 'English'
    },
    en: {
      adminLogin: 'Admin Portal',
      controlPanel: 'Management Center',
      home: 'Home',
      about: 'About',
      title: 'Smart Academy',
      tagline: 'Interactive learning powered by AI',
      footer: '© 2026 Smart Academy. Smart learning for a better future.',
      langName: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629'
    }
  }[lang];

  return (
    <div className={`min-h-screen flex flex-col ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-50">
        <div className="glass mx-4 md:mx-10 mt-4 rounded-3xl px-5 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className={`flex items-center gap-4 ${isAr ? '' : 'flex-row-reverse'}`}>
            <div className="flex items-center gap-3 text-[#0f766e]">
              <div className="bg-white w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 leading-tight">{t.title}</p>
                <p className="text-xs text-slate-500 font-medium">{t.tagline}</p>
              </div>
            </div>
          </div>

          <nav className={`hidden md:flex items-center gap-8 ${isAr ? '' : 'flex-row-reverse'}`}>
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-semibold pb-1 border-b-2 transition-all ${
                currentView === 'home'
                  ? 'border-[#0f766e] text-[#0f766e]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.home}
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`text-sm font-semibold pb-1 border-b-2 transition-all ${
                currentView === 'about'
                  ? 'border-[#0f766e] text-[#0f766e]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.about}
            </button>
          </nav>

          <div className={`flex items-center gap-3 ${isAr ? '' : 'flex-row-reverse'}`}>
            {role === UserRole.STUDENT ? (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="btn-primary px-5 py-2.5 rounded-2xl text-sm font-semibold"
                >
                  {t.adminLogin}
                </button>
                <button
                  onClick={onToggleLang}
                  className="flex items-center gap-2 text-slate-500 text-sm font-semibold hover:text-[#0f766e] transition-colors"
                >
                  <i className="fas fa-language text-lg"></i>
                  <span>{t.langName}</span>
                </button>
              </>
            ) : (
              <div className={`flex items-center gap-3 ${isAr ? '' : 'flex-row-reverse'}`}>
                <button
                  onClick={onLogout}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
                <button
                  onClick={() => onNavigate('admin')}
                  className="flex items-center gap-2 text-[#0f766e] badge px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  <i className="fas fa-shield-alt"></i>
                  <span>{t.controlPanel}</span>
                </button>
                <button
                  onClick={onToggleLang}
                  className="flex items-center gap-2 text-slate-500 text-sm font-semibold hover:text-[#0f766e] px-2"
                >
                  <span>{t.langName}</span>
                  <i className="fas fa-globe"></i>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="md:hidden px-6 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-full text-xs font-semibold ${
                currentView === 'home' ? 'btn-primary' : 'btn-outline'
              }`}
            >
              {t.home}
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`px-4 py-2 rounded-full text-xs font-semibold ${
                currentView === 'about' ? 'btn-primary' : 'btn-outline'
              }`}
            >
              {t.about}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto py-10 px-4 md:px-6">{children}</main>

      <footer className="py-10 text-center text-slate-500 text-sm font-medium border-t border-slate-100 bg-white/70">
        {t.footer}
      </footer>
    </div>
  );
};

export default Layout;
