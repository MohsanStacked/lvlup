import { useState } from 'react';
import { ButtonLink, Footer, Header, InstagramLink, PageLead, PillarIcon, RetreatCard, formatDates } from './components';
import { brand, experience, faq, pillars } from './content';
import { retreatMatches, retreats, type Media, type Retreat } from './domain';
import { GalleryFilters, GalleryGrid, useMedia } from './Gallery';
import { EnquiryPage } from './Enquiry';
import { Studio } from './Studio';

function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <picture className="hero-image">
      <source media="(max-width: 700px)" srcSet="/media/hero-mobile.jpg" />
      <img src="/media/hero.jpg" alt="Boxing padwork in an open-air gym on the coast at dusk" width="1600" height="1066" fetchPriority="high" />
    </picture>
    <div className="hero-shade" />
    <div className="coordinate" aria-label={'Illustrative location: ' + brand.photoLocation + ', ' + brand.coordinates}>
      <div className="coordinate-ring" aria-hidden="true" />
      <div className="coordinate-line" aria-hidden="true" />
      <div className="coordinate-label"><span>{brand.coordinates}</span><span>{brand.photoLocation}</span></div>
    </div>
    <div className="container hero-content">
      <h1 id="hero-title"><span>Train hard.</span><span>Live different.</span><span>Level up.</span></h1>
      <p>World-class combat sports retreats. Incredible destinations. Unforgettable experiences.</p>
      <div className="actions"><ButtonLink href="/retreats">Explore retreats</ButtonLink><ButtonLink href="/experience" secondary>Discover the experience</ButtonLink></div>
    </div>
    <a href="#upcoming" className="hero-scroll"><span aria-hidden="true" /> Scroll to retreats</a>
  </section>;
}

function Home({ media }: { media: Media[] }) {
  const confirmed = retreats.filter((retreat) => retreat.status === 'confirmed');
  const featured = media.filter((item) => item.featured).slice(0, 4);
  return <>
    <Hero />
    <section id="upcoming" className="section container">
      <div className="section-head">
        <div><p className="eyebrow">Upcoming retreats</p><h2>Your next level starts here.</h2><p>Discover our upcoming combat sports retreats around the world.</p></div>
        <ButtonLink href="/retreats" secondary>All retreats</ButtonLink>
      </div>
      {confirmed.length === 0 && <p className="quiet-note">Dates are yet to be announced. Explore two example destinations below.</p>}
      <div className="retreat-grid retreat-grid--home">{(confirmed.length ? confirmed : retreats).slice(0, 2).map((item) => <RetreatCard key={item.slug} retreat={item} />)}</div>
    </section>
    <section className="experience-strip">
      <div className="section container">
        <div className="section-head"><div><p className="eyebrow">The LVLUP experience</p><h2>More than just training.</h2></div><ButtonLink href="/experience" secondary>Explore the experience</ButtonLink></div>
        <div className="pillars">{pillars.map(([name, copy], index) => <article key={name}>
          <div className="pillar-icon"><PillarIcon index={index} /></div><h3>{name}</h3><p>{copy}</p>
        </article>)}</div>
      </div>
    </section>
    <section className="section container">
      <div className="section-head"><div><p className="eyebrow">Example destinations</p><h2>The world is your gym.</h2></div></div>
      <div className="destination-grid">{retreats.map((item) => <a key={item.slug} href={'/retreats/' + item.slug} className="destination">
        <img src={item.image} alt="" loading="lazy" />
        <div><span>{item.region}</span><h3>{item.name}</h3><p>{item.description}</p><span className="text-link">Explore destination</span></div>
      </a>)}</div>
    </section>
    <section className="community section">
      <div className="container editorial-split">
        <img src="/media/community.jpg" alt="Illustrative image of a group talking over an outdoor meal" loading="lazy" />
        <div><p className="eyebrow">Community</p><h2>Built together. Levelled up together.</h2><p>Rounds, meals and time away are all part of camp. This is a week spent with people who came to train and see somewhere new.</p><p className="quiet-note">Participant stories will be added with permission.</p><ButtonLink href="/experience#community" secondary>Life at camp</ButtonLink></div>
      </div>
    </section>
    <section className="section container">
      <div className="section-head"><div><p className="eyebrow">Photo & video</p><h2>The LVLUP life.</h2></div><ButtonLink href="/gallery" secondary>View the gallery</ButtonLink></div>
      {featured.length ? <GalleryGrid media={featured} /> : <p>Featured media will appear here.</p>}
      <div className="actions social-actions"><InstagramLink /></div>
    </section>
    <section className="closing">
      <img src="/media/training.jpg" alt="" loading="lazy" />
      <div className="container"><h2>Ready to level up?</h2><p>Your next adventure starts outside your comfort zone.</p><ButtonLink href="/retreats">Find your next retreat</ButtonLink></div>
    </section>
  </>;
}

