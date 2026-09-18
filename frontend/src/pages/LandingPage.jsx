import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CheckCircle2, MapPinned, Sparkles, TrendingUp, Users, ShieldCheck, Compass, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
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
  const cursorRef = useRef(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    let removeCursorListeners = () => {};
    const ctx = gsap.context(() => {
      gsap.from('.hero-copy, .hero-panel', {
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

      const cursor = cursorRef.current;
      const pointerQuery = window.matchMedia('(pointer: fine)');
      if (cursor && pointerQuery.matches) {
        const moveX = gsap.quickTo(cursor, 'x', { duration: 0.22, ease: 'power3.out' });
        const moveY = gsap.quickTo(cursor, 'y', { duration: 0.22, ease: 'power3.out' });
        const handlePointerMove = (event) => {
          moveX(event.clientX);
          moveY(event.clientY);
          cursor.classList.add('is-visible');
        };
        const handlePointerOver = (event) => {
          if (event.target.closest('a, button, .feature-card, .skill-india-card, img')) {
            gsap.to(cursor, { scale: 2.1, duration: 0.25, ease: 'power2.out' });
            cursor.classList.add('is-hovering');
          }
        };
        const handlePointerOut = (event) => {
          if (event.target.closest('a, button, .feature-card, .skill-india-card, img')) {
            gsap.to(cursor, { scale: 1, duration: 0.25, ease: 'power2.out' });
            cursor.classList.remove('is-hovering');
          }
        };
        const handlePointerLeave = () => cursor.classList.remove('is-visible');

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerover', handlePointerOver);
        window.addEventListener('pointerout', handlePointerOut);
        document.documentElement.addEventListener('mouseleave', handlePointerLeave);

        removeCursorListeners = () => {
          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerover', handlePointerOver);
          window.removeEventListener('pointerout', handlePointerOut);
          document.documentElement.removeEventListener('mouseleave', handlePointerLeave);
        };
      }

    }, rootRef);

    return () => {
      removeCursorListeners();
      ctx.revert();
    };
  }, [language]);

  return (
    <div key={language} ref={rootRef} className="landing-page-shell">
      <span ref={cursorRef} className="landing-cursor" aria-hidden="true" />
      <section className="hero-section">
        <div className="hero-overlay" />

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
              <Link to="/login" className="btn btn-secondary">
                {t('logIn')}
              </Link>
            </div>

            <div className="mini-trust">
              <span className="trust-pill">{t('landingTrustAi')}</span>
              <span className="trust-pill">{t('landingTrustRoadmaps')}</span>
              <span className="trust-pill">{t('landingTrustLocal')}</span>
            </div>
          </div>

          <div className="hero-panel landing-animate">
            <div className="panel-card panel-top">
              <div className="panel-header">
                <span className="dot green" />
                <span className="dot orange" />
                <span className="dot amber" />
              </div>
              <div className="panel-body">
                <div className="goal-label">{t('landingRecommendedStep')}</div>
                <h3>{t('landingExampleRole')}</h3>
                <div className="chip-row">
                  <span>{t('landingMatchedSkills')}</span>
                  <span>{t('landingLocalTraining')}</span>
                </div>
              </div>
            </div>

            <div className="floating-card card-one">
              <ShieldCheck size={20} />
              <div>
                <strong>{t('landingCareerConfidence')}</strong>
                <small>{t('landingPathwayTracked')}</small>
              </div>
            </div>

            <div className="floating-card card-two">
              <TrendingUp size={20} />
              <div>
                <strong>{t('landingOpportunityMatch')}</strong>
                <small>{t('landingRelevantOpportunities')}</small>
              </div>
            </div>
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
