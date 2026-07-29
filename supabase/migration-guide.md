# 📋 GUIA DE MIGRAÇÃO PARA MULTI-TENANT

## 🎯 OBJETIVO
Migrar da estrutura atual (monolítica) para a nova arquitetura multi-tenant sem perder dados existentes.

## 📊 ESTRUTURA ATUAL VS NOVA

### **ESTRUTURA ATUAL (lowdb/Supabase simples):**
```
usuarios: [
  { login, nome, papel, senha_hash }
]
eventos: [
  { id, date, title, category, status, nota, autor_login }
]
```

### **ESTRUTURA NOVA (Multi-tenant):**
```
platform.escolas
platform.usuarios (SSO centralizado)
platform.escola_usuarios (associação)
platform.modulos
platform.escola_modulos
platform.permissoes
modulo_calendario.eventos (com escola_id)
modulo_calendario.categorias
```

## 🔄 PLANO DE MIGRAÇÃO EM ETAPAS

### **ETAPA 1: PREPARAÇÃO (Safe - não modifica dados)**
1. Criar schema multi-tenant (já feito)
2. Criar scripts de migração
3. Criar backup completo dos dados atuais

### **ETAPA 2: MIGRAÇÃO DE DADOS (Rollback possível)**
1. Migrar usuários para nova estrutura
2. Criar escola padrão para dados existentes
3. Migrar eventos para novo schema
4. Manter compatibilidade com API existente

### **ETAPA 3: TRANSIÇÃO (Gradual)**
1. API dupla (antiga + nova)
2. Redirecionamento gradual
3. Monitoramento de erros

### **ETAPA 4: CONSOLIDAÇÃO**
1. Desativar API antiga
2. Remover código legado
3. Otimizar performance

## 📝 SCRIPTS DE MIGRAÇÃO

### **1. Script de Backup:**
```sql
-- Backup dos dados atuais
CREATE TABLE backup_usuarios_old AS SELECT * FROM usuarios;
CREATE TABLE backup_eventos_old AS SELECT * FROM eventos;
```

### **2. Script de Migração:**
```sql
-- 1. Criar escola padrão para dados existentes
INSERT INTO platform.escolas (nome, slug, config)
VALUES (
  'Escola Padrão (Migração)',
  'escola-padrao',
  '{"migrado_em": "' || NOW() || '", "origem": "migracao_legado"}'
)
RETURNING id INTO escola_padrao_id;

-- 2. Migrar usuários
INSERT INTO platform.usuarios (email, nome, created_at)
SELECT 
  login || '@escola.local' as email, -- Email temporário
  nome,
  NOW()
FROM backup_usuarios_old
RETURNING id, email INTO TEMP TABLE usuarios_migrados;

-- 3. Associar usuários à escola
INSERT INTO platform.escola_usuarios (escola_id, usuario_id, papel, matricula)
SELECT 
  escola_padrao_id,
  um.id,
  CASE 
    WHEN uo.papel = 'professor' THEN 'professor'
    WHEN uo.papel = 'aluno' THEN 'aluno'
    WHEN uo.papel = 'gestao' THEN 'gestor'
    ELSE 'aluno'
  END as papel,
  uo.login as matricula
FROM backup_usuarios_old uo
JOIN usuarios_migrados um ON um.email = uo.login || '@escola.local';

-- 4. Migrar credenciais
INSERT INTO platform.auth_credenciais (usuario_id, senha_hash, algoritmo)
SELECT 
  um.id,
  uo.senha_hash,
  'bcrypt'
FROM backup_usuarios_old uo
JOIN usuarios_migrados um ON um.email = uo.login || '@escola.local';

-- 5. Instalar módulo calendário para a escola
INSERT INTO platform.escola_modulos (escola_id, modulo_id, config)
SELECT 
  escola_padrao_id,
  (SELECT id FROM platform.modulos WHERE slug = 'calendario'),
  '{"migrado_em": "' || NOW() || '"}';

-- 6. Migrar eventos
INSERT INTO modulo_calendario.eventos (
  escola_id,
  data,
  titulo,
  descricao,
  categoria,
  status,
  autor_id,
  created_at,
  updated_at
)
SELECT 
  escola_padrao_id,
  eo.date::DATE,
  eo.title,
  eo.nota,
  eo.category,
  eo.status,
  um.id as autor_id,
  NOW(),
  NOW()
FROM backup_eventos_old eo
LEFT JOIN usuarios_migrados um ON um.email = eo.autor_login || '@escola.local';

-- 7. Criar categorias padrão
INSERT INTO modulo_calendario.categorias (escola_id, nome, cor_hex, icone)
VALUES 
  (escola_padrao_id, 'urgente', '#dc2626', '🔥'),
  (escola_padrao_id, 'avaliação', '#d97706', '📝'),
  (escola_padrao_id, 'atividade', '#16a34a', '📚'),
  (escola_padrao_id, 'informativo', '#1a73e8', 'ℹ️'),
  (escola_padrao_id, 'cultural', '#7c3aed', '🎭'),
  (escola_padrao_id, 'outros', '#ea580c', '📌');
```

