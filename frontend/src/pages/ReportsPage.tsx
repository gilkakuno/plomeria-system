import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { FileBarChart2, TrendingUp, Package, Download } from 'lucide-react'
import { reportsAPI, inventoryAPI, projectsAPI } from '../services/api'
import toast from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function ReportsPage() {
  const [stats, setStats] = useState<any>({ projects: { byStatus:[], monthlyRevenue:[] } })
  const [topMats, setTopMats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([reportsAPI.getStatistics(), inventoryAPI.getTopUsed()])
      .then(([s,t]) => { setStats(s.data); setTopMats(t.data) })
      .finally(() => setLoading(false))
  }, [])

  const rev = [...(stats.projects?.monthlyRevenue||[])].reverse()

  const barData = {
    labels: rev.map((m:any)=>m.month),
    datasets: [
      { label: 'Mano de Obra (Bs.)', data: rev.map((m:any)=>+m.laborRevenue||0), backgroundColor: '#0057ff', borderRadius: 6 },
      { label: 'Materiales (Bs.)',   data: rev.map((m:any)=>+m.materialsRevenue||0), backgroundColor: '#7c3aed', borderRadius: 6 },
      { label: 'Total (Bs.)',        data: rev.map((m:any)=>+m.totalRevenue||0), backgroundColor: '#00a854', borderRadius: 6 },
    ],
  }

  const STATUS_LABELS: Record<string,string> = {presupuesto:'Presupuesto',aprobado:'Aprobado',en_proceso:'En Proceso',completado:'Completado',cancelado:'Cancelado'}
  const STATUS_COLORS: Record<string,string>  = {presupuesto:'#f59e0b',aprobado:'#0057ff',en_proceso:'#7c3aed',completado:'#00a854',cancelado:'#ef4444'}
  const donutData = {
    labels: stats.projects?.byStatus?.map((s:any)=>STATUS_LABELS[s.status]||s.status)||[],
    datasets: [{
      data: stats.projects?.byStatus?.map((s:any)=>+s.count)||[],
      backgroundColor: stats.projects?.byStatus?.map((s:any)=>STATUS_COLORS[s.status]||'#6b7280')||[],
      borderWidth: 3, borderColor: '#fff',
    }],
  }

  const topData = {
    labels: topMats.map((m:any)=>(m.m_name||m.name||'').substring(0,18)),
    datasets: [{ data: topMats.map((m:any)=>+m.totalUsed||0), backgroundColor: ['#0057ff','#3b82f6','#60a5fa','#93c5fd','#bfdbfe'], borderRadius: 5 }],
  }

  const opts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, grid:{ color:'#f1f3f6' }, ticks:{ font:{family:'Poppins',size:11} } }, x:{ grid:{ display:false }, ticks:{ font:{family:'Poppins',size:11} } } } }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300}}><div className="spinner spinner-dark" style={{width:32,height:32,borderWidth:3}}/></div>

  return (
    <div>
      <div className="page-header">
        <h1>Reportes & Estadísticas</h1>
        <p>Análisis visual del negocio — ingresos, materiales y proyectos</p>
      </div>

      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:24}}>
        {[
          { label:'Total Proyectos', value: stats.projects?.total||0, color:'#0057ff', icon: FileBarChart2 },
          { label:'Alertas Stock',   value: stats.lowStockAlerts||0,  color:'#ef4444', icon: Package },
          { label:'Completados',     value: stats.projects?.byStatus?.find((s:any)=>s.status==='completado')?.count||0, color:'#00a854', icon: TrendingUp },
        ].map(({label,value,color,icon:Icon})=>(
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{background:color+'18'}}><Icon size={20} style={{color}}/></div>
            <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginBottom:20}}>
        <div className="card">
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Ingresos por Mes</div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:18}}>Comparativa últimos 6 meses</div>
          <div style={{height:250}}>
            <Bar data={barData} options={{...opts, plugins:{...opts.plugins, legend:{display:true,position:'bottom' as const,labels:{font:{family:'Poppins',size:11},boxWidth:12,padding:14}}}}} />
          </div>
        </div>
        <div className="card">
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Estado de Proyectos</div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:18}}>Distribución general</div>
          <div style={{height:250,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {donutData.labels.length>0
              ? <Doughnut data={donutData} options={{maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{family:'Poppins',size:11},boxWidth:10,padding:12}}},cutout:'60%'}}/>
              : <p style={{color:'var(--text-muted)',fontSize:13}}>Sin datos</p>
            }
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div className="card">
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Top 5 Materiales Más Usados</div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:18}}>Cantidad total en proyectos</div>
          <div style={{height:220}}>
            {topMats.length>0
              ? <Bar data={topData} options={{...opts,indexAxis:'y' as const}}/>
              : <div style={{textAlign:'center',color:'var(--text-muted)',paddingTop:60}}>Sin datos de uso</div>
            }
          </div>
        </div>

        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontWeight:700,fontSize:14}}>Proyectos por Estado</div>
          </div>
          <table className="data-table">
            <thead><tr><th>Estado</th><th style={{textAlign:'right'}}>Cantidad</th><th style={{textAlign:'right'}}>%</th></tr></thead>
            <tbody>
              {stats.projects?.byStatus?.map((s:any)=>{
                const pct = stats.projects?.total>0 ? ((+s.count/stats.projects.total)*100).toFixed(1) : '0'
                const colors: Record<string,string> = {presupuesto:'badge-yellow',aprobado:'badge-blue',en_proceso:'badge-purple',completado:'badge-green',cancelado:'badge-red'}
                return (
                  <tr key={s.status}>
                    <td><span className={`badge ${colors[s.status]||'badge-gray'}`}>{STATUS_LABELS[s.status]||s.status}</span></td>
                    <td style={{textAlign:'right',fontWeight:700,fontFamily:'Roboto Mono'}}>{s.count}</td>
                    <td style={{textAlign:'right',color:'var(--text-muted)',fontSize:12}}>{pct}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
