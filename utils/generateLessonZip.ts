import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { slidesData } from '@data/slidesData';
import { materialContent } from '@data/materialContent';
import { courseModules } from '@data/courseData';
import { SlideRenderer } from '@pages/claudecode/SlidesPage';
import type { Slide } from '@data/slidesData';

// ─── Slide capture ────────────────────────────────────────────────────────────

const SLIDE_W = 1280;
const SLIDE_H = 720;

async function captureSlide(slide: Slide): Promise<string> {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    `width:${SLIDE_W}px`,
    `height:${SLIDE_H}px`,
    'overflow:hidden',
    'z-index:-1',
  ].join(';');
  document.body.appendChild(wrapper);

  const inner = document.createElement('div');
  inner.style.cssText = `width:${SLIDE_W}px;height:${SLIDE_H}px;display:flex;align-items:stretch;`;
  wrapper.appendChild(inner);

  const root = createRoot(inner);

  await new Promise<void>(resolve => {
    root.render(createElement(SlideRenderer, { slide, step: 0 }));
    // give React + fonts + CSS a moment to settle
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 120)));
  });

  const canvas = await html2canvas(inner, {
    width: SLIDE_W,
    height: SLIDE_H,
    scale: 1,
    useCORS: true,
    logging: false,
    backgroundColor: null,
  });

  root.unmount();
  document.body.removeChild(wrapper);

  return canvas.toDataURL('image/jpeg', 0.92);
}

// ─── Slides PDF ───────────────────────────────────────────────────────────────

async function buildSlidesPDF(moduleId: number): Promise<ArrayBuffer> {
  const slides = slidesData[moduleId] ?? [];

  // jsPDF in px mode: 1 pt = 1 px at 96 dpi; use mm with explicit page size
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [SLIDE_W, SLIDE_H],
    hotfixes: ['px_scaling'],
  });

  for (let i = 0; i < slides.length; i++) {
    if (i > 0) doc.addPage([SLIDE_W, SLIDE_H], 'landscape');
    const imgData = await captureSlide(slides[i]);
    doc.addImage(imgData, 'JPEG', 0, 0, SLIDE_W, SLIDE_H);
  }

  return doc.output('arraybuffer');
}

// ─── Material PDF (markdown → text PDF) ──────────────────────────────────────

const PAGE_W = 210;
const PAGE_H = 297;
const M = 18;
const CW = PAGE_W - M * 2;

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0, 2), 16) || 80, parseInt(c.slice(2, 4), 16) || 80, parseInt(c.slice(4, 6), 16) || 80];
}

