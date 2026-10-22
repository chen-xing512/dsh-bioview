/**
 * dsh-gene — browser half.
 *
 * Registers one named document renderer for the right Sidebar's file preview:
 * plasmid / gene / protein sequence files are parsed with `seqparse` (SnapGene
 * `.dna`, GenBank, FASTA, SBOL, SeqBuilder, JBEI, BioBrick, Benchling JSON) and
 * drawn with the interactive `SeqViz` viewer (circular / linear / both).
 *
 * The renderer is discovered through `ctx.documentPreviews` and its body is
 * registered in the keyed `sidebar.right.tab.document` slot, so it appears in
 * the preview's viewer switcher next to "Plain text" for every text format.
 */

import React from 'react'
import * as seqvizNamespace from 'seqviz'
import * as seqparseNamespace from 'seqparse'

/**
 * Resolve a CommonJS package's exported values under every interop shape a
 * host bundle may hand us (namespace, default-wrapped namespace, or plain
 * `module.exports`).
 */
function resolveSeqViz(namespace) {
  const outer = namespace && namespace.default ? namespace.default : namespace
  if (outer && typeof outer.SeqViz === 'function') return { component: outer.SeqViz, enzymes: outer.Enzymes || {} }
  if (namespace && typeof namespace.SeqViz === 'function') return { component: namespace.SeqViz, enzymes: namespace.Enzymes || {} }
  if (typeof outer === 'function') return { component: outer, enzymes: (namespace && namespace.Enzymes) || {} }
  return { component: null, enzymes: {} }
}

function resolveSeqparse(namespace) {
  const outer = namespace && namespace.default ? namespace.default : namespace
  const parse = (namespace && typeof namespace.parseFile === 'function' && namespace.parseFile)
    || (outer && typeof outer.parseFile === 'function' && outer.parseFile)
    || (typeof outer === 'function' && outer)
    || null
  return parse
}

const seqVizModule = resolveSeqViz(seqvizNamespace)
const SeqViz = seqVizModule.component
const Enzymes = seqVizModule.enzymes
const seqparseParseFile = resolveSeqparse(seqparseNamespace)

const NS = 'dshGene'
const VIEWER_ID = 'dsh-gene:seqviz'

/** Suffixes this renderer claims. `.dna` is the only binary one. */
const EXTENSIONS = [
  'dna',
  'gb',
  'gbk',
  'genbank',
  'ape',
  'fa',
  'fas',
  'fasta',
  'fna',
  'faa',
  'frn',
  'seq',
  'sbd',
  'sbol',
  'xml',
]

/** Binary suffixes lose the plain-text alternative. */
const BINARY_EXTENSIONS = ['dna']

/** Restriction enzymes shown for the "common" preset. */
const COMMON_ENZYMES = [
  'EcoRI',
  'BamHI',
  'HindIII',
  'XhoI',
  'SalI',
  'NotI',
  'PstI',
  'SmaI',
  'KpnI',
  'SacI',
  'SpeI',
  'XbaI',
  'NdeI',
  'BglII',
  'NcoI',
  'ApaI',
  'NheI',
  'MfeI',
  'AgeI',
  'BstEII',
]

/** Feature colors, picked deterministically per feature type. */
const FEATURE_COLORS = [
  '#4e79a7',
  '#f28e2b',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc948',
  '#b07aa1',
  '#ff9da7',
  '#9c755f',
  '#8a8f98',
]

