import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { staffLoginSendOtp, staffLoginVerifyOtp } from "services/staff.js";
export default function StaffLoginPage() {
  const [mobile,setMobile]=useState(""); const [code,setCode]=useState(""); const [sent,setSent]=useState(false);
  const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const navigate=useNavigate();
  const send=async e=>{e.preventDefault();setBusy(true);setError("");try{await staffLoginSendOtp({mobile});setSent(true);}catch(err){setError(err.response?.data?.message || "ارسال کد ممکن نیست؛ سرویس پیامک ممکن است هنوز فعال نشده باشد.");}finally{setBusy(false);}};
  const verify=async e=>{e.preventDefault();setBusy(true);setError("");try{const r=await staffLoginVerifyOtp({mobile,code});sessionStorage.setItem("tahaterStaffToken",r.data.data.accessToken);navigate("/admin");}catch(err){setError(err.response?.data?.message || "کد ورود معتبر نیست");}finally{setBusy(false);}};
  return <main style={{maxWidth:420,margin:"70px auto",padding:28,background:"#fff",borderRadius:16,boxShadow:"0 8px 30px #0001",direction:"rtl"}}>
    <h2>ورود کارکنان تهاتر</h2><p>ورود به پنل سازمانی فقط با کد یک‌بارمصرف انجام می‌شود.</p>
    <form onSubmit={sent?verify:send}>
      <label>شماره موبایل</label><input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="09xxxxxxxxx" required disabled={sent} style={field}/>
      {sent&&<><label>کد یک‌بارمصرف</label><input value={code} onChange={e=>setCode(e.target.value)} inputMode="numeric" maxLength={6} required style={field}/></>}
      {error&&<p style={{color:"#b42318"}}>{error}</p>}
      <button disabled={busy} style={button}>{busy?"لطفاً صبر کنید":sent?"تأیید و ورود":"ارسال کد ورود"}</button>
      {sent&&<button type="button" onClick={()=>{setSent(false);setCode("");}} style={{...button,background:"#eee",color:"#222",marginTop:8}}>تغییر شماره موبایل</button>}
    </form>
  </main>;
}
const field={display:"block",width:"100%",boxSizing:"border-box",padding:12,margin:"8px 0 18px",border:"1px solid #ddd",borderRadius:8,fontSize:16};
const button={width:"100%",padding:13,border:0,borderRadius:8,background:"#ffd400",fontWeight:700,cursor:"pointer"};