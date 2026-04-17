export const siteConfig = {
  name: "HTTP Cookie Inspector",
  title: "HTTP Cookie Inspector — Parse & Debug Cookie Headers Instantly",
  description:
    "Paste any Cookie or Set-Cookie header string and instantly see every attribute parsed, explained, and validated. Debug auth sessions and cookie security in seconds.",
  url: "https://http-cookie-inspector.tools.jagodana.com",
  ogImage: "/opengraph-image",

  // Header
  headerIcon: "Cookie",
  brandAccentColor: "#f97316",

  // SEO
  keywords: [
    "cookie header parser",
    "set-cookie inspector",
    "http cookie debugger",
    "cookie attribute checker",
    "cookie security validator",
    "parse cookie header online",
    "httponly secure samesite checker",
    "cookie expiry calculator",
    "developer cookie tool",
    "http header cookie parser",
  ],
  applicationCategory: "DeveloperApplication",

  // Theme
  themeColor: "#f59e0b",

  // Branding
  creator: "Jagodana",
  creatorUrl: "https://jagodana.com",
  twitterHandle: "@jagodana",

  socialProfiles: ["https://twitter.com/jagodana"],

  links: {
    github:
      "https://github.com/Jagodana-Studio-Private-Limited/http-cookie-inspector",
    website: "https://jagodana.com",
  },

  footer: {
    about:
      "HTTP Cookie Inspector is a free browser-based tool that parses Cookie and Set-Cookie headers instantly — no server, no uploads, 100% private.",
    featuresTitle: "Features",
    features: [
      "Parse Cookie request headers",
      "Inspect Set-Cookie response headers",
      "Security attribute validation",
      "Human-readable expiry display",
    ],
  },

  hero: {
    badge: "Free Cookie Header Debugger",
    titleLine1: "Parse & Debug",
    titleGradient: "Cookie Headers",
    subtitle:
      "Paste any Cookie or Set-Cookie header string and see every attribute broken down, validated, and explained — in under 2 seconds.",
  },

  featureCards: [
    {
      icon: "🍪",
      title: "Cookie & Set-Cookie",
      description:
        "Supports both request Cookie headers and response Set-Cookie headers with full attribute parsing.",
    },
    {
      icon: "🔒",
      title: "Security Validation",
      description:
        "Instantly flags missing Secure, HttpOnly, and SameSite attributes to help harden your session cookies.",
    },
    {
      icon: "⏱️",
      title: "Human-Readable Expiry",
      description:
        "Converts Expires and Max-Age into plain-English time remaining so you know exactly when cookies expire.",
    },
  ],

  relatedTools: [
    {
      name: "HTTP Status Debugger",
      url: "https://http-status-debugger.tools.jagodana.com",
      icon: "🔍",
      description: "Decode and fix HTTP status codes instantly.",
    },
    {
      name: "Security Headers Generator",
      url: "https://security-headers-generator.tools.jagodana.com",
      icon: "🛡️",
      description: "Generate production-ready HTTP security headers.",
    },
    {
      name: "JWT Decoder",
      url: "https://jwt-decoder.tools.jagodana.com",
      icon: "🔑",
      description: "Decode and inspect JSON Web Tokens instantly.",
    },
    {
      name: "CORS Headers Generator",
      url: "https://cors-headers-generator.tools.jagodana.com",
      icon: "🌐",
      description: "Build correct CORS headers for your API.",
    },
    {
      name: "URL Encoder/Decoder",
      url: "https://url-encoder-decoder.tools.jagodana.com",
      icon: "🔗",
      description: "Encode and decode URLs and query strings.",
    },
    {
      name: "Encoding Explorer",
      url: "https://encoding-explorer.tools.jagodana.com",
      icon: "📦",
      description: "Encode and decode Base64, URL, HTML entities, and more.",
    },
  ],

  howToSteps: [
    {
      name: "Choose header type",
      text: 'Select "Cookie" for request headers or "Set-Cookie" for response headers using the tab toggle.',
      url: "",
    },
    {
      name: "Paste your header value",
      text: "Paste the raw Cookie or Set-Cookie header string into the input field. No need to include the header name itself.",
      url: "",
    },
    {
      name: "Inspect parsed results",
      text: "See every cookie name, value, and attribute broken down in a clear table with security warnings and human-readable expiry.",
      url: "",
    },
  ],
  howToTotalTime: "PT1M",

  faq: [
    {
      question: "What is a Cookie header?",
      answer:
        "The Cookie header is sent by the browser in HTTP requests to pass stored cookies back to the server. It contains one or more name=value pairs separated by semicolons, e.g. session=abc123; theme=dark.",
    },
    {
      question: "What is a Set-Cookie header?",
      answer:
        "The Set-Cookie header is sent by the server in HTTP responses to instruct the browser to store a cookie. It includes the cookie name and value along with optional attributes like Expires, Max-Age, Domain, Path, HttpOnly, Secure, and SameSite.",
    },
    {
      question: "What does the HttpOnly flag do?",
      answer:
        "The HttpOnly flag prevents JavaScript from accessing the cookie via document.cookie. This protects session cookies from being stolen through XSS (Cross-Site Scripting) attacks. Always set HttpOnly on session and auth cookies.",
    },
    {
      question: "What is the SameSite attribute?",
      answer:
        "SameSite controls whether a cookie is sent with cross-site requests. 'Strict' only sends cookies for same-site requests. 'Lax' allows top-level navigation. 'None' sends cookies on all requests but requires the Secure flag. Modern browsers default to Lax if SameSite is not specified.",
    },
    {
      question: "Is my cookie data sent to any server?",
      answer:
        "No. This tool runs entirely in your browser. Your cookie strings never leave your machine. No data is sent to any server.",
    },
    {
      question: "What is the difference between Expires and Max-Age?",
      answer:
        "Expires sets an absolute date/time when the cookie expires. Max-Age sets a relative number of seconds from now. Max-Age takes precedence over Expires when both are present. If neither is set, the cookie is a session cookie and expires when the browser tab closes.",
    },
  ],

  pages: {
    "/": {
      title:
        "HTTP Cookie Inspector — Parse & Debug Cookie Headers Instantly",
      description:
        "Paste any Cookie or Set-Cookie header string and instantly see every attribute parsed, explained, and validated. Debug auth sessions and cookie security in seconds.",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
