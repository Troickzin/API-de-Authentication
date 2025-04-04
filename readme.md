# **API DE AUTENTICAÇÃO**

Fiz um sistema de autenticação que levou apenas alguns dias, com rotas para fazer o cadastro, login, e para deslogar, tambem e possivel vincular ha uma conta existente ao sistema de login com o google, para assim poder entrar direto pelo google.

###### ( releve o codigo bagunçado, queria testa-lo antes de fazer uma versao final e organizada, alem de ter codigos que eu utilizei para experimentos )

## **End Points** :

- **POST Auth/signIn --** Esta rota pede um json no body que contem **{email, senha}**

- **POST Auth/signUp --** Esta rota pede um FormData no body que contem **{email, senha, nome, apelido, foto_de_perfil}**

- **POST Auth/signOut --** Esta rota apenas limpa os Cookies httpOnly

- **GET Auth/verify/:id --** Esta rota valida o token enviado para o e-mail ( usada para teste, sujeito a re-escrita )

- **GET Auth/google --** Rota que redireciona para o 0Auth do google

- **GET Auth/google/callback --** Rota que recebe os dados vindo do 0Auth do google

## **Tecnologias utilizadas** :

- **Node.Js + Typescript + Express --** Todo o corpo da API

- **MongoDB --** armazenar os dados dos usuarios

- **AWS Bucket S3 --** armazenar as fotos de perfil dos usuarios ( ja cheguei a utilizar o cloudinary, mas optei pelo S3 por questao de aprendizado )

- **Passport --** Para ter acesso ao sistema de Auth do google

- **Json Web Token --** Para armazenamento seguro dos tokens

- **Bcrypt --** Utilizado para criptografar as senhas do usuario

- **Nodemailer --** Utilizado para validar o email no cadastro do usuario por meio de token, e avisar ao usuario movimentações na conta
