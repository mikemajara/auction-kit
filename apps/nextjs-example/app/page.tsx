import { CreateAuctionForm } from '@/components/create-auction-form'
import { JoinAuctionForm } from '@/components/join-auction-form'

export default function HomePage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">Auction Kit Demo</h1>
          <p className="text-gray-600 mb-8">
            Create a new auction or join an existing one
          </p>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Auction</h2>
            <CreateAuctionForm />
          </div>

          <JoinAuctionForm />
        </div>
      </div>
    </div>
  )
}

