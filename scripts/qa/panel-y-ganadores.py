# Panel: inicio de sesión, secciones principales y publicación de ganadores; después, la revelación pública.
import asyncio, sys, json
from playwright.async_api import async_playwright
base = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8787'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # Unos votos desde dispositivos distintos
        for i in range(3):
            c = await b.new_context(); pg = await c.new_page()
            await pg.goto(base + '/votar', wait_until='networkidle')
            await pg.locator('fieldset').nth(0).locator('label').nth(i % 2).click()
            await pg.get_by_role('button', name='Revisar papeleta').click()
            await pg.get_by_role('button', name='Confirmar mi voto').click()
            await pg.wait_for_selector('text=Gracias por votar.')
            await c.close()
        ctx = await b.new_context(viewport={'width': 1366, 'height': 900})
        page = await ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append(str(e)))
        await page.goto(base + '/admin', wait_until='networkidle')
        await page.screenshot(path='screenshots/panel-0-acceso.png')
        await page.fill('input[type=email]', 'admin@premios.local')
        await page.fill('input[type=password]', 'premios-local-2026')
        await page.get_by_role('button', name='Entrar').click()
        await page.wait_for_selector('text=Estado de la edición')
        await page.screenshot(path='screenshots/panel-1-resumen.png', full_page=True)
        for tab in ['edicion', 'candidaturas', 'resultados', 'revision', 'paginas']:
            await page.goto(f'{base}/admin#/{tab}', wait_until='networkidle'); await page.wait_for_timeout(500)
            await page.screenshot(path=f'screenshots/panel-{tab}.png', full_page=True)
        # Ganadores (vía API del panel) y publicación
        res = await page.evaluate('''async () => {
          const h = {'X-Premios-Admin':'1','Content-Type':'application/json'};
          const cats = (await (await fetch('/api/admin/categories',{headers:h})).json()).categories;
          const noms = (await (await fetch('/api/admin/nominees',{headers:h})).json()).nominees;
          const honor = cats.find(c => c.slug === 'honor-a-la-trayectoria');
          await fetch('/api/admin/nominees',{method:'POST',headers:h,body:JSON.stringify({category_id:honor.id,slug:'candidatura-de-prueba-honor',name:'Candidatura de prueba',published:1,is_alternate:0,position:0})});
          const noms2 = (await (await fetch('/api/admin/nominees',{headers:h})).json()).nominees;
          let n = 0;
          for (const c of cats) {
            const first = noms2.find(x => x.category_id === c.id && x.published && !x.is_alternate);
            if (!first) continue;
            const r = await fetch(`/api/admin/categories/${c.id}/winner`,{method:'PUT',headers:h,body:JSON.stringify({nominee_id:first.id, public_reason:'Texto de prueba del motivo del reconocimiento.', reason:'Prueba local de publicación'})});
            if (r.ok) n++;
          }
          const s = await fetch('/api/admin/settings',{method:'PUT',headers:h,body:JSON.stringify({phase:'winners', reason:'Prueba local', confirm_incomplete:true})});
          return {winners:n, settings:s.status};
        }''')
        print('ganadores fijados:', res)
        await page.goto(f'{base}/admin#/auditoria', wait_until='networkidle'); await page.wait_for_timeout(400)
        await page.screenshot(path='screenshots/panel-auditoria.png')
        m = await b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        mp = await m.new_page()
        mp.on('pageerror', lambda e: errs.append(str(e)))
        await mp.goto(base + '/ganadores', wait_until='networkidle')
        await mp.wait_for_timeout(1200)
        await mp.screenshot(path='screenshots/ganadores-0-portada.png')
        await mp.get_by_role('button', name='Empezar').click(); await mp.wait_for_timeout(900)
        await mp.screenshot(path='screenshots/ganadores-1-candidaturas.png')
        await mp.get_by_role('button', name='Revelar quién gana').click(); await mp.wait_for_timeout(2400)
        await mp.screenshot(path='screenshots/ganadores-2-revelado.png')
        await mp.goto(base + '/palmares', wait_until='networkidle')
        await mp.screenshot(path='screenshots/ganadores-3-palmares.png', full_page=True)
        slug = await mp.locator('ol a').first.get_attribute('href')
        await mp.goto(base + slug, wait_until='networkidle'); await mp.wait_for_timeout(1500)
        await mp.screenshot(path='screenshots/ganadores-4-ficha.png', full_page=True)
        print('errores JS:', errs or 'ninguno')
        await b.close()
asyncio.run(main())
