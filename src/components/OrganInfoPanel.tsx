import { OrganInfo } from '@/data/organs';
import { organImages } from '@/data/organImages';
import { useLevel } from '@/contexts/LevelContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, BookOpen, FlaskConical, Play } from 'lucide-react';

interface OrganInfoPanelProps {
  organ: OrganInfo | null;
  onClose: () => void;
}

const OrganInfoPanel = ({ organ, onClose }: OrganInfoPanelProps) => {
  const { level } = useLevel();

  return (
    <AnimatePresence mode="wait">
      {organ && (
        <motion.div
          key={organ.id}
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="absolute top-0 right-0 h-full w-full md:w-[440px] bg-card/95 backdrop-blur-2xl border-l border-border/50 overflow-y-auto z-20 shadow-2xl"
        >
          {/* Colored accent bar */}
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${organ.color}, ${organ.hoverColor}, transparent)` }} />
          
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-4"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${organ.color}40, ${organ.hoverColor}60)`, border: `1px solid ${organ.color}50` }}
                >
                  {organ.emoji}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground">{organ.name}</h2>
                  <span className="text-xs font-medium text-muted-foreground">
                    {level === 'kids' ? '🧒 מצב ילדים' : '🧑 מצב מבוגרים'}
                  </span>
                </div>
              </motion.div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-secondary/80 hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Realistic organ image */}
            {organImages[organ.id] && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mb-5 rounded-2xl overflow-hidden border border-border/30 shadow-xl"
                style={{ background: `linear-gradient(135deg, ${organ.color}15, ${organ.hoverColor}10)` }}
              >
                <img
                  src={organImages[organ.id]}
                  alt={organ.name}
                  className="w-full h-48 object-contain p-2"
                />
              </motion.div>
            )}

            {/* Description */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                {level === 'kids' ? <BookOpen className="w-4 h-4 text-primary" /> : <FlaskConical className="w-4 h-4 text-primary" />}
                <h3 className="text-sm font-bold text-primary">
                  {level === 'kids' ? 'מה זה?' : 'תיאור מדעי'}
                </h3>
              </div>
              <p className="text-foreground/90 leading-relaxed text-sm bg-secondary/30 rounded-xl p-4 border border-border/30">
                {organ[level].description}
              </p>
            </motion.div>

            {/* Fun Fact */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div 
                className="p-4 rounded-xl border"
                style={{ 
                  background: `linear-gradient(135deg, ${organ.color}10, ${organ.hoverColor}15)`,
                  borderColor: `${organ.color}30`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4" style={{ color: organ.color }} />
                  <h3 className="text-sm font-bold" style={{ color: organ.color }}>
                    💡 הידעת?
                  </h3>
                </div>
                <p className="text-foreground/90 text-sm leading-relaxed">
                  {organ[level].funFact}
                </p>
              </div>
            </motion.div>

            {/* YouTube Video */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Play className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-primary">🎬 צפו בסרטון</h3>
              </div>
              <div className="relative w-full rounded-xl overflow-hidden border border-border/30 shadow-lg" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${organ[level].videoId}`}
                  title={`סרטון על ${organ.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>

            {/* Back button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                background: `linear-gradient(135deg, ${organ.color}, ${organ.hoverColor})`,
                color: '#0d1b2a'
              }}
            >
              ← חזרה לגוף
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrganInfoPanel;
