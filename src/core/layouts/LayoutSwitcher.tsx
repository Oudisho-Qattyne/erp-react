import type { ReactNode } from 'react'
import DefaultLayout from './DefaultLayout'

type LayoutSwitcherProps = {
  layout?: 'default' | 'dashboard' | 'auth' | 'none'
  children: ReactNode
}

const LayoutSwitcher = ({ layout = 'default', children }: LayoutSwitcherProps) => {
  switch (layout) {
    case 'none':
      return <>{children}</>
    default:
      return <DefaultLayout>{children}</DefaultLayout>
  }
}

export default LayoutSwitcher