// supabase.js - Khởi tạo Supabase client hỗ trợ cả Dev local (static) và Production (bundler / env)

(function () {
    let supabaseUrl = '';
    let supabaseKey = '';

    // 1. Kiểm tra nếu có biến môi trường (Vite/Bundler)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    }

    // 2. Fallback sang SUPABASE_CONFIG được cấu hình tĩnh trong config.js
    if (!supabaseUrl && typeof SUPABASE_CONFIG !== 'undefined') {
        supabaseUrl = SUPABASE_CONFIG.url;
        supabaseKey = SUPABASE_CONFIG.anonKey;
    }

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
        console.warn('Supabase credentials are not configured. Please edit assets/js/config.js or configure environment variables.');
    }

    if (typeof supabase === 'undefined') {
        console.error('Supabase SDK is not loaded. Please include <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> in your HTML.');
        return;
    }

    // Tạo global client
    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully.');
})();
