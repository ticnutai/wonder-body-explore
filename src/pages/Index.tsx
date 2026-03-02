import { useState } from 'react';
import { motion } from 'framer-motion';
import { LevelProvider } from '@/contexts/LevelContext';
import LevelSelector from '@/components/LevelSelector';
import HumanBodyModel from '@/components/HumanBodyModel';
import OrganInfoPanel from '@/components/OrganInfoPanel';
import { OrganInfo } from '@/data/organs';

const HeroSection = ({ onStart }: { onStart: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center min-h-screen bg-grid relative overflow-hidden"
  >
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
    <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />

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
        פלאי גוף האדם
      </h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto">
        גלו את הסודות המדהימים של גוף האדם בחוויה אינטראקטיבית
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg glow-primary hover:scale-105 transition-transform duration-300"
      >
        🚀 בואו נתחיל לחקור!
      </button>
    </motion.div>
  </motion.div>
);

const ExplorerView = () => {
  const [selectedOrgan, setSelectedOrgan] = useState<OrganInfo | null>(null);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between p-3 px-5 bg-background/80 backdrop-blur-md border-b border-border/50">
        <h2 className="text-lg font-black text-foreground">🧬 פלאי גוף האדם</h2>
        <LevelSelector />
      </div>

      {/* Instructions */}
      {!selectedOrgan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-center"
        >
          <p className="text-sm text-muted-foreground bg-card/80 backdrop-blur-md px-6 py-3 rounded-full border border-border/50 shadow-lg">
            👆 העבירו את העכבר על האיברים ולחצו כדי ללמוד עליהם
          </p>
        </motion.div>
      )}

      {/* Body model - centered */}
      <div className="w-full h-full pt-14 flex items-center justify-center">
        <HumanBodyModel
          onSelectOrgan={setSelectedOrgan}
          selectedOrgan={selectedOrgan}
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
