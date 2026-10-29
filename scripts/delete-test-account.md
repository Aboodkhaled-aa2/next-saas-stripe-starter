# Safe test-account cleanup

This tool is a single-account, allowlisted cleanup script. It defaults to dry-run and refuses bulk deletion.

## Configure Preview

Run only against the Preview database and test Stripe/provider credentials. In the Preview environment, set:
- `TEST_ACCOUNT_EMAILS` to the one explicitly permitted test email.
- `DATABASE_URL` to the Preview database.
- `STRIPE_API_KEY` to the appropriate test-mode Stripe key if the account has Stripe IDs.
- SignalWire variables only if a SignalWire number is attached.
- `VAPI_PRIVATE_API_KEY` only if the account has a Vapi number to remove.

The target email is passed on the command line; it is not hard-coded in the script.

## Dry-run (default)

```bash
TEST_ACCOUNT_EMAILS="your-test-email@example.com" npx tsx scripts/delete-test-account.ts your-test-email@example.com
```

Review the email, plan, Stripe customer/subscription identifiers, phone number, and related record counts. Dry-run makes no provider or database changes.

## Real deletion

Only after reviewing the dry-run, and only against Preview:

```bash
ALLOW_ACCOUNT_DELETE=true TEST_ACCOUNT_EMAILS="your-test-email@example.com" npx tsx scripts/delete-test-account.ts your-test-email@example.com --confirm
```

Production additionally requires `ALLOW_PROD_DELETE=true`; do not set it for this workflow. The script records a JSONL audit entry in `.test-account-delete-audit.jsonl` (override with `TEST_ACCOUNT_DELETE_AUDIT`). The audit records event/time/actor and non-secret counts; it does not write tokens or API credentials.

## Important provider note

SignalWire number release uses the stored `PhoneNumber.providerId`. Vapi cleanup is attempted only when the schema explicitly identifies a Vapi number ID; the app schema currently stores the AI Phone provider and phone number but does not expose a separate Vapi phone-number ID. Verify provider records in Vapi before deletion if that account uses Vapi. Provider actions happen before the database transaction, so if a later provider operation fails, inspect provider state before retrying.

## Tests

```bash
npm run test:cleanup
```
