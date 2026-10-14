export * from './types';
export * from './groq-provider';
export * from './chat-service';

import { GroqProvider } from './groq-provider';
import { ChatService } from './chat-service';
import type { LLMConfig } from './types';
import portfolioData from '../portfolio-data.json';

export function createGroqChatService(
  config: LLMConfig = {},
  systemPrompt?: string,
  apiKey?: string,
): ChatService {
  const provider = new GroqProvider(apiKey);
  return new ChatService(provider, config, systemPrompt);
}

// Portfolio context that gets injected into every AI conversation, built from
// portfolio-data.json so the clone stays in sync with the site
const { personal, work, projects, writing, social } = portfolioData;
const allProjects = [...projects.personal, ...projects.automation, ...projects.tools];

const PORTFOLIO_CONTEXT = `
PORTFOLIO OWNER CONTEXT:
- Name: ${personal.name}, ${personal.title} based in ${personal.location}
- Email: ${personal.email}
- Links: LinkedIn ${social.linkedin}, GitHub ${social.github}, Blog ${social.blog}
- Bio: ${personal.bio}
- Highlights:
${personal.intro.map((line) => `  - ${line}`).join('\n')}

WORK EXPERIENCE:
${work
  .map(
    (w) =>
      `- ${w.position} at ${w.company} (${w.startDate} to ${w.endDate})\n${w.description.map((d) => `  - ${d}`).join('\n')}`,
  )
  .join('\n')}

PROJECTS (more at /#projects):
${allProjects.map((p) => `- ${p.name}: ${p.description} (${p.metrics})`).join('\n')}

BLOG POSTS (${writing.blog_url}):
${writing.featured_posts.map((p) => `- ${p.title}`).join('\n')}

You are assisting visitors to Shravan's portfolio website. Use this context to provide relevant, personalized responses.
`;

export const DEFAULT_SYSTEM_PROMPTS = {
  assistant: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
  coder: 'You are an expert programmer. Help with coding questions, debugging, and best practices.',
  creative:
    'You are a creative AI assistant. Help with brainstorming, writing, and creative problem-solving.',
  terminal: `
  You are a terminal AI assistant integrated into Shravan's portfolio website. Provide clear, concise, and accurate responses. DO NOT USE MARKDOWN IN YOUR RESPONSE.
  ---
  ${PORTFOLIO_CONTEXT} 
  ---
  Be helpful, concise, and engaging while using a simple tone. Use the portfolio context above to answer questions about Shravan if user asks. AVOID MARKDOWN RESPONSE.`,
} as const;
