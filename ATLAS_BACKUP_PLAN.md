# Atlas Backup and Index Change Plan

Use this checklist before changing Atlas indexes in production.

## 1. Capture current indexes

- Atlas UI: Cluster -> Collections -> choose collection -> Indexes -> take screenshots or export names/key patterns.
- Shell option:

```bash
mongosh "<your-atlas-connection-string>" --eval "db.getSiblingDB('<db-name>').patients.getIndexes()"
```

Repeat for `patients`, `users`, `auditlogs`, `consents`, `otps`, and `loginaudits`.

## 2. Export a data backup

Use `mongodump` before risky index changes:

```bash
mongodump --uri="<your-atlas-connection-string>" --out="./atlas-backup"
```

If you only want the key collections:

```bash
mongodump --uri="<your-atlas-connection-string>" --collection=patients --collection=users --collection=auditlogs --collection=consents --collection=otps --collection=loginaudits --out="./atlas-backup"
```

## 3. Optional JSON exports for inspection

```bash
mongoexport --uri="<your-atlas-connection-string>" --collection=patients --out=patients.json
mongoexport --uri="<your-atlas-connection-string>" --collection=users --out=users.json
```

## 4. Apply schema-driven changes first

- Update Mongoose schema indexes in code.
- Deploy or run a controlled script using `syncIndexes()`.
- Avoid ad-hoc manual index changes unless you also mirror them in code.

## 5. Verify after changes

- Confirm the new index list in Atlas.
- Check application startup logs.
- Test login, patient registration, admin patient search, NFC lookup, OTP, and hospital health.
- Watch Atlas Performance Advisor for unexpected regressions.

## 6. Rollback approach

- Recreate dropped indexes from the saved index list.
- Restore data from `mongodump` only if a wider operational problem occurs.
- Prefer index recreation over full data restore for index-only mistakes.
