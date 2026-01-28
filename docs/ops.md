# Ops and debugging

## Health / status endpoint

`GET /api/status` returns a lightweight JSON payload for production debugging. It does **not** hit the database.

**Response fields:**

| Field | Description |
|-------|-------------|
| `ok` | Always `true` when the request succeeds (HTTP 200). |
| `timestamp` | ISO 8601 time when the response was generated. |
| `version` | Git commit SHA on Vercel (`VERCEL_GIT_COMMIT_SHA`), or `"unknown"` elsewhere. |
| `env` | `"production"`, `"preview"`, or `"dev"` (from `VERCEL_ENV` or `NODE_ENV`). |
| `supabaseConfigured` | `true` if `NEXT_PUBLIC_SUPABASE_URL` is set and non-empty. |

**Example:**

```bash
curl -s https://yourapp.vercel.app/api/status
```

```json
{
  "ok": true,
  "timestamp": "2025-01-26T12:00:00.000Z",
  "version": "abc123",
  "env": "production",
  "supabaseConfigured": true
}
```

Use this endpoint to:

- Confirm the app is up and responding.
- Verify deploy revision and environment.
- Check that Supabase URL is configured (no DB connection test).

Do **not** use it for readiness probes that require DB connectivity; add a separate, optional readiness route if you need that.
