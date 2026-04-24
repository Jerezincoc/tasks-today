import { type Priority } from "./tasks";

export interface ParsedTask {
  title: string;
  priority?: Priority;
  due_date?: Date;
  tags?: string[];
}

const PRIORITY_KEYWORDS: Record<string, Priority> = {
  alta: "alta",
  urgente: "urgente",
  media: "media",
  baixa: "baixa",
};

const DATE_KEYWORDS: Record<string, () => Date> = {
  "hoje": () => new Date(),
  "amanhã": () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  },
  "amanha": () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  },
  "segunda": () => getNextDay(1),
  "terça": () => getNextDay(2),
  "terca": () => getNextDay(2),
  "quarta": () => getNextDay(3),
  "quinta": () => getNextDay(4),
  "sexta": () => getNextDay(5),
  "sabado": () => getNextDay(6),
  "sábado": () => getNextDay(6),
  "domingo": () => getNextDay(0),
};

function getNextDay(dayOfWeek: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((dayOfWeek + 7 - d.getDay()) % 7 || 7));
  return d;
}

export function parseQuickAdd(input: string): ParsedTask {
  let title = input;
  let priority: Priority | undefined;
  let due_date: Date | undefined;
  const tags: string[] = [];

  // Extract tags (words starting with #)
  const tagMatches = title.match(/#[\w\u00C0-\u00FF]+/g);
  if (tagMatches) {
    tagMatches.forEach(tag => {
      tags.push(tag.substring(1));
      title = title.replace(tag, "");
    });
  }

  const lowerInput = input.toLowerCase();

  // Find priority
  for (const [key, val] of Object.entries(PRIORITY_KEYWORDS)) {
    if (lowerInput.includes(`prioridade ${key}`) || lowerInput.includes(` ${key} prioridade`)) {
      priority = val;
      title = title.replace(new RegExp(`prioridade ${key}`, 'i'), "").replace(new RegExp(`${key} prioridade`, 'i'), "");
      break;
    }
  }

  // Find date
  for (const [key, getVal] of Object.entries(DATE_KEYWORDS)) {
    if (lowerInput.includes(` ${key}`) || lowerInput.startsWith(`${key} `)) {
      // If we find a date keyword, use it and remove it from title
      const regex = new RegExp(`\\b${key}\\b`, 'i');
      if (regex.test(title)) {
        due_date = getVal();
        title = title.replace(regex, "");
        break;
      }
    }
  }

  return {
    title: title.replace(/\s+/g, ' ').trim(),
    priority,
    due_date,
    tags: tags.length > 0 ? tags : undefined
  };
}
