import { useEffect, useState } from 'react'
import { ScrollText, RefreshCw, LogIn, LogOut, AlertTriangle, Activity } from 'lucide-react'
import { logsAPI } from '../services/api'
import toast from 'react-hot-toast'

const EVENT_CONFIG: Record<string,{label:string,badge:string,icon:any}> = {
  LOGIN:             {label:'Ingreso',      badge:'badge-green',  icon:LogIn},
  LOGOUT:            {label:'Salida',       badge:'badge-gray',   icon:LogOut},
  LOGIN_FALLIDO:     {label:'Intento fallido',badge:'badge-red',  icon:AlertTriangle},
  CREAR_PRESUPUESTO: {label:'Nuevo presupuesto',badge:'badge-blue',icon:Activity},
}

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true)
    try { const r = await logsAPI.getAll(page,50); setLogs(r.data.data); setTotal(r.data.total) }
    catch { toast.error('Error al cargar logs') }
    setLoading(false)
  }

  useEffect(()=>{ load() },[page])

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div>
            <h1>Log de Acceso</h1>
            <p>{total} registros de actividad del sistema</p>
          </div>
          <button className="btn btn-secondary" onClick={load}>
            <RefreshCw size={14}/> Actualizar
          </button>
        </div>
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table className="data-table">
            <thead><tr>
              <th>Fecha y Hora</th><th>Usuario</th><th>Evento</th>
              <th>IP</th><th>Navegador</th><th>Detalle</th>
            </tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} style={{textAlign:'center',padding:48}}><div className="spinner spinner-dark" style={{width:24,height:24,margin:'0 auto'}}/></td></tr>
                : logs.length===0
                ? <tr><td colSpan={6} style={{textAlign:'center',padding:48,color:'var(--text-muted)'}}>
                    <ScrollText size={36} style={{margin:'0 auto 8px',display:'block',opacity:0.3}}/>Sin registros
                  </td></tr>
                : logs.map(log=>{
                  const cfg = EVENT_CONFIG[log.event]||{label:log.event,badge:'badge-gray',icon:Activity}
                  const Icon = cfg.icon
                  return (
                    <tr key={log.id}>
                      <td style={{fontFamily:'Roboto Mono',fontSize:11,whiteSpace:'nowrap',color:'var(--text-muted)'}}>
                        {new Date(log.createdAt).toLocaleString('es-BO')}
                      </td>
                      <td>
                        {log.user
                          ? <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div className="avatar avatar-blue" style={{width:26,height:26,fontSize:11}}>{log.user.username?.[0]?.toUpperCase()}</div>
                              <div>
                                <div style={{fontWeight:600,fontSize:12}}>{log.user.username}</div>
                                <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'capitalize'}}>{log.user.role}</div>
                              </div>
                            </div>
                          : <span style={{color:'var(--text-muted)',fontSize:12}}>Sistema</span>
                        }
                      </td>
                      <td>
                        <span className={`badge ${cfg.badge}`}>
                          <Icon size={10}/> {cfg.label}
                        </span>
                      </td>
                      <td style={{fontFamily:'Roboto Mono',fontSize:11,color:'var(--text-muted)'}}>{log.ip||'—'}</td>
                      <td style={{fontSize:11,color:'var(--text-muted)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={log.browser||''}>{log.browser?.split(' ')[0]||'—'}</td>
                      <td style={{fontSize:12,color:'var(--text-muted)'}}>{log.details||'—'}</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 50 && (
          <div style={{padding:'12px 18px',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:12,color:'var(--text-muted)'}}>Mostrando {Math.min(page*50,total)} de {total}</span>
            <div style={{display:'flex',gap:6}}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn btn-secondary btn-sm">← Anterior</button>
              <span style={{display:'flex',alignItems:'center',padding:'0 12px',fontSize:13,fontWeight:600}}>Pág. {page}</span>
              <button onClick={()=>setPage(p=>p+1)} disabled={page*50>=total} className="btn btn-secondary btn-sm">Siguiente →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
