import { useState } from 'react';
import { PLANS, ADDONS } from '../../data/plans';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Link } from 'react-router-dom';

function BillingToggle({ isAnnual, onToggle }) {
  return (
    <div className='lp-pricing-toggle reveal'>
      <span className={!isAnnual ? 'active' : ''} onClick={onToggle}>Monthly</span>
      <button
        role='switch'
        aria-checked={isAnnual}
        className={`lp-switch ${isAnnual ? 'annual' : ''}`}
        onClick={onToggle}
      >
        <span className='lp-switch-knob' />
      </button>
      <span className={isAnnual ? 'active' : ''} onClick={onToggle}>Annual</span>
      <span className='lp-save-pill'>Save 20%</span>
    </div>
  );
}

function PlanCard({ id, name, monthlyPrice, annualPrice, icon, students, admins, faculty, features, isHot, isAnnual }) {
  const price = isAnnual ? annualPrice : monthlyPrice;
  return (
    <div className={`lp-plan-card reveal ${isHot ? 'hot' : ''}`}>
      {isHot && <div className='lp-plan-hot-pill'>Most Popular</div>}

      <div className='lp-plan-icon'>{icon}</div>
      <h3 className='lp-plan-name'>{name}</h3>
      <div className='lp-plan-price'>₹{price.toLocaleString()}<span>/mo</span></div>
      <p style={{ fontSize: '13px', color: 'var(--lp-muted)', marginTop: '-4px' }}>
        {isAnnual ? `Billed ₹${(price * 12).toLocaleString()} annually` : 'Billed monthly'}
      </p>

      <div className='lp-plan-divider' />

      <ul className='lp-plan-feats'>
        <li>{students === 'Unlimited' ? 'Unlimited Students' : `Up to ${students} Students`}</li>
        <li>{admins === 'Unlimited' ? 'Unlimited Admins' : `${admins} Admins & ${faculty} Faculty`}</li>
        {features.slice(2).map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>

      <Link
        to='/register'
        className={isHot ? 'lp-btn-primary' : 'lp-btn-ghost'}
        style={{ width: '100%', marginTop: 'auto', border: !isHot ? '1px solid var(--lp-border)' : 'none' }}
      >
        Start Free Trial
      </Link>
    </div>
  );
}

export default function Pricing() {
  useScrollReveal('reveal', 0.1);
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className='lp-section' id='pricing' style={{ background: '#F8FAFC' }}>
      <div className='lp-section-header reveal'>
        <span className='lp-eyebrow'>Transparent Pricing</span>
        <h2 className='lp-h2'>Choose the Perfect Plan for Your Institute</h2>
        <p className='lp-subtitle'>
          No hidden fees. Cancel anytime. Start with our 14-day free trial on any plan without a credit card.
        </p>
      </div>

      <BillingToggle isAnnual={isAnnual} onToggle={() => setIsAnnual(!isAnnual)} />

      <div className='lp-pricing-grid'>
        {PLANS.map((plan, i) => (
          <PlanCard key={plan.id} {...plan} isAnnual={isAnnual} style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>

      {/* <div className='lp-addons'>
        <div className='lp-section-header reveal' style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '24px', letterSpacing: '-0.5px' }}>Optional Add-Ons</h3>
          <p style={{ fontSize: '15px', color: 'var(--lp-muted)', marginTop: '8px' }}>Scale specific resources as your institute grows.</p>
        </div>
        <div className='lp-addons-grid reveal'>
          {ADDONS.map((addon, i) => (
            <div className='lp-addon-card' key={i}>
              <div>
                <div className='lp-addon-name'>{addon.name}</div>
                <div className='lp-addon-desc'>{addon.desc}</div>
              </div>
              <div className='lp-addon-price'>{addon.price}</div>
            </div>
          ))}
        </div>
      </div> */}
    </section>
  );
}
