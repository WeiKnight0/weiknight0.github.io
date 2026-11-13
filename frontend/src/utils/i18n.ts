import { normalizePath, sitePath } from './paths.mjs';
export { normalizePath } from './paths.mjs';

export const locales = ['en', 'zh-cn'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const localeLabels: Record<Locale, string> = { en: 'English', 'zh-cn': '简体中文' };
export const htmlLangs: Record<Locale, string> = { en: 'en', 'zh-cn': 'zh-CN' };

export const clientI18nPaths = ['/', '/ocs/'] as const;
const clientI18nPathSet = new Set<string>(clientI18nPaths);

export const localizedRouteGroups = [
  { base: '/about/', localizedBase: '/about/zh-cn/' },
  { base: '/worldbuilding/', localizedBase: '/worldbuilding/zh-cn/' },
  { base: '/projects/', localizedBase: '/projects/zh-cn/' },
] as const;

export const worldCategoryLabels: Record<Locale, Record<'theory' | 'setting', string>> = {
  en: { theory: 'Theoretical Introduction', setting: 'Worldview Introduction' },
  'zh-cn': { theory: '理论介绍', setting: '世界观介绍' },
};

export const i18n = {
  en: {
    nav: {
      home: 'Home', projects: 'Projects', notes: 'Notes',
      ocs: 'OCs', worldbuilding: 'Worldbuilding', menu: 'Menu',
    },
    footer: {
      tagline: 'A personal archive for projects, notes and fictional worlds.',
      about: 'About this site', privacy: 'Privacy',
    },
  },
  'zh-cn': {
    nav: {
      home: '首页', projects: '项目', notes: '笔记',
      ocs: '原创角色', worldbuilding: '世界观', menu: '菜单',
    },
    footer: {
      tagline: '记录项目、笔记与幻想世界的个人档案。',
      about: '关于本站', privacy: '隐私',
    },
  },
} as const;

export const isClientI18nPath = (pathname: string): boolean =>
  clientI18nPathSet.has(normalizePath(pathname));

export const getLocaleFromPath = (pathname: string): Locale => {
  const path = normalizePath(pathname);
  return localizedRouteGroups.some((group) => path.startsWith(group.localizedBase))
    ? 'zh-cn' : defaultLocale;
};

/** Return an unprefixed, default-language route for route matching. */
export const stripLocaleFromPath = (pathname: string): string => {
  const path = normalizePath(pathname);
  const group = localizedRouteGroups.find((route) => path.startsWith(route.localizedBase));
  return group ? `${group.base}${path.slice(group.localizedBase.length)}` : path;
};

/** Build a public URL with both the deployment prefix and selected locale. */
export const getLocalizedPath = (pathname: string, locale: Locale): string => {
  const path = stripLocaleFromPath(pathname);
  const group = localizedRouteGroups.find((route) => path.startsWith(route.base));
  return sitePath(locale !== defaultLocale && group
    ? `${group.localizedBase}${path.slice(group.base.length)}` : path);
};

export const getLanguagePath = (pathname: string, targetLocale: Locale): string =>
  getLocalizedPath(pathname, targetLocale);
export const getAlternateLocalePath = getLanguagePath;

export const getAlternateLocalePaths = (pathname: string): Record<Locale, string> => ({
  en: getAlternateLocalePath(pathname, 'en'),
  'zh-cn': getAlternateLocalePath(pathname, 'zh-cn'),
});

export const hasDistinctLocalePaths = (pathname: string): boolean => {
  const paths = getAlternateLocalePaths(pathname);
  return paths.en !== paths['zh-cn'];
};

export const getAbsoluteUrl = (site: URL | undefined, pathname: string): string => {
  const path = sitePath(normalizePath(pathname));
  return site ? new URL(path, site).toString() : path;
};
