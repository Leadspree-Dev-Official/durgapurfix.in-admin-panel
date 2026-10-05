export interface AvengersCharacter {
  id: string;
  name: string;
  alias: string;
  avatar: string;
  teamRole: string;
  badgeBg: string;
  ringColor: string;
}

export const AVENGERS_CHARACTERS: AvengersCharacter[] = [
  {
    id: 'ironman',
    name: 'Iron Man',
    alias: 'Tony Stark',
    avatar: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=300&q=80',
    teamRole: 'Genius, Billionaire, Philanthropist',
    badgeBg: 'bg-red-600 text-amber-300',
    ringColor: 'ring-red-500'
  },
  {
    id: 'capamerica',
    name: 'Captain America',
    alias: 'Steve Rogers',
    avatar: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=300&q=80',
    teamRole: 'The First Avenger & Team Leader',
    badgeBg: 'bg-blue-600 text-white',
    ringColor: 'ring-blue-500'
  },
  {
    id: 'thor',
    name: 'Thor Odinson',
    alias: 'God of Thunder',
    avatar: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
    teamRole: 'Asgardian Avenger with Mjolnir',
    badgeBg: 'bg-sky-600 text-amber-200',
    ringColor: 'ring-sky-400'
  },
  {
    id: 'spiderman',
    name: 'Spider-Man',
    alias: 'Peter Parker',
    avatar: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=300&q=80',
    teamRole: 'Friendly Neighborhood Hero',
    badgeBg: 'bg-red-500 text-blue-100',
    ringColor: 'ring-red-400'
  },
  {
    id: 'blackwidow',
    name: 'Black Widow',
    alias: 'Natasha Romanoff',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    teamRole: 'Master Spy & Tactical Agent',
    badgeBg: 'bg-slate-900 text-red-400',
    ringColor: 'ring-slate-700'
  },
  {
    id: 'hulk',
    name: 'Incredible Hulk',
    alias: 'Bruce Banner',
    avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&q=80',
    teamRole: 'Gamma-Powered Avenger Strength',
    badgeBg: 'bg-emerald-700 text-emerald-100',
    ringColor: 'ring-emerald-500'
  },
  {
    id: 'docstrange',
    name: 'Doctor Strange',
    alias: 'Stephen Strange',
    avatar: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=300&q=80',
    teamRole: 'Master of the Mystic Arts',
    badgeBg: 'bg-amber-700 text-amber-100',
    ringColor: 'ring-amber-600'
  },
  {
    id: 'blackpanther',
    name: 'Black Panther',
    alias: "King T'Challa",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    teamRole: 'Protector of Wakanda',
    badgeBg: 'bg-purple-900 text-purple-200',
    ringColor: 'ring-purple-600'
  },
  {
    id: 'scarletwitch',
    name: 'Scarlet Witch',
    alias: 'Wanda Maximoff',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    teamRole: 'Chaos Magic & Reality Manipulation',
    badgeBg: 'bg-rose-700 text-rose-100',
    ringColor: 'ring-rose-500'
  },
  {
    id: 'hawkeye',
    name: 'Hawkeye',
    alias: 'Clint Barton',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    teamRole: 'Master Marksman & Archer',
    badgeBg: 'bg-indigo-800 text-indigo-100',
    ringColor: 'ring-indigo-600'
  },
  {
    id: 'capmarvel',
    name: 'Captain Marvel',
    alias: 'Carol Danvers',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    teamRole: 'Cosmic Avenger Champion',
    badgeBg: 'bg-yellow-600 text-blue-900 font-black',
    ringColor: 'ring-yellow-500'
  },
  {
    id: 'antman',
    name: 'Ant-Man',
    alias: 'Scott Lang',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    teamRole: 'Quantum Realm Specialist',
    badgeBg: 'bg-red-800 text-red-100',
    ringColor: 'ring-red-600'
  }
];

