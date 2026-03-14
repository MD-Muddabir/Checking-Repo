import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' }
];

function MobileDrawer({ onClose, scrollTo }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <div className='lp-drawer-overlay' onClick={onClose} />
      <aside className='lp-mobile-drawer'>
        <button className='lp-drawer-close' onClick={onClose}>✕</button>
        <ul className='lp-drawer-links'>
          {NAV_LINKS.map(l => (
            <li key={l.label}>
              <a onClick={() => scrollTo(l.href)}>{l.label}</a>
            </li>
          ))}
        </ul>
        <div className='lp-drawer-btns' style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link to='/login' className='lp-btn-ghost'>Login</Link>
          <Link to='/register' className='lp-btn-primary'>Get Started Free</Link>
        </div>
      </aside>
    </>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const ids = ['home', 'features', 'pricing', 'testimonials', 'faq'];
      let current = 'home';
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) current = id;
      });
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href) => {
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if(el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: 'smooth'
      });
    }
    setDrawer(false);
  };

  return (
    <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className='lp-logo'>
        <span className='lp-logo-icon'>🎓</span> Student SaaS
      </Link>

      <ul className='lp-nav-links'>
        {NAV_LINKS.map(l => (
          <li key={l.label}>
            <a 
              className={active === l.href.slice(1) ? 'active' : ''} 
              onClick={() => scrollTo(l.href)}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <div className='lp-nav-actions'>
        <Link to='/login' className='lp-btn-ghost'>Login</Link>
        <Link to='/register' className='lp-btn-primary'>Start Free Trial</Link>
      </div>

      <button className='lp-hamburger' onClick={() => setDrawer(true)}>
        <span/><span/><span/>
      </button>

      {drawer && <MobileDrawer onClose={() => setDrawer(false)} scrollTo={scrollTo} />}
    </nav>
  );
}
