import React, { useState, useEffect } from 'react';
import { Shield, Heart, Clock, CheckCircle, ArrowRight, Lock, Globe, ChevronDown, Play, MessageCircle, Signal, Cookie, Award, CreditCard } from 'lucide-react';
import { LanguageCode, getTranslation } from '../services/i18n';
import { Link } from 'react-router-dom';
import { Database, INITIAL_COMPANIONS } from '../services/database';

// --- AVATAR COMPONENT ---
const AvatarImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    
    useEffect(() => { setImgSrc(src); }, [src]);

    return (
        <img 
            src={imgSrc} 
            alt={alt} 
            className={`${className} object-cover object-center`}
            onError={() => setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=FACC15&color=000&size=512&bold=true`)}
            loading="lazy"
        />
    );
};

// --- LOGO COMPONENTS (Fixed Syntax) ---
const TechCrunchLogo = () => (
  <svg viewBox="0 0 200 30" className="h-6 md:h-8 w-auto fill-current text-gray-400 hover:text-black transition-colors">
    <text x="0" y="20" fontFamily="sans-serif" fontWeight="bold" fontSize="20">TechCrunch</text>
  </svg>
);

const LandingPage: React.FC<{ onLoginClick: (signup?: boolean) => void }> = ({ onLoginClick }) => {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(124);
  const [showCookies, setShowCookies] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [featuredSpecialists, setFeaturedSpecialists] = useState<any[]>([]);

  useEffect(() => {
    setOnlineCount(Math.floor(Math.random() * (300 - 80 + 1)) + 80);
    
    const timer = setTimeout(() => {
        if (!localStorage.getItem('peutic_cookies_accepted')) {
            setShowCookies(true);
        }
    }, 2000);

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Round Robin Logic
    const all = [...INITIAL_COMPANIONS];
    // Simple shuffle
    for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
    }
    setFeaturedSpecialists(all.slice(0, 5));

    return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans text-gray-900 overflow-x-hidden relative">
      {/* Sunray */}
      <div className="fixed -top-20 -right-20 w-[800px] h-[800px] pointer-events-none z-0 overflow-hidden opacity-60 mix-blend-soft-light">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-200 rounded-full blur-[60px] opacity-80"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-yellow-400/40 via-orange-200/10 to-transparent"></div>
      </div>

      {/* Nav */}
      <nav className={`fixed w-full z-50 border-b transition-all duration-500 ${scrolled ? 'bg-[#FFFBEB]/90 backdrop-blur-xl border-yellow-200/50 shadow-sm' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#FACC15] rounded-lg flex items-center justify-center shadow-lg shadow-yellow-200/50">
                       <Heart className="w-6 h-6 fill-black text-black" />
                   </div>
                   <span className="text-2xl font-bold tracking-tight">Peutic</span>
                </div>
                <div className="relative hidden md:block">
                    <button onClick={() => setLangMenuOpen(!langMenuOpen)} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black bg-white/50 px-3 py-1.5 rounded-full border border-transparent hover:border-yellow-200">
                       <Globe className="w-4 h-4" /> {lang.toUpperCase()} <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={() => onLoginClick(false)} className="text-sm font-bold text-black hover:text-gray-600 px-4 py-2">
                 {getTranslation(lang, 'login')}
               </button>
               <button onClick={() => onLoginClick(true)} className="bg-[#FACC15] text-black px-6 py-3 rounded-full font-bold hover:bg-[#EAB308] transition-all shadow-lg flex items-center gap-2">
                  {getTranslation(lang, 'cta_start')} <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8 z-10 relative">
                      <div className="flex flex-wrap gap-3 mb-4">
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-yellow-200 shadow-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-bold tracking-wide text-gray-600">{onlineCount} SPECIALISTS ONLINE</span>
                          </div>
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FACC15] text-black shadow-sm">
                              <Award className="w-3 h-3 text-black" />
                              <span className="text-xs font-bold tracking-wide">Est. 2005</span>
                          </div>
                      </div>
                      
                      <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1]">
                          {getTranslation(lang, 'hero_title_1')} <br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">
                              {getTranslation(lang, 'hero_title_2')}
                          </span>
                      </h1>
                      
                      <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
                          {getTranslation(lang, 'hero_subtitle')}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                          <button onClick={() => onLoginClick(true)} className="px-8 py-4 bg-[#FACC15] text-black rounded-xl font-bold text-lg shadow-xl hover:bg-[#EAB308] transition-all flex items-center justify-center gap-3">
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
                  </div>

                  <div className="relative lg:h-[600px] w-full flex items-center justify-center mt-12 lg:mt-0">
                      <div className="relative w-[280px] md:w-[350px] h-[400px] md:h-[500px] bg-black rounded-[40px] border-8 border-white shadow-2xl overflow-hidden transform rotate-0 md:rotate-[-3deg] transition-transform duration-500 z-20">
                           {/* ORIGINAL RUBY IMAGE RESTORED */}
                           <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover" alt="Specialist" />
                           <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
                           
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
                  </div>
              </div>
          </div>
      </section>

      {/* Team Section - Round Robin */}
      <section className="py-24 bg-[#FFFBEB] z-10 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4">Meet some of the team</h2>
                    <p className="text-gray-600 max-w-xl">Real humans. Real empathy. Rotated daily for you.</p>
                  </div>
                  <button onClick={() => onLoginClick(true)} className="flex items-center gap-2 font-bold hover:gap-3 transition-all">View All <ArrowRight className="w-4 h-4" /></button>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                  {featuredSpecialists.map((spec, i) => (
                      <div key={i} className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] bg-white p-4 rounded-3xl shadow-sm border border-yellow-100 hover:shadow-xl transition-all group cursor-pointer transform hover:scale-[1.02]" onClick={() => onLoginClick(true)}>
                          <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                              <AvatarImage src={spec.imageUrl} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500" alt={spec.name} />
                              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md ${spec.status === 'AVAILABLE' ? 'bg-green-500/80' : 'bg-yellow-500/80'}`}>{spec.status}</div>
                          </div>
                          <h3 className="text-xl font-bold">{spec.name}</h3>
                          <p className="text-gray-500 text-sm">{spec.specialty}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>
      
      {/* Footer */}
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
              <p className="text-xs opacity-50 font-medium">© 2025 Peutic Inc. All rights reserved.</p>
          </div>
      </footer>

      {showCookies && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-6 z-[60]">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-50 rounded-full"><Cookie className="w-6 h-6 text-yellow-600" /></div>
                      <p className="text-sm text-gray-600 max-w-2xl">We use encrypted cookies to ensure secure authentication.</p>
                  </div>
                  <button onClick={() => {localStorage.setItem('peutic_cookies_accepted', 'true'); setShowCookies(false);}} className="px-6 py-2 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800">Accept</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default LandingPage;