function Retreats() {
  const [filters, setFilters] = useState({ destination: '', focus: '', year: '' });
  const matches = retreats.filter((item) => retreatMatches(item, filters));
  const confirmed = matches.filter((item) => item.status === 'confirmed');
  const examples = matches.filter((item) => item.status === 'example');
  const years = [...new Set(retreats.filter((item) => item.status === 'confirmed' && item.dates).flatMap(({ dates }) => {
    const start = Number(dates!.start.slice(0, 4));
    const end = Number(dates!.end.slice(0, 4));
    return Array.from({ length: Math.min(10, end - start + 1) }, (_, index) => String(start + index));
  }))].sort();
  const reset = () => setFilters({ destination: '', focus: '', year: '' });
  return <>
    <PageLead title="Find your next retreat" image="/media/portugal.jpg" imageAlt="Illustrative Algarve coastline"><p>Explore boxing and MMA camps by destination, training focus and date.</p></PageLead>
    <section className="section container">
      <div className="filters">
        <label>Destination<select value={filters.destination} onChange={(event) => setFilters({ ...filters, destination: event.target.value })}><option value="">All destinations</option>{[...new Set(retreats.map((item) => item.country))].map((country) => <option key={country}>{country}</option>)}</select></label>
        <label>Training<select value={filters.focus} onChange={(event) => setFilters({ ...filters, focus: event.target.value })}><option value="">All training</option>{['Boxing', 'MMA', 'Mixed'].map((focus) => <option key={focus}>{focus}</option>)}</select></label>
        <label>Date<select value={filters.year} onChange={(event) => setFilters({ ...filters, year: event.target.value })}><option value="">Any date</option>{years.length ? years.map((year) => <option key={year}>{year}</option>) : <option disabled>Dates to be announced</option>}</select></label>
        <button className="button button--outline" onClick={reset}>Clear filters</button>
      </div>
      <p className="filter-count" aria-live="polite">{matches.length ? matches.length + (matches.length === 1 ? ' retreat' : ' retreats') : 'No retreats match these filters'}</p>
      {confirmed.length > 0 && <><h2>Upcoming retreats</h2><div className="retreat-grid">{confirmed.map((item) => <RetreatCard key={item.slug} retreat={item} />)}</div></>}
      {examples.length > 0 && <><h2>Example destinations</h2><p className="quiet-note">Explore the kinds of places LVLUP may train. Dates, prices and availability are yet to be announced.</p><div className="retreat-grid">{examples.map((item) => <RetreatCard key={item.slug} retreat={item} />)}</div></>}
    </section>
  </>;
}

