// app/dashboard/components/delivery-fee-calculator.tsx

'use client'

import * as React from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import { renderToStaticMarkup } from 'react-dom/server'
import { Check, ChevronsUpDown, MapPin } from 'lucide-react'

import { cn } from '@/lib/utils' // Make sure this path is correct for your project
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator' // Added for visual separation

// ===== TYPE DEFINITIONS =====
type Destination = {
  name: string
  miles: number
  lat: number
  lng: number
}

type FeeDetails = {
  laborCost: number
  gasCost: number
  subtotal: number
  suggestedFee: number
  roundTripMiles: number
  estHours: number
  tollsAndExtras: number
}

// ===== DATA AND CONSTANTS =====
const destinations: Destination[] = [
  { name: 'West Palm Beach (Local)', miles: 5, lat: 26.7153, lng: -80.0534 },
  { name: 'Palm Beach Gardens', miles: 15, lat: 26.8242, lng: -80.1386 },
  { name: 'Jupiter', miles: 19, lat: 26.9342, lng: -80.0942 },
  { name: 'Lake Worth', miles: 10, lat: 26.6159, lng: -80.0573 },
  { name: 'Boynton Beach', miles: 17, lat: 26.5251, lng: -80.0628 },
  { name: 'Delray Beach', miles: 24, lat: 26.4615, lng: -80.0728 },
  { name: 'Boca Raton', miles: 28, lat: 26.3587, lng: -80.0831 },
  { name: 'Fort Lauderdale', miles: 47, lat: 26.1224, lng: -80.1373 },
  { name: 'Miami', miles: 71, lat: 25.7617, lng: -80.1918 },
  { name: 'Homestead', miles: 100, lat: 25.4687, lng: -80.4776 },
  { name: 'Key West', miles: 230, lat: 24.5551, lng: -81.78 },
  { name: 'Port St. Lucie', miles: 50, lat: 27.2931, lng: -80.3503 },
  { name: 'Orlando', miles: 170, lat: 28.5383, lng: -81.3792 },
  { name: 'Tampa', miles: 210, lat: 27.9506, lng: -82.4572 },
  { name: 'Jacksonville', miles: 279, lat: 30.3322, lng: -81.6557 },
]

// Default (blue) icon for non-selected points like Home Base
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Custom (red) icon for the selected destination
const customIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const HOME_BASE = { lat: 26.7153, lng: -80.0534, name: 'Home Base' }

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// ===== HELPER COMPONENTS =====

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  React.useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 })
  }, [center, zoom, map])
  return null
}

function MapClickHandler({ onMapClick, isActive }: { onMapClick: (latlng: L.LatLng) => void; isActive: boolean }) {
  useMapEvents({
    click(e) {
      if (isActive) {
        onMapClick(e.latlng)
      }
    },
  })
  return null
}

function MapSearch({ onLocationFound }: { onLocationFound: (location: any) => void }) {
  const map = useMap()

  React.useEffect(() => {
    const provider = new OpenStreetMapProvider()

    const searchControl = GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: false, // We handle the marker rendering ourselves
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
    })

    map.addControl(searchControl)

    const handleShowLocation = (result: any) => {
      const location = result?.location
      if (location) {
        onLocationFound({
          x: location.x, // longitude
          y: location.y, // latitude
          label: location.label,
        })
      }
    }

    map.on('geosearch/showlocation', handleShowLocation)

    return () => {
      map.removeControl(searchControl)
      map.off('geosearch/showlocation', handleShowLocation)
    }
  }, [map, onLocationFound])

  return null
}

function PinDropControl({ isPinDropMode, onToggle }: { isPinDropMode: boolean; onToggle: () => void }) {
  const map = useMap()

  React.useEffect(() => {
    const controlContainer = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
    const button = L.DomUtil.create('a', 'leaflet-control-button', controlContainer)
    button.innerHTML = renderToStaticMarkup(<MapPin size={18} />)
    button.href = '#'
    button.role = 'button'
    button.title = 'Drop a pin to select a custom location'

    const updateStyle = () => {
      if (isPinDropMode) L.DomUtil.addClass(button, 'active')
      else L.DomUtil.removeClass(button, 'active')
    }
    updateStyle()

    L.DomEvent.on(button, 'click', L.DomEvent.stop).on(button, 'click', onToggle)

    const CustomControl = L.Control.extend({
      onAdd: () => controlContainer,
      onRemove: () => {
        L.DomEvent.off(button, 'click', onToggle)
      },
    })

    const customControlInstance = new (CustomControl as any)({ position: 'topleft' })
    map.addControl(customControlInstance)

    return () => {
      map.removeControl(customControlInstance)
    }
  }, [map, isPinDropMode, onToggle])

  return null
}

