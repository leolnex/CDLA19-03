'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Phone, Mail, MapPin, MessageSquare, Trash2 } from 'lucide-react'
import type { Lead } from '@/lib/types'
import { categoryLabels } from '@/lib/types'

export default function AdminLeadsPage() {
  const { language, t } = useLanguage()
  const [leads, setLeads] = useState<Lead[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    const res = await fetch('/api/leads')
    const data = await res.json()
    setLeads(data)
  }

  const handleStatusChange = async (id: string, status: Lead['status']) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await fetchLeads()
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/leads/${deleteId}`, { method: 'DELETE' })
      await fetchLeads()
    } catch (error) {
      console.error('Error deleting lead:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'nuevo':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'contactado':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'cerrado':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t.admin.leads}</h1>
        <p className="text-foreground/70">{t.admin.leadsDesc}</p>
      </div>

      {/* Leads List */}
      {leads.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <p className="text-foreground/60">{t.admin.noLeadsYet}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map(lead => (
            <Card key={lead.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{lead.name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-foreground/60">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {lead.phone || '-'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {lead.city || '-'}
                      </span>
                      <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-foreground/50" />
                      <div className="text-sm">
                        <span className="font-medium">{categoryLabels[lead.service][language]}</span>
                        {' - '}
                        {lead.message}
                      </div>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <a href={`mailto:${lead.email}`} className="text-foreground/70 hover:underline">
                        {lead.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={lead.status}
                      onValueChange={(value: Lead['status']) => handleStatusChange(lead.id, value)}
                    >
                      <SelectTrigger className={`w-32 ${getStatusColor(lead.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nuevo">Nuevo</SelectItem>
                        <SelectItem value="contactado">Contactado</SelectItem>
                        <SelectItem value="cerrado">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(lead.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.confirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.admin.deleteConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.admin.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t.admin.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
