
const API_BASE = '/api';
let currentUser = JSON.parse(localStorage.getItem('foodbridge_user')) || null;
let currentView = 'landing';
let currentCategoryFilter = null;
let currentDetailListing = null;
let signalrConnection = null;
let categoryChartInstance = null;
let monthlyChartInstance = null;

let currentLang = localStorage.getItem('foodbridge_lang') || 'en';

const i18nDict = {
    en: {
        brandName: 'FoodBridge',
        brandSubtitle: 'Surplus Redistribution Platform',
        navHome: 'Home',
        navBrowse: 'Browse Donations',
        navProvider: 'Provider Portal',
        navCharity: 'Charity Portal',
        navAdmin: 'Admin Suite',
        navImpact: 'Impact & Stats',
        signIn: 'Sign In',
        register: 'Register',
        signOut: 'Sign Out',
        liveNotifications: 'Live Notifications',
        markAllRead: 'Mark all read',
        noNotifications: 'No notifications yet.',
        heroBadge: 'Connecting Surplus to Need',
        heroTitle: 'Bridge the Gap Between <span class="text-emerald-300">Food Waste</span> & <span class="text-teal-300">Hunger</span>',
        heroDesc: 'FoodBridge connects restaurants, hotels, and bakeries with verified charities â€” turning daily food surplus into life-changing meals for thousands in need.',
        joinFree: 'Join FoodBridge â€” Free',
        statRedistributed: 'Kg of Food Redistributed',
        statRedistributedDesc: 'From completed donations',
        statCompleted: 'Completed Donations',
        statCompletedSub: 'Successfully delivered',
        statProviders: 'Food Providers',
        statProvidersSub: 'Restaurants, bakeries & hotels',
        statCharities: 'Charity Partners',
        statCharitiesSub: 'Verified & active',
        howItWorksTitle: 'How FoodBridge Works',
        howItWorksSubtitle: 'A streamlined, secure, and real-time platform for food redistribution â€” from posting to pickup in minutes.',
        step1Title: 'Provider Posts Surplus',
        step1Desc: 'Restaurants, bakeries, and hotels list available food with details â€” quantity, pickup time, allergens, storage conditions, and photos.',
        step2Title: 'Charity Reserves Food',
        step2Desc: 'Verified charities browse available donations, filter by category and date, and submit a reservation request â€” all in real time.',
        step3Title: 'Pickup & Delivery',
        step3Desc: 'Provider confirms pickup details. Charity collects the food and marks the donation as completed. Both parties leave mutual reviews.',
        whoUsesHeading: 'Who Uses FoodBridge?',
        whoUsesSubtitle: 'Two types of organizations â€” united by one mission.',
        providerCardTitle: 'Food Providers',
        providerCardDesc: 'Restaurants, hotels, bakeries, and catering companies with daily food surplus that would otherwise go to waste.',
        pFeature1: 'Post food listings with photos & allergens',
        pFeature2: 'Accept or reject charity reservation requests',
        pFeature3: 'Confirm exact pickup location and time',
        pFeature4: 'Track donation history and impact stats',
        registerAsProvider: 'Register as Provider',
        charityCardTitle: 'Charities & NGOs',
        charityCardDesc: 'Food banks, shelters, community centers, and relief organizations serving underprivileged communities.',
        cFeature1: 'Browse available food by category and date',
        cFeature2: 'Reserve donations with one click',
        cFeature3: 'Receive real-time notifications via SignalR',
        cFeature4: 'Track food received and submit partner reviews',
        registerAsCharity: 'Register as Charity',
        platformFeaturesHeading: 'Platform Features',
        platformFeaturesSubtitle: 'Built with enterprise-grade technology to ensure security, reliability, and real-time coordination.',
        feat1Title: 'Real-Time Notifications',
        feat1Desc: 'Instant SignalR push alerts for reservation updates, acceptances, pickups, and reviews.',
        feat2Title: 'JWT + Role-Based Auth',
        feat2Desc: 'Secure JWT authentication with Admin, Provider, and Charity role-based access control.',
        feat3Title: 'Email Verification',
        feat3Desc: 'All new accounts must verify their email before accessing protected features.',
        feat4Title: 'Concurrency Protection',
        feat4Desc: 'Optimistic concurrency (RowVersion) prevents two charities from reserving the same listing simultaneously.',
        feat5Title: 'Admin Audit Trail',
        feat5Desc: 'Every admin action is logged immutably â€” verifications, suspensions, removals, and resolutions.',
        feat6Title: 'Auto-Expiry Background Service',
        feat6Desc: 'Hosted background service automatically marks listings as Expired when the pickup deadline passes.',
        ctaHeading: 'Ready to Make an Impact?',
        ctaSubtitle: 'Join FoodBridge today â€” registration is free, fast, and fully verified.',
        createFreeAccount: 'Create Free Account',
        alreadyHaveAccount: 'Already have an account?',
        signInHere: 'Sign in here',
        directFrom: 'Direct From Local Restaurants, Bakeries & Hotels',
        exploreBannerTitle: 'Turn Food Surplus Into Sustenance.',
        exploreBannerDesc: 'Verified food providers donate wholesome meals, baked goods, and produce. Registered charities reserve surplus donations with zero waste and real-time pickup verification.',
        exploreHeading: 'Explore Surplus Food Donations',
        exploreSubtitle: 'Browse and reserve real-time food donations from verified restaurants, hotels, and bakeries.',
        searchPlaceholder: 'Search meals, providers, or locations...',
        allCategories: 'All Categories',
        allProviders: 'All Provider Types',
        sortNewest: 'Sort: Newest Listings',
        sortDeadline: 'Sort: Nearest Deadline â°',
        sortQuantity: 'Sort: Highest Quantity',
        showingAvailable: 'Showing available listings for reservation (FR3.5 default).',
        noFoodFound: 'No Available Food Donations Found',
        noFoodFoundDesc: 'Try clearing your filters or check back shortly as food providers frequently post fresh surplus batches.',
        resetFilters: 'Reset All Filters',
        viewAndReserve: 'View & Reserve',
        pickupBefore: 'Pickup Before',
        allergens: 'Allergens',
        providerPortalHeading: 'Food Provider Portal',
        providerPortalDesc: 'Manage food donations, accept charity reservations, and coordinate scheduled pickups.',
        verified: 'Verified',
        postDonation: 'Post New Food Donation',
        statTotalListed: 'Total Listed',
        statTotalListedDesc: 'Donation listings created',
        statCompleted: 'Completed',
        statCompletedDesc: 'Successfully collected',
        statActiveNow: 'Active Now',
        statActiveNowDesc: 'Available or Reserved',
        statRedistributedTitle: 'Redistributed',
        statRedistributedDesc2: 'Total surplus quantity',
        statProviderRating: 'Provider Rating',
        basedOnReviews: 'Based on reviews',
        myListings: 'My Donation Listings',
        incomingRequests: 'Incoming Requests',
        filterByStatus: 'Filter by Status:',
        allStatuses: 'All Statuses',
        statusAvailable: 'Available',
        statusReserved: 'Reserved',
        statusCompleted: 'Completed',
        statusExpired: 'Expired',
        statusUnavailable: 'Unavailable',
        thFoodDonation: 'Food Donation',
        thCategory: 'Category',
        thQuantity: 'Quantity',
        thPickupDeadline: 'Pickup Deadline',
        thStatus: 'Status',
        thActions: 'Actions',
        charityPortalHeading: 'Charity Redistribution Portal',
        charityPortalDesc: 'Track active food reservations, coordinate pickup handoffs, and confirm receipt.',
        browseMoreFood: 'Browse & Reserve More Food',
        donationsReceived: 'Donations Received',
        successfullyCollected: 'Successfully collected (FR9.2)',
        activeReservations: 'Active Reservations',
        pendingAcceptedReady: 'Pending, Accepted or Ready',
        totalQtyReceived: 'Total Quantity Received',
        foodRedistributedCommunity: 'Food redistributed to community',
        partnerReviews: 'Partner Reviews',
        reviewsSubmittedProviders: 'Reviews submitted for providers',
        myReservations: 'My Food Reservations',
        statusPendingApproval: 'Pending Approval',
        statusAcceptedScheduled: 'Accepted & Scheduled',
        statusReadyPickup: 'Ready for Pickup',
        statusCancelled: 'Cancelled',
        statusProblemReported: 'Problem Reported',
        adminSuiteHeading: 'Platform Administration Suite',
        adminSuperuser: 'Admin Superuser',
        adminSuiteDesc: 'Verify food provider and charity organizations, moderate platform content, resolve problem reports, and audit administrative events.',
        registeredUsers: 'Registered Users',
        providersLabel: 'Providers',
        charitiesLabel: 'Charities',
        pendingVerifications: 'Pending Verifications',
        awaitingAdminReview: 'Awaiting admin review (FR8.3)',
        completedDonations: 'Completed Donations',
        totalRedistributedLabel: 'Total redistributed (FR9.5)',
        reportedModerations: 'Reported Moderations',
        moderationIssuesDesc: 'Listings, reviews, and pickup issues',
        tabVerifications: 'Organization Verifications',
        tabUsers: 'User Directory & Access',
        tabModeration: 'Moderation & Complaints',
        tabAudit: 'Administrative Audit Trail (FR8.9)',
        pendingVerificationsTitle: 'Pending Organization Verification Requests',
        pendingVerificationsDesc: 'Review organizational mission, address, and credentials before approving access to protected features.',
        searchUsersPlaceholder: 'Search users by name, email, organization...',
        allAccountTypes: 'All Account Types',
        foodProviders: 'Food Providers',
        charities: 'Charities',
        statusActive: 'Active',
        statusSuspended: 'Suspended',
        thUserOrg: 'User & Organization',
        thRoleType: 'Role / Type',
        thVerification: 'Verification',
        reportedListings: 'Reported Listings (FR8.5)',
        reportedReviews: 'Reported Reviews (FR8.7)',
        pickupDisputes: 'Pickup Disputes (FR8.6)',
        auditRecordsTitle: 'Administrative Audit Records',
        auditRecordsDesc: 'Immutable log of security actions, user verifications, account suspensions, and content removals.',
        thTimestamp: 'Timestamp',
        thAdmin: 'Admin',
        thAction: 'Action',
        thTargetEntity: 'Target Entity',
        thDetails: 'Details',
        impactBadge: 'Real-Time Redistribution Statistics',
        impactHeading: 'Platform Environmental & Community Impact',
        impactDesc: 'Pursuant to FR9.5 specifications, platform-wide statistics are strictly calculated using completed donations only, excluding cancelled, rejected, and expired items.',
        impactCardQty: 'Redistributed Food Quantity',
        impactCardQtyDesc: 'Units/kg diverted directly from landfills to families in need.',
        impactCardCompleted: 'Completed Food Donations',
        impactCardCompletedDesc: 'Full end-to-end completed donation cycles.',
        impactCardNetwork: 'Active Food Network',
        impactCardNetworkDesc: 'Combined participating food providers and charities.',
        chartCategory: 'Redistribution by Food Category',
        chartMonthly: 'Monthly Redistribution Momentum',
        footerBrand: 'FoodBridge Platform',
        footerTagline: 'â€” Connecting Food Providers with Charities',
        footerArch: 'Developed by Abdallah Sharaf using ASP.NET Core & Clean Architecture (Domain, Application, Infrastructure, Web API)',
        copyright: 'Â© 2026 FoodBridge Platform â€¢ Developed by Abdallah Sharaf. All rights reserved.',
        availableSurplus: 'Available Surplus',
        storageConditions: 'Storage Conditions',
        knownAllergens: 'Known Allergens',
        pickupDeadline: 'Pickup Deadline',
        pickupLocation: 'Pickup Location',
        close: 'Close',
        requestReservation: 'Request Reservation',
        postDonationModalTitle: 'Post Food Donation',
        postDonationModalSubtitle: 'List available surplus food for registered charities to reserve.',
        labelFoodName: 'Food Name *',
        foodNamePlaceholder: 'e.g. Fresh Baked Baguettes & Rolls',
        labelCategory: 'Category *',
        catCookedMeals: 'Cooked Meals',
        catBakery: 'Bakery & Pastry',
        catProduce: 'Fresh Produce',
        catDairy: 'Dairy & Eggs',
        catPackaged: 'Packaged & Canned',
        catMeat: 'Meat & Poultry',
        catBeverages: 'Beverages',
        catOther: 'Other',
        labelQuantityUnit: 'Quantity & Unit *',
        qtyPlaceholder: 'Qty',
        unitPlaceholder: 'portions, kg, boxes',
        labelDescription: 'Description *',
        descPlaceholder: 'Describe the ingredients, condition, packaging, and recommended serving...',
        labelPrepDate: 'Preparation Date *',
        labelPickupDeadline: 'Pickup Deadline *',
        labelStorageConditions: 'Storage Conditions *',
        optRefrigerated: 'Refrigerated (0-4Â°C)',
        optRoomTemp: 'Room Temperature',
        optFrozen: 'Frozen (< -18Â°C)',
        optKeepWarm: 'Keep Warm (> 63Â°C)',
        labelKnownAllergens: 'Known Allergens *',
        allergensPlaceholder: 'e.g. Gluten, Dairy, or None',
        labelPickupAddress: 'Pickup Address & Instructions *',
        addressPlaceholder: 'Full street address and kitchen door / dock notes...',
        labelFoodPhoto: 'Food Photo (File or Web Image URL)',
        imageUrlPlaceholder: 'Or paste Unsplash / image URL',
        publishDonation: 'Publish Donation',
        cancel: 'Cancel',
        acceptModalTitle: 'Confirm & Schedule Pickup',
        acceptModalSubtitle: 'Set the agreed pickup date, time, and confirmed collection address for the charity.',
        labelConfirmedPickupDateTime: 'Confirmed Pickup Date & Time *',
        labelConfirmedLocation: 'Confirmed Pickup Location / Dock *',
        acceptLocationPlaceholder: 'e.g. 42 Nile Corniche, Kitchen back door',
        confirmAcceptance: 'Confirm Acceptance',
        reviewModalTitle: 'Submit Partner Review',
        reviewModalSubtitle: 'Rate your donation pickup partner.',
        labelRating: 'Rating (1 to 5 Stars) *',
        labelReviewComment: 'Optional Feedback / Comment',
        reviewCommentPlaceholder: 'Share how the pickup went, food condition, hygiene, timeliness...',
        postReview: 'Post Review',
        reportProblemTitle: 'Report Pickup Problem',
        reportProblemSubtitle: 'Report an issue such as unavailable food, closed provider premises, or incorrect quantity.',
        labelProblemDescription: 'Problem Description *',
        problemDescriptionPlaceholder: 'Explain the problem encountered during the pickup attempt...',
        submitReport: 'Submit Report',
        authSignInTitle: 'Sign In to FoodBridge',
        signInTab: 'Sign In',
        providerTab: 'Provider',
        charityTab: 'Charity',
        labelEmail: 'Email Address',
        labelPassword: 'Password',
        signInBtn: 'Sign In',
        labelPContactName: 'Contact Full Name *',
        labelPBusinessName: 'Business / Restaurant Name *',
        labelPProviderType: 'Provider Type *',
        provRestaurant: 'Restaurant',
        provBakery: 'Bakery',
        provHotel: 'Hotel',
        provCatering: 'Catering Company',
        labelPWorkEmail: 'Work Email *',
        labelPBusinessAddress: 'Business Address *',
        labelPasswordMin: 'Password *',
        passwordMinPlaceholder: 'Min. 8 characters',
        labelConfirmPassword: 'Confirm Password *',
        confirmPasswordPlaceholder: 'Re-enter password',
        createProviderBtn: 'Create Provider Account',
        labelCDirectorName: 'Director Full Name *',
        labelCCharityName: 'Charity Organization Name *',
        labelCCharityType: 'Charity Type *',
        charityFoodBank: 'Food Bank',
        charityShelter: 'Shelter',
        charityCommunityKitchen: 'Community Kitchen',
        charityYouthCenter: 'Youth Center',
        labelCOfficialEmail: 'Official Email *',
        labelCCommunitiesServed: 'Target Communities Served *',
        communitiesPlaceholder: 'e.g. Underprivileged families, refugees, and elderly...',
        labelCHqAddress: 'Headquarters Address *',
        createCharityBtn: 'Create Charity Account',
        acceptPickup: 'Accept & Set Pickup',
        decline: 'Decline',
        markReady: 'Mark Ready for Pickup',
        awaitingPickup: 'Awaiting Charity Collection',
        completedDouble: 'Completed & Collected',
        markUnavailable: 'Mark Unavailable',
        confirmCollected: 'Confirm Food Collected',
        reportIssue: 'Report Issue',
        withdrawRequest: 'Withdraw Request',
        leaveReview: 'Leave Partner Review',
        reviewed: 'Reviewed',
        adminUsers: 'Platform Users',
        adminVerifications: 'Pending Verifications',
        adminAudit: 'Security & Audit Logs',
        approve: 'Approve',
        reject: 'Reject',
        suspend: 'Suspend',
        reactivate: 'Reactivate',
        btnAddAdmin: '+ Add Admin',
        createAdminModalTitle: 'Add Platform Administrator',
        createAdminModalSubtitle: 'Provision a new administrator account with system oversight rights.',
        labelAdminFullName: 'Full Name *',
        labelAdminEmail: 'Official Admin Email *',
        labelAdminDepartment: 'Department / Role Title',
        labelAdminPhone: 'Phone Number',
        labelAdminPassword: 'Initial Password *',
        btnCreateAdminSubmit: 'Create Administrator',
        adminNamePlaceholder: 'e.g. Sara Ahmed',
        adminDeptPlaceholder: 'e.g. Compliance & Moderation',
        administrators: 'Administrators',
        langBtnText: 'Ø¹Ø±Ø¨ÙŠ'
    },
    ar: {
        brandName: 'FoodBridge Ø¬Ø³Ø± Ø§Ù„ØºØ°Ø§Ø¡',
        brandSubtitle: 'Ù…Ù†ØµØ© Ø¥Ø¹Ø§Ø¯Ø© ØªÙˆØ²ÙŠØ¹ ÙØ§Ø¦Ø¶ Ø§Ù„Ø·Ø¹Ø§Ù…',
        navHome: 'Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©',
        navBrowse: 'ØªØµÙØ­ Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª',
        navProvider: 'Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ù…Ø²ÙˆØ¯ÙŠÙ†',
        navCharity: 'Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª',
        navAdmin: 'Ù„ÙˆØ­Ø© Ø§Ù„Ù…Ø´Ø±Ù',
        navImpact: 'Ø§Ù„Ø£Ø«Ø± ÙˆØ§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª',
        signIn: 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„',
        register: 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨',
        signOut: 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬',
        liveNotifications: 'Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„ÙÙˆØ±ÙŠØ©',
        markAllRead: 'ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ÙƒÙ„ ÙƒÙ…Ù‚Ø±ÙˆØ¡',
        noNotifications: 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.',
        heroBadge: 'Ø±Ø¨Ø· Ø§Ù„ÙØ§Ø¦Ø¶ Ø¨Ù…Ø³ØªØ­Ù‚ÙŠÙ‡',
        heroTitle: 'Ù†Ø³Ø¯ Ø§Ù„ÙØ¬ÙˆØ© Ø¨ÙŠÙ† <span class="text-emerald-300">Ù‡Ø¯Ø± Ø§Ù„Ø·Ø¹Ø§Ù…</span> Ùˆ <span class="text-teal-300">Ø§Ù„Ø¬ÙˆØ¹</span>',
        heroDesc: 'Ù…Ù†ØµØ© FoodBridge ØªØ±Ø¨Ø· Ø§Ù„Ù…Ø·Ø§Ø¹Ù… ÙˆØ§Ù„ÙÙ†Ø§Ø¯Ù‚ ÙˆØ§Ù„Ù…Ø®Ø§Ø¨Ø² Ø¨Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ø§Ù„Ø®ÙŠØ±ÙŠØ© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© â€” Ù„Ù†Ø­ÙˆÙ„ ÙØ§Ø¦Ø¶ Ø§Ù„Ø·Ø¹Ø§Ù… Ø§Ù„ÙŠÙˆÙ…ÙŠ Ø¥Ù„Ù‰ ÙˆØ¬Ø¨Ø§Øª ØªØ³Ø¯ Ø­Ø§Ø¬Ø© Ø¢Ù„Ø§Ù Ø§Ù„Ø£Ø³Ø± Ø§Ù„Ù…Ø­ØªØ§Ø¬Ø©.',
        joinFree: 'Ø§Ù†Ø¶Ù… Ù„Ù€ FoodBridge Ù…Ø¬Ø§Ù†Ø§Ù‹',
        statRedistributed: 'ÙƒØ¬Ù… Ø·Ø¹Ø§Ù… ØªÙ… ØªÙˆØ²ÙŠØ¹Ù‡',
        statRedistributedDesc: 'Ù…Ù† Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø©',
        statCompleted: 'ØªØ¨Ø±Ø¹ Ù…ÙƒØªÙ…Ù„ Ø¨Ù†Ø¬Ø§Ø­',
        statCompletedSub: 'ØªÙ… ØªØ³Ù„ÙŠÙ…Ù‡Ø§ ÙˆØªÙˆØ«ÙŠÙ‚Ù‡Ø§',
        statProviders: 'Ù…Ø²ÙˆØ¯ Ø·Ø¹Ø§Ù… Ù…Ø¹ØªÙ…Ø¯',
        statProvidersSub: 'Ù…Ø·Ø§Ø¹Ù…ØŒ Ù…Ø®Ø§Ø¨Ø²ØŒ ÙˆÙÙ†Ø§Ø¯Ù‚',
        statCharities: 'Ø´Ø±ÙŠÙƒ Ù…Ù† Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª',
        statCharitiesSub: 'Ù…ÙˆØ«Ù‚Ø© ÙˆÙ†Ø´Ø·Ø© Ø¨Ø§Ù„Ù…Ù†ØµØ©',
        howItWorksTitle: 'ÙƒÙŠÙ ØªØ¹Ù…Ù„ Ù…Ù†ØµØ© FoodBridgeØŸ',
        howItWorksSubtitle: 'Ù…Ù†Ø¸ÙˆÙ…Ø© Ø³Ø±ÙŠØ¹Ø© ÙˆØ¢Ù…Ù†Ø© ÙˆÙÙˆØ±ÙŠØ© Ù„Ø¥Ø¹Ø§Ø¯Ø© ØªÙˆØ²ÙŠØ¹ ÙØ§Ø¦Ø¶ Ø§Ù„Ø·Ø¹Ø§Ù… â€” Ù…Ù† Ø§Ù„Ù†Ø´Ø± Ø­ØªÙ‰ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… ÙÙŠ Ø¯Ù‚Ø§Ø¦Ù‚.',
        step1Title: '1. Ù†Ø´Ø± Ø§Ù„ÙØ§Ø¦Ø¶ Ù…Ù† Ø§Ù„Ù…Ø²ÙˆØ¯',
        step1Desc: 'ØªÙ‚ÙˆÙ… Ø§Ù„Ù…Ø·Ø§Ø¹Ù… ÙˆØ§Ù„ÙÙ†Ø§Ø¯Ù‚ ÙˆØ§Ù„Ù…Ø®Ø§Ø¨Ø² Ø¨Ø¥Ø¶Ø§ÙØ© Ø§Ù„ÙØ§Ø¦Ø¶ Ù…Ø¹ ØªÙØ§ØµÙŠÙ„ Ø§Ù„ÙƒÙ…ÙŠØ©ØŒ Ø§Ù„Ù…ÙˆØ¹Ø¯ØŒ Ø´Ø±ÙˆØ· Ø§Ù„Ø­ÙØ¸ØŒ ÙˆØ§Ù„Ø­Ø³Ø§Ø³ÙŠØ© Ù…Ø¹ Ø§Ù„ØµÙˆØ±.',
        step2Title: '2. Ø·Ù„Ø¨ Ø§Ù„Ø­Ø¬Ø² Ù…Ù† Ø§Ù„Ø¬Ù…Ø¹ÙŠØ©',
        step2Desc: 'ØªØªØµÙØ­ Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ø§Ù„Ø¹Ø±ÙˆØ¶ ÙˆØªØ­Ø¬Ø²Ù‡Ø§ ÙÙˆØ±Ø§Ù‹ Ù…Ø¹ Ù…Ù†Ø¹ ØªÙƒØ±Ø§Ø± Ø§Ù„Ø­Ø¬Ø² Ù„Ù†ÙØ³ Ø§Ù„ÙˆØ¬Ø¨Ø© Ø¨Ø¯Ù‚Ø© Ø¹Ø§Ù„ÙŠØ©.',
        step3Title: '3. Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… ÙˆØ§Ù„ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ù…ØªØ¨Ø§Ø¯Ù„',
        step3Desc: 'ÙŠØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø·Ø¹Ø§Ù… ÙˆØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø·Ù„Ø¨ ÙˆØªÙˆØ«ÙŠÙ‚ Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª ÙˆØ§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª ÙÙˆØ±ÙŠØ§Ù‹ Ø¹Ø¨Ø± SignalR.',
        whoUsesHeading: 'Ù…Ù† ÙŠØ³ØªØ®Ø¯Ù… Ù…Ù†ØµØ© FoodBridgeØŸ',
        whoUsesSubtitle: 'Ù†ÙˆØ¹Ø§Ù† Ù…Ù† Ø§Ù„Ø´Ø±ÙƒØ§Ø¡ â€” ØªØ¬Ù…Ø¹Ù‡Ù… Ø±Ø³Ø§Ù„Ø© ÙˆØ§Ø­Ø¯Ø© Ù„Ù…ÙƒØ§ÙØ­Ø© Ø§Ù„Ù‡Ø¯Ø± ÙˆØ¥Ø·Ø¹Ø§Ù… Ø§Ù„Ù…Ø­ØªØ§Ø¬ÙŠÙ†.',
        providerCardTitle: 'Ù…Ø²ÙˆØ¯Ùˆ Ø§Ù„Ø·Ø¹Ø§Ù…',
        providerCardDesc: 'Ø§Ù„Ù…Ø·Ø§Ø¹Ù… ÙˆØ§Ù„ÙÙ†Ø§Ø¯Ù‚ ÙˆØ§Ù„Ù…Ø®Ø§Ø¨Ø² ÙˆØ´Ø±ÙƒØ§Øª Ø§Ù„ØªØºØ°ÙŠØ© ÙˆØ§Ù„Ø¶ÙŠØ§ÙØ© Ø§Ù„ØªÙŠ Ù„Ø¯ÙŠÙ‡Ø§ ÙØ§Ø¦Ø¶ Ø·Ø¹Ø§Ù… ØµØ§Ù„Ø­ Ù„Ù„Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ.',
        pFeature1: 'Ù†Ø´Ø± Ø¹Ø±ÙˆØ¶ Ø§Ù„Ø·Ø¹Ø§Ù… Ù…Ø¹ Ø§Ù„ØµÙˆØ± ÙˆØ§Ù„Ù…ÙƒÙˆÙ†Ø§Øª ÙˆÙ…Ø³Ø¨Ø¨Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø³ÙŠØ©',
        pFeature2: 'Ù‚Ø¨ÙˆÙ„ Ø£Ùˆ Ø±ÙØ¶ Ø·Ù„Ø¨Ø§Øª Ø­Ø¬Ø² Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ø¨Ù…Ø±ÙˆÙ†Ø© ØªØ§Ù…Ø©',
        pFeature3: 'ØªØ£ÙƒÙŠØ¯ Ù…ÙˆÙ‚Ø¹ ÙˆÙ…ÙˆØ¹Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ Ù„ÙØ±Ù‚ Ø§Ù„Ø¬Ù…Ø¹ÙŠØ©',
        pFeature4: 'Ù…ØªØ§Ø¨Ø¹Ø© Ø³Ø¬Ù„ Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª ÙˆØ¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø£Ø«Ø± Ø§Ù„Ø¨ÙŠØ¦ÙŠ ÙˆØ§Ù„Ù…Ø¬ØªÙ…Ø¹ÙŠ',
        registerAsProvider: 'Ø³Ø¬Ù„ ÙƒÙ…Ø²ÙˆØ¯ Ø·Ø¹Ø§Ù…',
        charityCardTitle: 'Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª ÙˆØ§Ù„Ù…Ø¤Ø³Ø³Ø§Øª Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
        charityCardDesc: 'Ø¨Ù†ÙˆÙƒ Ø§Ù„Ø·Ø¹Ø§Ù… ÙˆØ¯ÙˆØ± Ø§Ù„Ø±Ø¹Ø§ÙŠØ© ÙˆØ§Ù„Ù…Ø·Ø§Ø¨Ø® Ø§Ù„Ù…Ø¬ØªÙ…Ø¹ÙŠØ© ÙˆÙ…Ù†Ø¸Ù…Ø§Øª Ø§Ù„Ø¥ØºØ§Ø«Ø© Ø§Ù„ØªÙŠ ØªØ±Ø¹Ù‰ Ø§Ù„Ø£Ø³Ø± Ø§Ù„Ù…Ø³ØªØ­Ù‚Ø©.',
        cFeature1: 'ØªØµÙØ­ ØªØ¨Ø±Ø¹Ø§Øª Ø§Ù„Ø·Ø¹Ø§Ù… Ø­Ø³Ø¨ Ø§Ù„ØªØµÙ†ÙŠÙ ÙˆØ§Ù„ØªØ§Ø±ÙŠØ® ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹',
        cFeature2: 'Ø­Ø¬Ø² Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª ÙÙˆØ±ÙŠØ§Ù‹ Ø¨Ø¶ØºØ·Ø© Ø²Ø± ÙˆØ§Ø­Ø¯Ø© ÙˆÙ…Ù†Ø¹ Ø§Ù„ØªÙƒØ±Ø§Ø±',
        cFeature3: 'Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª ÙˆØªØ­Ø¯ÙŠØ«Ø§Øª ÙÙˆØ±ÙŠØ© Ø¨Ø§Ù„Ù„Ø­Ø¸Ø© Ø¹Ø¨Ø± SignalR',
        cFeature4: 'ØªÙˆØ«ÙŠÙ‚ Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„ÙˆØ¬Ø¨Ø§Øª ÙˆØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ù…Ø²ÙˆØ¯ÙŠÙ† Ø¨Ø´ÙØ§ÙÙŠØ©',
        registerAsCharity: 'Ø³Ø¬Ù„ ÙƒØ¬Ù…Ø¹ÙŠØ© Ø®ÙŠØ±ÙŠØ©',
        platformFeaturesHeading: 'Ù…Ù…ÙŠØ²Ø§Øª Ø§Ù„Ù…Ù†ØµØ© Ø§Ù„ØªÙ‚Ù†ÙŠØ©',
        platformFeaturesSubtitle: 'Ù…Ø¨Ù†ÙŠØ© Ø¨Ø£Ø­Ø¯Ø« ØªÙ‚Ù†ÙŠØ§Øª Ø§Ù„ÙˆÙŠØ¨ Ø§Ù„Ù…Ø¤Ø³Ø³ÙŠØ© Ù„Ø¶Ù…Ø§Ù† Ø§Ù„Ø£Ù…Ø§Ù† ÙˆØ§Ù„Ù…ÙˆØ«ÙˆÙ‚ÙŠØ© ÙˆØ§Ù„Ø³Ø±Ø¹Ø© Ø§Ù„Ù„Ø­Ø¸ÙŠØ©.',
        feat1Title: 'Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø­ÙŠØ© ÙˆÙÙˆØ±ÙŠØ©',
        feat1Desc: 'ØªÙ†Ø¨ÙŠÙ‡Ø§Øª ÙÙˆØ±ÙŠØ© Ø¨ØªÙ‚Ù†ÙŠØ© SignalR Ù„ØªØ­Ø¯ÙŠØ«Ø§Øª Ø§Ù„Ø­Ø¬Ø² ÙˆØ§Ù„Ù‚Ø¨ÙˆÙ„ ÙˆØ¬Ø§Ù‡Ø²ÙŠØ© Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… ÙˆØ§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª.',
        feat2Title: 'Ø£Ù…Ø§Ù† JWT ÙˆØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø£Ø¯ÙˆØ§Ø±',
        feat2Desc: 'Ø­Ù…Ø§ÙŠØ© ÙƒØ§Ù…Ù„Ø© Ø¨Ø§Ù„ØªÙˆÙƒÙ†Ø§Øª Ù…Ø¹ Ø¥Ø¯Ø§Ø±Ø© Ù…Ø´Ø¯Ø¯Ø© Ù„Ø£Ø¯ÙˆØ§Ø± Ø§Ù„Ù…Ø´Ø±ÙÙŠÙ† ÙˆØ§Ù„Ù…Ø²ÙˆØ¯ÙŠÙ† ÙˆØ§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ø§Ù„Ø®ÙŠØ±ÙŠØ©.',
        feat3Title: 'ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ø¨Ø±ÙŠØ¯ ÙˆØ§Ù„Ù…Ø¤Ø³Ø³Ø§Øª',
        feat3Desc: 'Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¨Ø±ÙŠØ¯ ÙˆÙ…Ø±Ø§Ø¬Ø¹Ø© Ù‡ÙˆÙŠØ© Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª ÙˆØ§Ù„Ù…Ø²ÙˆØ¯ÙŠÙ† Ù‚Ø¨Ù„ Ù…Ù†Ø­ ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ø­Ø¬Ø² ÙˆØ§Ù„Ù†Ø´Ø±.',
        feat4Title: 'Ù…Ù†Ø¹ ØªØ¹Ø§Ø±Ø¶ Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª',
        feat4Desc: 'Ø­Ù…Ø§ÙŠØ© Ù‚ÙÙ„ Ù…ØªÙØ§Ø¦Ù„ (RowVersion) ØªÙ…Ù†Ø¹ Ø­Ø¬Ø² Ù†ÙØ³ Ø§Ù„ØªØ¨Ø±Ø¹ Ù…Ù† Ø£ÙƒØ«Ø± Ù…Ù† Ø¬Ù…Ø¹ÙŠØ© ÙÙŠ Ù†ÙØ³ Ø§Ù„Ø«Ø§Ù†ÙŠØ©.',
        feat5Title: 'Ø³Ø¬Ù„ ØªØ¯Ù‚ÙŠÙ‚ Ø¥Ø¯Ø§Ø±ÙŠ Ø´Ø§Ù…Ù„',
        feat5Desc: 'ØªÙˆØ«ÙŠÙ‚ ØºÙŠØ± Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªØ¹Ø¯ÙŠÙ„ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØ§Ù„ØªÙˆØ«ÙŠÙ‚Ø§Øª ÙˆØ¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ø¥Ø´Ø±Ø§Ù.',
        feat6Title: 'Ø®Ø¯Ù…Ø© Ø¢Ù„ÙŠØ© Ù„Ø¥Ù†Ù‡Ø§Ø¡ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ©',
        feat6Desc: 'Ø®Ø¯Ù…Ø© Ø®Ù„ÙÙŠØ© Ø¨Ø±Ù…Ø¬ÙŠØ© ØªÙ„Ù‚Ø§Ø¦ÙŠØ© ØªÙØ­Øµ Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ ÙˆØªØ­Ø¯Ø« Ø§Ù„Ø¹Ø±ÙˆØ¶ Ø§Ù„Ù…Ù†ØªÙ‡ÙŠØ© ÙÙˆØ± Ø§Ù†Ù‚Ø¶Ø§Ø¡ Ù…ÙˆØ¹Ø¯ Ø§Ø³ØªÙ„Ø§Ù…Ù‡Ø§.',
        ctaHeading: 'Ù‡Ù„ Ø£Ù†Øª Ø¬Ø§Ù‡Ø² Ù„ØµÙ†Ø¹ Ø£Ø«Ø± Ø­Ù‚ÙŠÙ‚ÙŠØŸ',
        ctaSubtitle: 'Ø§Ù†Ø¶Ù… Ø¥Ù„Ù‰ Ù…Ù†ØµØ© FoodBridge Ø§Ù„ÙŠÙˆÙ… â€” Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ù…Ø¬Ø§Ù†ÙŠ ÙˆØ³Ø±ÙŠØ¹ ÙˆÙ…ÙˆØ«Ù‚ Ø¨Ø§Ù„ÙƒØ§Ù…Ù„.',
        createFreeAccount: 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÙŠØ¯ Ù…Ø¬Ø§Ù†Ø§Ù‹',
        alreadyHaveAccount: 'Ù‡Ù„ Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù„ÙØ¹Ù„ØŸ',
        signInHere: 'Ø³Ø¬Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ù† Ù‡Ù†Ø§',
        directFrom: 'Ù…Ø¨Ø§Ø´Ø±Ø© Ù…Ù† Ø§Ù„Ù…Ø·Ø§Ø¹Ù… ÙˆØ§Ù„Ù…Ø®Ø§Ø¨Ø² ÙˆØ§Ù„ÙÙ†Ø§Ø¯Ù‚ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©',
        exploreBannerTitle: 'Ø­ÙˆÙ„ ÙØ§Ø¦Ø¶ Ø§Ù„Ø·Ø¹Ø§Ù… Ø¥Ù„Ù‰ Ø¹Ø·Ø§Ø¡ ÙˆØ­ÙŠØ§Ø©.',
        exploreBannerDesc: 'Ù…Ø·Ø§Ø¹Ù… ÙˆÙÙ†Ø§Ø¯Ù‚ Ù…ÙˆØ«ÙˆÙ‚Ø© ØªÙ‚Ø¯Ù… ÙˆØ¬Ø¨Ø§Øª Ø·Ø§Ø²Ø¬Ø© ÙˆÙ…Ø®Ø¨ÙˆØ²Ø§Øª ÙŠÙˆÙ…ÙŠØ©. ØªØªØ³Ù„Ù…Ù‡Ø§ Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ø¨Ø¯ÙˆÙ† Ù‡Ø¯Ø± ÙˆÙ…Ø¹ ØªÙˆØ«ÙŠÙ‚ ÙÙˆØ±ÙŠ Ù„Ù„Ø§Ø³ØªÙ„Ø§Ù….',
        exploreHeading: 'Ø§Ø³ØªÙƒØ´Ø§Ù Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø©',
        exploreSubtitle: 'ØªØµÙØ­ ÙˆØ§Ø­Ø¬Ø² ØªØ¨Ø±Ø¹Ø§Øª Ø§Ù„Ø·Ø¹Ø§Ù… Ø§Ù„Ø­ÙŠØ© Ù…Ù† Ø§Ù„Ù…Ø·Ø§Ø¹Ù… ÙˆØ§Ù„ÙÙ†Ø§Ø¯Ù‚ ÙˆØ§Ù„Ù…Ø®Ø§Ø¨Ø² Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©.',
        searchPlaceholder: 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„ÙˆØ¬Ø¨Ø§ØªØŒ Ø§Ù„Ù…Ø²ÙˆØ¯ÙŠÙ†ØŒ Ø£Ùˆ Ø§Ù„Ø¹Ù†Ø§ÙˆÙŠÙ†...',
        allCategories: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª',
        allProviders: 'Ø¬Ù…ÙŠØ¹ Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ù…Ø²ÙˆØ¯ÙŠÙ†',
        sortNewest: 'Ø§Ù„ØªØ±ØªÙŠØ¨: Ø§Ù„Ø£Ø­Ø¯Ø« Ø£ÙˆÙ„Ø§Ù‹',
        sortDeadline: 'Ø§Ù„ØªØ±ØªÙŠØ¨: Ø§Ù„Ø£Ù‚Ø±Ø¨ Ø§Ù†ØªÙ‡Ø§Ø¡Ù‹ â°',
        sortQuantity: 'Ø§Ù„ØªØ±ØªÙŠØ¨: Ø§Ù„ÙƒÙ…ÙŠØ© Ø§Ù„Ø£ÙƒØ¨Ø±',
        showingAvailable: 'Ø¹Ø±Ø¶ Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© Ù„Ù„Ø­Ø¬Ø² Ø­Ø§Ù„ÙŠØ§Ù‹ (Ø§Ù„Ù…Ø¹ÙŠØ§Ø± Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ).',
        noFoodFound: 'Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ ØªØ¨Ø±Ø¹Ø§Øª Ø·Ø¹Ø§Ù… Ù…Ø·Ø§Ø¨Ù‚Ø©',
        noFoodFoundDesc: 'ÙŠØ±Ø¬Ù‰ ØªØ¬Ø±Ø¨Ø© Ø¥Ø¹Ø§Ø¯Ø© Ø¶Ø¨Ø· Ø¹ÙˆØ§Ù…Ù„ Ø§Ù„ØªØµÙÙŠØ© Ø£Ùˆ ØªÙÙ‚Ø¯ Ø§Ù„ØµÙØ­Ø© Ù„Ø§Ø­Ù‚Ø§Ù‹ Ø­ÙŠØ« ÙŠØ¶ÙŠÙ Ø§Ù„Ù…Ø²ÙˆØ¯ÙˆÙ† Ø¯ÙØ¹Ø§Øª Ø·Ø§Ø²Ø¬Ø© Ø¨Ø§Ø³ØªÙ…Ø±Ø§Ø±.',
        resetFilters: 'Ø¥Ø¹Ø§Ø¯Ø© Ø¶Ø¨Ø· Ø¹ÙˆØ§Ù…Ù„ Ø§Ù„ØªØµÙÙŠØ©',
        viewAndReserve: 'Ø¹Ø±Ø¶ ÙˆØ­Ø¬Ø²',
        pickupBefore: 'Ù…ÙˆØ¹Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Ù‚Ø¨Ù„',
        allergens: 'Ù…Ø³Ø¨Ø¨Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø³ÙŠØ©',
        providerPortalHeading: 'Ø¨ÙˆØ§Ø¨Ø© Ù…Ø²ÙˆØ¯ÙŠ Ø§Ù„Ø·Ø¹Ø§Ù…',
        providerPortalDesc: 'Ø¥Ø¯Ø§Ø±Ø© ØªØ¨Ø±Ø¹Ø§Øª Ø§Ù„Ø·Ø¹Ø§Ù…ØŒ Ù‚Ø¨ÙˆÙ„ Ø·Ù„Ø¨Ø§Øª Ø­Ø¬Ø² Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§ØªØŒ ÙˆØªÙ†Ø³ÙŠÙ‚ Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©.',
        verified: 'Ù…ÙˆØ«Ù‚ ÙˆÙ…Ø¹ØªÙ…Ø¯',
        postDonation: 'Ø¥Ø¶Ø§ÙØ© ØªØ¨Ø±Ø¹ Ø·Ø¹Ø§Ù… Ø¬Ø¯ÙŠØ¯',
        statTotalListed: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª',
        statTotalListedDesc: 'Ø¹Ø±ÙˆØ¶ Ø§Ù„ØªØ¨Ø±Ø¹ Ø§Ù„Ù…Ø¶Ø§ÙØ©',
        statCompleted: 'Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø©',
        statCompletedDesc: 'ØªÙ… Ø§Ø³ØªÙ„Ø§Ù…Ù‡Ø§ Ø¨Ù†Ø¬Ø§Ø­',
        statActiveNow: 'Ø§Ù„Ù†Ø´Ø·Ø© Ø­Ø§Ù„ÙŠØ§Ù‹',
        statActiveNowDesc: 'Ù…ØªØ§Ø­Ø© Ø£Ùˆ Ù‚ÙŠØ¯ Ø§Ù„Ø­Ø¬Ø²',
        statRedistributedTitle: 'Ø§Ù„Ù…Ø¹Ø§Ø¯ ØªÙˆØ²ÙŠØ¹Ù‡',
        statRedistributedDesc2: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ÙƒÙ…ÙŠØ§Øª Ø§Ù„Ù…Ø³Ù„Ù…Ø©',
        statProviderRating: 'ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ù…Ø²ÙˆØ¯',
        basedOnReviews: 'Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ø§Ù„Ø´Ø±ÙƒØ§Ø¡',
        myListings: 'ØªØ¨Ø±Ø¹Ø§ØªÙŠ Ø§Ù„Ù…Ø¹Ù„Ù†Ø©',
        incomingRequests: 'Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø­Ø¬Ø² Ø§Ù„ÙˆØ§Ø±Ø¯Ø©',
        filterByStatus: 'ØªØµÙÙŠØ© Ø­Ø³Ø¨ Ø§Ù„Ø­Ø§Ù„Ø©:',
        allStatuses: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª',
        statusAvailable: 'Ù…ØªØ§Ø­ Ù„Ù„Ø­Ø¬Ø²',
        statusReserved: 'Ù…Ø­Ø¬ÙˆØ²',
        statusCompleted: 'Ù…ÙƒØªÙ…Ù„ Ø¨Ù†Ø¬Ø§Ø­',
        statusExpired: 'Ù…Ù†ØªÙ‡ÙŠ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ©',
        statusUnavailable: 'ØºÙŠØ± Ù…ØªØ§Ø­',
        thFoodDonation: 'ØªØ¨Ø±Ø¹ Ø§Ù„Ø·Ø¹Ø§Ù…',
        thCategory: 'Ø§Ù„ØªØµÙ†ÙŠÙ',
        thQuantity: 'Ø§Ù„ÙƒÙ…ÙŠØ©',
        thPickupDeadline: 'Ø¢Ø®Ø± Ù…ÙˆØ¹Ø¯ Ù„Ù„Ø§Ø³ØªÙ„Ø§Ù…',
        thStatus: 'Ø§Ù„Ø­Ø§Ù„Ø©',
        thActions: 'Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª',
        charityPortalHeading: 'Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª ÙˆØ§Ù„Ù…Ø¤Ø³Ø³Ø§Øª Ø§Ù„Ø®ÙŠØ±ÙŠØ©',
        charityPortalDesc: 'Ù…ØªØ§Ø¨Ø¹Ø© Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„Ø£Ø·Ø¹Ù…Ø© Ø§Ù„Ù†Ø´Ø·Ø©ØŒ ØªÙ†Ø³ÙŠÙ‚ Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø´Ø­Ù†Ø§ØªØŒ ÙˆØªØ£ÙƒÙŠØ¯ ÙˆØµÙˆÙ„ Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª Ù„Ù„Ù…Ø³ØªØ­Ù‚ÙŠÙ†.',
        browseMoreFood: 'ØªØµÙØ­ ÙˆØ­Ø¬Ø² Ø§Ù„Ù…Ø²ÙŠØ¯ Ù…Ù† Ø§Ù„Ø·Ø¹Ø§Ù…',
        donationsReceived: 'Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª Ø§Ù„Ù…Ø³ØªÙ„Ù…Ø©',
        successfullyCollected: 'ØªÙ… Ø§Ø³ØªÙ„Ø§Ù…Ù‡Ø§ Ø¨Ù†Ø¬Ø§Ø­',
        activeReservations: 'Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„Ù†Ø´Ø·Ø©',
        pendingAcceptedReady: 'Ù…Ø¹Ù„Ù‚Ø©ØŒ Ù…Ù‚Ø¨ÙˆÙ„Ø© Ø£Ùˆ Ø¬Ø§Ù‡Ø²Ø©',
        totalQtyReceived: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ÙƒÙ…ÙŠØ© Ø§Ù„Ù…Ø³ØªÙ„Ù…Ø©',
        foodRedistributedCommunity: 'ÙˆØ¬Ø¨Ø§Øª ØªÙ… Ø¥ÙŠØµØ§Ù„Ù‡Ø§ Ù„Ù„Ø£Ø³Ø±',
        partnerReviews: 'ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ø§Ù„Ø´Ø±ÙƒØ§Ø¡',
        reviewsSubmittedProviders: 'Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ø§Ù„Ù…Ù‚Ø¯Ù…Ø© Ù„Ù„Ù…Ø²ÙˆØ¯ÙŠÙ†',
        myReservations: 'Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„Ø£Ø·Ø¹Ù…Ø© Ø§Ù„Ø®Ø§ØµØ© Ø¨ÙŠ',
        statusPendingApproval: 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ù…ÙˆØ§ÙÙ‚Ø© Ø§Ù„Ù…Ø²ÙˆØ¯',
        statusAcceptedScheduled: 'Ù…Ù‚Ø¨ÙˆÙ„ ÙˆÙ…Ø­Ø¯Ø¯ Ù…ÙˆØ¹Ø¯Ù‡',
        statusReadyPickup: 'Ø¬Ø§Ù‡Ø² Ù„Ù„Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø¢Ù†',
        statusCancelled: 'Ù…Ù„ØºÙŠ',
        statusProblemReported: 'ØªÙ… Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù…Ø´ÙƒÙ„Ø©',
        adminSuiteHeading: 'Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø´Ø±Ø§Ù Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠ Ù„Ù„Ù…Ù†ØµØ©',
        adminSuperuser: 'Ù…Ø´Ø±Ù Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹Ø§Ù…',
        adminSuiteDesc: 'ØªÙˆØ«ÙŠÙ‚ Ù…Ø¤Ø³Ø³Ø§Øª Ø§Ù„Ù…Ø²ÙˆØ¯ÙŠÙ† ÙˆØ§Ù„Ø¬Ù…Ø¹ÙŠØ§ØªØŒ Ø¥Ø¯Ø§Ø±Ø© ÙˆÙ…Ø±Ø§Ù‚Ø¨Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰ØŒ Ø­Ù„ Ø¨Ù„Ø§ØºØ§Øª Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…ØŒ ÙˆØªØ¯Ù‚ÙŠÙ‚ Ø³Ø¬Ù„Ø§Øª Ø§Ù„Ø£Ù…Ø§Ù†.',
        registeredUsers: 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ† Ø§Ù„Ù…Ø³Ø¬Ù„ÙˆÙ†',
        providersLabel: 'Ù…Ø²ÙˆØ¯',
        charitiesLabel: 'Ø¬Ù…Ø¹ÙŠØ©',
        pendingVerifications: 'Ø·Ù„Ø¨Ø§Øª Ø§Ù„ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ù…Ø¹Ù„Ù‚Ø©',
        awaitingAdminReview: 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©',
        completedDonations: 'Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø©',
        totalRedistributedLabel: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ÙƒÙ…ÙŠØ§Øª Ø§Ù„Ù…ÙˆØ²Ø¹Ø©',
        reportedModerations: 'Ø¨Ù„Ø§ØºØ§Øª Ø§Ù„Ø¥Ø´Ø±Ø§Ù',
        moderationIssuesDesc: 'Ø¹Ø±ÙˆØ¶ØŒ ØªÙ‚ÙŠÙŠÙ…Ø§ØªØŒ ÙˆÙ†Ø²Ø§Ø¹Ø§Øª Ø§Ø³ØªÙ„Ø§Ù…',
        tabVerifications: 'ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ù…Ø¤Ø³Ø³Ø§Øª ÙˆØ§Ù„Ø´Ø±ÙƒØ§Ø¡',
        tabUsers: 'Ø¯Ù„ÙŠÙ„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª',
        tabModeration: 'Ø§Ù„Ø¥Ø´Ø±Ø§Ù ÙˆØ§Ù„Ø´ÙƒØ§ÙˆÙ‰ ÙˆØ§Ù„Ù†Ø²Ø§Ø¹Ø§Øª',
        tabAudit: 'Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ ÙˆØ§Ù„Ø£Ù…Ø§Ù† Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠ',
        pendingVerificationsTitle: 'Ø·Ù„Ø¨Ø§Øª ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ù…Ø¤Ø³Ø³Ø§Øª Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯',
        pendingVerificationsDesc: 'Ù…Ø±Ø§Ø¬Ø¹Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¤Ø³Ø³Ø©ØŒ Ø§Ù„Ø¹Ù†ÙˆØ§Ù†ØŒ ÙˆØ±Ø³Ø§Ù„ØªÙ‡Ø§ Ø§Ù„Ø®ÙŠØ±ÙŠØ© Ù‚Ø¨Ù„ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø­Ø³Ø§Ø¨ ÙˆØªÙØ¹ÙŠÙ„ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª.',
        searchUsersPlaceholder: 'Ø§Ø¨Ø­Ø« Ø¨Ø§Ù„Ø§Ø³Ù…ØŒ Ø§Ù„Ø¨Ø±ÙŠØ¯ØŒ Ø£Ùˆ Ø§Ø³Ù… Ø§Ù„Ù…Ø¤Ø³Ø³Ø©...',
        allAccountTypes: 'Ø¬Ù…ÙŠØ¹ Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª',
        foodProviders: 'Ù…Ø²ÙˆØ¯Ùˆ Ø§Ù„Ø·Ø¹Ø§Ù…',
        charities: 'Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ø§Ù„Ø®ÙŠØ±ÙŠØ©',
        statusActive: 'Ù†Ø´Ø·',
        statusSuspended: 'Ù…Ø¬Ù…Ù‘Ø¯',
        thUserOrg: 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙˆØ§Ù„Ù…Ø¤Ø³Ø³Ø©',
        thRoleType: 'Ø§Ù„Ø¯ÙˆØ± / Ø§Ù„Ù†ÙˆØ¹',
        thVerification: 'Ø­Ø§Ù„Ø© Ø§Ù„ØªÙˆØ«ÙŠÙ‚',
        reportedListings: 'Ø¹Ø±ÙˆØ¶ Ø·Ø¹Ø§Ù… Ù…Ø¨Ù„Ù‘Øº Ø¹Ù†Ù‡Ø§',
        reportedReviews: 'ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ù…Ø¨Ù„Ù‘Øº Ø¹Ù†Ù‡Ø§',
        pickupDisputes: 'Ù†Ø²Ø§Ø¹Ø§Øª Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø´Ø­Ù†Ø§Øª',
        auditRecordsTitle: 'Ø³Ø¬Ù„Ø§Øª Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠ ÙˆØ§Ù„Ø£Ù…Ù†ÙŠ',
        auditRecordsDesc: 'Ø³Ø¬Ù„ ØªØ¯Ù‚ÙŠÙ‚ Ø±Ù‚Ù…ÙŠ ØºÙŠØ± Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªØ¹Ø¯ÙŠÙ„ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØªØ¬Ù…ÙŠØ¯ Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª ÙˆØ­Ø°Ù Ø§Ù„Ù…Ø®Ø§Ù„ÙØ§Øª.',
        thTimestamp: 'Ø§Ù„ØªÙˆÙ‚ÙŠØª',
        thAdmin: 'Ø§Ù„Ù…Ø´Ø±Ù',
        thAction: 'Ù†ÙˆØ¹ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡',
        thTargetEntity: 'Ø§Ù„ÙƒÙŠØ§Ù† Ø§Ù„Ù…Ø³ØªÙ‡Ø¯Ù',
        thDetails: 'Ø§Ù„ØªÙØ§ØµÙŠÙ„',
        impactBadge: 'Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªÙˆØ²ÙŠØ¹ Ø§Ù„Ù„Ø­Ø¸ÙŠØ©',
        impactHeading: 'Ø§Ù„Ø£Ø«Ø± Ø§Ù„Ø¨ÙŠØ¦ÙŠ ÙˆØ§Ù„Ù…Ø¬ØªÙ…Ø¹ÙŠ Ù„Ù…Ù†ØµØ© FoodBridge',
        impactDesc: 'ØªØ·Ø¨ÙŠÙ‚Ø§Ù‹ Ù„Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø´ÙØ§ÙÙŠØ©ØŒ ÙŠØªÙ… Ø§Ø­ØªØ³Ø§Ø¨ ÙƒØ§ÙØ© Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø¨Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø¹Ù„Ù‰ Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø© Ø¨Ù†Ø¬Ø§Ø­ ÙÙ‚Ø·ØŒ Ù…Ø¹ Ø§Ø³ØªØ¨Ø¹Ø§Ø¯ Ø§Ù„Ù…Ù„ØºØ§Ø© ÙˆØ§Ù„Ù…Ø±ÙÙˆØ¶Ø© ÙˆØ§Ù„Ù…Ù†ØªÙ‡ÙŠØ©.',
        impactCardQty: 'ÙƒÙ…ÙŠØ© Ø§Ù„Ø·Ø¹Ø§Ù… Ø§Ù„Ù…Ø¹Ø§Ø¯ ØªÙˆØ²ÙŠØ¹Ù‡',
        impactCardQtyDesc: 'ÙˆØ­Ø¯Ø©/ÙƒØ¬Ù… ØªÙ… Ø¥Ù†Ù‚Ø§Ø°Ù‡Ø§ Ù…Ù† Ø§Ù„Ù‡Ø¯Ø± ÙˆØªÙˆØ¬ÙŠÙ‡Ù‡Ø§ Ù…Ø¨Ø§Ø´Ø±Ø© Ù„Ù„Ø£Ø³Ø± Ø§Ù„Ù…Ø­ØªØ§Ø¬Ø©.',
        impactCardCompleted: 'ØªØ¨Ø±Ø¹Ø§Øª Ø·Ø¹Ø§Ù… Ù…ÙƒØªÙ…Ù„Ø©',
        impactCardCompletedDesc: 'Ø¯ÙˆØ±Ø§Øª ØªØ¨Ø±Ø¹ ÙˆØªØ³Ù„ÙŠÙ… ØªÙ…Øª Ø¨Ù†Ø¬Ø§Ø­ Ù…Ù† Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ù„Ù„Ù†Ù‡Ø§ÙŠØ©.',
        impactCardNetwork: 'Ø´Ø¨ÙƒØ© Ø§Ù„Ø´Ø±ÙƒØ§Ø¡ Ø§Ù„Ù†Ø´Ø·Ø©',
        impactCardNetworkDesc: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø·Ø§Ø¹Ù… ÙˆØ§Ù„ÙÙ†Ø§Ø¯Ù‚ ÙˆØ§Ù„Ù…Ø®Ø§Ø¨Ø² ÙˆØ§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ©.',
        chartCategory: 'ØªÙˆØ²ÙŠØ¹ Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª Ø­Ø³Ø¨ ÙØ¦Ø© Ø§Ù„Ø·Ø¹Ø§Ù…',
        chartMonthly: 'Ø²Ø®Ù… ÙˆÙ†Ù…Ùˆ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªÙˆØ²ÙŠØ¹ Ø§Ù„Ø´Ù‡Ø±ÙŠ',
        footerBrand: 'Ù…Ù†ØµØ© FoodBridge',
        footerTagline: 'â€” Ø¬Ø³Ø± Ø§Ù„Ø¹Ø·Ø§Ø¡ Ø¨ÙŠÙ† Ù…Ø²ÙˆØ¯ÙŠ Ø§Ù„Ø·Ø¹Ø§Ù… ÙˆØ§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ø§Ù„Ø®ÙŠØ±ÙŠØ©',
        footerArch: 'ØªÙ… Ø§Ù„ØªØ·ÙˆÙŠØ± Ø¨ÙˆØ§Ø³Ø·Ø© Abdallah Sharaf Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… ASP.NET Core ÙˆØ§Ù„Ø¨Ù†ÙŠØ© Ø§Ù„Ù…Ø¹Ù…Ø§Ø±ÙŠØ© Ø§Ù„Ù†Ø¸ÙŠÙØ© (Clean Architecture)',
        copyright: 'Â© 2026 Ù…Ù†ØµØ© FoodBridge â€¢ ØªÙ… Ø§Ù„ØªØ·ÙˆÙŠØ± Ø¨ÙˆØ§Ø³Ø·Ø© Abdallah Sharaf. Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ‚ Ù…Ø­ÙÙˆØ¸Ø©.',
        availableSurplus: 'Ø§Ù„ÙØ§Ø¦Ø¶ Ø§Ù„Ù…ØªØ§Ø­',
        storageConditions: 'Ø´Ø±ÙˆØ· Ø§Ù„Ø­ÙØ¸ ÙˆØ§Ù„ØªØ®Ø²ÙŠÙ†',
        knownAllergens: 'Ù…Ø³Ø¨Ø¨Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø³ÙŠØ©',
        pickupDeadline: 'Ø¢Ø®Ø± Ù…ÙˆØ¹Ø¯ Ù„Ù„Ø§Ø³ØªÙ„Ø§Ù…',
        pickupLocation: 'Ù…ÙˆÙ‚Ø¹ ÙˆØ¹Ù†ÙˆØ§Ù† Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…',
        close: 'Ø¥ØºÙ„Ø§Ù‚',
        requestReservation: 'Ø·Ù„Ø¨ Ø­Ø¬Ø² Ø§Ù„ØªØ¨Ø±Ø¹',
        postDonationModalTitle: 'Ø¥Ø¶Ø§ÙØ© ØªØ¨Ø±Ø¹ Ø·Ø¹Ø§Ù… Ø¬Ø¯ÙŠØ¯',
        postDonationModalSubtitle: 'Ø³Ø¬Ù„ ÙØ§Ø¦Ø¶ Ø§Ù„Ø·Ø¹Ø§Ù… Ø§Ù„ØµØ§Ù„Ø­ Ù„Ù„Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ Ù„ØªØªÙ…ÙƒÙ† Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ù…Ù† Ø­Ø¬Ø²Ù‡.',
        labelFoodName: 'Ø§Ø³Ù… Ø§Ù„ÙˆØ¬Ø¨Ø© Ø£Ùˆ Ø§Ù„ØµÙ†Ù *',
        foodNamePlaceholder: 'Ù…Ø«Ø§Ù„: ÙˆØ¬Ø¨Ø§Øª Ù„Ø­ÙˆÙ… ÙˆØ£Ø±Ø² Ø·Ø§Ø²Ø¬Ø©ØŒ Ø®Ø¨Ø² ÙˆÙ…Ø¹Ø¬Ù†Ø§Øª...',
        labelCategory: 'Ø§Ù„ØªØµÙ†ÙŠÙ *',
        catCookedMeals: 'ÙˆØ¬Ø¨Ø§Øª Ù…Ø·Ø¨ÙˆØ®Ø©',
        catBakery: 'Ù…Ø®Ø¨ÙˆØ²Ø§Øª ÙˆÙ…Ø¹Ø¬Ù†Ø§Øª',
        catProduce: 'Ø®Ø¶Ø±ÙˆØ§Øª ÙˆÙÙˆØ§ÙƒÙ‡ Ø·Ø§Ø²Ø¬Ø©',
        catDairy: 'Ø£Ù„Ø¨Ø§Ù† ÙˆØ¨ÙŠØ¶',
        catPackaged: 'Ø£Ø·Ø¹Ù…Ø© Ù…Ø¹Ù„Ø¨Ø© ÙˆÙ…ØºÙ„ÙØ©',
        catMeat: 'Ù„Ø­ÙˆÙ… ÙˆØ¯ÙˆØ§Ø¬Ù†',
        catBeverages: 'Ù…Ø´Ø±ÙˆØ¨Ø§Øª',
        catOther: 'Ø£Ø®Ø±Ù‰',
        labelQuantityUnit: 'Ø§Ù„ÙƒÙ…ÙŠØ© ÙˆØ§Ù„ÙˆØ­Ø¯Ø© *',
        qtyPlaceholder: 'Ø§Ù„Ø¹Ø¯Ø¯',
        unitPlaceholder: 'ÙˆØ¬Ø¨Ø©ØŒ ÙƒØ¬Ù…ØŒ Ø¹Ù„Ø¨Ø©',
        labelDescription: 'Ø§Ù„ÙˆØµÙ ÙˆØ§Ù„Ù…ÙƒÙˆÙ†Ø§Øª *',
        descPlaceholder: 'Ø§ÙˆØµÙ Ø§Ù„Ù…ÙƒÙˆÙ†Ø§ØªØŒ Ø­Ø§Ù„Ø© Ø§Ù„ØªØºÙ„ÙŠÙØŒ ÙˆØªÙˆØµÙŠØ§Øª Ø§Ù„ØªÙ‚Ø¯ÙŠÙ… Ø£Ùˆ Ø§Ù„ØªØ³Ø®ÙŠÙ†...',
        labelPrepDate: 'ØªØ§Ø±ÙŠØ® ÙˆÙˆÙ‚Øª Ø§Ù„ØªØ­Ø¶ÙŠØ± *',
        labelPickupDeadline: 'Ø¢Ø®Ø± Ù…ÙˆØ¹Ø¯ Ù„Ù„Ø§Ø³ØªÙ„Ø§Ù… *',
        labelStorageConditions: 'Ø´Ø±ÙˆØ· Ø§Ù„Ø­ÙØ¸ *',
        optRefrigerated: 'Ù…Ø¨Ø±Ù‘Ø¯ (0-4 Ø¯Ø±Ø¬Ø§Øª Ù…Ø¦ÙˆÙŠØ©)',
        optRoomTemp: 'Ø­Ø±Ø§Ø±Ø© Ø§Ù„ØºØ±ÙØ© Ø§Ù„Ø¹Ø§Ø¯ÙŠØ©',
        optFrozen: 'Ù…Ø¬Ù…Ù‘Ø¯ (Ø£Ù‚Ù„ Ù…Ù† -18 Ù…Ø¦ÙˆÙŠØ©)',
        optKeepWarm: 'Ø­ÙØ¸ Ø³Ø§Ø®Ù† (ÙÙˆÙ‚ 63 Ù…Ø¦ÙˆÙŠØ©)',
        labelKnownAllergens: 'Ù…Ø³Ø¨Ø¨Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø³ÙŠØ© Ø§Ù„Ù…Ø¹Ø±ÙˆÙØ© *',
        allergensPlaceholder: 'Ù…Ø«Ø§Ù„: ØºÙ„ÙˆØªÙŠÙ†ØŒ Ù…Ø´ØªÙ‚Ø§Øª Ø­Ù„ÙŠØ¨ØŒ Ù…ÙƒØ³Ø±Ø§ØªØŒ Ø£Ùˆ Ù„Ø§ ÙŠÙˆØ¬Ø¯',
        labelPickupAddress: 'Ø¹Ù†ÙˆØ§Ù† ÙˆÙ…Ù„Ø§Ø­Ø¸Ø§Øª Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… *',
        addressPlaceholder: 'Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø¨Ø§Ù„ØªÙØµÙŠÙ„ØŒ Ø§Ù„Ø¨Ø§Ø¨ Ø§Ù„Ø®Ù„ÙÙŠ Ù„Ù„Ù…Ø·Ø¨Ø®ØŒ Ø±Ù‚Ù… Ø§Ù„ØªÙˆØ§ØµÙ„...',
        labelFoodPhoto: 'ØµÙˆØ±Ø© Ø§Ù„Ø·Ø¹Ø§Ù… (Ù…Ù„Ù Ø£Ùˆ Ø±Ø§Ø¨Ø· Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ)',
        imageUrlPlaceholder: 'Ø£Ùˆ Ø§Ù„ØµÙ‚ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ù…Ø¨Ø§Ø´Ø±Ø©...',
        publishDonation: 'Ù†Ø´Ø± Ø§Ù„ØªØ¨Ø±Ø¹ ÙÙˆØ±Ø§Ù‹',
        cancel: 'Ø¥Ù„ØºØ§Ø¡',
        acceptModalTitle: 'ØªØ£ÙƒÙŠØ¯ ÙˆÙ‚Ø¨ÙˆÙ„ Ù…ÙˆØ¹Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…',
        acceptModalSubtitle: 'Ø­Ø¯Ø¯ Ø§Ù„ØªØ§Ø±ÙŠØ® ÙˆØ§Ù„ÙˆÙ‚Øª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯ ÙˆÙ…ÙˆÙ‚Ø¹ ØªØ³Ù„ÙŠÙ… Ø§Ù„Ø´Ø­Ù†Ø© Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø¬Ù…Ø¹ÙŠØ©.',
        labelConfirmedPickupDateTime: 'ØªØ§Ø±ÙŠØ® ÙˆÙˆÙ‚Øª Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ù…ØªÙÙ‚ Ø¹Ù„ÙŠÙ‡ *',
        labelConfirmedLocation: 'Ù…ÙˆÙ‚Ø¹ Ø§Ù„ØªØ³Ù„ÙŠÙ… Ø§Ù„Ù…Ø¹ØªÙ…Ø¯ / Ø±ØµÙŠÙ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… *',
        acceptLocationPlaceholder: 'Ù…Ø«Ø§Ù„: ÙƒÙˆØ±Ù†ÙŠØ´ Ø§Ù„Ù†ÙŠÙ„ØŒ Ø§Ù„Ø¨Ø§Ø¨ Ø§Ù„Ø®Ù„ÙÙŠ Ù„Ù„Ù…Ø·Ø¨Ø® Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ',
        confirmAcceptance: 'ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ù‚Ø¨ÙˆÙ„ ÙˆØ§Ù„Ù…ÙˆØ¹Ø¯',
        reviewModalTitle: 'ÙƒØªØ§Ø¨Ø© ØªÙ‚ÙŠÙŠÙ… Ù„Ù„Ø´Ø±ÙŠÙƒ',
        reviewModalSubtitle: 'Ù‚ÙŠÙ‘Ù… ØªØ¬Ø±Ø¨ØªÙƒ Ù…Ø¹ Ø´Ø±ÙŠÙƒ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Ø¨Ø¹Ø¯ Ø¥ØªÙ…Ø§Ù… Ø§Ù„Ø¹Ù…Ù„ÙŠØ©.',
        labelRating: 'Ø§Ù„ØªÙ‚ÙŠÙŠÙ… (Ù…Ù† 1 Ø¥Ù„Ù‰ 5 Ù†Ø¬ÙˆÙ…) *',
        labelReviewComment: 'Ù…Ù„Ø§Ø­Ø¸Ø§Øª ÙˆØªØºØ°ÙŠØ© Ø±Ø§Ø¬Ø¹Ø© Ø§Ø®ØªÙŠØ§Ø±ÙŠØ©',
        reviewCommentPlaceholder: 'Ø´Ø§Ø±ÙƒÙ†Ø§ Ø¨ØªØ¬Ø±Ø¨ØªÙƒ Ø­ÙˆÙ„ Ø§Ù„Ø§Ù„ØªØ²Ø§Ù… Ø¨Ø§Ù„Ù…ÙˆØ¹Ø¯ØŒ Ø¬ÙˆØ¯Ø© Ø§Ù„ØªØºÙ„ÙŠÙ ÙˆØ§Ù„Ù†Ø¸Ø§ÙØ©...',
        postReview: 'Ù†Ø´Ø± Ø§Ù„ØªÙ‚ÙŠÙŠÙ…',
        reportProblemTitle: 'Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…',
        reportProblemSubtitle: 'Ø£Ø¨Ù„Øº Ø¹Ù† Ø£ÙŠ Ù…Ø´ÙƒÙ„Ø© Ù…Ø«Ù„ Ø¹Ø¯Ù… ØªÙˆØ§Ø¬Ø¯ Ø§Ù„Ù…Ø²ÙˆØ¯ØŒ Ø¹Ø¯Ù… ØªÙˆÙØ± Ø§Ù„Ø·Ø¹Ø§Ù…ØŒ Ø£Ùˆ Ù†Ù‚Øµ Ø§Ù„ÙƒÙ…ÙŠØ©.',
        labelProblemDescription: 'ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ø´ÙƒÙ„Ø© *',
        problemDescriptionPlaceholder: 'Ø§Ø´Ø±Ø­ Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ø§Ù„ØªÙŠ ÙˆØ§Ø¬Ù‡ØªÙ‡Ø§ Ø£Ø«Ù†Ø§Ø¡ Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Ø¨Ø§Ù„ØªÙØµÙŠÙ„...',
        submitReport: 'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¨Ù„Ø§Øº Ù„Ù„Ø¥Ø¯Ø§Ø±Ø©',
        authSignInTitle: 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¥Ù„Ù‰ FoodBridge',
        signInTab: 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„',
        providerTab: 'Ù…Ø²ÙˆØ¯ Ø·Ø¹Ø§Ù…',
        charityTab: 'Ø¬Ù…Ø¹ÙŠØ© Ø®ÙŠØ±ÙŠØ©',
        labelEmail: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ',
        labelPassword: 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±',
        signInBtn: 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„',
        labelPContactName: 'Ø§Ø³Ù… Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„ÙƒØ§Ù…Ù„ *',
        labelPBusinessName: 'Ø§Ø³Ù… Ø§Ù„Ù…Ù†Ø´Ø£Ø© / Ø§Ù„Ù…Ø·Ø¹Ù… / Ø§Ù„Ù…Ø®Ø¨Ø² *',
        labelPProviderType: 'Ù†ÙˆØ¹ Ø§Ù„Ù…Ù†Ø´Ø£Ø© *',
        provRestaurant: 'Ù…Ø·Ø¹Ù…',
        provBakery: 'Ù…Ø®Ø¨Ø² ÙˆÙ…Ø¹Ø¬Ù†Ø§Øª',
        provHotel: 'ÙÙ†Ø¯Ù‚',
        provCatering: 'Ø®Ø¯Ù…Ø§Øª Ø¶ÙŠØ§ÙØ© ÙˆØªØºØ°ÙŠØ©',
        labelPWorkEmail: 'Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„Ø±Ø³Ù…ÙŠ *',
        labelPBusinessAddress: 'Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ù†Ø´Ø£Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ *',
        labelPasswordMin: 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± *',
        passwordMinPlaceholder: '8 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„',
        labelConfirmPassword: 'ØªØ£ÙƒÙŠØ¯ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± *',
        confirmPasswordPlaceholder: 'Ø£Ø¹Ø¯ Ø¥Ø¯Ø®Ø§Ù„ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±',
        createProviderBtn: 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ù…Ø²ÙˆØ¯ Ø·Ø¹Ø§Ù…',
        labelCDirectorName: 'Ø§Ø³Ù… Ù…Ø¯ÙŠØ± Ø§Ù„Ø¬Ù…Ø¹ÙŠØ© Ø£Ùˆ Ø§Ù„Ù…ÙÙˆØ¶ *',
        labelCCharityName: 'Ø§Ø³Ù… Ø§Ù„Ø¬Ù…Ø¹ÙŠØ© Ø£Ùˆ Ø§Ù„Ù…Ù†Ø¸Ù…Ø© Ø§Ù„Ø£Ù‡Ù„ÙŠØ© *',
        labelCCharityType: 'Ù†ÙˆØ¹ Ø§Ù„Ù†Ø´Ø§Ø· Ø§Ù„Ø®ÙŠØ±ÙŠ *',
        charityFoodBank: 'Ø¨Ù†Ùƒ Ø·Ø¹Ø§Ù…',
        charityShelter: 'Ø¯Ø§Ø± Ø±Ø¹Ø§ÙŠØ© / Ø¥ÙŠÙˆØ§Ø¡',
        charityCommunityKitchen: 'Ù…Ø·Ø¨Ø® Ù…Ø¬ØªÙ…Ø¹ÙŠ',
        charityYouthCenter: 'Ù…Ø±ÙƒØ² Ø±Ø¹Ø§ÙŠØ© Ø´Ø¨Ø§Ø¨ ÙˆÙ…Ø¬ØªÙ…Ø¹',
        labelCOfficialEmail: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø§Ù„Ø±Ø³Ù…ÙŠ *',
        labelCCommunitiesServed: 'Ø§Ù„ÙØ¦Ø§Øª ÙˆØ§Ù„Ù…Ø¬ØªÙ…Ø¹Ø§Øª Ø§Ù„Ù…Ø³ØªÙÙŠØ¯Ø© *',
        communitiesPlaceholder: 'Ù…Ø«Ø§Ù„: Ø§Ù„Ø£Ø³Ø± Ø§Ù„Ù…ØªØ¹ÙÙØ©ØŒ Ø§Ù„Ù„Ø§Ø¬Ø¦ÙˆÙ†ØŒ ÙƒØ¨Ø§Ø± Ø§Ù„Ø³Ù†ØŒ Ø§Ù„Ø£ÙŠØªØ§Ù…...',
        labelCHqAddress: 'Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ù‚Ø± Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ *',
        createCharityBtn: 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø¬Ù…Ø¹ÙŠØ© Ø®ÙŠØ±ÙŠØ©',
        acceptPickup: 'Ù‚Ø¨ÙˆÙ„ ÙˆØªØ­Ø¯ÙŠØ¯ Ù…ÙˆØ¹Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…',
        decline: 'Ø±ÙØ¶ Ø§Ù„Ø·Ù„Ø¨',
        markReady: 'ØªØ­Ø¯ÙŠØ¯ ÙƒØ¬Ø§Ù‡Ø² Ù„Ù„Ø§Ø³ØªÙ„Ø§Ù…',
        awaitingPickup: 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø¬Ù…Ø¹ÙŠØ©',
        completedDouble: 'ØªÙ… Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Ø¨Ù†Ø¬Ø§Ø­',
        markUnavailable: 'ØªØ­Ø¯ÙŠØ¯ ÙƒØºÙŠØ± Ù…ØªØ§Ø­',
        confirmCollected: 'ØªØ£ÙƒÙŠØ¯ Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„ÙˆØ¬Ø¨Ø§Øª',
        reportIssue: 'Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù…Ø´ÙƒÙ„Ø©',
        withdrawRequest: 'Ø³Ø­Ø¨ Ø·Ù„Ø¨ Ø§Ù„Ø­Ø¬Ø²',
        leaveReview: 'ÙƒØªØ§Ø¨Ø© ØªÙ‚ÙŠÙŠÙ… Ù„Ù„Ø´Ø±ÙŠÙƒ',
        reviewed: 'ØªÙ… Ø§Ù„ØªÙ‚ÙŠÙŠÙ…',
        adminUsers: 'Ù…Ø³ØªØ®Ø¯Ù…Ùˆ Ø§Ù„Ù…Ù†ØµØ©',
        adminVerifications: 'Ø·Ù„Ø¨Ø§Øª Ø§Ù„ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ù…Ø¹Ù„Ù‚Ø©',
        adminAudit: 'Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚ ÙˆØ§Ù„Ø£Ù…Ø§Ù†',
        approve: 'Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØªÙˆØ«ÙŠÙ‚',
        reject: 'Ø±ÙØ¶',
        suspend: 'ØªØ¬Ù…ÙŠØ¯ Ø§Ù„Ø­Ø³Ø§Ø¨',
        reactivate: 'ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨',
        btnAddAdmin: '+ Ø¥Ø¶Ø§ÙØ© Ù…Ø´Ø±Ù Ø¬Ø¯ÙŠØ¯',
        createAdminModalTitle: 'Ø¥Ø¶Ø§ÙØ© Ù…Ø´Ø±Ù Ø¬Ø¯ÙŠØ¯ Ù„Ù„Ù…Ù†ØµØ©',
        createAdminModalSubtitle: 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ù…Ø´Ø±Ù Ø¨Ù†Ø¸Ø§Ù… Ø§Ù„Ø±Ù‚Ø§Ø¨Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª.',
        labelAdminFullName: 'Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„ *',
        labelAdminEmail: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø§Ù„Ø±Ø³Ù…ÙŠ *',
        labelAdminDepartment: 'Ø§Ù„Ù‚Ø³Ù… / Ø§Ù„Ù…Ø³Ù…Ù‰ Ø§Ù„ÙˆØ¸ÙŠÙÙŠ',
        labelAdminPhone: 'Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ',
        labelAdminPassword: 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø£ÙˆÙ„ÙŠØ© *',
        btnCreateAdminSubmit: 'Ø­ÙØ¸ ÙˆØ¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ø´Ø±Ù',
        adminNamePlaceholder: 'Ù…Ø«Ø§Ù„: Ø³Ø§Ø±Ø© Ø£Ø­Ù…Ø¯',
        adminDeptPlaceholder: 'Ù…Ø«Ø§Ù„: Ø§Ù„Ø±Ù‚Ø§Ø¨Ø© ÙˆØ§Ù„Ø§Ù…ØªØ«Ø§Ù„',
        administrators: 'Ø§Ù„Ù…Ø´Ø±ÙÙˆÙ†',
        langBtnText: 'English'
    }
};

