# LVLUP RETREATS

React, TypeScript and Vite website with pre-rendered page HTML and a small Cloudflare Worker API. The homepage uses the approved open-air camp design with an illustrative Phuket coordinate marker.

## Run locally

Use Node 20 or newer.

```sh
npm ci
npm test
npm run build
npm start
```

Open http://127.0.0.1:4173. The production preview saves local enquiries, gallery records and media to the ignored `.lvlup-data/` directory. For front-end styling with hot reload, use `npm run dev`. Use the built preview for form and upload testing.

## Configure the site

- Set the email address, official Instagram profile URL and hero location in `src/content.ts`.
- Update retreat details and dates in `src/domain.ts`. The four included destinations are examples. Update the detailed itinerary, inclusions, participant stories and team content with confirmed information before making a listing live.
- Open `/studio` to view enquiries or manage the gallery. Configure `STUDIO_ACCESS_TOKEN` as an environment secret. Choose a strong random value and store it in your password manager. For a local session, pass it as an environment variable to `npm start`.
- Studio accepts uploaded JPG, PNG, WebP, MP4 or WebM files up to 12 MB or direct HTTPS URLs. Add a caption, optional video thumbnail, retreat, category and separate Instagram post or Reel link. Select the homepage option to feature an item. Replace the example assets and copy with genuine LVLUP material as it becomes available.
- An Instagram post URL is a link to the original post. The gallery uses manually supplied media files or direct URLs. Credentials for Instagram integration can be added later.
- Forms record an enquiry and return a reference. Read submissions in Studio. Payment, booking confirmation and email delivery would use separate services.

## Hosted storage

The Sites Worker uses the `DB` D1 binding for enquiries and gallery metadata and the `BUCKET` R2 binding for uploaded media. The initial schema is in `drizzle/` and the build writes `dist/server/index.js`.

The preview imagery is generated and illustrative. Replace it with approved photography for launch.
