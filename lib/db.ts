// lib/db.ts
import { PrismaClient } from '@prisma/client'

// Declare a global variable to hold the Prisma client instance.
// This is necessary because in a serverless environment (like Next.js), 
// a new instance might be created on every hot-reload, exhausting database connections.
declare global {
  var prisma: PrismaClient | undefined
}

// Create a new Prisma client if one doesn't already exist in the global scope.
// This singleton pattern prevents creating multiple instances of Prisma Client.
const client = globalThis.prisma || new PrismaClient()

// In development, set the global prisma instance to the newly created client.
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client

export default client
