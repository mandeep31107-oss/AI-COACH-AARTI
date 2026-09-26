export type Impact = 'zero' | 'low' | 'medium' | 'high';
export type ExType = 'warmup' | 'strength' | 'cardio' | 'core' | 'mobility' | 'breath' | 'cooldown';

export type RoomKey = 'kitchen' | 'living' | 'bedroom' | 'stairs' | 'balcony' | 'bathroom' | 'anywhere';

export interface Exercise {
  id: string;
  name: string;
  hindi: string;
  type: ExType;
  room: RoomKey[];
  equipment: string[];
  space: 'mat' | 'small' | 'open';
  met: number;
  impact: Impact;
  targets: string;
  cue: string;
  easier: string;
  harder: string;
  avoidIf: string[];
  seconds: number;
  reps?: string;
}

export const EQUIPMENT = [
  { key: 'none', label: 'Nothing at all', icon: 'hand-left-outline', sub: 'Just me and the floor' },
  { key: 'chair', label: 'Chair / Stool', icon: 'cube-outline', sub: 'Plastic kursi works' },
  { key: 'wall', label: 'A free wall', icon: 'tablet-portrait-outline', sub: 'Deewar support' },
  { key: 'bottles', label: 'Water bottles', icon: 'water-outline', sub: '1L = ~1kg dumbbell' },
  { key: 'towel', label: 'Towel / Dupatta', icon: 'ribbon-outline', sub: 'Your resistance band' },
  { key: 'stairs', label: 'Stairs', icon: 'trending-up-outline', sub: 'Seedhi cardio' },
  { key: 'mat', label: 'Mat / Chatai', icon: 'square-outline', sub: 'Or a folded bedsheet' },
  { key: 'bag', label: 'Atta / Rice bag', icon: 'bag-outline', sub: '5kg kettlebell' },
  { key: 'bucket', label: 'Bucket', icon: 'beaker-outline', sub: 'Adjustable weight' },
  { key: 'dumbbell', label: 'Dumbbells', icon: 'barbell-outline', sub: 'Actual weights' },
  { key: 'band', label: 'Resistance band', icon: 'git-commit-outline', sub: 'If you own one' },
  { key: 'terrace', label: 'Terrace / Chhat', icon: 'sunny-outline', sub: 'Open sky space' },
];

export const SUBSTITUTES = [
  { have: '1L water bottles', instead: 'Dumbbells (1 kg)', icon: 'water-outline' },
  { have: 'Atta / rice bag (5 kg)', instead: 'Kettlebell', icon: 'bag-outline' },
  { have: 'Dupatta or towel', instead: 'Resistance band', icon: 'ribbon-outline' },
  { have: 'Plastic chair', instead: 'Weight bench + dip station', icon: 'cube-outline' },
  { have: 'Staircase', instead: 'Stepper / treadmill', icon: 'trending-up-outline' },
  { have: 'Bucket with water', instead: 'Adjustable kettlebell', icon: 'beaker-outline' },
  { have: 'Kitchen counter', instead: 'Incline bench press', icon: 'restaurant-outline' },
  { have: 'Bedsheet on smooth floor', instead: 'Slider discs', icon: 'bed-outline' },
  { have: 'Wall + your back', instead: 'Leg press machine', icon: 'tablet-portrait-outline' },
  { have: 'Doorframe', instead: 'Stretch cage / lat rack', icon: 'exit-outline' },
];

