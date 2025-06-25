import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Radio, Zap, Signal, Smartphone } from 'lucide-react'

export function Navigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Home', icon: Radio },
    { path: '/wireless-comm', label: 'Wireless Communication', icon: Signal },
    { path: '/ofdm', label: 'OFDM Systems', icon: Zap },
    { path: '/link-budget', label: 'Link Budget', icon: Signal },
    { path: '/cellular', label: 'Cellular Design', icon: Smartphone },
  ]

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Radio className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Wireless Network AI</span>
          </Link>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

