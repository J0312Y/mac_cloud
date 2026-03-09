import { useState, useEffect, useRef } from "react";


/* ═══ DATA ═══ */
const BUILDS = [
  { id:"bld_9f2a1", project:"MyApp iOS",   user:"alex@company.io",  status:"success", duration:"4m 12s", date:"2026-03-08 14:22", branch:"main",         mac:"mac-02", size:"42.3 MB", xcode:"15.3", region:"EU-West", errorReason:null,        errorCode:null },
  { id:"bld_8e1b2", project:"ShopKit",     user:"sara@devteam.com", status:"running", duration:"2m 05s", date:"2026-03-08 14:18", branch:"feature/cart", mac:"mac-01", size:"—",       xcode:"15.3", region:"EU-West", errorReason:null,        errorCode:null },
  { id:"bld_7d0c3", project:"HealthTrack", user:"john@startup.io",  status:"failed",  duration:"1m 44s", date:"2026-03-08 13:55", branch:"dev",          mac:"mac-03", size:"—",       xcode:"15.2", region:"US-East", errorReason:"Code signing failed: provisioning profile 'com.startup.healthtrack' expired (ITMS-90168)", errorCode:"CS-001" },
  { id:"bld_6c9d4", project:"MyApp iOS",   user:"alex@company.io",  status:"queued",  duration:"—",      date:"2026-03-08 13:40", branch:"hotfix/login", mac:"—",      size:"—",       xcode:"15.3", region:"EU-West", errorReason:null,        errorCode:null },
  { id:"bld_5b8e5", project:"Financer",    user:"priya@fintech.ai", status:"success", duration:"6m 31s", date:"2026-03-08 12:10", branch:"release/2.1", mac:"mac-02", size:"58.7 MB", xcode:"15.3", region:"EU-West", errorReason:null,        errorCode:null },
  { id:"bld_4a7f6", project:"Taskly",      user:"sara@devteam.com", status:"success", duration:"3m 08s", date:"2026-03-07 22:05", branch:"main",         mac:"mac-01", size:"31.1 MB", xcode:"15.3", region:"EU-West", errorReason:null,        errorCode:null },
  { id:"bld_3f6g7", project:"ShopKit",     user:"john@startup.io",  status:"failed",  duration:"0m 47s", date:"2026-03-07 20:33", branch:"dev",          mac:"mac-03", size:"—",       xcode:"15.2", region:"US-East", errorReason:"xcodebuild exit 65 — Swift compile error: module 'Alamofire' not found (NetworkManager.swift:12)", errorCode:"XC-065" },
  { id:"bld_2a5h8", project:"MyApp iOS",   user:"alex@company.io",  status:"failed",  duration:"0m 12s", date:"2026-03-07 18:00", branch:"fix/auth",     mac:"mac-02", size:"—",       xcode:"15.3", region:"EU-West", errorReason:"Git clone failed: SSH authentication error — verify deploy key has read access to repo", errorCode:"GIT-401" },
  { id:"bld_1b3j9", project:"Financer",    user:"priya@fintech.ai", status:"success", duration:"5m 44s", date:"2026-03-07 15:20", branch:"main",         mac:"mac-01", size:"55.2 MB", xcode:"15.3", region:"EU-West", errorReason:null,        errorCode:null },
];
const MY_BUILDS = BUILDS.filter(b=>b.user==="alex@company.io");

