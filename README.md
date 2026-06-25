# 🎓 EduCalendário — A Solução para a Organização Escolar

O **EduCalendário** foi criado para acabar com a desinformação no ambiente escolar. Chega de dúvidas sobre datas de provas, eventos ou mudanças de horário. Tudo o que acontece na escola, agora em um só lugar, de forma organizada e acessível.

---

## 🚀 O que é o EduCalendário?

É uma plataforma centralizada que conecta **Professores, Alunos e a Gestão Escolar**. Nosso objetivo é garantir que a informação correta chegue a todos no momento certo, eliminando confusões e facilitando o dia a dia acadêmico.

---

## 🎯 Principais Funcionalidades

- **Calendário Inteligente:** Visualize eventos, provas e feriados com cores que facilitam a identificação.
- **Grade Horária Digital:** Tenha o horário das aulas da semana sempre à mão.
- **Fluxo de Aprovação:** A gestão revisa e aprova os eventos antes que eles apareçam para os alunos, garantindo a veracidade das informações.
- **Acesso Personalizado:** Cada usuário vê apenas o que é relevante para o seu perfil.

---

## 👥 Perfis de Uso

### 👨‍🏫 Professor
O professor pode propor novos eventos, como provas e trabalhos, e acompanhar em tempo real se foram aprovados pela coordenação.

### 👨‍🎓 Aluno
O aluno tem uma visão limpa e segura, acessando apenas os eventos confirmados e sua grade horária atualizada.

### 🏫 Gestão
A coordenação tem o controle total: aprova eventos, gerencia o calendário geral e garante que toda a escola esteja em sintonia.

---

## 🔐 Como Acessar a Demonstração

Para testar as diferentes visões do projeto durante a apresentação, utilize as contas abaixo:

| Perfil | Usuário | Senha |
| :--- | :--- | :--- |
| **Professor** | `prof.rafael` | `prof123` |
| **Aluno** | `aluno.joao` | `aluno123` |
| **Gestão** | `gestao.escola` | `gestao123` |

---

## 🛠️ Tecnologias
O projeto utiliza o que há de mais moderno e leve na web (**HTML5, CSS3, JavaScript e Next.js**) garantindo que o sistema seja rápido, bonito e funcione em qualquer dispositivo.

---

## 🚀 Executando localmente

1. Instale dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Seeds de demonstração: acesse `POST /api/seed` para popular usuários e eventos demo.

4. Acesse: http://localhost:3000


---

## 📦 Deploy

A forma mais simples de deploy é via Vercel (https://vercel.com). Crie um projeto apontando para este repositório e o Vercel fará o build automaticamente.

> Atenção: o projeto atualmente usa um banco JSON local (lowdb) para demos. Em produção substitua por MongoDB Atlas ou outro DB gerenciado.

---

*Projeto desenvolvido para a ETEC Zona Sul · Abril 2026*
