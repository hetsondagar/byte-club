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
    small: 'w-28 h-40',
    medium: 'w-40 h-56',
    large: 'w-64 h-96'
  };

  const textSizeClasses = {
    small: 'text-[10px]',
    medium: 'text-xs',
    large: 'text-sm'
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
          <div className={cn('w-full h-full bg-gradient-to-br p-4 relative flex flex-col', getCardColor(card))}>
            {/* Card Header - Icon and Name */}
            <div className="flex items-start justify-between mb-3">
              <div className={cn('font-bold text-white leading-tight pr-2', size === 'large' ? 'text-lg' : size === 'medium' ? 'text-sm' : 'text-xs')}>
                {card.name}
              </div>
              <div className={size === 'large' ? 'text-3xl' : size === 'medium' ? 'text-2xl' : 'text-xl'}>
                {getCardIcon(card)}
              </div>
            </div>

            {/* Card Type Badge */}
            <div className="mb-3">
              <div className={cn('inline-block px-2 py-1 bg-black/50 rounded-md font-semibold text-white/90 backdrop-blur-sm border border-white/20', size === 'large' ? 'text-xs' : 'text-[10px]')}>
                {card.type}
              </div>
            </div>

            {/* Divider Line */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mb-3" />

            {/* Effect Description - Main Content */}
            <div className={cn('text-white font-medium leading-relaxed mb-auto', size === 'large' ? 'text-sm' : 'text-[11px]')}>
              {card.effect}
            </div>

            {/* Spacer */}
            <div className="flex-grow min-h-[12px]" />

            {/* Flavor Text - Bottom */}
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className={cn('text-white/60 italic leading-snug', size === 'large' ? 'text-xs' : 'text-[10px]')}>
                "{card.flavorText}"
              </div>
            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-white/60 rounded-tl" />
            <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-white/60 rounded-tr" />
            <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-white/60 rounded-bl" />
            <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-white/60 rounded-br" />

            {/* Selection Glow Effect */}
            {selected && (
              <motion.div
                className="absolute inset-0 bg-yellow-400/20 rounded-lg pointer-events-none"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
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

