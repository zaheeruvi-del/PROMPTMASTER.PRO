/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo, ReactNode } from "react";
import { 
  Wand2, 
  Copy, 
  RefreshCcw, 
  Image as ImageIcon, 
  Film, 
  Brush, 
  Camera, 
  Sun, 
  Palette, 
  Sparkles, 
  Ban, 
  Scissors, 
  ExternalLink,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Constants ---

const STYLES = [
  "Cinematic", "Photorealistic", "Anime / Manga", "Oil Painting", 
  "Watercolor", "3D Render", "Pixel Art", "Concept Art", 
  "Dark Fantasy", "Surrealism", "Minimalist", "Neon / Cyberpunk"
];

const SHOTS = [
  "Wide establishing shot", "Close-up portrait", "Aerial / drone view", 
  "Over-the-shoulder", "Low angle hero shot", "Macro / extreme close-up", 
  "Dutch angle", "POV first-person", "Medium shot", "Rule of thirds"
];

const LIGHTING = [
  "Golden hour sunlight", "Dramatic studio lighting", "Neon glow", 
  "Foggy / misty atmosphere", "Hard shadows midday", "Soft diffused light", 
  "Backlit silhouette", "Moonlight / night", "Rim lighting", "Candlelight / warm glow"
];

const PALETTES = [
  "Warm earthy tones", "Cool blues and teals", "Monochrome black & white", 
  "Vibrant saturated colors", "Muted desaturated film", "Pastel soft tones", 
  "Neon / electric palette", "Sepia / vintage", "Complementary contrast", "Dark moody tones"
];

const MOTION_TAGS: string[] = [
  "slow motion", "cinematic pan", "zoom in", "orbit camera", 
  "dolly shot", "timelapse", "handheld shakecam", "freeze frame", 
  "whip pan", "hyperlapse"
];

const QUALITY_TAGS: string[] = [
  "ultra HD 8K", "highly detailed", "sharp focus", "award-winning photography", 
  "professional grade", "studio quality", "intricate textures", "depth of field", 
  "volumetric fog", "subsurface scattering", "global illumination", "hyperrealistic"
];

const IMAGE_PLATFORMS = [
  { name: "Midjourney", url: "https://www.midjourney.com", icon: " ImageIcon" },
  { name: "DALL·E 3", url: "https://openai.com/dall-e-3", icon: "Sparkles" },
  { name: "Stable Diffusion", url: "https://stability.ai", icon: "Wand2" },
  { name: "Ideogram", url: "https://ideogram.ai", icon: "Palette" },
  { name: "Adobe Firefly", url: "https://www.adobe.com/products/firefly.html", icon: "Brush" },
  { name: "Leonardo AI", url: "https://leonardo.ai", icon: "Palette" },
];

const VIDEO_PLATFORMS = [
  { name: "Runway Gen", url: "https://runwayml.com", icon: "Film" },
  { name: "Synthesia", url: "https://www.synthesia.io", icon: "Film" },
  { name: "Pika Labs", url: "https://pika.art", icon: "Sparkles" },
  { name: "Kling AI", url: "https://kling.kuaishou.com", icon: "Film" },
  { name: "Luma Dream", url: "https://lumalabs.ai/dream-machine", icon: "Sparkles" },
  { name: "Sora", url: "https://sora.openai.com", icon: "Film" },
];

const EDITING_TOOLS = [
  { name: "CapCut", url: "https://www.capcut.com", icon: "Scissors" },
  { name: "Clipchamp", url: "https://clippchamp.com", icon: "Scissors" },
  { name: "Descript", url: "https://www.descript.com", icon: "Scissors" },
  { name: "Veed.io", url: "https://www.veed.io", icon: "Scissors" },
  { name: "Opus Clip", url: "https://opus.pro", icon: "Sparkles" },
  { name: "Munch", url: "https://www.munch.app", icon: "Scissors" },
];

export default function App() {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [style, setStyle] = useState(STYLES[0]);
  const [shot, setShot] = useState(SHOTS[0]);
  const [lighting, setLighting] = useState(LIGHTING[0]);
  const [palette, setPalette] = useState(PALETTES[0]);
  const [subject, setSubject] = useState("");
  const [negative, setNegative] = useState("");
  const [selectedQualityTags, setSelectedQualityTags] = useState<string[]>(["ultra HD 8K", "highly detailed", "professional grade"]);
  const [selectedMotionTags, setSelectedMotionTags] = useState<string[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState<{ positive: string; negative: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleTag = (tagName: string, type: "quality" | "motion") => {
    if (type === "quality") {
      setSelectedQualityTags(prev => 
        prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
      );
    } else {
      setSelectedMotionTags(prev => 
        prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
      );
    }
  };

  const handleGenerate = () => {
    const subjectPart = subject.trim() || "[describe your subject or scene here]";
    let positive = `${style} ${mode === "video" ? "video" : "image"}, ${shot}, ${subjectPart}. ${lighting}, ${palette}.`;

    if (mode === "video" && selectedMotionTags.length > 0) {
      positive += ` Camera: ${selectedMotionTags.join(", ")}.`;
    }

    if (selectedQualityTags.length > 0) {
      positive += ` Quality: ${selectedQualityTags.join(", ")}.`;
    }

    setGeneratedPrompt({
      positive,
      negative: negative.trim()
    });
  };

  const handleCopy = async () => {
    if (!generatedPrompt) return;
    const textToCopy = `[POSITIVE PROMPT]\n${generatedPrompt.positive}${generatedPrompt.negative ? `\n\n[NEGATIVE PROMPT]\n${generatedPrompt.negative}` : ""}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleReset = () => {
    setSubject("");
    setNegative("");
    setSelectedMotionTags([]);
    setSelectedQualityTags(["ultra HD 8K", "highly detailed", "professional grade"]);
    setGeneratedPrompt(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 font-sans text-zinc-100 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* --- Navbar Bento --- */}
        <nav className="mb-6 flex flex-col items-center justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-black italic shadow-lg shadow-blue-600/20">
              P
            </div>
            <span className="font-display text-xl font-bold tracking-tight">PROMPTMASTER<span className="text-blue-500">.PRO</span></span>
          </div>
          <div className="flex gap-4 md:gap-8">
            <button
              onClick={() => setMode("image")}
              className={`text-sm font-medium transition-colors ${mode === "image" ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Image Studio
            </button>
            <button
              onClick={() => setMode("video")}
              className={`text-sm font-medium transition-colors ${mode === "video" ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Video Studio
            </button>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-zinc-100 px-6 py-2 text-sm font-bold text-zinc-950 transition-all hover:bg-white hover:scale-105 active:scale-95">
             <Wand2 size={16} />
             Start Building
          </button>
        </nav>

        {/* --- Main Bento Grid --- */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          
          {/* Main Input - Big Card */}
          <div className="bento-card col-span-1 lg:col-span-2 lg:row-span-2 flex flex-col justify-between">
            <div className="space-y-6">
              <span className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-blue-500 uppercase">
                <Brush size={12} />
                01. Vision & Core Subject
              </span>
              <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
                Describe your masterpiece.
              </h2>
              <div className="relative">
                <textarea
                  value={subject}
                  onChange={(e) => setSubject(e.target.value.slice(0, 500))}
                  placeholder="A hyper-detailed portrait of a cybernetic goddess in a rainfall, neon lights reflecting off wet chrome accents..."
                  className="h-48 w-full resize-none border-none bg-transparent p-0 text-lg leading-relaxed text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-0"
                />
                <div className="absolute right-0 bottom-0 pointer-events-none font-mono text-[10px] text-zinc-600">
                  {subject.length} / 500
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
               <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-mono text-[10px] text-zinc-400">Status: Active</span>
               </div>
               <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-2">
                  <span className="font-mono text-[10px] text-zinc-400">Mode: {mode.toUpperCase()}</span>
               </div>
            </div>
          </div>

          {/* Type Toggle & Negative - Blue Accent */}
          <div className="bento-card-blue col-span-1 flex flex-col justify-between overflow-hidden relative group">
            <div className="z-10 bg-blue-600">
              <span className="block font-mono text-[10px] font-bold tracking-[0.2em] text-blue-200 uppercase mb-4">
                 02. Creation Type
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setMode("image")}
                  className={`flex-1 rounded-xl py-4 text-center font-bold transition-all ${mode === "image" ? "bg-white text-blue-600 shadow-xl" : "bg-blue-700/50 text-blue-100 hover:bg-blue-700"}`}
                >
                  <ImageIcon size={24} className="mx-auto mb-2" />
                  Image
                </button>
                <button 
                  onClick={() => setMode("video")}
                  className={`flex-1 rounded-xl py-4 text-center font-bold transition-all ${mode === "video" ? "bg-white text-blue-600 shadow-xl" : "bg-blue-700/50 text-blue-100 hover:bg-blue-700"}`}
                >
                  <Film size={24} className="mx-auto mb-2" />
                  Video
                </button>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/20 blur-2xl transition-transform group-hover:scale-150" />
          </div>

          {/* Parameters - Compact Grid Section */}
          <div className="lg:col-span-1 lg:row-span-2 grid grid-cols-1 gap-4">
             <ParameterCard label="Style" icon={<Palette size={14} />} value={style} onChange={setStyle} options={STYLES} />
             <ParameterCard label="Camera" icon={<Camera size={14} />} value={shot} onChange={setShot} options={SHOTS} />
             <div className="bento-card p-4 flex flex-col justify-center gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Performance</span>
                <div className="flex items-end gap-1 h-8">
                   {[40, 70, 30, 50, 90, 60, 100].map((h, i) => (
                     <div key={i} className="bg-blue-500 flex-1 rounded-t-sm" style={{ height: `${h}%` }} />
                   ))}
                </div>
                <span className="font-mono text-[9px] text-zinc-600">Optimization: 98%</span>
             </div>
          </div>

          {/* Lighting & Palette */}
          <div className="bento-card col-span-1 flex flex-col justify-between">
            <ParameterCard label="Lighting" icon={<Sun size={14} />} value={lighting} onChange={setLighting} options={LIGHTING} border={false} />
            <ParameterCard label="Palette" icon={<Palette size={14} />} value={palette} onChange={setPalette} options={PALETTES} border={false} />
          </div>

          {/* Negative Prompt */}
          <div className="bento-card col-span-1 lg:col-span-1 border-red-900/30">
            <div className="space-y-4">
              <span className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase">
                <Ban size={12} />
                03. Negative Constraints
              </span>
              <input
                type="text"
                value={negative}
                onChange={(e) => setNegative(e.target.value)}
                placeholder="blurry, distorted, logo..."
                className="w-full bg-transparent p-0 text-sm font-medium text-zinc-200 placeholder:text-zinc-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Quality Enhancers - Stretched */}
          <div className="bento-card col-span-1 lg:col-span-2">
             <div className="space-y-4">
                <span className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                  <Sparkles size={12} className="text-blue-500" />
                  04. Quality Layers
                </span>
                <div className="flex flex-wrap gap-2">
                   {QUALITY_TAGS.map(tag => (
                     <button
                        key={tag}
                        onClick={() => toggleTag(tag, "quality")}
                        className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all duration-200 border uppercase tracking-wider ${
                          selectedQualityTags.includes(tag) 
                            ? "bg-blue-600 border-blue-500 text-white" 
                            : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {tag}
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Action Row - Light Bento */}
          <div className="bento-card-light col-span-1 lg:col-span-1 flex flex-col justify-between group">
             <div>
                <h3 className="text-xl font-bold">Build Prompt</h3>
                <p className="text-zinc-600 text-xs mt-1">Compile your master prompt.</p>
             </div>
             <button 
              onClick={handleGenerate}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-4 text-sm font-bold text-zinc-100 transition-all hover:bg-zinc-800 active:scale-95"
             >
                <Wand2 size={18} />
                Generate
             </button>
          </div>

          {/* Motion Group (conditional) */}
          <AnimatePresence>
            {mode === "video" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bento-card col-span-1 lg:col-span-2"
              >
                 <div className="space-y-4">
                    <span className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                      <Film size={12} className="text-blue-500" />
                      05. Cinematic Motion
                    </span>
                    <div className="flex flex-wrap gap-2">
                       {MOTION_TAGS.map(tag => (
                         <button
                            key={tag}
                            onClick={() => toggleTag(tag, "motion")}
                            className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all duration-200 border uppercase tracking-wider ${
                              selectedMotionTags.includes(tag) 
                                ? "bg-blue-600 border-blue-500 text-white" 
                                : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {tag}
                          </button>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Final Output - Massive Result Card */}
          <AnimatePresence>
            {generatedPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bento-card col-span-1 lg:col-span-4 border-blue-500/30 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-4 flex gap-2">
                   <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2 text-xs font-bold transition-all hover:bg-zinc-700"
                   >
                     {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                     {copied ? "Copied!" : "Copy Result"}
                   </button>
                   <button 
                    onClick={handleReset}
                    className="rounded-xl bg-zinc-800 border border-zinc-700 p-2 transition-all hover:bg-zinc-700"
                   >
                     <RefreshCcw size={14} />
                   </button>
                </div>

                <div className="space-y-8 p-4">
                   <div>
                     <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-blue-500 uppercase mb-4">Final Master Prompt</span>
                     <p className="text-2xl font-bold tracking-tight text-zinc-100 leading-snug max-w-5xl">{generatedPrompt.positive}</p>
                   </div>
                   {generatedPrompt.negative && (
                     <div className="pt-6 border-t border-zinc-800">
                        <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase mb-4">Excluded Parameters</span>
                        <p className="text-lg font-medium text-zinc-400">{generatedPrompt.negative}</p>
                     </div>
                   )}
                </div>
                {/* Visual Accent */}
                <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-blue-600/5 blur-[80px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Multi-Column Platform Sections --- */}
        <div className="mt-16 space-y-12">
          <BentoPlatformSection title="AI Image Ecosystem" icon={<ImageIcon size={18} />} platforms={IMAGE_PLATFORMS} />
          <BentoPlatformSection title="Creative Video Suite" icon={<Film size={18} />} platforms={VIDEO_PLATFORMS} />
          <BentoPlatformSection title="Clipping & Post-Production" icon={<Scissors size={18} />} platforms={EDITING_TOOLS} />
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t border-zinc-900 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-bold">P</div>
              <span className="text-sm font-bold text-zinc-500 tracking-tight">PROMPTMASTER.PRO</span>
           </div>
           <div className="flex gap-8 text-xs text-zinc-600 font-mono">
              <a href="#" className="hover:text-zinc-400">Documentation</a>
              <a href="#" className="hover:text-zinc-400">Terms</a>
              <a href="#" className="hover:text-zinc-400">Privacy</a>
           </div>
           <div className="text-xs text-zinc-700 italic">v4.2.0 Build Stable</div>
        </footer>
      </div>
    </div>
  );
}

// --- Specialized Bento Sub-components ---

function ParameterCard({ label, icon, value, onChange, options, border = true }: { 
  label: string; 
  icon: ReactNode; 
  value: string; 
  onChange: (v: string) => void;
  options: string[];
  border?: boolean;
}) {
  return (
    <div className={`p-4 space-y-3 ${border ? 'bento-card' : ''}`}>
      <label className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
        {icon}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-bold text-zinc-200 transition-colors focus:text-blue-400 focus:outline-none cursor-pointer appearance-none"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function BentoPlatformSection({ title, icon, platforms }: { title: string; icon: ReactNode; platforms: typeof IMAGE_PLATFORMS }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-500">
          {icon}
        </div>
        <h3 className="text-sm font-bold tracking-[0.1em] text-zinc-400 uppercase">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bento-card p-4 flex flex-col items-center justify-center gap-4 text-center hover:bg-zinc-800/80"
          >
            <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all">
              <ExternalLink size={24} />
            </div>
            <span className="text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors uppercase tracking-tight">{p.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
