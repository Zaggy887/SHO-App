/* ------------------------------------------------------------------ */
/*  StrengthHub Online — mock domain data                              */
/*  Mirrors the content shown across the 5 product screens.            */
/* ------------------------------------------------------------------ */

export const user = {
  name: 'Alex',
  fullName: 'Alex Morgan',
  greeting: 'Good morning',
  subtitle: 'Stay consistent, results follow.',
}

/* ---------------------------- Photos ------------------------------ */
/* Stable Unsplash images keyed to the look of each card.             */
export const img = {
  heroWorkout:
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=70',
  pushDay:
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=70',
  community:
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=70',
  mountain:
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=70',
  oats: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=200&q=70',
  chicken:
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=200&q=70',
  yogurt:
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=200&q=70',
  salmon:
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=200&q=70',
  bench:
    'https://images.unsplash.com/photo-1534368786749-b63e05c92392?auto=format&fit=crop&w=200&q=70',
  incline:
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=200&q=70',
  shoulder:
    'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=200&q=70',
  cable:
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=70',
  tricep:
    'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=200&q=70',
  mealPrep:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=70',
  postPR:
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=70',
}

/* --------------------------- Dashboard ---------------------------- */
export const weekDays = [
  { day: 'Mon', date: 20, active: true, dot: true },
  { day: 'Tue', date: 21 },
  { day: 'Wed', date: 22 },
  { day: 'Thu', date: 23 },
  { day: 'Fri', date: 24 },
  { day: 'Sat', date: 25 },
  { day: 'Sun', date: 26 },
]

export const todaysPlan = {
  tag: "Today's Plan",
  title: 'Upper Body Strength',
  duration: '45 min',
  image: img.heroWorkout,
}

export const progressOverview = [
  { icon: 'dumbbell', label: 'Workouts', value: '12', sub: 'This week', delta: '↑ 20%', color: '#7ED957' },
  { icon: 'trending', label: 'Strength', value: '+8%', sub: 'This month', delta: '↑ 8%', color: '#8B5CF6' },
  { icon: 'scale', label: 'Body Weight', value: '72.4', unit: 'kg', sub: '', delta: '↓ 0.6 kg', color: '#3B82F6' },
]

export const habits = [
  { icon: 'footprints', label: 'Steps', value: '7,632', sub: 'Today', pct: 76, color: '#7ED957' },
  { icon: 'bed', label: 'Sleep', value: '7.5 hrs', sub: 'Today', pct: 94, color: '#7ED957' },
  { icon: 'droplet', label: 'Water', value: '2.3 L', sub: 'Today', pct: 77, color: '#7ED957' },
  { icon: 'utensils', label: 'Nutrition', value: '6/10', sub: 'Today', pct: 60, color: '#F5A524' },
  { icon: 'leaf', label: 'Mindset', value: '5 min', sub: 'Today', pct: 85, color: '#7ED957' },
]

export const examProtocol = {
  title: 'Exam Survival Protocol',
  body: "Short workouts, better sleep, less stress. You've got this.",
}

export const dashboardChallenge = {
  title: 'Community Challenge',
  name: '10 Week Consistency Challenge',
  rank: '14th',
  total: 128,
  daysLeft: 32,
}

/* ---------------------------- Workout ----------------------------- */
export const workoutSession = {
  tag: 'Upper Body Push',
  title: 'Push Day',
  exercises: 5,
  duration: '~60 min',
  description: 'Focus on chest, shoulders and triceps. Build strength and size.',
  image: img.pushDay,
}

export const workoutStats = [
  { icon: 'dumbbell', label: 'Volume', value: '12,450', unit: 'kg', delta: '+8% vs last time', color: '#7ED957' },
  { icon: 'clock', label: 'Duration', value: '52', unit: 'min', delta: '+6 min', color: '#3B82F6' },
  { icon: 'flame', label: 'Calories', value: '512', unit: 'kcal', delta: '+47 kcal', color: '#F5A524' },
]

export const exercises = [
  { id: 1, name: 'Barbell Bench Press', sets: 4, reps: '6–8', last: '60kg × 8', weight: '60kg', image: img.bench, done: true },
  { id: 2, name: 'Incline Dumbbell Press', sets: 3, reps: '8–10', last: '22.5kg × 10', weight: '22.5kg', image: img.incline, done: true },
  { id: 3, name: 'Dumbbell Shoulder Press', sets: 3, reps: '8–10', last: '20kg × 9', weight: '20kg', image: img.shoulder, done: true },
  { id: 4, name: 'Cable Fly', sets: 3, reps: '10–12', last: '15kg × 12', weight: '15kg', image: img.cable, done: false },
  { id: 5, name: 'Rope Tricep Pushdown', sets: 3, reps: '12–15', last: '30kg × 13', weight: '30kg', image: img.tricep, done: false },
]

