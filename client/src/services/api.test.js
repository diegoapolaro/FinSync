import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  alterarSenha,
  getTransacoes,
  getTransacoesRange,
  updateTransacaoStatus,
  setAuthToken,
} from './api';

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
            Authorization: 'Bearer mock-jwt-token',
          },
          body: JSON.stringify({ senhaAtual: 'Senha123!', novaSenha: 'NovaSenha456!' }),
        },
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
        'Senha atual incorreta.',
      );
    });
  });

  describe('getTransacoes', () => {
    it('deve enviar GET para /api/transacoes com parâmetros padrão sem categoriaId e status', async () => {
      setAuthToken('mock-jwt-token');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: [], total: 0, totalPages: 1 })),
      });

      const res = await getTransacoes({
        contaId: 1,
        dataInicio: '2026-08-01',
        dataFim: '2026-08-31',
        page: 1,
        pageSize: 20,
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/transacoes\?contaId=1&dataInicio=2026-08-01&dataFim=2026-08-31&page=1&pageSize=20$/,
        ),
        {
          headers: {
            Authorization: 'Bearer mock-jwt-token',
          },
        },
      );
      expect(res).toEqual({ data: [], total: 0, totalPages: 1 });
    });

    it('deve incluir categoriaId e status nos query params quando fornecido', async () => {
      setAuthToken('mock-jwt-token');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: [], total: 0, totalPages: 1 })),
      });

      await getTransacoes({
        contaId: 2,
        data: '2026-08-15',
        page: 2,
        pageSize: 10,
        categoriaId: 5,
        status: 'Pendente',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/transacoes\?contaId=2&data=2026-08-15&categoriaId=5&status=Pendente&page=2&pageSize=10$/,
        ),
        {
          headers: {
            Authorization: 'Bearer mock-jwt-token',
          },
        },
      );
    });
  });

  describe('updateTransacaoStatus', () => {
    it('deve enviar PATCH para /api/transacoes/:id/status com status no corpo', async () => {
      setAuthToken('mock-jwt-token');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        text: vi.fn().mockResolvedValue(''),
      });

      await updateTransacaoStatus(42, 'Pago');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/transacoes\/42\/status$/),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-jwt-token',
          },
          body: JSON.stringify({ status: 'Pago' }),
        },
      );
    });
  });

  describe('getTransacoesRange', () => {
    it('deve repassar categoriaId e status para getTransacoes', async () => {
      setAuthToken('mock-jwt-token');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: [], total: 0, totalPages: 1 })),
      });

      await getTransacoesRange({
        contaId: 1,
        dataInicio: '2026-08-01',
        dataFim: '2026-08-31',
        page: 1,
        pageSize: 20,
        categoriaId: 3,
        status: 'Pago',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/transacoes\?contaId=1&dataInicio=2026-08-01&dataFim=2026-08-31&categoriaId=3&status=Pago&page=1&pageSize=20$/,
        ),
        {
          headers: {
            Authorization: 'Bearer mock-jwt-token',
          },
        },
      );
    });

    it('deve funcionar sem categoriaId e sem status', async () => {
      setAuthToken('mock-jwt-token');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(JSON.stringify({ data: [], total: 0, totalPages: 1 })),
      });

      await getTransacoesRange({
        contaId: 1,
        dataInicio: '2026-08-01',
        dataFim: '2026-08-31',
        page: 1,
        pageSize: 20,
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/transacoes\?contaId=1&dataInicio=2026-08-01&dataFim=2026-08-31&page=1&pageSize=20$/,
        ),
        {
          headers: {
            Authorization: 'Bearer mock-jwt-token',
          },
        },
      );
    });
  });
});

