import React from 'react';
import { GraduationCap, Code2, Database, Brain, Map } from 'lucide-react';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <Icon size={16} className="text-blue-500"/> {title}
      </h3>
      {children}
    </div>
  );
}

function Tech({ name, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"/>
      <div>
        <span className="font-semibold text-slate-700">{name}</span>
        {desc && <span className="text-slate-500 text-sm"> — {desc}</span>}
      </div>
    </div>
  );
}

export default function About() {
  return (
    <div className="max-w-3xl space-y-5">
      {/* Hero Card */}
      <div className="card bg-gradient-to-br from-[#152233] to-[#1e3a5f] text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap size={24}/>
          </div>
          <div>
            <h1 className="text-xl font-bold">Road Accident Severity Prediction</h1>
            <h2 className="text-base text-blue-200 mt-0.5">& Hotspot Analysis Using Machine Learning</h2>
            <div className="flex gap-4 mt-4 text-sm text-blue-300">
              <span>B.Tech Final Year Project</span>
              <span>•</span>
              <span>Computer Science & Engineering</span>
            </div>
          </div>
        </div>
      </div>

      <Section icon={Brain} title="Project Objectives">
        <ul className="space-y-2 text-sm text-slate-700">
          {[
            'Predict accident severity (Minor / Serious / Fatal) from environmental and road conditions using machine learning.',
            'Identify geographic accident hotspots using DBSCAN clustering on recorded accident coordinates.',
            'Provide interactive dashboard analytics for historical accident data analysis.',
            'Enable data administrators to manage accident records through a full CRUD interface.',
            'Compare the performance of Logistic Regression, Decision Tree, and Random Forest classifiers.',
            'Support CSV dataset upload with validation, preview, and batch import.',
            'Generate analytical reports exportable as CSV.',
          ].map((o, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-xs mt-1">{i+1}.</span>{o}
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={Code2} title="Technology Stack">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">Frontend</p>
            <div className="space-y-1.5 text-sm">
              <Tech name="React + Vite" desc="SPA framework"/>
              <Tech name="Tailwind CSS" desc="Utility-first styling"/>
              <Tech name="React Router v6" desc="Client-side routing"/>
              <Tech name="Recharts" desc="Data visualizations"/>
              <Tech name="Leaflet / React-Leaflet" desc="Interactive maps"/>
              <Tech name="Axios" desc="REST API client"/>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">Backend</p>
            <div className="space-y-1.5 text-sm">
              <Tech name="Spring Boot 3.x" desc="REST API server"/>
              <Tech name="Spring Data JPA" desc="ORM / MySQL"/>
              <Tech name="Java 17" desc="Runtime"/>
              <Tech name="FastAPI (Python)" desc="ML microservice"/>
              <Tech name="Scikit-learn" desc="Logistic Regression"/>
              <Tech name="Custom NumPy" desc="Decision Tree & Random Forest"/>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">Database & DevOps</p>
            <div className="space-y-1.5 text-sm">
              <Tech name="MySQL 8" desc="Relational database"/>
              <Tech name="Hibernate / JPA" desc="ORM layer"/>
              <Tech name="Joblib" desc="Model serialization"/>
              <Tech name="Maven" desc="Java build tool"/>
              <Tech name="uv" desc="Python dependency manager"/>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">ML Pipeline</p>
            <div className="space-y-1.5 text-sm">
              <Tech name="Logistic Regression" desc="Scikit-learn, pure Python"/>
              <Tech name="Decision Tree" desc="Custom NumPy implementation"/>
              <Tech name="Random Forest" desc="Custom NumPy ensemble"/>
              <Tech name="DBSCAN" desc="Pure Java Haversine metric"/>
              <Tech name="Pandas / NumPy" desc="Data processing"/>
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Database} title="Dataset Information">
        <div className="text-sm text-slate-700 space-y-2">
          <p>The application uses a <strong>5,000-row synthetic training dataset</strong> generated using physics-grounded risk models derived from published road accident research. Key dataset properties:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>Features: Hour, day of week, weather, lighting, road surface, road type, vehicle count, speed limit, area type</li>
            <li>Target: Severity class — Minor (≈55%), Serious (≈30%), Fatal (≈15%)</li>
            <li>Train / Test split: 80% / 20%</li>
            <li>Realistic class imbalance and correlated risk factors (night driving + rain + high speed → Fatal)</li>
          </ul>
          <p className="text-xs text-slate-400 mt-2">Note: Synthetic data is used for demonstration. In production, real crash records from NCRB or state transport departments would replace this dataset.</p>
        </div>
      </Section>

      <Section icon={Map} title="Hotspot Analysis Methodology">
        <div className="text-sm text-slate-700 space-y-2">
          <p>Hotspots are detected using <strong>DBSCAN (Density-Based Spatial Clustering of Applications with Noise)</strong> implemented in pure Java using the Haversine formula for geodesic distances.</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>Distance metric: Haversine (great-circle distance in km)</li>
            <li>Default parameters: ε = 1.5 km, minPoints = 3</li>
            <li>Risk categories: Critical / High / Medium / Moderate based on fatal count and cluster size</li>
          </ul>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-2">
            ⚠ Hotspot classification measures recorded accident density. Without traffic volume data, it cannot estimate accident risk per vehicle-kilometer or per trip.
          </p>
        </div>
      </Section>

      <div className="card border-slate-200 text-center text-sm text-slate-500">
        <p>Built for academic demonstration purposes · B.Tech Final Year Project · 2024–25</p>
        <p className="mt-1 text-xs text-slate-400">Model predictions are statistical estimates. Not for operational safety decision-making.</p>
      </div>
    </div>
  );
}
