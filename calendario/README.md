# 🎓 EduCalendário — Documentação do Sistema

> Sistema de calendário escolar desenvolvido para resolver o problema de **desinformação** na escola:  
> *"O que vai acontecer? Quando acontece? Trotes, troca de aulas, eventos..."*

---

## 📁 Estrutura de Arquivos

```
calendario/
├── index.html    → Estrutura HTML (login + 3 painéis de usuário + modal)
├── style.css     → Toda a estilização (variáveis, layout, componentes)
├── app.js        → Toda a lógica JavaScript (auth, calendário, eventos, grade)
└── README.md     → Esta documentação
```

---

## 🔐 Credenciais de Acesso

> ⚠️ O login é **estrito**: usuário ou senha incorretos exibem mensagem de erro e **não permitem acesso**.

| Perfil      | Login            | Senha        |
|-------------|------------------|--------------|
| 👨‍🏫 Professor | `prof.rafael`    | `prof123`    |
| 👨‍🎓 Aluno     | `aluno.joao`     | `aluno123`   |
| 🏫 Gestão   | `gestao.escola`  | `gestao123`  |

### Dados dos usuários no sistema

| Campo       | Professor         | Aluno             | Gestão                  |
|-------------|-------------------|-------------------|--------------------------|
| Nome        | Rafael F. Bonfim  | João P. Silva     | Maria S. Costa           |
| Identificador | —               | RA: 2024001       | —                        |
| Cargo/Turma | Prof. ETEC Zona Sul | 3º Ano TI      | Coordenadora Pedagógica  |

---

## 👤 Perfis e Funcionalidades

### 👨‍🏫 Professor

**Fluxo completo:**
1. Entra no site → Aba "Professor" → Login com `prof.rafael` / `prof123`
2. Visualiza o **Calendário** com todos os seus eventos e seus status
3. Cria eventos em **Novo Evento** → evento vai automaticamente para status `Aguardando Aprovação`
4. Acompanha os status em **Meus Eventos** (filtros: Todos / Aguardando / Aprovados / Reprovados)
5. Consulta a **Grade Horária** completa da semana
6. Se um evento for **reprovado**, pode editá-lo → volta para `Aguardando`

**Páginas disponíveis:**
- 📅 Calendário
- 📋 Meus Eventos (com filtros de status)
- ➕ Novo Evento (formulário inline)
- 📚 Grade Horária

---

### 👨‍🎓 Aluno

**Fluxo completo:**
1. Entra no site → Aba "Aluno" → Login com `aluno.joao` / `aluno123`
2. Visualiza o **Calendário** — exibe **somente eventos aprovados pela Gestão**
3. Consulta lista de **Próximos Eventos** confirmados
4. Consulta a **Grade Horária** da sua turma

**Restrições:**
- Não pode criar, editar ou excluir eventos
- Não visualiza eventos pendentes ou reprovados
- Não acessa dados de outros alunos ou professores

**Páginas disponíveis:**
- 📅 Calendário (somente eventos aprovados)
- 📋 Próximos Eventos
- 📚 Grade Horária

---

### 🏫 Gestão

**Fluxo completo:**
1. Entra no site → Aba "Gestão" → Login com `gestao.escola` / `gestao123`
2. Acessa o **Painel Geral** com contadores: total, pendentes, aprovados, reprovados
3. Em **Aprovar Eventos** → revisa cada evento pendente → Aprova ✅ ou Reprova ❌ (com motivo opcional)
4. O badge vermelho no menu mostra quantos eventos aguardam análise
5. Pode visualizar o **Calendário completo** (todos os status)
6. Pode **adicionar eventos** diretamente (já entram como aprovados)
7. Acessa **Grade Horária**, lista de **Alunos** e **Professores**

**Restrições:**
- Não acessa dados pessoais de alunos e professores

**Páginas disponíveis:**
- 📊 Painel Geral (estatísticas + todos os eventos)
- ✅ Aprovar Eventos (fila de pendentes)
- 📅 Calendário completo
- 📚 Grade Horária
- 👨‍🎓 Alunos cadastrados
- 👨‍🏫 Professores cadastrados

---

## 📅 Calendário

- Navegação por mês com botões `←` e `→`
- Dia atual destacado com borda azul
- Eventos exibidos como chips coloridos por status:

| Cor do chip     | Significado              |
|-----------------|--------------------------|
| 🟡 Amarelo claro | ⏳ Aguardando aprovação  |
| 🟢 Verde claro   | ✅ Aprovado              |
| 🔴 Vermelho claro (riscado) | ❌ Reprovado  |
| Azul / Verde / Amarelo / etc. | Categoria do evento |

- Clicar num **dia vazio** → abre modal para criar evento
- Clicar num **chip de evento** → abre modal para editar (professor/gestão) ou ver detalhes (aluno)

---

## 📚 Grade Horária

A grade segue a estrutura de **7 aulas + 2 intervalos** por dia:

