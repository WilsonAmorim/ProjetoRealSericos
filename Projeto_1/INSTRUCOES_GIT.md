# Instruções para Enviar o Projeto ao GitHub 🚀

Siga estes passos para subir o seu código para um novo repositório no GitHub:

## Passo 1: Inicializar o repositório local
Abra o terminal na pasta do projeto (`c:\Users\wilson.amorim\Downloads\Antigravyt\Projeto_1`) e execute:

```bash
git init
```

## Passo 2: Adicionar os arquivos
Como já configuramos o arquivo `.gitignore`, o Node Modules e suas credenciais (`.env`) não serão enviados acidentalmente. Adicione todos os arquivos com:

```bash
git add .
```

## Passo 3: Fazer o primeiro Commit
```bash
git commit -m "feat: initial commit with hexagonal architecture and test suite"
```

## Passo 4: Criar o repositório no GitHub
1. Acesse o [GitHub](https://github.com/new).
2. Crie um novo repositório (Público ou Privado).
3. **Não marque** as opções de adicionar README, .gitignore ou licença (pois nós já criamos no código).
4. Clique em "Create repository".

## Passo 5: Conectar o repositório local com o GitHub
Copie o link gerado pelo GitHub (será algo como `https://github.com/SeuUsuario/NomeDoRepo.git`) e conecte-o localmente:

```bash
git remote add origin https://github.com/SeuUsuario/NomeDoRepo.git
```

## Passo 6: Renomear a branch principal e enviar o código
```bash
git branch -M main
git push -u origin main
```

🎉 **Pronto!** O código estará online e a GitHub Action (`ci.yml`) começará a rodar automaticamente para validar seus testes!
