# Nutri Journey

Plataforma profissional para gestão de pacientes e consultas nutricionais, construída com Clean Architecture e TypeScript strict.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Princípios Arquiteturais](#princípios-arquiteturais)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Camadas da Arquitetura](#camadas-da-arquitetura)
   - [Domain Layer](#1-domain-layer)
   - [Application Layer](#2-application-layer)
   - [Infrastructure Layer](#3-infrastructure-layer)
   - [Presentation Layer](#4-presentation-layer)
6. [Fluxo de Dados](#fluxo-de-dados)
7. [Padrões e Convenções](#padrões-e-convenções)
8. [Como Adicionar uma Nova Feature](#como-adicionar-uma-nova-feature)
9. [Configuração e Setup](#configuração-e-setup)

---

## 🎯 Visão Geral

O **Nutri Journey** é uma plataforma web desenvolvida seguindo os princípios de **Clean Architecture** e **SOLID**, garantindo:

- ✅ **Separação de responsabilidades** clara entre camadas
- ✅ **Testabilidade** facilitada pela inversão de dependências
- ✅ **Manutenibilidade** através de código organizado e tipado
- ✅ **Escalabilidade** para adicionar novas features sem quebrar o existente
- ✅ **Type Safety** total com TypeScript strict (sem `any` ou `unknown`)

---

## 🛠 Stack Tecnológica

### Core

- **Next.js 15** - Framework React com App Router
- **TypeScript 5.6** - Tipagem estática com modo strict
- **React 19** - Biblioteca UI

### Estilização

- **Tailwind CSS 3.4** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI reutilizáveis
- **Framer Motion** - Animações suaves

### Estado e Dados

- **Zustand 4.5** - Gerenciamento de estado global (client-side)
- **Prisma 5.19** - ORM com tipagem forte
- **Neon Postgres** - Banco de dados PostgreSQL serverless

### Autenticação

- **NextAuth 5.0** - Autenticação tipada

### Validação

- **Zod 3.23** - Validação de schemas e variáveis de ambiente

---

## 🏗 Princípios Arquiteturais

### Clean Architecture

A aplicação é dividida em **4 camadas principais**, cada uma com responsabilidades bem definidas:

```
┌─────────────────────────────────────┐
│     Presentation Layer              │  ← UI, Componentes React, Next.js
├─────────────────────────────────────┤
│     Application Layer               │  ← Casos de Uso, Regras de Negócio
├─────────────────────────────────────┤
│     Domain Layer                    │  ← Entidades, Interfaces, Regras Puras
├─────────────────────────────────────┤
│     Infrastructure Layer             │  ← Banco de Dados, APIs Externas
└─────────────────────────────────────┘
```

### Regra de Dependência

**As dependências sempre apontam para dentro:**

- `Presentation` → depende de `Application` e `Domain`
- `Application` → depende apenas de `Domain`
- `Domain` → **não depende de nada** (camada mais pura)
- `Infrastructure` → implementa interfaces de `Domain`

### SOLID

- **S**ingle Responsibility: Cada classe/arquivo tem uma única responsabilidade
- **O**pen/Closed: Aberto para extensão, fechado para modificação
- **L**iskov Substitution: Interfaces podem ser substituídas por implementações
- **I**nterface Segregation: Interfaces específicas e focadas
- **D**ependency Inversion: Dependências de abstrações, não de implementações

---

## 📁 Estrutura de Pastas

```
nutri-journey/
├── prisma/
│   └── schema.prisma                 # Schema do banco de dados
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (protected)/              # Grupo de rotas protegidas
│   │   │   └── app/                  # Painel principal
│   │   │       ├── layout.tsx        # Layout com Sidebar + Topbar
│   │   │       ├── page.tsx          # Dashboard
│   │   │       ├── patients/         # Módulo de pacientes
│   │   │       ├── programs/         # Módulo de programas
│   │   │       ├── reports/          # Módulo de relatórios
│   │   │       └── settings/         # Módulo de configurações
│   │   ├── auth/                     # Rotas públicas de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── layout.tsx                # Layout raiz da aplicação
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Estilos globais
│   │
│   ├── domain/                       # 🟢 CAMADA DE DOMÍNIO
│   │   ├── entities/                 # Entidades de negócio
│   │   │   ├── Professional.ts
│   │   │   ├── Organization.ts
│   │   │   ├── Patient.ts
│   │   │   └── Consultation.ts
│   │   └── repositories/             # Interfaces de repositório
│   │       ├── ProfessionalRepository.ts
│   │       ├── OrganizationRepository.ts
│   │       ├── PatientRepository.ts
│   │       └── ConsultationRepository.ts
│   │
│   ├── application/                  # 🟡 CAMADA DE APLICAÇÃO
│   │   ├── use-cases/                # Casos de uso (regras de negócio)
│   │   │   ├── CreatePatient.ts
│   │   │   └── ListPatients.ts
│   │   └── factories/                # Factories para criar use cases
│   │       ├── makeCreatePatientUseCase.ts
│   │       └── makeListPatientsUseCase.ts
│   │
│   ├── infra/                        # 🔴 CAMADA DE INFRAESTRUTURA
│   │   ├── database/
│   │   │   └── prisma.ts             # Cliente Prisma singleton
│   │   └── repositories/             # Implementações Prisma
│   │       ├── PrismaProfessionalRepository.ts
│   │       ├── PrismaOrganizationRepository.ts
│   │       ├── PrismaPatientRepository.ts
│   │       └── PrismaConsultationRepository.ts
│   │
│   ├── presentation/                 # 🔵 CAMADA DE APRESENTAÇÃO
│   │   ├── auth/                     # Configuração de autenticação
│   │   │   ├── config.ts
│   │   │   └── types.ts
│   │   ├── components/               # Componentes React
│   │   │   ├── layout/                # Componentes de layout
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Topbar.tsx
│   │   │   └── ui/                   # Componentes shadcn/ui
│   │   │       ├── button.tsx
│   │   │       └── card.tsx
│   │   ├── lib/
│   │   │   └── utils.ts              # Utilitários (cn, etc.)
│   │   └── stores/                   # Stores Zustand
│   │       ├── ui-store.ts           # Estado da UI
│   │       └── session-store.ts      # Estado da sessão
│   │
│   ├── config/                       # ⚙️ CONFIGURAÇÕES
│   │   └── env.ts                    # Validação de env com Zod
│   │
│   └── middleware.ts                 # Middleware Next.js para auth
│
├── package.json
├── tsconfig.json                     # TypeScript strict mode
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## 🧩 Camadas da Arquitetura

### 1. Domain Layer

**Localização:** `src/domain/`

**Responsabilidade:** Contém as **regras de negócio puras** e as **entidades** do domínio. Esta camada **não depende de nada externo** (nem Next.js, nem Prisma, nem bibliotecas de UI).

#### 1.1 Entidades (`src/domain/entities/`)

As entidades representam os **conceitos centrais** do domínio. São interfaces TypeScript puras que definem a estrutura dos dados.

**Exemplo: `Patient.ts`**

```typescript
export interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthDate: Date | null;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientCreateInput {
  name: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  organizationId: string;
}

export interface PatientUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
}
```

**Características:**

- ✅ Interfaces puras (sem implementação)
- ✅ Sem dependências externas
- ✅ Tipos fortes (sem `any` ou `unknown`)
- ✅ DTOs de entrada/saída separados (`CreateInput`, `UpdateInput`)

**Entidades disponíveis:**

- `Professional` - Profissional de nutrição
- `Organization` - Organização/Clínica
- `Patient` - Paciente
- `Consultation` - Consulta nutricional

#### 1.2 Repositórios (`src/domain/repositories/`)

Os repositórios são **interfaces** que definem os contratos para persistência de dados. A implementação fica na camada de infraestrutura.

**Exemplo: `PatientRepository.ts`**

```typescript
import type {
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
} from "../entities/Patient";

export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  findByOrganizationId(organizationId: string): Promise<Patient[]>;
  create(data: PatientCreateInput): Promise<Patient>;
  update(id: string, data: PatientUpdateInput): Promise<Patient>;
  delete(id: string): Promise<void>;
}
```

**Características:**

- ✅ Apenas interfaces (sem implementação)
- ✅ Métodos assíncronos retornando `Promise`
- ✅ Tipos de domínio (não tipos do Prisma)
- ✅ Permite múltiplas implementações (Prisma, MongoDB, API, etc.)

**Por que interfaces?**

- Permite trocar o banco de dados sem alterar o código de domínio
- Facilita testes (mock de repositórios)
- Segue o princípio de Dependency Inversion

---

### 2. Application Layer

**Localização:** `src/application/`

**Responsabilidade:** Contém os **casos de uso** (use cases) que orquestram a lógica de negócio. Esta camada depende apenas do `domain`.

#### 2.1 Casos de Uso (`src/application/use-cases/`)

Os casos de uso encapsulam uma **ação específica** do sistema. Cada caso de uso:

1. Recebe um input tipado
2. Valida e processa os dados
3. Chama os repositórios necessários
4. Retorna um output tipado

**Exemplo: `CreatePatient.ts`**

```typescript
import type { Patient, PatientCreateInput } from "@/domain/entities/Patient";
import type { PatientRepository } from "@/domain/repositories/PatientRepository";

export interface CreatePatientInput {
  name: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  organizationId: string;
}

export interface CreatePatientOutput {
  patient: Patient;
}

export class CreatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: CreatePatientInput): Promise<CreatePatientOutput> {
    const patientData: PatientCreateInput = {
      name: input.name,
      organizationId: input.organizationId,
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.birthDate !== undefined && { birthDate: input.birthDate }),
    };

    const patient = await this.patientRepository.create(patientData);

    return { patient };
  }
}
```

**Características:**

- ✅ Classe com método `execute()`
- ✅ Recebe repositórios via construtor (Dependency Injection)
- ✅ Input e Output tipados separadamente
- ✅ Lógica de negócio isolada
- ✅ Fácil de testar (mock dos repositórios)

**Fluxo de um caso de uso:**

```
Input → Validação → Processamento → Repositório → Output
```

#### 2.2 Factories (`src/application/factories/`)

As factories são funções que **montam** os casos de uso com suas dependências (repositórios da infraestrutura).

**Exemplo: `makeCreatePatientUseCase.ts`**

```typescript
import { CreatePatientUseCase } from "../use-cases/CreatePatient";
import { PrismaPatientRepository } from "@/infra/repositories/PrismaPatientRepository";

export function makeCreatePatientUseCase(): CreatePatientUseCase {
  const patientRepository = new PrismaPatientRepository();
  return new CreatePatientUseCase(patientRepository);
}
```

**Por que factories?**

- ✅ Centraliza a criação de dependências
- ✅ Facilita a troca de implementações
- ✅ Simplifica o uso nas rotas/actions do Next.js
- ✅ Permite injeção de dependências em testes

**Uso nas rotas:**

```typescript
// Em uma Server Action ou Route Handler
const createPatientUseCase = makeCreatePatientUseCase();
const result = await createPatientUseCase.execute(input);
```

---

### 3. Infrastructure Layer

**Localização:** `src/infra/`

**Responsabilidade:** Implementa as **detalhes técnicos** de persistência e integrações externas. Esta camada implementa as interfaces do `domain`.

#### 3.1 Banco de Dados (`src/infra/database/`)

**`prisma.ts`** - Cliente Prisma singleton

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Características:**

- ✅ Singleton pattern (evita múltiplas conexões)
- ✅ Logs condicionais por ambiente
- ✅ Compatível com hot reload do Next.js

#### 3.2 Repositórios Prisma (`src/infra/repositories/`)

Implementam as interfaces de repositório do `domain` usando Prisma.

**Exemplo: `PrismaPatientRepository.ts`**

```typescript
import type {
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
} from "@/domain/entities/Patient";
import type { PatientRepository } from "@/domain/repositories/PatientRepository";
import { prisma } from "../database/prisma";

export class PrismaPatientRepository implements PatientRepository {
  async findById(id: string): Promise<Patient | null> {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return null;
    return this.toDomain(patient);
  }

  async create(data: PatientCreateInput): Promise<Patient> {
    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
        birthDate: data.birthDate ?? null,
        organizationId: data.organizationId,
      },
    });
    return this.toDomain(patient);
  }

  // ... outros métodos

  private toDomain(patient: PrismaPatient): Patient {
    return {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate,
      organizationId: patient.organizationId,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }
}
```

**Características:**

- ✅ Implementa a interface do `domain`
- ✅ Método `toDomain()` converte Prisma → Domain
- ✅ Trata `null` e `undefined` corretamente
- ✅ Isola detalhes do Prisma da camada de domínio

**Por que `toDomain()`?**

- Separa o modelo do banco (Prisma) do modelo de domínio
- Permite transformações e validações
- Facilita migração para outro ORM

---

### 4. Presentation Layer

**Localização:** `src/presentation/` e `src/app/`

**Responsabilidade:** Interface do usuário, componentes React, rotas Next.js e adaptadores para o framework.

#### 4.1 Componentes React (`src/presentation/components/`)

**Layout Components:**

- `Sidebar.tsx` - Barra lateral com navegação
- `Topbar.tsx` - Barra superior com informações do usuário

**UI Components (shadcn/ui):**

- `button.tsx` - Botão reutilizável
- `card.tsx` - Card com glassmorphism

**Características:**

- ✅ Componentes funcionais com TypeScript
- ✅ Usam hooks do Zustand para estado
- ✅ Estilização com Tailwind CSS
- ✅ Animações com Framer Motion

#### 4.2 Stores Zustand (`src/presentation/stores/`)

Gerenciam estado global no client-side.

**`ui-store.ts`** - Estado da UI (sidebar, modais, etc.)

```typescript
interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}
```

**`session-store.ts`** - Estado da sessão (client-side)

```typescript
interface SessionState {
  professional: Professional | null;
  organization: Organization | null;
  setSession: (professional: Professional, organization: Organization) => void;
  clearSession: () => void;
}
```

**Quando usar Zustand vs Server State?**

- **Zustand**: Estado de UI (sidebar, filtros, formulários)
- **Server State**: Dados do banco (vem de Server Actions/API Routes)

#### 4.3 Rotas Next.js (`src/app/`)

**Estrutura de rotas:**

```
/                    → Landing page (pública)
/auth/login          → Login (pública)
/auth/register       → Registro (pública)
/app                 → Dashboard (protegida)
/app/patients        → Lista de pacientes (protegida)
/app/programs        → Programas (protegida)
/app/reports         → Relatórios (protegida)
/app/settings        → Configurações (protegida)
```

**Layout hierárquico:**

```
app/layout.tsx                    # Layout raiz
  └── app/(protected)/app/layout.tsx  # Layout do painel (Sidebar + Topbar)
      └── app/(protected)/app/page.tsx # Conteúdo da página
```

#### 4.4 Autenticação (`src/presentation/auth/`)

**`config.ts`** - Configuração do NextAuth
**`types.ts`** - Extensão de tipos do NextAuth

**Middleware (`src/middleware.ts`):**

- Protege rotas `/app/*`
- Redireciona não autenticados para `/auth/login`

---

## 🔄 Fluxo de Dados

### Exemplo: Criar um Paciente

```
1. Usuário preenche formulário
   ↓
2. Componente React (Presentation)
   ↓
3. Server Action ou Route Handler (Presentation)
   ↓
4. Factory cria Use Case (Application)
   ↓
5. Use Case executa lógica (Application)
   ↓
6. Use Case chama Repository (Domain interface)
   ↓
7. Prisma Repository implementa (Infrastructure)
   ↓
8. Prisma salva no banco (Infrastructure)
   ↓
9. Repository retorna entidade de domínio (Domain)
   ↓
10. Use Case retorna output (Application)
   ↓
11. Server Action retorna resposta (Presentation)
   ↓
12. Componente atualiza UI (Presentation)
```

### Diagrama Visual

```
┌─────────────────┐
│   React Form     │ ← Presentation
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  Server Action  │ ← Presentation
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│   Factory       │ ← Application
│ (makeUseCase)   │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│   Use Case      │ ← Application
│  (execute)      │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  Repository     │ ← Domain (interface)
│  Interface      │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│ Prisma Repo     │ ← Infrastructure
│ (implementation)│
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│   Database      │ ← Neon Postgres
└─────────────────┘
```

---

## 📐 Padrões e Convenções

### Nomenclatura

- **Entidades**: PascalCase (`Patient`, `Professional`)
- **Repositórios**: `[Entity]Repository` (`PatientRepository`)
- **Implementações**: `Prisma[Entity]Repository` (`PrismaPatientRepository`)
- **Use Cases**: `[Action][Entity]` (`CreatePatient`, `ListPatients`)
- **Factories**: `make[UseCase]` (`makeCreatePatientUseCase`)
- **Componentes**: PascalCase (`Sidebar`, `Topbar`)
- **Stores**: `[name]-store` (`ui-store`, `session-store`)

### TypeScript

- ✅ **Sempre** use tipos explícitos
- ❌ **Nunca** use `any` ou `unknown`
- ✅ Use `interface` para objetos
- ✅ Use `type` para unions e intersections
- ✅ Prefira `readonly` quando possível

### Imports

```typescript
// 1. Imports externos
import { useState } from "react";
import { z } from "zod";

// 2. Imports internos (usando aliases)
import type { Patient } from "@/domain/entities/Patient";
import { makeCreatePatientUseCase } from "@/application/factories/makeCreatePatientUseCase";
import { Button } from "@/presentation/components/ui/button";
```

### Estrutura de Arquivos

**Use Case:**

```typescript
// 1. Imports
// 2. Interfaces (Input, Output)
// 3. Classe do Use Case
// 4. Método execute()
```

**Repository:**

```typescript
// 1. Imports
// 2. Classe implementando interface
// 3. Métodos públicos
// 4. Método privado toDomain()
```

---

## 🚀 Como Adicionar uma Nova Feature

### Exemplo: Adicionar "Consultas"

#### 1. **Domain Layer** - Criar entidade

`src/domain/entities/Consultation.ts` (já existe)

#### 2. **Domain Layer** - Criar interface de repositório

`src/domain/repositories/ConsultationRepository.ts` (já existe)

#### 3. **Infrastructure Layer** - Implementar repositório

`src/infra/repositories/PrismaConsultationRepository.ts` (já existe)

#### 4. **Application Layer** - Criar use case

`src/application/use-cases/CreateConsultation.ts`

```typescript
import type {
  Consultation,
  ConsultationCreateInput,
} from "@/domain/entities/Consultation";
import type { ConsultationRepository } from "@/domain/repositories/ConsultationRepository";

export interface CreateConsultationInput {
  patientId: string;
  professionalId: string;
  date: Date;
  notes?: string;
}

export interface CreateConsultationOutput {
  consultation: Consultation;
}

export class CreateConsultationUseCase {
  constructor(
    private readonly consultationRepository: ConsultationRepository
  ) {}

  async execute(
    input: CreateConsultationInput
  ): Promise<CreateConsultationOutput> {
    const consultationData: ConsultationCreateInput = {
      patientId: input.patientId,
      professionalId: input.professionalId,
      date: input.date,
      notes: input.notes,
    };

    const consultation = await this.consultationRepository.create(
      consultationData
    );

    return { consultation };
  }
}
```

#### 5. **Application Layer** - Criar factory

`src/application/factories/makeCreateConsultationUseCase.ts`

```typescript
import { CreateConsultationUseCase } from "../use-cases/CreateConsultation";
import { PrismaConsultationRepository } from "@/infra/repositories/PrismaConsultationRepository";

export function makeCreateConsultationUseCase(): CreateConsultationUseCase {
  const consultationRepository = new PrismaConsultationRepository();
  return new CreateConsultationUseCase(consultationRepository);
}
```

#### 6. **Presentation Layer** - Criar página/componente

`src/app/(protected)/app/consultations/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { makeCreateConsultationUseCase } from "@/application/factories/makeCreateConsultationUseCase";

export default function ConsultationsPage() {
  const [loading, setLoading] = useState(false);

  async function handleCreateConsultation(data: FormData) {
    setLoading(true);
    const useCase = makeCreateConsultationUseCase();
    // ... implementar
  }

  return (
    <div>
      <h1>Consultas</h1>
      {/* ... */}
    </div>
  );
}
```

#### 7. **Prisma** - Atualizar schema (se necessário)

`prisma/schema.prisma` (já existe)

```bash
npm run db:push
```

---

## ⚙️ Configuração e Setup

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# URL de conexão do Neon Postgres (obtenha no dashboard do Neon)
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"
NEXTAUTH_SECRET="seu-secret-aqui-minimo-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

**Importante:**
- A `DATABASE_URL` deve apontar para seu banco **Neon Postgres**
- Em produção (Vercel), configure a mesma variável nas Environment Variables
- O Prisma usa automaticamente `DATABASE_URL` do ambiente

### 3. Configurar Banco de Dados

**Importante:** O projeto está configurado para usar **Neon Postgres** (banco PostgreSQL serverless). Certifique-se de que a variável `DATABASE_URL` no `.env.local` aponta para seu banco Neon.

```bash
# Gerar Prisma Client
npm run db:generate

