import { OrganInfo, getOrganName, getOrganContent } from '@/data/organs';
import { useLevel } from '@/contexts/LevelContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface OrganInfoPanelProps {
  organ: OrganInfo | null;
  onClose: () => void;
}

const OrganInfoPanel = ({ organ, onClose }: OrganInfoPanelProps) => {
  const { level } = useLevel();
  const { lang, t, isRTL } = useLanguage();

  if (!organ) return null;

  const content = getOrganContent(organ, level, lang);
  const displayName = getOrganName(organ, lang);
  const systemName = organ.bodySystem[lang];

  return (
    <AnimatePresence>
      {organ && (
        <motion.div
          key={organ.id}
          initial={{ x: isRTL ? -300 : 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isRTL ? -300 : 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-full md:w-[420px] bg-card/95 backdrop-blur-xl border-l border-border overflow-y-auto z-20`}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{organ.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                  <p className="text-xs text-muted-foreground italic">{organ.latinName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body System badge */}
            <div className="mb-5 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold border border-accent/20">
                {t('panel.system')}: {systemName}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-primary mb-2">
                {level === 'kids' ? t('panel.whatIsIt') : t('panel.scientific')}
              </h3>
              <p className="text-foreground/90 leading-relaxed text-sm">
                {content.description}
              </p>
            </div>

            {/* Fun Fact */}
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <h3 className="text-sm font-semibold text-primary mb-2">
                {t('panel.didYouKnow')}
              </h3>
              <p className="text-foreground/90 text-sm leading-relaxed">
                {content.funFact}
              </p>
            </div>

            {/* Annotations list */}
            {organ.annotations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-primary mb-2">
                  📌 {lang === 'he' ? 'חלקים' : 'Parts'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {organ.annotations.map((a) => (
                    <span
                      key={a.id}
                      className="px-2.5 py-1 rounded-lg bg-secondary/60 text-xs font-medium text-foreground/80 border border-border/50"
                    >
                      {a.label[lang]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube Video */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-primary mb-3">
                {t('panel.video')}
              </h3>
              <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${content.videoId}`}
                  title={`Video about ${displayName}`}
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
              {t('panel.back')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrganInfoPanel;