### **3. Script de Rollback:**
```sql
-- Se algo der errado, restaurar backup
DROP TABLE IF EXISTS modulo_calendario.eventos CASCADE;
DROP TABLE IF EXISTS modulo_calendario.categorias CASCADE;
DROP TABLE IF EXISTS platform.auth_credenciais CASCADE;
DROP TABLE IF EXISTS platform.escola_usuarios CASCADE;
DROP TABLE IF EXISTS platform.usuarios CASCADE;
DROP TABLE IF EXISTS platform.escola_modulos CASCADE;
DROP TABLE IF EXISTS platform.escolas CASCADE;

-- Restaurar dados antigos
-- (Os dados originais ainda estão em backup_usuarios_old e backup_eventos_old)
```

## 🔧 ATUALIZAÇÃO DA API

### **API Antiga (Compatibilidade):**
```typescript
// Mantida temporariamente, redireciona para nova API
app.get('/api/events', async (req, res) => {
  const escolaId = await getEscolaPadrao(req.user)
  const eventos = await getEventosPorEscola(escolaId)
  res.json({ events: eventos })
})
```

### **API Nova (Multi-tenant):**
```typescript
app.get('/api/v2/escolas/:escolaId/eventos', async (req, res) => {
  const { escolaId } = req.params
  verificarPermissao(req.user, escolaId, 'leitura')
  
  const eventos = await getEventosPorEscola(escolaId)
  res.json({ eventos })
})
```

## 📱 ATUALIZAÇÃO DO FRONTEND

### **Componentes a atualizar:**
1. `EnhancedCalendar.tsx` - Adicionar `escolaId` ao contexto
2. `EventModal.tsx` - Salvar com `escolaId`
3. API calls - Usar endpoint v2 com `escolaId`

### **Contexto multi-tenant:**
```typescript
interface TenantContext {
  escolaAtual: Escola
  usuarioEscola: EscolaUsuario
  permissoes: Permissao[]
  modulosInstalados: Modulo[]
}
```

## 🧪 TESTES DE MIGRAÇÃO

### **Testes a realizar:**
1. ✅ Migração de dados sem perda
2. ✅ Login SSO funcionando
3. ✅ Eventos aparecendo corretamente
4. ✅ Permissões aplicadas
5. ✅ Performance aceitável

### **Checklist pós-migração:**
- [ ] Todos os usuários conseguem logar
- [ ] Todos os eventos estão visíveis
- [ ] Categorias estão corretas
- [ ] API v2 respondendo
- [ ] Performance dentro do esperado

## ⚠️ RISCOS E MITIGAÇÃO

### **Risco 1: Perda de dados**
- **Mitigação**: Backup completo antes de migrar
- **Mitigação**: Script de rollback testado

### **Risco 2: Downtime prolongado**
- **Mitigação**: Migração em horário de menor uso
- **Mitigação**: API dupla durante transição

### **Risco 3: Performance degradada**
- **Mitigação**: Índices otimizados
- **Mitigação**: Cache estratégico
- **Mitigação**: Monitoramento contínuo

## 📊 MONITORAMENTO PÓS-MIGRAÇÃO

### **Métricas a monitorar:**
1. Tempo de resposta das APIs
2. Taxa de erro nas requisições
3. Uso de memória/CPU do banco
4. Logins bem-sucedidos/falhos

### **Alertas a configurar:**
- [ ] Erros > 5% por 5 minutos
- [ ] Response time > 2s
- [ ] Logins falhos em sequência
- [ ] Espaço em disco < 20%

## 🚀 PRÓXIMOS PASSOS

### **Imediato:**
1. [ ] Testar scripts em ambiente de staging
2. [ ] Validar backup/restore
3. [ ] Atualizar API para suportar escolaId

### **Curto prazo:**
4. [ ] Migrar ambiente de produção
5. [ ] Monitorar métricas por 24h
6. [ ] Otimizar queries se necessário

### **Longo prazo:**
7. [ ] Adicionar mais módulos
8. [ ] Implementar marketplace
9. [ ] Sistema de billing multi-tenant

## 📞 SUPORTE

### **Em caso de problemas:**
1. Executar script de rollback
2. Restaurar backup
3. Verificar logs de erro
4. Consultar este guia

### **Contato:**
- **Dev Responsável**: [Seu nome]
- **Backup Contact**: [Outra pessoa]
- **Horário de Migração**: [Data/Horário agendado]

---

**Última atualização:** 2026-07-29  
**Status:** Pronto para implementação  
**Complexidade:** Alta (requer planejamento cuidadoso)  
**Tempo estimado:** 4-8 horas para migração completa