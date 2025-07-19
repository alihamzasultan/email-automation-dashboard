import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import TasksProvider from './context/tasks-context'

export default function Tasks() {
  const [emails, setEmails] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false); // Renamed from isLoading to be more specific

  const fetchEmails = async () => {
    if (isFetching) return; // Prevent concurrent fetches
    
    setIsFetching(true);
    try {
      const response = await fetch('http://localhost:5000/api/emails');
      if (!response.ok) throw new Error('Failed to fetch emails');
      
      const newEmails = await response.json();
      
      // Append new emails to existing ones, avoiding duplicates
      setEmails(prevEmails => {
        const existingIds = new Set(prevEmails.map(email => email.id));
        const uniqueNewEmails = newEmails.filter((email: any) => !existingIds.has(email.id));
        return [...uniqueNewEmails, ...prevEmails];
      });
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setIsFetching(false);
    }
  };
  
  useEffect(() => {
    fetchEmails(); // Initial fetch
  
    const interval = setInterval(fetchEmails, 10000); // Poll every 10 seconds
  
    return () => clearInterval(interval);
  }, []);
  
  return (
    <TasksProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Emails</h2>
            <p className='text-muted-foreground'>
              {isFetching ? 'Loading new emails...' : `Showing ${emails.length} emails`}
            </p>
          </div>
          <TasksPrimaryButtons onRefresh={fetchEmails} disabled={isFetching} />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable data={emails} columns={columns} />
        </div>
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}