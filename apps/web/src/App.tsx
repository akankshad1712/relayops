import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Check, ChevronDown,
  CircleHelp, Clock3, Command, Cpu, Filter, Gauge, GitBranch, LayoutDashboard,
  LifeBuoy, LockKeyhole, Menu, MoreHorizontal, Plus, Search, Server, Settings2,
  ShieldCheck, Sparkles, Zap, X, Radio, CircleDot, CircleAlert, CheckCircle2
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type Incident = { id: string; title: string; service: string; severity: string; status: string; age: string; owner: string };
const demoIncidents: Incident[] = [
  { id: "INC-2841", title: "Elevated checkout latency in EU-West", service: "Payments API", severity: "SEV-2", status: "Monitoring", age: "12m ago", owner: "AD" },
  { id: "INC-2840", title: "Intermittent token refresh failures", service: "Identity Gateway", severity: "SEV-2", status: "Identified", age: "38m ago", owner: "AD" },
  { id: "INC-2839", title: "Delayed event delivery for analytics", service: "Event Pipeline", severity: "SEV-3", status: "Resolved", age: "2h ago", owner: "AD" },
  { id: "INC-2838", title: "Elevated p95 latency on profile reads", service: "Customer Console", severity: "SEV-3", status: "Resolved", age: "5h ago", owner: "AD" },
  { id: "INC-2837", title: "Webhook retries above baseline", service: "Event Pipeline", severity: "SEV-4", status: "Resolved", age: "1d ago", owner: "AD" },
];
const services = [
  { name: "Payments API", detail: "Core Payments", uptime: "99.98%", status: "Operational", latency: "124 ms", color: "green" },
  { name: "Identity Gateway", detail: "Platform", uptime: "99.91%", status: "Degraded", latency: "482 ms", color: "amber" },
  { name: "Event Pipeline", detail: "Data Infrastructure", uptime: "99.96%", status: "Operational", latency: "86 ms", color: "green" },
  { name: "Customer Console", detail: "Experience", uptime: "99.99%", status: "Operational", latency: "92 ms", color: "green" },
];
const trend = [
  { day: "Mon", incidents: 6 }, { day: "Tue", incidents: 4 }, { day: "Wed", incidents: 7 },
  { day: "Thu", incidents: 3 }, { day: "Fri", incidents: 5 }, { day: "Sat", incidents: 2 }, { day: "Sun", incidents: 3 },
];
const severityClass: Record<string,string> = { "SEV-1":"sev1", "SEV-2":"sev2", "SEV-3":"sev3", "SEV-4":"sev4" };
const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export default function App() {
  const [page, setPage] = useState("Overview");
  const [incidents, setIncidents] = useState(demoIncidents);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All incidents");
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState("");
  const [apiState, setApiState] = useState<"demo"|"connected">("demo");
  const [mobileNav, setMobileNav] = useState(false);
  const [form, setForm] = useState({ title: "", service: "Payments API", severity: "SEV-3", summary: "" });

  useEffect(() => {
    const token = localStorage.getItem("relayops_token");
    if (!token) return;
    fetch(`${API}/incidents?limit=20`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(payload => {
        const mapped = (payload.data || []).map((x: any) => ({
          id: x.id.slice(-6).toUpperCase(), title: x.title, service: x.service?.name || "Unknown service",
          severity: x.severity.replace("SEV", "SEV-"), status: x.status.charAt(0) + x.status.slice(1).toLowerCase(),
          age: new Date(x.createdAt).toLocaleString(), owner: (x.owner?.name || "U").split(" ").map((p: string)=>p[0]).join("").slice(0,2)
        }));
        setIncidents(mapped); setApiState("connected");
      }).catch(() => setApiState("demo"));
  }, []);

  const filtered = useMemo(() => incidents.filter(i =>
    `${i.id} ${i.title} ${i.service}`.toLowerCase().includes(query.toLowerCase()) &&
    (filter === "All incidents" || i.status.toLowerCase() === filter.toLowerCase())
  ), [incidents, query, filter]);

  function createIncident(e: React.FormEvent) {
    e.preventDefault();
    const next = { id: `INC-${2842 + incidents.length}`, title: form.title, service: form.service, severity: form.severity, status: "Investigating", age: "just now", owner: "AD" };
    setIncidents([next, ...incidents]);
    setShowCreate(false); setForm({ title: "", service: "Payments API", severity: "SEV-3", summary: "" });
    setNotice("Incident created in this preview. Connect the API to persist data."); setTimeout(() => setNotice(""), 4200);
  }

  const navItems = [
    { label: "WORKSPACE", items: [{name:"Overview",icon:LayoutDashboard},{name:"Incidents",icon:CircleAlert},{name:"Services",icon:Server},{name:"Postmortems",icon:GitBranch}] },
    { label: "MANAGE", items: [{name:"On-call",icon:Radio},{name:"Integrations",icon:Zap},{name:"Settings",icon:Settings2}] }
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Activity size={19} strokeWidth={2.6}/></div><span>relay<span className="brand-light">ops</span></span><span className="brand-tag">BETA</span><button className="icon-btn mobile-close" onClick={()=>setMobileNav(false)}><X size={17}/></button></div>
      <div className="workspace-switch"><div className="workspace-avatar">A</div><div className="workspace-copy"><strong>Akanksha's Reliability Lab</strong><span>Pro workspace</span></div><ChevronDown size={15} className="muted"/></div>
      <div className="nav-groups">{navItems.map(group=><div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item=><button key={item.name} onClick={()=>{setPage(item.name);setMobileNav(false)}} className={`nav-item ${page===item.name?"active":""}`}><item.icon size={17}/><span>{item.name}</span>{item.name==="Incidents"&&<span className="nav-count">{incidents.filter(i=>i.status!=="Resolved").length}</span>}</button>)}</div>)}</div>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={16}/></div><strong>Reliability, elevated.</strong><p>Get more signal from every incident.</p><button onClick={()=>setNotice("You're already exploring the RelayOps Pro preview.")}>Explore Pro <ArrowRight size={13}/></button></div>
        <div className="user-profile"><div className="user-avatar">AD</div><div className="user-copy"><strong>Akanksha Deshmukh</strong><span>Software Engineer</span></div><MoreHorizontal size={17} className="muted"/></div>
      </div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="topbar-left"><button className="icon-btn mobile-menu" onClick={()=>setMobileNav(true)}><Menu size={19}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{page}</b></div><span className="environment"><i/> All systems monitored</span></div><div className="topbar-actions"><div className="command-search"><Search size={15}/><span>Search anything...</span><kbd>⌘ K</kbd></div><button className="icon-btn notification" aria-label="Notifications" onClick={()=>setNotice("You're all caught up. No new notifications.")}><Bell size={17}/><i/></button><div className="top-divider"/><button className="help-btn" onClick={()=>setNotice("Help center: see README.md, docs/ARCHITECTURE.md, and docs/API.md for setup and architecture.")}><CircleHelp size={17}/><span>Help</span></button></div></header>

      <div className="page-wrap">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> THURSDAY, OCTOBER 22, 2026</div><h1>{page==="Overview"?"Good morning, Akanksha":page}</h1><p className="page-subtitle">{page==="Overview"?"Here's what's happening across your services today.":page==="Incidents"?"Track, triage, and resolve incidents across your services.":page==="Services"?"A live pulse check on the services your customers depend on.":`Your ${page.toLowerCase()} workspace, all in one place.`}</p></div><div className="heading-actions"><span className={`data-mode ${apiState}`}><span/>{apiState==="connected"?"API connected":"Demo preview"}</span><button className="btn-primary" onClick={()=>setShowCreate(true)}><Plus size={16}/> New incident</button></div></div>

        {page==="Overview" && <>
          <section className="metric-grid">
            <Metric icon={<CircleAlert size={16}/>} label="Open incidents" value={String(incidents.filter(i=>i.status!=="Resolved").length).padStart(2,"0")} change="2 need attention" trend="negative" foot="vs. last 7 days" />
            <Metric icon={<Gauge size={16}/>} label="Avg. response time" value="4m 32s" change="−18.4%" trend="positive" foot="vs. last 7 days" />
            <Metric icon={<ShieldCheck size={16}/>} label="Service uptime" value="99.97%" change="+0.03%" trend="positive" foot="rolling 30 days" />
            <Metric icon={<Clock3 size={16}/>} label="MTTR" value="18m 24s" change="−12.8%" trend="positive" foot="vs. last 30 days" />
          </section>

          <section className="dashboard-grid">
            <div className="panel trend-panel"><div className="panel-head"><div><div className="panel-title">Incident activity</div><div className="panel-subtitle">Incident volume over the last 7 days</div></div><button className="select-btn">Last 7 days <ChevronDown size={14}/></button></div><div className="chart-legend"><span><i/> Incidents</span><span className="legend-total">30 total <b>−24%</b></span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{top:10,right:4,left:-24,bottom:0}}><defs><linearGradient id="fillMint" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7ce6c0" stopOpacity={0.22}/><stop offset="100%" stopColor="#7ce6c0" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#252832" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"#777e8e",fontSize:11}} dy={10}/><Tooltip contentStyle={{background:"#151820",border:"1px solid #303441",borderRadius:10,color:"#fff",fontSize:12}}/><Area type="monotone" dataKey="incidents" stroke="#7ce6c0" strokeWidth={2.5} fill="url(#fillMint)" activeDot={{r:5,fill:"#7ce6c0",stroke:"#151820",strokeWidth:2}}/></AreaChart></ResponsiveContainer></div></div>
            <div className="panel health-panel"><div className="panel-head"><div><div className="panel-title">Service health</div><div className="panel-subtitle">Status across your infrastructure</div></div><button className="icon-btn" onClick={()=>setPage("Services")}><ArrowUpRight size={16}/></button></div><div className="health-summary"><div className="health-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="39" fill="none" stroke="#272b35" strokeWidth="8"/><circle cx="50" cy="50" r="39" fill="none" stroke="#7ce6c0" strokeWidth="8" strokeDasharray="214 245" strokeLinecap="round" transform="rotate(-90 50 50)"/></svg><div><strong>3/4</strong><span>Healthy</span></div></div><div className="health-key"><div><i className="key-green"/><span>Operational</span><b>3</b></div><div><i className="key-amber"/><span>Degraded</span><b>1</b></div><div><i className="key-red"/><span>Outage</span><b>0</b></div></div></div><div className="health-foot"><span><span className="live-pulse"/> Monitoring active</span><span>Updated just now</span></div></div>
          </section>

          <section className="panel incidents-panel"><div className="panel-head"><div><div className="panel-title">Recent incidents <span className="count-pill">{incidents.filter(i=>i.status!=="Resolved").length} active</span></div><div className="panel-subtitle">The latest activity from your response teams</div></div><button className="text-link" onClick={()=>setPage("Incidents")}>View all incidents <ArrowRight size={14}/></button></div><IncidentTable incidents={incidents.slice(0,4)} /></section>

          <section className="bottom-grid"><div className="panel service-list-panel"><div className="panel-head"><div><div className="panel-title">Your services</div><div className="panel-subtitle">Key service-level indicators</div></div><button className="text-link" onClick={()=>setPage("Services")}>View all <ArrowRight size={14}/></button></div>{services.slice(0,3).map(s=><div className="service-row" key={s.name}><div className={`service-icon ${s.color}`}><Server size={16}/></div><div className="service-main"><strong>{s.name}</strong><span>{s.detail}</span></div><div className="service-latency"><strong>{s.latency}</strong><span>p95 latency</span></div><div className={`status-pill ${s.color}`}><i/>{s.status}</div></div>)}</div><div className="panel insight-panel"><div className="insight-top"><div className="insight-icon"><Sparkles size={17}/></div><span className="insight-label">RELIABILITY INSIGHT</span><span className="insight-new">NEW</span></div><h3>One signal worth a closer look.</h3><p>Identity Gateway latency is <b>2.4× above</b> its weekly baseline. Check token refresh errors before the next traffic peak.</p><button onClick={()=>{setPage("Services");setNotice("Insight is a demo heuristic. Connect telemetry to validate it.")}}>Investigate signal <ArrowRight size={14}/></button><div className="insight-decoration"><Activity size={76}/></div></div></section>
        </>}

        {page==="Incidents" && <section className="panel incidents-panel full-panel"><div className="panel-head"><div><div className="panel-title">All incidents <span className="count-pill">{filtered.length} shown</span></div><div className="panel-subtitle">Search and filter incident records</div></div><div className="table-actions"><div className="filter-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search incidents..."/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All incidents</option><option>Investigating</option><option>Identified</option><option>Monitoring</option><option>Resolved</option></select><button className="icon-btn"><Filter size={16}/></button></div></div><IncidentTable incidents={filtered} /></section>}

        {page==="Services" && <section className="service-cards">{services.map((s,i)=><div className="panel service-card" key={s.name}><div className="service-card-top"><div className={`service-icon ${s.color}`}><Server size={18}/></div><span className={`status-pill ${s.color}`}><i/>{s.status}</span></div><h3>{s.name}</h3><p>{s.detail}</p><div className="service-stats"><div><span>30d uptime</span><strong>{s.uptime}</strong></div><div><span>p95 latency</span><strong>{s.latency}</strong></div></div><div className="uptime-track"><span style={{width:`${[99.98,99.91,99.96,99.99][i]}%`}}/></div><div className="service-card-foot"><span><span className="live-pulse"/> Last checked 30s ago</span><button className="icon-btn" onClick={()=>setNotice("Service detail view is on the roadmap.")}><ArrowUpRight size={15}/></button></div></div>)}</section>}

        {!["Overview","Incidents","Services"].includes(page) && <div className="panel placeholder-panel"><div className="placeholder-icon"><Cpu size={24}/></div><h2>{page} is ready for your next build.</h2><p>This navigation item is a product extension point. See <code>docs/ROADMAP.md</code> for the recommended implementation plan.</p><button className="btn-primary" onClick={()=>setPage("Overview")}>Back to overview <ArrowRight size={15}/></button></div>}
        <footer className="page-footer"><span>© 2026 RelayOps, Inc.</span><span><i className="footer-dot"/> All systems nominal <span className="footer-sep">·</span> v1.0.0-preview</span><span className="footer-right"><LockKeyhole size={12}/> Secure workspace</span></footer>
      </div>
    </main>

    {mobileNav&&<button className="mobile-scrim" onClick={()=>setMobileNav(false)} aria-label="Close navigation"/>}
    {notice&&<div className="toast"><CheckCircle2 size={17}/><span>{notice}</span><button onClick={()=>setNotice("")}><X size={14}/></button></div>}
    {showCreate&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowCreate(false)}}><form className="create-modal" onSubmit={createIncident}><div className="modal-head"><div><span className="eyebrow">INCIDENT MANAGEMENT</span><h2>Create incident</h2><p>Give your response team the context to act quickly.</p></div><button type="button" className="icon-btn" onClick={()=>setShowCreate(false)}><X size={17}/></button></div><label>Incident title<input required minLength={5} maxLength={160} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Elevated checkout latency"/></label><div className="form-row"><label>Service<select value={form.service} onChange={e=>setForm({...form,service:e.target.value})}>{services.map(s=><option key={s.name}>{s.name}</option>)}</select></label><label>Severity<select value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})}><option>SEV-1</option><option>SEV-2</option><option>SEV-3</option><option>SEV-4</option></select></label></div><label>Summary<textarea required minLength={10} value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})} placeholder="What is happening? Include impact and what has been checked." rows={4}/></label><div className="modal-note"><ShieldCheck size={15}/> This preview creates a local UI record. Connect the API for persistent storage.</div><div className="modal-actions"><button type="button" className="btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button><button className="btn-primary" type="submit"><Plus size={15}/> Create incident</button></div></form></div>}
  </div>;
}