export const DEFAULT_MALE_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><circle cx="250" cy="250" r="250" fill="#cbe1fc"/><path d="M165 185c0-45 38-80 85-80s85 35 85 80c0 42-30 80-85 80s-85-38-85-80z" fill="#fcd7c5"/><path d="M208 260v35c0 14 12 25 26 25h32c14 0 26-11 26-25v-35l-42 28-42-28z" fill="#f3b9a0"/><path d="M250 65c-50 0-85 30-85 80 0 10 2 20 5 28 12-18 32-30 55-30 20 0 38 8 50 20 12-12 30-20 50-20 10 0 19 2 27 6-8-50-47-84-102-84z" fill="#1e2d3d"/><path d="M335 145c0-48-35-80-85-80s-85 32-85 80c0 15 4 28 10 38 12-18 32-28 55-28 18 0 35 7 46 18 11-11 28-18 46-18 22 0 42 10 53 28 6-10 10-23 10-38z" fill="#2b4259"/><path d="M68 440c26-80 102-138 182-138s156 58 182 138c-38 38-92 58-150 58s-112-20-150-58z" fill="#3b668c"/><path d="M175 302l75 140 75-140c25 12 46 28 64 48-23-40-66-68-114-72l-25 46-25-46c-48 4-91 32-114 72 18-20 39-36 64-48z" fill="#2b4259"/><path d="M250 302l-40 140h80l-40-140z" fill="#ffffff"/><path d="M210 302l-28 140h20l24-106-16-34z" fill="#2b4259"/><path d="M290 302l28 140h-20l-24-106 16-34z" fill="#2b4259"/><path d="M250 345l16 95h-32l16-95z" fill="#e85555"/><path d="M250 345l-12-16h24l-12 16z" fill="#d04040"/></svg>`)}`;

export const DEFAULT_FEMALE_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><circle cx="250" cy="250" r="250" fill="#f43f5e"/><path d="M140 170c0 95 24 180 34 220 28 16 50 20 76 20s48-4 76-20c10-40 34-125 34-220 0-80-45-120-110-120s-110 40-110 120z" fill="#24292e"/><path d="M165 195c0-45 38-80 85-80s85 35 85 80c0 42-30 80-85 80s-85-38-85-80z" fill="#fcd7c5"/><path d="M208 270v25c0 14 12 25 26 25h32c14 0 26-11 26-25v-25l-42 28-42-28z" fill="#f3b9a0"/><path d="M250 50c-65 0-110 40-110 120 0 52 7 106 17 150 11-26 24-70 36-110 13-42 34-74 57-93 23 19 44 51 57 93 12 40 25 84 36 110 10-44 17-98 17-150 0-80-45-120-110-120z" fill="#1a1e22"/><path d="M75 425c26-68 94-115 175-115s149 47 175 115c-36 44-92 72-155 72s-119-28-155-72z" fill="#facc15"/><path d="M155 370c24 32 58 52 95 52s71-20 95-52c-20-22-48-38-95-38s-75 16-95 38z" fill="#eab308" opacity="0.3"/><path d="M250 310l-48 130h96l-48-130z" fill="#ffffff"/><path d="M250 332l-30 88h60l-30-88z" fill="#fcd7c5"/></svg>`)}`;

export const DEFAULT_MAN_AVATAR = DEFAULT_MALE_AVATAR;
export const DEFAULT_WOMAN_AVATAR = DEFAULT_FEMALE_AVATAR;
export const DEFAULT_PROFILE_PHOTO = DEFAULT_MALE_AVATAR;

export const DEFAULT_AVENGERS = {
  admin: DEFAULT_MALE_AVATAR,
  executive: DEFAULT_MALE_AVATAR,
  provider: DEFAULT_MALE_AVATAR,
  user: DEFAULT_MALE_AVATAR
};

export function getDefaultAvatar(gender?: 'male' | 'female' | string, name?: string): string {
  if (gender) {
    const g = gender.toLowerCase();
    if (g === 'female' || g === 'f' || g === 'woman') return DEFAULT_FEMALE_AVATAR;
    if (g === 'male' || g === 'm' || g === 'man') return DEFAULT_MALE_AVATAR;
  }
  if (name) {
    const femaleNames = ['rita', 'priyanka', 'megha', 'anita', 'sunita', 'pooja', 'sneha', 'neha', 'priya', 'supriya', 'swati', 'rekha', 'suman', 'sharmila', 'tanusree', 'mousumi', 'soma', 'kakali', 'payel', 'mita', 'rupa', 'puja', 'ruma', 'tina', 'riya', 'lata', 'puja'];
    const firstName = name.trim().split(' ')[0].toLowerCase();
    if (femaleNames.includes(firstName) || firstName.endsWith('a') || firstName.endsWith('i') || firstName.endsWith('ee')) {
      return DEFAULT_FEMALE_AVATAR;
    }
  }
  return DEFAULT_MALE_AVATAR;
}
