$filePath = "d:\cricketwebsite\app\admin\dashboard\page.tsx"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Modals backdrop
$content = $content.Replace("bg-black/75 backdrop-blur-sm", "bg-slate-900/40 backdrop-blur-sm")
$content = $content.Replace("bg-black/80 backdrop-blur-md", "bg-slate-900/40 backdrop-blur-sm")
$content = $content.Replace("bg-black/70 backdrop-blur-sm", "bg-slate-900/40 backdrop-blur-sm")

# Backgrounds
$content = $content.Replace("bg-[#07092e]", "bg-white")
$content = $content.Replace("bg-[#05072c]", "bg-slate-50")
$content = $content.Replace("bg-[#0d0f3a]", "bg-slate-50")
$content = $content.Replace("bg-[#03041c]", "bg-slate-50")

# Shadows
$content = $content.Replace("shadow-black/80", "shadow-slate-900/10")
$content = $content.Replace("shadow-black/90", "shadow-slate-900/10")
$content = $content.Replace("shadow-black/60", "shadow-slate-900/10")
$content = $content.Replace("shadow-black/30", "shadow-sm")
$content = $content.Replace("shadow-black/20", "shadow-sm")

# Borders
$content = $content.Replace("border-zinc-700/60", "border-slate-200")
$content = $content.Replace("border-zinc-800/60", "border-slate-200")
$content = $content.Replace("border-zinc-800", "border-slate-200")
$content = $content.Replace("border-zinc-700", "border-slate-300")
$content = $content.Replace("border-white/5", "border-slate-100")
$content = $content.Replace("border-white/10", "border-slate-200")
$content = $content.Replace("divide-white/5", "divide-slate-100")

# Hovers & micro backgrounds
$content = $content.Replace("hover:bg-white/[0.03]", "hover:bg-slate-50/80")
$content = $content.Replace("bg-white/[0.02]", "bg-slate-50/75")
$content = $content.Replace("bg-white/[0.03]", "bg-slate-50/75")
$content = $content.Replace("hover:bg-white/5", "hover:bg-slate-100")
$content = $content.Replace("hover:bg-white/10", "hover:bg-slate-100")
$content = $content.Replace("bg-white/5", "bg-slate-100")

# Placeholders
$content = $content.Replace("placeholder:text-zinc-600", "placeholder:text-slate-400")
$content = $content.Replace("placeholder-zinc-600", "placeholder:text-slate-400")

# Labels
$content = $content.Replace("text-zinc-400 uppercase", "text-slate-600 uppercase")
$content = $content.Replace("text-zinc-300 uppercase", "text-slate-700 uppercase")

# Input text colors
$content = $content.Replace("text-white rounded-lg", "text-slate-900 rounded-lg")
$content = $content.Replace("text-white rounded-xl", "text-slate-900 rounded-xl")

# Root layout text color
$content = $content.Replace("text-zinc-100 relative", "text-slate-800 relative")

[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Transformation complete!"