function formatCategory(category) {
    if (!category) return currentLang === 'ar' ? 'Ø·Ø¹Ø§Ù… Ø¹Ø§Ù…' : 'Other';
    const isAr = currentLang === 'ar';
    const arMap = {
        'CookedMeals': 'ðŸ² ÙˆØ¬Ø¨Ø§Øª Ù…Ø·Ø¨ÙˆØ®Ø©',
        'BakeryAndPastry': 'ðŸ¥ Ù…Ø®Ø¨ÙˆØ²Ø§Øª ÙˆÙ…Ø¹Ø¬Ù†Ø§Øª',
        'FreshProduce': 'ðŸ¥¦ Ø®Ø¶Ø±ÙˆØ§Øª ÙˆÙÙˆØ§ÙƒÙ‡ Ø·Ø§Ø²Ø¬Ø©',
        'DairyAndEggs': 'ðŸ¥› Ø£Ù„Ø¨Ø§Ù† ÙˆØ¨ÙŠØ¶',
        'CannedAndPackaged': 'ðŸ¥« Ø£Ø·Ø¹Ù…Ø© Ù…Ø¹Ù„Ø¨Ø© ÙˆÙ…ØºÙ„ÙØ©',
        'MeatAndPoultry': 'ðŸ— Ù„Ø­ÙˆÙ… ÙˆØ¯ÙˆØ§Ø¬Ù†',
        'Beverages': 'ðŸ§ƒ Ù…Ø´Ø±ÙˆØ¨Ø§Øª',
        'Other': 'ðŸ½ï¸ Ø·Ø¹Ø§Ù… Ø¹Ø§Ù…'
    };
    const enMap = {
        'CookedMeals': 'ðŸ² Cooked Meals',
        'BakeryAndPastry': 'ðŸ¥ Bakery & Pastry',
        'FreshProduce': 'ðŸ¥¦ Fresh Produce',
        'DairyAndEggs': 'ðŸ¥› Dairy & Eggs',
        'CannedAndPackaged': 'ðŸ¥« Packaged & Canned',
        'MeatAndPoultry': 'ðŸ— Meat & Poultry',
        'Beverages': 'ðŸ§ƒ Beverages',
        'Other': 'ðŸ½ï¸ General Food'
    };
    return isAr ? (arMap[category] || category) : (enMap[category] || category);
}

