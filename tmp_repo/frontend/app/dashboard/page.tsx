'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { 
  UploadCloud, Heart, Droplets, ShieldCheck, 
  FileText, Activity, ChevronRight, Stethoscope, 
  TrendingUp, Lightbulb
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function Dashboard() {
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('');
  
  // Real storage state
  const [history, setHistory] = useState<any[]>([]);
  // Presenter Showcase Mock Toggle
  const [demoActive, setDemoActive] = useState(false);

  const calculateGreeting = (currentLang: 'EN' | 'HI') => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) {
      return currentLang === 'EN' ? 'Good Morning.' : 'शुभ प्रभात।';
    } else if (hr >= 12 && hr < 17) {
      return currentLang === 'EN' ? 'Good Afternoon.' : 'शुभ दोपहर।';
    } else {
      return currentLang === 'EN' ? 'Good Evening.' : 'शुभ संध्या।';
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

  // Listen to global Navbar language toggle
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

  // Determine if populated layout should be rendered
  const hasReports = history.length > 0 || demoActive;

  // Grab active report (newest first)
  const getLatestReport = () => {
    if (history.length > 0 && !demoActive) {
      return history[0];
    }
    // Return mock data for presenter showcase
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

  // Dynamic parser for Total Cholesterol
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

  // Dynamic parser for Glucose
  const getGlucose = () => {
    if (!latestReport || !latestReport.extraction || !latestReport.extraction.parameters) return { value: '95', unit: 'mg/dL' };
    const glucoseParam = latestReport.extraction.parameters.find((p: any) => {
      const name = p.parameter.toLowerCase();
      return name.includes('glucose') || name.includes('sugar') || name.includes('hba1c');
    });
    if (glucoseParam) return { value: glucoseParam.value, unit: glucoseParam.unit || 'mg/dL' };
    return { value: '95', unit: 'mg/dL' };
  };

  // Calculate Overall Health Score dynamically from parameters
  const calculateScoreAndStanding = (report: any) => {
    if (!report || !report.extraction || !report.extraction.parameters) {
      return { score: 85, standing: 'Optimal Standing', colorClass: 'text-primary', svgStroke: '#008378' };
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

    const score = Math.max(35, Math.min(100, baseScore)); // clamp between 35 and 100
    
    let standing = 'Optimal Standing';
    let colorClass = 'text-primary';
    let svgStroke = '#008378'; // Teal

    if (abnormalCount > 1) {
      standing = 'Attention Needed';
      colorClass = 'text-error';
      svgStroke = '#dc2626'; // Red
    } else if (abnormalCount === 1) {
      standing = 'Action Recommended';
      colorClass = 'text-error';
      svgStroke = '#dc2626'; // Red
    } else if (borderlineCount > 0) {
      standing = 'Monitor Closely';
      colorClass = 'text-warning';
      svgStroke = '#d97706'; // Amber/Yellow
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
    <>
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-12 flex flex-col gap-10">
        
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl text-on-background font-semibold">
              {mounted ? greeting : (lang === 'EN' ? 'Good Morning.' : 'शुभ प्रभात।')}
            </h1>
            <p className="text-lg text-on-surface-variant mt-2">
              {lang === 'EN' ? 'Here is your health summary for today.' : 'यहाँ आज का आपका स्वास्थ्य सारांश है।'}
            </p>
          </motion.div>
          <div className="flex gap-4 items-center">
            {/* Demo Toggle - Subtle area for presentation */}
            <button 
              onClick={() => setDemoActive(!demoActive)}
              className="text-xs text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/30 rounded-full px-3 py-1 bg-surface-container-low font-semibold"
            >
              {lang === 'EN' ? 'Demo: ' : 'डेमो: '}
              {demoActive 
                ? (lang === 'EN' ? 'Show Real' : 'वास्तविक दिखाएं') 
                : (lang === 'EN' ? 'Show Populated' : 'भरा हुआ दिखाएं')
              }
            </button>

            {hasReports && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/upload" className="bg-primary text-on-primary font-medium text-base px-6 py-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-primary/90 transition-colors">
                  <UploadCloud className="w-5 h-5" />
                  {lang === 'EN' ? 'Upload New Report' : 'नई रिपोर्ट अपलोड करें'}
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        <AnimatePresence mode="wait">
          {!hasReports ? (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-8"
            >
              <div className="bg-surface-container-lowest rounded-3xl p-10 md:p-16 border border-outline-variant/20 shadow-sm flex flex-col items-center text-center max-w-4xl mx-auto w-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="w-24 h-24 rounded-full bg-primary-container/20 flex items-center justify-center mb-8 relative z-10">
                  <FileText className="w-12 h-12 text-primary" />
                </div>
                
                <h2 className="text-3xl font-semibold text-on-background mb-4 relative z-10 w-full">
                  {lang === 'EN' ? 'Your health journey begins here' : 'आपकी स्वास्थ्य यात्रा यहाँ से शुरू होती है'}
                </h2>
                <p className="text-lg text-on-surface-variant max-w-xl mx-auto mb-10 relative z-10 w-full leading-relaxed">
                  {lang === 'EN' 
                    ? 'Upload your first lab report, prescription, or clinical document. Our AI will instantly translate complex medical jargon into clear, actionable insights.'
                    : 'अपनी पहली लैब रिपोर्ट, नुस्खा या नैदानिक दस्तावेज़ अपलोड करें। हमारा एआई तुरंत जटिल चिकित्सा शब्दावली को स्पष्ट और उपयोगी जानकारी में अनुवाद कर देगा।'}
                </p>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative z-10">
                  <Link href="/upload" className="bg-primary text-on-primary font-semibold text-lg px-8 py-4 rounded-full shadow-lg flex items-center gap-3 hover:bg-primary-container hover:text-on-primary-container transition-all">
                    <UploadCloud className="w-6 h-6" />
                    {lang === 'EN' ? 'Upload Your Report' : 'अपनी रिपोर्ट अपलोड करें'}
                  </Link>
                </motion.div>

                <div className="mt-12 flex gap-8 flex-col sm:flex-row text-left z-10 w-full max-w-2xl mx-auto border-t border-outline-variant/20 pt-8">
                   <div className="flex flex-col gap-2 flex-1">
                     <ShieldCheck className="w-6 h-6 text-primary mb-1" />
                     <h3 className="font-semibold text-on-background">
                       {lang === 'EN' ? '100% Secure' : '100% सुरक्षित'}
                     </h3>
                     <p className="text-sm text-on-surface-variant leading-relaxed">
                       {lang === 'EN' 
                         ? 'Your medical data is encrypted and never shared without your consent.' 
                         : 'आपका मेडिकल डेटा एन्क्रिप्टेड है और आपकी सहमति के बिना कभी साझा नहीं किया जाता है।'}
                     </p>
                   </div>
                   <div className="flex flex-col gap-2 flex-1">
                     <Activity className="w-6 h-6 text-tertiary mb-1" />
                     <h3 className="font-semibold text-on-background">
                       {lang === 'EN' ? 'Instant Analysis' : 'त्वरित विश्लेषण'}
                     </h3>
                     <p className="text-sm text-on-surface-variant leading-relaxed">
                       {lang === 'EN' 
                         ? 'Get results in seconds, complete with trend tracking and plain-English summaries.' 
                         : 'सेकंडों में परिणाम प्राप्त करें, प्रवृत्ति ट्रैकिंग और सरल हिंदी सारांश के साथ।'}
                     </p>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="filled-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8"
            >
              
              {/* Left Column */}
              <div className="md:col-span-8 flex flex-col gap-8">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Metric 1: Total Cholesterol */}
                  <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-semibold text-secondary uppercase tracking-widest">
                        {lang === 'EN' ? 'Total Cholesterol' : 'कुल कोलेस्ट्रॉल'}
                      </span>
                      <Heart className="w-6 h-6 text-primary fill-primary/10" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-on-background tracking-tighter">
                        {getCholesterol().value}
                      </span>
                      <span className="text-sm text-on-surface-variant">
                        {lang === 'EN' ? getCholesterol().unit : (getCholesterol().unit === 'mg/dL' ? 'एमजी/डीएल' : getCholesterol().unit)}
                      </span>
                    </div>
                    <div className="h-12 mt-6 rounded bg-surface-container-low overflow-hidden relative">
                      <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: '50%' }} 
                        transition={{ duration: 1, delay: 0.2 }}
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary/20 to-transparent" 
                      />
                      <svg className="w-full h-full text-primary" fill="none" preserveAspectRatio="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 100 100">
                        <motion.path 
                          initial={{ pathLength: 0 }} 
                          animate={{ pathLength: 1 }} 
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          d="M0 50 Q 25 40, 50 60 T 100 50"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Metric 2: Glucose Level */}
                  <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-semibold text-secondary uppercase tracking-widest">
                        {lang === 'EN' ? 'Glucose Level' : 'ग्लूकोज स्तर'}
                      </span>
                      <Droplets className="w-6 h-6 text-primary fill-primary/10" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-on-background tracking-tighter">
                        {getGlucose().value}
                      </span>
                      <span className="text-sm text-on-surface-variant">
                        {lang === 'EN' ? getGlucose().unit : (getGlucose().unit === 'mg/dL' ? 'एमजी/डीएल' : getGlucose().unit)}
                      </span>
                    </div>
                    <div className="h-12 mt-6 rounded bg-surface-container-low overflow-hidden relative">
                      <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: '50%' }} 
                        transition={{ duration: 1, delay: 0.3 }}
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary/20 to-transparent" 
                      />
                      <svg className="w-full h-full text-primary" fill="none" preserveAspectRatio="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 100 100">
                        <motion.path 
                          initial={{ pathLength: 0 }} 
                          animate={{ pathLength: 1 }} 
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
                          d="M0 60 Q 25 70, 50 50 T 100 55"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Metric 3: Overall Health */}
                  <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-semibold text-secondary uppercase tracking-widest">
                        {lang === 'EN' ? 'Overall Health' : 'समग्र स्वास्थ्य'}
                      </span>
                      <ShieldCheck className="w-6 h-6 text-primary fill-primary/10" />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                          <motion.path 
                            initial={{ strokeDasharray: "0, 100" }}
                            animate={{ strokeDasharray: `${score}, 100` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={colorClass}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="4"
                          />
                        </svg>
                        <span className="absolute font-semibold text-xl text-on-background">{score}</span>
                      </div>
                      <span className="text-sm text-on-surface-variant leading-relaxed">
                        {getTranslatedStanding(standing)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Report History */}
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-bright">
                    <h2 className="text-2xl font-semibold text-on-background">
                      {lang === 'EN' ? 'Recent Reports' : 'हालिया रिपोर्टें'}
                    </h2>
                    <Link href="/results" className="text-primary text-sm hover:underline font-bold">
                      {lang === 'EN' ? 'View All' : 'सभी देखें'}
                    </Link>
                  </div>
                  <div className="flex flex-col">
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
                      
                      let badgeClass = 'bg-primary-container/10 text-primary-container border-primary-container/20';
                      let statusText = lang === 'EN' ? 'Normal' : 'सामान्य';

                      if (repScoreAndStanding.standing === 'Attention Needed') {
                        badgeClass = 'bg-red-100 text-red-700 border-red-200';
                        statusText = lang === 'EN' ? 'Critical' : 'गंभीर';
                      } else if (repScoreAndStanding.standing === 'Action Recommended' || repScoreAndStanding.standing === 'Monitor Closely') {
                        badgeClass = 'bg-[#FFF4E5] text-[#933D0D] border-[#933D0D]/20';
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
                          className="px-6 py-4 border-b border-outline-variant/10 hover:bg-surface-container transition-colors flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-surface-container-low p-3 rounded-lg text-primary group-hover:scale-105 transition-transform">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-base text-on-background group-hover:text-primary transition-colors truncate max-w-[240px] sm:max-w-none" title={item.filename}>
                                {item.filename.replace('.pdf', '')}
                              </h3>
                              <p className="text-sm text-on-surface-variant">
                                {item.date} • {item.provider || (lang === 'EN' ? 'Arogya AI Clinical Partner' : 'आरोग्य एआई क्लिनिकल पार्टनर')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-mono text-sm px-3 py-1 rounded-full border ${badgeClass}`}>
                              {statusText}
                            </span>
                            <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Access Right Column */}
              <div className="md:col-span-4 flex flex-col gap-6">
                <Link href="/trends" className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 block">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                  <div className="flex items-center gap-3 mb-3 text-secondary">
                    <TrendingUp className="w-6 h-6" />
                    <h3 className="text-xl font-semibold">
                      {lang === 'EN' ? 'Trend Report' : 'रुझान रिपोर्ट'}
                    </h3>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4 font-medium leading-relaxed">
                    {lang === 'EN' ? 'Analyze your health markers over the last 6 months.' : 'पिछले 6 महीनों में अपने स्वास्थ्य मापदंडों का विश्लेषण करें।'}
                  </p>
                  <div className="flex items-center text-secondary font-mono text-sm font-bold group-hover:underline">
                    {lang === 'EN' ? 'Explore Trends' : 'रुझानों को देखें'}{' '}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link href="/assistant" className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 block">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-tertiary/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                  <div className="flex items-center gap-3 mb-3 text-tertiary">
                    <Lightbulb className="w-6 h-6 fill-tertiary/20" />
                    <h3 className="text-xl font-semibold">
                      {lang === 'EN' ? 'Health Tips' : 'स्वास्थ्य सुझाव'}
                    </h3>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4 font-medium leading-relaxed">
                    {lang === 'EN' ? 'Personalized insights based on your recent lipid profile.' : 'आपकी हालिया लिपिड प्रोफाइल के आधार पर व्यक्तिगत स्वास्थ्य सुझाव।'}
                  </p>
                  <div className="flex items-center text-tertiary font-mono text-sm font-bold group-hover:underline">
                    {lang === 'EN' ? 'Read Tips' : 'सुझाव पढ़ें'}{' '}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
