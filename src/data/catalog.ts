import type { ExerciseDef, FoodItem, ProgramDay, QuickWorkout } from '../store/types'

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
