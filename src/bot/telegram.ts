import { Bot, Context } from 'grammy';
import { getAdapter } from '../adapters/registry.js';
import { normalizeProfile } from '../normalizers/profileNormalizer.js';
import { validateProfileSchema } from '../validators/profileSchema.js';
import { EngineRunner } from '../engine/runner.js';
import { ResultStorage } from '../storage/resultStorage.js';
import { SeafarerProfile } from '../domain/profile.js';
import { Logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = new Logger();

const AVAILABLE_SITES = ['sailinga', 'crewinspector-orca'];
const WAITING_FOR_PROFILE = new Map<number, string>(); // chatId → siteId

/**
 * Escapes all Telegram MarkdownV2 special characters in a string.
 * Backslash must be escaped first to avoid double-escaping.
 */
function escapeMd(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

function buildHelpText(): string {
  return [
    '📋 *CrewCast Bot* — automated seafarer profile submission',
    '',
    '*Commands:*',
    '/start — welcome message',
    '/help — show this help',
    '/sites — list available crewing sites',
    `/preview <siteId> — send your profile\\.json for preview`,
    '',
    '*Example:*',
    '1\\. `/preview sailinga`',
    '2\\. Send your `profile\\.json` file',
    '3\\. Get back the submission plan summary',
    '',
    '_Sites: ' + AVAILABLE_SITES.map(s => '`' + s + '`').join(', ') + '_',
  ].join('\n');
}

export function createBot(token: string): Bot<Context> {
  const bot = new Bot<Context>(token);

  bot.command('start', async ctx => {
    await ctx.reply(
      '👋 Welcome to *CrewCast Bot*\\!\n\nUse /help to see available commands\\.',
      { parse_mode: 'MarkdownV2' }
    );
  });

  bot.command('help', async ctx => {
    await ctx.reply(buildHelpText(), { parse_mode: 'MarkdownV2' });
  });

  bot.command('sites', async ctx => {
    const list = AVAILABLE_SITES.map(s => `• \`${s}\``).join('\n');
    await ctx.reply(`*Available crewing sites:*\n\n${list}`, { parse_mode: 'MarkdownV2' });
  });

  bot.command('preview', async ctx => {
    const siteId = ctx.match?.trim();
    if (!siteId) {
      await ctx.reply('Usage: `/preview <siteId>`\n\nExample: `/preview sailinga`', { parse_mode: 'MarkdownV2' });
      return;
    }
    if (!AVAILABLE_SITES.includes(siteId)) {
      const escaped = escapeMd(siteId);
      await ctx.reply(
        `❌ Unknown site: \`${escaped}\`\n\nAvailable: ${AVAILABLE_SITES.map(s => `\`${s}\``).join(', ')}`,
        { parse_mode: 'MarkdownV2' }
      );
      return;
    }
    const chatId = ctx.chat?.id;
    if (chatId === undefined) return;
    WAITING_FOR_PROFILE.set(chatId, siteId);
    const escapedSite = escapeMd(siteId);
    await ctx.reply(
      `✅ Site set to \`${escapedSite}\`\\.\n\n📎 Now send your \`profile\\.json\` file\\.`,
      { parse_mode: 'MarkdownV2' }
    );
  });

  bot.on('message:document', async ctx => {
    const chatId = ctx.chat?.id;
    if (chatId === undefined) return;

    const siteId = WAITING_FOR_PROFILE.get(chatId);
    if (!siteId) {
      await ctx.reply(
        '⚠️ Please first choose a site with `/preview <siteId>`\\.',
        { parse_mode: 'MarkdownV2' }
      );
      return;
    }

    const doc = ctx.message.document;
    if (!doc.file_name?.endsWith('.json')) {
      await ctx.reply('⚠️ Please send a `.json` file\\.', { parse_mode: 'MarkdownV2' });
      return;
    }

    await ctx.reply('⏳ Processing your profile\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      // Download the file
      const file = await ctx.getFile();
      const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      const resp = await fetch(fileUrl);
      if (!resp.ok) throw new Error(`Failed to download file: ${resp.statusText}`);
      const text = await resp.text();

      // Parse JSON
      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch {
        await ctx.reply('❌ Invalid JSON in the uploaded file\\.', { parse_mode: 'MarkdownV2' });
        return;
      }

      // Schema validation
      const schemaError = validateProfileSchema(raw);
      if (schemaError) {
        await ctx.reply(`❌ ${escapeMd(schemaError)}`, { parse_mode: 'MarkdownV2' });
        return;
      }

      // Normalise and build plan
      const profile: SeafarerProfile = normalizeProfile(raw as SeafarerProfile);
      const adapter = getAdapter(siteId);
      const plan = adapter.buildSubmissionPlan(profile);

      // Run in preview mode
      const artifactsDir = path.join(__dirname, '../../artifacts');
      const runner = new EngineRunner(artifactsDir);
      const storage = new ResultStorage(path.join(artifactsDir, 'results'));
      const result = await runner.run(plan, profile, 'preview');
      storage.save(result);

      // Build summary
      const statusIcon = result.success ? '✅' : '❌';
      const profileName = escapeMd(`${profile.firstName} ${profile.lastName}`);
      const lines: string[] = [
        `${statusIcon} *Preview for \`${escapeMd(siteId)}\`*`,
        '',
        `👤 Profile: ${profileName}`,
        `📝 Actions planned: ${plan.actions.length}`,
        `⚠️ Validation: ${result.validationStatus}`,
      ];
      if (result.validationWarnings.length > 0) {
        lines.push('', '*Warnings:*');
        result.validationWarnings.forEach(w => {
          lines.push(`• ${escapeMd(w)}`);
        });
      }
      lines.push('', '_Run with the CLI tool to submit for real\\._');

      await ctx.reply(lines.join('\n'), { parse_mode: 'MarkdownV2' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`Bot error for chat ${chatId}: ${message}`);
      await ctx.reply(`❌ Error: ${escapeMd(message)}`, { parse_mode: 'MarkdownV2' });
    } finally {
      WAITING_FOR_PROFILE.delete(chatId);
    }
  });

  return bot;
}
