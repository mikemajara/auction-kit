'use client'

import type { Item } from '@auction-kit/drizzle'

interface ItemListProps {
  items: Item[]
}

export function ItemList({ items }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-center">
        No items yet. Create one to get started!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-3">Items ({items.length})</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-white border border-gray-200 rounded-md"
          >
            <div className="font-medium">{item.name}</div>
            {item.description && (
              <div className="text-sm text-gray-600 mt-1">{item.description}</div>
            )}
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-500">
                ID: {item.id.slice(0, 8)}...
              </div>
              <div className="text-xs text-gray-500">
                Qty: {item.quantity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

