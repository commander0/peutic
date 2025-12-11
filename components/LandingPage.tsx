import React, { useState, useEffect } from 'react';
import { Shield, Heart, Star, Clock, CheckCircle, ArrowRight, Lock, Globe, ChevronDown, Play, MessageCircle, Signal, Cookie, Award, CreditCard } from 'lucide-react';
import { LanguageCode, getTranslation } from '../services/i18n';
import { Link } from 'react-router-dom';
import { Database, STABLE_AVATAR_POOL, INITIAL_COMPANIONS } from '../services/database';
import { Companion } from '../types';

// --- STATIC SVG COMPONENTS ---
const LogoTechCrunch = () => ( <svg viewBox="0 0 100 20" className="h-6 md:h-8 w-auto fill-current text-gray-400 hover:text-black transition-colors"><path d="M10,0 h10 v20 h-10 z M25,0 h5 v20 h-5 z M35,0 h15 v5 h-15 z M35,15 h15 v5 h-15 z" /><text x="60" y="16" fontFamily="sans-serif" fontWeight="bold" fontSize="16">TechCrunch</text></svg> );
const LogoNYT = () => ( <svg viewBox="0 0 200 30" className="h-6 md:h-8 w-auto fill-current text-gray-400 hover:text-black transition-colors"><text x="0" y="22" fontFamily="serif" fontWeight="bold" fontSize="24">The New York Times</text></svg> );
const LogoWired = () => ( <svg viewBox="0 0 100 30" className="h-6 md:h-8 w-auto fill-current text-gray-400 hover:text-black transition-colors"><text x="0" y="20" fontFamily="monospace" fontWeight="bold" fontSize="24">WIRED</text></svg> );
const LogoForbes = () => ( <svg viewBox="0 0 100 30" className="h-6 md:h-8 w-auto fill-current text-gray-400 hover:text-black transition-colors"><text x="0" y="20" fontFamily="serif" fontWeight="bold" fontSize="24">Forbes</text></svg> );

