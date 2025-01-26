'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
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
  const [selectedNGO, setSelectedNGO] = useState<string>(currentNGO?.id || '')

  useEffect(() => {
    if (currentNGO) {
      localStorage.setItem('currentNGO', JSON.stringify(currentNGO))
    }
  }, [currentNGO])

  const handleNGOChange = (value: string) => {
    if (value === 'overview') {
      setSelectedNGO('')
      router.push('/dash')
    } else if (value === 'add') {
      router.push('/onboarding')
    } else {
      setSelectedNGO(value)
      router.push(`/dash/${value}`)
    }
  }

  if (ngos.length === 0) return null

  return (
    <Select value={selectedNGO} onValueChange={handleNGOChange}>
      <SelectTrigger className="w-[140px] md:w-[180px] text-sm">
        <SelectValue placeholder="Select NGO">
          {selectedNGO ? (
            ngos.find(ngo => ngo.id === selectedNGO)?.name
          ) : (
            "All NGOs"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-xs font-medium text-muted-foreground">Quick Actions</SelectLabel>
          <SelectItem 
            value="overview"
            className={cn(
              "text-sm",
              !selectedNGO && "font-medium"
            )}
          >
            📊 All NGOs
          </SelectItem>
          <SelectItem value="add" className="text-sm">
            ➕ Add New NGO
          </SelectItem>
        </SelectGroup>
        
        <SelectSeparator className="my-2" />
        
        <SelectGroup>
          <SelectLabel className="text-xs font-medium text-muted-foreground">Your NGOs</SelectLabel>
          {ngos.map((ngo) => (
            <SelectItem 
              key={ngo.id} 
              value={ngo.id}
              className={cn(
                "text-sm",
                selectedNGO === ngo.id && "font-medium"
              )}
            >
              🏢 {ngo.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
} 
