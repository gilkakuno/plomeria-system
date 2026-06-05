import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Search, Edit2, Trash2, X, Eye, FileText, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { projectsAPI, clientsAPI, inventoryAPI } from '../services/api'
import { Link, useLocation } from 'react-router-dom'

const STATUS_LABELS: Record<string,string> = {presupuesto:'Presupuesto',aprobado:'Aprobado',en_proceso:'En Proceso',completado:'Completado',cancelado:'Cancelado'}
const STATUS_BADGE: Record<string,string>  = {presupuesto:'badge-yellow',aprobado:'badge-blue',en_proceso:'badge-purple',completado:'badge-green',cancelado:'badge-red'}
const STATUSES = Object.keys(STATUS_LABELS)

function Modal({ open, onClose, title, children, wide=false }: any) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="modal-box" style={{maxWidth: wide?780:560}}>
        <div className="modal-header"><h3>{title}</h3><button onClick={onClose} className="topbar-btn"><X size={16}/></button></div>
        {children}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const location = useLocation()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  interface ProjectFormInputs {
    title: string;
    clientId: string;
    status: string;
    address: string;
    laborCost: number;
    startDate: string;
    description: string;
    materials: Array<{
      materialId: string;
      quantity: number;
      unitPrice: number;
    }>;
  }

  const { register, handleSubmit, reset, control, watch, setValue, formState: {errors} } = useForm<ProjectFormInputs>({ defaultValues: { title: '', clientId: '', status: 'presupuesto', address: '', laborCost: 0, startDate: '', description: '', materials: [] } })
  const { fields, append, remove } = useFieldArray({ control, name: 'materials' })
  const matFields = watch('materials')

  const load = async () => {
    setLoading(true)
    try {
      const [pr, cl, inv] = await Promise.all([
        projectsAPI.getAll(statusFilter||undefined),
        clientsAPI.getAll(),
        inventoryAPI.getAll(),
      ])
      setProjects(pr.data.filter((p:any) => !search || p.title.toLowerCase().includes(search.toLowerCase())))
      setClients(cl.data)
      setMaterials(inv.data)
    } catch { toast.error('Error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter, search])

  useEffect(() => {
    if (location.state?.suggestedMaterials && materials.length > 0) {
      const suggested = location.state.suggestedMaterials as any[]
      const matched = suggested.map(s => {
        const match = materials.find(m => 
          m.name.toLowerCase().includes(s.nombre.toLowerCase()) || 
          s.nombre.toLowerCase().includes(m.name.toLowerCase())
        )
        if (match) {
          return {
            materialId: match.id,
            quantity: s.quantity || s.cantidad || 1,
            unitPrice: match.salePrice
          }
        }
        return null
      }).filter(Boolean) as any[]

      if (matched.length > 0) {
        setEditing(null)
        reset({
          title: 'Proyecto Sugerido por IA',
          clientId: '',
          status: 'presupuesto',
          address: '',
          laborCost: 0,
          startDate: new Date().toISOString().split('T')[0],
          description: 'Presupuesto autogenerado por el Asistente IA.',
          materials: matched
        })
        setShowModal(true)
      } else {
        toast.error('No se encontraron materiales del presupuesto IA en el inventario')
      }

      window.history.replaceState({}, document.title)
    }
  }, [location.state, materials, reset])

  const open = (p?: any) => {
    setEditing(p||null)
    reset(p ? {
      ...p,
      materials: p.materials?.map((pm:any) => ({ materialId: pm.materialId, quantity: pm.quantity, unitPrice: pm.unitPrice })) || [],
    } : { materials: [] })
    setShowModal(true)
  }
  const close = () => { setShowModal(false); setEditing(null) }

  const calcTotal = () => {
    const mats = matFields as any[]
    return mats.reduce((sum: number, m: any) => sum + (+(m.quantity||0) * +(m.unitPrice||0)), 0)
  }

  const onSubmit = async (data: any) => {
    try {
      const { id, createdAt, updatedAt, deletedAt, client, totalMaterials, totalAmount, ...payload } = data;
      // Remove any empty material entries and nested client object
      if (payload.materials) payload.materials = payload.materials.filter((m: any) => m.materialId);
      // Delete nested client if present (backend expects only clientId)
      if ((payload as any).client) delete (payload as any).client;
      // Remove any undefined/null fields to avoid overwriting existing values
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null),
      );
      // Preserve existing clientId when not provided (avoid setting undefined)
      if (!cleanPayload.clientId && editing) {
        cleanPayload.clientId = editing.client?.id || editing.clientId;
      }
      editing ? await projectsAPI.update(editing.id, cleanPayload) : await projectsAPI.create(cleanPayload);
      toast.success(editing ? 'Proyecto actualizado' : 'Proyecto creado');
      close(); load();
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar proyecto');
    }
  };

  const del = async (id:string,title:string) => {
    if(!confirm(`¿Eliminar proyecto "${title}"?`)) return
    try { await projectsAPI.delete(id); toast.success('Eliminado'); load() }
    catch { toast.error('Error') }
  }

  const handleMaterialSelect = (idx: number, matId: string) => {
    const mat = materials.find(m=>m.id===matId)
    if (mat) setValue(`materials.${idx}.unitPrice`, mat.salePrice)
  }

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div>
            <h1>Proyectos & Presupuestos</h1>
            <p>{projects.length} proyectos · Gestión completa de contratos</p>
          </div>
          <button className="btn btn-primary" onClick={()=>open()}><Plus size={15}/>Nuevo Proyecto</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{padding:'12px 16px',marginBottom:20,display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div className="search-bar" style={{flex:1,minWidth:200}}>
          <Search size={15}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} className="form-input" placeholder="Buscar proyecto..."/>
        </div>
        <div className="tabs">
          <button className={`tab ${statusFilter===''?'active':''}`} onClick={()=>setStatusFilter('')}>Todos</button>
          {STATUSES.map(s=>(
            <button key={s} className={`tab ${statusFilter===s?'active':''}`} onClick={()=>setStatusFilter(s)}>{STATUS_LABELS[s]}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table className="data-table">
            <thead><tr>
              <th>Proyecto</th><th>Cliente</th><th>Estado</th>
              <th style={{textAlign:'right'}}>Materiales</th><th style={{textAlign:'right'}}>M. Obra</th>
              <th style={{textAlign:'right'}}>Total</th><th>Fecha</th><th style={{textAlign:'center'}}>Acciones</th>
            </tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan={8} style={{textAlign:'center',padding:48}}><div className="spinner spinner-dark" style={{width:24,height:24,margin:'0 auto'}}/></td></tr>
                : projects.length===0
                ? <tr><td colSpan={8} style={{textAlign:'center',padding:48,color:'var(--text-muted)'}}>No hay proyectos registrados</td></tr>
                : projects.map(p=>(
                  <tr key={p.id}>
                    <td>
                      <div style={{fontWeight:600,fontSize:13}}>{p.title}</div>
                      {p.address&&<div style={{fontSize:11,color:'var(--text-muted)'}}>{p.address}</div>}
                    </td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="avatar avatar-blue" style={{width:28,height:28,fontSize:11}}>{p.client?.fullName?.[0]}</div>
                        <span style={{fontSize:13}}>{p.client?.fullName}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[p.status]||'badge-gray'}`}>{STATUS_LABELS[p.status]||p.status}</span></td>
                    <td style={{textAlign:'right',fontFamily:'Roboto Mono',fontSize:12,color:'var(--text-muted)'}}>Bs.{Number(p.totalMaterials).toFixed(2)}</td>
                    <td style={{textAlign:'right',fontFamily:'Roboto Mono',fontSize:12,color:'var(--text-muted)'}}>Bs.{Number(p.laborCost).toFixed(2)}</td>
                    <td style={{textAlign:'right',fontFamily:'Roboto Mono',fontSize:13,fontWeight:700,color:'var(--accent)'}}>Bs.{Number(p.totalAmount).toFixed(2)}</td>
                    <td style={{fontSize:11,color:'var(--text-muted)'}}>{new Date(p.createdAt).toLocaleDateString('es-BO')}</td>
                    <td>
                      <div style={{display:'flex',gap:5,justifyContent:'center'}}>
                        <Link to={`/projects/${p.id}`} className="action-btn" style={{background:'#f3eeff',color:'#7c3aed'}} title="Ver detalle"><Eye size={13}/></Link>
                        <button className="action-btn action-btn-edit" onClick={()=>open(p)} title="Editar"><Edit2 size={13}/></button>
                        <button className="action-btn action-btn-del" onClick={()=>del(p.id,p.title)} title="Eliminar"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={close} title={editing?'Editar Proyecto':'Nuevo Proyecto'} wide>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
              <div style={{gridColumn:'1/-1'}}>
                <label className="form-label">Título del proyecto *</label>
                <input {...register('title',{required:'Requerido'})} className="form-input" placeholder="Instalación de tuberías..."/>
                {errors.title&&<div className="form-error">{String(errors.title.message)}</div>}
              </div>
              <div>
                <label className="form-label">Cliente *</label>
                <select {...register('clientId',{required:'Requerido'})} className="form-input">
                  <option value="">Seleccionar cliente...</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
                {errors.clientId&&<div className="form-error">{String(errors.clientId.message)}</div>}
              </div>
              <div>
                <label className="form-label">Estado</label>
                <select {...register('status')} className="form-input">
                  {STATUSES.map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div style={{gridColumn:'1/-1'}}>
                <label className="form-label">Dirección del trabajo</label>
                <input {...register('address')} className="form-input" placeholder="Calle, zona, ciudad"/>
              </div>
              <div>
                <label className="form-label">Mano de obra (Bs.)</label>
                <input {...register('laborCost',{valueAsNumber:true})} type="number" step="0.01" min="0" className="form-input" defaultValue={0}/>
              </div>
              <div>
                <label className="form-label">Fecha inicio</label>
                <input {...register('startDate')} type="date" className="form-input"/>
              </div>
              <div style={{gridColumn:'1/-1'}}>
                <label className="form-label">Descripción del trabajo</label>
                <textarea {...register('description')} className="form-input" rows={2} placeholder="Descripción detallada..."/>
              </div>
            </div>

            {/* Materials */}
            <hr className="divider"/>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:13}}>Lista de Materiales</div>
              <button type="button" className="btn btn-secondary btn-sm"
                onClick={()=>append({materialId:'',quantity:1,unitPrice:0})}>
                <Plus size={13}/> Agregar
              </button>
            </div>
            {fields.length===0
              ? <div style={{textAlign:'center',padding:'20px',color:'var(--text-muted)',fontSize:13,background:'var(--page-bg)',borderRadius:8}}>No hay materiales agregados</div>
              : (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  <div style={{display:'grid',gridTemplateColumns:'2fr 80px 110px 40px',gap:8,paddingBottom:4}}>
                    <div style={{fontSize:11,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase'}}>Material</div>
                    <div style={{fontSize:11,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase'}}>Cant.</div>
                    <div style={{fontSize:11,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase'}}>P. Unit (Bs.)</div>
                    <div/>
                  </div>
                  {fields.map((f,i)=>(
                    <div key={f.id} style={{display:'grid',gridTemplateColumns:'2fr 80px 110px 40px',gap:8,alignItems:'center'}}>
                      <select {...register(`materials.${i}.materialId`)} className="form-input"
                        onChange={e=>handleMaterialSelect(i,e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {materials.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      <input {...register(`materials.${i}.quantity`,{valueAsNumber:true})} type="number" min="1" className="form-input"/>
                      <input {...register(`materials.${i}.unitPrice`,{valueAsNumber:true})} type="number" step="0.01" min="0" className="form-input"/>
                      <button type="button" onClick={()=>remove(i)} className="action-btn action-btn-del"><X size={12}/></button>
                    </div>
                  ))}
                  <div style={{textAlign:'right',fontWeight:700,fontSize:14,color:'var(--accent)',marginTop:8}}>
                    Subtotal materiales: Bs. {calcTotal().toFixed(2)}
                  </div>
                </div>
              )
            }
          </div>
          <div className="modal-footer">
            <button type="button" onClick={close} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing?'Actualizar':'Crear Proyecto'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
