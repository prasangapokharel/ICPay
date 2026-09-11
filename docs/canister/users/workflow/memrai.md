# ICPay Canister Management — User Workflow & Architecture

See full documentation and architecture diagrams in [mermaid.md](file:///home/prasanga/Desktop/icppay/docs/canister/users/workflow/mermaid.md).

```mermaid
flowchart TD
    A["1. Sign in with Internet Identity"] --> B["2. Fund Wallet with ICP"]
    B --> C["3. Create Canister on ICPay (/canister/create)"]
    C --> D["4. Deploy Code via dfx --specified-id"]
    D --> E["5. Monitor, Top-up & Snapshot on ICPay (/canister/id)"]
```
