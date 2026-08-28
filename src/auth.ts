import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { normalizeEmail } from '@/lib/auth-validation'

/**
 * Single Node-runtime Auth.js config. Auth is never run inside `src/proxy.ts`
 * (Next 16 Proxy is Node-only and reserved for next-intl locale routing), so no
 * split edge-safe config is needed — route protection lives in `src/lib/auth-dal.ts`.
 *
 * The Credentials provider forces `session.strategy = 'jwt'`; the Prisma adapter
 * is therefore exercised only on the Google path (it writes User + Account rows).
 * `registerAction` creates the credentials User row itself.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === 'string'
            ? normalizeEmail(credentials.email)
            : ''
        const password =
          typeof credentials?.password === 'string' ? credentials.password : ''
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
    Google,
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
