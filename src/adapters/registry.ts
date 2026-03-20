import { SiteAdapter } from './types.js';
import { SailingaAdapter } from './sailinga/index.js';
import { CrewInspectorAdapter } from './crewinspector/index.js';
const adapters: Record<string, SiteAdapter> = {
  sailinga: new SailingaAdapter(),
  'crewinspector-orca': new CrewInspectorAdapter('orca'),
};
export function getAdapter(siteId: string): SiteAdapter {
  const adapter = adapters[siteId];
  if (!adapter) throw new Error(`Unknown adapter: ${siteId}. Available: ${Object.keys(adapters).join(', ')}`);
  return adapter;
}
