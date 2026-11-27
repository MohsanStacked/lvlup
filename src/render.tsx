import { renderToString } from 'react-dom/server';
import { App } from './App';
import { retreats } from './domain';

const pages: [string, string, string][] = [
  ['/', 'Boxing & MMA retreats', 'World-class combat sports retreats. Incredible destinations. Unforgettable experiences.'],
  ['/retreats', 'Find your next retreat', 'Explore combat-sports retreats by destination, training focus and date.'],
  ['/experience', 'The Experience', 'Discover the training, nutrition, recovery and community around LVLUP’s boxing and MMA retreats.'],
  ['/gallery', 'Gallery', 'Photos and videos from the gym and beyond.'],
  ['/about', 'About LVLUP', 'Why LVLUP brings people together through combat sports and travel.'],
  ['/faq', 'Frequently asked questions', 'Find answers about training, travel and retreat enquiries.'],
  ['/contact', 'Contact', 'Contact LVLUP with a retreat, general or partnership enquiry.'],
  ['/book', 'Book your place', 'Register your interest in a LVLUP retreat.'],
  ['/studio', 'Studio', 'Manage LVLUP media and enquiries.'],
  ...retreats.map((retreat): [string, string, string] => ['/retreats/' + retreat.slug, retreat.name + ' retreat', retreat.description]),
  ['/404', 'Page not found', 'Find your way back to LVLUP RETREATS.'],
];

export function renderPages() {
  return pages.map(([path, title, description]) => ({
    path, title, description, content: renderToString(<App path={path} />),
  }));
}
