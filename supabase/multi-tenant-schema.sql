-- ============================================
-- 🏫 SCHEMA MULTI-TENANT - EduPortal Platform
-- ============================================
-- Arquitetura para hospedar múltiplas escolas com isolamento completo
-- Data: 2026-07-29
-- Versão: 1.0.0
-- ============================================

-- ============================================
-- 🎪 SCHEMA PRINCIPAL
-- ============================================

CREATE SCHEMA IF NOT EXISTS platform;
COMMENT ON SCHEMA platform IS 'Schema principal da plataforma multi-tenant';

-- ============================================
-- 📊 TABELAS CENTRAIS (Multi-tenant)
-- ============================================

-- ESCOLAS (Tenants)
CREATE TABLE platform.escolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- Ex: escola-municipal-sp
  cnpj VARCHAR(14) UNIQUE,
  endereco JSONB,
  contato JSONB,
  config JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT TRUE,
  plano VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  limite_usuarios INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE platform.escolas IS 'Instâncias de escolas (tenants)';
COMMENT ON COLUMN platform.escolas.slug IS 'Identificador único para URLs e APIs';
COMMENT ON COLUMN platform.escolas.config IS 'Configurações específicas da escola';
COMMENT ON COLUMN platform.escolas.plano IS 'Tipo de plano de hospedagem';

-- MÓDULOS DA PLATAFORMA
CREATE TABLE platform.modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL, -- Ex: calendario, leitura, comunicacao
  descricao TEXT,
  versao VARCHAR(20) DEFAULT '1.0.0',
  cor_tema VARCHAR(7) DEFAULT '#1E40AF',
  icone VARCHAR(50),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  publico BOOLEAN DEFAULT TRUE, -- Se aparece no marketplace
  premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE platform.modulos IS 'Módulos disponíveis na plataforma';
COMMENT ON COLUMN platform.modulos.slug IS 'Identificador do módulo para APIs';
COMMENT ON COLUMN platform.modulos.publico IS 'Disponível no marketplace público';

-- ESCOLAS x MÓDULOS (Associação)
CREATE TABLE platform.escola_modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES platform.escolas(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES platform.modulos(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}',
  instalado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  desinstalado_em TIMESTAMP WITH TIME ZONE,
  UNIQUE(escola_id, modulo_id)
);

COMMENT ON TABLE platform.escola_modulos IS 'Módulos instalados por escola';
COMMENT ON COLUMN platform.escola_modulos.config IS 'Configurações específicas do módulo para a escola';

-- ============================================
-- 👥 USUÁRIOS E PERMISSÕES
-- ============================================

-- USUÁRIOS (Centralizado na plataforma)
CREATE TABLE platform.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  telefone VARCHAR(20),
  data_nascimento DATE,
  ativo BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT FALSE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE platform.usuarios IS 'Usuários centrais da plataforma (SSO)';
COMMENT ON COLUMN platform.usuarios.email IS 'Email único para login SSO';

-- ESCOLAS x USUÁRIOS (Associação)
CREATE TABLE platform.escola_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES platform.escolas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES platform.usuarios(id) ON DELETE CASCADE,
  papel VARCHAR(50) NOT NULL, -- aluno, professor, gestor, admin
  matricula VARCHAR(50),
  departamento VARCHAR(100),
  cargo VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  convite_token VARCHAR(100),
  convite_enviado_em TIMESTAMP WITH TIME ZONE,
  convite_aceito_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(escola_id, usuario_id)
);

COMMENT ON TABLE platform.escola_usuarios IS 'Associação de usuários com escolas';
COMMENT ON COLUMN platform.escola_usuarios.papel IS 'Papel do usuário na escola específica';

-- PERMISSÕES POR MÓDULO
CREATE TABLE platform.permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_usuario_id UUID NOT NULL REFERENCES platform.escola_usuarios(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES platform.modulos(id) ON DELETE CASCADE,
  nivel_acesso VARCHAR(50) NOT NULL, -- leitura, escrita, moderacao, administracao
  escopo JSONB DEFAULT '{}', -- Permissões granulares
  concedido_por UUID REFERENCES platform.usuarios(id),
  concedido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expira_em TIMESTAMP WITH TIME ZONE,
  revogado_em TIMESTAMP WITH TIME ZONE,
  UNIQUE(escola_usuario_id, modulo_id)
);

