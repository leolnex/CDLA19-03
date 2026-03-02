'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Phone, Mail, MapPin, Trash2, Eye, Briefcase, Calendar } from 'lucide-react'
import type { Lead, LeadStatus } from '@/lib/types'
import { categoryLabels } from '@/lib/types'

export default function AdminLeadsPage() {
  const { language, t } = useLanguage()
  const [leads, setLeads] = useState<Lead[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewLead, setViewLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/leads')
      if (!res.ok) throw new Error('Failed to fetch leads')
      const data = await res.json()
      setLeads(data.sort((a: Lead, b: Lead) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (err) {
      setError(language === 'es' ? 'Error al cargar leads' : 'Error loading leads')
      console.error('Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update lead')
      await fetchLeads()
    } catch (err) {
      console.error('Error updating lead:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/leads/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete lead')
      await fetchLeads()
    } catch (err) {
      console.error('Error deleting lead:', err)
    } finally {
      setDeleteId(null)
    }
  }

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'nuevo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'leido':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'cerrado':
        return 'bg-foreground/10 text-foreground/70'
      default:
        return ''
    }
  }

  const getTypeLabel = (type: Lead['lead_type']) => {
    if (type === 'cotizacion') {
      return language === 'es' ? 'Cotizacion' : 'Quote'
    }
    return language === 'es' ? 'Contacto' : 'Contact'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t.admin.leads}</h1>
        <p className="text-foreground/70">{t.admin.leadsDesc}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
          </CardContent>
        </Card>
      ) : leads.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <p className="text-foreground/60">{t.admin.noLeadsYet}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden border-border lg:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'es' ? 'Fecha' : 'Date'}</TableHead>
                    <TableHead>{language === 'es' ? 'Tipo' : 'Type'}</TableHead>
                    <TableHead>{language === 'es' ? 'Nombre' : 'Name'}</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>{language === 'es' ? 'Servicio' : 'Service'}</TableHead>
                    <TableHead>{language === 'es' ? 'Estado' : 'Status'}</TableHead>
                    <TableHead className="text-right">{t.admin.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map(lead => (
                    <TableRow key={lead.id}>
                      <TableCell className="whitespace-nowrap text-sm text-foreground/70">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={lead.lead_type === 'cotizacion' ? 'default' : 'secondary'}>
                          {getTypeLabel(lead.lead_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell className="text-sm text-foreground/70">{lead.email}</TableCell>
                      <TableCell>
                        {lead.service ? (
                          <span className="text-sm">
                            {categoryLabels[lead.service]?.[language] || lead.service}
                          </span>
                        ) : (
                          <span className="text-sm text-foreground/40">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(value: LeadStatus) => handleStatusChange(lead.id, value)}
                        >
                          <SelectTrigger className={`w-28 h-8 text-xs ${getStatusColor(lead.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nuevo">
                              {language === 'es' ? 'Nuevo' : 'New'}
                            </SelectItem>
                            <SelectItem value="leido">
                              {language === 'es' ? 'Leido' : 'Read'}
                            </SelectItem>
                            <SelectItem value="cerrado">
                              {language === 'es' ? 'Cerrado' : 'Closed'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setViewLead(lead)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setDeleteId(lead.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile Cards */}
          <div className="space-y-4 lg:hidden">
            {leads.map(lead => (
              <Card key={lead.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{lead.name}</h3>
                        <Badge variant={lead.lead_type === 'cotizacion' ? 'default' : 'secondary'} className="text-xs">
                          {getTypeLabel(lead.lead_type)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-foreground/60">{lead.email}</p>
                      {lead.service && (
                        <p className="mt-1 text-sm text-foreground/50">
                          {categoryLabels[lead.service]?.[language] || lead.service}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-foreground/50 shrink-0">
                      <Calendar className="h-3 w-3" />
                      {formatDateShort(lead.createdAt)}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
                    <Select
                      value={lead.status}
                      onValueChange={(value: LeadStatus) => handleStatusChange(lead.id, value)}
                    >
                      <SelectTrigger className={`w-28 h-9 text-xs ${getStatusColor(lead.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nuevo">
                          {language === 'es' ? 'Nuevo' : 'New'}
                        </SelectItem>
                        <SelectItem value="leido">
                          {language === 'es' ? 'Leido' : 'Read'}
                        </SelectItem>
                        <SelectItem value="cerrado">
                          {language === 'es' ? 'Cerrado' : 'Closed'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 min-w-[44px]"
                        onClick={() => setViewLead(lead)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        {language === 'es' ? 'Ver' : 'View'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9"
                        onClick={() => setDeleteId(lead.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* View Lead Dialog */}
      <Dialog open={!!viewLead} onOpenChange={() => setViewLead(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {viewLead?.name}
              <Badge variant={viewLead?.lead_type === 'cotizacion' ? 'default' : 'secondary'}>
                {viewLead && getTypeLabel(viewLead.lead_type)}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {viewLead && (
            <div className="space-y-4">
              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2 text-foreground/70">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${viewLead.email}`} className="hover:underline break-all">
                    {viewLead.email}
                  </a>
                </div>
                {viewLead.phone && (
                  <div className="flex items-center gap-2 text-foreground/70">
                    <Phone className="h-4 w-4 shrink-0" />
                    <a href={`tel:${viewLead.phone}`} className="hover:underline">
                      {viewLead.phone}
                    </a>
                  </div>
                )}
                {viewLead.city && (
                  <div className="flex items-center gap-2 text-foreground/70">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {viewLead.city}
                  </div>
                )}
                {viewLead.business_type && (
                  <div className="flex items-center gap-2 text-foreground/70">
                    <Briefcase className="h-4 w-4 shrink-0" />
                    {viewLead.business_type}
                  </div>
                )}
              </div>

              {viewLead.service && (
                <div className="rounded-2xl bg-muted p-3">
                  <span className="text-xs font-medium text-foreground/50">
                    {language === 'es' ? 'Servicio' : 'Service'}
                  </span>
                  <p className="font-medium">
                    {categoryLabels[viewLead.service]?.[language] || viewLead.service}
                  </p>
                </div>
              )}

              <div className="rounded-2xl bg-muted p-3">
                <span className="text-xs font-medium text-foreground/50">
                  {language === 'es' ? 'Mensaje' : 'Message'}
                </span>
                <p className="mt-1 whitespace-pre-wrap">{viewLead.message}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-foreground/50">
                <span>
                  {formatDate(viewLead.createdAt)}
                </span>
                <span>
                  {viewLead.lang === 'es' ? 'Espanol' : 'English'}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.confirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.admin.deleteConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">{t.admin.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto">{t.admin.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
