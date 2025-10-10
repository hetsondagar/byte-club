import { motion } from 'framer-motion';
import { Card as CardType, getCardColor, getCardIcon } from '@/types/codeHeist';
import { cn } from '@/lib/utils';

interface CardProps {
  card: CardType;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  showBack?: boolean;
  className?: string;
}

export function CodeHeistCard({
  card,
  selected = false,
  disabled = false,
  onClick,
  size = 'medium',
  showBack = false,
  className
}: CardProps) {
  const sizeClasses = {
    small: 'w-24 h-36',
    medium: 'w-32 h-48',
    large: 'w-40 h-60'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <motion.div
      className={cn(
        'relative cursor-pointer perspective-1000',
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
      whileHover={!disabled ? { y: -10, scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={{
        y: selected ? -15 : 0,
        scale: selected ? 1.1 : 1
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: showBack ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Card Back */}
        <div
          className="absolute inset-0 backface-hidden rounded-lg border-2 border-primary/50 overflow-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-2">
            <div className="w-full h-full border-2 border-cyan-500/30 rounded-md relative overflow-hidden">
              {/* Cyber grid pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-4 grid-rows-6 h-full w-full gap-1">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="border border-cyan-500/50 animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-bold text-cyan-500/50 animate-pulse">
                  {'</>'}
                </div>
              </div>
              
              {/* Glowing corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500 animate-pulse" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500 animate-pulse" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500 animate-pulse" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Card Front */}
        <div
          className={cn(
            'absolute inset-0 backface-hidden rounded-lg border-2 overflow-hidden transition-all duration-300',
            selected ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-primary/50'
          )}
        >
          <div className={cn('w-full h-full bg-gradient-to-br p-3 relative', getCardColor(card))}>
            {/* Card type icon and name */}
            <div className="flex items-center justify-between mb-2">
              <div className={cn('font-bold text-white', textSizeClasses[size])}>
                {card.name}
              </div>
              <div className="text-2xl">{getCardIcon(card)}</div>
            </div>

            {/* Card type badge */}
            <div className="mb-2">
              <div className="inline-block px-2 py-0.5 bg-black/40 rounded text-xs text-white backdrop-blur-sm">
                {card.type}
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/30 mb-2" />

            {/* Effect description */}
            <div className={cn('text-white/90 mb-3', textSizeClasses[size])}>
              {card.effect}
            </div>

            {/* Flavor text */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className={cn('text-white/70 italic', textSizeClasses[size])}>
                "{card.flavorText}"
              </div>
            </div>

            {/* Decorative corner elements */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white/50" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-white/50" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-white/50" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white/50" />

            {/* Glow effect overlay */}
            {selected && (
              <motion.div
                className="absolute inset-0 bg-yellow-400/20 rounded-lg"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Card back component for other players' hands
export function CardBack({ size = 'small', className }: { size?: 'small' | 'medium'; className?: string }) {
  const sizeClasses = {
    small: 'w-16 h-24',
    medium: 'w-24 h-36'
  };

  return (
    <div className={cn('rounded-lg border-2 border-cyan-500/50 overflow-hidden', sizeClasses[size], className)}>
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-1">
        <div className="w-full h-full border border-cyan-500/30 rounded-md relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-3 grid-rows-4 h-full w-full gap-0.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border border-cyan-500/50" />
              ))}
            </div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xl font-bold text-cyan-500/50">{'</>'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

