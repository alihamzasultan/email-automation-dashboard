import { createFileRoute } from '@tanstack/react-router'
// import Tasks from '@/features/tasks'
import Dashboard from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
})
