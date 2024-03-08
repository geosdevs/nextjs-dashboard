import { fetchRevenue } from "@/app/lib/data"


export default async function Page() {
  const revenues = await fetchRevenue();
  return (
    <h1>Customers</h1>
  )
}