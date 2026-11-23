import { type Page, expect, test } from '@playwright/test'
import {
  AUTHOR_A,
  AUTHOR_B,
  IGDB_ID,
  VIEWER_ID,
  mockApi,
  problem,
  reviewRow,
} from './support'

const PAGE_URL = `/games/${IGDB_ID}/reviews`

const reportButton = (page: Page, author = '@autora') =>
  page.getByRole('button', {
    name: new RegExp(
      `^(Denunciar a análise|Denunciado: análise) de ${author}$`
    ),
  })

const toast = (page: Page, text: string) =>
  page.locator('.Toastify').getByText(text)

async function openDialog(page: Page) {
  await reportButton(page).click()
  const dialog = page.getByRole('dialog', { name: 'Denunciar esta análise?' })
  await expect(dialog).toBeVisible()
  return dialog
}

test.describe('visitante', () => {
  test('não vê o botão Denunciar', async ({ page }) => {
    await mockApi(page, { signedIn: false })
    await page.goto(PAGE_URL)

    await expect(page.getByText('Análise de autora')).toBeVisible()
    await expect(page.getByRole('button', { name: /Denunciar/ })).toHaveCount(0)
  })
})

test.describe('pessoa logada', () => {
  test('vê Denunciar em cada análise de outra pessoa, com nome acessível', async ({
    page,
  }) => {
    await mockApi(page, {
      list: () => [reviewRow(AUTHOR_A, 'autora'), reviewRow(AUTHOR_B, 'outro')],
    })
    await page.goto(PAGE_URL)

    await expect(reportButton(page, '@autora')).toHaveText('Denunciar')
    await expect(reportButton(page, '@outro')).toBeVisible()
  })

  test('não vê Denunciar na própria análise', async ({ page }) => {
    await mockApi(page, {
      list: () => [
        reviewRow(VIEWER_ID, 'viewer'),
        reviewRow(AUTHOR_A, 'autora'),
      ],
    })
    await page.goto(`/games/${IGDB_ID}`)

    await expect(page.getByText('Análise de autora')).toBeVisible()
    await expect(reportButton(page, '@autora')).toBeVisible()
    await expect(reportButton(page, '@viewer')).toHaveCount(0)
  })

  test('diálogo: Enviar começa desligado, o teclado escolhe o motivo e Escape devolve o foco', async ({
    page,
  }) => {
    await mockApi(page)
    await page.goto(PAGE_URL)

    const dialog = await openDialog(page)
    const send = dialog.getByRole('button', { name: 'Enviar denúncia' })
    await expect(send).toBeDisabled()
    await expect(dialog.getByRole('radio')).toHaveCount(4)
    await expect(dialog.getByRole('radiogroup')).toHaveAccessibleName(
      'Motivo da denúncia'
    )
    await expect(dialog.getByRole('textbox')).toHaveCount(0)

    await page.keyboard.press('Tab')
    await page.keyboard.press('Space')
    await expect(send).toBeEnabled()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(reportButton(page)).toBeFocused()
  })

  test('201: envia o motivo, fecha, agradece e vira Denunciado; recarregar mantém', async ({
    page,
  }) => {
    let reported = false
    const api = await mockApi(page, {
      list: () => [reviewRow(AUTHOR_A, 'autora', { reportedByMe: reported })],
      report: () => {
        reported = true
        return { status: 201, json: { reported: true } }
      },
    })
    await page.goto(PAGE_URL)

    const dialog = await openDialog(page)
    await dialog.getByRole('radio', { name: /Spam ou propaganda/ }).click()
    await dialog.getByRole('button', { name: 'Enviar denúncia' }).click()

    await expect(dialog).toBeHidden()
    await expect(
      toast(page, 'Denúncia enviada. Obrigado por avisar.')
    ).toBeVisible()
    const button = reportButton(page)
    await expect(button).toHaveText('Denunciado')
    await expect(button).toHaveAttribute('aria-disabled', 'true')
    await expect(button).toBeFocused()

    expect(api.reportCalls()).toHaveLength(1)
    expect(api.reportCalls()[0].url).toContain(
      `/reviews/${IGDB_ID}/authors/${AUTHOR_A}/reports`
    )
    expect(api.reportCalls()[0].body).toEqual({ reason: 'SPAM' })

    await button.click({ force: true })
    await expect(
      page.getByRole('dialog', { name: 'Denunciar esta análise?' })
    ).toHaveCount(0)

    await page.reload()
    await expect(reportButton(page)).toHaveText('Denunciado')
  })

  test('o remendo do cache não depende de um refetch: sem reportedByMe no servidor ainda fica Denunciado', async ({
    page,
  }) => {
    await mockApi(page, {
      list: () => [reviewRow(AUTHOR_A, 'autora', { reportedByMe: undefined })],
    })
    await page.goto(PAGE_URL)

    const dialog = await openDialog(page)
    await dialog.getByRole('radio', { name: /Spoiler/ }).click()
    await dialog.getByRole('button', { name: 'Enviar denúncia' }).click()

    await expect(reportButton(page)).toHaveText('Denunciado')
  })

  test('409: avisa que já denunciou e vira Denunciado', async ({ page }) => {
    await mockApi(page, { report: () => problem(409) })
    await page.goto(PAGE_URL)

    const dialog = await openDialog(page)
    await dialog.getByRole('radio', { name: /Outro motivo/ }).click()
    await dialog.getByRole('button', { name: 'Enviar denúncia' }).click()

    await expect(dialog).toBeHidden()
    await expect(toast(page, 'Você já denunciou esta análise.')).toBeVisible()
    await expect(reportButton(page)).toHaveText('Denunciado')
  })

  test('404: avisa que a análise sumiu e recarrega a lista', async ({
    page,
  }) => {
    const api = await mockApi(page, {
      list: call => (call === 0 ? [reviewRow(AUTHOR_A, 'autora')] : []),
      report: () => problem(404),
    })
    await page.goto(PAGE_URL)

    const dialog = await openDialog(page)
    await dialog.getByRole('radio', { name: /Ofensiva/ }).click()
    await dialog.getByRole('button', { name: 'Enviar denúncia' }).click()

    await expect(dialog).toBeHidden()
    await expect(
      toast(page, 'Esta análise não está mais disponível.')
    ).toBeVisible()
    await expect(page.getByText('Análise de autora')).toHaveCount(0)
    expect(api.listCalls()).toBeGreaterThanOrEqual(2)
  })

  test('429: mantém o diálogo aberto e diz em quantos minutos tentar', async ({
    page,
  }) => {
    await mockApi(page, {
      report: () => problem(429, { 'retry-after': '1800' }),
    })
    await page.goto(PAGE_URL)

    const dialog = await openDialog(page)
    await dialog.getByRole('radio', { name: /Spam/ }).click()
    await dialog.getByRole('button', { name: 'Enviar denúncia' }).click()

    await expect(dialog.getByRole('alert')).toHaveText(
      'Você já enviou muitas denúncias. Tente de novo em 30 minutos.'
    )
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole('button', { name: 'Enviar denúncia' })
    ).toBeEnabled()
  })

  test('falha de rede: erro em linha no diálogo e a segunda tentativa funciona', async ({
    page,
  }) => {
    await mockApi(page, {
      report: call =>
        call === 0 ? 'abort' : { status: 201, json: { reported: true } },
    })
    await page.goto(PAGE_URL)

    const dialog = await openDialog(page)
    await dialog.getByRole('radio', { name: /Spam/ }).click()
    await dialog.getByRole('button', { name: 'Enviar denúncia' }).click()

    await expect(dialog.getByRole('alert')).toHaveText(
      'Não foi possível enviar a denúncia. Tente de novo.'
    )
    await dialog.getByRole('button', { name: 'Enviar denúncia' }).click()

    await expect(dialog).toBeHidden()
    await expect(reportButton(page)).toHaveText('Denunciado')
  })

  test('401: fecha o diálogo, avisa que a sessão terminou e some o botão', async ({
    page,
  }) => {
    await mockApi(page, {
      report: () => ({
        status: 401,
        contentType: 'application/problem+json',
        json: { status: 'session_expired', message: 'Unauthorized' },
      }),
    })
    await page.goto(PAGE_URL)

    const dialog = await openDialog(page)
    await dialog.getByRole('radio', { name: /Spam/ }).click()
    await dialog.getByRole('button', { name: 'Enviar denúncia' }).click()

    await expect(dialog).toBeHidden()
    await expect(
      toast(page, 'Sua sessão terminou. Entre de novo.')
    ).toBeVisible()
    await expect(page.getByRole('button', { name: /Denunciar/ })).toHaveCount(0)
  })
})