export const ROOMS: {
  key: RoomKey;
  label: string;
  hindi: string;
  icon: string;
  blurb: string;
  tint: 'warm' | 'mint' | 'violet';
  hacks: string[];
}[] = [
  {
    key: 'kitchen',
    label: 'Kitchen',
    hindi: 'Rasoi',
    icon: 'restaurant-outline',
    blurb: 'Counter presses while the chai boils, calf raises at the stove.',
    tint: 'warm',
    hacks: [
      'Chai takes 4 minutes to boil — that is one full mini-set.',
      'Counter = incline bench. Safest push-up for beginners.',
      'Knead atta without resting your elbows for a real shoulder burn.',
    ],
  },
  {
    key: 'living',
    label: 'Living Room',
    hindi: 'Baithak',
    icon: 'tv-outline',
    blurb: 'Sofa dips, carpet core work, TV-break circuits.',
    tint: 'violet',
    hacks: [
      'Every ad break = 20 squats. A serial gives you 6 sets.',
      'Sofa edge is a dip station and an elevated push-up bench.',
      'Push the centre table aside — 6x3 ft is enough for everything.',
    ],
  },
  {
    key: 'bedroom',
    label: 'Bedroom',
    hindi: 'Kamra',
    icon: 'bed-outline',
    blurb: 'Wake-up mobility and wind-down stretches, all on the bed.',
    tint: 'mint',
    hacks: [
      'Do 10 glute bridges before you even stand up in the morning.',
      'Legs-up-the-wall for 3 minutes kills tired-leg heaviness.',
      'Spinal twist before sleep improves digestion and sleep quality.',
    ],
  },
  {
    key: 'stairs',
    label: 'Staircase',
    hindi: 'Seedhi',
    icon: 'trending-up-outline',
    blurb: 'The cheapest cardio machine in the country.',
    tint: 'warm',
    hacks: [
      '3 flights up = roughly the calorie burn of a 10-minute walk.',
      'Going down slowly builds more leg strength than going up fast.',
      'Bottom step = step-ups, calf raises and elevated push-ups.',
    ],
  },
  {
    key: 'balcony',
    label: 'Balcony / Terrace',
    hindi: 'Chhat',
    icon: 'sunny-outline',
    blurb: 'Morning sun, Surya Namaskar, fresh-air walking.',
    tint: 'mint',
    hacks: [
      '10 minutes of morning sun fixes sleep timing and mood.',
      'Walk the length of the balcony — 100 laps is a real walk.',
      'Surya Namaskar needs exactly one mat of space.',
    ],
  },
  {
    key: 'bathroom',
    label: 'Bathroom Door',
    hindi: 'Snaan-ghar',
    icon: 'water-outline',
    blurb: 'Brush-time squats. Two minutes you already spend anyway.',
    tint: 'violet',
    hacks: [
      'Brushing takes 2 minutes — that is 30 squats, every single day.',
      'Doorframe chest opener undoes hours of phone hunch.',
      'Calf raises while you wait for the geyser.',
    ],
  },
];

export const CHORE_WORKOUTS = [
  { key: 'jhadu', label: 'Jhadu (sweeping)', met: 3.3, icon: 'brush-outline', tip: 'Keep a flat back and bend at the hips — it becomes a hip-hinge set.', upgrade: 'Sweep one room in a deep squat, 60 seconds.' },
  { key: 'pocha', label: 'Pocha (mopping)', met: 3.5, icon: 'water-outline', tip: 'Hand-pocha in a squat is a legit leg and core workout.', upgrade: 'Do one room in a full squat, switch lead leg every 30s.' },
  { key: 'bartan', label: 'Bartan (dishes)', met: 2.5, icon: 'cafe-outline', tip: 'Stand tall, squeeze the glutes, stop leaning on the sink.', upgrade: '20 calf raises while rinsing.' },
  { key: 'kapde', label: 'Washing clothes', met: 3.3, icon: 'shirt-outline', tip: 'Squeezing clothes builds serious grip and forearm strength.', upgrade: 'Squat down to the bucket instead of bending over.' },
  { key: 'atta', label: 'Kneading atta', met: 3.0, icon: 'pizza-outline', tip: 'Push from the shoulders and brace the core.', upgrade: 'Knead 3 minutes without resting elbows.' },
  { key: 'cooking', label: 'Cooking / standing', met: 2.5, icon: 'flame-outline', tip: 'Standing burns about 40 more calories an hour than sitting.', upgrade: 'Single-leg balance while stirring.' },
  { key: 'stairs_chore', label: 'Stair trips', met: 6.0, icon: 'trending-up-outline', tip: 'Every trip up counts. Take two extra a day.', upgrade: 'Climb one extra floor before entering home.' },
  { key: 'sabzi', label: 'Sabzi / grocery run', met: 4.0, icon: 'basket-outline', tip: 'Carry bags evenly in both hands — that is a farmer carry.', upgrade: 'Walk to the shop instead of riding.' },
  { key: 'bachche', label: 'Childcare / lifting', met: 3.5, icon: 'happy-outline', tip: 'Lift from the legs, never the lower back.', upgrade: '10 squats while holding your child.' },
  { key: 'safai', label: 'Dusting & tidying', met: 2.8, icon: 'sparkles-outline', tip: 'Reaching overhead is free shoulder mobility.', upgrade: 'Lunge down to pick up every item.' },
];

