import { useState } from 'react'
import { Bot, Send, Zap, Package, Clock, AlertCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { aiAgentAPI } from '../services/api'

export default function AiAgentPage() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const EXAMPLES = [
    'Instalar 3 duchas y un lavaplatos en el 2do piso',
    'Reparar tubería de agua fría de 10 metros en cocina',
    'Instalar un baño completo con ducha y lavamanos',
    'Cambiar 5 llaves de paso y reparar fuga en baño',
  ]

  const analyze = async () => {
    if (!input.trim()) { toast.error('Describe el trabajo primero'); return }
    setLoading(true)
    try {
      const r = await aiAgentAPI.analyze(input)
      setResult(r.data)
    } catch(e:any) { toast.error(e.response?.data?.message||'Error al analizar') }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Asistente Inteligente IA</h1>
        <p>Describe el trabajo de plomería y el agente sugerirá los materiales necesarios</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'start'}}>
        {/* Input panel */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card">
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <div style={{width:38,height:38,background:'linear-gradient(135deg,#0057ff,#7c3aed)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Bot size={18} color="#fff"/>
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>Agente de Presupuestos</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>Powered by IA</div>
              </div>
              <div style={{marginLeft:'auto'}} className="badge badge-green"><Sparkles size={10}/> Activo</div>
            </div>

            <label className="form-label">Describe el trabajo de plomería</label>
            <textarea
              value={input}
              onChange={e=>setInput(e.target.value)}
              className="form-input"
              rows={5}
              placeholder="Ej: Necesito instalar 3 duchas y un lavaplatos en el segundo piso de la vivienda. La tubería debe ir empotrada en la pared..."
              style={{resize:'vertical',fontFamily:'Poppins'}}
            />
            <div style={{display:'flex',gap:10,marginTop:12}}>
              <button onClick={analyze} disabled={loading} className="btn btn-primary" style={{flex:1,justifyContent:'center'}}>
                {loading
                  ? <><div className="spinner" style={{width:14,height:14}}/> Analizando...</>
                  : <><Zap size={15}/> Analizar con IA</>
                }
              </button>
              <button onClick={()=>{setInput('');setResult(null)}} className="btn btn-secondary">Limpiar</button>
            </div>
          </div>

          {/* Examples */}
          <div className="card">
            <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Ejemplos de consultas</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {EXAMPLES.map((ex,i)=>(
                <button key={i} onClick={()=>setInput(ex)}
                  style={{textAlign:'left',padding:'10px 14px',background:'var(--page-bg)',border:'1px solid var(--border)',borderRadius:8,cursor:'pointer',fontSize:13,color:'var(--text-main)',fontFamily:'Poppins',transition:'all 0.15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.background='var(--accent-light)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--page-bg)'}}>
                  <Send size={11} style={{color:'var(--accent)',marginRight:8,verticalAlign:'middle'}}/>{ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result panel */}
        <div>
          {!result && !loading && (
            <div className="card" style={{textAlign:'center',padding:60}}>
              <Bot size={48} style={{color:'#d1d9e6',margin:'0 auto 16px'}}/>
              <div style={{fontWeight:600,fontSize:14,color:'var(--text-muted)',marginBottom:8}}>
                El agente está listo
              </div>
              <div style={{fontSize:13,color:'#b0bac5'}}>
                Escribe la descripción del trabajo y el agente sugerirá automáticamente los materiales necesarios
              </div>
            </div>
          )}

          {loading && (
            <div className="card" style={{textAlign:'center',padding:60}}>
              <div style={{width:48,height:48,background:'linear-gradient(135deg,#0057ff,#7c3aed)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',animation:'pulse 1.5s infinite'}}>
                <Bot size={24} color="#fff"/>
              </div>
              <div style={{fontWeight:600,color:'var(--text-muted)'}}>Analizando el trabajo...</div>
              <div style={{fontSize:12,color:'#b0bac5',marginTop:4}}>El agente está procesando tu solicitud</div>
            </div>
          )}

          {result && (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {/* Summary */}
              <div className="card" style={{background:'linear-gradient(135deg,#eef4ff,#f3eeff)',border:'1px solid #d0e1ff'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <Bot size={16} style={{color:'var(--accent)'}}/><span style={{fontWeight:700,fontSize:13}}>Análisis del Trabajo</span>
                </div>
                <p style={{fontSize:13,color:'#374151',lineHeight:1.6}}>{result.trabajoDescrito}</p>
                <div style={{display:'flex',gap:16,marginTop:12}}>
                  {result.tiempoEstimado&&(
                    <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--text-muted)'}}>
                      <Clock size={12}/>{result.tiempoEstimado}
                    </div>
                  )}
                </div>
              </div>

              {/* Materials list */}
              <div className="card" style={{padding:0,overflow:'hidden'}}>
                <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <Package size={15} style={{color:'var(--accent)'}}/><span style={{fontWeight:700,fontSize:13}}>Materiales Sugeridos</span>
                  </div>
                  <span className="badge badge-blue">{result.materialesSugeridos?.length} ítems</span>
                </div>
                <table className="data-table">
                  <thead><tr><th>Material</th><th style={{textAlign:'center'}}>Cantidad</th><th>Motivo</th></tr></thead>
                  <tbody>
                    {result.materialesSugeridos?.map((m:any,i:number)=>(
                      <tr key={i}>
                        <td style={{fontWeight:600,fontSize:13}}>{m.nombre}</td>
                        <td style={{textAlign:'center'}}>
                          <span className="badge badge-blue" style={{fontFamily:'Roboto Mono'}}>{m.cantidad}</span>
                        </td>
                        <td style={{fontSize:12,color:'var(--text-muted)'}}>{m.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {result.notasAdicionales&&(
                <div className="card" style={{background:'#fffbeb',border:'1px solid #fde68a'}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
                    <AlertCircle size={15} style={{color:'#d48806',flexShrink:0,marginTop:1}}/>
                    <div>
                      <div style={{fontWeight:700,fontSize:12,color:'#d48806',marginBottom:4}}>Notas del Plomero</div>
                      <p style={{fontSize:13,color:'#78350f',lineHeight:1.6}}>{result.notasAdicionales}</p>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={() => navigate('/projects', { state: { suggestedMaterials: result.materialesSugeridos } })} className="btn btn-primary" style={{justifyContent:'center'}}>
                <Package size={15}/> Usar estos materiales en nuevo proyecto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