const zh = {
  viewerTitle: '序列查看器',
  loading: '正在解析序列…',
  noBytes: '等待文件内容…',
  parseError: '无法解析为序列文件。',
  notSequence: '这个文件看起来不是质粒、基因或蛋白序列。可在预览标题栏的查看器菜单里切换到“纯文本”。',
  proteinGenbankTitle: '这是 GenBank 蛋白记录',
  proteinGenbankHint: '当前只解析 GenBank 的核酸记录（LOCUS 类型为 bp）。蛋白序列请改用 FASTA 格式（.faa / .fasta）。',
  emptySequence: '文件里没有可显示的序列。',
  dna: 'DNA',
  rna: 'RNA',
  protein: '蛋白',
  basePairs: '{count} bp',
  aminoAcids: '{count} aa',
  circular: '环状',
  linear: '线性',
  both: '并排',
  bothFlip: '反向并排',
  topology: '拓扑',
  searchPlaceholder: '搜索序列…',
  searchMatches: '{count} 处匹配',
  searchNoMatch: '无匹配',
  enzymes: '酶切位点',
  enzymeNone: '不显示',
  enzymeCommon: '常用酶',
  enzymeAll: '全部酶',
  complement: '互补链',
  ruler: '刻度',
  zoom: '缩放',
  records: '序列 {index}/{total}',
  format: '格式',
  length: '长度',
  name: '名称',
  selection: '选中 {start}–{end}',
  unsupportedType: '暂不支持该序列类型。',
  retryHint: '若文件其实是文本，请改用“纯文本”查看。',
  snapgene: 'SnapGene',
  genbank: 'GenBank',
  fasta: 'FASTA',
  sbol: 'SBOL',
  seqbuilder: 'SeqBuilder',
  jbei: 'JBEI',
  biobrick: 'BioBrick',
  benchling: 'Benchling',
  plainSeq: '序列',
  fileBadge: '.{ext}',
  enableEnzymes: '显示酶切位点',
  disableEnzymes: '隐藏酶切位点',
}

const en = {
  viewerTitle: 'Sequence viewer',
  loading: 'Parsing sequence…',
  noBytes: 'Waiting for file content…',
  parseError: 'This file could not be parsed as a sequence.',
  notSequence: 'This does not look like a plasmid, gene, or protein sequence. Use "Plain text" in the preview header to read it as text.',
  proteinGenbankTitle: 'This is a GenBank protein record',
  proteinGenbankHint: 'Only nucleotide GenBank records are parsed here (LOCUS molecule type "bp"). Save the protein as FASTA (.faa / .fasta) instead.',
  emptySequence: 'The file contains no sequence to display.',
  dna: 'DNA',
  rna: 'RNA',
  protein: 'Protein',
  basePairs: '{count} bp',
  aminoAcids: '{count} aa',
  circular: 'Circular',
  linear: 'Linear',
  both: 'Side by side',
  bothFlip: 'Reverse side by side',
  topology: 'Topology',
  searchPlaceholder: 'Search sequence…',
  searchMatches: '{count} matches',
  searchNoMatch: 'No match',
  enzymes: 'Restriction sites',
  enzymeNone: 'None',
  enzymeCommon: 'Common',
  enzymeAll: 'All',
  complement: 'Complement',
  ruler: 'Ruler',
  zoom: 'Zoom',
  records: 'Record {index}/{total}',
  format: 'Format',
  length: 'Length',
  name: 'Name',
  selection: 'Selected {start}–{end}',
  unsupportedType: 'This sequence type is not supported.',
  retryHint: 'If this file is really text, switch to "Plain text" in the preview header.',
  snapgene: 'SnapGene',
  genbank: 'GenBank',
  fasta: 'FASTA',
  sbol: 'SBOL',
  seqbuilder: 'SeqBuilder',
  jbei: 'JBEI',
  biobrick: 'BioBrick',
  benchling: 'Benchling',
  plainSeq: 'Sequence',
  fileBadge: '.{ext}',
  enableEnzymes: 'Show restriction sites',
  disableEnzymes: 'Hide restriction sites',
}

