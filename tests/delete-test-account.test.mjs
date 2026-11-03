import test from "node:test";
import assert from "node:assert/strict";

function allowed(email, list) {
  const normalized = String(email ?? "").trim().toLowerCase();
  const allowlist = String(list ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  return Boolean(normalized) && !normalized.includes(",") && normalized !== "*" && normalized !== "all" && allowlist.includes(normalized);
}

test("only an exact allowlisted single email is accepted", () => {
  assert.equal(allowed("TEST@example.com", "test@example.com"), true);
  assert.equal(allowed("other@example.com", "test@example.com"), false);
  assert.equal(allowed("all", "all"), false);
  assert.equal(allowed("*", "*"), false);
  assert.equal(allowed("a@example.com,b@example.com", "a@example.com,b@example.com"), false);
});
