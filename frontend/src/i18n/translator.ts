import { DICT, PATTERNS, norm, Lang } from "./translations";

const ATTRS = ["placeholder", "title", "aria-label", "alt"] as const;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE"]);

/** Translate one piece of English text; returns null when there is no translation. */
export function translateText(text: string, lang: Lang): string | null {
  if (lang === "en") return null;
  const lead = text.match(/^\s*/)![0];
  const trail = text.match(/\s*$/)![0];
  const core = norm(text);
  if (!core || !/[A-Za-z]/.test(core)) return null;
  const dict = DICT[lang];

  const lookup = (s: string): string | null => {
    if (s in dict) return dict[s];
    for (const p of PATTERNS) {
      const m = s.match(p.re);
      if (m) return p[lang].replace(/\$(\d)/g, (_, i) => m[Number(i)] ?? "");
    }
    // "Label (12)" -> translated label + count
    const c = s.match(/^(.+?) \((\d+)\)$/);
    if (c && c[1] in dict) return `${dict[c[1]]} (${c[2]})`;
    return null;
  };

  let out = lookup(core);
  if (out == null) {
    // ignore leading icons/emoji and trailing arrows
    const m = core.match(/^([^\p{L}\p{N}#]*)(.*?)([\s→↗…:]*)$/u);
    if (m && m[2]) {
      const inner = lookup(m[2]);
      if (inner != null) out = m[1] + inner + m[3];
    }
  }
  return out == null ? null : lead + out + trail;
}

interface TextState { orig: string; applied: string }
const textState = new WeakMap<Text, TextState>();
const attrState = new WeakMap<Element, Record<string, TextState>>();

function shouldSkip(el: Element | null): boolean {
  for (let e = el; e; e = e.parentElement) {
    if (SKIP_TAGS.has(e.tagName) || e.hasAttribute("data-no-translate")) return true;
  }
  return false;
}

function applyText(node: Text, lang: Lang) {
  const st = textState.get(node);
  const cur = node.nodeValue ?? "";
  let orig = cur;
  if (st) {
    if (cur === st.applied) orig = st.orig; // untouched by anyone else
    // otherwise React (or app code) wrote a fresh English value
  }
  if (lang === "en") {
    if (st && cur === st.applied && cur !== st.orig) node.nodeValue = st.orig;
    textState.delete(node);
    return;
  }
  const t = translateText(orig, lang);
  if (t == null) {
    textState.delete(node);
    if (node.nodeValue !== orig) node.nodeValue = orig;
    return;
  }
  textState.set(node, { orig, applied: t });
  if (node.nodeValue !== t) node.nodeValue = t;
}

function applyAttrs(el: Element, lang: Lang) {
  let states = attrState.get(el);
  for (const a of ATTRS) {
    if (!el.hasAttribute(a)) continue;
    const cur = el.getAttribute(a)!;
    const st = states?.[a];
    let orig = cur;
    if (st && cur === st.applied) orig = st.orig;
    if (lang === "en") {
      if (st && cur === st.applied && cur !== st.orig) el.setAttribute(a, st.orig);
      if (states) delete states[a];
      continue;
    }
    const t = translateText(orig, lang);
    if (t == null) {
      if (states) delete states[a];
      if (cur !== orig) el.setAttribute(a, orig);
      continue;
    }
    if (!states) { states = {}; attrState.set(el, states); }
    states[a] = { orig, applied: t };
    if (cur !== t) el.setAttribute(a, t);
  }
}

export function translateTree(root: Node, lang: Lang) {
  if (root.nodeType === Node.TEXT_NODE) {
    if (!shouldSkip(root.parentElement)) applyText(root as Text, lang);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const rootEl = root as Element;
  if (shouldSkip(rootEl)) return;
  applyAttrs(rootEl, lang);
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let n: Node | null = walker.nextNode();
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) {
      if (!shouldSkip(n.parentElement)) applyText(n as Text, lang);
    } else if (!shouldSkip(n as Element)) {
      applyAttrs(n as Element, lang);
    }
    n = walker.nextNode();
  }
}

/** Keeps the whole document translated as React renders and updates it. */
export function startTranslating(lang: Lang): () => void {
  const root = document.getElementById("root") ?? document.body;
  translateTree(root, lang);
  document.title = translateText(document.title, lang) ?? document.title;

  let pending = false;
  const queue = new Set<Node>();
  const flush = () => {
    pending = false;
    obs.disconnect();
    queue.forEach((n) => { if (n.isConnected) translateTree(n, lang); });
    queue.clear();
    obs.observe(root, opts);
  };
  const opts: MutationObserverInit = {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: [...ATTRS],
  };
  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === "childList") m.addedNodes.forEach((n) => queue.add(n));
      else queue.add(m.target);
    }
    if (!pending) { pending = true; queueMicrotask(flush); }
  });
  obs.observe(root, opts);
  return () => obs.disconnect();
}
