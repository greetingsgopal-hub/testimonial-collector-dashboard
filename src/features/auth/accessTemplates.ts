export const LOGIN_PAGE_TEMPLATE = `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Lock, Shield, Eye, EyeOff, ShoppingBag, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [os, setOs] = useState<"merchant"|"admin">("merchant");
  const [mode, setMode] = useState<"idle"|"shopify"|"admin">("idle");
  const [storeDomain, setStoreDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [toast, setToast] = useState<string|null>(null);
  const [impersonating, setImpersonating] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(()=>setToast(null), 3000);
  };

  const handleShopify = () => {
    if (!storeDomain || !storeDomain.includes(".myshopify.com")) {
      return showToast("Enter valid .myshopify.com domain");
    }
    showToast(\`Redirecting to Shopify OAuth for \${storeDomain}\`);
    // window.location.href = \`/api/auth/shopify?store=\${storeDomain}\`;
    setTimeout(()=> router.push("/dashboard"), 1200);
  };

  const handleAdmin = () => {
    if (!email || !password || code.length !== 6) {
      return showToast("Complete email, password and 6-digit 2FA");
    }
    showToast("Verifying 2FA • Issuing JWT");
    setTimeout(()=> router.push("/admin"), 1200);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col font-sans">
      {impersonating && (
        <div className="h-[40px] bg-[#FFE600] text-black text-[13px] font-semibold flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
            <span>Impersonating Kalyan Silks • your-store.myshopify.com</span>
          </div>
          <button onClick={()=>setImpersonating(false)} className="underline underline-offset-4 flex items-center gap-1">
            Exit Impersonation <X size={14}/>
          </button>
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-[400px] rounded-[16px] bg-[#141416] border border-white/[0.06] p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#FFE600] text-black font-black text-[20px] flex items-center justify-center">
                P
              </div>
              <div className="leading-tight">
                <div className="text-white font-semibold text-[15px] tracking-tight">PandaPraise</div>
                <div className="text-[11px] text-white/40">Merchant & Admin OS</div>
              </div>
            </div>
            <div className="flex bg-white/[0.06] rounded-full p-1 text-[11px] font-medium">
              <button onClick={()=>setOs("merchant")} className={\`px-3 py-1 rounded-full \${os==="merchant"?"bg-white text-black":"text-white/60"}\`}>
                Merchant OS
              </button>
              <button onClick={()=>setOs("admin")} className={\`px-3 py-1 rounded-full \${os==="admin"?"bg-white text-black":"text-white/60"}\`}>
                Admin OS
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={()=>setMode(mode==="shopify"?"idle":"shopify")}
              className="w-full h-[48px] rounded-[12px] bg-[#95BF47] text-black font-medium flex items-center gap-3 px-4 hover:brightness-[1.05] transition"
            >
              <ShoppingBag size={18} />
              <div className="leading-tight flex-1 text-left">
                <div className="text-[14px] font-semibold">Continue with Shopify</div>
                <div className="text-[11px] opacity-70">For merchants • your-store.myshopify.com</div>
              </div>
              <span>↗</span>
            </button>

            {mode === "shopify" && (
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] space-y-2">
                <input
                  value={storeDomain}
                  onChange={(e)=>setStoreDomain(e.target.value)}
                  placeholder="your-store.myshopify.com"
                  className="w-full h-10 rounded-lg bg-[#0A0A0B] border border-white/10 px-3 text-sm text-white"
                />
                <button
                  onClick={handleShopify}
                  className="w-full h-10 rounded-lg bg-white text-black font-semibold text-sm"
                >
                  Connect Store
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] text-white/25">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              onClick={()=>setMode(mode==="admin"?"idle":"admin")}
              className="w-full h-[48px] rounded-[12px] border border-white/[0.1] text-white flex items-center gap-3 px-4 hover:bg-white/[0.04] transition"
            >
              <Shield size={18} className="text-white/70" />
              <div className="leading-tight flex-1 text-left">
                <div className="text-[14px] font-medium">Admin Login</div>
                <div className="text-[11px] text-white/50">For PandaPraise team • 2FA required</div>
              </div>
              <span>↗</span>
            </button>

            {mode === "admin" && (
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  placeholder="admin@pandapraise.com"
                  className="w-full h-10 rounded-lg bg-[#0A0A0B] border border-white/10 px-3 text-sm text-white"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-10 rounded-lg bg-[#0A0A0B] border border-white/10 px-3 text-sm text-white"
                />
                <input
                  value={code}
                  maxLength={6}
                  onChange={(e)=>setCode(e.target.value)}
                  placeholder="2FA code • 6 digits"
                  className="w-full h-10 rounded-lg bg-[#0A0A0B] border border-white/10 px-3 text-sm text-white font-mono tracking-widest"
                />
                <button
                  onClick={handleAdmin}
                  className="w-full h-10 rounded-lg bg-[#FFE600] text-black font-semibold text-sm"
                >
                  Verify & Enter Admin OS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-xs font-semibold shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
`;

