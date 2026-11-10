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

async function testProfileUpdate() {
  console.log("🚀 Testing Admin Profile, Password Management & Login Security...\n");
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
    // 1. Verify Login Page does NOT show default credentials
    console.log("Step 1: Check Login Screen Security");
    const adminPageRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/admin",
      method: "GET",
    });
    assert(adminPageRes.statusCode === 200, "/admin returns 200 OK");
    assert(!adminPageRes.body.includes("Default Seed Credentials"), "Login page DOES NOT show 'Default Seed Credentials'");
    assert(!adminPageRes.body.includes("Admin@YTSnap2026!"), "Login page DOES NOT expose default password");

    // 2. Login to get admin session cookie
    console.log("\nStep 2: Admin Login");
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
    assert(loginRes.statusCode === 200, "Admin login successful");
    const cookieHeader = loginRes.headers["set-cookie"];
    const adminCookie = cookieHeader ? cookieHeader[0].split(";")[0] : "";
    assert(Boolean(adminCookie), "Admin session cookie obtained");

    // 3. Test Profile Update: Wrong current password should be rejected
    console.log("\nStep 3: Security Validation on Password Change");
    const wrongPassRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/admin/auth/me",
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: adminCookie },
      },
      {
        name: "YTSnap Master",
        currentPassword: "WrongPassword123!",
        newPassword: "NewSecretPassword2026!",
      }
    );
    assert(wrongPassRes.statusCode === 400, "Rejects update when current password is wrong");
    assert(wrongPassRes.body.includes("Current password is incorrect"), "Returns correct error message");

    // 4. Test Profile Update: Short password should be rejected
    const shortPassRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/admin/auth/me",
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: adminCookie },
      },
      {
        name: "YTSnap Master",
        currentPassword: "Admin@YTSnap2026!",
        newPassword: "short",
      }
    );
    assert(shortPassRes.statusCode === 400, "Rejects new password shorter than 8 chars");

    // 5. Test Successful Name & Profile Update
    console.log("\nStep 4: Update Admin Display Name");
    const updateNameRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/admin/auth/me",
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: adminCookie },
      },
      {
        name: "YTSnap Chief Administrator",
      }
    );
    assert(updateNameRes.statusCode === 200, "Display name updated successfully");
    const updatedUser = JSON.parse(updateNameRes.body).user;
    assert(updatedUser.name === "YTSnap Chief Administrator", "New name reflected in response");

    // 6. Test Password Update with valid current password
    console.log("\nStep 5: Change Password & Verify New Login");
    const changePassRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/admin/auth/me",
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: adminCookie },
      },
      {
        currentPassword: "Admin@YTSnap2026!",
        newPassword: "TempTestPassword2026!",
      }
    );
    assert(changePassRes.statusCode === 200, "Password changed successfully");

    // 7. Verify login works with new password
    const newLoginRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/admin/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        email: "admin@ytsnap.tech",
        password: "TempTestPassword2026!",
      }
    );
    assert(newLoginRes.statusCode === 200, "Login works with new password");

    // 8. Restore password back to Admin@YTSnap2026!
    const newCookie = newLoginRes.headers["set-cookie"][0].split(";")[0];
    const restorePassRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/admin/auth/me",
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: newCookie },
      },
      {
        currentPassword: "TempTestPassword2026!",
        newPassword: "Admin@YTSnap2026!",
      }
    );
    assert(restorePassRes.statusCode === 200, "Password restored to Admin@YTSnap2026!");

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  }
}

testProfileUpdate();
