import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { cn } from '@/lib/utils'
// Define your classification types and colors (similar to callTypes)
const classificationTypes = new Map([
  ['urgent', 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'],
  ['other', 'bg-gray-300/30 text-purple-foreground'],
  ['sales', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['support', 'bg-neutral-300/40 border-neutral-300'],
  ['newsletter', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  ['complaint','bg-destructive/20 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export type Email = {
  id: string
  title: string
  date: string
  read: string
  replied: string
  classification: string
  body: string
  from: string
}

export const columns: ColumnDef<Email>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'from',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sender' />
    ),
    cell: ({ row }) => <div className='truncate'>{row.getValue('from')}</div>,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subject' />
    ),
    cell: ({ row }) => {
      const classification = row.original.classification
      const badgeColor = classificationTypes.get(classification) || classificationTypes.get('other')
      
      return (
        <div className='flex space-x-2'>
          {classification && (
            <Badge className={cn('capitalize', badgeColor)}>
              {classification}
            </Badge>
          )}
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('title')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'body',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Body' />
    ),
    cell: ({ row }) => (
      <span className='block max-w-64 truncate whitespace-nowrap text-muted-foreground'>
        {row.getValue('body')}
      </span>
    ),
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue('date')
      if (!rawDate) return <span>-</span>
      
      try {
        const date = new Date(rawDate as string)
        if (isNaN(date.getTime())) return <span>Invalid Date</span>
        
        return <span>{date.toLocaleString()}</span>
      } catch {
        return <span>Invalid Date</span>
      }
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]