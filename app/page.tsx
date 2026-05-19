'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BadgeCheck, UploadCloud, Activity, ArrowRight, HeartPulse, ShieldCheck, Zap } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function LandingPage() {
  const router = useRouter();

  const handleViewDemo = () => {
    // Navigate directly to the isolated static demo dashboard
    router.push('/demo');
  };

  return (
    <div className="bg-mesh-gradient min-h-screen flex flex-col selection:bg-accent/30">
      <Navbar />
      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-32 pb-40 px-6 lg:px-8 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
          {/* Enhanced Background Blurs for Depth */}
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-primary-light/20 rounded-full blur-[100px] -z-10 mix-blend-multiply" />
          <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-accent-light/20 rounded-full blur-[100px] -z-10 mix-blend-multiply" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-secondary-light/10 rounded-full blur-[120px] -z-10" />
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Hero Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-8 z-10 lg:col-span-6 pt-10"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 glass-panel rounded-full px-4 py-2 w-fit"
              >
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs text-on-surface font-semibold tracking-wide uppercase">
                  Next-Gen Health Intelligence
                </span>
              </motion.div>
              
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black text-on-background leading-[1.05] tracking-tighter">
                Your Health, <br />
                <span className="text-gradient">Decoded.</span>
              </h1>
              
              <p className="text-xl text-on-surface/80 max-w-lg font-medium leading-relaxed">
                Turn confusing medical reports into clear, actionable insights in seconds. Understand your vitals in plain English & Hindi.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/upload" className="group relative overflow-hidden bg-primary text-on-primary font-semibold px-8 py-4 rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-[0_8px_30px_rgb(13,148,136,0.3)] flex items-center justify-center gap-2">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <UploadCloud className="w-5 h-5 relative z-10 group-hover:-translate-y-0.5 transition-transform" />
                  <span className="relative z-10">Upload Report</span>
                </Link>
                <button 
                  onClick={handleViewDemo}
                  className="group bg-surface/50 backdrop-blur-md text-on-surface font-semibold px-8 py-4 rounded-2xl border border-outline/50 hover:bg-surface transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg"
                >
                  View Live Demo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 pt-8 border-t border-outline/40">
                <div className="flex -space-x-3">
                  <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmoKsLbaG2CGdm29-LUW4Yr0xZAOLULHHXOQpDauALPg4uErcHgZu2cBkDXXfY-0cBYNfU9OGh3NejQqCg91X55ArdsiYzSugpvOlUK8T30bKdrwGIyA1rggfCggEDpJT95FXuAvhhfsXbaBxVSIrbNJhxSaKAj6SybVP0aNB9oGB_eDHsrqwUIxHN9TqNlCLQ43MVBsAJqQT-AniezRkEVTt6aenVsvDMFKkeLwlRD_4nt1UtmKObPBkdTmatR3Hgq0P55617lot1" alt="User" width={40} height={40} className="rounded-full border-2 border-white object-cover h-10 w-10 shadow-sm" />
                  <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2IP38TH50FmnWzEFt0Eg3Onwm9tZXxTkrAs0cAuL7gRzy7QnjUn1VlXDMSc0i0bLIJmn6OnP9hg1WpDLmrzfjWQDgTHga12DWeuGnTdH0TOGL6wjJA6qrBlr0ry67htZt61y50h5J1_VKTtzk3aHzwnzp4J1GrVuLxaorcnOM8jM9VRqSeX9OW52XCyckP6Qn12I49fiOHl917_i4uYGvVJhL_rWqNaZiCnNhjR_QgPs2ZkhgRw1kdmtrvRmzTm2uum22WlEStLGF" alt="User" width={40} height={40} className="rounded-full border-2 border-white object-cover h-10 w-10 shadow-sm" />
                  <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZBxcF6nufShbyXXVdnS9NQUVkXmumDPaAFzeWctD2K5DyoA2x-tU4jjsOEgqo1Qa5YCc5Gn-r80kc1MrDPNz-tR3ndhXazmiPZNq3GlpMFsO6oozbCFjcSJf-0vpslITkOXwrACCqdRmTDtLVWQMBU8KKrndesXRaZS9vmTDAU2uNdJ9cRDOJ0fACxR4pUgd8jBmGq0Ncrbdt6pSEKcfBUwj47nImxmQ9h2I8qRgpaWyXTin-wo1wvEm2af4vznfOO8XD-q3bzA2a" alt="User" width={40} height={40} className="rounded-full border-2 border-white object-cover h-10 w-10 shadow-sm" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm z-10">
                    +10k
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex text-amber-400 text-sm">
                    ★★★★★
                  </div>
                  <span className="text-sm text-on-surface font-medium">Trusted by families nationwide</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual UI Component */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="relative z-10 lg:col-span-6 perspective-1000"
            >
              <div className="glass-panel-heavy rounded-3xl p-8 w-full shadow-[0_20px_50px_rgb(0,0,0,0.1)] relative border border-white/60 transform rotate-1 hover:rotate-0 transition-transform duration-500 will-change-transform">
                
                {/* Decorative floating elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-outline/30 flex items-center gap-3"
                >
                  <div className="bg-accent/10 p-2 rounded-full">
                    <Activity className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs text-on-surface/60 font-semibold mb-0.5">Health Score</div>
                    <div className="text-lg font-black text-on-background leading-none">82/100</div>
                  </div>
                </motion.div>

                <div className="flex items-center justify-between border-b border-outline/40 pb-6 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-on-background tracking-tight">CBC Blood Panel</h3>
                    <p className="text-sm text-on-surface/70 mt-1 font-medium">Analyzed successfully • Just now</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-[5px] border-surface relative flex items-center justify-center bg-primary/10 shadow-inner">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="27" cy="27" r="24" stroke="currentColor" strokeWidth="6" fill="none" className="text-black/5" />
                      <motion.circle 
                        initial={{ strokeDasharray: "150", strokeDashoffset: "150" }}
                        animate={{ strokeDashoffset: "30" }}
                        transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                        className="text-primary" cx="27" cy="27" r="24" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="150" strokeLinecap="round" 
                      />
                    </svg>
                    <BadgeCheck className="w-6 h-6 text-primary absolute" />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Insight Card 1 */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/80 rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <HeartPulse className="w-4 h-4 text-red-500" />
                        </div>
                        <span className="font-semibold text-on-background text-lg">Hemoglobin (Hb)</span>
                      </div>
                      <span className="font-mono text-base text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md">11.2 g/dL</span>
                    </div>
                    <p className="text-sm text-on-surface/80 font-medium pl-11 mb-3">Slightly low. This indicates mild anemia, which can cause fatigue and weakness.</p>
                    <div className="ml-11 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                      <span className="text-[13px] text-red-800 font-medium">हिन्दी: हीमोग्लोबिन थोड़ा कम है। इससे थकान हो सकती है।</span>
                    </div>
                  </motion.div>

                  {/* Insight Card 2 */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/80 rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-on-background text-lg">Vitamin D</span>
                      </div>
                      <span className="font-mono text-base text-primary font-bold bg-primary/5 px-2 py-1 rounded-md">34 ng/mL</span>
                    </div>
                    <p className="text-sm text-on-surface/80 font-medium pl-11 mt-2">Optimal range. Keep up the good work!</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section with Glassmorphism */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl -z-10 border-y border-white/50" />
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black text-on-background tracking-tight mb-4">The Healthcare <span className="text-accent">Gap</span></h2>
              <p className="text-lg text-on-surface/70 max-w-2xl mx-auto font-medium">Medical jargon creates an invisible barrier between you and your health.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                whileHover={{ y: -8 }} 
                className="glass-panel p-10 rounded-[2rem] flex flex-col items-center text-center relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                <span className="text-6xl font-black text-primary mb-6 tracking-tighter drop-shadow-sm">70%</span>
                <p className="text-lg text-on-surface font-medium">of patients don&apos;t fully understand their blood reports post-consultation.</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -8 }} 
                className="glass-panel p-10 rounded-[2rem] flex flex-col items-center text-center relative overflow-hidden group mt-0 md:mt-8"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors" />
                <span className="text-6xl font-black text-accent mb-6 tracking-tighter drop-shadow-sm">3x</span>
                <p className="text-lg text-on-surface font-medium">higher anxiety reported while waiting for a doctor&apos;s mere interpretation.</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -8 }} 
                className="glass-panel p-10 rounded-[2rem] flex flex-col items-center text-center relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors" />
                <span className="text-6xl font-black text-secondary mb-6 tracking-tighter drop-shadow-sm">#1</span>
                <p className="text-lg text-on-surface font-medium">cause of missed early medical interventions is lack of patient literacy.</p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
