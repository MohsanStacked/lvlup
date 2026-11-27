import assets from 'virtual:lvlup-static';
import { exampleMedia } from '../src/content.ts';
import { validateEnquiry, validateMedia } from '../src/domain.ts';
import { createApi } from './api.mjs';
import { createSiteHandler } from './dispatch.mjs';
import { createLocalStore } from './local-store.mjs';

export function createLocalApp(directory, token) {
  const api = createApi({ store: createLocalStore(directory), token, validateEnquiry, validateMedia, examples: exampleMedia });
  return createSiteHandler({ assets, api });
}
