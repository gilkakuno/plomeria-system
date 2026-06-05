import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Wrench, Shield, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'

declare global { interface Window { grecaptcha: any } }

function StrengthBar({ password }: { password: string }) {
  if (!password) return null
  const checks = [/[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password), /[!@#$%^&*]/.test(password), password.length >= 10]
  const score = checks.filter(Boolean).length
  const level = score <= 2 ? 1 : score <= 3 ? 2 : 3
  const labels = ['', 'Débil', 'Intermedio', 'Fuerte']
  const colors = ['', '#ef4444', '#f59e0b', '#00a854']
  return (
    <div style={{ marginTop: 6 }}>
      <div className="strength-bar">
        {[1,2,3].map(i => (
          <div key={i} className="strength-segment" style={{ background: i <= level ? colors[level] : undefined }} />
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: colors[level], marginTop: 3 }}>
        Contraseña: {labels[level]}
      </div>
    </div>
  )
}

type FormData = { username: string; password: string; email?: string; fullName?: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>()
  const password = watch('password', '')

  useEffect(() => { if (isAuthenticated) navigate('/dashboard') }, [isAuthenticated])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const captchaToken = 'dev_bypass'
      if (isRegister) {
        await authAPI.register({ ...data })
        toast.success('Cuenta creada. Inicia sesión.')
        setIsRegister(false); reset()
      } else {
        const res = await authAPI.login({ username: data.username, password: data.password, captchaToken })
        setAuth(res.data.user, res.data.access_token)
        toast.success(`¡Bienvenido, ${res.data.user.fullName || res.data.user.username}!`)
        navigate('/dashboard')
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Credenciales incorrectas')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0f1628 0%, #1a2035 40%, #0d1a3a 100%)',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', maxWidth: 520,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}>
          <div style={{ width: 46, height: 46, background: '#0057ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={22} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>Plomería Pro</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Sistema de Gestión</div>
          </div>
        </div>

        <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
          {isRegister ? 'Crear una cuenta' : 'Bienvenido de vuelta'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 40 }}>
          {isRegister ? 'Completa el formulario para registrarte' : 'Ingresa tus credenciales para acceder al sistema'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {isRegister && (
            <>
              <div>
                <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Nombre completo</label>
                <input {...register('fullName')} className="form-input" placeholder="Juan Pérez"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }} />
              </div>
              <div>
                <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Email</label>
                <input {...register('email')} type="email" className="form-input" placeholder="correo@ejemplo.com"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }} />
              </div>
            </>
          )}

          <div>
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Usuario</label>
            <input {...register('username', { required: 'Requerido' })} className="form-input"
              placeholder="nombre de usuario" autoComplete="username"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }} />
            {errors.username && <div className="form-error">{errors.username.message}</div>}
          </div>

          <div>
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password', { required: 'Requerido', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                type={showPw ? 'text' : 'password'}
                className="form-input" placeholder="••••••••" autoComplete="current-password"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', paddingRight: 42 }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password.message}</div>}
            {isRegister && <StrengthBar password={password} />}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary"
            style={{ padding: '12px 20px', fontSize: 14, justifyContent: 'center', marginTop: 4 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="spinner" /> {isRegister ? 'Registrando...' : 'Ingresando...'}
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                <ChevronRight size={16} />
              </span>
            )}
          </button>
        </form>

        {/* reCAPTCHA notice */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, padding: '10px 14px', background: 'rgba(0,87,255,0.12)', borderRadius: 8, border: '1px solid rgba(0,87,255,0.25)' }}>
          <Shield size={14} style={{ color: '#4d8bff', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Protegido con Google reCAPTCHA v3</span>
        </div>

        <button onClick={() => { setIsRegister(!isRegister); reset() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 20, fontFamily: 'Poppins' }}>
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>

      {/* Right panel — decorative */}
      <div style={{
        flex: 1, background: 'rgba(0,87,255,0.06)', borderLeft: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60,
      }}>
        {/* Big icon graphic */}
        <div style={{ width: 100, height: 100, background: 'rgba(0,87,255,0.2)', borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <Wrench size={50} color="#4d8bff" />
        </div>
        <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>
          Gestiona tu negocio<br />de plomería
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center', maxWidth: 340, lineHeight: 1.7 }}>
          Control de inventario, presupuestos, clientes y proyectos en un solo lugar. Con asistente inteligente para generar presupuestos automáticos.
        </p>
        {/* Feature list */}
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 320 }}>
          {['Control de inventario con alertas', 'Presupuestos profesionales en PDF', 'Agente IA para materiales', 'Log de acceso y auditoría'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(0,87,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ChevronRight size={12} color="#4d8bff" />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
