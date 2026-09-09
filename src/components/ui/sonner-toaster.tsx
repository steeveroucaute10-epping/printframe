"use client"

import * as React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "white",
          border: "1px solid #e5e7eb",
        },
      }}
      {...props}
    />
  )
}
