import { useMemo, useState } from 'react'
import {
  Activity, ArrowDownToLine, Bell, Bot, Boxes, ChartNoAxesCombined, ChevronDown,
  ArrowRight, CircleHelp, ClipboardList, Command, FileSpreadsheet, LayoutDashboard,
  Leaf, LockKeyhole, Menu, MessageSquare, PackageSearch, PanelsTopLeft, Plus, RefreshCw,
  Settings2, ShieldCheck, SlidersHorizontal, Truck, Wheat, X,
} from 'lucide-react'

const navItems = [
  { id: 'chatbot', label: 'Chatbot', icon: Bot },
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'ownership', label: 'Ownership', icon: Boxes },
  { id: 'allocation', label: 'Allocation', icon: SlidersHorizontal },
  { id: 'matrix', label: 'Plant Matrix', icon: PanelsTopLeft },
  { id: 'forecast', label: 'Forecast', icon: ChartNoAxesCombined },
  { id: 'financials', label: 'Financials', icon: FileSpreadsheet },
  { id: 'configuration', label: 'Configuration', icon: Settings2 },
]

const weeks = ['12 Jul', '19 Jul', '26 Jul', '02 Aug', '09 Aug', '16 Aug', '23 Aug', '30 Aug', '06 Sep', '13 Sep', '20 Sep', '27 Sep']
const initialContracts = [
  { vendor: 'Eastern Grains', code: 'EAST0026', contract: '2000010005', volume: 1100, price: 450, values: [129.82, 129.82, 129.82, 129.82, 575, 0, 0, 0, 0, 0, 0, 0] },
  { vendor: 'Eastern Grains', code: 'EAST0026', contract: '2000010006', volume: 700, price: 380, values: [0, 0, 0, 0, 489, 0, 0, 0, 211, 0, 0, 0] },
  { vendor: 'Sollio', code: 'COOP0035', contract: '2000010011', volume: 950, price: 410, values: [178.29, 178.29, 178.29, 178.29, 236.84, 0, 0, 0, 0, 0, 0, 0] },
  { vendor: 'P&H East', code: 'PARR0007', contract: '2000010017', volume: 950, price: 390, values: [209.98, 209.98, 209.98, 209.98, 110.07, 0, 0, 0, 0, 0, 0, 0] },
  { vendor: 'SemiCan', code: 'SEMI0002', contract: '2000010021', volume: 900, price: 415, values: [197.38, 197.38, 197.38, 197.38, 110.49, 0, 0, 0, 0, 0, 0, 0] },
  { vendor: 'Prairie Oats', code: 'PRAI0012', contract: '2000012031', volume: 640, price: 405, values: [0, 0, 0, 0, 320, 0, 0, 0, 320, 0, 0, 0] },
  { vendor: 'NorthLink Grain', code: 'NORT0041', contract: '2000012032', volume: 480, price: 398, values: [120, 120, 120, 120, 0, 0, 0, 0, 0, 0, 0, 0] },
  { vendor: 'Valley Commodities', code: 'VALL0021', contract: '2000012033', volume: 360, price: 412, values: [0, 0, 0, 0, 0, 0, 0, 0, 90, 90, 90, 90] },
]

const suppliers = [
  { name: 'Eastern Grains', code: 'EAST0026', contract: 2392, received: 780, transit: 220, demand: 2050 },
  { name: 'Sollio', code: 'COOP0035', contract: 2100, received: 650, transit: 300, demand: 2250 },
  { name: 'P&H East', code: 'PARR0007', contract: 3461, received: 990, transit: 515, demand: 3300 },
  { name: 'SemiCan', code: 'SEMI0002', contract: 3153, received: 790, transit: 440, demand: 2200 },
]

const plants = ['Beloit Plant', 'Bluffton Plant', 'Casa Grande Plant', 'Charlotte Plant', 'Denver Plant', 'Fayetteville Plant']
const fmt = (number, digits = 0) => Number(number).toLocaleString('en-CA', { maximumFractionDigits: digits, minimumFractionDigits: 0 })
const allocated = (contract) => contract.values.reduce((sum, value) => sum + Number(value || 0), 0)

