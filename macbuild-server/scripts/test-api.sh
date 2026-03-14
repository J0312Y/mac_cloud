#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Mac Build Cloud — API Smoke Test
# Run: chmod +x scripts/test-api.sh && ./scripts/test-api.sh
# ─────────────────────────────────────────────────────────────────────────────

BASE="${API_URL:-http://localhost:3001/api}"
GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'; BOLD='\033[1m'

pass() { echo -e "  ${GREEN}✅ PASS${NC} $1"; }
fail() { echo -e "  ${RED}❌ FAIL${NC} $1"; ((FAILS++)); }

FAILS=0

echo -e "\n${BOLD}Mac Build Cloud — API Smoke Test${NC}"
echo "Base URL: $BASE"
echo "────────────────────────────────────────"

# ── Health ────────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}Health${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/health")
[ "$STATUS" = "200" ] && pass "GET /health → 200" || fail "GET /health → $STATUS"

# ── Auth ──────────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}Auth${NC}"

# Login as admin
RESP=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@macbuild.cloud","password":"Admin1234!"}')
ADMIN_TOKEN=$(echo $RESP | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
[ -n "$ADMIN_TOKEN" ] && pass "POST /auth/login (admin)" || fail "POST /auth/login (admin)"

# Login as user
RESP=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@company.io","password":"Demo1234!"}')
USER_TOKEN=$(echo $RESP | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
[ -n "$USER_TOKEN" ] && pass "POST /auth/login (user)" || fail "POST /auth/login (user)"

# Me endpoint
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/auth/me" \
  -H "Authorization: Bearer $USER_TOKEN")
[ "$STATUS" = "200" ] && pass "GET /auth/me" || fail "GET /auth/me → $STATUS"

# ── Builds ────────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}Builds${NC}"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/builds" \
  -H "Authorization: Bearer $USER_TOKEN")
[ "$STATUS" = "200" ] && pass "GET /builds" || fail "GET /builds → $STATUS"

RESP=$(curl -s -X POST "$BASE/build" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project":"TestApp","repo_url":"https://github.com/example/testapp.git","branch":"main","xcode_version":"15.3","region":"EU-West"}')
BUILD_ID=$(echo $RESP | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$BUILD_ID" ] && pass "POST /build → $BUILD_ID" || fail "POST /build"

if [ -n "$BUILD_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/build/$BUILD_ID" \
    -H "Authorization: Bearer $USER_TOKEN")
  [ "$STATUS" = "200" ] && pass "GET /build/:id" || fail "GET /build/:id → $STATUS"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/logs/$BUILD_ID" \
    -H "Authorization: Bearer $USER_TOKEN")
  [ "$STATUS" = "200" ] && pass "GET /logs/:id" || fail "GET /logs/:id → $STATUS"
fi

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/queue" \
  -H "Authorization: Bearer $USER_TOKEN")
[ "$STATUS" = "200" ] && pass "GET /queue" || fail "GET /queue → $STATUS"

# ── Admin ─────────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}Admin${NC}"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/admin/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
[ "$STATUS" = "200" ] && pass "GET /admin/stats" || fail "GET /admin/stats → $STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
[ "$STATUS" = "200" ] && pass "GET /admin/users" || fail "GET /admin/users → $STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/admin/stats" \
  -H "Authorization: Bearer $USER_TOKEN")
[ "$STATUS" = "403" ] && pass "GET /admin/stats blocked for non-admin → 403" || fail "Admin guard test"

# ── Auth guard ────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}Auth Guards${NC}"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/builds")
[ "$STATUS" = "401" ] && pass "GET /builds without token → 401" || fail "Auth guard → $STATUS"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "────────────────────────────────────────"
if [ $FAILS -eq 0 ]; then
  echo -e "${GREEN}${BOLD}All tests passed ✅${NC}"
else
  echo -e "${RED}${BOLD}$FAILS test(s) failed ❌${NC}"
  exit 1
fi
