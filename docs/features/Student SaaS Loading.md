

🎓
STUDENT SAAS
Landing Page — Complete Implementation Guide
From Basic Setup to Advanced Production Deployment
Version 1.0  |  March 2026  |  Hyderabad, Telangana
Available on  Web  •  Android  •  iOS
 
Table of Contents
This guide walks you through every phase of integrating, modifying, and deploying the Student SaaS public landing page — from adding it to your existing React project, to production-level optimisations and App Store-ready mobile landing pages.
Phase	Title	Level	Pages
Phase 0	Project Setup & Prerequisites	Basic	4–6
Phase 1	File Structure & Component Architecture	Basic	7–10
Phase 2	Navbar — Routing & Active States	Basic	11–14
Phase 3	Hero Section — Animations & Counters	Intermediate	15–19
Phase 4	Features Section — Filter Tabs & Bento Grid	Intermediate	20–24
Phase 5	Pricing Section — Toggle, Plans & Compare Table	Intermediate	25–29
Phase 6	Testimonials — Infinite Scroll Marquee	Intermediate	30–32
Phase 7	About, FAQ & Contact Sections	Intermediate	33–36
Phase 8	Global Interactivity — Cursor, Progress, Reveal	Advanced	37–40
Phase 9	Responsive Design & Mobile Drawer	Advanced	41–44
Phase 10	Backend Integration — Forms & API	Advanced	45–49
Phase 11	SEO, Meta Tags & Performance	Advanced	50–53
Phase 12	Production Deployment — Vercel / AWS / cPanel	Expert	54–58
 
Phase 0 — Project Setup & Prerequisites
Before adding the landing page, make sure your project environment is correctly configured. This phase covers installing the right tools, dependencies, and confirming your tech stack is compatible.
0.1  Technology Stack Overview
Layer	Technology	Purpose
Frontend Framework	React 18 + Vite	Component-based UI, fast dev server
Styling	CSS Variables + Tailwind (optional)	Design tokens, responsive layout
Routing	React Router v6	SPA navigation, active link detection
Animations	CSS Keyframes + IntersectionObserver	Scroll reveal, counters, blob effects
Forms	React Hook Form	Validation, submission handling
State Management	Zustand or React Context	Plan toggle, feature filter state
Backend / API	Node.js + Express (or Next.js API routes)	Contact form, lead capture
Database	MongoDB / Firebase Firestore	Leads, contact submissions
Deployment	Vercel / Netlify / AWS / cPanel	Hosting with CI/CD

0.2  Prerequisites Checklist
•	✅  Node.js v18 or higher installed (node -v to check)
•	✅  npm v9 or higher (npm -v to check)
•	✅  Git installed and a repository initialised
•	✅  Your existing Student SaaS project running (npm run dev)
•	✅  Vite configured (vite.config.js or vite.config.ts present)
•	✅  Google Fonts accessible (or fallback fonts ready)

0.3  Install Required Dependencies
Run these commands inside your project root:
# Core dependencies
npm install react-router-dom react-intersection-observer
npm install react-hook-form @hookform/resolvers zod
npm install framer-motion          # optional advanced animations
npm install axios                  # for API calls (contact form)
# Google Fonts — add to index.html <head>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Bricolage+Grotesque:wght@400;600;700;800&display=swap" rel="stylesheet">

0.4  Folder Structure Best Practice
Recommended structure before adding landing page files:
src/
  components/
    landing/          ← ALL landing page components go here
      Navbar.jsx
      Hero.jsx
      Features.jsx
      Pricing.jsx
      Testimonials.jsx
      About.jsx
      FAQ.jsx
      Contact.jsx
      CTA.jsx
      Footer.jsx
    shared/           ← Reusable UI (Button, Badge, Card)
  pages/
    LandingPage.jsx   ← Assembles all sections
  styles/
    landing.css       ← CSS variables, global landing styles
  hooks/
    useCountUp.js     ← Counter animation hook
    useScrollReveal.js
  data/
    features.js       ← Feature cards data array
    plans.js          ← Pricing plans data
    testimonials.js
 
Phase 1 — File Structure & Component Architecture
This phase converts the single-file HTML landing page into a clean, maintainable React component tree. Each section becomes its own component with separated data, styles, and logic.
1.1  LandingPage.jsx — The Assembly Component
This page component assembles all sections. It also manages global state that needs to be shared between sections (e.g., billing toggle, active plan).
💡  Best Practice:
Keep LandingPage.jsx thin — it should only import and render sections. Put all logic inside the individual section components or custom hooks.

