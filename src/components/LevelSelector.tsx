import { useLevel } from '@/contexts/LevelContext';
import { useLanguage } from '@/contexts/LanguageContext';

const LevelSelector = () => {
  const { level, setLevel } = useLevel();
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setLevel('kids')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          level === 'kids'
            ? 'bg-primary text-primary-foreground glow-primary'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        <span>🧒</span>
        <span>{t('level.kids')}</span>
      </button>
      <button
        onClick={() => setLevel('adults')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          level === 'adults'
            ? 'bg-primary text-primary-foreground glow-primary'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        <span>🧑</span>
        <span>{t('level.adults')}</span>
      </button>
    </div>
  );
};

export default LevelSelector;
