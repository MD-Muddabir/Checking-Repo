import { useState } from 'react';
import { FAQ_ITEMS } from '../../data/faq';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function FAQ() {
  useScrollReveal('reveal', 0.1);
  const [openId, setOpenId] = useState(null);

  return (
    <section className='lp-section' id='faq' style={{ background: '#F8FAFC' }}>
      <div className='lp-section-header reveal'>
        <span className='lp-eyebrow'>Got Questions?</span>
        <h2 className='lp-h2'>Frequently Asked Questions</h2>
        <p className='lp-subtitle'>
          Everything you need to know about the product and billing. Can't find an answer? Feel free to contact our support team.
        </p>
      </div>

      <div className='lp-faq-grid reveal'>
        {FAQ_ITEMS.map((item) => (
          <div key={item.id} className='lp-faq-item'>
            <button 
              className={`lp-faq-q ${openId === item.id ? 'open' : ''}`}
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
            >
              {item.question}
           </button>
            <div className={`lp-faq-a ${openId === item.id ? 'open' : ''}`}>
              <div style={{ paddingTop: '8px' }}>
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
