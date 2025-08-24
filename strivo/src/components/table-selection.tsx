"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { clientStorage } from '@/lib/client-storage'
import type { Table, Booking } from '@/lib/client-storage'

interface TableSelectionProps {
  selectedDate: Date | undefined
  selectedTime: string | undefined
  partySize: number
  onTableSelect: (table: Table) => void
  selectedTable: Table | null
  onNext: () => void
  onPrevious: () => void
}

export function TableSelection({ selectedDate, selectedTime, partySize, onTableSelect, selectedTable, onNext, onPrevious }: TableSelectionProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredTable, setHoveredTable] = useState<Table | null>(null)
  const [showTableDetails, setShowTableDetails] = useState<Table | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    if (selectedDate && selectedTime) {
      fetchTablesAndBookings()
    }
  }, [selectedDate, selectedTime])

  const fetchTablesAndBookings = async () => {
    try {
      setLoading(true)
      
      // Fetch tables
      const tablesData = await clientStorage.getTables()
      setTables(tablesData)

      // Fetch bookings for the selected date
      if (selectedDate) {
        const startOfDay = new Date(selectedDate)
        startOfDay.setHours(0, 0, 0, 0)
        
        const endOfDay = new Date(selectedDate)
        endOfDay.setHours(23, 59, 59, 999)

        const bookingsData = await clientStorage.getBookingsByDateRange(startOfDay.toISOString(), endOfDay.toISOString())
        setBookings(bookingsData)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tables and bookings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const isTableAvailable = (table: Table) => {
    if (!selectedDate || !selectedTime) return false
    
    // Check if table capacity is sufficient
    if (table.capacity < partySize) return false
    
    // Check if table is active
    if (!table.isActive) return false
    
    // Check for conflicting bookings
    const bookingDateTime = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(':')
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes))
    
    const bookingEndTime = new Date(bookingDateTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours
    
    const conflictingBooking = bookings.find(booking => {
      if (booking.tableId !== table.id || !['PENDING', 'CONFIRMED'].includes(booking.status)) {
        return false
      }
      
      const bookingStart = new Date(booking.date)
      const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 1000)
      
      return (bookingDateTime < bookingEnd && bookingEndTime > bookingStart)
    })
    
    return !conflictingBooking
  }

  const getTableStatus = (table: Table) => {
    if (!isTableAvailable(table)) {
      return 'unavailable'
    }
    if (selectedTable?.id === table.id) {
      return 'selected'
    }
    return 'available'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'selected':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'selected':
        return 'Selected'
      case 'unavailable':
        return 'Unavailable'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading tables...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Your Table</h3>
        <p className="text-gray-600 mb-4">
          Choose from our available tables for {partySize} {partySize === 1 ? 'person' : 'people'} on {selectedDate?.toLocaleDateString()} at {selectedTime}
        </p>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables
          .filter(table => table.isActive)
          .sort((a, b) => a.number - b.number)
          .map((table) => {
            const status = getTableStatus(table)
            const isAvailable = status === 'available'
            const isSelected = status === 'selected'
            
            return (
              <Card
                key={table.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-amber-500' : ''
                } ${!isAvailable ? 'opacity-60' : ''}`}
                onClick={() => {
                  if (isAvailable) {
                    onTableSelect(table)
                  }
                }}
                onMouseEnter={() => setHoveredTable(table)}
                onMouseLeave={() => setHoveredTable(null)}
              >
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-gray-900">
                      Table {table.number}
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {getStatusText(status)}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
                    </div>
                    {table.location && (
                      <div className="text-xs text-gray-500">
                        {table.location}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>

      {/* Table Details */}
      {hoveredTable && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Table {hoveredTable.number} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Capacity:</strong> {hoveredTable.capacity} {hoveredTable.capacity === 1 ? 'person' : 'people'}</p>
              {hoveredTable.location && <p><strong>Location:</strong> {hoveredTable.location}</p>}
              {hoveredTable.description && <p><strong>Description:</strong> {hoveredTable.description}</p>}
              <p><strong>Status:</strong> {getStatusText(getTableStatus(hoveredTable))}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Table Summary */}
      {selectedTable && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">Selected Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Table:</strong> {selectedTable.number}</p>
              <p><strong>Capacity:</strong> {selectedTable.capacity} {selectedTable.capacity === 1 ? 'person' : 'people'}</p>
              {selectedTable.location && <p><strong>Location:</strong> {selectedTable.location}</p>}
              {selectedTable.description && <p><strong>Description:</strong> {selectedTable.description}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedTable}
          className="ml-auto"
        >
          Next: Customer Information
        </Button>
      </div>
    </div>
  )
}