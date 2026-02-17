
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  FileText, Upload, Briefcase, Building2, MapPin, 
  ChevronRight, Download, PieChart as PieIcon, BarChart3, 
  Info, CheckCircle2, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface ProfileData {
  name: string;
  company: string;
  jobTitle: string;
  location: string;
  experience: number;
  industry: string;
  skills: string;
}

interface ColumnMetadata {
  name: string;
  description: string;
}

// --- Sample Data ---
const SAMPLE_DATA: ProfileData[] = [
  { name: "Ana Garcia", company: "Google", jobTitle: "Senior Software Engineer", location: "Madrid, Spain", experience: 8, industry: "Technology", skills: "React, Node.js, Cloud" },
  { name: "John Smith", company: "Meta", jobTitle: "Project Manager", location: "London, UK", experience: 5, industry: "Social Media", skills: "Agile, Jira, Leadership" },
  { name: "Maria Rossi", company: "Amazon", jobTitle: "Software Engineer", location: "Berlin, Germany", experience: 3, industry: "E-commerce", skills: "Java, AWS, Python" },
  { name: "Chen Wei", company: "Google", jobTitle: "Data Scientist", location: "Singapore", experience: 6, industry: "Technology", skills: "Python, ML, SQL" },
  { name: "Lucía Mendez", company: "Microsoft", jobTitle: "Project Manager", location: "Madrid, Spain", experience: 10, industry: "Software", skills: "Strategy, PMP, Azure" },
  { name: "James Wilson", company: "Google", jobTitle: "Marketing Manager", location: "New York, USA", experience: 7, industry: "Technology", skills: "SEO, SEM, Analytics" },
  { name: "Sarah Jones", company: "Meta", jobTitle: "UX Designer", location: "London, UK", experience: 4, industry: "Design", skills: "Figma, Research" },
  { name: "Klaus Schmidt", company: "SAP", jobTitle: "Software Engineer", location: "Munich, Germany", experience: 2, industry: "Software", skills: "ABAP, Cloud" },
  { name: "Elena Petrova", company: "Amazon", jobTitle: "Senior Marketing Manager", location: "Berlin, Germany", experience: 9, industry: "E-commerce", skills: "Growth, Content" },
  { name: "Taro Tanaka", company: "Toyota", jobTitle: "Mechanical Engineer", location: "Tokyo, Japan", experience: 12, industry: "Automotive", skills: "CAD, Lean" },
  { name: "Sofia Silva", company: "Google", jobTitle: "Software Engineer", location: "Lisbon, Portugal", experience: 5, industry: "Technology", skills: "C++, Go" },
  { name: "Ahmed Hassan", company: "Microsoft", jobTitle: "Software Engineer", location: "Cairo, Egypt", experience: 4, industry: "Technology", skills: "C#, .NET" },
  { name: "Emma Brown", company: "Meta", jobTitle: "Project Manager", location: "London, UK", experience: 6, industry: "Technology", skills: "Product, Agile" },
  { name: "Liam O'Connor", company: "Apple", jobTitle: "Software Engineer", location: "Dublin, Ireland", experience: 7, industry: "Hardware", skills: "Swift, Objective-C" },
  { name: "Isabella Rossi", company: "Google", jobTitle: "HR Specialist", location: "Rome, Italy", experience: 5, industry: "Technology", skills: "Recruiting" },
  { name: "Noah Miller", company: "Amazon", jobTitle: "Data Analyst", location: "Berlin, Germany", experience: 4, industry: "Technology", skills: "Tableau, Excel" },
  { name: "Mia Wang", company: "Tencent", jobTitle: "Senior Software Engineer", location: "Shenzhen, China", experience: 8, industry: "Internet", skills: "Backend, System Design" },
  { name: "Lucas Dupont", company: "Ubisoft", jobTitle: "Game Designer", location: "Paris, France", experience: 6, industry: "Entertainment", skills: "Unity, Maya" },
  { name: "Olivia Taylor", company: "Netflix", jobTitle: "Content Strategist", location: "Los Angeles, USA", experience: 7, industry: "Media", skills: "Storytelling, Planning" },
  { name: "Leo Martinez", company: "Microsoft", jobTitle: "Cloud Architect", location: "Madrid, Spain", experience: 11, industry: "Technology", skills: "Azure, DevOps" },
  { name: "Eva Koranyi", company: "SAP", jobTitle: "Software Engineer", location: "Berlin, Germany", experience: 4, industry: "Software", skills: "Java, Spring" },
  { name: "Carlos Sanchez", company: "Inditex", jobTitle: "Supply Chain Manager", location: "A Coruña, Spain", experience: 10, industry: "Retail", skills: "Logistics, ERP" },
  { name: "Alice Zhang", company: "Google", jobTitle: "Software Engineer", location: "New York, USA", experience: 3, industry: "Technology", skills: "Python, GCP" },
  { name: "Robert Fischer", company: "Siemens", jobTitle: "Hardware Engineer", location: "Berlin, Germany", experience: 15, industry: "Engineering", skills: "Embedded Systems" },
  { name: "Chloe Smith", company: "Meta", jobTitle: "Software Engineer", location: "London, UK", experience: 2, industry: "Social Media", skills: "JavaScript, React" },
];

