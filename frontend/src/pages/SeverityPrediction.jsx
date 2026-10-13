import React, { useState } from 'react';
import { Brain, AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';
import { predictSeverity } from '../api';
import { Spinner, AlertBox } from '../components';

const ROAD_TYPES = ['Single Carriageway','Dual Carriageway','Roundabout','One way street'];
const WEATHER = ['Fine','Raining','Fog/Mist','High winds'];
const LIGHTING = ['Daylight','Darkness - lights lit','Darkness - no lights'];
const SURFACES = ['Dry','Wet/Damp','Snow/Ice','Flooded'];
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const AREAS = ['Urban','Rural'];
const MODELS = ['Random Forest','Logistic Regression','Decision Tree'];

const SEVERITY_CONFIG = {
  Fatal:   { color: 'bg-red-100 border-red-300 text-red-800',   icon: AlertTriangle, iconColor: 'text-red-600',   ring: 'ring-red-300'   },
  Serious: { color: 'bg-amber-100 border-amber-300 text-amber-800', icon: Clock, iconColor: 'text-amber-600', ring: 'ring-amber-300' },
  Minor:   { color: 'bg-green-100 border-green-300 text-green-800', icon: CheckCircle, iconColor: 'text-green-600', ring: 'ring-green-300' },
};

function Field({ label, children }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export default function SeverityPrediction() {
  const [form, setForm] = useState({
    hour: 18, dayOfWeek: 'Friday', roadType: 'Single Carriageway',
    weatherCondition: 'Fine', lightingCondition: 'Daylight',
    roadSurfaceCondition: 'Dry', vehicleCount: 2, speedLimit: 60,
    areaType: 'Urban', modelName: 'Random Forest',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'hour' || name === 'vehicleCount' || name === 'speedLimit' ? Number(value) : value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await predictSeverity(form);
      setResult(r.data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sev = result?.predictedSeverity;
  const cfg = sev ? SEVERITY_CONFIG[sev] : null;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Disclaimer */}
      <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <span>Predictions are statistical estimates from a machine learning model trained on historical accident data. They do not guarantee actual outcomes or assign fault.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 card">
          <h3 className="font-semibold text-slate-700 mb-5">Input Accident Conditions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Hour of Accident (0–23)">
              <input type="number" name="hour" value={form.hour} onChange={handleChange} min={0} max={23} className="form-input"/>
            </Field>
            <Field label="Day of Week">
              <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange} className="form-input">
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Road Type">
              <select name="roadType" value={form.roadType} onChange={handleChange} className="form-input">
                {ROAD_TYPES.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Weather Condition">
              <select name="weatherCondition" value={form.weatherCondition} onChange={handleChange} className="form-input">
                {WEATHER.map(w => <option key={w}>{w}</option>)}
              </select>
            </Field>
            <Field label="Lighting Condition">
              <select name="lightingCondition" value={form.lightingCondition} onChange={handleChange} className="form-input">
                {LIGHTING.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Road Surface">
              <select name="roadSurfaceCondition" value={form.roadSurfaceCondition} onChange={handleChange} className="form-input">
                {SURFACES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Vehicles Involved">
              <input type="number" name="vehicleCount" value={form.vehicleCount} onChange={handleChange} min={1} max={20} className="form-input"/>
            </Field>
            <Field label="Speed Limit (km/h)">
              <input type="number" name="speedLimit" value={form.speedLimit} onChange={handleChange} min={0} max={200} className="form-input"/>
            </Field>
            <Field label="Area Type">
              <select name="areaType" value={form.areaType} onChange={handleChange} className="form-input">
                {AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="ML Model">
              <select name="modelName" value={form.modelName} onChange={handleChange} className="form-input">
                {MODELS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>
          <button
            onClick={handlePredict}
            disabled={loading}
            className="btn-primary mt-6 w-full flex items-center justify-center gap-2 py-3 text-base"
          >
            {loading ? <Spinner size={5}/> : <Brain size={18}/>}
            {loading ? 'Running Model Inference…' : 'Predict Accident Severity'}
          </button>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-2 space-y-4">
          {error && <AlertBox type="error" title="ML Service Error" message={error}/>}

          {!result && !error && !loading && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <Brain size={40} className="text-slate-300 mb-3"/>
              <p className="text-slate-500 font-medium">No prediction yet</p>
              <p className="text-slate-400 text-sm mt-1">Fill the form and click Predict</p>
            </div>
          )}

          {result && cfg && (
            <>
              {/* Severity result */}
              <div className={`card border-2 ${cfg.color} text-center py-8`}>
                <cfg.icon size={36} className={`${cfg.iconColor} mx-auto mb-3`}/>
                <div className="text-3xl font-bold">{sev}</div>
                <div className="text-sm mt-1 opacity-70">Predicted Severity Level</div>
                <div className="text-xs mt-2 opacity-60">
                  Confidence: {(result.confidenceScore * 100).toFixed(1)}%
                </div>
              </div>

              {/* Probabilities */}
              <div className="card">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Class Probabilities</h4>
                {result.classProbabilities && Object.entries(result.classProbabilities).map(([cls, prob]) => {
                  const pct = (prob * 100).toFixed(1);
                  const barColor = { Fatal: 'bg-red-500', Serious: 'bg-amber-500', Minor: 'bg-green-500' }[cls] || 'bg-blue-500';
                  return (
                    <div key={cls} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-600">{cls}</span>
                        <span className="text-slate-500">{pct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="card">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Model Explanation</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{result.explanation}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="card text-xs text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Request ID</span><span className="font-mono">{result.requestId}</span></div>
                <div className="flex justify-between"><span>Model</span><span>{result.modelName} v{result.modelVersion}</span></div>
                <div className="flex justify-between"><span>Timestamp</span><span>{new Date(result.timestamp).toLocaleTimeString()}</span></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
