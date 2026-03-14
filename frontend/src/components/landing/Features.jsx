import { useState } from 'react';
import { FEATURES, ROLES } from '../../data/features';
import { useScrollReveal } from '../../hooks/useScrollReveal';

function FeatureCard({ icon, title, desc, plan, color }) {
  return (
    <div className='lp-feat-card reveal' style={{ '--color': color }}>
      <div className='lp-feat-icon' style={{ color }}>{icon}</div>
      <h3 className='lp-feat-title'>{title}</h3>
      <p className='lp-feat-desc'>{desc}</p>
      <div className='lp-feat-footer'>
        <span>Available in</span>
        <span style={{ color }}>{plan}</span>
      </div>
    </div>
  );
}

export default function Features() {
  useScrollReveal('reveal', 0.1);
  const [activeRole, setActiveRole] = useState('all');

  const filtered = activeRole === 'all'
    ? FEATURES
    : FEATURES.filter(f => f.roles.includes(activeRole));

  return (
    <section className='lp-section' id='features' style={{ background: 'white' }}>
      <div className='lp-section-header reveal'>
        <span className='lp-eyebrow'>Why Choose Us</span>
        <h2 className='lp-h2'>Everything You Need to Run Your Institute</h2>
        <p className='lp-subtitle'>
          Stop juggling 5 different apps. Student SaaS brings your attendance, fees, exams, and analytics together in one unified platform.
        </p>
      </div>

      <div className='lp-feat-tabs reveal'>
        {ROLES.map(role => (
          <button
            key={role}
            className={`lp-feat-tab ${activeRole === role ? 'active' : ''}`}
            onClick={() => setActiveRole(role)}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)} Features
          </button>
        ))}
      </div>

      <div className='lp-feat-grid'>
        {filtered.map(feat => (
          <FeatureCard key={feat.id} {...feat} />
        ))}
      </div>
    </section>
  );
}
