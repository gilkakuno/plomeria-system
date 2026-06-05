import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Package, Users, FolderKanban, AlertTriangle, TrendingUp, CheckCircle, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'
import { projectsAPI, inventoryAPI, clientsAPI } from '../services/api'
import { Link } from 'react-router-dom'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

const STATUS_LABELS: Record<string, string> = { presupuesto:'Presupuesto', aprobado:'Aprobado', en_proceso:'En Proceso', completado:'Completado', cancelado:'Cancelado' }
const STATUS_COLORS: Record<string, string> = { presupuesto:'#f59e0b', aprobado:'#0057ff', en_proceso:'#7c3aed', completado:'#00a854', cancelado:'#ef4444' }
const STATUS_BADGE: Record<string, string> = { presupuesto:'badge-yellow', aprobado:'badge-blue', en_proceso:'badge-purple', completado:'badge-green', cancelado:'badge-red' }

function StatCard({ icon: Icon, label, value, color, trend, sub }: any) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '18' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className="stat-trend" style={{ color: trend >= 0 ? '#00a854' : '#ef4444' }}>
          {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [projectStats, setProjectStats] = useState<any>({ byStatus: [], monthlyRevenue: [], total: 0 })
  const [counts, setCounts] = useState({ materials: 0, clients: 0 })
  const [topMaterials, setTopMaterials] = useState<any[]>([])
  const [lowStock, setLowStock] = useState<any[]>([])
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      projectsAPI.getStats(),
      inventoryAPI.getAll(),
      clientsAPI.getAll(),
      inventoryAPI.getLowStock(),
      inventoryAPI.getTopUsed(),
      projectsAPI.getAll(),
    ]).then(([ps, inv, cli, low, top, projs]) => {
      setProjectStats(ps.data)
      setCounts({ materials: inv.data.length, clients: cli.data.length })
      setLowStock(low.data)
      setTopMaterials(top.data.slice(0, 5))
      setRecentProjects(projs.data.slice(0, 6))
    }).finally(() => setLoading(false))
  }, [])

  const donutData = {
    labels: projectStats.byStatus.map((s: any) => STATUS_LABELS[s.status] || s.status),
    datasets: [{ data: projectStats.byStatus.map((s: any) => +s.count), backgroundColor: projectStats.byStatus.map((s: any) => STATUS_COLORS[s.status] || '#6b7280'), borderWidth: 3, borderColor: '#fff' }],
  }

  const rev = [...(projectStats.monthlyRevenue || [])].reverse()
  const barData = {
    labels: rev.map((m: any) => m.month),
    datasets: [
      { label: 'Mano de Obra', data: rev.map((m: any) => +m.laborRevenue || 0), backgroundColor: '#0057ff', borderRadius: 5 },
      { label: 'Materiales',   data: rev.map((m: any) => +m.materialsRevenue || 0), backgroundColor: '#7c3aed', borderRadius: 5 },
    ],
  }

  const topBarData = {
    labels: topMaterials.map((m: any) => (m.m_name || m.name || '').substring(0, 16)),
    datasets: [{ data: topMaterials.map((m: any) => +m.totalUsed || 0), backgroundColor: ['#0057ff','#3b82f6','#60a5fa','#93c5fd','#bfdbfe'], borderRadius: 5 }],
  }

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f3f6' }, ticks: { font: { family: 'Poppins', size: 11 } } }, x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 11 } } } } }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner spinner-dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Resumen general del sistema — {new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={Package}       label="Materiales"    value={counts.materials}      color="#0057ff"  sub="En inventario" />
        <StatCard icon={Users}         label="Clientes"      value={counts.clients}         color="#00a854"  sub="Registrados" />
        <StatCard icon={FolderKanban}  label="Proyectos"     value={projectStats.total}     color="#7c3aed"  sub="Total" />
        <StatCard icon={AlertTriangle} label="Stock Bajo"    value={lowStock.length}        color="#ef4444"  sub="Requieren reposición" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Ingresos Mensuales</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Comparativa mano de obra vs materiales</div>
            </div>
            <TrendingUp size={18} style={{ color: '#0057ff' }} />
          </div>
          <div style={{ height: 220 }}>
            <Bar data={barData} options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: true, position: 'bottom' as const, labels: { font: { family: 'Poppins', size: 11 }, boxWidth: 12, padding: 16 } } } }} />
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Estado de Proyectos</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Distribución actual</div>
          <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {donutData.labels.length > 0
              ? <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Poppins', size: 11 }, boxWidth: 10, padding: 12 } } }, cutout: '65%' }} />
              : <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Sin proyectos aún</div>
            }
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent projects */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Proyectos Recientes</div>
            <Link to="/projects" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</Link>
          </div>
          <table className="data-table">
            <thead><tr>
              <th>Proyecto</th><th>Cliente</th><th>Estado</th><th>Total</th>
            </tr></thead>
            <tbody>
              {recentProjects.length === 0
                ? <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Sin proyectos</td></tr>
                : recentProjects.map((p: any) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Clock size={10} /> {new Date(p.createdAt).toLocaleDateString('es-BO')}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.client?.fullName}</td>
                    <td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`}>{STATUS_LABELS[p.status] || p.status}</span></td>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>Bs. {Number(p.totalAmount).toFixed(0)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Top materials + Low stock */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Top 5 Materiales Usados</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Por cantidad en proyectos</div>
            {topMaterials.length > 0
              ? <div style={{ height: 140 }}><Bar data={topBarData} options={{ ...chartOpts, indexAxis: 'y' as const }} /></div>
              : <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>Sin datos aún</div>
            }
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={15} style={{ color: '#ef4444' }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Alertas de Stock</span>
              {lowStock.length > 0 && <span className="badge badge-red" style={{ marginLeft: 'auto' }}>{lowStock.length}</span>}
            </div>
            {lowStock.length === 0
              ? <div style={{ padding: '24px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={18} style={{ color: '#00a854' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Todo el inventario en orden</span>
                </div>
              : <div style={{ maxHeight: 160, overflowY: 'auto' }}>
                  {lowStock.slice(0,5).map((m: any) => (
                    <div key={m.id} style={{ padding: '10px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.category}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{m.stock}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Mín: {m.minStock}</div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
