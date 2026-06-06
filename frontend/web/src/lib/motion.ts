export const motionTokens = {
  fast:          0.15,
  standard:      0.25,
  deliberate:    0.45,
  contemplative: 0.7,

  easeOut:            [0.16, 1, 0.3, 1] as const,
  easeIn:             [0.7, 0, 0.84, 0] as const,
  spring:             { type: 'spring' as const, stiffness: 80, damping: 20 },
  contemplativeSpring:{ type: 'spring' as const, stiffness: 35, damping: 18 },

  fadeUp: {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideLeft: {
    hidden:  { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden:  { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
  },
} as const;