// src/pages/LandingPage.jsx
import { useState } from 'react';
import Navbar        from '../components/landing/Navbar';
import Hero          from '../components/landing/Hero';
import TrustBar      from '../components/landing/TrustBar';
import Features      from '../components/landing/Features';
import HowItWorks    from '../components/landing/HowItWorks';
import Pricing       from '../components/landing/Pricing';
import Testimonials  from '../components/landing/Testimonials';
import About         from '../components/landing/About';
import FAQ           from '../components/landing/FAQ';
import Contact       from '../components/landing/Contact';
import CTA           from '../components/landing/CTA';
import Footer        from '../components/landing/Footer';
import '../styles/landing.css';

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  return (
    <div className='landing-root'>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Pricing isAnnual={isAnnual} onToggle={()=>setIsAnnual(p=>!p)} />
        <Testimonials />
        <About />
        <FAQ />
        <Contact />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

1.2  Route Setup in App.jsx
Add the landing page as the root route so it renders at the home URL (/).
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage  from './pages/LandingPage';
import Dashboard    from './pages/Dashboard';   // your existing app
import Login        from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'          element={<LandingPage />} />
        <Route path='/login'     element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

1.3  Global CSS Variables (landing.css)
Move all CSS custom properties and reset rules into a dedicated file to keep styles scoped to the landing page:
⚠️  Important:
Prefix all landing CSS classes with .lp- or wrap everything under .landing-root to avoid style collisions with your dashboard or admin portal CSS.
 
Phase 2 — Navbar: Routing & Active States
The Navbar is the first thing users see. It must be fixed, scroll-aware, have working smooth-scroll links, an active link indicator, and a mobile responsive drawer.
2.1  Core Features to Implement
•	▸  Fixed position with backdrop blur and transparent → white transition on scroll
•	▸  Smooth scroll navigation to page sections using useRef or vanilla scrollIntoView
•	▸  Active nav link detection using IntersectionObserver or scroll position calculation
•	▸  Login button routes to /login using React Router <Link>
•	▸  Get Started button routes to /signup or scrolls to #pricing
•	▸  Mobile hamburger toggles a slide-in drawer overlay

2.2  Navbar.jsx Component Code
// src/components/landing/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home',       href: '#home'         },
  { label: 'Features',   href: '#features'     },
  { label: 'How It Works', href: '#how'        },
  { label: 'Pricing',    href: '#pricing'      },
  { label: 'About',      href: '#about'        },
  { label: 'Contact',    href: '#contact'      },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive]     = useState('home');
  const [drawer, setDrawer]     = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      // Active link detection
      const ids = ['home','features','how','pricing','about','contact'];
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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setDrawer(false);
  };

  return (
    <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
      <a className='lp-logo' onClick={() => scrollTo('#home')}>
        <span className='lp-logo-icon'>🎓</span> Student SaaS
      </a>
      <ul className='lp-nav-links'>
        {NAV_LINKS.map(l => (
          <li key={l.label}>
            <a className={active===l.href.slice(1)?'active':''} onClick={()=>scrollTo(l.href)}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <div className='lp-nav-actions'>
        <Link to='/login' className='btn-ghost'>Login</Link>
        <Link to='/signup' className='btn-primary'>Get Started Free</Link>
      </div>
      <button className='lp-hamburger' onClick={()=>setDrawer(true)}>
        <span/><span/><span/>
      </button>
      {drawer && <MobileDrawer onClose={()=>setDrawer(false)} scrollTo={scrollTo} />}
    </nav>
  );
}

2.3  Scroll Offset Fix
💡  Pro Tip:
Fixed navbars offset scroll targets. Add padding-top: 70px (your nav height) to the html element, or use scroll-margin-top: 80px on each section ID. This ensures smooth scroll lands exactly at the section heading, not underneath the navbar.
 
Phase 3 — Hero Section: Animations & Counters
The Hero is the most important section — it determines whether a visitor stays or leaves. Implement all visual effects precisely: animated blobs, staggered text reveal, and live counting stats.
3.1  Hero Subsections
Subsection	Implementation Method	Complexity
Background grid pattern	CSS background-image repeating linear-gradient	Basic
Animated blob orbs	CSS @keyframes with filter:blur, opacity, animation	Basic
Eyebrow badge with pulse dot	CSS animation:pulse 2s infinite on the dot span	Basic
Hero title stagger animation	CSS animation-delay on each element (0.1s increments)	Basic
Counter stats (500+ institutes)	useCountUp custom hook with requestAnimationFrame	Intermediate
Dashboard mockup	Static HTML/JSX with CSS bar animations	Intermediate
Trust bar (avatars + rating)	Simple flexbox row with avatar stack CSS	Basic

3.2  useCountUp Custom Hook
// src/hooks/useCountUp.js
import { useState, useEffect, useRef } from 'react';

export function useCountUp(target, duration = 2200, trigger = true) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else setCount(target);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, trigger]);

  return count;
}

