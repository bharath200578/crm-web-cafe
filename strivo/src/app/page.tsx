"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { TableSelection } from "@/components/table-selection"
import { format } from "date-fns"
import { CalendarDays, Clock, Users, MapPin, Phone, Mail, Table as TableIcon } from "lucide-react"

interface Table {
  id: string
  number: number
  capacity: number
  location: string
  description: string
  isActive: boolean
}

export default function Home() {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>()
  const [partySize, setPartySize] = useState<number>(2)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingId, setBookingId] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  
  const { toast } = useToast()

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
    "21:00", "21:30"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !time || !selectedTable || !customerName || !customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a table.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Combine date and time
      const bookingDateTime = new Date(date)
      const [hours, minutes] = time.split(':')
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes))

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          date: bookingDateTime.toISOString(),
          partySize,
          tableId: selectedTable.id,
          specialRequests,
        }),
      })

      if (!response.ok) {
        throw new Error('Booking failed')
      }

      const data = await response.json()
      setBookingId(data.bookingId)
      setBookingSuccess(true)
      
      toast({
        title: "Booking Confirmed!",
        description: `Table ${selectedTable.number} has been reserved successfully.`,
      })
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Please try again or call us directly.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setDate(undefined)
    setTime(undefined)
    setPartySize(2)
    setSelectedTable(null)
    setCustomerName("")
    setCustomerEmail("")
    setCustomerPhone("")
    setSpecialRequests("")
    setBookingSuccess(false)
    setBookingId("")
    setCurrentStep(1)
  }

  const nextStep = () => {
    if (currentStep === 1 && !date) {
      toast({
        title: "Select Date",
        description: "Please select a date first.",
        variant: "destructive"
      })
      return
    }
    if (currentStep === 2 && !time) {
      toast({
        title: "Select Time",
        description: "Please select a time first.",
        variant: "destructive"
      })
      return
    }
    if (currentStep === 3 && !selectedTable) {
      toast({
        title: "Select Table",
        description: "Please select a table first.",
        variant: "destructive"
      })
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your table has been successfully reserved
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700 mb-2">Booking Reference:</p>
              <p className="font-mono text-lg font-bold text-green-800">{bookingId}</p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <span>{date && format(date, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{time}</span>
              </div>
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-gray-500" />
                <span>Table {selectedTable?.number} ({selectedTable?.location})</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{partySize} {partySize === 1 ? 'person' : 'people'}</span>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button onClick={resetForm} className="w-full">
                Make Another Booking
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(bookingId)
                  toast({
                    title: "Copied!",
                    description: "Booking reference copied to clipboard",
                  })
                }}
              >
                Copy Reference
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <div className="ml-2 text-sm font-medium">
                  {step === 1 && 'Date'}
                  {step === 2 && 'Time'}
                  {step === 3 && 'Table'}
                  {step === 4 && 'Details'}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-4 ${currentStep > step ? 'bg-amber-600' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Select Date</CardTitle>
                  <CardDescription>
                    Choose when you'd like to dine with us
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                      className="rounded-md border w-full"
                    />
                    <div className="flex justify-between">
                      <Button variant="outline" disabled>
                        Previous
                      </Button>
                      <Button onClick={nextStep} disabled={!date}>
                        Next: Select Time
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Select Time</CardTitle>
                  <CardDescription>
                    Choose your preferred dining time for {date && format(date, 'MMMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          variant={time === slot ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTime(slot)}
                          className="text-sm"
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={prevStep}>
                        Previous
                      </Button>
                      <Button onClick={nextStep} disabled={!time}>
                        Next: Select Table
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <TableSelection
                selectedDate={date}
                selectedTime={time}
                partySize={partySize}
                onTableSelect={setSelectedTable}
                selectedTable={selectedTable}
                onNext={nextStep}
                onPrevious={prevStep}
              />
            )}

            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Guest Information</CardTitle>
                  <CardDescription>
                    Please provide your contact details to complete the booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Booking Summary */}
                    <Card className="bg-amber-50 border-amber-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Booking Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Date:</span> {date && format(date, 'MMMM d, yyyy')}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {time}
                          </div>
                          <div>
                            <span className="font-medium">Table:</span> {selectedTable?.number} ({selectedTable?.location})
                          </div>
                          <div>
                            <span className="font-medium">Guests:</span> {partySize}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Contact Information</h3>
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div className="space-y-2">
                      <Label htmlFor="requests">Special Requests</Label>
                      <Textarea
                        id="requests"
                        placeholder="Any dietary restrictions, celebrations, or special requests..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Previous
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || !customerName || !customerEmail}
                      >
                        {isSubmitting ? "Reserving Table..." : "Confirm Booking"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Your Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="font-medium">
                    {date ? format(date, 'MMM d, yyyy') : 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time</span>
                  <span className="font-medium">
                    {time || 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Guests</span>
                  <span className="font-medium">{partySize} people</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Table</span>
                  <span className="font-medium">
                    {selectedTable ? `Table ${selectedTable.number}` : 'Not selected'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Party Size */}
            <Card>
              <CardHeader>
                <CardTitle>Number of Guests</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={partySize.toString()} onValueChange={(value) => setPartySize(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} {size === 1 ? 'person' : 'people'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Cafe Info */}
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Cafe Delight</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Experience culinary excellence in a warm, inviting atmosphere
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>9AM - 10PM Daily</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>123 Main St</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <span>(555) 123-4567</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}