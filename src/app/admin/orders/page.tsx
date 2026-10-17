// src/app/admin/orders/page.tsx
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Search, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { formatUsd } from "@/lib/commerce"

const PAGE_SIZE = 50

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const requestedPage = Number.parseInt((await searchParams).page || '1', 10)
  const page = Number.isFinite(requestedPage) ? Math.max(requestedPage, 1) : 1
  const [orders, totalOrders, groupedStatuses] = await Promise.all([
    prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        _count: { select: { items: true } },
        payment: { select: { status: true } },
        shippingAddress: { select: { city: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count(),
    prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ])
  const counts = new Map(groupedStatuses.map(({ status, _count }) => [status, _count._all]))
  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE))

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-muted-foreground">
              Manage customer orders and fulfillments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <Button className="gap-2">
              <Package className="w-4 h-4" />
              Export Orders
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{counts.get('PENDING') || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Processing</p>
              <p className="text-2xl font-bold">{counts.get('PROCESSING') || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Shipped</p>
              <p className="text-2xl font-bold">{counts.get('SHIPPED') || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold">{counts.get('DELIVERED') || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold">{counts.get('CANCELLED') || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders ({totalOrders})</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <p className="text-sm text-muted-foreground">
                  Orders will appear here when customers start placing them.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Order #{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order._count.items} item{order._count.items !== 1 ? 's' : ''} •{' '}
                        {order.shippingAddress?.city || 'No address'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                      <p className="text-xs font-medium">
                        {order.payment?.status === 'COMPLETED'
                          ? 'Paid'
                          : 'Do not fulfill — payment unverified'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatUsd(order.total)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                {page > 1 ? (
                  <Button asChild variant="outline">
                    <Link href={`/admin/orders?page=${page - 1}`}>Previous</Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>Previous</Button>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {Math.min(page, totalPages)} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Button asChild variant="outline">
                    <Link href={`/admin/orders?page=${page + 1}`}>Next</Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>Next</Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
