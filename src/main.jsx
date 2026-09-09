import React,{useEffect,useMemo,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {LayoutDashboard,Building2,ListTodo,AlertTriangle,Settings,Plus,LogOut,Loader2,X,RefreshCw,Search,NotebookPen,Paperclip,FileText,FileSpreadsheet,Download,Trash2} from 'lucide-react'
import {supabase,supabaseConfigured} from './supabase'
import './styles.css'

const STATUS=['A fazer','Em andamento','Aguardando cliente','Aguardando documento','Em revisão','Concluído']
const BUCKET='lr-observacoes'
const ALLOWED_EXT=['pdf','xls','xlsx','xlsm','csv']

function App(){
  const[s,setS]=useState(null),[boot,setBoot]=useState(true)
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{setS(data.session);setBoot(false)})
    const{data}=supabase.auth.onAuthStateChange((_e,ss)=>setS(ss))
    return()=>data.subscription.unsubscribe()
  },[])
  if(!supabaseConfigured)return <Setup/>
  if(boot)return <Loader/>
  return s?<Workspace session={s}/>:<Login/>
}

function Setup(){return <div className="center"><div className="auth"><h1>Central Lucro Real</h1><p>Configure o Supabase para iniciar.</p><code>VITE_SUPABASE_URL</code><code>VITE_SUPABASE_ANON_KEY</code></div></div>}