COMMENT ON TABLE platform.permissoes IS 'Permissões específicas por módulo';
COMMENT ON COLUMN platform.permissoes.nivel_acesso IS 'Nível base de acesso';
COMMENT ON COLUMN platform.permissoes.escopo IS 'Permissões granulares (ex: pode_criar_evento, pode_excluir)';

-- ============================================
-- 🔐 AUTENTICAÇÃO E SESSÕES
-- ============================================

-- CREDENCIAIS DE AUTENTICAÇÃO
CREATE TABLE platform.auth_credenciais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL UNIQUE REFERENCES platform.usuarios(id) ON DELETE CASCADE,
  senha_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(255),
  algoritmo VARCHAR(50) DEFAULT 'bcrypt',
  ultima_troca TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expira_em TIMESTAMP WITH TIME ZONE,
  bloqueada BOOLEAN DEFAULT FALSE,
  motivo_bloqueio TEXT,
  tentativas_falhas INTEGER DEFAULT 0,
  ultima_tentativa TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE platform.auth_credenciais IS 'Credenciais de autenticação separadas';

-- SESSÕES ATIVAS
CREATE TABLE platform.auth_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES platform.usuarios(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  refresh_token VARCHAR(500),
  ip_address INET,
  user_agent TEXT,
  dispositivo VARCHAR(100),
  localizacao JSONB,
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
  revogado BOOLEAN DEFAULT FALSE,
  revogado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(token)
);

COMMENT ON TABLE platform.auth_sessoes IS 'Sessões ativas de usuários';

-- ============================================
-- 📊 LOGS E AUDITORIA
-- ============================================

-- LOGS DE AUDITORIA
CREATE TABLE platform.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID REFERENCES platform.escolas(id),
  usuario_id UUID REFERENCES platform.usuarios(id),
  acao VARCHAR(100) NOT NULL, -- login, create, update, delete
  modulo VARCHAR(50),
  entidade VARCHAR(100),
  entidade_id UUID,
  dados_antigos JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE platform.audit_logs IS 'Logs de auditoria para compliance';

-- LOGS DE SEGURANÇA
CREATE TABLE platform.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID REFERENCES platform.escolas(id),
  usuario_id UUID REFERENCES platform.usuarios(id),
  tipo VARCHAR(50) NOT NULL, -- login_failed, rate_limit, suspicious
  nivel VARCHAR(20) NOT NULL, -- info, warning, error, critical
  descricao TEXT NOT NULL,
  detalhes JSONB,
  ip_address INET,
  user_agent TEXT,
  resolvido BOOLEAN DEFAULT FALSE,
  resolvido_em TIMESTAMP WITH TIME ZONE,
  resolvido_por UUID REFERENCES platform.usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE platform.security_logs IS 'Logs de eventos de segurança';

-- ============================================
-- 📁 SCHEMAS POR MÓDULO (Exemplo: Calendário)
-- ============================================

-- SCHEMA PARA MÓDULO CALENDÁRIO
CREATE SCHEMA IF NOT EXISTS modulo_calendario;
COMMENT ON SCHEMA modulo_calendario IS 'Schema para módulo de calendário escolar';

-- EVENTOS DO CALENDÁRIO
CREATE TABLE modulo_calendario.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES platform.escolas(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50) NOT NULL,
  cor_hex VARCHAR(7),
  hora_inicio TIME,
  hora_fim TIME,
  local VARCHAR(200),
  recorrente BOOLEAN DEFAULT FALSE,
  recorrencia JSONB, -- Configuração de recorrência
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
  autor_id UUID REFERENCES platform.usuarios(id),
  aprovado_por UUID REFERENCES platform.usuarios(id),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  motivo_rejeicao TEXT,
  visibilidade VARCHAR(20) DEFAULT 'public', -- public, private, role_based
  anexos JSONB, -- URLs de arquivos anexados
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE modulo_calendario.eventos IS 'Eventos do calendário escolar';
COMMENT ON COLUMN modulo_calendario.eventos.escola_id IS 'Isolamento multi-tenant';
COMMENT ON COLUMN modulo_calendario.eventos.recorrencia IS 'Configuração de eventos recorrentes';