export const EXERCISES: Exercise[] = [
  { id: 'march', name: 'March in Place', hindi: 'Ek jagah march', type: 'warmup', room: ['anywhere'], equipment: [], space: 'mat', met: 3.5, impact: 'low', targets: 'Full-body warm-up', cue: 'Lift the knees to hip height, swing the arms, breathe easy.', easier: 'Just tap toes, no knee lift.', harder: 'High knees, faster tempo.', avoidIf: [], seconds: 45 },
  { id: 'shoulder_rolls', name: 'Shoulder Rolls', hindi: 'Kandha ghumana', type: 'warmup', room: ['anywhere'], equipment: [], space: 'mat', met: 2.3, impact: 'zero', targets: 'Neck and shoulders', cue: 'Big slow circles backwards. Undo the phone-and-laptop hunch.', easier: 'Smaller circles.', harder: 'Add overhead arm reaches.', avoidIf: [], seconds: 30 },
  { id: 'neck_release', name: 'Neck Release', hindi: 'Gardan stretch', type: 'warmup', room: ['anywhere'], equipment: [], space: 'mat', met: 2.0, impact: 'zero', targets: 'Neck, upper traps', cue: 'Ear towards the shoulder, hold, breathe. Never pull.', easier: 'Hold for 10 seconds only.', harder: 'Add a gentle hand assist.', avoidIf: [], seconds: 30 },
  { id: 'hip_circles', name: 'Hip Circles', hindi: 'Kamar ghumana', type: 'warmup', room: ['anywhere'], equipment: [], space: 'mat', met: 2.8, impact: 'zero', targets: 'Hips, lower back', cue: 'Hands on the waist, draw slow circles — five each way.', easier: 'Tiny circles.', harder: 'Wider circles, slower.', avoidIf: [], seconds: 30 },
  { id: 'ankle_wrist', name: 'Ankle & Wrist Rolls', hindi: 'Joints dheele karo', type: 'warmup', room: ['anywhere'], equipment: [], space: 'mat', met: 2.0, impact: 'zero', targets: 'Joints', cue: 'Roll both ways. This is what keeps you moving at sixty.', easier: 'Half the reps.', harder: 'Add finger stretches.', avoidIf: [], seconds: 25 },
  { id: 'cat_cow', name: 'Cat and Cow', hindi: 'Marjariasana', type: 'warmup', room: ['bedroom', 'living', 'anywhere'], equipment: ['mat'], space: 'mat', met: 2.5, impact: 'zero', targets: 'Spine', cue: 'Inhale chest up, exhale round the back. Nice and slow.', easier: 'Do it seated on a chair.', harder: 'Add a 3-second hold at each end.', avoidIf: ['wrist'], seconds: 40 },

  { id: 'chair_squat', name: 'Chair Sit-to-Stand', hindi: 'Kursi squat', type: 'strength', room: ['living', 'anywhere'], equipment: ['chair'], space: 'mat', met: 4.0, impact: 'low', targets: 'Thighs, glutes', cue: 'Sit back to the chair, tap lightly, stand tall. Knees follow the toes.', easier: 'Push off your thighs with your hands.', harder: 'Hover above the seat, never touch it.', avoidIf: [], seconds: 40, reps: '10-12 reps' },
  { id: 'bodyweight_squat', name: 'Bodyweight Squat', hindi: 'Uthak-baithak', type: 'strength', room: ['anywhere'], equipment: [], space: 'mat', met: 5.0, impact: 'low', targets: 'Legs, glutes, core', cue: 'Feet shoulder-width, chest proud, sit down like the old Indian squat.', easier: 'Half depth, hold a wall.', harder: 'Pause two seconds at the bottom.', avoidIf: ['knee'], seconds: 45, reps: '12-15 reps' },
  { id: 'wall_sit', name: 'Wall Sit', hindi: 'Deewar kursi', type: 'strength', room: ['anywhere', 'bathroom'], equipment: ['wall'], space: 'mat', met: 4.5, impact: 'zero', targets: 'Quads, endurance', cue: 'Slide down the wall until the thighs are parallel. Breathe through the burn.', easier: 'Sit higher, only 20 seconds.', harder: 'Lift one heel at a time.', avoidIf: ['knee'], seconds: 40 },
  { id: 'glute_bridge', name: 'Glute Bridge', hindi: 'Setu bandha', type: 'strength', room: ['bedroom', 'living'], equipment: ['mat'], space: 'mat', met: 3.8, impact: 'zero', targets: 'Glutes, lower back', cue: 'Lying down, push through the heels, squeeze hard at the top.', easier: 'Lift halfway, hold two seconds.', harder: 'Single-leg bridge.', avoidIf: [], seconds: 40, reps: '12-15 reps' },
  { id: 'calf_raise', name: 'Calf Raises', hindi: 'Panje uthao', type: 'strength', room: ['kitchen', 'anywhere'], equipment: [], space: 'mat', met: 3.0, impact: 'low', targets: 'Calves', cue: 'Rise onto the toes, pause, lower slowly. Do it while the dal boils.', easier: 'Hold the counter for balance.', harder: 'One leg at a time.', avoidIf: [], seconds: 35, reps: '20 reps' },
  { id: 'static_lunge', name: 'Split Squat', hindi: 'Aage-peechhe lunge', type: 'strength', room: ['living', 'anywhere'], equipment: [], space: 'small', met: 5.0, impact: 'low', targets: 'Legs, balance', cue: 'One foot forward, drop the back knee straight down. Chest up.', easier: 'Hold a wall, small range.', harder: 'Back foot on a chair.', avoidIf: ['knee'], seconds: 45, reps: '8 each side' },
  { id: 'step_up', name: 'Stair Step-Ups', hindi: 'Seedhi chadhna', type: 'cardio', room: ['stairs'], equipment: ['stairs'], space: 'small', met: 6.0, impact: 'low', targets: 'Legs plus heart', cue: 'Step fully onto the stair, drive through the whole foot, alternate legs.', easier: 'Use the railing, slower pace.', harder: 'Skip a step or add a knee drive.', avoidIf: ['knee'], seconds: 50 },
  { id: 'sumo_squat', name: 'Malasana Squat Hold', hindi: 'Malasana', type: 'strength', room: ['anywhere'], equipment: [], space: 'mat', met: 4.5, impact: 'low', targets: 'Inner thighs, hips', cue: 'Wide feet, toes out, sink low. This is how our grandmothers sat daily.', easier: 'Stay high, hold a chair.', harder: 'Hold the bottom for 20 seconds.', avoidIf: ['knee'], seconds: 40 },

  { id: 'counter_pushup', name: 'Kitchen Counter Push-Up', hindi: 'Counter push-up', type: 'strength', room: ['kitchen'], equipment: [], space: 'mat', met: 3.8, impact: 'zero', targets: 'Chest, arms', cue: 'Hands on the slab, body in one line, lower the chest slowly.', easier: 'Stand more upright.', harder: 'Walk the feet further back.', avoidIf: ['wrist'], seconds: 40, reps: '10-12 reps' },
  { id: 'wall_pushup', name: 'Wall Push-Up', hindi: 'Deewar push-up', type: 'strength', room: ['anywhere'], equipment: ['wall'], space: 'mat', met: 3.2, impact: 'zero', targets: 'Chest, shoulders', cue: 'Palms on the wall at chest height. Slow down, slow up.', easier: 'Stand closer to the wall.', harder: 'Move to the kitchen counter.', avoidIf: [], seconds: 40, reps: '12 reps' },
  { id: 'knee_pushup', name: 'Knee Push-Up', hindi: 'Ghutne wala push-up', type: 'strength', room: ['living', 'bedroom'], equipment: ['mat'], space: 'mat', met: 4.5, impact: 'low', targets: 'Chest, triceps, core', cue: 'Knees down, hips in line with the shoulders, elbows at 45 degrees.', easier: 'Go back to the wall version.', harder: 'Full push-up.', avoidIf: ['wrist'], seconds: 40, reps: '8-10 reps' },
  { id: 'chair_dip', name: 'Sofa / Chair Dips', hindi: 'Kursi dips', type: 'strength', room: ['living'], equipment: ['chair'], space: 'small', met: 4.2, impact: 'low', targets: 'Triceps, shoulders', cue: 'Hands on the edge behind you, bend the elbows straight back.', easier: 'Bend the knees, small range.', harder: 'Straighten the legs out.', avoidIf: ['shoulder', 'wrist'], seconds: 40, reps: '10 reps' },
  { id: 'bottle_press', name: 'Bottle Shoulder Press', hindi: 'Bottle press', type: 'strength', room: ['anywhere'], equipment: ['bottles'], space: 'mat', met: 4.0, impact: 'zero', targets: 'Shoulders', cue: 'Press both bottles overhead, ribs down, no arching the back.', easier: 'Use half-filled bottles.', harder: 'Three-second lowering.', avoidIf: ['shoulder'], seconds: 40, reps: '12 reps' },
  { id: 'bottle_row', name: 'Bent-Over Bottle Row', hindi: 'Bottle row', type: 'strength', room: ['anywhere'], equipment: ['bottles'], space: 'mat', met: 4.2, impact: 'zero', targets: 'Back, posture', cue: 'Hinge at the hips, flat back, pull the elbows past your ribs.', easier: 'One arm, supported on a chair.', harder: 'Use the atta bag instead.', avoidIf: ['back'], seconds: 40, reps: '12 reps' },
  { id: 'towel_pulldown', name: 'Towel Pull-Apart', hindi: 'Dupatta khinchna', type: 'strength', room: ['anywhere'], equipment: ['towel'], space: 'mat', met: 3.2, impact: 'zero', targets: 'Upper back, posture', cue: 'Hold the towel tight, pull apart, squeeze the shoulder blades.', easier: 'Wider grip.', harder: 'Narrow grip with a 3-second hold.', avoidIf: [], seconds: 35 },
  { id: 'bag_carry', name: 'Atta Bag Farmer Carry', hindi: 'Atta bag carry', type: 'strength', room: ['anywhere'], equipment: ['bag'], space: 'small', met: 4.5, impact: 'low', targets: 'Grip, core, traps', cue: 'Walk tall with the bag, shoulders back, small steps.', easier: 'Use a lighter bag.', harder: 'Hold on one side only.', avoidIf: ['back'], seconds: 45 },

  { id: 'dead_bug', name: 'Dead Bug', hindi: 'Core control', type: 'core', room: ['bedroom', 'living'], equipment: ['mat'], space: 'mat', met: 3.0, impact: 'zero', targets: 'Deep core', cue: 'Lower back glued to the floor. Opposite arm and leg, slow.', easier: 'Move only the legs.', harder: 'Extend fully, pause two seconds.', avoidIf: [], seconds: 40 },
  { id: 'plank', name: 'Forearm Plank', hindi: 'Plank', type: 'core', room: ['living', 'bedroom'], equipment: ['mat'], space: 'mat', met: 3.5, impact: 'zero', targets: 'Whole core', cue: 'Elbows under the shoulders, squeeze the glutes, do not sag. Breathe.', easier: 'Knees down, or plank on the counter.', harder: 'Lift one foot for five seconds each.', avoidIf: ['back', 'wrist'], seconds: 30 },
  { id: 'side_plank', name: 'Side Plank on Knees', hindi: 'Side plank', type: 'core', room: ['living', 'bedroom'], equipment: ['mat'], space: 'mat', met: 3.3, impact: 'zero', targets: 'Obliques', cue: 'Stack the shoulder over the elbow, lift the hips, hold steady.', easier: 'Keep the bottom knee down.', harder: 'Straighten the legs.', avoidIf: ['shoulder'], seconds: 30 },
  { id: 'heel_taps', name: 'Heel Taps', hindi: 'Heel tap', type: 'core', room: ['bedroom', 'living'], equipment: ['mat'], space: 'mat', met: 3.0, impact: 'zero', targets: 'Obliques', cue: 'Lying down, reach side to side and tap the heels.', easier: 'Smaller reach.', harder: 'Lift the shoulders higher.', avoidIf: ['back'], seconds: 35 },
  { id: 'standing_crunch', name: 'Standing Knee Crunch', hindi: 'Khade-khade crunch', type: 'core', room: ['anywhere', 'kitchen'], equipment: [], space: 'mat', met: 3.8, impact: 'low', targets: 'Core, no floor needed', cue: 'Elbow to the opposite knee. Perfect when the floor is still wet.', easier: 'Lower the knee lift.', harder: 'Speed it up for 30 seconds.', avoidIf: [], seconds: 40 },
  { id: 'bird_dog', name: 'Bird Dog', hindi: 'Santulan', type: 'core', room: ['bedroom', 'living'], equipment: ['mat'], space: 'mat', met: 3.0, impact: 'zero', targets: 'Core and back health', cue: 'Opposite arm and leg out, hold three seconds. Great for back pain.', easier: 'Extend only the arm.', harder: 'Add a slow elbow-to-knee crunch.', avoidIf: ['wrist'], seconds: 40 },

  { id: 'step_touch', name: 'Side Step Touch', hindi: 'Side step', type: 'cardio', room: ['anywhere'], equipment: [], space: 'small', met: 4.5, impact: 'low', targets: 'Heart rate, silent', cue: 'Step side to side with arm sweeps. Zero noise, neighbours safe.', easier: 'Slow down, no arms.', harder: 'Add a squat every fourth step.', avoidIf: [], seconds: 45 },
  { id: 'silent_jacks', name: 'Silent Jacks', hindi: 'Bina awaaz jacks', type: 'cardio', room: ['anywhere'], equipment: [], space: 'small', met: 6.0, impact: 'low', targets: 'Full-body cardio', cue: 'Step out instead of jumping. Same burn, no thud downstairs.', easier: 'Arms only, half range.', harder: 'Speed up to a quick tempo.', avoidIf: [], seconds: 45 },
  { id: 'shadow_box', name: 'Shadow Boxing', hindi: 'Mukka punch', type: 'cardio', room: ['anywhere'], equipment: [], space: 'small', met: 5.5, impact: 'low', targets: 'Cardio and stress release', cue: 'Punch out the frustration of the day. Guard up, exhale on each punch.', easier: 'Slow punches, no legs.', harder: 'Add slips and faster combos.', avoidIf: ['shoulder'], seconds: 45 },
  { id: 'stair_climb', name: 'Stair Climb Intervals', hindi: 'Seedhi cardio', type: 'cardio', room: ['stairs'], equipment: ['stairs'], space: 'small', met: 8.0, impact: 'medium', targets: 'Serious cardio', cue: 'Up steady, down slow and controlled. Rest 30 seconds and repeat.', easier: 'One flight at walking pace.', harder: 'Two steps at a time going up.', avoidIf: ['knee', 'heart'], seconds: 60 },
  { id: 'walk_place', name: 'Brisk Walk in Place', hindi: 'Tez chalna', type: 'cardio', room: ['balcony', 'anywhere'], equipment: [], space: 'mat', met: 4.0, impact: 'low', targets: 'Easy cardio', cue: 'Pump the arms, chin up. Put on a song you love.', easier: 'Slow, hold a chair.', harder: 'Add knee lifts.', avoidIf: [], seconds: 60 },
  { id: 'squat_punch', name: 'Squat and Punch', hindi: 'Squat punch', type: 'cardio', room: ['anywhere'], equipment: [], space: 'small', met: 6.5, impact: 'low', targets: 'Full-body burner', cue: 'Squat down, stand and punch across the body. Big exhale.', easier: 'Quarter squat only.', harder: 'Hold water bottles.', avoidIf: ['knee'], seconds: 45 },

  { id: 'surya', name: 'Surya Namaskar (slow)', hindi: 'Surya Namaskar', type: 'mobility', room: ['balcony', 'bedroom', 'living'], equipment: ['mat'], space: 'mat', met: 4.0, impact: 'low', targets: 'Full-body flow', cue: 'One round, breathing with every movement. Quality over speed.', easier: 'Do the standing half only.', harder: 'Add two more rounds.', avoidIf: ['back'], seconds: 60 },
  { id: 'child_pose', name: 'Balasana Rest', hindi: 'Balasana', type: 'cooldown', room: ['bedroom', 'living'], equipment: ['mat'], space: 'mat', met: 2.0, impact: 'zero', targets: 'Back, hips, calm', cue: 'Knees wide, forehead down, let the shoulders melt.', easier: 'Put a pillow under your chest.', harder: 'Walk the hands to each side.', avoidIf: [], seconds: 40 },
  { id: 'hamstring_stretch', name: 'Seated Forward Fold', hindi: 'Paschimottanasana', type: 'cooldown', room: ['anywhere'], equipment: [], space: 'mat', met: 2.2, impact: 'zero', targets: 'Hamstrings, low back', cue: 'Hinge from the hips, reach for the toes without forcing anything.', easier: 'Bend the knees a little.', harder: 'Hold for 45 seconds.', avoidIf: [], seconds: 40 },
  { id: 'chest_door', name: 'Doorframe Chest Opener', hindi: 'Chest kholo', type: 'cooldown', room: ['anywhere'], equipment: [], space: 'mat', met: 2.2, impact: 'zero', targets: 'Chest, posture', cue: 'Forearm on the frame, step through gently. Undoes the desk slouch.', easier: 'Lower arm position.', harder: 'Higher arm, deeper step.', avoidIf: ['shoulder'], seconds: 35 },
  { id: 'hip_flexor', name: 'Kneeling Hip Flexor Stretch', hindi: 'Hip stretch', type: 'cooldown', room: ['bedroom', 'living'], equipment: ['mat'], space: 'mat', met: 2.3, impact: 'zero', targets: 'Hip flexors, the sitting fix', cue: 'Tuck the tailbone and push the hip forward. Feel the front of the thigh.', easier: 'Put a towel under the knee.', harder: 'Raise the same-side arm.', avoidIf: ['knee'], seconds: 40 },
  { id: 'spinal_twist', name: 'Lying Spinal Twist', hindi: 'Supta Matsyendrasana', type: 'cooldown', room: ['bedroom'], equipment: ['mat'], space: 'mat', met: 2.0, impact: 'zero', targets: 'Spine, digestion', cue: 'Drop the knees to one side, look the other way. Perfect before sleep.', easier: 'Stack a pillow under the knees.', harder: 'Hold 60 seconds each side.', avoidIf: [], seconds: 45 },
  { id: 'legs_up_wall', name: 'Legs Up The Wall', hindi: 'Viparita Karani', type: 'cooldown', room: ['bedroom'], equipment: ['wall'], space: 'mat', met: 1.8, impact: 'zero', targets: 'Recovery, tired legs', cue: 'Lie down and rest the legs up the wall. Best thing after a long day standing.', easier: 'Bend the knees slightly.', harder: 'Stay for five minutes.', avoidIf: [], seconds: 60 },
  { id: 'breath_478', name: '4-7-8 Breathing', hindi: 'Pranayam', type: 'breath', room: ['anywhere'], equipment: [], space: 'mat', met: 1.5, impact: 'zero', targets: 'Nervous system', cue: 'Inhale for four, hold for seven, exhale for eight. Three rounds drops stress fast.', easier: 'Use 4-4-6 counts.', harder: 'Do six rounds.', avoidIf: [], seconds: 60 },
  { id: 'desk_reset', name: 'Desk Posture Reset', hindi: 'Posture reset', type: 'mobility', room: ['anywhere'], equipment: ['chair'], space: 'mat', met: 2.5, impact: 'zero', targets: 'Neck, spine, eyes', cue: 'Stand, reach up, arch gently, roll the shoulders, look far away for 20 seconds.', easier: 'Do it all seated.', harder: 'Add ten standing squats.', avoidIf: [], seconds: 45 },
];

