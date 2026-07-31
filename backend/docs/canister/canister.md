On the **Internet Computer (ICP)**, **cycles** are the computational resource that pay for running canisters. Users pay with ICP, which is converted into cycles.

Here are the main ways a canister consumes cycles:

| Operation                       | Consumes Cycles? | Notes                                                                                                              |
| ------------------------------- | ---------------: | ------------------------------------------------------------------------------------------------------------------ |
| Canister creation               |                ✅ | One-time cost to create a canister                                                                                 |
| Code installation/upgrades      |                ✅ | Uploading new Wasm module                                                                                          |
| Update calls                    |                ✅ | Executing state-changing methods                                                                                   |
| Query calls                     |    ⚠️ Usually no | Replicated queries don't consume billed cycles in the same way as updates; certified or composite behavior differs |
| Stable memory reads/writes      |                ✅ | Storage operations                                                                                                 |
| Heap memory usage               |                ✅ | Charged over time                                                                                                  |
| Stable storage                  |                ✅ | Charged continuously based on allocated storage                                                                    |
| Message execution               |                ✅ | Every executed instruction costs cycles                                                                            |
| Inter-canister calls            |                ✅ | Sending and processing messages                                                                                    |
| HTTP Outcalls                   |                ✅ | External HTTPS requests are relatively expensive                                                                   |
| Threshold ECDSA/Schnorr signing |                ✅ | Cryptographic signing APIs                                                                                         |
| Randomness (`raw_rand`)         |                ✅ | System randomness API                                                                                              |
| Timers / Heartbeat              |                ✅ | Every execution consumes cycles                                                                                    |
| Global timer                    |                ✅ | Scheduled execution                                                                                                |
| Bitcoin API                     |                ✅ | UTXO, balance, transaction APIs                                                                                    |
| VetKD API                       |                ✅ | Key derivation operations                                                                                          |
| Snapshots / Backups             |                ✅ | Snapshot creation and storage                                                                                      |
| Canister logs                   |            Small | Logging contributes indirectly through execution                                                                   |

### Continuous Costs

These are charged even if no users are interacting:

* Memory allocation (heap)
* Stable memory
* Reserved storage
* Idle canister resource reservation

### On-Demand Costs

These happen only when work is performed:

* Update calls
* Inter-canister calls
* HTTP outcalls
* Code upgrades
* Cryptographic operations
* Bitcoin integration
* Timers and scheduled tasks

### Typical High-Cost Operations

1. HTTP Outcalls
2. Threshold ECDSA/Schnorr signatures
3. Large code upgrades
4. Large stable memory writes
5. Heavy computation
6. Large inter-canister message chains

### Monitoring

You can monitor cycle balance using:

* `dfx canister status`
* The IC dashboard
* Management Canister APIs (`canister_status`)

A canister **stops running when its cycle balance reaches zero**, so production applications usually monitor the balance and automatically top up cycles before they become low.



To save a lot of **cycles** on ICP, focus on reducing execution, storage, and network usage.

## 1. Minimize Update Calls ⭐⭐⭐⭐⭐

* Use **query** methods whenever state doesn't change.
* Batch multiple operations into one update.
* Avoid unnecessary writes.

```motoko
// Good
query func getProfile(id : Principal) : async User

// Only use update when modifying state
update func updateProfile(...) : async ()
```

---

## 2. Reduce Stable Memory Writes ⭐⭐⭐⭐⭐

Writing to stable memory is more expensive than reading.

Instead of:

```text
Update user
Save profile
Save stats
Save settings
```

Do:

```text
Update everything in memory
Write once
```

---

## 3. Store Less Data ⭐⭐⭐⭐⭐

Storage is charged continuously.

Instead of storing:

* Images
* Videos
* Large JSON
* Logs

Store:

* IDs
* URLs
* Hashes

Use external storage (e.g., Cloudflare R2, S3) for large files if decentralization is not required.

---

## 4. Compress Data

Instead of

```json
{
  "firstName": "...",
  "lastName": "...",
  "phone": "...",
  "country": "..."
}
```

Store compact binary formats or efficient serialization (e.g. Candid or CBOR where appropriate).

---

## 5. Cache Frequently Used Data

Instead of:

```
Client
 ↓
Canister A
 ↓
Canister B
 ↓
Database
```

Cache results in memory when possible.

---

## 6. Reduce Inter-Canister Calls ⭐⭐⭐⭐

Each call has overhead.

Instead of

```
A → B → C → D
```

Prefer

```
A → D
```

or combine related functionality.

---

## 7. Avoid Frequent Heartbeats

Heartbeats execute even when nothing is happening.

Prefer:

* Global timers
* Scheduled jobs only when needed
* User-triggered execution

---

## 8. Optimize Algorithms

A loop over 100,000 items costs much more than indexed lookups.

Prefer:

* HashMap
* BTreeMap
* Indexed structures

Avoid scanning entire collections.

---

## 9. Limit HTTP Outcalls

HTTP outcalls are relatively expensive.

Instead of:

```
100 HTTP requests
```

Use:

```
1 request
Cache result
Reuse it
```

---

## 10. Batch Operations

Instead of

```
100 update calls
```

Use

```
1 update call containing 100 items
```

---

## 11. Upgrade Carefully

Only upgrade when necessary, as code installation and upgrades consume cycles.

---

## 12. Monitor Cycle Balance

Track remaining cycles and top up before the balance becomes low.

---

# Biggest Savings

| Optimization                   | Potential Savings |
| ------------------------------ | ----------------: |
| Use queries instead of updates |             ⭐⭐⭐⭐⭐ |
| Batch writes                   |             ⭐⭐⭐⭐⭐ |
| Reduce storage                 |             ⭐⭐⭐⭐⭐ |
| Minimize inter-canister calls  |              ⭐⭐⭐⭐ |
| Cache frequently accessed data |              ⭐⭐⭐⭐ |
| Avoid unnecessary timers       |               ⭐⭐⭐ |
| Batch user requests            |              ⭐⭐⭐⭐ |
| Efficient data structures      |              ⭐⭐⭐⭐ |
| Minimize HTTP outcalls         |              ⭐⭐⭐⭐ |

For most ICP applications, the largest cycle savings come from:

* Keeping state small.
* Using **query** methods whenever possible.
* Batching updates and writes.
* Avoiding unnecessary inter-canister calls.
* Designing efficient data structures and algorithms from the start.
