import { z } from 'zod'

const SortOrderEnumSchema = z.enum(['asc', 'desc'])

export const FilterOperatorEnum = z.enum([
  'eq',
  'neq',
  'gt',
  'lt',
  'lte',
  'gte',
  'in',
  'null',
  'not null',
  'has',
  'between',
])
export type FilterOperatorType = z.infer<typeof FilterOperatorEnum>

export const SortQuerySchema = z.object({
  by: z.string(),
  order: SortOrderEnumSchema,
})
export type SortQueryType = z.infer<typeof SortQuerySchema>

export const FilterQuerySchema = z.object({
  field: z.string(),
  operator: FilterOperatorEnum,
  value: z.string(),
})
export type FilterQueryType = z.infer<typeof FilterQuerySchema>

export const DataTableQuerySchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
  search: z.string().optional(),
  sortQueries: z.array(SortQuerySchema).optional(),
  filterQueries: z.array(FilterQuerySchema).optional(),
})
export type DataTableQueryType = z.infer<typeof DataTableQuerySchema>

export const PaginationSchema = z.object({
  currentPage: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
})
export type PaginationType = z.infer<typeof PaginationSchema>

export const TypeOfFilterOptionEnumSchema = z.enum([
  'select',
  'multi-select',
  'date',
  'radio',
  'checkbox',
  'input',
  'input-number',
])
export type TypeOfFilterOptionEnumType = z.infer<
  typeof TypeOfFilterOptionEnumSchema
>
export const FilterOptionSchema = z.record(
  z.string(),
  z.object({
    name: z.string(),
    type: TypeOfFilterOptionEnumSchema.nullish(),
    items: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    ),
    operator: FilterOperatorEnum,
  }),
)
export type FilterOptionType = z.infer<typeof FilterOptionSchema>

export type DataTable<TEntity extends object> = {
  /** Array of items in the current page */
  items: TEntity[]
  /** Pagination metadata */
  pagination: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }

  filterOptions?: FilterOptionType
}
