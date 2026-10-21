# FoodBridge Platform — Food Surplus Management & Charity Donation Platform

> **DEPI Graduation Project — Enterprise Full-Stack .NET Solution**  
> Architected according to **Clean Architecture** principles, featuring ASP.NET Core, Entity Framework Core with SQL Server, ASP.NET Core Identity with JWT Authentication, SignalR Real-Time Notifications, Background Hosted Services, and a Responsive Web UI.

---

## 🏛 Clean Architecture Overview

The solution follows strict separation of concerns across 4 architectural layers:

```
FoodBridge/
├── src/
│   ├── FoodBridge.Domain/          # Core Domain Entities, Enums, Value Objects
│   │   ├── Entities/               # ApplicationUser, FoodListing, Reservation, Review, Notification, AuditLog
│   │   └── Enums/                  # UserType, UserStatus, FoodCategory, FoodListingStatus, ReservationStatus
│   │
│   ├── FoodBridge.Application/     # Use Cases, Business Logic, Interfaces, DTOs
│   │   ├── Common/                 # Result<T> pattern, Interfaces (IApplicationDbContext, INotificationService, etc.)
│   │   ├── DTOs/                   # Request/Response data transfer models
│   │   └── Services/               # AuthService, FoodListingService, ReservationService, ReviewService, AdminService, ReportingService
│   │
│   ├── FoodBridge.Infrastructure/  # External Concerns, Database Persistence, Identity
│   │   ├── Data/                   # FoodBridgeDbContext, Fluent API Mappings, DbInitializer & Seed Data
│   │   ├── Services/               # JwtTokenGenerator, LocalFileStorageService, EmailSenderService, NotificationService
│   │   ├── Hubs/                   # SignalR NotificationHub (/hubs/notifications)
│   │   └── BackgroundServices/     # ListingExpirationHostedService, PickupReminderHostedService
│   │
│   └── FoodBridge.Web/             # Presentation Layer, REST API Controllers, SPA Web Frontend
│       ├── Controllers/            # Auth, FoodListings, Reservations, Reviews, Notifications, Admin, Reports
│       ├── Services/               # CurrentUserService (IHttpContextAccessor wrapper)
│       └── wwwroot/                # Responsive Frontend (HTML5, Tailwind CSS, SignalR client, Chart.js)
│
└── tests/
    └── FoodBridge.Tests/           # Unit & Integration Tests (xUnit, Moq, EF Core InMemory)
```

---

## 🗄 Domain Entities & Relationships

| Entity | Primary Key | Key Fields & Audit Columns | Relationships |
| :--- | :--- | :--- | :--- |
| **`ApplicationUser`** | `string Id` (Identity) | `FullName`, `OrganizationName`, `OrganizationAddress`, `UserType` (Provider/Charity/Admin), `SpecificType`, `TargetCommunityDescription`, `IsVerified`, `Status` (Active/Suspended), `CreatedAt` | 1-to-N with `FoodListing`, `Reservation`, `Review`, `Notification`, `AuditLog` |
| **`FoodListing`** | `int Id` | `FoodName`, `Description`, `FoodCategory`, `Quantity`, `UnitOfMeasurement`, `PreparationDate`, `PickupDeadline`, `PickupAddress`, `StorageConditions`, `Allergens`, `ImageUrl`, `Status` (Available, Reserved, Completed, Expired, Cancelled, Unavailable), `RowVersion` (Timestamp) | N-to-1 with Provider (`ApplicationUser`), 1-to-N with `Reservation` |
| **`Reservation`** | `int Id` | `FoodListingId`, `CharityId`, `RequestDate`, `PickupDateTime`, `ConfirmedLocation`, `Status` (Pending, Accepted, Rejected, ReadyForPickup, Completed, Cancelled, ProblemReported), `CancellationReason`, `ProblemDescription`, `CompletedAt`, `RowVersion` | N-to-1 with `FoodListing`, N-to-1 with Charity (`ApplicationUser`), 1-to-N with `Review` |
| **`Review`** | `int Id` | `ReservationId`, `ReviewerId`, `RevieweeId`, `Rating` (1-5), `Comment`, `IsReported`, `ReportReason`, `CreatedAt` | Unique index on `(ReservationId, ReviewerId)` preventing duplicate reviews |
| **`Notification`** | `int Id` | `UserId`, `Title`, `Message`, `IsRead`, `RelatedEntityId`, `CreatedAt` | N-to-1 with `ApplicationUser`, indexed on `(UserId, IsRead)` |
| **`AuditLog`** | `int Id` | `AdminId`, `Action`, `TargetEntity`, `TargetId`, `Details`, `Timestamp` | N-to-1 with Admin (`ApplicationUser`), indexed on `Timestamp` |

