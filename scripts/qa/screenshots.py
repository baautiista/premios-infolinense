# Capturas de pantalla en móvil y escritorio. Uso: python3 scripts/qa/screenshots.py http://localhost:8787 /ruta1 /ruta2 ...
import sys, asyncio, re
from playwright.async_api import async_playwright
base = sys.argv[1]; paths = sys.argv[2:] or ['/']
out = 'screenshots'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, vp, mobile in [('movil', {'width': 390, 'height': 844}, True), ('escritorio', {'width': 1440, 'height': 900}, False)]:
            ctx = await b.new_context(viewport=vp, device_scale_factor=1, is_mobile=mobile, has_touch=mobile, reduced_motion='reduce')
            page = await ctx.new_page()
            errors = []
            page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
            page.on('pageerror', lambda e: errors.append(str(e)))
            for path in paths:
                await page.goto(base + path, wait_until='networkidle')
                await page.wait_for_timeout(400)
                slug = re.sub(r'[^a-z0-9]+', '-', path.lower()).strip('-') or 'portada'
                await page.screenshot(path=f'{out}/{name}-{slug}.png', full_page=True)
                ow = await page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
                print(f'{name} {path}: ok{" · DESBORDA EN HORIZONTAL" if ow else ""}')
            if errors: print(name, 'ERRORES:', errors[:5])
            await ctx.close()
        await b.close()
asyncio.run(main())
