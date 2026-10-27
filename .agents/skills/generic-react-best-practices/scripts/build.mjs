#!/usr/bin/env node
// Compiles rules/*.md into AGENTS.md and validates rule files.
// Usage: node scripts/build.mjs          -> validate + write AGENTS.md
//        node scripts/build.mjs --check  -> validate + fail if AGENTS.md is outdated
// Zero dependencies (Node >= 18). The same script is shipped in every *-react-best-practices skill;
// it is configured by the skill's metadata.json (title, note, dependsOn).
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = join(SKILL_DIR, '..')
const RULES_DIR = join(SKILL_DIR, 'rules')
const AGENTS_PATH = join(SKILL_DIR, 'AGENTS.md')
const SKILL_PATH = join(SKILL_DIR, 'SKILL.md')
const METADATA = JSON.parse(readFileSync(join(SKILL_DIR, 'metadata.json'), 'utf8'))
const SKILL_NAME = basename(SKILL_DIR)
const IMPACTS = ['CRITICAL', 'HIGH', 'MEDIUM-HIGH', 'MEDIUM', 'LOW-MEDIUM', 'LOW']
const CHECK_MODE = process.argv.includes('--check')

// Skills this one may reference (rule ids and "See also" links), and nothing else.
const DEPENDENCIES = METADATA.dependsOn ?? []
const ALLOWED_SKILLS = new Set([SKILL_NAME, ...DEPENDENCIES])

const errors = []
const fail = (file, message) => errors.push(`${file}: ${message}`)

const dependencyRuleIds = skill => {
  const dir = join(SKILLS_DIR, skill, 'rules')
  if (!existsSync(dir)) return new Set()
  return new Set(
    readdirSync(dir)
      .filter(f => f.endsWith('.md') && !f.startsWith('_'))
      .map(f => f.replace(/\.md$/, '')),
  )
}

const slugify = text =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s/g, '-')

const parseSections = () => {
  const content = readFileSync(join(RULES_DIR, '_sections.md'), 'utf8')
  const sections = []
  const regex =
    /^## (\d+)\. (.+?) \((\w[\w-]*)\)\s*\n+\*\*Impact:\*\*\s*(\S+)\s*\n\*\*Description:\*\*\s*(.+)$/gm
  let match
  while ((match = regex.exec(content)) !== null) {
    const [, number, title, prefix, impact, description] = match
    if (!IMPACTS.includes(impact)) fail('_sections.md', `invalid impact "${impact}" for ${prefix}`)
    sections.push({
      number: Number(number),
      title,
      prefix,
      impact,
      description: description.trim(),
    })
  }
  if (sections.length === 0) fail('_sections.md', 'no section found')
  return sections.sort((a, b) => a.number - b.number)
}

const parseFrontmatter = (file, content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    fail(file, 'missing frontmatter')
    return { data: {}, body: content }
  }
  const data = {}
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':')
    if (separator === -1) continue
    data[line.slice(0, separator).trim()] = line.slice(separator + 1).trim()
  }
  return { data, body: match[2].trim() }
}

const stripCodeBlocks = body => body.replace(/```[\s\S]*?```/g, '')

// Guard known host-repository references. Reusable custom APIs and lint contracts are allowed.
const FORBIDDEN = [
  [/\bsrc\/(configs|providers|router|__mocks__|index)\b/, 'repository file path'],
  [/@\/(configs|providers|shared\/(hooks|ui|ux))\b/, 'repository import path'],
  [/(CLAUDE\.md|\.docs\/|eslint\.config|tsconfig|vite\.config)/, 'repository documentation or config'],
]

