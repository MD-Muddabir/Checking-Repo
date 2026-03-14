import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className='lp-footer'>
      <div className='lp-footer-grid'>
        <div>
          <Link to='/' className='lp-logo'>
            <span className='lp-logo-icon'>🎓</span> Student SaaS
          </Link>
          <p className='lp-footer-desc'>
            The all-in-one platform for coaching institutes. Manage students, attendance, fees, and exams seamlessly. Built for scale.
          </p>
        </div>

        <div>
          <h4 className='lp-footer-h4'>Platform</h4>
          <ul className='lp-footer-links'>
            <li><a href='#features'>Features</a></li>
            <li><a href='#pricing'>Pricing & Plans</a></li>
            <li><a href='#testimonials'>Success Stories</a></li>
            <li><Link to='/register'>Start Free Trial</Link></li>
            <li><Link to='/login'>Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 className='lp-footer-h4'>Resources</h4>
          <ul className='lp-footer-links'>
            <li><a href='#faq'>FAQ</a></li>
            <li><a href='#contact'>Contact Support</a></li>
            <li><Link to='/terms'>Terms of Service</Link></li>
            <li><Link to='/privacy'>Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className='lp-footer-h4'>Get in Touch</h4>
          <ul className='lp-footer-links'>
            <li><span>📍 Hyderabad, Telangana</span></li>
            <li><a href='mailto:muddabir@gmail.com'>muddabir03@gmail.com</a></li>
            <li><a href='tel:+917887682938'>+91 78876 82938</a></li>
            <li style={{ marginTop: '16px' }}>
              <Link to='/register' className='lp-btn-primary' style={{ padding: '8px 16px', fontSize: '13px' }}>
                Book Demo
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className='lp-footer-bottom'>
        <span>© {new Date().getFullYear()} Student SaaS. All rights reserved.</span>
        <span>Made with ❤️ in Hyderabad, Telangana.</span>
      </div>
    </footer>
  );
}
