# NextAuth Configuration

## Required Environment Variables
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=generate_a_random_secret_key
NEXTAUTH_URL=http://localhost:3000

## How to get Google OAuth Credentials:

1. Go to https://console.cloud.google.com/
2. Create new project
3. Go to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google
6. Copy Client ID and Client Secret to .env