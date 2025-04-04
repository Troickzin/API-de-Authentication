# **API de Autenticação**

Este projeto é um sistema de autenticação desenvolvido em poucos dias, contendo rotas para cadastro, login e logout. Além disso, permite vincular uma conta existente ao sistema de login do Google, possibilitando a autenticação direta via Google OAuth.

> **Nota:** O código foi feito para fins de aprendizado, ele ainda esta incompleto e contendo trechos que utilizei para experimentos, quaisquer feedback é bem-vindo!

## 🚀 **Endpoints**

### 🔑 **Autenticação**

- **`POST /Auth/signIn`**

  - Recebe um JSON no corpo da requisição com os seguintes campos:

    ```json
    {
      "email": "usuario@example.com",
      "senha": "sua_senha"
    }
    ```

- **`POST /Auth/signUp`**

  - Recebe um `FormData` no corpo da requisição com os seguintes campos:

    ```json
    {
      "email": "usuario@example.com",
      "senha": "sua_senha",
      "nome": "Seu Nome",
      "apelido": "Apelido",
      "foto_de_perfil": "imagem_convertida_em_base64"
    }
    ```

    > _Nota:_ Ao testar com Next.js, percebi que a propriedade path não era passada, assim impossibilitando o salvamento na AWS/Cloudinary. A solução temporária que encontrei foi enviar a imagem já convertida em base64. Pretendo adicionar uma verificação para identificar se a imagem é um arquivo ou um base64.

- **`POST /Auth/signOut`**
  - Limpa os cookies `httpOnly` para efetuar o logout.

### ✅ **Verificação e OAuth**

- **`GET /Auth/verify/:id`**

  - Valida o token enviado por e-mail para confirmação de conta. _(Esta rota está sujeita a reestruturação.)_

- **`GET /Auth/google`**

  - Redireciona o usuário para o OAuth do Google.

- **`GET /Auth/google/callback`**
  - Recebe os dados do usuário autenticado pelo Google.

## 🛠 **Tecnologias Utilizadas**

- **Node.js + TypeScript + Express** → Estrutura principal da API.
- **MongoDB** → Armazenamento dos dados dos usuários.
- **AWS S3 Bucket** → Armazenamento das fotos de perfil. _(Tinha utilizado o Cloudinary, mas optei pelo S3 para aprendizado.)_
- **Passport.js** → Integração com o sistema de autenticação do Google.
- **JSON Web Token (JWT)** → Geração e validação de tokens de autenticação.
- **Bcrypt** → Hash e criptografia de senhas dos usuários.
- **Nodemailer** → Envio de e-mails para validação de conta e notificações de atividades.

## 📌 **Considerações Finais**

Este projeto ainda está em desenvolvimento e sujeito a melhorias. Feedbacks e sugestões são bem-vindos!
