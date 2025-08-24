"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Table as TableIcon, Users, MapPin, Clock, Star } from "lucide-react"

interface Table {
  id: string
  number: number
  capacity: number
  location: string
  description: string
  isActive: boolean
}

interface Booking {
  id: string
  date: string
  duration: number
  partySize: number
  status: string
  tableId: string
}

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
      const tablesResponse = await fetch('/api/tables')
      if (tablesResponse.ok) {
        const tablesData = await tablesResponse.json()
        setTables(tablesData.tables || [])
      }

      // Fetch bookings for the selected date
      if (selectedDate) {
        const startOfDay = new Date(selectedDate)
        startOfDay.setHours(0, 0, 0, 0)
        
        const endOfDay = new Date(selectedDate)
        endOfDay.setHours(23, 59, 59, 999)

        const bookingsResponse = await fetch(`/api/bookings?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`)
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setBookings(bookingsData.bookings || [])
        }
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
    
    const bookingDateTime = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(':')
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes))
    
    const bookingEndTime = new Date(bookingDateTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration

    // Check if table has capacity for the party size
    if (table.capacity < partySize) return false

    // Check if table is already booked for the selected time
    const conflictingBooking = bookings.find(booking => {
      if (booking.tableId !== table.id) return false
      
      const bookingStartTime = new Date(booking.date)
      const bookingEndTime = new Date(bookingStartTime.getTime() + booking.duration * 60 * 60 * 1000)
      
      return (
        (bookingDateTime >= bookingStartTime && bookingDateTime < bookingEndTime) ||
        (bookingEndTime > bookingStartTime && bookingEndTime <= bookingEndTime) ||
        (bookingDateTime <= bookingStartTime && bookingEndTime >= bookingEndTime)
      )
    })

    return !conflictingBooking
  }

  const getTableStatus = (table: Table) => {
    if (!table.isActive) return { status: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' }
    if (!selectedDate || !selectedTime) return { status: 'select-time', label: 'Select Time', color: 'bg-yellow-100 text-yellow-800' }
    if (table.capacity < partySize) return { status: 'too-small', label: 'Too Small', color: 'bg-red-100 text-red-800' }
    if (isTableAvailable(table)) return { status: 'available', label: 'Available', color: 'bg-green-100 text-green-800' }
    return { status: 'booked', label: 'Booked', color: 'bg-red-100 text-red-800' }
  }

  const getTablePosition = (tableNumber: number) => {
    // Simulate table positions in a restaurant layout
    const positions = [
      // Window tables (top row)
      { x: 10, y: 10 }, { x: 30, y: 10 }, { x: 50, y: 10 }, { x: 70, y: 10 },
      // Middle row
      { x: 10, y: 40 }, { x: 30, y: 40 }, { x: 50, y: 40 }, { x: 70, y: 40 },
      // Back row
      { x: 10, y: 70 }, { x: 30, y: 70 }, { x: 50, y: 70 }, { x: 70, y: 70 },
      // Corner tables
      { x: 85, y: 10 }, { x: 85, y: 40 }, { x: 85, y: 70 }
    ]
    
    return positions[tableNumber - 1] || { x: 50, y: 50 }
  }

  const groupedTables = {
    window: tables.filter(t => t.location.toLowerCase().includes('window')),
    center: tables.filter(t => t.location.toLowerCase().includes('center')),
    outdoor: tables.filter(t => t.location.toLowerCase().includes('outdoor')),
    private: tables.filter(t => t.location.toLowerCase().includes('private'))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Your Table</CardTitle>
          <CardDescription>Loading available tables...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TableIcon className="w-5 h-5" />
          Select Your Table
        </CardTitle>
        <CardDescription>
          Choose from our available tables for {selectedDate && selectedTime ? `${selectedDate.toLocaleDateString()} at ${selectedTime}` : 'your selected time'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge className="bg-green-100 text-green-800">Available</Badge>
          <Badge className="bg-red-100 text-red-800">Booked</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">Select Time</Badge>
          <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
          <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
        </div>

        {/* Restaurant Layout */}
        <div className="relative bg-amber-50 rounded-lg p-6 min-h-96 border-2 border-amber-200">
          {/* Restaurant areas */}
          <div className="absolute inset-4 border border-dashed border-amber-300 rounded">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-50 px-2 text-xs text-amber-600">
              Window Area
            </div>
          </div>
          
          <div className="absolute inset-8 border border-dashed border-amber-300 rounded">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-50 px-2 text-xs text-amber-600">
              Main Dining
            </div>
          </div>

          {/* Tables */}
          {tables.map((table) => {
            const position = getTablePosition(table.number)
            const tableStatus = getTableStatus(table)
            const isSelected = selectedTable?.id === table.id
            const isAvailable = tableStatus.status === 'available'
            
            return (
              <div
                key={table.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-pointer
                  ${isSelected ? 'z-20 scale-110' : 'z-10 hover:z-15 hover:scale-105'}
                  ${isAvailable ? 'hover:shadow-lg' : 'opacity-60'}
                `}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                onClick={() => isAvailable && onTableSelect(table)}
                onMouseEnter={() => setHoveredTable(table)}
                onMouseLeave={() => setHoveredTable(null)}
              >
                <div className={`
                  w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-medium
                  ${isSelected ? 'bg-blue-500 text-white border-blue-600' : 
                    tableStatus.color}
                  ${isAvailable ? 'hover:shadow-md border-2' : 'border-2'}
                `}>
                  <div className="font-bold">{table.number}</div>
                  <div className="text-xs">{table.capacity}</div>
                </div>
                
                {/* Table info popup */}
                {(hoveredTable?.id === table.id || isSelected) && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white border rounded-lg shadow-lg p-2 min-w-32 z-30">
                    <div className="text-xs font-medium">Table {table.number}</div>
                    <div className="text-xs text-gray-600">{table.location}</div>
                    <div className="text-xs text-gray-600">{table.capacity} seats</div>
                    <div className={`text-xs mt-1 ${tableStatus.color.replace('bg-', 'text-').replace('-100', '-800').replace('-200', '-900')}`}>
                      {tableStatus.label}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Table Groups */}
        <div className="space-y-4">
          {Object.entries(groupedTables).map(([location, locationTables]) => (
            locationTables.length > 0 && (
              <div key={location}>
                <h3 className="font-medium text-sm text-gray-700 mb-2 capitalize">{location} Tables</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {locationTables.map((table) => {
                    const tableStatus = getTableStatus(table)
                    const isSelected = selectedTable?.id === table.id
                    const isAvailable = tableStatus.status === 'available'
                    
                    return (
                      <Card
                        key={table.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 
                          isAvailable ? 'hover:shadow-md' : 'opacity-60'
                        }`}
                        onClick={() => isAvailable && onTableSelect(table)}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="font-bold text-lg">{table.number}</div>
                          <div className="text-xs text-gray-600">{table.capacity} seats</div>
                          <Badge className={`mt-1 text-xs ${tableStatus.color}`}>
                            {tableStatus.label}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">{table.location}</div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Selected Table Details */}
        {selectedTable && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                Selected Table {selectedTable.number}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-gray-600">{selectedTable.location}</div>
                </div>
                <div>
                  <div className="font-medium">Capacity</div>
                  <div className="text-gray-600">{selectedTable.capacity} seats</div>
                </div>
                <div>
                  <div className="font-medium">Status</div>
                  <div className="text-green-600">Available</div>
                </div>
                <div>
                  <div className="font-medium">Features</div>
                  <div className="text-gray-600">{selectedTable.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table Details Dialog */}
        <Dialog open={!!showTableDetails} onOpenChange={() => setShowTableDetails(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Table {showTableDetails?.number} Details</DialogTitle>
              <DialogDescription>
                Complete information about this table
              </DialogDescription>
            </DialogHeader>
            {showTableDetails && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Table Number</div>
                    <div className="font-medium">{showTableDetails.number}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Capacity</div>
                    <div className="font-medium">{showTableDetails.capacity} seats</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Location</div>
                    <div className="font-medium">{showTableDetails.location}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Status</div>
                    <div className="font-medium">{getTableStatus(showTableDetails).label}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Description</div>
                  <div className="text-sm text-gray-600">{showTableDetails.description}</div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    if (getTableStatus(showTableDetails).status === 'available') {
                      onTableSelect(showTableDetails)
                      setShowTableDetails(null)
                    }
                  }}
                  disabled={getTableStatus(showTableDetails).status !== 'available'}
                >
                  {getTableStatus(showTableDetails).status === 'available' ? 'Select This Table' : 'Not Available'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button onClick={onNext} disabled={!selectedTable}>
            Next: Guest Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}