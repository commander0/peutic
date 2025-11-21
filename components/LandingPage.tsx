
import React, { useState, useEffect } from 'react';
import { Shield, Heart, Star, Clock, CheckCircle, ArrowRight, Lock, Globe, ChevronDown, Play, MessageCircle, Signal, Cookie, Award } from 'lucide-react';
import { LanguageCode, getTranslation } from '../services/i18n';
import { Link } from 'react-router-dom';

// --- STATIC SVG COMPONENTS ---
const LogoTechCrunch = () => (
  <svg viewBox="0 0 100 20" className="h-6 md:h-8 w-auto fill-current text-gray-400 hover:text-black transition-colors">
    <path d="M10,0 h10 v20 h-10 z M25,0 h5 v20 h-5 z M35,0 h15 v5 h-15 z M35,15 h15 v5 h-15 z" />
    <text x="60" y="16" fontFamily="sans-serif" fontWeight="bold" fontSize="16">TechCrunch</text>
  </svg>
);
const LogoNYT = () => (
  <svg viewBox="0 0 200 30" className="h-6 md:h-8 w-auto fill-current text-gray-400 hover:text-black transition-colors">
     <text x="0" y="22" fontFamily="serif" fontWeight="bold" fontSize="24">The New York Times</text>
  </svg>
);
const LogoWired = () => (
  <svg viewBox="0 0 100 30" className="h-6 md:h-8 w-auto fill-current text-gray-400 hover:text-black transition-colors">
      <path d="M0,10 h100 v10 h-100 z" fill="none" />
      <text x="0" y="22" fontFamily="monospace" fontWeight="bold" fontSize="24">WIRED</text>
  </svg>
);
const LogoForbes = () => (
  <svg viewBox="0 0 100 30" className="h-6 md:h-8 w-auto fill-current text-gray-400 hover:text-black transition-colors">
     <text x="0" y="22" fontFamily="serif" fontWeight="900" fontSize="24">Forbes</text>
  </svg>
);
const LogoBloomberg = () => (
  <svg viewBox="0 0 120 30" className="h-6 md:h-8 w-auto fill-current text-gray-400 hover:text-black transition-colors">
     <text x="0" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="20">Bloomberg</text>
  </svg>
);

