import React, {useState} from 'react'
import { login } from '../api'

export default function Login({ onLogin }){
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e){
    e.preventDefault(); setError(''); setLoading(true)
    const form = new FormData(e.target)
    const body = Object.fromEntries(form.entries())
    const res = await login(body)
    setLoading(false)
    if(res.ok && res.body && res.body.token){ onLogin(res.body.token) }
    else setError(res.body?.error || res.body?.message || 'Login failed')
  }

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={submit} className="auth-form">
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">{loading? '...' : 'Login'}</button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}
