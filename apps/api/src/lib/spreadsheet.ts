import * as XLSX from "xlsx";
import { ValidationError } from "./error.js";

export interface ParsedInventoryRow {
  rowNumber: number;
  name: string;
  mrp: number; // in Rupees
  mrpPaise: number; // in Paise (Int for DB)
  hsn?: string;
  parentGroup?: string;
  taxRatePercent: number; // e.g. 18 for 18%
  sku?: string;
  sellingPrice?: number; // in Rupees
  sellingPricePaise?: number; // in Paise (Int for DB)
  stock?: number; // undefined when the sheet has no stock value (existing stock is preserved)
  category?: string;
  status?: string;
  ean?: string;
  weightGrams?: number;
}

export interface SpreadsheetParseResult {
  items: ParsedInventoryRow[];
  detectedColumns: Record<string, number>;
  skippedRows: { rowNumber: number; reason: string; raw: string[] }[];
  contextGroup?: string;
}

export interface InventoryExportRow {
  name: string;
  mrp: number; // in Rupees
  hsn: string;
  parentGroup: string;
  taxRate: number; // e.g. 0.18
  sku: string;
  sellingPrice: number | null;
  stock: number;
  category: string;
  status: string;
  ean: string;
  weightGrams: number | null;
}

/**
 * Universal spreadsheet parser.
 * Supports CSV, TSV, XLS, and XLSX buffers or strings.
 */
export function parseSpreadsheet(
  bufferOrString: Buffer | string,
  _filename?: string,
): SpreadsheetParseResult {
  let rawRows: string[][] = [];

  if (isBinaryWorkbook(bufferOrString)) {
    try {
      const workbook = XLSX.read(bufferOrString, { type: "buffer", raw: false });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
      if (sheet) {
        rawRows = XLSX.utils.sheet_to_json<string[]>(sheet, {
          header: 1,
          defval: "",
          raw: false,
        });
      }
    } catch {
      throw new ValidationError(
        "The uploaded file could not be read as an Excel workbook.",
      );
    }
  } else {
    // CSV/TSV is parsed as plain text. Going through SheetJS would coerce
    // values such as SKUs ("1-2") into dates and long EANs into numbers.
    const text = Buffer.isBuffer(bufferOrString)
      ? bufferOrString.toString("utf8")
      : bufferOrString;
    rawRows = parseDelimitedText(text);
  }

  return processRawRows(rawRows);
}

/** True for .xlsx (ZIP, "PK") and legacy .xls (OLE2) signatures. */
function isBinaryWorkbook(input: Buffer | string): input is Buffer {
  if (!Buffer.isBuffer(input) || input.length < 4) return false;
  const isZip = input[0] === 0x50 && input[1] === 0x4b;
  const isOle =
    input[0] === 0xd0 && input[1] === 0xcf && input[2] === 0x11 && input[3] === 0xe0;
  return isZip || isOle;
}

/**
 * Parses CSV or TSV text with RFC-4180 compliance.
 */
