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

def process_out_directory(compiled_css):
    out_dir = os.path.join(ROOT_DIR, "out")
    if not os.path.exists(out_dir):
        print("out directory does not exist, skipping out processing.")
        return

    print("Processing out/ HTML files for relative asset paths, inlined CSS, and interactive fallbacks...")
    html_files = glob.glob(os.path.join(out_dir, "**/*.html"), recursive=True)

    # Copy styles.css into out/styles.css
    shutil.copy(os.path.join(ROOT_DIR, "styles.css"), os.path.join(out_dir, "styles.css"))

    # Client-side enhancer script for offline file:// viewing and seamless interactivity
    enhancer_script = """<script id="offline-interactive-enhancer">
(function() {
  // 1. Capture-phase navigation link interception for file:// protocol
  // When viewed as local files, Next.js client router intercepts clicks in the bubble phase and calls e.preventDefault().
  // Because fetch() is blocked by browser CORS on file:// (origin null), navigation fails.
  // By capturing clicks at document level in the capture phase on file://, we navigate directly.
  if (window.location.protocol === 'file:') {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href]');
      if (link && link.href) {
        var rawHref = link.getAttribute('href');
        if (rawHref && !rawHref.startsWith('#') && !rawHref.startsWith('javascript:')) {
          e.stopImmediatePropagation();
          e.preventDefault();
          window.location.href = link.href;
        }
      }
    }, true);
  }

  // 2. Global event-delegated sidebar expand/shrink toggle
  document.addEventListener('click', function(e) {
    var toggleBtn = e.target.closest('#sidebar-brand-header, #sidebar-collapse-btn');
    if (toggleBtn) {
      var aside = document.getElementById('app-sidebar');
      var container = document.getElementById('desktop-sidebar-container');
      var mainViewport = document.getElementById('main-content-viewport');
      if (!aside) return;

      var isExpanded = aside.classList.contains('sidebar-expanded') || (!aside.classList.contains('sidebar-shrunk') && aside.classList.contains('w-64'));
      if (isExpanded) {
        aside.classList.remove('sidebar-expanded', 'w-64');
        aside.classList.add('sidebar-shrunk', 'w-20');
        if (container) {
          container.classList.remove('sidebar-expanded', 'md:w-64');
          container.classList.add('md:w-20');
        }
        if (mainViewport) {
          mainViewport.classList.remove('sidebar-expanded', 'md:pl-64');
          mainViewport.classList.add('md:pl-20');
        }
      } else {
        aside.classList.add('sidebar-expanded', 'w-64');
        aside.classList.remove('sidebar-shrunk', 'w-20');
        if (container) {
          container.classList.add('sidebar-expanded', 'md:w-64');
          container.classList.remove('md:w-20');
        }
        if (mainViewport) {
          mainViewport.classList.add('sidebar-expanded', 'md:pl-64');
          mainViewport.classList.remove('md:pl-20');
        }
      }
    }
  });

  // 3. Mobile Drawer Hamburger & Overlay handling
  document.addEventListener('click', function(e) {
    var headerBtn = e.target.closest('header button');
    var overlay = document.getElementById('mobile-drawer-overlay');
    var drawer = document.getElementById('mobile-drawer-sidebar');

    if (headerBtn && drawer) {
      var isHidden = drawer.classList.contains('-translate-x-full');
      if (isHidden) {
        drawer.classList.remove('-translate-x-full');
        drawer.classList.add('translate-x-0');
        if (overlay) overlay.classList.remove('hidden');
      } else {
        drawer.classList.add('-translate-x-full');
        drawer.classList.remove('translate-x-0');
        if (overlay) overlay.classList.add('hidden');
      }
    } else if (e.target.closest('#mobile-drawer-overlay')) {
      if (drawer) {
        drawer.classList.add('-translate-x-full');
        drawer.classList.remove('translate-x-0');
      }
      if (overlay) overlay.classList.add('hidden');
    }
  });
})();
</script>"""

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
        routes = ['dashboard', 'customers', 'products', 'plans', 'subscriptions', 'invoices', 'payments', 'analytics', 'settings', 'discounts', 'login']
        for r in routes:
            html = re.sub(f'href="/{r}/?"', f'href="{prefix}{r}/index.html"', html)
        # Root link
        html = re.sub(r'href="/?"(?=[ >])', f'href="{prefix}index.html"', html)

        # Inject embedded CSS in head
        if '<style id="inlined-theme-css">' in html:
            html = re.sub(r'<style id="inlined-theme-css">.*?</style>', f'<style id="inlined-theme-css">\n{compiled_css}\n</style>', html, flags=re.DOTALL)
        else:
            embedded_tag = f"""<style id="inlined-theme-css">\n{compiled_css}\n</style>\n</head>"""
            html = html.replace('</head>', embedded_tag)

        # Inject offline enhancer script
        if '<script id="offline-interactive-enhancer">' in html:
            html = re.sub(r'<script id="offline-interactive-enhancer">.*?</script>', enhancer_script, html, flags=re.DOTALL)
        else:
            html = html.replace('</body>', f'{enhancer_script}\n</body>')

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(html)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(html)

    print(f"✓ Processed {len(html_files)} HTML files in out/ with relative paths, inlined CSS, and enhancer script.")

def sync_out_to_root():
    out_dir = os.path.join(ROOT_DIR, "out")
    if not os.path.exists(out_dir):
        return

    print("Syncing actual Next.js application from out/ to project root...")

    # 1. Copy out/index.html -> ./index.html
    shutil.copy(os.path.join(out_dir, "index.html"), os.path.join(ROOT_DIR, "index.html"))
    print("✓ root index.html is now the actual Next.js application!")

    # 2. Copy out/_next/ -> ./_next/
    out_next = os.path.join(out_dir, "_next")
    root_next = os.path.join(ROOT_DIR, "_next")
    if os.path.exists(out_next):
        if os.path.exists(root_next):
            shutil.rmtree(root_next)
        shutil.copytree(out_next, root_next)
        print("✓ synced _next/ directory to root")

    # 3. Copy route directories
    routes = ['dashboard', 'customers', 'products', 'plans', 'subscriptions', 'invoices', 'payments', 'analytics', 'settings', 'discounts', 'login', '404']
    for r in routes:
        src_r = os.path.join(out_dir, r)
        dst_r = os.path.join(ROOT_DIR, r)
        if os.path.exists(src_r):
            if os.path.exists(dst_r):
                shutil.rmtree(dst_r)
            shutil.copytree(src_r, dst_r)

    # 4. Copy 404.html
    if os.path.exists(os.path.join(out_dir, "404.html")):
        shutil.copy(os.path.join(out_dir, "404.html"), os.path.join(ROOT_DIR, "404.html"))

    print("✓ All Next.js routes and assets synced to root.")

def main():
    print("=== SubscriptIQ Next.js HTML & Static App Sync ===")
    compiled_css = compile_styles()
    if not compiled_css:
        print("Failed to compile CSS!")
        return
    process_out_directory(compiled_css)
    sync_out_to_root()
    print("=== Next.js application is now live as root index.html! ===")

if __name__ == '__main__':
    main()