const MACS = [
  { id:"mac-01", name:"Mac mini #1", status:"busy",    build:"bld_8e1b2", cpu:78, ram:62, temp:71, disk:45, uptime:"14d 6h",  xcode:"15.3", ip:"10.0.1.21", os:"macOS 14.3", region:"EU-West", lastReboot:"2026-02-22 08:00", history:[20,35,55,60,72,78,78,76,78,80,76,78,78,78] },
  { id:"mac-02", name:"Mac mini #2", status:"idle",    build:null,        cpu:4,  ram:30, temp:48, disk:32, uptime:"14d 6h",  xcode:"15.3", ip:"10.0.1.22", os:"macOS 14.3", region:"EU-West", lastReboot:"2026-02-22 08:00", history:[3,4,2,5,3,4,2,4,3,4,4,3,4,4] },
  { id:"mac-03", name:"Mac mini #3", status:"idle",    build:null,        cpu:2,  ram:28, temp:44, disk:28, uptime:"6d 2h",   xcode:"15.2", ip:"10.0.1.23", os:"macOS 14.2", region:"US-East", lastReboot:"2026-03-02 12:00", history:[10,8,2,3,2,1,2,3,2,2,2,3,2,2] },
  { id:"mac-04", name:"Mac mini #4", status:"offline", build:null,        cpu:0,  ram:0,  temp:0,  disk:0,  uptime:"—",       xcode:"—",    ip:"10.0.1.24", os:"macOS 14.3", region:"US-East", lastReboot:"2026-03-05 09:00", history:[0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
];

const USERS = [
  { id:"u1", name:"Alex Martin",  email:"alex@company.io",  plan:"Pro",     builds:34, joined:"2025-11-12", status:"active",    revenue:79,  storage:"1.2 GB", country:"🇫🇷", lastSeen:"2m ago" },
  { id:"u2", name:"Sara Kim",     email:"sara@devteam.com", plan:"Team",    builds:91, joined:"2025-09-04", status:"active",    revenue:199, storage:"4.8 GB", country:"🇺🇸", lastSeen:"8m ago" },
  { id:"u3", name:"John Osei",    email:"john@startup.io",  plan:"Starter", builds:12, joined:"2026-01-20", status:"active",    revenue:29,  storage:"340 MB", country:"🇬🇭", lastSeen:"2h ago" },
  { id:"u4", name:"Priya Nair",   email:"priya@fintech.ai", plan:"Pro",     builds:56, joined:"2025-12-01", status:"active",    revenue:79,  storage:"2.1 GB", country:"🇮🇳", lastSeen:"1h ago" },
  { id:"u5", name:"Tom Nguyen",   email:"tom@legacy.dev",   plan:"Starter", builds:3,  joined:"2026-02-14", status:"suspended", revenue:0,   storage:"120 MB", country:"🇻🇳", lastSeen:"5d ago" },
];

const PLANS = [
  { id:"starter", name:"Starter", price:29,  builds:50,   macHours:10,  certs:2,  apiCalls:2000,  seats:1  },
  { id:"pro",     name:"Pro",     price:79,  builds:200,  macHours:50,  certs:5,  apiCalls:10000, seats:3  },
  { id:"team",    name:"Team",    price:199, builds:1000, macHours:200, certs:20, apiCalls:50000, seats:10 },
];

const ALERTS = [
  { id:1, type:"critical", title:"Mac mini #4 offline",           msg:"Node mac-04 unreachable since 2026-03-05 09:12. Auto-restart failed 3x.", time:"2h ago",  ack:false },
  { id:2, type:"warning",  title:"Build queue at 80% capacity",   msg:"8 builds queued. Consider spinning up a new Mac node.",                  time:"45m ago", ack:false },
  { id:3, type:"info",     title:"Xcode 15.4 available",          msg:"New version available for mac-01, mac-02.",                              time:"1d ago",  ack:true  },
  { id:4, type:"critical", title:"Certificate expiry in 30 days", msg:"Apple Dist: OldApp expires 2025-12-01 — sara@devteam.com must renew.",   time:"3d ago",  ack:false },
  { id:5, type:"info",     title:"System backup completed",        msg:"Full snapshot 48.2 GB → S3 eu-west-1. Duration: 4m 12s.",               time:"6h ago",  ack:true  },
];

const AUDIT = [
  { id:1,  user:"admin@macbuild.cloud", action:"SUSPEND_USER",     target:"tom@legacy.dev",     time:"2026-03-08 14:05", ip:"82.14.200.1",  kind:"admin" },
  { id:2,  user:"admin@macbuild.cloud", action:"REBOOT_NODE",      target:"mac-03",             time:"2026-03-08 13:50", ip:"82.14.200.1",  kind:"admin" },
  { id:3,  user:"alex@company.io",      action:"SUBMIT_BUILD",     target:"bld_9f2a1",          time:"2026-03-08 14:22", ip:"91.200.12.4",  kind:"user"  },
  { id:4,  user:"admin@macbuild.cloud", action:"UPDATE_PLAN",      target:"Pro price → $89",    time:"2026-03-08 12:00", ip:"82.14.200.1",  kind:"admin" },
  { id:5,  user:"sara@devteam.com",     action:"DELETE_CERT",      target:"cert_old_dist",      time:"2026-03-07 22:10", ip:"45.67.89.10",  kind:"user"  },
  { id:6,  user:"admin@macbuild.cloud", action:"BACKUP_TRIGGERED", target:"Full snapshot",      time:"2026-03-07 18:00", ip:"82.14.200.1",  kind:"admin" },
  { id:7,  user:"john@startup.io",      action:"SUBMIT_BUILD",     target:"bld_7d0c3",          time:"2026-03-08 13:55", ip:"101.20.5.88",  kind:"user"  },
  { id:8,  user:"admin@macbuild.cloud", action:"BROADCAST_MSG",    target:"All users",          time:"2026-03-06 10:00", ip:"82.14.200.1",  kind:"admin" },
  { id:9,  user:"priya@fintech.ai",     action:"UPLOAD_CERT",      target:"Apple Dist 2027",    time:"2026-03-06 08:30", ip:"203.45.12.7",  kind:"user"  },
  { id:10, user:"admin@macbuild.cloud", action:"CREATE_NODE",      target:"mac-04 provisioned", time:"2026-03-05 10:00", ip:"82.14.200.1",  kind:"admin" },
];

const BACKUPS = [
  { id:"bk_001", type:"Full Snapshot",   size:"48.2 GB", date:"2026-03-08 06:00", status:"success", retention:"30 days" },
  { id:"bk_002", type:"Incremental",     size:"2.1 GB",  date:"2026-03-08 12:00", status:"success", retention:"7 days"  },
  { id:"bk_003", type:"Incremental",     size:"1.8 GB",  date:"2026-03-07 18:00", status:"success", retention:"7 days"  },
  { id:"bk_004", type:"Full Snapshot",   size:"46.9 GB", date:"2026-03-07 06:00", status:"success", retention:"30 days" },
  { id:"bk_005", type:"Build Artifacts", size:"12.4 GB", date:"2026-03-06 22:00", status:"success", retention:"90 days" },
  { id:"bk_006", type:"Incremental",     size:"3.3 GB",  date:"2026-03-06 12:00", status:"failed",  retention:"7 days"  },
];

const REVENUE = [
  { m:"Sep", mrr:1240, profit:620  }, { m:"Oct", mrr:1890, profit:950  },
  { m:"Nov", mrr:2340, profit:1200 }, { m:"Dec", mrr:2100, profit:1050 },
  { m:"Jan", mrr:3200, profit:1700 }, { m:"Feb", mrr:3870, profit:2100 },
  { m:"Mar", mrr:4210, profit:2400 },
];

const CERTS = [
  { id:"c1", name:"Apple Distribution: MyCompany Inc", type:"Distribution", expires:"2027-01-15", status:"active",  fp:"A4:B2:C9:D1" },
  { id:"c2", name:"Apple Development: Alex Martin",    type:"Development",  expires:"2026-09-20", status:"active",  fp:"F3:A1:22:B9" },
  { id:"c3", name:"Apple Distribution: OldApp",        type:"Distribution", expires:"2025-04-01", status:"expired", fp:"12:FF:A2:00" },
];

const PROFILES = [
  { id:"p1", name:"MyApp_AppStore.mobileprovision",  appId:"com.company.myapp",  type:"App Store", expires:"2027-01-15", status:"active",  devices:0  },
  { id:"p2", name:"MyApp_AdHoc.mobileprovision",     appId:"com.company.myapp",  type:"Ad Hoc",    expires:"2026-11-20", status:"active",  devices:12 },
  { id:"p3", name:"OldApp_AppStore.mobileprovision", appId:"com.company.oldapp", type:"App Store", expires:"2025-10-05", status:"expired", devices:0  },
];

const WEBHOOKS_DATA = [
  { id:"w1", url:"https://hooks.slack.com/T01ABC/xxxxx",  events:["build.success","build.failed"], status:"active",   lastSent:"2m ago"  },
  { id:"w2", url:"https://api.myapp.com/ci-webhook",      events:["build.success"],                status:"active",   lastSent:"1h ago"  },
  { id:"w3", url:"https://old-server.io/notify",          events:["build.failed"],                 status:"inactive", lastSent:"12d ago" },
];

const TOKENS_DATA = [
  { id:"t1", name:"CI Pipeline Token", created:"2025-12-01", lastUsed:"5m ago",  scopes:["builds:read","builds:write"] },
  { id:"t2", name:"Read-only Monitor", created:"2026-01-10", lastUsed:"2d ago",  scopes:["builds:read"] },
];

const TICKETS = [
  { id:"TK-001", title:"IPA export fails after Xcode 15.3 upgrade",    status:"open",     priority:"high",   created:"2026-03-08 12:00", cat:"Build",    note:"Investigating code signing chain conflict on Apple Silicon — workaround: use Xcode 15.2 via build settings." },
  { id:"TK-002", title:"Certificate upload returns 413 error",          status:"open",     priority:"medium", created:"2026-03-08 09:00", cat:"Account",  note:"File exceeds 5MB limit. Engineering increasing cap. ETA: 48h." },
  { id:"TK-003", title:"Build log not streaming in Safari 17",          status:"resolved", priority:"low",    created:"2026-03-07 14:00", cat:"Platform", note:"Fixed in v2.14.1 — EventSource polyfill added. Clear browser cache." },
  { id:"TK-004", title:"Webhook not firing on build success",           status:"closed",   priority:"medium", created:"2026-03-05 11:00", cat:"Webhook",  note:"Root cause: missing https:// in endpoint URL. Re-save webhook." },
];

const NOTIFS = [
  { id:1, title:"Build bld_9f2a1 succeeded",            body:"MyApp iOS / main — 42.3 MB — 4m 12s",         time:"2m ago",  type:"success", read:false },
  { id:2, title:"Scheduled maintenance 2026-03-10",      body:"Platform downtime 02:00–02:30 UTC",            time:"2d ago",  type:"warning", read:false },
  { id:3, title:"Build bld_2a5h8 failed",                body:"GIT-401: SSH key authentication error",        time:"14h ago", type:"error",   read:true  },
  { id:4, title:"Certificate expiry reminder",           body:"Apple Distribution: OldApp has expired",       time:"5d ago",  type:"warning", read:true  },
  { id:5, title:"Xcode 15.3 now on all nodes",           body:"Your builds now use Xcode 15.3 by default",    time:"7d ago",  type:"info",    read:true  },
];

const TEAM_DATA = [
  { id:"tm1", name:"Alex Martin",  email:"alex@company.io",  role:"Owner",     joined:"2025-11-12", lastSeen:"2m ago",  av:"A", color:"from-violet-500 to-indigo-600" },
  { id:"tm2", name:"Lucas Petit",  email:"lucas@company.io", role:"Developer", joined:"2026-01-05", lastSeen:"1h ago",  av:"L", color:"from-sky-400 to-blue-600" },
  { id:"tm3", name:"Emma Dupont",  email:"emma@company.io",  role:"Viewer",    joined:"2026-02-10", lastSeen:"3d ago",  av:"E", color:"from-pink-400 to-rose-600" },
];

const INVOICES = [
  { id:"INV-2026-03", date:"2026-03-01", amount:79, status:"paid", period:"Mar 2026" },
  { id:"INV-2026-02", date:"2026-02-01", amount:79, status:"paid", period:"Feb 2026" },
  { id:"INV-2026-01", date:"2026-01-01", amount:79, status:"paid", period:"Jan 2026" },
  { id:"INV-2025-12", date:"2025-12-01", amount:79, status:"paid", period:"Dec 2025" },
];

const SUCCESS_LOG = [
  {t:"00:00",k:"info",    x:"🔧 Initializing build on mac-02 (macOS 14.3, Xcode 15.3)..."},
  {t:"00:01",k:"info",    x:"📦 Cloning: github.com/alex/MyApp.git  branch: main"},
  {t:"00:03",k:"success", x:"✅ Repository cloned — commit a3f9d2e by Alex Martin"},
  {t:"00:04",k:"info",    x:"🔍 Running pod install..."},
  {t:"00:12",k:"success", x:"✅ CocoaPods: 47 pods installed"},
  {t:"00:13",k:"info",    x:"🔑 Injecting: Apple Distribution: MyCompany Inc"},
  {t:"00:14",k:"success", x:"✅ Certificate OK — provisioning profile validated"},
  {t:"00:15",k:"info",    x:"🏗  xcodebuild archive -scheme MyApp -configuration Release"},
  {t:"00:28",k:"warn",    x:"⚠️  Deprecated: URLSession.dataTask (NetworkManager.swift:42)"},
  {t:"00:55",k:"info",    x:"Compiling Swift sources... [████████████░░░░]  75%"},
  {t:"01:10",k:"info",    x:"Compiling Swift sources... [████████████████] 100%"},
  {t:"01:16",k:"success", x:"✅ Archive succeeded: MyApp.xcarchive"},
  {t:"01:17",k:"info",    x:"📦 Exporting IPA (method: app-store)..."},
  {t:"01:22",k:"success", x:"✅ MyApp_2.4.1_release.ipa — 42.3 MB"},
  {t:"01:22",k:"success", x:"🎉 BUILD SUCCESSFUL  ·  4m 12s"},
];
const FAILED_LOG = [
  {t:"00:00",k:"info",  x:"🔧 Initializing build on mac-03 (macOS 14.2, Xcode 15.2)..."},
  {t:"00:01",k:"info",  x:"📦 Cloning: github.com/john/HealthTrack.git  branch: dev"},
  {t:"00:03",k:"success",x:"✅ Repository cloned — commit b7c1a3f by John Osei"},
  {t:"00:04",k:"info",  x:"🔍 Running pod install..."},
  {t:"00:22",k:"success",x:"✅ CocoaPods: 31 pods installed"},
  {t:"00:23",k:"info",  x:"🔑 Injecting signing identity..."},
  {t:"00:24",k:"error", x:"❌ Provisioning profile validation failed"},
  {t:"00:24",k:"error", x:"❌ ITMS-90168: Profile 'com.startup.healthtrack' expired 2025-12-01"},
  {t:"00:25",k:"error", x:"❌ Code signing failed — upload a valid provisioning profile"},
  {t:"00:25",k:"error", x:"💥 BUILD FAILED  ·  1m 44s  ·  [CS-001]"},
];

/* ═══ ICONS ═══ */
const Icon = ({ name, size=14, className="" }) => {
  const d = {
    grid:      <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    layers:    <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
    plus:      <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    shield:    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    bell:      <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    search:    <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    check:     <polyline points="20 6 9 17 4 12"/>,
    x:         <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    download:  <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    refresh:   <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
    upload:    <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
    trash:     <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    monitor:   <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
    zap:       <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    crown:     <><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><line x1="5" y1="20" x2="19" y2="20"/></>,
    users:     <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    userPlus:  <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>,
    server:    <><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></>,
    dollar:    <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    barChart:  <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    alertTri:  <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    database:  <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
    fileText:  <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    send:      <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    key:       <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>,
    git:       <><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></>,
    lock:      <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    unlock:    <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></>,
    power:     <><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></>,
    terminal:  <><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></>,
    info:      <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    edit:      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    clock:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    menu:      <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    chevL:     <polyline points="15 18 9 12 15 6"/>,
    chevR:     <polyline points="9 18 15 12 9 6"/>,
    chevD:     <polyline points="6 9 12 15 18 9"/>,
    package:   <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    github:    <><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></>,
    link:      <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    card:      <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    headset:   <><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></>,
    logOut:    <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    copy:      <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    eye:       <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff:    <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
    mail:      <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    activity:  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    cpu:       <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></>,
    save:      <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
    map:       <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></>,
    trending:  <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    shieldOk:  <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {d[name]}
    </svg>
  );
};

/* ═══ SHARED UI COMPONENTS ═══ */
const Badge = ({ s }) => {
  const m = {
    success:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",running:"bg-amber-500/15 text-amber-400 border-amber-500/25",
    failed:"bg-red-500/15 text-red-400 border-red-500/25",queued:"bg-slate-500/15 text-slate-400 border-slate-500/25",
    active:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",suspended:"bg-red-500/15 text-red-400 border-red-500/25",
    idle:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",busy:"bg-amber-500/15 text-amber-400 border-amber-500/25",
    offline:"bg-slate-500/15 text-slate-400 border-slate-500/25",critical:"bg-red-500/15 text-red-400 border-red-500/25",
    warning:"bg-amber-500/15 text-amber-400 border-amber-500/25",info:"bg-blue-500/15 text-blue-400 border-blue-500/25",
    active2:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",expired:"bg-red-500/15 text-red-400 border-red-500/25",
    open:"bg-amber-500/15 text-amber-400 border-amber-500/25",resolved:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    closed:"bg-slate-500/15 text-slate-400 border-slate-500/25",paid:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    high:"bg-red-500/15 text-red-400 border-red-500/25",medium:"bg-amber-500/15 text-amber-400 border-amber-500/25",
    low:"bg-slate-500/15 text-slate-400 border-slate-500/25",inactive:"bg-slate-500/15 text-slate-400 border-slate-500/25",
    Owner:"bg-violet-500/15 text-violet-400 border-violet-500/25",Developer:"bg-sky-500/15 text-sky-400 border-sky-500/25",
    Viewer:"bg-slate-500/15 text-slate-400 border-slate-500/25",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${m[s]||m.info}`}>{s}</span>;
};

const C = ({ children, className="" }) => (
  <div className={`bg-[#13111f] border border-white/[0.06] rounded-xl ${className}`}>{children}</div>
);
const CH = ({ title, sub, action }) => (
  <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between gap-2 flex-wrap">
    <div><p className="text-[11px] font-black text-slate-200 uppercase tracking-widest">{title}</p>{sub&&<p className="text-[9px] text-slate-500 mt-0.5">{sub}</p>}</div>
    {action&&<div className="flex-shrink-0">{action}</div>}
  </div>
);

const ErrRow = ({ reason, code }) => !reason ? null : (
  <div className="mt-1.5 flex items-start gap-2 bg-red-950/40 border border-red-500/20 rounded-lg px-3 py-2">
    <Icon name="alertTri" size={10} className="text-red-400 flex-shrink-0 mt-0.5"/>
    <div className="flex-1 min-w-0">
      {code&&<span className="text-[9px] text-red-500 font-black font-mono mr-2">[{code}]</span>}
      <span className="text-[10px] text-red-300 font-mono break-all">{reason}</span>
    </div>
  </div>
);

const Spark = ({ data=[], color="#8b5cf6", fill=false, h=24, w=80 }) => {
  if (!data.length) return null;
  const mn=Math.min(...data), mx=Math.max(...data)||1, rng=mx-mn||1;
  const pts=data.map((v,i)=>[(i/(data.length-1))*w, h-((v-mn)/rng)*(h-4)-2]);
  const line=pts.map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area=`${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill&&<path d={area} fill={color} fillOpacity="0.12"/>}
      <path d={line} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const BarSVG = ({ data, labels=[], color="#f43f5e", h=72 }) => {
  const mx=Math.max(...data)*1.1||1, bw=90/data.length;
  return (
    <svg width="100%" height={h+16} viewBox={`0 0 100 ${h+16}`} preserveAspectRatio="none">
      {data.map((v,i)=>{const bh=(v/mx)*(h-4),x=i*(100/data.length)+1;return(<rect key={i} x={x} y={h-bh} width={bw-0.8} height={bh} rx="0.6" fill={color} fillOpacity={0.4+(v/mx)*0.6}/>);})}
      {labels.map((l,i)=>(<text key={i} x={i*(100/data.length)+(bw/2)+1} y={h+13} textAnchor="middle" fontSize="3.8" fill="#475569">{l}</text>))}
    </svg>
  );
};


/* ── Pure SVG Charts (no external lib, no sizing issues) ── */

const SvgBar = ({ data=[], labels=[], color="#8b5cf6", h=180, showValues=false }) => {
  const mx = Math.max(...data) * 1.1 || 1;
  const W = 100, pad = 6, barW = (W - pad*2) / data.length - 1.5;
  const barH = h - 28;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
      <line x1={pad} y1={0} x2={pad} y2={barH} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3"/>
      {[0,0.25,0.5,0.75,1].map(t=>(
        <line key={t} x1={pad} y1={barH*t} x2={W-pad} y2={barH*t} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3"/>
      ))}
      {data.map((v,i) => {
        const bh = (v/mx)*barH;
        const x = pad + i*((W - pad*2)/data.length) + 0.5;
        return (
          <g key={i}>
            <rect x={x} y={barH-bh} width={barW} height={bh} rx="1.2"
              fill={color} fillOpacity={0.5 + (v/mx)*0.5}/>
            {labels[i] && <text x={x+barW/2} y={h-4} textAnchor="middle" fontSize="3.2" fill="#475569">{labels[i]}</text>}
            {showValues && <text x={x+barW/2} y={barH-bh-2} textAnchor="middle" fontSize="3" fill="#94a3b8">{v}</text>}
          </g>
        );
      })}
    </svg>
  );
};

const SvgGroupBar = ({ data=[], keys=[], colors=[], h=180 }) => {
  const allVals = data.flatMap(d => keys.map(k => d[k] || 0));
  const mx = Math.max(...allVals) * 1.1 || 1;
  const W = 100, pad = 6, groupW = (W - pad*2) / data.length;
  const barW = (groupW - 2) / keys.length - 0.5;
  const barH = h - 28;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
      {[0,0.25,0.5,0.75,1].map(t=>(
        <line key={t} x1={pad} y1={barH*t} x2={W-pad} y2={barH*t} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3"/>
      ))}
      {data.map((d,i) => {
        const gx = pad + i*groupW;
        return (
          <g key={i}>
            {keys.map((k,j) => {
              const v = d[k] || 0;
              const bh = (v/mx)*barH;
              const x = gx + j*(barW+0.5) + 0.5;
              return <rect key={k} x={x} y={barH-bh} width={barW} height={bh} rx="1" fill={colors[j]} fillOpacity={0.8}/>;
            })}
            {d.month && <text x={gx+groupW/2} y={h-4} textAnchor="middle" fontSize="3.2" fill="#475569">{d.month}</text>}
          </g>
        );
      })}
      <g>
        {keys.map((k,j)=>(
          <g key={k} transform={`translate(${pad + j*14}, ${h-10})`}>
            <circle cx="2" cy="2" r="1.5" fill={colors[j]}/>
            <text x="5" y="4" fontSize="3" fill="#64748b">{k}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

const SvgArea = ({ data=[], dataKeys=[], colors=[], labels=[], h=220, yFmt=(v)=>v }) => {
  const allVals = data.flatMap(d => dataKeys.map(k => d[k] || 0));
  const mx = Math.max(...allVals) * 1.1 || 1;
  const W = 100, pad = 8, barH = h - 32;
  const pts = (key) => data.map((d,i) => [pad + (i/(data.length-1))*(W-pad*2), barH - (d[key]/mx)*barH]);
  const line = (ps) => ps.map((p,i) => `${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = (ps) => `${line(ps)} L${(W-pad).toFixed(1)},${barH} L${pad},${barH} Z`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
      <defs>
        {dataKeys.map((k,j)=>(
          <linearGradient key={k} id={`svgAreaGrad${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={colors[j]} stopOpacity="0.3"/>
            <stop offset="95%" stopColor={colors[j]} stopOpacity="0"/>
          </linearGradient>
        ))}
      </defs>
      {[0,0.25,0.5,0.75,1].map(t=>(
        <line key={t} x1={pad} y1={barH*t} x2={W-pad} y2={barH*t} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3"/>
      ))}
      {dataKeys.map((k,j) => {
        const ps = pts(k);
        return (
          <g key={k}>
            <path d={area(ps)} fill={`url(#svgAreaGrad${k})`}/>
            <path d={line(ps)} stroke={colors[j]} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            {ps.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="1.2" fill={colors[j]}/>)}
          </g>
        );
      })}
      {labels.map((l,i)=>(
        <text key={i} x={pad + (i/(labels.length-1))*(W-pad*2)} y={h-16} textAnchor="middle" fontSize="3.2" fill="#475569">{l}</text>
      ))}
      <g>
        {dataKeys.map((k,j)=>(
          <g key={k} transform={`translate(${pad + j*16}, ${h-6})`}>
            <circle cx="2" cy="0" r="1.5" fill={colors[j]}/>
            <text x="5" y="2" fontSize="3" fill="#64748b">{k}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

const SvgPie = ({ data=[], colors=[], h=200 }) => {
  const total = data.reduce((s,d)=>s+(d.value||0),0) || 1;
  const cx=50, cy=46, r=32, ri=20;
  let angle = -Math.PI/2;
  const slices = data.map((d,i)=>{
    const sweep = (d.value/total)*Math.PI*2;
    const x1=cx+r*Math.cos(angle), y1=cy+r*Math.sin(angle);
    angle += sweep;
    const x2=cx+r*Math.cos(angle), y2=cy+r*Math.sin(angle);
    const xi1=cx+ri*Math.cos(angle-sweep), yi1=cy+ri*Math.sin(angle-sweep);
    const xi2=cx+ri*Math.cos(angle), yi2=cy+ri*Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { d:`M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r},0,${large},1,${x2.toFixed(2)},${y2.toFixed(2)} L${xi2.toFixed(2)},${yi2.toFixed(2)} A${ri},${ri},0,${large},0,${xi1.toFixed(2)},${yi1.toFixed(2)} Z`, color:colors[i], ...d };
  });
  return (
    <svg width="100%" height={h} viewBox={`0 0 100 ${h}`} style={{display:"block"}}>
      {slices.map((s,i)=><path key={i} d={s.d} fill={s.color} fillOpacity="0.9" stroke="#13111f" strokeWidth="0.8"/>)}
      <text x={cx} y={cy+1} textAnchor="middle" fontSize="5" fontWeight="bold" fill="#e2e8f0">{total}</text>
      <text x={cx} y={cy+6} textAnchor="middle" fontSize="3" fill="#64748b">total</text>
      {data.map((d,i)=>(
        <g key={i} transform={`translate(4, ${h-22+i*7})`}>
          <rect x="0" y="0" width="4" height="4" rx="1" fill={colors[i]}/>
          <text x="6" y="3.5" fontSize="3.2" fill="#94a3b8">{d.name} <tspan fill="#64748b">({d.value})</tspan></text>
        </g>
      ))}
    </svg>
  );
};

const SvgCpuHistory = ({ data=[], color="#10b981", h=160 }) => {
  return <Spark data={data} color={color} fill h={h} w={500}/>;
};

const Toast = ({ toasts }) => (
  <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-2 pointer-events-none">
    {toasts.map(t=>(
      <div key={t.id} className="flex items-center gap-3 bg-[#1a1728] border border-white/10 rounded-xl px-4 py-3 shadow-2xl" style={{animation:"toastIn .2s ease-out"}}>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.tp==="success"?"bg-emerald-400":t.tp==="error"?"bg-red-400":t.tp==="warn"?"bg-amber-400":"bg-blue-400"}`}/>
        <span className="text-xs text-slate-200">{t.msg}</span>
      </div>
    ))}
  </div>
);

/* ═══ LOG VIEWER MODAL ═══ */
const LogModal = ({ build, onClose }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const lines = build?.status==="failed" ? FAILED_LOG : SUCCESS_LOG;
  useEffect(()=>{ setCount(0); const t=setInterval(()=>setCount(c=>{if(c>=lines.length){clearInterval(t);return c;}return c+1;}),130); return()=>clearInterval(t); },[build]);
  useEffect(()=>{ ref.current?.scrollIntoView({behavior:"smooth"}); },[count]);
  const tc={info:"text-slate-400",success:"text-emerald-400",warn:"text-amber-400",error:"text-red-400"};
  if(!build) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-[#0b0917] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{maxHeight:"82vh"}} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/[0.06] bg-[#0e0c1a] flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"/><div className="w-2.5 h-2.5 rounded-full bg-amber-500/60"/><div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"/>
          <span className="text-[10px] text-slate-500 font-mono flex-1 truncate ml-1">{build.project} · {build.id} · {build.branch}</span>
          <Badge s={build.status}/>
          {count<lines.length&&<span className="text-[9px] text-amber-400 animate-pulse font-bold">● LIVE</span>}
          {count>=lines.length&&build.status==="success"&&<span className="text-[9px] text-emerald-400 font-bold">✓ OK</span>}
          {count>=lines.length&&build.status!=="success"&&<span className="text-[9px] text-red-400 font-bold">✗ FAIL</span>}
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors ml-1"><Icon name="x" size={13}/></button>
        </div>
        {build.errorReason&&(
          <div className="flex items-start gap-2 px-4 py-2.5 bg-red-950/40 border-b border-red-500/20 flex-shrink-0">
            <Icon name="alertTri" size={11} className="text-red-400 flex-shrink-0 mt-0.5"/>
            <div><span className="text-[9px] text-red-500 font-black font-mono mr-2">[{build.errorCode}]</span><span className="text-[10px] text-red-300 font-mono">{build.errorReason}</span></div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-0.5 font-mono text-[11px]">
          {lines.slice(0,count).map((l,i)=>(
            <div key={i} className="flex gap-3 hover:bg-white/[0.02] rounded px-1 py-0.5">
              <span className="text-slate-700 w-10 flex-shrink-0 select-none">{l.t}</span>
              <span className={tc[l.k]}>{l.x}</span>
            </div>
          ))}
          {count<lines.length&&<div className="flex gap-3 px-1"><span className="text-slate-700 w-10"/><span className="text-slate-600 animate-pulse">▌</span></div>}
          <div ref={ref}/>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.05] bg-[#0e0c1a] flex-shrink-0">
          <div className="flex gap-3">
            <span className="text-[9px] text-slate-600 font-mono">Mac: {build.mac}</span>
            <span className="text-[9px] text-slate-600 font-mono">Xcode: {build.xcode}</span>
            <span className="text-[9px] text-slate-600 font-mono">Region: {build.region}</span>
          </div>
          {build.status==="success"&&(
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-600/30 transition-colors">
              <Icon name="download" size={10}/>Download IPA ({build.size})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══ TOGGLE ═══ */
const Toggle = ({ on, onChange }) => (
  <div onClick={()=>onChange(!on)} className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative flex-shrink-0 ${on?"bg-violet-600":"bg-white/10"}`}>
    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${on?"translate-x-4":"translate-x-0.5"}`}/>
  </div>
);

/* ═══ EXPORT CSV HELPER ═══ */
const exportCSV = (rows, cols, filename) => {
  const csv = [cols.join(","), ...rows.map(r=>cols.map(c=>JSON.stringify(r[c]??"")))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"}));
  a.download = filename; a.click();
};

/* ═══ ADMIN NAV ═══ */
const ANAV = [
  {id:"overview",      label:"Overview",        icon:"grid",     group:"Platform"},
  {id:"builds",        label:"All Builds",      icon:"layers",   group:"Platform"},
  {id:"users",         label:"Users",           icon:"users",    group:"Platform"},
  {id:"nodes",         label:"Mac Nodes",       icon:"server",   group:"Infra"},
  {id:"node-detail",   label:"Node Detail",     icon:"monitor",  group:"Infra",   hidden:true},
  {id:"alerts",        label:"Alerts",          icon:"alertTri", group:"System"},
  {id:"audit",         label:"Audit Trail",     icon:"fileText", group:"System"},
  {id:"broadcast",     label:"Broadcast",       icon:"send",     group:"System"},
  {id:"plans",         label:"Plans & Pricing", icon:"dollar",   group:"Config"},
  {id:"backups",       label:"Backups",         icon:"database", group:"Config"},
  {id:"analytics",     label:"Analytics",       icon:"barChart", group:"Config"},
];

const AdminSidebar = ({ page, setPage, alerts, collapsed, setCollapsed, onSignOut }) => {
  const groups = [...new Set(ANAV.filter(n=>!n.hidden).map(n=>n.group))];
  const unack = alerts.filter(a=>!a.ack).length;
  return (
    <aside className={`flex-shrink-0 h-screen bg-[#0d0a15] border-r border-white/[0.05] flex flex-col transition-all duration-300 ${collapsed?"w-14":"w-52"}`}>
      <div className="px-3 py-3 border-b border-white/[0.05] flex items-center gap-2 justify-between">
        {!collapsed&&(<div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30 flex-shrink-0"><Icon name="crown" size={12} className="text-white"/></div>
          <div className="min-w-0"><p className="text-[11px] font-black text-white tracking-tight">MAC BUILD</p><p className="text-[9px] text-rose-400 font-black uppercase tracking-widest">Admin</p></div>
        </div>)}
        {collapsed&&(<div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg mx-auto"><Icon name="crown" size={12} className="text-white"/></div>)}
        {!collapsed&&(<button onClick={()=>setCollapsed(true)} className="text-slate-600 hover:text-slate-400 transition-colors"><Icon name="chevL" size={13}/></button>)}
      </div>
      {collapsed&&(<button onClick={()=>setCollapsed(false)} className="mx-auto mt-2 text-slate-600 hover:text-slate-400 transition-colors"><Icon name="menu" size={13}/></button>)}
      <nav className="flex-1 px-2 py-2 overflow-y-auto min-h-0">
        {groups.map(g=>(
          <div key={g} className="mb-3">
            {!collapsed&&<p className="text-[8px] text-slate-700 uppercase tracking-widest px-2 mb-1 font-black">{g}</p>}
            {ANAV.filter(n=>n.group===g&&!n.hidden).map(({id,label,icon})=>(
              <button key={id} onClick={()=>setPage(id)} title={collapsed?label:undefined}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] transition-all mb-0.5 ${page===id?"bg-rose-600/20 text-rose-300 border border-rose-500/20 font-bold":"text-slate-400 hover:text-white hover:bg-white/[0.04]"} ${collapsed?"justify-center":""}`}>
                <div className="relative flex-shrink-0">
                  <Icon name={icon} size={13}/>
                  {id==="alerts"&&unack>0&&(<span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full text-[7px] flex items-center justify-center text-white font-black">{unack}</span>)}
                </div>
                {!collapsed&&<span className="flex-1 text-left truncate">{label}</span>}
                {!collapsed&&id==="alerts"&&unack>0&&(<span className="text-[8px] bg-red-500/20 border border-red-500/25 text-red-400 px-1.5 py-0.5 rounded-full font-black">{unack}</span>)}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="flex-shrink-0"><AdminProfileWidget collapsed={collapsed} setPage={setPage} onSignOut={onSignOut}/></div>
    </aside>
  );
};

const AdminProfileWidget = ({ collapsed, setPage, onSignOut }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Admin");
  const [email] = useState("admin@macbuild.cloud");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("Admin");
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const save = () => { setName(draft); setEditing(false); };
  return (
    <div className="px-3 py-2.5 border-t border-white/[0.05] relative" ref={ref}>
      {!collapsed && (
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors group">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-black text-white">{name[0]}</span>
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-bold text-slate-300 truncate">{name}</p>
            <p className="text-[9px] text-slate-600 truncate">{email}</p>
          </div>
          <Icon name="chevD" size={11} className={`text-slate-600 flex-shrink-0 transition-transform ${open?"rotate-180":""}`}/>
        </button>
      )}
      {collapsed && (
        <button onClick={() => setOpen(o => !o)} className="mx-auto flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-rose-600 to-red-700">
          <span className="text-[9px] font-black text-white">{name[0]}</span>
        </button>
      )}
      {open && (
        <div className="absolute bottom-full left-2 right-2 mb-2 bg-[#1a1728] border border-white/[0.08] rounded-xl shadow-2xl z-[999]" style={{overflow:"visible"}}>
          <div className="px-4 py-3 border-b border-white/[0.05]">
            {editing ? (
              <div className="space-y-2">
                <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-rose-500/50"/>
                <p className="text-[9px] text-slate-500 font-mono">{email}</p>
                <div className="flex gap-2">
                  <button onClick={save} className="flex-1 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-colors">Save</button>
                  <button onClick={() => { setEditing(false); setDraft(name); }} className="flex-1 py-1 bg-white/[0.05] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-black text-white">{name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-200">{name}</p>
                  <p className="text-[9px] text-slate-500">{email}</p>
                </div>
                <button onClick={() => setEditing(true)} className="text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0" title="Edit name">
                  <Icon name="edit" size={12}/>
                </button>
              </div>
            )}
          </div>
          <div className="py-1">
            {[
              { icon:"lock",     label:"Change Password", action: () => {} },
              { icon:"shieldOk", label:"Security",        action: () => {} },
              { icon:"activity", label:"Activity Log",    action: () => setPage("audit") },
              { icon:"barChart", label:"Analytics",       action: () => setPage("analytics") },
            ].map(item => (
              <button key={item.label} onClick={() => { item.action(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors">
                <Icon name={item.icon} size={12}/>{item.label}
              </button>
            ))}
            <div className="border-t border-white/[0.05] mt-1 pt-1">
              <button onClick={() => { setOpen(false); onSignOut && onSignOut(); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors">
                <Icon name="logOut" size={12}/>Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── ADMIN: OVERVIEW ─── */
const AdminOverview = ({ setPage, alerts }) => {
  const unack = alerts.filter(a=>!a.ack).length;
  const failed = BUILDS.filter(b=>b.status==="failed");
  const revenue = REVENUE[REVENUE.length-1].mrr;
  const buildsByHour = [3,5,8,6,9,12,10,8,14,11,9,7,5,6];
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {l:"Total Builds",  v:BUILDS.length,                          tc:"text-violet-400",  spark:[3,5,8,6,9,12,10,8], sc:"#8b5cf6", bg:"from-violet-500/10 border-violet-500/15"},
          {l:"Active Users",  v:USERS.filter(u=>u.status==="active").length, tc:"text-emerald-400", spark:[1,2,2,3,4,4,5,5],   sc:"#10b981", bg:"from-emerald-500/10 border-emerald-500/15"},
          {l:"Nodes Online",  v:MACS.filter(m=>m.status!=="offline").length, tc:"text-sky-400",     spark:[3,3,3,4,3,3,3,3],   sc:"#0ea5e9", bg:"from-sky-500/10 border-sky-500/15"},
          {l:"MRR",           v:`$${(revenue/1000).toFixed(1)}k`,         tc:"text-amber-400",   spark:REVENUE.map(r=>r.mrr), sc:"#f59e0b", bg:"from-amber-500/10 border-amber-500/15"},
        ].map(s=>(
          <div key={s.l} className={`bg-gradient-to-b ${s.bg} to-transparent border rounded-xl p-3`}>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{s.l}</p>
            <p className={`text-xl font-black font-mono ${s.tc}`}>{s.v}</p>
            <div className="mt-2"><Spark data={s.spark} color={s.sc} fill h={28} w={100}/></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Build volume chart */}
        <C><CH title="Build Volume — 24h"/>
          <div className="px-4 pb-3">
            <SvgBar data={buildsByHour} labels={["0h","2h","4h","6h","8h","10h","12h","14h","16h","18h","20h","22h","23h","Now"]} color="#8b5cf6" h={180}/>
          </div>
        </C>

        {/* Node Health */}
        <C><CH title="Node Health" sub="Live" action={<button onClick={()=>setPage("nodes")} className="text-[9px] text-rose-400 font-bold hover:text-rose-300">All →</button>}/>
          <div className="p-3 space-y-2">
            {MACS.map(m=>(
              <div key={m.id} className="flex items-center gap-3 bg-black/20 border border-white/[0.04] rounded-lg px-3 py-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status==="busy"?"bg-amber-400 animate-pulse":m.status==="idle"?"bg-emerald-400":"bg-slate-600"}`}/>
                <span className="text-[11px] text-slate-300 font-semibold flex-1">{m.name}</span>
                <Badge s={m.status}/>
                <span className="text-[10px] text-slate-500 font-mono">{m.cpu}% CPU</span>
                <span className="text-[10px] text-slate-500 font-mono">{m.temp}°</span>
              </div>
            ))}
          </div>
        </C>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent failures */}
        <C><CH title="Recent Failures" sub={`${failed.length} builds`} action={<button onClick={()=>setPage("builds")} className="text-[9px] text-rose-400 font-bold hover:text-rose-300">All →</button>}/>
          {failed.map(b=>(
            <div key={b.id} className="px-4 py-2.5 border-b border-white/[0.03] last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-300 font-semibold flex-1 truncate">{b.project}</span>
                <span className="text-[10px] text-slate-500 hidden sm:block">{b.user}</span>
                <span className="text-[9px] text-rose-400 font-mono">{b.errorCode}</span>
              </div>
              <ErrRow reason={b.errorReason} code={null}/>
            </div>
          ))}
        </C>

        {/* Alerts */}
        <C><CH title="Active Alerts" sub={`${unack} unacknowledged`} action={<button onClick={()=>setPage("alerts")} className="text-[9px] text-rose-400 font-bold hover:text-rose-300">All →</button>}/>
          {alerts.filter(a=>!a.ack).slice(0,4).map(a=>(
            <div key={a.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-white/[0.03] last:border-0">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${a.type==="critical"?"bg-red-400 animate-pulse":a.type==="warning"?"bg-amber-400":"bg-blue-400"}`}/>
              <div className="flex-1 min-w-0"><p className="text-[11px] text-slate-300 font-semibold truncate">{a.title}</p><p className="text-[9px] text-slate-500 truncate">{a.msg}</p></div>
              <Badge s={a.type}/>
            </div>
          ))}
        </C>
      </div>

      {/* Revenue trend */}
      <C><CH title="Revenue Trend — MRR vs Profit" sub="Last 7 months"/>
        <div className="px-4 pb-3">
          <SvgArea
            data={REVENUE.map(r=>({...r,month:r.m}))}
            dataKeys={["mrr","profit"]}
            colors={["#8b5cf6","#10b981"]}
            labels={REVENUE.map(r=>r.m)}
            h={220}
          />
        </div>
      </C>
    </div>
  );
};

/* ─── ADMIN: ALL BUILDS ─── */
const AdminBuilds = ({ addToast }) => {
  const [filter, setFilter] = useState("all");
  const [log, setLog] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = BUILDS.filter(b=>(filter==="all"||b.status===filter)&&(b.project+b.user+b.id).toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {["all","running","queued","success","failed"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[9px] capitalize font-bold transition-colors ${filter===f?"bg-rose-600/25 text-rose-300 border border-rose-500/25":"text-slate-500 hover:text-slate-300"}`}>{f}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative"><Icon name="search" size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="bg-black/30 border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 outline-none w-40"/></div>
          <button onClick={()=>{exportCSV(filtered,["id","project","user","status","date","branch","mac","xcode"],"builds.csv");addToast("CSV exported","success");}} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors"><Icon name="download" size={11}/>Export</button>
        </div>
      </div>
      <C>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="border-b border-white/[0.05]">{["Build ID","Project","User","Status","Branch","Mac","Xcode","Date",""].map(h=>(<th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>))}</tr></thead>
            <tbody>
              {filtered.map(b=>(
                <>
                  <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-2.5 text-[10px] font-mono text-slate-400">{b.id}</td>
                    <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-200">{b.project}</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-400 truncate max-w-[120px]">{b.user}</td>
                    <td className="px-3 py-2.5"><Badge s={b.status}/></td>
                    <td className="px-3 py-2.5 text-[10px] font-mono text-slate-500 truncate max-w-[100px]">{b.branch}</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500">{b.mac}</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500">{b.xcode}</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500 whitespace-nowrap">{b.date}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={()=>setLog(b)} className="text-slate-600 hover:text-violet-400 transition-colors" title="View log"><Icon name="terminal" size={12}/></button>
                    </td>
                  </tr>
                  {b.errorReason&&(<tr key={b.id+"e"} className="border-b border-white/[0.03]"><td colSpan={9} className="px-3 pb-2.5"><ErrRow reason={b.errorReason} code={b.errorCode}/></td></tr>)}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </C>
      {log&&<LogModal build={log} onClose={()=>setLog(null)}/>}
    </div>
  );
};

/* ─── ADMIN: USERS ─── */
const AdminUsers = ({ addToast }) => {
  const [users, setUsers] = useState(USERS);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = users.filter(u=>(u.name+u.email).toLowerCase().includes(search.toLowerCase()));
  const toggle = (id) => setUsers(us=>us.map(u=>u.id===id?{...u,status:u.status==="active"?"suspended":"active"}:u));
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-3">
          {[["active",USERS.filter(u=>u.status==="active").length,"text-emerald-400"],["suspended",USERS.filter(u=>u.status==="suspended").length,"text-red-400"],["revenue",`$${USERS.reduce((s,u)=>s+u.revenue,0)}/mo`,"text-amber-400"]].map(([l,v,c])=>(
            <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-lg px-3 py-2">
              <p className="text-[9px] text-slate-500 capitalize">{l}</p>
              <p className={`text-sm font-black font-mono ${c}`}>{v}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative"><Icon name="search" size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="bg-black/30 border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 outline-none w-40"/></div>
          <button onClick={()=>{exportCSV(filtered,["id","name","email","plan","status","builds","revenue","joined"],"users.csv");addToast("CSV exported","success");}} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors"><Icon name="download" size={11}/>Export</button>
        </div>
      </div>
      <C>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead><tr className="border-b border-white/[0.05]">{["User","Email","Plan","Builds","Revenue","Joined","Status",""].map(h=>(<th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>))}</tr></thead>
            <tbody>
              {filtered.map(u=>(
                <>
                  <tr key={u.id} className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer ${u.status==="suspended"?"opacity-50":""}`} onClick={()=>setExpanded(expanded===u.id?null:u.id)}>
                    <td className="px-3 py-2.5"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-[9px] font-black text-white">{u.name[0]}</div><span className="text-[11px] font-semibold text-slate-200">{u.name}</span></div></td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-400">{u.email}</td>
                    <td className="px-3 py-2.5"><Badge s={u.plan}/></td>
                    <td className="px-3 py-2.5 text-[11px] font-mono text-slate-300">{u.builds}</td>
                    <td className="px-3 py-2.5 text-[11px] font-mono text-emerald-400">${u.revenue}/mo</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500">{u.joined}</td>
                    <td className="px-3 py-2.5"><Badge s={u.status}/></td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-600">{u.country} <Icon name="chevD" size={10}/></td>
                  </tr>
                  {expanded===u.id&&(
                    <tr key={u.id+"x"} className="border-b border-white/[0.03] bg-black/20">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex gap-4">
                            <div><p className="text-[9px] text-slate-500">Storage</p><p className="text-xs font-bold text-slate-300">{u.storage}</p></div>
                            <div><p className="text-[9px] text-slate-500">Last seen</p><p className="text-xs font-bold text-slate-300">{u.lastSeen}</p></div>
                            <div><p className="text-[9px] text-slate-500">Country</p><p className="text-xs font-bold text-slate-300">{u.country}</p></div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={()=>{addToast(`Email sent to ${u.email}`,"info");}} className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors flex items-center gap-1.5"><Icon name="mail" size={11}/>Email</button>
                            <button onClick={()=>{toggle(u.id);addToast(u.status==="active"?`${u.name} suspended`:`${u.name} reactivated`,u.status==="active"?"warn":"success");}} className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1.5 ${u.status==="active"?"bg-red-900/20 border-red-500/20 text-red-400 hover:bg-red-900/30":"bg-emerald-900/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/30"}`}><Icon name="power" size={11}/>{u.status==="active"?"Suspend":"Reactivate"}</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </C>
    </div>
  );
};

/* ─── ADMIN: MAC NODES ─── */
const AdminNodes = ({ setPage, setSelNode, addToast }) => {
  const [macs, setMacs] = useState(MACS);
  const reboot = (id) => { setMacs(ms=>ms.map(m=>m.id===id?{...m,status:"idle"}:m)); addToast(`${id} rebooting…`,"warn"); };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Total",macs.length,"text-slate-300"],["Busy",macs.filter(m=>m.status==="busy").length,"text-amber-400"],["Idle",macs.filter(m=>m.status==="idle").length,"text-emerald-400"],["Offline",macs.filter(m=>m.status==="offline").length,"text-red-400"]].map(([l,v,c])=>(
          <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3"><p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{l}</p><p className={`text-2xl font-black font-mono ${c}`}>{v}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {macs.map(m=>(
          <C key={m.id} className={m.status==="offline"?"opacity-60":""}>
            <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${m.status==="busy"?"bg-amber-400 animate-pulse":m.status==="idle"?"bg-emerald-400":"bg-slate-600"}`}/>
                <div><p className="text-[11px] font-black text-slate-200">{m.name}</p><p className="text-[9px] text-slate-500 font-mono">{m.ip} · {m.region}</p></div>
              </div>
              <Badge s={m.status}/>
            </div>
            <div className="p-4 space-y-2.5">
              {[["CPU",m.cpu,"bg-violet-500"],["RAM",m.ram,"bg-sky-500"],["Temp",m.temp,"bg-orange-500",100],["Disk",m.disk,"bg-emerald-500"]].map(([l,v,c,mx=100])=>(
                <div key={l}><div className="flex justify-between mb-1"><span className="text-[9px] text-slate-500">{l}</span><span className="text-[9px] font-mono text-slate-300">{v}{l==="Temp"?"°":"%"}</span></div><div className="h-1 bg-white/[0.05] rounded-full overflow-hidden"><div className={`h-full ${c} rounded-full transition-all`} style={{width:`${(v/mx)*100}%`}}/></div></div>
              ))}
              <div className="mt-1">
                <Spark data={m.history} color={m.status==="offline"?"#475569":m.status==="busy"?"#f59e0b":"#10b981"} fill h={40} w={200}/>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={()=>{setSelNode(m);setPage("node-detail");}} className="flex-1 py-1.5 bg-white/[0.04] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5"><Icon name="monitor" size={11}/>Details</button>
                <button onClick={()=>reboot(m.id)} disabled={m.status==="offline"} className="flex-1 py-1.5 bg-amber-900/20 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg hover:bg-amber-900/30 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-30"><Icon name="refresh" size={11}/>Reboot</button>
              </div>
            </div>
          </C>
        ))}
      </div>
    </div>
  );
};

/* ─── ADMIN: NODE DETAIL ─── */
const AdminNodeDetail = ({ node, setPage, addToast }) => {
  if(!node) return <div className="flex-1 flex items-center justify-center"><div className="text-slate-500 text-sm">No node selected.<br/><button onClick={()=>setPage("nodes")} className="text-rose-400 mt-2 font-bold text-xs">← Back to nodes</button></div></div>;
  const nodeBuilds = BUILDS.filter(b=>b.mac===node.id);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={()=>setPage("nodes")} className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"><Icon name="chevL" size={12}/>Mac Nodes</button>
        <span className="text-slate-700">/</span>
        <span className="text-[10px] font-bold text-slate-300">{node.name}</span>
        <Badge s={node.status}/>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["OS",node.os],["Xcode",node.xcode],["Region",node.region],["Uptime",node.uptime]].map(([l,v])=>(
          <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3"><p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{l}</p><p className="text-xs font-black text-slate-200">{v}</p></div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C><CH title="System Resources"/>
          <div className="p-4 space-y-3">
            {[["CPU Usage",node.cpu,"bg-violet-500"],["RAM Usage",node.ram,"bg-sky-500"],["Temperature",node.temp,"bg-orange-500","°",100],["Disk Usage",node.disk,"bg-emerald-500"]].map(([l,v,c,suf="%",mx=100])=>(
              <div key={l}>
                <div className="flex justify-between mb-1.5"><span className="text-[10px] text-slate-400">{l}</span><span className="text-[11px] font-mono font-bold text-slate-200">{v}{suf}</span></div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden"><div className={`h-full ${c} rounded-full`} style={{width:`${(v/mx)*100}%`}}/></div>
              </div>
            ))}
          </div>
        </C>

        <C><CH title="CPU History — 24h"/>
          <div className="px-4 pb-3 pt-1">
            <Spark data={[...node.history,...node.history.slice(-4)]} color={node.status==="busy"?"#f59e0b":"#10b981"} fill h={160} w={500}/>
          </div>
        </C>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[["IP Address",node.ip,"font-mono"],["Last Reboot",node.lastReboot,""],["OS Version",node.os,""],["Xcode Version",node.xcode,"font-mono"]].map(([l,v,cls])=>(
          <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-[10px] text-slate-500">{l}</span>
            <span className={`text-[11px] text-slate-200 font-semibold ${cls}`}>{v}</span>
          </div>
        ))}
      </div>

      <C><CH title={`Build History on ${node.name}`} sub={`${nodeBuilds.length} builds`}/>
        {nodeBuilds.length===0&&<p className="px-4 py-6 text-[11px] text-slate-500 text-center">No builds on this node</p>}
        {nodeBuilds.map(b=>(
          <div key={b.id} className="px-4 py-2.5 border-b border-white/[0.03] last:border-0">
            <div className="flex items-center gap-2"><Badge s={b.status}/><span className="text-[11px] font-semibold text-slate-300 flex-1">{b.project}</span><span className="text-[10px] text-slate-500 font-mono">{b.duration}</span></div>
            <ErrRow reason={b.errorReason} code={b.errorCode}/>
          </div>
        ))}
      </C>

      <div className="flex gap-3">
        <button onClick={()=>addToast(`Rebooting ${node.name}…`,"warn")} className="px-4 py-2 bg-amber-900/20 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-900/30 transition-colors flex items-center gap-2"><Icon name="refresh" size={12}/>Reboot Node</button>
        <button onClick={()=>addToast(`Draining ${node.name} from queue…`,"info")} className="px-4 py-2 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-xs font-bold rounded-lg hover:text-slate-200 transition-colors flex items-center gap-2"><Icon name="power" size={12}/>Drain from Queue</button>
        <button onClick={()=>addToast(`Deprovisioning ${node.name}…`,"error")} className="px-4 py-2 bg-red-900/20 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-900/30 transition-colors flex items-center gap-2"><Icon name="trash" size={12}/>Deprovision</button>
      </div>
    </div>
  );
};

/* ─── ADMIN: ALERTS ─── */
const AdminAlerts = ({ alerts, setAlerts, addToast }) => {
  const [filter, setFilter] = useState("all");
  const ack = (id) => { setAlerts(as=>as.map(a=>a.id===id?{...a,ack:true}:a)); addToast("Alert acknowledged","success"); };
  const ackAll = () => { setAlerts(as=>as.map(a=>({...a,ack:true}))); addToast("All alerts acknowledged","success"); };
  const filtered = filter==="all"?alerts:filter==="unack"?alerts.filter(a=>!a.ack):alerts.filter(a=>a.type===filter);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {["all","unack","critical","warning","info"].map(f=>(<button key={f} onClick={()=>setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[9px] capitalize font-bold transition-colors ${filter===f?"bg-rose-600/25 text-rose-300 border border-rose-500/25":"text-slate-500 hover:text-slate-300"}`}>{f}</button>))}
        </div>
        <button onClick={ackAll} className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors flex items-center gap-1.5"><Icon name="check" size={10}/>Ack All</button>
      </div>
      <div className="space-y-2">
        {filtered.map(a=>(
          <div key={a.id} className={`bg-[#13111f] border rounded-xl px-4 py-3 flex items-start gap-3 transition-opacity ${a.ack?"opacity-50":"border-white/[0.06]"} ${a.type==="critical"&&!a.ack?"border-red-500/20":""}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type==="critical"?"bg-red-400 animate-pulse":a.type==="warning"?"bg-amber-400":"bg-blue-400"}`}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5"><Badge s={a.type}/><p className="text-[11px] font-bold text-slate-200">{a.title}</p></div>
              <p className="text-[10px] text-slate-400">{a.msg}</p>
              <p className="text-[9px] text-slate-600 mt-1">{a.time}</p>
            </div>
            {!a.ack&&<button onClick={()=>ack(a.id)} className="text-[10px] text-rose-400 font-bold hover:text-rose-300 transition-colors flex-shrink-0">Ack</button>}
            {a.ack&&<span className="text-[9px] text-slate-600">Acked</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── ADMIN: AUDIT ─── */
const AdminAudit = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = AUDIT.filter(a=>(filter==="all"||a.kind===filter)&&(a.user+a.action+a.target).toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {["all","admin","user"].map(f=>(<button key={f} onClick={()=>setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[9px] capitalize font-bold transition-colors ${filter===f?"bg-rose-600/25 text-rose-300 border border-rose-500/25":"text-slate-500 hover:text-slate-300"}`}>{f}</button>))}
        </div>
        <div className="relative"><Icon name="search" size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="bg-black/30 border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 outline-none w-44"/></div>
      </div>
      <C>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead><tr className="border-b border-white/[0.05]">{["User","Action","Target","Time","IP"].map(h=>(<th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>))}</tr></thead>
            <tbody>
              {filtered.map(a=>(
                <tr key={a.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-2.5 text-[10px] text-slate-400">{a.user}</td>
                  <td className="px-3 py-2.5"><span className={`text-[10px] font-mono font-bold ${a.kind==="admin"?"text-rose-400":"text-violet-400"}`}>{a.action}</span></td>
                  <td className="px-3 py-2.5 text-[10px] text-slate-300">{a.target}</td>
                  <td className="px-3 py-2.5 text-[10px] text-slate-500 whitespace-nowrap">{a.time}</td>
                  <td className="px-3 py-2.5 text-[10px] font-mono text-slate-600">{a.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </C>
    </div>
  );
};

/* ─── ADMIN: BROADCAST ─── */
const AdminBroadcast = ({ addToast }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("info");
  const [target, setTarget] = useState("all");
  const [sent, setSent] = useState([
    {id:1, title:"Maintenance 2026-03-10", body:"Platform downtime 02:00–02:30 UTC", type:"warning", target:"all", time:"2d ago"},
    {id:2, title:"Xcode 15.3 deployed",    body:"All nodes updated to Xcode 15.3",   type:"info",    target:"all", time:"5d ago"},
  ]);
  const send = () => {
    if(!title||!body) return addToast("Fill in title and message","error");
    setSent(s=>[{id:Date.now(),title,body,type,target,time:"just now"},...s]);
    setTitle(""); setBody(""); addToast("Broadcast sent","success");
  };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <C><CH title="New Broadcast"/>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Type</label>
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                {["info","warning","error"].map(t=>(<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Target</label>
              <select value={target} onChange={e=>setTarget(e.target.value)} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                <option value="all">All users</option>
                <option value="pro">Pro + Team</option>
                <option value="starter">Starter only</option>
              </select>
            </div>
          </div>
          <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Announcement title…" className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-rose-500/40 transition-colors"/></div>
          <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Message</label><textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Message to users…" className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none resize-none focus:border-rose-500/40 transition-colors"/></div>
          <button onClick={send} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors"><Icon name="send" size={11}/>Send Broadcast</button>
        </div>
      </C>
      <C><CH title="Sent History"/>
        {sent.map(s=>(
          <div key={s.id} className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] last:border-0">
            <Badge s={s.type}/><div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-slate-200">{s.title}</p><p className="text-[10px] text-slate-400">{s.body}</p></div><span className="text-[9px] text-slate-600 flex-shrink-0">{s.time}</span>
          </div>
        ))}
      </C>
    </div>
  );
};

/* ─── ADMIN: PLANS ─── */
const AdminPlans = ({ addToast }) => {
  const [plans, setPlans] = useState(PLANS);
  const [showNew, setShowNew] = useState(false);
  const [newPlan, setNewPlan] = useState({ name:"", price:"", builds:"", macHours:"", certs:"", apiCalls:"", seats:"" });

  const upd = (id, field, val) =>
    setPlans(ps => ps.map(p => p.id === id ? { ...p, [field]: isNaN(val) || val==="" ? val : Number(val) } : p));

  const save = (p) => addToast(`${p.name} saved ✓`, "success");

  const del = (id) => {
    const p = plans.find(x => x.id === id);
    const userCount = USERS.filter(u => u.plan === p.name).length;
    if (userCount > 0) return addToast(`Cannot delete — ${userCount} active user(s) on this plan`, "error");
    setPlans(ps => ps.filter(x => x.id !== id));
    addToast(`${p.name} plan deleted`, "warn");
  };

  const create = () => {
    if (!newPlan.name || !newPlan.price) return addToast("Name and price are required", "error");
    const id = newPlan.name.toLowerCase().replace(/\s+/g, "-");
    if (plans.find(p => p.id === id)) return addToast("A plan with this name already exists", "error");
    setPlans(ps => [...ps, { id, ...newPlan, price:+newPlan.price, builds:+newPlan.builds||0, macHours:+newPlan.macHours||0, certs:+newPlan.certs||0, apiCalls:+newPlan.apiCalls||0, seats:+newPlan.seats||1 }]);
    setNewPlan({ name:"", price:"", builds:"", macHours:"", certs:"", apiCalls:"", seats:"" });
    setShowNew(false);
    addToast(`${newPlan.name} plan created`, "success");
  };

  const accentColors = ["border-slate-500/20","border-violet-500/20","border-amber-500/20","border-sky-500/20","border-rose-500/20","border-emerald-500/20"];
  const barColors    = ["bg-slate-500/50","bg-violet-500/50","bg-amber-500/50","bg-sky-500/50","bg-rose-500/50","bg-emerald-500/50"];

  const Field = ({ label, field, pid, val }) => (
    <div>
      <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
      <input
        key={`${pid}-${field}`}
        defaultValue={val}
        onBlur={e => upd(pid, field, e.target.value)}
        className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-rose-500/40 transition-colors"
      />
    </div>
  );

  const NewField = ({ label, field, placeholder="" }) => (
    <div>
      <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
      <input
        value={newPlan[field]}
        onChange={e => setNewPlan(n => ({ ...n, [field]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"
      />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-500">{plans.length} plan{plans.length!==1?"s":""} active</p>
        <button onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-colors">
          <Icon name={showNew ? "x" : "plus"} size={11}/>{showNew ? "Cancel" : "New Plan"}
        </button>
      </div>

      {/* New plan form */}
      {showNew && (
        <C className="border border-violet-500/20">
          <CH title="Create New Plan"/>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <NewField label="Plan Name *"   field="name"      placeholder="Enterprise"/>
              <NewField label="Price ($/mo) *" field="price"    placeholder="299"/>
              <NewField label="Builds / mo"    field="builds"   placeholder="5000"/>
              <NewField label="Mac Hours"      field="macHours" placeholder="500"/>
              <NewField label="Certificates"   field="certs"    placeholder="50"/>
              <NewField label="API Calls"      field="apiCalls" placeholder="200000"/>
              <NewField label="Seats"          field="seats"    placeholder="25"/>
            </div>
            <button onClick={create}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors">
              <Icon name="plus" size={12}/>Create Plan
            </button>
          </div>
        </C>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((p, i) => {
          const userCount = USERS.filter(u => u.plan === p.name).length;
          return (
            <C key={p.id} className={`border ${accentColors[i % accentColors.length]}`}>
              <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-black text-slate-200 uppercase tracking-widest">{p.name}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">${p.price}/mo · <span className={userCount>0?"text-emerald-400":"text-slate-600"}>{userCount} user{userCount!==1?"s":""}</span></p>
                </div>
                <button
                  onClick={() => del(p.id)}
                  title={userCount>0?"Cannot delete — users active":"Delete plan"}
                  className={`p-1.5 rounded-lg transition-colors ${userCount>0?"text-slate-700 cursor-not-allowed":"text-slate-600 hover:text-red-400 hover:bg-red-500/10"}`}>
                  <Icon name="trash" size={12}/>
                </button>
              </div>
              <div className="p-4 space-y-2">
                <Field label="Price ($/mo)" field="price"    pid={p.id} val={p.price}/>
                <Field label="Builds / mo"  field="builds"   pid={p.id} val={p.builds}/>
                <Field label="Mac Hours"    field="macHours" pid={p.id} val={p.macHours}/>
                <Field label="Certificates" field="certs"    pid={p.id} val={p.certs}/>
                <Field label="API Calls"    field="apiCalls" pid={p.id} val={p.apiCalls}/>
                <Field label="Seats"        field="seats"    pid={p.id} val={p.seats}/>
                <button onClick={() => save(p)}
                  className="w-full mt-1 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-1.5">
                  <Icon name="save" size={11}/>Save Changes
                </button>
              </div>
            </C>
          );
        })}
      </div>

      {/* Distribution chart */}
      <C><CH title="Plan Distribution"/>
        <div className="p-4 flex items-end gap-3" style={{height:112}}>
          {plans.map((p, i) => {
            const count = USERS.filter(u => u.plan === p.name).length;
            const maxC  = Math.max(...plans.map(x => USERS.filter(u => u.plan === x.name).length)) || 1;
            return (
              <div key={p.id} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full ${barColors[i % barColors.length]} rounded-t transition-all`} style={{height:`${(count/maxC)*72}px`}}/>
                <span className="text-[9px] text-slate-400 truncate w-full text-center">{p.name}</span>
                <span className="text-[9px] font-black text-slate-300">{count}</span>
              </div>
            );
          })}
        </div>
      </C>
    </div>
  );
};

/* ─── ADMIN: BACKUPS ─── */
const AdminBackups = ({ addToast }) => {
  const [bups, setBups] = useState(BACKUPS);
  const trigger = () => { setBups(b=>[{id:`bk_new_${Date.now()}`,type:"Full Snapshot",size:"computing…",date:new Date().toISOString().slice(0,16).replace("T"," "),status:"success",retention:"30 days"},...b]); addToast("Backup started — users not notified","success"); };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Total Backups",bups.length,"text-slate-300"],["Successful",bups.filter(b=>b.status==="success").length,"text-emerald-400"],["Failed",bups.filter(b=>b.status==="failed").length,"text-red-400"],["Total Size","113.7 GB","text-violet-400"]].map(([l,v,c])=>(
          <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3"><p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{l}</p><p className={`text-xl font-black font-mono ${c}`}>{v}</p></div>
        ))}
      </div>
      <C>
        <CH title="Backup History" sub="Silent mode — users never notified" action={<button onClick={trigger} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg hover:bg-rose-600/30 transition-colors"><Icon name="database" size={11}/>Trigger Backup</button>}/>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead><tr className="border-b border-white/[0.05]">{["Type","Size","Date","Status","Retention"].map(h=>(<th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>))}</tr></thead>
            <tbody>
              {bups.map(b=>(<tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"><td className="px-3 py-2.5 text-[11px] text-slate-300 font-semibold">{b.type}</td><td className="px-3 py-2.5 text-[10px] font-mono text-slate-400">{b.size}</td><td className="px-3 py-2.5 text-[10px] text-slate-500">{b.date}</td><td className="px-3 py-2.5"><Badge s={b.status}/></td><td className="px-3 py-2.5 text-[10px] text-slate-500">{b.retention}</td></tr>))}
            </tbody>
          </table>
        </div>
      </C>
    </div>
  );
};

/* ─── ADMIN: ANALYTICS ─── */
const AdminAnalytics = ({ addToast }) => {
  const mrr = REVENUE[REVENUE.length-1].mrr;
  const prevMrr = REVENUE[REVENUE.length-2].mrr;
  const mrrGrowth = (((mrr-prevMrr)/prevMrr)*100).toFixed(1);
  const arpu = Math.round(mrr/USERS.filter(u=>u.status==="active").length);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {l:"MRR",    v:`$${mrr.toLocaleString()}`,  sub:`+${mrrGrowth}% MoM`, tc:"text-emerald-400"},
          {l:"ARPU",   v:`$${arpu}`,                   sub:"per active user",    tc:"text-violet-400"},
          {l:"Churn",  v:"0%",                          sub:"this month",         tc:"text-sky-400"},
          {l:"LTV",    v:"$948",                        sub:"avg per user",        tc:"text-amber-400"},
        ].map(s=>(
          <div key={s.l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{s.l}</p>
            <p className={`text-xl font-black font-mono ${s.tc}`}>{s.v}</p>
            <p className="text-[9px] text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C><CH title="MRR Growth" sub="Last 7 months" action={<button onClick={()=>{exportCSV(REVENUE,["m","mrr","profit"],"revenue.csv");addToast("CSV exported","success");}} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors"><Icon name="download" size={11}/>CSV</button>}/>
          <div className="px-4 pb-3">
            <SvgBar data={REVENUE.map(r=>r.mrr)} labels={REVENUE.map(r=>r.m)} color="#8b5cf6" h={200}/>
          </div>
        </C>

        <C><CH title="Revenue vs Profit"/>
          <div className="px-4 pb-3">
            <SvgGroupBar data={REVENUE.map(r=>({...r,month:r.m}))} keys={["mrr","profit"]} colors={["#8b5cf6","#10b981"]} h={200}/>
          </div>
        </C>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C><CH title="Plan Distribution"/>
          <div className="px-4 pb-3">
            <SvgPie
              data={PLANS.map(p=>({name:p.name,value:USERS.filter(u=>u.plan===p.name).length}))}
              colors={["#64748b","#8b5cf6","#f59e0b"]}
              h={200}
            />
          </div>
        </C>
        <C><CH title="Build Success Rate"/>
          <div className="px-4 pb-3">
            <SvgPie
              data={[
                {name:"Success", value:BUILDS.filter(b=>b.status==="success").length},
                {name:"Failed",  value:BUILDS.filter(b=>b.status==="failed").length},
                {name:"Running", value:BUILDS.filter(b=>b.status==="running").length},
                {name:"Queued",  value:BUILDS.filter(b=>b.status==="queued").length},
              ]}
              colors={["#10b981","#ef4444","#f59e0b","#64748b"]}
              h={200}
            />
          </div>
        </C>
      </div>
    </div>
  );
};

/* ═══ CLIENT NAV ═══ */
const CNAV = [
  {id:"dashboard",    label:"Dashboard",       icon:"grid",     group:"Main"},
  {id:"my-builds",    label:"My Builds",       icon:"layers",   group:"Main"},
  {id:"new-build",    label:"New Build",       icon:"plus",     group:"Main"},
  {id:"certificates", label:"Certificates",    icon:"shield",   group:"Security"},
  {id:"profiles",     label:"Prov. Profiles",  icon:"package",  group:"Security"},
  {id:"webhooks",     label:"Webhooks",        icon:"link",     group:"Integrations"},
  {id:"api-tokens",   label:"API Tokens",      icon:"key",      group:"Integrations"},
  {id:"team",         label:"Team",            icon:"users",    group:"Account"},
  {id:"billing",      label:"Billing",         icon:"card",     group:"Account"},
  {id:"support",      label:"Support",         icon:"headset",  group:"Help"},
  {id:"settings",     label:"Settings",        icon:"settings", group:"Account"},
];

const ClientSidebar = ({ page, setPage, notifs, collapsed, setCollapsed, onSignOut }) => {
  const groups = [...new Set(CNAV.map(n=>n.group))];
  const unread = notifs.filter(n=>!n.read).length;
  const openTix = TICKETS.filter(t=>t.status==="open").length;
  const planUsed = Math.round((MY_BUILDS.filter(b=>b.status==="success").length/200)*100);
  return (
    <aside className={`flex-shrink-0 h-screen bg-[#0d0b1a] border-r border-white/[0.05] flex flex-col transition-all duration-300 ${collapsed?"w-14":"w-52"}`}>
      <div className="px-3 py-3 border-b border-white/[0.05] flex items-center gap-2 justify-between">
        {!collapsed&&(<div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0"><Icon name="zap" size={12} className="text-white"/></div>
          <div className="min-w-0"><p className="text-[11px] font-black text-white tracking-tight">MAC BUILD</p><p className="text-[9px] text-violet-400 font-black uppercase tracking-widest">My Panel</p></div>
        </div>)}
        {collapsed&&(<div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg mx-auto"><Icon name="zap" size={12} className="text-white"/></div>)}
        {!collapsed&&(<button onClick={()=>setCollapsed(true)} className="text-slate-600 hover:text-slate-400 transition-colors"><Icon name="chevL" size={13}/></button>)}
      </div>
      {collapsed&&(<button onClick={()=>setCollapsed(false)} className="mx-auto mt-2 text-slate-600 hover:text-slate-400 transition-colors"><Icon name="menu" size={13}/></button>)}
      <nav className="flex-1 px-2 py-2 overflow-y-auto min-h-0">
        {groups.map(g=>(
          <div key={g} className="mb-3">
            {!collapsed&&<p className="text-[8px] text-slate-700 uppercase tracking-widest px-2 mb-1 font-black">{g}</p>}
            {CNAV.filter(n=>n.group===g).map(({id,label,icon})=>(
              <button key={id} onClick={()=>setPage(id)} title={collapsed?label:undefined}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] transition-all mb-0.5 ${page===id?"bg-violet-600/20 text-violet-300 border border-violet-500/20 font-bold":"text-slate-400 hover:text-white hover:bg-white/[0.04]"} ${collapsed?"justify-center":""}`}>
                <div className="relative flex-shrink-0">
                  <Icon name={icon} size={13}/>
                  {id==="support"&&openTix>0&&(<span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-500 rounded-full text-[7px] flex items-center justify-center text-white font-black">{openTix}</span>)}
                </div>
                {!collapsed&&<span className="flex-1 text-left truncate">{label}</span>}
                {!collapsed&&id==="support"&&openTix>0&&(<span className="text-[8px] bg-amber-500/20 border border-amber-500/25 text-amber-300 px-1.5 py-0.5 rounded-full font-black">{openTix}</span>)}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="flex-shrink-0">
        {!collapsed&&(
          <div className="px-3 pt-2 border-t border-white/[0.05]">
            <div className="mb-1">
              <div className="flex justify-between mb-1"><span className="text-[9px] text-slate-500">Builds this month</span><span className="text-[9px] font-mono text-slate-400">34/200</span></div>
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{width:`${planUsed}%`}}/></div>
            </div>
          </div>
        )}
        <ClientProfileWidget collapsed={collapsed} setPage={setPage} onSignOut={onSignOut}/>
      </div>
    </aside>
  );
};

const ClientProfileWidget = ({ collapsed, setPage, onSignOut }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Alex Martin");
  const [email] = useState("alex@company.io");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("Alex Martin");
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const save = () => { setName(draft); setEditing(false); };
  return (
    <div className="px-3 py-2.5 relative" ref={ref}>
      {!collapsed && (
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors group">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-black text-white">{name[0]}</span>
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-bold text-slate-300 truncate">{name}</p>
            <p className="text-[9px] text-violet-500 font-semibold">Pro Plan</p>
          </div>
          <Icon name="chevD" size={11} className={`text-slate-600 flex-shrink-0 transition-transform ${open?"rotate-180":""}`}/>
        </button>
      )}
      {collapsed && (
        <button onClick={() => setOpen(o => !o)} className="mx-auto flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700">
          <span className="text-[9px] font-black text-white">{name[0]}</span>
        </button>
      )}
      {open && (
        <div className="absolute bottom-full left-2 right-2 mb-2 bg-[#1a1728] border border-white/[0.08] rounded-xl shadow-2xl z-[999]">
          <div className="px-4 py-3 border-b border-white/[0.05]">
            {editing ? (
              <div className="space-y-2">
                <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-violet-500/50"/>
                <p className="text-[9px] text-slate-500 font-mono">{email}</p>
                <div className="flex gap-2">
                  <button onClick={save} className="flex-1 py-1 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition-colors">Save</button>
                  <button onClick={() => { setEditing(false); setDraft(name); }} className="flex-1 py-1 bg-white/[0.05] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-black text-white">{name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-200">{name}</p>
                  <p className="text-[9px] text-slate-500">{email}</p>
                  <span className="text-[8px] bg-violet-500/15 border border-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-bold">Pro Plan</span>
                </div>
                <button onClick={() => setEditing(true)} className="text-slate-600 hover:text-violet-400 transition-colors flex-shrink-0" title="Edit name">
                  <Icon name="edit" size={12}/>
                </button>
              </div>
            )}
          </div>
          <div className="py-1">
            {[
              { icon:"settings",  label:"Settings",        action: () => setPage("settings") },
              { icon:"card",      label:"Billing",         action: () => setPage("billing") },
              { icon:"users",     label:"Team",            action: () => setPage("team") },
              { icon:"lock",      label:"Change Password", action: () => setPage("settings") },
              { icon:"headset",   label:"Support",         action: () => setPage("support") },
            ].map(item => (
              <button key={item.label} onClick={() => { item.action(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors">
                <Icon name={item.icon} size={12}/>{item.label}
              </button>
            ))}
            <div className="border-t border-white/[0.05] mt-1 pt-1">
              <button onClick={() => { setOpen(false); onSignOut && onSignOut(); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors">
                <Icon name="logOut" size={12}/>Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── CLIENT: DASHBOARD ─── */
const ClientDashboard = ({ setPage }) => {
  const success=MY_BUILDS.filter(b=>b.status==="success").length;
  const failed=MY_BUILDS.filter(b=>b.status==="failed").length;
  const running=MY_BUILDS.filter(b=>b.status==="running"||b.status==="queued").length;
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {l:"Total Builds", v:MY_BUILDS.length, tc:"text-violet-400",  spark:[3,5,4,5,4,5,4], sc:"#8b5cf6", bg:"from-violet-500/10 border-violet-500/15"},
          {l:"Succeeded",    v:success,           tc:"text-emerald-400", spark:[2,3,3,4,3,4,3], sc:"#10b981", bg:"from-emerald-500/10 border-emerald-500/15"},
          {l:"Failed",       v:failed,            tc:"text-red-400",     spark:[1,0,1,1,0,1,1], sc:"#ef4444", bg:"from-red-500/10 border-red-500/15"},
          {l:"In Progress",  v:running,           tc:"text-amber-400",   spark:[0,1,0,1,0,1,1], sc:"#f59e0b", bg:"from-amber-500/10 border-amber-500/15"},
        ].map(s=>(
          <div key={s.l} className={`bg-gradient-to-b ${s.bg} to-transparent border rounded-xl p-3`}>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{s.l}</p>
            <p className={`text-xl font-black font-mono ${s.tc}`}>{s.v}</p>
            <div className="mt-2"><Spark data={s.spark} color={s.sc} fill h={28} w={100}/></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C><CH title="Recent Builds" action={<button onClick={()=>setPage("my-builds")} className="text-[9px] text-violet-400 font-bold hover:text-violet-300">All →</button>}/>
          {MY_BUILDS.map(b=>(
            <div key={b.id} className="px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2"><Badge s={b.status}/><span className="text-[11px] text-slate-300 font-semibold flex-1 truncate">{b.project}</span><span className="text-[10px] text-slate-500 font-mono hidden sm:block">{b.branch}</span><span className="text-[10px] text-slate-500 font-mono">{b.duration}</span>{b.status==="success"&&<button className="text-slate-600 hover:text-emerald-400 transition-colors"><Icon name="download" size={11}/></button>}</div>
              <ErrRow reason={b.errorReason} code={b.errorCode}/>
            </div>
          ))}
        </C>
        <C><CH title="Notifications" sub={`${NOTIFS.filter(n=>!n.read).length} unread`}>
          </CH>
          {NOTIFS.slice(0,5).map(n=>(
            <div key={n.id} className={`flex items-start gap-3 px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors`}>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${n.type==="success"?"bg-emerald-400":n.type==="error"?"bg-red-400":n.type==="warning"?"bg-amber-400":"bg-blue-400"} ${n.read?"opacity-30":""}`}/>
              <div className="flex-1 min-w-0"><p className={`text-[11px] font-semibold ${n.read?"text-slate-400":"text-slate-200"} truncate`}>{n.title}</p><p className="text-[9px] text-slate-500 truncate">{n.body}</p></div>
              <span className="text-[9px] text-slate-600 flex-shrink-0">{n.time}</span>
            </div>
          ))}
        </C>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C><CH title="Platform Status"/>
          <div className="p-4 space-y-2">
            {[["Build Service","operational"],["Mac Nodes (EU-West)","operational"],["Mac Nodes (US-East)","degraded"],["API / Webhooks","operational"],["Storage / IPA Export","operational"]].map(([s,st])=>(
              <div key={s} className="flex items-center justify-between py-1"><span className="text-[11px] text-slate-300">{s}</span><div className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${st==="operational"?"bg-emerald-400":st==="degraded"?"bg-amber-400 animate-pulse":"bg-red-400"}`}/><span className={`text-[10px] font-semibold ${st==="operational"?"text-emerald-400":st==="degraded"?"text-amber-400":"text-red-400"}`}>{st}</span></div></div>
            ))}
          </div>
        </C>
        <C><CH title="Plan Usage — Pro" action={<button onClick={()=>setPage("billing")} className="text-[9px] text-violet-400 font-bold hover:text-violet-300">Upgrade →</button>}/>
          <div className="p-4 space-y-3">
            {[["Builds","34/200","bg-violet-400",34,200],["Mac Hours","12.5/50h","bg-rose-400",12.5,50],["Storage","1.2/5 GB","bg-sky-400",1.2,5],["Certs","2/5","bg-emerald-400",2,5]].map(([l,v,c,u,mx])=>(
              <div key={l}><div className="flex justify-between mb-1"><span className="text-[10px] text-slate-400">{l}</span><span className="text-[10px] font-mono text-slate-300">{v}</span></div><div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden"><div className={`h-full ${c} rounded-full`} style={{width:`${(u/mx)*100}%`}}/></div></div>
            ))}
          </div>
        </C>
      </div>
    </div>
  );
};

/* ─── CLIENT: MY BUILDS ─── */
const ClientBuilds = ({ setPage, addToast }) => {
  const [filter, setFilter] = useState("all");
  const [log, setLog] = useState(null);
  const filtered = filter==="all"?MY_BUILDS:MY_BUILDS.filter(b=>b.status===filter);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {["all","running","queued","success","failed"].map(f=>(<button key={f} onClick={()=>setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[9px] capitalize font-bold transition-colors ${filter===f?"bg-violet-600/25 text-violet-300 border border-violet-500/25":"text-slate-500 hover:text-slate-300"}`}>{f}</button>))}
        </div>
        <button onClick={()=>setPage("new-build")} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition-colors"><Icon name="plus" size={11}/>New Build</button>
      </div>
      <C>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead><tr className="border-b border-white/[0.05]">{["Build ID","Project","Status","Branch","Duration","Mac","Date","Actions"].map(h=>(<th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>))}</tr></thead>
            <tbody>
              {filtered.map(b=>(
                <>
                  <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-2.5 text-[10px] font-mono text-slate-400">{b.id}</td>
                    <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-200">{b.project}</td>
                    <td className="px-3 py-2.5"><Badge s={b.status}/></td>
                    <td className="px-3 py-2.5 text-[10px] font-mono text-slate-500 truncate max-w-[100px]">{b.branch}</td>
                    <td className="px-3 py-2.5 text-[10px] font-mono text-slate-400">{b.duration}</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500">{b.mac}</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500 whitespace-nowrap">{b.date.slice(0,10)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <button onClick={()=>setLog(b)} className="text-slate-600 hover:text-violet-400 transition-colors" title="View logs"><Icon name="terminal" size={12}/></button>
                        {b.status==="success"&&<button onClick={()=>addToast(`Downloading ${b.project}.ipa…`,"success")} className="text-slate-600 hover:text-emerald-400 transition-colors" title={`Download IPA (${b.size})`}><Icon name="download" size={12}/></button>}
                        {b.status==="failed"&&<button onClick={()=>{setPage("support");}} className="text-slate-600 hover:text-amber-400 transition-colors" title="Open support ticket"><Icon name="headset" size={12}/></button>}
                      </div>
                    </td>
                  </tr>
                  {b.errorReason&&(<tr key={b.id+"e"} className="border-b border-white/[0.03]"><td colSpan={8} className="px-3 pb-2.5"><ErrRow reason={b.errorReason} code={b.errorCode}/></td></tr>)}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </C>
      {log&&<LogModal build={log} onClose={()=>setLog(null)}/>}
    </div>
  );
};

/* ─── CLIENT: NEW BUILD ─── */
const ClientNewBuild = ({ addToast, setPage }) => {
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [xcode, setXcode] = useState("15.3");
  const [region, setRegion] = useState("EU-West");
  const [cert, setCert] = useState("cert_01");
  const [profile, setProfile] = useState("prov_01");
  const [loading, setLoading] = useState(false);
  const submit = () => {
    if(!repo) return addToast("Enter a repository URL","error");
    setLoading(true);
    setTimeout(()=>{ setLoading(false); addToast("Build queued successfully!","success"); setPage("my-builds"); },1200);
  };
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-xl space-y-4">
        <C><CH title="Repository"/>
          <div className="p-4 space-y-3">
            <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Repository URL</label>
              <div className="relative"><Icon name="github" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input value={repo} onChange={e=>setRepo(e.target.value)} placeholder="https://github.com/you/MyApp.git" className="w-full bg-black/30 border border-white/[0.07] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"/></div>
            </div>
            <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Branch</label><input value={branch} onChange={e=>setBranch(e.target.value)} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"/></div>
          </div>
        </C>
        <C><CH title="Build Configuration"/>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Xcode Version</label>
              <select value={xcode} onChange={e=>setXcode(e.target.value)} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                {["15.3 (latest)","15.2","15.1","14.3"].map(v=>(<option key={v} value={v}>{v}</option>))}
              </select>
            </div>
            <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Mac Region</label>
              <select value={region} onChange={e=>setRegion(e.target.value)} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                <option value="EU-West">🇪🇺 EU-West (Paris)</option>
                <option value="US-East">🇺🇸 US-East (NYC)</option>
                <option value="US-West">🇺🇸 US-West (LA)</option>
              </select>
            </div>
          </div>
        </C>
        <C><CH title="Signing"/>
          <div className="p-4 space-y-3">
            <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Certificate</label>
              <select value={cert} onChange={e=>setCert(e.target.value)} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                {CERTS.filter(c=>c.status==="active").map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Provisioning Profile</label>
              <select value={profile} onChange={e=>setProfile(e.target.value)} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                {PROFILES.filter(p=>p.status==="active").map(p=>(<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
          </div>
        </C>
        <button onClick={submit} disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60">
          {loading?<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<><Icon name="zap" size={13}/>Queue Build</>}
        </button>
      </div>
    </div>
  );
};

/* ─── CLIENT: CERTIFICATES ─── */
const ClientCerts = ({ addToast }) => {
  const [certs, setCerts] = useState(CERTS);
  const daysLeft = (exp) => { const d=Math.ceil((new Date(exp)-new Date())/(1000*86400)); return d; };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-slate-500">{certs.filter(c=>c.status==="active").length} active · {certs.filter(c=>c.status==="expired").length} expired · 2/5 slots used (Pro)</p>
        <button onClick={()=>addToast("Upload dialog — attach .p12 file","info")} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition-colors"><Icon name="upload" size={11}/>Upload Cert</button>
      </div>
      <div className="space-y-2">
        {certs.map(c=>{
          const days=daysLeft(c.expires);
          const urgent=days>0&&days<60;
          return (
            <C key={c.id} className={c.status==="expired"?"opacity-60":""}>
              <div className="px-4 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${c.status==="active"?"bg-emerald-500/15":"bg-red-500/15"}`}><Icon name="shield" size={15} className={c.status==="active"?"text-emerald-400":"text-red-400"}/></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-200 truncate">{c.name}</p>
                  <p className="text-[9px] text-slate-500 font-mono">{c.fp}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge s={c.status==="active"?days>0?"active":"expired":"expired"}/>
                  <p className={`text-[9px] mt-1 font-mono ${days<0?"text-red-400":urgent?"text-amber-400 font-bold":"text-slate-500"}`}>
                    {days<0?`Expired ${-days}d ago`:`${days}d left`}
                  </p>
                </div>
                <button onClick={()=>{setCerts(cs=>cs.filter(x=>x.id!==c.id));addToast("Certificate deleted","success");}} className="text-slate-700 hover:text-red-400 transition-colors ml-2"><Icon name="trash" size={12}/></button>
              </div>
              {urgent&&<div className="px-4 pb-3"><div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/20 rounded-lg px-3 py-1.5"><Icon name="alertTri" size={10} className="text-amber-400"/><span className="text-[10px] text-amber-300">Expires in {days} days — renew before builds start failing</span></div></div>}
            </C>
          );
        })}
      </div>
    </div>
  );
};

/* ─── CLIENT: PROV. PROFILES ─── */
const ClientProfiles = ({ addToast }) => {
  const [profiles, setProfiles] = useState(PROFILES);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-slate-500">{profiles.filter(p=>p.status==="active").length} active profiles</p>
        <button onClick={()=>addToast("Upload .mobileprovision file","info")} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition-colors"><Icon name="upload" size={11}/>Upload Profile</button>
      </div>
      <div className="space-y-2">
        {profiles.map(p=>(
          <C key={p.id} className={p.status==="expired"?"opacity-60":""}>
            <div className="px-4 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${p.status==="active"?"bg-violet-500/15":"bg-red-500/15"}`}><Icon name="package" size={14} className={p.status==="active"?"text-violet-400":"text-red-400"}/></div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-200 truncate">{p.name}</p>
                <p className="text-[9px] text-slate-500 font-mono">{p.appId} · {p.type}</p>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <Badge s={p.status}/>
                {p.devices>0&&<p className="text-[9px] text-slate-500">{p.devices} devices</p>}
                <p className="text-[9px] text-slate-500">{p.expires}</p>
              </div>
              <button onClick={()=>{setProfiles(ps=>ps.filter(x=>x.id!==p.id));addToast("Profile deleted","success");}} className="text-slate-700 hover:text-red-400 transition-colors ml-2"><Icon name="trash" size={12}/></button>
            </div>
          </C>
        ))}
      </div>
    </div>
  );
};

/* ─── CLIENT: WEBHOOKS ─── */
const ClientWebhooks = ({ addToast }) => {
  const [webhooks, setWebhooks] = useState(WEBHOOKS_DATA);
  const [url, setUrl] = useState("");
  const test = (w) => { addToast(`Testing ${w.url.slice(0,30)}…`,"info"); setTimeout(()=>addToast("Webhook responded 200 OK ✓","success"),1200); };
  const add = () => {
    if(!url) return addToast("Enter a URL","error");
    setWebhooks(ws=>[...ws,{id:`w${Date.now()}`,url,events:["build.success","build.failed"],status:"active",lastSent:"never"}]);
    setUrl(""); addToast("Webhook added","success");
  };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <C><CH title="Add Webhook"/>
        <div className="p-4 flex gap-2">
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://your-server.com/webhook" className="flex-1 bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"/>
          <button onClick={add} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"><Icon name="plus" size={11}/>Add</button>
        </div>
      </C>
      <div className="space-y-2">
        {webhooks.map(w=>(
          <C key={w.id}>
            <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${w.status==="active"?"bg-emerald-400":"bg-slate-600"}`}/>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-mono text-slate-300 truncate">{w.url}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{w.events.join(" · ")} · last: {w.lastSent}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>test(w)} className="px-2.5 py-1 bg-violet-600/20 border border-violet-500/20 text-violet-400 text-[10px] font-bold rounded-lg hover:bg-violet-600/30 transition-colors">Test</button>
                <button onClick={()=>{setWebhooks(ws=>ws.filter(x=>x.id!==w.id));addToast("Webhook removed","success");}} className="text-slate-600 hover:text-red-400 transition-colors"><Icon name="trash" size={12}/></button>
              </div>
            </div>
          </C>
        ))}
      </div>
    </div>
  );
};

/* ─── CLIENT: API TOKENS ─── */
const ClientTokens = ({ addToast }) => {
  const [tokens, setTokens] = useState(TOKENS_DATA);
  const [revealed, setRevealed] = useState({});
  const [name, setName] = useState("");
  const copy = (t) => { navigator.clipboard?.writeText(t.token); addToast("Token copied to clipboard","success"); };
  const regen = (id) => { addToast("Token regenerated — old token revoked","warn"); };
  const create = () => {
    if(!name) return addToast("Enter token name","error");
    setTokens(ts=>[...ts,{id:`t${Date.now()}`,name,created:new Date().toISOString().slice(0,10),lastUsed:"never",scopes:["builds:read"]}]);
    setName(""); addToast("API token created","success");
  };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <C><CH title="Create Token"/>
        <div className="p-4 flex gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Token name (e.g. CI Pipeline)" className="flex-1 bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"/>
          <button onClick={create} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"><Icon name="plus" size={11}/>Create</button>
        </div>
      </C>
      <div className="space-y-2">
        {tokens.map(t=>(
          <C key={t.id}><div className="px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0"><Icon name="key" size={13} className="text-violet-400"/></div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-200">{t.name}</p>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">{revealed[t.id]?"mbc_live_sk_Hj3kL9mN…":"mbc_live_sk_••••••••••••"}</p>
              <div className="flex gap-1 mt-1">{t.scopes.map(s=>(<span key={s} className="text-[8px] bg-violet-500/10 border border-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded font-mono">{s}</span>))}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setRevealed(r=>({...r,[t.id]:!r[t.id]}))} className="text-slate-600 hover:text-slate-300 transition-colors"><Icon name={revealed[t.id]?"eyeOff":"eye"} size={12}/></button>
              <button onClick={()=>copy(t)} className="text-slate-600 hover:text-violet-400 transition-colors"><Icon name="copy" size={12}/></button>
              <button onClick={()=>regen(t.id)} className="text-slate-600 hover:text-amber-400 transition-colors"><Icon name="refresh" size={12}/></button>
              <button onClick={()=>{setTokens(ts=>ts.filter(x=>x.id!==t.id));addToast("Token revoked","warn");}} className="text-slate-600 hover:text-red-400 transition-colors"><Icon name="trash" size={12}/></button>
            </div>
          </div></C>
        ))}
      </div>
    </div>
  );
};

/* ─── CLIENT: TEAM ─── */
const ClientTeam = ({ addToast }) => {
  const [team, setTeam] = useState(TEAM_DATA);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Developer");
  const invite = () => {
    if(!inviteEmail) return addToast("Enter email address","error");
    setTeam(t=>[...t,{id:`tm${Date.now()}`,name:inviteEmail.split("@")[0],email:inviteEmail,role:inviteRole,joined:new Date().toISOString().slice(0,10),lastSeen:"just now",av:inviteEmail[0].toUpperCase(),color:"from-slate-400 to-slate-600"}]);
    setInviteEmail(""); addToast(`Invite sent to ${inviteEmail}`,"success");
  };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[["Team Size",`${team.length}/3 seats`,"text-violet-400"],["Owners",team.filter(m=>m.role==="Owner").length,"text-amber-400"],["Seats Left",`${3-team.length} remaining`,"text-slate-300"]].map(([l,v,c])=>(
          <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3"><p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{l}</p><p className={`text-sm font-black ${c}`}>{v}</p></div>
        ))}
      </div>
      <C><CH title="Invite Member"/>
        <div className="p-4 flex gap-2 flex-wrap">
          <input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="colleague@company.io" className="flex-1 min-w-0 bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"/>
          <select value={inviteRole} onChange={e=>setInviteRole(e.target.value)} className="bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
            {["Developer","Viewer"].map(r=>(<option key={r} value={r}>{r}</option>))}
          </select>
          <button onClick={invite} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"><Icon name="userPlus" size={11}/>Invite</button>
        </div>
      </C>
      <div className="space-y-2">
        {team.map(m=>(
          <C key={m.id}><div className="px-4 py-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center flex-shrink-0 text-sm font-black text-white shadow-lg`}>{m.av}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-200">{m.name}</p>
              <p className="text-[9px] text-slate-500">{m.email} · last seen {m.lastSeen}</p>
            </div>
            <Badge s={m.role}/>
            {m.role!=="Owner"&&(
              <button onClick={()=>{setTeam(t=>t.filter(x=>x.id!==m.id));addToast(`${m.name} removed from team`,"warn");}} className="text-slate-600 hover:text-red-400 transition-colors ml-2"><Icon name="trash" size={12}/></button>
            )}
          </div></C>
        ))}
      </div>
    </div>
  );
};

/* ─── CLIENT: SUPPORT ─── */
const ClientSupport = ({ addToast }) => {
  const [tickets, setTickets] = useState(TICKETS);
  const [expanded, setExpanded] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState("Build");
  const [showNew, setShowNew] = useState(false);
  const submit = () => {
    if(!newTitle) return addToast("Enter a title","error");
    setTickets(ts=>[{id:`TK-${String(ts.length+1).padStart(3,"0")}`,title:newTitle,status:"open",priority:"medium",created:new Date().toISOString().slice(0,16).replace("T"," "),cat:newCat,note:"Your ticket is being reviewed by our support team."},...ts]);
    setNewTitle(""); setShowNew(false); addToast("Ticket submitted","success");
  };
  const sc={open:"border-amber-500/20",resolved:"border-emerald-500/20",closed:"border-slate-500/10"};
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-3">
          {[["open",TICKETS.filter(t=>t.status==="open").length,"text-amber-400"],["resolved",TICKETS.filter(t=>t.status==="resolved").length,"text-emerald-400"],["closed",TICKETS.filter(t=>t.status==="closed").length,"text-slate-400"]].map(([l,v,c])=>(
            <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-lg px-3 py-2"><p className="text-[9px] text-slate-500 capitalize">{l}</p><p className={`text-xl font-black font-mono ${c}`}>{v}</p></div>
          ))}
        </div>
        <button onClick={()=>setShowNew(v=>!v)} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition-colors"><Icon name="plus" size={11}/>New Ticket</button>
      </div>

      {showNew&&(
        <C><CH title="New Support Ticket"/>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Category</label>
                <select value={newCat} onChange={e=>setNewCat(e.target.value)} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                  {["Build","Account","Billing","Platform","Webhook"].map(c=>(<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
            </div>
            <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Title</label><input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Describe your issue…" className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"/></div>
            <div className="flex gap-2">
              <button onClick={submit} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors">Submit</button>
              <button onClick={()=>setShowNew(false)} className="px-4 py-2 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-xs font-bold rounded-lg hover:text-slate-200 transition-colors">Cancel</button>
            </div>
          </div>
        </C>
      )}

      <div className="space-y-2">
        {tickets.map(t=>(
          <C key={t.id} className={`border ${sc[t.status]}`}>
            <div className="px-4 py-3 cursor-pointer hover:bg-white/[0.01] transition-colors" onClick={()=>setExpanded(expanded===t.id?null:t.id)}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-mono text-slate-600">{t.id}</span>
                <Badge s={t.status}/><Badge s={t.priority}/>
                <span className="text-[9px] bg-slate-800 border border-white/[0.05] text-slate-400 px-1.5 py-0.5 rounded">{t.cat}</span>
                <p className="text-[11px] font-semibold text-slate-200 flex-1 truncate min-w-0">{t.title}</p>
                <span className="text-[9px] text-slate-600 flex-shrink-0">{t.created.slice(0,10)}</span>
                <Icon name="chevD" size={10} className={`text-slate-600 transition-transform ${expanded===t.id?"rotate-180":""}`}/>
              </div>
            </div>
            {expanded===t.id&&(
              <div className="px-4 pb-3 border-t border-white/[0.04]">
                <div className="mt-3 flex items-start gap-2 bg-blue-950/30 border border-blue-500/20 rounded-lg px-3 py-2.5">
                  <Icon name="headset" size={11} className="text-blue-400 flex-shrink-0 mt-0.5"/>
                  <div><p className="text-[9px] text-blue-400 font-black mb-0.5">Support Agent</p><p className="text-[10px] text-slate-300 leading-relaxed">{t.note}</p></div>
                </div>
              </div>
            )}
          </C>
        ))}
      </div>
    </div>
  );
};

/* ─── CLIENT: BILLING ─── */
const ClientBilling = ({ addToast }) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[["Current Plan","Pro · $79/mo","text-violet-400"],["Next Billing","2026-04-01","text-slate-300"],["Total Paid","$316.00","text-emerald-400"]].map(([l,v,c])=>(
        <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3"><p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{l}</p><p className={`text-sm font-black ${c}`}>{v}</p></div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <C><CH title="Payment Method"/>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 bg-black/20 border border-white/[0.06] rounded-lg px-4 py-3">
            <Icon name="card" size={16} className="text-slate-400"/>
            <div><p className="text-xs text-slate-200 font-semibold">Visa •••• 4242</p><p className="text-[10px] text-slate-500">Expires 12/2027</p></div>
            <button onClick={()=>{}} className="ml-auto text-[10px] text-violet-400 font-bold hover:text-violet-300">Change</button>
          </div>
          <button onClick={()=>{}} className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all">Upgrade to Team Plan →</button>
        </div>
      </C>
      <C><CH title="Invoice History"/>
        {INVOICES.map(inv=>(
          <div key={inv.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1 min-w-0"><p className="text-[11px] font-semibold text-slate-200">{inv.period}</p><p className="text-[9px] text-slate-500">{inv.date} · {inv.id}</p></div>
            <span className="text-[11px] font-mono text-slate-300">${inv.amount}</span>
            <Badge s={inv.status}/>
            <button onClick={()=>{}} className="text-slate-600 hover:text-slate-200 transition-colors"><Icon name="download" size={11}/></button>
          </div>
        ))}
      </C>
    </div>
  </div>
);

/* ─── CLIENT: SETTINGS ─── */
const ClientSettings = ({ addToast }) => {
  const [tfa, setTfa] = useState(false);
  const [notifToggles, setNotifToggles] = useState({emailSuccess:true,emailFail:true,emailCert:true,slack:false});
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg">
      <C><CH title="Profile"/>
        <div className="p-4 space-y-3">
          {[["Full Name","Alex Martin","text"],["Email","alex@company.io","email"],["Password","••••••••","password"]].map(([l,v,t])=>(
            <div key={l}><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">{l}</label><input type={t} defaultValue={v} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"/></div>
          ))}
          <button onClick={()=>addToast("Profile saved ✓","success")} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors">Save Changes</button>
        </div>
      </C>
      <C><CH title="Two-Factor Authentication"/>
        <div className="p-4">
          <div className="flex items-center justify-between py-1">
            <div><p className="text-xs text-slate-300 font-semibold">Authenticator App (TOTP)</p><p className="text-[10px] text-slate-500">Require 2FA on every login</p></div>
            <Toggle on={tfa} onChange={(v)=>{setTfa(v);addToast(v?"2FA enabled":"2FA disabled",v?"success":"warn");}}/>
          </div>
          {tfa&&<div className="mt-3 bg-violet-950/30 border border-violet-500/20 rounded-lg p-3"><p className="text-[10px] text-violet-300">Scan QR code with your authenticator app (Google Authenticator, Authy, etc.)</p><div className="w-20 h-20 bg-white/5 border border-white/10 rounded-lg mt-2 flex items-center justify-center"><span className="text-[9px] text-slate-500">QR code</span></div></div>}
        </div>
      </C>
      <C><CH title="Notifications"/>
        <div className="p-4 space-y-2">
          {[["emailSuccess","Email on build success"],["emailFail","Email on build failure"],["emailCert","Certificate expiry alerts"],["slack","Slack notifications"]].map(([k,l])=>(
            <label key={k} className="flex items-center justify-between py-1.5 cursor-pointer">
              <span className="text-xs text-slate-300">{l}</span>
              <Toggle on={notifToggles[k]} onChange={v=>setNotifToggles(n=>({...n,[k]:v}))}/>
            </label>
          ))}
        </div>
      </C>
      <C><CH title="Danger Zone"/>
        <div className="p-4 space-y-2">
          <button onClick={()=>addToast("Export started — email will be sent","info")} className="w-full py-2 bg-white/[0.04] border border-white/[0.07] text-slate-300 text-xs font-semibold rounded-lg hover:bg-white/[0.07] transition-colors">Export All Build Data</button>
          <button onClick={()=>addToast("Contact support to delete your account","warn")} className="w-full py-2 bg-red-900/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-900/30 transition-colors">Delete Account</button>
        </div>
      </C>
    </div>
  );
};

/* ═══ LOGIN ═══ */
const Login = ({ onLogin }) => {
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const go = () => { setLoading(true); setTimeout(()=>onLogin(role),900); };
  return (
    <div className="min-h-screen bg-[#090710] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-800/5 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-rose-800/5 rounded-full blur-3xl"/>
      </div>
      <div className="relative z-10 w-72 px-4">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-2xl shadow-violet-500/30"><Icon name="zap" size={22} className="text-white"/></div>
          <h1 className="text-xl font-black text-white">Mac Build Cloud</h1>
          <p className="text-xs text-slate-500 mt-0.5">iOS CI/CD Platform</p>
        </div>
        <div className="flex gap-1.5 mb-4 bg-black/30 border border-white/[0.07] rounded-xl p-1">
          {[["client","👤 User"],["admin","⚙ Admin"]].map(([r,l])=>(
            <button key={r} onClick={()=>setRole(r)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${role===r?(r==="admin"?"bg-rose-600/30 text-rose-300 border border-rose-500/30":"bg-violet-600/30 text-violet-300 border border-violet-500/30"):"text-slate-500 hover:text-slate-300"}`}>{l}</button>
          ))}
        </div>
        <div className="bg-[#12101e] border border-white/[0.07] rounded-2xl p-4 space-y-3 shadow-2xl">
          <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Email</label>
            <input key={role} defaultValue={role==="admin"?"admin@macbuild.cloud":"alex@company.io"} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"/></div>
          <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Password</label>
            <input type="password" defaultValue="password" className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"/></div>
          <button onClick={go} disabled={loading} className={`w-full flex items-center justify-center gap-2 py-2.5 text-white text-xs font-black rounded-lg transition-colors disabled:opacity-60 ${role==="admin"?"bg-rose-600 hover:bg-rose-500":"bg-violet-600 hover:bg-violet-500"}`}>
            {loading?<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:`Sign in as ${role==="admin"?"Admin":"User"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══ ROLE SWITCHER BANNER ═══ */
const RoleBanner = ({ isAdmin, setIsAdmin, onSignOut }) => (
  <div className={`flex items-center justify-between px-4 py-1.5 text-[10px] font-bold flex-shrink-0 ${isAdmin?"bg-rose-900/30 border-b border-rose-500/20 text-rose-300":"bg-violet-900/20 border-b border-violet-500/15 text-violet-300"}`}>
    <span>{isAdmin?"⚙ Admin Console":"👤 Client Panel"}</span>
    <div className="flex items-center gap-3">
      <button onClick={()=>setIsAdmin(a=>!a)} className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black transition-colors ${isAdmin?"border-rose-500/30 hover:bg-rose-500/10":"border-violet-500/30 hover:bg-violet-500/10"}`}>
        Switch to {isAdmin?"User Panel":"Admin Console"}
      </button>
      <button onClick={onSignOut} className="opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1"><Icon name="logOut" size={11}/>Sign out</button>
    </div>
  </div>
);

/* ═══ CLIENT CHATBOT ═══ */
const CHAT_SUGGESTIONS = [
  "How do I submit a new build?",
  "Why did my build fail with CS-001?",
  "How do I add a provisioning profile?",
  "How do I invite team members?",
  "What's the difference between plans?",
  "How do I set up webhooks?",
  "How do I get my API token?",
];

const CHAT_KB = {
  "submit":      { answer: "Go to **New Build** in the sidebar. Paste your GitHub/GitLab repo URL, select your branch, Xcode version and region, attach a certificate + provisioning profile, then click **Start Build**. Your build will be queued and start automatically." },
  "cs-001":      { answer: "Error **CS-001** means your code signing certificate or provisioning profile has expired. Go to **Certificates** and **Provisioning Profiles** to upload fresh ones, then resubmit your build." },
  "xc-065":      { answer: "Error **XC-065** means xcodebuild exited with code 65 — usually a missing dependency (e.g. a CocoaPod not in Podfile.lock). Check that your Podfile is committed and all pods are resolved before building." },
  "profile":     { answer: "Go to **Security → Prov. Profiles** in the sidebar, click **Upload Profile**, and select your `.mobileprovision` file. It will be available when submitting your next build." },
  "certificate": { answer: "Go to **Security → Certificates**, click **Upload Certificate**, and upload your `.p12` file with its password. Make sure it hasn't expired — expiry is shown in the list." },
  "team":        { answer: "Open **Account → Team** in the sidebar. Enter a teammate's email, select their role (Developer or Viewer), and click **Send Invite**. They'll receive an email with a login link." },
  "webhook":     { answer: "Go to **Integrations → Webhooks**, paste your endpoint URL, select which events to receive (`build.success`, `build.failed`, etc.), and click **Add Webhook**. Use the **Test** button to fire a test payload." },
  "token":       { answer: "Go to **Integrations → API Tokens**, click **New Token**, give it a name and select scopes. Your token is shown **once** — copy it immediately. Use it in the `Authorization: Bearer <token>` header." },
  "plan":        { answer: "**Starter** ($29/mo) — 200 builds, 20 Mac hours. **Pro** ($79/mo) — 1000 builds, 100 Mac hours, priority queue. **Team** ($199/mo) — unlimited builds, 500 Mac hours, 25 seats. Upgrade in **Billing**." },
  "billing":     { answer: "Open **Account → Billing** to see your current plan, manage your payment method, and download invoices. Click **Upgrade** to switch to a higher plan instantly." },
  "queue":       { answer: "There is one shared Mac mini build machine. If it's busy, your build enters a queue. You can see your queue position and estimated start time on the **Dashboard** and in the **My Builds** list." },
  "log":         { answer: "Click the terminal icon (⌨) next to any build in **My Builds** to open the full build log. You can download the raw log or — for successful builds — download the `.ipa` artifact." },
  "ipa":         { answer: "Once a build succeeds, a download icon (⬇) appears next to it in **My Builds**. Click it to download the `.ipa` file directly to your computer." },
  "support":     { answer: "Open **Help → Support** to create a ticket. Our team responds within 24 hours. For urgent issues, add **priority: high** when submitting the ticket." },
  "default":     { answer: "I can help with builds, certificates, provisioning profiles, team management, webhooks, API tokens, plans, and billing. Try asking something like *\"Why did my build fail?\"* or *\"How do I add a team member?\"*" },
};

function chatAnswer(msg) {
  const m = msg.toLowerCase();
  if (m.includes("submit") || m.includes("new build") || m.includes("start build")) return CHAT_KB.submit;
  if (m.includes("cs-001") || m.includes("code sign") || m.includes("signing")) return CHAT_KB["cs-001"];
  if (m.includes("xc-065") || m.includes("exit 65") || m.includes("xcodebuild")) return CHAT_KB["xc-065"];
  if (m.includes("profile") || m.includes("mobileprovision")) return CHAT_KB.profile;
  if (m.includes("cert")) return CHAT_KB.certificate;
  if (m.includes("team") || m.includes("invite") || m.includes("member")) return CHAT_KB.team;
  if (m.includes("webhook")) return CHAT_KB.webhook;
  if (m.includes("token") || m.includes("api key")) return CHAT_KB.token;
  if (m.includes("plan") || m.includes("starter") || m.includes("pro") || m.includes("pricing")) return CHAT_KB.plan;
  if (m.includes("bill") || m.includes("invoice") || m.includes("upgrade") || m.includes("payment")) return CHAT_KB.billing;
  if (m.includes("queue") || m.includes("wait") || m.includes("position")) return CHAT_KB.queue;
  if (m.includes("log") || m.includes("output") || m.includes("console")) return CHAT_KB.log;
  if (m.includes("ipa") || m.includes("download") || m.includes("artifact")) return CHAT_KB.ipa;
  if (m.includes("support") || m.includes("ticket") || m.includes("help") || m.includes("contact")) return CHAT_KB.support;
  return CHAT_KB.default;
}

function renderMd(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
}

const ClientChatbot = ({ setPage }) => {
  const [open, setOpen]   = useState(false);
  const [msgs, setMsgs]   = useState([
    { id:1, from:"bot", text:"👋 Hi! I'm the Mac Build Cloud assistant. Ask me anything about builds, certificates, billing, or your account." }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, typing]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const send = (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    const uid = Date.now();
    setMsgs(m => [...m, { id: uid, from:"user", text: q }]);
    setTyping(true);
    setTimeout(() => {
      const kb = chatAnswer(q);
      setMsgs(m => [...m, { id: uid+1, from:"bot", text: kb.answer, action: kb.action }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-[1000] w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        title="AI Assistant"
      >
        {open
          ? <Icon name="x" size={18} className="text-white"/>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        {!open && msgs.filter(m=>m.from==="bot").length > 1 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-400 rounded-full text-[8px] flex items-center justify-center text-white font-black animate-pulse">
            {msgs.filter(m=>m.from==="bot").length}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-20 right-5 z-[999] w-80 flex flex-col bg-[#13111f] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          style={{height:420}}>
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border-b border-white/[0.06]">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <p className="text-[11px] font-black text-white">Build Assistant</p>
              <p className="text-[9px] text-violet-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"/>Online</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-slate-600 hover:text-slate-300 transition-colors"><Icon name="x" size={13}/></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {msgs.map(msg => (
              <div key={msg.id} className={`flex ${msg.from==="user"?"justify-end":"justify-start"}`}>
                {msg.from==="bot" && (
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-1.5 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                )}
                <div className={`max-w-[78%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${msg.from==="user" ? "bg-violet-600 text-white rounded-br-sm" : "bg-[#1e1b2e] border border-white/[0.06] text-slate-300 rounded-bl-sm"}`}>
                  <span dangerouslySetInnerHTML={{ __html: renderMd(msg.text) }}/>
                  {msg.action && (
                    <button onClick={() => { msg.action(setPage); setOpen(false); }}
                      className="mt-1.5 flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 font-bold transition-colors">
                      <Icon name="arrowR" size={9}/>Go there
                    </button>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mr-1.5 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div className="bg-[#1e1b2e] border border-white/[0.06] rounded-xl rounded-bl-sm px-3 py-2 flex gap-1 items-center">
                  {[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick suggestions */}
          <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto scrollbar-none">
            {CHAT_SUGGESTIONS.slice(0,3).map(s=>(
              <button key={s} onClick={()=>send(s)}
                className="flex-shrink-0 text-[9px] bg-white/[0.04] border border-white/[0.06] text-slate-500 hover:text-violet-400 hover:border-violet-500/30 px-2 py-1 rounded-full transition-colors whitespace-nowrap">
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-1 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&send()}
              placeholder="Ask anything…"
              className="flex-1 bg-black/30 border border-white/[0.07] rounded-xl px-3 py-2 text-[11px] text-slate-300 outline-none focus:border-violet-500/40 transition-colors placeholder:text-slate-700"
            />
            <button onClick={()=>send()}
              disabled={!input.trim()}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
const injectCSS = () => {
  const id = "mbc-styles";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, #root { background: #090710; font-family: 'DM Sans', sans-serif; color: #e2e8f0; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 3px; height: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
    @keyframes toastIn { from { opacity:0; transform: translateX(16px); } to { opacity:1; transform: translateX(0); } }
    select option { background: #1a1728; color: #e2e8f0; }
  `;
  document.head.appendChild(s);
};

/* ═══ APP ROOT ═══ */
export default function App() {
  const [loggedIn, setLoggedIn]         = useState(false);
  const [isAdmin, setIsAdmin]           = useState(false);
  const [adminPage, setAdminPage]       = useState("overview");
  const [clientPage, setClientPage]     = useState("dashboard");
  const [alerts, setAlerts]             = useState(ALERTS);
  const [toasts, setToasts]             = useState([]);
  const [selNode, setSelNode]           = useState(null);
  const [notifs, setNotifs]             = useState(NOTIFS);
  const [adminCollapsed, setAdminCol]   = useState(false);
  const [clientCollapsed, setClientCol] = useState(false);
  const [mobileNav, setMobileNav]       = useState(false);

  useEffect(injectCSS, []);

  const addToast = (msg, tp="info") => {
    const id = Date.now();
    setToasts(t=>[...t,{id,msg,tp}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3200);
  };

  const signOut = () => { setLoggedIn(false); setAdminPage("overview"); setClientPage("dashboard"); setMobileNav(false); };

  const handleLogin = (role) => { setIsAdmin(role==="admin"); setLoggedIn(true); };

  const unackAlerts = alerts.filter(a=>!a.ack).length;
  const unreadNotifs = notifs.filter(n=>!n.read).length;

  const pageTitle = isAdmin
    ? ANAV.find(n=>n.id===adminPage)?.label
    : CNAV.find(n=>n.id===clientPage)?.label;

  const renderAdminPage = () => {
    switch(adminPage) {
      case "overview":   return <AdminOverview setPage={setAdminPage} alerts={alerts}/>;
      case "builds":     return <AdminBuilds addToast={addToast}/>;
      case "users":      return <AdminUsers addToast={addToast}/>;
      case "nodes":      return <AdminNodes setPage={setAdminPage} setSelNode={setSelNode} addToast={addToast}/>;
      case "node-detail":return <AdminNodeDetail node={selNode} setPage={setAdminPage} addToast={addToast}/>;
      case "alerts":     return <AdminAlerts alerts={alerts} setAlerts={setAlerts} addToast={addToast}/>;
      case "audit":      return <AdminAudit/>;
      case "broadcast":  return <AdminBroadcast addToast={addToast}/>;
      case "plans":      return <AdminPlans addToast={addToast}/>;
      case "backups":    return <AdminBackups addToast={addToast}/>;
      case "analytics":  return <AdminAnalytics addToast={addToast}/>;
      default: return null;
    }
  };

  const renderClientPage = () => {
    switch(clientPage) {
      case "dashboard":    return <ClientDashboard setPage={setClientPage}/>;
      case "my-builds":    return <ClientBuilds setPage={setClientPage} addToast={addToast}/>;
      case "new-build":    return <ClientNewBuild addToast={addToast} setPage={setClientPage}/>;
      case "certificates": return <ClientCerts addToast={addToast}/>;
      case "profiles":     return <ClientProfiles addToast={addToast}/>;
      case "webhooks":     return <ClientWebhooks addToast={addToast}/>;
      case "api-tokens":   return <ClientTokens addToast={addToast}/>;
      case "team":         return <ClientTeam addToast={addToast}/>;
      case "billing":      return <ClientBilling addToast={addToast}/>;
      case "support":      return <ClientSupport addToast={addToast}/>;
      case "settings":     return <ClientSettings addToast={addToast}/>;
      default: return null;
    }
  };

  if (!loggedIn) return <Login onLogin={handleLogin}/>;

  return (
    <div className="flex flex-col h-screen bg-[#090710] overflow-hidden">
      {/* Role banner */}
      <RoleBanner isAdmin={isAdmin} setIsAdmin={setIsAdmin} onSignOut={signOut}/>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex">
          {isAdmin
            ? <AdminSidebar page={adminPage} setPage={setAdminPage} alerts={alerts} collapsed={adminCollapsed} setCollapsed={setAdminCol} onSignOut={signOut}/>
            : <ClientSidebar page={clientPage} setPage={setClientPage} notifs={notifs} collapsed={clientCollapsed} setCollapsed={setClientCol} onSignOut={signOut}/>
          }
        </div>

        {/* Mobile sidebar overlay */}
        {mobileNav && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setMobileNav(false)}/>
            <div className="relative z-50 flex h-full">
              {isAdmin
                ? <AdminSidebar page={adminPage} setPage={(p)=>{setAdminPage(p);setMobileNav(false);}} alerts={alerts} collapsed={false} setCollapsed={()=>{}} onSignOut={signOut}/>
                : <ClientSidebar page={clientPage} setPage={(p)=>{setClientPage(p);setMobileNav(false);}} notifs={notifs} collapsed={false} setCollapsed={()=>{}} onSignOut={signOut}/>
              }
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Topbar */}
          <header className={`flex items-center gap-3 px-4 h-11 border-b flex-shrink-0 ${isAdmin?"border-rose-500/10 bg-[#0e0a18]":"border-violet-500/10 bg-[#0e0b1c]"}`}>
            <button onClick={()=>setMobileNav(v=>!v)} className="lg:hidden text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"><Icon name="menu" size={16}/></button>
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider truncate flex-1">{pageTitle}</span>
            {/* Platform status dot */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
              <span className="text-[9px] text-emerald-400 font-bold">Operational</span>
            </div>
            {isAdmin && unackAlerts>0 && (
              <button onClick={()=>setAdminPage("alerts")} className="hidden sm:flex items-center gap-1 text-[9px] text-rose-300 bg-rose-900/30 border border-rose-500/25 px-2 py-0.5 rounded-full animate-pulse font-bold flex-shrink-0">
                <Icon name="alertTri" size={9}/>{unackAlerts}
              </button>
            )}
            {!isAdmin && unreadNotifs>0 && (
              <div className="relative flex-shrink-0">
                <Icon name="bell" size={14} className="text-slate-400"/>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full text-[7px] flex items-center justify-center text-white font-black">{unreadNotifs}</span>
              </div>
            )}
            <button onClick={signOut} className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0" title="Sign out"><Icon name="logOut" size={13}/></button>
          </header>

          {isAdmin ? renderAdminPage() : renderClientPage()}
        </div>
      </div>

      <Toast toasts={toasts}/>
      {!isAdmin && loggedIn && <ClientChatbot setPage={setClientPage}/>}
    </div>
  );
}