import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LayoutDashboard, Building2, ListTodo, CalendarDays, AlertTriangle, Settings, Plus, Search, CheckCircle2, Clock, FileWarning, UserRound, X } from 'lucide-react'
import { companies, initialTasks, fiscalCategories, accountingCategories } from './data'
import { supabaseEnabled } from './supabase'
import './styles.css'

const statuses = ['A fazer','Em andamento','Aguardando cliente','Aguardando documento','Em revisão','Concluído']

function badgeClass(status) {
  const s = status.toLowerCase()
  if (s.includes('concluído')) return 'green'
  if (s.includes('andamento') || s.includes('revisão')) return 'blue'
  if (s.includes('aguardando')) return 'gray'
  return 'amber'
}

function App() {
  const [page, setPage] = useState('Dashboard')
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('clr_tasks')) || initialTasks
    } catch { return initialTasks }
  })
  const [filter, setFilter] = useState('')
  const [area, setArea] = useState('Todos')
  const [owner, setOwner] = useState('Todos')
  const [modal, setModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)

  const saveTasks = (next) => {
    setTasks(next)
    localStorage.setItem('clr_tasks', JSON.stringify(next))
  }

  const filtered = useMemo(() => tasks.filter(t => {
    const company = companies.find(c => c.id === t.companyId)?.name || ''
    const hay = `${t.title} ${company} ${t.category}`.toLowerCase()
    return (!filter || hay.includes(filter.toLowerCase()))
      && (area === 'Todos' || t.area === area)
      && (owner === 'Todos' || t.owner === owner)
  }), [tasks, filter, area, owner])

  const stats = {
    open: tasks.filter(t => t.status !== 'Concluído').length,
    waiting: tasks.filter(t => t.status.includes('Aguardando')).length,
    done: tasks.filter(t => t.status === 'Concluído').length,
    late: tasks.filter(t => t.status !== 'Concluído' && new Date(t.due) < new Date('2026-09-09')).length,
  }

  const updateStatus = (id, status) => saveTasks(tasks.map(t => t.id === id ? {...t, status} : t))

  const nav = [
    ['Dashboard', LayoutDashboard],['Empresas', Building2],['Demandas', ListTodo],
    ['Fechamentos', CalendarDays],['Pendências', AlertTriangle],['Configurações', Settings]
  ]

  return <div className="app">
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">LR</div>
        <div><strong>Central Lucro Real</strong><small>Fiscal + Contábil</small></div>
      </div>
      <nav>
        {nav.map(([name, Icon]) => <button key={name} className={page===name?'active':''} onClick={()=>setPage(name)}>
          <Icon size={18}/><span>{name}</span>
        </button>)}
      </nav>
      <div className="sync">{supabaseEnabled ? '● Supabase conectado' : '● Modo protótipo local'}</div>
    </aside>

    <main>
      <header>
        <div>
          <h1>{page}</h1>
          <p>Controle de fechamento e demandas do Lucro Real</p>
        </div>
        <button className="primary" onClick={()=>setModal(true)}><Plus size={18}/> Nova demanda</button>
      </header>

      {page==='Dashboard' && <>
        <section className="stats">
          <Stat title="Demandas abertas" value={stats.open} icon={<ListTodo/>}/>
          <Stat title="Atrasadas" value={stats.late} icon={<FileWarning/>} danger/>
          <Stat title="Aguardando cliente" value={stats.waiting} icon={<Clock/>}/>
          <Stat title="Concluídas" value={stats.done} icon={<CheckCircle2/>}/>
        </section>
        <section className="grid2">
          <Card title="Próximos prazos">
            {tasks.filter(t=>t.status!=='Concluído').slice(0,5).map(t=><TaskRow key={t.id} task={t}/>)}
          </Card>
          <Card title="Empresas">
            {companies.map(c=><div key={c.id} className="companyRow" onClick={()=>{setSelectedCompany(c);setPage('Empresas')}}>
              <div><strong>{c.name}</strong><small>{c.cnpj}</small></div>
              <span className={`pill ${c.status==='Crítico'?'red':c.status==='Atenção'?'amber':'green'}`}>{c.status}</span>
            </div>)}
          </Card>
        </section>
      </>}

      {page==='Demandas' && <Demandas tasks={filtered} filter={filter} setFilter={setFilter} area={area} setArea={setArea} owner={owner} setOwner={setOwner} updateStatus={updateStatus}/>}

      {page==='Empresas' && <Empresas selected={selectedCompany} setSelected={setSelectedCompany} tasks={tasks}/>}
      {page==='Fechamentos' && <Fechamentos tasks={tasks} updateStatus={updateStatus}/>}
      {page==='Pendências' && <Pendencias tasks={tasks}/>}
      {page==='Configurações' && <SettingsPage/>}
    </main>

    {modal && <TaskModal onClose={()=>setModal(false)} onSave={(task)=>{
      saveTasks([...tasks, {...task, id: Date.now()}]); setModal(false)
    }}/>}
  </div>
}

