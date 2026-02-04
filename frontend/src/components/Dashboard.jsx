import React, {useState, useEffect, useMemo} from 'react'
import { getBalance, getTransactions, credit, debit } from '../api'

export default function Dashboard({ token, onUnauthorized }){
  const [balance, setBalance] = useState('-')
  const [txs, setTxs] = useState([])
  const [msg, setMsg] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterDays, setFilterDays] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [viewMode, setViewMode] = useState('dashboard') // 'dashboard', 'months', 'month-detail'
  const [selectedMonthData, setSelectedMonthData] = useState(null)

  async function load(){
    setMsg('')
    const b = await getBalance(token)
    if(b === null) return
    if(!b.ok){ if(b.status===401) return onUnauthorized(); setMsg(b.body?.message || 'Failed to fetch balance'); return }
    setBalance(b.body.balance)

    const t = await getTransactions(token)
    if(!t.ok){ setMsg(t.body?.message || 'Failed to fetch transactions'); return }
    setTxs(t.body.items || [])
  }

  useEffect(()=>{ if(token) load() },[token])

  async function doAction(e, type){
    e.preventDefault(); setMsg('')
    const form = e.target
    const data = Object.fromEntries(new FormData(e.target).entries())
    const fn = type === 'credit' ? credit : debit
    const res = await fn(token, data)
    if(!res.ok){ if(res.status===401) return onUnauthorized(); setMsg(res.body?.message || 'Action failed'); return }
    setMsg(type + ' successful')
    form.reset()
    load()
  }

  const filteredTxs = useMemo(() => {
    let result = [...txs]

    // Filter by Type
    if (filterType !== 'all') {
      result = result.filter(tx => tx.transactionType === filterType)
    }

    // Filter by Days
    if (filterDays !== 'all') {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - parseInt(filterDays))
      result = result.filter(tx => new Date(tx.transactionDate) >= cutoff)
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.transactionDate)
      const dateB = new Date(b.transactionDate)
      if (sortBy === 'date-desc') return dateB - dateA
      if (sortBy === 'date-asc') return dateA - dateB
      if (sortBy === 'amount-desc') return b.amount - a.amount
      if (sortBy === 'amount-asc') return a.amount - b.amount
      return 0
    })

    return result
  }, [txs, filterType, filterDays, sortBy])

  const monthlyGroups = useMemo(() => {
    const groups = {}
    txs.forEach(tx => {
      const date = new Date(tx.transactionDate)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      
      if (!groups[key]) {
        groups[key] = { id: key, name: monthName, credit: 0, debit: 0, transactions: [] }
      }
      groups[key].transactions.push(tx)
      if (tx.transactionType === 'credit') groups[key].credit += tx.amount
      if (tx.transactionType === 'debit') groups[key].debit += tx.amount
    })
    return Object.values(groups).sort((a, b) => b.id.localeCompare(a.id))
  }, [txs])

  const dailySpending = useMemo(() => {
    if (!selectedMonthData) return []
    const days = {}
    selectedMonthData.transactions.forEach(tx => {
      if (tx.transactionType === 'debit') {
        const d = new Date(tx.transactionDate).getDate()
        days[d] = (days[d] || 0) + tx.amount
      }
    })
    return Object.entries(days)
      .map(([day, amount]) => ({ day, amount }))
      .sort((a, b) => Number(a.day) - Number(b.day))
  }, [selectedMonthData])

  const maxDailySpending = useMemo(() => Math.max(...dailySpending.map(d => d.amount), 0) || 1, [dailySpending])

  if (viewMode === 'months') {
    return (
      <div className="dashboard">
        <div className="header-actions">
          <button onClick={() => setViewMode('dashboard')}>&larr; Back to Dashboard</button>
          <h2>Monthly Expenses</h2>
        </div>
        <div className="months-list">
          {monthlyGroups.length === 0 && <p>No transaction history available.</p>}
          {monthlyGroups.map(m => (
            <div key={m.id} className="month-card" onClick={() => { setSelectedMonthData(m); setViewMode('month-detail') }}>
              <h3>{m.name}</h3>
              <div className="month-stats">
                <span className="credit">Credit: +₹{m.credit}</span>
                <span className="debit">Debit: -₹{m.debit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (viewMode === 'month-detail' && selectedMonthData) {
    return (
      <div className="dashboard">
        <div className="header-actions">
          <button onClick={() => setViewMode('months')}>&larr; Back to Months</button>
          <h2>{selectedMonthData.name}</h2>
        </div>
        <div className="balance-card">
          <div style={{display:'flex', justifyContent:'space-around', width:'100%'}}>
            <div><h3>Total Credit</h3><p style={{color:'#28a745'}}>+₹{selectedMonthData.credit}</p></div>
            <div><h3>Total Debit</h3><p style={{color:'#dc3545'}}>-₹{selectedMonthData.debit}</p></div>
          </div>
        </div>
        {dailySpending.length > 0 && (
          <div className="chart-section">
            <h3>Daily Spending</h3>
            <div className="chart-container">
              {dailySpending.map(item => (
                <div key={item.day} className="chart-bar-group">
                  <div 
                    className="chart-bar" 
                    style={{height: `${(item.amount / maxDailySpending) * 100}%`}}
                    title={`Day ${item.day}: ₹${item.amount}`}
                  ></div>
                  <span className="chart-label">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="transactions">
          <h3>History ({selectedMonthData.name})</h3>
          <table className="tx-table">
            <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Balance</th><th>Desc</th></tr></thead>
            <tbody>
              {selectedMonthData.transactions.map(tx => (
                <tr key={tx._id}>
                  <td>{new Date(tx.transactionDate).toLocaleString()}</td>
                  <td className={`tx-type-${tx.transactionType}`}>{tx.transactionType}</td>
                  <td>{tx.amount}</td>
                  <td>{tx.balanceAfterTransaction}</td>
                  <td>{tx.description || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="balance-card">
        <h2>Balance</h2>
        <p>₹{balance}</p>
      </div>

      <div className="actions">
        <form onSubmit={(e)=>doAction(e,'credit')} className="action-form">
          <h3>Add Money</h3>
          <input name="amount" type="number" placeholder="Amount" required />
          <input name="description" placeholder="Description" />
          <button type="submit">Credit</button>
        </form>

        <form onSubmit={(e)=>doAction(e,'debit')} className="action-form">
          <h3>Deduct Money</h3>
          <input name="amount" type="number" placeholder="Amount" required />
          <input name="description" placeholder="Description" />
          <button type="submit">Debit</button>
        </form>
      </div>

      {msg && <div className="message">{msg}</div>}

      <div className="transactions">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3>Transactions</h3>
          <button onClick={() => setViewMode('months')}>View Monthly Summary</button>
        </div>
        <div className="filters">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <select value={filterDays} onChange={e => setFilterDays(e.target.value)}>
            <option value="all">All Time</option>
            <option value="1">Last 24 Hours</option>
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount (High-Low)</option>
            <option value="amount-asc">Amount (Low-High)</option>
          </select>
        </div>
        <table className="tx-table">
          <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Balance</th><th>Desc</th></tr></thead>
          <tbody>
            {filteredTxs.map(tx => (
              <tr key={tx._id}>
                <td>{new Date(tx.transactionDate).toLocaleString()}</td>
                <td className={`tx-type-${tx.transactionType}`}>{tx.transactionType}</td>
                <td>{tx.amount}</td>
                <td>{tx.balanceAfterTransaction}</td>
                <td>{tx.description || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
