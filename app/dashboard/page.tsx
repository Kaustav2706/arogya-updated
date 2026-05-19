'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { 
  UploadCloud, Heart, Droplets, ShieldCheck, 
  FileText, Activity, ChevronRight, Stethoscope, 
  TrendingUp, Lightbulb, Zap, Plus
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function Dashboard() {
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('');
  
  const [history, setHistory] = useState<any[]>([]);
  const [demoActive, setDemoActive] = useState(false);

  const calculateGreeting = (currentLang: 'EN' | 'HI') => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) {
      return currentLang === 'EN' ? 'Good Morning' : 'शुभ प्रभात';
    } else if (hr >= 12 && hr < 17) {
      return currentLang === 'EN' ? 'Good Afternoon' : 'शुभ दोपहर';
    } else {
      return currentLang === 'EN' ? 'Good Evening' : 'शुभ संध्या';
    }
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem('arogya_reports_history');
      const historyList = storedHistory ? JSON.parse(storedHistory) : [];
      setHistory(historyList);

      const globalLang = localStorage.getItem('arogya_global_lang') as 'EN' | 'HI';
      if (globalLang) {
        setLang(globalLang);
      }
    }
  }, []);

  useEffect(() => {
    const handleGlobalLangChange = (e: any) => {
      setLang(e.detail);
    };

    window.addEventListener('arogya_language_changed', handleGlobalLangChange);
    return () => window.removeEventListener('arogya_language_changed', handleGlobalLangChange);
  }, []);

  useEffect(() => {
    setGreeting(calculateGreeting(lang));
  }, [lang]);

  const hasReports = history.length > 0 || demoActive;

  const getLatestReport = () => {
    if (history.length > 0 && !demoActive) {
      return history[0];
    }
    return {
      filename: 'demo_lipid_report.pdf',
      date: 'Oct 24, 2024',
      extraction: {
        parameters: [
          { parameter: 'Total Cholesterol', value: '214', unit: 'mg/dL', status: 'abnormal' },
          { parameter: 'Glucose Level', value: '95', unit: 'mg/dL', status: 'normal' },
          { parameter: 'Hemoglobin (Hb)', value: '12.6', unit: 'g/dL', status: 'normal' }
        ]
      }
    };
  };

  const latestReport = getLatestReport();

  const getCholesterol = () => {
    if (!latestReport || !latestReport.extraction || !latestReport.extraction.parameters) return { value: '214', unit: 'mg/dL' };
    const cholParam = latestReport.extraction.parameters.find((p: any) => {
      const name = p.parameter.toLowerCase();
      return name.includes('cholesterol') && name.includes('total');
    });
    if (cholParam) return { value: cholParam.value, unit: cholParam.unit || 'mg/dL' };

    const generalChol = latestReport.extraction.parameters.find((p: any) => p.parameter.toLowerCase().includes('cholesterol'));
    if (generalChol) return { value: generalChol.value, unit: generalChol.unit || 'mg/dL' };

    return { value: '214', unit: 'mg/dL' };
  };

  const getGlucose = () => {
    if (!latestReport || !latestReport.extraction || !latestReport.extraction.parameters) return { value: '95', unit: 'mg/dL' };
    const glucoseParam = latestReport.extraction.parameters.find((p: any) => {
      const name = p.parameter.toLowerCase();
      return name.includes('glucose') || name.includes('sugar') || name.includes('hba1c');
    });
    if (glucoseParam) return { value: glucoseParam.value, unit: glucoseParam.unit || 'mg/dL' };
    return { value: '95', unit: 'mg/dL' };
  };

  const calculateScoreAndStanding = (report: any) => {
    if (!report || !report.extraction || !report.extraction.parameters) {
      return { score: 85, standing: 'Optimal Standing', colorClass: 'text-primary', svgStroke: '#0d9488' };
    }
    
    let baseScore = 100;
    let abnormalCount = 0;
    let borderlineCount = 0;

    report.extraction.parameters.forEach((param: any) => {
      if (param.status === 'abnormal') {
        baseScore -= 15;
        abnormalCount++;
      } else if (param.status === 'borderline') {
        baseScore -= 8;
        borderlineCount++;
      }
    });

    const score = Math.max(35, Math.min(100, baseScore));
    
    let standing = 'Optimal Standing';
    let colorClass = 'text-primary';
    let svgStroke = '#0d9488'; 

    if (abnormalCount > 1) {
      standing = 'Attention Needed';
      colorClass = 'text-red-500';
      svgStroke = '#ef4444'; 
    } else if (abnormalCount === 1) {
      standing = 'Action Recommended';
      colorClass = 'text-orange-500';
      svgStroke = '#f97316'; 
    } else if (borderlineCount > 0) {
      standing = 'Monitor Closely';
      colorClass = 'text-amber-500';
      svgStroke = '#f59e0b';
    }

    return { score, standing, colorClass, svgStroke };
  };

  const { score, standing, colorClass, svgStroke } = calculateScoreAndStanding(latestReport);

  const getTranslatedStanding = (std: string) => {
    if (lang === 'EN') {
      switch (std) {
        case 'Optimal Standing': return 'Excellent trend';
        case 'Good Standing': return 'Good trend';
        case 'Monitor Closely': return 'Monitor closely';
        case 'Action Recommended': return 'Action recommended';
        case 'Attention Needed': return 'Needs attention';
        default: return std;
      }
    } else {
      switch (std) {
        case 'Optimal Standing': return 'शानदार स्वास्थ्य प्रवृत्ति।';
        case 'Good Standing': return 'अच्छी स्वास्थ्य प्रवृत्ति।';
        case 'Monitor Closely': return 'बारीकी से निगरानी करें।';
        case 'Action Recommended': return 'कार्रवाई की सिफारिश की।';
        case 'Attention Needed': return 'ध्यान देने की आवश्यकता।';
        default: return std;
      }
    }
  };

  return (
    <div className="bg-[#f4f7fb] min-h-screen flex flex-col font-sans selection:bg-accent/30 bg-mesh-gradient">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-12 flex flex-col gap-10 relative z-10">
        
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-[40px] pointer-events-none" />
            <h1 className="text-4xl text-on-background font-black tracking-tight flex items-center gap-3 relative z-10">
              {mounted ? greeting : (lang === 'EN' ? 'Good Morning' : 'शुभ प्रभात')}
              <div className="w-6 h-6 bg-gradient-to-tr from-amber-300 to-amber-500 rounded-full blur-[2px] shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse" />
            </h1>
            <p className="text-lg text-on-surface/70 mt-2 font-medium relative z-10">
              {lang === 'EN' ? 'Here is your health summary for today.' : 'यहाँ आज का आपका स्वास्थ्य सारांश है।'}
            </p>
          </motion.div>
          
          <div className="flex gap-4 items-center">
            {/* Demo Toggle */}
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setDemoActive(!demoActive)}
              className="text-[11px] text-secondary hover:text-primary hover:border-primary/40 shadow-sm transition-all border border-outline/30 rounded-full px-5 py-2 bg-white/60 backdrop-blur-md font-bold uppercase tracking-wider"
            >
              {lang === 'EN' ? 'Demo: ' : 'डेमो: '}
              {demoActive 
                ? (lang === 'EN' ? 'Live' : 'लाइव') 
                : (lang === 'EN' ? 'Preview' : 'प्रीव्यू')
              }
            </motion.button>

            {hasReports && (
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link href="/upload" className="bg-primary hover:bg-primary-dark text-white font-bold text-sm px-7 py-3 rounded-2xl shadow-[0_8px_20px_rgba(13,148,136,0.25)] flex items-center gap-2 transition-all">
                  <Plus className="w-4 h-4" />
                  {lang === 'EN' ? 'New Report' : 'नई रिपोर्ट'}
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        <AnimatePresence mode="wait">
          {!hasReports ? (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-8 w-full"
            >
              <div className="glass-panel rounded-[3rem] p-12 md:p-24 flex flex-col items-center text-center max-w-4xl mx-auto w-full relative overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
                
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary/80 to-accent/80 backdrop-blur-md shadow-2xl flex items-center justify-center mb-10 relative z-10 rotate-6 border border-white/40"
                >
                  <FileText className="w-16 h-16 text-white" />
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-black text-on-background mb-6 relative z-10 w-full tracking-tight">
                  {lang === 'EN' ? 'Your health journey begins here' : 'आपकी स्वास्थ्य यात्रा यहाँ से शुरू होती है'}
                </h2>
                <p className="text-xl text-on-surface/70 max-w-2xl mx-auto mb-12 relative z-10 w-full leading-relaxed font-medium">
                  {lang === 'EN' 
                    ? 'Upload your first lab report or clinical document. Our AI will instantly translate complex medical jargon into clear, actionable insights.'
                    : 'अपनी पहली लैब रिपोर्ट, नुस्खा या नैदानिक दस्तावेज़ अपलोड करें। हमारा एआई तुरंत जटिल चिकित्सा शब्दावली को स्पष्ट और उपयोगी जानकारी में अनुवाद कर देगा।'}
                </p>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative z-10">
                  <Link href="/upload" className="group bg-on-background text-white font-bold text-lg px-10 py-5 rounded-[1.5rem] shadow-xl flex items-center gap-3 hover:bg-primary transition-all">
                    <UploadCloud className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                    {lang === 'EN' ? 'Upload Your First Report' : 'अपनी रिपोर्ट अपलोड करें'}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="filled-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8"
            >
              
              {/* Left Column */}
              <div className="md:col-span-8 flex flex-col gap-8">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Metric 1: Total Cholesterol */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="glass-panel rounded-3xl p-6 transition-all hover:shadow-xl group overflow-hidden relative"
                  >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="text-xs font-bold text-secondary uppercase tracking-widest pl-1">
                        {lang === 'EN' ? 'Total Cholesterol' : 'कुल कोलेस्ट्रॉल'}
                      </span>
                      <div className="bg-primary/10 p-2 rounded-xl">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 relative z-10">
                      <span className="text-[2.75rem] leading-none font-black text-on-background tracking-tighter">
                        {getCholesterol().value}
                      </span>
                      <span className="text-sm font-semibold text-secondary">
                        {lang === 'EN' ? getCholesterol().unit : (getCholesterol().unit === 'mg/dL' ? 'एमजी/डीएल' : getCholesterol().unit)}
                      </span>
                    </div>
                    <div className="h-12 mt-6 rounded-xl bg-surface/50 overflow-hidden relative z-10 border border-white/40">
                      <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: '50%' }} 
                        transition={{ duration: 1, delay: 0.2 }}
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary/20 to-transparent" 
                      />
                      <svg className="w-full h-full text-primary" fill="none" preserveAspectRatio="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 100 100">
                        <motion.path 
                          initial={{ pathLength: 0 }} 
                          animate={{ pathLength: 1 }} 
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          d="M0 50 Q 25 40, 50 60 T 100 50"
                        />
                      </svg>
                    </div>
                  </motion.div>

                  {/* Metric 2: Glucose Level */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="glass-panel rounded-3xl p-6 transition-all hover:shadow-xl group overflow-hidden relative"
                  >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-secondary-light/10 rounded-full blur-xl group-hover:bg-secondary-light/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="text-xs font-bold text-secondary uppercase tracking-widest pl-1">
                        {lang === 'EN' ? 'Glucose Level' : 'ग्लूकोज स्तर'}
                      </span>
                      <div className="bg-secondary/10 p-2 rounded-xl">
                        <Droplets className="w-5 h-5 text-secondary" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 relative z-10">
                      <span className="text-[2.75rem] leading-none font-black text-on-background tracking-tighter">
                        {getGlucose().value}
                      </span>
                      <span className="text-sm font-semibold text-secondary">
                        {lang === 'EN' ? getGlucose().unit : (getGlucose().unit === 'mg/dL' ? 'एमजी/डीएल' : getGlucose().unit)}
                      </span>
                    </div>
                    <div className="h-12 mt-6 rounded-xl bg-surface/50 overflow-hidden relative z-10 border border-white/40">
                      <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: '50%' }} 
                        transition={{ duration: 1, delay: 0.3 }}
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-secondary/20 to-transparent" 
                      />
                      <svg className="w-full h-full text-secondary" fill="none" preserveAspectRatio="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 100 100">
                        <motion.path 
                          initial={{ pathLength: 0 }} 
                          animate={{ pathLength: 1 }} 
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
                          d="M0 60 Q 25 70, 50 50 T 100 55"
                        />
                      </svg>
                    </div>
                  </motion.div>

                  {/* Metric 3: Overall Health */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="glass-panel-heavy rounded-3xl p-6 transition-all shadow-md group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/40 backdrop-blur-md -z-10" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="text-xs font-bold text-secondary uppercase tracking-widest pl-1">
                        {lang === 'EN' ? 'Health Score' : 'स्वास्थ्य स्कोर'}
                      </span>
                      <div className={`p-2 rounded-xl bg-opacity-10`} style={{ backgroundColor: `${svgStroke}20` }}>
                        <Zap className="w-5 h-5" style={{ color: svgStroke }} />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-6 relative z-10">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 36 36">
                          <path className="text-outline/40" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                          <motion.path 
                            initial={{ strokeDasharray: "0, 100" }}
                            animate={{ strokeDasharray: `${score}, 100` }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                            className={colorClass}
                            style={{ stroke: svgStroke }}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute font-black text-2xl text-on-background tracking-tighter" style={{ color: svgStroke }}>{score}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-on-background mb-0.5" style={{ color: svgStroke }}>
                          {getTranslatedStanding(standing)}
                        </span>
                        <span className="text-xs text-on-surface/70 font-medium leading-relaxed">
                          {score >= 80 ? 'Doing great! Keep it up.' : 'Some markers need attention.'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Report History */}
                <div className="glass-panel-heavy rounded-[2rem] border border-white shadow-xl overflow-hidden mt-2">
                  <div className="p-8 border-b border-outline/30 flex justify-between items-center bg-white/40 sticky top-0 backdrop-blur-md z-10">
                    <h2 className="text-2xl font-black text-on-background tracking-tight">
                      {lang === 'EN' ? 'Recent Records' : 'हालिया रिकॉर्ड'}
                    </h2>
                    <Link href="/results" className="text-primary text-sm hover:underline font-bold bg-primary/10 px-4 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                      {lang === 'EN' ? 'View All' : 'सभी देखें'}
                    </Link>
                  </div>
                  
                  <div className="flex flex-col p-4 gap-3">
                    {(!demoActive && history.length > 0 ? history : [
                      {
                        id: 'demo1',
                        filename: 'Comprehensive Blood Panel.pdf',
                        date: 'Oct 24, 2024',
                        provider: 'Quest Diagnostics',
                        extraction: { parameters: [] }
                      },
                      {
                        id: 'demo2',
                        filename: 'Lipid Profile.pdf',
                        date: 'Sep 12, 2024',
                        provider: 'Apollo Clinics',
                        extraction: { parameters: [{ status: 'abnormal' }] }
                      },
                      {
                        id: 'demo3',
                        filename: 'Chest X-Ray.pdf',
                        date: 'Aug 05, 2024',
                        provider: 'City Hospital',
                        extraction: { parameters: [] }
                      }
                    ]).slice(0, 3).map((item: any, idx: number) => {
                      const repScoreAndStanding = calculateScoreAndStanding(item);
                      
                      let badgeClass = 'bg-primary/10 text-primary border-primary/20';
                      let statusText = lang === 'EN' ? 'Normal' : 'सामान्य';

                      if (repScoreAndStanding.standing === 'Attention Needed') {
                        badgeClass = 'bg-red-50 text-red-600 border-red-200';
                        statusText = lang === 'EN' ? 'Critical' : 'गंभीर';
                      } else if (repScoreAndStanding.standing === 'Action Recommended' || repScoreAndStanding.standing === 'Monitor Closely') {
                        badgeClass = 'bg-orange-50 text-orange-600 border-orange-200';
                        statusText = lang === 'EN' ? 'Needs Attention' : 'ध्यान दें';
                      }

                      return (
                        <Link 
                          key={item.id || idx}
                          href="/results"
                          onClick={() => {
                            if (typeof window !== 'undefined' && item.id) {
                              localStorage.setItem('arogya_current_report_id', item.id);
                            }
                          }}
                          className="px-5 py-4 bg-white/60 hover:bg-white rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-5">
                            <div className="bg-primary/5 p-3.5 rounded-xl text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all border border-primary/10">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-on-background group-hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-md tracking-tight" title={item.filename}>
                                {item.filename.replace('.pdf', '')}
                              </h3>
                              <p className="text-sm text-on-surface/70 mt-0.5 font-medium">
                                {item.date} • {item.provider || (lang === 'EN' ? 'Arogya AI Partner' : 'आरोग्य एआई पार्टनर')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-mono font-bold text-xs px-3 py-1.5 rounded-md border ${badgeClass} shadow-sm hidden sm:block`}>
                              {statusText}
                            </span>
                            <div className="w-10 h-10 rounded-full bg-surface group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors text-on-surface/50 border border-outline/30">
                              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Access Right Column */}
              <div className="md:col-span-4 flex flex-col gap-6">
                
                <Link href="/trends" className="glass-panel rounded-3xl p-8 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group block">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-accent/20 to-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                  
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 border border-accent/20 relative z-10">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-on-background mb-2 tracking-tight relative z-10">
                    {lang === 'EN' ? 'Health Trends' : 'रुझान रिपोर्ट'}
                  </h3>
                  
                  <p className="text-sm text-on-surface/80 mb-8 font-medium leading-relaxed relative z-10">
                    {lang === 'EN' ? 'Visualize your blood markers over the last 6 months with interactive charts.' : 'पिछले 6 महीनों में अपने स्वास्थ्य मापदंडों का विश्लेषण करें।'}
                  </p>
                  
                  <div className="flex items-center justify-between text-accent font-semibold text-sm relative z-10 bg-white/50 px-4 py-3 rounded-xl border border-white/50 group-hover:bg-white transition-colors">
                    {lang === 'EN' ? 'Explore Analytics' : 'रुझानों को देखें'}
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link href="/assistant" className="glass-panel-heavy rounded-3xl p-8 transition-all shadow-md hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group block">
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-gradient-to-tr from-secondary/20 to-blue-400/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                  
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 border border-secondary/20 relative z-10">
                    <Lightbulb className="w-6 h-6 text-secondary" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-on-background mb-2 tracking-tight relative z-10">
                    {lang === 'EN' ? 'AI Health Coach' : 'हेल्थ कोच'}
                  </h3>
                  
                  <p className="text-sm text-on-surface/80 mb-8 font-medium leading-relaxed relative z-10">
                    {lang === 'EN' ? 'Ask questions about your reports and get personalized lifestyle recommendations.' : 'आपकी हालिया रिपोर्ट के आधार पर व्यक्तिगत स्वास्थ्य सुझाव।'}
                  </p>
                  
                  <div className="flex items-center justify-between text-secondary font-semibold text-sm relative z-10 bg-white/50 px-4 py-3 rounded-xl border border-white/50 group-hover:bg-white transition-colors">
                    {lang === 'EN' ? 'Start Chatting' : 'सुझाव पढ़ें'}
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
