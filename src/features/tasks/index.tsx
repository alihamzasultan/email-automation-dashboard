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
import { API_URL } from '@/context/api'
import { Button } from '@/components/ui/button' // Assuming you use shadcn/ui or similar
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { supabase } from '@/config/supabaseClient'
export default function Tasks() {
  const [emails, setEmails] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedClassification, setSelectedClassification] = useState<string | null>(null);

  const fetchEmails = async () => {
    if (isFetching) return;

    setIsFetching(true);
    try {
      const response = await fetch(`${API_URL}/emails`);
      if (!response.ok) throw new Error('Failed to fetch emails');

      const newEmails = await response.json();

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
    fetchEmails();
  
    const channel = supabase
      .channel('public:emails')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails',
        },
        (payload) => {
          console.log('New email inserted:', payload.new);
          // Instead of manually adding, just refresh everything
          fetchEmails();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'emails',
        },
        (payload) => {
          const oldSummary = payload.old?.summary;
          const newSummary = payload.new?.summary;
  
          if (oldSummary !== newSummary) {
            console.log('Summary column updated:', payload.new);
            // Optional: directly refresh everything on update
            fetchEmails();
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  

  const classifications = Array.from(new Set(emails.map(email => email.classification))).filter(Boolean);
  // Add this with other state declarations
  const [isReplying, setIsReplying] = useState(false);

  const filteredEmails = selectedClassification
    ? emails.filter(email => email.classification === selectedClassification)
    : emails;

  // Modify handleReplyAll
  const handleReplyAll = async () => {
    setIsReplying(true); // Start loading
    try {
      const response = await fetch(`${API_URL}/reply-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredEmails),
      });

      if (!response.ok) throw new Error('Failed to send emails for reply all');

      const result = await response.json();
      console.log('Server response:', result);

      const deletedIds = result.results
        .filter((r: any) => r.send_status === 'sent')
        .map((r: any) => r.email_index)
        .map((index: number) => filteredEmails[index - 1]?.id);

      if (deletedIds.length > 0) {
        setEmails(prev => prev.filter(email => !deletedIds.includes(email.id)));
      }

    } catch (error) {
      console.error('Reply All error:', error);
    } finally {
      setIsReplying(false); // Stop loading
      await fetchEmails();
    }
  };


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
              {isFetching ? 'Loading new emails...' : `Showing ${filteredEmails.length} emails`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Classification filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-sm">
                  {selectedClassification ? (
                    <>
                      {selectedClassification.charAt(0).toUpperCase() + selectedClassification.slice(1)}
                    </>
                  ) : (
                    'All Classifications'
                  )}
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Select Classification</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setSelectedClassification(null)}>
                  All
                </DropdownMenuItem>
                {classifications.map((classification) => (
                  <DropdownMenuItem
                    key={classification}
                    onSelect={() => setSelectedClassification(classification)}
                  >
                    {classification.charAt(0).toUpperCase() + classification.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <TasksPrimaryButtons onRefresh={fetchEmails} disabled={isFetching} />

            {/* Reply All Button */}
            <Button onClick={fetchEmails} variant="outline" disabled={isFetching}>
              {isFetching ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 100 20v-4l-5 5 5 5v-4a8 8 0 01-8-8z" />
                  </svg>
                  Refreshing...
                </span>
              ) : (
                'Refresh'
              )}
            </Button>

            {/* Reply All Button */}
            <Button onClick={handleReplyAll} variant="outline" disabled={isReplying || isFetching}>
              {isReplying ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 100 20v-4l-5 5 5 5v-4a8 8 0 01-8-8z" />
                  </svg>
                  Replying...
                </span>
              ) : (
                'Reply All'
              )}
            </Button>

          </div>
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable data={filteredEmails} columns={columns} />
        </div>
      </Main>

      <TasksDialogs />
    </TasksProvider>
  );
}
