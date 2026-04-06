import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Syringe, Activity, CalendarCheck, ShieldCheck, User, Menu, X, CheckCircle2 } from 'lucide-react';

const App = () => {
  const[isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // Scroll Animation Setup
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  // Form Submit Handler
  const handleAppointment = async (e, chamber) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (data.phone.length !== 11) {
      alert("অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন।");
      return;
    }

    const botToken = chamber === 'A' ? import.meta.env.VITE_BOT_TOKEN_A : import.meta.env.VITE_BOT_TOKEN_B;
    const chatId = chamber === 'A' ? import.meta.env.VITE_CHAT_ID_A : import.meta.env.VITE_CHAT_ID_B;
    const chamberName = chamber === 'A' ? 'ব্রাহ্মণবাড়িয়া চেম্বার' : 'ঢাকা চেম্বার';

    chamber === 'A' ? setLoadingA(true) : setLoadingB(true);

    const message = `
🏥 *নতুন সিরিয়াল: ${chamberName}*
----------------------------------------
👤 *রোগীর নাম:* ${data.name}
📅 *বয়স:* ${data.age} বছর
📞 *মোবাইল:* ${data.phone}
📋 *রোগীর ধরন:* ${data.type} রোগী
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
      });

      if (response.ok) {
        alert('✅ সিরিয়াল সফলভাবে কনফার্ম করা হয়েছে!');
        e.target.reset();
      } else {
        alert('❌ সিরিয়াল পাঠাতে সমস্যা হয়েছে। দয়া করে টোকেন চেক করুন।');
      }
    } catch (error) {
      alert('❌ ইন্টারনেট সংযোগ চেক করুন!');
    } finally {
      chamber === 'A' ? setLoadingA(false) : setLoadingB(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans pt-16">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm h-16 flex items-center transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <Activity className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl text-slate-900 tracking-tight">চিকিৎসা সেবা</span>
          </div>

          <div className="hidden md:flex space-x-6 items-center font-medium text-sm text-slate-600">
            <a href="#profile" className="hover:text-primary transition-colors">প্রোফাইল</a>
            <a href="#services" className="hover:text-primary transition-colors">সেবাসমূহ</a>
            <a href="#fees" className="hover:text-primary transition-colors">পরামর্শ ফি</a>
            <a href="#appointment" className="bg-primary hover:bg-slate-900 text-white px-5 py-2 rounded-md transition-all shadow-sm">সিরিয়াল নিন</a>
          </div>

          <button className="md:hidden text-slate-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg md:hidden flex flex-col px-4 py-4 space-y-3 font-medium text-slate-700">
            <a href="#profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded"><User className="w-5 h-5 text-primary" /> প্রোফাইল</a>
            <a href="#services" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded"><Stethoscope className="w-5 h-5 text-primary" /> সেবাসমূহ</a>
            <a href="#fees" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded"><ShieldCheck className="w-5 h-5 text-primary" /> পরামর্শ ফি</a>
            <a href="#appointment" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-2 text-primary font-bold"><CalendarCheck className="w-5 h-5" /> সিরিয়াল নিন</a>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="profile" className="py-16 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl"></div>
              <img src="https://i.postimg.cc/vHJTB7s5/1775406413371.png" alt="ডা: আজিজুল হক" className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-lg" />
            </div>
            <div className="text-center md:text-left flex-1">
              <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-bold border border-slate-200 mb-3 tracking-wider">বি.এম.ডিসি রেজি নং: এ-১১১১৬৯</span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-2">ডা: আজিজুল হক</h1>
              <h2 className="text-lg md:text-xl font-semibold text-slate-700 mb-1">এম.বি.বি.এস (স্যার সলিমুল্লাহ মেডিকেল কলেজ)</h2>
              <p className="text-md text-primary font-medium mb-6">পি.জি.টি সার্জারি - মিটফোর্ড হাসপাতাল</p>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm inline-block text-left">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1"><CheckCircle2 className="w-5 h-5 text-accent"/> বিশেষ প্রশিক্ষণ প্রাপ্ত:</h3>
                <p className="text-slate-600 text-sm md:text-base">মেডিসিন, ডায়াবেটিস, উচ্চ রক্তচাপ, বাত ব্যথা ও সার্জারিতে।</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">চিকিৎসা ও সার্জারি সেবাসমূহ</h2>
            <div className="w-16 h-1 bg-primary mx-auto mt-3 rounded-full"></div>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* General */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-3">
                <Stethoscope className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-bold text-slate-800">জেনারেল প্র্যাকটিশনার সেবা</h3>
              </div>
              <ul className="space-y-3 text-slate-600 text-sm md:text-base">
                {["মেডিসিন, ডায়াবেটিস ও উচ্চ রক্তচাপ", "বাত-ব্যথা / কোমর-হাঁটু / ঘাড় / মাথা ব্যথা", "এলার্জি / চর্মরোগ", "হাঁপানি-শ্বাসকষ্ট / নিউমোনিয়া", "মা ও শিশু-কিশোরদের যাবতীয় জটিল চিকিৎসা", "পেট ব্যথা / ডায়রিয়া / আমাসয় / কোষ্ঠকাঠিন্য"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> <span>{item}</span></li>
                ))}
              </ul>
            </motion.div>

            {/* Surgery */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-3">
                <Syringe className="w-8 h-8 text-accent" />
                <h3 className="text-xl font-bold text-slate-800">সার্জারি সেবা</h3>
              </div>
              <ul className="space-y-3 text-slate-600 text-sm md:text-base">
                {["সুন্নাতে খতনা (ডিভাইস/নরমাল/কসমেটিকস)", "লাইপোমা (চর্বির টিউমার)", "সিস্ট / এবসেস / ফোড়া, যে কোন ধরনের টিউমার", "প্লাস্টার (পা মচকানো)", "কাটা-ছেঁড়া সেলাই / ড্রেসিং / সেলাই কাটা", "নখের কনি উঠার চিকিৎসা", "নাকে নল ও প্রস্রাবের নল পড়ানো / খোলা"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> <span>{item}</span></li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fees Section */}
      <section id="fees" className="py-16 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-medium text-slate-300 mb-1">পরামর্শ ফি</h2>
              <div className="text-5xl font-bold text-white">৩০০ <span className="text-2xl text-slate-400">৳</span></div>
            </div>
            <div className="w-full md:w-px h-px md:h-24 bg-slate-700"></div>
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 w-full md:w-auto">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-emerald-400"><ShieldCheck className="w-5 h-5"/> সম্পূর্ণ ফ্রি সেবা:</h3>
              <ul className="space-y-1.5 text-slate-300 text-sm md:text-base">
                <li>• গরীব ও অসহায় রোগী</li>
                <li>• বীর মুক্তিযোদ্ধা</li>
                <li>• হাফেজ-এ-কুরআন</li>
                <li>• স্যারের বিদ্যালয়ের বন্ধু ও শিক্ষকবৃন্দ</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Appointment Section */}
      <section id="appointment" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">অনলাইন সিরিয়াল</h2>
            <p className="text-slate-500 mt-2">আপনার সুবিধামত চেম্বার নির্বাচন করে তথ্য দিন</p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Form A */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-800">ব্রাহ্মণবাড়িয়া চেম্বার</h3>
                <p className="text-slate-500 text-sm mt-1">শুক্রবার: সকাল ৯টা - সন্ধ্যা ৭টা</p>
                <p className="text-slate-600 text-sm mt-2 font-medium">ঠিকানা: সাইফুল ড্রাগ সেন্টার, বাঞ্ছারামপুর।</p>
              </div>
              <div className="p-6">
                <form onSubmit={(e) => handleAppointment(e, 'A')} className="space-y-4">
                  <input type="text" name="name" required placeholder="রোগীর নাম *" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary text-sm" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" name="age" required placeholder="বয়স *" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary text-sm" />
                    <input type="tel" name="phone" required pattern="[0-9]{11}" placeholder="১১ ডিজিট মোবাইল *" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary text-sm" />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="type" value="নতুন" required className="peer sr-only" />
                      <div className="text-center py-2.5 rounded-lg border border-slate-200 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary font-medium text-sm">নতুন রোগী</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="type" value="পুরাতন" className="peer sr-only" />
                      <div className="text-center py-2.5 rounded-lg border border-slate-200 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary font-medium text-sm">পুরাতন রোগী</div>
                    </label>
                  </div>
                  <button type="submit" disabled={loadingA} className="w-full bg-slate-900 hover:bg-primary text-white font-medium py-3 rounded-lg flex justify-center items-center mt-2 disabled:opacity-70">
                    {loadingA ? "প্রসেসিং..." : "সিরিয়াল কনফার্ম করুন"}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Form B */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-800">ঢাকা চেম্বার</h3>
                <p className="text-slate-500 text-sm mt-1">শনি - বৃহস্পতিবার: সকাল ১০টা - রাত ১০টা</p>
                <p className="text-slate-600 text-sm mt-2 font-medium">ঠিকানা: দি চানখারপুল জেনারেল হাসপাতাল, ঢাকা।</p>
              </div>
              <div className="p-6">
                <form onSubmit={(e) => handleAppointment(e, 'B')} className="space-y-4">
                  <input type="text" name="name" required placeholder="রোগীর নাম *" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary text-sm" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" name="age" required placeholder="বয়স *" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary text-sm" />
                    <input type="tel" name="phone" required pattern="[0-9]{11}" placeholder="১১ ডিজিট মোবাইল *" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary text-sm" />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="type" value="নতুন" required className="peer sr-only" />
                      <div className="text-center py-2.5 rounded-lg border border-slate-200 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary font-medium text-sm">নতুন রোগী</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="type" value="পুরাতন" className="peer sr-only" />
                      <div className="text-center py-2.5 rounded-lg border border-slate-200 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary font-medium text-sm">পুরাতন রোগী</div>
                    </label>
                  </div>
                  <button type="submit" disabled={loadingB} className="w-full bg-slate-900 hover:bg-primary text-white font-medium py-3 rounded-lg flex justify-center items-center mt-2 disabled:opacity-70">
                    {loadingB ? "প্রসেসিং..." : "সিরিয়াল কনফার্ম করুন"}
                  </button>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} ডা: আজিজুল হক। সর্বস্বত্ব সংরক্ষিত।</p>
      </footer>
    </div>
  );
};

export default App;
