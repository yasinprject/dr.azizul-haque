import React, { useState, useEffect } from 'react';
import './index.css';

const GOOGLE_APP_URL = "https://script.google.com/macros/s/AKfycbyl8Wr4May2e7A0iN2UFIHxXYDn8p3XRuZBCo1oSe-XSpoMMhzfp23BCIiXkt4Lgdac/exec";

function App() {
  const [scrolled, setScrolled] = useState(false);
  const[menuOpen, setMenuOpen] = useState(false);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  },[]);

  useEffect(() => {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));
    return () => revealObs.disconnect();
  },[]);

  const useSlider = (trackId, intervalMs) => {
    useEffect(() => {
      const track = document.getElementById(trackId);
      const dotsEl = document.getElementById(`${trackId}-dots`);
      if (!track || !dotsEl) return;

      const dots = Array.from(dotsEl.querySelectorAll('.dot'));
      let current = 0;
      let timer;
      const total = track.children.length;

      const goTo = (idx) => {
        current = (idx + total) % total;
        track.scrollTo({ left: current * track.clientWidth, behavior: 'smooth' });
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
      };

      const startTimer = () => {
        clearInterval(timer);
        timer = setInterval(() => { goTo(current + 1); }, intervalMs);
      };

      dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startTimer(); }));

      let scrollTimer;
      track.addEventListener('scroll', () => {
        clearInterval(timer);
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          const idx = Math.round(track.scrollLeft / track.clientWidth);
          current = idx;
          dots.forEach((d, i) => d.classList.toggle('active', i === current));
          startTimer();
        }, 300);
      }, { passive: true });

      track.addEventListener('mouseenter', () => clearInterval(timer));
      track.addEventListener('mouseleave', startTimer);

      goTo(0);
      startTimer();
      return () => clearInterval(timer);
    }, [trackId, intervalMs]);
  };

  useSlider('services-track', 5000);
  useSlider('appt-track', 5000);

  const submitAppointment = async (e, chamber) => {
    e.preventDefault();
    const suffix = chamber === 'Brahmanbaria' ? '_A' : '_B';
    const form = e.target;
    const formData = new FormData(form);
    
    const payload = {
      chamber,
      name: formData.get(`name${suffix}`),
      age: formData.get(`age${suffix}`),
      phone: formData.get(`phone${suffix}`),
      type: formData.get(`type${suffix}`)
    };

    if (chamber === 'Brahmanbaria') setLoadingA(true);
    else setLoadingB(true);

    try {
      const res = await fetch(GOOGLE_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.status === 'success') {
        alert(`✅ অভিনন্দন! আপনার সিরিয়াল কনফার্ম হয়েছে।\nআপনার সিরিয়াল নম্বর: ${result.serial}`);
        form.reset();
      } else {
        alert('❌ সমস্যা হয়েছে। অনুগ্রহ করে চেম্বারের নাম্বারে কল করুন।');
      }
    } catch {
      alert('✅ রিকোয়েস্ট পাঠানো হয়েছে। আমাদের প্রতিনিধি দ্রুত যোগাযোগ করবেন।');
      form.reset();
    } finally {
      if (chamber === 'Brahmanbaria') setLoadingA(false);
      else setLoadingB(false);
    }
  };

  return (
    <>
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="container nav-inner">
          <a className="nav-brand" href="#profile" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="nav-logo"><i className="fa-solid fa-staff-snake anim-beat"></i></div>
            <div>
              <div className="nav-title">ডা: আজিজুল হক</div>
              <div className="nav-subtitle">চিকিৎসা সেবা</div>
            </div>
          </a>
          <ul className="nav-links">
            <li><a href="#profile">প্রোফাইল</a></li>
            <li><a href="#services">সেবাসমূহ</a></li>
            <li><a href="#fees">ফি ও ছাড়</a></li>
            <li><a href="#appointment">সিরিয়াল নিন</a></li>
            <li><a href="#contact" className="nav-cta">যোগাযোগ করুন</a></li>
          </ul>
          <button className="hamburger" onClick={() => setMenuOpen(true)}>
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className={menuOpen ? 'open' : ''} onClick={(e) => { if (e.target.id === 'mobile-menu') setMenuOpen(false); }}>
        <div id="mobile-drawer">
          <div className="mobile-header">
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--blue-primary)' }}>মেনু</span>
            <button className="mobile-close" onClick={() => setMenuOpen(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <ul className="mobile-nav-links">
            <li><a href="#profile" onClick={() => setMenuOpen(false)}>প্রোফাইল</a></li>
            <li><a href="#services" onClick={() => setMenuOpen(false)}>সেবাসমূহ</a></li>
            <li><a href="#fees" onClick={() => setMenuOpen(false)}>ফি ও ছাড়</a></li>
            <li><a href="#appointment" onClick={() => setMenuOpen(false)}>অনলাইনে সিরিয়াল নিন</a></li>
            <li><a href="#contact" onClick={() => setMenuOpen(false)}>যোগাযোগ</a></li>
          </ul>
        </div>
      </div>

      <section id="profile">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-image-wrap reveal">
              <div className="hero-img-ring">
                <img src="https://i.postimg.cc/V69j6J8c/IMG-20260426-104655-868.png" alt="ডা: আজিজুল হক" />
              </div>
            </div>
            <div className="hero-content">
              <div className="bmdc-badge reveal delay-1">বিএমডিসি রেজি নং: এ-১১১১৬৯</div>
              <h1 className="hero-name reveal delay-1">ডাঃ আজিজুল হক</h1>
              <p className="hero-degree reveal delay-2">এম.বি.বি.এস (স্যার সলিমুল্লাহ মেডিকেল কলেজ)</p>
              <div className="spec-card reveal delay-2">
                <strong>বিশেষত্ব:</strong> মেডিসিন, ডায়াবেটিস, উচ্চ রক্তচাপ, বাত ব্যথা, কোমর-হাঁটু ব্যথা, হাঁপানি শ্বাসকষ্ট, মা ও শিশু-কিশোরদের যাবতীয় জটিল রোগ এবং সার্জারীতে বিশেষ প্রশিক্ষণ প্রাপ্ত।
              </div>
              <div className="hero-actions reveal delay-2">
                <a href="#appointment" className="btn-primary">সিরিয়াল বুক করুন</a>
                <a href="#contact" className="btn-outline"><i className="fa-solid fa-phone anim-wiggle"></i> কল করুন</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="section-padding">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge"><i className="fa-solid fa-hand-holding-medical"></i> আমাদের সেবা</span>
            <h2 className="section-title">পরামর্শের বিষয়সমূহ</h2>
          </div>

          <div className="slider-wrap reveal delay-1">
            <div className="slider-track" id="services-track">
              {/* Medicine Card */}
              <div className="slider-slide">
                <div className="service-card medicine">
                  <div className="service-icon"><i className="fa-solid fa-stethoscope anim-pulse"></i></div>
                  <h3>জেনারেল প্র্যাকটিশনার সেবা</h3>
                  <ul className="service-list">
                    <li><i className="fa-solid fa-check-circle"></i><span>মেডিসিন</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>ডায়াবেটিস এবং উচ্চ রক্তচাপ</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>বাত-ব্যথা / কোমর-হাঁটু ব্যথা / ঘাড় ও মাথা ব্যথা</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>এলার্জি / চর্মরোগ</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>হাঁপানি-শ্বাসকষ্ট / নিউমোনিয়া</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>মা ও শিশু-কিশোরদের যাবতীয় জটিল চিকিৎসা</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>পেট ব্যথা / ডায়রিয়া / আমাশয় / কোষ্ঠকাঠিন্য</span></li>
                  </ul>
                </div>
              </div>
              {/* Surgery Card */}
              <div className="slider-slide">
                <div className="service-card surgery">
                  <div className="service-icon"><i className="fa-solid fa-syringe anim-float"></i></div>
                  <h3>সার্জারী সেবা</h3>
                  <ul className="service-list two-col">
                    <li><i className="fa-solid fa-check-circle"></i><span>সুন্নাতে খতনা (ডিভাইস/নরমাল/কসমেটিকস)</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>লাইপোমা (চর্বির টিউমার)</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>সিস্ট / এবসেস / ফোড়া</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>যেকোনো ধরনের টিউমার</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>প্লাস্টার (পা মচকানো)</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>কাটা-ছেঁড়া সেলাই ও ড্রেসিং</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>নখের কনি উঠার চিকিৎসা</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>নাকে নল পড়ানো (এন জি টিউব)</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>প্রস্রাবের নল পড়ানো / খোলা</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>পিত্তথলি ও কিডনির পাথর</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>ব্রেস্ট / স্তনের টিউমার</span></li>
                    <li><i className="fa-solid fa-check-circle"></i><span>গ্যাংলিওন সিস্ট</span></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="slider-dots" id="services-track-dots">
              <button className="dot active"></button>
              <button className="dot"></button>
            </div>
          </div>
        </div>
      </section>

      <section id="fees" className="section-padding">
        <div className="container">
          <div className="fees-card reveal">
            <div className="fee-amount-box">
              <div className="fee-label">চিকিৎসা পরামর্শ ফি</div>
              <div className="fee-amount">৩০০<span className="fee-currency">৳</span></div>
            </div>
            <div className="fee-divider"></div>
            <div className="free-section">
              <div className="free-title"><i className="fa-solid fa-heart anim-beat"></i> যাদের জন্য ফি সম্পূর্ণ ফ্রি</div>
              <div className="free-grid">
                <div className="free-item"><i className="fa-solid fa-badge-check"></i> গরীব ও অসহায় রোগী</div>
                <div className="free-item"><i className="fa-solid fa-badge-check"></i> স্কুলের বন্ধু ও পরিবার</div>
                <div className="free-item"><i className="fa-solid fa-badge-check"></i> শ্রদ্ধেয় শিক্ষকমণ্ডলী</div>
                <div className="free-item"><i className="fa-solid fa-badge-check"></i> কোরআন এর হাফেজ</div>
                <div className="free-item"><i className="fa-solid fa-badge-check"></i> বীর মুক্তিযোদ্ধা</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="appointment" className="section-padding">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge"><i className="fa-regular fa-calendar-check"></i> সিরিয়াল বুকিং</span>
            <h2 className="section-title">অনলাইনে সিরিয়াল নিন</h2>
          </div>

          <div className="slider-wrap reveal delay-1">
            <div className="slider-track" id="appt-track">
              {/* Brahmanbaria Appt Card */}
              <div className="slider-slide">
                <div className="appt-card">
                  <div className="appt-header green">
                    <h3><i className="fa-solid fa-house-chimney-medical"></i> ব্রাহ্মণবাড়িয়া চেম্বার</h3>
                    
                    {/* Time & Address Highlights */}
                    <div className="info-highlight">
                      <i className="fa-regular fa-clock anim-wiggle"></i>
                      <div className="info-text">
                        <strong>প্রতি শুক্রবার</strong>
                        <p>সকাল ৯ টা — সন্ধ্যা ৭ টা</p>
                      </div>
                    </div>
                    <div className="info-highlight">
                      <i className="fa-solid fa-location-dot anim-float"></i>
                      <div className="info-text">
                        <strong>সাইফুল ড্রাগ সেন্টার (কৃষি ব্যাংক সংলগ্ন)</strong>
                        <p>জীবনগঞ্জ বাজার, বাঞ্ছারামপুর, ব্রাহ্মণবাড়িয়া।</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="appt-body">
                    <form onSubmit={(e) => submitAppointment(e, 'Brahmanbaria')}>
                      <div className="form-group">
                        <label className="form-label">রোগীর ধরন *</label>
                        <div className="radio-group">
                          <label className="radio-label">
                            <input type="radio" name="type_A" value="নতুন" defaultChecked /> নতুন রোগী
                          </label>
                          <label className="radio-label">
                            <input type="radio" name="type_A" value="পুরাতন" /> পুরাতন রোগী
                          </label>
                        </div>
                      </div>
                      
                      {/* Name & Age Compact Row */}
                      <div className="form-row-compact">
                        <div>
                          <label className="form-label">রোগীর নাম *</label>
                          <input type="text" name="name_A" required className="form-input" placeholder="নাম লিখুন" />
                        </div>
                        <div>
                          <label className="form-label">বয়স *</label>
                          <input type="number" name="age_A" required className="form-input" placeholder="বয়স" />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">মোবাইল নাম্বার *</label>
                        <input type="tel" name="phone_A" required pattern="[0-9]{11}" className="form-input" placeholder="017XXXXXXXX" />
                      </div>
                      
                      <button type="submit" className="btn-submit green" disabled={loadingA}>
                        {loadingA ? <><i className="fa-solid fa-spinner fa-spin"></i> প্রসেস হচ্ছে...</> : <><i className="fa-solid fa-paper-plane"></i> সিরিয়াল কনফার্ম করুন</>}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Dhaka Appt Card */}
              <div className="slider-slide">
                <div className="appt-card">
                  <div className="appt-header blue">
                    <h3><i className="fa-solid fa-building-user"></i> ঢাকা চেম্বার</h3>
                    
                    {/* Time & Address Highlights */}
                    <div className="info-highlight">
                      <i className="fa-regular fa-clock anim-wiggle"></i>
                      <div className="info-text">
                        <strong>শনি থেকে বৃহস্পতিবার</strong>
                        <p>সকাল ১০ টা — রাত ১০ টা</p>
                      </div>
                    </div>
                    <div className="info-highlight">
                      <i className="fa-solid fa-location-dot anim-float"></i>
                      <div className="info-text">
                        <strong>দি চানখারপুল জেনারেল হাসপাতাল</strong>
                        <p>১০/১ নবাব কাটারা রোড, চানখারপুল, ঢাকা।</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="appt-body">
                    <form onSubmit={(e) => submitAppointment(e, 'Dhaka')}>
                      <div className="form-group">
                        <label className="form-label">রোগীর ধরন *</label>
                        <div className="radio-group">
                          <label className="radio-label">
                            <input type="radio" name="type_B" value="নতুন" defaultChecked /> নতুন রোগী
                          </label>
                          <label className="radio-label">
                            <input type="radio" name="type_B" value="পুরাতন" /> পুরাতন রোগী
                          </label>
                        </div>
                      </div>
                      
                      {/* Name & Age Compact Row */}
                      <div className="form-row-compact">
                        <div>
                          <label className="form-label">রোগীর নাম *</label>
                          <input type="text" name="name_B" required className="form-input" placeholder="নাম লিখুন" />
                        </div>
                        <div>
                          <label className="form-label">বয়স *</label>
                          <input type="number" name="age_B" required className="form-input" placeholder="বয়স" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">মোবাইল নাম্বার *</label>
                        <input type="tel" name="phone_B" required pattern="[0-9]{11}" className="form-input" placeholder="017XXXXXXXX" />
                      </div>
                      
                      <button type="submit" className="btn-submit blue" disabled={loadingB}>
                        {loadingB ? <><i className="fa-solid fa-spinner fa-spin"></i> প্রসেস হচ্ছে...</> : <><i className="fa-solid fa-paper-plane"></i> সিরিয়াল কনফার্ম করুন</>}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

            </div>
            <div className="slider-dots" id="appt-track-dots">
              <button className="dot active"></button>
              <button className="dot"></button>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="section-padding">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge">যোগাযোগ</span>
            <h2 className="section-title" style={{ color: 'white' }}>চেম্বারের নাম্বার</h2>
          </div>

          <div className="contact-grid">
            <a href="tel:01747745929" className="contact-card green reveal delay-1">
              <div className="contact-icon"><i className="fa-solid fa-phone-volume anim-wiggle"></i></div>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', letterSpacing: '1px' }}>ব্রাহ্মণবাড়িয়া চেম্বার</span>
                <strong>01747-745929</strong>
              </div>
            </a>
            <a href="tel:01730082888" className="contact-card blue reveal delay-2">
              <div className="contact-icon"><i className="fa-solid fa-phone-volume anim-wiggle"></i></div>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', letterSpacing: '1px' }}>ঢাকা চেম্বার</span>
                <strong>01730-082888</strong>
              </div>
            </a>
          </div>

          <div style={{ textAlign: 'center' }} className="reveal delay-2">
            <a href="https://www.facebook.com/share/18d7WA9KaA/" target="_blank" rel="noreferrer" className="fb-btn">
              <i className="fa-brands fa-facebook-f anim-pulse"></i> আমাদের ফেসবুক পেজ
            </a>
          </div>

          <div className="footer-bar reveal">
            <p>© ২০২৬ ডা: আজিজুল হক। সর্বস্বত্ব সংরক্ষিত।</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
