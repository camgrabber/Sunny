import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    username: string
    role: 'admin' | 'superadmin'
  }

  interface Session {
    user: {
      id: string
      username: string
      role: 'admin' | 'superadmin'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'admin' | 'superadmin'
  }
} 