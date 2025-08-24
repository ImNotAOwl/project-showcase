#!/bin/sh
set -e

MONGO_HOST="${MONGO_HOST:-mongo}"
MONGO_PORT="${MONGO_PORT:-27127}"
ROOT_USER="${MONGO_INITDB_ROOT_USERNAME:-root}"
ROOT_PASS="${MONGO_INITDB_ROOT_PASSWORD:-root}"
APP_DB="${APP_DB:-my_apps}"
APP_USER="${APP_USER:-app_user}"
APP_PASS="${APP_PASS:-change_me_secure}"

echo "[init] Wait for mongod on ${MONGO_HOST}:${MONGO_PORT}…"
for i in $(seq 1 60); do
  if mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" -u "$ROOT_USER" -p "$ROOT_PASS" --authenticationDatabase admin --quiet --eval 'db.runCommand({ ping: 1 }).ok' | grep -q 1; then
    break
  fi
  sleep 1
done

echo "[init] Ensure ReplicaSet…"
mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" -u "$ROOT_USER" -p "$ROOT_PASS" --authenticationDatabase admin <<EOF
try {
  const s = rs.status();
  if (s.ok === 1) { print("[init] RS already initialized"); }
} catch (e) {
  if (e.codeName === "NotYetInitialized" || /no replset config/.test(e.message)) {
    print("[init] rs.initiate()");
    rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "${MONGO_HOST}:${MONGO_PORT}" }] });
  } else { throw e; }
}
EOF

echo "[init] Wait for PRIMARY…"
for i in $(seq 1 60); do
  if mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" -u "$ROOT_USER" -p "$ROOT_PASS" --authenticationDatabase admin --quiet --eval 'rs.status().members.find(m=>m.self)?.stateStr' | grep -q PRIMARY; then
    break
  fi
  sleep 1
done

echo "[init] Ensure app user…"
mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" -u "$ROOT_USER" -p "$ROOT_PASS" --authenticationDatabase admin <<EOF
const dbName = "$APP_DB";
const appUser = "$APP_USER";
const appPass = "$APP_PASS";
const db = db.getSiblingDB(dbName);
if (!db.getUser(appUser)) {
  db.createUser({ user: appUser, pwd: appPass, roles: [{ role: "readWrite", db: dbName }] });
  print("[init] user created");
} else {
  print("[init] user exists");
}
EOF

echo "[init] Done."
