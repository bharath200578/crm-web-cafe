"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  LogOut
} from "lucide-react"

interface AdminContentProps {
  onLogout: () => void
}

interface Booking {
  id: string
  date: string
  duration: number
  partySize: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  specialRequests: string | null
  customer: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  table: {
    id: string
    number: number
    capacity: number
    location: string
  }
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  bookings: Booking[]
  createdAt: string
}

export default function AdminContent({ onLogout }: AdminContentProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bookingsResponse, customersResponse] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/customers')
      ])

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData.bookings || [])
      }

      if (customersResponse.ok) {
        const customersData = await customersResponse.json()
        setCustomers(customersData.customers || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchData()
        toast({
          title: "Success",
          description: `Booking status updated to ${status}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      })
    }
  }

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
        toast({
          title: "Success",
          description: "Booking deleted successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive"
      })
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.table.number.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const todaysBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date)
    const today = new Date()
    return bookingDate.toDateString() === today.toDateString()
  })

  // Calculate total revenue in Indian Rupees (₹2000 per person)
  const totalRevenue = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, booking) => sum + (booking.partySize * 2000), 0) // ₹2000 per person

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-600">Cafe Delight Management</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Back to Booking
                </Button>
                <Button variant="outline" onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todaysBookings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {todaysBookings.filter(b => b.status === 'CONFIRMED').length} confirmed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {customers.length} unique customers
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    From completed bookings (₹2000 per person)
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'COMPLETED').length / bookings.length) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Bookings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>
                  Manage all restaurant bookings and reservations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="NO_SHOW">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bookings Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Party Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{booking.customer.name}</div>
                              <div className="text-sm text-gray-500">{booking.customer.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {format(new Date(booking.date), 'MMM d, yyyy')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(booking.date), 'h:mm a')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">Table {booking.table.number}</div>
                              <div className="text-sm text-gray-500">
                                {booking.table.location} ({booking.table.capacity} seats)
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {booking.partySize}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              {booking.status === 'PENDING' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              
                              {booking.status !== 'CANCELLED' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteBooking(booking.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update booking details and status
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={selectedBooking.status} 
                  onValueChange={(value) => updateBookingStatus(selectedBooking.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Input 
                  id="customer" 
                  value={selectedBooking.customer.name} 
                  disabled 
                />
              </div>
              
              <div>
                <Label htmlFor="table">Table</Label>
                <Input 
                  id="table" 
                  value={`Table ${selectedBooking.table.number} (${selectedBooking.table.location})`} 
                  disabled 
                />
              </div>
              
              <div>
                <Label htmlFor="datetime">Date & Time</Label>
                <Input 
                  id="datetime" 
                  value={format(new Date(selectedBooking.date), 'MMM d, yyyy h:mm a')} 
                  disabled 
                />
              </div>
              
              <div>
                <Label htmlFor="partySize">Party Size</Label>
                <Input 
                  id="partySize" 
                  value={selectedBooking.partySize.toString()} 
                  disabled 
                />
              </div>
              
              {selectedBooking.specialRequests && (
                <div>
                  <Label htmlFor="requests">Special Requests</Label>
                  <Textarea 
                    id="requests" 
                    value={selectedBooking.specialRequests} 
                    disabled 
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 