import { test, expect } from '@playwright/test';

test.describe('FinSync App', () => {
  test('deve carregar a página inicial ou redirecionar para login', async ({ page }) => {
    await page.goto('/');
    // Verifica se a aplicação carregou com sucesso
    await expect(page).toHaveTitle(/FinSync/i);
  });
});
