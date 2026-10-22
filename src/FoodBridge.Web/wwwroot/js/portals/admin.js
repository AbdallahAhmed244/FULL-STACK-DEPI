async function loadAdminPortal() {
    if (!currentUser || currentUser.role !== 'Admin') {
        const isAr = currentLang === 'ar';
        showToast(isAr ? 'تنبيه أمني' : 'Administrator Required', isAr ? 'يرجى تسجيل الدخول بحساب المشرف.' : 'Please switch to the Administrator profile.', 'warning');
        navigateTo('landing');
        return;
    }

    await loadAdminStats();
    await loadAdminVerifications();
    await loadAdminUsers();
    await loadAdminModeration();
    await loadAdminAuditLogs();
    await loadAdminExpiredListings();
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
            const isAr = currentLang === 'ar';
            document.getElementById('adminStatRedistributed').textContent = `${data.totalRedistributedQuantity} ${isAr ? 'وحدة' : 'units'}`;
            document.getElementById('adminStatReports').textContent = data.reportedListingsCount + data.reportedReviewsCount + data.reportedProblemsCount;
            if (document.getElementById('adminStatWastedQuantity')) {
                document.getElementById('adminStatWastedQuantity').textContent = `${data.totalWastedQuantity} ${isAr ? 'كجم' : 'kg'}`;
            }
            if (document.getElementById('adminStatExpiredCount')) {
                document.getElementById('adminStatExpiredCount').textContent = data.expiredDonationsCount;
            }
            if (document.getElementById('adminBadgeExpiredCount')) {
                document.getElementById('adminBadgeExpiredCount').textContent = data.expiredDonationsCount;
            }
        }
    } catch (err) {
        console.error('Error fetching admin dashboard:', err);
    }
}

