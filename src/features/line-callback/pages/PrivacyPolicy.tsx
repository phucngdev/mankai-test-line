import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: '#faf7f2',
        minHeight: '100vh',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --green-deep: #1a3a2a; --green-mid: #2d6147; --green-light: #4a9068;
          --green-pale: #d4ead9; --cream: #faf7f2; --cream-dark: #f0ebe1;
          --gold: #c9a84c; --text-dark: #1a2a1f; --text-mid: #3d5a47;
        }
        .pp-header { background: var(--green-deep); padding: 0 24px; position: relative; overflow: hidden; }
        .pp-header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--gold), var(--green-light), var(--gold)); }
        .pp-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; }
        .pp-brand-icon { width: 44px; height: 44px; background: var(--gold); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .pp-brand-name { font-family: 'Playfair Display', serif; font-size: 20px; color: #fff; }
        .pp-brand-name span { color: var(--gold); }
        .pp-h1 { font-family: 'Playfair Display', serif; font-size: clamp(32px, 5vw, 52px); color: #fff; line-height: 1.15; }
        .pp-h1 em { color: var(--gold); font-style: italic; }
        .pp-meta { margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap; padding-bottom: 40px; }
        .pp-pill { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.75); font-size: 12px; padding: 5px 14px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; }
        .pp-wrap { max-width: 860px; margin: 0 auto; padding: 48px 24px 80px; }
        .pp-toc { background: var(--green-deep); border-radius: 16px; padding: 32px 36px; margin-bottom: 48px; }
        .pp-toc-title { font-family: 'Playfair Display', serif; font-size: 14px; color: var(--gold); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
        .pp-toc ul { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
        .pp-toc a { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; display: flex; align-items: center; gap: 10px; }
        .pp-toc a:hover { color: var(--gold); }
        .pp-toc-num { font-size: 11px; color: var(--green-light); }
        .pp-intro { border-left: 4px solid var(--gold); background: var(--cream-dark); border-radius: 0 12px 12px 0; padding: 24px 28px; margin-bottom: 48px; }
        .pp-intro p { font-size: 15px; line-height: 1.8; color: var(--text-mid); }
        .pp-section { margin-bottom: 48px; }
        .pp-section-header { display: flex; align-items: flex-start; gap: 18px; margin-bottom: 20px; }
        .pp-num { background: var(--green-deep); color: var(--gold); font-family: 'Playfair Display', serif; font-size: 13px; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pp-section-title { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--green-deep); }
        .pp-body { padding-left: 54px; }
        .pp-body p { font-size: 15px; line-height: 1.85; color: var(--text-mid); margin-bottom: 16px; }
        .pp-list { list-style: none; margin: 12px 0; }
        .pp-list li { font-size: 15px; line-height: 1.7; color: var(--text-mid); padding: 10px 16px; margin-bottom: 6px; background: var(--cream-dark); border-radius: 8px; display: flex; gap: 12px; }
        .pp-dot { width: 6px; height: 6px; background: var(--gold); border-radius: 50%; margin-top: 8px; flex-shrink: 0; }
        .pp-highlight { background: linear-gradient(135deg, var(--green-deep), var(--green-mid)); border-radius: 14px; padding: 28px 32px; margin: 20px 0; }
        .pp-highlight p { color: rgba(255,255,255,0.85) !important; font-size: 14px !important; }
        .pp-warning { background: #fff8ec; border: 1px solid #e8c97a; border-radius: 10px; padding: 16px 20px; margin: 16px 0; display: flex; gap: 12px; }
        .pp-warning p { font-size: 14px !important; color: #7a5c1a !important; margin: 0 !important; }
        .pp-divider { border: none; height: 1px; background: linear-gradient(90deg, transparent, var(--green-pale), transparent); margin: 0 0 48px; }
        .pp-contact { background: var(--green-deep); border-radius: 20px; padding: 40px 44px; display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap; }
        .pp-contact h3 { font-family: 'Playfair Display', serif; font-size: 24px; color: #fff; margin-bottom: 10px; }
        .pp-contact p { font-size: 14px; color: rgba(255,255,255,0.65); }
        .pp-btn { background: var(--gold); color: var(--green-deep); border: none; padding: 13px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
      `}</style>

      {/* Header */}
      <div className="pp-header">
        <div
          style={{
            maxWidth: 860,
            margin: '0 auto',
            paddingTop: 48,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div className="pp-brand">
            <div className="pp-brand-icon">🌿</div>
            <div className="pp-brand-name">
              Mankai <span>Academy</span>
            </div>
          </div>
          <h1 className="pp-h1">
            Privacy <em>Policy</em>
          </h1>
          <div className="pp-meta">
            <span className="pp-pill">Effective 2025</span>
            <span className="pp-pill">GDPR Compliant</span>
            <span className="pp-pill">Mankai Academy</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pp-wrap">
        {/* TOC */}
        <nav className="pp-toc">
          <div className="pp-toc-title">Table of Contents</div>
          <ul>
            {[
              ['01', 'Introduction'],
              ['02', 'Information We Collect'],
              ['03', 'How We Use Your Data'],
              ['04', 'Disclosure'],
              ['05', 'Your Rights'],
              ['06', 'Policy Changes'],
            ].map(([n, t]) => (
              <li key={n}>
                <a href="#">
                  <span className="pp-toc-num">{n}</span>
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Intro */}
        <div className="pp-intro">
          <p>
            This Privacy Policy is prepared by <strong>Mankai Academy</strong>.
            We are committed to protecting and preserving the privacy of our
            visitors when visiting our site or communicating electronically with
            us.
          </p>
          <p style={{ marginTop: 12 }}>
            This policy sets out how we process any personal data we collect
            from you or that you provide to us through our website and social
            media sites.{' '}
            <strong>
              By submitting information you are accepting and consenting to the
              practices described in this policy.
            </strong>
          </p>
        </div>

        {/* Section 1 */}
        <div className="pp-section">
          <div className="pp-section-header">
            <div className="pp-num">01</div>
            <h2 className="pp-section-title">
              Types of Information We May Collect
            </h2>
          </div>
          <div className="pp-body">
            <p>
              We may collect, store and use the following kinds of personal
              information:
            </p>
            <ul className="pp-list">
              {[
                'Your full name',
                'Home or correspondence address',
                'Email address',
                'Phone number',
              ].map(item => (
                <li key={item}>
                  <span className="pp-dot" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="pp-divider" />

        {/* Section 2 */}
        <div className="pp-section">
          <div className="pp-section-header">
            <div className="pp-num">02</div>
            <h2 className="pp-section-title">How We May Use the Information</h2>
          </div>
          <div className="pp-body">
            <ul className="pp-list">
              {[
                'To provide you with information and/or services that you request from us',
                'To contact you to provide the information requested',
              ].map(item => (
                <li key={item}>
                  <span className="pp-dot" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="pp-divider" />

        {/* Section 3 */}
        <div className="pp-section">
          <div className="pp-section-header">
            <div className="pp-num">03</div>
            <h2 className="pp-section-title">Disclosure of Your Information</h2>
          </div>
          <div className="pp-body">
            <div className="pp-highlight">
              <p>
                <strong style={{ color: '#c9a84c' }}>
                  We do not rent, sell or share
                </strong>{' '}
                personal information about you with other people or
                non-affiliated companies.
              </p>
            </div>
            <div className="pp-warning">
              <span style={{ fontSize: 18 }}>⚠️</span>
              <p>
                Transmission of information via the internet is not completely
                secure. Any transmission is <strong>at your own risk.</strong>
              </p>
            </div>
          </div>
        </div>

        <hr className="pp-divider" />

        {/* Section 4 */}
        <div className="pp-section">
          <div className="pp-section-header">
            <div className="pp-num">04</div>
            <h2 className="pp-section-title">
              Your Rights — Access to Personal Data
            </h2>
          </div>
          <div className="pp-body">
            <p>
              You have the right to ensure that your personal data is being
              processed lawfully (<strong>"Subject Access Right"</strong>). Any
              subject access request must be made in writing to Mankai Academy.
            </p>
            <p>
              If you complain about how we have used your information, you have
              the right to complain to the{' '}
              <strong>Information Commissioner's Office (ICO)</strong>.
            </p>
          </div>
        </div>

        <hr className="pp-divider" />

        {/* Section 5 */}
        <div className="pp-section">
          <div className="pp-section-header">
            <div className="pp-num">05</div>
            <h2 className="pp-section-title">Changes to Our Privacy Policy</h2>
          </div>
          <div className="pp-body">
            <p>
              Any changes will be posted on this page and, where appropriate,
              notified to you by e-mail. Please check back frequently to see
              updates.
            </p>
          </div>
        </div>

        <hr className="pp-divider" />

        {/* Contact */}
        <div className="pp-contact">
          <div>
            <h3>Get in Touch</h3>
            <p>
              Questions and requests regarding this policy should be addressed
              to the Mankai Academy team.
            </p>
          </div>
          <button className="pp-btn">Contact Us</button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
