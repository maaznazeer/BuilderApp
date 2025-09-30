import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://serfcnqhuuqqtzgzvoln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcmZjbnFodXVxcXR6Z3p2b2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTUxOTgsImV4cCI6MjA3MDA5MTE5OH0.UeilH0PBUNuNOHSng8NRp0Q2mgbX0lytoj5bdyBxJHA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);