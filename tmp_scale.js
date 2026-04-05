const fs = require('fs');

let content = fs.readFileSync('components/CockpitIntro.tsx', 'utf8');

// Helper to replace text globally
function r(searchRegex, replacement) {
  content = content.replace(searchRegex, replacement);
}

// 1. Hologram and minimap dimensions (3x)
r(/className="w-full max-h-\[88px\]"/g, 'className="w-full max-h-[264px]"');
r(/className="w-14 mx-auto"/g, 'className="w-[168px] mx-auto"');

// 2. Exact match scaling for typography (2x) 
// Avoiding the top banner by strictly adhering to the specific tailwind class combos
r(/text-\[7px\]/g, 'text-[14px]');
r(/text-\[6px\]/g, 'text-[12px]');
r(/text-\[9px\] font-bold/g, 'text-[18px] font-bold');
r(/text-sm text-green-400/g, 'text-[28px] text-green-400');
r(/text-xs mb-4/g, 'text-[24px] mb-4');
r(/text-xs text-red-400/g, 'text-[24px] text-red-400');
r(/text-xs text-zinc-600/g, 'text-[24px] text-zinc-600');
r(/text-xs text-zinc-500/g, 'text-[24px] text-zinc-500');
r(/text-lg text-white/g, 'text-[36px] text-white');
r(/text-sm text-zinc-300/g, 'text-[28px] text-zinc-300');
r(/text-xs uppercase tracking-widest py-2\.5/g, 'text-[24px] uppercase tracking-widest py-2.5');
r(/text-\[9px\] text-zinc-700/g, 'text-[18px] text-zinc-700');
r(/text-\[10px\] text-slate-600/g, 'text-[20px] text-slate-600');
r(/fontSize="8"/g, 'fontSize="16"');

// Write back
fs.writeFileSync('components/CockpitIntro.tsx', content);
console.log("Scaling completed perfectly.");
