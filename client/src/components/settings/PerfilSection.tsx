import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Camera,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Trash2,
  Check,
  Edit2,
  X,
  Loader2,
  ShieldCheck,
  Building2,
  Store,
  Mail,
  BadgeCheck,
  CheckCircle,
} from 'lucide-react';
import usePreferencias from '../../hooks/usePreferencias';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Modal from '../common/Modal';

// Coleção de avatares estilizados para escolha rápida com 1 clique
const AVATARES_PREDEFINIDOS = [
  { id: 'avatar-1', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FinSync1&backgroundColor=1c6cff', label: 'Robo Tech' },
  { id: 'avatar-2', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FinSync2&backgroundColor=00cc4b', label: 'Robo Mint' },
  { id: 'avatar-3', url: 'https://api.dicebear.com/7.x/micah/svg?seed=FinSyncFelix&backgroundColor=b6e3f4', label: 'Minimalista Azul' },
  { id: 'avatar-4', url: 'https://api.dicebear.com/7.x/micah/svg?seed=FinSyncAria&backgroundColor=ffdfba', label: 'Minimalista Coral' },
  { id: 'avatar-5', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=FinSyncLuna&backgroundColor=ffd5dc', label: 'Ilustração Rosa' },
  { id: 'avatar-6', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=FinSyncLeo&backgroundColor=c0aede', label: 'Ilustração Roxo' },
  { id: 'avatar-7', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=FinSyncMax&backgroundColor=d1d4f9', label: 'Aventureiro' },
  { id: 'avatar-8', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=FinSyncAbstract&backgroundColor=1c6cff,6366f1', label: 'Geométrico' },
];

export default function PerfilSection() {
  const { user, atualizarPerfil } = useAuth();
  const { addToast } = useToast();

  const [modalFotoAberto, setModalFotoAberto] = useState(false);
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState(user?.nome || '');
  const [salvandoNome, setSalvandoNome] = useState(false);

  // Estados da Modal de Foto
  const [abaFoto, setAbaFoto] = useState('upload'); // 'upload' | 'presets' | 'url'
  const [previewFoto, setPreviewFoto] = useState(user?.fotoUrl || null);
  const [urlInput, setUrlInput] = useState('');
  const [salvandoFoto, setSalvandoFoto] = useState(false);
  const [fotoPerfilError, setFotoPerfilError] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFotoPerfilError(false);
  }, [user?.fotoUrl]);

  useEffect(() => {
    setPreviewError(false);
  }, [previewFoto]);

  // Redimensiona e comprime a imagem local usando Canvas para manter payload minúsculo
  const processarArquivoImagem = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('A imagem deve ter menos de 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);

        // Converte para JPEG comprimido (alta qualidade visual para avatar, ~15-25kb)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewFoto(dataUrl);
      };
      img.src = (e.target?.result as string) || '';
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processarArquivoImagem(file);
    }
  };

  const handleAbrirModalFoto = () => {
    setPreviewFoto(user?.fotoUrl || null);
    setUrlInput('');
    setAbaFoto('upload');
    setModalFotoAberto(true);
  };

  const handleSalvarFoto = async (fotoParaSalvar: string | null = previewFoto) => {
    setSalvandoFoto(true);
    try {
      await atualizarPerfil({
        nome: user?.nome || 'Usuário',
        fotoUrl: fotoParaSalvar,
      });
      addToast('Foto de perfil atualizada com sucesso!', 'success');
      setModalFotoAberto(false);
    } catch (err: any) {
      addToast(err.message || 'Erro ao atualizar foto de perfil.', 'error');
    } finally {
      setSalvandoFoto(false);
    }
  };

  const handleRemoverFoto = async () => {
    setSalvandoFoto(true);
    try {
      await atualizarPerfil({
        nome: user?.nome || 'Usuário',
        fotoUrl: null,
      });
      setPreviewFoto(null);
      addToast('Foto de perfil removida com sucesso!', 'success');
      setModalFotoAberto(false);
    } catch (err: any) {
      addToast(err.message || 'Erro ao remover foto.', 'error');
    } finally {
      setSalvandoFoto(false);
    }
  };

  const handleSalvarNome = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!novoNome.trim() || novoNome.trim().length < 2) {
      addToast('O nome deve ter pelo menos 2 caracteres.', 'error');
      return;
    }

    setSalvandoNome(true);
    try {
      await atualizarPerfil({
        nome: novoNome.trim(),
        fotoUrl: user?.fotoUrl || null,
      });
      addToast('Nome atualizado com sucesso!', 'success');
      setEditandoNome(false);
    } catch (err: any) {
      addToast(err.message || 'Erro ao atualizar nome.', 'error');
    } finally {
      setSalvandoNome(false);
    }
  };

  const { prefs, atualizar } = usePreferencias();

  return (
    <SettingsSection
      id="perfil"
      title="Perfil do Usuário"
      superLabel="Identificação Institucional"
      badge={
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/20">
          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Conta PJ Verificada
        </span>
      }
      icon={User}
    >
      {/* Card Perfil do Usuário e Avatar */}
      <Card className="p-6 border-border/80 shadow-sm relative overflow-hidden transition-all bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-5 min-w-0">
            {/* Avatar Interativo com Badge de Câmera */}
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={handleAbrirModalFoto}
                aria-label="Alterar foto de perfil"
                className="relative block w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {user?.fotoUrl && !fotoPerfilError ? (
                  <img
                    src={user.fotoUrl}
                    alt={user?.nome || 'Foto de perfil'}
                    onError={() => setFotoPerfilError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-2xl select-none">
                    {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              <button
                type="button"
                onClick={handleAbrirModalFoto}
                title="Alterar Foto"
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md border-2 border-background hover:scale-110 active:scale-95 transition-transform"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Informações Textuais & Edição de Nome */}
            <div className="min-w-0 flex-1">
              {editandoNome ? (
                <form onSubmit={handleSalvarNome} className="flex items-center gap-2 max-w-sm">
                  <Input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Seu nome completo"
                    className="h-9 text-sm rounded-xl"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={salvandoNome}
                    className="h-9 rounded-xl px-3"
                  >
                    {salvandoNome ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNovoNome(user?.nome || '');
                      setEditandoNome(false);
                    }}
                    className="h-9 rounded-xl px-2"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-normal text-xl text-foreground tracking-[-0.03em] truncate">
                    {user?.nome || 'Usuário'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setNovoNome(user?.nome || '');
                      setEditandoNome(true);
                    }}
                    title="Editar nome"
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1.5">
                <span>{user?.email || 'usuario@email.com'}</span>
                {user?.temSenha === false && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="w-3 h-3" /> Google
                  </span>
                )}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-medium text-muted-foreground/80 bg-secondary/80 px-2.5 py-0.5 rounded-md border border-border/50">
                  Membro FinSync
                </span>
              </div>
            </div>
          </div>

          {/* Botão de Ação para Trocar Foto */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAbrirModalFoto}
              className="rounded-xl text-xs font-semibold flex items-center gap-2 h-9 border-border/80"
            >
              <Camera className="w-3.5 h-3.5 text-primary" />
              <span>Alterar Foto</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Identificação Institucional & Dados Fiscais (Mockup Wise) */}
      <Card className="p-6 border-border/80 shadow-sm flex flex-col gap-5 bg-card">
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-secondary/40 border border-border/40">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <button
              type="button"
              onClick={handleAbrirModalFoto}
              className="absolute -bottom-1 -right-1 p-1 bg-primary text-primary-foreground rounded-full shadow-sm hover:scale-105 transition-transform"
              title="Trocar Logotipo da Empresa"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col text-center sm:text-left gap-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h4 className="font-bold text-base text-foreground">
                {prefs.empresaNomeFantasia || 'Pizzaria Bella Forneria'}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold">
                PJ Ativa
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Matriz Pinheiros • São Paulo, SP • Ativa desde Fevereiro de 2021
            </p>
            <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground text-[10px] font-mono font-medium">
                CNAE 56.11-2-01
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground text-[10px] font-mono font-medium">
                Inscrição Estadual: 104.920.311.119
              </span>
            </div>
          </div>
        </div>

        {/* Formulário Fiscal em Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              Razão Social
            </label>
            <Input
              type="text"
              value={prefs.empresaRazaoSocial || ''}
              onChange={(e) => atualizar('empresaRazaoSocial', e.target.value)}
              placeholder="Razão social da empresa"
              className="h-11 rounded-xl text-sm bg-secondary/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-muted-foreground" />
              Nome Fantasia
            </label>
            <Input
              type="text"
              value={prefs.empresaNomeFantasia || ''}
              onChange={(e) => atualizar('empresaNomeFantasia', e.target.value)}
              placeholder="Nome comercial da loja/empresa"
              className="h-11 rounded-xl text-sm bg-secondary/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              CNPJ
            </label>
            <Input
              type="text"
              value={prefs.empresaCnpj || ''}
              onChange={(e) => atualizar('empresaCnpj', e.target.value)}
              placeholder="00.000.000/0000-00"
              className="h-11 rounded-xl text-sm font-mono bg-secondary/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Regime Tributário</label>
            <select
              value={prefs.empresaRegimeTributario || 'Simples Nacional (Anexo I e III)'}
              onChange={(e) => atualizar('empresaRegimeTributario', e.target.value)}
              className="h-11 rounded-xl text-xs md:text-sm bg-secondary/20 border border-input px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
            >
              <option value="Simples Nacional (Anexo I e III)">Simples Nacional (Anexo I e III)</option>
              <option value="Lucro Presumido">Lucro Presumido</option>
              <option value="Lucro Real">Lucro Real</option>
              <option value="MEI - Microempreendedor Individual">MEI - Microempreendedor Individual</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              E-mail Financeiro &amp; DRE
            </label>
            <Input
              type="email"
              value={prefs.empresaEmailFinanceiro || ''}
              onChange={(e) => atualizar('empresaEmailFinanceiro', e.target.value)}
              placeholder="financeiro@empresa.com.br"
              className="h-11 rounded-xl text-sm bg-secondary/20"
            />
            <span className="text-[11px] text-muted-foreground">
              Relatórios semanais, alertas de conciliação e DRE sintético serão encaminhados a este e-mail.
            </span>
          </div>
        </div>
      </Card>

      {/* Modal de Seleção e Alteração de Foto */}
      <Modal
        aberto={modalFotoAberto}
        onClose={() => setModalFotoAberto(false)}
        titulo="Alterar Foto de Perfil"
      >
        <div className="space-y-6 pt-2">
          {/* Avatar Preview Central */}
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-md relative bg-secondary flex items-center justify-center">
              {previewFoto && !previewError ? (
                <img
                  src={previewFoto}
                  alt="Pré-visualização"
                  onError={() => setPreviewError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-3xl select-none">
                  {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {previewFoto ? 'Pré-visualização do seu avatar' : 'Iniciais padrão selecionadas'}
            </span>
          </div>

          {/* Abas de Escolha */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-secondary/60 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setAbaFoto('upload')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                abaFoto === 'upload'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Enviar Foto</span>
            </button>
            <button
              type="button"
              onClick={() => setAbaFoto('presets')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                abaFoto === 'presets'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Galeria</span>
            </button>
            <button
              type="button"
              onClick={() => setAbaFoto('url')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                abaFoto === 'url'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Link URL</span>
            </button>
          </div>

          {/* Conteúdo da Aba 1: Upload */}
          {abaFoto === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-secondary/20 hover:bg-secondary/40 flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Clique para selecionar do seu dispositivo
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    PNG, JPG ou WebP (redimensionamento automático)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo da Aba 2: Galeria de Presets */}
          {abaFoto === 'presets' && (
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground block mb-2">
                Escolha um avatar estilizado para sua conta:
              </span>
              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
                {AVATARES_PREDEFINIDOS.map((preset) => {
                  const isSelected = previewFoto === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPreviewFoto(preset.url)}
                      className={`relative p-1.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 group ${
                        isSelected
                          ? 'border-primary bg-primary/10 scale-105 shadow-sm'
                          : 'border-border/70 hover:border-border hover:bg-secondary/60'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-background">
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground truncate w-full text-center">
                        {preset.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conteúdo da Aba 3: Link URL */}
          {abaFoto === 'url' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-foreground block">
                Cole o endereço direto da imagem:
              </label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://exemplo.com/minha-foto.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="rounded-xl text-xs h-9"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (urlInput.trim()) {
                      setPreviewFoto(urlInput.trim());
                    }
                  }}
                  className="rounded-xl h-9 px-3 text-xs"
                >
                  Visualizar
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dica: Você pode usar links do Gravatar, Unsplash, Google ou seu servidor de fotos.
              </p>
            </div>
          )}

          {/* Ações Inferiores */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            {user?.fotoUrl ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoverFoto}
                disabled={salvandoFoto}
                className="rounded-xl text-xs h-9 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover Foto</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setModalFotoAberto(false)}
                disabled={salvandoFoto}
                className="rounded-xl text-xs h-9"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSalvarFoto(previewFoto)}
                disabled={salvandoFoto || previewFoto === user?.fotoUrl}
                className="rounded-xl text-xs font-semibold h-9 px-4"
              >
                {salvandoFoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Salvar Foto'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </SettingsSection>
  );
}
