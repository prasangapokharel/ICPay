# ICPay Canister Management — User Workflow & Architecture

This document details the end-to-end user journey, lifecycle workflows, and architectural flow for creating, managing, and maintaining Internet Computer canisters on ICPay.

---

## 1. High-Level User Journey

The workflow bridges non-technical founders, mobile-first operators, and command-line developers into a unified on-chain interface.

```mermaid
flowchart TD
    subgraph Onboarding["1. Onboarding & Funding"]
        A["Connect Internet Identity (II)"] --> B["Fund Wallet with ICP"]
    end

    subgraph Creation["2. Canister Creation (/canister/create)"]
        B --> C["Select Subnet (EU/US/Global)"]
        C --> D["Specify ICP Amount & Controllers"]
        D --> E["1-Click Canister Creation & Cycles Minting"]
    end

    subgraph Deployment["3. Development & Deployment"]
        E --> F["Obtain Canister ID (e.g., y5e5s-...)"]
        F --> G["Bind Canister ID in dfx.json"]
        G --> H["Deploy Motoko / Rust / Assets via dfx"]
    end

    subgraph Maintenance["4. Day-to-Day Operations (/canister/id)"]
        H --> I["Real-Time Cycle & Memory Monitoring"]
        I --> J["1-Click Cycles Top-up from Mobile/Web"]
        I --> K["Add / Remove / Transfer Controllers"]
        I --> L["State Snapshots & Recovery"]
        I --> M["Start / Stop / Freeze Threshold Settings"]
    end
```

---

## 2. Detailed Workflow Phases

### Phase 1: Authentication & Wallet Preparation
- **Action**: User visits `icpay.app` and signs in via Internet Identity.
- **Why**: No private keys or seed phrases to manage; authentication uses hardware-backed WebAuthn (Passkeys / FaceID / TouchID).
- **Funding**: User deposits ICP to their ICPay subaccount or receives ICP via handle (`@username`).

### Phase 2: On-Chain Canister Provisioning (`/canister/create`)
Users no longer need to use `dfx ledger` or manually manage cycles ledgers.

```mermaid
sequenceDiagram
    autonumber
    actor User as Developer / Founder
    participant ICPay as ICPay Frontend
    participant CMC as Cycles Minting Canister (CMC)
    participant Mgmt as IC Management Canister
    participant Canister as New Canister

    User->>ICPay: Configure (Subnet, ICP amount, Controllers)
    ICPay->>CMC: Notify create_canister with ICP deposit
    CMC->>Mgmt: Mint cycles & allocate new Canister ID
    Mgmt->>Canister: Initialize canister with controllers
    ICPay-->>User: Returns Canister ID (e.g. y5e5s-pyaaa-aaaal-qxiha-cai)
```

**Key Advantages:**
1. **Zero CLI hurdles**: Create canisters directly from a smartphone or tablet.
2. **Subnet customization**: Target specific European GDPR subnets, high-memory subnets, or standard subnets.
3. **Multi-controller setup**: Automatically sets both the developer's CLI principal (`dfx identity get-principal`) and Internet Identity principal.

---

### Phase 3: Project Integration & Code Deployment
Once provisioned, developers link the canister to their local repository.

1. **Configure `dfx.json`**:
   ```json
   {
     "canisters": {
       "backend": {
         "type": "motoko",
         "main": "src/main.mo"
       }
     }
   }
   ```
2. **Deploy Code directly to the provisioned canister**:
   ```bash
   dfx deploy --network ic --specified-id <YOUR_CANISTER_ID>
   ```

---

### Phase 4: Production Telemetry & Lifecycle Management (`/canister/[id]`)

```mermaid
stateDiagram-v2
    [*] --> Running : Canister Created & Funded
    Running --> Stopping : User clicks 'Stop' for maintenance
    Stopping --> Stopped : All in-flight calls finish
    Stopped --> Snapshotting : Create state snapshot
    Snapshotting --> Stopped : Snapshot stored on-chain
    Stopped --> Running : User clicks 'Start'
    Running --> Running : 1-Tap Cycles Top-up (Prevents Freeze)
    Stopped --> Upgraded : Code update deployed
    Upgraded --> Running : Resume service
```

#### Key Capabilities on `/canister/[id]`:
- **Cycles Guard**: Visual telemetry on cycles balance and remaining runway. One-click instant conversion of ICP to cycles without leaving the page.
- **Access Control Hub**:
  - Add developer teammates, CI/CD principals, or automated orchestrators as controllers.
  - Safe handover of primary ownership with confirmation safeguards.
- **State Snapshots**:
  - Create full on-chain snapshots before executing migrations or upgrades.
  - Restore previous state instantly if a migration encounters anomalies.
- **Resource Constraints**:
  - Adjust freezing threshold (in seconds).
  - Configure memory allocation (0–400 GiB on 64-bit storage).
  - Configure compute allocation.

---

## 3. Architecture & Security Model

```mermaid
graph TB
    subgraph Client["Client (Web / Mobile)"]
        UI["ICPay Canister Hub (/canister)"]
        Auth["Internet Identity Session"]
    end

    subgraph ICPNetwork["Internet Computer Mainnet"]
        Ledger["ICP Ledger (ryjl3-...)"]
        CMC_Node["Cycles Minting Canister (rkp4c-...)"]
        Management["IC Management (aaaaa-aa)"]
        UserCanister["User Canister (e.g. y5e5s-...)"]
    end

    UI -->|1. Authenticate| Auth
    UI -->|2. Query status / controllers| Management
    UI -->|3. Deposit ICP for cycles| Ledger
    Ledger -->|4. Mint & Deposit Cycles| CMC_Node
    CMC_Node -->|5. Topup / Create| UserCanister
    Auth -.->|Direct Controller Signature| Management
```

- **Non-Custodial Control**: Canister management calls are executed directly against the IC Management Canister (`aaaaa-aa`) using the user's authenticated principal.
- **Transparent Execution**: No third-party servers intermediary; all canister status queries and update calls route directly to the Internet Computer consensus.