function App() {
  const [page, setPage] = useState('home')
  const [commodity, setCommodity] = useState('Oats')
  const [country, setCountry] = useState('Canada')
  const [plant, setPlant] = useState('All plants')
  const [period, setPeriod] = useState('Jul–Sep · P08–P10')
  const [year, setYear] = useState('2026')
  const [contracts, setContracts] = useState(initialContracts)
  const [selected, setSelected] = useState(0)
  const [allocationTab, setAllocationTab] = useState('Contract allocation')
  const [method, setMethod] = useState('equal')
  const [targetPeriod, setTargetPeriod] = useState('P08')
  const [amount, setAmount] = useState('0')
  const [toast, setToast] = useState('')
  const [configSection, setConfigSection] = useState('Plants')
  const [configModal, setConfigModal] = useState(false)
  const [configName, setConfigName] = useState('')
  const [configRows, setConfigRows] = useState({
    Plants: ['Quaker · QKR-CA', 'Beloit Plant · BEL-US', 'Bluffton Plant · BLU-US'],
    Suppliers: ['Eastern Grains · EAST0026', 'Sollio · COOP0035', 'P&H East · PARR0007'],
    Commodities: ['Oats · OATS', 'Wheat · WHEAT', 'Corn · CORN', 'Rice · RICE'],
    Users: ['Procurement Planner · Planner', 'Procurement Manager · Approver', 'Finance Analyst · Viewer'],
  })
  const [ownershipView, setOwnershipView] = useState('Yearly')
  const [ownershipMonth, setOwnershipMonth] = useState('Jul-26')
  const [forecastView, setForecastView] = useState('Period')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const totals = useMemo(() => {
    const contract = contracts.reduce((sum, row) => sum + row.volume, 0)
    const allocation = contracts.reduce((sum, row) => sum + allocated(row), 0)
    return { contract, allocation, unallocated: contract - allocation, issues: contracts.filter((row) => Math.abs(row.volume - allocated(row)) > 0.02).length }
  }, [contracts])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const updateWeek = (rowIndex, weekIndex, value) => {
    const nextValue = Math.max(0, Number(value) || 0)
    setContracts((current) => current.map((row, index) => index === rowIndex
      ? { ...row, values: row.values.map((week, weekNumber) => weekNumber === weekIndex ? nextValue : week) }
      : row))
    setSelected(rowIndex)
  }

  const applyAllocation = () => {
    const quantity = Math.max(0, Number(amount) || 0)
    if (!quantity) return notify('Enter a volume greater than zero')
    const startIndex = { P08: 0, P09: 4, P10: 8 }[targetPeriod]
    setContracts((current) => current.map((row, index) => {
      if (index !== selected) return row
      const remaining = Math.max(0, row.volume - allocated(row))
      const applied = Math.min(quantity, remaining)
      if (applied === 0) return row
      const values = [...row.values]
      if (method === 'early') values[startIndex] += applied
      else {
        const distribution = method === 'demand' ? [0.28, 0.27, 0.24, 0.21] : [0.25, 0.25, 0.25, 0.25]
        distribution.forEach((share, offset) => { values[startIndex + offset] += applied * share })
      }
      return { ...row, values }
    }))
    notify('Allocation applied to selected contract')
  }

  const clearContract = () => {
    setContracts((current) => current.map((row, index) => index === selected ? { ...row, values: weeks.map(() => 0) } : row))
    notify('Contract allocation cleared')
  }

  const activeContract = contracts[selected]
  const selectedRemaining = Math.max(0, activeContract.volume - allocated(activeContract))
  const periodTotals = [0, 1, 2].map((periodIndex) => contracts.reduce((sum, row) => sum + row.values.slice(periodIndex * 4, periodIndex * 4 + 4).reduce((weekSum, value) => weekSum + value, 0), 0))

  const saveConfig = (event) => {
    event.preventDefault()
    const value = configName.trim()
    if (!value) return
    setConfigRows((current) => ({ ...current, [configSection]: [...current[configSection], value] }))
    setConfigName('')
    setConfigModal(false)
    notify(`${configSection.slice(0, -1)} added`)
  }

  const deleteConfig = (index) => {
    setConfigRows((current) => ({ ...current, [configSection]: current[configSection].filter((_, rowIndex) => rowIndex !== index) }))
    notify('Configuration record removed')
  }

  const navigation = (
    <nav className="main-nav" aria-label="Main navigation">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => { setPage(id); setMobileMenu(false) }}>
          <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
        </button>
      ))}
    </nav>
  )

  if (!isAuthenticated) return <LoginPage onDemo={() => setIsAuthenticated(true)} />

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); setPage('home') }} aria-label="Commodity Buying Tool home">
          <span className="brand-mark"><Wheat size={19} /></span>
          <span className="brand-name">COMMODITY<span>BUYING TOOL</span></span>
        </a>
        <div className="header-context"><span className="context-dot" /> Procurement workspace <span className="context-divider">/</span> Canada</div>
        <div className="top-actions">
          <button className="icon-button" aria-label="Refresh data" title="Refresh data" onClick={() => notify('Data refreshed')}><RefreshCw size={18} /></button>
          <button className="icon-button notification-button" aria-label="Notifications" title="Notifications" onClick={() => notify('You are all caught up')}><Bell size={18} /><i /></button>
          <button className="icon-button" aria-label="Messages" title="Messages" onClick={() => notify('No new messages')}><MessageSquare size={18} /></button>
          <span className="avatar" aria-label="Current user">PS</span>
        </div>
        <button className="mobile-menu-button" aria-label="Toggle navigation" onClick={() => setMobileMenu((open) => !open)}>{mobileMenu ? <X size={21} /> : <Menu size={21} />}</button>
      </header>
      {mobileMenu && <div className="mobile-nav">{navigation}</div>}
      <div className="nav-strip">{navigation}<div className="nav-meta"><ShieldCheck size={15} /> Internal planning</div></div>

      <main className="workspace">
        {page !== 'chatbot' && <section className="filter-bar" aria-label="Planning filters">
          <div className="filter-heading"><SlidersHorizontal size={15} /><span>Planning scope</span></div>
          <Filter label="Commodity" value={commodity} onChange={setCommodity} options={['Oats', 'Wheat', 'Corn', 'Rice']} />
          <Filter label="Country" value={country} onChange={setCountry} options={['Canada', 'United States']} />
          <Filter label="Plant" value={plant} onChange={setPlant} options={['All plants', 'Quaker', ...plants]} />
          <Filter label="Delivery period" value={period} onChange={setPeriod} options={['Jan–Mar · P01–P03', 'Apr–Jun · P04–P07', 'Jul–Sep · P08–P10', 'Oct–Dec · P11–P13']} />
          <Filter label="Year" value={year} onChange={setYear} options={['2026', '2027']} />
          <div className="refresh-stamp"><span>LAST DATA REFRESH</span><strong>08 Oct 2026, 4:15 PM</strong></div>
        </section>}

        <div className="page-heading">
          <div><div className="eyebrow">{page === 'chatbot' ? 'PLANNED CAPABILITY · PHASE 2' : `PROCUREMENT · ${year}`}</div><h1>{navItems.find((item) => item.id === page)?.label}</h1><p>{page === 'chatbot' ? 'Conversational procurement assistance' : <>{commodity} <span>·</span> {country} <span>·</span> {period}</>}</p></div>
          {page !== 'chatbot' && <div className="heading-actions"><button className="button secondary" onClick={() => notify('Report prepared for export')}><ArrowDownToLine size={16} /> Export</button><button className="button primary" onClick={() => notify('Draft saved')}><ClipboardList size={16} /> Save draft</button></div>}
        </div>

        {page === 'chatbot' && <ChatbotPage />}
        {page === 'home' && <HomePage totals={totals} onNavigate={setPage} />}
        {page === 'allocation' && <AllocationPage
          contracts={contracts} totals={totals} selected={selected} setSelected={setSelected} updateWeek={updateWeek}
          activeContract={activeContract} remaining={selectedRemaining} amount={amount} setAmount={setAmount}
          method={method} setMethod={setMethod} targetPeriod={targetPeriod} setTargetPeriod={setTargetPeriod}
          applyAllocation={applyAllocation} clearContract={clearContract} tab={allocationTab} setTab={setAllocationTab}
          periodTotals={periodTotals} notify={notify}
        />}
        {page === 'ownership' && <OwnershipPage view={ownershipView} setView={setOwnershipView} month={ownershipMonth} setMonth={setOwnershipMonth} />}
        {page === 'matrix' && <MatrixPage />}
        {page === 'forecast' && <ForecastPage view={forecastView} setView={setForecastView} />}
        {page === 'financials' && <FinancialsPage />}
        {page === 'configuration' && <ConfigurationPage
          section={configSection} setSection={setConfigSection} rows={configRows[configSection]}
          onAdd={() => setConfigModal(true)} onDelete={deleteConfig} notify={notify}
        />}
      </main>

      {configModal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfigModal(false) }}>
        <form className="modal-card" onSubmit={saveConfig}>
          <div className="modal-header"><div><span className="eyebrow">CONFIGURATION</span><h2>Add {configSection.slice(0, -1)}</h2></div><button type="button" className="icon-button dark" aria-label="Close" onClick={() => setConfigModal(false)}><X size={19} /></button></div>
          <label className="form-label">{configSection.slice(0, -1)} name or code<input autoFocus value={configName} onChange={(event) => setConfigName(event.target.value)} placeholder="Enter a name or identifier" /></label>
          <div className="modal-actions"><button type="button" className="button secondary" onClick={() => setConfigModal(false)}>Cancel</button><button className="button primary" type="submit"><Plus size={16} /> Add record</button></div>
        </form>
      </div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

