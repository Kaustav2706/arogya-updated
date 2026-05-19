'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CloudUpload, Cpu, CheckCircle2, RefreshCw,
  Hourglass, FileScan, FileText, ArrowUp, AlertCircle, Trash2, Zap, Activity
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'error' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('AI is preparing to process your report...');

  const mockExtractedParams = [
    { name: 'Hemoglobin (Hb)', val: '14.2 g/dL', range: 'Ref: 13.0 - 17.0', status: 'Normal', showAt: 40 },
    { name: 'LDL Cholesterol', val: '165 mg/dL', range: 'Ref: < 100', status: 'High', isHigh: true, showAt: 70 },
    { name: 'Fasting Glucose', val: '92 mg/dL', range: 'Ref: 70 - 99', status: 'Normal', showAt: 90 }
  ];

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Unsupported file type. Please upload a standard PDF or an image (JPG/PNG/WEBP).');
      setUploadState('error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { 
      setErrorMsg('File is too large. Maximum allowed size is 10MB.');
      setUploadState('error');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null); 
    }

    setUploadState('processing');
    setProgress(5);
    setStatusMessage('Uploading and extracting text from report...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setProgress(15);
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to extract medical parameters from this report. Ensure it is a clear lab report.');
      }

      const extractionData = await uploadRes.json();

      if (!extractionData.success || !extractionData.parameters || extractionData.parameters.length === 0) {
        throw new Error('No medical parameters could be recognized in the document. Please check the scan quality.');
      }

      setProgress(50);
      setStatusMessage('Extracting parameters & generating English explanation...');

      const explainResEn = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameters: extractionData.parameters,
          language: 'english'
        })
      });

      if (!explainResEn.ok) {
        const errorData = await explainResEn.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate English plain-language explanations.');
      }

      const explainDataEn = await explainResEn.json();

      setProgress(75);
      setStatusMessage('Translating explanations and next steps into Hindi...');

      const explainResHi = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameters: extractionData.parameters,
          language: 'hindi'
        })
      });

      if (!explainResHi.ok) {
        const errorData = await explainResHi.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate Hindi explanations.');
      }

      const explainDataHi = await explainResHi.json();

      setProgress(100);
      setStatusMessage('Saving to report history...');

      const storedHistory = localStorage.getItem('arogya_reports_history');
      let historyArray = storedHistory ? JSON.parse(storedHistory) : [];

      const newItem = {
        id: Date.now().toString(),
        filename: file.name,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        extraction: extractionData,
        explainEn: explainDataEn,
        explainHi: explainDataHi
      };

      historyArray = [newItem, ...historyArray].slice(0, 5);

      localStorage.setItem('arogya_reports_history', JSON.stringify(historyArray));
      localStorage.setItem('arogya_current_report_id', newItem.id);

      localStorage.setItem('arogya_extraction', JSON.stringify(extractionData));
      localStorage.setItem('arogya_explain_en', JSON.stringify(explainDataEn));
      localStorage.setItem('arogya_explain_hi', JSON.stringify(explainDataHi));
      localStorage.setItem('arogya_uploaded_filename', file.name);

      setUploadState('done');

      setTimeout(() => {
        router.push('/results');
      }, 800);

    } catch (err: any) {
      // Error logging removed to prevent circular structure serialization by platform logger
      setErrorMsg(err?.message || 'An unexpected error occurred during processing.');
      setUploadState('error');
    }
  };

  const simulateDemoError = (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMsg('Demo: Simulated file validation failure. Please try another file.');
    setUploadState('error');
  };

  const resetUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadState('idle');
    setProgress(0);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="bg-[#f4f7fb] min-h-screen flex flex-col font-sans selection:bg-accent/30 bg-mesh-gradient">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-12 flex flex-col">

        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl text-on-background font-black tracking-tight mb-2 flex items-center gap-3">
              Analyze Report
              <div className="w-8 h-8 bg-gradient-to-tr from-accent to-primary rounded-full blur-sm opacity-60 animate-pulse" />
            </h1>
            <p className="text-lg text-on-surface/80 font-medium max-w-2xl">
              Upload your lab results or clinical documents for instant AI extraction, health scoring, and plain-language interpretation.
            </p>
          </motion.div>
          <button
            onClick={simulateDemoError}
            className="text-xs text-on-surface hover:text-red-500 hover:border-red-500/40 shadow-sm transition-colors border border-outline/50 rounded-full px-4 py-1.5 bg-white/70 backdrop-blur-md font-bold uppercase tracking-wider"
          >
            Demo: Fail
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,image/jpeg,image/png,image/webp"
          className="hidden"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">

          {/* Left Column: Upload & Processing Status */}
          <div className="lg:col-span-5 flex flex-col gap-8 relative z-10">
            <AnimatePresence mode="popLayout">
              {uploadState === 'idle' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass-panel-heavy rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border p-8 transition-all duration-300 relative overflow-hidden group ${
                    isHovering ? 'border-primary bg-primary/5 shadow-[0_8px_32px_rgba(13,148,136,0.15)] scale-[1.02]' : 'border-white'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                  onDragLeave={() => setIsHovering(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsHovering(false);
                    if (e.dataTransfer.files?.[0]) {
                      processFile(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <div
                    className="rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/60 hover:border-primary/40 transition-colors min-h-[320px] relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white">
                      <CloudUpload className="text-primary w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-on-background mb-2 tracking-tight">Drop Report Here</h3>
                    <p className="text-sm text-on-surface/70 font-medium mb-8">PDF, JPG, PNG up to <span className="text-primary font-bold">10MB</span></p>

                    <button className="bg-white border border-outline/50 shadow-sm text-on-background font-bold text-sm px-8 py-3 rounded-xl hover:bg-surface transition-all group-hover:-translate-y-1">
                      Browse Files
                    </button>
                  </div>
                </motion.div>
              )}

              {uploadState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[2rem] border border-red-100 shadow-[0_8px_30px_rgba(239,68,68,0.1)] p-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-red-100 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3 opacity-60" />
                  <div className="flex flex-col items-center justify-center text-center py-6 relative z-10">
                    <div className="w-20 h-20 rounded-[2rem] bg-red-50 flex items-center justify-center mb-6 border border-red-100 rotate-6 shadow-sm">
                      <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black text-on-background mb-3 tracking-tight">Analysis Failed</h3>
                    <p className="text-sm text-on-surface/80 font-medium mb-8 max-w-xs leading-relaxed">
                      {errorMsg}
                    </p>
                    <button onClick={resetUpload} className="bg-white border border-outline/50 shadow-sm px-8 py-3 rounded-xl text-on-background font-bold hover:bg-surface transition-all hover:-translate-y-0.5 text-sm">
                      Try Again
                    </button>
                  </div>
                </motion.div>
              )}

              {(uploadState === 'processing' || uploadState === 'done') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel-heavy rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-primary/20 p-8 relative overflow-hidden"
                >
                  {/* Progress Bar Container */}
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-surface">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${progress}%` }}
                      transition={{ ease: "easeOut" }}
                    />
                  </div>

                  <div className="flex items-start gap-5 mt-1">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-primary/10 relative overflow-hidden">
                      {uploadState === 'done' ? (
                        <CheckCircle2 className="text-primary w-7 h-7" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}>
                            <Zap className="text-primary w-6 h-6" />
                          </motion.div>
                        </>
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-2 mt-1">
                        <h3 className="text-xl font-bold text-on-background tracking-tight">
                          {uploadState === 'done' ? 'Analysis Complete' : 'AI Processing'}
                        </h3>
                        <span className="font-mono text-sm font-black text-primary">{Math.round(progress)}%</span>
                      </div>

                      <p className="text-sm text-on-surface/70 font-medium mb-6 min-h-[40px]">
                        {statusMessage}
                      </p>

                      {selectedFile && (
                        <div className="bg-white/60 rounded-xl p-3 mb-6 text-xs flex items-center justify-between border border-white/80 shadow-sm">
                          <span className="font-bold text-on-background truncate max-w-[200px]">{selectedFile.name}</span>
                          <span className="text-outline-focus font-mono font-semibold">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${progress > 15 ? 'bg-primary/10 text-primary' : 'bg-surface text-outline'}`}>
                            {progress > 15 ? <CheckCircle2 className="w-4 h-4" /> : <Hourglass className="w-4 h-4" />}
                          </div>
                          <span className={`text-sm font-semibold tracking-tight ${progress > 15 ? 'text-on-background' : 'text-on-surface/50'}`}>Document scanned & parsed</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${progress > 50 ? 'bg-primary/10 text-primary' : (progress > 15 ? 'bg-accent/10 text-accent animate-pulse' : 'bg-surface text-outline')}`}>
                            {progress > 50 ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className={`w-4 h-4 ${progress > 15 ? 'animate-spin' : ''}`} />}
                          </div>
                          <span className={`text-sm font-semibold tracking-tight ${progress > 50 ? 'text-on-background' : (progress > 15 ? 'text-on-surface' : 'text-on-surface/50')}`}>Extracting medical markers</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${uploadState === 'done' ? 'bg-primary/10 text-primary' : (progress > 50 ? 'bg-secondary/10 text-secondary animate-pulse' : 'bg-surface text-outline')}`}>
                            {uploadState === 'done' ? <CheckCircle2 className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                          </div>
                          <span className={`text-sm font-semibold tracking-tight ${uploadState === 'done' ? 'text-on-background' : (progress > 50 ? 'text-on-surface' : 'text-on-surface/50')}`}>Generating bilingual insight</span>
                        </div>
                      </div>

                      {uploadState === 'processing' && (
                        <div className="mt-8 pt-5 border-t border-outline/20">
                          <button onClick={resetUpload} className="text-xs flex items-center gap-2 text-red-500 hover:text-red-700 font-bold transition-colors bg-red-50 px-3 py-1.5 rounded-lg active:scale-95">
                            <Trash2 className="w-3.5 h-3.5" /> Cancel Analysis
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Split Screen Extraction Preview */}
          <div className="lg:col-span-7 h-full relative z-10">
            <div className="glass-panel-heavy rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white overflow-hidden h-full min-h-[600px] flex flex-col">

              <div className="px-6 py-5 border-b border-white/50 bg-white/40 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <FileScan className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-on-background tracking-tight">Live Preview</h2>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-wider">Extraction Engine</span>
                </div>
              </div>

              <div className="flex-grow flex relative overflow-hidden bg-white/30">

                {/* Image Preview Panel */}
                <div className="w-1/2 h-full relative border-r border-white/50 bg-[#fafcff] flex items-center justify-center overflow-hidden">
                  {uploadState === 'processing' && (
                    <motion.div
                      className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                      <motion.div
                        className="absolute inset-x-0 h-[2px] bg-primary shadow-[0_0_15px_rgba(13,148,136,0.6)]"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                  )}

                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Document Preview"
                      fill
                      className="object-contain p-4"
                    />
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <div className="w-24 h-24 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-outline/30">
                        <FileText className="w-10 h-10 text-primary" />
                      </div>
                      <span className="text-sm text-on-surface font-bold font-mono text-center px-4 max-w-full">
                        {selectedFile.name}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                      <FileText className="w-40 h-40 text-on-background" />
                    </div>
                  )}
                </div>

                {/* Extracted Data Panel */}
                <div className="w-1/2 h-full bg-white/40 overflow-y-auto p-4 md:p-6 space-y-4">

                  {uploadState === 'idle' && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-60">
                      <div className="w-16 h-16 rounded-full bg-surface border border-outline/50 flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-on-surface/50" />
                      </div>
                      <p className="text-sm font-medium text-on-surface">Upload a report to see extracted parameters stream here in real-time.</p>
                    </div>
                  )}

                  {uploadState === 'error' && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4 text-red-500 opacity-80">
                      <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-sm font-bold opacity-80">Extraction halted due to file error.</p>
                    </div>
                  )}

                  {uploadState === 'processing' && progress < 30 && (
                    <div className="bg-white/80 p-5 rounded-2xl flex justify-between items-start animate-pulse border border-white">
                      <div>
                        <div className="h-3 bg-surface rounded w-20 mb-3" />
                        <div className="h-5 bg-surface rounded w-32" />
                      </div>
                      <div className="h-8 w-16 bg-surface rounded-xl" />
                    </div>
                  )}

                  {(uploadState === 'processing' || uploadState === 'done') && (
                    <div className="space-y-4">
                      {mockExtractedParams.map((param, index) => {
                        if (progress < param.showAt) return null;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className={`p-5 rounded-2xl transition-colors border shadow-sm ${param.isHigh ? 'border-red-200 bg-red-50/80 shadow-[0_4px_15px_rgba(239,68,68,0.05)]' : 'border-white bg-white hover:shadow-md'}`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-sm font-bold tracking-tight ${param.isHigh ? 'text-red-900' : 'text-on-background'}`}>{param.name}</span>
                              <span className={`font-mono text-base font-black ${param.isHigh ? 'text-red-600' : 'text-primary'}`}>{param.val}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs mt-3">
                              <span className="text-[10px] font-bold tracking-wider text-outline-focus uppercase">{param.range}</span>
                              <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider ${param.isHigh ? 'bg-red-200 text-red-800 flex items-center gap-1 shadow-sm' : 'bg-surface text-secondary'}`}>
                                {param.isHigh && <ArrowUp className="w-3.5 h-3.5" />}
                                {param.status}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}

                      {progress < 90 && (
                        <div className="bg-white/60 p-5 rounded-2xl animate-pulse mt-4 border border-white">
                          <div className="w-full">
                            <div className="h-3 bg-surface rounded w-full mb-4" />
                            <div className="h-3 bg-surface rounded w-5/6 mb-4" />
                            <div className="h-3 bg-surface rounded w-3/4" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
