import { IconDownload} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useTasks } from '../context/tasks-context'

interface TasksPrimaryButtonsProps {
  onRefresh?: () => void
  disabled?: boolean
}

export function TasksPrimaryButtons({

}: TasksPrimaryButtonsProps) {
  const { setOpen } = useTasks()
  
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>Import</span> <IconDownload size={18} />
      </Button>
      {/* <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Create</span> <IconPlus size={18} />
      </Button> */}
      {/* {onRefresh && (
        <Button
          variant="outline"
          className="space-x-1"
          onClick={onRefresh}
          disabled={disabled}
        >
          <span>Refresh</span> <IconRefresh size={18} />
        </Button>
      )} */}
    </div>
  )
}