function LoginPage({ onDemo }) {
  const [notice, setNotice] = useState('')
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = (event) => {
    event.preventDefault()
    if (userId.trim().toUpperCase() === 'CBT' && password === 'cbt123') {
      onDemo()
      return
    }
    setNotice('Invalid user ID or password. Use the demo credentials shown below.')
  }

  return <main className="login-screen">
    <section className="login-brand-panel">
      <a className="login-brand" href="#login" aria-label="Commodity Buying Tool">
        <PepsiMark />
        <span className="pepsi-wordmark">PepsiCo<small>COMMODITY BUYING TOOL</small></span>
      </a>
      <div className="login-brand-content">
        <div className="login-kicker"><span /> PROCUREMENT WORKSPACE</div>
        <h1>Commodity<br />Buying Tool</h1>
        <p>Plan supply, align demand, and keep every delivery period in view.</p>
        <div className="login-signal" aria-hidden="true">
          <div className="signal-head"><span>DELIVERY COVERAGE</span><strong>FY 2026</strong></div>
          <div className="signal-bars">{[36, 52, 44, 76, 61, 88, 67, 96, 72, 82, 58, 74].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
          <div className="signal-labels"><span>JAN</span><span>APR</span><span>JUL</span><span>OCT</span><span>DEC</span></div>
        </div>
      </div>
      <div className="login-brand-footer"><span>CANADA PROCUREMENT</span><span>·</span><span>2026 PLANNING YEAR</span></div>
    </section>
    <section className="login-form-panel">
      <div className="login-form-wrap">
        <div className="login-mobile-brand"><PepsiMark /><span className="pepsi-wordmark">PepsiCo<small>COMMODITY BUYING TOOL</small></span></div>
        <div className="login-eyebrow"><LockKeyhole size={14} /> SECURE WORKSPACE</div>
        <h2>Welcome back</h2>
        <p className="login-subtitle">Sign in to continue to your procurement workspace.</p>
        <form className="login-form" onSubmit={handleSignIn}>
          <label htmlFor="login-user">User ID</label>
          <input id="login-user" type="text" autoComplete="username" placeholder="Enter your user ID" value={userId} onChange={(event) => setUserId(event.target.value)} required />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {notice && <p className="login-notice" role="status">{notice}</p>}
          <button className="login-submit" type="submit">Sign in <ArrowRight size={16} /></button>
        </form>
        <div className="demo-credentials"><div className="credentials-heading"><span>DEMO SIGN-IN</span><ShieldCheck size={14} /></div><div className="credential-row"><span>User ID</span><code>CBT</code></div><div className="credential-row"><span>Password</span><code>cbt123</code></div><p>Preview credentials only. Replace this client-side demo check with server-side authentication before production.</p></div>
      </div>
    </section>
  </main>
}

function PepsiMark() {
  return <span className="pepsi-mark" role="img" aria-label="PepsiCo mark" />
}

function ChatbotPage() {
  return <section className="chatbot-coming surface" aria-labelledby="chatbot-coming-title">
    <div className="chatbot-symbol"><Bot size={28} strokeWidth={1.6} /></div>
    <div className="chatbot-copy">
      <span className="phase-badge">PHASE 2</span>
      <h2 id="chatbot-coming-title">Chatbot coming soon</h2>
      <p>Conversational help for commodity contracts, allocations, and supplier positions is planned for Phase 2.</p>
    </div>
    <div className="chatbot-release"><MessageSquare size={17} /><span>PLANNED RELEASE</span><strong>Phase 2</strong></div>
  </section>
}

function Filter({ label, value, onChange, options }) {
  return <label className="filter-field"><span>{label}</span><span className="select-wrap"><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></span></label>
}

function Metric({ label, value, note, tone = 'blue', icon: Icon }) {
  return <article className={`metric-card ${tone}`}><div className="metric-top"><span>{label}</span>{Icon && <Icon size={17} />}</div><strong>{value}</strong><small>{note}</small></article>
}

function SectionHeading({ title, detail, action }) {
  return <div className="section-heading"><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div>
}

function HomePage({ totals, onNavigate }) {
  const values = [67, 83, 72, 91, 78, 86, 63, 74, 88, 68, 96, 81, 89]
  return <>
    <div className="metric-grid four">
      <Metric label="Contract volume" value={`${fmt(totals.contract)} MT`} note="Across 8 active contracts" icon={FileSpreadsheet} />
      <Metric label="Allocated volume" value={`${fmt(totals.allocation)} MT`} note="Delivery periods P08–P10" tone="green" icon={Truck} />
      <Metric label="Unallocated volume" value={`${fmt(totals.unallocated)} MT`} note="Remaining to schedule" tone="gold" icon={PackageSearch} />
      <Metric label="Validation issues" value={totals.issues} note="Contracts need attention" tone="coral" icon={Activity} />
    </div>
    <div className="home-grid">
      <article className="surface chart-panel"><SectionHeading title="Volume at a glance" detail="Monthly contract allocation · 2026" action={<span className="chart-legend"><i /> Allocated</span>} /><div className="bar-chart" aria-label="Monthly allocation volumes">{values.map((value, index) => <div className="bar-column" key={index}><div className="bar-track"><i style={{ height: `${value}%` }} /></div><span>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'FY'][index]}</span></div>)}</div></article>
      <article className="surface supplier-panel"><SectionHeading title="Supplier position" detail="Contracted volume against demand" action={<button className="text-button" onClick={() => onNavigate('ownership')}>View ownership <span>→</span></button>} />
        <div className="supplier-bars">{suppliers.map((supplier) => { const position = supplier.received + supplier.transit + supplier.contract - supplier.demand; return <div className="supplier-line" key={supplier.code}><div className="supplier-name"><span>{supplier.name}</span><strong className={position < 0 ? 'negative-text' : 'positive-text'}>{position > 0 ? '+' : ''}{fmt(position)} MT</strong></div><div className="progress-track"><i style={{ width: `${Math.min(100, (supplier.contract / 3800) * 100)}%` }} /></div></div> })}</div>
      </article>
    </div>
    <article className="surface activity-panel"><SectionHeading title="Planning activity" detail="Current delivery quarter" action={<button className="button secondary compact" onClick={() => onNavigate('allocation')}>Open allocation <span>→</span></button>} /><div className="activity-row"><span className="activity-icon"><Wheat size={17} /></span><div><strong>Allocation review is ready</strong><small>{totals.issues} contracts have a volume mismatch in the selected period.</small></div><button className="text-button" onClick={() => onNavigate('allocation')}>Review</button></div></article>
  </>
}

