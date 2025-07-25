import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://wxynstpanhlkgdjexhrp.supabase.co', // Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4eW5zdHBhbmhsa2dkamV4aHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMjAwNjUsImV4cCI6MjA2ODg5NjA2NX0.p_YbeN2FUXusUFmcL4eOQbTivUtdEupvSnaa8WoFOZc' 
)
