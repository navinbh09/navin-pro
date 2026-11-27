// The assistant's only knowledge: the same public text that's on the website,
// pulled straight from src/content/*.json so the two can never drift apart.
import site from '../src/content/site.json';
import home from '../src/content/home.json';
import cold from '../src/content/research-cold-plate.json';
import solar from '../src/content/research-solar-cells.json';
import projects from '../src/content/projects.json';
import temple from '../src/content/temple.json';
import about from '../src/content/about.json';

const clean = (s: string) =>
  s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const lines = (arr: string[] = []) => arr.map((s) => '- ' + clean(s)).join('\n');

export function buildKnowledge(): string {
  const parts: string[] = [];

  parts.push(`# About Navin (page: /about/)
${about.header.body.map(clean).join(' ')}
Tagline: ${site.tagline}
Email: ${site.email} · LinkedIn: ${site.linkedin}
Resume (1 page): ${site.files.resume} · Academic CV: ${site.files.cv} · SURGE poster: ${site.files.poster}

## Short version (page: /)
${home.intro.body.map(clean).join(' ')}
${home.intro.stops.map((s) => `- ${s.when}: ${s.place}. ${s.note}`).join('\n')}

## Stories behind the tools (page: /about/#tools)
${about.tools.list.map((t) => `### ${clean(t.title)}\n${t.body.map(clean).join(' ')}`).join('\n')}

## Teaching (page: /about/#teaching)
${about.teaching.body.map(clean).join(' ')}

## Where he's headed (page: /about/)
"${about.headed.quote}"
${about.headed.body.map(clean).join(' ')}

## Education
${about.education.map((e) => `- ${e.degree}, ${e.school}, ${e.when}. ${e.detail}`).join('\n')}
${about.courses.title}: ${about.courses.list.join('; ')}

## Experience
${about.experience.map((e) => `- ${e.role}, ${e.where} (${e.when})`).join('\n')}

## Honors
${lines(about.honors)}

## Outside the lab
${lines(about.outside.facts)}`);

  parts.push(`# Research: ${cold.header.title} (page: /research/cold-plate/)
${cold.header.meta.join(' · ')}
${clean(cold.header.summary)}
${cold.chapters
  .map((c) => {
    let t = `## ${c.eyebrow}: ${c.title} (page: /research/cold-plate/#${c.id})\n${c.body.map(clean).join(' ')}`;
    if (c.stats) t += '\n' + c.stats.map((s) => `Stat: ${s.value}, ${s.label}`).join('\n');
    if (c.callout) t += `\nNote (${c.callout.title}): ${clean(c.callout.text)}`;
    if (c.fixes) t += '\n' + c.fixes.map((f) => `Fix: ${f.problem}. ${f.what} Fix: ${f.fix}`).join('\n');
    if (c.loop) t += `\nOptimization loop: ${c.loop.join(' -> ')}, repeated until converged.`;
    return t;
  })
  .join('\n')}
## Presentations (page: /research/cold-plate/#presentations)
${cold.presentations.items.map((p) => `- ${p.what}, ${p.where}, ${p.when}. ${clean(p.note)}`).join('\n')}
${cold.thanks}`);

  parts.push(`# Research: ${solar.header.title} (page: /research/solar-cells/)
${solar.header.meta.join(' · ')}
${clean(solar.header.summary)}
${solar.sections
  .map((s) => `## ${s.title}\n${s.body.map(clean).join(' ')}${s.stats ? '\n' + s.stats.map((x) => `Stat: ${x.value}, ${x.label}`).join('\n') : ''}`)
  .join('\n')}
Presentation: ${solar.presentation.what}, ${solar.presentation.where}, ${solar.presentation.when}. ${solar.presentation.title}
${solar.thanks}`);

  parts.push(`# Projects (page: /projects/)
## ${temple.title} (page: /projects/temple/)
${temple.summary}
${temple.chapters.map((c) => `${c.title}: ${c.body.map(clean).join(' ')}`).join('\n')}
Lesson: "${temple.quote}"
${projects.items
  .map((p) => `## ${p.title} (${p.meta}) (page: /projects/#${p.id})\n${p.body.map(clean).join(' ')}${p.link ? `\nLink: ${p.link.href}` : ''}`)
  .join('\n')}`);

  return parts.join('\n\n');
}
