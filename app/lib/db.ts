import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient,
  pool: Pool
};

const pool = globalForPrisma.pool || new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Business operations
export async function getBusinesses(options?: {
  featured?: boolean;
  industry?: string;
  status?: 'PENDING' | 'ACTIVE' | 'REJECTED';
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  if (options?.featured) where.featured = true;
  if (options?.industry) where.industry = options.industry;
  if (options?.status) where.status = options.status;
  else where.status = 'ACTIVE';

  return prisma.business.findMany({
    where,
    include: { location: true },
    orderBy: { views: 'desc' },
    take: options?.limit || 20,
    skip: options?.offset || 0,
  });
}

export async function getBusinessById(id: string) {
  return prisma.business.findUnique({
    where: { id },
    include: { 
      user: { select: { name: true, email: true } },
      location: true,
      reviews: { 
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 10 
      }
    },
  });
}

export async function getBusinessBySlug(slug: string) {
  return prisma.business.findUnique({
    where: { slug },
    include: { 
      user: { select: { name: true, email: true } },
      location: true,
      reviews: { 
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' }
      }
    },
  });
}

export async function createBusiness(data: {
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  userId: string;
  locationId?: string;
}) {
  return prisma.business.create({ data });
}

export async function updateBusiness(id: string, data: Partial<{
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  facebook: string;
  zalo: string;
  openingHours: string;
  logo: string;
  coverImage: string;
}>) {
  return prisma.business.update({ where: { id }, data });
}

// Review operations
export async function createReview(data: {
  rating: number;
  comment?: string;
  businessId: string;
}) {
  const business = await prisma.business.update({
    where: { id: data.businessId },
    data: {
      reviewCount: { increment: 1 },
      rating: { increment: data.rating },
    },
  });
  
  return prisma.review.create({ data });
}

// Lead operations
export async function createLead(data: {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  description?: string;
  package?: string;
}) {
  return prisma.lead.create({ data });
}

export async function getLeads(status?: 'PENDING' | 'CONTACTED' | 'CONVERTED' | 'REJECTED') {
  return prisma.lead.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateLeadStatus(id: string, status: 'PENDING' | 'CONTACTED' | 'CONVERTED' | 'REJECTED') {
  return prisma.lead.update({ where: { id }, data: { status } });
}

// User operations
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'GUEST' | 'BUSINESS' | 'ADMIN';
}) {
  return prisma.user.create({ data });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

// Newsletter operations
export async function subscribeNewsletter(email: string) {
  return prisma.newsletter.upsert({
    where: { email },
    update: { status: true },
    create: { email },
  });
}

export async function getBlogPosts(status?: 'DRAFT' | 'PUBLISHED') {
  return prisma.blogPost.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getLocations() {
  return prisma.location.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}