const validateForbidden = (file, body) => {
  for (const [pattern, label] of FORBIDDEN) {
    const match = body.match(pattern)
    if (match) fail(file, `forbidden ${label}: "${match[0]}"`)
  }
  const skillMention =
    /\b[a-z]+(?:-[a-z]+)*-(?:best-practices|conception|strategy|standards)\b|\b(?:domain|shared|development|trustview|project)-(?:create|get|model|write|assistant|standards|processus|planning|implementation)[a-z-]*/g
  const skillProse = stripCodeBlocks(body).replace(/https?:\/\/[^\s)]+/g, '')
  for (const [name] of skillProse.matchAll(skillMention)) {
    if (!ALLOWED_SKILLS.has(name)) fail(file, `reference to a skill that is not allowed: "${name}"`)
  }
  const sourceDir = file === 'SKILL.md' ? SKILL_DIR : RULES_DIR
  for (const [, target] of stripCodeBlocks(body).matchAll(/\[[^\]\n]*\]\(([^\s)]+)\)/g)) {
    if (/^(?:[a-z][\w+.-]*:|#|\/)/i.test(target)) continue
    const destination = resolve(sourceDir, target.split('#')[0])
    const skillPath = relative(SKILLS_DIR, destination)
    if (skillPath === '..' || skillPath.startsWith('../') || isAbsolute(skillPath)) {
      fail(file, `relative link leaves the skills directory: "${target}"`)
      continue
    }
    const [skill] = skillPath.split(/[\\/]/)
    if (!ALLOWED_SKILLS.has(skill)) fail(file, `link to an undeclared companion skill: "${skill}"`)
  }
  if (/^Reference:/m.test(stripCodeBlocks(body)))
    fail(file, '"Reference:" lines are forbidden (no link to repository code)')
}

const validateSeeAlso = (file, body) => {
  const prose = stripCodeBlocks(body)
  for (const line of prose.split('\n').filter(l => l.startsWith('See also:'))) {
    for (const [, skill, rest] of line.matchAll(/`([a-z-]+-best-practices)`\s*→\s*([^;]*)/g)) {
      if (!DEPENDENCIES.includes(skill)) {
        fail(file, `"See also" points to a skill that is not allowed: ${skill}`)
        continue
      }
      const known = dependencyRuleIds(skill)
      if (known.size === 0) continue
      for (const [, id] of rest.matchAll(/`([a-z0-9-]+)`/g))
        if (!known.has(id)) fail(file, `unknown ${skill} rule: ${id}`)
    }
  }
}

const loadRules = sections => {
  const prefixes = new Map(sections.map(section => [section.prefix, section]))
  const files = readdirSync(RULES_DIR).filter(f => f.endsWith('.md') && !f.startsWith('_'))
  const rules = []
  for (const file of files) {
    const id = file.replace(/\.md$/, '')
    const prefix = [...prefixes.keys()].find(p => id.startsWith(`${p}-`))
    if (!prefix) {
      fail(file, 'filename prefix does not match any section in _sections.md')
      continue
    }
    const content = readFileSync(join(RULES_DIR, file), 'utf8')
    const { data, body } = parseFrontmatter(file, content)
    if (!data.title) fail(file, 'missing frontmatter "title"')
    if (!IMPACTS.includes(data.impact)) fail(file, `invalid or missing impact "${data.impact}"`)
    else if (IMPACTS.indexOf(data.impact) < IMPACTS.indexOf(prefixes.get(prefix).impact))
      fail(file, `impact ${data.impact} exceeds its section impact ${prefixes.get(prefix).impact}`)
    if (!data.tags) fail(file, 'missing frontmatter "tags"')
    const impactLine = body.match(/^\*\*Impact: ([A-Z-]+)/m)
    if (impactLine && impactLine[1] !== data.impact)
      fail(file, `body impact ${impactLine[1]} does not match frontmatter impact ${data.impact}`)

    const heading = body.match(/^## (.+)$/m)
    if (!heading) fail(file, 'missing "## <title>" heading')
    else if (heading[1].trim() !== data.title)
      fail(file, 'heading does not match frontmatter title')

    const prose = stripCodeBlocks(body)
    if (!/\*\*Incorrect\b/.test(prose)) fail(file, 'missing **Incorrect** example')
    if (!/\*\*Correct\b/.test(prose)) fail(file, 'missing **Correct** example')
    if ((body.match(/```/g) ?? []).length % 2 !== 0) fail(file, 'unbalanced code fences')
    validateForbidden(file, body)
    validateSeeAlso(file, body)

    rules.push({
      id,
      file,
      prefix,
      title: data.title ?? id,
      impact: data.impact,
      impactDescription: data.impactDescription,
      body,
    })
  }
  return rules
}

const compareRules = (a, b) =>
  IMPACTS.indexOf(a.impact) - IMPACTS.indexOf(b.impact) || a.title.localeCompare(b.title, 'en')

const validateLocalRuleMentions = (rules, sections) => {
  const ids = new Set(rules.map(rule => rule.id))
  for (const skill of DEPENDENCIES) for (const id of dependencyRuleIds(skill)) ids.add(id)
  const prefixPattern = sections.map(section => section.prefix).join('|')
  const mention = new RegExp(`\`((?:${prefixPattern})-[a-z0-9]+(?:-[a-z0-9]+)+)\``, 'g')
  for (const rule of rules) {
    for (const [, id] of stripCodeBlocks(rule.body).matchAll(mention)) {
      if (!ids.has(id)) fail(rule.file, `mentions unknown rule id "${id}"`)
    }
  }
}

const renderRuleBody = (rule, number) => {
  const impactLine = `**Impact: ${rule.impact}${rule.impactDescription ? ` (${rule.impactDescription})` : ''}**`
  let body = rule.body.replace(/^## .+$/m, `### ${number} ${rule.title}`)
  if (!/^\*\*Impact:/m.test(body)) {
    body = body.replace(/^(### .+)$/m, `$1\n\n${impactLine}`)
  }
  // Rule links are relative to rules/; the compiled document lives one level up.
  body = body.replace(/(\[[^\]\n]*\]\()([^\s)]+)(\))/g, (match, start, target, end) => {
    if (/^(?:[a-z][\w+.-]*:|#|\/)/i.test(target)) return match
    const [path, ...fragment] = target.split('#')
    const destination = relative(SKILL_DIR, resolve(RULES_DIR, path))
    return `${start}${destination}${fragment.length ? `#${fragment.join('#')}` : ''}${end}`
  })
  return body
}

const buildAgents = (sections, rules) => {
  const metadata = METADATA
  const grouped = sections
    .map(section => ({
      ...section,
      rules: rules.filter(rule => rule.prefix === section.prefix).sort(compareRules),
    }))
    .filter(section => section.rules.length > 0)

  const toc = grouped
    .map(section => {
      const header = `${section.number}. [${section.title}](#${slugify(`${section.number}. ${section.title}`)}) — **${section.impact}**`
      const items = section.rules.map((rule, index) => {
        const number = `${section.number}.${index + 1}`
        return `   - ${number} [${rule.title}](#${slugify(`${number} ${rule.title}`)})`
      })
      return [header, ...items].join('\n')
    })
    .join('\n')

  const content = grouped
    .map(section => {
      const rulesContent = section.rules
        .map((rule, index) => renderRuleBody(rule, `${section.number}.${index + 1}`))
        .join('\n\n')
      return `## ${section.number}. ${section.title}\n\n**Impact: ${section.impact}**\n\n${section.description}\n\n${rulesContent}`
    })
    .join('\n\n---\n\n')

  const references = (metadata.references ?? [])
    .map((reference, index) => `${index + 1}. \`${reference}\``)
    .join('\n')

  return `<!-- GENERATED FILE — do not edit. Run: node scripts/build.mjs -->

# ${metadata.title}

**Version ${metadata.version}**

${metadata.organization}

${metadata.date}

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring React code. ${metadata.note}

---

## Abstract

${metadata.abstract}

---

## Table of Contents

${toc}

---

${content}

---

## References

${references}
`
}

const validateSkillQuickReference = (rules, sections) => {
  if (!existsSync(SKILL_PATH)) {
    fail('SKILL.md', 'missing')
    return
  }
  const skill = readFileSync(SKILL_PATH, 'utf8')
  validateForbidden('SKILL.md', skill)
  const listedOrder = [...skill.matchAll(/^- `([a-z0-9-]+)` - /gm)].map(match => match[1])
  const listed = new Set(listedOrder)
  const ids = new Set(rules.map(rule => rule.id))
  for (const id of ids)
    if (!listed.has(id)) fail('SKILL.md', `rule "${id}" missing from Quick Reference`)
  for (const id of listed)
    if (!ids.has(id)) fail('SKILL.md', `Quick Reference lists unknown rule "${id}"`)
  const expectedOrder = sections.flatMap(section =>
    rules
      .filter(rule => rule.prefix === section.prefix)
      .sort(compareRules)
      .map(rule => rule.id),
  )
  if (listed.size === ids.size && listedOrder.join() !== expectedOrder.join())
    fail(
      'SKILL.md',
      'Quick Reference order must follow sections, then impact, then title (as AGENTS.md)',
    )
}

const sections = parseSections()
const rules = loadRules(sections)
validateSkillQuickReference(rules, sections)
validateLocalRuleMentions(rules, sections)
const agents = buildAgents(sections, rules)

if (CHECK_MODE) {
  const current = existsSync(AGENTS_PATH) ? readFileSync(AGENTS_PATH, 'utf8') : ''
  if (current !== agents) fail('AGENTS.md', 'outdated — run node scripts/build.mjs')
}

if (errors.length > 0) {
  console.error(`✖ ${errors.length} error(s):\n${errors.map(error => `  - ${error}`).join('\n')}`)
  process.exit(1)
}

if (!CHECK_MODE) writeFileSync(AGENTS_PATH, agents)
console.log(
  `✔ ${rules.length} rules in ${sections.length} sections${CHECK_MODE ? ' — AGENTS.md up to date' : ' — AGENTS.md written'}`,
)
