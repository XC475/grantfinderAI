# Security Documentation

## Admin System Security

### Current Security Measures ✅

1. **Server-Side Authentication**

   - All admin routes verify Supabase authentication
   - Invalid/expired tokens = Immediate rejection

2. **Database Role Validation**

   - Role checked from PostgreSQL database
   - Cannot be spoofed from client

3. **Service Role Key Protection**

   - Stored server-side only (no NEXT*PUBLIC* prefix)
   - Used for admin operations (create/delete users)

4. **Multiple Security Layers**
   - Layer 1: Authentication check
   - Layer 2: Database role validation
   - Layer 3: Supabase admin API

### Attack Scenarios (All Protected) 🛡️

| Attack             | Result                           |
| ------------------ | -------------------------------- |
| Modify client code | ❌ Fails - Server validates      |
| Intercept requests | ❌ Fails - Token validated       |
| Forge JWT token    | ❌ Fails - Invalid signature     |
| SQL injection      | ❌ Fails - Parameterized queries |
| Bypass UI          | ❌ Fails - API protected         |

### Optional Enhancements

#### 1. Row Level Security (RLS) on Supabase

Add policies to prevent direct database access:

```sql
-- Enable RLS on users table
ALTER TABLE app.users ENABLE ROW LEVEL SECURITY;

-- Users can only see themselves
CREATE POLICY "Users can view own data"
ON app.users FOR SELECT
USING (auth.uid() = id);

-- Only service role can insert/update/delete
CREATE POLICY "Service role full access"
ON app.users FOR ALL
USING (auth.role() = 'service_role');

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON app.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM app.users
    WHERE id = auth.uid()
    AND role = 'ADMIN'
  )
);
```

#### 2. Rate Limiting

Add rate limiting to admin endpoints:

```typescript
// middleware.ts or admin route
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// In route handler
const identifier = currentUser.id;
const { success } = await limiter.check(identifier, 10); // 10 requests per minute

if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

#### 3. Audit Logging

Log all admin actions:

```typescript
// lib/audit-log.ts
export async function logAdminAction(
  adminId: string,
  action: string,
  details: any
) {
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      details,
      timestamp: new Date(),
      ipAddress: request.headers.get("x-forwarded-for"),
    },
  });
}

// In admin routes
await logAdminAction(currentUser.id, "CREATE_USER", {
  email: newUser.email,
  role: newUser.role,
});
```

#### 4. Two-Factor Authentication (2FA)

Require 2FA for admin accounts:

```typescript
// Check if admin has 2FA enabled
const admin = await prisma.user.findUnique({
  where: { id: currentUser.id },
  select: { role: true, twoFactorEnabled: true },
});

if (admin.role === "ADMIN" && !admin.twoFactorEnabled) {
  return NextResponse.json(
    { error: "2FA required for admin operations" },
    { status: 403 }
  );
}
```

#### 5. IP Whitelisting

Restrict admin access to specific IPs:

```typescript
const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(",") || [];
const clientIP = request.headers.get("x-forwarded-for");

if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
  return NextResponse.json(
    { error: "Access denied from this IP" },
    { status: 403 }
  );
}
```

#### 6. Session Timeout

Force re-authentication after inactivity:

```typescript
const lastActive = await redis.get(`user:${currentUser.id}:lastActive`);
const now = Date.now();

if (lastActive && now - parseInt(lastActive) > 30 * 60 * 1000) {
  // 30 minutes
  return NextResponse.json(
    { error: "Session expired, please login again" },
    { status: 401 }
  );
}

// Update last active time
await redis.set(`user:${currentUser.id}:lastActive`, now.toString());
```

### Best Practices ✅

1. **Never expose service role key**

   - Keep it in `.env.local` only
   - Never commit to git
   - Rotate regularly

2. **Validate input server-side**

   - Never trust client data
   - Sanitize all inputs
   - Use Zod or similar for validation

3. **Use HTTPS in production**

   - Encrypt data in transit
   - Secure cookies with `secure` flag

4. **Monitor admin actions**

   - Log all admin operations
   - Set up alerts for suspicious activity
   - Regular audit reviews

5. **Keep dependencies updated**

   ```bash
   npm audit
   npm update
   ```

6. **Environment separation**
   - Different keys for dev/staging/production
   - Never use production keys in development

### Testing Security

Test your security with these scenarios:

1. **Unauthenticated requests**

   ```bash
   curl -X POST http://localhost:3000/api/admin/users \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","name":"Test","password":"123456"}'

   # Should return 401 Unauthorized
   ```

2. **Regular user trying admin action**

   ```bash
   # Login as regular user, get token
   # Try to create user
   # Should return 403 Forbidden
   ```

3. **Modified request body**

   ```bash
   # Try to set yourself as admin
   curl -X POST http://localhost:3000/api/admin/users/[your-id] \
     -H "Authorization: Bearer [token]" \
     -H "Content-Type: application/json" \
     -d '{"role":"ADMIN"}'

   # Should return 403 Forbidden
   ```

### Incident Response

If you suspect a security breach:

1. **Immediately rotate:**

   - Supabase service role key
   - Database credentials
   - API keys

2. **Review audit logs:**

   - Check for unauthorized access
   - Identify compromised accounts

3. **Force password reset:**

   - All admin accounts
   - Affected user accounts

4. **Update security:**
   - Apply patches
   - Enable additional security measures

### Contact

For security concerns:

- Report vulnerabilities responsibly
- Don't disclose publicly before fix
- Contact: [your-security-email]

---

**Last Updated:** December 2024  
**Security Status:** ✅ SECURE