// Usage in Hero.jsx:
// const { ref, inView } = useInView({ triggerOnce: true });
// const count = useCountUp(500, 2000, inView);
// <span ref={ref}>{count}+</span>

3.3  Hero Stats Data
Stat	Target Value	Suffix	Trigger
Institutes Onboard	500	+	IntersectionObserver on trust bar
Students Managed	50000	+	Same observer
Exams Conducted	12000	+	Same observer
Cities Covered	48	+	Same observer

3.4  Dashboard Mockup Animation
💡  Best Practice:
Animate the bar chart heights using CSS transitions. On component mount (or IntersectionObserver), set the height from 0% to target%. Add transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1) and stagger each bar with animation-delay: calc(0.1s * var(--i)) where --i is a CSS custom property set inline.
 
Phase 4 — Features Section: Filter Tabs & Bento Grid
The Features section showcases all 26 features with an interactive role-based filter. It also includes a Bento grid of live UI mockups — attendance calendar, notification feed, and metrics.
4.1  Feature Data Structure
Keep all feature card data in a separate file for easy maintenance:
// src/data/features.js
export const FEATURES = [
  {
    id: 1,
    icon: '👔',
    title: 'Manage Admins & Managers',
    desc: 'Create, assign roles, and manage accounts with granular permissions.',
    roles: ['admin'],
    plan: 'Starter+',
    color: 'blue',
  },
  {
    id: 2,
    icon: '👨‍🎓',
    title: 'Manage Students',
    desc: 'Complete profiles, enrollment, batch assignment, academic records.',
    roles: ['admin', 'faculty'],
    plan: 'Starter+',
    color: 'violet',
  },
  // ... all 26 features
];

export const ROLES = ['all', 'admin', 'faculty', 'student', 'parent', 'analytics'];

4.2  Role Filter Logic
// src/components/landing/Features.jsx
import { useState } from 'react';
import { FEATURES, ROLES } from '../../data/features';

