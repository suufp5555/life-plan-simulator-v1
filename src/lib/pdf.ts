import jsPDF from 'jspdf';
import type { SimulationRow } from '../types';

function splitCanvasToPages(
  doc: jsPDF,
  canvas: HTMLCanvasElement,
  margin: number,
  contentW: number,
  contentH: number,
  firstPage: boolean,
): void {
  const pxPerMM = canvas.width / contentW;
  const pxPerPage = Math.floor(contentH * pxPerMM);

  let offsetY = 0;
  let isFirst = firstPage;

  while (offsetY < canvas.height) {
    if (!isFirst) doc.addPage();
    isFirst = false;

    const sliceH = Math.min(pxPerPage, canvas.height - offsetY);
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width;
    tmp.height = sliceH;
    const ctx = tmp.getContext('2d');
    if (!ctx) break;
    ctx.drawImage(canvas, 0, -offsetY);

    doc.addImage(tmp.toDataURL('image/png'), 'PNG', margin, margin, contentW, sliceH / pxPerMM);
    offsetY += sliceH;
  }
}

export async function exportPDF(_rows: SimulationRow[]): Promise<void> {
  // html-to-image はブラウザの getComputedStyle を利用するため
  // Tailwind v4 の oklch カラー関数にも対応できる
  const { toCanvas } = await import('html-to-image');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentW = pageW - margin * 2;
  const contentH = pageH - margin * 2;

  // ページ1：グラフカード
  const chartCard = document.getElementById('pdf-chart-card');
  if (!chartCard) throw new Error('#pdf-chart-card が見つかりません');

  const chartCanvas = await toCanvas(chartCard, {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  });
  splitCanvasToPages(doc, chartCanvas, margin, contentW, contentH, true);

  // ページ2以降：テーブルカード（スクロール解除してフル高さでキャプチャ）
  const tableCard = document.getElementById('pdf-table-card');
  const tableScroll = document.getElementById('simulation-table-scroll');
  if (!tableCard || !tableScroll) throw new Error('#pdf-table-card または #simulation-table-scroll が見つかりません');

  const origMaxHeight = tableScroll.style.maxHeight;
  const origOverflow  = tableScroll.style.overflow;
  tableScroll.style.maxHeight = 'none';
  tableScroll.style.overflow  = 'visible';

  await new Promise(r => setTimeout(r, 100));

  let tableCanvas: HTMLCanvasElement;
  try {
    tableCanvas = await toCanvas(tableCard, {
      backgroundColor: '#ffffff',
      pixelRatio: 1.5,
    });
  } finally {
    tableScroll.style.maxHeight = origMaxHeight;
    tableScroll.style.overflow  = origOverflow;
  }

  doc.addPage();
  splitCanvasToPages(doc, tableCanvas, margin, contentW, contentH, true);

  doc.save('life-plan-simulation.pdf');
}
