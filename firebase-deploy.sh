
#!/bin/bash

echo "🚀 Preparando deploy para Firebase..."

# Verificar se as variáveis de ambiente estão configuradas
if [ ! -f ".env.local" ]; then
    echo "❌ Arquivo .env.local não encontrado"
    echo "📝 Copie .env.local.example para .env.local e configure suas credenciais"
    exit 1
fi

# Build do projeto
echo "📦 Fazendo build do projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build do projeto"
    exit 1
fi

# Deploy para Firebase
echo "🔥 Fazendo deploy para Firebase..."
firebase deploy

if [ $? -eq 0 ]; then
    echo "✅ Deploy realizado com sucesso!"
    echo "🌐 Acesse seu projeto no Firebase Console"
else
    echo "❌ Erro no deploy"
    exit 1
fi
