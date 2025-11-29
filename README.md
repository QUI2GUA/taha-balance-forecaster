# 📈 Tåha - Balance Forecasting

A self-hosted, recurring-transaction financial balance forecaster.

This application projects your bank balance 52 weeks into the future based on recurring rules (Weekly, Bi-Weekly, Monthly, etc.) and one-time transactions. It uses **Next.js Server Actions** for backend logic and **Prisma** for type-safe database interactions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Stack](https://img.shields.io/badge/stack-Next.js_|_Prisma_|_PostgreSQL-black)

## 🚀 Features

* **Smart Forecasting:** Projects running balances day-by-day for the next year.
* **Recurring Engine:** Handles Complex intervals (Bi-weekly paychecks, Quarterly bills).
* **Exception Handling:** Skip specific dates for recurring items or set end dates.
* **Self-Hosted:** Fully Dockerized with a multi-stage build for minimal footprint.
* **Type-Safe:** End-to-end type safety with TypeScript and Prisma.

## 🛠 Tech Stack

* **Framework:** Next.js 14+ (App Router)
* **Database:** PostgreSQL 15
* **ORM:** Prisma
* **Language:** TypeScript
* **Containerization:** Docker & Docker Compose

## ⚡ Quick Start (Docker)

You can spin up the entire stack (App + DB) with a single command.

### 1. Clone & Configure
Clone the repository and create your environment file (optional, defaults are in docker-compose).

```bash
git clone [https://github.com/yourusername/forecast-ledger.git](https://github.com/yourusername/forecast-ledger.git)
cd forecast-ledger
