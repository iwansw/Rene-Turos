import React, { useState } from 'react';
import { Award, ShieldCheck, Printer, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { TrophyStatus } from '../types';

interface TrophyPreviewProps {
  projectName: string;
  recipientName: string;
  designation: string;
  plaqueText: string;
  onChangeRecipient?: (val: string) => void;
  onChangeDesignation?: (val: string) => void;
  onChangePlaqueText?: (val: string) => void;
  onTrophyStatusUpdate?: (status: TrophyStatus) => void;
  currentStatus: TrophyStatus;
}

export default function TrophyPreview({
  projectName,
  recipientName,
  designation,
  plaqueText,
  onChangeRecipient,
  onChangeDesignation,
  onChangePlaqueText,
  onTrophyStatusUpdate,
  currentStatus
}: TrophyPreviewProps) {
  const [finish, setFinish] = useState<'gold' | 'silver' | 'copper'>('gold');
  const [reflection, setReflection] = useState(true);

  const finishes = {
    gold: {
      bg: 'from-amber-100 via-yellow-200 to-amber-300',
      border: 'border-amber-400',
      text: 'text-amber-900',
      metallic: 'bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600',
      label: 'Brushed Gold Leaf'
    },
    silver: {
      bg: 'from-slate-100 via-zinc-200 to-slate-300',
      border: 'border-zinc-300',
      text: 'text-zinc-800',
      metallic: 'bg-gradient-to-tr from-zinc-300 via-slate-100 to-zinc-500',
      label: 'Satin Silver Chrome'
    },
    copper: {
      bg: 'from-orange-100 via-red-100 to-orange-200',
      border: 'border-orange-300',
      text: 'text-amber-950',
      metallic: 'bg-gradient-to-tr from-orange-400 via-rose-100 to-amber-700',
      label: 'Rose Copper Alloy'
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="trophy-preview-component shadow-sm" className="bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden">
      {/* Background Accent Deco */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-0 opacity-40 pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-8 items-stretch relative z-10">
        
        {/* Left Section: Controls and Form Fields */}
        <div id="trophy-configs" className="flex-1 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-rose-50 rounded text-rose-600">
                <Award size={18} />
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-rose-500">Phase 10: Client Commemoration</span>
            </div>
            
            <h3 className="text-xl font-display font-bold text-slate-800">
              The Physical "Book Frame" Trophy
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              A premium wooden display stand housing an engraved plaque, shipped directly to client offices as an enduring display of partnership.
            </p>
          </div>

          {/* Trophy Type Selectors */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Select Plaque Finish:</span>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(finishes) as Array<keyof typeof finishes>).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFinish(key)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    finish === key 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${finish === key ? 'bg-white' : 'bg-slate-400'} border border-slate-300`} style={{
                    background: key === 'gold' ? '#f59e0b' : key === 'silver' ? '#94a3b8' : '#f97316'
                  }} />
                  {key.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Form Inputs */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">RECIPIENT NAME</label>
              <input 
                type="text" 
                value={recipientName || ''} 
                onChange={(e) => onChangeRecipient?.(e.target.value)}
                placeholder="Client/Author Full Name"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">CLIENT DESIGNATION / TITLE</label>
              <input 
                type="text" 
                value={designation || ''} 
                onChange={(e) => onChangeDesignation?.(e.target.value)}
                placeholder="e.g. Founder, Vance Art Guild"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">CUSTOM PLAQUE COMMEMORATION TEXT</label>
              <textarea 
                rows={3}
                value={plaqueText || ''} 
                onChange={(e) => onChangePlaqueText?.(e.target.value)}
                placeholder="A customized dedication message..."
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-slate-400 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Shipping / Status Controls */}
          {onTrophyStatusUpdate && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col gap-2">
              <span className="text-xs font-extrabold text-slate-500 tracking-wider">DELIVERY WORKFLOW STATUS</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {([TrophyStatus.NONE, TrophyStatus.PREPARING, TrophyStatus.SHIPPED, TrophyStatus.DELIVERED] as const).map((statusValue) => (
                  <button
                    key={statusValue}
                    type="button"
                    onClick={() => onTrophyStatusUpdate(statusValue)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                      currentStatus === statusValue 
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {statusValue === TrophyStatus.NONE ? 'Not Sent' : statusValue.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 bg-slate-900 text-white hover:bg-slate-800 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Printer size={14} />
              Print Trophy Artwork
            </button>
            <button
              type="button"
              onClick={() => alert(`Framing specification was successfully saved with finish: ${finishes[finish].label}`)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold"
              title="Share Specifications"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>

        {/* Right Section: Live 3D/Reflective Physical Render */}
        <div id="trophy-frame-view" className="flex-1 flex flex-col items-center justify-center bg-slate-100 border border-slate-200 rounded-2xl p-6 min-h-[380px] select-none shadow-inner">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 mb-2 uppercase">Physical Preview Workspace</span>
          
          {/* Main 3D Plaque Container */}
          <motion.div 
            id="phy-trophy-plaque"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[340px] aspect-[4/5] bg-amber-950 border-[15px] border-amber-950 rounded-md shadow-2xl relative flex flex-col p-4 text-center items-center justify-between"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1540200049848-d9813ea0e120?auto=format&fit=crop&q=80&w=600")', // Dark wood texture backplate
              backgroundSize: 'cover',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* Shimmer glaze glare overlay */}
            {reflection && (
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/12 pointer-events-none rounded opacity-80" style={{ mixBlendMode: 'overlay' }} />
            )}

            {/* Inner Gold Foil Margin Border */}
            <div className="w-full h-full border border-yellow-600/60 rounded flex flex-col justify-between p-4 bg-slate-900/5 backdrop-blur-[0.5px]">
              
              {/* Milestone Emblem Icon (Trophy Version) */}
              <div className="flex flex-col items-center">
                <svg viewBox="0 0 110 90" className="h-6 w-auto mb-1 opacity-90 drop-shadow-sm filter brightness-110">
                  <path d="M28 6 L43 6 L22 40 L7 40 Z" fill="#94a3b8" />
                  <path d="M28 29 L43 29 L22 63 L7 63 Z" fill="#059669" />
                  <path d="M28 52 L43 52 L22 86 L7 86 Z" fill="#f97316" />
                </svg>
                <div className="text-[7px] font-bold tracking-[0.2em] text-white/40 font-mono">MILESTONE GROUP</div>
              </div>

              {/* Central Metallic Panel */}
              <div className={`w-full flex-1 my-3 rounded-sm border p-3.5 flex flex-col items-center justify-between shadow-lg relative ${finishes[finish].bg} ${finishes[finish].border} ${finishes[finish].text}`}>
                
                {/* Micro screws in corners */}
                <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full border border-slate-700/20 bg-slate-300 shadow-xs" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full border border-slate-700/20 bg-slate-300 shadow-xs" />
                <span className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full border border-slate-700/20 bg-slate-300 shadow-xs" />
                <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full border border-slate-700/20 bg-slate-300 shadow-xs" />

                <div className="flex flex-col items-center w-full">
                  <span className="text-[8px] font-extrabold tracking-widest opacity-65 uppercase font-sans">DELUXE COMMEMORATION PLAQUE</span>
                  <div className="w-6 h-px bg-current/20 my-1" />
                </div>

                {/* Commended Text */}
                <div className="my-1.5">
                  <span className="text-[10px] font-extrabold tracking-tight block leading-tight font-display text-slate-800 drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                    PRESENTED TO
                  </span>
                  <span className="text-sm font-black tracking-tight block my-0.5 leading-tight text-slate-900 border-b border-dashed border-slate-700/20 pb-0.5 px-2">
                    {recipientName || 'Arthur Green'}
                  </span>
                  <span className="text-[8px] font-bold tracking-normal opacity-75 block mt-0.5 italic text-slate-700 leading-none">
                    {designation || 'Author / Publisher Client'}
                  </span>
                </div>

                {/* Book commemoration details */}
                <div className="w-full">
                  <span className="text-[7px] font-bold tracking-widest opacity-60 block uppercase">FOR THE EXQUISITE PRODUCTION OF</span>
                  <span className="text-[11px] font-extrabold block tracking-tight text-slate-900 py-0.5 bg-white/20 rounded mt-0.5 italic drop-shadow-[0_1px_0_rgba(255,100,50,0.1)]">
                    "{projectName || 'The Whispering Pines'}"
                  </span>
                </div>

                <div className="w-full pt-1.5 border-t border-slate-800/10">
                  <p className="text-[7.5px] font-medium leading-normal tracking-wide text-center max-w-[200px] mx-auto italic opacity-80 select-text">
                    "{plaqueText || 'Crafted in collaboration with members of the Milestone Editorial Guild. Streamlined beautifully in 2026.'}"
                  </p>
                </div>

                <div className="flex justify-between w-full text-[6px] font-mono opacity-60 pt-1.5 mt-1 border-t border-slate-800/10">
                  <span>EST. 2026</span>
                  <span>COMMEMORATIVE AWARD</span>
                </div>
              </div>

              {/* Bottom plaque designation */}
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck size={7} className="text-amber-400" />
                <span className="text-[6.5px] font-bold text-white/50 tracking-wider">CERTIFIED PHYSICAL SPECIFICATION</span>
              </div>
            </div>
          </motion.div>

          <span className="text-[10px] font-mono text-slate-500 mt-2">
            Finish: {finishes[finish].label} • Weight: 1.2 kg
          </span>
        </div>

      </div>
    </div>
  );
}
