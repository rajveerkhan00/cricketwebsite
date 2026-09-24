const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'admin', 'dashboard', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Modals overlay & containers
content = content.replaceAll('bg-black/75 backdrop-blur-sm', 'bg-slate-900/40 backdrop-blur-sm');
content = content.replaceAll('bg-black/80 backdrop-blur-md', 'bg-slate-900/40 backdrop-blur-sm');
content = content.replaceAll('bg-black/70 backdrop-blur-sm', 'bg-slate-900/40 backdrop-blur-sm');

// Containers & cards
content = content.replaceAll('bg-[#07092e]', 'bg-white');
content = content.replaceAll('bg-[#05072c]', 'bg-slate-50');
content = content.replaceAll('bg-[#0d0f3a]', 'bg-slate-50');
content = content.replaceAll('bg-[#03041c]', 'bg-slate-50');

// Shadows
content = content.replaceAll('shadow-black/80', 'shadow-slate-900/10');
content = content.replaceAll('shadow-black/90', 'shadow-slate-900/10');
content = content.replaceAll('shadow-black/60', 'shadow-slate-900/10');
content = content.replaceAll('shadow-black/30', 'shadow-sm');
content = content.replaceAll('shadow-black/20', 'shadow-sm');

// Borders
content = content.replaceAll('border-zinc-700/60', 'border-slate-200');
content = content.replaceAll('border-zinc-800/60', 'border-slate-200');
content = content.replaceAll('border-zinc-800', 'border-slate-200');
content = content.replaceAll('border-zinc-700', 'border-slate-300');
content = content.replaceAll('border-white/5', 'border-slate-100');
content = content.replaceAll('border-white/10', 'border-slate-200');
content = content.replaceAll('divide-white/5', 'divide-slate-100');

// Hover states and backgrounds
content = content.replaceAll('hover:bg-white/[0.03]', 'hover:bg-slate-50/80');
content = content.replaceAll('bg-white/[0.02]', 'bg-slate-50/75');
content = content.replaceAll('bg-white/[0.03]', 'bg-slate-50/75');
content = content.replaceAll('hover:bg-white/5', 'hover:bg-slate-100');
content = content.replaceAll('hover:bg-white/10', 'hover:bg-slate-100');
content = content.replaceAll('bg-white/5', 'bg-slate-100');

// Placeholders
content = content.replaceAll('placeholder:text-zinc-600', 'placeholder:text-slate-400');
content = content.replaceAll('placeholder-zinc-600', 'placeholder:text-slate-400');

// Specific text adjustments for headings & labels
content = content.replaceAll('text-zinc-400 uppercase', 'text-slate-600 uppercase');
content = content.replaceAll('text-zinc-300 uppercase', 'text-slate-700 uppercase');

// Clean up input text colors inside inputs/selects/textareas
content = content.replaceAll('text-white rounded-lg', 'text-slate-900 rounded-lg');
content = content.replaceAll('text-white rounded-xl', 'text-slate-900 rounded-xl');

// Modal headers close button
content = content.replaceAll('text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100', 'text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100');
content = content.replaceAll('text-zinc-400 hover:text-white', 'text-slate-500 hover:text-slate-900');

// Cancel buttons
content = content.replaceAll('border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500', 'border-slate-300 text-slate-700 hover:bg-slate-100');

// Specific Dashboard Main Page replacements
content = content.replaceAll('text-zinc-100 relative', 'text-slate-800 relative');

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated dashboard to white background!');
