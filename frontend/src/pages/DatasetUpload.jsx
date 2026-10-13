import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, Table } from 'lucide-react';
import { uploadDataset, downloadTemplate } from '../api';
import { Spinner, AlertBox } from '../components';

export default function DatasetUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);   // dry-run result
  const [result, setResult] = useState(null);     // import result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('select');     // 'select' | 'preview' | 'done'
  const inputRef = useRef();

  const handleFileChange = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(null);
    setResult(null);
    setError(null);
    setStep('select');
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const r = await uploadDataset(file, true);
      setPreview(r.data.data);
      setStep('preview');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const r = await uploadDataset(file, false);
      setResult(r.data.data);
      setStep('done');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const r = await downloadTemplate();
      const url = URL.createObjectURL(new Blob([r.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'road_accidents_template.csv';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  };

  const reset = () => {
    setFile(null); setPreview(null); setResult(null);
    setError(null); setStep('select');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Dataset Upload</h2>
          <p className="text-sm text-slate-500">Import accident records from a CSV file</p>
        </div>
        <button onClick={handleDownloadTemplate} className="btn-secondary flex items-center gap-2">
          <Download size={15}/> Download Template
        </button>
      </div>

      {error && <AlertBox type="error" message={error}/>}

      {/* Drop zone */}
      {step === 'select' && (
        <div
          className="card border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors cursor-pointer text-center py-14"
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={40} className="text-slate-300 mx-auto mb-3"/>
          <p className="font-medium text-slate-600">Click to choose a CSV file</p>
          <p className="text-sm text-slate-400 mt-1">Supports standard and custom column formats</p>
          {file && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
              <FileText size={15}/> {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange}/>
        </div>
      )}

      {file && step === 'select' && (
        <div className="flex gap-3">
          <button onClick={handlePreview} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Spinner size={4}/> : <Table size={15}/>}
            Preview & Validate
          </button>
          <button onClick={reset} className="btn-secondary">Clear</button>
        </div>
      )}

      {/* Preview */}
      {step === 'preview' && preview && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Rows', val: preview.totalRows, color: 'text-slate-700' },
              { label: 'Valid Rows', val: preview.validRows, color: 'text-green-700' },
              { label: 'Rejected Rows', val: preview.rejectedRows, color: 'text-red-700' },
              { label: 'Errors', val: preview.errors?.length || 0, color: 'text-amber-700' },
            ].map(c => (
              <div key={c.label} className="card text-center py-4">
                <div className={`text-2xl font-bold ${c.color}`}>{c.val}</div>
                <div className="text-xs text-slate-500 mt-1">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Errors */}
          {preview.errors?.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <XCircle size={16} className="text-red-500"/> Validation Errors (showing first 20)
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {preview.errors.map((e, i) => (
                  <div key={i} className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">{e}</div>
                ))}
              </div>
            </div>
          )}

          {/* Preview table */}
          {preview.previewColumns?.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h4 className="font-semibold text-slate-700">Data Preview (first 5 rows)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table text-xs">
                  <thead>
                    <tr>{preview.previewColumns.map((c, i) => <th key={i}>{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {(preview.previewRows || []).map((row, r) => (
                      <tr key={r}>{row.map((cell, c) => <td key={c}>{cell}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {preview.validRows > 0 && (
              <button onClick={handleImport} disabled={loading} className="btn-success flex items-center gap-2">
                {loading ? <Spinner size={4}/> : <CheckCircle size={15}/>}
                Import {preview.validRows} Valid Records
              </button>
            )}
            <button onClick={reset} className="btn-secondary">Start Over</button>
          </div>
        </div>
      )}

      {/* Done */}
      {step === 'done' && result && (
        <div className="card border-green-200 bg-green-50 text-center py-10">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-3"/>
          <h3 className="text-xl font-bold text-green-800">Import Complete!</h3>
          <p className="text-green-700 mt-2">{result.insertedRows} records inserted into the database.</p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-green-700">
            <span>Total: {result.totalRows}</span>
            <span>Valid: {result.validRows}</span>
            <span>Rejected: {result.rejectedRows}</span>
          </div>
          <button onClick={reset} className="btn-success mt-6 mx-auto">Upload Another File</button>
        </div>
      )}

      {/* Format guide */}
      <div className="card">
        <h3 className="font-semibold text-slate-700 mb-3">Required CSV Columns</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {['latitude*','longitude*','city*','road_type*','severity*','accident_date','accident_time','state','location_description','weather_condition','lighting_condition','road_surface_condition','vehicle_count','casualty_count','injury_count','speed_limit','area_type'].map(c => (
            <div key={c} className={`text-xs px-2 py-1 rounded font-mono ${c.endsWith('*') ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-slate-50 text-slate-600'}`}>
              {c}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">* Required. All other columns are optional — defaults will be used if missing.</p>
      </div>
    </div>
  );
}
