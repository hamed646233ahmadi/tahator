import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryForm from "components/templates/CategoryForm.jsx";
import CategoryList from "components/templates/CategoryList.jsx";
import { staffMe, staffList, staffCreate, staffUpdate, staffSetActive, staffRoles, staffUpdateRole, staffAuditLogs, staffLogout } from "services/staff.js";
const tabs=[["staff","کارکنان"],["roles","نقش‌ها"],["audit","گزارش فعالیت"],["categories","دسته‌بندی‌ها"]];
export default function AdminPage() {
 const [me,setMe]=useState(null),[tab,setTab]=useState("staff"),[staff,setStaff]=useState([]),[roles,setRoles]=useState([]),[logs,setLogs]=useState([]);
 const [fullName,setFullName]=useState(""),[mobile,setMobile]=useState(""),[roleKey,setRoleKey]=useState("user_support"),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const navigate=useNavigate();
 const load=async()=>{try{const m=await staffMe();setMe(m.data.data);const p=m.data.data.permissions||[];if(p.includes("*")||p.includes("staff.read")){const r=await staffList();setStaff(r.data.data);}if(p.includes("*")||p.includes("roles.read")){const r=await staffRoles();setRoles(r.data.data);}if(p.includes("*")||p.includes("audit.read")){const r=await staffAuditLogs();setLogs(r.data.data);}}catch(e){sessionStorage.removeItem("tahaterStaffToken");navigate("/staff-login");}};
 useEffect(()=>{load();},[]);
 const create=async e=>{e.preventDefault();setBusy(true);setError("");try{await staffCreate({fullName,mobile,roleKey});setFullName("");setMobile("");await load();}catch(e){setError(e.response?.data?.message||"ثبت کارمند انجام نشد");}finally{setBusy(false);}};
 const toggle=async person=>{try{await staffSetActive(person._id,!person.isActive);await load();}catch(e){setError(e.response?.data?.message||"تغییر وضعیت انجام نشد");}};\n const edit=async person=>{const fullName=window.prompt("نام و نام خانوادگی",person.fullName);if(fullName===null)return;const roleKey=window.prompt("شناسه نقش (بدون فاصله)",person.roleKey);if(roleKey===null)return;try{await staffUpdate(person._id,{fullName,roleKey});await load();}catch(e){setError(e.response?.data?.message||"ویرایش انجام نشد");}};\n const saveRole=async role=>{const raw=window.prompt("مجوزها را با کاما جدا کنید",role.permissions.join(","));if(raw===null)return;try{await staffUpdateRole(role.key,raw.split(",").map(x=>x.trim()).filter(Boolean));await load();}catch(e){setError(e.response?.data?.message||"ذخیره مجوزها انجام نشد");}};
 const logout=async()=>{try{await staffLogout();}catch{}sessionStorage.removeItem("tahaterStaffToken");navigate("/staff-login");};
 if(!me)return <div style={{padding:32,direction:"rtl"}}>در حال بررسی دسترسی...</div>;
 const perms=me.permissions||[]; const has=p=>perms.includes("*")||perms.includes(p);
 return <main style={{maxWidth:1180,margin:"24px auto",padding:20,direction:"rtl",color:"#222"}}>
  <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}><div><h1 style={{marginBottom:4}}>مدیریت تهاتر</h1><span>{me.fullName} · {roles.find(r=>r.key===me.roleKey)?.title||me.roleKey}</span></div><button onClick={logout} style={secondary}>خروج امن</button></header>
  <nav style={{display:"flex",gap:8,flexWrap:"wrap",margin:"24px 0"}}>{tabs.filter(([key])=>key==="categories"||key==="staff"&&has("staff.read")||key==="roles"&&has("roles.read")||key==="audit"&&has("audit.read")).map(([key,label])=><button key={key} onClick={()=>setTab(key)} style={{...secondary,background:tab===key?"#ffd400":"#f3f3f3"}}>{label}</button>)}</nav>
  {error&&<p style={{color:"#b42318"}}>{error}</p>}
  {tab==="staff"&&<section style={panel}><h2>کارکنان</h2>{has("staff.create")&&<form onSubmit={create} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10,marginBottom:20}}><input style={input} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="نام و نام خانوادگی" required/><input style={input} value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="شماره موبایل با کد کشور" required/><select style={input} value={roleKey} onChange={e=>setRoleKey(e.target.value)}>{roles.map(r=><option key={r.key} value={r.key}>{r.title}</option>)}</select><button style={primary} disabled={busy}>افزودن کارمند</button></form>}
   <div style={{overflowX:"auto"}}><table style={table}><thead><tr><th>نام</th><th>موبایل</th><th>نقش</th><th>وضعیت</th><th>آخرین ورود</th><th>عملیات</th></tr></thead><tbody>{staff.map(s=><tr key={s._id}><td>{s.fullName}</td><td>{s.mobile}</td><td>{roles.find(r=>r.key===s.roleKey)?.title||s.roleKey}</td><td>{s.isActive?"فعال":"غیرفعال"}</td><td>{s.lastLoginAt?new Date(s.lastLoginAt).toLocaleString("fa-IR"):"—"}</td><td>{has("staff.update")&&s.roleKey!=="super_admin"&&<button style={secondary} onClick={()=>edit(s)}>ویرایش</button>} {has("staff.disable")&&s.roleKey!=="super_admin"&&<button style={secondary} onClick={()=>toggle(s)}>{s.isActive?"غیرفعال‌سازی":"فعال‌سازی"}</button>}</td></tr>)}</tbody></table></div>
  </section>}
  {tab==="roles"&&<section style={panel}><h2>نقش‌های سازمانی</h2>{roles.map(r=><article key={r.key} style={{padding:"12px 0",borderBottom:"1px solid #eee"}}><b>{r.title}</b><div style={{fontSize:13,color:"#666",marginTop:5}}>{r.permissions.includes("*")?"تمام دسترسی‌ها":r.permissions.join("، ")||"بدون مجوز"}</div>{has("roles.write")&&r.key!=="super_admin"&&<button style={{...secondary,marginTop:8}} onClick={()=>saveRole(r)}>ویرایش مجوزها</button>}</article>)}</section>}
  {tab==="audit"&&<section style={panel}><h2>تاریخچه فعالیت‌ها</h2><div style={{overflowX:"auto"}}><table style={table}><thead><tr><th>زمان</th><th>کارمند</th><th>عملیات</th><th>هدف</th></tr></thead><tbody>{logs.map(l=><tr key={l._id}><td>{new Date(l.createdAt).toLocaleString("fa-IR")}</td><td>{l.actorName||"—"}</td><td>{l.action}</td><td>{l.targetType||"—"} {l.targetId||""}</td></tr>)}</tbody></table></div></section>}
  {tab==="categories"&&<section style={panel}><CategoryList/><CategoryForm/></section>}
 </main>;
}
const panel={background:"#fff",border:"1px solid #eee",borderRadius:14,padding:20,marginTop:12};
const input={padding:11,border:"1px solid #ddd",borderRadius:8,minWidth:0};
const primary={padding:11,border:0,borderRadius:8,background:"#ffd400",fontWeight:700,cursor:"pointer"};
const secondary={padding:"9px 14px",border:0,borderRadius:8,background:"#eee",cursor:"pointer"};
const table={width:"100%",borderCollapse:"collapse",textAlign:"right"};