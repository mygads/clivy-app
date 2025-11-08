import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

export function EmptyCart() {
  return (
    <div className="container mx-auto py-8 sm:py-12 md:py-16 mt-16 sm:mt-24 md:mt-36 px-2 sm:px-4">
      <div className="max-w-xl sm:max-w-2xl mx-auto text-center">
        <div className="mb-4 sm:mb-6">
          <div className="relative inline-block h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 opacity-20">
            <Trash2 className="h-full w-full" strokeWidth={1} />
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">There is nothing in your cart</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8">You haven&apos;t selected any products in the cart</p>
        <Link href="/#pricing">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2 sm:py-3 font-medium text-white transition-all hover:bg-primary/90 text-sm sm:text-base">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            View Products
          </button>
        </Link>
      </div>
    </div>
  )
}
