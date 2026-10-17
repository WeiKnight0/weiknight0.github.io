import { type Locale, getLocalizedPath, i18n } from '@/utils/i18n';

/**
 * @description Renders the shared localized site footer.
 * @param locale Locale used for the initial static content.
 * @param icpRecordNumber Chinese ICP record number shown only when configured at build time.
 */
const Footer = ({
  locale,
  icpRecordNumber,
}: {
  locale: Locale;
  icpRecordNumber?: string;
}) => (
  <footer className="site-footer border-t px-5 py-8 text-sm lg:px-8">
    <div className="site-footer-inner mx-auto max-w-7xl">
      <div className="site-footer-main">
        <div className="site-footer-copy">
          <p className="site-footer-owner">© {new Date().getFullYear()} WeiKnight</p>
          <p data-footer-i18n="tagline">{i18n[locale].footer.tagline}</p>
        </div>
        <nav className="site-footer-links" aria-label="Footer">
          <a href={getLocalizedPath('/about/', locale)} data-localized-path="/about/" data-footer-i18n="about">{i18n[locale].footer.about}</a>
          <a href="/privacy/" target="_blank" rel="noopener noreferrer" data-footer-i18n="privacy">{i18n[locale].footer.privacy}</a>
        </nav>
      </div>
      {icpRecordNumber && (
        <div className="site-footer-records">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            {icpRecordNumber}
          </a>
        </div>
      )}
    </div>
  </footer>
);

export { Footer };