const CSS = `
.dsh-gene-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--dsw-alias-bg-document-preview, #f6f7f9);
  color: var(--dsw-alias-label-primary, #1b1b1f);
  font: 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}
.dsh-gene-status {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,0.22));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  user-select: none;
}
.dsh-gene-badge {
  flex: none;
  height: 18px;
  padding: 0 6px;
  border-radius: 5px;
  background: rgba(78, 121, 167, 0.14);
  color: var(--dsw-alias-label-secondary, #4a4a52);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 18px;
  white-space: nowrap;
}
.dsh-gene-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
}
.dsh-gene-meta {
  flex: none;
  color: var(--dsw-alias-label-tertiary, rgba(90,90,100,0.85));
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dsh-gene-dot { opacity: 0.5; }
.dsh-gene-records {
  flex: none;
  height: 22px;
  max-width: 180px;
  padding: 0 4px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,0.28));
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  color: inherit;
  font: inherit;
  font-size: 11px;
}
.dsh-gene-tools {
  flex: none;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 8px;
  padding: 5px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,0.16));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.dsh-gene-group {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: 7px;
  background: var(--dsw-alias-bg-layer-2, rgba(127,127,127,0.1));
}
.dsh-gene-iconbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #4a4a52);
  cursor: pointer;
}
.dsh-gene-iconbtn:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,0.16)); }
.dsh-gene-iconbtn:focus-visible,
.dsh-gene-toggle:focus-visible,
.dsh-gene-select:focus-visible,
.dsh-gene-records:focus-visible { outline: 2px solid rgba(78,121,167,0.7); outline-offset: 1px; }
.dsh-gene-search:focus-within { border-color: rgba(78,121,167,0.7); }
.dsh-gene-iconbtn[aria-pressed="true"] {
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #1b1b1f);
  box-shadow: 0 1px 2px rgba(0,0,0,0.12);
}
.dsh-gene-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 7px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,0.28));
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #4a4a52);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}
.dsh-gene-toggle:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,0.14)); }
.dsh-gene-toggle[aria-pressed="true"] {
  border-color: rgba(78,121,167,0.55);
  background: rgba(78,121,167,0.12);
  color: var(--dsw-alias-label-primary, #1b1b1f);
}
.dsh-gene-search {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 96px;
  height: 22px;
  padding: 0 6px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,0.28));
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2, #ffffff);
}
.dsh-gene-search input {
  width: 92px;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 11px;
}
.dsh-gene-matches {
  flex: none;
  font-size: 10.5px;
  color: var(--dsw-alias-label-tertiary, rgba(90,90,100,0.85));
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dsh-gene-select {
  height: 22px;
  max-width: 120px;
  padding: 0 2px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,0.28));
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  color: inherit;
  font: inherit;
  font-size: 11px;
}
.dsh-gene-zoom {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--dsw-alias-label-tertiary, rgba(90,90,100,0.85));
  font-size: 10.5px;
  white-space: nowrap;
}
.dsh-gene-zoom input { width: 64px; accent-color: #4e79a7; }
.dsh-gene-flags {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
.dsh-gene-canvas {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
  padding: 8px;
}
.dsh-gene-paper {
  box-sizing: border-box;
  flex: 1 1 auto;
  width: 100%;
  min-height: 380px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,0.2));
  background: #ffffff;
  overflow: hidden;
}
body[data-ds-dark-theme] .dsh-gene-paper {
  background: #f4f5f7;
  border-color: rgba(255,255,255,0.14);
}
.dsh-gene-view { width: 100%; height: 100%; }
.dsh-gene-note {
  margin: 0;
  padding: 28px 24px;
  max-width: 520px;
  color: var(--dsw-alias-label-secondary, #4a4a52);
  font-size: 12px;
  line-height: 1.6;
}
.dsh-gene-note strong { display: block; margin-bottom: 6px; color: var(--dsw-alias-label-primary, #1b1b1f); font-size: 13px; }
.dsh-gene-note code {
  padding: 1px 4px;
  border-radius: 4px;
  background: var(--dsw-alias-bg-layer-2, rgba(127,127,127,0.14));
  font-size: 11px;
}
.dsh-gene-error {
  color: var(--dsw-alias-state-error-primary, #c43d3d);
}
.dsh-gene-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: var(--dsw-alias-label-tertiary, rgba(90,90,100,0.85));
  font-size: 12px;
}
.dsh-gene-spinner {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(127,127,127,0.3);
  border-top-color: rgba(90,90,100,0.9);
  border-radius: 50%;
  animation: dsh-gene-spin 0.8s linear infinite;
}
@keyframes dsh-gene-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .dsh-gene-spinner { animation: none; } }
`

