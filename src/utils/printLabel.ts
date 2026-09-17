/**
 * Print Label Utility
 *
 * Opens a new print-friendly window containing only the label content
 * (QR code + batch info), prints it, then closes the window.
 * This avoids the issue of `window.print()` printing the entire page.
 */

interface LabelData {
  id: string;
  farmerName: string;
  weight: string;
  grade: string;
  timestamp: string;
  svgHtml: string;
}

export function printLabel(data: LabelData): void {
  const printWindow = window.open("", "_blank", "width=400,height=500");
  if (!printWindow) {
    alert("Popup blocker mencegah jendela cetak. Izinkan popup untuk situs ini.");
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Cetak Label - ${data.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: white;
      color: #1e293b;
    }
    .label {
      text-align: center;
      padding: 24px;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      width: 300px;
    }
    .qr-container {
      display: inline-block;
      padding: 12px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .qr-container svg { display: block; }
    .batch-id {
      font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace;
      font-weight: 700;
      font-size: 14px;
      color: #11562a;
      margin-bottom: 8px;
    }
    .grade {
      font-weight: 800;
      font-size: 24px;
      color: #11562a;
      margin-bottom: 12px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      text-align: left;
      margin-top: 16px;
    }
    .info-item {
      padding: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .info-label {
      font-size: 10px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .info-value {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 2px;
    }
    @media print {
      body { min-height: auto; }
      .label { border-width: 1px; }
    }
  </style>
</head>
<body>
  <div class="label">
    <div class="qr-container">
      ${data.svgHtml}
    </div>
    <div class="batch-id">${data.id}</div>
    <div class="grade">Grade ${data.grade}</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Petani</div>
        <div class="info-value">${data.farmerName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Berat</div>
        <div class="info-value">${data.weight}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Tanggal</div>
        <div class="info-value">${data.timestamp}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Grade</div>
        <div class="info-value">${data.grade}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to render, then print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}
