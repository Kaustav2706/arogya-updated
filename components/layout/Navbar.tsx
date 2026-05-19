'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Languages, Bell, UploadCloud, CheckCircle, Info, Activity } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Report Analysis Active',
      desc: 'Bilingual AI interpretations are fully functional in English & Hindi.',
      time: 'Just now'
    },
    {
      id: 2,
      type: 'info',
      title: 'Language Switcher Ready',
      desc: 'Toggle between EN and HI inside your dashboard seamlessly.',
      time: '2 mins ago'
    }
  ]);

  const [currentLang, setCurrentLang] = useState<'EN' | 'HI'>('EN');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const globalLang = localStorage.getItem('arogya_global_lang') as 'EN' | 'HI';
      if (globalLang) {
        setCurrentLang(globalLang);
      }
    }
    const handleGlobalLangChange = (e: any) => {
      setCurrentLang(e.detail);
    };

    window.addEventListener('arogya_language_changed', handleGlobalLangChange);
    return () => window.removeEventListener('arogya_language_changed', handleGlobalLangChange);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setHasUnread(false);
    }
  };

  const handleToggleLanguage = () => {
    const nextLang = currentLang === 'EN' ? 'HI' : 'EN';
    setCurrentLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arogya_global_lang', nextLang);
      window.dispatchEvent(new CustomEvent('arogya_language_changed', { detail: nextLang }));
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/results', label: 'My Reports' },
    { href: '/trends', label: 'Trends' },
    { href: '/assistant', label: 'AI Assistant' }
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_30px_rgb(0,0,0,0.03)]">
      <div className="flex justify-between items-center w-full px-6 lg:px-8 max-w-7xl mx-auto h-20">
        
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-[22px] tracking-tight text-on-background group-hover:text-primary transition-colors">
              Arogya<span className="text-primary font-black">AI</span>
            </span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="hidden md:flex gap-1 items-center flex-1 ml-12 bg-surface/50 backdrop-blur-md rounded-2xl p-1.5 border border-white/60 shadow-sm w-fit">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive ? 'text-primary' : 'text-on-surface hover:text-on-background hover:bg-white/50'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="nav-pill" 
                    className="absolute inset-0 bg-white shadow-sm rounded-xl -z-10 border border-outline/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="flex items-center gap-3 relative">
          
          {/* Language Switcher */}
          <button 
            suppressHydrationWarning
            onClick={handleToggleLanguage}
            className="flex items-center justify-center p-2.5 rounded-xl border border-outline/50 bg-white hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all active:scale-95 group text-on-surface font-semibold shadow-sm"
            title="Change Language"
          >
            <Languages className="w-4 h-4 mr-1.5 group-hover:text-primary transition-colors" />
            <span className="text-xs uppercase">{mounted ? currentLang : 'EN'}</span>
          </button>
          
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleNotifications}
              className={`p-2.5 rounded-xl border ${hasUnread ? 'bg-accent/5 border-accent/20 text-accent' : 'bg-white border-outline/50 text-on-surface hover:bg-surface'} transition-all active:scale-95 relative shadow-sm`}
            >
              <Bell className="w-4 h-4" />
              {hasUnread && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", duration: 0.4 }}
                  className="absolute right-0 mt-3 w-80 glass-panel-heavy rounded-2xl py-3 z-50 overflow-hidden transform origin-top-right border border-white"
                >
                  <div className="px-5 py-3 border-b border-outline/30 flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-on-background">Notifications</span>
                    <span className="text-[10px] text-accent font-bold bg-accent/10 px-2 py-0.5 rounded-md uppercase">Active</span>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-1 px-2">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className="px-3 py-3 rounded-xl hover:bg-white transition-colors flex gap-3 cursor-pointer mb-1 shadow-sm border border-transparent hover:border-outline/30"
                      >
                        <div className="shrink-0 mt-0.5">
                          {notif.type === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Info className="w-4 h-4 text-accent" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-on-background leading-tight">{notif.title}</h4>
                          <p className="text-xs text-on-surface/80 leading-relaxed mt-1 font-medium">{notif.desc}</p>
                          <span className="text-[10px] text-outline-focus mt-1.5 block font-mono font-medium">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upload CTA */}
          <Link href="/upload" className="bg-on-background text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary transition-colors hover:shadow-lg active:scale-95 flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Upload
          </Link>
        </div>
      </div>
    </header>
  );
}
