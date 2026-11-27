import { useState, type FormEvent } from 'react';
import { PageLead } from './components';
import { mediaCategories, retreats, type Enquiry, type Media } from './domain';

type StoredEnquiry = Enquiry & { reference: string; receivedAt: string };

async function callApi<T>(token: string, path: string, options?: RequestInit): Promise<T> {
  const response = await fetch('/api/studio/' + path, {
    ...options, headers: { Authorization: 'Bearer ' + token, ...options?.headers },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'The studio request failed.');
  return result;
}

export function Studio() {
  const [token, setToken] = useState('');
  const [media, setMedia] = useState<Media[]>([]);
  const [enquiries, setEnquiries] = useState<StoredEnquiry[]>([]);
  const [edit, setEdit] = useState<Media | null>(null);
  const [archive, setArchive] = useState<Media | null>(null);
  const [formId, setFormId] = useState(0);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setNotice('');
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const candidate = String(new FormData(event.currentTarget).get('token') || '').trim();
    void run(async () => {
      const [gallery, inbox] = await Promise.all([
        callApi<Media[]>(candidate, 'media'), callApi<StoredEnquiry[]>(candidate, 'enquiries'),
      ]);
      setMedia(gallery);
      setEnquiries(inbox);
      setToken(candidate);
    });
  }

  function reset(item: Media | null = null) {
    setEdit(item);
    setArchive(null);
    setFormId((value) => value + 1);
  }

  function upload(file: File) {
    if (file.size > 12 * 1024 * 1024) throw new Error('Upload a file of 12 MB or less.');
    return callApi<{ src: string }>(token, 'upload', { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(async () => {
      const file = form.get('file');
      const thumbnailFile = form.get('thumbnailFile');
      const src = file instanceof File && file.size ? (await upload(file)).src : String(form.get('src') ?? '');
      const thumbnail = thumbnailFile instanceof File && thumbnailFile.size ? (await upload(thumbnailFile)).src : String(form.get('thumbnail') ?? '');
      const item = await callApi<Media>(token, edit ? 'media/' + edit.id : 'media', {
        method: edit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src, thumbnail, caption: form.get('caption'), kind: form.get('kind'), instagram: form.get('instagram'), category: form.get('category'), retreat: form.get('retreat'), featured: form.has('featured') }),
      });
      setMedia((items) => edit ? items.map((entry) => entry.id === item.id ? item : entry) : [item, ...items]);
      reset();
      setNotice('Gallery item saved.');
    });
  }

  function remove(item: Media) {
    void run(async () => {
      await callApi(token, 'media/' + item.id, { method: 'DELETE' });
      setMedia((items) => items.filter((entry) => entry.id !== item.id));
      if (edit?.id === item.id) reset();
      setArchive(null);
      setNotice('Gallery item removed.');
    });
  }

  return <>
    <PageLead title="LVLUP Studio"><p>Manage the gallery and review enquiries.</p></PageLead>
    <div className="container section">
      {error && <p className="error quiet-note" role="alert">{error}</p>}
      {notice && <p className="quiet-note" role="status">{notice}</p>}
      {!token ? <form className="input-form studio-panel" onSubmit={signIn}>
        <label>Studio access token<input name="token" type="password" required autoComplete="off" /></label>
        <button className="button" disabled={busy}>{busy ? 'Opening…' : 'Open Studio'}</button>
      </form> : <div className="studio-grid">
        <form className="input-form studio-panel" key={formId} onSubmit={save}>
          <h2>{edit ? 'Edit media' : 'Add media'}</h2>
          <label>Type<select name="kind" defaultValue={edit?.kind}><option value="image">Photo</option><option value="video">Video</option></select></label>
          <label>Upload a photo or video<input name="file" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" /></label>
          <label>Or use a direct media URL<input name="src" placeholder="https://…" defaultValue={edit?.src} /></label>
          <label>Video thumbnail URL (optional)<input name="thumbnail" defaultValue={edit?.thumbnail} /></label>
          <label>Or upload a thumbnail<input name="thumbnailFile" type="file" accept="image/jpeg,image/png,image/webp" /></label>
          <label>Instagram post or Reel link (optional)<input name="instagram" type="url" defaultValue={edit?.instagram} /></label>
          <label>Caption<input name="caption" maxLength={300} defaultValue={edit?.caption} required /></label>
          <label>Retreat<select name="retreat" defaultValue={edit?.retreat ?? ''}><option value="">No retreat</option>{retreats.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
          <label>Category<select name="category" defaultValue={edit?.category}>{mediaCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="check"><input name="featured" type="checkbox" defaultChecked={edit?.featured} /> Feature on the homepage</label>
          <div className="actions"><button className="button" disabled={busy}>{busy ? 'Working…' : 'Save media'}</button>{edit && <button type="button" className="button button--outline" onClick={() => reset()}>Cancel</button>}</div>
        </form>
        <div>
          <section className="studio-panel">
            <h2>Gallery items</h2>
            {archive && <div><p>Remove “{archive.caption}” from the gallery?</p><div className="actions"><button className="button" disabled={busy} onClick={() => remove(archive)}>Remove item</button><button className="button button--outline" onClick={() => setArchive(null)}>Cancel</button></div></div>}
            {media.length ? <ol>{media.map((item) => <li key={item.id}>{item.caption}<button className="text-link" onClick={() => reset(item)} disabled={busy}>Edit</button><button className="text-link" onClick={() => setArchive(item)} disabled={busy}>Remove</button></li>)}</ol> :
              <p>The public gallery uses example media until you add an item.</p>}
          </section>
          <section className="studio-panel">
            <div className="actions"><h2>Enquiries</h2><button className="button button--outline" disabled={busy} onClick={() => void run(async () => setEnquiries(await callApi<StoredEnquiry[]>(token, 'enquiries')))}>Refresh</button></div>
            {enquiries.length ? <ol>{enquiries.map((item) => <li key={item.reference}>
              <strong>{item.name}</strong> · {item.reference}<br />
              <small>{new Date(item.receivedAt).toLocaleString('en-GB')}</small><br />
              <a href={'mailto:' + item.email}>{item.email}</a>
              <p>{item.kind === 'booking' ? [item.retreat, item.experience, item.phone].join(' · ') : item.topic}</p>
              {item.message && <p>{item.message}</p>}
            </li>)}</ol> : <p>No enquiries yet.</p>}
          </section>
          <button className="button button--outline" style={{ marginTop: '1rem' }} onClick={() => { setToken(''); setMedia([]); setEnquiries([]); reset(); }} disabled={busy}>Lock Studio</button>
        </div>
      </div>}
    </div>
  </>;
}