function AllocationPage({ contracts, totals, selected, setSelected, updateWeek, activeContract, remaining, amount, setAmount, method, setMethod, targetPeriod, setTargetPeriod, applyAllocation, clearContract, tab, setTab, periodTotals, notify }) {
  const [search, setSearch] = useState('')
  const filtered = contracts.map((row, index) => ({ ...row, index })).filter((row) => `${row.vendor} ${row.code} ${row.contract}`.toLowerCase().includes(search.toLowerCase()))
  const totalByWeek = weeks.map((_, weekIndex) => contracts.reduce((sum, row) => sum + row.values[weekIndex], 0))
  return <>
    <div className="metric-grid six">
      <Metric label="Contract volume" value={fmt(totals.contract)} note="Metric tonnes" />
      <Metric label="Allocated" value={fmt(totals.allocation)} note="Metric tonnes" tone="green" />
      <Metric label="Unallocated" value={fmt(totals.unallocated)} note="Metric tonnes" tone="gold" />
      <Metric label="Suppliers" value="8" note="Active this period" />
      <Metric label="Contracts" value={contracts.length} note="In current view" />
      <Metric label="Issues" value={totals.issues} note="Need review" tone="coral" />
    </div>
    <article className="surface allocation-surface">
      <div className="allocation-toolbar"><div className="tabs" role="tablist">{['Contract allocation', 'Unallocated contracts', 'Allocation summary'].map((name) => <button key={name} role="tab" aria-selected={tab === name} className={tab === name ? 'selected' : ''} onClick={() => setTab(name)}>{name}</button>)}</div><div className="toolbar-actions"><label className="search-field"><PackageSearch size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find vendor or contract" /></label><button className="button secondary compact" onClick={() => notify('Import preview ready')}><Plus size={15} /> Import preview</button></div></div>
      {tab === 'Allocation summary' ? <SummaryTable contracts={contracts} /> : <div className="table-scroll"><table className="allocation-table"><thead><tr><th className="sticky-first" rowSpan="2">Vendor / Contract</th><th rowSpan="2">Delivery quarter</th><th rowSpan="2">Contract no.</th><th rowSpan="2">Contract MT</th><th rowSpan="2">C$/MT</th><th className="period-head" colSpan="4">P08 · JUL</th><th className="period-head" colSpan="4">P09 · AUG</th><th className="period-head" colSpan="4">P10 · SEP</th><th rowSpan="2">Allocated</th></tr><tr>{weeks.map((week, index) => <th key={week} className="week-head"><span>{week}</span><small>W{(index % 4) + 1}</small></th>)}</tr></thead><tbody>
        {filtered.map((row) => <tr key={row.contract} className={selected === row.index ? 'row-selected' : ''} onClick={() => setSelected(row.index)}><td className="sticky-first vendor-cell"><span className="vendor-dot" />{row.vendor}<small>{row.code}</small></td><td>Jul–Sep</td><td className="contract-code">{row.contract}</td><td>{fmt(row.volume, 1)}</td><td>${fmt(row.price)}</td>{row.values.map((value, weekIndex) => <td className="input-cell" key={weekIndex}><input aria-label={`${row.vendor}, ${row.contract}, ${weeks[weekIndex]} allocation`} type="number" min="0" step="0.01" value={value || ''} onChange={(event) => updateWeek(row.index, weekIndex, event.target.value)} onClick={(event) => event.stopPropagation()} /></td>)}<td className="allocated-cell">{fmt(allocated(row), 1)}</td></tr>)}
        <tr className="sum-row"><td className="sticky-first" colSpan="5">Weekly total</td>{totalByWeek.map((value, index) => <td key={index}>{fmt(value, 1)}</td>)}<td>{fmt(totals.allocation, 1)}</td></tr>
        <tr className="period-total"><td className="sticky-first" colSpan="5">Period total</td>{periodTotals.map((value, index) => <td key={index} colSpan="4">{fmt(value, 1)} MT</td>)}<td>{fmt(totals.allocation, 1)}</td></tr>
      </tbody></table></div>}
    </article>
    <div className="allocation-bottom"><div className={`validation-banner ${totals.issues ? 'attention' : ''}`}><span className="validation-icon">{totals.issues ? '!' : '✓'}</span><div><strong>{totals.issues ? `${totals.issues} contracts need attention` : 'All contracts are fully allocated'}</strong><small>{totals.issues ? 'Allocated volume differs from the contract volume. Review the highlighted rows.' : 'Contract volumes match the weekly allocation totals.'}</small></div></div>
      {tab !== 'Unallocated contracts' && <aside className="assistant-panel"><div className="assistant-title"><div><span className="eyebrow">QUICK ACTION</span><h3>Allocation assistant</h3></div><Command size={18} /></div><div className="selected-contract"><span>SELECTED CONTRACT</span><strong>{activeContract.contract}</strong><small>{activeContract.vendor} · {fmt(activeContract.volume)} MT</small></div><div className="remaining-line"><span>Available to allocate</span><strong>{fmt(remaining, 2)} MT</strong></div><label className="control-label">Method<select value={method} onChange={(event) => setMethod(event.target.value)}><option value="equal">Spread evenly</option><option value="early">Earliest weeks first</option><option value="demand">Forecast profile</option></select></label><div className="control-row"><label className="control-label">Target period<select value={targetPeriod} onChange={(event) => setTargetPeriod(event.target.value)}><option>P08</option><option>P09</option><option>P10</option></select></label><label className="control-label">Volume (MT)<input type="number" min="0" max={remaining} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></label></div><div className="assistant-actions"><button className="button primary" onClick={applyAllocation}>Apply allocation</button><button className="button secondary" onClick={clearContract}>Clear contract</button></div></aside>}
    </div>
  </>
}

