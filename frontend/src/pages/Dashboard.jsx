import React, { useEffect, useState } from 'react';
import { Car, AlertTriangle, MapPin, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { getDashboardSummary } from '../api';
import { StatCard, SeverityBadge, Spinner, SEVERITY_COLORS, CHART_COLORS } from '../components';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardSummary()
      .then(r => setSummary(r.data.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Spinner size={8} />
        <p className="text-slate-500 text-sm mt-3">Loading dashboard…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="card border-red-200 bg-red-50 text-red-700">
      <strong>Backend Unavailable:</strong> {error}. Please start the Spring Boot backend on port 8080.
    </div>
  );

  const severityPieData = summary.severityDistribution || [];
  const monthlyData = (summary.monthlyTrends || []).slice(-12);
  const weatherData = (summary.weatherAnalysis || []).slice(0, 6);
  const roadData = (summary.roadTypeAnalysis || []).slice(0, 6);
  const hourlyData = summary.hourlyDistribution || [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Accidents" value={summary.totalAccidents?.toLocaleString()} icon={Car} color="blue" />
        <StatCard label="Fatal Accidents" value={summary.fatalAccidents?.toLocaleString()} icon={AlertTriangle} color="red" sub="Life-threatening incidents" />
        <StatCard label="Serious Accidents" value={summary.seriousAccidents?.toLocaleString()} icon={TrendingUp} color="amber" sub="Hospitalization required" />
        <StatCard label="Minor Accidents" value={summary.minorAccidents?.toLocaleString()} icon={Activity} color="green" sub="Low-severity incidents" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Detected Hotspots" value={summary.totalHotspots?.toLocaleString()} icon={MapPin} color="purple" />
        <StatCard label="Critical Hotspots" value={summary.criticalHotspots?.toLocaleString()} icon={AlertTriangle} color="red" />
        <StatCard label="Analytics Models" value="3" icon={BarChart3} color="slate" sub="LR, DT, RF" />
        <StatCard label="Model Accuracy" value="76%" icon={Activity} color="green" sub="Random Forest best" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Severity Pie */}
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4">Severity Distribution</h3>
          {severityPieData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={severityPieData} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={80} label={({ severity, percent }) => `${severity} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {severityPieData.map((entry, i) => (
                    <Cell key={i} fill={SEVERITY_COLORS[entry.severity] || CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Hourly Chart */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-700 mb-4">Accidents by Hour of Day</h3>
          {hourlyData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Accidents" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4">Monthly Accident Trends</h3>
          {monthlyData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Fatal" stroke={SEVERITY_COLORS.Fatal} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Serious" stroke={SEVERITY_COLORS.Serious} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Minor" stroke={SEVERITY_COLORS.Minor} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weather Analysis */}
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4">Accidents by Weather Condition</h3>
          {weatherData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weatherData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="weather" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Fatal" fill={SEVERITY_COLORS.Fatal} stackId="a" />
                <Bar dataKey="Serious" fill={SEVERITY_COLORS.Serious} stackId="a" />
                <Bar dataKey="Minor" fill={SEVERITY_COLORS.Minor} stackId="a" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Road Type Chart */}
      <div className="card">
        <h3 className="font-semibold text-slate-700 mb-4">Accidents by Road Type</h3>
        {roadData.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No data yet. Add accident records to see analysis.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roadData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="roadType" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Fatal" fill={SEVERITY_COLORS.Fatal} stackId="a" />
              <Bar dataKey="Serious" fill={SEVERITY_COLORS.Serious} stackId="a" />
              <Bar dataKey="Minor" fill={SEVERITY_COLORS.Minor} stackId="a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
