"use client"

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { TableSelection } from '@/components/table-selection'
import { clientStorage } from '@/lib/client-storage'
import type { Table } from '@/lib/client-storage'

interface Booking {
  id: string
  customerId: string
  tableId: string
  date: string
  duration: number
  partySize: number
  status: string
  specialRequests?: string
  customer?: any
  table?: Table
}

export default function Home() {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>()
  const [partySize, setPartySize] = useState(2)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingId, setBookingId] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
    "21:00", "21:30"
  ]

  const { toast } = useToast()

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

      // Find or create customer
      let customer = await clientStorage.getCustomerByEmail(customerEmail)
      
      if (!customer) {
        customer = await clientStorage.createCustomer({
          name: customerName,
          email: customerEmail,
          phone: customerPhone || null,
        })
      }

      // Check for conflicting bookings
      const bookingEndTime = new Date(bookingDateTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours
      const allBookings = await clientStorage.getBookings()
      const conflictingBooking = allBookings.find(booking => {
        if (booking.tableId !== selectedTable.id || !['PENDING', 'CONFIRMED'].includes(booking.status)) {
          return false
        }
        
        const bookingStart = new Date(booking.date)
        const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 1000)
        
        return (bookingDateTime < bookingEnd && bookingEndTime > bookingStart)
      })

      if (conflictingBooking) {
        toast({
          title: "Booking Failed",
          description: "Selected table is already booked for the requested time.",
          variant: "destructive"
        })
        return
      }

      // Create the booking
      const booking = await clientStorage.createBooking({
        customerId: customer.id,
        tableId: selectedTable.id,
        date: bookingDateTime.toISOString(),
        duration: 120, // 2 hours
        partySize,
        status: 'PENDING',
        specialRequests: specialRequests || null,
      })

      setBookingId(booking.id)
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
        title: "Please Select Date",
        description: "Please select a date for your booking.",
        variant: "destructive"
      })
      return
    }
    if (currentStep === 2 && !time) {
      toast({
        title: "Please Select Time",
        description: "Please select a time for your booking.",
        variant: "destructive"
      })
      return
    }
    if (currentStep === 3 && !selectedTable) {
      toast({
        title: "Please Select Table",
        description: "Please select a table for your booking.",
        variant: "destructive"
      })
      return
    }
    setCurrentStep(currentStep + 1)
  }

  const previousStep = () => {
    setCurrentStep(currentStep - 1)
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl text-green-600">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your table has been successfully reserved. We look forward to serving you!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Booking Details:</h3>
              <p><strong>Booking ID:</strong> {bookingId}</p>
              <p><strong>Date:</strong> {date?.toLocaleDateString()}</p>
              <p><strong>Time:</strong> {time}</p>
              <p><strong>Table:</strong> {selectedTable?.number}</p>
              <p><strong>Party Size:</strong> {partySize}</p>
            </div>
            <Button onClick={resetForm} className="w-full">
              Make Another Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Cafe Delight
            </h1>
            <p className="text-xl text-gray-600">
              Book your perfect table for an unforgettable dining experience
            </p>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Table Reservation</CardTitle>
              <CardDescription>
                Step {currentStep} of 4: {currentStep === 1 && "Select Date"}
                {currentStep === 2 && "Select Time"}
                {currentStep === 3 && "Select Table"}
                {currentStep === 4 && "Customer Information"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Date Selection */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date">Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Time Selection */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="time">Select Time</Label>
                      <Select value={time} onValueChange={setTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 3: Table Selection */}
                {currentStep === 3 && (
                  <TableSelection
                    selectedDate={date}
                    selectedTime={time}
                    partySize={partySize}
                    onTableSelect={setSelectedTable}
                    selectedTable={selectedTable}
                    onNext={nextStep}
                    onPrevious={previousStep}
                  />
                )}

                {/* Step 4: Customer Information */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="partySize">Party Size</Label>
                      <Select value={partySize.toString()} onValueChange={(value) => setPartySize(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size} {size === 1 ? 'person' : 'people'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="specialRequests">Special Requests</Label>
                      <Textarea
                        id="specialRequests"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Any special requests or dietary requirements..."
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={previousStep}>
                      Previous
                    </Button>
                  )}
                  {currentStep < 4 ? (
                    <Button type="button" onClick={nextStep} className="ml-auto">
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting} className="ml-auto">
                      {isSubmitting ? "Confirming..." : "Confirm Booking"}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}