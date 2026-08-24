# Asset Control - API de Equipamentos

A partir desta versao, os equipamentos ficam no SQLite do backend, e nao no localStorage como fonte principal.

## Backend

```powershell
cd backend
npm install
copy .env.example .env
npm run start
```

Edite `backend/.env` e defina um `JWT_SECRET` forte.

API: `http://localhost:3001`

## Frontend

Na raiz:

```powershell
npm install
copy .env.example .env
npm run dev
```

Para outro servidor, defina `VITE_API_URL` com a URL da API, por exemplo:

```env
VITE_API_URL=http://192.168.24.199:3001/api
```

## Migracao dos dados locais

Na primeira abertura autenticada, se a tabela `equipamentos` estiver vazia, o sistema procura `equipamentos_dados` ou `equipamentos_db` no navegador atual e envia os registros para a API. Depois da migracao bem-sucedida, essas chaves locais sao removidas.

## Endpoints protegidos

- GET `/api/equipamentos`
- POST `/api/equipamentos`
- POST `/api/equipamentos/bulk`
- PUT `/api/equipamentos/:id`
- DELETE `/api/equipamentos/:id`
- DELETE `/api/equipamentos`

Todas exigem `Authorization: Bearer <token>`.
