import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Edit2, Trash2, Package, X, AlertTriangle, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { inventoryAPI } from '../services/api'

const CATEGORIES = ['Tuberías','Conexiones','Válvulas','Herramientas','Accesorios','Químicos','Otros']
const UNITS = ['unidad','metro','rollo','caja','kg','litro']

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="topbar-btn"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = async () => {
    setLoading(true)
    try { const r = await inventoryAPI.getAll(search||undefined, catFilter||undefined); setItems(r.data) }
    catch { toast.error('Error al cargar') }
    setLoading(false)
  }

  useEffect(() => { load() }, [search, catFilter])

  const open = (m?: any) => { setEditing(m||null); reset(m||{}); setShowModal(true) }
  const close = () => { setShowModal(false); setEditing(null) }

  const onSubmit = async (data: any) => {
    try {
      const { id, createdAt, updatedAt, deletedAt, imageUrl, ...payload } = data;
      editing ? await inventoryAPI.update(editing.id, payload) : await inventoryAPI.create(payload)
      toast.success(editing ? 'Material actualizado' : 'Material creado')
      close(); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error') }
  }

  const del = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? (eliminación lógica)`)) return
    try { await inventoryAPI.delete(id); toast.success('Material eliminado'); load() }
    catch { toast.error('Error') }
  }

  const stockBadge = (m: any) => m.stock <= m.minStock
    ? <span className="badge badge-red"><AlertTriangle size={10} /> Bajo stock</span>
    : <span className="badge badge-green">Normal</span>

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1>Inventario de Materiales</h1>
            <p>{items.length} materiales registrados · {items.filter(m=>m.stock<=m.minStock).length} con stock bajo</p>
          </div>
          <button className="btn btn-primary" onClick={() => open()}>
            <Plus size={15} /> Nuevo Material
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} />
          <input value={search} onChange={e=>setSearch(e.target.value)} className="form-input" placeholder="Buscar por nombre..." />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: 160 }}>
            <option value="">Todas las categorías</option>
            {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="tabs">
          <button className={`tab ${catFilter===''?'active':''}`} onClick={()=>setCatFilter('')}>Todos</button>
          <button className={`tab ${catFilter==='Tuberías'?'active':''}`} onClick={()=>setCatFilter('Tuberías')}>Tuberías</button>
          <button className={`tab ${catFilter==='Conexiones'?'active':''}`} onClick={()=>setCatFilter('Conexiones')}>Conexiones</button>
        </div>
      </div>

      {/* Table card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th><th>Material</th><th>Categoría</th>
                <th>Unidad</th><th style={{textAlign:'right'}}>Stock</th>
                <th style={{textAlign:'right'}}>P. Compra</th><th style={{textAlign:'right'}}>P. Venta</th>
                <th>Estado</th><th style={{textAlign:'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{textAlign:'center',padding:48}}>
                  <div className="spinner spinner-dark" style={{width:24,height:24,margin:'0 auto'}} />
                </td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={9} style={{textAlign:'center',padding:48,color:'var(--text-muted)'}}>
                  <Package size={36} style={{margin:'0 auto 8px',display:'block',opacity:0.3}} />
                  No hay materiales registrados
                </td></tr>
              ) : items.map(m=>(
                <tr key={m.id}>
                  <td><span style={{fontFamily:'Roboto Mono',fontSize:12,color:'var(--text-muted)'}}>{m.code||'—'}</span></td>
                  <td>
                    <div style={{fontWeight:600,fontSize:13}}>{m.name}</div>
                    {m.description && <div style={{fontSize:11,color:'var(--text-muted)',maxWidth:200,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{m.description}</div>}
                  </td>
                  <td><span className="badge badge-blue">{m.category||'—'}</span></td>
                  <td style={{color:'var(--text-muted)',fontSize:12}}>{m.unit}</td>
                  <td style={{textAlign:'right'}}>
                    <span style={{fontWeight:700,color:m.stock<=m.minStock?'#ef4444':'var(--text-main)'}}>{m.stock}</span>
                    <span style={{fontSize:11,color:'var(--text-muted)',marginLeft:4}}>/{m.minStock}</span>
                  </td>
                  <td style={{textAlign:'right',fontFamily:'Roboto Mono',fontSize:13,color:'var(--text-muted)'}}>Bs.{Number(m.purchasePrice).toFixed(2)}</td>
                  <td style={{textAlign:'right',fontFamily:'Roboto Mono',fontSize:13,fontWeight:600}}>Bs.{Number(m.salePrice).toFixed(2)}</td>
                  <td>{stockBadge(m)}</td>
                  <td>
                    <div style={{display:'flex',gap:6,justifyContent:'center'}}>
                      <button className="action-btn action-btn-edit" onClick={()=>open(m)} title="Editar"><Edit2 size={13}/></button>
                      <button className="action-btn action-btn-del" onClick={()=>del(m.id,m.name)} title="Eliminar"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={close} title={editing?'Editar Material':'Nuevo Material'}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div style={{gridColumn:'1/-1'}}>
                <label className="form-label">Nombre *</label>
                <input {...register('name',{required:'Requerido'})} className="form-input" placeholder='Ej: Tubo PVC 1/2"'/>
                {errors.name&&<div className="form-error">{String(errors.name.message)}</div>}
              </div>
              <div>
                <label className="form-label">Código</label>
                <input {...register('code')} className="form-input" placeholder="PVC-001"/>
              </div>
              <div>
                <label className="form-label">Categoría</label>
                <select {...register('category')} className="form-input">
                  <option value="">Seleccionar...</option>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Unidad de medida</label>
                <select {...register('unit')} className="form-input">
                  {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Stock actual</label>
                <input {...register('stock',{valueAsNumber:true})} type="number" min="0" className="form-input" defaultValue={0}/>
              </div>
              <div>
                <label className="form-label">Stock mínimo (alerta)</label>
                <input {...register('minStock',{valueAsNumber:true})} type="number" min="0" className="form-input" defaultValue={5}/>
              </div>
              <div>
                <label className="form-label">Precio de compra (Bs.) *</label>
                <input {...register('purchasePrice',{required:'Requerido',valueAsNumber:true})} type="number" step="0.01" min="0" className="form-input"/>
                {errors.purchasePrice&&<div className="form-error">{String(errors.purchasePrice.message)}</div>}
              </div>
              <div>
                <label className="form-label">Precio de venta (Bs.) *</label>
                <input {...register('salePrice',{required:'Requerido',valueAsNumber:true})} type="number" step="0.01" min="0" className="form-input"/>
                {errors.salePrice&&<div className="form-error">{String(errors.salePrice.message)}</div>}
              </div>
              <div style={{gridColumn:'1/-1'}}>
                <label className="form-label">Descripción</label>
                <textarea {...register('description')} className="form-input" rows={2} placeholder="Descripción opcional..."/>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={close} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing?'Actualizar':'Crear Material'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
