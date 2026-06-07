import type {
  BeginnerLesson,
  BudgetMeal,
  ExerciseDef,
  FoodItem,
  PartnerCandidate,
  ProgramDay,
  QuickWorkout,
} from '../store/types'

/* Stable Unsplash imagery */
export const img = {
  heroWorkout: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=70',
  pushDay: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=70',
  pullDay: 'https://images.unsplash.com/photo-1534368786749-b63e05c92392?auto=format&fit=crop&w=800&q=70',
  legDay: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=70',
  community: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=70',
  mountain: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=70',
  oats: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=200&q=70',
  chicken: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=200&q=70',
  yogurt: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=200&q=70',
  salmon: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=200&q=70',
  bench: 'https://images.unsplash.com/photo-1534368786749-b63e05c92392?auto=format&fit=crop&w=200&q=70',
  incline: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=200&q=70',
  shoulder: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=200&q=70',
  cable: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=70',
  tricep: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=200&q=70',
  squat: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=200&q=70',
  deadlift: 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?auto=format&fit=crop&w=200&q=70',
  row: 'https://images.unsplash.com/photo-1598266663439-2056e6900339?auto=format&fit=crop&w=200&q=70',
  curl: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=200&q=70',
  legpress: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=200&q=70',
  mealPrep: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=70',
  postPR: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=70',
  rice: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=200&q=70',
  eggs: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=200&q=70',
}

