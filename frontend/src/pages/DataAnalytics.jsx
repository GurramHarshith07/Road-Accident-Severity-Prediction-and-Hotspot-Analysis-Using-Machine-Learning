import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { getSeverityAnalytics, getTimeAnalytics, getRoadTypeAnalytics, getWeatherAnalytics, getCityStatistics, getAreaStatistics } from '../api';
import { Spinner, AlertBox, SEVERITY_COLORS, CHART_COLORS } from '../components';

function ChartCard({ title, children, loading }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-700 mb-4">{title}</h3>
      {loading ? <div className="flex justify-center py-10"><Spinner size={8}/></div> : children}
    </div>
  );
}

export default function DataAnalytics() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getSeverityAnalytics(),
      getTimeAnalytics(),
      getRoadTypeAnalytics(),
      getWeatherAnalytics(),
      getCityStatistics(),
      getAreaStatistics(),
    ]).then(([sev, time, road, weather, city, area]) => {
      setData({
        severity: sev.data.data || [],
        hourly: time.data.data?.hourly || [],
        lighting: time.data.data?.lighting || [],
        roadType: road.data.data || [],
        weather: weather.data.data || [],
        city: (city.data.data || []).slice(0, 10),
        area: area.data.data || [],
      });
    })
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
  }, []);

  if (error) return <AlertBox type="error" title="Error loading analytics" message={error}/>;

  return (
    <div className="space-y-6">
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Severity Distribution" loading={loading}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.severity} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={100}
                label={({ severity, count, percent }) => `${severity}: ${count} (${(percent*100).toFixed(0)}%)`}>
                {(data.severity || []).map((e, i) => (
                  <Cell key={i} fill={SEVERITY_COLORS[e.severity] || CHART_COLORS[i]}/>
                ))}
              </Pie>
              <Tooltip formatter={(v, n, p) => [`${v} accidents (${(p.payload.percentage || 0)}%)`, n]}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hourly Accident Frequency" loading={loading}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.hourly} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={2}/>
              <YAxis tick={{ fontSize: 10 }}/>
              <Tooltip/>
              <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} name="Accidents"/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Accidents by Road Type" loading={loading}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.roadType} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="roadType" tick={{ fontSize: 9 }}/>
              <YAxis tick={{ fontSize: 10 }}/>
              <Tooltip/><Legend/>
              <Bar dataKey="Fatal" fill={SEVERITY_COLORS.Fatal} stackId="a"/>
              <Bar dataKey="Serious" fill={SEVERITY_COLORS.Serious} stackId="a"/>
              <Bar dataKey="Minor" fill={SEVERITY_COLORS.Minor} stackId="a" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weather Condition Analysis" loading={loading}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.weather} layout="vertical" margin={{ top: 4, right: 8, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis type="number" tick={{ fontSize: 10 }}/>
              <YAxis dataKey="weatherCondition" type="category" tick={{ fontSize: 10 }} width={90}/>
              <Tooltip/><Legend/>
              <Bar dataKey="Fatal" fill={SEVERITY_COLORS.Fatal} stackId="a"/>
              <Bar dataKey="Serious" fill={SEVERITY_COLORS.Serious} stackId="a"/>
              <Bar dataKey="Minor" fill={SEVERITY_COLORS.Minor} stackId="a" radius={[0,2,2,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Urban vs Rural Comparison" loading={loading}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.area} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="areaType" tick={{ fontSize: 12 }}/>
              <YAxis tick={{ fontSize: 10 }}/>
              <Tooltip/><Legend/>
              <Bar dataKey="Fatal" fill={SEVERITY_COLORS.Fatal} stackId="a"/>
              <Bar dataKey="Serious" fill={SEVERITY_COLORS.Serious} stackId="a"/>
              <Bar dataKey="Minor" fill={SEVERITY_COLORS.Minor} stackId="a" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lighting Condition Distribution" loading={loading}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.lighting} dataKey="count" nameKey="condition" cx="50%" cy="50%" outerRadius={90}
                label={({ condition, percent }) => `${(condition || '').split(' ')[0]} ${(percent*100).toFixed(0)}%`}>
                {(data.lighting || []).map((e, i) => (
                  <Cell key={i} fill={CHART_COLORS[i]}/>
                ))}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* City Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">City-Wise Statistics (Top 10)</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner size={8}/></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>City</th><th>Total Accidents</th>
                  <th>Fatal</th><th>Serious</th><th>Fatal Rate</th>
                </tr>
              </thead>
              <tbody>
                {(data.city || []).map((c, i) => {
                  const total = Number(c.totalAccidents) || 0;
                  const fatal = Number(c.fatalCount) || 0;
                  const serious = Number(c.seriousCount) || 0;
                  const rate = total > 0 ? ((fatal / total) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={i}>
                      <td className="text-slate-400">{i + 1}</td>
                      <td className="font-medium text-slate-700">{c.city}</td>
                      <td className="font-bold text-blue-700">{total.toLocaleString()}</td>
                      <td className="text-red-600 font-semibold">{fatal}</td>
                      <td className="text-amber-600 font-semibold">{serious}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, rate * 5)}%` }}/>
                          </div>
                          <span className="text-xs text-red-600 font-medium w-10">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
