import { useEffect, useRef, type ReactNode } from 'react';
import { brand } from './content';
import type { Retreat } from './domain';

export const navigation = [
  ['/retreats', 'Retreats'], ['/experience', 'The Experience'], ['/gallery', 'Gallery'],
  ['/about', 'About'], ['/faq', 'FAQ'], ['/contact', 'Contact'],
] as const;

export function ButtonLink({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <a className={secondary ? 'button button--outline' : 'button'} href={href}>{children}</a>;
}

export function Wordmark() {
  return <a className="wordmark" href="/" aria-label="LVLUP Retreats home"><i aria-hidden="true" /><strong>LVLUP</strong> RETREATS</a>;
}

export function Header({ path }: { path: string }) {
  const menu = useRef<HTMLDialogElement>(null);
  const isCurrent = (href: string) => path === href || path.startsWith(href + '/');
  const links = navigation.map(([href, name]) => <a href={href} key={href} aria-current={isCurrent(href) ? 'page' : undefined}>{name}</a>);
  useEffect(() => {
    const update = () => document.documentElement.classList.toggle('has-scrolled', window.scrollY > 20);
    update();
    window.addEventListener('scroll', update, { passive: true });
    const media = window.matchMedia('(min-width: 1000px)');
    const closeOnDesktop = () => { if (media.matches) menu.current?.close(); };
    media.addEventListener('change', closeOnDesktop);
    return () => {
      window.removeEventListener('scroll', update);
      media.removeEventListener('change', closeOnDesktop);
    };
  }, []);
  return <header className="site-header">
    <a className="skip" href="#main">Skip to content</a>
    <div className="header-inner">
      <Wordmark />
      <nav className="desktop-nav" aria-label="Main navigation">{links}</nav>
      <div className="desktop-book"><ButtonLink href="/book">Book your place</ButtonLink></div>
      <button className="menu-button" aria-haspopup="dialog" onClick={() => menu.current?.showModal()}>Menu <span aria-hidden="true">☰</span></button>
    </div>
    <dialog ref={menu} className="mobile-menu" aria-label="Main menu">
      <div className="mobile-menu-head"><Wordmark /><button className="menu-button" onClick={() => menu.current?.close()}>Close <span aria-hidden="true">×</span></button></div>
      <nav aria-label="Mobile navigation">{links}</nav>
      <ButtonLink href="/book">Book your place</ButtonLink>
    </dialog>
  </header>;
}

export function InstagramLink() {
  return brand.instagram
    ? <a className="button button--outline" href={brand.instagram} target="_blank" rel="noreferrer"><PillarIcon index={6} /> Follow us on Instagram <span className="sr-only">(opens in a new tab)</span></a>
    : <span className="social-pending"><PillarIcon index={6} /> Instagram profile coming soon</span>;
}

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-main container">
      <div><Wordmark /><p>Boxing & MMA retreats around the world</p></div>
      <nav aria-label="Footer navigation">{navigation.map(([href, name]) => <a key={href} href={href}>{name}</a>)}</nav>
      <ButtonLink href="/book" secondary>Make an enquiry</ButtonLink>
    </div>
    <div className="container footer-bottom"><small>© {new Date().getFullYear()} LVLUP RETREATS</small><InstagramLink /></div>
  </footer>;
}

export function PillarIcon({ index }: { index: number }) {
  const paths = [
    'M6.5 14.5V9.2a1.6 1.6 0 0 1 3.2 0V6.5a1.5 1.5 0 0 1 3 0v2a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1 3 0v5l-2.2 3.7V21H8v-3zM8 18h8.5',
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM16.3 7.7l-2.6 6-6 2.6 2.6-6z',
    'M3 13h18c0 4-3.9 7-9 7s-9-3-9-7zM8 9c-2-2 2-3 0-5m4 5c-2-2 2-3 0-5m4 5c-2-2 2-3 0-5',
    'M20.8 15.3A9 9 0 0 1 8.7 3.2a9 9 0 1 0 12.1 12.1z',
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7-7.9a4 4 0 0 1 0 7.8',
    'M3 20l7-11 4 6 2-3 5 8zM17 8l1.5 1.5L22 6',
    'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm5-9h.01',
  ];
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[index]} /></svg>;
}

export function RetreatCard({ retreat }: { retreat: Retreat }) {
  return <article className="retreat-card">
    <a className="retreat-image" href={'/retreats/' + retreat.slug} aria-label={'Explore ' + retreat.name}>
      <img src={retreat.image} alt={retreat.region + ' coastline, illustrative image'} loading="lazy" width="504" height="506" />
      <span>{retreat.dates ? formatDates(retreat.dates) : retreat.status === 'example' ? 'Example destination' : 'Dates to be announced'}</span>
    </a>
    <div className="retreat-copy">
      <p className="eyebrow">{retreat.region} · {retreat.focus}</p>
      <h3>{retreat.name}</h3>
      <p>{retreat.description}</p>
      {retreat.status === 'confirmed' && <p>{[retreat.availability, retreat.startingPrice && 'From ' + retreat.startingPrice].filter(Boolean).join(' · ')}</p>}
      <a className="text-link" href={'/retreats/' + retreat.slug}>View retreat <span className="sr-only">{retreat.name}</span></a>
    </div>
  </article>;
}

export function formatDates(dates: NonNullable<Retreat['dates']>) {
  const format = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' });
  return format.formatRange(new Date(dates.start), new Date(dates.end));
}

export function PageLead({ title, children, image, imageAlt = '' }: { title: string; children?: ReactNode; image?: string; imageAlt?: string }) {
  return <section className={'page-lead' + (image ? ' page-lead--image' : '')}>
    {image && <img src={image} alt={imageAlt} fetchPriority="high" />}
    <div className="container page-lead-copy"><h1>{title}</h1>{children && <div className="page-intro">{children}</div>}</div>
  </section>;
}