function SummaryTable({ contracts }) {
  const vendors = [...new Set(contracts.map((row) => row.vendor))]
  return <div className="summary-list"><div className="summary-head"><span>Supplier</span><span>Contracts</span><span>Contract MT</span><span>Allocated MT</span><span>Remaining MT</span></div>{vendors.map((vendor) => { const rows = contracts.filter((row) => row.vendor === vendor); const contracted = rows.reduce((sum, row) => sum + row.volume, 0); const amount = rows.reduce((sum, row) => sum + allocated(row), 0); return <div className="summary-row" key={vendor}><strong>{vendor}</strong><span>{rows.length}</span><span>{fmt(contracted, 1)}</span><span>{fmt(amount, 1)}</span><span className={contracted - amount > 0.02 ? 'negative-text' : 'positive-text'}>{fmt(contracted - amount, 1)}</span></div> })}</div>
}

function OwnershipPage({ view, setView, month, setMonth }) {
  const monthPosition = { 'Jan-26': 0, 'Feb-26': 0, 'Mar-26': 0, 'Apr-26': 0, 'May-26': 0, 'Jun-26': 0, 'Jul-26': -49604, 'Aug-26': -5645, 'Sep-26': 2, 'Oct-26': 14764, 'Nov-26': 84671, 'Dec-26': 0 }[month]
  return <><div className="view-controls"><label className="filter-field"><span>View</span><span className="select-wrap"><select value={view} onChange={(event) => setView(event.target.value)}><option>Yearly</option><option>Monthly</option></select><ChevronDown size={14} /></span></label>{view === 'Monthly' && <label className="filter-field"><span>Month</span><span className="select-wrap"><select value={month} onChange={(event) => setMonth(event.target.value)}>{Object.keys({ 'Jan-26': 0, 'Feb-26': 0, 'Mar-26': 0, 'Apr-26': 0, 'May-26': 0, 'Jun-26': 0, 'Jul-26': 0, 'Aug-26': 0, 'Sep-26': 0, 'Oct-26': 0, 'Nov-26': 0, 'Dec-26': 0 }).map((name) => <option key={name}>{name}</option>)}</select><ChevronDown size={14} /></span></label>}</div>
    <div className="metric-grid six"><Metric label="Contract volume" value="11,105 MT" note="Current year" /><Metric label="Received" value="3,210 MT" note="Consumption volume" tone="green" /><Metric label="In transit" value="1,475 MT" note="Open shipments" /><Metric label="Unreceived contract" value="6,420 MT" note="Balance to receive" tone="gold" /><Metric label="Demand" value="9,800 MT" note="Current year" /><Metric label="Position" value={`${view === 'Monthly' ? fmt(monthPosition, 2) : '1,306'} MT`} note={view === 'Monthly' ? month : 'Received + transit + open − demand'} tone={monthPosition < 0 && view === 'Monthly' ? 'coral' : 'blue'} /></div>
    <div className="note-banner"><Leaf size={17} /><span>Position = received inventory + in-transit volume + unreceived contracted volume − demand.</span></div>
    <article className="surface table-surface"><SectionHeading title="Supplier position" detail="Contract coverage and demand by vendor" action={<span className="tiny-label">{view === 'Monthly' ? month : 'FY 2026'}</span>} /><div className="table-scroll"><table className="data-table"><thead><tr><th>Supplier</th><th>Contract volume</th><th>Received</th><th>In transit</th><th>Unreceived</th><th>Demand</th><th>Position</th><th>Status</th></tr></thead><tbody>{suppliers.map((row) => { const open = row.contract - row.received - row.transit; const position = row.received + row.transit + open - row.demand; return <tr key={row.code}><td><strong>{row.name}</strong><small>{row.code}</small></td><td>{fmt(row.contract, 1)}</td><td>{fmt(row.received)}</td><td>{fmt(row.transit)}</td><td>{fmt(open, 1)}</td><td>{fmt(row.demand)}</td><td className={position >= 0 ? 'positive-text' : 'negative-text'}>{position > 0 ? '+' : ''}{fmt(position, 1)}</td><td><span className={`status-pill ${position >= 0 ? 'surplus' : 'shortage'}`}>{position >= 0 ? 'Surplus' : 'Shortage'}</span></td></tr> })}</tbody></table></div></article>
  </>
}

