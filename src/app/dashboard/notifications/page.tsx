'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  FileText, 
  CheckCircle, 
  Clock,
  Settings,
  Trash2,
  Check
} from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'success' | 'info' | 'reminder'
  title: string
  message: string
  time: string
  read: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Study pack ready!',
      message: 'Your PDF "Introduction to Machine Learning" has been processed successfully.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Time to study!',
      message: "You haven't reviewed your quiz for \"Data Structures\" in 3 days.",
      time: '1 day ago',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Welcome to Cognify!',
      message: 'Upload your first PDF to start creating interactive study materials.',
      time: '2 days ago',
      read: true,
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-500" />
      case 'info':
        return <FileText className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated on your study progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">All caught up!</h3>
            <p className="text-muted-foreground text-sm mt-1">
              You have no notifications at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`transition-colors ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="secondary" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {notification.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center pt-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearAll}
              className="text-muted-foreground"
            >
              Clear all notifications
            </Button>
          </div>
        </div>
      )}

      {/* Notification Preferences Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
          <CardDescription>
            Quick summary of your notification settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Email notifications enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Study reminders enabled</span>
            </div>
          </div>
          <Link href="/dashboard/settings" className="inline-block mt-4">
            <Button variant="link" className="p-0 h-auto">
              Manage preferences →
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