function formatStatus(status) {
    if (!status) return '';
    const isAr = currentLang === 'ar';
    const arMap = {
        'Available': 'Ù…ØªØ§Ø­ Ù„Ù„Ø­Ø¬Ø²',
        'Reserved': 'Ù…Ø­Ø¬ÙˆØ²',
        'Pending': 'Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±',
        'Accepted': 'ØªÙ… Ø§Ù„Ù‚Ø¨ÙˆÙ„',
        'Rejected': 'Ù…Ø±ÙÙˆØ¶',
        'ReadyForPickup': 'Ø¬Ø§Ù‡Ø² Ù„Ù„Ø§Ø³ØªÙ„Ø§Ù…',
        'Completed': 'Ù…ÙƒØªÙ…Ù„ Ø¨Ù†Ø¬Ø§Ø­',
        'Cancelled': 'Ù…Ù„ØºÙŠ',
        'Expired': 'Ù…Ù†ØªÙ‡ÙŠ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ©',
        'Unavailable': 'ØºÙŠØ± Ù…ØªØ§Ø­',
        'Active': 'Ù†Ø´Ø·',
        'Suspended': 'Ù…Ø¬Ù…Ù‘Ø¯'
    };
    return isAr ? (arMap[status] || status) : status;
}

function initTheme() {
    const savedTheme = localStorage.getItem('foodbridge_theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        const icon = document.getElementById('themeToggleIcon');
        if (icon) icon.className = 'fa-solid fa-sun text-base text-amber-400';
    } else {
        document.documentElement.classList.remove('dark');
        const icon = document.getElementById('themeToggleIcon');
        if (icon) icon.className = 'fa-solid fa-moon text-base text-slate-600';
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('foodbridge_theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('themeToggleIcon');
    if (icon) {
        icon.className = isDark ? 'fa-solid fa-sun text-base text-amber-400' : 'fa-solid fa-moon text-base text-slate-600';
    }
    showToast(isDark ? 'Dark Mode' : 'Light Mode', isDark ? (currentLang === 'ar' ? 'ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ù„ÙŠÙ„ÙŠ' : 'Dark mode enabled') : (currentLang === 'ar' ? 'ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ù†Ù‡Ø§Ø±ÙŠ' : 'Light mode enabled'), 'info');
}

function initLanguage() {
    currentLang = localStorage.getItem('foodbridge_lang') || 'en';
    applyLanguage(currentLang);
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    localStorage.setItem('foodbridge_lang', currentLang);
    applyLanguage(currentLang);
    showToast(currentLang === 'ar' ? 'Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©' : 'Language Changed', currentLang === 'ar' ? 'ØªÙ… ØªØ­ÙˆÙŠÙ„ Ø§Ù„ÙˆØ§Ø¬Ù‡Ø© Ø¥Ù„Ù‰ Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­' : 'Switched to English successfully', 'success');
}

function applyLanguage(lang) {
    const isAr = lang === 'ar';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');

    const dict = i18nDict[lang] || i18nDict.en;

    const langBtn = document.getElementById('langBtnText');
    if (langBtn) langBtn.textContent = dict.langBtnText;

    const navExplore = document.getElementById('nav-explore');
    if (navExplore) navExplore.innerHTML = `<i class="fa-solid fa-compass ${isAr ? 'ml-2' : 'mr-2'} text-emerald-600"></i> ${dict.navBrowse}`;
    const navProvider = document.getElementById('nav-provider');
    if (navProvider) navProvider.innerHTML = `<i class="fa-solid fa-store ${isAr ? 'ml-2' : 'mr-2'} text-amber-500"></i> ${dict.navProvider}`;
    const navCharity = document.getElementById('nav-charity');
    if (navCharity) navCharity.innerHTML = `<i class="fa-solid fa-hand-holding-heart ${isAr ? 'ml-2' : 'mr-2'} text-emerald-600"></i> ${dict.navCharity}`;
    const navAdmin = document.getElementById('nav-admin');
    if (navAdmin) navAdmin.innerHTML = `<i class="fa-solid fa-gauge-high ${isAr ? 'ml-2' : 'mr-2'} text-indigo-600"></i> ${dict.navAdmin}`;
    const navImpact = document.getElementById('nav-impact');
    if (navImpact) navImpact.innerHTML = `<i class="fa-solid fa-chart-pie ${isAr ? 'ml-2' : 'mr-2'} text-blue-500"></i> ${dict.navImpact}`;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerHTML = dict[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.placeholder = dict[key];
        }
    });

    const searchInput = document.getElementById('exploreSearchInput') || document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = dict.searchPlaceholder;

    const sortByFilter = document.getElementById('sortByFilter');
    if (sortByFilter && sortByFilter.options.length >= 3) {
        sortByFilter.options[0].text = dict.sortNewest;
        sortByFilter.options[1].text = dict.sortDeadline;
        sortByFilter.options[2].text = dict.sortQuantity;
    }

    const providerTypeFilter = document.getElementById('providerTypeFilter');
    if (providerTypeFilter && providerTypeFilter.options.length >= 5) {
        providerTypeFilter.options[0].text = dict.allProviders;
        if (isAr) {
            providerTypeFilter.options[1].text = 'Ù…Ø·Ø§Ø¹Ù…';
            providerTypeFilter.options[2].text = 'Ù…Ø®Ø§Ø¨Ø²';
            providerTypeFilter.options[3].text = 'ÙÙ†Ø§Ø¯Ù‚';
            providerTypeFilter.options[4].text = 'Ø®Ø¯Ù…Ø§Øª Ø¶ÙŠØ§ÙØ© ÙˆØªØºØ°ÙŠØ©';
        } else {
            providerTypeFilter.options[1].text = 'Restaurants';
            providerTypeFilter.options[2].text = 'Bakeries';
            providerTypeFilter.options[3].text = 'Hotels';
            providerTypeFilter.options[4].text = 'Catering Services';
        }
    }

    const pills = document.querySelectorAll('.category-pill');
    pills.forEach(p => {
        const cat = p.getAttribute('data-category');
        if (cat === 'all') p.textContent = dict.allCategories;
        else if (cat) p.textContent = formatCategory(cat);
    });

    updateAuthUI();

    if (currentView === 'explore') loadExploreListings();
    else if (currentView === 'provider') loadProviderPortal();
    else if (currentView === 'charity') loadCharityPortal();
    else if (currentView === 'admin') loadAdminPortal();
    else if (currentView === 'impact') loadImpactStats();
    else if (currentView === 'landing') loadLandingStats();
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    updateAuthUI();
    initSignalR();
    navigateTo('landing');
    initScrollReveal();
    init3DTilt();
});

