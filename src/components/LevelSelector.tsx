import { useLevel } from '@/contexts/LevelContext';

const LevelSelector = () => {
  const { level, setLevel } = useLevel();

  return (
    <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-full backdrop-blur-md border border-border/50">
      <button
        onClick={() => setLevel('kids')}
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
          level === 'kids'
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <span>🧒</span>
        <span>ילדים</span>
      </button>
      <button
        onClick={() => setLevel('adults')}
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
          level === 'adults'
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <span>🧑</span>
        <span>מבוגרים</span>
      </button>
    </div>
  );
};

export default LevelSelector;