async function loadAdminVerifications() {
    if (!currentUser) return;
    const container = document.getElementById('adminVerificationList');
    try {
        const res = await fetch(`${API_BASE}/admin/users?isVerified=false&status=1`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const users = await res.json();
        // Only active unverified users (exclude admins and suspended/rejected users)
        const pending = users.filter(u => u.userType !== 3 && !u.isVerified && (u.status === 1 || u.status === 'Active'));

        const dict = i18nDict[currentLang] || i18nDict.en;
        const isAr = currentLang === 'ar';

        if (!pending || pending.length === 0) {
            container.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">${isAr ? 'لا توجد طلبات توثيق معلقة حالياً. جميع المنظمات معتمدة.' : 'No pending verification requests at this time. All organizations are cleared.'}</div>`;
            return;
        }

        container.innerHTML = pending.map(u => `
            <div id="verif-card-${u.id}" class="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
                <div>
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.userType === 1 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
                            ${u.userType === 1 ? (isAr ? 'مزود طعام' : 'Provider') : (isAr ? 'جمعية خيرية' : 'Charity')}: ${escapeHtml(u.specificType)}
                        </span>
                        <span class="text-xs text-slate-400">${isAr ? 'تاريخ التسجيل' : 'Registered'} ${new Date(u.createdAt).toLocaleDateString(isAr ? 'ar-EG' : [])}</span>
                    </div>
                    <h4 class="font-heading font-bold text-sm text-slate-900 dark:text-slate-100">${escapeHtml(u.organizationName)} (${escapeHtml(u.fullName)})</h4>
                    <div class="text-xs text-slate-600 dark:text-slate-400 mt-0.5"><i class="fa-solid fa-location-dot ${isAr ? 'ml-1' : 'mr-1'} text-slate-400"></i> ${escapeHtml(u.organizationAddress)} • ${escapeHtml(u.email)}</div>
                    ${u.targetCommunityDescription ? `<div class="text-[11px] text-slate-500 mt-1.5 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700"><strong>${isAr ? 'الفئات المستفيدة:' : 'Served Population:'}</strong> ${escapeHtml(u.targetCommunityDescription)}</div>` : ''}
                </div>
                <div class="shrink-0 flex items-center space-x-2">
                    <button onclick="verifyOrganization('${u.id}', true)" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition">
                        <i class="fa-solid fa-check ${isAr ? 'ml-1' : 'mr-1'}"></i> ${dict.approve}
                    </button>
                    <button onclick="verifyOrganization('${u.id}', false)" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-100 border border-rose-200 transition">
                        <i class="fa-solid fa-xmark ${isAr ? 'ml-1' : 'mr-1'}"></i> ${dict.reject}
                    </button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error fetching verifications:', err);
    }
}

async function verifyOrganization(userId, isApproved) {
    const isAr = currentLang === 'ar';
    const confirmPrompt = isApproved
        ? (isAr ? 'هل تريد اعتماد وتوثيق هذه المنظمة رسمياً؟' : 'Approve and verify this organization?')
        : (isAr ? 'هل تريد رفض طلب الاعتماد وتجميد هذا الحساب لمنع دخوله المنصة؟' : 'Reject verification and suspend this account?');

    if (!confirm(confirmPrompt)) return;

    try {
        const res = await fetch(`${API_BASE}/admin/users/${userId}/verify?approve=${isApproved}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            showToast(
                isApproved ? (isAr ? 'تم اعتماد المنظمة' : 'Organization Approved') : (isAr ? 'تم رفض طلب الاعتماد' : 'Verification Rejected'),
                isApproved
                    ? (isAr ? 'تم اعتماد المنظمة وتفعيل حسابها بنجاح.' : 'Organization approved and verified.')
                    : (isAr ? 'تم رفض طلب الاعتماد وتجميد الحساب بنجاح.' : 'Verification rejected and account suspended.'),
                'success'
            );
            await loadAdminVerifications();
            await loadAdminStats();
            await loadAdminUsers();
            await loadAdminAuditLogs();
        } else {
            const errData = await res.json().catch(() => ({}));
            showToast(isAr ? 'خطأ' : 'Error', errData.message || (isAr ? 'تعذر تنفيذ الإجراء' : 'Failed to update verification'), 'error');
        }
    } catch (err) {
        showToast(isAr ? 'خطأ في الاتصال' : 'Connection Error', err.message, 'error');
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
            const verifiedBadge = u.isVerified ? `<span class="text-emerald-600"><i class="fa-solid fa-circle-check"></i> ${isAr ? 'موثق' : 'Verified'}</span>` : `<span class="text-amber-500"><i class="fa-solid fa-clock"></i> ${isAr ? 'معلق' : 'Pending'}</span>`;

            let toggleAction = '';
            if (currentUser && (u.id === currentUser.userId || u.email === currentUser.email)) {
                toggleAction = `<span class="text-xs text-slate-400 italic">${isAr ? 'حسابك الحالي' : 'Current Account'}</span>`;
            } else if (isSuspended) {
                toggleAction = `<button onclick="setUserStatus('${u.id}', false)" class="px-2.5 py-1 text-xs rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200">${dict.reactivate}</button>`;
            } else {
                toggleAction = `<button onclick="setUserStatus('${u.id}', true)" class="px-2.5 py-1 text-xs rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200">${dict.suspend}</button>`;
            }

            const uTypeName = u.userType === 1 ? (isAr ? 'مزود طعام' : 'Provider') : u.userType === 2 ? (isAr ? 'جمعية خيرية' : 'Charity') : (isAr ? 'مشرف' : 'Admin');

            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    <td class="px-4 py-3">
                        <div class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(u.organizationName)}</div>
                        <div class="text-xs text-slate-500">${escapeHtml(u.fullName)} • ${escapeHtml(u.email)}</div>
                    </td>
                    <td class="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">${uTypeName} (${escapeHtml(u.specificType)})</td>
                    <td class="px-4 py-3 text-xs font-semibold">${verifiedBadge}</td>
                    <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge}">${isSuspended ? (isAr ? 'مجمّد' : 'Suspended') : (isAr ? 'نشط' : 'Active')}</span></td>
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
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> ${isAr ? 'جاري الإنشاء...' : 'Creating...'}`;
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
                isAr ? 'تم بنجاح' : 'Success',
                isAr ? `تم إنشاء حساب المشرف (${payload.fullName}) بنجاح.` : `Administrator account for '${payload.fullName}' created successfully.`,
                'success'
            );
            await loadAdminStats();
            await loadAdminUsers();
            await loadAdminAuditLogs();
        } else {
            const errData = await res.json().catch(() => ({}));
            showToast(
                isAr ? 'خطأ في الإنشاء' : 'Creation Failed',
                errData.message || (isAr ? 'تعذر إنشاء حساب المشرف. يرجى التحقق من البيانات.' : 'Failed to create administrator.'),
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
        lContainer.innerHTML = listings.length === 0 ? `<div class="text-slate-400">${isAr ? 'لا توجد عروض تبرع مبلّغ عنها.' : 'No reported listings.'}</div>` : listings.map(l => `
            <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <div class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(l.foodName)}</div>
                <div class="text-rose-600 mt-1">${isAr ? 'سبب البلاغ:' : 'Reason:'} ${escapeHtml(l.reportReason || (isAr ? 'فحص ومراجعة' : 'Policy check'))}</div>
                <div class="mt-2 flex ${isAr ? 'justify-start' : 'justify-end'}">
                    <button onclick="removeListingByAdmin(${l.id})" class="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition">${isAr ? 'حذف التبرع' : 'Remove Listing'}</button>
                </div>
            </div>
        `).join('');

        const rContainer = document.getElementById('adminReportedReviewsContainer');
        rContainer.innerHTML = reviews.length === 0 ? `<div class="text-slate-400">${isAr ? 'لا توجد تقييمات مبلّغ عنها.' : 'No reported reviews.'}</div>` : reviews.map(r => `
            <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <div class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(r.reviewerName)}: ⭐ ${r.rating}</div>
                <div class="text-slate-600 dark:text-slate-300 italic mt-1">"${escapeHtml(r.comment || (isAr ? 'بدون تعليق' : 'No text'))}"</div>
                <div class="text-rose-600 mt-1">${isAr ? 'سبب البلاغ:' : 'Reason:'} ${escapeHtml(r.reportReason || (isAr ? 'محتوى غير لائق' : 'Inappropriate'))}</div>
                <div class="mt-2 flex ${isAr ? 'justify-start' : 'justify-end'}">
                    <button onclick="removeReviewByAdmin(${r.id})" class="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition">${isAr ? 'حذف التقييم' : 'Delete Review'}</button>
                </div>
            </div>
        `).join('');

        const pContainer = document.getElementById('adminProblemReportsContainer');
        pContainer.innerHTML = problems.length === 0 ? `<div class="text-slate-400">${isAr ? 'لا توجد نزاعات استلام حالية.' : 'No active pickup disputes.'}</div>` : problems.map(p => `
            <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <div class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(p.foodName)}</div>
                <div class="text-xs text-slate-500">${escapeHtml(p.charityOrganization)} ${isAr ? 'ضد' : 'vs'} ${escapeHtml(p.providerOrganization)}</div>
                <div class="text-rose-600 mt-1">${escapeHtml(p.problemDescription)}</div>
                <div class="mt-2 flex ${isAr ? 'justify-start' : 'justify-end'}">
                    <button onclick="resolveProblemByAdmin(${p.id})" class="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">${isAr ? 'حل النزاع' : 'Resolve Dispute'}</button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error fetching admin moderation items:', err);
    }
}

