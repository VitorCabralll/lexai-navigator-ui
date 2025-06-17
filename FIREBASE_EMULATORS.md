# Firebase Emulator Suite

Este guia explica como executar todo o backend do projeto localmente usando o **Firebase Emulator Suite**. Isso inclui Auth, Firestore, Storage e Functions.

## Pré-requisitos

- Node.js 18+
- [Firebase CLI](https://firebase.google.com/docs/cli) instalado globalmente:
  ```bash
  npm install -g firebase-tools
  ```

## Configuração

1. Na raiz do repositório, edite o arquivo `firebase.json` e adicione a seção `emulators` caso ela não exista:

   ```json
   {
     "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
     "storage": { "rules": "storage.rules" },
     "functions": { "source": "functions" },
     "hosting": { "public": "dist" },
     "emulators": {
       "auth": { "port": 9099 },
       "firestore": { "port": 8080 },
       "storage": { "port": 9199 },
       "functions": { "port": 5001 },
       "ui": { "enabled": true, "port": 4000 }
     }
   }
   ```

2. Instale as dependências das Functions (caso ainda não tenha feito):

   ```bash
   cd functions
   npm install
   cd ..
   ```

## Executando

Para iniciar todos os emuladores, execute na raiz do projeto:

```bash
firebase emulators:start
```

A interface do Emulator Suite ficará disponível em `http://localhost:4000`.

Você pode opcionalmente especificar quais serviços deseja iniciar:

```bash
firebase emulators:start --only auth,firestore,storage,functions
```

Para preservar os dados entre execuções, utilize as flags `--import` e `--export-on-exit`:

```bash
firebase emulators:start --import=./local-data --export-on-exit
```

Com os emuladores rodando, o frontend e as Functions se comunicarão com as instâncias locais, permitindo testes completos do backend sem depender do Firebase em produção.