export const AUTH_MIDDLEWARE_TEMPLATE = `// middleware/auth.js
// Production-ready Auth Middleware for PandaPraise
// Handles JWT verification, role gating, store isolation, impersonation audit

const jwt = require("jsonwebtoken");

// In production, inject via process.env.JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

/**
 * logAudit - structured audit logger
 * @param {Object} entry
 * @example { action: 'IMPERSONATE', actor, target, ip, timestamp, meta }
 */
function logAudit(entry) {
  const log = {
    timestamp: new Date().toISOString(),
    ip: entry.ip,
    action: entry.action,
    actor: entry.actor,
    target: entry.target,
    meta: entry.meta || {},
  };
  // Replace with your logger (pino, winston, datadog)
  console.log(JSON.stringify({ level: "audit", ...log }));
}

/**
 * verifyJWT - Validates Bearer token and hydrates req.user
 * Expected token shape:
 *  Merchant: { id, role: 'merchant_admin', storeDomain, orgId, plan, iat, exp }
 *  Admin: { id, email, role: 'super_admin'|'auditor'|'agency_editor', orgId, iat, exp }
 */
function verifyJWT(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach normalized user
    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role,
      storeDomain: decoded.storeDomain, // undefined for admin
      orgId: decoded.orgId,
      plan: decoded.plan,
      impersonatedStore: null, // filled below if applicable
    };

    // --- Impersonation handling ---
    // Query ?impersonate=target-store.myshopify.com
    const targetStore = req.query.impersonate || req.headers["x-impersonate-store"];
    if (targetStore) {
      // Only super_admin can impersonate
      if (req.user.role !== "super_admin") {
        logAudit({
          action: "IMPERSONATE_DENIED",
          actor: req.user.email || req.user.id,
          target: targetStore,
          ip: req.ip,
          meta: { reason: "insufficient_role", role: req.user.role },
        });
        return res.status(403).json({ error: "Only super_admin may impersonate stores" });
      }

      // Valid format check: store-name.myshopify.com
      if (!/^[a-zA-Z0-9-]+\\.myshopify\\.com$/.test(targetStore)) {
        return res.status(400).json({ error: "Invalid store domain format" });
      }

      // Set impersonated context
      req.user.impersonatedStore = targetStore;
      req.user.originalActor = req.user.email || req.user.id;

      // Audit log every impersonated request
      logAudit({
        action: "IMPERSONATE_REQUEST",
        actor: req.user.originalActor,
        target: targetStore,
        ip: req.ip,
        meta: { path: req.path, method: req.method },
      });

      // Signal to downstream services
      res.setHeader("X-Impersonating", targetStore);
    }

    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * requireRole - Guard route by allowed roles
 * @param {Array<string>} roles - e.g. ['super_admin'] or ['merchant_admin', 'super_admin']
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    // super_admin always bypasses role checks
    if (req.user.role === "super_admin") return next();

    if (!roles.includes(req.user.role)) {
      logAudit({
        action: "ROLE_GATE_DENIED",
        actor: req.user.email || req.user.id,
        target: req.path,
        ip: req.ip,
        meta: { required: roles, actual: req.user.role },
      });
      return res.status(403).json({
        error: "Forbidden: insufficient permissions",
        required: roles,
      });
    }

    return next();
  };
}

/**
 * requireStore - Ensures merchant only touches their own store
 * Automatically passes if super_admin is impersonating target store
 */
function requireStore(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

  const storeFromRoute = req.params.storeDomain || req.body?.storeDomain || req.query.store;

  // Active store is either impersonated (by admin) or merchant's own store
  const activeStore = req.user.impersonatedStore || req.user.storeDomain;

  if (!activeStore) {
    return res.status(400).json({ error: "No store context found in session" });
  }

  // If request targets a specific store, verify ownership
  if (storeFromRoute && storeFromRoute !== activeStore) {
    logAudit({
      action: "CROSS_STORE_DENIED",
      actor: req.user.email || req.user.id,
      target: storeFromRoute,
      ip: req.ip,
      meta: { sessionStore: activeStore },
    });
    return res.status(403).json({ error: "Cross-store access denied" });
  }

  // Attach resolved store for controllers
  req.storeDomain = activeStore;
  return next();
}

module.exports = {
  verifyJWT,
  requireRole,
  requireStore,
  logAudit,
};
`;

