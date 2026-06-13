package com.mst.agritech.ingestion;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Component
public class ExcelIngestionParser {

    public List<Map<String, String>> parse(InputStream inputStream) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;
            if (sheet == null) {
                return List.of();
            }
            Iterator<Row> rowIterator = sheet.iterator();
            if (!rowIterator.hasNext()) {
                return List.of();
            }
            Row headerRow = rowIterator.next();
            List<String> headers = readRow(headerRow);
            List<Map<String, String>> rows = new ArrayList<>();
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                if (isEmptyRow(row)) {
                    continue;
                }
                List<String> values = readRow(row);
                Map<String, String> record = new LinkedHashMap<>();
                for (int i = 0; i < headers.size(); i++) {
                    String key = headers.get(i);
                    if (key == null || key.isBlank()) {
                        continue;
                    }
                    String value = i < values.size() ? values.get(i) : "";
                    record.put(normalizeKey(key), value != null ? value.trim() : "");
                }
                if (!record.isEmpty()) {
                    rows.add(record);
                }
            }
            return rows;
        }
    }

    public byte[] buildTemplate(String[] headers) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Import");
            Row header = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
                sheet.autoSizeColumn(i);
            }
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private List<String> readRow(Row row) {
        List<String> values = new ArrayList<>();
        if (row == null) {
            return values;
        }
        int last = Math.max(row.getLastCellNum(), 0);
        for (int i = 0; i < last; i++) {
            values.add(readCell(row.getCell(i)));
        }
        return values;
    }

    private String readCell(Cell cell) {
        if (cell == null) {
            return "";
        }
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getLocalDateTimeCellValue().toLocalDate().toString()
                    : BigDecimalStrip(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    private String BigDecimalStrip(double value) {
        if (value == Math.floor(value)) {
            return String.valueOf((long) value);
        }
        return String.valueOf(value);
    }

    private boolean isEmptyRow(Row row) {
        for (Cell cell : row) {
            if (cell != null && cell.getCellType() != CellType.BLANK
                    && !readCell(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }

    private String normalizeKey(String header) {
        return header.trim().toLowerCase(Locale.ROOT).replace(' ', '_');
    }
}