export function parseDelimitedText(content: string): string[][] {
  const text = content.replace(/^\uFEFF/, ""); // Strip BOM
  if (!text.trim()) return [];

  // Detect delimiter (comma vs tab vs semicolon)
  const firstLine = text.split(/\r\n|\n|\r/)[0] ?? "";
  let delimiter = ",";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;

  if (tabCount > commaCount && tabCount > semiCount) {
    delimiter = "\t";
  } else if (semiCount > commaCount && semiCount > tabCount) {
    delimiter = ";";
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === "\r" && nextChar === "\n") {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = "";
        i++;
      } else if (char === "\n" || char === "\r") {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

function getCell(row: string[], colIdx?: number): string {
  if (colIdx === undefined || colIdx < 0 || colIdx >= row.length) {
    return "";
  }
  return String(row[colIdx] ?? "").trim();
}

/**
 * Extracts the first number from a cell such as "1,299.00", "Rs. 599" or "18%".
 * Returns NaN when no number is present.
 */
function parseAmount(raw: string): number {
  const match = raw.replace(/,/g, "").match(/-?\d+(?:\.\d+)?|-?\.\d+/);
  return match ? parseFloat(match[0]) : NaN;
}

/**
 * Processes raw 2D string grid into structured inventory items.
 */
function processRawRows(rawRows: string[][]): SpreadsheetParseResult {
  let headerRowIndex = -1;
  let contextGroup = "";
  const detectedColumns: Record<string, number> = {};

  // Step 1: Scan for preamble and header row
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row) continue;
    const firstCell = getCell(row, 0);

    // Check for "Group : Cetaphil"
    const groupMatch = firstCell.match(/^Group\s*:\s*(.+)$/i);
    if (groupMatch && groupMatch[1]) {
      contextGroup = groupMatch[1].trim();
      continue;
    }

    // Check if this row is the header
    const normalizedCells = row.map((c) =>
      String(c).toLowerCase().replace(/[^a-z0-9]/g, ""),
    );
    const hasName = normalizedCells.some(
      (c) => c === "name" || c === "itemname" || c === "productname",
    );
    const hasMrpOrPrice = normalizedCells.some(
      (c) => c === "mrp" || c === "price" || c === "rate",
    );

    if (hasName && hasMrpOrPrice) {
      headerRowIndex = i;
      normalizedCells.forEach((cell, colIdx) => {
        if (!cell) return;
        if (cell === "name" || cell === "productname" || cell === "itemname") {
          detectedColumns["name"] = colIdx;
        } else if (cell === "mrp" || cell === "price" || cell === "rate") {
          detectedColumns["mrp"] = colIdx;
        } else if (cell.includes("hsn") || cell.includes("sac")) {
          detectedColumns["hsn"] = colIdx;
        } else if (
          cell === "parentgroup" ||
          cell === "group" ||
          cell === "brand"
        ) {
          detectedColumns["parentGroup"] = colIdx;
        } else if (
          cell === "taxrate" ||
          cell === "tax" ||
          cell === "gstrate" ||
          cell === "gst"
        ) {
          detectedColumns["taxRate"] = colIdx;
        } else if (cell === "sku" || cell === "itemcode" || cell === "code") {
          detectedColumns["sku"] = colIdx;
        } else if (
          cell === "sellingprice" ||
          cell === "offerprice" ||
          cell === "discountprice" ||
          cell === "saleprice"
        ) {
          detectedColumns["sellingPrice"] = colIdx;
        } else if (cell === "stock" || cell === "qty" || cell === "quantity") {
          detectedColumns["stock"] = colIdx;
        } else if (cell === "category" || cell === "categories") {
          detectedColumns["category"] = colIdx;
        } else if (cell === "status") {
          detectedColumns["status"] = colIdx;
        } else if (cell === "ean" || cell === "barcode") {
          detectedColumns["ean"] = colIdx;
        } else if (cell.includes("weight")) {
          detectedColumns["weight"] = colIdx;
        }
      });
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new ValidationError(
      "Could not detect header row in spreadsheet. Expected columns including 'Name' and 'MRP'.",
    );
  }

  const items: ParsedInventoryRow[] = [];
  const skippedRows: { rowNumber: number; reason: string; raw: string[] }[] = [];

  // Step 2: Parse data rows
  for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row) continue;
    const rowNum = i + 1;

    // Check if row is completely empty
    if (row.every((cell) => !cell || String(cell).trim() === "")) {
      continue;
    }

    const firstCell = getCell(row, 0);

    // Check if a new group row is encountered
    const groupMatch = firstCell.match(/^Group\s*:\s*(.+)$/i);
    if (groupMatch && groupMatch[1]) {
      contextGroup = groupMatch[1].trim();
      continue;
    }

    // Check if total or summary row
    // Only the label itself ("Total", "Grand Total:", "Sub Total") counts, so
    // products such as "Total Care Cream" are not dropped.
    if (/^(grand\s*|sub\s*)?totals?\s*:?$/i.test(firstCell)) {
      continue;
    }

    const cleanName = getCell(row, detectedColumns["name"]);
    if (!cleanName) {
      skippedRows.push({
        rowNumber: rowNum,
        reason: "Missing product name",
        raw: row.map(String),
      });
      continue;
    }

    // Parse MRP
    const rawMrp = getCell(row, detectedColumns["mrp"]);
    let parsedMrp = parseAmount(rawMrp);

    // If MRP in cell is 0 or NaN, attempt fallback parsing from name (e.g. "MRP 599")
    if (isNaN(parsedMrp) || parsedMrp <= 0) {
      const mrpMatch = cleanName.match(/MRP\s*[-–:]?\s*(\d+(\.\d+)?)/i);
      if (mrpMatch && mrpMatch[1]) {
        parsedMrp = parseFloat(mrpMatch[1]);
      }
    }

    if (isNaN(parsedMrp) || parsedMrp <= 0) {
      skippedRows.push({
        rowNumber: rowNum,
        reason: `Invalid or missing MRP: "${rawMrp}"`,
        raw: row.map(String),
      });
      continue;
    }

    // Parse Tax Rate
    const rawTaxRate = getCell(row, detectedColumns["taxRate"]);
    let taxRatePercent = 18; // Default 18% GST if not provided
    if (rawTaxRate) {
      const numTax = parseAmount(rawTaxRate);
      if (!isNaN(numTax)) {
        if (numTax > 0 && numTax < 1) {
          taxRatePercent = Math.round(numTax * 100 * 100) / 100;
        } else {
          taxRatePercent = numTax;
        }
      }
    }

    // Parse HSN
    const rawHsn = getCell(row, detectedColumns["hsn"]);
    const hsn = rawHsn || undefined;

    // Parse Parent Group (Brand)
    let parentGroup = getCell(row, detectedColumns["parentGroup"]);
    if (!parentGroup && contextGroup) {
      parentGroup = contextGroup;
    }

    // Parse optional fields
    const rawSku = getCell(row, detectedColumns["sku"]);
    const sku = rawSku || undefined;

    let sellingPrice: number | undefined = undefined;
    let sellingPricePaise: number | undefined = undefined;
    const rawSellingPrice = getCell(row, detectedColumns["sellingPrice"]);
    if (rawSellingPrice) {
      const sp = parseAmount(rawSellingPrice);
      if (!isNaN(sp) && sp > parsedMrp) {
        skippedRows.push({
          rowNumber: rowNum,
          reason: `Selling price (${sp}) is higher than MRP (${parsedMrp})`,
          raw: row.map(String),
        });
        continue;
      }
      if (!isNaN(sp) && sp >= 0) {
        sellingPrice = sp;
        sellingPricePaise = Math.round(sp * 100);
      }
    }

    let stock: number | undefined = undefined;
    const rawStock = getCell(row, detectedColumns["stock"]);
    if (rawStock) {
      const st = Math.floor(parseAmount(rawStock));
      if (!isNaN(st)) stock = Math.max(0, st);
    }

    const rawCategory = getCell(row, detectedColumns["category"]);
    const category = rawCategory || undefined;

    const rawStatus = getCell(row, detectedColumns["status"]);
    const status = rawStatus || undefined;

    const rawEan = getCell(row, detectedColumns["ean"]);
    const ean = rawEan || undefined;

    let weightGrams: number | undefined = undefined;
    const rawWeight = getCell(row, detectedColumns["weight"]);
    if (rawWeight) {
      const wg = parseAmount(rawWeight);
      if (!isNaN(wg) && wg > 0) weightGrams = wg;
    }

    items.push({
      rowNumber: rowNum,
      name: cleanName,
      mrp: parsedMrp,
      mrpPaise: Math.round(parsedMrp * 100),
      hsn,
      parentGroup: parentGroup || undefined,
      taxRatePercent,
      sku,
      sellingPrice,
      sellingPricePaise,
      stock,
      category,
      status,
      ean,
      weightGrams,
    });
  }

  return { items, detectedColumns, skippedRows, contextGroup };
}