function RetreatDetail({ retreat, media }: { retreat: Retreat; media: Media[] }) {
  const photos = media.filter((item) => item.retreat === retreat.slug);
  const info = [
    ['Training schedule', 'The final programme will set out the balance of technical training, conditioning and recovery.'],
    ['Accommodation', 'Venue, room types and occupancy details will be published with the confirmed listing.'],
    ['Food and nutrition', 'Meal arrangements and options for dietary requirements will be specified for this camp.'],
    ['What’s included', 'Look here for confirmed sessions, accommodation, meals and planned activities.'],
    ['What’s not included', 'Flight, insurance and transfer arrangements will be explained before booking opens.'],
    ['Coaching team', 'Coach profiles will be added when the team for this location is announced.'],
    ['Destination', 'Explore ' + retreat.region + ' between training sessions. Local activities and transfers will be listed when the programme is confirmed.'],
    ['Participant stories', 'Participant quotes and photographs will appear here when available.'],
  ];
  const schedule = [['Morning', 'Conditioning or boxing session'], ['Breakfast', 'Nutrition-focused meal'], ['Late morning', 'Recovery or free time'], ['Afternoon', 'Technical training or MMA session'], ['Evening', 'Group meal, activities or relaxation']];
  const duration = retreat.dates && (Date.parse(retreat.dates.end) - Date.parse(retreat.dates.start)) / 86_400_000 + 1;
  return <>
    <PageLead title={retreat.name} image={retreat.image} imageAlt={'Illustrative coastal scene, ' + retreat.region}>
      <p>{retreat.region} · {retreat.focus}</p>
      <p>{retreat.dates ? formatDates(retreat.dates) + ' · ' + duration + ' days' : 'Example retreat · Dates and duration pending'}</p>
      {retreat.status === 'confirmed' && <p>{[retreat.availability, retreat.startingPrice && 'From ' + retreat.startingPrice].filter(Boolean).join(' · ')}</p>}
      <ButtonLink href={'/book?retreat=' + retreat.slug}>Enquire about this retreat</ButtonLink>
    </PageLead>
    <div className="container section detail-layout">
      <section><h2>Retreat overview</h2><p>{retreat.description}</p></section>
      {info.slice(0, 5).map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
      <section className="detail-wide"><h2>A day at camp</h2><p className="quiet-note">Example daily itinerary. The schedule will vary by retreat.</p><dl className="itinerary">{schedule.map(([time, activity]) => <div key={time}><dt>{time}</dt><dd>{activity}</dd></div>)}</dl></section>
      {info.slice(5, 7).map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
      <section className="detail-wide"><h2>Photo and video gallery</h2>{photos.length > 0 ? <GalleryGrid media={photos} /> : <p>Media will be added for this destination.</p>}</section>
      <section><h2>{info[7][0]}</h2><p>{info[7][1]}</p></section>
      <section><h2>Frequently asked questions</h2><p>See the FAQ for equipment, training experience, accommodation and booking.</p><ButtonLink href="/faq" secondary>Read the FAQ</ButtonLink></section>
      <section className="detail-wide"><h2>Interested in this retreat?</h2><ButtonLink href={'/book?retreat=' + retreat.slug}>Send an enquiry</ButtonLink></section>
    </div>
  </>;
}

function Experience() {
  return <>
    <PageLead title="More than just training." image="/media/hero.jpg"><p>A week built around the gym, the place and the people you share it with.</p></PageLead>
    <div className="container section experience-list">{experience.map(([title, copy, image], index) => <section key={title} id={title === 'Community' ? 'community' : undefined} className={'editorial-split experience-panel' + (index % 2 ? ' editorial-split--reverse' : '') + (!image ? ' experience-panel--text' : '')}>
      {image && <img src={image} alt="" loading="lazy" />}<div><h2>{title}</h2><p>{copy}</p>{title === 'The training' && <a className="text-link" href="/gallery">See training media</a>}</div>
    </section>)}</div>
  </>;
}

function About() {
  return <>
    <PageLead title="We’re here to level up." image="/media/community.jpg"><p>LVLUP RETREATS brings people together through combat sports, travel and personal growth.</p></PageLead>
    <div className="container section detail-layout">
      <section><h2>The story</h2><p>LVLUP starts with an idea: taking training somewhere different changes how you experience the work and the people you do it with. The retreat brings those things into one week.</p></section>
      <section><h2>The mission</h2><p>Make space for focused combat-sports training, time to explore and lasting connections with the people in your corner.</p></section>
      <section><h2>The philosophy</h2><p>Train with intent, make time to recover and be present beyond the gym.</p></section>
      <section><h2>What we value</h2><p>Discipline in training, respect in the gym, curiosity about where we are and looking out for the group.</p></section>
      <section><h2>Founders and team</h2><p>Founder and team profiles, with portraits, will appear here.</p></section>
      <section><h2>Coaching team</h2><p>Look for coach profiles and credentials on confirmed retreat listings.</p></section>
    </div>
  </>;
}

function FAQ() {
  return <>
    <PageLead title="Frequently asked questions"><p>Training, travel and what to expect before making a retreat enquiry.</p></PageLead>
    <div className="section container faq-layout">{faq.map(([category, items]) => <section key={category}>
      <h2>{category}</h2><div>{items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
    </section>)}<ButtonLink href="/contact" secondary>Ask us a question</ButtonLink></div>
  </>;
}

export function App({ path = window.location.pathname.replace(/\/+$/, '') || '/' }: { path?: string }) {
  const media = useMedia();
  const retreat = retreats.find((item) => path === '/retreats/' + item.slug);
  let page;
  switch (path) {
    case '/': page = <Home media={media} />; break;
    case '/retreats': page = <Retreats />; break;
    case '/experience': page = <Experience />; break;
    case '/gallery': page = <><PageLead title="The LVLUP life."><p>Training, the places we go and the time spent together.</p><InstagramLink /></PageLead><div className="section container"><GalleryFilters media={media} /></div></>; break;
    case '/about': page = <About />; break;
    case '/faq': page = <FAQ />; break;
    case '/contact': page = <EnquiryPage kind="contact" />; break;
    case '/book': page = <EnquiryPage kind="booking" />; break;
    case '/studio': page = <Studio />; break;
    default: page = retreat ? <RetreatDetail retreat={retreat} media={media} /> : <PageLead title="Page not found"><ButtonLink href="/">Return home</ButtonLink></PageLead>;
  }
  return <><Header path={path} /><main id="main" tabIndex={-1}>{page}</main><Footer /></>;
}
