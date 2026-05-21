import { useEffect, type ReactNode } from 'react'
import DefaultLayout from './DefaultLayout'
import { useNavigate, useLocation } from 'react-router-dom'
import { getToken } from '../../infrastructure/auth/authStorage'

type LayoutSwitcherProps = {
  layout?: 'default' | 'dashboard' | 'auth' | 'none'
  children: ReactNode
}

const LayoutSwitcher = ({ layout = 'default', children }: LayoutSwitcherProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  // useEffect(() => {
  //   const token = getToken()
  //   if (!token) {
  //     if (location.pathname !== '/auth') {
  //       navigate('/auth')
  //     }
  //   } else {
  //     if (location.pathname === '/auth' || location.pathname === '/') {
  //       navigate('/hr')
  //     }
  //   }
  // }, [navigate, location.pathname])

  switch (layout) {
    case 'none':
      return <>{children}</>
    default:
      return <DefaultLayout>{children}</DefaultLayout>
  }
}

export default LayoutSwitcher