async function initSignalR() {
    try {
        const token = currentUser ? currentUser.token : '';
        const userId = currentUser ? currentUser.userId : '';

        console.log('%c[SignalR Real-Time]%c Initializing connection to /hubs/notifications...', 'background: #0ea5e9; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: #0ea5e9; font-weight: bold;');

        signalrConnection = new signalR.HubConnectionBuilder()
            .withUrl(`/hubs/notifications?userId=${encodeURIComponent(userId)}&access_token=${encodeURIComponent(token)}`)
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Information)
            .build();

        signalrConnection.onreconnecting((error) => {
            console.warn('%c[SignalR Warning]%c ðŸ”„ Reconnecting to server...', 'background: #f59e0b; color: black; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: #f59e0b;', error);
            const ind = document.getElementById('signalrIndicator');
            if (ind) { ind.classList.remove('bg-emerald-500'); ind.classList.add('bg-amber-500'); }
        });

        signalrConnection.onreconnected((connectionId) => {
            console.log('%c[SignalR Reconnected]%c âš¡ Live connection restored! Connection ID: ' + connectionId, 'background: #10b981; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: #10b981;');
            const ind = document.getElementById('signalrIndicator');
            if (ind) { ind.classList.remove('bg-amber-500', 'bg-rose-500'); ind.classList.add('bg-emerald-500'); }
        });

        signalrConnection.onclose((error) => {
            console.error('%c[SignalR Closed]%c âŒ Connection terminated', 'background: #ef4444; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: #ef4444;', error);
            const ind = document.getElementById('signalrIndicator');
            if (ind) { ind.classList.remove('bg-emerald-500'); ind.classList.add('bg-rose-500'); }
        });

        signalrConnection.on('ReceiveNotification', (notification) => {
            console.log(
                '%c[SignalR Push Notification]%c ðŸ”” Received: "' + (notification.title || '') + '" â€” ' + (notification.message || ''),
                'background: #10b981; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px;',
                'color: #059669; font-weight: bold;',
                notification
            );
            handleIncomingNotification(notification);
        });

        await signalrConnection.start();
        console.log(
            '%c[SignalR Live Hub]%c Connected & Active (Connection ID: ' + signalrConnection.connectionId + ', User: ' + (currentUser ? currentUser.email : 'Guest') + ')',
            'background: #059669; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px;',
            'color: #059669; font-weight: bold;'
        );
        const ind = document.getElementById('signalrIndicator');
        if (ind) ind.classList.remove('bg-rose-500', 'bg-amber-500');
        if (ind) ind.classList.add('bg-emerald-500');

        if (currentUser) {
            loadNotifications();
        }
    } catch (err) {
        console.warn('%c[SignalR Error]%c Connection failed (will retry):', 'background: #ef4444; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: #ef4444;', err);
        const ind = document.getElementById('signalrIndicator');
        if (ind) ind.classList.remove('bg-emerald-500');
        if (ind) ind.classList.add('bg-rose-500');
    }
}

