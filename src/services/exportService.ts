import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export an array of audition objects to an XLSX file and trigger download.
 * @param data Array of objects where each object represents a row in the spreadsheet.
 */
export function exportAuditionsToXLSX(data: any[]) {
  // Convert JSON data to a worksheet.
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create a new workbook and append the worksheet.
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Auditions');

  // Write the workbook to a binary array.
  const workbookOut = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Create a Blob from the array and trigger download via file-saver.
  const blob = new Blob([workbookOut], { type: 'application/octet-stream' });
  const fileName = `auditions_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(blob, fileName);
}