function Login(){
  const[mode,setMode]=useState('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[nome,setNome]=useState(''),[msg,setMsg]=useState(''),[load,setLoad]=useState(false)
  async function submit(e){
    e.preventDefault();setLoad(true);setMsg('')
    try{
      if(mode==='login'){
        const{error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error
      }else{
        const{data,error}=await supabase.auth.signUp({email,password,options:{data:{nome}}});if(error)throw error
        if(!data.session)setMsg('Conta criada. Verifique o e-mail se a confirmação estiver habilitada.')
      }
    }catch(e){setMsg(e.message)}finally{setLoad(false)}
  }
  return <div className="center"><div className="auth"><div className="logo">LR</div><h1>Central Lucro Real</h1><p>{mode==='login'?'Entre com seu e-mail e senha.':'Crie seu acesso.'}</p><form onSubmit={submit}>{mode==='signup'&&<label>Nome<input value={nome} onChange={e=>setNome(e.target.value)} required/></label>}<label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Senha<input type="password" minLength="6" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{msg&&<div className="msg">{msg}</div>}<button className="primary" disabled={load}>{load?<Loader2 className="spin" size={18}/>:null}{mode==='login'?'Entrar':'Criar conta'}</button></form><button className="link" onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'Primeiro acesso? Criar conta':'Já tenho acesso'}</button></div></div>
}

function Workspace({session}){
  const[page,setPage]=useState('Dashboard'),[emp,setEmp]=useState([]),[dem,setDem]=useState([]),[load,setLoad]=useState(true),[me,setMe]=useState(false),[md,setMd]=useState(false),[edit,setEdit]=useState(null),[q,setQ]=useState('')
  async function reload(){
    setLoad(true)
    const[a,b]=await Promise.all([
      supabase.from('lr_empresas').select('*').order('nome'),
      supabase.from('lr_demandas').select('*,lr_empresas(nome)').order('prazo')
    ])
    if(a.error||b.error)alert((a.error||b.error).message)
    setEmp(a.data||[]);setDem(b.data||[]);setLoad(false)
  }
  useEffect(()=>{reload()},[])
  const stats=useMemo(()=>{let h=new Date().toISOString().slice(0,10);return{ab:dem.filter(x=>x.status!=='Concluído').length,at:dem.filter(x=>x.status!=='Concluído'&&x.prazo&&x.prazo<h).length,ag:dem.filter(x=>x.status?.startsWith('Aguardando')).length,co:dem.filter(x=>x.status==='Concluído').length}},[dem])
  const nav=[['Dashboard',LayoutDashboard],['Empresas',Building2],['Demandas',ListTodo],['Pendências',AlertTriangle],['Observações',NotebookPen],['Configurações',Settings]]
  const filt=dem.filter(d=>!q||`${d.titulo} ${d.lr_empresas?.nome}`.toLowerCase().includes(q.toLowerCase()))
  return <div className="app"><aside><div className="brand"><div className="logo">LR</div><div><b>Central Lucro Real</b><small>Fiscal + Contábil</small></div></div><nav>{nav.map(([n,I])=><button className={page===n?'active':''} onClick={()=>setPage(n)} key={n}><I size={18}/>{n}</button>)}</nav><div className="user"><small>{session.user.email}</small><button onClick={()=>supabase.auth.signOut()}><LogOut size={16}/>Sair</button></div></aside><main><header><div><h1>{page}</h1><p>{page==='Observações'?'Mural compartilhado de notas e documentos':'Banco de dados Supabase'}</p></div><div className="actions"><button className="secondary" onClick={reload}><RefreshCw size={17}/></button>{page==='Empresas'?<button className="primary" onClick={()=>setMe(true)}><Plus size={18}/>Empresa</button>:page==='Observações'?null:<button className="primary" onClick={()=>{setEdit(null);setMd(true)}}><Plus size={18}/>Nova demanda</button>}</div></header>{load?<Loader small/>:<>{page==='Dashboard'&&<Dashboard s={stats} dem={dem}/>} {page==='Empresas'&&<Empresas emp={emp} dem={dem} reload={reload}/>} {page==='Demandas'&&<Demandas dem={filt} q={q} setQ={setQ} reload={reload} edit={d=>{setEdit(d);setMd(true)}}/>} {page==='Pendências'&&<Pendencias dem={dem}/>} {page==='Observações'&&<Observacoes emp={emp} session={session}/>} {page==='Configurações'&&<div className="card"><b>Acesso atual</b><p>{session.user.email}</p><p>Login e senha são gerenciados pelo Supabase Auth.</p></div>}</>}</main>{me&&<EmpresaModal close={()=>setMe(false)} save={async f=>{const{error}=await supabase.from('lr_empresas').insert({...f,criado_por:session.user.id});if(error)return alert(error.message);setMe(false);reload()}}/>}{md&&<DemandaModal emp={emp} initial={edit} close={()=>setMd(false)} save={async f=>{const payload={...f,criado_por:session.user.id};const r=edit?await supabase.from('lr_demandas').update(payload).eq('id',edit.id):await supabase.from('lr_demandas').insert(payload);if(r.error)return alert(r.error.message);setMd(false);setEdit(null);reload()}}/>}</div>
}

function Dashboard({s,dem}){return <><section className="stats"><Stat t="Abertas" v={s.ab}/><Stat t="Atrasadas" v={s.at}/><Stat t="Aguardando" v={s.ag}/><Stat t="Concluídas" v={s.co}/></section><div className="card"><h3>Próximos prazos</h3>{dem.length?dem.filter(d=>d.status!=='Concluído').slice(0,8).map(d=><Row key={d.id} d={d}/>):<Empty t="Nenhuma demanda cadastrada."/>}</div></>}
const Stat=({t,v})=><div className="stat"><small>{t}</small><b>{v}</b></div>

function Empresas({emp,dem,reload}){if(!emp.length)return <Empty t="Nenhuma empresa cadastrada."/>;return <div className="grid">{emp.map(e=><div className="company" key={e.id}><div className="avatar">{e.nome.slice(0,2).toUpperCase()}</div><div><b>{e.nome}</b><small>{e.cnpj||'CNPJ não informado'}</small><span>{dem.filter(d=>d.empresa_id===e.id&&d.status!=='Concluído').length} demandas abertas</span></div><button className="danger" onClick={async()=>{if(!confirm('Excluir empresa e suas demandas?'))return;const{error}=await supabase.from('lr_empresas').delete().eq('id',e.id);if(error)return alert(error.message);reload()}}>Excluir</button></div>)}</div>}

function Demandas({dem,q,setQ,reload,edit}){return <><div className="search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar empresa ou demanda..."/></div><div className="card table">{dem.length?<table><thead><tr><th>Empresa</th><th>Demanda</th><th>Setor</th><th>Competência</th><th>Prazo</th><th>Responsável</th><th>Status</th><th></th></tr></thead><tbody>{dem.map(d=><tr key={d.id}><td>{d.lr_empresas?.nome}</td><td><b>{d.titulo}</b><small>{d.categoria}</small></td><td>{d.setor}</td><td>{d.competencia||'—'}</td><td>{fmt(d.prazo)}</td><td>{d.responsavel_nome||'—'}</td><td><select value={d.status} onChange={async e=>{const{error}=await supabase.from('lr_demandas').update({status:e.target.value}).eq('id',d.id);if(error)return alert(error.message);reload()}}>{STATUS.map(s=><option key={s}>{s}</option>)}</select></td><td><button className="link" onClick={()=>edit(d)}>Editar</button></td></tr>)}</tbody></table>:<Empty t="Nenhuma demanda encontrada."/>}</div></>}

function Pendencias({dem}){const p=dem.filter(d=>d.status?.startsWith('Aguardando'));return <div className="card">{p.length?p.map(d=><div className="pending" key={d.id}><div><b>{d.lr_empresas?.nome}</b><small>{d.observacao||d.titulo}</small></div><button onClick={async()=>{await navigator.clipboard.writeText(`Olá! Para concluirmos o fechamento da empresa ${d.lr_empresas?.nome||''}, competência ${d.competencia||''}, ainda precisamos de: ${d.observacao||d.titulo}.`);alert('Mensagem copiada.')}}>Copiar mensagem</button></div>):<Empty t="Nenhuma pendência aguardando cliente/documento."/>}</div>}

function Observacoes({emp,session}){
  const[obs,setObs]=useState([]),[anexos,setAnexos]=useState([]),[loading,setLoading]=useState(true),[modal,setModal]=useState(false),[query,setQuery]=useState(''),[empresaFiltro,setEmpresaFiltro]=useState('Todas'),[uploading,setUploading]=useState(false)

  async function reloadObs(){
    setLoading(true)
    const[a,b]=await Promise.all([
      supabase.from('lr_observacoes').select('*,lr_empresas(nome)').order('criado_em',{ascending:false}),
      supabase.from('lr_observacao_anexos').select('*').order('criado_em',{ascending:true})
    ])
    if(a.error||b.error){alert((a.error||b.error).message);setLoading(false);return}
    setObs(a.data||[]);setAnexos(b.data||[]);setLoading(false)
  }
  useEffect(()=>{reloadObs()},[])

  const visible=obs.filter(o=>{
    const hay=`${o.titulo} ${o.texto} ${o.lr_empresas?.nome||''} ${o.autor_nome||''}`.toLowerCase()
    return (!query||hay.includes(query.toLowerCase()))&&(empresaFiltro==='Todas'||o.empresa_id===empresaFiltro)
  })

  async function saveObservation(form,files){
    setUploading(true)
    try{
      const autor=session.user.user_metadata?.nome||session.user.email
      const{data:created,error}=await supabase.from('lr_observacoes').insert({
        empresa_id:form.empresa_id||null,
        titulo:form.titulo,
        texto:form.texto,
        autor_id:session.user.id,
        autor_nome:autor
      }).select().single()
      if(error)throw error

      for(const file of files){
        const ext=file.name.split('.').pop()?.toLowerCase()
        if(!ALLOWED_EXT.includes(ext))throw new Error(`Arquivo não permitido: ${file.name}`)
        if(file.size>20*1024*1024)throw new Error(`${file.name} ultrapassa 20 MB.`)
        const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_')
        const path=`${created.id}/${Date.now()}-${safeName}`
        const up=await supabase.storage.from(BUCKET).upload(path,file,{upsert:false})
        if(up.error)throw up.error
        const meta=await supabase.from('lr_observacao_anexos').insert({observacao_id:created.id,nome:file.name,caminho:path,tipo:file.type||ext,tamanho:file.size})
        if(meta.error)throw meta.error
      }
      setModal(false);await reloadObs()
    }catch(e){alert(e.message||'Não foi possível salvar a observação.')}finally{setUploading(false)}
  }

  async function downloadAttachment(a){
    const{data,error}=await supabase.storage.from(BUCKET).download(a.caminho)
    if(error)return alert(error.message)
    const url=URL.createObjectURL(data);const link=document.createElement('a');link.href=url;link.download=a.nome;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url)
  }

  async function deleteObservation(o){
    if(!confirm(`Excluir a observação “${o.titulo}” e todos os anexos?`))return
    const list=anexos.filter(a=>a.observacao_id===o.id)
    if(list.length){const{error:se}=await supabase.storage.from(BUCKET).remove(list.map(a=>a.caminho));if(se)return alert(se.message)}
    const{error}=await supabase.from('lr_observacoes').delete().eq('id',o.id)
    if(error)return alert(error.message)
    reloadObs()
  }

  return <>
    <div className="obsToolbar">
      <div className="search obsSearch"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar no mural..."/></div>
      <select value={empresaFiltro} onChange={e=>setEmpresaFiltro(e.target.value)}><option>Todas</option>{emp.map(e=><option value={e.id} key={e.id}>{e.nome}</option>)}</select>
      <button className="primary" onClick={()=>setModal(true)}><Plus size={18}/>Nova observação</button>
    </div>

    {loading?<Loader small/>:visible.length===0?<div className="obsEmpty"><NotebookPen size={34}/><b>Nenhuma observação no mural</b><span>Crie notas compartilhadas e anexe planilhas ou PDFs.</span></div>:<div className="mural">{visible.map(o=>{
      const files=anexos.filter(a=>a.observacao_id===o.id)
      return <article className="noteCard" key={o.id}>
        <div className="noteTop"><div>{o.lr_empresas?.nome&&<span className="companyTag">{o.lr_empresas.nome}</span>}<h3>{o.titulo}</h3></div><button className="iconDanger" title="Excluir observação" onClick={()=>deleteObservation(o)}><Trash2 size={17}/></button></div>
        <p className="noteText">{o.texto}</p>
        {files.length>0&&<div className="attachments"><div className="attachmentsTitle"><Paperclip size={15}/>{files.length} {files.length===1?'anexo':'anexos'}</div>{files.map(a=><button className="fileChip" onClick={()=>downloadAttachment(a)} key={a.id}>{isPdf(a)?<FileText size={18}/>:<FileSpreadsheet size={18}/>}<span><b>{a.nome}</b><small>{formatBytes(a.tamanho)}</small></span><Download size={16}/></button>)}</div>}
        <footer className="noteFooter"><span>{o.autor_nome||'Usuário'}</span><span>{formatDateTime(o.criado_em)}</span></footer>
      </article>
    })}</div>}

    {modal&&<ObservacaoModal emp={emp} uploading={uploading} close={()=>!uploading&&setModal(false)} save={saveObservation}/>}  
  </>
}

