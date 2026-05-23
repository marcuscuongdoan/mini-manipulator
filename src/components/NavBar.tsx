import { NavLink } from 'react-router-dom'

export function NavBar() {
  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: 56,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      background: '#111128',
      borderBottom: '1px solid #2a2a4a',
      padding: '0 24px',
    }}>
      <span style={{ fontWeight: 700, fontSize: 16, color: '#a78bfa', marginRight: 32, letterSpacing: 1 }}>
        Mini Manipulator
      </span>
      {(['/', '/manipulator'] as const).map((path) => (
        <NavLink
          key={path}
          to={path}
          end
          style={({ isActive }) => ({
            color: isActive ? '#a78bfa' : '#9ca3af',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: isActive ? 600 : 400,
            padding: '4px 16px',
            borderBottom: isActive ? '2px solid #a78bfa' : '2px solid transparent',
            marginBottom: -1,
          })}
        >
          {path === '/' ? 'Mobile Base' : 'Manipulator'}
        </NavLink>
      ))}
    </nav>
  )
}