function LocationMap({
  destinations,
  selected,
  customLocation,
  isPinDropMode,
  onMapClick,
  onLocationFound,
  onTogglePinDrop,
}: {
  destinations: Destination[]
  selected: string
  customLocation: Destination | null
  isPinDropMode: boolean
  onMapClick: (latlng: L.LatLng) => void
  onLocationFound: (location: any) => void
  onTogglePinDrop: () => void
}) {
  // Find the single destination to display, if any is selected
  const selectedDestination =
    (customLocation && customLocation.name === selected
      ? customLocation
      : destinations.find((d) => d.name === selected)) || null

  // Center map on selected destination, or home base if none is selected
  const mapCenter: [number, number] = selectedDestination
    ? [selectedDestination.lat, selectedDestination.lng]
    : [HOME_BASE.lat, HOME_BASE.lng]

  const mapZoom = selectedDestination ? 12 : 10

  return (
    <Card className='overflow-hidden'>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={false}
        className='h-full w-full min-h-[400px] md:min-h-[600px] z-0'
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {/* Always show Home Base marker */}
        <Marker key={HOME_BASE.name} position={[HOME_BASE.lat, HOME_BASE.lng]} icon={defaultIcon}>
          <Popup>{HOME_BASE.name}</Popup>
        </Marker>

        {/* Show a single red marker ONLY for the selected destination */}
        {selectedDestination && (
          <Marker
            key={selectedDestination.name}
            position={[selectedDestination.lat, selectedDestination.lng]}
            icon={customIcon}
          >
            <Popup>{selectedDestination.name}</Popup>
          </Marker>
        )}

        <MapSearch onLocationFound={onLocationFound} />
        <MapClickHandler onMapClick={onMapClick} isActive={isPinDropMode} />
        <PinDropControl isPinDropMode={isPinDropMode} onToggle={onTogglePinDrop} />
      </MapContainer>
    </Card>
  )
}

// ===== BACKEND SIMULATION =====
const calculateFeeOnBackend = async (miles: number, tolls: number, extras: number): Promise<FeeDetails> => {
  console.log(`Simulating backend call for ${miles} miles with tolls: ${tolls}, extras: ${extras}`)
  const driverRate = 22.5,
    gasPrice = 3.5,
    mpg = 15.0,
    avgSpeed = 50.0,
    margin = 0.15
  await new Promise((resolve) => setTimeout(resolve, 500))
  const oneWayMiles = miles,
    roundTripMiles = oneWayMiles * 2,
    estHours = roundTripMiles > 0 ? roundTripMiles / avgSpeed : 0,
    laborCost = estHours * driverRate,
    gallons = roundTripMiles > 0 ? roundTripMiles / mpg : 0,
    gasCost = gallons * gasPrice,
    tollsAndExtras = tolls + extras,
    subtotal = laborCost + gasCost + tollsAndExtras,
    suggestedFee = subtotal * (1 + margin)
  return { roundTripMiles, estHours, laborCost, gasCost, tollsAndExtras, subtotal, suggestedFee }
}

