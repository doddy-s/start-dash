import { prisma } from '@/lib/prisma.lib'
import {
  buildDataTable,
  buildOrderBy,
  buildWhere,
} from '@/utils/data-table.utils'
import { DataTableQuerySchema } from '@/shared/types/data-table.type'
import type { EmployeeDataTableType } from '@/shared/types/employee.type'
import { createServerFn } from '@tanstack/react-start'
import { zodValidator } from '@tanstack/zod-adapter'

export const employeeDatatableHandler = createServerFn()
  .inputValidator(zodValidator(DataTableQuerySchema))
  .handler(async (c) => {
    const input = c.data

    const orderBy = buildOrderBy({
      sortQueries: input.sortQueries,
      sortableFields: ['name'],
    })

    const where = buildWhere({
      filterQueries: input.filterQueries,
      filterableFields: ['type'],
    })

    const getEmployees = prisma.employee.findMany({
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      orderBy: [...orderBy, { createdAt: 'desc' }],
      where: {
        ...where,
      },
      include: {
        account: {
          include: {
            accountRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    })

    const getTotalCount = prisma.employee.count({
      where: {
        ...where,
      },
    })

    const [employees, total] = await Promise.all([getEmployees, getTotalCount])

    const dataTable = buildDataTable<EmployeeDataTableType>({
      data: employees.map((e) => ({
        id: e.id,
        deleted: e.deletedAt !== null,
        name: e.name,
        fullName: e.fullName,
        roles: e.account.accountRoles.map((r) => r.role.name),
        email: e.account.email,
        // lastSeen: e.lastSeen,
        phoneNumber: e.phoneNumber,
        signatureFileUrl: '',
      })),
      totalItems: total,
      currentPage: input.page,
      limit: input.limit,
      // filterOptions,
    })

    return dataTable
  })
