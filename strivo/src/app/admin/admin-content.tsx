'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { clientStorage } from '@/lib/client-storage'
import type { Customer, Booking, Table } from '@/lib/client-storage'

interface AdminContentProps {
  onLogout: () => void
}

interface BookingWithDetails extends Booking {
  customer?: Customer
  table?: Table
}

interface CustomerWithBookings extends Customer {
  bookings?: BookingWithDetails[]
}

export default function AdminContent({ onLogout }: AdminContentProps) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [customers, setCustomers] = useState<CustomerWithBookings[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithBookings | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bookingsData, customersData] = await Promise.all([
        clientStorage.getBookings(),
        clientStorage.getCustomers()
      ])

      // Add customer and table information to bookings
      const bookingsWithDetails: BookingWithDetails[] = await Promise.all(
        bookingsData.map(async (booking) => {
          const customer = await clientStorage.getCustomerById(booking.customerId)
          const table = await clientStorage.getTableById(booking.tableId)
          return {
            ...booking,
            customer: customer || undefined,
            table: table || undefined
          }
        })
      )

      // Add booking information to customers
      const customersWithBookings: CustomerWithBookings[] = await Promise.all(
        customersData.map(async (customer) => {
          const customerBookings = bookingsData.filter(b => b.customerId === customer.id)
          const bookingsWithDetails = await Promise.all(
            customerBookings.map(async (booking) => {
              const table = await clientStorage.getTableById(booking.tableId)
              return {
                ...booking,
                table: table || undefined
              }
            })
          )
          return {
            ...customer,
            bookings: bookingsWithDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          }
        })
      )

      setBookings(bookingsWithDetails)
      setCustomers(customersWithBookings)
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
      await clientStorage.updateBooking(bookingId, { status: status as any })
      await fetchData()
      toast({
        title: "Success",
        description: `Booking status updated to ${status}`,
      })
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
      await clientStorage.deleteBooking(bookingId)
      await fetchData()
      toast({
        title: "Success",
        description: "Booking deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive"
      })
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.table?.number.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage bookings and customers</p>
        </div>
        <Button onClick={onLogout} variant="outline">
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'PENDING').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'CONFIRMED').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by customer name, email, or table number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>Manage all table reservations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Table</th>
                  <th className="text-left p-2">Date & Time</th>
                  <th className="text-left p-2">Party Size</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{booking.customer?.name}</div>
                        <div className="text-sm text-gray-600">{booking.customer?.email}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">Table {booking.table?.number}</div>
                      <div className="text-sm text-gray-600">{booking.table?.location}</div>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">{formatDate(booking.date)}</div>
                    </td>
                    <td className="p-2">{booking.partySize} people</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Dialog open={isEditDialogOpen && selectedBooking?.id === booking.id} onOpenChange={(open) => {
                          setIsEditDialogOpen(open)
                          if (open) setSelectedBooking(booking)
                          else setSelectedBooking(null)
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">Edit</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Booking</DialogTitle>
                              <DialogDescription>
                                Update booking status and details
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="status">Status</Label>
                                <Select 
                                  value={selectedBooking?.status} 
                                  onValueChange={(value) => selectedBooking && updateBookingStatus(selectedBooking.id, value)}
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
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteBooking(booking.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>View customer information and booking history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Total Bookings</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{customer.name}</td>
                    <td className="p-2">{customer.email}</td>
                    <td className="p-2">{customer.phone || 'N/A'}</td>
                    <td className="p-2">{customer.bookings?.length || 0}</td>
                    <td className="p-2">
                      <Dialog open={isCustomerDialogOpen && selectedCustomer?.id === customer.id} onOpenChange={(open) => {
                        setIsCustomerDialogOpen(open)
                        if (open) setSelectedCustomer(customer)
                        else setSelectedCustomer(null)
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">View Details</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Customer Details</DialogTitle>
                            <DialogDescription>
                              Customer information and booking history
                            </DialogDescription>
                          </DialogHeader>
                          {selectedCustomer && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Name</Label>
                                  <div className="font-medium">{selectedCustomer.name}</div>
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <div className="font-medium">{selectedCustomer.email}</div>
                                </div>
                                <div>
                                  <Label>Phone</Label>
                                  <div className="font-medium">{selectedCustomer.phone || 'N/A'}</div>
                                </div>
                                <div>
                                  <Label>Total Bookings</Label>
                                  <div className="font-medium">{selectedCustomer.bookings?.length || 0}</div>
                                </div>
                              </div>
                              
                              {selectedCustomer.bookings && selectedCustomer.bookings.length > 0 && (
                                <div>
                                  <Label>Booking History</Label>
                                  <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {selectedCustomer.bookings.map((booking) => (
                                      <div key={booking.id} className="border rounded p-2">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="font-medium">Table {booking.table?.number}</div>
                                            <div className="text-sm text-gray-600">{formatDate(booking.date)}</div>
                                          </div>
                                          <Badge className={getStatusColor(booking.status)}>
                                            {booking.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 