export default function Features() {
  const [activeRole, setActiveRole] = useState('all');

  const filtered = activeRole === 'all'
    ? FEATURES
    : FEATURES.filter(f => f.roles.includes(activeRole));

  return (
    <section id='features'>
      {/* Role Filter Tabs */}
      <div className='features-tabs'>
        {ROLES.map(role => (
          <button
            key={role}
            className={`feat-tab ${activeRole === role ? 'active' : ''}`}
            onClick={() => setActiveRole(role)}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>
      {/* Feature Cards Grid */}
      <div className='features-grid'>
        {filtered.map(feat => (<FeatureCard key={feat.id} {...feat} />))}
      </div>
    </section>
  );
}

💡  Advanced Enhancement:
Add a smooth transition when the grid re-renders after filtering using Framer Motion's AnimatePresence and layout prop. This animates cards in/out smoothly instead of the abrupt show/hide you get with display:none.
 
Phase 5 — Pricing Section: Toggle, Plans & Compare Table
The Pricing section is the most conversion-critical page section. Every detail — the plan highlight, the billing toggle, the comparison table — must work flawlessly.
5.1  Pricing Plans Data
Plan	Monthly Price	Annual Price	Students	Admins	Faculty
🌱 Starter	₹999	₹799	200	3	15
📘 Basic	₹2,499	₹1,999	800	8	60
🚀 Professional	₹5,999	₹4,799	3,000	20	200
🏛 Enterprise	₹12,999	₹10,399	Unlimited	Unlimited	Unlimited

5.2  Billing Toggle — Props Pattern
// Pricing receives isAnnual + onToggle from LandingPage.jsx
export default function Pricing({ isAnnual, onToggle }) {
  return (
    <section id='pricing'>
      <BillingToggle isAnnual={isAnnual} onToggle={onToggle} />
      <div className='pricing-grid'>
        {PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            {...plan}
            price={isAnnual ? plan.annualPrice : plan.monthlyPrice}
            isHot={plan.id === 'professional'}
          />
        ))}
      </div>
      <CompareTable />
    </section>
  );
}

// BillingToggle.jsx
function BillingToggle({ isAnnual, onToggle }) {
  return (
    <div className='billing-toggle-wrap'>
      <span className={!isAnnual ? 'active' : ''}>Monthly</span>
      <button
        role='switch'
        aria-checked={isAnnual}
        className={`toggle-switch ${isAnnual ? 'annual' : ''}`}
        onClick={onToggle}
      >
        <span className='toggle-knob' />
      </button>
      <span className={isAnnual ? 'active' : ''}>Annual</span>
      <span className='save-pill'>Save 20%</span>
    </div>
  );
}

5.3  Add-Ons Section
The 6 optional add-ons should be rendered from a data array. Each add-on card links to the Contact section (scrollIntoView) when clicked so interested users can enquire directly.
•	💠  Extra Student Pack (+100 students) — ₹299/month
•	💠  Extra Faculty Pack (+10 faculty) — ₹199/month
•	💠  SMS Notification Bundle (5,000 SMS) — ₹499/month
•	💠  White-label Mobile App — ₹4,999 setup + ₹999/month
•	💠  Biometric Device Integration — ₹1,999 setup + ₹499/month
•	💠  Custom Domain & SSL — ₹999/year
 
Phase 6 — Testimonials: Infinite Scroll Marquee
The testimonial marquee creates social proof through a flowing, auto-scrolling card strip. The key challenge is making it pause on hover and loop seamlessly without a visible jump.
6.1  CSS-Only Marquee (No Library Required)
/* The trick: render testimonials TWICE in the DOM */
/* The animation moves the container -50% (one full set) */
/* When it reaches -50%, it's identical to 0% → seamless loop */

.testi-marquee {
  display: flex;
  width: max-content;          /* shrink-wrap to content */
  animation: marquee 35s linear infinite;
}
.testi-marquee:hover {
  animation-play-state: paused; /* pause on hover */
}
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); } /* move exactly one set */
}

// JSX: render all items twice
<div className='testi-marquee'>
  {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
    <TestiCard key={i} {...t} />
  ))}
</div>

6.2  Testimonial Data Structure
Field	Type	Notes
id	number	Unique identifier
stars	number	1–5 for star rendering
text	string	The review quote (keep under 200 characters)
author.initials	string	2-letter display in avatar circle
author.name	string	Full name
author.role	string	Title + Institute + City
author.gradientFrom	string	Hex — left side of avatar gradient
author.gradientTo	string	Hex — right side of avatar gradient
 
Phase 7 — About, FAQ & Contact Sections
These sections round out the landing page with trust-building content, common question answers, and a live lead-capture form.
7.1  About Section — Float Cards Animation
The two floating stat cards (500+ institutes, 98% satisfaction) should animate their numbers on scroll. Use the useCountUp hook from Phase 3 with IntersectionObserver trigger.
💡  Pro Tip:
The about-float cards use CSS position:absolute on a relative wrapper. On mobile, switch to position:static and render them inline. Use a media query at 768px to toggle this layout change.

7.2  FAQ Accordion Component
// src/components/landing/FAQ.jsx
import { useState } from 'react';
import { FAQ_ITEMS } from '../../data/faq';

