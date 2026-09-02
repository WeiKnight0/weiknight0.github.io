import {
  type Locale,
  getLanguagePath,
  getLocalizedPath,
  i18n,
  localeLabels,
  locales,
} from '@/utils/i18n';
import { Profile } from '@/utils/Profile';

type NavLink = {
  href: string;
  labelKey: keyof typeof i18n.en.nav;
};

const realLinks: NavLink[] = [
  { href: '/real/', labelKey: 'overview' },
  { href: '/real/resume/', labelKey: 'resume' },
  { href: '/real/projects/', labelKey: 'projects' },
  { href: '/real/notes/', labelKey: 'notes' },
  { href: '/real/blog/', labelKey: 'blogs' },
];

const fictionLinks: NavLink[] = [
  { href: '/fiction/', labelKey: 'overview' },
  { href: '/fiction/oc/', labelKey: 'oc' },
  { href: '/fiction/world/', labelKey: 'world' },
  { href: '/fiction/novels/', labelKey: 'novels' },
  { href: '/fiction/commissions/', labelKey: 'commissions' },
];

const LinkGroup = ({
  label,
  labelKey,
  links,
  themeClass,
}: {
  label: string;
  labelKey: string;
  links: Array<NavLink & { label: string }>;
  themeClass: string;
}) => (
  <details
    className="group relative"
    data-dropdown
    data-hover-dropdown
    data-dropdown-group="desktop-nav-dropdown"
  >
    <summary className={`flex h-9 cursor-pointer list-none items-center gap-2 px-4 font-formal-sans text-sm font-semibold leading-none transition-colors ${themeClass}`}>
      <span data-home-i18n={labelKey}>{label}</span>
      <span className="text-xs transition-transform group-open:rotate-180 opacity-50">
        ⌄
      </span>
    </summary>
    <div className="site-popover nav-dropdown-panel absolute left-0 top-full z-30 grid w-48 gap-1 border p-2 shadow-2xl backdrop-blur-md">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          data-localized-path={link.href}
          data-home-i18n={`nav.${link.labelKey}`}
          className={`px-3 py-2 font-formal-sans text-sm transition-colors ${themeClass}`}
        >
          {link.label}
        </a>
      ))}
    </div>
  </details>
);

const LanguageGroup = ({
  label,
  labelKey,
  locale,
  pathname,
}: {
  label: string;
  labelKey: string;
  locale: Locale;
  pathname: string;
}) => (
  <details
    className="group relative"
    data-dropdown
    data-dropdown-group="desktop-nav-dropdown"
  >
    <summary className="flex cursor-pointer list-none items-center gap-2 border border-white/10 px-3 py-1.5 text-xs font-bold text-white/50 transition hover:bg-white/10 hover:text-white uppercase tracking-widest">
      <span data-home-i18n={labelKey}>{label}</span>
      <span className="text-[10px] transition group-open:rotate-180">
        ▼
      </span>
    </summary>
    <div className="site-popover nav-dropdown-panel absolute right-0 top-full z-30 grid w-32 gap-1 border p-2 shadow-2xl backdrop-blur-md">
      {locales.map((targetLocale) => (
        <a
          key={targetLocale}
          href={getLanguagePath(pathname, targetLocale)}
          aria-current={targetLocale === locale ? 'page' : undefined}
          data-language-link
          data-target-locale={targetLocale}
          className="px-3 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white aria-[current=page]:text-white aria-[current=page]:bg-white/5"
        >
          {localeLabels[targetLocale]}
        </a>
      ))}
    </div>
  </details>
);

/**
 * @description Renders the shared responsive navigation for real and fictional sections.
 * @param locale Locale used for the initial static navigation labels.
 * @param pathname Current route used to build localized navigation targets.
 */
