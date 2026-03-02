import { OrganInfo } from '@/data/organs';
import { useLevel } from '@/contexts/LevelContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface OrganInfoPanelProps {
  organ: OrganInfo | null;
  onClose: () => void;
}

const OrganInfoPanel = ({ organ, onClose }: OrganInfoPanelProps) => {
  const { level } = useLevel();

  if (!organ) return null;

  const content = organ[level];

  return (
    <AnimatePresence>
      {organ && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-0 left-0 h-full w-full md:w-[420px] bg-card/95 backdrop-blur-xl border-l border-border overflow-y-auto z-20"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{organ.emoji}</span>
                <h2 className="text-2xl font-bold text-foreground">{organ.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-primary mb-2">
                {level === 'kids' ? '📖 מה זה?' : '📋 תיאור מדעי'}
              </h3>
              <p className="text-foreground/90 leading-relaxed text-sm">
                {content.description}
              </p>
            </div>

            {/* Fun Fact */}
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <h3 className="text-sm font-semibold text-primary mb-2">
                💡 הידעת?
              </h3>
              <p className="text-foreground/90 text-sm leading-relaxed">
                {content.funFact}
              </p>
            </div>

            {/* YouTube Video */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-primary mb-3">
                🎬 סרטון
              </h3>
              <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${content.videoId}`}
                  title={`סרטון על ${organ.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Back button */}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              ← חזרה לגוף
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrganInfoPanel;
