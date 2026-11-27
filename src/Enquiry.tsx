import { useState, type FormEvent } from 'react';
import { ButtonLink, PageLead } from './components';
import { brand } from './content';
import { contactTopics, experienceLevels, retreats, validateEnquiry } from './domain';

export function EnquiryPage({ kind }: { kind: 'booking' | 'contact' }) {
  const isBooking = kind === 'booking';
  const selectedRetreat = typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('retreat') || '';
  const [status, setStatus] = useState<'ready' | 'sending' | 'sent' | 'error'>('ready');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const data = validateEnquiry({ ...raw, kind });
    if (!data) {
      setError('Check your details and complete all required fields. For phone numbers, include your country code where possible.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, website: raw.website }),
      });
      if (!response.ok) throw new Error('Submission failed');
      const result = await response.json();
      if (typeof result.reference !== 'string') throw new Error('Missing reference');
      setReference(result.reference);
      setStatus('sent');
    } catch {
      setError('We couldn’t submit your enquiry. Your details are still here. Please try again.');
      setStatus('error');
    }
  }
  return <>
    <PageLead title={isBooking ? 'Book your place' : 'Get in touch'}><p>{isBooking ? 'Tell us which retreat you’re interested in and how you train. This form registers your interest.' : 'Ask about a camp, how LVLUP works, or working together.'}</p></PageLead>
    <section className="container section form-layout">
      <div>
        <h2>{isBooking ? 'Retreat enquiry' : 'Send a message'}</h2>
        {isBooking ? <p>Example retreats are open for expressions of interest. A place is confirmed through a separate booking process when a camp opens.</p> :
          <><p>For general questions, retreat enquiries and partnerships.</p>
          {brand.email ? <a className="text-link" href={'mailto:' + brand.email}>{brand.email}</a> : <p>Direct email details coming soon.</p>}
          {brand.instagram && <p><a href={brand.instagram} target="_blank" rel="noreferrer">Instagram <span className="sr-only">(opens in a new tab)</span></a></p>}
          <ButtonLink href="/faq" secondary>Read the FAQ</ButtonLink></>}
      </div>
      {status === 'sent' ? <div className="confirmation" role="status"><h3>Enquiry received</h3><p>Thanks for getting in touch. Your reference is <strong>{reference}</strong>.</p>{isBooking && <p>We’ve recorded your interest in the retreat.</p>}<ButtonLink href="/retreats" secondary>Explore retreats</ButtonLink></div> :
        <form className="input-form" onSubmit={submit}>
          <div className="field-pair">
            <label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>
            <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          </div>
          {isBooking ? <>
            <label>Phone number<input name="phone" type="tel" autoComplete="tel" required maxLength={30} /></label>
            <div className="field-pair">
              <label>Selected retreat<select name="retreat" required defaultValue={retreats.some((item) => item.slug === selectedRetreat) ? selectedRetreat : ''}>
                <option value="" disabled>Choose a retreat</option>{retreats.map((item) => <option key={item.slug} value={item.slug}>{item.name}{item.status === 'example' ? ' (example)' : ''}</option>)}
              </select></label>
              <label>Training experience<select name="experience" defaultValue="" required>
                <option value="" disabled>Choose a level</option>{experienceLevels.map((item) => <option key={item}>{item}</option>)}
              </select></label>
            </div>
          </> : <label>Enquiry type<select name="topic">{contactTopics.map((item) => <option key={item}>{item}</option>)}</select></label>}
          <label>{isBooking ? 'Additional questions (optional)' : 'Message'}<textarea name="message" rows={5} maxLength={2000} required={!isBooking} /></label>
          <label className="honey" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          {status === 'error' && <p role="alert" className="error">{error}</p>}
          <button className="button" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : isBooking ? 'Send booking enquiry' : 'Send message'}</button>
        </form>}
    </section>
  </>;
}
