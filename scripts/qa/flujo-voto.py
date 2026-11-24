# Recorre la votación completa en un móvil: elegir, revisar, confirmar y reintentar.
import asyncio, sys
from playwright.async_api import async_playwright
base = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8787'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
        page = await ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append(str(e)))
        page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await page.goto(base + '/votar', wait_until='networkidle')
        await page.screenshot(path='screenshots/voto-1-papeleta.png')
        labels = page.locator('fieldset label')
        print('opciones:', await labels.count())
        # elegir la primera opción de las 3 primeras categorías
        for i in range(3):
            await page.locator('fieldset').nth(i).locator('label').first.click()
        await page.locator('fieldset').nth(1).scroll_into_view_if_needed()
        await page.screenshot(path='screenshots/voto-2-seleccion.png')
        await page.get_by_role('button', name='Revisar papeleta').click()
        await page.wait_for_timeout(300)
        await page.screenshot(path='screenshots/voto-3-revision.png', full_page=True)
        await page.get_by_role('button', name='Confirmar mi voto').click()
        await page.wait_for_selector('text=Gracias por votar.')
        await page.screenshot(path='screenshots/voto-4-confirmacion.png', full_page=True)
        code = await page.locator('.select-all').inner_text()
        print('comprobante:', code)
        # Reintento desde el mismo dispositivo
        await page.goto(base + '/votar', wait_until='networkidle')
        await page.wait_for_timeout(500)
        print('reintento:', 'Ya has votado' in await page.content())
        await page.screenshot(path='screenshots/voto-5-ya-votado.png')
        # Comprobante
        await page.goto(base + '/comprobante', wait_until='networkidle')
        await page.fill('#codigo', code)
        await page.get_by_role('button', name='Comprobar').click()
        await page.wait_for_selector('text=registrada')
        print('comprobación: registrada')
        print('errores JS:', errs or 'ninguno')
        await b.close()
asyncio.run(main())
