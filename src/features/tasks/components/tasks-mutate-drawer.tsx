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
import { useState } from 'react'
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
    email: string // ✅ Add this
  } | null
}

export function TasksMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const [aiReply, setAiReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEditor, setShowEditor] = useState(false)


  const handleGenerateReply = async () => {
    if (!currentRow?.body) return;
    console.log(currentRow.body);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/reply`, {
        body: currentRow.body,
      });
      setAiReply(res.data.reply);
      setShowEditor(true);
    } catch (err) {
      console.error('Error generating AI reply:', err);
      alert('Failed to generate reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleSendReply = async () => {
    try {
      const response = await axios.post(`${API_URL}/send`, {
        to: currentRow?.email,
        reply: aiReply,
        subject: `Re: ${currentRow?.title || "Your email"}`
      });
  
      if (response.data.error) {
        throw new Error(response.data.error);
      }
  
      console.log('Email sent to:', currentRow?.email);
      console.log('Response from server:', response.data);
  
      alert('Reply sent successfully!');
      setShowEditor(false);
      setAiReply('');
    } catch (err) {
      console.error('Failed to send email:', err);
      alert('Failed to send reply. Please try again.');
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-semibold">
            {currentRow?.title ?? 'Email Details'}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            View complete email content and metadata.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-1 sm:px-4 py-2 space-y-4 text-sm text-muted-foreground">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <span className="font-medium text-foreground">Date:</span>
              <div>{currentRow?.date ?? 'N/A'}</div>
            </div>
            <div>
              <span className="font-medium text-foreground">Read:</span>
              <div>{currentRow?.read ?? 'N/A'}</div>
            </div>
            <div>
              <span className="font-medium text-foreground">Replied:</span>
              <div>{currentRow?.replied ?? 'N/A'}</div>
            </div>
            <div>
              <span className="font-medium text-foreground">Category:</span>
              <div>{currentRow?.classification ?? 'N/A'}</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-base font-medium text-foreground mb-2">Content</h3>
            <div className="whitespace-pre-wrap leading-relaxed">
              {currentRow?.body ?? 'No email content available.'}
            </div>
          </div>

          {showEditor && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-base font-medium text-foreground mb-2">AI Suggested Reply</h3>
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

        <SheetFooter className="border-t pt-4 mt-4 flex justify-between">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button disabled={loading} onClick={handleGenerateReply}>
            {loading ? 'Generating...' : 'Reply with AI'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
