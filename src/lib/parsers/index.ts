// File parsers for different formats
// Supports: CSV, Excel, PDF, TXT, JSON

import * as XLSX from 'xlsx';

export interface ParsedFeedback {
  id: string;
  content: string;
  source: string;
  author?: string;
  date?: string;
  metadata?: Record<string, unknown>;
}

export interface ParseResult {
  success: boolean;
  items: ParsedFeedback[];
  error?: string;
  fileName: string;
  fileType: string;
  totalRows: number;
}

// Parse CSV content
export function parseCSV(content: string, fileName: string): ParseResult {
  try {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      return { success: false, items: [], error: 'CSV must have header and data rows', fileName, fileType: 'csv', totalRows: 0 };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

    // Find content column (feedback, comment, text, content, message, description)
    const contentColIndex = headers.findIndex(h =>
      ['feedback', 'comment', 'text', 'content', 'message', 'description', 'review', 'body'].includes(h)
    );

    // Find optional columns
    const authorColIndex = headers.findIndex(h => ['author', 'user', 'name', 'customer', 'email', 'username'].includes(h));
    const dateColIndex = headers.findIndex(h => ['date', 'created', 'timestamp', 'time', 'created_at', 'submitted'].includes(h));
    const sourceColIndex = headers.findIndex(h => ['source', 'channel', 'platform', 'origin'].includes(h));

    if (contentColIndex === -1) {
      // If no content column found, use first column or the whole row
      const items: ParsedFeedback[] = lines.slice(1).map((line, i) => ({
        id: `csv-${i}`,
        content: line.replace(/,/g, ' ').trim(),
        source: `file:${fileName}`,
      }));
      return { success: true, items, fileName, fileType: 'csv', totalRows: items.length };
    }

    const items: ParsedFeedback[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0) continue;

      const content = values[contentColIndex]?.trim();
      if (!content) continue;

      items.push({
        id: `csv-${i}`,
        content,
        source: sourceColIndex !== -1 ? values[sourceColIndex]?.trim() || `file:${fileName}` : `file:${fileName}`,
        author: authorColIndex !== -1 ? values[authorColIndex]?.trim() : undefined,
        date: dateColIndex !== -1 ? values[dateColIndex]?.trim() : undefined,
      });
    }

    return { success: true, items, fileName, fileType: 'csv', totalRows: items.length };
  } catch (error) {
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : 'Failed to parse CSV',
      fileName,
      fileType: 'csv',
      totalRows: 0
    };
  }
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

// Parse JSON content (array of objects or single object)
export function parseJSON(content: string, fileName: string): ParseResult {
  try {
    const data = JSON.parse(content);
    const items: ParsedFeedback[] = [];

    const processItem = (item: Record<string, unknown>, index: number) => {
      // Find content field
      const contentField = ['feedback', 'comment', 'text', 'content', 'message', 'description', 'review', 'body']
        .find(f => item[f]);

      if (!contentField || typeof item[contentField] !== 'string') return null;

      return {
        id: (item.id as string) || `json-${index}`,
        content: item[contentField] as string,
        source: (item.source as string) || (item.channel as string) || `file:${fileName}`,
        author: (item.author as string) || (item.user as string) || (item.name as string),
        date: (item.date as string) || (item.created as string) || (item.timestamp as string),
        metadata: item,
      };
    };

    if (Array.isArray(data)) {
      data.forEach((item, i) => {
        const parsed = processItem(item, i);
        if (parsed) items.push(parsed);
      });
    } else if (typeof data === 'object') {
      const parsed = processItem(data, 0);
      if (parsed) items.push(parsed);
    }

    return { success: true, items, fileName, fileType: 'json', totalRows: items.length };
  } catch (error) {
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : 'Invalid JSON',
      fileName,
      fileType: 'json',
      totalRows: 0
    };
  }
}

// Parse plain text (one feedback per line or paragraphs)
export function parseTXT(content: string, fileName: string): ParseResult {
  try {
    // Split by double newlines (paragraphs) or single lines
    const blocks = content.includes('\n\n')
      ? content.split('\n\n').map(b => b.trim()).filter(Boolean)
      : content.split('\n').map(b => b.trim()).filter(Boolean);

    const items: ParsedFeedback[] = blocks.map((block, i) => ({
      id: `txt-${i}`,
      content: block,
      source: `file:${fileName}`,
    }));

    return { success: true, items, fileName, fileType: 'txt', totalRows: items.length };
  } catch (error) {
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : 'Failed to parse text',
      fileName,
      fileType: 'txt',
      totalRows: 0
    };
  }
}