/** Read the workspace path out of a `dsh-resource://file/...` address. */
function pathFromAddress(address) {
  if (typeof address !== 'string') return ''
  const prefix = 'dsh-resource://file/'
  let rest = address.startsWith(prefix) ? address.slice(prefix.length) : address
  const scope = rest.startsWith('session/') ? 'session/' : rest.startsWith('absolute/') ? 'absolute/' : ''
  if (scope !== '') {
    rest = rest.slice(scope.length)
    if (scope === 'session/') {
      const slash = rest.indexOf('/')
      rest = slash >= 0 ? rest.slice(slash + 1) : ''
    }
  }
  const cut = rest.search(/[?#]/)
  if (cut >= 0) rest = rest.slice(0, cut)
  try {
    return decodeURIComponent(rest)
  } catch {
    return rest
  }
}

function basenameOf(path) {
  const clean = path.replace(/\/+$/, '')
  const slash = clean.lastIndexOf('/')
  return slash >= 0 ? clean.slice(slash + 1) : clean
}

function extensionOf(name) {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ''
}

/** Decode bytes as UTF-8, falling back to latin1 for binary containers. */
function decodeText(bytes) {
  try {
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    let out = ''
    for (let i = 0; i < bytes.length; i += 1) out += String.fromCharCode(bytes[i])
    return out
  }
}

/** Copy the byte region into a standalone ArrayBuffer, as seqparse expects. */
function toArrayBuffer(bytes) {
  const copy = bytes.slice()
  return copy.buffer
}

function detectFormat(fileName, text) {
  const ext = extensionOf(fileName)
  const head = text.slice(0, 400)
  if (ext === 'dna') return 'snapgene'
  if (ext === 'gb' || ext === 'gbk' || ext === 'genbank' || ext === 'ape') return 'genbank'
  if (ext === 'sbd') return 'seqbuilder'
  if (ext === 'sbol') return 'sbol'
  if (/sbols\.org|jbei\.org\/sequence/.test(head)) return 'sbol'
  if (head.startsWith('<seq:seq') || head.includes(':seq="http://jbei.org/sequence"')) return 'jbei'
  if (head.includes('<part_list>') || head.includes('Parts from the iGEM')) return 'biobrick'
  if (head.startsWith('>') || head.startsWith(';')) return 'fasta'
  if (ext === 'fa' || ext === 'fas' || ext === 'fasta' || ext === 'fna' || ext === 'faa' || ext === 'frn') return 'fasta'
  if (head.includes('LOCUS') && head.includes('ORIGIN')) return 'genbank'
  return 'plain'
}

/** A GenBank protein record declares `aa` as the LOCUS molecule type. */
function isProteinGenbank(text) {
  return /\bLOCUS\b[^\n]*\saa(?=\s)/i.test(text.slice(0, 4000))
}

function formatKey(format) {
  switch (format) {
    case 'snapgene': return 'snapgene'
    case 'genbank': return 'genbank'
    case 'fasta': return 'fasta'
    case 'sbol': return 'sbol'
    case 'seqbuilder': return 'seqbuilder'
    case 'jbei': return 'jbei'
    case 'biobrick': return 'biobrick'
    case 'benchling': return 'benchling'
    default: return 'plainSeq'
  }
}

function typeKey(record) {
  if (!record || record.type === 'aa') return record && record.type === 'aa' ? 'protein' : 'dna'
  if (record.type === 'rna') return 'rna'
  return 'dna'
}

function seqVizType(record) {
  if (record && record.type === 'aa') return 'aa'
  if (record && record.type === 'rna') return 'rna'
  return 'dna'
}

function trimRecordName(name, fallback) {
  let clean = typeof name === 'string' ? name.trim() : ''
  if (clean === '') return fallback
  clean = clean.replace(/\s+\([^)]*\)\s*$/, '').replace(/\s{2,}/g, ' ').trim()
  return clean === '' ? fallback : clean
}

/** Pick a stable color per feature type. */
function featureColor(annotation, index) {
  if (annotation && typeof annotation.color === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(annotation.color.trim())) {
    return annotation.color.trim()
  }
  const key = String((annotation && (annotation.type || annotation.name)) || '')
  let hash = 0
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return FEATURE_COLORS[(hash + index) % FEATURE_COLORS.length]
}

/**
 * Map seqparse annotations to SeqViz annotations, dropping empty ranges.
 *
 * SeqViz ranges are 0-based and end-exclusive. GenBank already reports that
 * shape, while seqparse's SnapGene reader reports an inclusive last position.
 * @param record - parsed sequence record.
 * @param inclusiveEnd - true when the source's end index is inclusive.
 */
function toSeqVizAnnotations(record, inclusiveEnd) {
  if (!record || !Array.isArray(record.annotations)) return []
  const out = []
  record.annotations.forEach((annotation, index) => {
    if (!annotation) return
    const start = Number(annotation.start)
    let end = Number(annotation.end)
    if (inclusiveEnd && Number.isFinite(end)) end += 1
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || start < 0) return
    const rawDirection = annotation.direction
    const direction = rawDirection === -1 || rawDirection === '-1' ? -1 : rawDirection === 0 || rawDirection === '0' ? 0 : 1
    out.push({
      name: String(annotation.name || annotation.type || `feature ${index + 1}`),
      start,
      end,
      direction,
      color: featureColor(annotation, index),
    })
  })
  return out
}

