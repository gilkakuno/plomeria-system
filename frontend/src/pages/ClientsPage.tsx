import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Edit2, Trash2, X, Phone, Mail, MapPin, User, FolderKanban } from 'lucide-react'
import toast from 'react-hot-toast'
import { clientsAPI } from '../services/api'
import { Link } from 'react-router-dom'

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="modal-box">
        <div className="modal-header"><h3>{title}</h3><button onClick={onClose} className="topbar-btn"><X size={16}/></button></div>
        {children}
      </div>
    </div>
  )
}

const AV_COLORS = ['avatar-blue','avatar-green','avatar-purple','avatar-orange']

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'table'|'cards'>('table')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = async () => {
    setLoading(true)
    try { const r = await clientsAPI.getAll(search||undefined); setClients(r.data) }
    catch { toast.error('Error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [search])

  const open = (c?: any) => { setEditing(c||null); reset(c||{}); setShowModal(true) }
  const close = () => { setShowModal(false); setEditing(null) }

  const onSubmit = async (data: any) => {
    try {
      editing ? await clientsAPI.update(editing.id,data) : await clientsAPI.create(data)
      toast.success(editing?'Cliente actualizado':'Cliente registrado')
      close(); load()
    } catch(e:any){ toast.error(e.response?.data?.message||'Error') }
  }

  const del = async (id:string,name:string) => {
    if(!confirm(`¿Eliminar cliente "${name}"?`)) return
    try { await clientsAPI.delete(id); toast.success('Cliente eliminado'); load() }
    catch { toast.error('Error') }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div>
            <h1>Clientes</h1>
            <p>{clients.length} clientes registrados</p>
          </div>
          <button className="btn btn-primary" onClick={()=>open()}><Plus size={15}/>Nuevo Cliente</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card" style={{padding:'12px 16px',marginBottom:20,display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div className="search-bar" style={{flex:1,minWidth:200}}>
          <Search size={15}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} className="form-input" placeholder="Buscar cliente por nombre..."/>
        </div>
        <div className="tabs">
          <button className={`tab ${view==='table'?'active':''}`} onClick={()=>setView('table')}>Tabla</button>
          <button className={`tab ${view==='cards'?'active':''}`} onClick={()=>setView('cards')}>Tarjetas</button>
        </div>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead><tr>
                <th>Cliente</th><th>CI</th><th>Teléfono</th><th>Email</th>
                <th>Ciudad</th><th>Proyectos</th><th style={{textAlign:'center'}}>Acciones</th>
              </tr></thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={7} style={{textAlign:'center',padding:48}}><div className="spinner spinner-dark" style={{width:24,height:24,margin:'0 auto'}}/></td></tr>
                  : clients.length===0
                  ? <tr><td colSpan={7} style={{textAlign:'center',padding:48,color:'var(--text-muted)'}}>No hay clientes registrados</td></tr>
                  : clients.map((c,i)=>(
                    <tr key={c.id}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div className={`avatar ${AV_COLORS[i%4]}`}>{c.fullName[0]}</div>
                          <div>
                            <div style={{fontWeight:600,fontSize:13}}>{c.fullName}</div>
                            {c.address&&<div style={{fontSize:11,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:3}}><MapPin size={10}/>{c.address}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{fontFamily:'Roboto Mono',fontSize:12,color:'var(--text-muted)'}}>{c.ci||'—'}</td>
                      <td>
                        {c.phone
                          ? <a href={`tel:${c.phone}`} style={{color:'var(--accent)',textDecoration:'none',fontSize:13,display:'flex',alignItems:'center',gap:4}}><Phone size={12}/>{c.phone}</a>
                          : <span style={{color:'var(--text-muted)',fontSize:12}}>—</span>}
                      </td>
                      <td style={{fontSize:12,color:'var(--text-muted)'}}>{c.email||'—'}</td>
                      <td style={{fontSize:12}}>{c.city||'—'}</td>
                      <td>
                        {c.projects?.length>0
                          ? <span className="badge badge-purple"><FolderKanban size={10}/>{c.projects.length}</span>
                          : <span className="badge badge-gray">0</span>}
                      </td>
                      <td>
                        <div style={{display:'flex',gap:6,justifyContent:'center'}}>
                          <button className="action-btn action-btn-edit" onClick={()=>open(c)}><Edit2 size={13}/></button>
                          <button className="action-btn action-btn-del" onClick={()=>del(c.id,c.fullName)}><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards view */}
      {view === 'cards' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
          {clients.map((c,i)=>(
            <div key={c.id} className="card" style={{cursor:'default',transition:'box-shadow 0.15s'}}
              onMouseEnter={e=>(e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)')}
              onMouseLeave={e=>(e.currentTarget.style.boxShadow='')}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
                <div className={`avatar ${AV_COLORS[i%4]}`} style={{width:44,height:44,fontSize:16}}>{c.fullName[0]}</div>
                <div style={{display:'flex',gap:4}}>
                  <button className="action-btn action-btn-edit" onClick={()=>open(c)}><Edit2 size={12}/></button>
                  <button className="action-btn action-btn-del" onClick={()=>del(c.id,c.fullName)}><Trash2 size={12}/></button>
                </div>
              </div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:2}}>{c.fullName}</div>
              {c.ci&&<div style={{fontSize:11,color:'var(--text-muted)',marginBottom:10}}>CI: {c.ci}</div>}
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {c.phone&&<div style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:'var(--text-muted)'}}><Phone size={12} style={{color:'var(--accent)'}}/>{c.phone}</div>}
                {c.email&&<div style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:'var(--text-muted)'}}><Mail size={12} style={{color:'var(--accent)'}}/>{c.email}</div>}
                {c.address&&<div style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:'var(--text-muted)'}}><MapPin size={12} style={{color:'var(--accent)'}}/>{c.address}</div>}
              </div>
              {c.projects?.length>0&&(
                <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid var(--border)'}}>
                  <span className="badge badge-purple"><FolderKanban size={10}/>{c.projects.length} proyecto(s)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={close} title={editing?'Editar Cliente':'Nuevo Cliente'}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div style={{gridColumn:'1/-1'}}>
              <label className="form-label">Nombre completo *</label>
              <input {...register('fullName',{required:'Requerido'})} className="form-input" placeholder="Juan Pérez"/>
              {errors.fullName&&<div className="form-error">{String(errors.fullName.message)}</div>}
            </div>
            <div><label className="form-label">CI / NIT</label><input {...register('ci')} className="form-input" placeholder="12345678"/></div>
            <div><label className="form-label">Teléfono</label><input {...register('phone')} className="form-input" placeholder="7XXXXXXX"/></div>
            <div style={{gridColumn:'1/-1'}}><label className="form-label">Email</label><input {...register('email')} type="email" className="form-input" placeholder="correo@ejemplo.com"/></div>
            <div style={{gridColumn:'1/-1'}}><label className="form-label">Dirección</label><input {...register('address')} className="form-input" placeholder="Calle, Zona"/></div>
            <div><label className="form-label">Ciudad</label><input {...register('city')} className="form-input" placeholder="La Paz"/></div>
            <div style={{gridColumn:'1/-1'}}><label className="form-label">Notas</label><textarea {...register('notes')} className="form-input" rows={2}/></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={close} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing?'Actualizar':'Registrar Cliente'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
