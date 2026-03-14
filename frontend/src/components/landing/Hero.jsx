import { useCountUp } from '../../hooks/useCountUp';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Link } from 'react-router-dom';

export default function Hero() {
  useScrollReveal('reveal', 0.1);
  const countInstitutes = useCountUp(99, 2000, true);
  const countPassRate = useCountUp(96, 2000, true);
  const countCities = useCountUp(48, 2000, true);

  return (
    <>
      <section className='lp-hero' id='home'>
        <div className='lp-hero-bg' />
        <div className='lp-hero-blob' />

        <div className='lp-hero-content'>
          <div className='lp-hero-badge reveal'>
            <span className='dot' />
            Admissions Open for 2026
          </div>

          <h1 className='lp-hero-h1 reveal' style={{ transitionDelay: '0.1s' }}>
            Manage Your Coaching Institute Like a Pro
          </h1>

          <p className='lp-hero-p reveal' style={{ transitionDelay: '0.2s' }}>
            The all-in-one platform for student management, attendance, fees, online exams & AI analytics. Streamline operations and get back to teaching.
          </p>

          <div className='lp-hero-actions reveal' style={{ transitionDelay: '0.3s' }}>
            <Link to='/register' className='lp-btn-primary' style={{ padding: '14px 32px', fontSize: '15px' }}>
              Start Free Trial →
            </Link>
            <Link to='/pricing' className='lp-btn-ghost'>
              View Pricing
            </Link>
          </div>

          <div className='lp-trust reveal' style={{ transitionDelay: '0.4s' }}>
            <div className='lp-avatars'>
              <div className='lp-avatar' style={{ background: '#3b82f6' }} />
              <div className='lp-avatar' style={{ background: '#10b981' }} />
              <div className='lp-avatar' style={{ background: '#8b5cf6' }} />
            </div>
            <div>
              <div className='lp-stars'>★★★★★</div>
              <div className='lp-trust-text'>Trusted by {countInstitutes}+ educators</div>
            </div>
          </div>
        </div>

        <div className='lp-hero-visual reveal' style={{ transitionDelay: '0.5s' }}>
          <div className='lp-dashboard-mockup'>
            <div className='lp-mockup-header'>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className='lp-mockup-dot' style={{ background: '#ef4444' }} />
                <span className='lp-mockup-dot' style={{ background: '#f59e0b' }} />
                <span className='lp-mockup-dot' style={{ background: '#22c55e' }} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--lp-text)' }}>
                Student SaaS
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: 'var(--lp-muted)', marginBottom: '4px' }}>Monthly Revenue <br /> In Future</div>
              <div style={{ fontSize: '24px', fontWeight: '800' }}>₹12.4 Lakhs</div>
            </div>
            <div className='lp-mockup-bars'>
              <div className='lp-bar' style={{ height: '40%' }} />
              <div className='lp-bar' style={{ height: '60%' }} />
              <div className='lp-bar' style={{ height: '80%', background: 'var(--lp-indigo)' }} />
              <div className='lp-bar' style={{ height: '50%' }} />
              <div className='lp-bar' style={{ height: '90%', background: 'var(--lp-fuchsia)' }} />
              <div className='lp-bar' style={{ height: '70%' }} />
            </div>
          </div>
        </div>
      </section>

      <section className='lp-stats-strip reveal'>
        <div className='lp-stat-item'>
          <div className='lp-stat-num'>{countInstitutes}+</div>
          <div className='lp-stat-label'>Institutes Active</div>
        </div>
        <div className='lp-stat-item'>
          <div className='lp-stat-num'>50,000+</div>
          <div className='lp-stat-label'>Students Managed</div>
        </div>
        <div className='lp-stat-item'>
          <div className='lp-stat-num'>{countPassRate}%</div>
          <div className='lp-stat-label'>Avg. Pass Rate</div>
        </div>
        <div className='lp-stat-item'>
          <div className='lp-stat-num'>{countCities}+</div>
          <div className='lp-stat-label'>Cities Covered</div>
        </div>
      </section>
    </>
  );
}