function enzymeSelection(mode) {
  if (mode === 'all') return Object.keys(Enzymes)
  if (mode === 'common') return COMMON_ENZYMES.filter((name) => Enzymes[name] !== undefined)
  return []
}

function formatNumber(value) {
  try {
    return value.toLocaleString()
  } catch {
    return String(value)
  }
}

const DNA_ALPHABET = /^[ACGTUNRYKMSWBDHV]+$/
const RNA_ALPHABET = /^[ACGUNRYKMSWBDHV]+$/
const AA_ALPHABET = /^[ACDEFGHIKLMNPQRSTVWYBXZJUO*]+$/

/**
 * Keep a parsed record only when its sequence really is a nucleotide or amino
 * acid sequence. `seqparse` accepts any mostly-ACGT text as DNA, so a generic
 * XML or config file would otherwise surface as a bogus 21 bp "sequence".
 */
function normalizeRecord(record) {
  if (!record || typeof record.seq !== 'string') return null
  const seq = record.seq.replace(/[\s\d]/g, '').toUpperCase()
  if (seq.length < 4) return null
  const type = record.type
  const alphabet = type === 'aa' ? AA_ALPHABET : type === 'rna' ? RNA_ALPHABET : type === 'dna' ? DNA_ALPHABET : null
  if (alphabet === null || !alphabet.test(seq)) return null
  return { ...record, seq }
}

function parseRecords(text, source, fileName) {
  const file = text === '' ? ' ' : text
  if (typeof seqparseParseFile !== 'function') throw new Error('seqparse parseFile is unavailable')
  const result = seqparseParseFile(file, { source, fileName })
  const raw = Array.isArray(result) ? result : result && typeof result === 'object' && typeof result.seq === 'string' ? [result] : []
  const records = raw.map(normalizeRecord).filter(Boolean)
  if (records.length === 0) throw new Error('no sequence record found')
  return records
}

/** Read the SnapGene container's own circular flag from its first DNA block. */
function snapgeneTopology(bytes) {
  try {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    let offset = 1
    if (view.getUint32(offset) !== 14) return 'linear'
    offset += 4
    const title = String.fromCharCode(...bytes.subarray(offset, offset + 8))
    offset += 8
    if (title !== 'SnapGene') return 'linear'
    offset += 6
    while (offset + 5 <= bytes.length) {
      const type = bytes[offset]
      const size = view.getUint32(offset + 1)
      offset += 5
      // Packet 0x00 carries a flags byte; bit 0 is the circular flag.
      if (type === 0) return (bytes[offset] & 0x01) === 1 ? 'circular' : 'linear'
      if (size <= 0) return 'linear'
      offset += size
    }
  } catch {
    // fall through to the linear default
  }
  return 'linear'
}

/**
 * Guess the molecule's topology for the initial viewer: SnapGene carries a
 * circular flag, GenBank states it on the LOCUS line; everything else starts
 * linear because that is the safe reading of a bare sequence.
 */