/**
 * Prefixes cells that spreadsheet apps would evaluate as formulas (CSV injection).
 */
function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/**
 * Generates an RFC-4180 compliant CSV string with UTF-8 BOM for Microsoft Excel.
 */
export function generateInventoryCSV(items: InventoryExportRow[]): string {
  const headers = [
    "Name",
    "MRP",
    "HSN",
    "Parent Group",
    "Tax Rate",
    "SKU",
    "Selling Price",
    "Stock",
    "Category",
    "Status",
    "EAN",
    "Weight (g)",
  ];

  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return "";
    const str = typeof val === "string" ? neutralizeFormula(val) : String(val);
    if (
      str.includes(",") ||
      str.includes('"') ||
      str.includes("\n") ||
      str.includes("\r")
    ) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  lines.push(headers.map(escapeCell).join(","));

  for (const item of items) {
    const row = [
      escapeCell(item.name),
      escapeCell(item.mrp),
      escapeCell(item.hsn),
      escapeCell(item.parentGroup),
      escapeCell(item.taxRate),
      escapeCell(item.sku),
      escapeCell(item.sellingPrice !== null ? item.sellingPrice : ""),
      escapeCell(item.stock),
      escapeCell(item.category),
      escapeCell(item.status),
      escapeCell(item.ean),
      escapeCell(item.weightGrams !== null ? item.weightGrams : ""),
    ];
    lines.push(row.join(","));
  }

  // Prepend UTF-8 BOM (\uFEFF) so Excel opens UTF-8 characters properly
  return "\uFEFF" + lines.join("\r\n");
}

/**
 * Generates an XLSX binary buffer for direct Excel download.
 */
export function generateInventoryXLSX(items: InventoryExportRow[]): Buffer {
  const headers = [
    "Name",
    "MRP",
    "HSN",
    "Parent Group",
    "Tax Rate",
    "SKU",
    "Selling Price",
    "Stock",
    "Category",
    "Status",
    "EAN",
    "Weight (g)",
  ];

  const data = [
    headers,
    ...items.map((item) => [
      neutralizeFormula(item.name),
      item.mrp,
      neutralizeFormula(item.hsn),
      neutralizeFormula(item.parentGroup),
      item.taxRate,
      neutralizeFormula(item.sku),
      item.sellingPrice !== null ? item.sellingPrice : "",
      item.stock,
      neutralizeFormula(item.category),
      item.status,
      neutralizeFormula(item.ean),
      item.weightGrams !== null ? item.weightGrams : "",
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}
