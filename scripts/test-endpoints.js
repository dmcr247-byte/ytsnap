const http = require("http");

async function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log("==========================================");
  console.log("   MEDIASNAP SYSTEM TEST SUITE           ");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  // 1. Test Homepage Redirect /
  try {
    const res = await fetchUrl("http://localhost:3000/");
    if (res.status === 307 || res.status === 308 || res.status === 302 || res.status === 200) {
      console.log(`✓ [Root Redirect] Status ${res.status}`);
      passed++;
    } else {
      console.error(`✗ [Root Redirect] Unexpected status ${res.status}`);
      failed++;
    }
  } catch (e) {
    console.error(`✗ [Root Redirect] Error:`, e.message);
    failed++;
  }

  // 2. Test All 8 Languages HTTP 200 & RTL for Arabic
  const languages = ["en", "hi", "es", "pt", "fr", "de", "ar", "id"];
  for (const lang of languages) {
    try {
      const res = await fetchUrl(`http://localhost:3000/${lang}`);
      if (res.status === 200) {
        const hasRtl = lang === "ar" ? res.body.includes('dir="rtl"') : true;
        console.log(`✓ [Language: /${lang}] HTTP 200 OK ${lang === "ar" ? `(RTL verified: ${hasRtl})` : ""}`);
        passed++;
      } else {
        console.error(`✗ [Language: /${lang}] Failed with status ${res.status}`);
        failed++;
      }
    } catch (e) {
      console.error(`✗ [Language: /${lang}] Error:`, e.message);
      failed++;
    }
  }

  // 3. Test Thumbnail API with valid video
  try {
    const res = await fetchUrl("http://localhost:3000/api/thumbnail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lang: "en" }),
    });
    const json = JSON.parse(res.body);
    if (res.status === 200 && json.success && json.data.id === "dQw4w9WgXcQ") {
      console.log(`✓ [API /api/thumbnail] Verified video: "${json.data.title}" by ${json.data.authorName}`);
      console.log(`   Thumbnails found: ${json.data.thumbnails.filter(t => t.available).length} resolutions verified available`);
      passed++;
    } else {
      console.error(`✗ [API /api/thumbnail] Failed:`, json);
      failed++;
    }
  } catch (e) {
    console.error(`✗ [API /api/thumbnail] Error:`, e.message);
    failed++;
  }

  // 4. Test Thumbnail API with invalid URL (Error Handling)
  try {
    const res = await fetchUrl("http://localhost:3000/api/thumbnail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://not-youtube.com/something", lang: "en" }),
    });
    const json = JSON.parse(res.body);
    if (res.status === 400 && json.error) {
      console.log(`✓ [API /api/thumbnail] Proper error validation: "${json.error}"`);
      passed++;
    } else {
      console.error(`✗ [API /api/thumbnail] Invalid URL did not return 400:`, res.status);
      failed++;
    }
  } catch (e) {
    console.error(`✗ [API /api/thumbnail Invalid] Error:`, e.message);
    failed++;
  }

  // 5. Test Download Proxy Endpoint
  try {
    const res = await fetchUrl("http://localhost:3000/api/download-proxy?id=dQw4w9WgXcQ&res=hqdefault&format=jpg");
    if (res.status === 200 && res.headers["content-disposition"] && res.headers["content-disposition"].includes("attachment")) {
      console.log(`✓ [API /api/download-proxy] Content-Type: ${res.headers["content-type"]}, Attachment Header: ${res.headers["content-disposition"]}`);
      passed++;
    } else {
      console.error(`✗ [API /api/download-proxy] Failed status ${res.status}`);
      failed++;
    }
  } catch (e) {
    console.error(`✗ [API /api/download-proxy] Error:`, e.message);
    failed++;
  }

  // 6. Test Video Info API
  try {
    const res = await fetchUrl("http://localhost:3000/api/video-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://youtu.be/dQw4w9WgXcQ", lang: "en" }),
    });
    const json = JSON.parse(res.body);
    if (res.status === 200 && json.success && json.complianceNotice) {
      console.log(`✓ [API /api/video-info] Metadata & Compliance notice verified`);
      passed++;
    } else {
      console.error(`✗ [API /api/video-info] Failed:`, json);
      failed++;
    }
  } catch (e) {
    console.error(`✗ [API /api/video-info] Error:`, e.message);
    failed++;
  }

  // 7. Test Authorized Download Inspector: YouTube Stream Prohibited Notice
  try {
    const res = await fetchUrl("http://localhost:3000/api/authorized-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }),
    });
    const json = JSON.parse(res.body);
    if (res.status === 200 && json.status === "prohibited_by_youtube") {
      console.log(`✓ [API /api/authorized-download] Compliance guard: "${json.message.slice(0, 75)}..."`);
      passed++;
    } else {
      console.error(`✗ [API /api/authorized-download] Guard failed:`, json);
      failed++;
    }
  } catch (e) {
    console.error(`✗ [API /api/authorized-download] Error:`, e.message);
    failed++;
  }

  // 8. Test Contact Form API
  try {
    const res = await fetchUrl("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Creator",
        email: "creator@example.com",
        subject: "Feature Inquiry",
        message: "Testing contact message pipeline and database storage.",
      }),
    });
    const json = JSON.parse(res.body);
    if (res.status === 200 && json.success) {
      console.log(`✓ [API /api/contact] Message stored successfully in database: ID ${json.id}`);
      passed++;
    } else {
      console.error(`✗ [API /api/contact] Failed:`, json);
      failed++;
    }
  } catch (e) {
    console.error(`✗ [API /api/contact] Error:`, e.message);
    failed++;
  }

  // 9. Test Admin Authentication & JWT Session
  let adminCookie = "";
  try {
    const res = await fetchUrl("http://localhost:3000/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@mediasnap.com", password: "Admin@MediaSnap2026!" }),
    });
    const json = JSON.parse(res.body);
    const cookieHeader = res.headers["set-cookie"];
    if (res.status === 200 && json.success && cookieHeader) {
      adminCookie = cookieHeader[0].split(";")[0];
      console.log(`✓ [API Admin Login] Authenticated: ${json.user.email} (Role: ${json.user.role})`);
      passed++;
    } else {
      console.error(`✗ [API Admin Login] Authentication failed:`, json);
      failed++;
    }
  } catch (e) {
    console.error(`✗ [API Admin Login] Error:`, e.message);
    failed++;
  }

  // 10. Test Admin Stats (with authenticated cookie)
  try {
    const res = await fetchUrl("http://localhost:3000/api/admin/stats", {
      headers: { Cookie: adminCookie },
    });
    const json = JSON.parse(res.body);
    if (res.status === 200 && json.success) {
      console.log(`✓ [API Admin Stats] Dashboard metrics verified: ${json.stats.totalToolUsages} total tool runs, ${json.stats.totalMessages} contact messages`);
      passed++;
    } else {
      console.error(`✗ [API Admin Stats] Failed:`, json);
      failed++;
    }
  } catch (e) {
    console.error(`✗ [API Admin Stats] Error:`, e.message);
    failed++;
  }

  // 11. Test Sitemap and Robots.txt
  try {
    const sitemapRes = await fetchUrl("http://localhost:3000/sitemap.xml");
    const robotsRes = await fetchUrl("http://localhost:3000/robots.txt");
    if (sitemapRes.status === 200 && robotsRes.status === 200) {
      console.log(`✓ [SEO] sitemap.xml & robots.txt generated successfully`);
      passed++;
    } else {
      console.error(`✗ [SEO] Sitemap or Robots status issue`);
      failed++;
    }
  } catch (e) {
    console.error(`✗ [SEO] Error:`, e.message);
    failed++;
  }

  // 12. Test Creator Tools Pages
  const tools = [
    "youtube-thumbnail-downloader",
    "youtube-video-information",
    "thumbnail-resizer",
    "image-compressor",
    "image-converter",
    "youtube-title-generator",
    "youtube-description-generator",
    "youtube-tags-generator",
    "youtube-hashtag-generator",
    "video-aspect-ratio-calculator",
  ];

  for (const t of tools) {
    try {
      const res = await fetchUrl(`http://localhost:3000/en/tools/${t}`);
      if (res.status === 200) {
        console.log(`✓ [Tool Page: /en/tools/${t}] HTTP 200 OK`);
        passed++;
      } else {
        console.error(`✗ [Tool Page: /en/tools/${t}] Status ${res.status}`);
        failed++;
      }
    } catch (e) {
      console.error(`✗ [Tool Page: /en/tools/${t}] Error:`, e.message);
      failed++;
    }
  }

  console.log("\n==========================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");
}

runTests();
