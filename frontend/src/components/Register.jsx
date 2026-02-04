import React, {useState} from 'react'
import { register } from '../api'

export default function Register({ onRegistered }){
  const [msg, setMsg] = useState('')

  async function submit(e){
    e.preventDefault(); setMsg('')
    const body = Object.fromEntries(new FormData(e.target).entries())
    const res = await register(body)
    if(res.ok){ setMsg('Registered successfully'); if(onRegistered) onRegistered() }
    else setMsg(res.body?.error || res.body?.message || 'Registration failed')
  }

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={submit} className="auth-form">
        <input name="fullName" placeholder="Full name" required />
        <input name="aadharCard" placeholder="Aadhar" required />
        <input name="mobileNo" placeholder="Mobile" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
      {msg && <div className="message">{msg}</div>}
    </div>
  )
}
