import { prisma } from '@/lib/prisma.lib'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const serverFn = createServerFn().handler(async () => {
  console.log('this run on server')
  return await prisma.account.findMany()
})

export const Route = createFileRoute('/(dashboard)/account/')({
  component: RouteComponent,
})

function RouteComponent() {
  const a = useQuery({
    queryKey: ['accounts'],
    queryFn: serverFn,
  })

  return <div>{JSON.stringify(a.data)}</div>
}