export default function FAQ() {
  const [openId, setOpenId] = useState(null);

  return (
    <section id='faq'>
      <div className='faq-grid'>
        {FAQ_ITEMS.map(item => (
          <div key={item.id} className='faq-item'>
            <button
              className={`faq-q ${openId === item.id ? 'open' : ''}`}
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
            >
              {item.question}
              <span className='faq-arrow'>▼</span>
            </button>
            {/* Smooth height animation with CSS max-height trick */}
            <div
              className={`faq-a ${openId === item.id ? 'open' : ''}`}
              style={{ maxHeight: openId === item.id ? '200px' : '0px' }}
            >
              {item.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

7.3  Contact Form Validation
Field	Validation Rule	Error Message
Name	Required, min 2 chars	Please enter your full name
Phone	Required, 10-digit Indian number regex	Enter a valid 10-digit number
Email	Required, valid email format	Enter a valid email address
Institute Name	Required, min 3 chars	Institute name is required
Student Count	Required (select)	Please select your student range
Plan Interest	Optional	—
Message	Optional, max 500 chars	Message too long (max 500 chars)
 
Phase 8 — Global Interactivity: Cursor, Progress Bar & Scroll Reveal
These global effects run across all sections and significantly elevate the perceived quality of the landing page. They should be implemented as lightweight utilities that add zero layout overhead.
8.1  Custom Cursor
The custom cursor consists of two elements: a small dot (fast) and a ring (lagging). The lag is created by a lerp (linear interpolation) animation loop in requestAnimationFrame:
// src/hooks/useCursor.js
import { useEffect } from 'react';

export function useCursor() {
  useEffect(() => {
    const dot  = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    let mx=0, my=0, rx=0, ry=0;

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    document.addEventListener('mousemove', onMove);

    // LERP loop — ring follows with 12% interpolation
    let raf;
    const loop = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (dot)  { dot.style.left  = mx+'px'; dot.style.top  = my+'px'; }
      if (ring) { ring.style.left = rx+'px'; ring.style.top = ry+'px'; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
}

8.2  Scroll Reveal — useScrollReveal Hook
Elements slide up and fade in as they enter the viewport. Uses IntersectionObserver with a threshold of 0.1 (10% visible = trigger).
⚠️  Important:
Add will-change: transform, opacity to .reveal elements in CSS. This moves the elements to their own GPU layer and prevents paint jank during the scroll animation. Remove will-change after the animation completes to free GPU memory.

8.3  Progress Bar Implementation
// useEffect in LandingPage.jsx
useEffect(() => {
  const update = () => {
    const scrolled = window.scrollY;
    const total = document.body.scrollHeight - window.innerHeight;
    const pct = (scrolled / total) * 100;
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  return () => window.removeEventListener('scroll', update);
}, []);

// CSS — fixed bar at top of page
#progress-bar {
  position: fixed; top: 0; left: 0; height: 3px; z-index: 2000;
  background: linear-gradient(135deg, #2563EB, #7C3AED);
  transition: width 0.1s linear;
  pointer-events: none;
}
 
Phase 9 — Responsive Design & Mobile Drawer
A professional landing page must be pixel-perfect on mobile. This phase covers all responsive breakpoints, the mobile navigation drawer, and touch-friendly interactions.
9.1  Breakpoint System
Breakpoint	Width	Changes
Desktop	1200px+	Full 4-column pricing, 3-column features, full nav
Laptop	1100px	4-column pricing → 2-column, bento wide spans collapse
Tablet	768px	Nav hides → hamburger, features → 1 col, side-by-side → stacked
Mobile	480px	Font sizes reduce, hero stats wrap, form rows stack
Small Mobile	360px	Minimum viable layout, hero title at 2.2rem

9.2  Mobile Drawer Component
// Overlay + Drawer pattern
// Overlay prevents scrolling & closes drawer on tap-outside

function MobileDrawer({ onClose, scrollTo }) {
  // Prevent body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      {/* Overlay */}
      <div className='drawer-overlay' onClick={onClose} />
      {/* Drawer panel */}
      <aside className='mobile-drawer'>
        <button className='drawer-close' onClick={onClose}>✕</button>
        <ul className='drawer-links'>
          {NAV_LINKS.map(l => (
            <li key={l.label}>
              <a onClick={() => scrollTo(l.href)}>{l.icon} {l.label}</a>
            </li>
          ))}
        </ul>
        <div className='drawer-btns'>
          <Link to='/login' className='btn-ghost w-full'>Login</Link>
          <Link to='/signup' className='btn-primary w-full'>Get Started</Link>
        </div>
      </aside>
    </>
  );
}

💡  Accessibility:
Add aria-label='Open navigation menu' to the hamburger button, aria-modal='true' to the drawer, and trap keyboard focus inside the drawer when open. Use Escape key to close. These improvements are required for WCAG 2.1 AA compliance.
 
Phase 10 — Backend Integration: Forms & API
Connect the Contact form and CTA buttons to a real backend. This phase covers API setup, form submission, lead storage, and email notifications using Node.js + Express + MongoDB.
10.1  Backend Architecture
Component	Technology	Purpose
API Server	Node.js + Express	REST endpoints for contact form, lead capture
Database	MongoDB + Mongoose	Store leads, form submissions
Email Service	Nodemailer + Gmail / SendGrid	Auto-email notifications on new lead
Validation	Joi or Zod (server-side)	Sanitise and validate all form inputs
Rate Limiting	express-rate-limit	Prevent form spam (5 req/min per IP)
CORS	cors npm package	Allow only your domain to call the API

10.2  API Endpoint — POST /api/contact
// server/routes/contact.js
const router = require('express').Router();
const Lead   = require('../models/Lead');
const mailer = require('../utils/mailer');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({ windowMs: 60000, max: 5 });

router.post('/', limiter, async (req, res) => {
  try {
    const { name, phone, email, institute, studentCount, plan, message } = req.body;

    // Save to MongoDB
    const lead = await Lead.create({
      name, phone, email, institute, studentCount, plan, message,
      createdAt: new Date(),
      source: 'landing-page-contact',
    });

    // Send notification email to sales team
    await mailer.sendLeadNotification({ name, email, phone, institute, plan });

    // Send welcome email to the lead
    await mailer.sendWelcomeEmail({ name, email });

    res.json({ success: true, leadId: lead._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

10.3  React Form Submission
// Contact.jsx — form submit handler
import { useForm } from 'react-hook-form';
import axios from 'axios';

const { register, handleSubmit, reset,
        formState: { errors, isSubmitting } } = useForm();

const onSubmit = async (data) => {
  try {
    await axios.post('/api/contact', data);
    toast.success('Message sent! We will contact you within 2 hours.');
    reset(); // clear all form fields
  } catch (err) {
    toast.error('Something went wrong. Please try WhatsApp instead.');
  }
};

// In JSX:
<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('name', { required: 'Name is required' })} />
  {errors.name && <span className='cf-error'>{errors.name.message}</span>}
  <button disabled={isSubmitting}>
    {isSubmitting ? 'Sending...' : 'Send Message →'}
  </button>
</form>
 
Phase 11 — SEO, Meta Tags & Performance Optimisation
A beautiful landing page is wasted if it doesn't rank on Google. This phase covers all the technical SEO, Open Graph meta tags, structured data, and performance optimisations needed for a production-ready launch.
11.1  index.html Meta Tags
Tag	Value to Set
<title>	Student SaaS — Manage Your Coaching Institute Like a Pro
description	The all-in-one platform for coaching institutes. Student management, attendance, fees, online exams & AI analytics. Free 14-day trial.
og:title	Student SaaS — Coaching Institute Management Platform
og:description	Manage 200–3000+ students with attendance, fees, exams & AI analytics.
og:image	/og-image.png  (1200×630px screenshot of the landing page)
og:url	https://studentsaas.in
twitter:card	summary_large_image
canonical	https://studentsaas.in
robots	index, follow
theme-color	#2563EB (your brand blue)

11.2  Performance Checklist
•	⚡  Lazy-load all section components with React.lazy + Suspense
•	⚡  Split the CSS: load landing.css only on the landing page route
•	⚡  Use next/image (or vite-imagetools) for WebP image optimization
•	⚡  Preload Google Fonts with <link rel='preconnect'> in index.html
•	⚡  Add loading='lazy' to all hero mockup and about section images
•	⚡  Bundle analyse with rollup-plugin-visualizer — keep chunk < 250KB
•	⚡  Target Lighthouse scores: Performance 90+, Accessibility 95+, SEO 100

11.3  Structured Data (JSON-LD)
Add this to your index.html or inject via React Helmet. It helps Google display rich search results (star ratings, pricing) for your page:
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Student SaaS",
  "applicationCategory": "EducationApplication",
  "operatingSystem": "Web, Android, iOS",
  "offers": {
    "@type": "Offer",
    "price": "999",
    "priceCurrency": "INR"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "500"
  }
}
</script>
 
Phase 12 — Production Deployment
The final phase covers deploying your Student SaaS landing page to production. Three deployment methods are covered: Vercel (easiest), AWS S3 + CloudFront (scalable), and cPanel Shared Hosting (for existing hosting plans).
12.1  Option A — Vercel (Recommended)
Vercel is the fastest path to production for React + Vite projects. It supports automatic CI/CD, custom domains, and edge caching out of the box.
1.	Push your code to GitHub (git push origin main)
2.	Go to vercel.com → New Project → Import your GitHub repo
3.	Set Build Command: npm run build  and  Output Directory: dist
4.	Add Environment Variables (VITE_API_URL, etc.) in Vercel dashboard
5.	Add your custom domain (studentsaas.in) in Vercel → Settings → Domains
6.	Enable Analytics and Speed Insights in Vercel dashboard (free tier)
✅  Result:
Every push to main auto-deploys. Preview URLs generated for every PR. Free SSL certificate. ~50ms global edge response time.

12.2  Option B — AWS S3 + CloudFront
7.	Run npm run build — this creates the dist/ folder
8.	Create S3 bucket (e.g., studentsaas-landing) with static website hosting enabled
9.	Upload all files from dist/ to S3 with public read access
10.	Create a CloudFront distribution pointing to the S3 bucket
11.	Set default root object to index.html
12.	Add a custom error page for 404 → index.html (required for SPA routing)
13.	Create Route 53 record pointing studentsaas.in to CloudFront distribution

12.3  Option C — cPanel Shared Hosting
14.	Run npm run build locally to generate the dist/ folder
15.	Login to cPanel → File Manager → public_html
16.	Upload all contents of dist/ to public_html (not the folder, just its contents)
17.	Create a .htaccess file in public_html to handle SPA routing:
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

12.4  Deployment Comparison
Method	Difficulty	Cost	SSL	CI/CD	Best For
Vercel	Easy	Free tier available	✅ Auto	✅ Auto	Startups, developers
AWS S3+CF	Medium	~₹200–500/month	✅ ACM	Manual/GitHub Actions	Scale, enterprise
cPanel	Easy	Already paying	✅ cPanel	❌ Manual upload	Existing hosting plan
 
Appendix — Quick Reference
A.  All 26 Features — Category Map
#	Feature	Category	Min Plan
1	Manage Admins / Managers	Admin	Starter
2	Manage Students	Admin + Faculty	Starter
3	Manage Student Attendance	Faculty	Starter
4	View Attendance Reports	Admin + Faculty	Starter
5	Scan Student QR Code	Faculty	Starter
6	Manage Classes	Admin	Starter
7	Manage Parents	Parent + Admin	Basic
8	Manage Faculty	Admin	Basic
9	Faculty Attendance	Faculty	Basic
10	View Faculty Tracker	Admin	Basic
11	Scan Faculty QR Code	Faculty	Basic
12	Manage Subjects	Admin	Starter
13	Collect Fees	Admin	Starter
14	Finances & Expenses	Admin	Basic
15	Reports & Analytics	Admin	Basic
16	Manage Exams	Faculty + Student	Basic
17	Master Timetable	Admin + Faculty	Basic
18	Announcements	Admin + Faculty	Starter
19	All Notes	Faculty + Student	Starter
20	Chat Monitor	Admin	Basic
21	Assignments	Faculty + Student	Starter
22	Institute Public Web Page	Admin	Starter
23	Exam Reports	Admin + Faculty	Basic
24	Student Performance Analytics	Admin + Student	Professional
25	Biometric Attendance	Faculty + Student	Professional
26	Faculty Performance Analytics	Admin	Professional

B.  Recommended npm Packages
Package	Purpose	Install Command
react-router-dom	Client-side routing	npm install react-router-dom
react-hook-form	Form validation & submission	npm install react-hook-form
zod	Schema validation	npm install zod @hookform/resolvers
axios	HTTP API calls	npm install axios
react-intersection-observer	Scroll-triggered animations	npm install react-intersection-observer
framer-motion	Advanced animations	npm install framer-motion
react-hot-toast	Success/error notifications	npm install react-hot-toast
react-helmet-async	Dynamic meta tags for SEO	npm install react-helmet-async
zustand	Lightweight global state	npm install zustand

C.  Contact & Support
Channel	Details
Email	sales@studentsaas.in
Phone / WhatsApp	+91 98765 43210
Location	Hyderabad, Telangana, India
Business Hours	Monday–Saturday, 9 AM – 7 PM IST
Website	www.studentsaas.in

© 2026 Student SaaS. All rights reserved. Made with ❤️ in Hyderabad, Telangana.
