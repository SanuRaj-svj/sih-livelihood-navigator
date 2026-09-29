import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CheckCircle2, MapPinned, Sparkles, TrendingUp, Users, Compass, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';
import { getGovernmentSchemeLabels, getLocalizedGovernmentScheme } from '../data/governmentSchemeTranslations';
import modiImage from '../assets/Prime-Minister-Narendra-Modi.png';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Sparkles,
    titleKey: 'landingFeatureAiTitle',
    descriptionKey: 'landingFeatureAiDescription',
  },
  {
    icon: MapPinned,
    titleKey: 'landingFeatureLocalTitle',
    descriptionKey: 'landingFeatureLocalDescription',
  },
  {
    icon: TrendingUp,
    titleKey: 'landingFeatureRoadmapTitle',
    descriptionKey: 'landingFeatureRoadmapDescription',
  },
  {
    icon: Users,
    titleKey: 'landingFeatureCommunityTitle',
    descriptionKey: 'landingFeatureCommunityDescription',
  },
];

const aboutPointKeys = ['landingAboutPointOne', 'landingAboutPointTwo', 'landingAboutPointThree'];

export default function LandingPage() {
  const rootRef = useRef(null);
  const { language, t } = useLanguage();
  const heroVisualRef = useRef(null);
  const heroCursorRef = useRef(null);
  const [governmentSchemes, setGovernmentSchemes] = useState([]);
  const schemeLabels = getGovernmentSchemeLabels(language);

  useEffect(() => {
    let isCurrent = true;
    client.get('/schemes')
      .then((response) => {
        if (isCurrent && response.data?.success && Array.isArray(response.data.data)) {
          setGovernmentSchemes(response.data.data);
        }
      })
      .catch(() => {});

    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    let removeHeroPointerListeners = () => {};
    const ctx = gsap.context(() => {
      gsap.from('.hero-copy, .hero-service-panel', {
        y: 28,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
      });

      gsap.utils.toArray('.landing-animate').forEach((section) => {
        gsap.from(section, {
          y: 36,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 84%',
            once: true,
          },
        });
      });

      const featureSection = rootRef.current.querySelector('.features-section');
      const featureHeading = featureSection?.querySelector('.section-heading');
      const featureCards = featureSection?.querySelectorAll('.feature-card');

      if (featureSection && featureHeading && featureCards?.length) {
        const featureTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: featureSection,
            start: 'top 78%',
            once: true,
          },
        });

        featureTimeline
          .from(featureHeading, {
            y: 34,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
          })
          .from(featureCards, {
            y: 48,
            opacity: 0,
            scale: 0.94,
            duration: 0.72,
            stagger: 0.14,
            ease: 'back.out(1.35)',
          }, '-=0.28')
          .from(featureSection.querySelectorAll('.feature-icon'), {
            y: 10,
            opacity: 0,
            duration: 0.42,
            stagger: 0.1,
            ease: 'power2.out',
          }, '-=0.45');
      }

      const skillCard = rootRef.current.querySelector('.skill-india-card');
      const skillCopyItems = skillCard?.querySelectorAll('.skill-india-copy > *:not(blockquote)');
      const skillQuote = skillCard?.querySelector('.skill-india-copy blockquote');
      const skillImage = skillCard?.querySelector('.skill-india-image');

      if (skillCard && skillCopyItems?.length && skillQuote && skillImage) {
        const skillTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: skillCard,
            start: 'top 82%',
            once: true,
          },
        });

        skillTimeline
          .from(skillImage, {
            scale: 1.12,
            opacity: 0,
            duration: 1.1,
            ease: 'power3.out',
          })
          .from(skillCopyItems, {
            x: 34,
            opacity: 0,
            duration: 0.62,
            stagger: 0.12,
            ease: 'power3.out',
          }, '-=0.72');

        gsap.fromTo(skillQuote,
          { y: 34, opacity: 0.2, scale: 0.92 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: skillQuote,
              start: 'top 92%',
              end: 'top 52%',
              scrub: true,
            },
          },
        );
      }

      const heroSection = rootRef.current.querySelector('.hero-section');
      const heroVisual = heroVisualRef.current;
      const heroCursor = heroCursorRef.current;
      const supportsHover = window.matchMedia('(pointer: fine)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (heroSection && heroVisual && heroCursor && supportsHover && !prefersReducedMotion) {
        const moveX = gsap.quickTo(heroVisual, 'x', { duration: 0.7, ease: 'power3.out' });
        const moveY = gsap.quickTo(heroVisual, 'y', { duration: 0.7, ease: 'power3.out' });
        const cursorX = gsap.quickTo(heroCursor, 'x', { duration: 0.16, ease: 'power3.out' });
        const cursorY = gsap.quickTo(heroCursor, 'y', { duration: 0.16, ease: 'power3.out' });
        gsap.set(heroCursor, { xPercent: -50, yPercent: -50, scale: 0.7, autoAlpha: 0 });
        const handlePointerEnter = () => {
          gsap.to(heroVisual, { scale: 1.055, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
          gsap.to(heroCursor, { scale: 1, autoAlpha: 1, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
        };
        const handlePointerMove = (event) => {
          const bounds = heroSection.getBoundingClientRect();
          const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
          const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
          cursorX(event.clientX - bounds.left);
          cursorY(event.clientY - bounds.top);
          moveX(-relativeX * 18);
          moveY(-relativeY * 12);
        };
        const handlePointerLeave = () => {
          gsap.to(heroVisual, { scale: 1, x: 0, y: 0, duration: 0.85, ease: 'power3.out', overwrite: 'auto' });
          gsap.to(heroCursor, { scale: 0.7, autoAlpha: 0, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
        };

        heroSection.addEventListener('pointerenter', handlePointerEnter);
        heroSection.addEventListener('pointermove', handlePointerMove);
        heroSection.addEventListener('pointerleave', handlePointerLeave);
        removeHeroPointerListeners = () => {
          heroSection.removeEventListener('pointerenter', handlePointerEnter);
          heroSection.removeEventListener('pointermove', handlePointerMove);
          heroSection.removeEventListener('pointerleave', handlePointerLeave);
        };
      }

    }, rootRef);

    return () => {
      removeHeroPointerListeners();
      ctx.revert();
    };
  }, [language]);

  return (
    <div key={language} ref={rootRef} className="landing-page-shell">
      <section className="hero-section">
        <div ref={heroVisualRef} className="hero-visual-layer" aria-hidden="true" />
        <div className="hero-overlay" />
        <span ref={heroCursorRef} className="hero-cursor" aria-hidden="true" />

        <div className="hero-content container">
          <div className="hero-copy landing-animate">
            <span className="eyebrow">{t('landingEyebrow')}</span>
            <h1>{t('landingHeroTitle')}</h1>
            <p>{t('landingHeroDescription')}</p>

            <div className="cta-row">
              <Link to="/register" className="btn btn-primary">
                {t('landingSignUp')}
                <ArrowRight size={18} />
              </Link>
              <a href="#government-schemes" className="btn btn-secondary">
                {schemeLabels[5]}
                <ArrowRight size={18} />
              </a>
            </div>

            <div className="mini-trust">
              <span className="trust-pill">{t('landingTrustAi')}</span>
              <span className="trust-pill">{t('landingTrustRoadmaps')}</span>
              <span className="trust-pill">{t('landingTrustLocal')}</span>
            </div>
          </div>

          <div className="hero-service-panel landing-animate" aria-labelledby="hero-services-title">
            <div className="hero-service-heading">
              <div>
                <span className="mini-label">{t('landingTrustLocal')}</span>
                <h2 id="hero-services-title">{t('landingWhyTitle')}</h2>
              </div>
            </div>

            <div className="hero-service-list">
              <Link to="/register" className="hero-service-link">
                <span className="service-number">01</span>
                <span className="service-link-copy">
                  <strong>{t('landingFeatureAiTitle')}</strong>
                  <small>{t('landingFeatureAiDescription')}</small>
                </span>
                <ArrowRight size={18} />
              </Link>
              <a href="#government-schemes" className="hero-service-link">
                <span className="service-number">02</span>
                <span className="service-link-copy">
                  <strong>{t('landingFeatureLocalTitle')}</strong>
                  <small>{t('landingFeatureLocalDescription')}</small>
                </span>
                <ArrowRight size={18} />
              </a>
              <Link to="/login" className="hero-service-link">
                <span className="service-number">03</span>
                <span className="service-link-copy">
                  <strong>{t('landingFeatureRoadmapTitle')}</strong>
                  <small>{t('landingFeatureRoadmapDescription')}</small>
                </span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {governmentSchemes.length > 0 && (
        <section id="government-schemes" className="government-schemes-section" aria-labelledby="government-schemes-title">
          <div className="container government-schemes-heading">
            <div>
              <span className="mini-label">{schemeLabels[0]}</span>
              <h2 id="government-schemes-title">{schemeLabels[1]}</h2>
              <p>{schemeLabels[2]}</p>
            </div>
            <span className="scheme-count">{governmentSchemes.length} {schemeLabels[3]}</span>
          </div>

          <div className="scheme-marquee" aria-label="Government schemes">
            <div className="scheme-track">
              {[false, true].map((isDuplicate) => (
                <div className="scheme-group" key={isDuplicate ? 'duplicate' : 'schemes'} aria-hidden={isDuplicate}>
                  {governmentSchemes.map((scheme) => (
                    (() => {
                      const localizedScheme = getLocalizedGovernmentScheme(scheme, language);
                      return (
                        <a
                          className="scheme-ticker-card"
                          key={`${isDuplicate ? 'duplicate-' : ''}${scheme._id || scheme.schemeCode}`}
                          href={scheme.applicationUrl || scheme.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          tabIndex={isDuplicate ? -1 : undefined}
                        >
                          <span className="scheme-ticker-ministry">{scheme.ministry || scheme.sectors?.[0] || 'Government programme'}</span>
                          <strong>{localizedScheme.name}</strong>
                          <span className="scheme-ticker-description">{localizedScheme.description}</span>
                          <span className="scheme-ticker-link">{schemeLabels[4]} <ExternalLink size={14} /></span>
                        </a>
                      );
                    })()
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="about" className="about-section container" aria-labelledby="about-title">
        <div className="about-copy landing-animate">
          <span className="eyebrow alt">{t('landingAboutEyebrow')}</span>
          <h2 id="about-title">{t('landingAboutTitle')}</h2>
          <p>{t('landingAboutDescription')}</p>

          <div className="about-points">
            {aboutPointKeys.map((pointKey) => (
              <div key={pointKey} className="point-item">
                <CheckCircle2 size={18} />
                <span>{t(pointKey)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="about-visual landing-animate">
          <div className="visual-box primary-box">
            <span className="mini-label">{t('landingSkillFit')}</span>
            <h3>{t('landingCommunityRecommendations')}</h3>
            <p>{t('landingSkillFitDescription')}</p>
          </div>
          <div className="visual-box secondary-box">
            <span className="mini-label">{t('landingSupport')}</span>
            <h3>{t('landingLearningToEarning')}</h3>
            <p>{t('landingSupportDescription')}</p>
          </div>
        </div>
      </section>

      <section className="skill-india-card container">
        <div className="skill-india-image-wrap">
          <img
            className="skill-india-image"
            src={modiImage}
            alt={t('landingSkillIndiaImageAlt')}
            loading="lazy"
          />
        </div>
        <div className="skill-india-copy">
          <span className="mini-label">{t('landingSkillIndiaLabel')}</span>
          <h2>{t('landingSkillIndiaTitle')}</h2>
          <blockquote>{t('landingSkillIndiaQuote')}</blockquote>
          <p>{t('landingSkillIndiaDescription')}</p>
          <cite>{t('landingSkillIndiaAttribution')}</cite>
        </div>
      </section>

      <section className="features-section container">
        <div className="section-heading">
          <span className="eyebrow alt">{t('landingWhyEyebrow')}</span>
          <h2>{t('landingWhyTitle')}</h2>
        </div>

        <div className="feature-grid">
          {features.map(({ icon: Icon, titleKey, descriptionKey }) => (
            <article key={titleKey} className="feature-card">
              <div className="feature-icon">
                <Icon size={20} />
              </div>
              <h3>{t(titleKey)}</h3>
              <p>{t(descriptionKey)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-banner container landing-animate">
        <div>
          <span className="eyebrow alt">{t('landingStartEyebrow')}</span>
          <h2>{t('landingCtaTitle')}</h2>
        </div>
        <Link to="/register" className="btn btn-primary large">
          {t('landingSignUpNow')}
          <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner container">
          <div className="footer-brand">
            <div className="footer-brand-row">
              <span className="footer-mark"><Compass size={20} /></span>
              <strong>{t('appName')}</strong>
            </div>
            <p>{t('landingFooterDescription')}</p>
          </div>

          <div className="footer-column">
            <h3>{t('landingFooterExplore')}</h3>
            <a href="#about">{t('landingAboutEyebrow')}</a>
            <Link to="/register">{t('landingSignUp')}</Link>
            <Link to="/login">{t('logIn')}</Link>
            <Link to="/certificate-verifier">{t('landingFooterVerify')}</Link>
          </div>

          <div className="footer-column">
            <h3>{t('landingFooterPlatform')}</h3>
            <span>{t('landingTrustAi')}</span>
            <span>{t('landingTrustRoadmaps')}</span>
            <span>{t('landingTrustLocal')}</span>
          </div>

          <div className="footer-contact">
            <h3>{t('landingFooterStayConnected')}</h3>
            <p>{t('landingFooterContactDescription')}</p>
            <a href="mailto:support@livelihoodnavigator.in">
              <Mail size={16} />
              support@livelihoodnavigator.in
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom container">
          <span>{t('landingFooterCopyright')}</span>
          <span>{t('landingFooterBuiltFor')}</span>
        </div>
      </footer>
    </div>
  );
}