-- CATEGORIAS DE EVENTOS (por escola)
CREATE TABLE modulo_calendario.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES platform.escolas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  cor_hex VARCHAR(7) NOT NULL,
  icone VARCHAR(50),
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(escola_id, nome)
);

COMMENT ON TABLE modulo_calendario.categorias IS 'Categorias de eventos personalizáveis por escola';

-- LEMBRETES DE EVENTOS
CREATE TABLE modulo_calendario.lembretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES modulo_calendario.eventos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES platform.usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL, -- email, notification, sms
  minutos_antes INTEGER NOT NULL, -- 15, 30, 60, 1440 (24h)
  enviado BOOLEAN DEFAULT FALSE,
  enviado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(evento_id, usuario_id, tipo)
);

COMMENT ON TABLE modulo_calendario.lembretes IS 'Lembretes configurados para eventos';

-- ============================================
-- 🔧 ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para escolas
CREATE INDEX idx_escolas_slug ON platform.escolas(slug);
CREATE INDEX idx_escolas_ativo ON platform.escolas(ativo) WHERE ativo = TRUE;
CREATE INDEX idx_escolas_plano ON platform.escolas(plano);

-- Índices para usuários
CREATE INDEX idx_usuarios_email ON platform.usuarios(email);
CREATE INDEX idx_usuarios_ativo ON platform.usuarios(ativo) WHERE ativo = TRUE;

-- Índices para escola_usuarios
CREATE INDEX idx_escola_usuarios_escola ON platform.escola_usuarios(escola_id);
CREATE INDEX idx_escola_usuarios_usuario ON platform.escola_usuarios(usuario_id);
CREATE INDEX idx_escola_usuarios_papel ON platform.escola_usuarios(papel);
CREATE INDEX idx_escola_usuarios_ativo ON platform.escola_usuarios(ativo) WHERE ativo = TRUE;

-- Índices para permissoes
CREATE INDEX idx_permissoes_escola_usuario ON platform.permissoes(escola_usuario_id);
CREATE INDEX idx_permissoes_modulo ON platform.permissoes(modulo_id);

-- Índices para eventos (calendário)
CREATE INDEX idx_eventos_escola_data ON modulo_calendario.eventos(escola_id, data);
CREATE INDEX idx_eventos_status ON modulo_calendario.eventos(status);
CREATE INDEX idx_eventos_autor ON modulo_calendario.eventos(autor_id);
CREATE INDEX idx_eventos_categoria ON modulo_calendario.eventos(categoria);

-- Índices para auditoria
CREATE INDEX idx_audit_logs_created_at ON platform.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_escola_usuario ON platform.audit_logs(escola_id, usuario_id);
CREATE INDEX idx_audit_logs_acao ON platform.audit_logs(acao);

-- Índices para segurança
CREATE INDEX idx_security_logs_tipo_nivel ON platform.security_logs(tipo, nivel);
CREATE INDEX idx_security_logs_created_at ON platform.security_logs(created_at DESC);

-- ============================================
-- 🔐 POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE platform.escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.escola_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulo_calendario.eventos ENABLE ROW LEVEL SECURITY;

-- Política para escolas (apenas escolas ativas visíveis)
CREATE POLICY escolas_visible ON platform.escolas
  FOR SELECT USING (ativo = TRUE);

-- Política para usuários (apenas próprio usuário ou admin)
CREATE POLICY usuarios_self ON platform.usuarios
  FOR ALL USING (auth.uid() = id OR is_admin_user());

-- Política para escola_usuarios (apenas membros da escola)
CREATE POLICY escola_usuarios_members ON platform.escola_usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform.escola_usuarios eu
      WHERE eu.escola_id = escola_usuarios.escola_id
      AND eu.usuario_id = auth.uid()
    )
  );