export const RBAC_TEMPLATE = `// middleware/rbac.js + frontend guards
// PandaPraise RBAC + Frontend Guards + JWT Issuance
// ------------------------------------------------------------------

// ================= BACKEND: middleware/rbac.js =================

const PERMISSIONS = {
  merchant_admin: [
    "read:inbox", "write:inbox",
    "read:reviews", "write:approve", "write:reward",
    "read:ad-library", "read:analytics",
    "read:billing", "write:billing",
    "read:settings", "write:settings"
  ],
  agency_editor: [
    "read:inbox", "write:inbox",
    "read:reviews", "write:approve",
    "read:ad-library", "write:ad-library",
    "read:analytics"
  ],
  auditor: [
    "read:inbox", "read:reviews", "read:ad-library", "read:analytics", "read:billing"
  ],
  super_admin: ["*"], // wildcard
};

function can(role, scope) {
  if (!role || !scope) return false;
  const scopes = PERMISSIONS[role] || [];
  if (scopes.includes("*")) return true;
  return scopes.includes(scope);
}

// Express middleware: checkPermission('write:approve')
function checkPermission(scope) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    if (!can(req.user.role, scope)) {
      return res.status(403).json({ error: \`Missing scope: \${scope}\` });
    }
    return next();
  };
}

module.exports = { PERMISSIONS, can, checkPermission };

// ================= FRONTEND: hooks/useAuth.tsx =================
// Reads token from storage (or memory in preview), decodes JWT, returns guards

import { useEffect, useState, useMemo, ReactNode } from "react";
import { useRouter } from "next/navigation";

type Role = "merchant_admin" | "agency_editor" | "super_admin" | "auditor";
interface User {
  id: string;
  email?: string;
  role: Role;
  storeDomain?: string;
  orgId?: string;
  plan?: string;
  impersonatedStore?: string | null;
}

function decodeJWT(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload as User;
  } catch { return null; }
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("pp_token");
    setToken(t);
    setLoading(false);
  }, []);

  const user = useMemo(() => (token ? decodeJWT(token) : null), [token]);

  return {
    user,
    loading,
    token,
    isAdmin: user?.role === "super_admin",
    isMerchant: user?.role === "merchant_admin",
    isImpersonating: !!user?.impersonatedStore,
    isAuditor: user?.role === "auditor",
  };
}

// ================= FRONTEND: components/guards.tsx =================

export function RequireAuth({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div className="p-8 text-sm text-white/50">Verifying session…</div>;
  if (!user) { router.push("/login"); return null; }
  if (roles && !roles.includes(user.role)) { router.push("/403"); return null; }
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  return <RequireAuth roles={["super_admin"]}>{children}</RequireAuth>;
}

export function ImpersonationBanner() {
  const { user } = useAuth();
  if (!user?.impersonatedStore) return null;
  return (
    <div className="h-[40px] w-full bg-[#FFE600] text-black text-[13px] font-semibold flex items-center justify-between px-4 fixed top-0 left-0 z-50">
      <span>Impersonating {user.impersonatedStore} — Audit logged</span>
      <a href="/api/auth/exit-impersonation" className="underline flex items-center gap-1">Exit Impersonation [X]</a>
    </div>
  );
}

// ================= JWT ISSUANCE (after OAuth / 2FA) =================

// After Shopify OAuth success:
// import jwt from "jsonwebtoken";

export function issueMerchantToken({ storeDomain, plan, userId, orgId }: {
  storeDomain: string; plan: string; userId: string; orgId: string;
}) {
  return jwt.sign(
    { id: userId, storeDomain, role: "merchant_admin", plan, orgId },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
}

export function issueAdminToken({ email, userId, orgId, role = "super_admin" }: {
  email: string; userId: string; orgId: string; role?: Role;
}) {
  return jwt.sign(
    { id: userId, email, role, orgId },
    process.env.JWT_SECRET!,
    { expiresIn: "8h" } // shorter for admin
  );
}

// ================= .env.example =================
/*
JWT_SECRET=super_long_random_64_chars_min
SHOPIFY_API_KEY=xxx
SHOPIFY_API_SECRET=xxx
SHOPIFY_SCOPES=read_products,write_products,read_orders
*/
`;
