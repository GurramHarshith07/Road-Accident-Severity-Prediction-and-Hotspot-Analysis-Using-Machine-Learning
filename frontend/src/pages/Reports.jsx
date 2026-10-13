import React, { useState } from 'react';
import { FileText, Download, BarChart3 } from 'lucide-react';
import { getDashboardSummary, getCityStatistics, getSeverityAnalytics, getModelEvaluations } from '../api';
import { Spinner, AlertBox } from '../components';

function Section({ title, children }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <BarChart3 size={16} className="text-blue-500"/>{title}
      </h3>
      {children}
    </div>
  );
}

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, city, severity, models] = await Promise.all([
        getDashboardSummary(),
        getCityStatistics(),
        getSeverityAnalytics(),
        getModelEvaluations(),
      ]);
      setReport({
        generated: new Date().toLocaleString(),
        summary: summary.data.data,
        cities: city.data.data || [],
        severity: severity.data.data || [],
        models: models.data.data || [],
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!report) return;
    const rows = [
      ['Metric', 'Value'],
      ['Report Generated', report.generated],
      ['Total Accidents', report.summary.totalAccidents],
      ['Fatal Accidents', report.summary.fatalAccidents],
      ['Serious Accidents', report.summary.seriousAccidents],
      ['Minor Accidents', report.summary.minorAccidents],
      ['Total Hotspots', report.summary.totalHotspots],
      ['Critical Hotspots', report.summary.criticalHotspots],
      [],
      ['City', 'Total Accidents', 'Fatal', 'Serious', 'Fatal Rate (%)'],
      ...report.cities.map(c => [
        c.city, c.totalAccidents, c.fatalCount, c.seriousCount,
        ((c.fatalCount / (c.totalAccidents || 1)) * 100).toFixed(1)
      ]),
      [],
      ['Model', 'Accuracy', 'Precision', 'Recall', 'F1'],
      ...report.models.map(m => [
        m.modelName,
        (m.accuracy * 100).toFixed(1) + '%',
        (m.precisionScore * 100).toFixed(1) + '%',
        (m.recallScore * 100).toFixed(1) + '%',
        (m.macroF1Score * 100).toFixed(1) + '%',
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `accident_report_${Date.now()}.csv`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Reports & Summaries</h2>
          <p className="text-sm text-slate-500">Generate a comprehensive analysis report from live database data</p>
        </div>
        <div className="flex gap-2">
          {report && (
            <button onClick={handleDownloadCSV} className="btn-secondary flex items-center gap-2">
              <Download size={15}/> Export CSV
            </button>
          )}
          <button onClick={handleGenerate} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Spinner size={4}/> : <FileText size={15}/>}
            {loading ? 'Generating…' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && <AlertBox type="error" message={error}/>}

      {!report && !loading && (
        <div className="card text-center py-16">
          <FileText size={48} className="text-slate-200 mx-auto mb-4"/>
          <p className="text-slate-500 font-medium">No report generated yet</p>
          <p className="text-slate-400 text-sm mt-1">Click "Generate Report" to compile data from the database</p>
        </div>
      )}

      {report && (
        <div className="space-y-4">
          <div className="card border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-800">Accident Analysis Report</span>
              <span className="text-xs text-blue-600">{report.generated}</span>
            </div>
          </div>

          <Section title="Executive Summary">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                ['Total Accidents', report.summary.totalAccidents?.toLocaleString()],
                ['Fatal Accidents', report.summary.fatalAccidents?.toLocaleString()],
                ['Serious Accidents', report.summary.seriousAccidents?.toLocaleString()],
                ['Minor Accidents', report.summary.minorAccidents?.toLocaleString()],
                ['Detected Hotspots', report.summary.totalHotspots?.toLocaleString()],
                ['Critical Hotspots', report.summary.criticalHotspots?.toLocaleString()],
              ].map(([k,v]) => (
                <div key={k}>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">{k}</div>
                  <div className="text-lg font-bold text-slate-700 mt-0.5">{v ?? '—'}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Severity Distribution">
            <div className="space-y-2">
              {report.severity.map(s => {
                const total = report.summary.totalAccidents || 1;
                const pct = ((s.count / total) * 100).toFixed(1);
                const barColor = { Fatal: 'bg-red-500', Serious: 'bg-amber-500', Minor: 'bg-green-500' }[s.severity] || 'bg-blue-500';
                return (
                  <div key={s.severity} className="flex items-center gap-3">
                    <div className="w-20 text-sm font-medium text-slate-700">{s.severity}</div>
                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }}/>
                    </div>
                    <div className="text-sm text-slate-600 w-20 text-right">{s.count} ({pct}%)</div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="City-wise Statistics">
            <table className="data-table text-xs">
              <thead>
                <tr><th>#</th><th>City</th><th>Total</th><th>Fatal</th><th>Serious</th><th>Fatal Rate</th></tr>
              </thead>
              <tbody>
                {report.cities.slice(0,10).map((c,i) => {
                  const rate = ((c.fatalCount / (c.totalAccidents || 1)) * 100).toFixed(1);
                  return (
                    <tr key={i}>
                      <td className="text-slate-400">{i+1}</td>
                      <td className="font-medium">{c.city}</td>
                      <td className="font-bold text-blue-700">{c.totalAccidents}</td>
                      <td className="text-red-600 font-semibold">{c.fatalCount}</td>
                      <td className="text-amber-600 font-semibold">{c.seriousCount}</td>
                      <td className="text-slate-600">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>

          <Section title="ML Model Performance">
            <table className="data-table text-xs">
              <thead>
                <tr><th>Model</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1 Score</th></tr>
              </thead>
              <tbody>
                {report.models.map(m => (
                  <tr key={m.id}>
                    <td className="font-semibold">{m.modelName}</td>
                    <td className="text-blue-700 font-bold">{(m.accuracy * 100).toFixed(1)}%</td>
                    <td>{(m.precisionScore * 100).toFixed(1)}%</td>
                    <td>{(m.recallScore * 100).toFixed(1)}%</td>
                    <td>{(m.macroF1Score * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Key Observations">
            <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside">
              <li>Random Forest achieved the highest accuracy and F1 score among the three evaluated models.</li>
              <li>Fatal accidents constitute a higher proportion relative to their real-world base rate due to the synthetic dataset design emphasizing high-risk scenarios.</li>
              <li>DBSCAN hotspot analysis identifies geographic accident clusters; these represent high accident density, not normalized risk per vehicle-kilometer.</li>
              <li>Model predictions are statistical estimates. They should be used as decision-support tools, not deterministic classifiers.</li>
            </ul>
          </Section>
        </div>
      )}
    </div>
  );
}
