"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, AlertTriangle, ShieldCheck, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToolEvents } from "@/lib/analytics";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CookiePair {
  name: string;
  value: string;
}

interface SetCookieResult {
  name: string;
  value: string;
  expires?: string;
  maxAge?: number;
  domain?: string;
  path?: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
  expiryDisplay?: string;
  warnings: string[];
}

type TabType = "cookie" | "set-cookie";

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseCookieHeader(header: string): CookiePair[] {
  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eqIdx = part.indexOf("=");
      if (eqIdx === -1) return { name: part, value: "" };
      return {
        name: part.slice(0, eqIdx).trim(),
        value: part.slice(eqIdx + 1).trim(),
      };
    });
}

function formatExpiry(expiresStr: string | undefined, maxAge: number | undefined): string {
  if (maxAge !== undefined) {
    if (maxAge <= 0) return "Expires immediately (Max-Age ≤ 0)";
    const now = Date.now();
    const expDate = new Date(now + maxAge * 1000);
    const diff = maxAge;
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    const relative = parts.length ? `in ${parts.join(" ")}` : "in < 1m";
    return `${expDate.toUTCString()} (${relative})`;
  }
  if (expiresStr) {
    const d = new Date(expiresStr);
    if (isNaN(d.getTime())) return `${expiresStr} (invalid date)`;
    const diff = d.getTime() - Date.now();
    if (diff <= 0) return `${d.toUTCString()} (already expired)`;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    const relative = parts.length ? `in ${parts.join(" ")}` : "< 1h";
    return `${d.toUTCString()} (${relative})`;
  }
  return "Session cookie (expires when browser closes)";
}

