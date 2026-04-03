// src/components/Footer.tsx
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.scss';
import logo from 'src/assets/images/footer/mankaiLogoft.png';
import {
  CopyRightIcon,
  EmailIcon,
  FacebookIcon,
  LocalIcon,
  PhoneIcon,
  YoutubeIcon,
} from '#/assets/svg/externalIcon';

function Footer(): JSX.Element {
  const { t } = useTranslation();

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.inner}>
          <div className={styles.title}>
            <img
              alt={t('footer.logoAlt')}
              className={styles.image}
              src={logo}
            />
            <p className={styles.line} />
            <p className={styles.text}>{t('footer.title')}</p>
          </div>
          <div className={styles.flex}>
            <div className={styles.left}>
              <p className={styles.title}>{t('footer.contactInfo.title')}</p>
              <div className={styles.infor}>
                <LocalIcon />
                <p className={styles.address}>
                  {t('footer.contactInfo.address')}
                </p>
                <p className={styles.text}>
                  {t('footer.contactInfo.addressText')}
                </p>
              </div>
              <div className={styles.infor}>
                <PhoneIcon />
                <p className={styles.address}>
                  {t('footer.contactInfo.hotline')}
                </p>
                <p className={styles.text}>
                  {t('footer.contactInfo.hotlineText')}
                </p>
              </div>
              <div className={styles.infor}>
                <EmailIcon />
                <p className={styles.address}>
                  {t('footer.contactInfo.email')}
                </p>
                <p className={styles.text}>
                  {t('footer.contactInfo.emailText')}
                </p>
              </div>
            </div>
            <div className={styles.mid}>
              <p className={styles.title}>{t('footer.quickLinks.title')}</p>
              <div className={styles.flexContainer}>
                <div className={styles.left}>
                  <a
                    className={styles.text}
                    href="/about"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('footer.quickLinks.links.0')}
                  </a>
                  <a
                    className={styles.text}
                    href="/jlpt"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('footer.quickLinks.links.1')}
                  </a>
                  <a
                    className={styles.text}
                    href="/kaiwa"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('footer.quickLinks.links.2')}
                  </a>
                  <a
                    className={styles.text}
                    href="/beginner"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('footer.quickLinks.links.3')}
                  </a>
                  <a
                    className={styles.text}
                    href="/it-talk"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('footer.quickLinks.links.4')}
                  </a>
                </div>
                <div className={styles.right}>
                  <a
                    className={styles.text}
                    href="/tokutei"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('footer.quickLinks.links.5')}
                  </a>
                  <a
                    className={styles.text}
                    href="/business-training"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('footer.quickLinks.links.6')}
                  </a>
                  <a
                    className={styles.text}
                    href="/mankai-board"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('footer.quickLinks.links.7')}
                  </a>
                  <a
                    className={styles.text}
                    href="/news"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('footer.quickLinks.links.8')}
                  </a>
                  <a
                    className={styles.text}
                    href="/contact"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('footer.quickLinks.links.9')}
                  </a>
                </div>
              </div>
            </div>
            <div className={styles.right}>
              <p className={styles.title}>{t('footer.followUs.title')}</p>
              <div className={styles.flexContainerRight}>
                <a
                  href="https://facebook.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FacebookIcon />
                </a>
                <a
                  href="https://youtube.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <YoutubeIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <section className={styles.copyright}>
        <div className={styles.inner}>
          <CopyRightIcon />
          <p className={styles.text}>{t('footer.copyright.text')}</p>
        </div>
      </section>
    </>
  );
}

export default Footer;
