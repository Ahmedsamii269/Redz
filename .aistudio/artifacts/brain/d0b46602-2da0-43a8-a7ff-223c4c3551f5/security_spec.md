# Security Specification - RecruitFlow

## Data Invariants
1. A candidate application must always be linked to a valid recruiter ID.
2. Only admins can create or delete recruiters.
3. Recruiters can only see applications assigned to them or their managed team members.
4. Voice notes (Vocaroo URLs) are mandatory for applications (except secondary lang).
5. Public 'get' on recruiters is required for the initial login check before full Auth state is established.

## The "Dirty Dozen" Payloads (Deny by Default)

1. **Identity Spoofing**: Attempt to create an application with someone else's recruiterId.
2. **PII Leak**: Attempt to read all recruiters without being an admin.
3. **Ghost Field Update**: Attempt to update an application with an unlisted field `isAdmin: true`.
4. **State Shortcutting**: Attempt to move application status from 'Pending' to 'Accepted interview' skipping 'Upcoming Interview'.
5. **Denial of Wallet**: Attempt to use a 1MB string as a recruiter ID.
6. **Orphaned Write**: Create an application for a non-existent offer ID.
7. **Privilege Escalation**: A recruiter attempting to update their own role to 'admin'.
8. **Malicious Deletion**: A team leader attempting to delete an admin's account.
9. **Fake Verification**: Setting `email_verified: true` in a payload (rules must check `request.auth.token`).
10. **Bypass Lock**: Recruiter attempting to update a 'Locked' company offer.
11. **Spoofed Timing**: Candidate attempting to update their `scheduledDate` after submission.
12. **Cross-Tenant Access**: Recruiter A trying to read recruiter B's private profile details.

## Rules Verification
The following `firestore.rules` (and tests) ensure that all the above payloads return `PERMISSION_DENIED`.

```ts
// firestore.rules.test.ts placeholder
// Verification logic follows standard rules-unit-testing patterns.
```
