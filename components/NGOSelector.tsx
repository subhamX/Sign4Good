'use client'

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface NGO {
  id: string
  name: string
}

interface NGOSelectorProps {
  ngos: NGO[]
  currentNGO: NGO | null
}

export function NGOSelector({ ngos, currentNGO }: NGOSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isOverviewActive = pathname === '/dash'

  useEffect(() => {
    if (currentNGO) {
      localStorage.setItem('currentNGO', JSON.stringify(currentNGO))
    }
  }, [currentNGO])

  const handleNGOChange = (value: string) => {
    if (value === 'overview') {
      router.push('/dash')
    } else if (value === 'add') {
      router.push('/onboarding')
    } else {
      router.push(`/dash/${value}`)
    }
  }

  if (ngos.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={currentNGO && pathname.startsWith(`/dash/${currentNGO.id}`) ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "flex items-center gap-2 text-sm",
            (currentNGO && pathname.startsWith(`/dash/${currentNGO.id}`) || (!currentNGO && isOverviewActive)) && "font-medium"
          )}
        >
          <span className="truncate max-w-[160px]">
            {currentNGO ? `🏢 ${currentNGO.name}` : '📊 All NGOs'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuItem 
          onClick={() => handleNGOChange('overview')}
          className={cn(
            "text-sm",
            isOverviewActive && "bg-accent font-medium"
          )}
        >
          📊 Overview (All NGOs)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {ngos.map((ngo) => (
          <DropdownMenuItem 
            key={ngo.id}
            onClick={() => handleNGOChange(ngo.id)}
            className={cn(
              "text-sm",
              pathname.startsWith(`/dash/${ngo.id}`) && "bg-accent font-medium"
            )}
          >
            🏢 {ngo.name}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleNGOChange('add')}
          className="text-sm text-muted-foreground"
        >
          ➕ Connect New NGO
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
