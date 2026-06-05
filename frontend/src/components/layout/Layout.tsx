import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, FolderKanban, FileBarChart2,
  Bot, ScrollText, LogOut, Menu, Bell, Settings, ChevronDown,
  Wrench, ShieldCheck, ClipboardList, X
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authAPI, inventoryAPI, usersAPI } from '../../services/api'
import toast from 'react-hot-toast'

const mainNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory',  icon: Package,         label: 'Inventario',   badge: null },
  { to: '/clients',    icon: Users,           label: 'Clientes' },
  { to: '/projects',   icon: FolderKanban,    label: 'Proyectos' },
  { to: '/ai-agent',   icon: Bot,             label: 'Asistente IA' },
  { to: '/reports',    icon: FileBarChart2,   label: 'Reportes' },
]

const adminNav = [
  { to: '/users',  icon: ClipboardList, label: 'Usuarios' },
  { to: '/logs',   icon: ScrollText,    label: 'Logs de Acceso' },
]

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventario / Materiales',
  '/clients':   'Clientes',
  '/projects':  'Proyectos & Presupuestos',
  '/ai-agent':  'Asistente Inteligente IA',
  '/reports':   'Reportes & Estadísticas',
  '/users':     'Administración / Usuarios',
  '/logs':      'Administración / Logs',
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [lowStock, setLowStock] = useState<any[]>([])
  
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [profileName, setProfileName] = useState(user?.fullName || '')
  const [profileEmail, setProfileEmail] = useState(user?.email || '')

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || '')
      setProfileEmail(user.email || '')
    }
  }, [user])

  const loadLowStock = async () => {
    try {
      const res = await inventoryAPI.getLowStock()
      setLowStock(res.data)
    } catch (e) {
      console.error('Error fetching low stock alerts', e)
    }
  }

  useEffect(() => {
    loadLowStock()
    const interval = setInterval(loadLowStock, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSaveProfile = async () => {
    if (!user) return
    try {
      const response = await usersAPI.update(user.id, {
        fullName: profileName,
        email: profileEmail
      })
      const updatedUser = response.data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      const token = localStorage.getItem('token')
      if (token) {
        useAuthStore.getState().setAuth(updatedUser, token)
      }
      toast.success('Perfil actualizado correctamente')
      setSettingsOpen(false)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al actualizar perfil')
    }
  }

  const handleLogout = async () => {
    try { await authAPI.logout() } catch {}
    logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const initials = (user?.fullName || user?.username || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const breadcrumb = BREADCRUMBS[pathname] || 'Plomería Kuno'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Wrench size={18} color="#fff" />
          </div>
          {!collapsed && (
            <div className="logo-text">
                Plomería Kuno
              <title>Plomería Kuno - Sistema de Gestión</title>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
          {!collapsed && <div className="nav-section-title">Menú Principal</div>}
          {mainNav.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon className="nav-icon" size={18} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && badge !== null && badge !== undefined && (
                <span className="nav-badge">{badge}</span>
              )}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              {!collapsed && <div className="nav-section-title" style={{ marginTop: 8 }}>Administración</div>}
              {adminNav.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to} to={to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  title={collapsed ? label : undefined}
                >
                  <Icon className="nav-icon" size={18} />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Bottom user */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {collapsed ? (
            <button onClick={handleLogout} className="nav-item" style={{ padding: '10px', justifyContent: 'center', width: '100%', borderLeft: 'none' }} title="Cerrar sesión">
              <LogOut size={18} style={{ color: '#ef4444' }} />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="topbar-avatar" style={{ flexShrink: 0 }}>{initials}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>Plomería Kuno</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.fullName || user?.username}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, borderRadius: 6, flexShrink: 0 }} title="Salir">
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <header className="topbar">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="topbar-btn"
          >
            <Menu size={18} />
          </button>

          <div>
            <div className="topbar-title" style={{ fontSize: 14 }}>
              {breadcrumb.split('/').pop()?.trim()}
            </div>
            <div className="topbar-breadcrumb">
              Plomería Kuno &rsaquo; {breadcrumb}
            </div>
          </div>

          <div className="topbar-right">
            {/* Notification */}
            <div style={{ position: 'relative' }}>
              <button className="topbar-btn" onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}>
                <Bell size={17} />
              </button>
              {lowStock.length > 0 && <span className="notif-dot" />}
              {notifOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, background: '#fff',
                  border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: 280, zIndex: 999, overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Alertas de Inventario</span>
                    <span className="badge badge-red" style={{fontSize: 10}}>{lowStock.length}</span>
                  </div>
                  <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                    {lowStock.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                        Todo en orden. No hay alertas de stock.
                      </div>
                    ) : (
                      lowStock.map((item, idx) => (
                        <div key={idx} style={{ padding: '10px 16px', borderBottom: idx < lowStock.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 2, cursor: 'pointer' }}
                             onClick={() => { setNotifOpen(false); navigate('/inventory'); }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</span>
                          <span style={{ color: '#ef4444' }}>
                            Stock actual: {item.stock} (Mínimo: {item.minStock})
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="topbar-btn" onClick={() => { setSettingsOpen(true); setUserMenuOpen(false); setNotifOpen(false); }}>
              <Settings size={17} />
            </button>

            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}
              >
                <div className="topbar-avatar">{initials}</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{user?.username}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, background: '#fff',
                  border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: 180, zIndex: 999, overflow: 'hidden',
                }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.fullName || user?.username}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#ef4444', fontFamily: 'Poppins' }}
                  >
                    <LogOut size={14} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }} onClick={() => { setUserMenuOpen(false); setNotifOpen(false); }}>
          <Outlet />
        </main>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSettingsOpen(false) }}>
          <div className="modal-box" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>Configuración del Sistema</h3>
              <button onClick={() => setSettingsOpen(false)} className="topbar-btn"><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Profile configuration */}
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}>Perfil de Usuario</div>
              <div>
                <label className="form-label">Nombre Completo</label>
                <input className="form-input" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Tu nombre..." />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input className="form-input" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} placeholder="tuemail@correo.com" />
              </div>
              
              <hr className="divider" />
              
              {/* System Settings */}
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}>Detalles del Sistema</div>
              <div style={{ background: 'var(--page-bg)', padding: 12, borderRadius: 8, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Versión:</span>
                  <span style={{ fontWeight: 600 }}>1.0.0 (Producción)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Conexión Base de Datos:</span>
                  <span style={{ color: '#00a854', fontWeight: 600 }}>Activa & Saludable</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Asistente IA:</span>
                  <span style={{ fontWeight: 600 }}>GPT-3.5-Turbo</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSettingsOpen(false)} className="btn btn-secondary">Cerrar</button>
              <button onClick={handleSaveProfile} className="btn btn-primary">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
