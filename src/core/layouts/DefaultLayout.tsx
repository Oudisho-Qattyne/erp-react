import type { ReactNode } from 'react'

const DefaultLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

export default DefaultLayout