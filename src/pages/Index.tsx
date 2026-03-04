import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelProvider } from '@/contexts/LevelContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import LevelSelector from '@/components/LevelSelector';
import HumanBodyModel, { FocusZone, ViewMode } from '@/components/HumanBodyModel';
import OrganInfoPanel from '@/components/OrganInfoPanel';
import { OrganInfo } from '@/data/organs';
import { useThemeContext, themes } from '@/contexts/ThemeContext';

/* ------------------------------------------------------------------ */
/*  Language picker                                                     */
/* ------------------------------------------------------------------ */
const LANG_OPTIONS: Array<{ id: Language; label: string; flag: string }> = [
  { id: 'he', label: 'עברית', flag: '🇮🇱' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
];

const LanguagePicker = () => {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-full transition-all border text-lg leading-none ${
          open
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-secondary/50 text-muted-foreground hover:text-foreground border-border/50'
        }`}
        title="Language"
      >
        🌐
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-11 w-40 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setLang(opt.id); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                  lang === opt.id
                    ? 'bg-primary/15 text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <span className="text-base">{opt.flag}</span>
                <span>{opt.label}</span>
                {lang === opt.id && <span className="ms-auto text-primary text-xs">✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */
const HeroSection = ({ onStart }: { onStart: () => void }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen bg-grid relative overflow-hidden"
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />

      {/* Language picker in corner */}
      <div className="absolute top-5 left-5 z-20">
        <LanguagePicker />
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-center z-10 px-4"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-7xl mb-6"
        >
          🧬
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-foreground mb-4 text-glow">
          {t('app.title')}
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto">
          {t('app.subtitle')}
        </p>
        <button
          onClick={onStart}
          className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg glow-primary hover:scale-105 transition-transform duration-300"
        >
          {t('app.start')}
        </button>
      </motion.div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Body layers type                                                    */
/* ------------------------------------------------------------------ */
export type BodyLayers = { skin: boolean; organs: boolean; skeleton: boolean };

/* ------------------------------------------------------------------ */
/*  Explorer                                                            */
/* ------------------------------------------------------------------ */
const ExplorerView = () => {
  const [selectedOrgan, setSelectedOrgan] = useState<OrganInfo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('surface');
  const [focusZone, setFocusZone] = useState<FocusZone>('full');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [layers, setLayers] = useState<BodyLayers>({ skin: true, organs: true, skeleton: false });
  const settingsRef = useRef<HTMLDivElement>(null);
  const { theme, setThemeId } = useThemeContext();
  const { t, lang } = useLanguage();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const modeButtons: Array<{ id: ViewMode; label: string; icon: string }> = [
    { id: 'surface', label: t('view.surface'), icon: '👤' },
    { id: 'xray', label: t('view.xray'), icon: '🔬' },
    { id: 'isolate', label: t('view.isolate'), icon: '🎯' },
  ];

  const focusButtons: Array<{ id: FocusZone; label: string }> = [
    { id: 'full', label: t('focus.full') },
    { id: 'head', label: t('focus.head') },
    { id: 'chest', label: t('focus.chest') },
    { id: 'abdomen', label: t('focus.abdomen') },
    { id: 'legs', label: t('focus.legs') },
  ];

  const layerDefs: Array<{ key: keyof BodyLayers; label: string; icon: string }> = [
    { key: 'skin', label: t('layer.skin'), icon: '🧑' },
    { key: 'organs', label: t('layer.organs'), icon: '🫀' },
    { key: 'skeleton', label: t('layer.skeleton'), icon: '🦴' },
  ];

  const toggleLayer = (key: keyof BodyLayers) =>
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between p-3 px-5 bg-background/80 backdrop-blur-md border-b border-border/50">
        <h2 className="text-lg font-black text-foreground">🧬 {t('app.title')}</h2>
        <div className="flex items-center gap-2">
          <LevelSelector />

          {/* View Mode buttons */}
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-full border border-border/50">
            {modeButtons.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  viewMode === mode.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>

          {/* Language picker */}
          <LanguagePicker />

          {/* Settings button */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`p-2 rounded-full transition-all border ${
                settingsOpen
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground border-border/50'
              }`}
              title={t('settings.button')}
            >
              ⚙️
            </button>

            {/* Settings dropdown */}
            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-12 w-72 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border/50">
                    <h3 className="text-sm font-bold text-foreground">{t('settings.title')}</h3>
                  </div>

                  {/* Theme grid */}
                  <div className="p-3 border-b border-border/30">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold">{t('settings.theme')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {themes.map((th) => (
                        <button
                          key={th.id}
                          onClick={() => setThemeId(th.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                            theme.id === th.id
                              ? 'bg-primary/15 border-primary text-foreground ring-1 ring-primary/30'
                              : 'bg-secondary/30 border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
                          }`}
                        >
                          <span className="text-base">{th.emoji}</span>
                          <span>{t(`theme.${th.id}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Layer toggles */}
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold">{t('settings.layers')}</p>
                    <div className="flex flex-col gap-1.5">
                      {layerDefs.map((ld) => (
                        <button
                          key={ld.key}
                          onClick={() => toggleLayer(ld.key)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                            layers[ld.key]
                              ? 'bg-primary/15 border-primary text-foreground'
                              : 'bg-secondary/30 border-border/50 text-muted-foreground'
                          }`}
                        >
                          <span className="text-base">{ld.icon}</span>
                          <span>{ld.label}</span>
                          <span className="ms-auto text-[11px]">{layers[ld.key] ? '✓' : '✗'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Focus zone bar */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-md px-2 py-1.5 rounded-full border border-border/50 shadow-lg">
          {focusButtons.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setFocusZone(zone.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                focusZone === zone.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {zone.label}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {!selectedOrgan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-center"
        >
          <p className="text-sm text-muted-foreground bg-card/80 backdrop-blur-md px-6 py-3 rounded-full border border-border/50 shadow-lg">
            {t('instructions')}
          </p>
        </motion.div>
      )}

      {/* Body model */}
      <div className="w-full h-full flex items-center justify-center">
        <HumanBodyModel
          onSelectOrgan={setSelectedOrgan}
          selectedOrgan={selectedOrgan}
          viewMode={viewMode}
          focusZone={focusZone}
          layers={layers}
        />
      </div>

      {/* Info Panel */}
      <OrganInfoPanel
        organ={selectedOrgan}
        onClose={() => setSelectedOrgan(null)}
      />
    </div>
  );
};

const Index = () => {
  const [started, setStarted] = useState(false);

  return (
    <LevelProvider>
      {!started ? (
        <HeroSection onStart={() => setStarted(true)} />
      ) : (
        <ExplorerView />
      )}
    </LevelProvider>
  );
};

export default Index;
