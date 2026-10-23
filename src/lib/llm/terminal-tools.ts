import portfolioData from '../portfolio-data.json';
import type { ToolCall, ToolDefinition } from './types';

// Actions the terminal AI can take on the page. The model only asks for them;
// executeTerminalTool decides what actually happens, so a bad argument can
// never send a visitor somewhere outside this portfolio's own links.

export const TERMINAL_SECTIONS = [
  'about',
  'skills',
  'work',
  'projects',
  'writing',
  'education',
  'github',
  'contact',
] as const;

type Section = (typeof TERMINAL_SECTIONS)[number];

function collectLinks(value: unknown, links: Set<string>): Set<string> {
  if (typeof value === 'string') {
    if (/^https?:\/\//.test(value)) links.add(value);
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((child) => collectLinks(child, links));
  }
  return links;
}

// Every external link in portfolio-data.json, plus the gated report pages.
const ALLOWED_LINKS = collectLinks(
  {
    projects: portfolioData.projects,
    work: portfolioData.work,
    writing: portfolioData.writing,
    videos: portfolioData.videos,
    social: portfolioData.social,
  },
  new Set(),
);
const ALLOWED_PATHS = new Set(
  [...portfolioData.projects.personal, ...portfolioData.work]
    .flatMap((item) => [
      (item as { brief_url?: string }).brief_url,
      (item as { reportUrl?: string }).reportUrl,
    ])
    .filter((path): path is string => Boolean(path)),
);

export const TERMINAL_TOOLS: ToolDefinition[] = [
  {
    name: 'scroll_to_section',
    description:
      'Scroll the portfolio page to a section, e.g. when the visitor wants to see projects, experience or contact details.',
    parameters: {
      type: 'object',
      properties: {
        section: { type: 'string', enum: [...TERMINAL_SECTIONS] },
      },
      required: ['section'],
    },
  },
  {
    name: 'open_link',
    description:
      "Open one of Shravan's links in a new tab: a project, blog post, GitHub, LinkedIn or a report. Only use URLs that appear in the context.",
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Exact URL from the context.' },
      },
      required: ['url'],
    },
  },
  {
    name: 'open_resume',
    description: "Open Shravan's resume PDF in a new tab.",
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'copy_email',
    description: "Copy Shravan's email address to the visitor's clipboard so they can reach out.",
    parameters: { type: 'object', properties: {} },
  },
];

export interface ToolOutcome {
  ok: boolean;
  message: string;
}

export interface ToolHandlers {
  scrollTo: (sectionId: string) => void;
  openUrl: (url: string) => void;
}

export async function executeTerminalTool(
  call: ToolCall,
  handlers: ToolHandlers,
): Promise<ToolOutcome> {
  switch (call.name) {
    case 'scroll_to_section': {
      const section = String(call.arguments.section ?? '') as Section;
      if (!TERMINAL_SECTIONS.includes(section)) {
        return { ok: false, message: `no section called "${section}"` };
      }
      handlers.scrollTo(`#${section}`);
      return { ok: true, message: `scrolled to ${section}` };
    }
    case 'open_link': {
      const url = String(call.arguments.url ?? '');
      if (!ALLOWED_LINKS.has(url) && !ALLOWED_PATHS.has(url)) {
        return { ok: false, message: `blocked unknown link ${url}` };
      }
      handlers.openUrl(url);
      return { ok: true, message: `opened ${url}` };
    }
    case 'open_resume':
      handlers.openUrl(`/${portfolioData.personal.resumeFile}`);
      return { ok: true, message: 'opened resume' };
    case 'copy_email':
      try {
        await navigator.clipboard.writeText(portfolioData.personal.email);
        return { ok: true, message: `copied ${portfolioData.personal.email}` };
      } catch {
        return { ok: false, message: `copy failed, email is ${portfolioData.personal.email}` };
      }
    default:
      return { ok: false, message: `unknown action ${call.name}` };
  }
}
