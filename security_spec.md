# Security Specification & Test Scenarios (TDD)

## 1. Data Invariants
- **Authentication Requirement**: Only authenticated users with verified email addresses may read/write data.
- **Relational Ownership**: A project can only be read or written by its authenticated creator (`ownerId == request.auth.uid`). No unauthorized users may read, structure, or inspect other users' projects.
- **Project Schema Validation**: Creation payloads must include valid project properties with strict key boundaries.
- **Temporal Authenticity**: The `createdAt` property must be immutable after initial creation.

## 2. The "Dirty Dozen" Payloads (Verification Cases)

### Identity Spoofing Attacks
1. **Malicious Ownership Spoof (On Create)**:
   - Creating a project with `ownerId` set to another user's UID to place records in their space.
   - *Expected:* `PERMISSION_DENIED`
2. **Identity Takeover (On Update)**:
   - Updating an existing project's `ownerId` from the rightful owner's UID to a malicious UID.
   - *Expected:* `PERMISSION_DENIED`
3. **Anonymized Intrusions**:
   - Creating or writing a project while unauthenticated.
   - *Expected:* `PERMISSION_DENIED`
4. **Email Verification Fraud**:
   - Creating or viewing projects using an unverified email account.
   - *Expected:* `PERMISSION_DENIED`

### Boundary & Type Violations
5. **Project Title Type Injection**:
   - Setting the `projectName` field to an array or integer instead of a valid string size.
   - *Expected:* `PERMISSION_DENIED`
6. **Malicious Title Size Overflow**:
   - Setting a 50KB string as `projectName` to execute Denial Of Wallet exhaustion attacks.
   - *Expected:* `PERMISSION_DENIED`
7. **Phase Index Boundaries (Out of Bounds)**:
   - Setting `currentPhaseIndex` value to `-1` or `15`.
   - *Expected:* `PERMISSION_DENIED`

### Integrity & Immutability Breaches
8. **Immutability Bypass (createdAt Overwrite)**:
   - Changing the original `createdAt` timestamp of a project on update.
   - *Expected:* `PERMISSION_DENIED`
9. **Malicious Extra Fields (Ghost Injection)**:
   - Creating a project containing a ghost property `isAdminApproved: true` to bypass administrative validation.
   - *Expected:* `PERMISSION_DENIED`
10. **Resource Poisoning (Malformed ID)**:
    - Trying to target or create a project with a malicious string ID e.g. `project!!!badchars`.
    - *Expected:* `PERMISSION_DENIED`
11. **Malicious Bulk Scraping**:
    - Querying the complete list of projects without specifying an owner filter matching the current user's UID.
    - *Expected:* `PERMISSION_DENIED`
12. **Tampering with Terminal Sealed States**:
    - Changing contract text or pricing after a contract is officially signed.
    - *Expected:* `PERMISSION_DENIED`