function stripMd(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

class Writer {
  private doc: jsPDF;
  private y: number = M;

  constructor(doc: jsPDF) {
    this.doc = doc;
    this.footerPage();
  }

  private footerPage() {
    const n = (this.doc.internal as any).getNumberOfPages();
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(190, 190, 190);
    this.doc.text(String(n), PAGE_W / 2, PAGE_H - 8, { align: 'center' });
  }

  private need(mm: number) {
    if (this.y + mm > PAGE_H - M - 10) {
      this.doc.addPage();
      this.y = M;
      this.footerPage();
    }
  }

  h1(text: string, color?: string) {
    const [r, g, b] = color ? hexToRgb(color) : [20, 20, 20];
    this.need(14);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(r, g, b);
    const lines: string[] = this.doc.splitTextToSize(stripMd(text), CW);
    for (const line of lines) {
      this.need(10);
      this.doc.text(line, M, this.y);
      this.y += 9;
    }
    this.y += 2;
  }

  h2(text: string) {
    this.need(12);
    this.doc.setFontSize(13);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(40, 40, 40);
    const lines: string[] = this.doc.splitTextToSize(stripMd(text), CW);
    for (const line of lines) {
      this.need(8);
      this.doc.text(line, M, this.y);
      this.y += 7;
    }
    this.y += 1;
  }

  h3(text: string) {
    this.need(10);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(55, 55, 55);
    const lines: string[] = this.doc.splitTextToSize(stripMd(text), CW);
    for (const line of lines) {
      this.need(7);
      this.doc.text(line, M, this.y);
      this.y += 6;
    }
    this.y += 1;
  }

  p(text: string) {
    const clean = stripMd(text);
    if (!clean) return;
    this.need(6);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    const lines: string[] = this.doc.splitTextToSize(clean, CW);
    for (const line of lines) {
      this.need(6);
      this.doc.text(line, M, this.y);
      this.y += 5.5;
    }
    this.y += 1.5;
  }

  bullet(text: string, indent = 0) {
    const clean = stripMd(text);
    if (!clean) return;
    const x = M + indent;
    const maxW = CW - indent - 4;
    this.need(6);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    const lines: string[] = this.doc.splitTextToSize(clean, maxW);
    lines.forEach((line, i) => {
      this.need(6);
      this.doc.text(i === 0 ? `• ${line}` : `  ${line}`, x, this.y);
      this.y += 5.5;
    });
  }

  code(text: string) {
    const lines: string[] = this.doc.splitTextToSize(text, CW - 6);
    const boxH = lines.length * 5 + 6;
    this.need(boxH + 2);
    this.doc.setFillColor(245, 245, 250);
    this.doc.roundedRect(M, this.y - 3, CW, boxH, 2, 2, 'F');
    this.doc.setFontSize(9);
    this.doc.setFont('courier', 'normal');
    this.doc.setTextColor(30, 30, 80);
    for (const line of lines) {
      this.doc.text(line, M + 3, this.y);
      this.y += 5;
    }
    this.y += 5;
    this.doc.setFont('helvetica', 'normal');
  }

  divider() {
    this.y += 4;
    this.doc.setDrawColor(220, 220, 220);
    this.doc.line(M, this.y, PAGE_W - M, this.y);
    this.y += 6;
  }

  coverPage(title: string, subtitle: string, label: string, color: string) {
    const [r, g, b] = hexToRgb(color);
    this.doc.setFillColor(r, g, b);
    this.doc.rect(0, 0, PAGE_W, 8, 'F');

    this.y = 60;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(r, g, b);
    this.doc.text(label.toUpperCase(), M, this.y);

    this.y += 10;
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(20, 20, 20);
    const titleLines: string[] = this.doc.splitTextToSize(title, CW);
    for (const line of titleLines) {
      this.doc.text(line, M, this.y);
      this.y += 13;
    }

    this.y += 4;
    this.doc.setFontSize(13);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(80, 80, 80);
    const subLines: string[] = this.doc.splitTextToSize(subtitle, CW);
    for (const line of subLines) {
      this.doc.text(line, M, this.y);
      this.y += 7;
    }

    this.doc.setFontSize(8);
    this.doc.setTextColor(190, 190, 190);
    this.doc.text('cursos.pandoapps.com.br', M, PAGE_H - 10);

    this.doc.addPage();
    this.y = M;
    this.footerPage();
  }

  skip(mm: number) { this.y += mm; }
}

function buildMaterialPDF(moduleId: number): ArrayBuffer {
  const module = courseModules.find(m => m.id === moduleId);
  if (!module) throw new Error(`Módulo ${moduleId} não encontrado`);

  const markdown = materialContent[moduleId] ?? '';
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = new Writer(doc);

  w.coverPage(
    module.title,
    module.subtitle,
    `Aula ${String(moduleId).padStart(2, '0')} · Material Complementar`,
    module.color
  );

  const lines = markdown.split('\n');
  let inCode = false;
  let codeBuffer: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('```')) {
      if (inCode) {
        if (codeBuffer.length) w.code(codeBuffer.join('\n'));
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) { codeBuffer.push(line); continue; }

    if (line.startsWith('#### ')) { w.h3(line.slice(5)); continue; }
    if (line.startsWith('### ')) { w.h3(line.slice(4)); continue; }
    if (line.startsWith('## ')) { w.h2(line.slice(3)); continue; }
    if (line.startsWith('# ')) { w.h1(line.slice(2)); continue; }
    if (/^-{3,}$/.test(line)) { w.divider(); continue; }

    const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)/);
    if (bulletMatch) { w.bullet(bulletMatch[2], bulletMatch[1].length > 0 ? 6 : 0); continue; }

    const numMatch = line.match(/^\d+\.\s+(.*)/);
    if (numMatch) { w.bullet(numMatch[1]); continue; }

    if (!line.trim()) { w.skip(2); continue; }

    w.p(line);
  }

  if (codeBuffer.length) w.code(codeBuffer.join('\n'));

  return doc.output('arraybuffer');
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateLessonZip(moduleId: number): Promise<void> {
  const module = courseModules.find(m => m.id === moduleId);
  if (!module) return;

  const zip = new JSZip();
  const folder = zip.folder(`Aula ${String(moduleId).padStart(2, '0')} — ${module.title}`)!;

  const slidesBuffer = await buildSlidesPDF(moduleId);
  folder.file(`slides-aula-${String(moduleId).padStart(2, '0')}.pdf`, slidesBuffer);

  const materialBuffer = buildMaterialPDF(moduleId);
  folder.file(`material-aula-${String(moduleId).padStart(2, '0')}.pdf`, materialBuffer);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aula-${String(moduleId).padStart(2, '0')}-materiais.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
