import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { IconPencil } from '@tabler/icons-react'
import { IconMailAi } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTasks } from '../context/tasks-context'
import type { Email } from '../data/data'
interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const email = row.original as Email
  const { setOpen, setCurrentRow } = useTasks()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow({ ...email, replyMode: 'ai' }) // Add a flag
            setOpen('update')
          }}

        >
          Reply with AI
          <span className='ml-auto'>
          <IconMailAi size={20} />
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
        onClick={() => {
          setCurrentRow({ ...email, replyMode: 'manual' }) // Add a flag
          setOpen('update')
        }}

        >
           Reply Manually
          <span className='ml-auto'>
            <IconPencil  size={20} />
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