| Bloco        | Horário         | Tipo       |
|--------------|-----------------|------------|
| Aula 1       | 07:30 – 08:20   | 📖 Aula    |
| Aula 2       | 08:20 – 09:10   | 📖 Aula    |
| Aula 3       | 09:10 – 10:00   | 📖 Aula    |
| ☕ Intervalo 1 | 10:00 – 10:15 | ☕ Intervalo |
| Aula 4       | 10:15 – 11:05   | 📖 Aula    |
| Aula 5       | 11:05 – 11:55   | 📖 Aula    |
| ☕ Intervalo 2 | 11:55 – 12:10 | ☕ Intervalo |
| Aula 6       | 12:10 – 13:00   | 📖 Aula    |
| Aula 7       | 13:00 – 13:50   | 📖 Aula    |

### Disciplinas

| Abreviação | Disciplina              |
|------------|-------------------------|
| PM         | Programação Mobile      |
| VER        | Versionamento           |
| BD         | Banco de Dados          |
| IA         | Inteligência Artificial |
| MAT        | Matemática              |
| POR        | Português               |
| HIS        | História                |
| PV         | Projeto de Vida         |
| FE         | Front-End               |
| BE         | Back-End                |
| EF         | Educação Física         |

### Grade Semanal

|        | Segunda         | Terça           | Quarta          | Quinta          | Sexta           |
|--------|-----------------|-----------------|-----------------|-----------------|-----------------|
| Aula 1 | Prog. Mobile    | Front-End       | Banco de Dados  | Int. Artificial | Matemática      |
| Aula 2 | Versionamento   | Back-End        | Versionamento   | Banco de Dados  | Educação Física |
| Aula 3 | Banco de Dados  | Educação Física | Int. Artificial | Front-End       | Projeto de Vida |
| ☕     | —               | —               | —               | —               | —               |
| Aula 4 | Int. Artificial | Matemática      | Front-End       | Back-End        | Prog. Mobile    |
| Aula 5 | Matemática      | Português       | Projeto de Vida | Educação Física | Back-End        |
| ☕     | —               | —               | —               | —               | —               |
| Aula 6 | Português       | História        | Prog. Mobile    | Matemática      | Front-End       |
| Aula 7 | História        | Projeto de Vida | Matemática      | Português       | Versionamento   |

---

## 🎨 Design e UX

### Paleta de Cores por Perfil

| Perfil     | Cor Principal | Sidebar          |
|------------|---------------|------------------|
| Professor  | Azul `#1a73e8`  | Azul escuro `#1e3a8a` |
| Aluno      | Verde `#16a34a` | Verde escuro `#14532d` |
| Gestão     | Roxo `#7c3aed`  | Roxo escuro `#4c1d95` |

### Princípios de UX aplicados
- **Hierarquia visual clara**: títulos grandes, subtítulos em cinza, dados em destaque
- **Feedback imediato**: mensagens de erro no login, badges de status, alertas coloridos
- **Restrição por papel**: cada perfil vê apenas o que é relevante para ele
- **Status sempre visível**: chips coloridos no calendário, badges nas listas
- **Navegação lateral**: sidebar fixa com indicador de página ativa
- **Ponto verde animado**: indica usuário conectado

---

## 🔄 Fluxo de Aprovação de Eventos

```
Professor cria evento
       ↓
  Status: ⏳ PENDENTE
  (visível só para professor e gestão)
       ↓
  Gestão analisa
    ↙         ↘
✅ APROVA    ❌ REPROVA (com motivo)
    ↓               ↓
Aparece no      Exibe "Reprovado"
calendário      para o professor
do aluno        (pode editar e reenviar)
```

---

## ⚙️ Tecnologias Utilizadas

| Tecnologia     | Uso                                      |
|----------------|------------------------------------------|
| HTML5          | Estrutura semântica das páginas          |
| CSS3 (Vanilla) | Layout, animações, variáveis CSS         |
| JavaScript (ES6+) | Lógica, autenticação, renderização    |
| Google Fonts   | Tipografia Nunito (legibilidade escolar) |

> Nenhuma dependência externa além das fontes. Funciona 100% offline via arquivo local.

---

## 📝 Eventos Pré-cadastrados

| Data       | Evento                  | Status    | Categoria      |
|------------|-------------------------|-----------|----------------|
| 22/04/2026 | Reunião de Pais         | ✅ Aprovado | Reunião       |
| 25/04/2026 | Prova de Matemática     | ✅ Aprovado | Prova/Aval.   |
| 28/04/2026 | Feira de Ciências       | ✅ Aprovado | Evento Escolar|
| 05/05/2026 | Gincana Escolar         | ⏳ Pendente | Outro         |
| 10/05/2026 | Prova de Front-End      | ✅ Aprovado | Prova/Aval.   |
| 15/05/2026 | Conselho de Classe      | ❌ Reprovado | Reunião      |
| 20/05/2026 | Semana da Tecnologia    | ✅ Aprovado | Aula/Ativ.    |
| 30/05/2026 | Feriado – Dia do Trabalho | ✅ Aprovado | Feriado     |

---

## 🚀 Como Abrir o Sistema

1. Navegue até a pasta `calendario/`
2. Abra o arquivo `index.html` no navegador (duplo clique)
3. Use as credenciais da tabela acima para acessar

> Não é necessário servidor, instalação ou internet (exceto para carregar a fonte Nunito no primeiro acesso).

---

*Desenvolvido como solução ao problema de desinformação escolar — ETEC Zona Sul · Abril/2026*