# Para desenvolvimento (sincroniza schema diretamente)
npm run db:push

# Para criar uma nova migration (desenvolvimento)
npm run db:migrate

# Para aplicar migrations em produção (Neon/Vercel)
npm run db:migrate:deploy
```

**Nota sobre Migrations:**
- Use `db:push` apenas em desenvolvimento local
- Use `db:migrate` para criar novas migrations
- Use `db:migrate:deploy` para aplicar migrations em produção (Vercel, Neon, etc.)

### 4. Executar Projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

---

## 📝 Scripts Disponíveis

| Script                    | Descrição                                    |
| ------------------------- | -------------------------------------------- |
| `npm run dev`             | Inicia servidor de desenvolvimento           |
| `npm run build`           | Build para produção                          |
| `npm run start`           | Inicia servidor de produção                  |
| `npm run lint`            | Executa ESLint                               |
| `npm run db:generate`     | Gera Prisma Client                           |
| `npm run db:push`         | Sincroniza schema (apenas desenvolvimento)   |
| `npm run db:migrate`      | Cria nova migration (desenvolvimento)        |
| `npm run db:migrate:deploy` | Aplica migrations em produção (Neon/Vercel) |
| `npm run db:studio`       | Abre Prisma Studio                           |

---

## 🎨 Design System

### Glassmorphism

Todos os cards e painéis usam o efeito glassmorphism:

```css
bg-white/5              /* Fundo translúcido */
backdrop-blur-lg        /* Blur do fundo */
border border-white/10  /* Borda sutil */
rounded-2xl             /* Bordas arredondadas */
shadow-lg               /* Sombra suave */
```

### Cores

- **Fundo**: Gradiente escuro (`from-slate-900 via-slate-950 to-slate-900`)
- **Texto primário**: Branco (`text-white`)
- **Texto secundário**: `text-slate-400`
- **Botão primário**: Azul (`bg-primary`)

### Animações

- **Entrada**: Fade-in + slide vertical (Framer Motion)
- **Hover**: Transições suaves (200-300ms)
- **Transições**: Sempre suaves e discretas

---

## 🔒 TypeScript Strict

O projeto usa TypeScript com todas as flags strict ativadas:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

**Implicações:**

- ❌ Não pode usar `any` ou `unknown`
- ✅ Deve tratar `null` e `undefined` explicitamente
- ✅ Arrays indexados retornam `T | undefined`
- ✅ Propriedades opcionais não podem ser `undefined` explicitamente

---

## 📚 Recursos Adicionais

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 🤝 Contribuindo

Ao adicionar novas features, sempre siga:

1. ✅ A arquitetura em camadas
2. ✅ As convenções de nomenclatura
3. ✅ O padrão de factories
4. ✅ TypeScript strict (sem `any`)
5. ✅ Testes quando possível

---

**Desenvolvido com ❤️ seguindo Clean Architecture e SOLID**
