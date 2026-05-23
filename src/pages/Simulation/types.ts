export interface JointAngles {
  j1: number; j2: number; j3: number; j4: number
  j5: number; j6: number; j7: number
}

export const ENV_PRESETS = [
  'apartment', 'city', 'dawn', 'forest', 'lobby',
  'night', 'park', 'studio', 'sunset', 'warehouse',
] as const
export type EnvPreset = typeof ENV_PRESETS[number]