function detectTopology(format, text, bytes) {
  if (format === 'snapgene' && bytes) return snapgeneTopology(bytes)
  if (format === 'genbank') {
    const match = /^LOCUS\s+[^\n]*?\b(circular|linear)\b/im.exec(text.slice(0, 4000))
    if (match) return match[1].toLowerCase()
  }
  return 'linear'
}

/* ------------------------------------------------------------------ icons */

function TopologyIcon({ mode }) {
  const stroke = 'currentColor'
  const common = { fill: 'none', stroke, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (mode === 'circular') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="5.6" {...common} />
        <path d="M8 2.4 L8 5.8" {...common} strokeWidth="2.2" />
      </svg>
    )
  }
  if (mode === 'linear') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <line x1="1.6" y1="8" x2="14.4" y2="8" {...common} />
        <path d="M4.6 8 L7.6 5.4 L11.4 5.4 L11.4 10.6 L7.6 10.6 Z" fill="none" stroke={stroke} strokeWidth="1.3" />
      </svg>
    )
  }
  if (mode === 'both') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="4.8" cy="8" r="3.1" {...common} strokeWidth="1.4" />
        <line x1="9.2" y1="5.6" x2="9.2" y2="10.4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="12.2" y1="5.6" x2="12.2" y2="10.4" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <line x1="3.8" y1="5.6" x2="3.8" y2="10.4" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="6.8" y1="5.6" x2="6.8" y2="10.4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="11.2" cy="8" r="3.1" {...common} strokeWidth="1.4" />
    </svg>
  )
}

/* ---------------------------------------------------------------- body UI */

const TOPOLOGIES = [
  { mode: 'circular', key: 'circular' },
  { mode: 'linear', key: 'linear' },
  { mode: 'both', key: 'both' },
  { mode: 'both_flip', key: 'bothFlip' },
]

