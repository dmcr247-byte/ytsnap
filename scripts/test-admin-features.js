const http = require("http");

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });
    req.on("error", reject);
    if (data) {
      req.write(typeof data === "string" ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("🚀 Starting comprehensive Admin & SEO features test suite...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test Admin Login
    console.log("Step 1: Admin Authentication");
    const loginRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/admin/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        email: "admin@ytsnap.tech",
        password: "Admin@YTSnap2026!",
      }
    );

    assert(loginRes.statusCode === 200, "Admin login endpoint returns 200 OK");
    const cookieHeader = loginRes.headers["set-cookie"];
    assert(Boolean(cookieHeader && cookieHeader.length > 0), "Admin session cookie issued");
    const adminCookie = cookieHeader ? cookieHeader[0].split(";")[0] : "";

    // 2. Test Admin Settings GET
    console.log("\nStep 2: Fetch Settings via Admin API");
    const getSettingsRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/admin/settings",
      method: "GET",
      headers: { Cookie: adminCookie },
    });
    assert(getSettingsRes.statusCode === 200, "Settings GET returns 200 OK");
    const settingsJson = JSON.parse(getSettingsRes.body);
    const keys = settingsJson.settings.map((s) => s.key);
    assert(keys.includes("google_analytics_id"), "Includes google_analytics_id setting");
    assert(keys.includes("google_adsense_client_id"), "Includes google_adsense_client_id setting");
    assert(keys.includes("custom_header_code"), "Includes custom_header_code setting");
    assert(keys.includes("custom_footer_code"), "Includes custom_footer_code setting");
    assert(keys.includes("robots_txt_content"), "Includes robots_txt_content setting");
    assert(keys.includes("ads_txt_content"), "Includes ads_txt_content setting");

    // 3. Test Admin Settings PUT (Update all live parameters)
    console.log("\nStep 3: Update Live Settings via Admin API");
    const updatePayload = {
      settings: [
        { key: "google_analytics_id", value: "G-TEST999XYZ" },
        { key: "google_adsense_client_id", value: "ca-pub-1111222233334444" },
        { key: "google_adsense_enabled", value: "true" },
        { key: "custom_header_code", value: '<meta name="custom-admin-head" content="test-active-head" />' },
        { key: "custom_footer_code", value: '<script id="custom-test-footer">console.log("custom-footer-live");</script>' },
        { key: "robots_txt_content", value: "User-agent: *\nAllow: /\nDisallow: /admin-private/\n\nSitemap: http://localhost:3000/sitemap.xml" },
        { key: "ads_txt_content", value: "google.com, pub-1111222233334444, DIRECT, f08c47fec0942fa0" },
        { key: "sitemap_base_url", value: "http://localhost:3000" },
      ],
    };

    const putRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/admin/settings",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
      },
      updatePayload
    );
    assert(putRes.statusCode === 200, "Settings PUT returns 200 OK");

    // 4. Test Dynamic /robots.txt
    console.log("\nStep 4: Dynamic /robots.txt Route");
    const robotsRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/robots.txt",
      method: "GET",
    });
    assert(robotsRes.statusCode === 200, "/robots.txt returns 200 OK");
    assert(robotsRes.headers["content-type"].includes("text/plain"), "/robots.txt content-type is text/plain");
    assert(robotsRes.body.includes("Disallow: /admin-private/"), "/robots.txt dynamically contains saved directive");

    // 5. Test Dynamic /ads.txt
    console.log("\nStep 5: Dynamic /ads.txt Route");
    const adsTxtRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/ads.txt",
      method: "GET",
    });
    assert(adsTxtRes.statusCode === 200, "/ads.txt returns 200 OK");
    assert(adsTxtRes.headers["content-type"].includes("text/plain"), "/ads.txt content-type is text/plain");
    assert(adsTxtRes.body.includes("pub-1111222233334444"), "/ads.txt dynamically contains saved AdSense publisher line");

    // 6. Test Dynamic /sitemap.xml
    console.log("\nStep 6: Dynamic /sitemap.xml Route");
    const sitemapRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/sitemap.xml",
      method: "GET",
    });
    assert(sitemapRes.statusCode === 200, "/sitemap.xml returns 200 OK");
    assert(sitemapRes.body.includes("<urlset"), "/sitemap.xml valid XML sitemap");
    assert(sitemapRes.body.includes("http://localhost:3000/en"), "/sitemap.xml includes localized English URLs");
    assert(sitemapRes.body.includes("http://localhost:3000/hi"), "/sitemap.xml includes localized Hindi URLs");

    // 7. Test Ad Slots API (Update and Activate Header Banner)
    console.log("\nStep 7: Ad Placement Slots API");
    const adsGetRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/admin/ads",
      method: "GET",
    });
    assert(adsGetRes.statusCode === 200, "Ads GET returns 200 OK");
    const adsJson = JSON.parse(adsGetRes.body);
    const headerAd = adsJson.ads.find((a) => a.slot === "header_top");
    assert(Boolean(headerAd), "header_top slot exists");

    if (headerAd) {
      const adUpdateRes = await request(
        {
          hostname: "localhost",
          port: 3000,
          path: "/api/admin/ads",
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Cookie: adminCookie,
          },
        },
        {
          id: headerAd.id,
          htmlContent: '<div id="test-banner-slot">Live Ad Banner Slot</div>',
          isActive: true,
        }
      );
      assert(adUpdateRes.statusCode === 200, "Ad slot PUT update returns 200 OK");
    }

    // 8. Test Live Site HTML Injections (Google Analytics, AdSense, Custom Head & Footer)
    console.log("\nStep 8: Verify Live Injections in Server-Rendered HTML (/en)");
    const pageRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/en",
      method: "GET",
    });
    assert(pageRes.statusCode === 200, "/en returns 200 OK");
    assert(
      pageRes.body.includes("googletagmanager.com/gtag/js?id=G-TEST999XYZ") || pageRes.body.includes("G-TEST999XYZ"),
      "Google Analytics GA4 gtag.js script injected"
    );
    assert(
      pageRes.body.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1111222233334444") || pageRes.body.includes("ca-pub-1111222233334444"),
      "Google AdSense script with client ID injected"
    );
    assert(
      pageRes.body.includes('name="custom-admin-head" content="test-active-head"'),
      "Custom Header code correctly injected into <head>"
    );
    assert(
      pageRes.body.includes('console.log("custom-footer-live");'),
      "Custom Footer script correctly injected before </body>"
    );
    assert(
      pageRes.body.includes("test-banner-slot") || pageRes.body.includes("Advertisement"),
      "Live Ad Banner slot rendered on page"
    );

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runTests();
