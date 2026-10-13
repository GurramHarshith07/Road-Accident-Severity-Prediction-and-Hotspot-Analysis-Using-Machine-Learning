import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, X, ChevronDown } from 'lucide-react';
import { getAccidents, createAccident, updateAccident, deleteAccident, getAccidentById } from '../api';
import { SeverityBadge, Spinner, Pagination, EmptyState, AlertBox } from '../components';

const ROAD_TYPES = ['Single Carriageway','Dual Carriageway','Roundabout','One way street'];
const WEATHER = ['Fine','Raining','Fog/Mist','High winds'];
const LIGHTING = ['Daylight','Darkness - lights lit','Darkness - no lights'];
const SURFACES = ['Dry','Wet/Damp','Snow/Ice','Flooded'];
const SEVERITIES = ['Minor','Serious','Fatal'];
const AREA_TYPES = ['Urban','Rural'];

const EMPTY_FORM = {
  accidentDate:'', accidentTime:'', latitude:'', longitude:'',
  state:'', city:'', locationDescription:'',
  roadType:'Single Carriageway', weatherCondition:'Fine',
  lightingCondition:'Daylight', roadSurfaceCondition:'Dry',
  vehicleCount:1, casualtyCount:0, injuryCount:0,
  speedLimit:50, areaType:'Urban', severity:'Minor'
};