function GeneDocument(props) {
  const { t, content, useTabInfo } = props
  const tabInfo = typeof useTabInfo === 'function' ? useTabInfo() : null
  const tab = tabInfo && tabInfo.tab ? tabInfo.tab : null
  const path = pathFromAddress(props.resourceAddress)
  const fileName = basenameOf(path) || 'sequence'
  const data = content && content.kind === 'bytes' ? content.data : undefined

  const [parsed, setParsed] = React.useState({ kind: 'idle' })
  const [recordIndex, setRecordIndex] = React.useState(0)
  const [viewer, setViewer] = React.useState('circular')
  const [query, setQuery] = React.useState('')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [matches, setMatches] = React.useState(0)
  const [enzymeMode, setEnzymeMode] = React.useState('none')
  const [showComplement, setShowComplement] = React.useState(true)
  const [showIndex, setShowIndex] = React.useState(true)
  const [zoom, setZoom] = React.useState(50)

  /* Parse the file bytes once per content revision. */
  React.useEffect(() => {
    if (data === undefined) {
      setParsed({ kind: 'idle' })
      return undefined
    }
    let cancelled = false
    setParsed({ kind: 'parsing' })
    const run = () => {
      try {
        const text = decodeText(data)
        const format = detectFormat(fileName, text)
        if (format === 'genbank' && isProteinGenbank(text)) {
          if (cancelled) return
          setParsed({ kind: 'unsupported', code: 'protein-genbank' })
          return
        }
        const records = parseRecords(text, toArrayBuffer(data), fileName)
        const topology = detectTopology(format, text, data)
        if (cancelled) return
        setRecordIndex(0)
        setParsed({ kind: 'ready', format, topology, records })
        const first = records[0]
        const protein = Boolean(first && first.type === 'aa')
        setViewer(protein ? 'linear' : topology === 'circular' ? 'circular' : 'linear')
        setShowComplement(!protein)
      } catch (error) {
        if (cancelled) return
        if (typeof console !== 'undefined') console.warn('[dsh-gene] sequence parse failed:', error)
        setParsed({ kind: 'error', message: error && error.message ? String(error.message) : String(error) })
      }
    }
    const handle = setTimeout(run, 0)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [data, fileName])

  /* Debounce the search box into the viewer query. */
  React.useEffect(() => {
    const handle = setTimeout(() => setSearchQuery(query.trim()), 300)
    return () => clearTimeout(handle)
  }, [query])

  const records = parsed.kind === 'ready' ? parsed.records : []
  const record = records.length > 0 ? records[Math.min(recordIndex, records.length - 1)] : null
  const seqType = seqVizType(record)
  const protein = seqType === 'aa'
  const length = record && typeof record.seq === 'string' ? record.seq.length : 0
  const annotations = React.useMemo(
    () => toSeqVizAnnotations(record, parsed.kind === 'ready' && parsed.format === 'snapgene'),
    [record, parsed],
  )
  const enzymes = React.useMemo(() => (protein ? [] : enzymeSelection(enzymeMode)), [enzymeMode, protein])
  const search = React.useMemo(
    () => (searchQuery === '' ? undefined : { query: searchQuery }),
    [searchQuery],
  )
  const zoomProp = React.useMemo(() => ({ linear: zoom }), [zoom])
  const virtualName = React.useMemo(() => trimRecordName(record && record.name, fileName.replace(/\.[^.]+$/, '')), [record, fileName])

  const onSearch = React.useCallback((ranges) => {
    setMatches(Array.isArray(ranges) ? ranges.length : 0)
  }, [])

  const showLinear = viewer === 'linear' || viewer === 'both' || viewer === 'both_flip'
  const formatLabel = parsed.kind === 'ready' ? t(formatKey(parsed.format)) : ''
  const typeLabel = record === null ? '' : t(typeKey(record))
  const lengthText = record === null
    ? ''
    : protein
      ? t('aminoAcids', { count: formatNumber(length) })
      : t('basePairs', { count: formatNumber(length) })

  let body = null
  if (data === undefined) {
    body = (
      <div className="dsh-gene-loading">
        <span className="dsh-gene-spinner" aria-hidden="true" />
        <span>{t('noBytes')}</span>
      </div>
    )
  } else if (parsed.kind === 'idle' || parsed.kind === 'parsing') {
    body = (
      <div className="dsh-gene-loading">
        <span className="dsh-gene-spinner" aria-hidden="true" />
        <span>{t('loading')}</span>
      </div>
    )
  } else if (parsed.kind === 'unsupported' && parsed.code === 'protein-genbank') {
    body = (
      <div className="dsh-gene-note">
        <strong>{t('proteinGenbankTitle')}</strong>
        <div>{t('proteinGenbankHint')}</div>
      </div>
    )
  } else if (parsed.kind === 'error') {
    body = (
      <div className="dsh-gene-note">
        <strong className="dsh-gene-error">{t('parseError')}</strong>
        <div>{t('notSequence')}</div>
        <p>{t('retryHint')}</p>
      </div>
    )
  } else if (typeof SeqViz !== 'function') {
    body = (
      <div className="dsh-gene-note">
        <strong className="dsh-gene-error">SeqViz</strong>
        <p>{t('retryHint')}</p>
      </div>
    )
  } else if (length === 0) {
    body = (
      <div className="dsh-gene-note">
        <strong>{t('emptySequence')}</strong>
        <p>{t('retryHint')}</p>
      </div>
    )
  } else {
    body = (
      <div className="dsh-gene-paper">
        <div className="dsh-gene-view">
          <SeqViz
            name={virtualName}
            seq={record.seq}
            seqType={seqType}
            annotations={annotations}
            enzymes={enzymes}
            viewer={viewer}
            showComplement={protein ? false : showComplement}
            showIndex={showIndex}
            showAnnotations={true}
            zoom={zoomProp}
            search={search}
            onSearch={onSearch}
            disableExternalFonts={true}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="dsh-gene-root" data-dsh-gene-tab={tab ? tab.id : undefined}>
      <div className="dsh-gene-status">
        {formatLabel !== '' ? <span className="dsh-gene-badge" title={t('format')}>{formatLabel}</span> : null}
        <span className="dsh-gene-name" title={path}>{record ? virtualName : fileName}</span>
        {typeLabel !== '' ? <span className="dsh-gene-meta">{typeLabel}</span> : null}
        {lengthText !== '' ? <><span className="dsh-gene-meta dsh-gene-dot">·</span><span className="dsh-gene-meta">{lengthText}</span></> : null}
        {records.length > 1 ? (
          <select
            className="dsh-gene-records"
            value={Math.min(recordIndex, records.length - 1)}
            onChange={(event) => setRecordIndex(Number(event.target.value))}
            title={t('records', { index: recordIndex + 1, total: records.length })}
          >
            {records.map((item, index) => (
              <option value={index} key={index}>
                {trimRecordName(item && item.name, `#${index + 1}`)}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      {parsed.kind === 'ready' && record !== null ? (
      <div className="dsh-gene-tools">
        <span className="dsh-gene-group" title={t('topology')}>
          {TOPOLOGIES.map((item) => (
            <button
              key={item.mode}
              type="button"
              className="dsh-gene-iconbtn"
              aria-pressed={viewer === item.mode}
              aria-label={t(item.key)}
              title={t(item.key)}
              onClick={() => setViewer(item.mode)}
            >
              <TopologyIcon mode={item.mode} />
            </button>
          ))}
        </span>
        <span className="dsh-gene-search">
          <input
            type="search"
            value={query}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            onChange={(event) => setQuery(event.target.value)}
          />
        </span>
        {searchQuery !== '' ? (
          <span className="dsh-gene-matches">
            {matches > 0 ? t('searchMatches', { count: matches }) : t('searchNoMatch')}
          </span>
        ) : null}
        {!protein ? (
          <select
            className="dsh-gene-select"
            value={enzymeMode}
            title={t('enzymes')}
            aria-label={t('enzymes')}
            onChange={(event) => setEnzymeMode(event.target.value)}
          >
            <option value="none">{t('enzymeNone')}</option>
            <option value="common">{t('enzymeCommon')}</option>
            <option value="all">{t('enzymeAll')}</option>
          </select>
        ) : null}
        <span className="dsh-gene-flags">
          {!protein ? (
            <button
              type="button"
              className="dsh-gene-toggle"
              aria-pressed={showComplement}
              onClick={() => setShowComplement((value) => !value)}
            >
              {t('complement')}
            </button>
          ) : null}
          <button
            type="button"
            className="dsh-gene-toggle"
            aria-pressed={showIndex}
            onClick={() => setShowIndex((value) => !value)}
          >
            {t('ruler')}
          </button>
          {showLinear ? (
            <label className="dsh-gene-zoom">
              <span>{t('zoom')}</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={zoom}
                aria-label={t('zoom')}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
            </label>
          ) : null}
        </span>
      </div>
      ) : null}
      <div className="dsh-gene-canvas" ref={props.scrollportRef}>
        {body}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- registration */

export const name = 'dsh-gene'

export const inject = ['slots', 'locale', 'documentPreviews']

export function apply(ctx) {
  const t = ctx.locale.bind(NS)

  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-gene: dictionaries')

  ctx.effect(() => ctx.documentPreviews.register({
    id: VIEWER_ID,
    extensions: EXTENSIONS,
    binaryExtensions: BINARY_EXTENSIONS,
    priority: 'extension',
    title: () => t('viewerTitle'),
    loading: 'bytes-complete',
    wrap: false,
  }), 'dsh-gene: document renderer metadata')

  const style = document.createElement('style')
  style.dataset.dshGene = ''
  style.textContent = CSS
  document.head.append(style)
  ctx.effect(() => () => style.remove(), 'dsh-gene: styles')

  ctx.effect(() => ctx.slots.inject('sidebar.right.tab.document', () => ctx.slots.register({
    name: 'sidebar.right.tab.document',
    key: VIEWER_ID,
    locale: NS,
  }, GeneDocument)), 'dsh-gene: document body')
}

/** Test hooks: pure helpers exposed for the offline harness. */
export const __test = {
  pathFromAddress,
  basenameOf,
  extensionOf,
  detectFormat,
  decodeText,
  trimRecordName,
  featureColor,
  toSeqVizAnnotations,
  enzymeSelection,
  parseRecords,
  normalizeRecord,
  isProteinGenbank,
  detectTopology,
  snapgeneTopology,
  resolveSeqViz,
  resolveSeqparse,
  seqparseNamespace,
  EXTENSIONS,
  BINARY_EXTENSIONS,
  VIEWER_ID,
}
