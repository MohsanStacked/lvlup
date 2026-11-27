import { useEffect, useRef, useState } from 'react';
import { exampleMedia } from './content';
import { mediaCategories, retreats, type Media } from './domain';

export function useMedia() {
  const [media, setMedia] = useState(exampleMedia);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/media', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : [])
      .then((entries) => { if (Array.isArray(entries) && entries.length) setMedia(entries); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return media;
}

export function GalleryGrid({ media }: { media: Media[] }) {
  const [selected, setSelected] = useState<Media | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected && !dialog.current?.open) dialog.current?.showModal();
  }, [selected]);
  return <>
    <div className="gallery-grid">
      {media.map((item) => <figure key={item.id}>
        <button className="gallery-open" aria-label={(item.kind === 'video' ? 'Play ' : 'View ') + item.caption} onClick={() => setSelected(item)}>
          {item.kind === 'image' || item.thumbnail ? <img src={item.kind === 'image' ? item.src : item.thumbnail} alt="" loading="lazy" /> : <span className="video-thumbnail" />}
          {item.kind === 'video' && <span className="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 5v14l11-7z" /></svg></span>}
          <span className="gallery-overlay">{item.caption}</span>
        </button>
        <figcaption><span>{item.caption}{item.example && <small>Illustrative media</small>}</span>
          {item.instagram && <a href={item.instagram} target="_blank" rel="noreferrer">Instagram <span className="sr-only">(opens in a new tab)</span></a>}
        </figcaption>
      </figure>)}
    </div>
    <dialog ref={dialog} className="lightbox" aria-label={selected?.caption ?? 'Media viewer'} onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      {selected && <div className="lightbox-content">
        <button className="menu-button" onClick={() => dialog.current?.close()}>Close <span aria-hidden="true">×</span></button>
        {selected.kind === 'video' ? <video src={selected.src} poster={selected.thumbnail || undefined} controls playsInline preload="metadata" aria-label={selected.caption} /> : <img src={selected.src} alt={selected.caption} />}
        <p>{selected.caption} {selected.instagram && <a href={selected.instagram} target="_blank" rel="noreferrer">View on Instagram <span className="sr-only">(opens in a new tab)</span></a>}</p>
      </div>}
    </dialog>
  </>;
}

export function GalleryFilters({ media }: { media: Media[] }) {
  const [type, setType] = useState('');
  const [retreat, setRetreat] = useState('');
  const [category, setCategory] = useState('');
  const filtered = media.filter((item) => (!type || item.kind === type) && (!retreat || item.retreat === retreat) && (!category || item.category === category));
  return <>
    <div className="filters">
      <label>Media<select value={type} onChange={(event) => setType(event.target.value)}><option value="">All media</option><option value="image">Photos</option><option value="video">Videos</option></select></label>
      <label>Retreat<select value={retreat} onChange={(event) => setRetreat(event.target.value)}><option value="">All retreats</option>{retreats.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
      <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{mediaCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>
    <p className="filter-count" aria-live="polite">{filtered.length ? filtered.length + ' results' : 'No media matches these filters'}</p>
    <GalleryGrid media={filtered} />
  </>;
}