function Stat({title,value,icon,danger}) {
  return <div className={`stat ${danger?'danger':''}`}><div className="statIcon">{icon}</div><div><small>{title}</small><strong>{value}</strong></div></div>
}

function Card({title,children}) {
  return <div className="card"><div className="cardTitle">{title}</div>{children}</div>
}

function TaskRow({task}) {
  const company = companies.find(c=>c.id===task.companyId)
  return <div className="taskRow">
    <div><strong>{task.title}</strong><small>{company?.name} • {task.area}</small></div>
    <div><span className={`pill ${badgeClass(task.status)}`}>{task.status}</span><small>{task.due.split('-').reverse().join('/')}</small></div>
  </div>
}

function Demandas({tasks,filter,setFilter,area,setArea,owner,setOwner,updateStatus}) {
  return <>
    <div className="filters">
      <label className="search"><Search size={17}/><input placeholder="Buscar demanda ou empresa..." value={filter} onChange={e=>setFilter(e.target.value)}/></label>
      <select value={area} onChange={e=>setArea(e.target.value)}><option>Todos</option><option>Fiscal</option><option>Contábil</option></select>
      <select value={owner} onChange={e=>setOwner(e.target.value)}><option>Todos</option><option>Eduardo</option><option>Irmã</option></select>
    </div>
    <div className="card tableWrap">
      <table><thead><tr><th>Empresa</th><th>Demanda</th><th>Setor</th><th>Competência</th><th>Prazo</th><th>Responsável</th><th>Status</th></tr></thead>
      <tbody>{tasks.map(t=>{
        const c=companies.find(x=>x.id===t.companyId)
        return <tr key={t.id}><td>{c?.name}</td><td><strong>{t.title}</strong><small>{t.category}</small></td><td>{t.area}</td><td>{t.competence}</td><td>{t.due.split('-').reverse().join('/')}</td><td>{t.owner}</td>
        <td><select value={t.status} onChange={e=>updateStatus(t.id,e.target.value)} className="statusSelect">{statuses.map(s=><option key={s}>{s}</option>)}</select></td></tr>
      })}</tbody></table>
    </div>
  </>
}

function Empresas({selected,setSelected,tasks}) {
  if (selected) {
    const ct = tasks.filter(t=>t.companyId===selected.id)
    return <>
      <button className="linkBtn" onClick={()=>setSelected(null)}>← Voltar para empresas</button>
      <div className="companyHeader"><div><h2>{selected.name}</h2><p>{selected.cnpj}</p></div><span className="pill blue">{ct.filter(t=>t.status!=='Concluído').length} abertas</span></div>
      <div className="tabs"><button className="active">Visão Geral</button><button>Fiscal</button><button>Contábil</button><button>Pendências do Cliente</button><button>Histórico</button></div>
      <div className="card">{ct.map(t=><TaskRow key={t.id} task={t}/>)}</div>
    </>
  }
  return <div className="companyGrid">{companies.map(c=>{
    const open=tasks.filter(t=>t.companyId===c.id&&t.status!=='Concluído').length
    return <button className="companyCard" key={c.id} onClick={()=>setSelected(c)}>
      <div className="companyAvatar">{c.name.slice(0,2).toUpperCase()}</div>
      <div><strong>{c.name}</strong><small>{c.cnpj}</small><span>{open} demandas abertas</span></div>
      <span className={`pill ${c.status==='Crítico'?'red':c.status==='Atenção'?'amber':'green'}`}>{c.status}</span>
    </button>
  })}</div>
}

