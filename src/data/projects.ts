import type {Project} from '../types';

export const projects: Project[] = [
  {
    name: 'BOXIFY',
    category: 'Luxury Real Estate / Cat Architecture',
    description: 'An exclusive property marketplace dedicated to premium cardboard residences.',
    tagline: 'Every box deserves a royal owner.',
    features: ['Instant box discovery', 'Size and comfort filters', 'Sunlight availability', 'Strategic hiding locations'],
    colors: ['#F5C6A5', '#E99A55'],
    faces: ['happy', 'right', 'stars'],
  },
  {
    name: 'MEOWFLIX',
    category: 'Entertainment / Streaming',
    description: 'The ultimate entertainment platform for cats who enjoy watching birds, squirrels, and suspicious neighborhood activity.',
    tagline: 'Entertainment worth staying awake for.',
    features: ['Unlimited bird watching', 'Window-view streaming', 'Mouse-free entertainment', 'Premium nap breaks'],
    colors: ['#29211E', '#713F32'],
    darkTheme: true,
    faces: ['up', 'shock', 'left'],
  },
  {
    name: 'NAPTIME PRO',
    category: 'Lifestyle / Productivity',
    description: 'A revolutionary sleep management platform that helps cats achieve their maximum daily sleeping potential.',
    tagline: 'Work smarter. Sleep longer.',
    features: ['Nap scheduling', 'Dream tracking', 'Comfort optimization', 'Automatic snooze mode'],
    colors: ['#F8DCE2', '#EFA6B7'],
    faces: ['half', 'closed', 'yawn'],
  },
];
