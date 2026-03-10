import { employeeDatatableHandler } from '@/modules/employee/employee.handler'
import { DataTableQuerySchema } from '@/shared/types/data-table.type'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboard)/employee/')({
  component: RouteComponent,
  validateSearch: DataTableQuerySchema,
})

function RouteComponent() {
  const search = Route.useSearch()

  const employeeDataTableQuery = useQuery({
    queryKey: ['employee-data-table', search],
    queryFn: () => employeeDatatableHandler({ data: search }),
  })

  return <div>{JSON.stringify(employeeDataTableQuery.data)}</div>
}
