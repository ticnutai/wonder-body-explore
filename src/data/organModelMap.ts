export const organNodeNamePatterns: Record<string, RegExp[]> = {
  brain: [/brain/i, /cerebr/i, /cortex/i],
  eyes: [/eye/i, /ocul/i],
  ears: [/ear/i, /cochlea/i],
  heart: [/heart/i, /card/i],
  lungs: [/lung/i, /pulmo/i],
  stomach: [/stomach/i, /gastric/i],
  hands: [/hand/i, /palm/i, /finger/i],
  legs: [/leg/i, /femur/i, /tibia/i, /foot/i],
};

export const organPreferredFocus: Record<string, 'head' | 'chest' | 'abdomen' | 'legs'> = {
  brain: 'head',
  eyes: 'head',
  ears: 'head',
  heart: 'chest',
  lungs: 'chest',
  stomach: 'abdomen',
  hands: 'chest',
  legs: 'legs',
};
