import type {
  DataTable,
  DataTableQueryType,
  FilterOperatorType,
  FilterOptionType,
} from '@/shared/types/data-table.type'

/**
 * Build Prisma-compatible orderBy arguments from validated sortQueries.
 *
 * Example:
 *   buildOrderBy(
 *     [{ by: "user.name", order: "asc" }],
 *     ["user.name", "createdAt"],
 *     ["user.name", "createdAt"]
 *   )
 *   → [ { user: { name: "asc" } } ]
 */
export function buildOrderBy<T extends string>({
  sortQueries,
  sortableFields,
  nullsLastFields = [],
}: {
  sortQueries: DataTableQueryType['sortQueries']
  sortableFields: readonly T[]
  nullsLastFields?: readonly T[]
}): Record<string, any>[] {
  const orderBys: Record<string, any>[] = []

  if (!sortQueries || sortQueries.length === 0) return orderBys

  for (const sq of sortQueries) {
    // validate field
    if (!sortableFields.includes(sq.by as T)) continue

    // determine if nulls should be last for this field
    const sortConfig = nullsLastFields.includes(sq.by as T)
      ? { sort: sq.order, nulls: 'last' }
      : sq.order

    // build nested sort object: "user.name" → { user: { name: { sort: "asc", nulls: "last" } } }
    const nested = sq.by
      .split('.')
      .reduceRight((acc, key) => ({ [key]: acc }), sortConfig as any)

    orderBys.push(nested as Record<string, any>)
  }

  return orderBys
}

export function buildWhere<T extends string>({
  filterQueries,
  filterableFields,
}: {
  filterQueries: DataTableQueryType['filterQueries']
  filterableFields: readonly T[]
}): Record<string, any> | undefined {
  if (!filterQueries || filterQueries.length === 0) return undefined

  const andConditions: Record<string, any>[] = []

  for (const fq of filterQueries) {
    // Remove _, this used for multiple filter on the same field
    fq.field = fq.field.replace(/^_+/, '')

    if (!filterableFields.includes(fq.field as T)) continue

    // Convert string to proper value type if possible
    let value: any = simpleParse(fq.value)

    // Build Prisma operator
    const condition = buildPrismaCondition(fq.operator, value)

    // Build nested object: e.g. "user.email" → { user: { email: condition } }
    const nestedCondition = fq.field
      .split('.')
      .reduceRight((acc, key) => ({ [key.replace(/^_+/, '')]: acc }), condition)

    andConditions.push(nestedCondition)
  }

  return andConditions.length > 0 ? { AND: andConditions } : undefined
}

/** Internal: map operator to Prisma syntax */
function buildPrismaCondition(
  operator: FilterOperatorType,
  value: any,
): Record<string, any> {
  switch (operator) {
    case 'eq':
      return { equals: value }
    case 'neq':
      return { not: value }
    case 'gt':
      return { gt: value }
    case 'lt':
      return { lt: value }
    case 'gte':
      return { gte: value }
    case 'lte':
      return { lte: value }
    case 'in':
      return {
        in: Array.isArray(value)
          ? value
          : String(value)
              .split(',')
              .map((val) => simpleParse(val)),
      }
    case 'null':
      return { equals: null }
    case 'not null':
      return { not: null }
    case 'has':
      return { has: value }
    case 'between': {
      const dates = Array.isArray(value) ? value : String(value).split(',')

      if (!dates || dates.length < 2) {
        return {}
      }

      const startDate = new Date(dates[0])
      const endDate = new Date(dates[1])

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return {}
      }

      return { gte: startDate, lte: endDate }
    }
    default:
      return {}
  }
}

function simpleParse(value: string) {
  if (value === 'true') return true
  else if (value === 'false') return false
  else if (!isNaN(Number(value))) return Number(value)
  return String(value)
}

export function buildSearch<T extends string>({
  searchTerm,
  searchableFields,
}: {
  searchTerm?: string | null
  searchableFields: readonly T[]
}): Record<string, any>[] | undefined {
  if (!searchTerm || searchTerm.trim() === '') return undefined

  const searches: Record<string, any>[] = []

  for (const field of searchableFields) {
    // Build nested search object: "account.username" → { account: { username: { contains: "term", mode: "insensitive" } } }
    const searchCondition = {
      contains: searchTerm.trim(),
      mode: 'insensitive' as const,
    }

    const nestedSearch = field
      .split('.')
      .reduceRight((acc, key) => ({ [key]: acc }), searchCondition as any)

    searches.push(nestedSearch as Record<string, any>)
  }

  return searches.length > 0 ? searches : undefined
}

/**
 * Builds the pagination structure for the response.
 * @template TEntity - The type of items in the response
 * @param data - The paginated data
 * @param totalItems - The total number of items
 * @param currentPage - The current page number
 * @param limit - The number of items per page
 * @returns The pagination structure
 */
export const buildDataTable = <TEntity extends object>({
  data,
  totalItems,
  currentPage,
  limit,
  filterOptions,
}: {
  data: TEntity[]
  totalItems: number
  currentPage: number
  limit: number
  filterOptions?: FilterOptionType
}): DataTable<TEntity> => {
  const totalPages = Math.ceil(totalItems / limit) || 1
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  if (currentPage < 1 || currentPage > totalPages) {
    throw new Error('Current page is out of bounds')
  }

  return {
    items: data,
    pagination: {
      currentPage,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      limit,
    },
    filterOptions,
  }
}
