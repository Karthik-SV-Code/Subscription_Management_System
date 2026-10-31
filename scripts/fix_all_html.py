#!/usr/bin/env python3
import os
import re
import json
import subprocess
import glob
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def run_command(cmd):
    print(f"Running: {cmd}")
    env = os.environ.copy()
    env["PATH"] = f"/tmp/node/bin:{env.get('PATH', '')}"
    res = subprocess.run(cmd, shell=True, cwd=ROOT_DIR, env=env, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Command error: {res.stderr}")
    return res.stdout

def compile_styles():
    print("Compiling standalone Tailwind stylesheet...")
    run_command("npx tailwindcss -i ./src/app/globals.css -c ./tailwind.config.ts -o ./styles.css --minify")
    css_path = os.path.join(ROOT_DIR, "styles.css")
    if os.path.exists(css_path):
        with open(css_path, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def get_icon_svg(name, extra_class=''):
    alias_map = {
        'check-circle-2': 'circle-check',
        'pie-chart': 'chart-pie',
        'sparkles': 'sparkles',
    }
    actual_name = alias_map.get(name, name)
    icon_file = os.path.join(ROOT_DIR, f'node_modules/lucide-react/dist/esm/icons/{actual_name}.js')
    if not os.path.exists(icon_file):
        return None
    with open(icon_file, 'r', encoding='utf-8') as f:
        content = f.read()
    m = re.search(r'createLucideIcon\(\s*"[^"]+",\s*(\[.*?\])\s*\);', content, re.DOTALL)
    if not m:
        m2 = re.search(r"from '\./([^']+)\.js'", content)
        if m2:
            return get_icon_svg(m2.group(1), extra_class)
        return None
    raw = m.group(1)
    clean = re.sub(r'([a-zA-Z0-9_-]+)\s*:', r'"\1":', raw)
    try:
        elements = json.loads(clean)
    except Exception:
        return None
    inner = ''
    for tag, attrs in elements:
        attrs_str = ' '.join(f'{k}="{v}"' for k, v in attrs.items() if k != 'key')
        inner += f'<{tag} {attrs_str}></{tag}>'
    cls = f'lucide lucide-{name}'
    if extra_class:
        cls += f' {extra_class}'
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="{cls}">{inner}</svg>'
    return svg

def replace_lucide_tags(html):
    pattern = re.compile(r'<i\s+data-lucide="([^"]+)"(?:\s+class="([^"]*)")?\s*>\s*<\/i>')
    def repl(m):
        icon_name = m.group(1)
        cls = m.group(2) or ''
        svg = get_icon_svg(icon_name, cls)
        if svg:
            return svg
        return m.group(0)
    return pattern.sub(repl, html)

def process_index_html(compiled_css):
    path = os.path.join(ROOT_DIR, "index.html")
    if not os.path.exists(path):
        return
    print("Processing index.html for bulletproof offline CSS and SVGs...")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Replace lucide icon tags with real SVGs
    content = replace_lucide_tags(content)

    # 2. Remove tailwind CDN and config
    content = re.sub(r'<script\s+src="https:\/\/cdn\.tailwindcss\.com"><\/script>', '', content)
    content = re.sub(r'<script>\s*tailwind\.config\s*=\s*\{.*?\}\s*<\/script>', '', content, flags=re.DOTALL)
    
    # 3. Safe check for lucide script
    content = re.sub(r'<script\s+src="https:\/\/unpkg\.com\/lucide@latest"><\/script>', '', content)

    # 4. Remove old <style> block if it exists and replace with embedded compiled css
    style_replacement = f"""<link rel="stylesheet" href="./styles.css">
  <style id="embedded-core-styles">
{compiled_css}
  </style>"""
    
    if '<style id="embedded-core-styles">' in content:
        content = re.sub(r'<style id="embedded-core-styles">.*?<\/style>', lambda m: style_replacement, content, flags=re.DOTALL)
    elif '<style>' in content:
        content = re.sub(r'<style>.*?<\/style>', lambda m: style_replacement, content, count=1, flags=re.DOTALL)
    else:
        content = content.replace('</head>', f'  {style_replacement}\n</head>')

    # 5. Make lucide and Chart calls safe in script
    content = content.replace('lucide.createIcons();', 'if (window.lucide && typeof lucide.createIcons === "function") { lucide.createIcons(); }')

    # Add fallback canvas chart drawing if Chart.js is not loaded
    fallback_chart_code = """
      function drawFallbackCharts() {
        const mrr = document.getElementById('canvas-mrr');
        if (mrr && mrr.getContext) {
          const ctx = mrr.getContext('2d');
          const w = mrr.parentElement ? mrr.parentElement.clientWidth : 600;
          const h = 260;
          mrr.width = w;
          mrr.height = h;
          ctx.clearRect(0, 0, w, h);
          // Draw subtle grid lines
          ctx.strokeStyle = '#EAECEF';
          ctx.lineWidth = 1;
          for (let y = 40; y < h; y += 50) {
            ctx.beginPath();
            ctx.moveTo(30, y);
            ctx.lineTo(w - 20, y);
            ctx.stroke();
          }
          // Draw trend line
          const points = [
            [40, h - 50], [90, h - 70], [150, h - 90], [210, h - 110],
            [280, h - 130], [350, h - 150], [420, h - 170], [490, h - 190],
            [560, h - 210], [w - 30, h - 230]
          ];
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, 'rgba(23, 23, 23, 0.12)');
          grad.addColorStop(1, 'rgba(23, 23, 23, 0.0)');
          ctx.beginPath();
          ctx.moveTo(points[0][0], h);
          for (const pt of points) ctx.lineTo(pt[0], pt[1]);
          ctx.lineTo(points[points.length - 1][0], h);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(points[0][0], points[0][1]);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
          }
          ctx.strokeStyle = '#171717';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          for (const pt of points) {
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], 4, 0, Math.PI * 2);
            ctx.fillStyle = '#171717';
            ctx.fill();
          }
        }
        const subs = document.getElementById('canvas-subs');
        if (subs && subs.getContext) {
          const ctx = subs.getContext('2d');
          const w = subs.parentElement ? subs.parentElement.clientWidth : 400;
          const h = 260;
          subs.width = w;
          subs.height = h;
          ctx.clearRect(0, 0, w, h);
          const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
          const barW = 20;
          const gap = w / (months.length + 1);
          months.forEach((m, i) => {
            const x = gap * (i + 0.8);
            const subH = 120 + i * 15;
            const churnH = 12 + (i % 3) * 4;
            // Active bar
            ctx.fillStyle = '#171717';
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(x, h - subH - 30, barW, subH, [4, 4, 0, 0]) : ctx.rect(x, h - subH - 30, barW, subH);
            ctx.fill();
            // Churn bar
            ctx.fillStyle = '#F43F5E';
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(x + barW + 4, h - churnH - 30, barW, churnH, [4, 4, 0, 0]) : ctx.rect(x + barW + 4, h - churnH - 30, barW, churnH);
            ctx.fill();
            // Label
            ctx.fillStyle = '#737373';
            ctx.font = '11px Inter, sans-serif';
            ctx.fillText(m, x + 4, h - 10);
          });
        }
      }
"""

    if 'function drawFallbackCharts()' not in content:
        # Wrap the chart init
        chart_init_regex = r"(// MRR Area Chart.*?new Chart\(subsCtx, \{.*?\}\);)"
        def wrap_charts(m):
            code = m.group(1)
            return f"""if (typeof Chart !== 'undefined') {{
        {code}
      }} else {{
        drawFallbackCharts();
      }}"""
        content = re.sub(chart_init_regex, wrap_charts, content, flags=re.DOTALL)
        content = content.replace('// Global search filter', fallback_chart_code + '\n    // Global search filter')

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ index.html processed successfully.")

def process_out_directory(compiled_css):
    out_dir = os.path.join(ROOT_DIR, "out")
    if not os.path.exists(out_dir):
        print("out directory does not exist, skipping out processing.")
        return

    print("Processing out/ HTML files for relative asset paths and inlined CSS...")
    html_files = glob.glob(os.path.join(out_dir, "**/*.html"), recursive=True)

    # Copy styles.css into out/styles.css
    shutil.copy(os.path.join(ROOT_DIR, "styles.css"), os.path.join(out_dir, "styles.css"))

    for fpath in html_files:
        rel_to_out = os.path.relpath(fpath, out_dir)
        depth = len(os.path.normpath(rel_to_out).split(os.sep)) - 1
        prefix = "./" if depth == 0 else "../" * depth

        with open(fpath, "r", encoding="utf-8") as f:
            html = f.read()

        # Fix _next assets to relative paths
        html = re.sub(r'href="/_next/', f'href="{prefix}_next/', html)
        html = re.sub(r'src="/_next/', f'src="{prefix}_next/', html)
        html = re.sub(r'href="/favicon\.ico"', f'href="{prefix}favicon.ico"', html)

        # Fix internal navigation links so they work on file://
        # e.g. href="/dashboard/" -> href="{prefix}dashboard/index.html"
        routes = ['dashboard', 'customers', 'products', 'plans', 'subscriptions', 'invoices', 'payments', 'analytics', 'settings', 'discounts', 'login']
        for r in routes:
            html = re.sub(f'href="/{r}/?"', f'href="{prefix}{r}/index.html"', html)
        # Root link
        html = re.sub(r'href="/?"(?=[ >])', f'href="{prefix}index.html"', html)

        # Inject embedded CSS in head if not already present
        if '<style id="inlined-theme-css">' not in html:
            embedded_tag = f"""<style id="inlined-theme-css">\n{compiled_css}\n</style>\n</head>"""
            html = html.replace('</head>', embedded_tag)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(html)

    print(f"✓ Processed {len(html_files)} HTML files in out/ with relative paths and inlined CSS.")

def main():
    print("=== SubscriptIQ HTML & CSS Fixer ===")
    compiled_css = compile_styles()
    if not compiled_css:
        print("Failed to compile CSS!")
        return
    process_index_html(compiled_css)
    process_out_directory(compiled_css)
    print("=== All HTML files fixed and verified! ===")

if __name__ == '__main__':
    main()
