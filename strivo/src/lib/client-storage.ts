// Client-side storage service for static export
export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface Table {
  id: string
  number: number
  capacity: number
  location?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  customerId: string
  tableId: string
  date: string
  duration: number
  partySize: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  specialRequests?: string
  createdAt: string
  updatedAt: string
  customer?: Customer
  table?: Table
}

export interface CafeSettings {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  openingHours?: string
  maxPartySize: number
  minPartySize: number
  bookingDuration: number
  timeSlots?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

class ClientStorageDB {
  private getStorageKey(key: string): string {
    return `cafe_${key}`
  }

  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getTimestamp(): string {
    return new Date().toISOString()
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    try {
      const customers = localStorage.getItem(this.getStorageKey('customers'))
      return customers ? JSON.parse(customers) : []
    } catch (error) {
      console.error('Error getting customers:', error)
      return []
    }
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const customers = await this.getCustomers()
    return customers.find(c => c.id === id) || null
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    const customers = await this.getCustomers()
    return customers.find(c => c.email === email) || null
  }

  async createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const customers = await this.getCustomers()
    const newCustomer: Customer = {
      ...data,
      id: this.generateId(),
      createdAt: this.getTimestamp(),
      updatedAt: this.getTimestamp(),
    }
    
    customers.push(newCustomer)
    localStorage.setItem(this.getStorageKey('customers'), JSON.stringify(customers))
    return newCustomer
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
    const customers = await this.getCustomers()
    const index = customers.findIndex(c => c.id === id)
    
    if (index === -1) return null
    
    customers[index] = {
      ...customers[index],
      ...data,
      updatedAt: this.getTimestamp(),
    }
    
    localStorage.setItem(this.getStorageKey('customers'), JSON.stringify(customers))
    return customers[index]
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const customers = await this.getCustomers()
    const filteredCustomers = customers.filter(c => c.id !== id)
    
    if (filteredCustomers.length === customers.length) return false
    
    localStorage.setItem(this.getStorageKey('customers'), JSON.stringify(filteredCustomers))
    return true
  }

  // Table operations
  async getTables(): Promise<Table[]> {
    try {
      const tables = localStorage.getItem(this.getStorageKey('tables'))
      return tables ? JSON.parse(tables) : []
    } catch (error) {
      console.error('Error getting tables:', error)
      return []
    }
  }

  async getTableById(id: string): Promise<Table | null> {
    const tables = await this.getTables()
    return tables.find(t => t.id === id) || null
  }

  async createTable(data: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>): Promise<Table> {
    const tables = await this.getTables()
    const newTable: Table = {
      ...data,
      id: this.generateId(),
      createdAt: this.getTimestamp(),
      updatedAt: this.getTimestamp(),
    }
    
    tables.push(newTable)
    localStorage.setItem(this.getStorageKey('tables'), JSON.stringify(tables))
    return newTable
  }

  async updateTable(id: string, data: Partial<Table>): Promise<Table | null> {
    const tables = await this.getTables()
    const index = tables.findIndex(t => t.id === id)
    
    if (index === -1) return null
    
    tables[index] = {
      ...tables[index],
      ...data,
      updatedAt: this.getTimestamp(),
    }
    
    localStorage.setItem(this.getStorageKey('tables'), JSON.stringify(tables))
    return tables[index]
  }

  // Booking operations
  async getBookings(): Promise<Booking[]> {
    try {
      const bookings = localStorage.getItem(this.getStorageKey('bookings'))
      return bookings ? JSON.parse(bookings) : []
    } catch (error) {
      console.error('Error getting bookings:', error)
      return []
    }
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const bookings = await this.getBookings()
    return bookings.find(b => b.id === id) || null
  }

  async getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    const bookings = await this.getBookings()
    return bookings.filter(b => {
      const bookingDate = new Date(b.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return bookingDate >= start && bookingDate <= end
    })
  }

  async getBookingsByCustomerEmail(email: string): Promise<Booking[]> {
    const bookings = await this.getBookings()
    const customers = await this.getCustomers()
    const customer = customers.find(c => c.email === email)
    
    if (!customer) return []
    
    return bookings.filter(b => b.customerId === customer.id)
  }

  async createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const bookings = await this.getBookings()
    const newBooking: Booking = {
      ...data,
      id: this.generateId(),
      createdAt: this.getTimestamp(),
      updatedAt: this.getTimestamp(),
    }
    