/* --------------------------- Exercises --------------------------- */
export const EXERCISES: ExerciseDef[] = [
  { id: 'bench', name: 'Barbell Bench Press', muscle: 'Chest', equipment: ['full-gym'], image: img.bench, bodyweightAlt: 'Push-Ups' },
  { id: 'incline', name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: ['full-gym', 'home-basic'], image: img.incline, bodyweightAlt: 'Decline Push-Ups' },
  { id: 'shoulder', name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', equipment: ['full-gym', 'home-basic'], image: img.shoulder, bodyweightAlt: 'Pike Push-Ups' },
  { id: 'cablefly', name: 'Cable Fly', muscle: 'Chest', equipment: ['full-gym'], image: img.cable, bodyweightAlt: 'Band Fly' },
  { id: 'tricep', name: 'Rope Tricep Pushdown', muscle: 'Triceps', equipment: ['full-gym'], image: img.tricep, bodyweightAlt: 'Bench Dips' },
  { id: 'squat', name: 'Barbell Back Squat', muscle: 'Legs', equipment: ['full-gym'], image: img.squat, bodyweightAlt: 'Bulgarian Split Squat' },
  { id: 'deadlift', name: 'Deadlift', muscle: 'Back', equipment: ['full-gym'], image: img.deadlift, bodyweightAlt: 'Single-Leg RDL' },
  { id: 'pulldown', name: 'Lat Pulldown', muscle: 'Back', equipment: ['full-gym'], image: img.row, bodyweightAlt: 'Pull-Ups' },
  { id: 'row', name: 'Seated Cable Row', muscle: 'Back', equipment: ['full-gym'], image: img.row, bodyweightAlt: 'Inverted Row' },
  { id: 'curl', name: 'Dumbbell Bicep Curl', muscle: 'Biceps', equipment: ['full-gym', 'home-basic'], image: img.curl, bodyweightAlt: 'Band Curl' },
  { id: 'ohp', name: 'Overhead Press', muscle: 'Shoulders', equipment: ['full-gym'], image: img.shoulder, bodyweightAlt: 'Pike Push-Ups' },
  { id: 'legpress', name: 'Leg Press', muscle: 'Legs', equipment: ['full-gym'], image: img.legpress, bodyweightAlt: 'Jump Squats' },
  { id: 'rdl', name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: ['full-gym', 'home-basic'], image: img.deadlift, bodyweightAlt: 'Single-Leg RDL' },
  { id: 'lateral', name: 'Lateral Raise', muscle: 'Shoulders', equipment: ['full-gym', 'home-basic'], image: img.shoulder, bodyweightAlt: 'Band Lateral Raise' },
]

export const exById = (id: string) => EXERCISES.find((e) => e.id === id)

/* ---------------------- Technique cue cards ---------------------- */
/* Short, plain-language coaching for nervous beginners. */
export interface ExerciseDetail {
  cues: string[]
  commonMistake: string
  ifTaken: string
  beginnerFriendly: boolean
}

export const EXERCISE_DETAIL: Record<string, ExerciseDetail> = {
  bench: {
    cues: ['Plant your feet and squeeze the bar tight', 'Lower to mid chest, elbows tucked a little', 'Press up and slightly back toward your face'],
    commonMistake: 'Flaring elbows straight out to the sides, which stresses the shoulders.',
    ifTaken: 'No free bench? Use a dumbbell press on any flat bench, or push ups as a clean stand in.',
    beginnerFriendly: false,
  },
  incline: {
    cues: ['Set the bench to a low incline, around 30 degrees', 'Press the dumbbells up and slightly together', 'Control the way down, no bouncing'],
    commonMistake: 'Setting the incline too steep and turning it into a shoulder press.',
    ifTaken: 'Any adjustable bench works. If all are busy, do incline push ups with hands on a bench.',
    beginnerFriendly: true,
  },
  shoulder: {
    cues: ['Start with dumbbells at ear height', 'Press up without shrugging', 'Stop just short of locking out'],
    commonMistake: 'Leaning back and turning it into an incline press.',
    ifTaken: 'Pike push ups against a wall hit the same muscles with no equipment.',
    beginnerFriendly: true,
  },
  cablefly: {
    cues: ['Soft bend in the elbows, hold it the whole set', 'Bring your hands together in front of your chest', 'Feel the stretch, then squeeze'],
    commonMistake: 'Bending the elbows more as you pull, which turns it into a press.',
    ifTaken: 'A resistance band anchored behind you does the same job.',
    beginnerFriendly: true,
  },
  tricep: {
    cues: ['Keep elbows pinned to your sides', 'Push the rope down and slightly apart at the bottom', 'Control it back to chest height'],
    commonMistake: 'Letting the elbows drift forward so the shoulders take over.',
    ifTaken: 'Bench dips with your hands behind you work well anywhere.',
    beginnerFriendly: true,
  },
  squat: {
    cues: ['Brace your core before you go down', 'Sit between your hips, knees track over toes', 'Drive up through mid foot'],
    commonMistake: 'Letting the heels lift or the knees cave inward.',
    ifTaken: 'Goblet squats with one dumbbell, or bodyweight squats, are a great swap.',
    beginnerFriendly: false,
  },
  deadlift: {
    cues: ['Bar over mid foot, shins almost touching', 'Flat back, take the slack out of the bar', 'Stand up tall, push the floor away'],
    commonMistake: 'Rounding the lower back or jerking the bar off the floor.',
    ifTaken: 'Romanian deadlifts with dumbbells let you train the same pattern lighter.',
    beginnerFriendly: false,
  },
  pulldown: {
    cues: ['Set the thigh pad so you stay seated', 'Pull the bar to your upper chest', 'Lead with the elbows, not the hands'],
    commonMistake: 'Leaning way back and using momentum instead of your back.',
    ifTaken: 'Assisted pull ups or a band around a bar gives the same movement.',
    beginnerFriendly: true,
  },
  row: {
    cues: ['Sit tall with a slight lean back', 'Pull the handle to your belly button', 'Squeeze your shoulder blades together'],
    commonMistake: 'Rounding forward and yanking with the arms only.',
    ifTaken: 'A single arm dumbbell row on a bench is an easy alternative.',
    beginnerFriendly: true,
  },
  curl: {
    cues: ['Elbows stay by your sides', 'Curl up under control', 'Lower slowly, all the way down'],
    commonMistake: 'Swinging the body to throw the weight up.',
    ifTaken: 'Any dumbbells or a band work. No swap needed.',
    beginnerFriendly: true,
  },
  ohp: {
    cues: ['Bar on your front shoulders, core braced', 'Press up and move your head through at the top', 'Lock out with the bar over your mid foot'],
    commonMistake: 'Overarching the lower back to lean into the press.',
    ifTaken: 'Seated dumbbell press or pike push ups cover the same muscles.',
    beginnerFriendly: false,
  },
  legpress: {
    cues: ['Feet shoulder width on the platform', 'Lower until knees reach about 90 degrees', 'Press through your whole foot, no locking hard'],
    commonMistake: 'Letting the lower back round off the pad at the bottom.',
    ifTaken: 'Goblet squats or walking lunges are a strong substitute.',
    beginnerFriendly: true,
  },
  rdl: {
    cues: ['Soft knees, push your hips back', 'Keep the weights close to your legs', 'Feel the hamstrings, stand up tall'],
    commonMistake: 'Turning it into a squat by bending the knees too much.',
    ifTaken: 'Dumbbells or a single barbell both work. Pick whatever is free.',
    beginnerFriendly: true,
  },
  lateral: {
    cues: ['Tiny bend in the elbows', 'Lead with your elbows out to the sides', 'Stop at shoulder height, lower slowly'],
    commonMistake: 'Going too heavy and shrugging the weight up.',
    ifTaken: 'A band under your feet gives smooth resistance with no dumbbells.',
    beginnerFriendly: true,
  },
}

export const exerciseDetail = (id: string): ExerciseDetail =>
  EXERCISE_DETAIL[id] ?? {
    cues: ['Move under control', 'Full range of motion', 'Breathe out on the effort'],
    commonMistake: 'Rushing the reps instead of staying controlled.',
    ifTaken: 'Pick a similar machine or a dumbbell variation that is free.',
    beginnerFriendly: true,
  }

/* Plate increments for adaptive progression (kg) */
export const INCREMENT: Record<string, number> = {
  bench: 2.5, squat: 5, deadlift: 5, ohp: 2.5, row: 2.5, pulldown: 2.5, legpress: 5, rdl: 2.5,
  incline: 2, shoulder: 2, cablefly: 1.25, tricep: 2.5, curl: 1.25, lateral: 1.25,
}
export const incrementFor = (id: string) => INCREMENT[id] ?? 2.5

/* --------------------- Program (PPL split) ----------------------- */
export const PROGRAM: ProgramDay[] = [
  { id: 'p-push', day: 'Mon', name: 'Push Day', focus: 'Chest · Shoulders · Triceps', exerciseIds: ['bench', 'incline', 'shoulder', 'cablefly', 'tricep'] },
  { id: 'p-pull', day: 'Tue', name: 'Pull Day', focus: 'Back · Biceps', exerciseIds: ['deadlift', 'pulldown', 'row', 'curl'] },
  { id: 'p-legs', day: 'Wed', name: 'Leg Day', focus: 'Quads · Hamstrings · Glutes', exerciseIds: ['squat', 'legpress', 'rdl'] },
  { id: 'p-rest', day: 'Thu', name: 'Rest / Mobility', focus: 'Active recovery', rest: true, exerciseIds: [] },
  { id: 'p-upper', day: 'Fri', name: 'Upper Body', focus: 'Strength focus', exerciseIds: ['bench', 'ohp', 'row', 'lateral', 'curl'] },
  { id: 'p-lower', day: 'Sat', name: 'Lower Body', focus: 'Hypertrophy', exerciseIds: ['squat', 'rdl', 'legpress'] },
]

/* The rotating session order used to generate history */
export const SPLIT_ROTATION = ['p-push', 'p-pull', 'p-legs', 'p-rest', 'p-upper', 'p-lower', 'p-rest']

/* Baseline working weights (kg) at day 1, for progressive overload sim */
export const BASE_WEIGHTS: Record<string, number> = {
  bench: 70, incline: 20, shoulder: 18, cablefly: 13, tricep: 27,
  squat: 95, deadlift: 120, pulldown: 50, row: 45, curl: 12,
  ohp: 45, legpress: 140, rdl: 70, lateral: 8,
}

export const REP_TARGETS: Record<string, string> = {
  bench: '6–8', incline: '8–10', shoulder: '8–10', cablefly: '10–12', tricep: '12–15',
  squat: '5–8', deadlift: '5', pulldown: '8–12', row: '8–12', curl: '10–12',
  ohp: '6–8', legpress: '10–12', rdl: '8–10', lateral: '12–15',
}

export const SET_TARGETS: Record<string, number> = {
  bench: 4, incline: 3, shoulder: 3, cablefly: 3, tricep: 3,
  squat: 4, deadlift: 3, pulldown: 3, row: 3, curl: 3,
  ohp: 4, legpress: 3, rdl: 3, lateral: 3,
}

/* --------------------------- Foods ------------------------------- */
export const FOODS: FoodItem[] = [
  { id: 'f-oats', name: 'Oats with Protein, Berries & Banana', serving: '1 bowl', kcal: 512, p: 32, c: 68, f: 12, barcode: '5012345600012', budget: true },
  { id: 'f-chicken', name: 'Chicken, Rice & Veggies', serving: '1 plate', kcal: 645, p: 48, c: 72, f: 18, barcode: '5012345600029', budget: true },
  { id: 'f-yogurt', name: 'Greek Yogurt & Berries', serving: '1 cup', kcal: 210, p: 20, c: 15, f: 6, barcode: '5012345600036' },
  { id: 'f-salmon', name: 'Salmon, Potatoes & Green Beans', serving: '1 plate', kcal: 525, p: 42, c: 46, f: 14, barcode: '5012345600043' },
  { id: 'f-eggs', name: 'Scrambled Eggs on Toast', serving: '2 eggs + 2 toast', kcal: 340, p: 22, c: 28, f: 16, barcode: '5012345600050', budget: true },
  { id: 'f-rice', name: 'White Rice', serving: '1 cup cooked', kcal: 205, p: 4, c: 45, f: 0, budget: true },
  { id: 'f-pbsand', name: 'Peanut Butter Sandwich', serving: '1 sandwich', kcal: 380, p: 14, c: 42, f: 18, budget: true },
  { id: 'f-shake', name: 'Whey Protein Shake', serving: '1 scoop + water', kcal: 130, p: 25, c: 4, f: 2, barcode: '5012345600067' },
  { id: 'f-banana', name: 'Banana', serving: '1 medium', kcal: 105, p: 1, c: 27, f: 0, budget: true },
  { id: 'f-pasta', name: 'Pasta Bolognese', serving: '1 bowl', kcal: 560, p: 30, c: 70, f: 16, budget: true },
  { id: 'f-tuna', name: 'Tuna Pasta', serving: '1 bowl', kcal: 480, p: 38, c: 58, f: 8, budget: true },
  { id: 'f-noodles', name: 'Instant Noodles + Egg', serving: '1 pack', kcal: 420, p: 14, c: 60, f: 14, budget: true },
  { id: 'f-bagel', name: 'Bagel with Cream Cheese', serving: '1 bagel', kcal: 360, p: 12, c: 54, f: 11 },
  { id: 'f-burrito', name: 'Chicken Burrito', serving: '1 burrito', kcal: 680, p: 40, c: 72, f: 22 },
  { id: 'f-apple', name: 'Apple', serving: '1 medium', kcal: 95, p: 0, c: 25, f: 0, budget: true },
  { id: 'f-coffee', name: 'Flat White', serving: '1 cup', kcal: 120, p: 7, c: 10, f: 6 },
]

export const foodById = (id: string) => FOODS.find((f) => f.id === id)

/* ------------------------ Quick workouts ------------------------- */
export const QUICK_WORKOUTS: QuickWorkout[] = [
  { id: 'q-dorm', name: 'Dorm Room Pump', minutes: 15, focus: 'Full body · no equipment', exercises: ['Push-Ups', 'Bodyweight Squats', 'Plank', 'Mountain Climbers'] },
  { id: 'q-core', name: 'Express Core', minutes: 10, focus: 'Abs · core', exercises: ['Plank', 'Leg Raises', 'Bicycle Crunches', 'Russian Twists'] },
  { id: 'q-upper', name: 'Quick Upper', minutes: 20, focus: 'Chest · back · arms', exercises: ['Push-Ups', 'Pull-Ups', 'Pike Push-Ups', 'Dips'] },
  { id: 'q-mobility', name: 'Desk Recovery', minutes: 8, focus: 'Mobility · stretch', exercises: ['Cat-Cow', 'Hip Openers', 'Shoulder Rolls', 'Hamstring Stretch'] },
]

/* Universities for the leaderboard flavour */
export const UNIVERSITIES = [
  'State University',
  'City College',
  'Tech Institute',
  'Metro University',
]

export const DORMS = ['West Hall', 'East Hall', 'North Court', 'Riverside', 'Off campus']
export const SOCIETIES = ['Lifting Society', 'Run Club', 'Climbing Society', 'Football', 'None yet']
export const COHORTS = ['Class of 2026', 'Class of 2027', 'Class of 2028', 'Postgrad']

/* ----------------------- Budget nutrition ------------------------ */
/* Real cheap, high protein meals with rough costs and a grocery view. */
export const BUDGET_MEALS: BudgetMeal[] = [
  {
    id: 'bm-chickenrice',
    name: 'Chicken, Rice & Frozen Veg',
    image: img.chicken,
    cost: 2.4,
    serves: 1,
    kcal: 620,
    p: 48,
    c: 72,
    f: 14,
    ingredients: [
      { item: 'Chicken thigh (150g)', cost: 1.1 },
      { item: 'Rice (uncooked 80g)', cost: 0.3 },
      { item: 'Frozen mixed veg (150g)', cost: 0.6 },
      { item: 'Oil and spices', cost: 0.4 },
    ],
    steps: ['Boil the rice', 'Pan fry the chicken with spices', 'Steam or microwave the veg', 'Combine and season'],
    cookOnce: 'Cook three portions of chicken and rice at once. Reheat for lunch and dinner across two days.',
    tags: ['High protein', 'Meal prep', 'Under $3'],
  },
  {
    id: 'bm-eggsbeans',
    name: 'Eggs & Beans on Toast',
    image: img.eggs,
    cost: 1.1,
    serves: 1,
    kcal: 480,
    p: 28,
    c: 52,
    f: 16,
    ingredients: [
      { item: '3 eggs', cost: 0.6 },
      { item: 'Half a tin of beans', cost: 0.3 },
      { item: '2 slices wholemeal bread', cost: 0.2 },
    ],
    steps: ['Toast the bread', 'Scramble or fry the eggs', 'Warm the beans', 'Plate it up'],
    cookOnce: 'Boil six eggs at the start of the week for fast protein you can grab cold.',
    tags: ['High protein', '5 minutes', 'Under $2'],
  },
  {
    id: 'bm-tunapasta',
    name: 'Tuna Pasta',
    image: img.mealPrep,
    cost: 1.6,
    serves: 1,
    kcal: 540,
    p: 40,
    c: 66,
    f: 10,
    ingredients: [
      { item: 'Pasta (uncooked 90g)', cost: 0.4 },
      { item: 'Tin of tuna', cost: 0.9 },
      { item: 'Sweetcorn and light mayo', cost: 0.3 },
    ],
    steps: ['Boil the pasta', 'Drain and mix in tuna', 'Add sweetcorn and a spoon of mayo', 'Season and eat hot or cold'],
    cookOnce: 'Make a big batch and keep it cold. It travels well to lectures.',
    tags: ['High protein', 'No cook option', 'Under $2'],
  },
  {
    id: 'bm-oats',
    name: 'Protein Overnight Oats',
    image: img.oats,
    cost: 0.9,
    serves: 1,
    kcal: 430,
    p: 30,
    c: 58,
    f: 9,
    ingredients: [
      { item: 'Oats (60g)', cost: 0.2 },
      { item: 'Scoop of whey', cost: 0.5 },
      { item: 'Milk and a banana', cost: 0.2 },
    ],
    steps: ['Mix oats, whey and milk in a jar', 'Slice in the banana', 'Leave in the fridge overnight', 'Grab and go'],
    cookOnce: 'Prep three jars on Sunday for grab and go breakfasts before early lectures.',
    tags: ['High protein', 'No cook', 'Under $1'],
  },
  {
    id: 'bm-stirfry',
    name: 'Tofu or Chicken Stir Fry',
    image: img.chicken,
    cost: 2.2,
    serves: 1,
    kcal: 560,
    p: 38,
    c: 60,
    f: 16,
    ingredients: [
      { item: 'Tofu or chicken (150g)', cost: 1.1 },
      { item: 'Frozen stir fry veg', cost: 0.6 },
      { item: 'Noodles or rice', cost: 0.3 },
      { item: 'Soy sauce', cost: 0.2 },
    ],
    steps: ['Cook the protein in a hot pan', 'Add frozen veg', 'Add cooked noodles and soy sauce', 'Toss and serve'],
    cookOnce: 'Buy one big bag of frozen veg. It stretches across four meals and never spoils.',
    tags: ['High protein', 'One pan', 'Under $3'],
  },
  {
    id: 'bm-wrap',
    name: 'Chicken & Hummus Wrap',
    image: img.mealPrep,
    cost: 1.8,
    serves: 1,
    kcal: 500,
    p: 36,
    c: 48,
    f: 16,
    ingredients: [
      { item: 'Wrap', cost: 0.3 },
      { item: 'Leftover chicken (120g)', cost: 0.9 },
      { item: 'Hummus and salad', cost: 0.6 },
    ],
    steps: ['Warm the wrap', 'Spread hummus', 'Add chicken and salad', 'Roll and wrap in foil'],
    cookOnce: 'Uses the chicken you batch cooked. Zero extra cooking, ready in two minutes.',
    tags: ['High protein', 'No cook', 'Dining hall friendly'],
  },
]

export const budgetMealById = (id: string) => BUDGET_MEALS.find((m) => m.id === id)

/* ------------------- New to the Gym track ------------------------ */
export const BEGINNER_LESSONS: BeginnerLesson[] = [
  {
    id: 'bl-welcome',
    category: 'mindset',
    title: 'You belong here',
    summary: 'The truth about walking into a gym for the first time',
    minutes: 2,
    icon: 'leaf',
    body: [
      'Almost everyone felt nervous on their first day. The people around you are focused on their own session, not watching you.',
      'You do not need to look a certain way or lift a certain amount to be here. Showing up is the whole skill, and you already did the hard part.',
      'For your first two weeks, the only goal is to feel comfortable in the room. Strength follows comfort.',
    ],
  },
  {
    id: 'bl-tour',
    category: 'machine',
    title: 'What the main machines do',
    summary: 'A plain tour of the kit you will actually use',
    minutes: 3,
    icon: 'dumbbell',
    body: [
      'Cable machines have a stack of weights and a pin. Move the pin down for heavier, up for lighter.',
      'The lat pulldown trains your back. The leg press trains your legs while seated and supported.',
      'Dumbbells live on the rack in pairs. Take two, use them, and put them back where you found them.',
      'If a machine looks confusing, there is usually a small diagram on the side showing how to use it.',
    ],
  },
  {
    id: 'bl-dayone',
    category: 'gym',
    title: 'Your day one script',
    summary: 'Exactly what to do the first time you go',
    minutes: 3,
    icon: 'clock',
    body: [
      'Arrive, find a quiet corner, and warm up with five minutes of easy walking or cycling.',
      'Do three simple machines for two sets each. Pick a weight you can move for ten smooth reps.',
      'Rest as long as you need between sets. There is no rush.',
      'Leave after about thirty minutes. A short, calm first session you want to repeat beats a long one that scares you off.',
    ],
  },
  {
    id: 'bl-app',
    category: 'app',
    title: 'How to use this app',
    summary: 'Logging a set in ten seconds',
    minutes: 2,
    icon: 'trending',
    body: [
      'Open Workout, then Start Workout. Each exercise shows the weight and reps to aim for.',
      'After a set, type what you actually did and tap the circle to tick it off. The rest timer starts on its own.',
      'Next time, your coach reads what you logged and suggests the next weight. You can always change it.',
      'That is the whole loop. Log honestly and the app does the thinking for you.',
    ],
  },
  {
    id: 'bl-etiquette',
    category: 'gym',
    title: 'Unwritten gym rules',
    summary: 'Fit in without anyone telling you off',
    minutes: 2,
    icon: 'leaf',
    body: [
      'Wipe down a bench or machine when you finish with it.',
      'Put weights back on the rack. It is the fastest way to look like you belong.',
      'You can share equipment between sets. A simple "mind if I work in?" is normal and welcome.',
      'Headphones in is a fine way to keep to yourself. Most people do exactly that.',
    ],
  },
  {
    id: 'bl-month',
    category: 'mindset',
    title: 'What a normal first month looks like',
    summary: 'Realistic expectations so you do not quit',
    minutes: 2,
    icon: 'flame',
    body: [
      'Weeks one and two can feel awkward and a little sore. That is normal and it fades.',
      'By week three the movements start to feel natural and the weights creep up on their own.',
      'You will not see big changes in the mirror yet, and that is fine. The wins right now are turning up and feeling stronger.',
      'Aim for two or three sessions a week. Consistency at a level you can sustain beats a perfect plan you drop.',
    ],
  },
]

/* ------------------ Training partner candidates ------------------ */
export const PARTNER_CANDIDATES: PartnerCandidate[] = [
  { id: 'pc-1', name: 'Tom H.', level: 'beginner', dorm: 'West Hall', society: 'Lifting Society', goal: 'build-muscle', availability: 'Evenings, Mon to Thu', blurb: 'Also pretty new. Looking for someone to learn the basics with.', matchPct: 94, connected: false },
  { id: 'pc-2', name: 'Priya S.', level: 'beginner', dorm: 'West Hall', goal: 'stay-healthy', availability: 'Mornings before lectures', blurb: 'First semester lifting. Friendly and consistent.', matchPct: 90, connected: false },
  { id: 'pc-3', name: 'Marcus D.', level: 'intermediate', dorm: 'East Hall', society: 'Football', goal: 'gain-strength', availability: 'Afternoons', blurb: 'Happy to show a newer lifter the ropes on the big lifts.', matchPct: 82, connected: false },
  { id: 'pc-4', name: 'Ella W.', level: 'beginner', dorm: 'North Court', society: 'Run Club', goal: 'lose-fat', availability: 'Weekends', blurb: 'Runner trying to add some strength work. Same starting point.', matchPct: 88, connected: false },
  { id: 'pc-5', name: 'Noah K.', level: 'beginner', dorm: 'West Hall', goal: 'build-muscle', availability: 'Evenings', blurb: 'On campus, same goal. Keen for a regular gym buddy.', matchPct: 91, connected: false },
]
