import os
import re

files_map = {
    'dashboard.html': 'dashboard',
    'leads.html': 'leads',
    'tasks.html': 'tasks',
    'customers.html': 'customers',
    'payments.html': 'payments',
    'settings.html': 'settings'
}

# Login has no sidebar/header in the same way, but we will process text replacements
for filename, page_id in files_map.items():
    filepath = os.path.join(r"C:\CRM", filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace tailwind config script
    content = re.sub(r'<script id="tailwind-config">.*?</script>', '<script src="assets/js/tailwind-config.js"></script>', content, flags=re.DOTALL)
    
    # Replace inline styles
    content = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="assets/css/style.css">', content, flags=re.DOTALL)
    
    # Replace aside (sidebar)
    content = re.sub(r'<aside.*?</aside>', '<div id="sidebar-container"></div>', content, flags=re.DOTALL)
    
    # Replace header (topbar)
    content = re.sub(r'<header.*?</header>', '<div id="header-container"></div>', content, flags=re.DOTALL)
    
    # Add data-page to body
    content = re.sub(r'<body(.*?)>', r'<body\1 data-page="' + page_id + '">', content, count=1)
    
    # Inject layout script at end of body
    script_injection = f'''
    <script src="assets/js/layout.js"></script>
    <script src="assets/js/app.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {{
            injectLayout('{page_id}');
        }});
    </script>
</body>'''
    content = re.sub(r'</body>', script_injection, content)
    
    # Keyword Replacements (Yến sào -> Spa services)
    replacements = {
        "Yến sào Thượng hạng": "Thermage FLX Cao cấp",
        "Yến sào cao cấp": "Meso Căng bóng VIP",
        "Combo Yến sào": "Combo Trẻ hóa da",
        "Yến sào": "Trẻ hóa da",
        "Yến huyết": "Tắm trắng Collagen 4D",
        "Yến chưng tươi": "Ultherapy",
        "Yến chưng": "Ultherapy",
        "Yến": "Thermage"
    }
    for old, new in replacements.items():
        content = content.replace(old, new)
        content = content.replace(old.lower(), new)
        content = content.replace(old.capitalize(), new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
# Process login.html specifically (no sidebar/header injection needed)
login_path = os.path.join(r"C:\CRM", 'login.html')
if os.path.exists(login_path):
    with open(login_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(r'<script id="tailwind-config">.*?</script>', '<script src="assets/js/tailwind-config.js"></script>', content, flags=re.DOTALL)
    content = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="assets/css/style.css">', content, flags=re.DOTALL)
    # Convert "Quản lý công việc" link to dashboard if needed, or make form submit to dashboard
    content = content.replace('href="#"', 'href="dashboard.html"')
    content = content.replace('type="submit"', 'type="button" onclick="window.location.href=\'dashboard.html\'"')
    with open(login_path, 'w', encoding='utf-8') as f:
        f.write(content)
