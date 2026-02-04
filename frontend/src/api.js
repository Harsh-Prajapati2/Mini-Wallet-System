const BASE = 'http://localhost:5000'

async function request(path, opts={}){
  const res = await fetch(BASE + path, opts)
  const body = await res.json().catch(()=>null)
  return { ok: res.ok, status: res.status, body }
}

export const register = (data) => request('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
export const login = (data) => request('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })

export function authRequest(token, path, opts={}){
  opts.headers = Object.assign({'Content-Type':'application/json'}, opts.headers || {})
  if(token) opts.headers['Authorization'] = 'Bearer ' + token
  return request(path, opts)
}

export const getBalance = (token) => authRequest(token, '/api/wallet/balance')
export const getTransactions = (token, q='?limit=50') => authRequest(token, '/api/wallet/transactions' + q)
export const credit = (token, data) => authRequest(token, '/api/wallet/credit', { method:'POST', body:JSON.stringify(data) })
export const debit = (token, data) => authRequest(token, '/api/wallet/debit', { method:'POST', body:JSON.stringify(data) })
