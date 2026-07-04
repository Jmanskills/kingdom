/* Kingdom — Supabase config
   Fill these in from your Supabase project:
   Project Settings → API → Project URL / anon public key */

const SUPABASE_URL = 'https://jswsndzdfplggebjigzd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzd3NuZHpkZnBsZ2dlYmppZ3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjkxNjYsImV4cCI6MjA5ODc0NTE2Nn0.hsDtuylSBhpmikgSGFZ7YVLgl5ubspYiRu6Al0iswvA';

// Single shared Supabase client used by kingdom-auth.js and kingdom-friends.js
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);