async function removeListingByAdmin(id) {
    const isAr = currentLang === 'ar';
    const reason = prompt(isAr ? 'يرجى كتابة سبب الحذف الإداري للتبرع:' : 'Specify administrative removal reason (FR8.7):');
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
    const reason = prompt(isAr ? 'يرجى كتابة سبب حذف هذا التقييم:' : 'Specify administrative review deletion reason:');
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
    const notes = prompt(isAr ? 'يرجى إدخال ملاحظات وقرار حل هذا النزاع:' : 'Enter resolution notes for this problem dispute:');
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
            tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400 text-xs">${isAr ? 'لا توجد سجلات تدقيق حتى الآن.' : 'No audit records yet.'}</td></tr>`;
            return;
        }

        const actionTranslations = {
            'VerifyOrganization': 'توثيق مؤسسة',
            'RejectOrganization': 'رفض مؤسسة',
            'SuspendUser': 'تجميد مستخدم',
            'ReactivateUser': 'تفعيل مستخدم',
            'RemoveListing': 'حذف تبرع',
            'RemoveReview': 'حذف تقييم',
            'ResolveProblem': 'حل نزاع استلام'
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
    ['verifications', 'users', 'moderation', 'audit', 'waste'].forEach(t => {
        document.getElementById(`adminTab${t.charAt(0).toUpperCase() + t.slice(1)}`).classList.add('hidden');
        document.getElementById(`atab-${t}`).className = 'pb-3 text-sm font-semibold text-slate-500 hover:text-slate-800 border-b-2 border-transparent shrink-0';
    });
    document.getElementById(`adminTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.remove('hidden');
    document.getElementById(`atab-${tab}`).className = 'pb-3 text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 shrink-0';

    if (tab === 'verifications') loadAdminVerifications();
    else if (tab === 'users') loadAdminUsers();
    else if (tab === 'moderation') loadAdminModeration();
    else if (tab === 'audit') loadAdminAuditLogs();
    else if (tab === 'waste') loadAdminExpiredListings();
}

async function loadAdminExpiredListings() {
    if (!currentUser) return;
    const isAr = currentLang === 'ar';
    const container = document.getElementById('adminExpiredListingsContainer');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/admin/expired-listings`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const listings = await res.json();

        if (document.getElementById('adminBadgeExpiredCount')) {
            document.getElementById('adminBadgeExpiredCount').textContent = listings.length;
        }

        if (!listings || listings.length === 0) {
            container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs">${isAr ? 'لا توجد تبرعات منتهية الصلاحية حالياً. جميع الفوائض تم توزيعها بنجاح!' : 'No expired surplus items currently found. All donations were redistributed on schedule!'}</div>`;
            return;
        }

        container.innerHTML = listings.map(item => `
            <div class="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:shadow-md">
                <div class="flex items-start space-x-3 rtl:space-x-reverse">
                    <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <h4 class="font-bold text-slate-900 dark:white text-sm">${escapeHtml(item.foodName)}</h4>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">${escapeHtml(formatCategory(item.foodCategory))}</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">${isAr ? 'منتهي الصلاحية' : 'Expired'}</span>
                        </div>
                        <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>${escapeHtml(item.providerOrganization)} (${escapeHtml(item.providerName)})</span>
                            <span class="mx-1">•</span>
                            <span class="font-bold text-amber-700 dark:text-amber-300">${item.quantity} ${escapeHtml(item.unitOfMeasurement)}</span>
                            <span class="mx-1">•</span>
                            <span>${isAr ? 'انتهت المهلة:' : 'Deadline:'} ${new Date(item.pickupDeadline).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                        </div>
                        ${item.reportReason ? `<div class="mt-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50"><i class="fa-solid fa-info-circle text-amber-500 mr-1 rtl:ml-1"></i> ${escapeHtml(item.reportReason)}</div>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-wrap shrink-0">
                    <button onclick="openAdminWasteActionModal(${item.id}, '${escapeHtml(item.foodName).replace(/'/g, "\\'")}', '${escapeHtml(item.providerOrganization || item.providerName).replace(/'/g, "\\'")}', ${item.quantity}, '${escapeHtml(item.unitOfMeasurement).replace(/'/g, "\\'")}')" class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition flex items-center">
                        <i class="fa-solid fa-gavel mr-1.5 rtl:ml-1.5"></i> ${isAr ? 'اتخاذ إجراء رقابي' : 'Enforce Action'}
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error fetching expired listings:', err);
    }
}

function openAdminWasteActionModal(listingId, foodName, providerName, quantity, unit) {
    document.getElementById('wasteActionListingId').value = listingId;
    document.getElementById('wasteActionFoodName').textContent = foodName;
    document.getElementById('wasteActionProviderName').textContent = providerName;
    document.getElementById('wasteActionQuantity').textContent = `${quantity} ${unit}`;
    document.getElementById('wasteActionNotes').value = '';
    document.getElementById('wasteActionType').value = 'WarnProvider';
    document.getElementById('adminWasteActionModal').classList.remove('hidden');
}

function closeAdminWasteActionModal() {
    document.getElementById('adminWasteActionModal').classList.add('hidden');
}

async function handleWasteActionSubmit(event) {
    event.preventDefault();
    if (!currentUser) return;
    const isAr = currentLang === 'ar';
    const listingId = document.getElementById('wasteActionListingId').value;
    const actionType = document.getElementById('wasteActionType').value;
    const notes = document.getElementById('wasteActionNotes').value.trim();

    if (!listingId || !notes) return;

    const btn = document.getElementById('btnSubmitWasteAction');
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/admin/listings/${listingId}/waste-action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ actionType, notes })
        });

        if (res.ok) {
            closeAdminWasteActionModal();
            showToast(
                isAr ? 'تم تطبيق الإجراء بنجاح' : 'Action Executed',
                isAr ? 'تم حفظ الإجراء الإداري وتوثيقه في سجل التدقيق وإشعار الجهة.' : 'Administrative action logged to audit trail and notified to provider.',
                'success'
            );
            await loadAdminStats();
            await loadAdminExpiredListings();
            await loadAdminAuditLogs();
        } else {
            const err = await res.json();
            showToast(isAr ? 'خطأ' : 'Error', err.message || (isAr ? 'تعذر تنفيذ الإجراء' : 'Failed to apply action'), 'error');
        }
    } catch (err) {
        showToast(isAr ? 'خطأ في الاتصال' : 'Connection Error', err.message, 'error');
    } finally {
        btn.disabled = false;
    }
}

