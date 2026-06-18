import{r as n,m as e,z as d}from"./vendor-BYCKrpmZ.js";import{c as ee,L as R}from"./vendor-router-BICDk72h.js";import{a as m}from"./client-B3FNDSEm.js";const ae=`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');

  .al-root {
    min-height: 100vh;
    background: #080808;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Animated background gradient orbs */
  .al-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    animation: al-float 8s ease-in-out infinite;
  }
  .al-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(212,165,116,0.12) 0%, transparent 70%);
    top: -150px; left: -150px;
  }
  .al-orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(120,100,200,0.08) 0%, transparent 70%);
    bottom: -100px; right: -100px;
    animation-delay: -3s;
  }
  .al-orb-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(212,165,116,0.06) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: -6s;
  }

  @keyframes al-float {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-20px) scale(1.05); }
  }
  .al-orb-3 {
    animation: al-float-center 8s ease-in-out infinite;
    animation-delay: -6s;
  }
  @keyframes al-float-center {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, calc(-50% - 20px)) scale(1.05); }
  }

  /* Grid overlay */
  .al-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  /* Card */
  .al-card {
    position: relative;
    width: 100%;
    max-width: 420px;
    margin: 24px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 40px;
    backdrop-filter: blur(20px);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6);
    animation: al-card-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes al-card-in {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Logo / Brand */
  .al-brand {
    text-align: center;
    margin-bottom: 32px;
  }
  .al-brand-icon {
    width: 52px; height: 52px;
    background: linear-gradient(135deg, #d4a574, #b8864a);
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow: 0 8px 32px rgba(212,165,116,0.3);
  }
  .al-brand-icon svg { width: 26px; height: 26px; color: #fff; }
  .al-brand-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 600;
    color: #f5f5f5;
    letter-spacing: 0.02em;
    margin: 0 0 4px;
  }
  .al-brand-sub {
    font-size: 12px;
    color: #525252;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* Step indicator */
  .al-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 28px;
  }
  .al-step-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #333;
    transition: all 0.3s ease;
  }
  .al-step-dot.active {
    width: 24px;
    border-radius: 3px;
    background: #d4a574;
  }
  .al-step-dot.done {
    background: #16a34a;
  }

  /* Title */
  .al-title {
    font-size: 20px;
    font-weight: 600;
    color: #f5f5f5;
    margin: 0 0 6px;
    text-align: center;
  }
  .al-subtitle {
    font-size: 13px;
    color: #737373;
    text-align: center;
    margin: 0 0 28px;
    line-height: 1.6;
  }
  .al-subtitle strong { color: #a3a3a3; }

  /* Form */
  .al-field {
    margin-bottom: 16px;
  }
  .al-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #737373;
    margin-bottom: 6px;
    letter-spacing: 0.04em;
  }
  .al-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 14px;
    color: #f5f5f5;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }
  .al-input:focus {
    border-color: rgba(212,165,116,0.5);
    background: rgba(212,165,116,0.04);
    box-shadow: 0 0 0 3px rgba(212,165,116,0.1);
  }
  .al-input::placeholder { color: #404040; }

  /* Password wrapper */
  .al-pw-wrap { position: relative; }
  .al-pw-toggle {
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer;
    padding: 4px;
    color: #525252;
    display: flex;
    transition: color 0.2s;
  }
  .al-pw-toggle:hover { color: #a3a3a3; }

  /* OTP boxes */
  .al-otp-grid {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 24px;
  }
  .al-otp-box {
    width: 48px; height: 56px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    color: #f5f5f5;
    outline: none;
    transition: all 0.2s;
    font-family: 'Inter', monospace;
    caret-color: #d4a574;
  }
  .al-otp-box:focus {
    border-color: rgba(212,165,116,0.6);
    background: rgba(212,165,116,0.06);
    box-shadow: 0 0 0 3px rgba(212,165,116,0.12);
  }
  .al-otp-box.filled {
    border-color: rgba(212,165,116,0.4);
    color: #d4a574;
  }

  /* Button */
  .al-btn {
    width: 100%;
    padding: 13px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: 0.02em;
  }
  .al-btn-primary {
    background: linear-gradient(135deg, #d4a574, #b8864a);
    color: #fff;
    box-shadow: 0 4px 20px rgba(212,165,116,0.3);
  }
  .al-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(212,165,116,0.4);
  }
  .al-btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }
  .al-btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .al-btn-ghost {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: #737373;
    margin-top: 10px;
  }
  .al-btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: #a3a3a3; }

  /* Spinner */
  .al-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: al-spin 0.7s linear infinite;
  }
  @keyframes al-spin { to { transform: rotate(360deg); } }

  /* Divider */
  .al-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
    color: #333;
    font-size: 12px;
  }
  .al-divider::before, .al-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.07);
  }

  /* Footer links */
  .al-footer {
    margin-top: 24px;
    text-align: center;
    font-size: 12px;
    color: #404040;
  }
  .al-footer a {
    color: #d4a574;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .al-footer a:hover { opacity: 0.8; }

  /* Fallback notice */
  .al-notice {
    background: rgba(251,191,36,0.08);
    border: 1px solid rgba(251,191,36,0.2);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 12px;
    color: #fbbf24;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  /* Resend timer */
  .al-resend {
    text-align: center;
    font-size: 12px;
    color: #525252;
    margin-bottom: 16px;
  }
  .al-resend button {
    background: none; border: none;
    color: #d4a574; cursor: pointer;
    font-size: 12px; font-family: inherit;
    padding: 0; transition: opacity 0.2s;
  }
  .al-resend button:hover { opacity: 0.8; }
  .al-resend button:disabled { color: #525252; cursor: default; }

  /* Success animation */
  .al-success-icon {
    width: 52px; height: 52px;
    background: rgba(22,163,74,0.1);
    border: 1px solid rgba(22,163,74,0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    animation: al-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes al-pop {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`,w="setup",x="password",k="otp",v="success";function ne(){const N=ee(),[i,u]=n.useState(null),[l,p]=n.useState(!1),[f,M]=n.useState(""),[z,B]=n.useState(""),[E,Y]=n.useState(""),[L,W]=n.useState(!1),[h,_]=n.useState(""),[y,q]=n.useState(""),[T,G]=n.useState(!1),[V,A]=n.useState(""),[$,I]=n.useState(!1),[b,g]=n.useState(["","","","","",""]),c=n.useRef([]),[j,S]=n.useState(0);n.useEffect(()=>{if(localStorage.getItem("agency_token")){N("/app",{replace:!0});return}K()},[]),n.useEffect(()=>{if(j<=0)return;const a=setTimeout(()=>S(t=>t-1),1e3);return()=>clearTimeout(a)},[j]);async function K(){try{const{data:a}=await m.get("/auth/status");a&&a.hasPassword?u(x):u(w)}catch{u(x)}}async function U(a){var t,r;if(a.preventDefault(),f!==z){d.error("Passwords do not match");return}if(f.length<6){d.error("Password must be at least 6 characters");return}p(!0);try{const{data:s}=await m.post("/auth/setup-password",{password:f,adminEmail:E});localStorage.setItem("agency_token",s.token),u(v),setTimeout(()=>N("/app",{replace:!0}),1200)}catch(s){d.error(((r=(t=s.response)==null?void 0:t.data)==null?void 0:r.error)||"Failed to set password")}finally{p(!1)}}async function H(a){var t,r;a.preventDefault(),p(!0);try{const{data:s}=await m.post("/auth/login",{email:h,password:y});A(s.sessionId),I(s.fallback),g(["","","","","",""]),u(k),S(60),setTimeout(()=>{var o;return(o=c.current[0])==null?void 0:o.focus()},100),s.fallback?d("Code printed to backend console",{icon:"⚠️"}):d.success("Code generated. Please enter your 6-digit code.")}catch(s){d.error(((r=(t=s.response)==null?void 0:t.data)==null?void 0:r.error)||"Login failed")}finally{p(!1)}}function J(a,t){var o;const r=t.replace(/\D/g,"").slice(-1),s=[...b];s[a]=r,g(s),r&&a<5&&((o=c.current[a+1])==null||o.focus()),r&&s.every(P=>P!=="")&&a===5&&C(s.join(""))}function Q(a,t){var r,s,o;t.key==="Backspace"&&!b[a]&&a>0&&((r=c.current[a-1])==null||r.focus()),t.key==="ArrowLeft"&&a>0&&((s=c.current[a-1])==null||s.focus()),t.key==="ArrowRight"&&a<5&&((o=c.current[a+1])==null||o.focus())}function X(a){var s;a.preventDefault();const t=a.clipboardData.getData("text").replace(/\D/g,"").slice(0,6),r=["","","","","",""];t.split("").forEach((o,P)=>{r[P]=o}),g(r),(s=c.current[Math.min(t.length,5)])==null||s.focus(),t.length===6&&C(t)}async function C(a){var t,r,s;p(!0);try{const{data:o}=await m.post("/auth/verify-otp",{sessionId:V,otp:a||b.join("")});localStorage.setItem("agency_token",o.token),u(v),setTimeout(()=>N("/app",{replace:!0}),1200)}catch(o){d.error(((r=(t=o.response)==null?void 0:t.data)==null?void 0:r.error)||"Invalid OTP"),g(["","","","","",""]),(s=c.current[0])==null||s.focus()}finally{p(!1)}}async function Z(){var a;p(!0);try{const{data:t}=await m.post("/auth/login",{email:h,password:y});A(t.sessionId),I(t.fallback),S(60),g(["","","","","",""]),(a=c.current[0])==null||a.focus(),d.success("New code generated!")}catch{d.error("Failed to regenerate code")}finally{p(!1)}}const O={[w]:0,[x]:0,[k]:1,[v]:2};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:ae}),e.jsxs("div",{className:"al-root",children:[e.jsx("div",{className:"al-orb al-orb-1"}),e.jsx("div",{className:"al-orb al-orb-2"}),e.jsx("div",{className:"al-orb al-orb-3"}),e.jsx("div",{className:"al-grid"}),e.jsxs("div",{className:"al-card",children:[e.jsxs("div",{className:"al-brand",children:[e.jsx("div",{className:"al-brand-icon",children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"}),e.jsx("polyline",{points:"9,22 9,12 15,12 15,22"})]})}),e.jsx("p",{className:"al-brand-name",children:"Agency Dashboard"}),e.jsx("p",{className:"al-brand-sub",children:"Restaurant Management Platform"})]}),i&&i!==w&&e.jsx("div",{className:"al-steps",children:[0,1,2].map(a=>e.jsx("div",{className:`al-step-dot ${a===O[i]?"active":a<O[i]?"done":""}`},a))}),i===null&&e.jsx("div",{style:{textAlign:"center",padding:"40px 0",color:"#525252"},children:e.jsx("div",{className:"al-spinner",style:{margin:"0 auto"}})}),i===w&&e.jsxs("form",{onSubmit:U,children:[e.jsx("p",{className:"al-title",children:"Welcome!"}),e.jsx("p",{className:"al-subtitle",children:"Set up your agency admin password to get started."}),e.jsxs("div",{className:"al-field",children:[e.jsx("label",{className:"al-label",children:"Admin Email (for 2FA OTPs)"}),e.jsx("input",{id:"setup-email",type:"email",className:"al-input",placeholder:"you@example.com",value:E,onChange:a=>Y(a.target.value),required:!0})]}),e.jsxs("div",{className:"al-field",children:[e.jsx("label",{className:"al-label",children:"Password"}),e.jsxs("div",{className:"al-pw-wrap",children:[e.jsx("input",{id:"setup-password",type:L?"text":"password",className:"al-input",placeholder:"Min. 6 characters",value:f,onChange:a=>M(a.target.value),required:!0}),e.jsx("button",{type:"button",className:"al-pw-toggle",onClick:()=>W(a=>!a),children:L?e.jsx(F,{}):e.jsx(D,{})})]})]}),e.jsxs("div",{className:"al-field",children:[e.jsx("label",{className:"al-label",children:"Confirm Password"}),e.jsx("input",{id:"setup-confirm",type:"password",className:"al-input",placeholder:"Repeat password",value:z,onChange:a=>B(a.target.value),required:!0})]}),e.jsxs("button",{id:"setup-submit",type:"submit",className:"al-btn al-btn-primary",disabled:l,children:[l?e.jsx("span",{className:"al-spinner"}):null,l?"Setting up...":"Create Account"]})]}),i===x&&e.jsxs("form",{onSubmit:H,children:[e.jsx("p",{className:"al-title",children:"Welcome back"}),e.jsx("p",{className:"al-subtitle",children:"Enter your agency credentials to continue."}),e.jsxs("div",{className:"al-field",children:[e.jsx("label",{className:"al-label",children:"Email Address"}),e.jsx("input",{id:"login-email",type:"email",className:"al-input",placeholder:"you@example.com",value:h,onChange:a=>_(a.target.value),autoFocus:!0,required:!0})]}),e.jsxs("div",{className:"al-field",children:[e.jsx("label",{className:"al-label",children:"Password"}),e.jsxs("div",{className:"al-pw-wrap",children:[e.jsx("input",{id:"login-password",type:T?"text":"password",className:"al-input",placeholder:"Your password",value:y,onChange:a=>q(a.target.value),required:!0}),e.jsx("button",{type:"button",className:"al-pw-toggle",onClick:()=>G(a=>!a),children:T?e.jsx(F,{}):e.jsx(D,{})})]})]}),e.jsxs("button",{id:"login-submit",type:"submit",className:"al-btn al-btn-primary",disabled:l||!h||!y,children:[l?e.jsx("span",{className:"al-spinner"}):null,l?"Verifying...":"Continue →"]})]}),i===k&&e.jsxs("div",{children:[e.jsx("p",{className:"al-title",children:"Check your email"}),e.jsxs("p",{className:"al-subtitle",children:["Enter the 6-digit code sent to your ",e.jsx("strong",{children:"registered email address"}),". It expires in 5 minutes."]}),$&&e.jsx("div",{className:"al-notice",children:"⚠️ SMTP not configured. The OTP was printed to the backend console. You can configure SMTP in Agency Settings after logging in."}),e.jsx("div",{className:"al-otp-grid",onPaste:X,children:b.map((a,t)=>e.jsx("input",{ref:r=>c.current[t]=r,id:`otp-box-${t}`,type:"text",inputMode:"numeric",maxLength:1,className:`al-otp-box${a?" filled":""}`,value:a,onChange:r=>J(t,r.target.value),onKeyDown:r=>Q(t,r),disabled:l},t))}),e.jsx("div",{className:"al-resend",children:j>0?e.jsxs("span",{children:["Resend code in ",j,"s"]}):e.jsx("button",{onClick:Z,disabled:l,children:"Resend code"})}),e.jsxs("button",{id:"otp-submit",type:"button",className:"al-btn al-btn-primary",disabled:l||b.some(a=>!a),onClick:()=>C(),children:[l?e.jsx("span",{className:"al-spinner"}):null,l?"Verifying...":"Verify & Login"]}),e.jsx("button",{type:"button",className:"al-btn al-btn-ghost",onClick:()=>{u(x),g(["","","","","",""])},children:"← Back"})]}),i===v&&e.jsxs("div",{style:{textAlign:"center",padding:"20px 0"},children:[e.jsx("div",{className:"al-success-icon",children:e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"#16a34a",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"20,6 9,17 4,12"})})}),e.jsx("p",{className:"al-title",children:"Logged in!"}),e.jsx("p",{className:"al-subtitle",children:"Redirecting to dashboard..."}),e.jsx("div",{className:"al-spinner",style:{margin:"12px auto 0"}})]}),(i===x||i===k)&&e.jsxs("div",{className:"al-footer",children:[e.jsx(R,{to:"/",children:"← Back to marketing site"})," · ",e.jsx(R,{to:"/contact",children:"Contact Support"})]})]})]})]})}function D(){return e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"}),e.jsx("circle",{cx:"12",cy:"12",r:"3"})]})}function F(){return e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"}),e.jsx("line",{x1:"1",y1:"1",x2:"23",y2:"23"})]})}export{ne as default};
