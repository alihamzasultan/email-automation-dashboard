import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '@/context/api'
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: {
    id: string
    title: string
    date: string
    read: string
    replied: string
    classification: string
    body?: string
    email: string
    replyMode?: 'ai' | 'manual'
    summarize?: 'summarize'
    summary?: string
    viewMode?: 'summary'
  } | null
}


export function TasksMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const [aiReply, setAiReply] = useState('')
  const [summaryText, setSummaryText] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  if (!currentRow) return null 
  const isViewSummaryMode = currentRow?.viewMode === 'summary'

  const isSummarizeMode = currentRow?.summarize === 'summarize'
  const replyMode = currentRow?.replyMode ?? 'ai'

  // Fetch summary only on user action now
  const handleGenerateSummary = async () => {
    if (!currentRow?.body || !currentRow?.id || !currentRow?.title || !currentRow?.email) return
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/summarize`, {
        id: currentRow.id,             // <-- needed for Supabase row update
        body: currentRow.body,
        title: currentRow.title,
        from: currentRow.email,
      })
      setSummaryText(res.data.reply)
      alert('Summary generated and saved to Supabase.')
    } catch (err) {
      console.error('Error generating summary:', err)
      alert('Failed to generate summary. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleGenerateReply = async () => {
    if (!currentRow?.body) return
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/reply`, {
        body: currentRow.body,
      })
      setAiReply(res.data.reply)
      setShowEditor(true)
    } catch (err) {
      console.error('Error generating AI reply:', err)
      alert('Failed to generate reply. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    try {
      const response = await axios.post(`${API_URL}/send`, {
        to: currentRow?.email,
        reply: aiReply,
        subject: `Re: ${currentRow?.title || 'Your email'}`,
      })

      if (response.data.error) throw new Error(response.data.error)

      alert('Reply sent successfully!')
      setShowEditor(false)
      setAiReply('')
    } catch (err) {
      console.error('Failed to send email:', err)
      alert('Failed to send reply. Please try again.')
    }
  }

  useEffect(() => {
    // Reset states when drawer opens/closes or row changes
    setAiReply('')
    setSummaryText('')
    setShowEditor(false)
  }, [open, currentRow])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-semibold">
            {currentRow?.title ?? 'Email Details'}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {isSummarizeMode
              ? 'You can generate and edit a summary of the email.'
              : 'View and reply to the full email content.'}
          </SheetDescription>
        </SheetHeader>

        {isViewSummaryMode ? (
            <div className="flex-1 overflow-y-auto px-1 sm:px-4 py-2 text-sm text-muted-foreground">
                <div className="mb-4">
                  <h3 className="text-base font-medium text-foreground mb-2">Summary</h3>
                  <div className="whitespace-pre-wrap leading-relaxed bg-muted p-3 rounded-md">
                    {currentRow?.summary || 'No summary available.'}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* the rest of your original drawer UI for summarize/reply here */}
              </>
            )}

        <div className="flex-1 overflow-y-auto px-1 sm:px-4 py-2 space-y-4 text-sm text-muted-foreground">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <span className="font-medium text-foreground">Date:</span>
              <div>
                {currentRow?.date
                  ? new Date(currentRow.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    }).replace(/ /g, ', ')
                  : 'N/A'}
              </div>
            </div>
            <div>
              <span className="font-medium text-foreground">Category:</span>
              <div>{currentRow?.classification ?? 'N/A'}</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-base font-medium text-foreground mb-2">
              Email Content
            </h3>
            <div className="whitespace-pre-wrap leading-relaxed">
              {currentRow?.body ?? 'No email content available.'}
            </div>
          </div>

          {isSummarizeMode && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-base font-medium text-foreground mb-2">Summary</h3>
              <Textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          )}

          {!isSummarizeMode && showEditor && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-base font-medium text-foreground mb-2">Reply</h3>
              <Textarea
                value={aiReply}
                onChange={(e) => setAiReply(e.target.value)}
                className="min-h-[150px]"
              />
              <Button className="mt-2" onClick={handleSendReply}>
                Confirm & Send
              </Button>
            </div>
          )}
        </div>

        {!isViewSummaryMode && (
  <SheetFooter className="border-t pt-4 mt-4 flex justify-between">
    <SheetClose asChild>
      <Button variant="outline">Close</Button>
    </SheetClose>

    {isSummarizeMode ? (
      <Button disabled={loading} onClick={handleGenerateSummary}>
        {loading ? 'Generating...' : 'Generate Summary'}
      </Button>
    ) : replyMode === 'ai' ? (
      <Button disabled={loading} onClick={handleGenerateReply}>
        {loading ? 'Generating...' : 'Generate Reply'}
      </Button>
    ) : (
      <Button
        onClick={() => {
          setShowEditor(true)
          setAiReply('')
        }}
      >
        Write Reply
      </Button>
    )}
  </SheetFooter>
)}

      </SheetContent>
    </Sheet>
  )
}