export const workoutProgram = [
  { day: 'Monday', name: 'Push Day', focus: 'Chest · Shoulders · Triceps', exercises: 5, done: true },
  { day: 'Tuesday', name: 'Pull Day', focus: 'Back · Biceps', exercises: 6, done: true },
  { day: 'Wednesday', name: 'Leg Day', focus: 'Quads · Hamstrings · Glutes', exercises: 6, done: false },
  { day: 'Thursday', name: 'Rest / Mobility', focus: 'Active recovery', exercises: 0, done: false },
  { day: 'Friday', name: 'Upper Body', focus: 'Strength focus', exercises: 5, done: false },
  { day: 'Saturday', name: 'Lower Body', focus: 'Hypertrophy', exercises: 5, done: false },
]

export const exerciseLibrary = [
  { name: 'Barbell Bench Press', muscle: 'Chest', image: img.bench },
  { name: 'Incline Dumbbell Press', muscle: 'Chest', image: img.incline },
  { name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', image: img.shoulder },
  { name: 'Cable Fly', muscle: 'Chest', image: img.cable },
  { name: 'Rope Tricep Pushdown', muscle: 'Triceps', image: img.tricep },
  { name: 'Barbell Back Squat', muscle: 'Legs', image: img.pushDay },
]

export const workoutHistory = [
  { date: 'Yesterday', name: 'Pull Day', volume: '11,200 kg', duration: '48 min' },
  { date: 'May 18', name: 'Leg Day', volume: '15,800 kg', duration: '61 min' },
  { date: 'May 16', name: 'Push Day', volume: '11,540 kg', duration: '49 min' },
  { date: 'May 15', name: 'Upper Body', volume: '9,800 kg', duration: '44 min' },
]

/* --------------------------- Nutrition ---------------------------- */
export const nutritionSummary = {
  consumed: 1892,
  goal: 2200,
  macros: [
    { label: 'Protein', value: 142, goal: 160, color: '#7ED957' },
    { label: 'Carbs', value: 201, goal: 250, color: '#3B82F6' },
    { label: 'Fats', value: 58, goal: 70, color: '#F5A524' },
  ],
}

export const nutritionStats = [
  { icon: 'flame', value: '308', label: 'kcal', sub: 'Remaining', color: '#F5A524', subColor: '#9AA0A6' },
  { icon: 'target', value: '85%', label: 'Macros', sub: 'On Track', color: '#3B82F6', subColor: '#7ED957' },
  { icon: 'droplet', value: '2.4 L', label: 'Water', sub: 'Good', color: '#3B82F6', subColor: '#7ED957' },
  { icon: 'leaf', value: '28g', label: 'Fiber', sub: 'On Track', color: '#7ED957', subColor: '#7ED957' },
]

export const meals = [
  { name: 'Breakfast', desc: 'Oats with Protein, Berries & Banana', kcal: 512, macros: '32P · 68C · 12F', image: img.oats, done: true },
  { name: 'Lunch', desc: 'Chicken, Rice & Veggies', kcal: 645, macros: '48P · 72C · 18F', image: img.chicken, done: true },
  { name: 'Snack', desc: 'Greek Yogurt & Berries', kcal: 210, macros: '20P · 15C · 6F', image: img.yogurt, done: true },
  { name: 'Dinner', desc: 'Salmon, Potatoes & Green Beans', kcal: 525, macros: '42P · 46C · 14F', image: img.salmon, done: true },
]

export const nutritionTip = {
  title: 'Nutrition Tip',
  body: 'Prioritise protein and whole foods. Small daily choices = big results.',
}

export const macrosBreakdown = [
  { pct: 30, grams: '142g', label: 'Protein', goal: 'Goal: 160g', color: '#7ED957' },
  { pct: 43, grams: '201g', label: 'Carbs', goal: 'Goal: 250g', color: '#3B82F6' },
  { pct: 27, grams: '58g', label: 'Fats', goal: 'Goal: 70g', color: '#F5A524' },
]

export const insights = [
  { title: 'Protein consistency', body: "You've hit 90%+ of your protein goal 6 days running.", trend: '+12%' },
  { title: 'Best fuelled days', body: 'You train hardest after a high-carb breakfast.', trend: 'Tue & Fri' },
  { title: 'Hydration streak', body: '2L+ water for 9 consecutive days.', trend: '9 days' },
]

export const education = [
  { title: 'Protein 101', body: 'How much you really need to build muscle.', minutes: '4 min read' },
  { title: 'Reading food labels', body: 'Spot hidden sugars and marketing tricks.', minutes: '6 min read' },
  { title: 'Meal timing myths', body: 'Does the anabolic window really matter?', minutes: '5 min read' },
]

/* ---------------------------- Progress ---------------------------- */
export const progressQuote = {
  title: 'Discipline today, freedom tomorrow.',
  body: "You don't rise to the level of your goals, you fall to the level of your systems.",
  image: img.mountain,
}

export const progressOverviewCards = [
  { icon: 'scale', label: 'Weight', value: '72.4', unit: 'kg', delta: '↓ 0.6 kg', sub: 'vs last 4 weeks', color: '#7ED957' },
  { icon: 'trending', label: 'Strength', value: '+18%', unit: '', delta: '↑ 18%', sub: 'vs last 4 weeks', color: '#8B5CF6' },
  { icon: 'footprints', label: 'Workouts', value: '23', unit: '', delta: '↑ 5', sub: 'vs last 4 weeks', color: '#3B82F6' },
  { icon: 'flame', label: 'Calories', value: '2,182', unit: '', delta: 'avg / day', sub: 'vs last 4 weeks', color: '#F5A524' },
]

export const weightTrend = [
  { date: 'Apr 21', weight: 73.4 },
  { date: 'Apr 25', weight: 73.1 },
  { date: 'Apr 28', weight: 72.2 },
  { date: 'May 5', weight: 72.2 },
  { date: 'May 9', weight: 71.9 },
  { date: 'May 12', weight: 71.6 },
  { date: 'May 16', weight: 71.4 },
  { date: 'May 19', weight: 72.4 },
]

export const strengthProgress = [
  { name: 'Bench Press', from: '80 kg', to: '92.5 kg', delta: '↑ 15%', image: img.bench },
  { name: 'Back Squat', from: '100 kg', to: '115 kg', delta: '↑ 15%', image: img.pushDay },
  { name: 'Deadlift', from: '120 kg', to: '142.5 kg', delta: '↑ 18%', image: img.shoulder },
  { name: 'Overhead Press', from: '50 kg', to: '57.5 kg', delta: '↑ 15%', image: img.incline },
]

export const habitConsistency = [
  { label: 'Workouts', value: '5/7', sub: 'This week', pct: 71, color: '#7ED957' },
  { label: 'Steps', value: '6/7', sub: 'Avg 8,432', pct: 86, color: '#3B82F6' },
  { label: 'Sleep', value: '7/7', sub: 'Avg 7h 23m', pct: 100, color: '#8B5CF6' },
  { label: 'Nutrition', value: '5/7', sub: 'On Track', pct: 71, color: '#F5A524' },
]

export const streak = { current: 14, best: 21 }

/* --------------------------- Community ---------------------------- */
export const communityBanner = {
  line1: 'Stronger Together.',
  line2: 'Better Every Day.',
  body: 'Connect, share, support and grow with like-minded students.',
  image: img.community,
}

export const feedPosts = [
  {
    id: 1,
    author: 'Alex M.',
    time: '2h ago',
    text: 'Just hit a new bench PR! 80kg for 5 reps 💪',
    image: img.postPR,
    likes: 24,
    comments: 8,
    color: '#7ED957',
  },
  {
    id: 2,
    author: 'Sophie L.',
    time: '5h ago',
    text: 'Finished Week 3 of the 10 Week Challenge! 🎉',
    ring: 75,
    ringLabel: 'WEEK 3 PROGRESS',
    likes: 18,
    comments: 6,
    color: '#3B82F6',
  },
  {
    id: 3,
    author: 'Jayden K.',
    time: '1d ago',
    text: 'Sunday refeed — best way to prep for the week.',
    image: img.mealPrep,
    likes: 21,
    comments: 11,
    color: '#F5A524',
  },
]

export const activeChallenge = {
  weeks: 10,
  title: '10 Week Strength Challenge',
  extra: 342,
  rank: 14,
  total: 342,
  currentWeek: 3,
  totalWeeks: 10,
  pct: 30,
}

export const communityGroups = [
  { icon: 'dumbbell', name: 'Beginner Lifters', members: 128, desc: 'Share tips, ask questions, build confidence.', unread: 12, color: '#7ED957' },
  { icon: 'utensils', name: 'Nutrition & Recipes', members: 96, desc: 'Healthy recipes, meal prep, tips & more.', unread: 8, color: '#8B5CF6' },
  { icon: 'brain', name: 'Mindset & Motivation', members: 74, desc: 'Stay motivated and level up mentally.', unread: 5, color: '#3B82F6' },
]

export const challengesList = [
  { title: '10 Week Strength Challenge', participants: 342, weeks: '10 weeks', joined: true },
  { title: '30 Day Step Streak', participants: 218, weeks: '30 days', joined: false },
  { title: 'Summer Shred', participants: 540, weeks: '8 weeks', joined: false },
]

export const events = [
  { title: 'Live Form Check Q&A', when: 'Today · 7:00 PM', host: 'Coach Mia', going: 64 },
  { title: 'Group Long Run', when: 'Sat · 8:00 AM', host: 'Run Club', going: 22 },
  { title: 'Nutrition Workshop', when: 'Sun · 5:00 PM', host: 'Coach Dan', going: 88 },
]

/* Deterministic colour for avatar initials */
export const avatarColors = ['#7ED957', '#3B82F6', '#8B5CF6', '#F5A524', '#EC4899', '#06B6D4']
