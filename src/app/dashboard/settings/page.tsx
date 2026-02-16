'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Trash2,
  Save,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { PasswordInput } from '@/components/ui/password-input'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  
  // Profile settings
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [studyReminders, setStudyReminders] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          email: user.email || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || ''
        })
        setName(user.user_metadata?.full_name || user.user_metadata?.name || '')
        setEmail(user.email || '')
      }
    }
    loadUser()
  }, [])

  const handleSaveProfile = async () => {
    setLoading(true)
    setSaved(false)
    
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name }
    })
    
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    
    setLoading(false)
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    }
    
    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    )
    
    if (confirmed) {
      // In production, this would call an API to delete the account
      alert('Account deletion would be processed here. Contact support for now.')
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>
          <Button onClick={handleSaveProfile} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose what notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about your study packs and activity
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Study Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded to review your study materials
              </p>
            </div>
            <Switch
              checked={studyReminders}
              onCheckedChange={setStudyReminders}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and tips
              </p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Update your password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <PasswordInput 
              id="current-password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <PasswordInput 
              id="new-password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <PasswordInput 
              id="confirm-password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-green-600">Password updated successfully!</p>
          )}
          <Button 
            onClick={handleChangePassword} 
            disabled={loading || !newPassword || !confirmPassword}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how Cognify looks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark theme
              </p>
            </div>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Delete Account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