export const byId = (id: string) => EXERCISES.find((e) => e.id === id);

export const LIMITATIONS = [
  { key: 'knee', label: 'Knee pain', icon: 'walk-outline' },
  { key: 'back', label: 'Lower back pain', icon: 'body-outline' },
  { key: 'shoulder', label: 'Shoulder / neck issue', icon: 'accessibility-outline' },
  { key: 'wrist', label: 'Wrist pain', icon: 'hand-left-outline' },
  { key: 'pcos', label: 'PCOS / hormonal', icon: 'ellipse-outline' },
  { key: 'thyroid', label: 'Thyroid', icon: 'medkit-outline' },
  { key: 'asthma', label: 'Asthma / breathing', icon: 'cloud-outline' },
  { key: 'heart', label: 'BP / heart condition', icon: 'heart-outline' },
  { key: 'postpartum', label: 'Postpartum', icon: 'flower-outline' },
  { key: 'obesity', label: 'Higher weight, joints hurt', icon: 'fitness-outline' },
  { key: 'none', label: 'Nothing, I am fine', icon: 'checkmark-circle-outline' },
];

export const BARRIERS = [
  { key: 'no_time', label: 'I genuinely have no time', icon: 'time-outline', reframe: 'Then we will never ask for an hour. We steal four minutes, three times a day.' },
  { key: 'tired', label: 'I am always exhausted', icon: 'battery-dead-outline', reframe: 'Tired days get a five-minute recovery flow, not a bootcamp. Movement gives energy back.' },
  { key: 'no_space', label: 'No space at home', icon: 'resize-outline', reframe: 'A 6x3 ft patch — one chatai — is all your routine will ever need.' },
  { key: 'no_equipment', label: 'No gym, no equipment', icon: 'barbell-outline', reframe: 'Your atta bag, bottles and staircase are already a full gym. I will show you how.' },
  { key: 'judged', label: 'I feel judged or shy', icon: 'eye-off-outline', reframe: 'No cameras, no leaderboards, no comparison. Nobody sees this but you.' },
  { key: 'family', label: 'Family and chores come first', icon: 'home-outline', reframe: 'Then your chores become the workout. Jhadu-pocha counts here, and we log it.' },
  { key: 'no_motivation', label: 'I lose motivation in a week', icon: 'trending-down-outline', reframe: 'We design for your worst day, not your best. A two-minute day still keeps the streak alive.' },
  { key: 'guilt', label: 'I feel guilty taking time for me', icon: 'heart-dislike-outline', reframe: 'You are not stealing time. A stronger you serves everyone at home better.' },
  { key: 'neighbours', label: 'Neighbours hear every jump', icon: 'volume-mute-outline', reframe: 'Everything I give you is silent. Zero jumping, zero thuds.' },
  { key: 'weather', label: 'Too hot or cold to go out', icon: 'thunderstorm-outline', reframe: 'Indoors is the whole plan. Weather never gets a vote.' },
  { key: 'restart', label: 'I start and stop again and again', icon: 'refresh-outline', reframe: 'Restarting is not failure, it is the actual skill. You restarted today, so you are in.' },
];

