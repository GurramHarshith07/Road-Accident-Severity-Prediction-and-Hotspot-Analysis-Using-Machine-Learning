import React, { useEffect, useState } from 'react';
import { RefreshCw, Trophy, Info } from 'lucide-react';
import { getModelEvaluations, syncModelEvaluations } from '../api';
import { Spinner, AlertBox } from '../components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const METRICS = ['accuracy','precisionScore','recallScore','macroF1Score'];
const METRIC_LABELS = { accuracy:'Accuracy', precisionScore:'Precision', recallScore:'Recall', macroF1Score:'Macro F1' };

function ConfusionMatrix({ matrix }) {
  if (!matrix || matrix.length === 0) return null;
  const labels = ['Minor', 'Serious', 'Fatal'];
  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">Rows = Actual, Cols = Predicted</p>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-1 text-slate-400 text-right">Actual ↓ / Pred →</th>
              {labels.map(l => <th key={l} className="px-3 py-1 font-semibold text-slate-700 text-center">{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="px-2 py-1 font-semibold text-slate-700 text-right">{labels[i]}</td>
                {row.map((val, j) => (
                  <td key={j} className={`px-3 py-2 text-center font-bold border ${i === j ? 'bg-blue-100 text-blue-800' : val > 0 ? 'bg-red-50 text-red-700' : 'text-slate-300'}`}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ModelEvaluation() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchModels = () => {
    setLoading(true);
    getModelEvaluations()
      .then(r => {
        const list = r.data.data || [];
        setModels(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchModels(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const r = await syncModelEvaluations();
      const list = r.data.data || [];
      setModels(list);
      if (list.length > 0) setSelected(list[0]);
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  };

  // Comparison bar chart data
  const compareData = METRICS.map(m => {
    const row = { metric: METRIC_LABELS[m] };
    models.forEach(model => {
      row[model.modelName] = Number(model[m] || 0);
    });
    return row;
  });

  // Radar chart data per model
  const radarData = METRICS.map(m => ({
    metric: METRIC_LABELS[m],
    value: Number(selected?.[m] || 0),
  }));

  // Parse evaluation details JSON
  let details = null;
  if (selected?.evaluationDetails) {
    try { details = JSON.parse(selected.evaluationDetails); } catch {}
  }
  const confusionMatrix = details?.confusion_matrix || null;
  const classMetrics = details?.class_metrics || null;

  const barColors = ['#3b82f6', '#f59e0b', '#22c55e'];

  if (loading) return <div className="flex justify-center py-16"><Spinner size={10}/></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Model Evaluation</h2>
          <p className="text-sm text-slate-500">Comparison of Logistic Regression, Decision Tree, and Random Forest classifiers</p>
        </div>
        <button onClick={handleSync} disabled={syncing} className="btn-secondary flex items-center gap-2">
          {syncing ? <Spinner size={4}/> : <RefreshCw size={14}/>}
          Sync from ML Service
        </button>
      </div>

      {error && <AlertBox type="error" title="Error" message={error}/>}

      {models.length === 0 && (
        <div className="card text-center py-12">
          <Info size={36} className="text-slate-300 mx-auto mb-3"/>
          <p className="text-slate-500 font-medium">No evaluations available</p>
          <p className="text-slate-400 text-sm mt-1">Click "Sync from ML Service" to load model performance metrics.</p>
        </div>
      )}

      {models.length > 0 && (
        <>
          {/* Model Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {models.map((m, i) => {
              const isSelected = selected?.id === m.id;
              const isBest = i === 0;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className={`card cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 border-blue-200' : 'hover:border-blue-200'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-slate-800 text-sm">{m.modelName}</span>
                    {isBest && <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium"><Trophy size={10}/> Best</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {METRICS.map(key => (
                      <div key={key}>
                        <div className="text-slate-400">{METRIC_LABELS[key]}</div>
                        <div className="font-bold text-slate-700 text-sm">{(Number(m[key] || 0) * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-slate-400">v{m.modelVersion}</div>
                </div>
              );
            })}
          </div>

          {/* Comparison Bar Chart */}
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-4">Model Comparison</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={compareData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="metric" tick={{ fontSize: 11 }}/>
                <YAxis domain={[0, 1]} tickFormatter={v => `${(v*100).toFixed(0)}%`} tick={{ fontSize: 10 }}/>
                <Tooltip formatter={v => `${(v*100).toFixed(1)}%`}/>
                <Legend/>
                {models.map((m, i) => (
                  <Bar key={m.modelName} dataKey={m.modelName} fill={barColors[i]} radius={[3,3,0,0]}/>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Selected model detail */}
          {selected && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Radar Chart */}
              <div className="card">
                <h3 className="font-semibold text-slate-700 mb-4">{selected.modelName} — Radar View</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid/>
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }}/>
                    <PolarRadiusAxis angle={90} domain={[0, 1]} tickFormatter={v => `${(v*100).toFixed(0)}%`} tick={{ fontSize: 9 }}/>
                    <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} name={selected.modelName}/>
                    <Tooltip formatter={v => `${(v*100).toFixed(1)}%`}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Confusion Matrix */}
              <div className="card">
                <h3 className="font-semibold text-slate-700 mb-4">{selected.modelName} — Confusion Matrix</h3>
                {confusionMatrix ? (
                  <ConfusionMatrix matrix={confusionMatrix}/>
                ) : (
                  <p className="text-slate-400 text-sm">Confusion matrix not available. Sync from ML service.</p>
                )}

                {/* Class metrics */}
                {classMetrics && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Per-Class Metrics</h4>
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="text-slate-500">
                          <th className="text-left py-1">Class</th>
                          <th className="text-right py-1">Precision</th>
                          <th className="text-right py-1">Recall</th>
                          <th className="text-right py-1">F1</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(classMetrics).map(([cls, m]) => (
                          <tr key={cls} className="border-t border-slate-100">
                            <td className="py-1.5 font-medium text-slate-700">{cls}</td>
                            <td className="text-right text-slate-600">{(m.precision * 100).toFixed(1)}%</td>
                            <td className="text-right text-slate-600">{(m.recall * 100).toFixed(1)}%</td>
                            <td className="text-right font-semibold text-blue-700">{(m.f1 * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Limitations */}
          <div className="card border-amber-200 bg-amber-50">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2"><Info size={15}/>Model Limitations</h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Models are trained on synthetic data generated from documented road accident risk factors.</li>
              <li>Evaluation metrics are computed on a held-out 20% test split, not on live data.</li>
              <li>Predictions are probabilistic estimates; they do not guarantee actual outcomes.</li>
              <li>Class imbalance (Minor ≫ Fatal) affects per-class recall; metrics are reported as macro-averages.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
