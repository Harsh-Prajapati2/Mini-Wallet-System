import React, {useState, useEffect} from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [page, setPage] = useState('login')

  useEffect(()=>{
    if(token){ localStorage.setItem('token', token); setPage('dashboard') }
    else localStorage.removeItem('token')
  },[token])

  function handleLogout(){ setToken(null); setPage('login') }

  return (
    <div className="container">
      <header>
        <h1>Mini Wallet</h1>
        <nav className="nav">
          {!token && <button onClick={()=>setPage('register')}>Register</button>}
          {!token && <button onClick={()=>setPage('login')}>Login</button>}
          {token && <button onClick={()=>setPage('dashboard')}>Dashboard</button>}
          {token && <button onClick={handleLogout}>Logout</button>}
        </nav>
      </header>

      <main>
        {page === 'register' && <Register onRegistered={()=>setPage('login')} />}
        {page === 'login' && <Login onLogin={(t)=>setToken(t)} />}
        {page === 'dashboard' && <Dashboard token={token} onUnauthorized={()=>{ setToken(null); setPage('login') }} />}
      </main>
    </div>
  )
}
