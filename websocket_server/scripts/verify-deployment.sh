#!/bin/bash

# ==========================================
# WebSocket Server Deployment Verification
# ==========================================

set -e

echo "🔍 Verifying WebSocket Server Deployment Configuration..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
echo "1. Checking environment configuration..."
if [ -f .env ]; then
  echo -e "${GREEN}✅ .env file exists${NC}"
  
  # Check required variables
  required_vars=("PORT" "NODE_ENV" "NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" "DATABASE_API_URL" "WS_SERVER_SECRET")
  
  for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env; then
      value=$(grep "^${var}=" .env | cut -d '=' -f2)
      if [ -z "$value" ] || [ "$value" = "your-" ] || [[ "$value" == *"your-"* ]]; then
        echo -e "${RED}❌ $var is not set or has placeholder value${NC}"
        exit 1
      else
        echo -e "${GREEN}   ✅ $var is set${NC}"
      fi
    else
      echo -e "${RED}❌ $var is missing from .env${NC}"
      exit 1
    fi
  done
else
  echo -e "${RED}❌ .env file not found${NC}"
  echo -e "${YELLOW}   Copy env.example to .env and fill in the values${NC}"
  exit 1
fi

echo ""

# Check if using anon key (not service_role)
echo "2. Checking Supabase key type..."
if grep -q "role.*anon" .env; then
  echo -e "${GREEN}✅ Using anon key (correct)${NC}"
elif grep -q "role.*service_role" .env; then
  echo -e "${RED}❌ Using service_role key (security risk!)${NC}"
  echo -e "${YELLOW}   Please use the anon key instead${NC}"
  exit 1
else
  echo -e "${YELLOW}⚠️  Cannot verify key type${NC}"
fi

echo ""

# Check if WS_SERVER_SECRET is strong enough
echo "3. Checking WS_SERVER_SECRET strength..."
secret=$(grep "^WS_SERVER_SECRET=" .env | cut -d '=' -f2)
if [ ${#secret} -ge 32 ]; then
  echo -e "${GREEN}✅ WS_SERVER_SECRET is sufficiently long${NC}"
else
  echo -e "${RED}❌ WS_SERVER_SECRET is too short (< 32 chars)${NC}"
  echo -e "${YELLOW}   Generate a new one with:${NC}"
  echo -e "${YELLOW}   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"${NC}"
  exit 1
fi

echo ""

# Check if NODE_ENV is production
echo "4. Checking NODE_ENV..."
if grep -q "^NODE_ENV=production" .env; then
  echo -e "${GREEN}✅ NODE_ENV is set to production${NC}"
else
  echo -e "${YELLOW}⚠️  NODE_ENV is not set to production${NC}"
  echo -e "${YELLOW}   For production deployment, set NODE_ENV=production${NC}"
fi

echo ""

# Check if node_modules exists
echo "5. Checking dependencies..."
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✅ node_modules exists${NC}"
else
  echo -e "${RED}❌ node_modules not found${NC}"
  echo -e "${YELLOW}   Run: npm install${NC}"
  exit 1
fi

echo ""

# Check if dist exists (already built)
echo "6. Checking build..."
if [ -d "dist" ]; then
  echo -e "${GREEN}✅ Build exists (dist/ folder)${NC}"
else
  echo -e "${YELLOW}⚠️  Build not found${NC}"
  echo -e "${YELLOW}   Run: npm run build${NC}"
fi

echo ""

# Check if railway.json exists
echo "7. Checking Railway configuration..."
if [ -f "railway.json" ]; then
  echo -e "${GREEN}✅ railway.json exists${NC}"
else
  echo -e "${RED}❌ railway.json not found${NC}"
  exit 1
fi

echo ""

# Try to build (to catch any TypeScript errors)
echo "8. Testing build..."
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  echo -e "${YELLOW}   Run 'npm run build' to see errors${NC}"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All pre-deployment checks passed!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo "   1. Commit your changes"
echo "   2. Push to GitHub"
echo "   3. Deploy to Railway"
echo "   4. Update Vercel environment variables"
echo "   5. Test health endpoint: https://your-service.railway.app/health"
echo ""
echo "📖 See RAILWAY_DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""

