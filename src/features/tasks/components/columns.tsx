import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { cn } from '@/lib/utils'
import defaultUserImage from '@/assets/user.png'  // alias "@" must be configured or use relative path



// Define your classification types and colors (similar to callTypes)
const classificationTypes = new Map([
  ['urgent', 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'],
  ['other', 'bg-gray-300/30 text-purple-foreground border-gray-300'],
  ['sales', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['support', 'bg-gray-400/30 text-purple-foreground border-gray-300'],
  ['newsletter', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  ['complaint','bg-destructive/20 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])
const emotionColors = new Map([
  ['happy', 'bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100'],
  ['sad', 'bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100'],
  ['angry', 'bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100'],
  ['frustrated', 'bg-orange-200 text-orange-900 dark:bg-orange-700 dark:text-orange-100'],
  ['thankful', 'bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100'],
  ['excited', 'bg-pink-200 text-pink-900 dark:bg-pink-700 dark:text-pink-100'],
  ['neutral', 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'],
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
  sender_image?: string
  sender_name?: string 
  replyMode?: 'ai' | 'manual'
  emotion:string
  
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
    cell: ({ row }) => {
      const senderEmail = row.getValue('from') as string
      const senderName = row.original.sender_name || '' // fallback to empty string
      const image = row.original.sender_image || defaultUserImage
  
      return (
        <div className='flex items-center gap-3 truncate'>
          <img
            src={image}
            alt={senderName || senderEmail}
            className='h-8 w-8 rounded-full object-cover border'
          />
          <div className='truncate leading-tight'>
            {senderName && (
              <div className='font-medium text-sm truncate'>{senderName}</div>
            )}
            <div className='text-xs text-muted-foreground truncate'>{senderEmail}</div>
          </div>
        </div>
      )
    },
  },
  
  
  // {
  //   accessorKey: 'title',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Title' />
  //   ),
  //   cell: ({ row }) => {
  //     const classification = row.original.classification
  //     const badgeColor = classificationTypes.get(classification) || classificationTypes.get('other')
      
  //     return (
  //       <div className='flex space-x-2'>
  //         {classification && (
  //           <Badge className={cn('capitalize', badgeColor)}>
  //             {classification}
  //           </Badge>
  //         )}
  //         <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
  //           {row.getValue('title')}
  //         </span>
  //       </div>
  //     )
  //   },
  // },
  // {
  //   accessorKey: 'body',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Body' />
  //   ),
  //   cell: ({ row }) => (
  //     <span className='block max-w-64 truncate whitespace-nowrap text-muted-foreground'>
  //       {row.getValue('body')}
  //     </span>
  //   ),
  // },
  {
    id: 'content',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email Body' />
    ),
    cell: ({ row }) => {
      const title = row.original.title
      const body = row.original.body

      return (
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>

            <span className='font-medium text-sm truncate max-w-[20rem]'>
              {title}
            </span>
          </div>
          <div className='text-muted-foreground text-xs truncate max-w-[24rem]'>
            {body}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'classification',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => {
      const classification = row.getValue('classification') as string
      const badgeColor = classificationTypes.get(classification) || classificationTypes.get('other')
  
      return (
        <Badge className={cn('capitalize', badgeColor)}>
          {classification || 'other'}
        </Badge>
      )
    },
  },

  {
    accessorKey: 'emotion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Emotion' />
    ),
    cell: ({ row }) => {
      const emotion = row.getValue('emotion') as string
      const badgeColor = emotionColors.get(emotion) || emotionColors.get('neutral')
  
      return (
        <Badge className={cn('capitalize', badgeColor)}>
          {emotion || 'neutral'}
        </Badge>
      )
    },
  },
  



  // {
  //   accessorKey: 'summary',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Summary' />
  //   ),
  //   cell: ({ row }) => {
  //     const summary = row.getValue('summary') as string
  //     return (
  //       <span className='block max-w-64 truncate whitespace-nowrap text-muted-foreground'>
  //         {summary || '-'}
  //       </span>
  //     )
  //   },
  // },
  
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Update' />
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue('date')
      if (!rawDate) return <span>-</span>
  
      try {
        const date = new Date(rawDate as string)
        if (isNaN(date.getTime())) return <span>Invalid Date</span>
  
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'short', // Feb
          day: '2-digit', // 21
          year: 'numeric', // 2015
        })
  
        return <span>{formattedDate}</span>
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
