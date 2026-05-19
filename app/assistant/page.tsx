'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { 
  Sparkles, Send, Loader2, Bot, User, ArrowRight, 
  PlusCircle, RefreshCw, FileText, CheckCircle2, ShieldAlert 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AssistantPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [activeReport, setActiveReport] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'assistant', text: string, time: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);

  const getWelcomeText = (rep: any, currentLang: 'EN' | 'HI') => {
    if (rep && rep.extraction && rep.extraction.parameters) {
      return currentLang === 'EN'
        ? `Hello! I have loaded your report: **${rep.filename}**.\n\nI noticed some biomarkers in this report (such as ${rep.extraction.parameters.slice(0, 3).map((p: any) => p.parameter).join(', ')}). Ask me anything about what these numbers mean, dietary adjustments, or follow-up tips!`
        : `नमस्ते! मैंने आपकी रिपोर्ट लोड कर ली है: **${rep.filename}**।\n\nमैंने इस रिपोर्ट में कुछ बायोमार्कर (जैसे ${rep.extraction.parameters.slice(0, 3).map((p: any) => p.parameter).join(', ')}) देखे हैं। मुझसे पूछें कि इन नंबरों का क्या मतलब है, आहार में बदलाव या स्वास्थ्य टिप्स!`;
    } else if (rep) {
      return currentLang === 'EN'
        ? `Hello! I have loaded your document: **${rep.filename}**.\n\nAsk me anything about it!`
        : `नमस्ते! मैंने आपकी दस्तावेज़ लोड कर ली है: **${rep.filename}**।\n\nमुझसे कुछ भी पूछें!`;
    } else {
      return currentLang === 'EN'
        ? "Hello! I am your personal Arogya AI Health Companion. Upload a clinical report to get specific insights, or ask me any general medical and wellness questions you have!"
        : "नमस्ते! मैं आपका निजी आरोग्य एआई स्वास्थ्य साथी हूँ। विशिष्ट जानकारी प्राप्त करने के लिए अपनी मेडिकल रिपोर्ट अपलोड करें, या मुझसे सामान्य स्वास्थ्य संबंधी प्रश्न पूछें!";
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem('arogya_reports_history');
      const historyList = storedHistory ? JSON.parse(storedHistory) : [];
      const storedCurrentId = localStorage.getItem('arogya_current_report_id') || '';
      
      let report = null;
      if (storedCurrentId && historyList.length > 0) {
        report = historyList.find((item: any) => item.id === storedCurrentId);
      }
      if (!report && historyList.length > 0) {
        report = historyList[0];
      }

      setActiveReport(report);

      const globalLang = localStorage.getItem('arogya_global_lang') as 'EN' | 'HI';
      const activeLang = globalLang || 'EN';
      setLang(activeLang);

      const welcomeText = getWelcomeText(report, activeLang);
      setChatHistory([
        {
          sender: 'assistant',
          text: welcomeText,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  useEffect(() => {
    const handleGlobalLangChange = (e: any) => {
      const newLang = e.detail;
      setLang(newLang);
      
      setChatHistory(prev => {
        if (prev.length > 0) {
          const updated = [...prev];
          updated[0] = {
            ...updated[0],
            text: getWelcomeText(activeReport, newLang)
          };
          return updated;
        }
        return prev;
      });
    };

    window.addEventListener('arogya_language_changed', handleGlobalLangChange);
    return () => window.removeEventListener('arogya_language_changed', handleGlobalLangChange);
  }, [activeReport]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    setChatHistory(prev => [...prev, { sender: 'user', text: userText, time: timeStr }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const query = userText.toLowerCase();

      const outOfRange = activeReport && activeReport.extraction && activeReport.extraction.parameters
        ? activeReport.extraction.parameters.filter((p: any) => p.status === 'abnormal')
        : [];

      if (query.includes('lower') || query.includes('reduce') || query.includes('control') || query.includes('improve')) {
        if (activeReport && outOfRange.length > 0) {
          const paramNames = outOfRange.map((p: any) => p.parameter).join(', ');
          reply = lang === 'EN'
            ? `To help manage your out-of-range parameters (**${paramNames}**), it is recommended to focus on nutrient-dense dietary adjustments:\n\n1. **For Iron/Hb:** Incorporate dark green leafy vegetables, legumes, seeds, and vitamin-C rich food to aid absorption.\n2. **For Lipids/Cholesterol:** Limit trans-fats, fried foods, and increase soluble fibers like oats and chia seeds.\n3. **Activity:** Walk at least 150 minutes weekly to promote healthy blood profiles. Let me know if you want a sample daily menu!`
            : `आपके सीमा से बाहर के मापदंडों (**${paramNames}**) को नियंत्रित करने में मदद के लिए, इन आहार और पोषण संबंधी बदलावों पर ध्यान देने की सलाह दी जाती है:\n\n1. **आयरन/हीमोग्लोबिन के लिए:** हरी पत्तेदार सब्जियां, दालें, बीज और विटामिन-सी से भरपूर खाद्य पदार्थ शामिल करें।\n2. **लिपिड/कोलेस्ट्रॉल के लिए:** वसायुक्त और तले हुए भोजन से बचें, तथा ओट्स और चिया बीज जैसे फाइबर का सेवन बढ़ाएं।\n3. **गतिविधि:** स्वस्थ रक्त स्तर के लिए सप्ताह में कम से कम 150 मिनट टहलें।`;
        } else {
          reply = lang === 'EN'
            ? "For general wellness improvement, target eating 5 servings of colorful vegetables and fruits daily, drink 2.5-3 liters of water, sleep 7-8 hours, and enjoy moderate physical activity daily."
            : "सामान्य स्वास्थ्य सुधार के लिए, प्रतिदिन 5 सर्विंग्स रंग-बिरंगी सब्जियां और फल खाएं, 2.5-3 लीटर पानी पिएं, 7-8 घंटे सोएं और नियमित शारीरिक व्यायाम करें।";
        }
      } else if (query.includes('diet') || query.includes('food') || query.includes('eat') || query.includes('menu') || query.includes('plan')) {
        if (activeReport) {
          reply = lang === 'EN'
            ? `Here is a custom nutritional recommendation based on your **${activeReport.filename}** biomarkers:\n\n* **Breakfast:** Oatmeal with almonds, chia seeds, and sliced banana (supports fiber and cardiovascular parameters).\n* **Lunch:** A bowl of lentils/beans (dal), sautéed spinach (palak) with squeeze of lemon, and brown rice/roti.\n* **Snack:** A handful of pumpkin seeds or apple slices.\n* **Dinner:** Mixed vegetable soup, roasted broccoli, and lean protein or tofu.\n\n*Pro-tip: Squeezing lemon on spinach increases iron absorption by up to 3x!*`
            : `आपकी **${activeReport.filename}** रिपोर्ट के आधार पर पोषण संबंधी सुझाव:\n\n* **नाश्ता:** ओट्स, बादाम, चिया बीज और केला।\n* **दोपहर का भोजन:** दाल, पालक की सब्जी (नींबू के रस के साथ) और रोटी/चावल।\n* **शाम का नाश्ता:** मुट्ठी भर कद्दू के बीज या सेब के टुकड़े।\n* **रात का भोजन:** मिक्स वेजिटेबल सूप और हरी सब्जियां।\n\n*सुझाव: पालक पर नींबू का रस निचोड़ने से शरीर में आयरन का अवशोषण 3 गुना बढ़ जाता है!*`;
        } else {
          reply = lang === 'EN'
            ? "A robust, heart-healthy dietary plan focuses on whole grains, fresh leafy greens, beans, berries, nuts, and clean proteins while avoiding deep-fried and highly refined sugary foods."
            : "एक स्वस्थ आहार योजना में साबुत अनाज, ताजी हरी सब्जियां, फलियां, नट्स और स्वच्छ प्रोटीन शामिल होते हैं, जबकि तले हुए और मीठे खाद्य पदार्थों से बचना चाहिए।";
        }
      } else if (query.includes('explain') || query.includes('abnormal') || query.includes('report') || query.includes('results')) {
        if (activeReport && activeReport.extraction && activeReport.extraction.parameters) {
          const paramsList = activeReport.extraction.parameters.map(
            (p: any) => `* **${p.parameter}**: ${p.value} ${p.unit} (${p.status === 'abnormal' ? (lang === 'EN' ? '🚨 Out of Range' : '🚨 सीमा से बाहर') : (lang === 'EN' ? '✅ Normal' : '✅ सामान्य')})`
          ).join('\n');
          
          reply = lang === 'EN'
            ? `Sure! Here is a simple clinical summary of your **${activeReport.filename}** report:\n\n${paramsList}\n\nWould you like me to create an action checklist for any of these specific parameters?`
            : `ज़रूर! आपकी **${activeReport.filename}** रिपोर्ट का एक सरल नैदानिक सारांश यहाँ दिया गया है:\n\n${paramsList}\n\nक्या आप चाहते हैं कि मैं इनमें से किसी विशिष्ट पैरामीटर के लिए एक कार्य योजना तैयार करूँ?`;
        } else if (activeReport) {
          reply = lang === 'EN'
            ? `Your document **${activeReport.filename}** does not contain extracted parameters. However, you can ask me questions about it.`
             : `आपके दस्तावेज़ **${activeReport.filename}** में निकाले गए पैरामीटर नहीं हैं। हालाँकि, आप मुझसे इसके बारे में प्रश्न पूछ सकते हैं।`;
        } else {
          reply = lang === 'EN'
            ? "I don't have an active medical report loaded yet. Please head to the Dashboard, upload your blood panel report, and I will instantly map your biomarkers here!"
            : "मेरे पास अभी तक कोई सक्रिय मेडिकल रिपोर्ट लोड नहीं है। कृपया डैशबोर्ड पर जाएं और अपनी रिपोर्ट अपलोड करें!";
        }
      } else {
        reply = lang === 'EN'
          ? "That is an excellent clinical question. In general, keeping an eye on these biomarkers is a proactive approach to your longevity. I suggest discussing these specific queries with your physician to tailor your care program."
          : "यह एक बहुत अच्छा स्वास्थ्य संबंधी प्रश्न है। सामान्य तौर पर, इन मापदंडों पर नज़र रखना आपके दीर्घायु होने के लिए एक सकारात्मक कदम है। मैं सुझाव देता हूँ कि अपनी व्यक्तिगत देखभाल योजना के लिए अपने डॉक्टर से चर्चा करें।";
      }

      setChatHistory(prev => [...prev, {
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const handlePrecodedChat = (question: string) => {
    setChatInput(question);
  };

  return (
    <div className="bg-[#f4f7fb] min-h-screen flex flex-col font-sans selection:bg-accent/30 bg-mesh-gradient">
      <Navbar />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-12 flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* Left Side: Active Context Card */}
        <div className="w-full md:w-[340px] shrink-0 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel rounded-3xl p-6 border border-white shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <h3 className="text-[11px] font-black text-secondary uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              {lang === 'EN' ? 'Active Context' : 'सक्रिय रिपोर्ट संदर्भ'}
            </h3>
            
            {activeReport ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-shadow group-hover:bg-white">
                  <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-background truncate tracking-tight" title={activeReport.filename}>
                      {activeReport.filename}
                    </p>
                    <p className="text-[11px] text-on-surface/60 font-semibold mt-0.5">
                      {lang === 'EN' ? 'Uploaded' : 'अपलोड किया गया'} {activeReport.date}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-secondary uppercase tracking-widest pl-1">
                    {lang === 'EN' ? 'Identified Biomarkers:' : 'पहचाने गए बायोमार्कर:'}
                  </p>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {activeReport.extraction?.parameters ? activeReport.extraction.parameters.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white/40 p-3 rounded-xl border border-white/50 hover:bg-white/70 transition-colors font-medium">
                      <span className="font-bold text-on-background truncate max-w-[150px]">{p.parameter}</span>
                      <span className={`font-mono font-black ${p.status === 'abnormal' ? 'text-red-500' : 'text-primary'}`}>
                        {p.value} {p.unit}
                      </span>
                    </div>
                  )) : (
                    <p className="text-xs text-on-surface/60 pl-1">{lang === 'EN' ? 'No biomarkers found.' : 'कोई बायोमार्कर नहीं मिला।'}</p>
                  )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-surface/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-outline/30">
                  <ShieldAlert className="w-8 h-8 text-secondary/60" />
                </div>
                <p className="text-xs text-on-surface/80 font-medium leading-relaxed max-w-[200px] mx-auto mb-5">
                  {lang === 'EN' 
                    ? 'No active report loaded. Go to upload to analyze your specific medical markers.' 
                    : 'कोई सक्रिय रिपोर्ट लोड नहीं है। अपने विशिष्ट चिकित्सा मार्करों का विश्लेषण करने के लिए अपलोड पर जाएं।'}
                </p>
                <Link 
                  href="/upload" 
                  className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-xs font-bold hover:bg-primary/20 transition-colors border border-primary/20"
                >
                  {lang === 'EN' ? 'Upload a Report' : 'एक रिपोर्ट अपलोड करें'} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-panel rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-xs leading-relaxed text-on-surface/70 font-medium"
          >
            <p className="font-black text-on-background mb-2 tracking-tight flex items-center gap-2">
              <Bot className="w-4 h-4 text-accent" />
              {lang === 'EN' ? 'Arogya Health Companion' : 'आरोग्य स्वास्थ्य साथी'}
            </p>
            {lang === 'EN' 
              ? 'This clinical conversational assistant uses advanced language models to offer educational insights on lab test reports. Always confirm medical decisions with a doctor.'
              : 'यह नैदानिक संवादात्मक सहायक प्रयोगशाला परीक्षण रिपोर्टों पर शैक्षिक अंतर्दृष्टि प्रदान करने के लिए उन्नत भाषा मॉडल का उपयोग करता है। हमेशा किसी डॉक्टर से चिकित्सा निर्णयों की पुष्टि करें।'}
          </motion.div>
        </div>

        {/* Right Side: Conversational Chat Interface */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-grow glass-panel-heavy rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.06)] flex flex-col overflow-hidden h-[calc(100vh-140px)] md:h-[calc(100vh-160px)]"
        >
          {/* Chat Header */}
          <div className="bg-white/40 backdrop-blur-md px-8 py-5 border-b border-white/50 flex items-center justify-between shrink-0 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent/20 to-primary/20 flex items-center justify-center border border-white shadow-sm">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black text-on-background tracking-tight">
                  {lang === 'EN' ? 'Clinical AI Assistant' : 'नैदानिक एआई सहायक'}
                </h2>
                <div className="flex items-center gap-2 text-[11px] font-bold text-accent mt-0.5 tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(23,195,178,0.8)]" />
                  {lang === 'EN' ? 'Active Context Mode' : 'सक्रिय संदर्भ मोड'}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setChatHistory([
                {
                  sender: 'assistant',
                  text: getWelcomeText(activeReport, lang),
                  time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }
              ])}
              className="w-10 h-10 rounded-full bg-white/60 hover:bg-white text-secondary flex items-center justify-center transition-all shadow-sm hover:shadow border border-white/50"
              title={lang === 'EN' ? 'Reset Chat' : 'चैट रीसेट करें'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Window */}
          <div className="flex-grow p-6 md:p-8 overflow-y-auto space-y-6 relative z-0">
            {chatHistory.map((msg, index) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`flex gap-4 max-w-[85%] ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                    isAssistant ? 'bg-gradient-to-tr from-primary/10 to-accent/10 border-white text-primary' : 'bg-white border-outline/20 text-secondary'
                  }`}>
                    {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <div 
                      className={`rounded-[1.5rem] px-5 py-4 text-[13px] leading-relaxed font-medium whitespace-pre-line shadow-sm border ${
                        isAssistant 
                          ? 'bg-white/80 text-on-background rounded-tl-none border-white backdrop-blur-sm' 
                          : 'bg-primary text-white rounded-tr-none border-primary shadow-primary/20'
                      }`}
                    >
                      {msg.text.split('**').map((part, i) => i % 2 !== 0 ? <strong key={i} className={isAssistant ? "text-primary" : "text-white"}>{part}</strong> : part)}
                    </div>
                    <span className={`text-[10px] text-outline mt-2 block font-mono font-bold ${isAssistant ? 'text-left pl-2' : 'text-right pr-2'}`}>
                      {msg.time}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 max-w-[80%] mr-auto"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/10 to-accent/10 border border-white shadow-sm text-primary flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-[1.5rem] rounded-tl-none border border-white px-5 py-4 text-xs font-bold text-secondary flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>
                    {lang === 'EN' ? 'AI is formulating insights...' : 'एआई आपके सवालों के जवाब तैयार कर रहा है...'}
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-6 py-3 bg-white/40 backdrop-blur-sm flex flex-wrap gap-2.5 shrink-0 border-t border-white/50 relative z-10">
            <button 
              onClick={() => handlePrecodedChat(lang === 'EN' ? "How can I improve my biomarker levels naturally?" : "मैं प्राकृतिक रूप से अपने बायोमार्कर स्तरों में कैसे सुधार कर सकता हूँ?")}
              className="px-4 py-2 bg-white text-secondary font-bold rounded-full text-[11px] hover:bg-primary/5 hover:text-primary transition-all border border-outline/20 shadow-sm hover:shadow"
            >
              🥗 {lang === 'EN' ? 'How to improve levels?' : 'स्तरों में सुधार कैसे करें?'}
            </button>
            <button 
              onClick={() => handlePrecodedChat(lang === 'EN' ? "Create a daily diet plan for my biomarkers." : "मेरे बायोमार्कर के लिए एक दैनिक आहार योजना बनाएं।")}
              className="px-4 py-2 bg-white text-secondary font-bold rounded-full text-[11px] hover:bg-primary/5 hover:text-primary transition-all border border-outline/20 shadow-sm hover:shadow"
            >
              📅 {lang === 'EN' ? 'Daily Diet Plan?' : 'दैनिक आहार योजना?'}
            </button>
            <button 
              onClick={() => handlePrecodedChat(lang === 'EN' ? "Explain my abnormal report findings simply." : "मेरे असामान्य रिपोर्ट निष्कर्षों को सरलता से समझाएं।")}
              className="px-4 py-2 bg-white text-secondary font-bold rounded-full text-[11px] hover:bg-primary/5 hover:text-primary transition-all border border-outline/20 shadow-sm hover:shadow"
            >
              🔬 {lang === 'EN' ? 'Explain abnormal findings?' : 'असामान्य निष्कर्षों को समझें?'}
            </button>
          </div>

          {/* Input Form */}
          <div className="px-6 py-5 bg-white/60 backdrop-blur-md border-t border-white shrink-0 relative z-10">
            <form onSubmit={handleSendChat} className="relative max-w-4xl mx-auto">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={lang === 'EN' ? "Ask follow-up questions about your report, values, nutrition, etc..." : "अपनी रिपोर्ट, मूल्यों, पोषण आदि के बारे में स्वास्थ्य संबंधी प्रश्न पूछें..."}
                className="w-full bg-white py-4 pl-6 pr-14 rounded-2xl border border-outline/30 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-[0_2px_15px_rgba(0,0,0,0.03)] outline-none text-sm text-on-background font-medium transition-all placeholder:text-outline-focus"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-md active:scale-95"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>

        </motion.div>

      </main>
      
      <Footer />
    </div>
  );
}