    bookings.push(newBooking)
    localStorage.setItem(this.getStorageKey('bookings'), JSON.stringify(bookings))
    return newBooking
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking | null> {
    const bookings = await this.getBookings()
    const index = bookings.findIndex(b => b.id === id)
    
    if (index === -1) return null
    
    bookings[index] = {
      ...bookings[index],
      ...data,
      updatedAt: this.getTimestamp(),
    }
    
    localStorage.setItem(this.getStorageKey('bookings'), JSON.stringify(bookings))
    return bookings[index]
  }

  async deleteBooking(id: string): Promise<boolean> {
    const bookings = await this.getBookings()
    const filteredBookings = bookings.filter(b => b.id !== id)
    
    if (filteredBookings.length === bookings.length) return false
    
    localStorage.setItem(this.getStorageKey('bookings'), JSON.stringify(filteredBookings))
    return true
  }

  // Cafe settings operations
  async getCafeSettings(): Promise<CafeSettings | null> {
    try {
      const settings = localStorage.getItem(this.getStorageKey('settings'))
      return settings ? JSON.parse(settings) : null
    } catch (error) {
      console.error('Error getting cafe settings:', error)
      return null
    }
  }

  async createCafeSettings(data: Omit<CafeSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<CafeSettings> {
    const newSettings: CafeSettings = {
      ...data,
      id: this.generateId(),
      createdAt: this.getTimestamp(),
      updatedAt: this.getTimestamp(),
    }
    
    localStorage.setItem(this.getStorageKey('settings'), JSON.stringify(newSettings))
    return newSettings
  }

  async updateCafeSettings(data: Partial<CafeSettings>): Promise<CafeSettings | null> {
    const settings = await this.getCafeSettings()
    
    if (!settings) return null
    
    const updatedSettings: CafeSettings = {
      ...settings,
      ...data,
      updatedAt: this.getTimestamp(),
    }
    
    localStorage.setItem(this.getStorageKey('settings'), JSON.stringify(updatedSettings))
    return updatedSettings
  }

  // Initialize with sample data
  async initialize(): Promise<void> {
    const settings = await this.getCafeSettings()
    if (!settings) {
      await this.createCafeSettings({
        name: 'Cafe Delight',
        description: 'Fine dining experience with locally-sourced ingredients',
        address: '123 Main Street, Downtown',
        phone: '(555) 123-4567',
        email: 'info@cafedelight.com',
        openingHours: JSON.stringify({
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '23:00' },
          saturday: { open: '09:00', close: '23:00' },
          sunday: { open: '09:00', close: '21:00' },
        }),
        maxPartySize: 10,
        minPartySize: 1,
        bookingDuration: 120,
        timeSlots: JSON.stringify([
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
          '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
          '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
          '21:00', '21:30'
        ]),
        isActive: true,
      })
    }

    const tables = await this.getTables()
    if (tables.length === 0) {
      const sampleTables = [
        { number: 1, capacity: 2, location: 'Window', description: 'Cozy table by the window with natural light', isActive: true },
        { number: 2, capacity: 2, location: 'Window', description: 'Intimate window seating for two', isActive: true },
        { number: 3, capacity: 4, location: 'Center', description: 'Spacious table in the main dining area', isActive: true },
        { number: 4, capacity: 4, location: 'Center', description: 'Comfortable seating for small groups', isActive: true },
        { number: 5, capacity: 6, location: 'Corner', description: 'Large corner table perfect for groups', isActive: true },
        { number: 6, capacity: 8, location: 'Private', description: 'Semi-private dining area for larger parties', isActive: true },
        { number: 7, capacity: 2, location: 'Patio', description: 'Outdoor seating with garden view', isActive: true },
        { number: 8, capacity: 4, location: 'Patio', description: 'Spacious outdoor dining table', isActive: true },
      ]

      for (const tableData of sampleTables) {
        await this.createTable(tableData)
      }
    }
  }

  // Clear all data (for testing/reset)
  async clearAll(): Promise<void> {
    const keys = ['customers', 'tables', 'bookings', 'settings']
    keys.forEach(key => {
      localStorage.removeItem(this.getStorageKey(key))
    })
  }
}

export const clientStorage = new ClientStorageDB()
