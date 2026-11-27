import type { Media } from './domain';

export const brand = {
  email: null as string | null,
  instagram: null as string | null,
  photoLocation: 'Phuket, Thailand',
  coordinates: '7.8804° N / 98.3923° E',
};

export const pillars = [
  ['Fight', 'Technical boxing and MMA sessions, padwork and coaching.'],
  ['Explore', 'Get out of the gym and spend time in the place you came to see.'],
  ['Fuel', 'Meals built around the training day and time at the table together.'],
  ['Recover', 'Make room for mobility, rest and time away from the gym.'],
  ['Community', 'Train alongside people who came for the same reasons you did.'],
  ['Experience', 'Take the routines you build at camp home with you.'],
] as const;

export const experience = [
  ['The training', 'Padwork, technical drills and conditioning form the core of the camp. Individual programmes will outline the disciplines, session intensity and any sparring arrangements.', '/media/training.jpg'],
  ['The coaches', 'Look for the coaching team and their session plans on each confirmed retreat listing. Coach profiles will be added when the team is announced.', null],
  ['Accommodation', 'The base for training, downtime and exploring. Room types and venue information will be listed with each confirmed camp.', '/media/thailand.jpg'],
  ['Nutrition', 'The idea is simple: eat well, refuel between sessions and sit down together. Dietary arrangements and meal inclusions will be specified per camp.', '/media/community.jpg'],
  ['Recovery', 'Camp makes room between training sessions for rest and mobility. Recovery facilities and activities will depend on the venue.', null],
  ['Activities and exploration', 'See the coast, explore the area or spend an afternoon doing very little. Planned activities and free time will be set out per retreat.', '/media/portugal.jpg'],
  ['Community', 'Shared rounds and shared meals give the week its rhythm. There’s room to spend time with the group and to take some time for yourself.', '/media/community.jpg'],
] as const;

export const faq = [
  ['Training', [
    ['Do I need previous boxing experience?', 'Required experience will be listed for each confirmed camp.'],
    ['Is the retreat suitable for beginners?', 'Beginner suitability and available training groups will be confirmed per camp.'],
    ['Do I need to bring boxing gloves?', 'The equipment list will be provided for each camp.'],
    ['What equipment is provided?', 'Equipment supplied at the venue will be listed when confirmed.'],
    ['How intense are the training sessions?', 'Session intensity and any options to adapt training will be described in the camp programme.'],
    ['Are there rest days?', 'The confirmed itinerary will set out rest days and recovery time.'],
  ]],
  ['Staying and travelling', [
    ['What is included in the price?', 'The retreat listing will give a breakdown once pricing is announced.'],
    ['What accommodation is provided?', 'Accommodation and room choices will be published for each confirmed camp.'],
    ['Are meals included?', 'Meal inclusions will be shown in each confirmed listing.'],
    ['What happens if I have dietary requirements?', 'Send an enquiry about your dietary needs before making travel or booking arrangements.'],
    ['Can I attend alone?', 'Ask about solo attendance and room arrangements for the retreat you’re interested in.'],
    ['What should I pack?', 'A packing list will be supplied for each confirmed itinerary.'],
    ['Are flights included?', 'Flight arrangements will be specified in the confirmed inclusions.'],
    ['Do I need travel insurance?', 'Travel insurance requirements will be published with the retreat terms.'],
  ]],
  ['Booking and eligibility', [
    ['How do I book?', 'Send a retreat enquiry to register your interest. Booking steps will be shared when a camp opens.'],
    ['What is the cancellation policy?', 'Cancellation terms will be available before booking opens.'],
    ['Are there age restrictions?', 'Eligibility and minimum age will be confirmed for each published camp.'],
  ]],
] as const;

export const exampleMedia: Media[] = [
  { id: 'sample-training', kind: 'image', src: '/media/training.jpg', caption: 'Hand wraps before a session', category: 'Training', retreat: 'thailand', featured: true, example: true },
  { id: 'sample-coast', kind: 'image', src: '/media/portugal.jpg', caption: 'The Atlantic coast', category: 'Destinations', retreat: 'portugal', featured: true, example: true },
  { id: 'sample-community', kind: 'image', src: '/media/community.jpg', caption: 'A meal between sessions', category: 'Community', retreat: 'thailand', featured: true, example: true },
  { id: 'sample-video', kind: 'video', src: '/media/training-preview.mp4', thumbnail: '/media/training.jpg', caption: 'Training preview · sample clip', category: 'Behind the scenes', retreat: 'thailand', featured: true, example: true },
  { id: 'sample-spain', kind: 'image', src: '/media/spain.jpg', caption: 'The Mediterranean coast', category: 'Destinations', retreat: 'spain', featured: false, example: true },
  { id: 'sample-dubai', kind: 'image', src: '/media/dubai.jpg', caption: 'The Dubai coastline', category: 'Destinations', retreat: 'dubai', featured: false, example: true },
];