interface LandingPageProps {
  onLoginClick: (isSignup?: boolean) => void;
  onAdminClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onAdminClick }) => {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [cookieConsent, setCookieConsent] = useState(false);
  
  // Real-time stats simulation
  const [activeSessions, setActiveSessions] = useState(142);
  const [availableSpecialists, setAvailableSpecialists] = useState(24);

  // Dynamic Settings
  const settings = Database.getSettings();
  const saleMode = settings.saleMode;
  const price = settings.pricePerMinute;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Simulate live activity
    const interval = setInterval(() => {
        setActiveSessions(prev => prev + (Math.random() > 0.5 ? 1 : -1));
        setAvailableSpecialists(prev => Math.max(5, prev + (Math.random() > 0.7 ? 1 : -1)));
    }, 5000);

    // Cookie check
    const consent = localStorage.getItem('peutic_cookie_consent');
    if (consent) setCookieConsent(true);

    return () => {
        window.removeEventListener('scroll', handleScroll);
        clearInterval(interval);
    };
  }, []);

  const acceptCookies = () => {
      localStorage.setItem('peutic_cookie_consent', 'true');
      setCookieConsent(true);
  };

  const t = (key: string) => getTranslation(lang, key);

  const toggleFaq = (index: number) => {
      setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans text-gray-900 selection:bg-yellow-200 overflow-x-hidden">
      
      {/* BACKGROUND NOISE TEXTURE */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* COOKIE BANNER */}
      {!cookieConsent && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 z-[60] animate-in slide-in-from-bottom-10 fade-in duration-700">
              <div className="flex items-start gap-4">
                  <Cookie className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                  <div>
                      <h4 className="font-bold text-sm mb-1">We use cookies</h4>
                      <p className="text-xs text-gray-500 mb-4">To ensure you get the best experience on our website.</p>
                      <div className="flex gap-2">
                          <button onClick={acceptCookies} className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors">Accept</button>
                          <button onClick={acceptCookies} className="text-gray-400 text-xs font-bold hover:text-black transition-colors">Decline</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#FFFBEB]/90 backdrop-blur-md border-b border-yellow-100 py-3 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20 group-hover:scale-110 transition-transform">
                    <Heart className="fill-black w-6 h-6 animate-pulse" />
                </div>
                <span className="font-black text-2xl tracking-tight">Peutic</span>
            </div>

            <div className="hidden md:flex items-center gap-8 font-bold text-sm text-gray-600">
                <a href="#how-it-works" className="hover:text-black transition-colors">How it Works</a>
                <a href="#specialists" className="hover:text-black transition-colors">Specialists</a>
                <a href="#reviews" className="hover:text-black transition-colors">Stories</a>
                <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-4">
                <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')} className="hidden md:flex items-center gap-1 font-bold text-xs uppercase tracking-wider hover:bg-yellow-100 px-3 py-1 rounded-full transition-colors">
                    <Globe className="w-4 h-4" /> {lang}
                </button>
                <button onClick={() => onLoginClick(false)} className="hidden md:block font-bold hover:text-yellow-600 transition-colors">Log In</button>
                <button onClick={() => onLoginClick(true)} className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex items-center gap-2 group">
                    Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-in slide-in-from-left-10 fade-in duration-1000">
                  <div className="inline-flex items-center gap-2 bg-yellow-100 border border-yellow-200 px-4 py-2 rounded-full mb-6">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-black text-yellow-800 uppercase tracking-wide">{availableSpecialists} Specialists Online Now</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
                      The Friend Who <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Always Listens.</span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
                      Instant, face-to-face video connections with empathetic specialists. No judgment, no waiting rooms, just pure human connection when you need it most.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={() => onLoginClick(true)} className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group">
                          Start Your Journey
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                              <Play className="w-4 h-4 fill-current" />
                          </div>
                      </button>
                      <button className="px-8 py-4 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-black hover:bg-white transition-all flex items-center justify-center gap-2">
                          <MessageCircle className="w-5 h-5" /> View Demo
                      </button>
                  </div>

                  <div className="mt-10 flex items-center gap-4 text-sm font-bold text-gray-500">
                      <div className="flex -space-x-3">
                          {[0,1,2,3].map(i => (
                              <img key={i} src={STABLE_AVATAR_POOL[i]} className="w-10 h-10 rounded-full border-4 border-[#FFFBEB]" alt="User" />
                          ))}
                      </div>
                      <div className="flex flex-col">
                          <div className="flex text-yellow-400"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                          <span>Trusted by 10,000+ members</span>
                      </div>
                  </div>
              </div>

              <div className="relative h-[600px] hidden md:block animate-in slide-in-from-right-10 fade-in duration-1000 delay-200">
                  <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200 to-orange-100 rounded-[3rem] transform rotate-3"></div>
                  <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
                      alt="App Preview" 
                      className="absolute inset-0 w-full h-full object-cover rounded-[3rem] shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-700" 
                  />
                  
                  {/* Floating Cards */}
                  <div className="absolute top-10 -left-10 bg-white p-4 rounded-2xl shadow-xl animate-float">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Shield className="w-5 h-5" /></div>
                          <div>
                              <p className="font-bold text-sm">100% Private</p>
                              <p className="text-xs text-gray-500">End-to-end encrypted</p>
                          </div>
                      </div>
                  </div>

                  <div className="absolute bottom-20 -right-10 bg-white p-4 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600"><Clock className="w-5 h-5" /></div>
                          <div>
                              <p className="font-bold text-sm">Available 24/7</p>
                              <p className="text-xs text-gray-500">Connect in seconds</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </header>

      {/* LOGO CLOUD */}
      <div className="border-y border-yellow-100 bg-white/50 backdrop-blur-sm py-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
              <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">As seen in</p>
              <div className="flex justify-between items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                  <LogoTechCrunch />
                  <LogoNYT />
                  <LogoWired />
                  <LogoForbes />
              </div>
          </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-black mb-4">Clarity in 3 Steps.</h2>
                  <p className="text-xl text-gray-500">Simple, secure, and designed for you.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                  {[
                      { icon: Users, title: "1. Choose a Specialist", desc: "Browse profiles of empathetic listeners and certified coaches. Find someone who resonates with you." },
                      { icon: Video, title: "2. Connect Instantly", desc: "No scheduling needed. Click to start a secure video session immediately, anytime, anywhere." },
                      { icon: Heart, title: "3. Feel Better", desc: "Unload your burden, gain new perspectives, and leave the session feeling lighter and understood." }
                  ].map((step, i) => (
                      <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2 group">
                          <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-400 transition-colors">
                              <step.icon className="w-8 h-8 text-black" />
                          </div>
                          <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* SPECIALISTS PREVIEW (Marquee) */}
      <section id="specialists" className="py-24 bg-black text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="max-w-7xl mx-auto px-6 mb-12 relative z-10 flex justify-between items-end">
              <div>
                  <h2 className="text-4xl md:text-5xl font-black mb-4">Meet the Team.</h2>
                  <p className="text-gray-400 text-lg">Real humans, real empathy. Not bots.</p>
              </div>
              <button onClick={() => onLoginClick(true)} className="hidden md:flex items-center gap-2 text-yellow-400 font-bold hover:text-white transition-colors">View All <ArrowRight className="w-4 h-4"/></button>
          </div>

          <div className="relative w-full overflow-hidden">
             <div className="flex gap-6 animate-marquee whitespace-nowrap">
                 {[...INITIAL_COMPANIONS, ...INITIAL_COMPANIONS].map((c, i) => (
                     <div key={i} className="w-72 h-96 flex-shrink-0 relative rounded-3xl overflow-hidden group cursor-pointer border border-gray-800 hover:border-yellow-500 transition-colors">
                         <img src={c.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={c.name} />
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                         <div className="absolute bottom-6 left-6">
                             <div className="flex items-center gap-2 mb-2">
                                 <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
                                 <span className="text-xs font-bold uppercase tracking-wider text-green-400">Available</span>
                             </div>
                             <h3 className="text-2xl font-black">{c.name}</h3>
                             <p className="text-gray-300 text-sm">{c.specialty}</p>
                         </div>
                     </div>
                 ))}
             </div>
          </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 bg-[#FFFBEB]">
          <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Simple, Transparent Pricing.</h2>
              <p className="text-xl text-gray-500 mb-12">Invest in your peace of mind. Pay only for what you use.</p>

              <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-16 border border-yellow-200 relative overflow-hidden">
                  {saleMode && (
                      <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
                          Limited Time Offer
                      </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                      <div className="text-left flex-1">
                          <h3 className="text-3xl font-black mb-2">Pay-As-You-Go</h3>
                          <div className="flex items-baseline gap-2 mb-6">
                              <span className="text-6xl font-black tracking-tighter">${price}</span>
                              <span className="text-gray-400 font-bold text-xl">/ minute</span>
                          </div>
                          <p className="text-gray-600 mb-2">No monthly subscriptions. No hidden fees.</p>
                          <p className="text-gray-400 text-sm">Credits never expire.</p>
                      </div>

                      <div className="w-full md:w-px h-px md:h-64 bg-gray-100"></div>

                      <div className="flex-1 w-full">
                          {saleMode && (
                              <div className="bg-yellow-50 p-4 rounded-xl mb-6 border border-yellow-100 flex items-start gap-3">
                                  <Award className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                                  <div className="text-left">
                                      <p className="font-bold text-sm text-yellow-800">New Member Bonus</p>
                                      <p className="text-xs text-yellow-700">Get 5 free minutes when you sign up today.</p>
                                  </div>
                              </div>
                          )}

                          <p className="text-gray-500 mb-8">{saleMode ? "Sign up today to grandfather this exclusive rate forever." : "Premium quality, affordable care."}</p>
                          <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto text-gray-600">
                              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span>No subscription fees</span></li>
                              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span>HD Video & Audio</span></li>
                              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span>24/7 Availability</span></li>
                          </ul>
                          <button onClick={() => onLoginClick(true)} className="w-full bg-[#FACC15] text-black py-4 rounded-xl font-bold hover:bg-[#EAB308] transition-transform hover:scale-105 shadow-lg shadow-yellow-500/20">
                              {saleMode ? "Lock In $1.49 Rate Now" : "Get Started"}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white py-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center"><Heart className="w-4 h-4 text-black"/></div>
                      <span className="font-black text-xl">Peutic</span>
                  </div>
                  <p className="text-gray-400 max-w-xs leading-relaxed mb-6">
                      Reinventing emotional support for the digital age. Connect, share, and grow with a specialist who truly cares.
                  </p>
                  <div className="flex gap-4">
                      {/* Social Icons Placeholder */}
                      <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all cursor-pointer"><Globe className="w-4 h-4"/></div>
                      <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all cursor-pointer"><MessageCircle className="w-4 h-4"/></div>
                  </div>
              </div>
              
              <div>
                  <h4 className="font-bold text-lg mb-6">Platform</h4>
                  <ul className="space-y-4 text-gray-400 text-sm">
                      <li><a href="#" className="hover:text-white transition-colors">Browse Specialists</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                      <li><button onClick={onAdminClick} className="hover:text-white transition-colors">Admin Login</button></li>
                  </ul>
              </div>

              <div>
                  <h4 className="font-bold text-lg mb-6">Legal</h4>
                  <ul className="space-y-4 text-gray-400 text-sm">
                      <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                      <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                      <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
                  </ul>
              </div>
          </div>
          
          <div className="max-w-7xl mx-auto border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
              <p>&copy; 2025 Peutic Inc. All rights reserved.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Systems Operational</span>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