---

## ⚡ Concurrency & Business Rules

1. **Optimistic Concurrency**:
   - Both `FoodListing` and `Reservation` configure `byte[] RowVersion` with EF Core's `.IsRowVersion()`.
   - Prevents race conditions where two charities reserve the exact same listing simultaneously (FR4.2).
2. **Mutual Reviews**:
   - Charity can review Provider and Provider can review Charity, only for reservations in `Completed` status (FR7.1).
   - Strict database unique constraint and service validation guarantees 1 review per party per completed reservation (FR7.3).
3. **Automatic Reservation Cancellation & Reversion**:
   - If a reservation is cancelled prior to pickup deadline, the food listing status automatically reverts to `Available` (FR4.8, FR4.9).
4. **Calculated Platform Statistics**:
   - Platform-wide redistributed food metrics (kg/portions) are calculated strictly using **completed donations only**, excluding cancelled, rejected, and expired items (FR9.5).
5. **Background Scheduled Services**:
   - `ListingExpirationHostedService`: Periodically transitions past-deadline listings from `Available`/`Reserved` to `Expired` and notifies providers (FR2.8).
   - `PickupReminderHostedService`: Periodically checks upcoming confirmed pickups within 2 hours and issues reminders to both provider and charity (FR6.4).

---

## 🔐 Pre-Seeded Demonstration Accounts

For convenient evaluation, the database automatically provisions the following accounts:

| Role | Email | Password | Organization & Notes |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@foodbridge.com` | `Admin@123456` | Platform Operations (Full Admin Dashboard & Moderation) |
| **Food Provider** | `chef.mario@bellaitalia.com` | `Provider@123` | Bella Italia Ristorante (Verified Restaurant) |
| **Food Provider** | `sarah@lebreadcraft.com` | `Provider@123` | Artisan Bread & Pastry Co. (Verified Bakery) |
| **Food Provider** | `banquets@grandpalace.com` | `Provider@123` | Grand Palace Hotel (Unverified — shows Admin approval workflow) |
| **Charity** | `coordinator@hopefoodbank.org` | `Charity@123` | Hope Community Food Bank (Verified Food Bank) |
| **Charity** | `shelter@stjude-care.org` | `Charity@123` | St. Jude Family Shelter (Verified Shelter) |
| **Charity** | `youth@alnoor-foundation.org` | `Charity@123` | Al-Noor Refugee Relief (Unverified — shows Admin approval workflow) |

---

## 🚀 Running the Project & Tests

### Run Automated Tests (xUnit)
```powershell
cd FoodBridge
dotnet test tests/FoodBridge.Tests/FoodBridge.Tests.csproj
```
*(All 10 unit and integration tests verify concurrency handling, expiration background logic, mutual review prevention, admin audit logging, and platform calculation exclusions).*

### Run Full-Stack Web Application
```powershell
cd FoodBridge
dotnet run --project src/FoodBridge.Web/FoodBridge.Web.csproj --urls "http://localhost:5000"
```

Access points:
- **Web User Interface**: `http://localhost:5000`
- **Interactive Swagger / OpenAPI UI**: `http://localhost:5000/swagger`
- **SignalR Real-Time Notifications Hub**: `http://localhost:5000/hubs/notifications`
