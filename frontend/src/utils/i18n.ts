export const locales = ['en', 'zh-cn'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  'zh-cn': '简体中文',
};

export const htmlLangs: Record<Locale, string> = {
  en: 'en',
  'zh-cn': 'zh-CN',
};

export const clientI18nPaths = [
  '/',
  '/real/',
  '/real/blog/',
  '/fiction/',
  '/fiction/novels/',
  '/fiction/oc/',
  '/fiction/commissions/',
] as const;

const clientI18nPathSet = new Set<string>(clientI18nPaths);

export const localizedRouteGroups = [
  { base: '/fiction/world/', localizedBase: '/fiction/world/zh-cn/' },
  { base: '/real/projects/', localizedBase: '/real/projects/zh-cn/' },
  { base: '/real/resume/', localizedBase: '/real/resume/zh-cn/' },
] as const;

export const worldCategoryLabels: Record<
  Locale,
  Record<'theory' | 'setting', string>
> = {
  en: {
    theory: 'Theoretical Introduction',
    setting: 'Worldview Introduction',
  },
  'zh-cn': {
    theory: '理论介绍',
    setting: '世界观介绍',
  },
};

export const i18n = {
  en: {
    nav: {
      home: 'Home',
      real: 'Real',
      fiction: 'Fiction',
      language: 'Language',
      overview: 'Overview',
      resume: 'Resume',
      projects: 'Projects',
      notes: 'Notes',
      blogs: 'Blogs',
      oc: 'OCs',
      world: 'World',
      novels: 'Novels',
      commissions: 'Commissions',
      login: 'Login',
      profile: 'Personal center',
      administration: 'Administration',
      signOut: 'Sign out',
      menu: 'Menu',
    },
    footer: {
      tagline: 'A personal archive for projects, notes and fictional worlds.',
      about: 'About',
      privacy: 'Privacy',
    },
  },
  'zh-cn': {
    nav: {
      home: '首页',
      real: '三次元',
      fiction: '二次元',
      language: '语言',
      overview: '总览',
      resume: '简历',
      projects: '项目',
      notes: '笔记',
      blogs: '博客',
      oc: '原创角色',
      world: '世界观',
      novels: '小说',
      commissions: '委托作品',
      login: '登录',
      profile: '个人中心',
      administration: '管理后台',
      signOut: '退出登录',
      menu: '菜单',
    },
    footer: {
      tagline: '记录项目、笔记与幻想世界的个人档案。',
      about: '关于',
      privacy: '隐私',
    },
  },
} as const;

/**
 * @description Normalizes one site path to a leading and trailing slash form.
 * @param pathname URL path with optional query or fragment text.
 */
export const normalizePath = (pathname: string): string => {
  if (pathname === '') {
    return '/';
  }

  const pathOnly = pathname.split(/[?#]/)[0] ?? '/';
  const withLeadingSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;

  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
};

/**
 * @description Reports whether a path changes language without navigating to another page.
 * @param pathname Site path to inspect.
 */
export const isClientI18nPath = (pathname: string): boolean =>
  clientI18nPathSet.has(normalizePath(pathname));

/**
 * @description Resolves the locale represented by one localized route.
 * @param pathname Site path to inspect.
 */
export const getLocaleFromPath = (pathname: string): Locale => {
  const normalizedPath = normalizePath(pathname);

  return localizedRouteGroups.some((group) =>
    normalizedPath.startsWith(group.localizedBase)
  )
    ? 'zh-cn'
    : defaultLocale;
};

/**
 * @description Converts a localized route to its default-locale route.
 * @param pathname Localized or default site path.
 */
export const stripLocaleFromPath = (pathname: string): string => {
  const normalizedPath = normalizePath(pathname);

  const routeGroup = localizedRouteGroups.find((group) =>
    normalizedPath.startsWith(group.localizedBase)
  );

  if (routeGroup) {
    return `${routeGroup.base}${normalizedPath.slice(
      routeGroup.localizedBase.length
    )}`;
  }

  return normalizedPath;
};

/**
 * @description Builds the route for a target locale without changing its content identity.
 * @param path Current localized or default site path.
 * @param locale Locale that the returned path must represent.
 */
export const getLocalizedPath = (path: string, locale: Locale): string => {
  const normalizedPath = normalizePath(stripLocaleFromPath(path));

  if (isClientI18nPath(normalizedPath)) {
    return normalizedPath;
  }

  if (locale === defaultLocale) {
    return normalizedPath;
  }

  const routeGroup = localizedRouteGroups.find((group) =>
    normalizedPath.startsWith(group.base)
  );

  if (routeGroup) {
    return `${routeGroup.localizedBase}${normalizedPath.slice(
      routeGroup.base.length
    )}`;
  }

  return normalizedPath;
};

/**
 * @description Resolves the navigation target for one language selector.
 * @param pathname Current site path.
 * @param targetLocale Locale selected by the visitor.
 */
export const getLanguagePath = (
  pathname: string,
  targetLocale: Locale
): string => {
  const normalizedPath = normalizePath(pathname);
  const currentLocale = getLocaleFromPath(normalizedPath);

  if (targetLocale === currentLocale) {
    return normalizedPath;
  }

  return getLocalizedPath(normalizedPath, targetLocale);
};

/**
 * @description Returns the alternate-language route for metadata and navigation.
 * @param pathname Current site path.
 * @param targetLocale Locale represented by the alternate route.
 */
export const getAlternateLocalePath = (
  pathname: string,
  targetLocale: Locale
): string => getLanguagePath(pathname, targetLocale);

/**
 * @description Builds alternate routes for every supported locale.
 * @param pathname Current site path.
 */
export const getAlternateLocalePaths = (
  pathname: string
): Record<Locale, string> => ({
  en: getAlternateLocalePath(pathname, 'en'),
  'zh-cn': getAlternateLocalePath(pathname, 'zh-cn'),
});

/**
 * @description Reports whether locale alternatives require distinct URLs.
 * @param pathname Current site path.
 */
export const hasDistinctLocalePaths = (pathname: string): boolean => {
  const alternatePaths = getAlternateLocalePaths(pathname);

  return alternatePaths.en !== alternatePaths['zh-cn'];
};

/**
 * @description Resolves a normalized site path against the configured production origin.
 * @param site Optional Astro site origin.
 * @param pathname Site path to resolve.
 */
export const getAbsoluteUrl = (
  site: URL | undefined,
  pathname: string
): string => {
  const normalizedPath = normalizePath(pathname);

  if (!site) {
    return normalizedPath;
  }

  return new URL(normalizedPath, site).toString();
};
