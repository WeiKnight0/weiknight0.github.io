import { type Locale, i18n } from '@/utils/i18n';

const Footer = ({ locale }: { locale: Locale }) => (
  <footer className="site-footer border-t px-5 py-10 text-sm lg:px-8">
    <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <p data-footer-i18n="builtWith">{i18n[locale].footer.builtWith}</p>
      <p data-footer-i18n="designedFor">{i18n[locale].footer.designedFor}</p>
    </div>
  </footer>
);

export { Footer };
