import os
import re

file_path = "/Users/dannyphang/Documents/GitHub/Creative-Z/src/components/LinkDashboard.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add import
if 'import * as XLSX from "xlsx";' not in content:
    content = content.replace('import QRCode from "qrcode";', 'import QRCode from "qrcode";\nimport * as XLSX from "xlsx";')

# 2. Replace parseBulkText
old_parse = """  const parseBulkText = (text: string) => {
    const lines = text.split(/\\r?\\n/);
    const parsed: Array<{ longUrl: string; customCode?: string; title?: string }> = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Split line by comma, respect simple CSV syntax
      const parts = trimmed.split(",");
      if (parts.length > 0) {
        const url = parts[0].trim();
        if (url) {
          const alias = parts[1] ? parts[1].trim() : undefined;
          const label = parts[2] ? parts[2].trim() : undefined;
          parsed.push({
            longUrl: url,
            customCode: alias || undefined,
            title: label || undefined
          });
        }
      }
    }
    setBulkParsedItems(parsed);
  };"""

new_parse = """  const parseBulkText = (text: string) => {
    const lines = text.split(/\\r?\\n/);
    const parsed: Array<{ longUrl: string; customCode?: string; title?: string }> = [];

    const isTsv = lines[0]?.includes('\\t');
    const separator = isTsv ? '\\t' : ',';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const parts = trimmed.split(separator);
      if (parts.length > 0) {
        const url = parts[0].trim();
        if (url) {
          const alias = parts[1] ? parts[1].trim() : undefined;
          const label = parts[2] ? parts[2].trim() : undefined;
          parsed.push({
            longUrl: url,
            customCode: alias || undefined,
            title: label || undefined
          });
        }
      }
    }
    setBulkParsedItems(parsed);
  };"""
content = content.replace(old_parse, new_parse)

# 3. Replace handleCsvFile
old_handle_csv = """  const handleCsvFile = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      setBulkError("File must be a .csv or .txt file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setBulkInput(text);
      setBulkSuccess(`Successfully parsed file contents: ${file.name}`);
    };
    reader.readAsText(file);
  };"""

new_handle_csv = """  const handleCsvFile = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt") && !file.name.endsWith(".xlsx")) {
      setBulkError("File must be a .csv, .txt, or .xlsx file.");
      return;
    }

    if (file.name.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const text = XLSX.utils.sheet_to_csv(worksheet, { FS: "\\t" });
          setBulkInput(text);
          setBulkSuccess(`Successfully parsed file contents: ${file.name}`);
        } catch (err) {
          setBulkError("Failed to parse XLSX file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setBulkInput(text);
        setBulkSuccess(`Successfully parsed file contents: ${file.name}`);
      };
      reader.readAsText(file);
    }
  };"""
content = content.replace(old_handle_csv, new_handle_csv)

# 4. Replace UI texts
content = content.replace('accept=".csv,.txt"', 'accept=".csv,.txt,.xlsx"')
content = content.replace('Supports .csv or .txt raw link documents', 'Supports .csv, .txt, or .xlsx raw link documents')
content = content.replace('CSV Line Format: <span className="text-purple-400">destinationUrl, customSlug, labelNotes</span>', 'Format: <span className="text-purple-400">destinationUrl, customSlug, labelNotes</span> (Comma or Tab separated)')
content = content.replace('Drag and drop a CSV file, or copy and paste raw link mappings directly below.', 'Drag and drop an Excel (.xlsx) or CSV file, or copy and paste rows from Google Sheets directly below.')

with open(file_path, "w") as f:
    f.write(content)
