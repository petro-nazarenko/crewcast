import { SiteAdapter } from './types.js';
import { SailingaAdapter } from './sailinga/index.js';
const adapters: Record<string, SiteAdapter> = {
  sailinga: new SailingaAdapter(),
};
export function getAdapter(siteId: string): SiteAdapter {
  const adapter = adapters[siteId];
  if (!adapter) throw new Error(`Unknown adapter: ${siteId}`);
  return adapter;
}
