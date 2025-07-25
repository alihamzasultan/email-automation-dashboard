import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Email } from '../data/data'

type TasksDialogType = 'create' | 'update' | 'delete' | 'import'

interface TasksContextType {
  open: TasksDialogType | null
  setOpen: (str: TasksDialogType | null) => void
  currentRow: Email | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Email | null>>
}

const TasksContext = React.createContext<TasksContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function TasksProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TasksDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Email | null>(null)

  return (
    <TasksContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </TasksContext.Provider>
  )
}

export const useTasks = () => {
  const tasksContext = React.useContext(TasksContext)
  if (!tasksContext) {
    throw new Error('useTasks has to be used within <TasksContext>')
  }
  return tasksContext
}
