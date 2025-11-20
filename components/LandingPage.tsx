
import React, { useState, useEffect } from 'react';
import { Shield, Heart, Star, Clock, Users, CheckCircle, ArrowRight, Lock, Globe, Brain, Zap, ChevronDown, Play, MessageCircle, Signal, Video } from 'lucide-react';
import { TRANSLATIONS, LanguageCode, getTranslation } from '../services/i18n';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(124);

  useEffect(() => {
    // Randomize online count between 80 and 300 on load
    setOnlineCount(Math.floor(Math.random() * (300 - 80 + 1)) + 80);
  }, []);

  const toggleLang = (code: LanguageCode) => {
    setLang(code);
    setLangMenuOpen(false);
  };

  const featuredSpecialists = [
    { name: "Ruby", role: "Anxiety & Panic", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400", status: "Available" },
    { name: "Elena", role: "Women's Health", img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=400&h=400", status: "Available" }, // Added Elena
    { name: "James", role: "Men's Health", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400", status: "In Session" },
    { name: "Danny", role: "Grief Support", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400", status: "Available" },
    { name: "Julia", role: "Relationships", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400&h=400", status: "Available" }
  ];

  const pressLogos = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/TechCrunch_logo_2013.svg/1200px-TechCrunch_logo_2013.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/The_New_York_Times.svg/1200px-The_New_York_Times.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Wired_logo.svg/1200px-Wired_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Bloomberg_L.P._logo.svg/1200px-Bloomberg_L.P._logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Forbes_logo.svg/1200px-Forbes_logo.svg.png"
  ];

  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans text-gray-900 overflow-x-hidden">
      
      {/* NAVIGATION */}
      <nav className="fixed w-full bg-[#FFFBEB]/80 backdrop-blur-md z-50 border-b border-yellow-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-peutic-yellow rounded-lg flex items-center justify-center shadow-lg shadow-yellow-200/50">
                   <Heart className="w-6 h-6 fill-black text-black" />
               </div>
               <span className="text-2xl font-bold tracking-tight">Peutic</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">{getTranslation(lang, 'nav_features')}</a>
              <a href="#how-it-works" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">{getTranslation(lang, 'nav_how')}</a>
              <a href="#pricing" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">{getTranslation(lang, 'nav_membership')}</a>
              
              <div className="relative">
                <button onClick={() => setLangMenuOpen(!langMenuOpen)} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black">
                   <Globe className="w-4 h-4" /> {lang.toUpperCase()} <ChevronDown className="w-3 h-3" />
                </button>
                {langMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                        {(['en', 'es', 'fr', 'zh', 'ar'] as LanguageCode[]).map(c => (
                            <button key={c} onClick={() => toggleLang(c)} className="block w-full text-left px-4 py-3 text-sm hover:bg-yellow-50 font-bold">
                                {c === 'en' ? 'English' : c === 'es' ? 'Español' : c === 'fr' ? 'Français' : c === 'zh' ? '中文' : 'العربية'}
                            </button>
                        ))}
                    </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
               <button onClick={onLoginClick} className="text-sm font-bold hidden md:block">{getTranslation(lang, 'login')}</button>
               <button onClick={onLoginClick} className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-transform hover:scale-105 shadow-lg flex items-center gap-2">
                  {getTranslation(lang, 'cta_start')} <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-yellow-100/50 to-transparent rounded-l-[100px] -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8 z-10">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-yellow-200 shadow-sm animate-float">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-bold tracking-wide text-gray-600">{onlineCount} SPECIALISTS ONLINE NOW</span>
                      </div>
                      
                      <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1]">
                          {getTranslation(lang, 'hero_title_1')} <br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600 relative">
                              {getTranslation(lang, 'hero_title_2')}
                              <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300 -z-10 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
                          </span>
                      </h1>
                      
                      <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                          {getTranslation(lang, 'hero_subtitle')}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                          <button onClick={onLoginClick} className="px-8 py-4 bg-black text-white rounded-xl font-bold text-lg shadow-xl shadow-yellow-500/10 hover:bg-gray-900 transition-all hover:scale-105 flex items-center justify-center gap-3">
                              <Play className="w-5 h-5 fill-white" /> {getTranslation(lang, 'cta_start')}
                          </button>
                          <div className="flex items-center gap-4 px-6 py-4 bg-white/50 rounded-xl border border-white backdrop-blur-sm">
                              <Shield className="w-6 h-6 text-gray-400" />
                              <div className="text-xs font-bold text-gray-500">
                                  {getTranslation(lang, 'cta_hipaa')}<br/>
                                  <span className="text-green-600">{getTranslation(lang, 'trust_soc2')}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="relative lg:h-[600px] w-full flex items-center justify-center">
                      {/* HERO VIDEO UI MOCKUP */}
                      <div className="relative w-[350px] h-[500px] bg-black rounded-[40px] border-8 border-white shadow-2xl overflow-hidden transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500 z-20">
                           {/* Simulated Video Feed */}
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
                      <div className="absolute top-20 -right-4 bg-white p-4 rounded-2xl shadow-xl animate-float flex items-center gap-3 z-30">
                          <div className="bg-green-100 p-2 rounded-full"><CheckCircle className="w-6 h-6 text-green-600" /></div>
                          <div>
                              <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                              <p className="font-bold text-gray-900">Secure Connection</p>
                          </div>
                      </div>

                      <div className="absolute bottom-32 -left-12 bg-white p-4 rounded-2xl shadow-xl animate-float flex items-center gap-3 z-30" style={{animationDelay: '2s'}}>
                          <div className="bg-yellow-100 p-2 rounded-full"><Star className="w-6 h-6 text-yellow-600" /></div>
                          <div>
                              <p className="text-xs text-gray-400 font-bold uppercase">Rating</p>
                              <p className="font-bold text-gray-900">5.0/5.0 (Verified)</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* PRESS BANNER (MARQUEE) */}
      <section className="py-10 border-y border-yellow-100 bg-white overflow-hidden">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Trusted by Industry Leaders</p>
          <div className="relative flex overflow-x-hidden group">
              <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                  {[...pressLogos, ...pressLogos, ...pressLogos].map((logo, i) => (
                      <img key={i} src={logo} className="h-8 object-contain inline-block" alt="Press Logo" />
                  ))}
              </div>
          </div>
      </section>

      {/* SCIENCE / STATS */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-peutic-yellow rounded-full blur-[120px] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-4xl font-black mb-6">{getTranslation(lang, 'science_title')}</h2>
                  <p className="text-gray-400 text-lg">{getTranslation(lang, 'science_subtitle')}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                      <div className="text-5xl font-black text-peutic-yellow mb-2">{getTranslation(lang, 'stat_1_val')}</div>
                      <p className="text-gray-400 font-bold">{getTranslation(lang, 'stat_1_desc')}</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                      <div className="text-5xl font-black text-peutic-yellow mb-2">{getTranslation(lang, 'stat_2_val')}</div>
                      <p className="text-gray-400 font-bold">{getTranslation(lang, 'stat_2_desc')}</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                      <div className="text-5xl font-black text-peutic-yellow mb-2">{getTranslation(lang, 'stat_3_val')}</div>
                      <p className="text-gray-400 font-bold">{getTranslation(lang, 'stat_3_desc')}</p>
                  </div>
              </div>
          </div>
      </section>

      {/* SPECIALIST CAROUSEL */}
      <section className="py-24 bg-[#FFFBEB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-12">
                  <div>
                    <h2 className="text-4xl font-black mb-4">Meet The Team</h2>
                    <p className="text-gray-600 max-w-xl">Real humans. Real empathy. Select a specialist that resonates with you.</p>
                  </div>
                  <button onClick={onLoginClick} className="hidden md:flex items-center gap-2 font-bold hover:gap-3 transition-all">View All <ArrowRight className="w-4 h-4" /></button>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x">
                  {featuredSpecialists.map((s, i) => (
                      <div key={i} className="min-w-[280px] bg-white p-4 rounded-3xl shadow-sm border border-yellow-100 hover:shadow-xl transition-all snap-center group cursor-pointer" onClick={onLoginClick}>
                          <div className="h-64 rounded-2xl overflow-hidden mb-4 relative">
                              <img src={s.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={s.name} />
                              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md ${s.status === 'Available' ? 'bg-green-500/80' : 'bg-yellow-500/80'}`}>
                                  {s.status}
                              </div>
                          </div>
                          <h3 className="text-xl font-bold">{s.name}</h3>
                          <p className="text-gray-500 text-sm">{s.role}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="order-2 md:order-1">
                       {/* Static High Quality Visual */}
                       <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                           <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1000&auto=format&fit=crop" alt="Calm Environment" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/20"></div>
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
                      <h2 className="text-4xl font-black">{getTranslation(lang, 'why_choose')}</h2>
                      
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
      <section id="pricing" className="py-24 bg-black text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-5xl font-black mb-8 tracking-tight">Simple, Transparent Pricing.</h2>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 inline-block max-w-lg w-full">
                  <p className="text-gray-400 font-bold uppercase tracking-widest mb-4">{getTranslation(lang, 'pricing_title')}</p>
                  <div className="text-7xl font-black text-peutic-yellow mb-4 flex items-start justify-center gap-1">
                      <span className="text-3xl mt-2">$</span>1.49<span className="text-xl text-gray-400 mt-8">/min</span>
                  </div>
                  <p className="text-gray-300 mb-8">{getTranslation(lang, 'pricing_desc')}</p>
                  <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
                      <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span>No subscription fees</span></li>
                      <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span>HD Video & Audio</span></li>
                      <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span>24/7 Availability</span></li>
                  </ul>
                  <button onClick={onLoginClick} className="w-full bg-peutic-yellow text-black py-4 rounded-xl font-bold hover:bg-yellow-400 transition-transform hover:scale-105 shadow-lg shadow-yellow-500/20">
                      {getTranslation(lang, 'pricing_button')}
                  </button>
              </div>
          </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-gray-500 py-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-300">Peutic Inc.</span>
              </div>
              <div className="flex gap-8 text-sm font-medium">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-white transition-colors">Support</a>
              </div>
              <p className="text-xs opacity-50">© 2025 Peutic Inc. {getTranslation(lang, 'footer_rights')}</p>
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
