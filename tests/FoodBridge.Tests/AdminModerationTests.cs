using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using FoodBridge.Application.Common.Interfaces;
using FoodBridge.Application.Services.Implementations;
using FoodBridge.Domain.Entities;
using FoodBridge.Domain.Enums;
using FoodBridge.Tests.TestHelpers;

namespace FoodBridge.Tests;

public class AdminModerationTests
{
    private readonly Mock<INotificationService> _mockNotification = new();

    [Fact]
    public async Task VerifyOrganizationAsync_UpdatesStatusAndCreatesAuditLog()
    {
        var db = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        var adminService = new AdminService(db, _mockNotification.Object);

        var admin = new ApplicationUser { Id = "admin-1", FullName = "Admin", UserType = UserType.Administrator };
        var provider = new ApplicationUser
        {
            Id = "provider-unverified",
            FullName = "New Provider",
            OrganizationName = "Local Bakery",
            UserType = UserType.FoodProvider,
            IsVerified = false
        };

        db.Users.AddRange(admin, provider);
        await db.SaveChangesAsync();

        var result = await adminService.VerifyOrganizationAsync("admin-1", "provider-unverified", isApproved: true);

        Assert.True(result.Succeeded);

        var updatedProvider = await db.Users.FindAsync("provider-unverified");
        Assert.True(updatedProvider!.IsVerified);

        var audit = await db.AuditLogs.FirstOrDefaultAsync(a => a.TargetId == "provider-unverified");
        Assert.NotNull(audit);
        Assert.Equal("ApproveVerification", audit!.Action);
        Assert.Equal("admin-1", audit.AdminId);
    }

    [Fact]
    public async Task SetUserStatusAsync_WhenSuspending_SetsStatusSuspendedAndAuditLogs()
    {
        var db = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        var adminService = new AdminService(db, _mockNotification.Object);

        var admin = new ApplicationUser { Id = "admin-1", FullName = "Admin" };
        var charity = new ApplicationUser { Id = "charity-violator", FullName = "Charity Violator", Status = UserStatus.Active };

        db.Users.AddRange(admin, charity);
        await db.SaveChangesAsync();

        var result = await adminService.SetUserStatusAsync("admin-1", "charity-violator", suspend: true);

        Assert.True(result.Succeeded);

        var updatedCharity = await db.Users.FindAsync("charity-violator");
        Assert.Equal(UserStatus.Suspended, updatedCharity!.Status);

        var audit = await db.AuditLogs.FirstOrDefaultAsync(a => a.TargetId == "charity-violator" && a.Action == "SuspendUser");
        Assert.NotNull(audit);
    }

    [Fact]
    public async Task SetUserStatusAsync_WhenAdminSuspendsSelf_ReturnsFailureSecurityRule()
    {
        var db = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        var adminService = new AdminService(db, _mockNotification.Object);

        var admin = new ApplicationUser { Id = "admin-1", FullName = "Admin", UserType = UserType.Administrator };
        db.Users.Add(admin);
        await db.SaveChangesAsync();

        var result = await adminService.SetUserStatusAsync("admin-1", "admin-1", suspend: true);

        Assert.False(result.Succeeded);
        Assert.Contains("cannot suspend their own account", result.Error);
    }
}