const COLUMN_DESCRIPTIONS: ColumnMetadata[] = [
  { name: "Nombre", description: "Identificador único o nombre del profesional cuyo perfil está siendo analizado." },
  { name: "Empresa", description: "Organización actual donde el profesional desempeña sus funciones laborales." },
  { name: "Título de Puesto", description: "Denominación del cargo actual (ej. Software Engineer, Project Manager), que define sus responsabilidades." },
  { name: "Ubicación", description: "Ciudad y país de residencia o trabajo, útil para análisis geográfico del mercado." },
  { name: "Experiencia (Años)", description: "Cantidad de años acumulados en el sector profesional, indicando el nivel de seniority." },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const App: React.FC = () => {
  const [data, setData] = useState<ProfileData[]>(SAMPLE_DATA);
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState<string>("");
  const [reportGenerated, setReportGenerated] = useState(false);

  // Analysis computations
  const topCompanies = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(p => counts[p.company] = (counts[p.company] || 0) + 1);
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [data]);

  const topTitles = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(p => counts[p.jobTitle] = (counts[p.jobTitle] || 0) + 1);
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [data]);

  const locationStats = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(p => {
      const country = p.location.split(', ').pop() || p.location;
      counts[country] = (counts[country] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const generateAIAnalysis = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const statsSummary = {
        topCompanies: topCompanies.map(c => `${c.name} (${c.count})`).join(', '),
        topTitles: topTitles.map(t => `${t.name} (${t.count})`).join(', '),
        locations: locationStats.map(l => `${l.name} (${l.value})`).join(', '),
        totalProfiles: data.length
      };

      const prompt = `Realiza un análisis profesional profundo basado en estos datos estadísticos de perfiles:
      - Total de perfiles: ${statsSummary.totalProfiles}
      - Empresas principales: ${statsSummary.topCompanies}
      - Cargos más comunes: ${statsSummary.topTitles}
      - Distribución geográfica: ${statsSummary.locations}

      Escribe un informe en español que responda:
      1. ¿Qué patrones observas en las trayectorias?
      2. ¿Hay concentración en ciertos países, empresas o tipos de cargos?
      3. ¿Qué dice esto sobre el mercado laboral representado?
      4. Conclusiones claras y estructuradas.
      Usa un tono formal y ejecutivo. No uses markdown de encabezados complejos, usa negritas para resaltar puntos clave.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInterpretation(response.text || "No se pudo generar el análisis.");
      setReportGenerated(true);
    } catch (error) {
      console.error("Error generating analysis:", error);
      setInterpretation("Error al conectar con el servicio de inteligencia artificial para el análisis. Por favor, revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8 print:p-0 print:bg-white">
      {/* Header - Not printed */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
            <BarChart3 className="text-blue-600" />
            Análisis Exploratorio de Perfiles
          </h1>
          <p className="text-gray-500 mt-1">Identificación de patrones, empresas y trayectorias profesionales</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateAIAnalysis}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {loading ? <span className="animate-spin text-lg">◌</span> : <FileText size={18} />}
            {reportGenerated ? "Actualizar Informe" : "Generar Informe IA"}
          </button>
          {reportGenerated && (
            <button 
              onClick={printReport}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm"
            >
              <Download size={18} />
              Exportar (Print/PDF)
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
        {/* Report Section - Styled to look like a Word doc */}
        <div id="printable-report" className="bg-white shadow-xl rounded-xl border border-gray-200 p-8 md:p-12 print:shadow-none print:border-none print:p-0">
          
          {/* Cover Header */}
          <div className="border-b-4 border-blue-800 pb-6 mb-10">
            <h2 className="text-4xl font-extrabold text-gray-900 uppercase tracking-tight">Informe de Mercado Laboral</h2>
            <div className="flex justify-between items-center mt-4">
              <span className="text-lg text-blue-800 font-bold italic">Análisis Exploratorio de Datos (EDA)</span>
              <span className="text-gray-500 font-medium">Fecha: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* 1. Description of Key Columns */}
          <section className="mb-12">
            <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-6 flex items-center gap-2">
              <Info size={20} className="text-blue-600" />
              1. Estructura del Dataset
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-3 text-left font-bold text-gray-700">Columna</th>
                    <th className="border p-3 text-left font-bold text-gray-700">Descripción del Atributo</th>
                  </tr>
                </thead>
                <tbody>
                  {COLUMN_DESCRIPTIONS.map((col, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="border p-3 font-semibold text-blue-900">{col.name}</td>
                      <td className="border p-3 text-gray-600 italic">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Top 10 Companies Table */}
          <section className="mb-12">
            <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-blue-600" />
              2. Ranking de Empresas (Top 10)
            </h3>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <p className="text-gray-600 mb-4 text-sm">
                  La siguiente tabla detalla las organizaciones con mayor representación en el conjunto de perfiles analizado.
                </p>
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="border-b p-3 text-left">Posición</th>
                      <th className="border-b p-3 text-left">Empresa</th>
                      <th className="border-b p-3 text-right">Nº de Perfiles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCompanies.map((c, idx) => (
                      <tr key={idx} className="border-b hover:bg-blue-50 transition-colors">
                        <td className="p-3 text-gray-500 font-mono">#{idx + 1}</td>
                        <td className="p-3 font-medium text-gray-900">{c.name}</td>
                        <td className="p-3 text-right font-bold text-blue-600">{c.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="h-80 w-full bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300">
                <p className="text-xs text-center text-gray-400 mb-2 uppercase tracking-widest font-bold">Distribución Visual de Empresas</p>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart layout="vertical" data={topCompanies} margin={{ left: 40, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{fontSize: 10, fill: '#666'}} 
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{fill: '#f3f4f6'}}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* 3. Job Title Analysis */}
          <section className="mb-12">
            <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              3. Análisis de Cargos y Funciones
            </h3>
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div className="space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  El análisis de títulos de puesto revela los roles más demandados o frecuentes en esta muestra. 
                  Destaca una concentración significativa en roles de <strong>Ingeniería</strong> y <strong>Gestión de Proyectos</strong>.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {topTitles.slice(0, 4).map((t, i) => (
                    <div key={i} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600 font-bold uppercase">{t.name}</p>
                      <p className="text-2xl font-black text-blue-900">{t.count}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topTitles}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {topTitles.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* 4. Geographic Distribution */}
          <section className="mb-12">
            <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              4. Concentración Geográfica
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {locationStats.map((loc, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
                  <MapPin size={12} className="text-gray-400" />
                  {loc.name}: {loc.value}
                </div>
              ))}
            </div>
          </section>

          {/* 5. AI Insights & Conclusions */}
          <section className="mt-16 bg-blue-900 text-white p-8 rounded-xl print:bg-white print:text-black print:p-0 print:border-t-2 print:border-gray-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500 rounded-lg print:hidden">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold">5. Interpretación de Resultados y Conclusiones</h3>
            </div>
            
            {!reportGenerated && !loading ? (
              <div className="text-center py-12 bg-blue-800/50 rounded-lg border border-blue-700 print:hidden">
                <p className="text-blue-100 mb-4">Usa la Inteligencia Artificial para generar una interpretación profesional de los datos.</p>
                <button 
                  onClick={generateAIAnalysis}
                  className="bg-white text-blue-900 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition-colors"
                >
                  Analizar con Gemini
                </button>
              </div>
            ) : loading ? (
              <div className="text-center py-12 print:hidden">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 bg-blue-400 rounded-full mb-4"></div>
                  <p className="text-blue-100">Analizando patrones profesionales...</p>
                </div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none print:prose-black">
                <div className="text-blue-50 space-y-4 text-lg leading-relaxed whitespace-pre-line print:text-gray-800">
                  {interpretation}
                </div>
              </div>
            )}
          </section>

          {/* Footer for Report */}
          <div className="mt-20 pt-8 border-t border-gray-200 text-center text-gray-400 text-sm italic">
            Este informe ha sido generado automáticamente para fines de análisis exploratorio. 
            Procesado por el motor de análisis profesional v1.0.
          </div>
        </div>

        {/* Data Preview - Not printed */}
        <section className="bg-white rounded-xl shadow-md p-6 border border-gray-200 print:hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileSpreadsheet className="text-green-600" />
              Dataset: Vista de Perfiles
            </h3>
            <span className="text-sm text-gray-500">{data.length} registros cargados</span>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-gray-50 shadow-sm">
                <tr>
                  <th className="p-3 text-left font-bold text-gray-600 border-b">Nombre</th>
                  <th className="p-3 text-left font-bold text-gray-600 border-b">Empresa</th>
                  <th className="p-3 text-left font-bold text-gray-600 border-b">Cargo</th>
                  <th className="p-3 text-left font-bold text-gray-600 border-b">Ubicación</th>
                  <th className="p-3 text-center font-bold text-gray-600 border-b">Exp (Años)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 border-b last:border-0">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-gray-600">{p.company}</td>
                    <td className="p-3 text-gray-600">{p.jobTitle}</td>
                    <td className="p-3 text-gray-500">{p.location}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.experience > 8 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {p.experience}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* CSS for printing */}
      <style>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          header, button, footer {
            display: none !important;
          }
          #printable-report {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
          }
          .recharts-responsive-container {
            width: 100% !important;
            height: 300px !important;
          }
        }
      `}</style>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