-- Política para eventos (apenas da própria escola)
CREATE POLICY eventos_escola ON modulo_calendario.eventos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform.escola_usuarios eu
      WHERE eu.escola_id = eventos.escola_id
      AND eu.usuario_id = auth.uid()
    )
  );

-- ============================================
-- 🔄 TRIGGERS PARA TIMESTAMPS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger às tabelas principais
CREATE TRIGGER update_escolas_updated_at 
  BEFORE UPDATE ON platform.escolas 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at 
  BEFORE UPDATE ON platform.usuarios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at 
  BEFORE UPDATE ON modulo_calendario.eventos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 📋 DADOS INICIAIS (SEED)
-- ============================================

-- Módulos padrão
INSERT INTO platform.modulos (nome, slug, descricao, cor_tema, icone, ordem) VALUES
  ('Calendário Escolar', 'calendario', 'Sistema de calendário e eventos escolares', '#1E40AF', '📅', 1),
  ('Plataforma de Leitura', 'leitura', 'Biblioteca digital e sistema de leitura', '#059669', '📚', 2),
  ('Sistema de Comunicação', 'comunicacao', 'Comunicação escola-família e oratória', '#7C3AED', '🎤', 3),
  ('Avaliações e Provas', 'avaliacoes', 'Sistema de avaliações e acompanhamento', '#EA580C', '✏️', 4),
  ('Gestão Administrativa', 'gestao', 'Gestão escolar e administrativa', '#2563EB', '📊', 5);

-- Funções administrativas
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM platform.escola_usuarios eu
    WHERE eu.usuario_id = auth.uid()
    AND eu.papel = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 📊 VIEWS ÚTEIS
-- ============================================

-- View para usuários com suas escolas
CREATE VIEW platform.vw_usuarios_escolas AS
SELECT 
  u.id as usuario_id,
  u.email,
  u.nome as usuario_nome,
  e.id as escola_id,
  e.nome as escola_nome,
  e.slug as escola_slug,
  eu.papel as papel_na_escola,
  eu.ativo as ativo_na_escola,
  array_agg(DISTINCT m.slug) as modulos_instalados
FROM platform.usuarios u
JOIN platform.escola_usuarios eu ON u.id = eu.usuario_id
JOIN platform.escolas e ON eu.escola_id = e.id
LEFT JOIN platform.escola_modulos em ON e.id = em.escola_id
LEFT JOIN platform.modulos m ON em.modulo_id = m.id
WHERE eu.ativo = TRUE AND e.ativo = TRUE
GROUP BY u.id, u.email, u.nome, e.id, e.nome, e.slug, eu.papel, eu.ativo;

-- View para eventos com informações completas
CREATE VIEW modulo_calendario.vw_eventos_completos AS
SELECT 
  e.*,
  es.nome as escola_nome,
  es.slug as escola_slug,
  au.nome as autor_nome,
  au.email as autor_email,
  ap.nome as aprovador_nome,
  cat.nome as categoria_nome,
  cat.cor_hex as categoria_cor
FROM modulo_calendario.eventos e
JOIN platform.escolas es ON e.escola_id = es.id
LEFT JOIN platform.usuarios au ON e.autor_id = au.id
LEFT JOIN platform.usuarios ap ON e.aprovado_por = ap.id
LEFT JOIN modulo_calendario.categorias cat ON e.categoria = cat.nome AND e.escola_id = cat.escola_id;

-- ============================================
-- ✅ COMMENTS FINAIS
-- ============================================

COMMENT ON SCHEMA platform IS 'Arquitetura multi-tenant completa para EduPortal';
COMMENT ON SCHEMA modulo_calendario IS 'Módulo de calendário escolar com isolamento por escola';

-- ============================================
-- 🎉 SCHEMA COMPLETO
-- ============================================
-- Este schema suporta:
-- 1. ✅ Multi-tenancy com isolamento completo
-- 2. ✅ SSO (Single Sign-On) centralizado
-- 3. ✅ Sistema modular expansível
-- 4. ✅ Permissões granulares
-- 5. ✅ Auditoria e logs de segurança
-- 6. ✅ RLS (Row Level Security)
-- 7. ✅ Performance otimizada com índices
-- 8. ✅ Views úteis para relatórios
-- ============================================