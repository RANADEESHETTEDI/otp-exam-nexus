// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pwvunjalnylzumdkwjij.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dnVuamFsbnlsenVtZGt3amlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMDQyNzYsImV4cCI6MjA1ODU4MDI3Nn0.swik6kz-QiP0T4oVzio_RRBFcG2AcJ2U7XYySbfx6r8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);