function Fechamentos({tasks,updateStatus}) {
  return <div className="kanban">{statuses.map(status=><div className="kanbanCol" key={status}>
    <div className="kanbanHead"><strong>{status}</strong><span>{tasks.filter(t=>t.status===status).length}</span></div>
    {tasks.filter(t=>t.status===status).map(t=><div className="kanbanCard" key={t.id}>
      <small>{companies.find(c=>c.id===t.companyId)?.name}</small><strong>{t.title}</strong>
      <div><span>{t.area}</span><span>{t.owner}</span></div>
      <select value={t.status} onChange={e=>updateStatus(t.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select>
    </div>)}
  </div>)}</div>
}

function Pendencias({tasks}) {
  const pending = tasks.filter(t=>t.status.includes('Aguardando'))
  const copy = async (t) => {
    const company = companies.find(c=>c.id===t.companyId)?.name
    const msg = `Olá! Para concluirmos o fechamento da empresa ${company}, competência ${t.competence}, ainda precisamos do seguinte item: ${t.notes || t.title}.`
    await navigator.clipboard.writeText(msg)
    alert('Mensagem copiada para a área de transferência.')
  }
  return <div className="card">
    {pending.length===0?<p>Nenhuma pendência aguardando cliente/documento.</p>:pending.map(t=><div className="pendingRow" key={t.id}>
      <div><strong>{companies.find(c=>c.id===t.companyId)?.name}</strong><small>{t.notes || t.title}</small></div>
      <button onClick={()=>copy(t)}>Copiar mensagem WhatsApp</button>
    </div>)}
  </div>
}

function SettingsPage() {
  return <div className="grid2">
    <Card title="Integração Supabase"><p>Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env e também nas variáveis de ambiente da Netlify.</p></Card>
    <Card title="Responsáveis"><div className="person"><UserRound/> Eduardo</div><div className="person"><UserRound/> Irmã</div></Card>
  </div>
}

function TaskModal({onClose,onSave}) {
  const [area,setArea]=useState('Fiscal')
  const [form,setForm]=useState({companyId:1,title:'',area:'Fiscal',category:fiscalCategories[0],competence:'09/2026',due:'2026-09-15',owner:'Eduardo',priority:'Média',status:'A fazer',notes:''})
  const categories = area==='Fiscal'?fiscalCategories:accountingCategories
  const change=(k,v)=>setForm(f=>({...f,[k]:v}))
  return <div className="overlay"><div className="modal">
    <div className="modalHead"><div><h2>Nova demanda</h2><p>Cadastre uma atividade fiscal ou contábil.</p></div><button onClick={onClose}><X/></button></div>
    <div className="formGrid">
      <label>Empresa<select value={form.companyId} onChange={e=>change('companyId',Number(e.target.value))}>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Setor<select value={area} onChange={e=>{setArea(e.target.value);change('area',e.target.value);change('category',e.target.value==='Fiscal'?fiscalCategories[0]:accountingCategories[0])}}><option>Fiscal</option><option>Contábil</option></select></label>
      <label className="full">Título<input value={form.title} onChange={e=>change('title',e.target.value)} placeholder="Ex.: Apuração ICMS"/></label>
      <label>Categoria<select value={form.category} onChange={e=>change('category',e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Competência<input value={form.competence} onChange={e=>change('competence',e.target.value)}/></label>
      <label>Prazo<input type="date" value={form.due} onChange={e=>change('due',e.target.value)}/></label>
      <label>Responsável<select value={form.owner} onChange={e=>change('owner',e.target.value)}><option>Eduardo</option><option>Irmã</option></select></label>
      <label>Prioridade<select value={form.priority} onChange={e=>change('priority',e.target.value)}><option>Baixa</option><option>Média</option><option>Alta</option></select></label>
      <label>Status<select value={form.status} onChange={e=>change('status',e.target.value)}>{statuses.map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="full">Observações<textarea value={form.notes} onChange={e=>change('notes',e.target.value)} rows="3"/></label>
    </div>
    <div className="modalActions"><button onClick={onClose}>Cancelar</button><button className="primary" onClick={()=>form.title.trim()&&onSave({...form,area})}>Salvar demanda</button></div>
  </div></div>
}

createRoot(document.getElementById('root')).render(<App/>)
