# Bank Ledger Service

A Node.js / Express backend that models a banking ledger with double-entry bookkeeping. Balances are **not stored** on accounts — they are always derived on the fly by aggregating immutable ledger entries (DEBIT / CREDIT), which makes the ledger auditable and tamper-resistant.

## Features

- **User authentication** — register, login, logout using JWT (3-day expiry) and bcrypt-hashed passwords.
- **Token blacklisting** — logged-out / invalid tokens are blacklisted and automatically expire after 3 days.
- **Account management** — each user can hold multiple accounts with a status (`ACTIVE`, `FROZEN`, `CLOSED`) and currency.
- **Derived balances** — account balance is computed from the ledger via an aggregation pipeline (credits − debits).
- **Double-entry transactions** — every transfer writes a DEBIT entry on the sender and a CREDIT entry on the receiver inside a single MongoDB transaction, guaranteeing atomicity.
- **Idempotent transfers** — each transaction is submitted with an `idempotencyKey` so retries never double-spend.
- **System funding route** — an authenticated *system user* can seed an account with initial funds.
- **Immutable ledger** — ledger entries cannot be updated or deleted at the database layer.
- **Email notifications** — registration, transaction success, and transaction failure emails via Nodemailer (Gmail OAuth2).

## Tech Stack

- Node.js (ES Modules)
- Express 5
- MongoDB (Mongoose 9) — requires a replica set for transactions
- JSON Web Tokens (jsonwebtoken)
- bcryptjs
- Nodemailer

## Project Structure

```
├── server.js                        # Entry point — starts the HTTP server
├── src/
│   ├── app.js                       # Express app + route mounting
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js       # register / login / logout
│   │   ├── account.controller.js    # create / list accounts, get balance
│   │   └── transaction.controller.js# transfers + system initial funding
│   ├── middlewares/
│   │   └── auth.middleware.js       # auth + system-user guards
│   ├── models/
│   │   ├── user.model.js            # users (password hashing + compare)
│   │   ├── accounts.model.js        # accounts + getBalance() aggregation
│   │   ├── transaction.model.js     # transfers (PENDING/COMPLETED/FAILED/REVERSED)
│   │   ├── ledger.model.js          # immutable DEBIT/CREDIT entries
│   │   └── blacklist.model.js       # blacklisted JWT tokens (TTL 3 days)
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── account.routes.js
│   │   └── transaction.route.js
│   └── services/
│       └── email.service.js         # Nodemailer transport + email templates
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB with **replica set support** (required for multi-document transactions — e.g. a MongoDB Atlas M0+ cluster or a local `mongod --replSet`).

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
PORT=3000
MONGO_URI="mongodb://..."
JWT_SECRET_KEY="your-secret"

# Gmail OAuth2 (used for sending emails)
EMAIL_USER="you@gmail.com"
CLIENT_ID="...apps.googleusercontent.com"
CLIENT_SECRET="..."
REFRESH_TOKEN="..."
```

Email sending is non-blocking: if the SMTP/OAuth2 setup fails, API responses still succeed and the error is logged.

### Running

```bash
npm run dev     # nodemon (auto-restart)
npm start       # node server.js
```

The service starts on `http://localhost:3000`.

## API Reference

### Health check

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/` | Health check — returns "Ledger Service is up and running" |

### Auth (`/api/auth`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/auth/register` | Register a user. Body: `name`, `email`, `password` (min 6 chars). Returns a JWT (also set as a cookie). |
| POST | `/api/auth/login` | Log in. Body: `email`, `password`. Returns a JWT (also set as a cookie). |
| POST | `/api/auth/logout` | Log out. Blacklists the current token and clears the cookie. |

### Accounts (`/api/accounts`) — protected

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/accounts/` | Create a new account for the authenticated user. |
| GET | `/api/accounts/` | List all accounts of the authenticated user. |
| GET | `/api/accounts/balance/:accountId` | Get the derived balance for one of the user's own accounts. |

### Transactions (`/api/transaction`) — protected

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/transaction/` | Transfer funds. Body: `fromAccount`, `toAccount`, `amount`, `idempotencyKey`. Sender must own `fromAccount`; both accounts must be `ACTIVE`; sender must have sufficient balance. |
| POST | `/api/transaction/system/initial-funds` | Seed an account with funds. Body: `toAccount`, `amount`, `idempotencyKey`. **Requires a system-user token** (user with `systemUser: true`). |

### Authentication header

Send the token as a Bearer token:

```
Authorization: Bearer <token>
```

or as a cookie (`token`), which is set automatically by register/login.

## How a Transfer Works

`POST /api/transaction/` follows a 10-step flow inside a MongoDB session:

1. Validate the request.
2. Validate the idempotency key (dedupe already-processed requests).
3. Check both accounts are `ACTIVE`.
4. Derive the sender's balance from the ledger.
5. Create the transaction document as `PENDING`.
6. Write the sender's `DEBIT` ledger entry.
7. Write the receiver's `CREDIT` ledger entry.
8. Mark the transaction `COMPLETED`.
9. Commit the session — all writes succeed or none do.
10. Send an email notification.

> Note: a deliberate 15-second delay is built in between the DEBIT and CREDIT entries so idempotency (concurrent retries while `PENDING`) can be observed in testing.

## Idempotency Behavior

Submitting the same `idempotencyKey` again returns a result depending on the stored transaction status:

| Stored status | Response |
| ------------- | -------- |
| `COMPLETED` | 200 — "Transaction already processed" (returns the transaction) |
| `PENDING` | 200 — "Transaction is still processing" |
| `FAILED` | 500 — "Transaction processing failed, please retry" |
| `REVERSED` | 500 — "Transaction was reversed, please retry" |

## Design Notes

- **Balances are derived, never stored.** `getBalance()` aggregates `ledger` entries grouped by account (`SUM(CREDIT) − SUM(DEBIT)`). A new account therefore starts at 0.
- **Ledger entries are immutable.** Update/delete operations are blocked by mongoose pre-hooks at the model layer.
- **Only your own money moves.** Senders can only transfer out of accounts they own, and only the owner can view an account's balance.
