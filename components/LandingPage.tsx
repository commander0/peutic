
import React, { useState, useEffect } from 'react';
import { Shield, Heart, Star, Clock, Users, CheckCircle, ArrowRight, Lock, Globe, Brain, Zap, ChevronDown, Play, MessageCircle, Signal } from 'lucide-react';
import { TRANSLATIONS, LanguageCode, getTranslation } from '../services/i18n';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  // Generate random number between 82 and 300 on mount
  const [onlineCount] = useState(() => Math.floor(Math.random() * (300 - 82 + 1)) + 82);

  useEffect(() => {
    setHeroLoaded(true);
  }, []);

  // @ts-ignore
  const t = (key: keyof typeof TRANSLATIONS['en']) => getTranslation(lang, key);

  const AVATARS = [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150"
  ];

  return (
    <div className={`min-h-screen bg-[#FFFBEB] text-peutic-black font-sans overflow-x-hidden ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#FFFBEB]/80 backdrop-blur-lg border-b border-yellow-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-peutic-yellow rounded-xl flex items-center justify-center shadow-lg shadow-yellow-300/30 rotate-3 hover:rotate-0 transition-transform duration-300">
                <Heart className="text-black w-6 h-6 fill-black" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">Peutic</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-gray-600">
              <a href="#experience" className="hover:text-black transition-colors">{t('nav_how')}</a>
              <a href="#pricing" className="hover:text-black transition-colors">{t('nav_membership')}</a>
              
              {/* Language Selector */}
              <div className="relative group">
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-1 hover:text-black transition-colors uppercase"
                >
                  <Globe className="w-4 h-4" /> {lang}
                </button>
                <div className="absolute top-full right-0 pt-4 hidden group-hover:block w-32">
                  <div className="bg-white border border-gray-100 rounded-xl shadow-2xl py-2 flex flex-col overflow-hidden">
                    {(['en', 'es', 'fr', 'zh', 'ar'] as LanguageCode[]).map((l) => (
                      <button 
                        key={l}
                        onClick={() => { setLang(l); setLangMenuOpen(false); }}
                        className={`px-4 py-2 text-left text-sm hover:bg-yellow-50 transition-colors ${lang === l ? 'font-bold text-peutic-yellow bg-black' : ''}`}
                      >
                        {l === 'en' ? 'English' : l === 'es' ? 'Español' : l === 'fr' ? 'Français' : l === 'zh' ? '中文' : 'العربية'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={onLoginClick}
                className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-peutic-yellow hover:text-black transition-all duration-300 shadow-lg hover:shadow-peutic-yellow/50 transform hover:-translate-y-1 active:translate-y-0"
              >
                {t('login')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-200/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className={`lg:w-1/2 space-y-8 transition-all duration-1000 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-yellow-200 shadow-sm animate-float">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-bold text-gray-800 tracking-wide">{onlineCount} Specialists Online Now</span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-extrabold leading-[0.95] tracking-tight text-gray-900">
              {t('hero_title_1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-400 to-yellow-500 bg-[length:200%_auto] animate-shine">
                {t('hero_title_2')}
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed font-medium">
              {t('hero_subtitle')} No waiting rooms. No subscriptions. Just instant connection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onLoginClick}
                className="group bg-black text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-900 transition-all duration-300 shadow-2xl shadow-black/20 hover:shadow-xl hover:-translate-y-1"
              >
                {t('cta_start')}
                <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                </div>
              </button>
              <div className="flex items-center gap-4 px-6">
                <div className="flex -space-x-3">
                    {AVATARS.slice(0,3).map((src, i) => (
                        <img key={i} src={src} className="w-10 h-10 rounded-full border-2 border-[#FFFBEB]" alt="User" />
                    ))}
                </div>
                <div className="text-sm font-bold text-gray-600">
                    <div className="flex text-yellow-500"><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/></div>
                    4.9/5 Rating
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest pt-8">
                <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> HIPAA Secure</span>
                <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> 256-bit Encrypted</span>
            </div>
          </div>

          {/* Hero Visual - Simulated Video Call */}
          <div className="lg:w-1/2 relative perspective-1000 group">
            {/* Main Card */}
            <div className="relative z-20 bg-black rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-white transform transition-all duration-700 hover:rotate-0 rotate-1 hover:scale-[1.02]">
                {/* Simulated Video UI */}
                <div className="relative aspect-[4/3] bg-gray-900">
                    <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
                        alt="Specialist" 
                        className="w-full h-full object-cover opacity-90"
                    />
                    
                    {/* UI Overlays */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-white">LIVE 00:42</span>
                    </div>

                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">
                        <Signal className="w-4 h-4 text-green-400" />
                    </div>

                    {/* Simulated Captions */}
                    <div className="absolute bottom-8 left-8 right-8 text-center">
                        <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl inline-block border border-white/10">
                            <p className="text-white font-medium text-sm">"Take a deep breath with me. You're doing great."</p>
                        </div>
                    </div>
                </div>

                {/* PIP User View */}
                <div className="absolute bottom-6 right-6 w-24 h-32 bg-gray-800 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200" className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-peutic-yellow rounded-full blur-2xl opacity-60 animate-pulse"></div>
            <div className="absolute top-1/2 -left-12 bg-white p-4 rounded-2xl shadow-xl animate-float" style={{animationDelay: '1s'}}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                    <div>
                        <p className="font-bold text-sm">Stress Reduced</p>
                        <p className="text-xs text-gray-500">Just now</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee */}
      <section className="py-10 bg-white border-y border-yellow-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Trusted by industry leaders</p>
        </div>
        <div className="relative flex overflow-x-hidden group">
            <div className="animate-marquee whitespace-nowrap flex gap-16 items-center">
                {['Forbes', 'TechCrunch', 'WIRED', 'VOGUE', 'PsychologyToday', 'TheVerge', 'Bloomberg', 'NYTimes', 'HealthLine'].map((logo, i) => (
                    <span key={i} className="text-3xl font-extrabold text-gray-300 hover:text-black transition-colors duration-500 cursor-default uppercase select-none">
                        {logo}
                    </span>
                ))}
                {/* Duplicate for seamless loop */}
                {['Forbes', 'TechCrunch', 'WIRED', 'VOGUE', 'PsychologyToday', 'TheVerge', 'Bloomberg', 'NYTimes', 'HealthLine'].map((logo, i) => (
                    <span key={`dup-${i}`} className="text-3xl font-extrabold text-gray-300 hover:text-black transition-colors duration-500 cursor-default uppercase select-none">
                        {logo}
                    </span>
                ))}
            </div>
             <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
             <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10"></div>
        </div>
      </section>

      {/* The Experience (Static Visual Revert) */}
      <section id="experience" className="py-24 bg-[#FFFBEB] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Therapy reimagined for the <span className="italic font-serif text-yellow-600">modern age.</span></h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience high-definition, low-latency connection with specialists who actually care.</p>
              </div>

              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-black aspect-video max-w-5xl mx-auto group cursor-pointer" onClick={onLoginClick}>
                  {/* REVERTED to static image */}
                  <img 
                    src="https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?auto=format&fit=crop&q=80&w=2000" 
                    alt="Session Preview"
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-105 transform transition-transform"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform duration-300">
                          <div className="w-16 h-16 bg-peutic-yellow rounded-full flex items-center justify-center shadow-lg">
                              <Play className="w-6 h-6 fill-black ml-1" />
                          </div>
                      </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 to-transparent">
                      <h3 className="text-white font-bold text-2xl">See how it works</h3>
                      <p className="text-gray-300">Watch a sample session</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
                {[
                    { icon: Clock, title: "Zero Wait Time", desc: "Connect in under 60 seconds. No scheduling required." },
                    { icon: Lock, title: "Bank-Grade Privacy", desc: "We don't sell data. We don't record without asking. You are safe here." },
                    { icon: Users, title: "Top 1% Talent", desc: "Our specialists are rigorously vetted for empathy and expertise." }
                ].map((item, i) => (
                    <div key={i} className="text-center group hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-20 h-20 bg-yellow-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-peutic-yellow transition-colors">
                            <item.icon className="w-10 h-10 text-black" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                        <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Meet The Experts (Carousel) */}
      <section className="py-24 bg-[#FFFBEB] overflow-hidden">
          <div className="text-center mb-12">
              <span className="text-xs font-bold tracking-widest uppercase text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">Our Specialists</span>
              <h2 className="text-4xl font-bold mt-4">Real people. Real empathy.</h2>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-8 px-8 no-scrollbar snap-x">
              {[
                  { name: "Ruby", role: "Anxiety Expert", img: AVATARS[0] },
                  { name: "Carter", role: "Life Coach", img: AVATARS[1] },
                  { name: "Anna", role: "Family Therapy", img: AVATARS[2] },
                  { name: "Charlie", role: "Listener", img: AVATARS[3] },
                  { name: "Luna", role: "Creative Arts", img: AVATARS[4] },
                  { name: "James", role: "Men's Health", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150" },
              ].map((person, i) => (
                  <div key={i} className="flex-shrink-0 w-64 bg-white p-4 rounded-3xl shadow-md hover:shadow-xl transition-all snap-center cursor-pointer" onClick={onLoginClick}>
                      <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                          <img src={person.img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                      </div>
                      <h3 className="font-bold text-xl">{person.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{person.role}</p>
                      <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Available
                      </div>
                  </div>
              ))}
          </div>
      </section>

      {/* Pricing / CTA */}
      <section id="pricing" className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
            <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight">Start feeling better.<br/><span className="text-peutic-yellow">Today.</span></h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Join 15,000+ members who have found their safe space. No contracts, just help when you need it.
            </p>
            
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 inline-block w-full max-w-md hover:scale-105 transition-transform duration-300">
                <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Simple Pricing</div>
                <div className="text-6xl font-extrabold text-white mb-2 flex justify-center items-baseline gap-1">
                    <span className="text-2xl">$</span>1.49 <span className="text-lg font-normal text-gray-400">/ min</span>
                </div>
                <p className="text-gray-400 text-sm mb-8">Pay only for what you use.</p>
                
                <button 
                    onClick={onLoginClick}
                    className="w-full bg-peutic-yellow text-black py-4 rounded-xl font-bold text-lg hover:bg-white transition-colors shadow-lg shadow-yellow-900/20 flex items-center justify-center gap-2"
                >
                    Get Started Now <ArrowRight className="w-5 h-5" />
                </button>
            </div>
            
            <p className="mt-8 text-sm text-gray-500">
                <Shield className="w-3 h-3 inline mr-1" /> 30-Day Money Back Guarantee • Cancel Anytime
            </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FFFBEB] border-t border-yellow-200 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
                <Heart className="text-peutic-yellow w-4 h-4 fill-peutic-yellow" />
              </div>
              <span className="font-bold text-xl tracking-tight">Peutic</span>
          </div>
          <div className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Peutic Inc. {t('footer_rights')}
          </div>
          <div className="flex gap-6 text-sm font-semibold text-gray-600">
            <a href="#" className="hover:text-black hover:underline">Privacy</a>
            <a href="#" className="hover:text-black hover:underline">Terms</a>
            <a href="#" className="hover:text-black hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

function Activity(props: any) { return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> }

export default LandingPage;