function ObservacaoModal({emp,uploading,close,save}){
  const[f,setF]=useState({empresa_id:'',titulo:'',texto:''}),[files,setFiles]=useState([])
  function pick(e){
    const chosen=[...e.target.files]
    const invalid=chosen.find(file=>!ALLOWED_EXT.includes(file.name.split('.').pop()?.toLowerCase()))
    if(invalid)return alert('Aceitamos apenas PDF e arquivos de Excel (.xls, .xlsx, .xlsm) ou CSV.')
    setFiles(chosen)
  }
  return <Modal title="Nova observação" close={close}><div className="form"><label>Empresa (opcional)<select value={f.empresa_id} onChange={e=>setF({...f,empresa_id:e.target.value})}><option value="">Observação geral</option>{emp.map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</select></label><label className="full">Título<input value={f.titulo} onChange={e=>setF({...f,titulo:e.target.value})} placeholder="Ex.: Ajustes do fechamento de setembro"/></label><label className="full">Observação<textarea rows="7" value={f.texto} onChange={e=>setF({...f,texto:e.target.value})} placeholder="Escreva a observação com detalhes..."/></label><label className="full">Anexos<div className="uploadBox"><Paperclip size={20}/><div><b>Anexar Excel ou PDF</b><small>PDF, XLS, XLSX, XLSM ou CSV • até 20 MB por arquivo</small></div><input type="file" multiple accept=".pdf,.xls,.xlsx,.xlsm,.csv,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={pick}/></div>{files.length>0&&<div className="selectedFiles">{files.map((x,i)=><span key={i}>{x.name}</span>)}</div>}</label></div><div className="modalActions"><button disabled={uploading} onClick={close}>Cancelar</button><button className="primary" disabled={uploading||!f.titulo.trim()||!f.texto.trim()} onClick={()=>save(f,files)}>{uploading?<Loader2 className="spin" size={17}/>:<Plus size={17}/>}Publicar no mural</button></div></Modal>
}

function EmpresaModal({close,save}){const[f,setF]=useState({nome:'',cnpj:'',ativo:true});return <Modal title="Nova empresa" close={close}><label>Nome<input value={f.nome} onChange={e=>setF({...f,nome:e.target.value})}/></label><label>CNPJ<input value={f.cnpj} onChange={e=>setF({...f,cnpj:e.target.value})}/></label><div className="modalActions"><button onClick={close}>Cancelar</button><button className="primary" onClick={()=>f.nome.trim()&&save(f)}>Salvar</button></div></Modal>}

function DemandaModal({emp,initial,close,save}){const[f,setF]=useState({empresa_id:initial?.empresa_id||'',titulo:initial?.titulo||'',setor:initial?.setor||'Fiscal',categoria:initial?.categoria||'',competencia:initial?.competencia||'',prazo:initial?.prazo||'',responsavel_nome:initial?.responsavel_nome||'',prioridade:initial?.prioridade||'Média',status:initial?.status||'A fazer',observacao:initial?.observacao||''});const ch=(k,v)=>setF({...f,[k]:v});return <Modal title={initial?'Editar demanda':'Nova demanda'} close={close}>{!emp.length?<div className="msg">Cadastre uma empresa primeiro.</div>:<><div className="form"><label>Empresa<select value={f.empresa_id} onChange={e=>ch('empresa_id',e.target.value)}><option value="">Selecione...</option>{emp.map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</select></label><label>Setor<select value={f.setor} onChange={e=>ch('setor',e.target.value)}><option>Fiscal</option><option>Contábil</option></select></label><label className="full">Título<input value={f.titulo} onChange={e=>ch('titulo',e.target.value)}/></label><label>Categoria<input value={f.categoria} onChange={e=>ch('categoria',e.target.value)}/></label><label>Competência<input value={f.competencia} onChange={e=>ch('competencia',e.target.value)} placeholder="09/2026"/></label><label>Prazo<input type="date" value={f.prazo} onChange={e=>ch('prazo',e.target.value)}/></label><label>Responsável<input value={f.responsavel_nome} onChange={e=>ch('responsavel_nome',e.target.value)}/></label><label>Prioridade<select value={f.prioridade} onChange={e=>ch('prioridade',e.target.value)}><option>Baixa</option><option>Média</option><option>Alta</option></select></label><label>Status<select value={f.status} onChange={e=>ch('status',e.target.value)}>{STATUS.map(s=><option key={s}>{s}</option>)}</select></label><label className="full">Observações<textarea rows="3" value={f.observacao} onChange={e=>ch('observacao',e.target.value)}/></label></div><div className="modalActions"><button onClick={close}>Cancelar</button><button className="primary" onClick={()=>f.empresa_id&&f.titulo.trim()&&save(f)}>Salvar</button></div></>}</Modal>}

function Modal({title,close,children}){return <div className="overlay"><div className="modal"><div className="modalHead"><h2>{title}</h2><button onClick={close}><X/></button></div>{children}</div></div>}
const Row=({d})=><div className="row"><div><b>{d.titulo}</b><small>{d.lr_empresas?.nome} • {d.setor}</small></div><div><span>{d.status}</span><small>{fmt(d.prazo)}</small></div></div>
const Empty=({t})=><div className="empty">{t}</div>
const Loader=({small})=><div className={small?'loader small':'loader'}><Loader2 className="spin"/><span>Carregando...</span></div>
function fmt(s){if(!s)return'—';const[y,m,d]=s.split('-');return`${d}/${m}/${y}`}
function formatDateTime(s){if(!s)return'';return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(s))}
function formatBytes(n){if(!n)return'';if(n<1024)return`${n} B`;if(n<1024*1024)return`${(n/1024).toFixed(1)} KB`;return`${(n/1024/1024).toFixed(1)} MB`}
function isPdf(a){return a.tipo?.includes('pdf')||a.nome?.toLowerCase().endsWith('.pdf')}

createRoot(document.getElementById('root')).render(<App/>)