export const GOALS = [
  { key: 'lose_weight', label: 'Lose weight', icon: 'trending-down-outline' },
  { key: 'more_energy', label: 'More daily energy', icon: 'flash-outline' },
  { key: 'get_stronger', label: 'Get stronger', icon: 'barbell-outline' },
  { key: 'flexibility', label: 'Flexibility & mobility', icon: 'accessibility-outline' },
  { key: 'stress_relief', label: 'Stress relief', icon: 'leaf-outline' },
  { key: 'stay_active', label: 'Just stay active', icon: 'walk-outline' },
  { key: 'posture', label: 'Fix posture / back', icon: 'body-outline' },
];

export const CHORES = [
  { key: 'jhadu', label: 'Jhadu / sweeping' },
  { key: 'pocha', label: 'Pocha / mopping' },
  { key: 'bartan', label: 'Dishes' },
  { key: 'cooking', label: 'Cooking' },
  { key: 'kapde', label: 'Laundry' },
  { key: 'bachche', label: 'Childcare' },
  { key: 'elders', label: 'Elder care' },
  { key: 'sabzi', label: 'Grocery runs' },
  { key: 'atta', label: 'Kneading atta' },
  { key: 'none', label: 'Barely any' },
];

export const SLOTS = [
  { key: 'early', label: 'Early morning', time: '5:30 - 7:00 AM', icon: 'partly-sunny-outline' },
  { key: 'morning', label: 'After morning chores', time: '9:00 - 11:00 AM', icon: 'sunny-outline' },
  { key: 'lunch', label: 'Lunch break', time: '1:00 - 2:30 PM', icon: 'restaurant-outline' },
  { key: 'evening', label: 'Evening', time: '5:00 - 7:30 PM', icon: 'cloudy-night-outline' },
  { key: 'night', label: 'After dinner', time: '8:30 - 10:30 PM', icon: 'moon-outline' },
];

export const FOOD_PREFS = [
  { key: 'roti_sabzi', label: 'Roti-sabzi daily' },
  { key: 'rice_heavy', label: 'Rice is my main meal' },
  { key: 'tea_lover', label: 'Chai 3+ times a day' },
  { key: 'sweet_tooth', label: 'Mithai / sweet tooth' },
  { key: 'skip_breakfast', label: 'I skip breakfast' },
  { key: 'late_dinner', label: 'Dinner after 9:30 PM' },
  { key: 'outside_food', label: 'Outside food often' },
  { key: 'fasting', label: 'I fast (vrat) weekly' },
  { key: 'dairy', label: 'Lots of milk / dahi' },
  { key: 'protein_low', label: 'Hardly any dal or eggs' },
];

export const DIETS = [
  { key: 'veg', label: 'Vegetarian', icon: 'leaf-outline' },
  { key: 'jain', label: 'Jain', icon: 'flower-outline' },
  { key: 'egg', label: 'Eggetarian', icon: 'egg-outline' },
  { key: 'nonveg', label: 'Non-vegetarian', icon: 'restaurant-outline' },
  { key: 'vegan', label: 'Vegan', icon: 'nutrition-outline' },
];