function parseSetCookieHeader(header: string): SetCookieResult {
  const parts = header.split(";").map((p) => p.trim());
  const firstEq = parts[0].indexOf("=");
  const name = firstEq >= 0 ? parts[0].slice(0, firstEq).trim() : parts[0];
  const value = firstEq >= 0 ? parts[0].slice(firstEq + 1).trim() : "";

  let expires: string | undefined;
  let maxAge: number | undefined;
  let domain: string | undefined;
  let path: string | undefined;
  let httpOnly = false;
  let secure = false;
  let sameSite: string | undefined;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const lower = part.toLowerCase();
    if (lower === "httponly") { httpOnly = true; continue; }
    if (lower === "secure") { secure = true; continue; }
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const attrName = part.slice(0, eqIdx).trim().toLowerCase();
    const attrVal = part.slice(eqIdx + 1).trim();
    if (attrName === "expires") expires = attrVal;
    else if (attrName === "max-age") maxAge = parseInt(attrVal, 10);
    else if (attrName === "domain") domain = attrVal;
    else if (attrName === "path") path = attrVal;
    else if (attrName === "samesite") sameSite = attrVal;
  }

  const expiryDisplay = formatExpiry(expires, maxAge);

  const warnings: string[] = [];
  if (!secure) warnings.push("Missing Secure flag — cookie can be sent over HTTP");
  if (!httpOnly) warnings.push("Missing HttpOnly flag — JavaScript can read this cookie");
  if (!sameSite) warnings.push("Missing SameSite attribute — browser may default to Lax; set explicitly");
  if (sameSite?.toLowerCase() === "none" && !secure)
    warnings.push("SameSite=None requires the Secure flag");
  if (name.startsWith("__Secure-") && !secure)
    warnings.push("__Secure- prefix requires Secure flag");
  if (name.startsWith("__Host-") && (!secure || domain || path !== "/"))
    warnings.push("__Host- prefix requires Secure, no Domain, and Path=/");

  return { name, value, expires, maxAge, domain, path, httpOnly, secure, sameSite, expiryDisplay, warnings };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    ToolEvents.resultCopied();
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title="Copy value"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function AttributeBadge({ label, active, variant = "neutral" }: { label: string; active: boolean; variant?: "good" | "bad" | "neutral" }) {
  const colors = active
    ? variant === "good"
      ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
      : "bg-brand/10 text-brand border-brand/20"
    : "bg-muted text-muted-foreground border-border/50 line-through";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-mono ${colors}`}>
      {label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const COOKIE_EXAMPLE = "session=abc123xyz; theme=dark; _ga=GA1.1.123456789.1704067200";
const SET_COOKIE_EXAMPLE =
  "session=abc123xyz; Domain=example.com; Path=/; Expires=Fri, 31 Dec 2027 23:59:59 GMT; Max-Age=63072000; HttpOnly; Secure; SameSite=Strict";

export function CookieInspector() {
  const [tab, setTab] = useState<TabType>("set-cookie");
  const [input, setInput] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  const cookiePairs = tab === "cookie" && input.trim() ? parseCookieHeader(input) : [];
  const setCookieResult = tab === "set-cookie" && input.trim() ? parseSetCookieHeader(input) : null;

  const loadExample = useCallback(() => {
    setInput(tab === "cookie" ? COOKIE_EXAMPLE : SET_COOKIE_EXAMPLE);
    ToolEvents.toolUsed("load-example");
  }, [tab]);

  const handleTabChange = (t: TabType) => {
    setTab(t);
    setInput("");
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(input);
    toast.success("Copied to clipboard");
    ToolEvents.resultCopied();
  };

  const hasResult = tab === "cookie" ? cookiePairs.length > 0 : setCookieResult !== null;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Tab Toggle */}
      <div className="flex gap-2 p-1 rounded-xl bg-muted/50 border border-border/50 w-fit">
        {(["set-cookie", "cookie"] as const).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? "bg-background shadow-sm text-foreground border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "cookie" ? "Cookie (Request)" : "Set-Cookie (Response)"}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">
            {tab === "cookie" ? "Cookie header value" : "Set-Cookie header value"}
          </label>
          <div className="flex gap-2">
            <button
              onClick={loadExample}
              className="text-xs text-brand hover:underline"
            >
              Load example
            </button>
            {input && (
              <button
                onClick={() => setInput("")}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            tab === "cookie"
              ? "session=abc123; theme=dark; _ga=GA1.1.123456789"
              : "name=value; Domain=example.com; Path=/; HttpOnly; Secure; SameSite=Strict"
          }
          rows={3}
          className="w-full rounded-lg bg-background border border-border/50 px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand/40 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {hasResult && (
          <motion.div
            key={tab + input}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Cookie (Request) Results */}
            {tab === "cookie" && cookiePairs.length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-background overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
                  <span className="text-sm font-semibold">{cookiePairs.length} cookie{cookiePairs.length !== 1 ? "s" : ""} found</span>
                  <button onClick={handleCopyAll} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Copy className="h-3 w-3" /> Copy raw
                  </button>
                </div>
                <div className="divide-y divide-border/30">
                  {cookiePairs.map((pair, i) => (
                    <div key={i} className="flex items-start gap-4 px-4 py-3 hover:bg-muted/20 transition-colors">
                      <div className="min-w-0 flex-1 grid grid-cols-2 gap-x-4 gap-y-1">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                          <p className="text-sm font-mono font-semibold break-all">{pair.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Value</p>
                          <p className="text-sm font-mono break-all text-brand">{pair.value || <span className="italic text-muted-foreground">(empty)</span>}</p>
                        </div>
                      </div>
                      <CopyButton text={pair.value} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Set-Cookie (Response) Results */}
            {tab === "set-cookie" && setCookieResult && (
              <div className="space-y-3">
                {/* Core info */}
                <div className="rounded-2xl border border-border/50 bg-background overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                    <span className="text-sm font-semibold">Cookie Details</span>
                  </div>
                  <div className="divide-y divide-border/30">
                    {[
                      { label: "Name", value: setCookieResult.name },
                      { label: "Value", value: setCookieResult.value || "(empty)" },
                      { label: "Domain", value: setCookieResult.domain || "(not set — defaults to current host)" },
                      { label: "Path", value: setCookieResult.path || "(not set — defaults to /)" },
                      { label: "Expiry", value: setCookieResult.expiryDisplay },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start gap-4 px-4 py-3 hover:bg-muted/20">
                        <div className="w-20 shrink-0">
                          <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                        <p className="text-sm font-mono break-all flex-1">{value}</p>
                        {(label === "Name" || label === "Value") && <CopyButton text={value} />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security flags */}
                <div className="rounded-2xl border border-border/50 bg-background p-4">
                  <p className="text-sm font-semibold mb-3">Security Attributes</p>
                  <div className="flex flex-wrap gap-2">
                    <AttributeBadge label="HttpOnly" active={setCookieResult.httpOnly} variant="good" />
                    <AttributeBadge label="Secure" active={setCookieResult.secure} variant="good" />
                    <AttributeBadge
                      label={setCookieResult.sameSite ? `SameSite=${setCookieResult.sameSite}` : "SameSite"}
                      active={!!setCookieResult.sameSite}
                      variant="good"
                    />
                  </div>
                </div>

                {/* Warnings */}
                {setCookieResult.warnings.length > 0 && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <p className="text-sm font-semibold">{setCookieResult.warnings.length} security warning{setCookieResult.warnings.length !== 1 ? "s" : ""}</p>
                    </div>
                    <ul className="space-y-1">
                      {setCookieResult.warnings.map((w, i) => (
                        <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex gap-2">
                          <span className="shrink-0">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {setCookieResult.warnings.length === 0 && (
                  <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <p className="text-sm font-semibold">No security issues found</p>
                  </div>
                )}

                {/* Raw toggle */}
                <button
                  onClick={() => setShowRaw((v) => !v)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showRaw ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {showRaw ? "Hide" : "Show"} raw input
                </button>
                {showRaw && (
                  <div className="rounded-xl bg-muted/30 border border-border/30 px-4 py-3 font-mono text-xs break-all text-muted-foreground">
                    {input}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!hasResult && !input.trim() && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Paste a {tab === "cookie" ? "Cookie" : "Set-Cookie"} header value above to inspect it.
        </p>
      )}
    </div>
  );
}
