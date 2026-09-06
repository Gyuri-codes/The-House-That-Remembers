import React, { useState } from 'react';
import { X, Book, Target, Compass, Search, Users, HelpCircle, MapPin } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
}

type TabType = 'objectives' | 'clues' | 'evidence' | 'characters' | 'locations' | 'mysteries';

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  entries,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('objectives');

  if (!isOpen) return null;

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'objectives', label: 'Objectives', icon: <Target className="w-3.5 h-3.5" /> },
    { key: 'clues', label: 'Clues', icon: <Compass className="w-3.5 h-3.5" /> },
    { key: 'evidence', label: 'Evidence', icon: <Search className="w-3.5 h-3.5" /> },
    { key: 'characters', label: 'Residents', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'locations', label: 'Chambers', icon: <MapPin className="w-3.5 h-3.5" /> },
    { key: 'mysteries', label: 'Anomalies', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ];

  const filteredEntries = entries.filter((e) => e.category === activeTab);

  return (
    <div id="journal-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-4xl bg-[#080808] border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Viewfinder Corner Reticles */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-neutral-700 opacity-40 pointer-events-none z-20" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-neutral-700 opacity-40 pointer-events-none z-20" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-neutral-700 opacity-40 pointer-events-none z-20" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-neutral-700 opacity-40 pointer-events-none z-20" />

        {/* Header */}
        <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-3">
            <Book className="w-5 h-5 text-red-500" />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] tracking-[0.25em] text-red-600 uppercase">
                  FORENSIC CASE LOG • DOSSIER 626
                </span>
              </div>
              <h2 className="text-lg font-bold font-['Cinzel'] text-neutral-100 tracking-wider">
                Investigator's Field Journal
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#080808] border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-neutral-900 bg-[#050505] px-4 py-2 gap-1 scrollbar-none">
          {tabs.map((tab) => {
            const count = entries.filter((e) => e.category === tab.key).length;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs uppercase font-mono tracking-wider transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-red-950/40 text-red-200 border-red-800 shadow-[0_0_10px_rgba(220,38,38,0.2)]'
                    : 'bg-transparent text-neutral-500 border-transparent hover:text-neutral-300 hover:border-neutral-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="text-[10px] bg-black/60 px-1.5 py-0.5 border border-neutral-800">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Journal Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#050505]">
          {filteredEntries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-600">
              <p className="font-mono text-xs uppercase tracking-widest">No entries archived in this section.</p>
              <p className="text-[11px] mt-1 text-neutral-600 font-serif italic">Advance through the mansion to uncover remaining fragments.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-[#080808] border border-neutral-800/80 shadow transition-all hover:border-neutral-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold font-['Cinzel'] text-neutral-200 tracking-wide">
                      {entry.title}
                    </h3>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-red-400 bg-red-950/30 px-2 py-0.5 border border-red-900/40">
                      CONFIRMED
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-serif leading-relaxed">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

