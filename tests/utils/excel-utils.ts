import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

export function appendToExcel(
  filePath: string,
  data: Record<string, string | number>,
  sheetName = 'RegisteredEmails'
): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let workbook: XLSX.WorkBook;

  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  } else {
    workbook = XLSX.utils.book_new();
  }

  let existingData: Record<string, string | number>[] = [];

  const sheet = workbook.Sheets[sheetName];
  if (sheet) {
    existingData = XLSX.utils.sheet_to_json(sheet);
  }

  existingData.push(data);

  const newSheet = XLSX.utils.json_to_sheet(existingData);

  const idx = workbook.SheetNames.indexOf(sheetName);
  if (idx >= 0) {
    workbook.SheetNames.splice(idx, 1);
    delete workbook.Sheets[sheetName];
  }

  XLSX.utils.book_append_sheet(workbook, newSheet, sheetName);
  const buffer: Buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  fs.writeFileSync(filePath, buffer);
}
