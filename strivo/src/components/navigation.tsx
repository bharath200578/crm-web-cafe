"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CalendarDays, Settings, Home } from "lucide-react"
import { useState, useEffect } from "react"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "Book Table",
      icon: Home,
    },
    {
      href: "/admin",
      label: "Admin Panel",
      icon: Settings,
    },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Cafe Delight</span>
          </Link>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2",
                      pathname === item.href
                        ? "bg-amber-600 text-white hover:bg-amber-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-amber-600 text-white hover:bg-amber-700"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}