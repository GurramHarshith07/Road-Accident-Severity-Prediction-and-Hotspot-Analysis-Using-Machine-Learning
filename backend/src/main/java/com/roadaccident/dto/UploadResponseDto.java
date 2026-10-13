package com.roadaccident.dto;

import java.util.ArrayList;
import java.util.List;

public class UploadResponseDto {
    private int totalRows;
    private int validRows;
    private int insertedRows;
    private int rejectedRows;
    private List<String> errors = new ArrayList<>();
    private List<String> previewColumns = new ArrayList<>();
    private List<List<String>> previewRows = new ArrayList<>();

    public UploadResponseDto() {}

    public int getTotalRows() { return totalRows; }
    public void setTotalRows(int totalRows) { this.totalRows = totalRows; }

    public int getValidRows() { return validRows; }
    public void setValidRows(int validRows) { this.validRows = validRows; }

    public int getInsertedRows() { return insertedRows; }
    public void setInsertedRows(int insertedRows) { this.insertedRows = insertedRows; }

    public int getRejectedRows() { return rejectedRows; }
    public void setRejectedRows(int rejectedRows) { this.rejectedRows = rejectedRows; }

    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }

    public List<String> getPreviewColumns() { return previewColumns; }
    public void setPreviewColumns(List<String> previewColumns) { this.previewColumns = previewColumns; }

    public List<List<String>> getPreviewRows() { return previewRows; }
    public void setPreviewRows(List<List<String>> previewRows) { this.previewRows = previewRows; }
}
