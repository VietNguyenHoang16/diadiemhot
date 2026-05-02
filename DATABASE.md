# Database Connection

## Connection String
```
postgresql://neondb_owner:npg_NmjJa9O3fdZb@ep-odd-snow-a4mgb2ei-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Database Tables
- **User** - User accounts (business owners, admins)
- **Business** - Business/shop profiles
- **Location** - Provinces/districts
- **Category** - Industry categories
- **BusinessCategory** - Business-Category relation
- **Review** - Reviews
- **Lead** - Featured registration leads
- **BlogPost** - Blog posts
- **Newsletter** - Email subscribers

## Usage

```typescript
import { prisma, getBusinesses, getBusinessById, createLead } from './lib/db';

// Get all businesses
const businesses = await getBusinesses({ featured: true });

// Get business by ID
const business = await await getBusinessById('abc123');

// Create lead
const lead = await createLead({
  businessName: 'My Shop',
  contactName: 'John Doe',
  email: 'john@shop.com',
  phone: '0912345678',
  package: 'Featured'
});
```

## Environment
- `DATABASE_URL` - stored in `.env` file
- Prisma config in `prisma.config.ts`