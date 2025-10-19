import { query } from '@anthropic-ai/claude-code';
import type { WebContents } from 'electron';

export class ClaudeService {
  async sendMessage(message: string, webContents: WebContents) {
    // 设置环境变量
    process.env.ANTHROPIC_BASE_URL = "https://claude.ybxqk.cn/api/";
    process.env.ANTHROPIC_AUTH_TOKEN = "cr_4e53f15cfb6a5f1d2e9304007242072174363a688219824a11ebe8295e7a0468";

    const conversation = query({
      prompt: message,
      options: {
        cwd: process.cwd(),
        includePartialMessages: true
      }
    });

    for await (const msg of conversation) {
      if (msg.type === 'stream_event') {
        const event = msg.event;
        if (event.type === 'content_block_delta' && event.delta?.text) {
          webContents.send('claude:message', {
            type: 'stream',
            content: event.delta.text
          });
        }
      } else if (msg.type === 'assistant') {
        webContents.send('claude:message', { type: 'complete' });
      }
    }
  }
}
