import {
  type Locale,
  getLanguagePath,
  getLocalizedPath,
  i18n,
  localeLabels,
  locales,
} from '@/utils/i18n';
import { Profile } from '@/utils/Profile';

/** @description Renders the shared site navigation and account controls. */
const Navbar = ({ locale, pathname }: { locale: Locale; pathname: string }) => {
  const text = i18n[locale].nav;
  const links = [
    { path: '/', key: 'home' as const },
    { path: '/about-me/', key: 'about' as const },
    { path: '/projects/', key: 'projects' as const },
    { path: '/notes/', key: 'notes' as const },
    { path: '/ocs/', key: 'ocs' as const },
    { path: '/worldbuilding/', key: 'worldbuilding' as const },
  ];
  const currentSection = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path.slice(0, -1) || pathname.startsWith(path);

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary navigation" data-dropdown-scope>
        <a href={getLocalizedPath('/', locale)} className="site-brand" data-home-link="home" data-localized-path="/">
          <img src={Profile.avatar} alt="" />
          <span>WeiKnight</span>
        </a>
        <div className="site-nav-links">
          {links.map(({ path, key }) => (
            <a key={path} href={getLocalizedPath(path, locale)} data-home-i18n={`nav.${key}`} data-localized-path={path} aria-current={currentSection(path) ? 'page' : undefined}>
              {text[key]}
            </a>
          ))}
        </div>
        <div className="site-nav-actions">
          <a href="/login/" data-account-login data-home-i18n="nav.login">{text.login}</a>
          <details data-dropdown data-account-profile hidden className="account-control">
            <summary data-account-trigger className="account-avatar" aria-label={locale === 'zh-cn' ? '打开账户菜单' : 'Open account menu'} aria-expanded="false">
              <img data-account-avatar-image hidden alt="" />
              <span data-account-avatar-fallback>?</span>
              <span className="account-chevron" aria-hidden="true">⌄</span>
            </summary>
            <div className="account-menu">
              <a href={getLocalizedPath('/profile/', locale)} data-home-i18n="nav.profile">{text.profile}</a>
              <a data-account-admin data-home-i18n="nav.administration" hidden href="/admin/users/">{text.administration}</a>
              <button data-account-logout data-home-i18n="nav.signOut" type="button">{text.signOut}</button>
            </div>
          </details>
          <button type="button" data-theme-toggle className="nav-icon-button" aria-label="Switch color theme"><span data-theme-icon aria-hidden="true">☼</span></button>
          <details data-dropdown className="language-control">
            <summary aria-label="Language" aria-expanded="false"><span data-language-current>{localeLabels[locale]}</span></summary>
            <div className="language-menu">
              {locales.map((target) => (
                <a key={target} href={getLanguagePath(pathname, target)} data-language-link data-target-locale={target} aria-current={target === locale ? 'true' : undefined}>{localeLabels[target]}</a>
              ))}
            </div>
          </details>
        </div>
        <details data-dropdown className="mobile-nav">
          <summary data-home-i18n="nav.menu" aria-expanded="false">{text.menu}</summary>
          <div className="mobile-nav-panel">
            {links.map(({ path, key }) => (
              <a key={path} href={getLocalizedPath(path, locale)} data-localized-path={path} data-home-i18n={`nav.${key}`} aria-current={currentSection(path) ? 'page' : undefined}>{text[key]}</a>
            ))}
            <a href="/login/" data-account-login data-home-i18n="nav.login">{text.login}</a>
            <a href={getLocalizedPath('/profile/', locale)} data-account-profile hidden className="mobile-account" aria-label={locale === 'zh-cn' ? '个人中心' : 'Personal center'}>
              <img data-account-avatar-image hidden alt="" />
              <span data-account-avatar-fallback>?</span>
              <span data-home-i18n="nav.profile">{text.profile}</span>
            </a>
            <a data-account-admin hidden href="/admin/users/" data-home-i18n="nav.administration">{text.administration}</a>
            <button data-account-logout hidden type="button" data-home-i18n="nav.signOut">{text.signOut}</button>
            <button type="button" data-theme-toggle><span data-theme-icon aria-hidden="true">☼</span><span data-theme-label>Theme</span></button>
          </div>
        </details>
      </nav>
    </header>
  );
};

export { Navbar };