function MatrixPage() {
  return <article className="surface table-surface"><SectionHeading title="Plant allocation matrix" detail="Weekly volume by receiving plant · metric tonnes" action={<span className="tiny-label">P08–P10 · FY 2026</span>} /><div className="table-scroll"><table className="allocation-table matrix-table"><thead><tr><th className="sticky-first" rowSpan="2">Plant</th><th className="period-head" colSpan="4">P08 · JUL</th><th className="period-head" colSpan="4">P09 · AUG</th><th className="period-head" colSpan="4">P10 · SEP</th><th rowSpan="2">Total</th></tr><tr>{weeks.map((week) => <th className="week-head" key={week}>{week}</th>)}</tr></thead><tbody>{plants.map((name, rowIndex) => { const values = weeks.map((_, index) => Math.max(0, Math.round(120 + ((rowIndex * 67 + index * 41) % 155)))); return <tr key={name}><td className="sticky-first vendor-cell"><span className="vendor-dot" />{name}</td>{values.map((value, index) => <td key={index}>{fmt(value)}</td>)}<td className="allocated-cell">{fmt(values.reduce((sum, value) => sum + value, 0))}</td></tr> })}</tbody></table></div></article>
}

function ForecastPage({ view, setView }) {
  const forecast = [3600, 2700, 2700]
  const actual = [3550, 2730, 2660]
  return <><div className="metric-grid four"><Metric label="Year forecast" value="9,000 MT" note="Current planning baseline" /><Metric label="Actual receipts" value="8,940 MT" note="Receipts posted to date" tone="green" /><Metric label="Forecast variance" value="−60 MT" note="0.7% below forecast" tone="gold" /><Metric label="Forecast accuracy" value="99.3%" note="Year to date" tone="blue" /></div><article className="surface table-surface"><div className="forecast-heading"><SectionHeading title="Forecast vs actual" detail="Volume comparison for the selected period" /><div className="segmented"><button className={view === 'Period' ? 'active' : ''} onClick={() => setView('Period')}>Period</button><button className={view === 'Week' ? 'active' : ''} onClick={() => setView('Week')}>Week</button></div></div><div className="table-scroll"><table className="data-table forecast-table"><thead><tr><th>Plant</th>{(view === 'Period' ? ['P08 Forecast', 'P08 Actual', 'P08 Δ', 'P09 Forecast', 'P09 Actual', 'P09 Δ', 'P10 Forecast', 'P10 Actual', 'P10 Δ'] : weeks).map((column) => <th key={column}>{column}</th>)}<th>Total forecast</th><th>Total actual</th></tr></thead><tbody>{plants.slice(0, 4).map((name, plantIndex) => <tr key={name}><td><strong>{name}</strong></td>{(view === 'Period' ? forecast.flatMap((volume, index) => [volume - plantIndex * 110, actual[index] - plantIndex * 105, actual[index] - volume + plantIndex * 5]) : weeks.map((_, index) => 650 + ((index * 83 + plantIndex * 25) % 340))).map((value, index) => <td className={view === 'Period' && index % 3 === 2 ? value >= 0 ? 'positive-text' : 'negative-text' : ''} key={index}>{view === 'Period' && index % 3 === 2 && value > 0 ? '+' : ''}{fmt(value)}</td>)}<td>{fmt(9000 - plantIndex * 330)}</td><td>{fmt(8940 - plantIndex * 315)}</td></tr>)}</tbody></table></div></article></>
}