test.describe('telas pequenas', () => {
  for (const width of [375, 768]) {
    test(`${width}px: sem rolagem horizontal, com o diálogo aberto`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await mockApi(page)
      await page.goto(PAGE_URL)

      await openDialog(page)

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test('tela baixa (375x320): o diálogo cabe na janela e rola até Enviar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 320 })
    await mockApi(page)
    await page.goto(PAGE_URL)

    const dialog = await openDialog(page)
    const box = await dialog.boundingBox()
    expect(box?.height).toBeLessThanOrEqual(320)
    expect(box?.y).toBeGreaterThanOrEqual(0)

    await dialog.getByRole('radio', { name: /Spam/ }).click()
    const send = dialog.getByRole('button', { name: 'Enviar denúncia' })
    await send.scrollIntoViewIfNeeded()
    await expect(send).toBeInViewport()
    await send.click()
    await expect(dialog).toBeHidden()
  })
})

test('as setas do teclado movem e escolhem o motivo', async ({ page }) => {
  await mockApi(page)
  await page.goto(PAGE_URL)
  await page.waitForLoadState('networkidle')

  const dialog = await openDialog(page)
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('radio').first()).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(dialog.getByRole('radio', { name: /Spam/ })).toBeChecked()
  await page.keyboard.press('ArrowDown')

  await expect(dialog.getByRole('radio', { name: /Spoiler/ })).toBeChecked()
  await expect(dialog.getByRole('radio', { name: /Spoiler/ })).toBeFocused()
})

test('prévia na página do jogo: botão em cada análise, menos na própria', async ({
  page,
}) => {
  await mockApi(page, {
    list: () => [reviewRow(VIEWER_ID, 'viewer'), reviewRow(AUTHOR_A, 'autora')],
  })
  await page.goto(`/games/${IGDB_ID}`)

  await expect(page.getByText('Análise de autora')).toBeVisible()
  await expect(reportButton(page, '@autora')).toBeVisible()
  await expect(reportButton(page, '@viewer')).toHaveCount(0)
})
