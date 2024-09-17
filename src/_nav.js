import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilPuzzle, cilLink } from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Home',
    to: '/home',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Projects',
    to: '/projects',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Connections',
    to: '/connections',
    icon: <CIcon icon={cilLink} customClassName="nav-icon" />,
  },
]

export default _nav