function handleIncomingNotification(notification) {
    showToast(notification.title, notification.message, 'info');

    prependNotificationItem(notification);

    const badge = document.getElementById('unreadBadge');
    if (badge) {
        let count = parseInt(badge.textContent) || 0;
        count++;
        badge.textContent = count;
        badge.classList.remove('hidden');
    }

    if (currentView === 'provider') {
        loadProviderRequests();
        loadProviderListings();
    } else if (currentView === 'charity') {
        loadCharityReservations();
    } else if (currentView === 'admin') {
        loadAdminStats();
    }
}

function updateAuthUI() {
    const container = document.getElementById('authContainer');
    if (!container) return;

    const dict = i18nDict[currentLang] || i18nDict.en;
    const isAr = currentLang === 'ar';

    if (currentUser) {
        const roleColor = currentUser.role === 'Admin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200' :
                          currentUser.role === 'Provider' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200';

        const roleText = isAr ? (currentUser.role === 'Admin' ? 'Ù…Ø´Ø±Ù' : currentUser.role === 'Provider' ? 'Ù…Ø²ÙˆØ¯ Ø·Ø¹Ø§Ù…' : 'Ø¬Ù…Ø¹ÙŠØ© Ø®ÙŠØ±ÙŠØ©') : currentUser.role;

        container.innerHTML = `
            <div class="flex items-center space-x-2.5">
                <div class="${isAr ? 'text-left' : 'text-right'} hidden sm:block">
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-100">${escapeHtml(currentUser.fullName)}</div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400">${escapeHtml(currentUser.organizationName || roleText)}</div>
                </div>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${roleColor}">
                    ${roleText}
                </span>
                <button onclick="logout()" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="${dict.signOut}">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
            </div>
        `;

        const pBadge = document.getElementById('providerVerificationBadge');
        if (pBadge) {
            pBadge.className = currentUser.isVerified 
                ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800'
                : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800';
            pBadge.innerHTML = currentUser.isVerified 
                ? `<i class="fa-solid fa-circle-check ${isAr ? 'ml-1' : 'mr-1'}"></i> ${isAr ? 'Ù…Ù†Ø¸Ù…Ø© Ù…ÙˆØ«Ù‚Ø© ÙˆÙ…Ø¹ØªÙ…Ø¯Ø©' : 'Verified Organization'}`
                : `<i class="fa-solid fa-clock ${isAr ? 'ml-1' : 'mr-1'}"></i> ${isAr ? 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ù…ÙˆØ§ÙÙ‚Ø© Ø§Ù„Ù…Ø´Ø±Ù' : 'Verification Pending Admin Approval'}`;
        }

        const cBadge = document.getElementById('charityVerificationBadge');
        if (cBadge) {
            cBadge.className = currentUser.isVerified 
                ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800'
                : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800';
            cBadge.innerHTML = currentUser.isVerified 
                ? `<i class="fa-solid fa-circle-check ${isAr ? 'ml-1' : 'mr-1'}"></i> ${isAr ? 'Ù…Ù†Ø¸Ù…Ø© Ù…ÙˆØ«Ù‚Ø© ÙˆÙ…Ø¹ØªÙ…Ø¯Ø©' : 'Verified Organization'}`
                : `<i class="fa-solid fa-clock ${isAr ? 'ml-1' : 'mr-1'}"></i> ${isAr ? 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ù…ÙˆØ§ÙÙ‚Ø© Ø§Ù„Ù…Ø´Ø±Ù' : 'Verification Pending Admin Approval'}`;
        }

    } else {
        container.innerHTML = `
            <div class="flex items-center space-x-1.5 sm:space-x-2">
                <button onclick="openAuthModal('login')" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    ${dict.signIn}
                </button>
                <button onclick="openAuthModal('reg-provider')" class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition">
                    ${dict.register}
                </button>
            </div>
        `;
    }
    updateNavLinks();
}

function updateNavLinks() {
    const navProvider = document.getElementById('nav-provider');
    const navCharity = document.getElementById('nav-charity');
    const navAdmin = document.getElementById('nav-admin');

    if (!currentUser) {
        if (navAdmin) navAdmin.classList.add('hidden');
        if (navProvider) navProvider.classList.add('hidden');
        if (navCharity) navCharity.classList.add('hidden');
    } else {
        if (currentUser.role === 'Admin') {
            if (navAdmin) navAdmin.classList.remove('hidden');
            if (navProvider) navProvider.classList.remove('hidden');
            if (navCharity) navCharity.classList.remove('hidden');
        } else if (currentUser.role === 'Provider') {
            if (navAdmin) navAdmin.classList.add('hidden');
            if (navProvider) navProvider.classList.remove('hidden');
            if (navCharity) navCharity.classList.add('hidden');
        } else if (currentUser.role === 'Charity') {
            if (navAdmin) navAdmin.classList.add('hidden');
            if (navProvider) navProvider.classList.add('hidden');
            if (navCharity) navCharity.classList.remove('hidden');
        }
    }
}

function clearCachedViews() {
    const idsToClear = [
        'adminVerificationList',
        'adminUsersTableBody',
        'adminReportedListings',
        'adminReportedReviews',
        'adminProblemReports',
        'adminAuditLogsTableBody',
        'providerListingsTableBody',
        'providerIncomingRequestsList',
        'charityActiveReservationsList',
        'notificationList'
    ];
    idsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });

    const statIds = [
        'adminStatUsers', 'adminStatProviders', 'adminStatCharities',
        'adminStatPendingVerifications', 'adminBadgeVerifications',
        'adminStatCompleted', 'adminStatRedistributed', 'adminStatReports',
        'providerStatActive', 'providerStatCompleted', 'providerStatPending', 'providerStatSaved',
        'charityStatActive', 'charityStatCompleted', 'charityStatPeople'
    ];
    statIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0';
    });
}

function logout() {
    currentUser = null;
    localStorage.removeItem('foodbridge_user');
    clearCachedViews();
    updateAuthUI();
    const isAr = currentLang === 'ar';
    showToast(isAr ? 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬' : 'Signed Out', isAr ? 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ Ø¨Ù†Ø¬Ø§Ø­ ÙˆØªØ£Ù…ÙŠÙ† Ø§Ù„Ø¬Ù„Ø³Ø©.' : 'You have been signed out successfully.', 'info');
    navigateTo('landing');
    if (signalrConnection) {
        signalrConnection.stop();
    }
}

async function performLogin(email, password) {
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            showToast('Login Failed', data.message || 'Invalid email or password.', 'error');
            return false;
        }

        currentUser = data;
        localStorage.setItem('foodbridge_user', JSON.stringify(currentUser));
        updateAuthUI();
        showToast('Welcome back!', `Signed in as ${currentUser.fullName}`, 'success');

        if (signalrConnection) await signalrConnection.stop();
        await initSignalR();

        if (currentUser.role === 'Admin') navigateTo('admin');
        else if (currentUser.role === 'Provider') navigateTo('provider');
        else if (currentUser.role === 'Charity') navigateTo('charity');
        else navigateTo('explore');

        return true;
    } catch (err) {
        showToast('Error', 'Unable to connect. Please try again.', 'error');
        return false;
    }
}

let scrollRevealObserver = null;

function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    const elements = document.querySelectorAll(
        '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
    );
    if (!elements.length) return;

    if (scrollRevealObserver) {
        scrollRevealObserver.disconnect();
    }

    scrollRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                entry.target.classList.remove('scroll-hidden');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top >= window.innerHeight || rect.bottom <= 0) {
            el.classList.add('scroll-hidden');
            scrollRevealObserver.observe(el);
        } else {
            el.classList.remove('scroll-hidden');
            el.classList.add('revealed');
        }
    });

    init3DTilt();
}

function init3DTilt() {
    document.querySelectorAll('.card-tilt-hover, .glass-stat-card').forEach(card => {
        if (card.dataset.tiltInitialized) return;
        card.dataset.tiltInitialized = 'true';

        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

function animateCounter(elementId, targetValue, duration = 1400) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const end = parseInt(targetValue, 10);
    if (isNaN(end)) {
        el.textContent = targetValue;
        return;
    }

    let start = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(start + (end - start) * easeOut);

        el.textContent = `${current}+`;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            el.textContent = `${end}+`;
        }
    }

    requestAnimationFrame(updateCounter);
}

async function loadLandingStats() {
    try {
        const res = await fetch(`${API_BASE}/reports/platform-stats`);
        if (res.ok) {
            const stats = await res.json();
            animateCounter('landingStatRedistributed', stats.totalFoodRedistributedQuantity || 115);
            animateCounter('landingStatDonations',    stats.totalCompletedDonations || 2);
            animateCounter('landingStatProviders',    stats.totalProviders || 5);
            animateCounter('landingStatCharities',    stats.totalCharities || 3);
        } else {
            animateCounter('landingStatRedistributed', 115);
            animateCounter('landingStatDonations', 2);
            animateCounter('landingStatProviders', 5);
            animateCounter('landingStatCharities', 3);
        }
    } catch (_) {
        animateCounter('landingStatRedistributed', 115);
        animateCounter('landingStatDonations', 2);
        animateCounter('landingStatProviders', 5);
        animateCounter('landingStatCharities', 3);
    }
    setTimeout(() => {
        initScrollReveal();
        init3DTilt();
    }, 60);
}

