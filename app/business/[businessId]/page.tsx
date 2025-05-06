import { redirect } from "next/navigation"

export default function BusinessProfileDefaultPage({ params }: { params: { businessId: string } }) {
  const { businessId } = params

  // Redirect to the overview page
  redirect(`/business/${businessId}/overview`)
}
