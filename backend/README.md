Mini Wallet Backend

Quick overview of implemented APIs (Node.js + Express + MongoDB/Mongoose):

Base URL: `http://localhost:5000`

Auth
- POST `/api/auth/register` - register new user
  - body: `{ fullName, aadharCard, mobileNo, email, password }`
  - success: 201 with message

- POST `/api/auth/login` - login
  - body: `{ email, password }`
  - success: 200 with `{ message, token }`

Wallet (protected - Bearer token)
- GET `/api/wallet/balance` - returns `{ balance }`
- POST `/api/wallet/credit` - credit wallet
  - body: `{ amount, description }`
  - success: 201 `{ balance, transaction }`
- POST `/api/wallet/debit` - debit wallet (fails when insufficient funds)
  - body: `{ amount, description }`
  - success: 200 `{ balance, transaction }`
- GET `/api/wallet/transactions?limit=20&page=1` - returns paginated transaction list

Notes:
- Uses JWT for authentication. Set `JWT_SECRET_KEY` and `MONGO_URI` in `.env`.
- All wallet updates are performed inside MongoDB transactions to ensure atomicity.
- Balance is stored on the `Wallet` document and recorded for each transaction in `balanceAfterTransaction`.
