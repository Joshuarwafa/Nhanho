export type Transmission = 'Automatic' | 'Manual';
export type Fuel = 'Petrol' | 'Diesel' | 'Hybrid';

export interface Vehicle {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  image: string;
  seats: number;
  bags: number;
  transmission: Transmission;
  fuel: Fuel;
  year: number;
  /** USD per-day rates by tier */
  daily: number;
  weekly: number; // per-day rate when renting 7–29 days
  monthly: number; // per-day rate when renting 30+ days
  features: string[];
  popular?: boolean;
}

export interface Category {
  id: string;
  label: string;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  { id: 'economy', label: 'Economy', blurb: 'Fuel-sipping city runabouts' },
  { id: 'suv', label: 'SUV', blurb: 'Space & capability for any road' },
  { id: 'executive', label: 'Executive', blurb: 'Arrive in quiet authority' },
  { id: 'luxury', label: 'Luxury', blurb: 'Flagship vehicles, VIP treatment' },
  { id: 'minibus', label: 'Minibus', blurb: 'Group & staff transport' },
];

export const FLEET: Vehicle[] = [
  {
    id: 'vitz',
    name: 'Toyota Vitz',
    category: 'economy',
    categoryLabel: 'Economy',
    image: '/images/toyota-vitz.jpg',
    seats: 5,
    bags: 2,
    transmission: 'Automatic',
    fuel: 'Petrol',
    year: 2022,
    daily: 40,
    weekly: 35,
    monthly: 28,
    features: ['Bluetooth audio', 'USB charging', 'Air conditioning', 'Excellent fuel economy'],
  },
  {
    id: 'fit',
    name: 'Honda Fit',
    category: 'economy',
    categoryLabel: 'Economy',
    image: '/images/honda-fit.jpg',
    seats: 5,
    bags: 3,
    transmission: 'Automatic',
    fuel: 'Hybrid',
    year: 2023,
    daily: 38,
    weekly: 33,
    monthly: 26,
    features: ['Hybrid efficiency', 'Magic seats', 'Reverse camera', 'Air conditioning'],
  },
  {
    id: 'spade',
    name: 'Toyota Spade',
    category: 'economy',
    categoryLabel: 'Economy',
    image: '/images/toyota-spade.jpg',
    seats: 5,
    bags: 3,
    transmission: 'Automatic',
    fuel: 'Petrol',
    year: 2023,
    daily: 40,
    weekly: 35,
    monthly: 28,
    popular: true,
    features: ['Sliding doors', 'Spacious cabin', 'Easy city parking', 'Air conditioning'],
  },
  {
    id: 'xtrail',
    name: 'Nissan X-Trail',
    category: 'suv',
    categoryLabel: 'SUV',
    image: '/images/nissan-xtrail.jpg',
    seats: 5,
    bags: 4,
    transmission: 'Automatic',
    fuel: 'Petrol',
    year: 2023,
    daily: 60,
    weekly: 53,
    monthly: 42,
    popular: true,
    features: ['AWD capability', 'Apple CarPlay', 'Roof rails', 'Air conditioning'],
  },
  {
    id: 'fortuner',
    name: 'Toyota Fortuner',
    category: 'suv',
    categoryLabel: 'SUV',
    image: '/images/toyota-fortuner.jpg',
    seats: 7,
    bags: 4,
    transmission: 'Automatic',
    fuel: 'Diesel',
    year: 2023,
    daily: 95,
    weekly: 84,
    monthly: 68,
    popular: true,
    features: ['7 seats', '4x4 low range', 'Tow bar', 'Hill assist', 'Air conditioning'],
  },
  {
    id: 'eclass',
    name: 'Mercedes-Benz S-Class',
    category: 'executive',
    categoryLabel: 'Executive',
    image: '/images/mercedes-s-class.jpg',
    seats: 5,
    bags: 3,
    transmission: 'Automatic',
    fuel: 'Petrol',
    year: 2024,
    daily: 150,
    weekly: 132,
    monthly: 108,
    popular: true,
    features: ['Executive rear seats', 'Ambient lighting', 'Chauffeur available', 'Climate control'],
  },
  {
    id: 'range',
    name: 'Range Rover',
    category: 'luxury',
    categoryLabel: 'Luxury',
    image: '/images/range-rover.jpg',
    seats: 5,
    bags: 4,
    transmission: 'Automatic',
    fuel: 'Diesel',
    year: 2024,
    daily: 250,
    weekly: 220,
    monthly: 180,
    features: ['Premium leather', 'Panoramic roof', 'Meridian sound', 'Chauffeur available'],
  },
  {
    id: 'nv350',
    name: 'Toyota Quantum',
    category: 'minibus',
    categoryLabel: 'Minibus',
    image: '/images/toyota-quantum.jpg',
    seats: 14,
    bags: 10,
    transmission: 'Manual',
    fuel: 'Diesel',
    year: 2023,
    daily: 100,
    weekly: 88,
    monthly: 70,
    popular: true,
    features: ['14 seats', 'High roof', 'PA system option', 'Driver available'],
  },
];

export const LOCATIONS = [
  'Harare CBD — Head Office',
  'Robert Gabriel Mugabe Int’l Airport',
  'Bulawayo',
  'Victoria Falls',
  'Mutare',
  'Gweru',
  'Custom delivery address',
];

export const DRIVER_OPTIONS = [
  { id: 'self', label: 'Self-drive', perDay: 0, note: 'Valid driver’s licence required' },
  { id: 'chauffeur', label: 'Professional chauffeur', perDay: 25, note: 'Vetted, suited & routed' },
] as const;

export const EXTRAS = [
  { id: 'gps', label: 'GPS navigation unit', perDay: 5 },
  { id: 'child', label: 'Child safety seat', perDay: 3 },
  { id: 'driver2', label: 'Additional driver', perDay: 10 },
  { id: 'insurance', label: 'Super cover (zero excess)', perDay: 15 },
  { id: 'wifi', label: '4G Wi-Fi hotspot', perDay: 6 },
] as const;

export function rateFor(v: Vehicle, days: number) {
  if (days >= 30) return { perDay: v.monthly, tier: 'Monthly rate' };
  if (days >= 7) return { perDay: v.weekly, tier: 'Weekly rate' };
  return { perDay: v.daily, tier: 'Daily rate' };
}

export function formatUSD(n: number) {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