interface LandingPageProps {
  onLoginClick: (signupMode?: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(124);
  const [showCookies, setShowCookies] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOnlineCount(Math.floor(Math.random() * (300 - 80 + 1)) + 80);
    const timer = setTimeout(() => {
        if (!localStorage.getItem('peutic_cookies_accepted')) {
            setShowCookies(true);
        }
    }, 2000);

    const handleScroll = () => {
        setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const acceptCookies = () => {
      localStorage.setItem('peutic_cookies_accepted', 'true');
      setShowCookies(false);
  };

  const featuredSpecialists = [
    // Original Ruby Image (Warm & Inviting)
    { name: "Ruby", role: "Anxiety & Panic", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=600", status: "Available" },
    { name: "Elena", role: "Women's Health", img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=600&h=600", status: "Available" },
    { name: "James", role: "Men's Health", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600&h=600", status: "In Session" },
    { name: "Danny", role: "Grief Support", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=600", status: "Available" },
    { name: "Julia", role: "Relationships", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=600&h=600", status: "Available" }
  ];

  const pressLogos = [LogoTechCrunch, LogoNYT, LogoWired, LogoBloomberg, LogoForbes];

  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans text-gray-900 overflow-x-hidden relative selection:bg-yellow-200">
      {/* SUNRAY EFFECT */}
      <div className="fixed -top-20 -right-20 w-[800px] h-[800px] pointer-events-none z-0 overflow-hidden opacity-80 mix-blend-soft-light">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-200 rounded-full blur-[60px] opacity-80"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[conic-gradient(from_225deg_at_top_right,rgba(255,255,255,0.8)_0deg,transparent_15deg,rgba(255,223,0,0.3)_30deg,transparent_45deg)] blur-xl transform scale-150 origin-top-right"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-yellow-400/40 via-orange-200/10 to-transparent"></div>
      </div>

      {/* NAVIGATION */}
      <nav className={`fixed w-full z-50 border-b transition-all duration-500 ${scrolled ? 'bg-[#FFFBEB]/90 backdrop-blur-xl border-yellow-200/50 shadow-sm' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left Side: Logo + Globe */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#FACC15] rounded-lg flex items-center justify-center shadow-lg shadow-yellow-200/50">
                       <Heart className="w-6 h-6 fill-black text-black" />
                   </div>
                   <span className="text-2xl font-bold tracking-tight">Peutic</span>
                </div>

                {/* MOVED GLOBE HERE */}
                <div className="relative">
                    <button onClick={() => setLangMenuOpen(!langMenuOpen)} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black bg-white/50 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-yellow-200">
                       <Globe className="w-4 h-4" /> {lang.toUpperCase()} <ChevronDown className="w-3 h-3" />
                    </button>
                    {langMenuOpen && (
                        <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                            {(['en', 'es', 'fr', 'zh', 'ar'] as LanguageCode[]).map(c => (
                                <button key={c} onClick={() => {setLang(c); setLangMenuOpen(false);}} className="block w-full text-left px-4 py-3 text-sm hover:bg-yellow-50 font-bold">
                                    {c.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => onLoginClick(false)} 
                 className="text-sm font-bold hidden md:flex items-center gap-2 text-black hover:text-gray-600 transition-colors px-4 py-2 rounded-lg hover:bg-black/5"
               >
                 {getTranslation(lang, 'login')}
               </button>

               <button onClick={() => onLoginClick(true)} className="bg-[#FACC15] text-black px-6 py-3 rounded-full font-bold hover:bg-[#EAB308] transition-all hover:scale-105 shadow-lg flex items-center gap-2 active:scale-95">
                  {getTranslation(lang, 'cta_start')} <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8 z-10 text-center lg:text-left animate-in slide-in-from-left-10 duration-700 fade-in relative">
                      
                      <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-4">
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-yellow-200 shadow-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-bold tracking-wide text-gray-600">{onlineCount} SPECIALISTS ONLINE</span>
                          </div>
                          {/* Updated Est. 2005 Badge - YELLOW */}
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FACC15] text-black shadow-sm">
                              <Award className="w-3 h-3 text-black" />
                              <span className="text-xs font-bold tracking-wide">Est. 2005</span>
                          </div>
                      </div>
                      
                      <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1]">
                          {getTranslation(lang, 'hero_title_1')} <br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600 relative">
                              {getTranslation(lang, 'hero_title_2')}
                              <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300 -z-10 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
                          </span>
                      </h1>
                      
                      <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                          {getTranslation(lang, 'hero_subtitle')}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                          <button onClick={() => onLoginClick(true)} className="px-8 py-4 bg-[#FACC15] text-black rounded-xl font-bold text-lg shadow-xl shadow-yellow-500/10 hover:bg-[#EAB308] transition-all hover:scale-105 flex items-center justify-center gap-3">
                              <Play className="w-5 h-5 fill-black" /> {getTranslation(lang, 'cta_start')}
                          </button>
                          <div className="flex items-center gap-4 px-6 py-4 bg-white/50 rounded-xl border border-white backdrop-blur-sm justify-center">
                              <Shield className="w-6 h-6 text-gray-400" />
                              <div className="text-xs font-bold text-gray-500 text-left">
                                  {getTranslation(lang, 'cta_hipaa')}<br/>
                                  <span className="text-green-600">{getTranslation(lang, 'trust_soc2')}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="pt-8 flex items-center justify-center lg:justify-start gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          <span>Serving 1M+ Users</span>
                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                          <span>Global Coverage</span>
                      </div>
                  </div>

                  <div className="relative lg:h-[600px] w-full flex items-center justify-center mt-12 lg:mt-0 animate-in slide-in-from-right-10 duration-700 fade-in">
                      {/* HERO VIDEO UI MOCKUP */}
                      <div className="relative w-[280px] md:w-[350px] h-[400px] md:h-[500px] bg-black rounded-[40px] border-8 border-white shadow-2xl overflow-hidden transform rotate-0 md:rotate-[-3deg] md:hover:rotate-0 transition-transform duration-500 z-20">
                           {/* Simulated Video Feed - ORIGINAL RUBY */}
                           <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover" alt="Specialist" />
                           <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
                           
                           {/* UI Elements */}
                           <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                                <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] text-white font-bold tracking-wider">LIVE</span>
                                </div>
                                <div className="bg-black/30 backdrop-blur-md p-2 rounded-full border border-white/10">
                                    <Signal className="w-4 h-4 text-green-400" />
                                </div>
                           </div>

                           <div className="absolute bottom-8 left-6 right-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="h-1 bg-white/20 flex-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-white w-1/2 animate-pulse"></div>
                                    </div>
                                </div>
                                <h3 className="text-white font-bold text-2xl">Ruby</h3>
                                <p className="text-gray-300 text-sm">Anxiety Specialist • <span className="text-green-400">Available</span></p>
                           </div>
                      </div>

                      {/* Floating Elements */}
                      <div className="hidden md:flex absolute top-20 -right-4 bg-white p-4 rounded-2xl shadow-xl animate-float items-center gap-3 z-30">
                          <div className="bg-green-100 p-2 rounded-full"><CheckCircle className="w-6 h-6 text-green-600" /></div>
                          <div>
                              <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                              <p className="font-bold text-gray-900">Secure Connection</p>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                  <ChevronDown className="w-6 h-6 text-gray-400" />
              </div>
          </div>
      </section>

      {/* PRESS BANNER (MARQUEE) */}
      <section className="py-12 border-y border-yellow-100 bg-[#FFFBEB] overflow-hidden z-10 relative">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Trusted by Industry Leaders</p>
          <div className="relative flex w-full overflow-hidden">
              <div className="animate-marquee whitespace-nowrap flex items-center gap-20 px-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                  {[...pressLogos, ...pressLogos, ...pressLogos].map((Logo, i) => (
                      <div key={i} className="inline-block flex-shrink-0"><Logo /></div>
                  ))}
              </div>
          </div>
      </section>

      {/* SCIENCE / STATS */}
      <section className="py-24 bg-[#FFFBEB] text-gray-900 relative overflow-hidden z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl md:text-4xl font-black mb-6">{getTranslation(lang, 'science_title')}</h2>
                  <p className="text-gray-600 text-lg">{getTranslation(lang, 'science_subtitle')}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div className="p-8 rounded-3xl bg-white border border-yellow-200 shadow-sm hover:shadow-xl transition-all">
                      <div className="text-5xl font-black text-peutic-yellow mb-2">{getTranslation(lang, 'stat_1_val')}</div>
                      <p className="text-gray-500 font-bold">{getTranslation(lang, 'stat_1_desc')}</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-white border border-yellow-200 shadow-sm hover:shadow-xl transition-all">
                      <div className="text-5xl font-black text-peutic-yellow mb-2">{getTranslation(lang, 'stat_2_val')}</div>
                      <p className="text-gray-500 font-bold">{getTranslation(lang, 'stat_2_desc')}</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-white border border-yellow-200 shadow-sm hover:shadow-xl transition-all">
                      <div className="text-5xl font-black text-peutic-yellow mb-2">{getTranslation(lang, 'stat_3_val')}</div>
                      <p className="text-gray-500 font-bold">{getTranslation(lang, 'stat_3_desc')}</p>
                  </div>
              </div>
          </div>
      </section>

      {/* SPECIALIST LAYOUT (Flexible 3-over-2) */}
      <section className="py-24 bg-[#FFFBEB] z-10 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4">Meet some of the team</h2>
                    <p className="text-gray-600 max-w-xl">Real humans. Real empathy. Select a specialist that resonates with you.</p>
                  </div>
                  <button onClick={() => onLoginClick(true)} className="flex items-center gap-2 font-bold hover:gap-3 transition-all">View All <ArrowRight className="w-4 h-4" /></button>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                  {featuredSpecialists.map((spec, i) => (
                      <div key={i} className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] bg-white p-4 rounded-3xl shadow-sm border border-yellow-100 hover:shadow-xl transition-all group cursor-pointer transform hover:scale-[1.02]" onClick={() => onLoginClick(true)}>
                          <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                              <img src={spec.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={spec.name} />
                              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md ${spec.status === 'Available' ? 'bg-green-500/80' : 'bg-yellow-500/80'}`}>{spec.status}</div>
                          </div>
                          <h3 className="text-xl font-bold">{spec.name}</h3>
                          <p className="text-gray-500 text-sm">{spec.role}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* EXPERIENCE SECTION (UNIFIED BG COLOR) */}
      <section className="py-24 bg-[#FFFBEB] z-10 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="order-2 md:order-1">
                       <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 aspect-video md:aspect-auto md:h-[500px]">
                           {/* Stock Video Loop with Poster Fallback */}
                           <video 
                              src="https://player.vimeo.com/external/538560073.sd.mp4?s=8c2612484364310249855935916912919876764c&profile_id=164&oauth2_token_id=57447761" 
                              poster="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1000&auto=format&fit=crop"
                              className="w-full h-full object-cover"
                              autoPlay muted loop playsInline
                           ></video>
                           <div className="absolute inset-0 bg-black/10"></div>
                           <div className="absolute bottom-8 left-8 text-white">
                               <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 cursor-pointer hover:bg-white/30 transition-colors">
                                   <Play className="w-6 h-6 fill-white text-white ml-1" />
                               </div>
                               <h3 className="text-2xl font-bold">See how it works</h3>
                               <p className="opacity-80">Watch a 30s demo session</p>
                           </div>
                       </div>
                  </div>
                  <div className="order-1 md:order-2 space-y-8">
                      <h2 className="text-3xl md:text-4xl font-black">{getTranslation(lang, 'why_choose')}</h2>
                      
                      <div className="space-y-6">
                          <div className="flex gap-4 items-start">
                              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <Clock className="w-6 h-6 text-yellow-600" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-xl mb-2">{getTranslation(lang, 'comp_1')}</h4>
                                  <p className="text-gray-500">No scheduling. No waiting rooms. Connect in under 30 seconds.</p>
                              </div>
                          </div>
                          <div className="flex gap-4 items-start">
                              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <CreditCardIcon className="w-6 h-6 text-yellow-600" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-xl mb-2">{getTranslation(lang, 'comp_2')}</h4>
                                  <p className="text-gray-500">Pay $1.49/min. No monthly subscriptions or hidden fees.</p>
                              </div>
                          </div>
                          <div className="flex gap-4 items-start">
                              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <Lock className="w-6 h-6 text-yellow-600" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-xl mb-2">{getTranslation(lang, 'stat_3_desc')}</h4>
                                  <p className="text-gray-500">Enterprise-grade security ensures your conversations stay private.</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* PRICING / CTA */}
      <section className="py-24 bg-[#FFFBEB] text-center z-10 relative">
          <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Simple, Transparent Pricing.</h2>
              <div className="bg-white rounded-3xl p-8 md:p-12 inline-block max-w-lg w-full relative overflow-hidden shadow-xl border border-yellow-200">
                  <div className="inline-block bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black mb-6 animate-pulse tracking-widest">
                      LIFETIME RATE LOCKED IN
                  </div>

                  <p className="text-gray-500 font-bold uppercase tracking-widest mb-4">{getTranslation(lang, 'pricing_title')}</p>
                  
                  <div className="flex items-baseline justify-center gap-4 mb-4">
                      <span className="text-3xl text-gray-400 font-bold line-through decoration-red-500 decoration-2 opacity-70">$1.99</span>
                      <div className="text-6xl md:text-7xl font-black text-black flex items-start gap-1">
                          <span className="text-3xl mt-2">$</span>1.49<span className="text-xl text-gray-400 mt-8">/min</span>
                      </div>
                  </div>
                  
                  <p className="text-gray-500 mb-8">Sign up today to grandfather this exclusive rate forever.</p>
                  <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto text-gray-600">
                      <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span>No subscription fees</span></li>
                      <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span>HD Video & Audio</span></li>
                      <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span>24/7 Availability</span></li>
                  </ul>
                  <button onClick={() => onLoginClick(true)} className="w-full bg-[#FACC15] text-black py-4 rounded-xl font-bold hover:bg-[#EAB308] transition-transform hover:scale-105 shadow-lg shadow-yellow-500/20">
                      Lock In $1.49 Rate Now
                  </button>
              </div>
          </div>
      </section>

      {/* COOKIE BANNER */}
      {showCookies && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-6 z-[60] animate-in slide-in-from-bottom-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-50 rounded-full"><Cookie className="w-6 h-6 text-yellow-600" /></div>
                      <p className="text-sm text-gray-600 max-w-2xl">
                          We use encrypted cookies to ensure secure authentication and optimal video performance. 
                          By continuing, you agree to our <Link to="/privacy" className="underline font-bold">Privacy Policy</Link>.
                      </p>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => setShowCookies(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Preferences</button>
                      <button onClick={acceptCookies} className="px-6 py-2 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800">Accept Securely</button>
                  </div>
              </div>
          </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#FFFBEB] text-gray-900 py-12 border-t border-yellow-200 z-10 relative">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-black" />
                  <span className="font-bold">Peutic Inc.</span>
              </div>
              <div className="flex gap-8 text-sm font-bold">
                  <Link to="/privacy" className="hover:text-yellow-600 transition-colors">Privacy Policy</Link>
                  <Link to="/terms" className="hover:text-yellow-600 transition-colors">Terms of Service</Link>
                  <Link to="/support" className="hover:text-yellow-600 transition-colors">Support</Link>
              </div>
              <p className="text-xs opacity-50 font-medium">© 2025 Peutic Inc. {getTranslation(lang, 'footer_rights')}</p>
          </div>
      </footer>
    </div>
  );
};

function CreditCardIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
    )
}

export default LandingPage;