function Select({ label, name, value, onChange, options, error }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <select name={name} value={value} onChange={onChange} className="form-input">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

function Field({ label, name, value, onChange, type='text', error, min, max, step }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange}
        min={min} max={max} step={step} className="form-input" />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

export default function AccidentRecords() {
  const [accidents, setAccidents] = useState([]);
  const [meta, setMeta] = useState({ totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');

  // Modal state
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'view'
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchAccidents = useCallback(() => {
    setLoading(true);
    const params = { page, size: 15, sortBy: 'accidentDate', sortDirection: 'desc' };
    if (search) params.city = search;
    if (severity) params.severity = severity;
    getAccidents(params)
      .then(r => {
        setAccidents(r.data.data.content || []);
        setMeta({ totalPages: r.data.data.totalPages, totalElements: r.data.data.totalElements });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, search, severity]);

  useEffect(() => { fetchAccidents(); }, [fetchAccidents]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.accidentDate) errs.accidentDate = 'Required';
    if (!form.accidentTime) errs.accidentTime = 'Required';
    if (!form.latitude || isNaN(form.latitude) || form.latitude < -90 || form.latitude > 90) errs.latitude = 'Valid latitude required (-90 to 90)';
    if (!form.longitude || isNaN(form.longitude) || form.longitude < -180 || form.longitude > 180) errs.longitude = 'Valid longitude required (-180 to 180)';
    if (!form.state) errs.state = 'Required';
    if (!form.city) errs.city = 'Required';
    if (!form.vehicleCount || form.vehicleCount < 1) errs.vehicleCount = 'At least 1';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      const payload = { ...form, vehicleCount: Number(form.vehicleCount), casualtyCount: Number(form.casualtyCount), injuryCount: Number(form.injuryCount), speedLimit: Number(form.speedLimit) };
      if (modal === 'add') await createAccident(payload);
      else await updateAccident(selectedId, payload);
      setModal(null);
      fetchAccidents();
    } catch (e) {
      setFormErrors({ _server: e.message });
    } finally { setSaving(false); }
  };

  const openEdit = async (id) => {
    const r = await getAccidentById(id);
    const a = r.data.data;
    setForm({
      accidentDate: a.accidentDate || '',
      accidentTime: a.accidentTime?.substring(0, 5) || '',
      latitude: a.latitude || '',
      longitude: a.longitude || '',
      state: a.state || '', city: a.city || '',
      locationDescription: a.locationDescription || '',
      roadType: a.roadType || 'Single Carriageway',
      weatherCondition: a.weatherCondition || 'Fine',
      lightingCondition: a.lightingCondition || 'Daylight',
      roadSurfaceCondition: a.roadSurfaceCondition || 'Dry',
      vehicleCount: a.vehicleCount || 1,
      casualtyCount: a.casualtyCount || 0,
      injuryCount: a.injuryCount || 0,
      speedLimit: a.speedLimit || 50,
      areaType: a.areaType || 'Urban',
      severity: a.severity || 'Minor',
    });
    setSelectedId(id);
    setModal('edit');
    setFormErrors({});
  };

  const openView = async (id) => {
    const r = await getAccidentById(id);
    setForm(r.data.data);
    setModal('view');
  };

  const handleDelete = async (id) => {
    try {
      await deleteAccident(id);
      setDeleteConfirm(null);
      fetchAccidents();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by city…"
              className="form-input pl-8 w-44"
            />
          </div>
          <select value={severity} onChange={e => { setSeverity(e.target.value); setPage(0); }} className="form-input w-36">
            <option value="">All Severities</option>
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setModal('add'); }} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus size={16}/> Add Accident
        </button>
      </div>

      {error && <AlertBox type="error" message={error} />}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            {meta.totalElements?.toLocaleString()} accident records
          </span>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={8}/></div>
        ) : accidents.length === 0 ? (
          <EmptyState icon={Search} title="No records found" description="Add accident records or adjust your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Date</th><th>Time</th><th>Location</th>
                  <th>Road Type</th><th>Weather</th><th>Severity</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accidents.map(a => (
                  <tr key={a.id}>
                    <td className="font-mono text-xs text-slate-400">#{a.id}</td>
                    <td>{a.accidentDate}</td>
                    <td>{a.accidentTime?.substring(0,5)}</td>
                    <td>
                      <div className="font-medium text-slate-700 truncate max-w-[160px]">{a.city}, {a.state}</div>
                      {a.locationDescription && <div className="text-xs text-slate-400 truncate max-w-[160px]">{a.locationDescription}</div>}
                    </td>
                    <td><span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{a.roadType}</span></td>
                    <td><span className="text-xs text-slate-600">{a.weatherCondition}</span></td>
                    <td><SeverityBadge severity={a.severity}/></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openView(a.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="View"><Eye size={14}/></button>
                        <button onClick={() => openEdit(a.id)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded" title="Edit"><Edit2 size={14}/></button>
                        <button onClick={() => setDeleteConfirm(a.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Accident Record' : 'Edit Accident Record'} onClose={() => setModal(null)}>
          {formErrors._server && <AlertBox type="error" message={formErrors._server} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <Field label="Accident Date *" name="accidentDate" type="date" value={form.accidentDate} onChange={handleChange} error={formErrors.accidentDate}/>
            <Field label="Accident Time *" name="accidentTime" type="time" value={form.accidentTime} onChange={handleChange} error={formErrors.accidentTime}/>
            <Field label="Latitude *" name="latitude" type="number" value={form.latitude} onChange={handleChange} error={formErrors.latitude} min={-90} max={90} step="0.0000001"/>
            <Field label="Longitude *" name="longitude" type="number" value={form.longitude} onChange={handleChange} error={formErrors.longitude} min={-180} max={180} step="0.0000001"/>
            <Field label="State *" name="state" value={form.state} onChange={handleChange} error={formErrors.state}/>
            <Field label="City *" name="city" value={form.city} onChange={handleChange} error={formErrors.city}/>
            <div className="sm:col-span-2">
              <Field label="Location Description" name="locationDescription" value={form.locationDescription} onChange={handleChange}/>
            </div>
            <Select label="Road Type" name="roadType" value={form.roadType} onChange={handleChange} options={ROAD_TYPES}/>
            <Select label="Weather Condition" name="weatherCondition" value={form.weatherCondition} onChange={handleChange} options={WEATHER}/>
            <Select label="Lighting Condition" name="lightingCondition" value={form.lightingCondition} onChange={handleChange} options={LIGHTING}/>
            <Select label="Road Surface" name="roadSurfaceCondition" value={form.roadSurfaceCondition} onChange={handleChange} options={SURFACES}/>
            <Field label="Vehicle Count *" name="vehicleCount" type="number" value={form.vehicleCount} onChange={handleChange} error={formErrors.vehicleCount} min={1}/>
            <Field label="Casualty Count" name="casualtyCount" type="number" value={form.casualtyCount} onChange={handleChange} min={0}/>
            <Field label="Injury Count" name="injuryCount" type="number" value={form.injuryCount} onChange={handleChange} min={0}/>
            <Field label="Speed Limit (km/h)" name="speedLimit" type="number" value={form.speedLimit} onChange={handleChange} min={0}/>
            <Select label="Area Type" name="areaType" value={form.areaType} onChange={handleChange} options={AREA_TYPES}/>
            <Select label="Severity *" name="severity" value={form.severity} onChange={handleChange} options={SEVERITIES}/>
          </div>
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <Spinner size={4}/>} {modal === 'add' ? 'Save Record' : 'Update Record'}
            </button>
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {modal === 'view' && (
        <Modal title={`Accident #${form.id}`} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Date', form.accidentDate], ['Time', form.accidentTime?.substring(0,5)],
              ['City', form.city], ['State', form.state],
              ['Location', form.locationDescription || '—'], ['Severity', form.severity],
              ['Road Type', form.roadType], ['Weather', form.weatherCondition],
              ['Lighting', form.lightingCondition], ['Surface', form.roadSurfaceCondition],
              ['Vehicles', form.vehicleCount], ['Casualties', form.casualtyCount],
              ['Injuries', form.injuryCount], ['Speed Limit', form.speedLimit ? `${form.speedLimit} km/h` : '—'],
              ['Area', form.areaType], ['Coordinates', `${form.latitude}, ${form.longitude}`],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-xs text-slate-400 uppercase tracking-wide">{k}</div>
                <div className="font-medium text-slate-700 mt-0.5">{v ?? '—'}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-slate-800 mb-2">Delete Accident Record</h3>
            <p className="text-sm text-slate-600 mb-5">This action is permanent and cannot be undone. Are you sure?</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Yes, Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