// Parse Excel file (xlsx, xls)
export function parseExcel(buffer: ArrayBuffer, fileName: string): ParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (data.length === 0) {
      return { success: false, items: [], error: 'Excel file is empty', fileName, fileType: 'excel', totalRows: 0 };
    }

    // Get headers from first row
    const headers = Object.keys(data[0]).map(h => h.toLowerCase());

    // Find content column
    const contentCol = ['feedback', 'comment', 'text', 'content', 'message', 'description', 'review', 'body']
      .find(f => headers.includes(f));

    // Find optional columns
    const authorCol = ['author', 'user', 'name', 'customer', 'email', 'username']
      .find(f => headers.includes(f));
    const dateCol = ['date', 'created', 'timestamp', 'time', 'created_at', 'submitted']
      .find(f => headers.includes(f));
    const sourceCol = ['source', 'channel', 'platform', 'origin']
      .find(f => headers.includes(f));

    const items: ParsedFeedback[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Find content using various possible column names
      let content: string | undefined;
      if (contentCol) {
        const value = Object.entries(row).find(([key]) => key.toLowerCase() === contentCol)?.[1];
        content = value?.toString();
      } else {
        // Use first text column
        const firstTextValue = Object.values(row).find(v => typeof v === 'string' && v.length > 10);
        content = firstTextValue?.toString();
      }

      if (!content) continue;

      const getColValue = (colName: string | undefined): string | undefined => {
        if (!colName) return undefined;
        const entry = Object.entries(row).find(([key]) => key.toLowerCase() === colName);
        return entry?.[1]?.toString();
      };

      items.push({
        id: `excel-${i}`,
        content,
        source: getColValue(sourceCol) || `file:${fileName}`,
        author: getColValue(authorCol),
        date: getColValue(dateCol),
        metadata: row,
      });
    }

    return { success: true, items, fileName, fileType: 'excel', totalRows: items.length };
  } catch (error) {
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : 'Failed to parse Excel file',
      fileName,
      fileType: 'excel',
      totalRows: 0
    };
  }
}

// Parse Excel from base64 string
export function parseExcelFromBase64(base64: string, fileName: string): ParseResult {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return parseExcel(bytes.buffer, fileName);
}

// Main parser function - auto-detect format
export function parseFile(content: string, fileName: string, mimeType?: string): ParseResult {
  const ext = fileName.split('.').pop()?.toLowerCase();

  // Determine parser based on extension or mime type
  if (ext === 'csv' || mimeType?.includes('csv')) {
    return parseCSV(content, fileName);
  }

  if (ext === 'json' || mimeType?.includes('json')) {
    return parseJSON(content, fileName);
  }

  if (ext === 'txt' || mimeType?.includes('text/plain')) {
    return parseTXT(content, fileName);
  }

  // Excel files need special handling (binary)
  if (ext === 'xlsx' || ext === 'xls' || mimeType?.includes('spreadsheet')) {
    // For Excel, content should be base64 encoded
    return parseExcelFromBase64(content, fileName);
  }

  // Try to auto-detect
  const trimmed = content.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return parseJSON(content, fileName);
  }

  if (trimmed.includes(',') && trimmed.split('\n')[0].includes(',')) {
    return parseCSV(content, fileName);
  }

  // Default to plain text
  return parseTXT(content, fileName);
}

// Parse file from ArrayBuffer (for binary files like Excel)
export function parseFileBuffer(buffer: ArrayBuffer, fileName: string, mimeType?: string): ParseResult {
  const ext = fileName.split('.').pop()?.toLowerCase();

  // Excel files
  if (ext === 'xlsx' || ext === 'xls' || mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) {
    return parseExcel(buffer, fileName);
  }

  // For text-based files, convert buffer to string
  const decoder = new TextDecoder('utf-8');
  const content = decoder.decode(buffer);
  return parseFile(content, fileName, mimeType);
}
