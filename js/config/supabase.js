// js/config/supabase.js
(function () {
    'use strict';

    const SUPABASE_URL = 'https://aykdjgxienpoyteiuhpy.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5a2RqZ3hpZW5wb3l0ZWl1aHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzA5NTQsImV4cCI6MjA5MTAwNjk1NH0.nDXNrgDG7eocERZzVdbCn5u28MZQisQo1kNA7g4TcwY';

    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase library not loaded');
        return;
    }

    if (!window.__supabaseClient) {
        window.__supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                flowType: 'pkce'   // ← cambio clave
            }
        });
        console.log('✅ Supabase initialized');
    }

    window.SupabaseClient = window.__supabaseClient;

})();
