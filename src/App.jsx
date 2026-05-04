import React, { useState, useEffect } from 'react';
import './index.css';

const GOOGLE_APP_URL = "https://script.google.com/macros/s/AKfycbyl8Wr4May2e7A0iN2UFIHxXYDn8p3XRuZBCo1oSe-XSpoMMhzfp23BCIiXkt4Lgdac/exec";

function App() {
  const[scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingA, setLoadingA] = useState(false);
  const[loadingB, setLoadingB] = useState(false);

  // Scroll Detection for Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  },[]);

  // Scroll Reveal Animations
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

  // Slider Logic Hook
  const useSlider = (trackId, intervalMs) => {
    useEffect(() => {
      const track = document.getElementById(trackId);
      const dotsEl = document.getElementById(`${trackId}-dots`);
      const bar = document.getElementById(`${trackId}-bar`);
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

      const startBar = () => {
        if (bar) {
          bar.style.transition = 'none';
          bar.style.width = '0%';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              bar.style.transition = `width ${intervalMs}ms linear`;
              bar.style.width = '100%';
            });
          });
        }
      };

      const startTimer = () => {
        clearInterval(timer);
        startBar();
        timer = setInterval(() => {
          goTo(current + 1);
          startBar();
        }, intervalMs);
      };

      dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startTimer(); }));

      let scrollTimer;
      const handleScroll = () => {
        clearInterval(timer);
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          const idx = Math.round(track.scrollLeft / track.clientWidth);
          current = idx;
          dots.forEach((d, i) => d.classList.toggle('active', i === current));
          startTimer();
        }, 300);
      };

      track.addEventListener('scroll', handleScroll, { passive: true });
      track.addEventListener('mouseenter', () => { clearInterval(timer); if (bar) bar.style.transition = 'none'; });
      track.addEventListener('mouseleave', startTimer);

      goTo(0);
      startTimer();

      return () => clearInterval(timer);
    }, [trackId, intervalMs]);
  };

  useSlider('services-track', 4000);
  useSlider('appt-track', 4000);

  // Form Submit Handler
  const submitAppointment = async (e, chamber) => {
    e.preventDefault();
    const suffix = chamber === 'Brahmanbaria' ? '_A' : '_B';
    const form = e.target;
    
    const formData = new FormData(form);
    const type = formData.get(`type${suffix}`);

    if (!type) {
      alert('রোগীর ধরন নির্বাচন করুন।');
      return;
    }

    const payload = {
      chamber,
      name: formData.get(`name${suffix}`),
      age: formData.get(`age${suffix}`),
      phone: formData.get(`phone${suffix}`),
      type: type
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
        alert(`✅ অভিনন্দন! সিরিয়াল কনফার্ম হয়েছে।\nআপনার সিরিয়াল নম্বর: ${result.serial}`);
        form.reset();
      } else {
        alert('❌ সমস্যা হয়েছে। চেম্বারের নাম্বারে সরাসরি কল করুন।');
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
      {/* NAVBAR */}
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="container nav-inner">
          <a className="nav-brand" href="#profile" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="nav-logo"><i className="fa-solid fa-staff-snake"></i></div>
            <div className="nav-brand-text">
              <span>চিকিৎসা সেবা</span>
              <span>ডা: আজিজুল হক</span>
            </div>
          </a>
          <ul className="nav-links">
            <li><a href="#profile">প্রোফাইল</a></li>
            <li><a href="#services">সেবাসমূহ</a></li>
            <li><a href="#fees">ফি ও ছাড়</a></li>
            <li><a href="#appointment">সিরিয়াল নিন</a></li>
            <li><a href="#contact" className="nav-cta">যোগাযোগ</a></li>
          </ul>
          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="মেনু">
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div id="mobile-menu" className={menuOpen ? 'open' : ''} onClick={(e) => { if (e.target.id === 'mobile-menu') setMenuOpen(false); }}>
        <div id="mobile-drawer">
          <div className="mobile-header">
            <span style={{ fontWeight: 700, color: 'var(--navy-dark)', fontSize: '1rem' }}>মেনু</span>
            <button className="mobile-close" onClick={() => setMenuOpen(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <ul className="mobile-nav-links">
            <li><a href="#profile" className="mobile-link" onClick={() => setMenuOpen(false)}><i className="fa-regular fa-user"></i> প্রোফাইল</a></li>
            <li><a href="#services" className="mobile-link" onClick={() => setMenuOpen(false)}><i className="fa-solid fa-stethoscope"></i> সেবাসমূহ</a></li>
            <li><a href="#fees" className="mobile-link" onClick={() => setMenuOpen(false)}><i className="fa-solid fa-hand-holding-dollar"></i> ফি ও ছাড়</a></li>
            <li><a href="#appointment" className="mobile-link" onClick={() => setMenuOpen(false)}><i className="fa-regular fa-calendar-check"></i> সিরিয়াল নিন</a></li>
            <li><a href="#contact" className="mobile-link mobile-cta" onClick={() => setMenuOpen(false)}><i className="fa-solid fa-phone"></i> যোগাযোগ</a></li>
          </ul>
        </div>
      </div>

      {/* HERO */}
      <section id="profile">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-inner">
            <div className="hero-image-wrap reveal">
              <div className="hero-img-ring">
                <img src="https://i.postimg.cc/V69j6J8c/IMG-20260426-104655-868.png" alt="ডা: আজিজুল হক" loading="eager" />
              </div>
            </div>
            <div className="hero-content">
              <div className="bmdc-badge reveal reveal-delay-1">
                <span className="pulse-dot" style={{ width: '7px', height: '7px', background: '#22c55e', borderRadius: '50%' }}></span>
                বিএমডিসি রেজি নং: এ-১১১১৬৯
              </div>
              <h1 className="hero-name reveal reveal-delay-1">ডাঃ আজিজুল হক</h1>
              <p className="hero-degree reveal reveal-delay-2">
                এম.বি.বি.এস &nbsp;<span style={{ fontWeight: 400, color: 'var(--gray-500)', fontSize: '0.9rem' }}>(স্যার সলিমুল্লাহ মেডিকেল কলেজ)</span>
              </p>
              <p className="hero-sub reveal reveal-delay-2">
                <i className="fa-solid fa-user-md" style={{ color: 'var(--navy)', marginRight: '0.4rem' }}></i>
                পি.জি.টি: সার্জারী (মিটফোর্ড হাসপাতাল)
              </p>
              <div className="spec-card reveal reveal-delay-3">
                <strong>বিশেষত্ব:</strong> মেডিসিন, ডায়াবেটিস, উচ্চ রক্তচাপ, বাত ব্যথা, কোমর-হাঁটু ব্যথা, হাঁপানি শ্বাসকষ্ট, মা ও শিশু-কিশোরদের যাবতীয় জটিল রোগ এবং সার্জারীতে বিশেষ প্রশিক্ষণ প্রাপ্ত।
              </div>
              <div className="hero-actions reveal reveal-delay-4">
                <a href="#appointment" className="btn-primary">সিরিয়াল বুক করুন <i className="fa-solid fa-arrow-right"></i></a>
                <a href="#contact" className="btn-outline"><i className="fa-solid fa-phone"></i> যোগাযোগ করুন</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">আমাদের সেবা</span>
            <h2 className="section-title">সেবা ও পরামর্শের বিষয়সমূহ</h2>
            <div className="divider center"></div>
          </div>

          <div className="slider-wrap reveal">
            <div className="slider-track" id="services-track">
              {/* Slide 1 */}
              <div className="slider-slide">
                <div className="service-card medicine">
                  <div className="service-icon blue"><i className="fa-solid fa-stethoscope"></i></div>
                  <h3>জেনারেল প্র্যাকটিশনার সেবা</h3>
                  <ul className="service-list">
                    <li><i className="fa-solid fa-circle-check"></i><span>মেডিসিন</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>ডায়াবেটিস এবং উচ্চ রক্তচাপ</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>বাত-ব্যথা / কোমর-হাঁটু ব্যথা / ঘাড় ব্যথা / মাথা ব্যথা</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>এলার্জি / চর্মরোগ</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>হাঁপানি-শ্বাসকষ্ট / নিউমোনিয়া</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>মা ও শিশু-কিশোরদের যাবতীয় জটিল চিকিৎসা</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>পেট ব্যথা / পেট ফাঁপা / ডায়রিয়া / আমাশয় / কোষ্ঠকাঠিন্য</span></li>
                  </ul>
                </div>
              </div>

              {/* Slide 2 */}
              <div className="slider-slide">
                <div className="service-card surgery">
                  <div className="service-icon teal"><i className="fa-solid fa-syringe"></i></div>
                  <h3>সার্জারী সেবা</h3>
                  <ul className="service-list two-col">
                    <li><i className="fa-solid fa-circle-check"></i><span>সুন্নাতে খতনা (ডিভাইস/নরমাল/কসমেটিকস)</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>লাইপোমা (চর্বির টিউমার)</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>সিস্ট / এবসেস / ফোড়া</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>যে কোন ধরনের টিউমার</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>প্লাস্টার (পা মচকানো)</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>কাটা-ছেঁড়া সেলাই / ড্রেসিং / সেলাই কাটা</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>নখের কনি উঠার চিকিৎসা</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>নাকে নল পড়ানো / এন জি / ফিডিং টিউব</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>প্রস্রাবের নল পড়ানো / খোলা</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>পিত্তথলির / কিডনির / মূত্রনালীর পাথর</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>ব্রেস্ট / স্তনের টিউমার</span></li>
                    <li><i className="fa-solid fa-circle-check"></i><span>গ্যাংলিওন সিস্ট</span></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="slider-dots" id="services-track-dots">
              <button className="dot active"></button>
              <button className="dot"></button>
            </div>
            <div className="slider-progress"><div className="slider-progress-bar" id="services-track-bar"></div></div>
          </div>
        </div>
      </section>

      {/* FEES */}
      <section id="fees">
        <div className="container">
          <div className="fees-card reveal">
            <div className="fees-inner">
              <div className="fee-amount-wrap">
                <p className="fee-label">চিকিৎসা পরামর্শ ফি</p>
                <div className="fee-amount">৩০০ <span className="fee-currency">৳</span></div>
              </div>
              <div className="fee-divider"></div>
              <div className="free-section">
                <div className="free-title">
                  <i className="fa-solid fa-hand-holding-heart"></i>
                  যাদের জন্য চিকিৎসা ফী লাগবে না
                </div>
                <div className="free-grid">
                  <div className="free-item"><i className="fa-solid fa-circle-check"></i> গরীব ও অসহায় রোগী</div>
                  <div className="free-item"><i className="fa-solid fa-circle-check"></i> স্কুলের বন্ধু ও পরিবার</div>
                  <div className="free-item"><i className="fa-solid fa-circle-check"></i> শ্রদ্ধেয় শিক্ষকমণ্ডলী</div>
                  <div className="free-item"><i className="fa-solid fa-circle-check"></i> কোরআন এর হাফেজ</div>
                  <div className="free-item"><i className="fa-solid fa-circle-check"></i> বীর মুক্তিযোদ্ধা</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPOINTMENT */}
      <section id="appointment">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">সিরিয়াল বুকিং</span>
            <h2 className="section-title">অনলাইনে সিরিয়াল নিন</h2>
            <div className="divider center"></div>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>সঠিক চেম্বার নির্বাচন করে ফর্মটি পূরণ করুন। সিরিয়াল নম্বর সহ কনফার্মেশন পাবেন।</p>
          </div>

          <div className="slider-wrap reveal">
            <div className="slider-track" id="appt-track">
              {/* Slide 1: Brahmanbaria */}
              <div className="slider-slide">
                <div className="appt-card">
                  <div className="appt-header green">
                    <h3><i className="fa-solid fa-house-medical"></i> ব্রাহ্মণবাড়িয়া চেম্বার</h3>
                    <div className="appt-info">
                      <div className="appt-info-row">
                        <i className="fa-regular fa-clock"></i>
                        <div>প্রতি শুক্রবার<br /><span className="time-badge">সকাল ৯ টা — সন্ধ্যা ৭ টা</span></div>
                      </div>
                      <div className="appt-info-row">
                        <i className="fa-solid fa-location-dot"></i>
                        <span>সাইফুল ড্রাগ সেন্টার (কৃষি ব্যাংক সংলগ্ন), জীবনগঞ্জ বাজার, বাঞ্ছারামপুর, ব্রাহ্মণবাড়িয়া।</span>
                      </div>
                    </div>
                  </div>
                  <div className="appt-body">
                    <form onSubmit={(e) => submitAppointment(e, 'Brahmanbaria')}>
                      <div className="form-group">
                        <label>রোগীর নাম *</label>
                        <input type="text" name="name_A" required className="form-input green" placeholder="নাম লিখুন" />
                      </div>
                      <div className="grid-2">
                        <div className="form-group">
                          <label>বয়স *</label>
                          <input type="number" name="age_A" required className="form-input green" placeholder="বয়স" />
                        </div>
                        <div className="form-group">
                          <label>মোবাইল *</label>
                          <input type="tel" name="phone_A" required pattern="[0-9]{11}" className="form-input green" placeholder="017XXXXXXXX" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>রোগীর ধরন *</label>
                        <div className="radio-group">
                          <div className="radio-option">
                            <input type="radio" name="type_A" id="typeA_new" value="নতুন" required />
                            <label className="radio-label green" htmlFor="typeA_new">নতুন</label>
                          </div>
                          <div className="radio-option">
                            <input type="radio" name="type_A" id="typeA_old" value="পুরাতন" />
                            <label className="radio-label green" htmlFor="typeA_old">পুরাতন</label>
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="btn-submit green" disabled={loadingA}>
                        {loadingA ? <><i className="fa-solid fa-circle-notch fa-spin"></i> প্রসেস হচ্ছে...</> : <>সিরিয়াল কনফার্ম করুন <i className="fa-solid fa-paper-plane"></i></>}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Slide 2: Dhaka */}
              <div className="slider-slide">
                <div className="appt-card">
                  <div className="appt-header blue">
                    <h3><i className="fa-solid fa-building-user"></i> ঢাকা চেম্বার</h3>
                    <div className="appt-info">
                      <div className="appt-info-row">
                        <i className="fa-regular fa-clock"></i>
                        <div>শনি থেকে বৃহস্পতিবার<br /><span className="time-badge">সকাল ১০ টা — রাত ১০ টা</span></div>
                      </div>
                      <div className="appt-info-row">
                        <i className="fa-solid fa-location-dot"></i>
                        <span>দি চানখারপুল জেনারেল হাসপাতাল, ১০/১ নবাব কাটারা রোড, চানখারপুল, ঢাকা।</span>
                      </div>
                    </div>
                  </div>
                  <div className="appt-body">
                    <form onSubmit={(e) => submitAppointment(e, 'Dhaka')}>
                      <div className="form-group">
                        <label>রোগীর নাম *</label>
                        <input type="text" name="name_B" required className="form-input blue" placeholder="নাম লিখুন" />
                      </div>
                      <div className="grid-2">
                        <div className="form-group">
                          <label>বয়স *</label>
                          <input type="number" name="age_B" required className="form-input blue" placeholder="বয়স" />
                        </div>
                        <div className="form-group">
                          <label>মোবাইল *</label>
                          <input type="tel" name="phone_B" required pattern="[0-9]{11}" className="form-input blue" placeholder="017XXXXXXXX" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>রোগীর ধরন *</label>
                        <div className="radio-group">
                          <div className="radio-option">
                            <input type="radio" name="type_B" id="typeB_new" value="নতুন" required />
                            <label className="radio-label blue" htmlFor="typeB_new">নতুন</label>
                          </div>
                          <div className="radio-option">
                            <input type="radio" name="type_B" id="typeB_old" value="পুরাতন" />
                            <label className="radio-label blue" htmlFor="typeB_old">পুরাতন</label>
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="btn-submit blue" disabled={loadingB}>
                         {loadingB ? <><i className="fa-solid fa-circle-notch fa-spin"></i> প্রসেস হচ্ছে...</> : <>সিরিয়াল কনফার্ম করুন <i className="fa-solid fa-paper-plane"></i></>}
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
            <div className="slider-progress"><div className="slider-progress-bar" id="appt-track-bar"></div></div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <div className="container">
          <div className="contact-header reveal">
            <span className="section-label">যোগাযোগ</span>
            <h2 className="section-title">যোগাযোগ ও চেম্বারের নাম্বার</h2>
            <p>যেকোনো জরুরী প্রয়োজনে বা বিস্তারিত জানতে সরাসরি কল করুন।</p>
          </div>

          <div className="contact-grid">
            <a href="tel:01747745929" className="contact-card green reveal reveal-delay-1">
              <div className="contact-icon green"><i className="fa-solid fa-phone-volume"></i></div>
              <div className="contact-card-text">
                <small>ব্রাহ্মণবাড়িয়া চেম্বার</small>
                <strong>01747-745929</strong>
              </div>
            </a>
            <a href="tel:01730082888" className="contact-card blue reveal reveal-delay-2">
              <div className="contact-icon blue"><i className="fa-solid fa-phone-volume"></i></div>
              <div className="contact-card-text">
                <small>ঢাকা চেম্বার</small>
                <strong>01730-082888</strong>
              </div>
            </a>
          </div>

          <div className="fb-wrap reveal reveal-delay-3">
            <a href="https://www.facebook.com/share/18d7WA9KaA/" target="_blank" rel="noreferrer" className="fb-btn">
              <i className="fa-brands fa-facebook" style={{ fontSize: '1.3rem' }}></i>
              আমাদের সাথে যুক্ত থাকুন
            </a>
          </div>

          <div className="footer-bar reveal">
            <p>© ২০২৬ ডা: আজিজুল হক। সর্বস্বত্ব সংরক্ষিত।</p>
            <div className="footer-links">
              <a href="#">প্রাইভেসি পলিসি</a>
              <a href="#">শর্তাবলী</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