const Navbar = ({ locale, pathname }: { locale: Locale; pathname: string }) => {
  const text = i18n[locale].nav;
  const localizedRealLinks = realLinks.map((link) => ({
    ...link,
    href: getLocalizedPath(link.href, locale),
    label: text[link.labelKey],
  }));
  const localizedFictionLinks = fictionLinks.map((link) => ({
    ...link,
    href: getLocalizedPath(link.href, locale),
    label: text[link.labelKey],
  }));
  const homeHref = getLocalizedPath('/', locale);

  return (
    <header className="site-header sticky top-0 z-40 border-b backdrop-blur-lg">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3"
        aria-label="Primary navigation"
      >
        <a href={homeHref} className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
          <img
            src={Profile.avatar}
            alt={`${Profile.name} avatar`}
            className="h-9 w-9 border border-white/20 rounded-md"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white uppercase">
              WeiKnight
            </span>
            <span className="text-[10px] text-white/40 tracking-widest uppercase font-real-mono">
              Personal Site
            </span>
          </div>
        </a>

        <div className="hidden items-center gap-4 md:flex" data-dropdown-scope>
          <a
            href={homeHref}
            data-home-link="home"
            data-home-i18n="nav.home"
            data-localized-path="/"
            className="px-4 py-2 text-sm font-semibold text-white/60 transition hover:text-white uppercase tracking-wider"
          >
            {text.home}
          </a>
          <div className="h-4 w-px bg-white/20"></div>
          <LinkGroup
            label={text.real}
            labelKey="nav.real"
            links={localizedRealLinks}
            themeClass="text-white/70 hover:text-real-accent hover:bg-real-accent/10"
          />
          <LinkGroup
            label={text.fiction}
            labelKey="nav.fiction"
            links={localizedFictionLinks}
            themeClass="text-white/70 hover:text-fiction-accent hover:bg-fiction-accent/10"
          />
          <div className="h-4 w-px bg-white/20 ml-2 mr-2"></div>
          <a
            href="/login/"
            data-account-login
            data-home-i18n="nav.login"
            className="border border-real-accent/50 bg-real-accent/10 px-3 py-1.5 text-xs font-real-mono font-bold uppercase tracking-widest text-real-accent transition hover:bg-real-accent hover:text-black"
          >
            {text.login}
          </a>
          <div data-account-profile hidden className="group/account relative" aria-label="Account menu">
            <a href="/profile/" className="block rounded-full transition hover:ring-2 hover:ring-real-accent" aria-label="Personal center">
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-real-accent/60 bg-real-accent/10 text-sm font-black text-real-accent">
                <img data-account-avatar-image hidden alt="" className="h-full w-full object-cover" />
                <span data-account-avatar-fallback>?</span>
              </span>
            </a>
            <div className="site-popover nav-dropdown-panel invisible pointer-events-none absolute left-0 top-full z-30 grid w-52 origin-top-left gap-1 border p-2 opacity-0 shadow-2xl backdrop-blur-md transition group-hover/account:visible group-hover/account:pointer-events-auto group-hover/account:opacity-100 group-focus-within/account:visible group-focus-within/account:pointer-events-auto group-focus-within/account:opacity-100">
              <a href="/profile/" data-home-i18n="nav.profile" className="px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">{text.profile}</a>
              <a data-account-admin data-home-i18n="nav.administration" hidden href="/admin/blogs/" target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-sm text-real-accent transition hover:bg-real-accent/10">{text.administration}</a>
              <button data-account-logout data-home-i18n="nav.signOut" type="button" className="border-t border-white/10 px-3 py-2 text-left text-sm text-red-200 transition hover:bg-red-300/10">{text.signOut}</button>
            </div>
          </div>
          <button type="button" data-theme-toggle className="flex h-9 w-9 items-center justify-center border border-white/10 text-base text-white/70 transition hover:border-real-accent/50 hover:text-real-accent" aria-label="Switch color theme">
            <span data-theme-icon aria-hidden="true">☀</span>
          </button>
          <LanguageGroup
            label={text.language}
            labelKey="nav.language"
            locale={locale}
            pathname={pathname}
          />
        </div>

        {/* Mobile menu */}
        <details className="md:hidden">
          <summary className="cursor-pointer list-none border border-white/10 px-4 py-2 text-xs font-semibold text-white uppercase tracking-widest">
            <span data-home-i18n="nav.menu">{text.menu}</span>
          </summary>
          <div
            className="site-popover absolute left-0 right-0 top-full mt-1 border-b p-4 shadow-2xl backdrop-blur-xl"
            data-dropdown-scope
          >
            <div className="grid gap-4">
              <a href={homeHref} className="text-white/80 font-bold uppercase tracking-widest text-sm py-2">{text.home}</a>
              <div className="pl-4 border-l border-white/10 grid gap-2">
                 <div className="mb-1 font-formal-sans text-xs text-real-accent">REAL_</div>
                 {localizedRealLinks.map(l => <a key={l.href} href={l.href} data-localized-path={l.href} data-home-i18n={`nav.${l.labelKey}`} className="py-1 font-formal-sans text-sm text-white/60">{l.label}</a>)}
              </div>
              <div className="pl-4 border-l border-white/10 grid gap-2">
                 <div className="mb-1 font-formal-sans text-xs text-fiction-accent">FICTION*</div>
                 {localizedFictionLinks.map(l => <a key={l.href} href={l.href} data-localized-path={l.href} data-home-i18n={`nav.${l.labelKey}`} className="py-1 font-formal-sans text-sm text-white/60">{l.label}</a>)}
              </div>
              <a href="/login/" data-account-login data-home-i18n="nav.login" className="border border-real-accent/40 bg-real-accent/10 px-4 py-3 text-center text-xs font-real-mono font-bold uppercase tracking-widest text-real-accent">{text.login}</a>
              <a href="/profile/" data-account-profile hidden className="flex items-center justify-center gap-3 border border-real-accent/40 bg-real-accent/10 px-4 py-3 text-xs font-real-mono font-bold uppercase tracking-widest text-real-accent"><span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full border border-real-accent/60 bg-real-accent/10"><img data-account-avatar-image hidden alt="" className="h-full w-full object-cover" /><span data-account-avatar-fallback>?</span></span><span data-home-i18n="nav.profile">{text.profile}</span></a>
              <a data-account-admin data-home-i18n="nav.administration" hidden href="/admin/blogs/" target="_blank" rel="noopener noreferrer" className="border border-real-accent/30 px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-real-accent">{text.administration}</a>
              <button data-account-logout data-home-i18n="nav.signOut" hidden type="button" className="border border-red-300/25 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-200">{text.signOut}</button>
              <button type="button" data-theme-toggle className="flex items-center justify-center gap-2 border border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/70">
                <span data-theme-icon aria-hidden="true">☀</span><span data-theme-label>Light theme</span>
              </button>
            </div>
          </div>
        </details>
      </nav>
      <style>{`
      details[open] > .nav-dropdown-panel {
        animation: nav-dropdown-in 150ms ease-out forwards;
        transform-origin: top;
      }

      @keyframes nav-dropdown-in {
        from {
          opacity: 0;
          transform: scaleY(0.95);
        }
        to {
          opacity: 1;
          transform: scaleY(1);
        }
      }
    `}</style>
    </header>
  );
};

export { Navbar };
