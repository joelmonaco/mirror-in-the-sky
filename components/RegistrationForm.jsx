'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function RegistrationForm({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    privacyAccepted: false
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validierung
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email ist erforderlich'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige Email-Adresse'
    }
    if (!formData.role) {
      newErrors.role = 'Bitte wähle eine Rolle'
    }
    if (!formData.privacyAccepted) {
      newErrors.privacyAccepted = 'Bitte akzeptiere die Datenschutzbestimmungen'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/send-registration-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      // Prüfe ob Response JSON ist
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        toast.error('Ungültige Server-Antwort. Bitte versuche es später erneut.')
        return
      }

      const result = await response.json()

      if (result.success) {
        // Success-State aktivieren
        setIsSuccess(true)
        
        // Formular zurücksetzen
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: '',
          privacyAccepted: false
        })
        setErrors({})
      } else {
        toast.error(result.error || 'Fehler beim Senden der Anmeldung. Bitte versuche es erneut.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = (open) => {
    if (!open) {
      setIsSuccess(false)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`max-w-md w-[calc(100%-2rem)] sm:w-full sm:mx-auto ${isSuccess ? 'max-w-sm' : ''}`}>
        {!isSuccess ? (
          <>
            <DialogHeader className="pt-6">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Zum Live-Event anmelden
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Fülle das Formular aus, um dich für das Live-Event vor Ort im Kiez Lab Berlin am 13. November anzumelden.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Vollständiger Name */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium text-gray-900">
              Vollständiger Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Max Mustermann"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: '' })
              }}
              className={`bg-gray-200 rounded-lg h-12 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium text-gray-900">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="max@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              className={`bg-gray-200 rounded-lg h-12 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Telefon */}
          <div className="space-y-3">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-900">
              Telefon
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+49 123 456789"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-gray-200 rounded-lg h-12"
            />
          </div>

          {/* Du bist? */}
          <div className="space-y-3">
            <Label htmlFor="role" className="text-sm font-medium text-gray-900">
              Du bist? <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => {
                setFormData({ ...formData, role: value })
                if (errors.role) setErrors({ ...errors, role: '' })
              }}
            >
              <SelectTrigger id="role" className={`bg-gray-200 rounded-lg h-12 ${errors.role ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Bitte wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lehrkraft">Lehrkraft</SelectItem>
                <SelectItem value="schulleiter">Schulleiter</SelectItem>
                <SelectItem value="schüler">Schüler</SelectItem>
                <SelectItem value="medienbeauftragter">Medienbeauftragter</SelectItem>
                <SelectItem value="elternteil">Elternteil</SelectItem>
                <SelectItem value="sonstiges">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Datenschutz Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={formData.privacyAccepted}
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, privacyAccepted: checked })
                  if (errors.privacyAccepted) setErrors({ ...errors, privacyAccepted: '' })
                }}
                className={errors.privacyAccepted ? 'border-red-500' : ''}
              />
              <Label
                htmlFor="privacy"
                className="text-sm text-gray-900 leading-relaxed cursor-pointer"
              >
                Ich akzeptiere die{' '}
                <a
                  href="https://wptest2.teech.de/datenschutz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-bold hover:text-gray-800 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Datenschutzbestimmungen
                </a>
                . <span className="text-red-500">*</span>
              </Label>
            </div>
            {errors.privacyAccepted && (
              <p className="text-sm text-red-500 ml-6">{errors.privacyAccepted}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white py-3 text-base font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: '#4A3DF1' }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#3d32d1'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#4A3DF1'
                }
              }}
            >
              {isSubmitting ? 'Wird gesendet...' : 'Anmelden'}
            </button>
          </div>
        </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            {/* Checkmark Animation */}
            <div className="mb-6">
              <svg
                className="checkmark-animation w-20 h-20 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
              >
                <circle
                  className="checkmark-circle"
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  className="checkmark-check"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  d="M14 26 l8 8 l16-16"
                />
              </svg>
            </div>
            
            {/* Success Text */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Erfolgreich angemeldet
            </h2>
            
            {/* Info Text */}
            <p className="text-gray-600 text-sm leading-relaxed">
              Du erhälst in den nächsten 24h weitere Informationen zu deinem Besuch der Inspiration Days vor Ort.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

