# Budget App Backend

A robust backend system for managing personal finances, built with .NET Core and following Clean Architecture principles.

## 🚀 Features

- Transaction Management
- User Budget Tracking
- Category-based Spending Analysis
- Monthly Income/Expense Reports
- Daily Cash Flow Tracking
- Pagination Support
- RESTful API Design

## 🏗️ Architecture

The project follows Clean Architecture principles with the following layers:

- **API Layer** (`BudgetAppBackend.API`): Handles HTTP requests and responses
- **Application Layer** (`BudgetAppBackend.Application`): Contains business logic and use cases
- **Domain Layer** (`BudgetAppBackend.Domain`): Contains enterprise business rules and entities
- **Infrastructure Layer** (`BudgetAppBackend.Infrastructure`): Implements interfaces defined in the application layer

## 🛠️ Technology Stack

- .NET Core 8.0+
- Entity Framework Core
- MediatR for CQRS
- FluentValidation
- SQL Server
- xUnit for Testing

## 📋 Prerequisites

- .NET 8.0 SDK or later
- Postgress
- Visual Studio 2022 or VS Code
- Node.js (for frontend)

## 🔧 Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/phucv2376/451Project.git
   ```

2. Navigate to the project directory:
   ```bash
   cd BudgetAppBackend
   ```

3. Restore dependencies:
   ```bash
   dotnet restore
   ```

4. Update the connection string in `appsettings.json` with ollama settings


6. Start the application:
   ```bash
   dotnet run --project BudgetAppBackend.API
   ```

## 🧪 Running Tests

```bash
dotnet test
```

## 📚 API Documentation

The API follows RESTful principles and includes the following endpoints:

### Transaction Endpoints
- `GET /api/Transaction/user/{userId}/list-of-transactions` - Get paginated transactions
- `GET /api/Transaction/user/{userId}/recent-transactions` - Get recent transactions
- `GET /api/Transaction/user/{userId}/monthly-expenses` - Get monthly expenses
- `GET /api/Transaction/user/{userId}/monthly-income` - Get monthly income
- `POST /api/Transaction/create` - Create new transaction
- `PUT /api/Transaction/update/{transactionId}` - Update transaction
- `DELETE /api/Transaction/delete/{transactionId}` - Delete transaction
- `GET /api/Transaction/users/{userId}/month-cashflow` - Get detailed daily cash flow
- `GET /api/Transaction/users/{userId}/spending-per-category` - Get spending analysis by category

### Budget Endpoints
- `POST /api/Budget/create` - Create new budget
- `PUT /api/Budget/update` - Update existing budget
- `DELETE /api/Budget/delete` - Delete budget
- `GET /api/Budget/list-of-budgets` - Get all budgets for a user
- `GET /api/Budget/last-four-mothns-total` - Get category totals for last four months
- `GET /api/Budget/top-five-current-month-transaction-by-budget` - Get top 5 expenses by budget

### Authentication Endpoints
- `POST /api/Auth/register` - Register new user
- `POST /api/Auth/login` - User login
- `POST /api/Auth/refresh-token` - Refresh authentication token
- `POST /api/Auth/reset-password` - Reset user password
- `POST /api/Auth/verify-email` - Verify user email
- `POST /api/Auth/send-verification-code` - Send email verification code
- `DELETE /api/Auth/delete-account` - Delete user account (requires authentication)

### AI Analysis Endpoints
- `GET /api/AiAnalysis/QuarterlyTransactionAnalysis/{userId}` - Get quarterly transaction analysis
- `GET /api/AiAnalysis/ForecastSpendingTrends/{userId}` - Get spending forecast trends

### Reports Endpoints
- `GET /api/Reports/monthly` - Generate monthly financial report (PDF)

### Plaid Integration Endpoints
- `POST /api/Plaid/link-token` - Create Plaid link token
- `POST /api/Plaid/exchange-token` - Exchange public token
- `POST /api/Plaid/transactions/sync` - Sync Plaid transactions
- `GET /api/Plaid/accounts` - Get linked Plaid accounts

### Chat Endpoints
- `POST /api/Chat/ask/{userId}` - Ask AI assistant questions (Server-Sent Events)

## 🔐 Security

- JWT Authentication
- Role-based Authorization
- Input Validation
- SQL Injection Prevention
- XSS Protection

## 📦 Project Structure

```
BudgetAppBackend/
├── BudgetAppBackend.API/           # API Layer
├── BudgetAppBackend.Application/   # Application Layer
├── BudgetAppBackend.Domain/        # Domain Layer
├── BudgetAppBackend.Infrastructure/# Infrastructure Layer
├── BudgetAppBackend.API.Tests/     # API Tests
└── BudgetAppBackend.Domain.Tests/  # Domain Tests
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details

## 👥 Authors

- Abdalrahman Bashir, Lisa Mach, Sumaiya Mohamud, Phuc Vo

## 🙏 Acknowledgments

- Clean Architecture principles by Robert C. Martin
- .NET Core team for the amazing framework
- All contributors who have helped shape this project
