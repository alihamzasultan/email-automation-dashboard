'use client'

import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

// ===== Data and Components for Chatbot =====

type Message = {
  id: number
  text: string
  sender: 'user' | 'bot'
}

function Chatbot() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState('')
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const dummyReplies = [
    "I'm checking on that for you. One moment...",
    'Can you provide the customer ID or order number?',
    'That sounds like a great opportunity! Let me pull up the relevant product information.',
    'I see. Based on our current inventory, I can suggest an alternative.',
    'Thank you for the update. I have logged it in the system.',
    "I'm sorry, I'm just a demo bot and can't process that specific request yet.",
  ]

  // Greet the user on component mount
  React.useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your sales assistant. How can I help you today?",
        sender: 'bot',
      },
    ])
  }, [])

  // Auto-scroll to the latest message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() === '') return

    const newUserMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    }
    setMessages((prev) => [...prev, newUserMessage])
    setInput('')

    // Simulate a bot reply after a short delay
    setTimeout(() => {
      const randomReply =
        dummyReplies[Math.floor(Math.random() * dummyReplies.length)]
      const botReply: Message = {
        id: Date.now() + 1,
        text: randomReply,
        sender: 'bot',
      }
      setMessages((prev) => [...prev, botReply])
    }, 1200)
  }

  return (
    <Card className='mx-auto w-full max-w-3xl'>
      <CardHeader>
        <CardTitle>Sales Assistant</CardTitle>
        <CardDescription>
          Chat with your AI assistant for sales insights and support.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex h-[60vh] flex-col'>
        <ScrollArea className='flex-grow pr-4'>
          <div className='space-y-4'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <Avatar className='h-8 w-8'>
                    {/* Placeholder for bot avatar */}
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 text-sm lg:max-w-md ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.text}
                </div>
                {message.sender === 'user' && (
                  <Avatar className='h-8 w-8'>
                    {/* Placeholder for user avatar */}
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <form
          onSubmit={handleSendMessage}
          className='mt-4 flex w-full items-center space-x-2 border-t pt-4'
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type a message...'
            autoComplete='off'
          />
          <Button type='submit'>Send</Button>
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

export default function Dashboard() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
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
              {/* <TabsTrigger value='analytics' disabled>
                Analytics
              </TabsTrigger> */}
              {/* <TabsTrigger value='reports' disabled>
                Reports
              </TabsTrigger>
              <TabsTrigger value='notifications' disabled>
                Notifications
              </TabsTrigger> */}
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
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Sales</CardTitle>
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
                    <rect width='20' height='14' x='2' y='5' rx='2' />
                    <path d='M2 10h20' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>+12,234</div>
                  <p className='text-muted-foreground text-xs'>
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Active Now
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
                    <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>+573</div>
                  <p className='text-muted-foreground text-xs'>
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>
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
