import { describe, it, expect, vi, beforeEach } from 'vitest';
import { alterarSenha, getTransacoes, getTransacoesRange, setAuthToken } from './api';

describe('api.js', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setAuthToken(null);
  });

  describe('alterarSenha', () => {
    it('deve enviar PUT para /api/auth/alterar-senha com token e corpo corretos', async () => {
      setAuthToken('mock-jwt-token');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        text: vi.fn().mockResolvedValue(''),
      });

      await alterarSenha('Senha123!', 'NovaSenha456!');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/auth\/alterar-senha$/),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-jwt-token',
          },
          body: JSON.stringify({ senhaAtual: 'Senha123!', novaSenha: 'NovaSenha456!' }),
        }
      );
    });

    it('deve lançar erro quando a resposta não for ok', async () => {
      setAuthToken('mock-jwt-token');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn().mockResolvedValue({ error: 'Senha atual incorreta.' }),
      });

      await expect(alterarSenha('SenhaErrada', 'NovaSenha456!')).rejects.toThrow(
        'Senha atual incorreta.'
      );
    });
  });

  describe('getTransacoes', () => {
    it('deve enviar GET para /api/transacoes com parâmetros padrão sem categoriaId', async () => {
      setAuthToken('mock-jwt-token');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: [], total: 0, totalPages: 1 })),
      });

      const res = await getTransacoes(1, null, '2026-08-01', '2026-08-31', 1, 20);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/transacoes\?contaId=1&dataInicio=2026-08-01&dataFim=2026-08-31&page=1&pageSize=20$/),
        {
          headers: {
            'Authorization': 'Bearer mock-jwt-token',
          },
        }
      );
      expect(res).toEqual({ data: [], total: 0, totalPages: 1 });
    });

    it('deve incluir categoriaId nos query params quando fornecido', async () => {
      setAuthToken('mock-jwt-token');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: [], total: 0, totalPages: 1 })),
      });

      await getTransacoes(2, '2026-08-15', null, null, 2, 10, 5);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/transacoes\?contaId=2&data=2026-08-15&categoriaId=5&page=2&pageSize=10$/),
        {
          headers: {
            'Authorization': 'Bearer mock-jwt-token',
          },
        }
      );
    });
  });

  describe('getTransacoesRange', () => {
    it('deve repassar categoriaId para getTransacoes', async () => {
      setAuthToken('mock-jwt-token');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: [], total: 0, totalPages: 1 })),
      });

      await getTransacoesRange(1, '2026-08-01', '2026-08-31', 1, 20, 3);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/transacoes\?contaId=1&dataInicio=2026-08-01&dataFim=2026-08-31&categoriaId=3&page=1&pageSize=20$/),
        {
          headers: {
            'Authorization': 'Bearer mock-jwt-token',
          },
        }
      );
    });

    it('deve funcionar sem categoriaId', async () => {
      setAuthToken('mock-jwt-token');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: [], total: 0, totalPages: 1 })),
      });

      await getTransacoesRange(1, '2026-08-01', '2026-08-31', 1, 20);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/transacoes\?contaId=1&dataInicio=2026-08-01&dataFim=2026-08-31&page=1&pageSize=20$/),
        {
          headers: {
            'Authorization': 'Bearer mock-jwt-token',
          },
        }
      );
    });
  });
});
