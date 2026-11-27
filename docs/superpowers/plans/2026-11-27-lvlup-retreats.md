# LVLUP Retreats Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** A responsive seven-section multi-page site with examples, gallery and persistent enquiries.
**Architecture:** Vite and React share typed content records. The server validates submissions and saves them to a local durable store or hosted D1. Media metadata remains independent of UI rendering.
**Spec:** User-supplied LVLUP website brief and approved Open-air Fight Camp hero with a coordinate marker.

## Global constraints

- Near-black #0B0D11 and magenta #F000B8. Use the approved headline and illustrative Phuket coordinates.
- Mark example destinations, imagery and schedules. Show no unconfirmed price, date, availability, claims, coaches or testimonials.
- Keep submission separate from booking and payment. Offer manual media management independently of Instagram credentials.

## Tasks

- [ ] Define retreat/media filtering and enquiry validation tests in tests/domain.test.mjs. Cover combined filters, unconfirmed dates, disallowed media URLs and missing booking fields.
- [ ] Implement the typed domain data and filters in src/domain.ts and the page layouts in src/App.tsx.
- [ ] Implement durable server submission, galleries, media upload and venue editing by structured data. Exercise real HTTP success, bad requests and persistence.
- [ ] Verify production build, desktop/mobile layouts, controls and isolated repository status. Preview privately through Sites when available.
