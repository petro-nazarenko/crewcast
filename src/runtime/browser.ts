import { Page } from 'playwright';

export class BrowserRuntime {
  constructor(private page: Page) {}

  async jsFill(name: string, value: string): Promise<void> {
    await this.page.evaluate(({ name, value }) => {
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        `input[name="${name}"], textarea[name="${name}"]`
      );
      if (!el) return;
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, { name, value: String(value ?? '') }).catch(() => {});
  }

  async jsSelect(name: string, text: string): Promise<void> {
    await this.page.evaluate(({ name, text }) => {
      const sel = document.querySelector<HTMLSelectElement>(`select[name="${name}"]`);
      if (!sel) return;
      const upper = text.toUpperCase();
      const opt =
        [...sel.options].find(o => o.text.trim().toUpperCase() === upper) ||
        [...sel.options].find(o => o.text.trim().toUpperCase().includes(upper));
      if (opt) {
        sel.selectedIndex = [...sel.options].indexOf(opt);
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, { name, text }).catch(() => {});
  }

  async jsCheck(name: string, checked: boolean): Promise<void> {
    await this.page.evaluate(({ name, checked }) => {
      const el = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
      if (el) el.checked = checked;
    }, { name, checked }).catch(() => {});
  }

  async upload(locator: string, filePath: string): Promise<void> {
    await this.page.locator(locator).setInputFiles(filePath);
  }

  async click(locator: string): Promise<void> {
    await this.page.locator(locator).first().click();
  }

  async waitForFunction(expression: string, timeout = 60000): Promise<void> {
    await this.page.waitForFunction(expression, { timeout, polling: 300 });
  }

  async waitForNetworkIdle(timeout = 5000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  async screenshot(filePath: string): Promise<void> {
    await this.page.screenshot({ path: filePath, fullPage: true });
  }
}
