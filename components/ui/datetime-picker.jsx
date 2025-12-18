"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format, isSameDay } from "date-fns"
import { de } from "date-fns/locale"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useEffect } from "react"
import PrimaryButton from "../custom/primary-button"

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Datum auswählen",
  className,
  startDate, // Für End-Date Picker um zu prüfen ob gleicher Tag
  autoOpen = false, // Neue Prop für automatisches Öffnen
  onFinish = () => {} // Neue Prop für Callback nach Öffnen
}) {
  // Media Query für Desktop/Mobile Unterscheidung - am Anfang initialisieren
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const [isClient, setIsClient] = React.useState(false)

  // Parse initial value and extract date and time
  const initialDate = value ? new Date(value) : undefined
  const initialTime = value ? format(new Date(value), "HH:mm") : ""

  const [date, setDate] = React.useState(initialDate)
  const [time, setTime] = React.useState(initialTime)
  const [dateString, setDateString] = React.useState(
    value ? format(new Date(value), "dd.MM.yyyy") : ""
  )
  const [open, setOpen] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)
  const [displayMonth, setDisplayMonth] = React.useState(value ? new Date(value) : new Date())

  // Refs für automatisches Fokussieren
  const timeInputRef = React.useRef(null)
  const mobileTimeInputRef = React.useRef(null)

  // Update states when value prop changes
  React.useEffect(() => {
    if (value) {
      const newDate = new Date(value)
      setDate(newDate)
      
      // Nur Zeit setzen wenn es nicht Mitternacht ist (00:00:00)
      const hours = newDate.getHours()
      const minutes = newDate.getMinutes()
      const seconds = newDate.getSeconds()
      
      if (hours !== 0 || minutes !== 0 || seconds !== 0) {
        setTime(format(newDate, "HH:mm"))
      } else {
        setTime("") // Leer lassen wenn Mitternacht
      }
      
      setDateString(format(newDate, "dd.MM.yyyy"))
      setDisplayMonth(newDate)
    } else {
      setDate(undefined)
      setTime("")
      setDateString("")
      setDisplayMonth(new Date())
    }
  }, [value])

  // Set client-side flag after mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auto-open Effect
  useEffect(() => {
    if (autoOpen) {
      setOpen(true)
    }
  }, [autoOpen])

  const handleClose = (openNext = false) => {
    // Prüfe ob beide Felder leer sind
    if (!dateString.trim() && !time.trim()) {
      // Beide Felder leer - entferne den Wert komplett
      onChange && onChange(null)
    } else if (dateString.trim() && !time.trim()) {
      // Nur Datum ohne Zeit - speichere Datum ohne spezifische Zeit
      const dateParts = dateString.split('.')
      if (dateParts.length === 3 && dateParts[2].length === 4) {
        const [day, month, year] = dateParts
        const dateOnly = new Date(year, month - 1, day)
        if (!isNaN(dateOnly.getTime())) {
          onChange && onChange(dateOnly.toISOString())
        }
      }
    }
    
    if (!isDesktop) {
      setIsClosing(true);
      setTimeout(() => {
        setOpen(false);
        setIsClosing(false);
      }, 200); // Animation duration
    } else {
      if(openNext) onFinish()
      setOpen(false);
    }
  };

  const handleDateSelect = (selectedDate) => {
    if (selectedDate) {
      const newDateTime = new Date(selectedDate)
      
      if (time && time.trim()) {
        // Wenn Zeit vorhanden ist, verwende sie
        const [hours, minutes] = time.split(':')
        const hourInt = parseInt(hours, 10) || 0
        const minuteInt = parseInt(minutes, 10) || 0
        newDateTime.setHours(hourInt, minuteInt, 0, 0)
      } else {
        // Wenn keine Zeit vorhanden ist, setze auf Mitternacht aber zeige keine Zeit an
        newDateTime.setHours(0, 0, 0, 0)
      }
      
      setDate(newDateTime)
      setDateString(format(newDateTime, "dd.MM.yyyy")) // This will sync the input

      // Format as UTC ISO string
      onChange && onChange(newDateTime.toISOString())
    }
  }

  const handleTimeChange = (e) => {
    let value = e.target.value.replace(/\D/g, '') // Remove non-digits

    // Auto-format with colon
    if (value.length >= 2) {
      value = value.substring(0, 2) + ':' + value.substring(2, 4)
    }

    setTime(value)

    // Wenn Zeit gelöscht wird, speichere nur das Datum
    if (date && !value.trim()) {
      const dateOnly = new Date(date)
      dateOnly.setHours(0, 0, 0, 0) // Reset time to midnight
      setDate(dateOnly)
      onChange && onChange(dateOnly.toISOString())
      return
    }

    if (date && value.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = value.split(':')
      const hourInt = parseInt(hours, 10)
      const minuteInt = parseInt(minutes, 10)

      // Validate time values
      if (hourInt >= 0 && hourInt <= 23 && minuteInt >= 0 && minuteInt <= 59) {
        const newDateTime = new Date(date)
        newDateTime.setHours(hourInt, minuteInt, 0, 0) // Set seconds and milliseconds to 0
        setDate(newDateTime)

        // Format as UTC ISO string
        onChange && onChange(newDateTime.toISOString())
      }
    }
  }

  const handleSelectAll = (e) => {
    // Use setTimeout to ensure the selection happens after the focus event
    setTimeout(() => {
      e.target.select()
    }, 0)
  }

  const handleDateInputChange = (e) => {
    let value = e.target.value.replace(/\D/g, '') // Remove non-digits

    // Auto-format with dots
    if (value.length >= 2) {
      value = value.substring(0, 2) + '.' + value.substring(2)
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '.' + value.substring(5, 9)
    }

    setDateString(value)

    // Wenn Datum gelöscht wird, lösche auch das date state
    if (!value.trim()) {
      setDate(undefined)
      onChange && onChange(null)
      return
    }

    // Try to parse the date if it's in valid format
    const dateParts = value.split('.')
    if (dateParts.length === 3 && dateParts[2].length === 4) {
      const [day, month, year] = dateParts
      const parsedDate = new Date(year, month - 1, day)

      if (!isNaN(parsedDate.getTime()) && day <= 31 && month <= 12) {
        if (time && time.trim()) {
          // Wenn Zeit vorhanden ist, verwende sie
          const [hours, minutes] = time.split(':')
          const hourInt = parseInt(hours, 10) || 0
          const minuteInt = parseInt(minutes, 10) || 0
          parsedDate.setHours(hourInt, minuteInt, 0, 0)
        } else {
          // Wenn keine Zeit vorhanden ist, setze auf Mitternacht
          parsedDate.setHours(0, 0, 0, 0)
        }
        
        setDate(parsedDate) // This will sync the calendar
        // Format as UTC ISO string
        onChange && onChange(parsedDate.toISOString())

        // Automatisch zur Uhrzeit springen, wenn Datum vollständig eingegeben wurde
        setTimeout(() => {
          if (isDesktop && timeInputRef.current) {
            timeInputRef.current.focus()
            timeInputRef.current.select()
          } else if (!isDesktop && mobileTimeInputRef.current) {
            mobileTimeInputRef.current.focus()
            mobileTimeInputRef.current.select()
          }
        }, 50)
      }
    }
  }

  const displayText = date
    ? time.trim()
      ? startDate && isSameDay(new Date(startDate), date)
        ? `${format(date, "HH:mm")}`  // Nur Zeit wenn gleicher Tag
        : `${format(date, "EEE dd MMM HH:mm", { locale: de })}`  // Volles Format mit Zeit
      : `${format(date, "EEE dd MMM", { locale: de })}`  // Nur Datum ohne Zeit
    : placeholder

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <Button
        variant="ghost"
        className={cn(
          "justify-start text-left font-normal p-0 h-auto text-base placeholder:text-base hover:bg-transparent",
          "text-gray-opacity-40 hover:text-gray-opacity-60 placeholder:text-gray-opacity-40 placeholder:hover:text-gray-opacity-60",
          (displayText == placeholder) && "underline"
        )}
        disabled
      >
        {displayText}
      </Button>
    )
  }

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Wenn Popover geschlossen wird, rufe handleClose auf
          handleClose()
        } else {
          setOpen(isOpen)
        }
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "justify-start text-left font-normal p-0 h-auto text-base placeholder:text-base hover:bg-transparent",
              "text-gray-opacity-40 hover:text-gray-opacity-60 placeholder:text-gray-opacity-40 placeholder:hover:text-gray-opacity-60",
              (displayText == placeholder) && "underline",
              open && "text-black! placeholder:text-black!"
            )}
          >
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-white rounded-px-24 shadow-layered w-[320px] outline-1 outline-gray-opacity-6 p-0" align="start" sideOffset={8} alignOffset={-18}>
          <div className="p-4">
            {/* Datum und Uhrzeit Inputs oben */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <div className="bg-gray-opacity-3 rounded-px-8 flex items-center justify-center">
                  <Input
                    type="text"
                    placeholder="22.08.2025"
                    value={dateString}
                    onChange={handleDateInputChange}
                    onFocus={handleSelectAll}
                    onClick={handleSelectAll}
                    className="text-left font-medium h-9 w-20 px-0 bg-transparent border-none placeholder:text-gray-opacity-30"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-opacity-3 rounded-px-8 flex items-center justify-center">
                  <Input
                    ref={timeInputRef}
                    type="text"
                    placeholder={startDate ? "19:00" : "18:00"}
                    value={time}
                    onChange={handleTimeChange}
                    onFocus={handleSelectAll}
                    onClick={handleSelectAll}
                    className="text-left font-medium h-9 w-10 px-0 bg-transparent border-none placeholder:text-gray-opacity-30"
                  />
                </div>
              </div>
            </div>

            {/* Kalender */}
            <div className="w-full flex items-center justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                weekStartsOn={1}
                locale={de}
                initialFocus
                className=""
              />
            </div>

            {/* Fertig Button */}
            <div className="mt-2 flex justify-center">
              <PrimaryButton onClick={() =>handleClose(true)} type="button" className="h-9 w-full font-semibold text-xs">
                <span>Fertig</span>
              </PrimaryButton>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="relative">
      <div
        className="inline-flex p-0 h-auto rounded-px-8 bg-gray-opacity-3 px-2 py-1 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <span className={cn(
          "text-sm sm:text-xs text-gray-opacity-50 font-medium",
        )}>{displayText}</span>
      </div>

      {/* Mobile DateTime Modal - Mit Animationen */}
      {open && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{
            touchAction: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Backdrop mit Animation */}
          <div
            className={`absolute inset-0 bg-black/40 duration-200 ${isClosing ? 'opacity-0' : 'animate-in fade-in'
              }`}
            onClick={handleClose}
          />

          {/* Modal Container - Mit Scale Animation */}
          <div
            className={`bg-white rounded-px-24 shadow-layered outline-1 outline-gray-opacity-6 w-full max-w-sm relative z-10 ${isClosing
                ? 'transition-all duration-200 ease-out scale-95 opacity-0 translate-y-2'
                : 'animate-in zoom-in-95 slide-in-from-bottom-2 duration-200'
              }`}
            style={{
              transform: 'translateZ(0)', // Hardware-Beschleunigung
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {/* Datum und Uhrzeit Inputs oben */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <div className="bg-gray-opacity-3 rounded-px-8 flex items-center justify-center">
                  <Input
                    type="tel"
                    placeholder="22.08.2025"
                    value={dateString}
                    onChange={handleDateInputChange}
                    onFocus={handleSelectAll}
                    onClick={handleSelectAll}
                    className="text-left text-base font-medium h-9 w-24 px-0 bg-transparent border-none placeholder:text-base placeholder:text-gray-opacity-30"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-opacity-3 rounded-px-8 flex items-center justify-center">
                  <Input
                    ref={mobileTimeInputRef}
                    type="tel"
                    placeholder={startDate ? "19:00" : "18:00"}
                    value={time}
                    onChange={handleTimeChange}
                    onFocus={handleSelectAll}
                    onClick={handleSelectAll}
                    className="text-left text-base font-medium h-9 w-12 px-0 bg-transparent border-none placeholder:text-base placeholder:text-gray-opacity-30"
                  />
                </div>
              </div>
            </div>


              {/* Kalender */}
              <div className="w-full flex items-center justify-center mb-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  month={displayMonth}
                  onMonthChange={setDisplayMonth}
                  weekStartsOn={1}
                  locale={de}
                  initialFocus
                  className=""
                />
              </div>

              {/* Fertig Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleClose}
                  type="button"
                  className="rounded-px-10 flex items-center gap-1 text-sm font-medium h-10 px-6 shadow-layered w-full bg-secondary text-white hover:bg-secondary/90"
                >
                  <span>Fertig</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

} 