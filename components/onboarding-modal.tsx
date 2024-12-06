import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export interface UserSettings {
  name: string
  age: number
  level: 'easy' | 'medium' | 'advanced'
}

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
  onSave: (settings: UserSettings) => void
  initialSettings?: UserSettings
}

export function OnboardingModal({ open, onClose, onSave, initialSettings }: OnboardingModalProps) {
  const [settings, setSettings] = useState<UserSettings>({
    name: initialSettings?.name || '',
    age: initialSettings?.age || 0,
    level: initialSettings?.level || 'easy'
  })

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        name: initialSettings.name,
        age: initialSettings.age,
        level: initialSettings.level
      })
    }
  }, [initialSettings])

  const handleSave = () => {
    if (!settings.name || !settings.age) return
    onSave(settings)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialSettings ? 'Update Settings' : 'Welcome to Flash Cards!'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setSettings({ ...settings, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="age" className="text-right">
              Age
            </Label>
            <Input
              id="age"
              type="number"
              value={settings.age || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setSettings({ ...settings, age: parseInt(e.target.value) })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="level" className="text-right">
              Level
            </Label>
            <Select
              value={settings.level}
              onValueChange={(value: 'easy' | 'medium' | 'advanced') => 
                setSettings({ ...settings, level: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!settings.name || !settings.age}>
          {initialSettings ? 'Update' : 'Start Learning'}
        </Button>
      </DialogContent>
    </Dialog>
  )
} 