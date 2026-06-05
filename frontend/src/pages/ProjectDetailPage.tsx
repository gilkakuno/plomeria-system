import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Printer, Calendar, MapPin, User, Package, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { projectsAPI, reportsAPI } from '../services/api'

const STATUS_LABELS: Record<string,string> = {presupuesto:'Presupuesto',aprobado:'Aprobado',en_proceso:'En Proceso',completado:'Completado',cancelado:'Cancelado'}
const STATUS_BADGE: Record<string,string>  = {presupuesto:'badge-yellow',aprobado:'badge-blue',en_proceso:'badge-purple',completado:'badge-green',cancelado:'badge-red'}

export default function ProjectDetailPage() {
  const { id } = useParams<{id:string}>()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    projectsAPI.getOne(id!).then(r=>setProject(r.data)).catch(()=>toast.error('Error')).finally(()=>setLoading(false))
  }, [id])

  const downloadPDF = async () => {
    setPdfLoading(true)
    try {
      const r = await reportsAPI.getContract(id!)
      const url = URL.createObjectURL(new Blob([r.data],{type:'application/pdf'}))
      const a = document.createElement('a'); a.href=url; a.download=`contrato-${id}.pdf`; a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF descargado')
    } catch { toast.error('Error al generar PDF') }
    setPdfLoading(false)
  }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300}}><div className="spinner spinner-dark" style={{width:32,height:32,borderWidth:3}}/></div>
  if (!project) return <div className="page-header"><h1>Proyecto no encontrado</h1></div>

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <Link to="/projects" className="btn btn-secondary btn-sm"><ArrowLeft size={14}/> Volver</Link>
        <div style={{flex:1}}>
          <h1 style={{fontSize:20,fontWeight:700}}>{project.title}</h1>
          <p style={{fontSize:13,color:'var(--text-muted)'}}>Detalle del proyecto y materiales</p>
        </div>
        <button onClick={downloadPDF} disabled={pdfLoading} className="btn btn-primary">
          {pdfLoading ? <><div className="spinner" style={{width:14,height:14}}/> Generando...</> : <><FileText size={15}/> Descargar PDF</>}
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        {/* Client info */}
        <div className="card">
          <div style={{fontWeight:700,fontSize:13,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
            <User size={15} style={{color:'var(--accent)'}}/> Información del Cliente
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <Row label="Nombre" value={project.client?.fullName}/>
            <Row label="CI" value={project.client?.ci||'—'}/>
            <Row label="Teléfono" value={project.client?.phone||'—'}/>
            <Row label="Email" value={project.client?.email||'—'}/>
          </div>
        </div>

        {/* Project info */}
        <div className="card">
          <div style={{fontWeight:700,fontSize:13,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
            <Calendar size={15} style={{color:'var(--accent)'}}/> Datos del Proyecto
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <Row label="Estado" value={<span className={`badge ${STATUS_BADGE[project.status]||'badge-gray'}`}>{STATUS_LABELS[project.status]||project.status}</span>}/>
            <Row label="Dirección" value={project.address||'—'}/>
            <Row label="Inicio" value={project.startDate||'—'}/>
            <Row label="Fin est." value={project.endDate||'—'}/>
          </div>
        </div>
      </div>

      {/* Materials table */}
      <div className="card" style={{padding:0,overflow:'hidden',marginBottom:20}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8}}>
          <Package size={15} style={{color:'var(--accent)'}}/><span style={{fontWeight:700,fontSize:13}}>Lista de Materiales</span>
          <span className="badge badge-blue" style={{marginLeft:'auto'}}>{project.materials?.length||0} ítems</span>
        </div>
        <table className="data-table">
          <thead><tr>
            <th>Material</th><th>Unidad</th>
            <th style={{textAlign:'right'}}>Cantidad</th>
            <th style={{textAlign:'right'}}>P. Unitario</th>
            <th style={{textAlign:'right'}}>Subtotal</th>
          </tr></thead>
          <tbody>
            {project.materials?.length===0
              ? <tr><td colSpan={5} style={{textAlign:'center',padding:32,color:'var(--text-muted)'}}>Sin materiales</td></tr>
              : project.materials?.map((pm:any)=>(
                <tr key={pm.id}>
                  <td style={{fontWeight:500}}>{pm.material?.name}</td>
                  <td style={{color:'var(--text-muted)',fontSize:12}}>{pm.material?.unit||'—'}</td>
                  <td style={{textAlign:'right',fontFamily:'Roboto Mono',fontWeight:600}}>{pm.quantity}</td>
                  <td style={{textAlign:'right',fontFamily:'Roboto Mono',fontSize:12,color:'var(--text-muted)'}}>Bs.{Number(pm.unitPrice).toFixed(2)}</td>
                  <td style={{textAlign:'right',fontFamily:'Roboto Mono',fontWeight:600}}>Bs.{Number(pm.subtotal).toFixed(2)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="card" style={{maxWidth:380,marginLeft:'auto'}}>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
            <span style={{color:'var(--text-muted)'}}>Subtotal materiales</span>
            <span style={{fontFamily:'Roboto Mono',fontWeight:600}}>Bs. {Number(project.totalMaterials).toFixed(2)}</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
            <span style={{color:'var(--text-muted)'}}>Mano de obra</span>
            <span style={{fontFamily:'Roboto Mono',fontWeight:600}}>Bs. {Number(project.laborCost).toFixed(2)}</span>
          </div>
          <hr className="divider" style={{margin:'4px 0'}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:700}}>
            <span>TOTAL</span>
            <span style={{color:'var(--accent)',fontFamily:'Roboto Mono'}}>Bs. {Number(project.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({label,value}:{label:string,value:any}){
  return (
    <div style={{display:'flex',gap:8,alignItems:'center'}}>
      <span style={{fontSize:12,color:'var(--text-muted)',minWidth:90}}>{label}:</span>
      <span style={{fontSize:13,fontWeight:500}}>{value}</span>
    </div>
  )
}
