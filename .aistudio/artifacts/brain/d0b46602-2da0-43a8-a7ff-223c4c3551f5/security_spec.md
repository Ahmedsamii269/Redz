# Security Specification - RecruitFlow

## Data Invariants
1. A candidate application must always be linked to a valid recruiter ID.
2. RBAC: Only authorized roles can create/delete recruiters:
   - Account Manager: Full access to manage all roles.
   - Unit Manager: Can manage Recruiter and Team Leader.
   - Team Leader: Can manage Recruiter.
3. Recruiters can only see applications assigned to them or their managed team members.
4. Voice notes (Vocaroo URLs) are mandatory for applications (except secondary lang).
5. Public 'get' on recruiters is required for the initial login check before full Auth state is established.

## The "Dirty Dozen" Payloads (Deny by Default)
... (keep existing) ...
12: Cross-Tenant Access: Recruiter A trying to read recruiter B's private profile details.

## Rules Verification
The `firestore.rules` file now enforces role-based access for recruiter management and other sensitive actions, replacing the previous admin-only restriction.
