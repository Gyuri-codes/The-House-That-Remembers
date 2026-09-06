import React, { useState } from 'react';
import { X, Key, FileText, Image, Box, Disc, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onUseItem?: (item: InventoryItem) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onUseItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(inventory[0] || null);

  if (!isOpen) return null;

  const getItemIcon = (category: InventoryItem['category']) => {
    switch (category) {
      case 'key':
        return <Key className="w-5 h-5 text-red-400" />;
      case 'photograph':
        return <Image className="w-5 h-5 text-neutral-300" />;
      case 'note':
        return <FileText className="w-5 h-5 text-neutral-400" />;
      case 'toy':
        return <Box className="w-5 h-5 text-red-500" />;
      case 'tape':
        return <Disc className="w-5 h-5 text-red-400" />;
      case 'ritual':
        return <Flame className="w-5 h-5 text-red-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-neutral-400" />;
    }
  };

  return (
    <div id="inventory-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-3xl bg-[#080808] border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
        {/* Viewfinder Corner Reticles */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-neutral-700 opacity-40 pointer-events-none z-20" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-neutral-700 opacity-40 pointer-events-none z-20" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-neutral-700 opacity-40 pointer-events-none z-20" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-neutral-700 opacity-40 pointer-events-none z-20" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-[#050505] border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left column: Item grid */}
        <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-neutral-800/80 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-red-500 font-bold">
              EVIDENCE LOCKER • CAM-REC
            </span>
          </div>

          <h2 className="text-lg font-bold font-['Cinzel'] text-neutral-100 tracking-wider mb-4">
            RECOVERED RELICS ({inventory.length} / 12)
          </h2>

          {inventory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-neutral-900 bg-[#050505] text-neutral-500">
              <Box className="w-8 h-8 mb-2 opacity-30 text-red-700" />
              <p className="text-xs uppercase tracking-widest font-mono">No relics acquired.</p>
              <p className="text-[11px] mt-1 text-neutral-600 font-serif italic">Search the manor chambers and examine key anomalies.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 overflow-y-auto pr-1 flex-1">
              {inventory.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`flex flex-col items-center justify-center p-3 border transition-all text-center aspect-square ${
                      isSelected
                        ? 'border-red-600 bg-red-950/20 shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                        : 'border-neutral-800/80 bg-[#050505] hover:bg-neutral-900/50 hover:border-neutral-700'
                    }`}
                  >
                    <div className="p-2 bg-neutral-950 border border-neutral-800/80 mb-1.5">
                      {getItemIcon(item.category)}
                    </div>
                    <span className="text-[10px] font-mono text-neutral-300 line-clamp-1 leading-tight uppercase tracking-wider">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Inspect detail view */}
        <div className="w-full md:w-1/2 p-6 flex flex-col bg-[#050505] justify-between overflow-y-auto">
          {selectedItem ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-red-400 bg-red-950/40 border border-red-900/50 px-2 py-0.5">
                    CLASSIFICATION: {selectedItem.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-['Cinzel'] text-neutral-100 tracking-wider mb-3">
                  {selectedItem.name}
                </h3>

                <div className="p-4 bg-[#080808] border border-neutral-800/80 mb-4 shadow-inner">
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="p-4 bg-red-950/15 border border-red-900/40">
                  <h4 className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-1 flex items-center gap-1.5 font-mono">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Archive Note
                  </h4>
                  <p className="text-xs text-neutral-400 italic font-serif leading-relaxed">
                    "{selectedItem.lore}"
                  </p>
                </div>
              </div>

              {onUseItem && (
                <div className="mt-6 pt-4 border-t border-neutral-900 flex justify-end">
                  <button
                    onClick={() => {
                      onUseItem(selectedItem);
                      onClose();
                    }}
                    className="group relative px-6 py-2.5 bg-[#080808] border border-neutral-800 hover:border-red-900 text-neutral-200 font-mono tracking-[0.25em] text-xs uppercase transition-all shadow-xl active:scale-95"
                  >
                    <span>EXAMINE / DEPLOY</span>
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-red-600" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-600 text-xs font-mono uppercase tracking-widest">
              Select an item to inspect its forensic history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

