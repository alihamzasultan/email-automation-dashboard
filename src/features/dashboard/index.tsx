'use client'

import * as React from 'react'
import { createClient } from '@supabase/supabase-js'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

// ===== Supabase Client Setup =====
const supabaseUrl = 'https://wxynstpanhlkgdjexhrp.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4eW5zdHBhbmhsa2dkamV4aHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMjAwNjUsImV4cCI6MjA2ODg5NjA2NX0.p_YbeN2FUXusUFmcL4eOQbTivUtdEupvSnaa8WoFOZc'
const supabase = createClient(supabaseUrl, supabaseKey)

// ===== Chatbot Formatting Helpers =====

function formatBotResponse(text: string): string {
  let formattedText = text
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  formattedText = formattedText.replace(
    /!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g,
    (_match, altText, imageUrl) => {
      return `<img src="${imageUrl.trim()}" alt="${altText.trim()}" class="my-2 max-w-full rounded-lg shadow-md h-auto" />`
    }
  )
  formattedText = formattedText.replace(
    /(?<!href="|src=")(https?:\/\/[^\s<>"]+)/g,
    (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">${url}</a>`
    }
  )
  formattedText = formattedText.replace(/\n/g, '<br />')
  return formattedText
}

function BotMessage({ text }: { text: string }) {
  const formattedHtml = formatBotResponse(text)
  return (
    <div
      className='prose prose-sm dark:prose-invert max-w-none'
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  )
}

// ===== Data and Components for Chatbot =====

type Message = {
  id: number
  text: string
  sender: 'user' | 'bot'
}

function Chatbot() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your sales assistant. How can I help you today?",
        sender: 'bot',
      },
    ])
  }, [])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() === '' || isLoading) return

    setIsLoading(true)
    const userMessageText = input
    const newUserMessage: Message = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user',
    }
    setMessages((prev) => [...prev, newUserMessage])
    setInput('')

    try {
      const formData = new FormData()
      formData.append('user_input', userMessageText)

      const response = await fetch(
        'https://web-production-330a5.up.railway.app/chatbot',
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()

      const botReply: Message = {
        id: Date.now() + 1,
        text: data.response || "Sorry, I didn't get a valid response.",
        sender: 'bot',
      }
      setMessages((prev) => [...prev, botReply])
    } catch (error) {
      console.error('Failed to fetch chatbot reply:', error)
      const errorReply: Message = {
        id: Date.now() + 1,
        text: "I'm sorry, but I'm having trouble connecting to my brain right now. Please try again in a moment.",
        sender: 'bot',
      }
      setMessages((prev) => [...prev, errorReply])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className='mx-auto w-full max-w-5x1'>
      <CardHeader>
        <CardTitle>Sales Assistant</CardTitle>
        <CardDescription>
          Chat with your AI assistant for sales insights and support.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex h-[60vh] flex-col'>
        <ScrollArea className='flex-grow min-h-0 pr-4'>
          <div className='space-y-4'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <Avatar className='h-8 w-8 self-start'>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`min-w-0 max-w-xs break-words rounded-lg px-4 py-2 text-sm lg:max-w-md ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.sender === 'user' ? (
                    message.text
                  ) : (
                    <BotMessage text={message.text} />
                  )}
                </div>
                {message.sender === 'user' && (
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className='flex items-end gap-2 justify-start'>
                <Avatar className='h-8 w-8 self-start'>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className='max-w-xs rounded-lg bg-muted px-4 py-2 text-sm lg:max-w-md'>
                  <div className='flex items-center space-x-2'>
                    <span className='h-2 w-2 animate-pulse rounded-full bg-foreground [animation-delay:-0.3s]'></span>
                    <span className='h-2 w-2 animate-pulse rounded-full bg-foreground [animation-delay:-0.15s]'></span>
                    <span className='h-2 w-2 animate-pulse rounded-full bg-foreground'></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <form
          onSubmit={handleSendMessage}
          className='mt-4 flex w-full flex-shrink-0 items-center space-x-2 border-t pt-4'
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type a message...'
            autoComplete='off'
            disabled={isLoading}
          />
          <Button type='submit' disabled={isLoading}>
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
// ===== Data and Components for Delivery Fee Calculator =====

const destinations = [
  { name: 'Custom', miles: 0 },
  { name: 'West Palm Beach (Local)', miles: 5 },
  { name: 'Palm Beach Gardens', miles: 15 },
  { name: 'Jupiter', miles: 19 },
  { name: 'Lake Worth', miles: 10 },
  { name: 'Boynton Beach', miles: 17 },
  { name: 'Delray Beach', miles: 24 },
  { name: 'Boca Raton', miles: 28 },
  { name: 'Deerfield Beach', miles: 31 },
  { name: 'Pompano Beach', miles: 40 },
  { name: 'Coral Springs', miles: 53 },
  { name: 'Fort Lauderdale', miles: 47 },
  { name: 'Hollywood', miles: 55 },
  { name: 'Pembroke Pines', miles: 57 },
  { name: 'Miramar', miles: 60 },
  { name: 'Aventura', miles: 62 },
  { name: 'Hialeah', miles: 70 },
  { name: 'Miami', miles: 71 },
  { name: 'Miami Beach', miles: 73 },
  { name: 'Doral', miles: 70 },
  { name: 'Homestead', miles: 100 },
  { name: 'Key Largo', miles: 115 },
  { name: 'Islamorada', miles: 145 },
  { name: 'Marathon', miles: 170 },
  { name: 'Key West', miles: 230 },
  { name: 'Port St. Lucie', miles: 50 },
  { name: 'Stuart', miles: 40 },
  { name: 'Vero Beach', miles: 80 },
  { name: 'Fort Pierce', miles: 63 },
  { name: 'Melbourne', miles: 110 },
  { name: 'Daytona Beach', miles: 208 },
  { name: 'Orlando', miles: 170 },
  { name: 'Kissimmee', miles: 165 },
  { name: 'Winter Park', miles: 172 },
  { name: 'Ocala', miles: 240 },
  { name: 'Gainesville', miles: 267 },
  { name: 'Sarasota', miles: 180 },
  { name: 'Bradenton', miles: 185 },
  { name: 'St. Petersburg', miles: 230 },
  { name: 'Clearwater', miles: 225 },
  { name: 'Tampa', miles: 210 },
  { name: 'Lakeland', miles: 190 },
  { name: 'Fort Myers', miles: 126 },
  { name: 'Naples', miles: 112 },
  { name: 'Bonita Springs', miles: 120 },
  { name: 'Cape Coral', miles: 130 },
  { name: 'Lehigh Acres', miles: 135 },
  { name: 'Punta Gorda', miles: 140 },
  { name: 'Sebring', miles: 110 },
  { name: 'Okeechobee', miles: 60 },
  { name: 'St. Augustine', miles: 260 },
  { name: 'Jacksonville', miles: 279 },
  { name: 'Palm Coast', miles: 230 },
  { name: 'Tallahassee', miles: 400 },
  { name: 'Panama City', miles: 480 },
  { name: 'Pensacola', miles: 610 },
]

function DeliveryFeeCalculator() {
  const [settings, setSettings] = React.useState({
    driverRate: 22.5,
    gasPrice: 3.5,
    mpg: 15.0,
    avgSpeed: 50.0,
    margin: 0.15,
  })

  const [route, setRoute] = React.useState({
    oneWayMiles: 50, // Default to Port St. Lucie
    tolls: 0.0,
    extras: 0.0,
  })

  const [results, setResults] = React.useState({
    laborCost: 0,
    gasCost: 0,
    subtotal: 0,
    suggestedFee: 0,
    roundTripMiles: 0,
    estHours: 0,
  })

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleRouteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRoute((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleDestinationChange = (value: string) => {
    const selected = destinations.find((d) => d.name === value)
    if (selected && selected.name !== 'Custom') {
      setRoute((prev) => ({ ...prev, oneWayMiles: selected.miles }))
    }
  }

  React.useEffect(() => {
    const { driverRate, gasPrice, mpg, avgSpeed, margin } = settings
    const { oneWayMiles, tolls, extras } = route

    if (mpg === 0 || avgSpeed === 0) {
      setResults({
        laborCost: 0,
        gasCost: 0,
        subtotal: 0,
        suggestedFee: 0,
        roundTripMiles: 0,
        estHours: 0,
      })
      return
    }

    const roundTripMiles = oneWayMiles * 2
    const estHours = roundTripMiles / avgSpeed
    const laborCost = estHours * driverRate
    const gallons = roundTripMiles / mpg
    const gasCost = gallons * gasPrice
    const subtotal = laborCost + gasCost + tolls + extras
    const suggestedFee = subtotal * (1 + margin)

    setResults({
      roundTripMiles,
      estHours,
      laborCost,
      gasCost,
      subtotal,
      suggestedFee,
    })
  }, [settings, route])

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      <Card className='lg:col-span-1'>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Adjust the baseline parameters for all calculations.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <div className='space-y-1'>
            <Label htmlFor='driverRate'>Driver Rate ($/hr)</Label>
            <Input
              id='driverRate'
              name='driverRate'
              type='number'
              step='0.50'
              value={settings.driverRate}
              onChange={handleSettingsChange}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='gasPrice'>Gas Price ($/gal)</Label>
            <Input
              id='gasPrice'
              name='gasPrice'
              type='number'
              step='0.01'
              value={settings.gasPrice}
              onChange={handleSettingsChange}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='mpg'>Van Fuel Economy (mpg)</Label>
            <Input
              id='mpg'
              name='mpg'
              type='number'
              step='0.5'
              value={settings.mpg}
              onChange={handleSettingsChange}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='avgSpeed'>Average Speed (mph)</Label>
            <Input
              id='avgSpeed'
              name='avgSpeed'
              type='number'
              step='1'
              value={settings.avgSpeed}
              onChange={handleSettingsChange}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='margin'>Profit Margin (%)</Label>
            <Input
              id='margin'
              name='margin'
              type='number'
              step='1'
              value={settings.margin * 100}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  margin: parseFloat(e.target.value) / 100 || 0,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className='lg:col-span-1'>
        <CardHeader>
          <CardTitle>Route Calculator</CardTitle>
          <CardDescription>
            Select a destination or enter details for a specific route.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <div className='space-y-1'>
            <Label htmlFor='destination'>Destination</Label>
            <Select
              onValueChange={handleDestinationChange}
              defaultValue='Port St. Lucie'
            >
              <SelectTrigger id='destination'>
                <SelectValue placeholder='Select a destination' />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name}{' '}
                    {d.miles > 0
                      ? `(${d.miles} mi)`
                      : d.name === 'Custom'
                        ? '(Manual Entry)'
                        : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1'>
            <Label htmlFor='oneWayMiles'>One-way Miles (mi)</Label>
            <Input
              id='oneWayMiles'
              name='oneWayMiles'
              type='number'
              step='1'
              value={route.oneWayMiles}
              onChange={handleRouteChange}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='tolls'>Tolls ($)</Label>
            <Input
              id='tolls'
              name='tolls'
              type='number'
              step='0.01'
              value={route.tolls}
              onChange={handleRouteChange}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='extras'>Extras ($)</Label>
            <Input
              id='extras'
              name='extras'
              type='number'
              step='0.01'
              value={route.extras}
              onChange={handleRouteChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card className='md:col-span-2 lg:col-span-1'>
        <CardHeader>
          <CardTitle>Fee Breakdown & Suggestion</CardTitle>
          <CardDescription>
            Based on your settings and route details.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Round-trip distance:</span>
            <span>{results.roundTripMiles.toFixed(1)} miles</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Estimated duration:</span>
            <span>{results.estHours.toFixed(2)} hours</span>
          </div>
          <div className='border-t' />
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Labor Cost:</span>
            <span className='font-medium'>
              {results.laborCost.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Gas Cost:</span>
            <span className='font-medium'>
              {results.gasCost.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Tolls & Extras:</span>
            <span className='font-medium'>
              {(route.tolls + route.extras).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          </div>
          <div className='border-t' />
          <div className='flex justify-between font-semibold'>
            <span className='text-muted-foreground'>Total Cost (Subtotal):</span>
            <span>
              {results.subtotal.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          </div>
          <div className='mt-4 flex justify-between rounded-lg bg-primary/10 p-4 text-lg font-bold text-primary'>
            <span>Suggested Fee:</span>
            <span>
              {results.suggestedFee.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ===== HELPERS for Dashboard Stats =====

type StatItem = {
  name: string
  count: number
  percentage: number
}

/**
 * Processes raw counts into a top-3 + "Other" format with percentages.
 */
function processStatsForDisplay(
  counts: Record<string, number>,
  total: number
): StatItem[] {
  if (total === 0 || Object.keys(counts).length === 0) return []

  const sortedItems = Object.entries(counts).sort(([, a], [, b]) => b - a)

  const topThree = sortedItems
    .slice(0, 3)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / total) * 100,
    }))

  if (sortedItems.length > 3) {
    const otherCount = sortedItems
      .slice(3)
      .reduce((acc, [, count]) => acc + count, 0)
    if (otherCount > 0) {
      topThree.push({
        name: 'Other',
        count: otherCount,
        percentage: (otherCount / total) * 100,
      })
    }
  }

  return topThree
}

/**
 * Returns an icon and color for each emotion.
 */
function getEmotionStyle(emotion: string) {
  const commonIconClass = 'h-4 w-4 text-muted-foreground'
  switch (emotion.toLowerCase()) {
    case 'happy':
      return {
        color: 'bg-green-400',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className={commonIconClass}
          >
            <circle cx='12' cy='12' r='10' />
            <path d='M8 14s1.5 2 4 2 4-2 4-2' />
            <line x1='9' y1='9' x2='9.01' y2='9' />
            <line x1='15' y1='9' x2='15.01' y2='9' />
          </svg>
        ),
      }
    case 'sad':
      return {
        color: 'bg-blue-400',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className={commonIconClass}
          >
            <circle cx='12' cy='12' r='10' />
            <path d='M8 16s1.5-2 4-2 4 2 4 2' />
            <line x1='9' y1='10' x2='9.01' y2='10' />
            <line x1='15' y1='10' x2='15.01' y2='10' />
          </svg>
        ),
      }
    case 'angry':
      return {
        color: 'bg-red-500',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className={commonIconClass}
          >
            <circle cx='12' cy='12' r='10' />
            <path d='M16 16s-1.5-2-4-2-4 2-4 2' />
            <path d='m9 10 2 2' />
            <path d='m15 10-2 2' />
          </svg>
        ),
      }
    case 'thankful':
      return {
        color: 'bg-pink-400',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className={commonIconClass}
          >
            <path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' />
          </svg>
        ),
      }
    case 'excited':
      return {
        color: 'bg-yellow-400',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className={commonIconClass}
          >
            <path d='M4.5 12.5a.5.5 0 0 1 .5-.5h14a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z' />
            <path d='M8 8a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 8zm8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5z' />
            <path d='m12 15-3.5-3.5' />
            <path d='m12 15 3.5-3.5' />
          </svg>
        ),
      }
    case 'other':
      return {
        color: 'bg-slate-400',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className={commonIconClass}
          >
            <circle cx='12' cy='12' r='1' />
            <circle cx='19' cy='12' r='1' />
            <circle cx='5' cy='12' r='1' />
          </svg>
        ),
      }
    default:
      return {
        color: 'bg-gray-400',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className={commonIconClass}
          >
            <circle cx='12' cy='12' r='10' />
            <line x1='8' y1='12' x2='16' y2='12' />
          </svg>
        ),
      } // Neutral
  }
}

function getClassificationStyle(classification: string) {
  const commonIconClass = 'h-4 w-4 text-muted-foreground'
  switch (classification.toLowerCase()) {
    case 'inquiry':
      return {
        color: 'bg-cyan-400',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className={commonIconClass}
          >
            <circle cx='12' cy='12' r='10' />
            <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
            <line x1='12' y1='17' x2='12.01' y2='17' />
          </svg>
        ),
      }
    case 'feedback':
      return {
        color: 'bg-purple-400',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className={commonIconClass}
          >
            <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
          </svg>
        ),
      }
    case 'spam':
      return {
        color: 'bg-orange-500',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className={commonIconClass}
          >
            <circle cx='12' cy='12' r='10' />
            <line x1='12' y1='8' x2='12' y2='12' />
            <line x1='12' y1='16' x2='12.01' y2='16' />
          </svg>
        ),
      }
    default: // Other
      return {
        color: 'bg-slate-400',
        icon: (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className={commonIconClass}
          >
            <path d='M12.586 2.586a2 2 0 0 0-2.828 0L2.586 9.757a2 2 0 0 0 0 2.828l7.172 7.172a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828L12.586 2.586z' />
          </svg>
        ),
      }
  }
}

// ===== Main Dashboard Component =====

export default function Dashboard() {
  const [emailStats, setEmailStats] = React.useState<{
    processedEmotions: StatItem[]
    processedClassifications: StatItem[]
  }>({
    processedEmotions: [],
    processedClassifications: [],
  })
  const [isLoadingStats, setIsLoadingStats] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchEmailStats = async () => {
      setIsLoadingStats(true)
      const { data, error, count } = await supabase
        .from('emails')
        .select('emotion, classification', { count: 'exact' })

      if (error) {
        console.error('Error fetching email data:', error)
        setError('Failed to load email statistics.')
        setIsLoadingStats(false)
        return
      }

      if (data && count) {
        const emotionCounts: Record<string, number> = {}
        const classificationCounts: Record<string, number> = {}
        let validEmotionsTotal = 0
        let validClassificationsTotal = 0

        for (const email of data) {
          if (email.emotion) {
            emotionCounts[email.emotion] = (emotionCounts[email.emotion] || 0) + 1
            validEmotionsTotal++;
          }
          if (email.classification) {
            classificationCounts[email.classification] =
              (classificationCounts[email.classification] || 0) + 1
            validClassificationsTotal++;
          }
        }

        setEmailStats({
          processedEmotions: processStatsForDisplay(emotionCounts, validEmotionsTotal),
          processedClassifications: processStatsForDisplay(
            classificationCounts,
            validClassificationsTotal
          ),
        })
      }
      setIsLoadingStats(false)
    }

    fetchEmailStats()
  }, [])

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <div className='flex items-center space-x-2'>
            <Button>Download</Button>
          </div>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='calculator'>Fee Calculator</TabsTrigger>
              <TabsTrigger value='chatbot'>Sales Assistant</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Revenue
                  </CardTitle>
                   <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>$45,231.89</div>
                   <p className='text-muted-foreground text-xs'>
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Subscriptions
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                    <circle cx='9' cy='7' r='4' />
                    <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>+2350</div>
                   <p className='text-muted-foreground text-xs'>
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>

              {/* ===== Top Emotions Card ===== */}
              <Card>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-base'>Top Emotions</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <p className='text-sm text-muted-foreground'>Loading...</p>
                  ) : emailStats.processedEmotions.length > 0 ? (
                    <div className='space-y-4'>
                      {emailStats.processedEmotions.map((stat) => {
                        const style = getEmotionStyle(stat.name)
                        return (
                          <div key={stat.name} className='space-y-1'>
                            <div className='flex items-center justify-between text-sm'>
                              <div className='flex items-center gap-2'>
                                <span
                                  className={`h-2 w-2 rounded-full ${style.color}`}
                                />
                                {style.icon}
                                <span className='capitalize'>{stat.name}</span>
                              </div>
                              <span className='font-medium'>
                                {stat.percentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className='h-2 w-full rounded-full bg-muted'>
                              <div
                                className={`h-2 rounded-full ${style.color}`}
                                style={{
                                  width: `${stat.percentage.toFixed(0)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : <p className='text-sm text-muted-foreground'>No data available.</p>}
                </CardContent>
              </Card>

              {/* ===== Top Classifications Card ===== */}
              <Card>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-base'>
                    Top Classifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <p className='text-sm text-muted-foreground'>Loading...</p>
                  ) : emailStats.processedClassifications.length > 0 ? (
                    <div className='space-y-4'>
                      {emailStats.processedClassifications.map((stat) => {
                        const style = getClassificationStyle(stat.name)
                        return (
                          <div key={stat.name} className='space-y-1'>
                            <div className='flex items-center justify-between text-sm'>
                              <div className='flex items-center gap-2'>
                                <span
                                  className={`h-2 w-2 rounded-full ${style.color}`}
                                />
                                {style.icon}
                                <span className='capitalize'>{stat.name}</span>
                              </div>
                              <span className='font-medium'>
                                {stat.percentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className='h-2 w-full rounded-full bg-muted'>
                              <div
                                className={`h-2 rounded-full ${style.color}`}
                                style={{
                                  width: `${stat.percentage.toFixed(0)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : <p className='text-sm text-muted-foreground'>No data available.</p>}
                </CardContent>
              </Card>
            </div>
            {error && <p className='text-sm text-destructive'>{error}</p>}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className='pl-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value='calculator' className='space-y-4'>
            <DeliveryFeeCalculator />
          </TabsContent>
          <TabsContent value='chatbot' className='space-y-4'>
            <Chatbot />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Customers',
    href: 'dashboard/customers',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Products',
    href: 'dashboard/products',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Settings',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
]
