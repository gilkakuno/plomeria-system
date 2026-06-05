import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Edit2, Trash2, X, Shield, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersAPI } from '../services/api'

function Modal({open,onClose,title,children}:any){
  if(!open) return null
  return <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal-box"><div className="modal-header"><h3>{title}</h3><button onClick={onClose} className="topbar-btn"><X size={16}/></button></div>{children}</div></div>
}

const STRENGTH_COLORS: Record<string,string> = { debil:'badge-red', intermedio:'badge-yellow', fuerte:'badge-green' }
const STRENGTH_LABELS: Record<string,string> = { debil:'Débil', intermedio:'Intermedio', fuerte:'Fuerte' }

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const { register, handleSubmit, reset, formState:{errors} } = useForm()

  const load = async () => { setLoading(true); try { const r=await usersAPI.getAll(); setUsers(r.data) } catch{} setLoading(false) }
  useEffect(()=>{load()},[])

  const open = (u?:any) => { setEditing(u||null); reset(u?{role:u.role,fullName:u.fullName}:{}); setShowModal(true) }
  const close = () => { setShowModal(false); setEditing(null) }

  const onSubmit = async (data:any) => {
    try {
      editing ? await usersAPI.update(editing.id,data) : await usersAPI.create(data)
      toast.success(editing?'Usuario actualizado':'Usuario creado')
      close(); load()
    } catch(e:any){ toast.error(e.response?.data?.message||'Error') }
  }

  const del = async (id:string,username:string) => {
    if(!confirm(`¿Eliminar usuario "${username}"?`)) return
    try { await usersAPI.delete(id); toast.success('Usuario eliminado'); load() } catch{ toast.error('Error') }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div><h1>Gestión de Usuarios</h1><p>{users.length} usuarios registrados</p></div>
          <button className="btn btn-primary" onClick={()=>open()}><Plus size={15}/>Nuevo Usuario</button>
        </div>
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <table className="data-table">
          <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>F. Contraseña</th><th>Último Acceso</th><th>Estado</th><th style={{textAlign:'center'}}>Acciones</th></tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={7} style={{textAlign:'center',padding:48}}><div className="spinner spinner-dark" style={{width:24,height:24,margin:'0 auto'}}/></td></tr>
              : users.map(u=>(
                <tr key={u.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div className="avatar avatar-blue">{u.username[0].toUpperCase()}</div>
                      <div>
                        <div style={{fontWeight:600,fontSize:13}}>{u.fullName||u.username}</div>
                        <div style={{fontSize:11,color:'var(--text-muted)'}}>@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{u.email}</td>
                  <td><span className={`badge ${u.role==='admin'?'badge-purple':'badge-blue'}`}><Shield size={10}/>{u.role}</span></td>
                  <td><span className={`badge ${STRENGTH_COLORS[u.passwordStrength]||'badge-gray'}`}>{STRENGTH_LABELS[u.passwordStrength]||u.passwordStrength}</span></td>
                  <td style={{fontSize:11,color:'var(--text-muted)'}}>{u.lastLogin?new Date(u.lastLogin).toLocaleString('es-BO'):'—'}</td>
                  <td><span className={`badge ${u.isActive?'badge-green':'badge-red'}`}>{u.isActive?'Activo':'Inactivo'}</span></td>
                  <td><div style={{display:'flex',gap:5,justifyContent:'center'}}>
                    <button className="action-btn action-btn-edit" onClick={()=>open(u)}><Edit2 size={13}/></button>
                    <button className="action-btn action-btn-del" onClick={()=>del(u.id,u.username)}><Trash2 size={13}/></button>
                  </div></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={close} title={editing?'Editar Usuario':'Nuevo Usuario'}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <label className="form-label">Nombre completo</label>
              <input {...register('fullName')} className="form-input" placeholder="Juan Pérez"/>
            </div>
            {!editing&&<>
              <div>
                <label className="form-label">Usuario *</label>
                <input {...register('username',{required:'Requerido'})} className="form-input"/>
                {errors.username&&<div className="form-error">{String(errors.username.message)}</div>}
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input {...register('email',{required:'Requerido'})} type="email" className="form-input"/>
                {errors.email&&<div className="form-error">{String(errors.email.message)}</div>}
              </div>
              <div>
                <label className="form-label">Contraseña *</label>
                <input {...register('password',{required:'Requerido',minLength:{value:6,message:'Mínimo 6 caracteres'}})} type="password" className="form-input"/>
                {errors.password&&<div className="form-error">{String(errors.password.message)}</div>}
              </div>
            </>}
            <div>
              <label className="form-label">Rol</label>
              <select {...register('role')} className="form-input">
                <option value="tecnico">Técnico</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            {editing&&<div>
              <label className="form-label">Estado</label>
              <select {...register('isActive')} className="form-input">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={close} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing?'Actualizar':'Crear Usuario'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
