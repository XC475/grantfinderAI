# Model Switcher - Environment Variables Documentation

## Required Environment Variables

### Currently Used (Production Ready)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT models | ✅ Yes | None |
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | None |
| `DIRECT_URL` | Direct PostgreSQL connection (for migrations) | ✅ Yes | None |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Yes | None |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | ✅ Yes | None |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ Yes | None |

### Future Model Providers (Optional - Not Currently Used)

| Variable | Description | Required | When Needed |
|----------|-------------|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude models | ❌ No | When enabling Claude 3.5 Sonnet or Claude 4.5 Sonnet |
| `GOOGLE_API_KEY` | Google API key for Gemini models | ❌ No | When enabling Gemini 2.5 Pro |
| `NEXT_PUBLIC_GOOGLE_PICKER_API_KEY` | Google Picker API key | ❌ No | Already used for Google Drive integration |

## Environment Variable Setup

### Development
1. Copy `.env.example` to `.env.local`
2. Fill in all required variables
3. For OpenAI, get your API key from https://platform.openai.com/api-keys

### Production
1. Set all required environment variables in your hosting platform (Vercel, Railway, etc.)
2. Ensure `OPENAI_API_KEY` is set and valid
3. Optional: Add `ANTHROPIC_API_KEY` and `GOOGLE_API_KEY` when ready to enable those models

## Model Provider Status

- ✅ **OpenAI**: Fully configured and in use (GPT-4o Mini)
- ⏳ **Anthropic**: Code ready, needs `ANTHROPIC_API_KEY` and SDK installation
- ⏳ **Google**: Code ready, needs `GOOGLE_API_KEY` and SDK installation

## Notes

- All environment variables should be kept secure and never committed to version control
- The `.env.local` file is git-ignored by default
- Production environment variables should be set in your hosting platform's dashboard
- Model switcher works with just `OPENAI_API_KEY` - other providers are optional for future use