function navigateTo(viewName) {
    const isAr = currentLang === 'ar';

    if (viewName === 'admin' && (!currentUser || currentUser.role !== 'Admin')) {
        showToast(isAr ? 'ØªÙ†Ø¨ÙŠÙ‡ Ø£Ù…Ù†ÙŠ' : 'Access Restricted', isAr ? 'Ù„ÙˆØ­Ø© Ø§Ù„Ù…Ø´Ø±Ù Ù…Ø®ØµØµØ© Ù„Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠÙ† ÙÙ‚Ø·. ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø´Ø±Ù.' : 'Please sign in with an Administrator account.', 'warning');
        openAuthModal('login');
        return;
    }
    if (viewName === 'provider' && (!currentUser || (currentUser.role !== 'Provider' && currentUser.role !== 'Admin'))) {
        showToast(isAr ? 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø·Ù„ÙˆØ¨' : 'Sign In Required', isAr ? 'Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ù…Ø²ÙˆØ¯ÙŠÙ† Ù…Ø®ØµØµØ© Ù„Ù…Ø²ÙˆØ¯ÙŠ Ø§Ù„Ø·Ø¹Ø§Ù… Ø§Ù„Ù…Ø¹ØªÙ…Ø¯ÙŠÙ†.' : 'Please sign in with a Provider account.', 'warning');
        openAuthModal('login');
        return;
    }
    if (viewName === 'charity' && (!currentUser || (currentUser.role !== 'Charity' && currentUser.role !== 'Admin'))) {
        showToast(isAr ? 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø·Ù„ÙˆØ¨' : 'Sign In Required', isAr ? 'Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ù…Ø®ØµØµØ© Ù„Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ø§Ù„Ø®ÙŠØ±ÙŠØ© Ø§Ù„Ù…Ø³Ø¬Ù„Ø©.' : 'Please sign in with a Charity account.', 'warning');
        openAuthModal('login');
        return;
    }

    currentView = viewName;

    document.querySelectorAll('.nav-link').forEach(link => {
        link.className = 'nav-link px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center transition';
    });
    const activeNav = document.getElementById(`nav-${viewName}`);
    if (activeNav) {
        activeNav.className = 'nav-link px-3.5 py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 flex items-center shadow-xs';
    }

    ['landing', 'explore', 'provider', 'charity', 'admin', 'impact'].forEach(v => {
        const section = document.getElementById(`view-${v}`);
        if (section) {
            section.classList.add('hidden');
            section.classList.remove('fade-in-section');
        }
    });

    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        void targetSection.offsetWidth;
        targetSection.classList.add('fade-in-section');
    }

    if (viewName === 'explore') loadExploreListings();
    else if (viewName === 'provider') loadProviderPortal();
    else if (viewName === 'charity') loadCharityPortal();
    else if (viewName === 'admin') loadAdminPortal();
    else if (viewName === 'impact') loadImpactStats();
    else if (viewName === 'landing') {
        loadLandingStats();
        setTimeout(initScrollReveal, 60);
    }
}

function setCategoryFilter(category) {
    currentCategoryFilter = category;
    document.querySelectorAll('.category-pill').forEach(pill => {
        if ((!category && pill.dataset.category === 'all') || (pill.dataset.category === category)) {
            pill.className = 'category-pill px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-sm transition shrink-0';
        } else {
            pill.className = 'category-pill px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition shrink-0';
        }
    });
    loadExploreListings();
}

function resetExploreFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('providerTypeFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('sortByFilter').value = 'newest';
    setCategoryFilter(null);
}

async function loadExploreListings() {
    const search = document.getElementById('searchInput')?.value || '';
    const providerType = document.getElementById('providerTypeFilter')?.value || '';
    const date = document.getElementById('dateFilter')?.value || '';
    const sortBy = document.getElementById('sortByFilter')?.value || 'newest';

    const params = new URLSearchParams({
        onlyAvailable: 'true',
        sortBy: sortBy,
        pageSize: '30'
    });
    if (currentCategoryFilter) params.append('category', currentCategoryFilter);
    if (search) params.append('searchTerm', search);
    if (providerType) params.append('providerType', providerType);
    if (date) params.append('availabilityDate', date);

    const grid = document.getElementById('listingsGrid');
    const emptyState = document.getElementById('emptyListingsState');
    const countDisplay = document.getElementById('listingCountDisplay');

    try {
        const res = await fetch(`${API_BASE}/foodlistings?${params.toString()}`);
        const data = await res.json();

        if (countDisplay) {
            countDisplay.textContent = `${data.totalCount || 0} active food donations`;
        }

        if (!data.items || data.items.length === 0) {
            grid.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        grid.innerHTML = data.items.map(item => renderListingCard(item)).join('');

    } catch (err) {
        console.error('Error loading explore listings:', err);
    }
}

function renderListingCard(item) {
    const dict = i18nDict[currentLang] || i18nDict.en;
    const isAr = currentLang === 'ar';
    const imgUrl = item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
    const ratingDisplay = item.providerAverageRating > 0 
        ? `<span class="inline-flex items-center text-amber-500 font-bold text-xs"><i class="fa-solid fa-star text-[10px] ${isAr ? 'ml-1' : 'mr-1'}"></i>${item.providerAverageRating.toFixed(1)}</span>`
        : `<span class="text-slate-400 text-[10px]">${isAr ? 'Ù…Ø²ÙˆØ¯ Ø¬Ø¯ÙŠØ¯' : 'New provider'}</span>`;

    const deadline = new Date(item.pickupDeadline);
    const deadlineStr = deadline.toLocaleTimeString(isAr ? 'ar-EG' : [], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });

    return `
        <div class="interactive-card bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/90 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-2xl hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all duration-300 flex flex-col group">
            <div class="relative h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(item.foodName)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out">
                <div class="absolute top-3 ${isAr ? 'right-3' : 'left-3'} px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-md backdrop-blur-md group-hover:scale-105 group-hover:shadow-emerald-500/20 transition-all duration-300">
                    ${formatCategory(item.foodCategory)}
                </div>
                <div class="absolute top-3 ${isAr ? 'left-3' : 'right-3'} px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-md group-hover:scale-105 group-hover:bg-emerald-500 transition-all duration-300">
                    ${escapeHtml(item.quantity)} ${escapeHtml(item.unitOfMeasurement)}
                </div>
            </div>

            <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span class="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">${escapeHtml(item.providerOrganization)}</span>
                        ${ratingDisplay}
                    </div>

                    <h3 class="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2 leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-200">
                        ${escapeHtml(item.foodName)}
                    </h3>

                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        ${escapeHtml(item.description)}
                    </p>

                    <!-- Key disclosures (FR2.3, FR3.2) -->
                    <div class="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                        <span class="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 flex items-center">
                            <i class="fa-solid fa-snowflake text-[10px] ${isAr ? 'ml-1' : 'mr-1'} text-blue-500"></i> ${escapeHtml(item.storageConditions)}
                        </span>
                        <span class="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50 flex items-center">
                            <i class="fa-solid fa-triangle-exclamation text-[10px] ${isAr ? 'ml-1' : 'mr-1'} text-amber-500"></i> ${dict.allergens}: ${escapeHtml(item.allergens)}
                        </span>
                    </div>
                </div>

                <div class="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">${dict.pickupBefore}</div>
                        <div class="text-xs font-bold text-rose-600 flex items-center">
                            <i class="fa-regular fa-clock ${isAr ? 'ml-1' : 'mr-1'} text-[11px] animate-pulse"></i> ${deadlineStr}
                        </div>
                    </div>
                    <button onclick="openListingDetailModal(${item.id})" class="btn-glow px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs group-hover:shadow-lg group-hover:scale-105 active:scale-95">
                        ${dict.viewAndReserve}
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function openListingDetailModal(listingId) {
    try {
        const res = await fetch(`${API_BASE}/foodlistings/${listingId}`);
        const listing = await res.json();
        currentDetailListing = listing;

        document.getElementById('detailModalFoodName').textContent = listing.foodName;
        document.getElementById('detailModalProviderInfo').textContent = `By ${listing.providerOrganization} (${listing.providerType}) â€¢ â­ ${listing.providerAverageRating > 0 ? listing.providerAverageRating.toFixed(1) : 'New'} (${listing.providerReviewsCount} reviews)`;
        document.getElementById('detailModalQuantity').textContent = `${listing.quantity} ${listing.unitOfMeasurement}`;
        document.getElementById('detailModalDescription').textContent = listing.description;
        document.getElementById('detailModalCategoryBadge').textContent = formatCategory(listing.foodCategory);
        document.getElementById('detailModalStorage').textContent = listing.storageConditions;
        document.getElementById('detailModalAllergens').textContent = listing.allergens;
        document.getElementById('detailModalDeadline').textContent = new Date(listing.pickupDeadline).toLocaleString();
        document.getElementById('detailModalAddress').textContent = listing.pickupAddress;
        document.getElementById('detailModalImage').src = listing.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';

        const reserveBtn = document.getElementById('detailModalReserveBtn');
        if (currentUser && currentUser.role === 'Charity') {
            reserveBtn.classList.remove('hidden');
        } else {
            reserveBtn.classList.add('hidden');
        }

        document.getElementById('listingDetailModal').classList.remove('hidden');
    } catch (err) {
        showToast('Error', 'Unable to fetch listing details.', 'error');
    }
}

function closeListingDetailModal() {
    document.getElementById('listingDetailModal').classList.add('hidden');
    currentDetailListing = null;
}

async function requestReservationFromModal() {
    if (!currentDetailListing) return;
    if (!currentUser || currentUser.role !== 'Charity') {
        showToast('Charity Required', 'Please switch to a Charity account to request food reservations.', 'warning');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/reservations/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ foodListingId: currentDetailListing.Id || currentDetailListing.id })
        });

        const data = await res.json();
        if (!res.ok) {
            showToast('Reservation Request Blocked', data.message || 'Error occurred.', 'error');
            return;
        }

        closeListingDetailModal();
        showToast('Reservation Requested!', 'Your reservation request was dispatched to the food provider.', 'success');
        navigateTo('charity');
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

async function loadProviderPortal() {
    if (!currentUser || (currentUser.role !== 'Provider' && currentUser.role !== 'Admin')) {
        const isAr = currentLang === 'ar';
        showToast(isAr ? 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø·Ù„ÙˆØ¨' : 'Provider Access Only', isAr ? 'ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø­Ø³Ø§Ø¨ Ù…Ø²ÙˆØ¯ Ø·Ø¹Ø§Ù….' : 'Please sign in or switch to a Provider profile.', 'info');
        navigateTo('landing');
        return;
    }

    await loadProviderStats();
    await loadProviderListings();
    await loadProviderRequests();
}

async function loadProviderStats() {
    if (!currentUser) return;
    try {
        const res = await fetch(`${API_BASE}/reports/provider`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            const stats = await res.json();
            document.getElementById('statProviderTotalListed').textContent = stats.totalListed;
            document.getElementById('statProviderTotalCompleted').textContent = stats.totalCompleted;
            document.getElementById('statProviderActiveListings').textContent = stats.activeListings;
            document.getElementById('statProviderRedistributed').textContent = `${stats.totalRedistributedQuantity}`;
            document.getElementById('statProviderRating').textContent = stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '5.0';
            document.getElementById('statProviderReviewsCount').textContent = `Based on ${stats.totalReviews} reviews`;
        }
    } catch (err) {
        console.error('Error fetching provider stats:', err);
    }
}

async function loadProviderListings() {
    if (!currentUser) return;
    const status = document.getElementById('providerListingsStatusFilter')?.value || '';
    const tbody = document.getElementById('providerListingsTableBody');

    try {
        const res = await fetch(`${API_BASE}/foodlistings/provider/my-listings?status=${status}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const listings = await res.json();

        const dict = i18nDict[currentLang] || i18nDict.en;
        const isAr = currentLang === 'ar';

        if (!listings || listings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-8 text-center text-slate-400 text-xs">${isAr ? 'Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ ØªØ¨Ø±Ø¹Ø§Øª Ø·Ø¹Ø§Ù… Ø¨Ù‡Ø°Ù‡ Ø§Ù„Ø­Ø§Ù„Ø©.' : 'No food donation listings found for this status.'}</td></tr>`;
            return;
        }

        tbody.innerHTML = listings.map(l => {
            const statusClass = l.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                                l.status === 'Reserved' ? 'bg-amber-100 text-amber-800' :
                                l.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600';

            const deadline = new Date(l.pickupDeadline).toLocaleString(isAr ? 'ar-EG' : [], { dateStyle: 'short', timeStyle: 'short' });

            const actions = l.status === 'Available' 
                ? `<button onclick="markListingUnavailable(${l.id})" class="px-2.5 py-1 text-xs rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200">${dict.markUnavailable}</button>`
                : `<span class="text-xs text-slate-400">â€”</span>`;

            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    <td class="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(l.foodName)}</td>
                    <td class="px-5 py-4">${formatCategory(l.foodCategory)}</td>
                    <td class="px-5 py-4 font-bold text-slate-700 dark:text-slate-200">${escapeHtml(l.quantity)} ${escapeHtml(l.unitOfMeasurement)}</td>
                    <td class="px-5 py-4 text-xs">${deadline}</td>
                    <td class="px-5 py-4"><span class="px-2 py-0.5 rounded-full text-xs font-bold ${statusClass}">${formatStatus(l.status)}</span></td>
                    <td class="px-5 py-4 ${isAr ? 'text-left' : 'text-right'}">${actions}</td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error('Error fetching provider listings:', err);
    }
}

async function loadProviderRequests() {
    if (!currentUser) return;
    const container = document.getElementById('providerRequestsList');
    const badge = document.getElementById('providerIncomingCount');
    const dict = i18nDict[currentLang] || i18nDict.en;
    const isAr = currentLang === 'ar';

    try {
        const res = await fetch(`${API_BASE}/reservations/provider/incoming`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const requests = await res.json();

        const pending = requests.filter(r => r.status === 'Pending');
        if (badge) badge.textContent = pending.length;

        if (!requests || requests.length === 0) {
            container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">${isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø­Ø¬Ø² ÙˆØ§Ø±Ø¯Ø© Ø­Ø§Ù„ÙŠØ§Ù‹.' : 'No incoming reservation requests.'}</div>`;
            return;
        }

        container.innerHTML = requests.map(r => {
            const isPending = r.status === 'Pending';
            const isAccepted = r.status === 'Accepted';

            let buttons = '';
            if (isPending) {
                buttons = `
                    <div class="flex items-center space-x-2">
                        <button onclick="openAcceptReservationModal(${r.id}, '${escapeHtml(r.foodName)}')" class="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                            <i class="fa-solid fa-check ${isAr ? 'ml-1' : 'mr-1'}"></i> ${dict.acceptPickup}
                        </button>
                        <button onclick="rejectReservation(${r.id})" class="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200">
                            ${dict.decline}
                        </button>
                    </div>
                `;
            } else if (isAccepted) {
                buttons = `
                    <button onclick="markReadyForPickup(${r.id})" class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                        <i class="fa-solid fa-box ${isAr ? 'ml-1' : 'mr-1'}"></i> ${dict.markReady}
                    </button>
                `;
            } else if (r.status === 'ReadyForPickup') {
                buttons = `<span class="inline-flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200"><i class="fa-solid fa-hourglass-half ${isAr ? 'ml-1' : 'mr-1'}"></i> ${dict.awaitingPickup}</span>`;
            } else if (r.status === 'Completed') {
                buttons = `<span class="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"><i class="fa-solid fa-check-double ${isAr ? 'ml-1' : 'mr-1'}"></i> ${dict.completedDouble}</span>`;
            } else {
                buttons = `<span class="text-xs text-slate-400 font-semibold">${formatStatus(r.status)}</span>`;
            }

            return `
                <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">${r.foodCategory}</span>
                            <span class="text-xs font-semibold text-emerald-600">${escapeHtml(r.quantity)} ${escapeHtml(r.unitOfMeasurement)}</span>
                        </div>
                        <h4 class="font-heading font-bold text-base text-slate-900">${escapeHtml(r.foodName)}</h4>
                        <div class="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            <span><i class="fa-solid fa-hand-holding-heart mr-1 text-emerald-600"></i> ${escapeHtml(r.charityOrganization)}</span>
                            <span><i class="fa-solid fa-user mr-1 text-slate-400"></i> ${escapeHtml(r.charityName)}</span>
                            <span><i class="fa-solid fa-envelope mr-1 text-slate-400"></i> ${escapeHtml(r.charityEmail)}</span>
                        </div>
                        ${r.charityTargetCommunity ? `<div class="text-[11px] text-slate-500 mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100"><strong>Mission:</strong> ${escapeHtml(r.charityTargetCommunity)}</div>` : ''}
                        ${r.confirmedLocation ? `<div class="text-[11px] text-indigo-700 mt-1"><strong>Agreed Location:</strong> ${escapeHtml(r.confirmedLocation)} â€¢ <strong>Pickup:</strong> ${new Date(r.pickupDateTime).toLocaleString()}</div>` : ''}
                    </div>
                    <div class="shrink-0 flex items-center justify-end">
                        ${buttons}
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error('Error fetching provider requests:', err);
    }
}

function switchProviderTab(tab) {
    if (tab === 'listings') {
        document.getElementById('providerTabListings').classList.remove('hidden');
        document.getElementById('providerTabRequests').classList.add('hidden');
        document.getElementById('ptab-listings').className = 'pb-3 text-sm font-semibold text-emerald-600 border-b-2 border-emerald-600';
        document.getElementById('ptab-requests').className = 'pb-3 text-sm font-semibold text-slate-500 hover:text-slate-800 border-b-2 border-transparent';
    } else {
        document.getElementById('providerTabListings').classList.add('hidden');
        document.getElementById('providerTabRequests').classList.remove('hidden');
        document.getElementById('ptab-listings').className = 'pb-3 text-sm font-semibold text-slate-500 hover:text-slate-800 border-b-2 border-transparent';
        document.getElementById('ptab-requests').className = 'pb-3 text-sm font-semibold text-emerald-600 border-b-2 border-emerald-600';
    }
}

function openCreateListingModal() {
    if (!currentUser || currentUser.role !== 'Provider') {
        showToast('Provider Login Required', 'Please switch to a Provider profile to create donation listings.', 'warning');
        return;
    }

    const now = new Date();
    const nowStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const deadline = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const deadlineStr = new Date(deadline.getTime() - deadline.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    document.getElementById('createPrepDate').value = nowStr;
    document.getElementById('createPickupDeadline').value = deadlineStr;
    document.getElementById('createAddress').value = currentUser.organizationAddress || '42 Nile Corniche, Cairo';

    document.getElementById('createListingModal').classList.remove('hidden');
}

function closeCreateListingModal() {
    document.getElementById('createListingModal').classList.add('hidden');
}

async function handleCreateListing(e) {
    e.preventDefault();
    if (!currentUser) return;

    const foodName = document.getElementById('createFoodName').value;
    const foodCategory = document.getElementById('createFoodCategory').value;
    const quantity = parseFloat(document.getElementById('createQuantity').value);
    const unitOfMeasurement = document.getElementById('createUnit').value;
    const description = document.getElementById('createDescription').value;
    const prepDate = document.getElementById('createPrepDate').value;
    const pickupDeadline = document.getElementById('createPickupDeadline').value;
    const storageConditions = document.getElementById('createStorage').value;
    const allergens = document.getElementById('createAllergens').value;
    const pickupAddress = document.getElementById('createAddress').value;
    const imageFile = document.getElementById('createImageFile').files[0];
    const imageUrl = document.getElementById('createImageUrl').value;

    const submitBtn = document.getElementById('createListingSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publishing...';

    try {
        let res;
        if (imageFile) {
            const formData = new FormData();
            formData.append('FoodName', foodName);
            formData.append('FoodCategory', foodCategory);
            formData.append('Quantity', quantity);
            formData.append('UnitOfMeasurement', unitOfMeasurement);
            formData.append('Description', description);
            formData.append('PreparationDate', prepDate);
            formData.append('PickupDeadline', pickupDeadline);
            formData.append('StorageConditions', storageConditions);
            formData.append('Allergens', allergens);
            formData.append('PickupAddress', pickupAddress);
            formData.append('image', imageFile);

            res = await fetch(`${API_BASE}/foodlistings`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentUser.token}` },
                body: formData
            });
        } else {
            const payload = {
                foodName,
                foodCategory,
                quantity,
                unitOfMeasurement,
                description,
                preparationDate: prepDate,
                pickupDeadline,
                storageConditions,
                allergens,
                pickupAddress
            };

            res = await fetch(`${API_BASE}/foodlistings/json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(payload)
            });
        }

        const data = await res.json();
        if (!res.ok) {
            showToast('Submission Failed', data.message || 'Error occurred.', 'error');
            return;
        }

        closeCreateListingModal();
        showToast('Donation Published!', 'Your surplus food donation is now discoverable by charities.', 'success');
        loadProviderListings();
        loadProviderStats();

    } catch (err) {
        showToast('Error', err.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Donation';
    }
}

async function markListingUnavailable(listingId) {
    if (!confirm('Mark this listing as unavailable? Charities will no longer be able to reserve it.')) return;
    try {
        const res = await fetch(`${API_BASE}/foodlistings/${listingId}/unavailable`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            showToast('Updated', 'Listing marked as unavailable.', 'info');
            loadProviderListings();
            loadProviderStats();
        }
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

function openAcceptReservationModal(reservationId, foodName) {
    document.getElementById('acceptReservationId').value = reservationId;

    const now = new Date();
    const scheduled = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const scheduledStr = new Date(scheduled.getTime() - scheduled.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    document.getElementById('acceptPickupDateTime').value = scheduledStr;
    document.getElementById('acceptLocation').value = currentUser.organizationAddress || '42 Nile Corniche, Kitchen Loading Dock';

    document.getElementById('acceptReservationModal').classList.remove('hidden');
}

function closeAcceptReservationModal() {
    document.getElementById('acceptReservationModal').classList.add('hidden');
}

async function handleAcceptReservationSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('acceptReservationId').value;
    const pickupDateTime = document.getElementById('acceptPickupDateTime').value;
    const confirmedLocation = document.getElementById('acceptLocation').value;

    try {
        const res = await fetch(`${API_BASE}/reservations/${id}/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ pickupDateTime, confirmedLocation })
        });
        const data = await res.json();
        if (!res.ok) {
            showToast('Action Failed', data.message || 'Error accepting reservation.', 'error');
            return;
        }

        closeAcceptReservationModal();
        showToast('Reservation Accepted', 'Confirmed pickup details transmitted to charity via SignalR.', 'success');
        loadProviderRequests();
        loadProviderStats();
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

async function rejectReservation(id) {
    const reason = prompt('Please enter the reason for rejecting this reservation:');
    if (!reason) return;

    try {
        const res = await fetch(`${API_BASE}/reservations/${id}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ reason })
        });
        if (res.ok) {
            showToast('Declined', 'Reservation request declined.', 'info');
            loadProviderRequests();
        }
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

async function markReadyForPickup(id) {
    try {
        const res = await fetch(`${API_BASE}/reservations/${id}/ready-for-pickup`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            showToast('Ready for Pickup!', 'Charity notified food is packaged and waiting for collection.', 'success');
            loadProviderRequests();
        }
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

async function loadCharityPortal() {
    if (!currentUser || (currentUser.role !== 'Charity' && currentUser.role !== 'Admin')) {
        const isAr = currentLang === 'ar';
        showToast(isAr ? 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø·Ù„ÙˆØ¨' : 'Charity Access Only', isAr ? 'ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø­Ø³Ø§Ø¨ Ø¬Ù…Ø¹ÙŠØ© Ø®ÙŠØ±ÙŠØ©.' : 'Please sign in or switch to a Charity profile.', 'info');
        navigateTo('landing');
        return;
    }

    await loadCharityStats();
    await loadCharityReservations();
}

async function loadCharityStats() {
    if (!currentUser) return;
    try {
        const res = await fetch(`${API_BASE}/reports/charity`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            const stats = await res.json();
            document.getElementById('statCharityTotalReceived').textContent = stats.totalReceived;
            document.getElementById('statCharityActive').textContent = stats.activeReservations;
            document.getElementById('statCharityQuantity').textContent = stats.totalQuantityReceived;
            document.getElementById('statCharityReviewsGiven').textContent = stats.totalReviewsGiven;
        }
    } catch (err) {
        console.error('Error fetching charity stats:', err);
    }
}

async function loadCharityReservations() {
    if (!currentUser) return;
    const status = document.getElementById('charityReservationsStatusFilter')?.value || '';
    const container = document.getElementById('charityReservationsContainer');
    const dict = i18nDict[currentLang] || i18nDict.en;
    const isAr = currentLang === 'ar';

    try {
        const res = await fetch(`${API_BASE}/reservations/charity/my-reservations?status=${status}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const list = await res.json();

        if (!list || list.length === 0) {
            container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs">${isAr ? 'Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø­Ø¬ÙˆØ²Ø§Øª Ø¨Ù‡Ø°Ù‡ Ø§Ù„Ø­Ø§Ù„Ø©.' : 'No food reservations found for this status.'}</div>`;
            return;
        }

        container.innerHTML = list.map(r => {
            const statusBadge = r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                r.status === 'ReadyForPickup' ? 'bg-indigo-100 text-indigo-800' :
                                r.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                                r.status === 'ProblemReported' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800';

            let actions = '';
            if (r.status === 'Accepted' || r.status === 'ReadyForPickup') {
                actions = `
                    <div class="flex flex-wrap items-center gap-2">
                        <button onclick="markReservationCompleted(${r.id})" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                            <i class="fa-solid fa-check ${isAr ? 'ml-1' : 'mr-1'}"></i> ${dict.confirmCollected}
                        </button>
                        <button onclick="openReportProblemModal(${r.id})" class="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200">
                            ${dict.reportIssue}
                        </button>
                        <button onclick="cancelReservation(${r.id})" class="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200">
                            ${dict.cancel}
                        </button>
                    </div>
                `;
            } else if (r.status === 'Pending') {
                actions = `
                    <button onclick="cancelReservation(${r.id})" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200">
                        ${dict.withdrawRequest}
                    </button>
                `;
            } else if (r.status === 'Completed') {
                if (!r.hasCharityReviewed) {
                    actions = `
                        <button onclick="openReviewModal(${r.id}, '${escapeHtml(r.providerOrganization)}')" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs">
                            <i class="fa-solid fa-star ${isAr ? 'ml-1' : 'mr-1'}"></i> ${dict.leaveReview}
                        </button>
                    `;
                } else {
                    actions = `<span class="text-xs text-emerald-600 font-semibold"><i class="fa-solid fa-circle-check ${isAr ? 'ml-1' : 'mr-1'}"></i> ${dict.reviewed}</span>`;
                }
            }

            return `
                <div class="p-5 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadge}">${formatStatus(r.status)}</span>
                            <span class="text-xs font-bold text-slate-500">${escapeHtml(r.quantity)} ${escapeHtml(r.unitOfMeasurement)}</span>
                        </div>
                        <h4 class="font-heading font-bold text-base text-slate-900">${escapeHtml(r.foodName)}</h4>
                        <div class="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            <span><i class="fa-solid fa-store mr-1 text-amber-500"></i> ${escapeHtml(r.providerOrganization)}</span>
                            <span><i class="fa-solid fa-envelope mr-1 text-slate-400"></i> ${escapeHtml(r.providerEmail)}</span>
                        </div>
                        ${r.confirmedLocation ? `
                            <div class="mt-2 text-xs bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 text-indigo-900">
                                <div class="font-bold flex items-center"><i class="fa-solid fa-location-dot text-indigo-600 mr-1.5"></i> ${escapeHtml(r.confirmedLocation)}</div>
                                <div class="text-[11px] text-indigo-700 mt-0.5">Scheduled Pickup: <strong>${new Date(r.pickupDateTime).toLocaleString()}</strong></div>
                            </div>
                        ` : ''}
                        ${r.problemDescription ? `<div class="mt-2 text-xs bg-rose-50 p-2 rounded-xl border border-rose-100 text-rose-800"><strong>Problem Reported:</strong> ${escapeHtml(r.problemDescription)}</div>` : ''}
                    </div>
                    <div class="shrink-0 flex items-center justify-end">
                        ${actions}
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error('Error fetching charity reservations:', err);
    }
}

async function markReservationCompleted(id) {
    if (!confirm('Confirm that your team has collected and verified this food donation?')) return;
    try {
        const res = await fetch(`${API_BASE}/reservations/${id}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const data = await res.json();
        if (!res.ok) {
            showToast('Action Failed', data.message || 'Error completing reservation.', 'error');
            return;
        }

        showToast('Donation Collected!', 'Thank you! The redistribution record is marked as completed.', 'success');
        loadCharityReservations();
        loadCharityStats();

        openReviewModal(id, data.providerOrganization || 'Food Provider');

    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

async function cancelReservation(id) {
    const reason = prompt('Please specify a cancellation reason:');
    if (!reason) return;

    try {
        const res = await fetch(`${API_BASE}/reservations/${id}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ reason })
        });
        const data = await res.json();
        if (!res.ok) {
            showToast('Cancellation Failed', data.message || 'Cannot cancel reservation.', 'error');
            return;
        }

        showToast('Cancelled', 'Reservation cancelled. The food listing has been restored to Available status.', 'info');
        loadCharityReservations();
        loadCharityStats();
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

function openReportProblemModal(id) {
    document.getElementById('reportProblemReservationId').value = id;
    document.getElementById('reportProblemText').value = '';
    document.getElementById('reportProblemModal').classList.remove('hidden');
}

function closeReportProblemModal() {
    document.getElementById('reportProblemModal').classList.add('hidden');
}

async function handleReportProblemSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('reportProblemReservationId').value;
    const problemDescription = document.getElementById('reportProblemText').value;

    try {
        const res = await fetch(`${API_BASE}/reservations/${id}/report-problem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ problemDescription })
        });
        if (!res.ok) {
            const data = await res.json();
            showToast('Failed', data.message, 'error');
            return;
        }

        closeReportProblemModal();
        showToast('Problem Reported', 'Notification dispatched to provider and flagged for administrator review.', 'warning');
        loadCharityReservations();
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

function openReviewModal(reservationId, partnerName) {
    document.getElementById('reviewReservationId').value = reservationId;
    document.getElementById('reviewModalSubtitle').textContent = `Rate your experience collaborating with ${partnerName}`;
    setReviewRating(5);
    document.getElementById('reviewComment').value = '';
    document.getElementById('reviewModal').classList.remove('hidden');
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.add('hidden');
}

function setReviewRating(rating) {
    document.getElementById('reviewRatingValue').value = rating;
    document.querySelectorAll('.star-btn').forEach(star => {
        const val = parseInt(star.dataset.value);
        if (val <= rating) {
            star.className = 'fa-solid fa-star star-btn text-amber-400';
        } else {
            star.className = 'fa-solid fa-star star-btn text-slate-200';
        }
    });
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    const reservationId = parseInt(document.getElementById('reviewReservationId').value);
    const rating = parseInt(document.getElementById('reviewRatingValue').value);
    const comment = document.getElementById('reviewComment').value;

    try {
        const res = await fetch(`${API_BASE}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ reservationId, rating, comment })
        });
        const data = await res.json();
        if (!res.ok) {
            showToast('Review Failed', data.message || 'Cannot submit review.', 'error');
            return;
        }

        closeReviewModal();
        showToast('Review Posted!', 'Your evaluation has been published to the partner profile.', 'success');
        if (currentView === 'charity') loadCharityReservations();
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

async function loadAdminPortal() {
    if (!currentUser || currentUser.role !== 'Admin') {
        const isAr = currentLang === 'ar';
        showToast(isAr ? 'ØªÙ†Ø¨ÙŠÙ‡ Ø£Ù…Ù†ÙŠ' : 'Administrator Required', isAr ? 'ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø´Ø±Ù.' : 'Please switch to the Administrator profile.', 'warning');
        navigateTo('landing');
        return;
    }

    await loadAdminStats();
    await loadAdminVerifications();
    await loadAdminUsers();
    await loadAdminModeration();
    await loadAdminAuditLogs();
}

async function loadAdminStats() {
    if (!currentUser) return;
    try {
        const res = await fetch(`${API_BASE}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            const data = await res.json();
            document.getElementById('adminStatUsers').textContent = data.totalUsers;
            document.getElementById('adminStatProviders').textContent = data.totalProviders;
            document.getElementById('adminStatCharities').textContent = data.totalCharities;
            document.getElementById('adminStatPendingVerifications').textContent = data.pendingVerifications;
            document.getElementById('adminBadgeVerifications').textContent = data.pendingVerifications;
            document.getElementById('adminStatCompleted').textContent = data.completedDonations;
            document.getElementById('adminStatRedistributed').textContent = `${data.totalRedistributedQuantity} units`;
            document.getElementById('adminStatReports').textContent = data.reportedListingsCount + data.reportedReviewsCount + data.reportedProblemsCount;
        }
    } catch (err) {
        console.error('Error fetching admin dashboard:', err);
    }
}

async function loadAdminVerifications() {
    if (!currentUser) return;
    const container = document.getElementById('adminVerificationList');
    try {
        const res = await fetch(`${API_BASE}/admin/users?isVerified=false`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const users = await res.json();
        const pending = users.filter(u => u.userType !== 3);

        const dict = i18nDict[currentLang] || i18nDict.en;
        const isAr = currentLang === 'ar';

        if (!pending || pending.length === 0) {
            container.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">${isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª ØªÙˆØ«ÙŠÙ‚ Ù…Ø¹Ù„Ù‚Ø© Ø­Ø§Ù„ÙŠØ§Ù‹. Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†Ø¸Ù…Ø§Øª Ù…Ø¹ØªÙ…Ø¯Ø©.' : 'No pending verification requests at this time. All organizations are cleared.'}</div>`;
            return;
        }

        container.innerHTML = pending.map(u => `
            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.userType === 1 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
                            ${u.userType === 1 ? (isAr ? 'Ù…Ø²ÙˆØ¯ Ø·Ø¹Ø§Ù…' : 'Provider') : (isAr ? 'Ø¬Ù…Ø¹ÙŠØ© Ø®ÙŠØ±ÙŠØ©' : 'Charity')}: ${escapeHtml(u.specificType)}
                        </span>
                        <span class="text-xs text-slate-400">${isAr ? 'ØªØ§Ø±ÙŠØ® Ø§Ù„ØªØ³Ø¬ÙŠÙ„' : 'Registered'} ${new Date(u.createdAt).toLocaleDateString(isAr ? 'ar-EG' : [])}</span>
                    </div>
                    <h4 class="font-heading font-bold text-sm text-slate-900 dark:text-slate-100">${escapeHtml(u.organizationName)} (${escapeHtml(u.fullName)})</h4>
                    <div class="text-xs text-slate-600 dark:text-slate-400 mt-0.5"><i class="fa-solid fa-location-dot ${isAr ? 'ml-1' : 'mr-1'} text-slate-400"></i> ${escapeHtml(u.organizationAddress)} â€¢ ${escapeHtml(u.email)}</div>
                    ${u.targetCommunityDescription ? `<div class="text-[11px] text-slate-500 mt-1.5 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700"><strong>${isAr ? 'Ø§Ù„ÙØ¦Ø§Øª Ø§Ù„Ù…Ø³ØªÙÙŠØ¯Ø©:' : 'Served Population:'}</strong> ${escapeHtml(u.targetCommunityDescription)}</div>` : ''}
                </div>
                <div class="shrink-0 flex items-center space-x-2">
                    <button onclick="verifyOrganization('${u.id}', true)" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                        <i class="fa-solid fa-check ${isAr ? 'ml-1' : 'mr-1'}"></i> ${dict.approve}
                    </button>
                    <button onclick="verifyOrganization('${u.id}', false)" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-100 border border-rose-200">
                        ${dict.reject}
                    </button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error fetching verifications:', err);
    }
}

async function verifyOrganization(userId, isApproved) {
    try {
        const res = await fetch(`${API_BASE}/admin/users/${userId}/verify?approve=${isApproved}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            showToast('Verification Updated', isApproved ? 'Organization approved.' : 'Verification rejected.', 'success');
            loadAdminVerifications();
            loadAdminStats();
            loadAdminAuditLogs();
        }
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

async function loadAdminUsers() {
    if (!currentUser) return;
    const search = document.getElementById('adminUserSearch')?.value || '';
    const userType = document.getElementById('adminUserTypeFilter')?.value || '';
    const status = document.getElementById('adminUserStatusFilter')?.value || '';
    const tbody = document.getElementById('adminUsersTableBody');
    const dict = i18nDict[currentLang] || i18nDict.en;
    const isAr = currentLang === 'ar';

    const params = new URLSearchParams();
    if (search) params.append('searchTerm', search);
    if (userType) params.append('userType', userType);
    if (status) params.append('status', status);

    try {
        const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const users = await res.json();

        tbody.innerHTML = users.map(u => {
            const isSuspended = u.status === 2 || u.status === 'Suspended';
            const statusBadge = isSuspended ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800';
            const verifiedBadge = u.isVerified ? `<span class="text-emerald-600"><i class="fa-solid fa-circle-check"></i> ${isAr ? 'Ù…ÙˆØ«Ù‚' : 'Verified'}</span>` : `<span class="text-amber-500"><i class="fa-solid fa-clock"></i> ${isAr ? 'Ù…Ø¹Ù„Ù‚' : 'Pending'}</span>`;

            let toggleAction = '';
            if (currentUser && (u.id === currentUser.userId || u.email === currentUser.email)) {
                toggleAction = `<span class="text-xs text-slate-400 italic">${isAr ? 'Ø­Ø³Ø§Ø¨Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ' : 'Current Account'}</span>`;
            } else if (isSuspended) {
                toggleAction = `<button onclick="setUserStatus('${u.id}', false)" class="px-2.5 py-1 text-xs rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200">${dict.reactivate}</button>`;
            } else {
                toggleAction = `<button onclick="setUserStatus('${u.id}', true)" class="px-2.5 py-1 text-xs rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200">${dict.suspend}</button>`;
            }

            const uTypeName = u.userType === 1 ? (isAr ? 'Ù…Ø²ÙˆØ¯ Ø·Ø¹Ø§Ù…' : 'Provider') : u.userType === 2 ? (isAr ? 'Ø¬Ù…Ø¹ÙŠØ© Ø®ÙŠØ±ÙŠØ©' : 'Charity') : (isAr ? 'Ù…Ø´Ø±Ù' : 'Admin');

            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    <td class="px-4 py-3">
                        <div class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(u.organizationName)}</div>
                        <div class="text-xs text-slate-500">${escapeHtml(u.fullName)} â€¢ ${escapeHtml(u.email)}</div>
                    </td>
                    <td class="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">${uTypeName} (${escapeHtml(u.specificType)})</td>
                    <td class="px-4 py-3 text-xs font-semibold">${verifiedBadge}</td>
                    <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge}">${isSuspended ? (isAr ? 'Ù…Ø¬Ù…Ù‘Ø¯' : 'Suspended') : (isAr ? 'Ù†Ø´Ø·' : 'Active')}</span></td>
                    <td class="px-4 py-3 ${isAr ? 'text-left' : 'text-right'}">${toggleAction}</td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error('Error fetching admin users:', err);
    }
}

async function setUserStatus(userId, suspend) {
    if (!confirm(suspend ? 'Suspend this account from accessing platform features?' : 'Reactivate this account?')) return;
    try {
        const res = await fetch(`${API_BASE}/admin/users/${userId}/status?suspend=${suspend}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            showToast('Account Status Updated', suspend ? 'User suspended.' : 'User reactivated.', 'info');
            loadAdminUsers();
            loadAdminAuditLogs();
        } else {
            const errData = await res.json().catch(() => ({}));
            showToast('Operation Blocked', errData.message || 'Failed to update user status.', 'warning');
        }
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

function openCreateAdminModal() {
    const modal = document.getElementById('createAdminModal');
    if (!modal) return;
    document.getElementById('newAdminFullName').value = '';
    document.getElementById('newAdminEmail').value = '';
    document.getElementById('newAdminDepartment').value = '';
    document.getElementById('newAdminPhone').value = '';
    document.getElementById('newAdminPassword').value = '';
    modal.classList.remove('hidden');
}

function closeCreateAdminModal() {
    const modal = document.getElementById('createAdminModal');
    if (modal) modal.classList.add('hidden');
}

async function handleCreateAdminSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;
    const isAr = currentLang === 'ar';

    const submitBtn = document.getElementById('btnSubmitNewAdmin');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> ${isAr ? 'Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡...' : 'Creating...'}`;
    }

    const payload = {
        fullName: document.getElementById('newAdminFullName').value.trim(),
        email: document.getElementById('newAdminEmail').value.trim(),
        department: document.getElementById('newAdminDepartment').value.trim(),
        phoneNumber: document.getElementById('newAdminPhone').value.trim(),
        password: document.getElementById('newAdminPassword').value
    };

    try {
        const res = await fetch(`${API_BASE}/admin/create-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            closeCreateAdminModal();
            showToast(
                isAr ? 'ØªÙ… Ø¨Ù†Ø¬Ø§Ø­' : 'Success',
                isAr ? `ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø´Ø±Ù (${payload.fullName}) Ø¨Ù†Ø¬Ø§Ø­.` : `Administrator account for '${payload.fullName}' created successfully.`,
                'success'
            );
            await loadAdminStats();
            await loadAdminUsers();
            await loadAdminAuditLogs();
        } else {
            const errData = await res.json().catch(() => ({}));
            showToast(
                isAr ? 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡' : 'Creation Failed',
                errData.message || (isAr ? 'ØªØ¹Ø°Ø± Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø´Ø±Ù. ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª.' : 'Failed to create administrator.'),
                'error'
            );
        }
    } catch (err) {
        showToast('Error', err.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

async function loadAdminModeration() {
    if (!currentUser) return;
    const isAr = currentLang === 'ar';
    try {
        const [listingsRes, reviewsRes, problemsRes] = await Promise.all([
            fetch(`${API_BASE}/admin/reported-listings`, { headers: { 'Authorization': `Bearer ${currentUser.token}` } }),
            fetch(`${API_BASE}/admin/reported-reviews`, { headers: { 'Authorization': `Bearer ${currentUser.token}` } }),
            fetch(`${API_BASE}/admin/problem-reports`, { headers: { 'Authorization': `Bearer ${currentUser.token}` } })
        ]);

        const listings = await listingsRes.json();
        const reviews = await reviewsRes.json();
        const problems = await problemsRes.json();

        const lContainer = document.getElementById('adminReportedListingsContainer');
        lContainer.innerHTML = listings.length === 0 ? `<div class="text-slate-400">${isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¹Ø±ÙˆØ¶ ØªØ¨Ø±Ø¹ Ù…Ø¨Ù„Ù‘Øº Ø¹Ù†Ù‡Ø§.' : 'No reported listings.'}</div>` : listings.map(l => `
            <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <div class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(l.foodName)}</div>
                <div class="text-rose-600 mt-1">${isAr ? 'Ø³Ø¨Ø¨ Ø§Ù„Ø¨Ù„Ø§Øº:' : 'Reason:'} ${escapeHtml(l.reportReason || (isAr ? 'ÙØ­Øµ ÙˆÙ…Ø±Ø§Ø¬Ø¹Ø©' : 'Policy check'))}</div>
                <div class="mt-2 flex ${isAr ? 'justify-start' : 'justify-end'}">
                    <button onclick="removeListingByAdmin(${l.id})" class="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition">${isAr ? 'Ø­Ø°Ù Ø§Ù„ØªØ¨Ø±Ø¹' : 'Remove Listing'}</button>
                </div>
            </div>
        `).join('');

        const rContainer = document.getElementById('adminReportedReviewsContainer');
        rContainer.innerHTML = reviews.length === 0 ? `<div class="text-slate-400">${isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ù…Ø¨Ù„Ù‘Øº Ø¹Ù†Ù‡Ø§.' : 'No reported reviews.'}</div>` : reviews.map(r => `
            <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <div class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(r.reviewerName)}: â­ ${r.rating}</div>
                <div class="text-slate-600 dark:text-slate-300 italic mt-1">"${escapeHtml(r.comment || (isAr ? 'Ø¨Ø¯ÙˆÙ† ØªØ¹Ù„ÙŠÙ‚' : 'No text'))}"</div>
                <div class="text-rose-600 mt-1">${isAr ? 'Ø³Ø¨Ø¨ Ø§Ù„Ø¨Ù„Ø§Øº:' : 'Reason:'} ${escapeHtml(r.reportReason || (isAr ? 'Ù…Ø­ØªÙˆÙ‰ ØºÙŠØ± Ù„Ø§Ø¦Ù‚' : 'Inappropriate'))}</div>
                <div class="mt-2 flex ${isAr ? 'justify-start' : 'justify-end'}">
                    <button onclick="removeReviewByAdmin(${r.id})" class="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition">${isAr ? 'Ø­Ø°Ù Ø§Ù„ØªÙ‚ÙŠÙŠÙ…' : 'Delete Review'}</button>
                </div>
            </div>
        `).join('');

        const pContainer = document.getElementById('adminProblemReportsContainer');
        pContainer.innerHTML = problems.length === 0 ? `<div class="text-slate-400">${isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†Ø²Ø§Ø¹Ø§Øª Ø§Ø³ØªÙ„Ø§Ù… Ø­Ø§Ù„ÙŠØ©.' : 'No active pickup disputes.'}</div>` : problems.map(p => `
            <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <div class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(p.foodName)}</div>
                <div class="text-xs text-slate-500">${escapeHtml(p.charityOrganization)} ${isAr ? 'Ø¶Ø¯' : 'vs'} ${escapeHtml(p.providerOrganization)}</div>
                <div class="text-rose-600 mt-1">${escapeHtml(p.problemDescription)}</div>
                <div class="mt-2 flex ${isAr ? 'justify-start' : 'justify-end'}">
                    <button onclick="resolveProblemByAdmin(${p.id})" class="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">${isAr ? 'Ø­Ù„ Ø§Ù„Ù†Ø²Ø§Ø¹' : 'Resolve Dispute'}</button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error fetching admin moderation items:', err);
    }
}

async function removeListingByAdmin(id) {
    const isAr = currentLang === 'ar';
    const reason = prompt(isAr ? 'ÙŠØ±Ø¬Ù‰ ÙƒØªØ§Ø¨Ø© Ø³Ø¨Ø¨ Ø§Ù„Ø­Ø°Ù Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠ Ù„Ù„ØªØ¨Ø±Ø¹:' : 'Specify administrative removal reason (FR8.7):');
    if (!reason) return;
    try {
        const res = await fetch(`${API_BASE}/admin/listings/${id}/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ reason })
        });
        if (res.ok) {
            showToast('Listing Removed', 'Item removed and reason logged to AuditLog.', 'info');
            loadAdminModeration();
            loadAdminAuditLogs();
        }
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

async function removeReviewByAdmin(id) {
    const isAr = currentLang === 'ar';
    const reason = prompt(isAr ? 'ÙŠØ±Ø¬Ù‰ ÙƒØªØ§Ø¨Ø© Ø³Ø¨Ø¨ Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„ØªÙ‚ÙŠÙŠÙ…:' : 'Specify administrative review deletion reason:');
    if (!reason) return;
    try {
        const res = await fetch(`${API_BASE}/admin/reviews/${id}/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ reason })
        });
        if (res.ok) {
            showToast('Review Removed', 'Review deleted and reason logged.', 'info');
            loadAdminModeration();
            loadAdminAuditLogs();
        }
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

async function resolveProblemByAdmin(id) {
    const isAr = currentLang === 'ar';
    const notes = prompt(isAr ? 'ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ù…Ù„Ø§Ø­Ø¸Ø§Øª ÙˆÙ‚Ø±Ø§Ø± Ø­Ù„ Ù‡Ø°Ø§ Ø§Ù„Ù†Ø²Ø§Ø¹:' : 'Enter resolution notes for this problem dispute:');
    if (!notes) return;
    try {
        const res = await fetch(`${API_BASE}/admin/problems/${id}/resolve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ reason: notes })
        });
        if (res.ok) {
            showToast('Report Resolved', 'Pickup problem report marked as resolved.', 'success');
            loadAdminModeration();
            loadAdminAuditLogs();
        }
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

async function loadAdminAuditLogs() {
    if (!currentUser) return;
    const isAr = currentLang === 'ar';
    const tbody = document.getElementById('adminAuditTableBody');
    try {
        const res = await fetch(`${API_BASE}/admin/audit-logs?take=50`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const logs = await res.json();
        if (!logs || logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400 text-xs">${isAr ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø³Ø¬Ù„Ø§Øª ØªØ¯Ù‚ÙŠÙ‚ Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.' : 'No audit records yet.'}</td></tr>`;
            return;
        }

        const actionTranslations = {
            'VerifyOrganization': 'ØªÙˆØ«ÙŠÙ‚ Ù…Ø¤Ø³Ø³Ø©',
            'RejectOrganization': 'Ø±ÙØ¶ Ù…Ø¤Ø³Ø³Ø©',
            'SuspendUser': 'ØªØ¬Ù…ÙŠØ¯ Ù…Ø³ØªØ®Ø¯Ù…',
            'ReactivateUser': 'ØªÙØ¹ÙŠÙ„ Ù…Ø³ØªØ®Ø¯Ù…',
            'RemoveListing': 'Ø­Ø°Ù ØªØ¨Ø±Ø¹',
            'RemoveReview': 'Ø­Ø°Ù ØªÙ‚ÙŠÙŠÙ…',
            'ResolveProblem': 'Ø­Ù„ Ù†Ø²Ø§Ø¹ Ø§Ø³ØªÙ„Ø§Ù…'
        };

        tbody.innerHTML = logs.map(l => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <td class="px-4 py-2.5 text-slate-400 font-mono">${new Date(l.timestamp).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</td>
                <td class="px-4 py-2.5 font-bold text-slate-700 dark:text-slate-200">${escapeHtml(l.adminName)}</td>
                <td class="px-4 py-2.5 font-semibold text-indigo-700 dark:text-indigo-400">${escapeHtml(isAr && actionTranslations[l.action] ? actionTranslations[l.action] : l.action)}</td>
                <td class="px-4 py-2.5 text-slate-500 dark:text-slate-400">${escapeHtml(l.targetEntity)} #${escapeHtml(l.targetId)}</td>
                <td class="px-4 py-2.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">${escapeHtml(l.details)}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error fetching audit logs:', err);
    }
}

function switchAdminTab(tab) {
    ['verifications', 'users', 'moderation', 'audit'].forEach(t => {
        document.getElementById(`adminTab${t.charAt(0).toUpperCase() + t.slice(1)}`).classList.add('hidden');
        document.getElementById(`atab-${t}`).className = 'pb-3 text-sm font-semibold text-slate-500 hover:text-slate-800 border-b-2 border-transparent shrink-0';
    });
    document.getElementById(`adminTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.remove('hidden');
    document.getElementById(`atab-${tab}`).className = 'pb-3 text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 shrink-0';
}

async function loadImpactStats() {
    try {
        const res = await fetch(`${API_BASE}/reports/platform`);
        const stats = await res.json();

        document.getElementById('impactRedistributedQuantity').textContent = stats.totalFoodRedistributedQuantity;
        document.getElementById('impactCompletedDonations').textContent = stats.totalCompletedDonations;
        document.getElementById('impactActiveNetwork').textContent = stats.totalRegisteredProviders + stats.totalRegisteredCharities;

        const catLabels = Object.keys(stats.redistributionByCategory || {});
        const catValues = Object.values(stats.redistributionByCategory || {});

        const ctxCat = document.getElementById('categoryChart').getContext('2d');
        if (categoryChartInstance) categoryChartInstance.destroy();

        categoryChartInstance = new Chart(ctxCat, {
            type: 'doughnut',
            data: {
                labels: catLabels.map(formatCategory),
                datasets: [{
                    data: catValues.length ? catValues : [40, 25, 35],
                    backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });

        const months = (stats.monthlyTrends || []).map(m => m.monthName);
        const quantities = (stats.monthlyTrends || []).map(m => m.redistributedQuantity);

        const ctxTrend = document.getElementById('monthlyTrendChart').getContext('2d');
        if (monthlyChartInstance) monthlyChartInstance.destroy();

        monthlyChartInstance = new Chart(ctxTrend, {
            type: 'bar',
            data: {
                labels: months.length ? months : ['Past Month', 'Current Month'],
                datasets: [{
                    label: 'Redistributed Food Quantity (Units)',
                    data: quantities.length ? quantities : [60, stats.totalFoodRedistributedQuantity],
                    backgroundColor: '#10b981',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });

    } catch (err) {
        console.error('Error fetching impact stats:', err);
    }
}

function toggleNotificationDropdown() {
    const d = document.getElementById('notificationDropdown');
    d.classList.toggle('hidden');
    if (!d.classList.contains('hidden')) {
        loadNotifications();
    }
}

async function loadNotifications() {
    if (!currentUser) return;
    const listContainer = document.getElementById('notificationList');
    const badge = document.getElementById('unreadBadge');

    try {
        const [listRes, countRes] = await Promise.all([
            fetch(`${API_BASE}/notifications`, { headers: { 'Authorization': `Bearer ${currentUser.token}` } }),
            fetch(`${API_BASE}/notifications/unread-count`, { headers: { 'Authorization': `Bearer ${currentUser.token}` } })
        ]);

        const notifications = await listRes.json();
        const { count } = await countRes.json();

        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

        if (!notifications || notifications.length === 0) {
            listContainer.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">No notifications yet.</div>`;
            return;
        }

        listContainer.innerHTML = notifications.map(n => `
            <div class="p-3.5 hover:bg-slate-50 transition flex items-start space-x-3 cursor-pointer ${!n.isRead ? 'bg-emerald-50/40' : ''}" onclick="markNotificationRead(${n.id})">
                <div class="w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-emerald-500' : 'bg-transparent'}"></div>
                <div class="flex-1">
                    <div class="font-bold text-xs text-slate-800">${escapeHtml(n.title)}</div>
                    <div class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">${escapeHtml(n.message)}</div>
                    <div class="text-[10px] text-slate-400 mt-1">${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error fetching notifications:', err);
    }
}

async function markNotificationRead(id) {
    if (!currentUser) return;
    try {
        await fetch(`${API_BASE}/notifications/${id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        loadNotifications();
    } catch (err) {}
}

async function markAllNotificationsRead() {
    if (!currentUser) return;
    try {
        await fetch(`${API_BASE}/notifications/mark-all-read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        loadNotifications();
    } catch (err) {}
}

function prependNotificationItem(n) {
    const listContainer = document.getElementById('notificationList');
    if (!listContainer) return;

    const itemHtml = `
        <div class="p-3.5 hover:bg-slate-50 transition flex items-start space-x-3 cursor-pointer bg-emerald-50/60" onclick="markNotificationRead(${n.id})">
            <div class="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-emerald-500 animate-ping"></div>
            <div class="flex-1">
                <div class="font-bold text-xs text-slate-800">${escapeHtml(n.title)}</div>
                <div class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">${escapeHtml(n.message)}</div>
                <div class="text-[10px] text-slate-400 mt-1">Just now</div>
            </div>
        </div>
    `;
    listContainer.insertAdjacentHTML('afterbegin', itemHtml);
}

function openAuthModal(tab = 'login') {
    document.getElementById('authModal').classList.remove('hidden');
    setAuthTab(tab);
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function setAuthTab(tab) {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('regProviderForm').classList.add('hidden');
    document.getElementById('regCharityForm').classList.add('hidden');

    ['login', 'reg-provider', 'reg-charity'].forEach(t => {
        document.getElementById(`atab-${t}`).className = 'py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition';
    });

    if (tab === 'login') {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('atab-login').className = 'py-1.5 rounded-lg bg-white text-slate-800 shadow-sm transition';
        document.getElementById('authModalTitle').textContent = currentLang === 'ar' ? 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¥Ù„Ù‰ FoodBridge' : 'Sign In to FoodBridge';
    } else if (tab === 'reg-provider') {
        document.getElementById('regProviderForm').classList.remove('hidden');
        document.getElementById('atab-reg-provider').className = 'py-1.5 rounded-lg bg-white text-slate-800 shadow-sm transition';
        document.getElementById('authModalTitle').textContent = currentLang === 'ar' ? 'ØªØ³Ø¬ÙŠÙ„ Ù…Ø²ÙˆØ¯ Ø·Ø¹Ø§Ù… Ø¬Ø¯ÙŠØ¯' : 'Register Food Provider';
    } else if (tab === 'reg-charity') {
        document.getElementById('regCharityForm').classList.remove('hidden');
        document.getElementById('atab-reg-charity').className = 'py-1.5 rounded-lg bg-white text-slate-800 shadow-sm transition';
        document.getElementById('authModalTitle').textContent = currentLang === 'ar' ? 'ØªØ³Ø¬ÙŠÙ„ Ø¬Ù…Ø¹ÙŠØ© Ø®ÙŠØ±ÙŠØ© Ø¬Ø¯ÙŠØ¯Ø©' : 'Register Charitable Organization';
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('Missing Fields', 'Please enter your email and password.', 'warning');
        return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
    const success = await performLogin(email, password);
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
    if (success) closeAuthModal();
}

async function handleRegisterProviderSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    const password = document.getElementById('regPPassword').value;
    const confirmPassword = document.getElementById('regPConfirmPassword')?.value;

    if (confirmPassword !== undefined && password !== confirmPassword) {
        showToast('Password Mismatch', 'Passwords do not match.', 'error');
        return;
    }

    const payload = {
        fullName: document.getElementById('regPFullName').value.trim(),
        organizationName: document.getElementById('regPOrgName').value.trim(),
        specificType: document.getElementById('regPSpecificType').value,
        email: document.getElementById('regPEmail').value.trim(),
        organizationAddress: document.getElementById('regPAddress').value.trim(),
        password
    };

    if (!payload.fullName || !payload.organizationName || !payload.email || !payload.password || !payload.organizationAddress) {
        showToast('Missing Fields', 'Please fill in all required fields.', 'warning');
        return;
    }

    try {
        if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
        const res = await fetch(`${API_BASE}/auth/register-provider`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
            showToast('Registration Error', data.message || 'Registration failed. Please try again.', 'error');
            return;
        }

        currentUser = data;
        localStorage.setItem('foodbridge_user', JSON.stringify(currentUser));
        updateAuthUI();
        closeAuthModal();
        if (signalrConnection) await signalrConnection.stop();
        await initSignalR();
        showToast('Account Created! ðŸŽ‰', 'Welcome to FoodBridge! Please check your email to verify your account, then await admin approval.', 'success');
        navigateTo('provider');
    } catch (err) {
        showToast('Error', 'Unable to connect. Please try again.', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Create Provider Account'; }
    }
}

async function handleRegisterCharitySubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    const password = document.getElementById('regCPassword').value;
    const confirmPassword = document.getElementById('regCConfirmPassword')?.value;

    if (confirmPassword !== undefined && password !== confirmPassword) {
        showToast('Password Mismatch', 'Passwords do not match.', 'error');
        return;
    }

    const payload = {
        fullName: document.getElementById('regCFullName').value.trim(),
        organizationName: document.getElementById('regCOrgName').value.trim(),
        specificType: document.getElementById('regCSpecificType').value,
        email: document.getElementById('regCEmail').value.trim(),
        targetCommunityDescription: document.getElementById('regCCommunity').value.trim(),
        organizationAddress: document.getElementById('regCAddress').value.trim(),
        password
    };

    if (!payload.fullName || !payload.organizationName || !payload.email || !payload.password || !payload.organizationAddress) {
        showToast('Missing Fields', 'Please fill in all required fields.', 'warning');
        return;
    }

    try {
        if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
        const res = await fetch(`${API_BASE}/auth/register-charity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
            showToast('Registration Error', data.message || 'Registration failed. Please try again.', 'error');
            return;
        }

        currentUser = data;
        localStorage.setItem('foodbridge_user', JSON.stringify(currentUser));
        updateAuthUI();
        closeAuthModal();
        if (signalrConnection) await signalrConnection.stop();
        await initSignalR();
        showToast('Account Created! ðŸŽ‰', 'Welcome to FoodBridge! You can now browse and reserve surplus food donations.', 'success');
        navigateTo('charity');
    } catch (err) {
        showToast('Error', 'Unable to connect. Please try again.', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Create Charity Account'; }
    }
}

const toastArDict = {
    'Signed Out': 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬',
    'You have been signed out successfully.': 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ Ø¨Ù†Ø¬Ø§Ø­.',
    'Login Failed': 'ÙØ´Ù„ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„',
    'Invalid email or password.': 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£Ùˆ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± ØµØ­ÙŠØ­Ø©.',
    'Welcome back!': 'Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ Ù…Ø¬Ø¯Ø¯Ø§Ù‹!',
    'Error': 'Ø®Ø·Ø£',
    'Unable to connect. Please try again.': 'ØªØ¹Ø°Ø± Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù…. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
    'Unable to fetch listing details.': 'ØªØ¹Ø°Ø± Ø¬Ù„Ø¨ ØªÙØ§ØµÙŠÙ„ Ø§Ù„ØªØ¨Ø±Ø¹.',
    'Charity Required': 'Ù…Ø·Ù„ÙˆØ¨ Ø­Ø³Ø§Ø¨ Ø¬Ù…Ø¹ÙŠØ© Ø®ÙŠØ±ÙŠØ©',
    'Please switch to a Charity account to request food reservations.': 'ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø­Ø³Ø§Ø¨ Ø¬Ù…Ø¹ÙŠØ© Ø®ÙŠØ±ÙŠØ© Ù„Ø·Ù„Ø¨ Ø­Ø¬Ø² Ø§Ù„Ø·Ø¹Ø§Ù….',
    'Reservation Request Blocked': 'ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„Ø­Ø¬Ø²',
    'Reservation Requested!': 'ØªÙ… Ø·Ù„Ø¨ Ø§Ù„Ø­Ø¬Ø² Ø¨Ù†Ø¬Ø§Ø­!',
    'Your reservation request was dispatched to the food provider.': 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„Ø­Ø¬Ø² Ø¥Ù„Ù‰ Ù…Ø²ÙˆØ¯ Ø§Ù„Ø·Ø¹Ø§Ù… ÙˆØ³ÙŠØªÙ„Ù‚Ù‰ Ø¥Ø´Ø¹Ø§Ø±Ø§Ù‹ ÙÙˆØ±ÙŠØ§Ù‹.',
    'Provider Access Only': 'Ù…ØªØ§Ø­ Ù„Ù„Ù…Ø²ÙˆØ¯ÙŠÙ† ÙÙ‚Ø·',
    'Please sign in or switch to a Provider profile.': 'ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø­Ø³Ø§Ø¨ Ù…Ø²ÙˆØ¯ Ø·Ø¹Ø§Ù….',
    'Provider Login Required': 'Ù…Ø·Ù„ÙˆØ¨ Ø­Ø³Ø§Ø¨ Ù…Ø²ÙˆØ¯ Ø·Ø¹Ø§Ù…',
    'Please switch to a Provider profile to create donation listings.': 'ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø­Ø³Ø§Ø¨ Ù…Ø²ÙˆØ¯ Ø·Ø¹Ø§Ù… Ù„Ù†Ø´Ø± Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª.',
    'Submission Failed': 'ÙØ´Ù„Øª Ø§Ù„Ø¹Ù…Ù„ÙŠØ©',
    'Donation Published!': 'ØªÙ… Ù†Ø´Ø± Ø§Ù„ØªØ¨Ø±Ø¹ Ø¨Ù†Ø¬Ø§Ø­!',
    'Your surplus food donation is now discoverable by charities.': 'Ø£ØµØ¨Ø­ ØªØ¨Ø±Ø¹Ùƒ Ù…ØªØ§Ø­Ø§Ù‹ Ø§Ù„Ø¢Ù† Ù„Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ø§Ù„Ø®ÙŠØ±ÙŠØ© Ù„Ø­Ø¬Ø²Ù‡.',
    'Updated': 'ØªÙ… Ø§Ù„ØªØ­Ø¯ÙŠØ«',
    'Listing marked as unavailable.': 'ØªÙ… ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ØªØ¨Ø±Ø¹ ÙƒØºÙŠØ± Ù…ØªØ§Ø­.',
    'Action Failed': 'ÙØ´Ù„Øª Ø§Ù„Ø¹Ù…Ù„ÙŠØ©',
    'Reservation Accepted': 'ØªÙ… Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ø­Ø¬Ø²',
    'Confirmed pickup details transmitted to charity via SignalR.': 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ ØªÙØ§ØµÙŠÙ„ ÙˆÙ…ÙˆØ¹Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ù…Ø¹ØªÙ…Ø¯ Ù„Ù„Ø¬Ù…Ø¹ÙŠØ© ÙÙˆØ±Ø§Ù‹.',
    'Declined': 'ØªÙ… Ø§Ù„Ø±ÙØ¶',
    'Reservation request declined.': 'ØªÙ… Ø±ÙØ¶ Ø·Ù„Ø¨ Ø§Ù„Ø­Ø¬Ø².',
    'Status Updated': 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø­Ø§Ù„Ø©',
    'Food donation marked as ready for pickup.': 'ØªÙ… ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ØªØ¨Ø±Ø¹ ÙƒØ¬Ø§Ù‡Ø² Ù„Ù„Ø§Ø³ØªÙ„Ø§Ù… Ù…Ù† Ù‚Ø¨Ù„ Ø§Ù„Ø¬Ù…Ø¹ÙŠØ©.',
    'Success': 'Ù†Ø¬Ø§Ø­',
    'Food donation marked as completed & collected!': 'ØªÙ… ØªØ£ÙƒÙŠØ¯ Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„ØªØ¨Ø±Ø¹ Ø¨Ù†Ø¬Ø§Ø­ ÙˆØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª.',
    'Reservation Cancelled': 'ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¬Ø²',
    'Problem Reported': 'ØªÙ… Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù…Ø´ÙƒÙ„Ø©',
    'Your pickup problem report has been submitted to platform admins.': 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ø¥Ù„Ù‰ Ù…Ø´Ø±ÙÙŠ Ø§Ù„Ù…Ù†ØµØ© Ù„Ù„ØªØ¯Ù‚ÙŠÙ‚ ÙˆØ§Ù„Ø­Ù„.',
    'Review Submitted': 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ØªÙ‚ÙŠÙŠÙ…',
    'Thank you for your partner feedback!': 'Ø´ÙƒØ±Ø§Ù‹ Ù„Ùƒ Ø¹Ù„Ù‰ Ù…Ø´Ø§Ø±ÙƒØ© ØªÙ‚ÙŠÙŠÙ…Ùƒ Ù„Ù„Ø´Ø±ÙŠÙƒ.',
    'Registration Failed': 'ÙØ´Ù„ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨',
    'Registration Successful!': 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¨Ù†Ø¬Ø§Ø­!',
    'Account Created! ðŸŽ‰': 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¨Ù†Ø¬Ø§Ø­! ðŸŽ‰',
    'Welcome to FoodBridge! You can now browse and reserve surplus food donations.': 'Ø£Ù‡Ù„Ø§Ù‹ Ø¨Ùƒ ÙÙŠ FoodBridge! ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¢Ù† ØªØµÙØ­ ÙˆØ­Ø¬Ø² ØªØ¨Ø±Ø¹Ø§Øª Ø§Ù„Ø·Ø¹Ø§Ù….',
    'Your provider account was created. Please sign in to verify credentials.': 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø²ÙˆØ¯ Ø¨Ù†Ø¬Ø§Ø­. ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„.',
    'Your charity account was created. Please sign in to proceed with verification.': 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø§Ù„Ø¬Ù…Ø¹ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­. ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„.',
    'User Suspended': 'ØªÙ… ØªØ¬Ù…ÙŠØ¯ Ø§Ù„Ø­Ø³Ø§Ø¨',
    'User Reactivated': 'ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨',
    'Organization Verified': 'ØªÙ… ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ù…Ø¤Ø³Ø³Ø©',
    'Organization verification approved successfully.': 'ØªÙ… Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ù…Ø¤Ø³Ø³Ø© Ø¨Ù†Ø¬Ø§Ø­.',
    'Organization Rejected': 'ØªÙ… Ø±ÙØ¶ Ø§Ù„ØªÙˆØ«ÙŠÙ‚',
    'Organization verification rejected.': 'ØªÙ… Ø±ÙØ¶ Ø·Ù„Ø¨ ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ù…Ø¤Ø³Ø³Ø©.',
    'Content Removed': 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ø­ØªÙˆÙ‰',
    'Listing Removed': 'ØªÙ… Ø­Ø°Ù Ø§Ù„ØªØ¨Ø±Ø¹',
    'Item removed and reason logged to AuditLog.': 'ØªÙ… Ø­Ø°Ù Ø§Ù„ØªØ¨Ø±Ø¹ ÙˆØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ø³Ø¨Ø¨ ÙÙŠ Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚.',
    'Review Removed': 'ØªÙ… Ø­Ø°Ù Ø§Ù„ØªÙ‚ÙŠÙŠÙ…',
    'Review deleted and reason logged.': 'ØªÙ… Ø­Ø°Ù Ø§Ù„ØªÙ‚ÙŠÙŠÙ… ÙˆØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ø³Ø¨Ø¨ ÙÙŠ Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚.',
    'Report Resolved': 'ØªÙ… Ø­Ù„ Ø§Ù„Ø¨Ù„Ø§Øº',
    'Pickup problem report marked as resolved.': 'ØªÙ… Ø­Ù„ Ø¨Ù„Ø§Øº Ù…Ø´ÙƒÙ„Ø© Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Ø¨Ù†Ø¬Ø§Ø­.',
    'Dark Mode': 'Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ù„ÙŠÙ„ÙŠ',
    'Light Mode': 'Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ù†Ù‡Ø§Ø±ÙŠ',
    'Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©': 'Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©',
    'Language Changed': 'ØªØºÙŠÙŠØ± Ø§Ù„Ù„ØºØ©'
};

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const isAr = currentLang === 'ar';
    let finalTitle = title;
    let finalMsg = message;

    if (isAr) {
        if (toastArDict[title]) finalTitle = toastArDict[title];
        if (toastArDict[message]) finalMsg = toastArDict[message];
        else if (typeof message === 'string' && message.startsWith('Signed in as ')) {
            finalMsg = 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø§Ø³Ù… ' + message.replace('Signed in as ', '');
        }
    }

    const icon = type === 'success' ? 'fa-circle-check text-emerald-500' :
                 type === 'error' ? 'fa-circle-xmark text-rose-500' :
                 type === 'warning' ? 'fa-triangle-exclamation text-amber-500' : 'fa-bell text-blue-500';

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto max-w-sm w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700 p-4 flex items-start space-x-3 ${isAr ? 'space-x-reverse' : ''} toast-animate-in`;
    
    const dismiss = () => {
        toast.classList.remove('toast-animate-in');
        toast.classList.add('toast-animate-out');
        setTimeout(() => { if (toast.parentElement) toast.remove(); }, 240);
    };

    toast.innerHTML = `
        <i class="fa-solid ${icon} text-lg shrink-0 mt-0.5"></i>
        <div class="flex-1">
            <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100">${escapeHtml(finalTitle)}</h5>
            <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">${escapeHtml(finalMsg)}</p>
        </div>
        <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
            <i class="fa-solid fa-xmark text-xs"></i>
        </button>
    `;

    toast.querySelector('button').onclick = dismiss;
    container.appendChild(toast);
    setTimeout(dismiss, 5000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