function Metric({icon,label,value,change,trend,foot}:{icon:React.ReactNode,label:string,value:string,change:string,trend:string,foot:string}) {
  return <div className="panel metric-card"><div className="metric-top"><div className="metric-icon">{icon}</div><button className="icon-btn tiny"><MoreHorizontal size={16}/></button></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-foot"><span className={`metric-change ${trend}`}>{trend==="positive"?<ArrowDownRight size={13}/>:<ArrowUpRight size={13}/>} {change}</span><span>{foot}</span></div><div className="metric-spark"><span style={{height:"30%"}}/><span style={{height:"45%"}}/><span style={{height:"38%"}}/><span style={{height:"62%"}}/><span style={{height:"49%"}}/><span style={{height:"73%"}}/><span style={{height:"58%"}}/><span style={{height:"84%"}}/><span style={{height:"67%"}}/><span style={{height:"92%"}}/></div></div>;
}

function IncidentTable({incidents}:{incidents:Incident[]}) {
  if (!incidents.length) return <div className="empty-state"><Search size={22}/><strong>No incidents match those filters</strong><span>Try another search or clear the status filter.</span></div>;
  return <div className="table-scroll"><table className="incident-table"><thead><tr><th>INCIDENT</th><th>SERVICE</th><th>SEVERITY</th><th>STATUS</th><th>AGE</th><th>OWNER</th><th/></tr></thead><tbody>{incidents.map(i=><tr key={i.id}><td><div className="incident-title-cell"><span className={`severity-mark ${severityClass[i.severity]||"sev3"}`}/><div><strong>{i.title}</strong><span>{i.id}</span></div></div></td><td><span className="service-name-cell"><span className="service-mini-icon"><Server size={12}/></span>{i.service}</span></td><td><span className={`severity-badge ${severityClass[i.severity]||"sev3"}`}><i/>{i.severity}</span></td><td><span className={`incident-status ${i.status.toLowerCase()}`}><i/>{i.status}</span></td><td className="age-cell">{i.age}</td><td><div className="owner-avatar">{i.owner}</div></td><td><button className="icon-btn row-more" aria-label={`More actions for ${i.id}`}><MoreHorizontal size={16}/></button></td></tr>)}</tbody></table></div>;
}
