import assets from 'virtual:lvlup-static';
import { exampleMedia } from '../src/content.ts';
import { validateEnquiry, validateMedia } from '../src/domain.ts';
import { createApi } from './api.mjs';
import { createSiteHandler } from './dispatch.mjs';
import { createWorkerStore } from './worker-store.mjs';

export default {
  fetch(request, env) {
    const api = createApi({ store: createWorkerStore(env), token: env.STUDIO_ACCESS_TOKEN, validateEnquiry, validateMedia, examples: exampleMedia });
    return createSiteHandler({ assets, api })(request);
  },
};
