// src/app/admin/settings/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Save, Eye, EyeOff } from "lucide-react"

export default function AdminSettings() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-muted-foreground">
            Configure your PrintFrame store
          </p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Store name, description, and contact info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" defaultValue="PrintFrame" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeDescription">Store Description</Label>
              <Input id="storeDescription" defaultValue="Premium custom photo frames for your memories" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeEmail">Contact Email</Label>
              <Input id="storeEmail" type="email" defaultValue="support@printframe.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storePhone">Phone Number</Label>
              <Input id="storePhone" type="tel" defaultValue="+1 (555) 000-0000" />
            </div>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Shipping Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Settings</CardTitle>
            <CardDescription>Configure shipping rates and methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="standardShipping">Standard Shipping Rate ($)</Label>
              <Input id="standardShipping" type="number" defaultValue="5.99" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expressShipping">Express Shipping Rate ($)</Label>
              <Input id="expressShipping" type="number" defaultValue="12.99" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rushShipping">Rush Shipping Rate ($)</Label>
              <Input id="rushShipping" type="number" defaultValue="24.99" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
              <Input id="freeShippingThreshold" type="number" defaultValue="50.00" step="0.01" />
            </div>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Shipping Settings
            </Button>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Configure payment gateways</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Stripe</p>
                <p className="text-sm text-muted-foreground">Credit cards, Apple Pay, Google Pay</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">PayPal</p>
                <p className="text-sm text-muted-foreground">Pay with PayPal account</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Discount Codes */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Codes</CardTitle>
            <CardDescription>Manage promotional codes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">SAVE10</p>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">10% off any order</p>
                <p className="text-xs text-muted-foreground mt-2">Active</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">SAVE20</p>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">20% off any order</p>
                <p className="text-xs text-muted-foreground mt-2">Active</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">WELCOME</p>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">15% off first order</p>
                <p className="text-xs text-muted-foreground mt-2">Active</p>
              </div>
            </div>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Add New Discount Code
            </Button>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>Configure email notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Order Confirmations</p>
                <p className="text-sm text-muted-foreground">Send to customers when order is placed</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Shipping Notifications</p>
                <p className="text-sm text-muted-foreground">Send when order is shipped</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Email Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
