import React, { useEffect, useState, useRef } from 'react';
import { MapPin, RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { getAccidentsForMap, getHotspots, analyzeHotspots } from '../api';
import { Spinner, AlertBox, StatCard } from '../components';
import L from 'leaflet';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SEVERITY_CIRCLE = {
  Fatal:   { color: '#ef4444', radius: 10 },
  Serious: { color: '#f59e0b', radius: 7  },
  Minor:   { color: '#22c55e', radius: 5  },
};

const RISK_COLORS = {
  'Critical Risk': '#dc2626',
  'High Risk':     '#ea580c',
  'Medium Risk':   '#d97706',
  'Moderate Risk': '#16a34a',
};

export default function AccidentHotspots() {
  const [accidents, setAccidents] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('accidents'); // 'accidents' | 'hotspots'
  const [radiusKm, setRadiusKm] = useState(1.5);
  const [minPoints, setMinPoints] = useState(3);
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    Promise.all([getAccidentsForMap(), getHotspots()])
      .then(([a, h]) => {
        setAccidents(a.data.data || []);
        setHotspots(h.data.data || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoadingMap(false));
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const r = await analyzeHotspots({ radiusKm: Number(radiusKm), minPoints: Number(minPoints) });
      setHotspots(r.data.data || []);
      setViewMode('hotspots');
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const filtered = severityFilter
    ? accidents.filter(a => a.severity === severityFilter)
    : accidents;

  const mapCenter = [20.5937, 78.9629]; // Center of India

  const totalFatal = hotspots.reduce((s, h) => s + (h.fatalAccidentCount || 0), 0);
  const criticalCount = hotspots.filter(h => h.riskCategory === 'Critical Risk').length;

  return (
    <div className="space-y-4">
      {error && <AlertBox type="error" message={error} />}

      {/* Controls */}
      <div className="card flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('accidents')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'accidents' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Accident Points
          </button>
          <button
            onClick={() => setViewMode('hotspots')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'hotspots' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Hotspot Clusters
          </button>
        </div>

        {viewMode === 'accidents' && (
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="form-input w-40">
            <option value="">All Severities</option>
            <option>Fatal</option>
            <option>Serious</option>
            <option>Minor</option>
          </select>
        )}

        {viewMode === 'hotspots' && (
          <div className="flex gap-3 items-center flex-wrap">
            <div>
              <label className="text-xs text-slate-500 mr-1">Radius (km)</label>
              <input type="number" value={radiusKm} onChange={e => setRadiusKm(e.target.value)} min={0.5} max={10} step={0.5} className="form-input w-20 inline-block"/>
            </div>
            <div>
              <label className="text-xs text-slate-500 mr-1">Min Points</label>
              <input type="number" value={minPoints} onChange={e => setMinPoints(e.target.value)} min={2} max={20} className="form-input w-20 inline-block"/>
            </div>
            <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary flex items-center gap-2">
              {analyzing ? <Spinner size={4}/> : <RefreshCw size={14}/>}
              {analyzing ? 'Analyzing…' : 'Run DBSCAN'}
            </button>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Mapped Accidents" value={accidents.length} icon={MapPin} color="blue" />
        <StatCard label="Detected Hotspots" value={hotspots.length} icon={Layers} color="purple" />
        <StatCard label="Critical Hotspots" value={criticalCount} icon={AlertTriangle} color="red" />
        <StatCard label="Hotspot Fatalities" value={totalFatal} icon={AlertTriangle} color="amber" />
      </div>

      {/* Map */}
      <div className="card p-0 overflow-hidden rounded-xl">
        <div className="h-[500px] w-full">
          {loadingMap ? (
            <div className="h-full flex items-center justify-center">
              <Spinner size={10}/>
            </div>
          ) : (
            <MapContainer center={mapCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Accident markers */}
              {viewMode === 'accidents' && filtered.map(a => {
                if (!a.latitude || !a.longitude) return null;
                const cfg = SEVERITY_CIRCLE[a.severity] || { color: '#6b7280', radius: 5 };
                return (
                  <CircleMarker
                    key={a.id}
                    center={[parseFloat(a.latitude), parseFloat(a.longitude)]}
                    radius={cfg.radius}
                    pathOptions={{ color: cfg.color, fillColor: cfg.color, fillOpacity: 0.7, weight: 1 }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{a.city}, {a.state}</div>
                        <div className="text-slate-600">{a.locationDescription || '—'}</div>
                        <div className="mt-1">
                          <span className="font-medium">Severity: </span>{a.severity}
                        </div>
                        <div><span className="font-medium">Date: </span>{a.accidentDate}</div>
                        <div><span className="font-medium">Weather: </span>{a.weatherCondition}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* Hotspot markers */}
              {viewMode === 'hotspots' && hotspots.map(h => {
                const color = RISK_COLORS[h.riskCategory] || '#6b7280';
                const radius = Math.max(12, Math.min(30, (h.accidentCount || 1) * 2));
                return (
                  <CircleMarker
                    key={h.id}
                    center={[parseFloat(h.latitude), parseFloat(h.longitude)]}
                    radius={radius}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.4, weight: 2 }}
                  >
                    <Popup>
                      <div className="text-sm min-w-[180px]">
                        <div className="font-semibold mb-1">{h.locationName || 'Hotspot'}</div>
                        <div className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2" style={{ background: color + '22', color }}>
                          {h.riskCategory}
                        </div>
                        <div><span className="font-medium">Total: </span>{h.accidentCount} accidents</div>
                        <div className="text-red-600"><span className="font-medium">Fatal: </span>{h.fatalAccidentCount}</div>
                        <div className="text-amber-600"><span className="font-medium">Serious: </span>{h.seriousAccidentCount}</div>
                        <div className="text-green-600"><span className="font-medium">Minor: </span>{h.minorAccidentCount}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {h.analysisStartDate} – {h.analysisEndDate || 'present'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          ⚠ Hotspot indicates high recorded accident density, not risk per vehicle journey.
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="card flex flex-wrap gap-6 text-sm">
        {viewMode === 'accidents' ? (
          <>
            <span className="text-slate-600 font-medium">Legend:</span>
            {Object.entries(SEVERITY_CIRCLE).map(([s, c]) => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: c.color }}/>
                <span className="text-slate-600">{s}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <span className="text-slate-600 font-medium">Risk Level:</span>
            {Object.entries(RISK_COLORS).map(([r, c]) => (
              <div key={r} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: c }}/>
                <span className="text-slate-600">{r}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Hotspot table */}
      {viewMode === 'hotspots' && hotspots.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">Detected Hotspot Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Location</th><th>Risk Level</th>
                  <th>Total</th><th>Fatal</th><th>Serious</th><th>Minor</th><th>Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {hotspots.map((h, i) => (
                  <tr key={h.id}>
                    <td className="text-slate-400">{i + 1}</td>
                    <td className="font-medium text-slate-700">{h.locationName || '—'}</td>
                    <td>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: (RISK_COLORS[h.riskCategory] || '#6b7280') + '22', color: RISK_COLORS[h.riskCategory] || '#6b7280' }}>
                        {h.riskCategory}
                      </span>
                    </td>
                    <td className="font-bold text-slate-700">{h.accidentCount}</td>
                    <td className="text-red-600 font-semibold">{h.fatalAccidentCount}</td>
                    <td className="text-amber-600 font-semibold">{h.seriousAccidentCount}</td>
                    <td className="text-green-600 font-semibold">{h.minorAccidentCount}</td>
                    <td className="text-xs text-slate-400 font-mono">{parseFloat(h.latitude).toFixed(4)}, {parseFloat(h.longitude).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