function FinancialsPage() {
  const periods = Array.from({ length: 13 }, (_, index) => `P${index + 1}`)
  const rows = [
    ['Oats contracted (MT)', ['—', '—', '—', '—', '—', '—', '204', '3,613', '5,470', '3,218', '—', '—', '—']],
    ['Open', ['—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '1,044', '525']],
    ['Oats received (MT)', ['0', '0', '0', '0', '0', '0', '204', '3,613', '5,470', '3,218', '0', '1,044', '525']],
    ['Oats received (KG)', ['0', '0', '0', '0', '0', '0', '204,025', '3,613,399', '5,470,000', '3,218,000', '0', '1,044,000', '525,000']],
    ['Forecast (C$/KG)', ['', '', '', '', '', '', '0.413', '0.411', '0.412', '0.419', '0.400', '0.400', '0.400']],
    ['Sustainability', ['', '', '', '', '', '', '', '', '', '0', '0', '0', '0']],
    ['Invoices (C$)', ['10,422', '', '', '', '', '', '', '', '', '', '', '', '']],
    ['Adjustments (C$)', ['', '', '', '0', '0', '0', '0', '0', '5,000', '5,000', '50,000', '65,000', '65,000']],
    ['Adjusted forecast (C$/KG)', ['', '', '', '', '', '', '0.413', '0.411', '0.413', '0.421', '', '0.463', '0.524']],
    ['Finance actual (C$/KG)', ['0.395', '0.392', '0.389', '0.386', '', '', '0.413', '0.411', '0.413', '0.421', '', '0.463', '0.524']],
  ]
  return <article className="surface table-surface"><SectionHeading title="Financial summary" detail="Commodity cost and invoice view by accounting period" action={<span className="tiny-label">2026 · C$</span>} /><div className="table-scroll"><table className="financial-table"><thead><tr><th>Metric</th>{periods.map((period) => <th key={period}>{period}</th>)}</tr></thead><tbody>{rows.map(([label, values], index) => <tr className={index === 7 ? 'financial-total' : ''} key={label}><td>{label}</td>{values.map((value, valueIndex) => <td className={index === 0 && valueIndex === 6 ? 'green-cell' : ''} key={valueIndex}>{value || '—'}</td>)}</tr>)}</tbody></table></div></article>
}

function ConfigurationPage({ section, setSection, rows, onAdd, onDelete, notify }) {
  const [query, setQuery] = useState('')
  const sections = ['Plants', 'Suppliers', 'Commodities', 'Users']
  const filteredRows = rows.filter((row) => row.toLowerCase().includes(query.toLowerCase()))
  return <article className="surface config-surface"><div className="config-header"><div className="tabs">{sections.map((name) => <button className={name === section ? 'selected' : ''} key={name} onClick={() => { setSection(name); setQuery('') }}>{name}</button>)}</div><button className="button primary" onClick={onAdd}><Plus size={16} /> Add record</button></div><div className="config-tools"><label className="search-field"><PackageSearch size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${section.toLowerCase()}`} /></label><button className="button secondary compact" onClick={() => notify(`${section} refreshed`)}><RefreshCw size={14} /> Refresh</button></div><div className="table-scroll"><table className="data-table"><thead><tr><th>{section.slice(0, -1)}</th><th>Record ID / role</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredRows.map((row) => { const [name, code] = row.split(' · '); const originalIndex = rows.indexOf(row); return <tr key={row}><td><strong>{name}</strong></td><td>{code || '—'}</td><td><span className="status-pill surplus">Active</span></td><td><button className="text-button" onClick={() => onDelete(originalIndex)}>Remove</button></td></tr> })}{filteredRows.length === 0 && <tr><td colSpan="4" className="empty-cell">No matching records.</td></tr>}</tbody></table></div></article>
}

export default App
