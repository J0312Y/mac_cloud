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


export { BUILDS, MY_BUILDS, MACS, USERS, PLANS, ALERTS, AUDIT, BACKUPS, REVENUE, CERTS, PROFILES, WEBHOOKS_DATA, TOKENS_DATA, TICKETS, NOTIFS, TEAM_DATA, INVOICES, SUCCESS_LOG, FAILED_LOG };