// ===== MAIN COMPONENT =====
export default function DeliveryFeeCalculator() {
  const [destination, setDestination] = React.useState('') // Start with no destination selected
  const [tolls, setTolls] = React.useState(0.0)
  const [extras, setExtras] = React.useState(0.0)
  const [feeDetails, setFeeDetails] = React.useState<FeeDetails | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [customLocation, setCustomLocation] = React.useState<Destination | null>(null)
  const [isPinDropMode, setIsPinDropMode] = React.useState(false)
  const [isComboboxOpen, setIsComboboxOpen] = React.useState(false)

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError(null)
      const selectedDest = destinations.find((d) => d.name === destination) || customLocation
      if (!selectedDest) throw new Error('Invalid destination selected.')
      const result = await calculateFeeOnBackend(selectedDest.miles, tolls, extras)
      setFeeDetails(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for selecting a PREDEFINED destination from the list
  const handleDestinationSelect = (selectedName: string) => {
    setDestination(selectedName)
    setCustomLocation(null) // Clear any custom location when selecting a predefined one
    setFeeDetails(null)
    setIsPinDropMode(false)
    setIsComboboxOpen(false)
  }

  // Resets the form and map to the initial state
  const handleClear = () => {
    setDestination('')
    setCustomLocation(null)
    setFeeDetails(null)
    setTolls(0.0)
    setExtras(0.0)
    setIsPinDropMode(false)
    setError(null)
  }

  const setCustomPoint = (lat: number, lng: number, label?: string) => {
    const miles = calculateDistance(HOME_BASE.lat, HOME_BASE.lng, lat, lng)
    const newName = label
      ? `${label.split(',')[0]} (~${miles.toFixed(0)} mi)`
      : `Custom Location (~${miles.toFixed(0)} mi)`
    const newCustomLocation: Destination = { name: newName, miles, lat, lng }
    setCustomLocation(newCustomLocation)
    setDestination(newName) // Set the new custom location as the current destination
    setFeeDetails(null)
  }

  const handleMapClick = (latlng: L.LatLng) => {
    setCustomPoint(latlng.lat, latlng.lng)
    setIsPinDropMode(false)
  }

  const handleSearchLocationFound = (location: any) => {
    setCustomPoint(location.y, location.x, location.label)
    setIsPinDropMode(false)
  }

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${isPinDropMode ? 'pin-drop-active' : ''}`}>
      <div className='lg:col-span-1 space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Route Calculator</CardTitle>
            <CardDescription>Select a destination, search, or drop a pin on the map.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className='grid gap-4'>
              <div className='space-y-1'>
                <Label htmlFor='destination'>Destination</Label>
                {/* NEW: Searchable Combobox for destinations */}
                <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      aria-expanded={isComboboxOpen}
                      className='w-full justify-between'
                    >
                      {destination
                        ? (customLocation && customLocation.name === destination
                            ? customLocation.name
                            : destinations.find((d) => d.name === destination)?.name) || 'Select a destination'
                        : 'Select a destination...'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
                    <Command>
                      <CommandInput placeholder='Search destination...' />
                      <CommandList>
                        <CommandEmpty>No destination found.</CommandEmpty>
                        <CommandGroup>
                          {customLocation && (
                            <CommandItem
                              value={customLocation.name}
                              onSelect={(currentValue) => {
                                setDestination(currentValue === destination ? '' : currentValue)
                                setIsComboboxOpen(false)
                              }}
                            >
                              <Check
                                className={cn('mr-2 h-4 w-4', destination === customLocation.name ? 'opacity-100' : 'opacity-0')}
                              />
                              {customLocation.name}
                            </CommandItem>
                          )}
                          {destinations.map((d) => (
                            <CommandItem key={d.name} value={d.name} onSelect={() => handleDestinationSelect(d.name)}>
                              <Check className={cn('mr-2 h-4 w-4', destination === d.name ? 'opacity-100' : 'opacity-0')} />
                              {d.name} ({d.miles} mi)
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className='space-y-1'>
                <Label htmlFor='tolls'>Tolls ($)</Label>
                <Input
                  id='tolls'
                  type='number'
                  step='0.01'
                  value={tolls}
                  onChange={(e) => setTolls(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='extras'>Extras ($)</Label>
                <Input
                  id='extras'
                  type='number'
                  step='0.01'
                  value={extras}
                  onChange={(e) => setExtras(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className='flex items-center gap-2'>
                <Button type='submit' disabled={isLoading || !destination} className='flex-1'>
                  {isLoading ? 'Calculating...' : 'Calculate Fee'}
                </Button>
                <Button type='button' variant='outline' onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {error && <p className='text-sm text-red-500'>{error}</p>}

        {/* ===== IMPROVED FEE BREAKDOWN CARD ===== */}
        {feeDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Fee Breakdown</CardTitle>
              <CardDescription>An estimate based on the selected route and inputs.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Route Details */}
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Round Trip Distance</span>
                  <span className='font-medium'>{feeDetails.roundTripMiles.toFixed(1)} miles</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Estimated Drive Time</span>
                  <span className='font-medium'>{feeDetails.estHours.toFixed(2)} hours</span>
                </div>
              </div>

              <Separator />

              {/* Cost Breakdown */}
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Labor Cost</span>
                  <span>${feeDetails.laborCost.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Gas Cost</span>
                  <span>${feeDetails.gasCost.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Tolls & Extras</span>
                  <span>${feeDetails.tollsAndExtras.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className='space-y-3'>
                <div className='flex justify-between text-sm font-semibold'>
                  <span>Subtotal</span>
                  <span>${feeDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className='flex justify-between items-center rounded-lg bg-muted p-3'>
                  <span className='text-lg font-bold'>Suggested Fee</span>
                  <span className='text-2xl font-extrabold text-primary'>${feeDetails.suggestedFee.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className='lg:col-span-2'>
        <LocationMap
          destinations={destinations}
          selected={destination}
          customLocation={customLocation}
          isPinDropMode={isPinDropMode}
          onMapClick={handleMapClick}
          onLocationFound={handleSearchLocationFound}
          onTogglePinDrop={() => setIsPinDropMode((prev) => !prev)}
        />
      </div>
    </div>
  )
}