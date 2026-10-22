-- ============================================================================
-- FoodBridge Platform Database Schema & Seed Data Script
-- Microsoft SQL Server / LocalDB
-- Database: FoodBridgeDb
-- ============================================================================

USE [master];
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'FoodBridgeDb')
BEGIN
    CREATE DATABASE [FoodBridgeDb];
END
GO

USE [FoodBridgeDb];
GO

-- ============================================================================
-- 1. ASP.NET Core Identity Tables
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AspNetRoles')
BEGIN
    CREATE TABLE [AspNetRoles] (
        [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
        [Name] NVARCHAR(256) NULL,
        [NormalizedName] NVARCHAR(256) NULL,
        [ConcurrencyStamp] NVARCHAR(MAX) NULL
    );
    CREATE UNIQUE NONCLUSTERED INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AspNetUsers')
BEGIN
    CREATE TABLE [AspNetUsers] (
        [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
        [UserName] NVARCHAR(256) NULL,
        [NormalizedUserName] NVARCHAR(256) NULL,
        [Email] NVARCHAR(256) NULL,
        [NormalizedEmail] NVARCHAR(256) NULL,
        [EmailConfirmed] BIT NOT NULL DEFAULT 0,
        [PasswordHash] NVARCHAR(MAX) NULL,
        [SecurityStamp] NVARCHAR(MAX) NULL,
        [ConcurrencyStamp] NVARCHAR(MAX) NULL,
        [PhoneNumber] NVARCHAR(MAX) NULL,
        [PhoneNumberConfirmed] BIT NOT NULL DEFAULT 0,
        [TwoFactorEnabled] BIT NOT NULL DEFAULT 0,
        [LockoutEnd] DATETIMEOFFSET NULL,
        [LockoutEnabled] BIT NOT NULL DEFAULT 1,
        [AccessFailedCount] INT NOT NULL DEFAULT 0,
        -- FoodBridge ApplicationUser Extensions
        [FullName] NVARCHAR(150) NOT NULL DEFAULT N'',
        [OrganizationName] NVARCHAR(200) NOT NULL DEFAULT N'',
        [OrganizationAddress] NVARCHAR(300) NOT NULL DEFAULT N'',
        [UserType] INT NOT NULL DEFAULT 1,
        [SpecificType] NVARCHAR(100) NULL,
        [TargetCommunityDescription] NVARCHAR(1000) NULL,
        [IsVerified] BIT NOT NULL DEFAULT 0,
        [Status] INT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    CREATE NONCLUSTERED INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
    CREATE UNIQUE NONCLUSTERED INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AspNetUserRoles')
BEGIN
    CREATE TABLE [AspNetUserRoles] (
        [UserId] NVARCHAR(450) NOT NULL,
        [RoleId] NVARCHAR(450) NOT NULL,
        PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AspNetUserClaims')
BEGIN
    CREATE TABLE [AspNetUserClaims] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserId] NVARCHAR(450) NOT NULL,
        [ClaimType] NVARCHAR(MAX) NULL,
        [ClaimValue] NVARCHAR(MAX) NULL,
        CONSTRAINT [FK_AspNetUserClaims_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END
GO

-- ============================================================================
-- 2. FoodBridge Domain Tables
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FoodListings')
BEGIN
    CREATE TABLE [FoodListings] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [ProviderId] NVARCHAR(450) NOT NULL,
        [FoodName] NVARCHAR(150) NOT NULL,
        [Description] NVARCHAR(1000) NOT NULL,
        [FoodCategory] INT NOT NULL,
        [Quantity] DECIMAL(18,2) NOT NULL,
        [UnitOfMeasurement] NVARCHAR(50) NOT NULL,
        [PreparationDate] DATETIMEOFFSET NOT NULL,
        [PickupDeadline] DATETIMEOFFSET NOT NULL,
        [PickupAddress] NVARCHAR(250) NOT NULL,
        [StorageConditions] NVARCHAR(200) NOT NULL,
        [Allergens] NVARCHAR(250) NOT NULL,
        [ImageUrl] NVARCHAR(500) NULL,
        [Status] INT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [UpdatedAt] DATETIMEOFFSET NULL,
        [RowVersion] ROWVERSION NOT NULL,
        CONSTRAINT [FK_FoodListings_AspNetUsers] FOREIGN KEY ([ProviderId]) REFERENCES [AspNetUsers] ([Id])
    );
    CREATE NONCLUSTERED INDEX [IX_FoodListings_Status] ON [FoodListings] ([Status]);
    CREATE NONCLUSTERED INDEX [IX_FoodListings_FoodCategory] ON [FoodListings] ([FoodCategory]);
    CREATE NONCLUSTERED INDEX [IX_FoodListings_PickupDeadline] ON [FoodListings] ([PickupDeadline]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reservations')
BEGIN
    CREATE TABLE [Reservations] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [FoodListingId] INT NOT NULL,
        [CharityId] NVARCHAR(450) NOT NULL,
        [RequestDate] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [PickupDateTime] DATETIMEOFFSET NULL,
        [ConfirmedLocation] NVARCHAR(250) NULL,
        [Status] INT NOT NULL DEFAULT 1,
        [CancellationReason] NVARCHAR(500) NULL,
        [ProblemDescription] NVARCHAR(1000) NULL,
        [CompletedAt] DATETIMEOFFSET NULL,
        [RowVersion] ROWVERSION NOT NULL,
        CONSTRAINT [FK_Reservations_FoodListings] FOREIGN KEY ([FoodListingId]) REFERENCES [FoodListings] ([Id]),
        CONSTRAINT [FK_Reservations_AspNetUsers] FOREIGN KEY ([CharityId]) REFERENCES [AspNetUsers] ([Id])
    );
    CREATE NONCLUSTERED INDEX [IX_Reservations_Status] ON [Reservations] ([Status]);
    CREATE NONCLUSTERED INDEX [IX_Reservations_FoodListingId] ON [Reservations] ([FoodListingId]);
    CREATE NONCLUSTERED INDEX [IX_Reservations_CharityId] ON [Reservations] ([CharityId]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reviews')
BEGIN
    CREATE TABLE [Reviews] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [ReservationId] INT NOT NULL,
        [ReviewerId] NVARCHAR(450) NOT NULL,
        [RevieweeId] NVARCHAR(450) NOT NULL,
        [Rating] INT NOT NULL,
        [Comment] NVARCHAR(1000) NULL,
        [IsReported] BIT NOT NULL DEFAULT 0,
        [ReportReason] NVARCHAR(500) NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT [FK_Reviews_Reservations] FOREIGN KEY ([ReservationId]) REFERENCES [Reservations] ([Id]),
        CONSTRAINT [FK_Reviews_Reviewer] FOREIGN KEY ([ReviewerId]) REFERENCES [AspNetUsers] ([Id]),
        CONSTRAINT [FK_Reviews_Reviewee] FOREIGN KEY ([RevieweeId]) REFERENCES [AspNetUsers] ([Id])
    );
    CREATE UNIQUE NONCLUSTERED INDEX [IX_Reviews_Reservation_Reviewer] ON [Reviews] ([ReservationId], [ReviewerId]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE [Notifications] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserId] NVARCHAR(450) NOT NULL,
        [Title] NVARCHAR(200) NOT NULL,
        [Message] NVARCHAR(1000) NOT NULL,
        [IsRead] BIT NOT NULL DEFAULT 0,
        [RelatedEntityId] INT NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT [FK_Notifications_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX [IX_Notifications_UserId_IsRead] ON [Notifications] ([UserId], [IsRead]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
BEGIN
    CREATE TABLE [AuditLogs] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [AdminId] NVARCHAR(450) NOT NULL,
        [Action] NVARCHAR(100) NOT NULL,
        [TargetEntity] NVARCHAR(100) NOT NULL,
        [TargetId] NVARCHAR(100) NOT NULL,
        [Details] NVARCHAR(2000) NOT NULL,
        [Timestamp] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT [FK_AuditLogs_AspNetUsers] FOREIGN KEY ([AdminId]) REFERENCES [AspNetUsers] ([Id])
    );
    CREATE NONCLUSTERED INDEX [IX_AuditLogs_Timestamp] ON [AuditLogs] ([Timestamp]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemSettings')
BEGIN
    CREATE TABLE [SystemSettings] (
        [Key] NVARCHAR(100) NOT NULL PRIMARY KEY,
        [Value] NVARCHAR(MAX) NOT NULL,
        [UpdatedAt] DATETIMEOFFSET NOT NULL,
        [UpdatedBy] NVARCHAR(200) NULL
    );
END
GO

-- ============================================================================
-- 3. Pre-Seeded Roles
-- ============================================================================

IF NOT EXISTS (SELECT * FROM [AspNetRoles] WHERE [Name] = 'Admin')
    INSERT INTO [AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('role-admin', 'Admin', 'ADMIN', NEWID());

IF NOT EXISTS (SELECT * FROM [AspNetRoles] WHERE [Name] = 'Provider')
    INSERT INTO [AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('role-provider', 'Provider', 'PROVIDER', NEWID());

IF NOT EXISTS (SELECT * FROM [AspNetRoles] WHERE [Name] = 'Charity')
    INSERT INTO [AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('role-charity', 'Charity', 'CHARITY', NEWID());
GO

-- ============================================================================
-- Note on Application Execution:
-- When launching via 'dotnet run', EF Core automatically invokes
-- DbInitializer.SeedAsync() which checks and populates all demonstration
-- accounts, food listings, reservations, reviews, and operational audit logs.
-- ============================================================================
PRINT 'FoodBridge database schema successfully verified/created.';
GO
