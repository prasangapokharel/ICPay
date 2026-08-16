module {
  public let ICP_LEDGER_CANISTER_ID: Text = "ryjl3-tyaaa-aaaaa-aaaba-cai";
  public let ICP_DECIMALS: Nat = 8;

  // Display + legacy account-id transfers. ICRC-1 transfers pass fee = null so
  // the ledger sets the real charge; this is only for tx history rows.
  public let ICP_ICRC1_TRANSFER_FEE_E8S: Nat = 10_000;

  // Not SNS-launched, so SNS-W does not list them. Compiled in rather than
  // discovered, so a cold or unreachable SNS-W can never make ICP unspendable.
  // Mirrors CK_LEDGER_IDS in frontend/services/tokens.ts.
  public let CHAIN_KEY_LEDGERS: [Text] = [
    ICP_LEDGER_CANISTER_ID,
    "mxzaz-hqaaa-aaaar-qaada-cai", // ckBTC
    "ss2fx-dyaaa-aaaar-qacoq-cai", // ckETH
    "xevnm-gaaaa-aaaar-qafnq-cai", // ckUSDC
    "cngnf-vqaaa-aaaar-qag4q-cai", // ckUSDT
  ];

  // The NNS SNS-W canister, which knows every SNS ever deployed.
  public let SNS_WASM_CANISTER_ID: Text = "qaa6y-5yaaa-aaaaa-aaafa-cai";

  // Short handles are the scarce inventory, so 1-4 chars are sold rather than
  // given away. Handles already claimed under the old 32-char ceiling keep
  // resolving; this only gates new claims.
  public let MAX_USERNAME_LENGTH: Nat = 8;
  public let MIN_USERNAME_LENGTH: Nat = 1;
  public let FREE_MIN_USERNAME_LENGTH: Nat = 5;

  // Receives username purchases and token launch revenue. A plain principal,
  // not a custodial subaccount: the proceeds have to be spendable by its owner
  // without going through this canister.
  public let TREASURY: Text = "ni5n2-efxui-dyqdu-2mnpr-atclq-d6snc-zdq5q-u6ibz-ibpkq-brjpj-gqe";

  // The minting account of every launched token. In ICRC-1 a transfer *from*
  // the minting account mints, so naming the creator would let them issue
  // unlimited new supply after launch -- while the UI promises holders the
  // supply is fixed. The management canister has no caller, so nothing can ever
  // transfer out of it and the promise holds.
  public let TOKEN_MINTING_PRINCIPAL: Text = "aaaaa-aa";

  public let PRICE_ULTRA_PREMIUM: Nat = 1_000_000_000; // 1-3 chars, 10 ICP
  public let PRICE_PREMIUM: Nat = 500_000_000; // 4 chars, 5 ICP
  public let PRICE_STANDARD: Nat = 200_000_000; // 5 chars, 2 ICP
  public let PRICE_BASIC: Nat = 100_000_000; // 6-8 chars, 1 ICP
  public let PAGE_SIZE: Nat = 20;
  // Every history read scans the whole transaction list, so an unbounded page
  // size lets one caller's request grow with total canister activity. 50 rows
  // is more history than the UI shows and keeps the per-call cost predictable.
  public let MAX_PAGE_SIZE: Nat = 50;
  // searchUsers has no caller gate, so an unbounded result would let a public
  // query's cost grow with total registered users. Comfortably above what the
  // frontend suggestion list renders (10), never returning the whole registry.
  public let MAX_SEARCH_RESULTS: Nat = 25;
  // The ICP ledger rejects a memo blob over 32 bytes. Counted in UTF-8 bytes,
  // not characters, because one emoji costs four.
  public let MEMO_MAX_BYTES: Nat = 32;

  // The NNS Cycles Minting Canister. It is the only way ICP becomes cycles, and
  // it creates the token canister itself so the child is funded out of the
  // user's fee rather than this canister's balance.
  public let CMC_CANISTER_ID: Text = "rkp4c-7iaaa-aaaaa-aaaca-cai";
  public let MANAGEMENT_CANISTER_ID: Text = "aaaaa-aa";

  // The subnet this canister runs on. install_chunked_code requires the store
  // canister and the target to share a subnet, and the chunk store is ours, so
  // every token has to be created here or the install cannot see the chunks.
  // Left null the CMC picks freely, which fails the install every time.
  public let OWN_SUBNET: Text = "cv73p-6v7zi-u67oy-7jc3h-qspsz-g5lrj-4fn7k-xrax3-thek2-sl46v-jae";

  // A launch costs 5 ICP, of which 2 buys the child's cycles and the rest is
  // revenue. Split here rather than at the call site so the two can never drift
  // apart into a launch that mints more cycles than it charged for.
  public let LAUNCH_FEE: Nat = 500_000_000; // 5 ICP
  public let LAUNCH_CYCLE_ALLOCATION: Nat = 200_000_000; // 2 ICP of the above

  // Paid by the ledger out of its own balance when it first spawns an archive,
  // so it has to fit inside what LAUNCH_CYCLE_ALLOCATION mints (~3T) and still
  // leave the ledger able to run. At zero the spawn fails and the ledger keeps
  // every block in its own memory instead.
  public let ARCHIVE_CREATION_CYCLES: Nat64 = 1_000_000_000_000; // 1T

  // A year of idle burn, reserved rather than spent. It buys the creator time to
  // notice a dying token: frozen still answers queries, and any holder can
  // top it up because notify_top_up needs no controller rights.
  public let TOKEN_FREEZING_THRESHOLD: Nat = 31_536_000; // 365 days, seconds

  // Refuse to launch below this. A launch costs us four update calls, but the
  // real risk is accepting payment and then trapping mid-sequence because the
  // canister froze partway through.
  public let MIN_CYCLE_RESERVE: Nat = 5_000_000_000_000; // 5T

  // ICPay Cloud bucket billing period (30 days, nanoseconds).
  public let BUCKET_PERIOD_NS: Int = 2_592_000_000_000_000;

  // Mixed into the per-bucket encryption key. Compiled in — not user-supplied.
  public let BUCKET_CRYPTO_SALT: Text = "icpay_cloud_v1";

  // --- ICPay Cloud upload limits -------------------------------------------
  // Product cap (billing policy). IC protocol allows far more via chunking
  // (stable memory up to 500 GiB per canister — store bytes as Blob, not [Nat8]).
  public let BUCKET_MAX_FILE_BYTES: Nat = 10_000_000;

  // IC ingress: 2 MiB (2_097_152 B) per update message — fixed by the protocol.
  // https://docs.internetcomputer.org/references/resource-limits/
  public let IC_INGRESS_MAX_BYTES: Nat = 2_097_152;

  // Chunk payload — ~1.85 MiB leaves headroom for Candid Vec overhead under 2 MiB ingress.
  // Asset canister sync uses ~1.9 MiB; see forum.dfinity.org/t/optimal-upload-chunk-size
  public let BUCKET_UPLOAD_CHUNK_BYTES: Nat = 1_850_000;

  // Smallest chunk size legacy clients send (700 KB). Session slot count uses this so
  // beginFileUpload accepts enough chunks before completeFileUpload.
  public let BUCKET_UPLOAD_MIN_CHUNK_BYTES: Nat = 700_000;

  // Direct uploadFile() ceiling — one round trip for compressed photos under this size.
  public let BUCKET_UPLOAD_SINGLE_MAX: Nat = 1_850_000;

  // Abandon stale chunked sessions after 30 minutes.
  public let BUCKET_UPLOAD_SESSION_TTL_NS: Int = 1_800_000_000_000;

  // Max revocable API keys per bucket.
  public let BUCKET_MAX_API_KEYS: Nat = 10;

  // Universal IC raw HTTP gateway (boundary node). Canister id is supplied separately via ?id=.
  // ICPay backend canister — public file URLs use https://{id}.raw.icp0.io/…
  public let BACKEND_CANISTER_ID: Text = "6vbhm-nqaaa-aaaan-q6muq-cai";

  // Clean CDN host (Vercel proxy → canister /cloud/). Null keeps raw.icp0.io URLs.
  public let CLOUD_CDN_BASE: ?Text = null;

  // Stats flag when fewer than this many days remain in the paid period.
  public let BUCKET_EXPIRING_SOON_DAYS: Nat = 3;

  public let BUCKET_PERIOD_DAYS: Nat = 30;

  // IC http_request response limit is 2 MB; stay under for headers margin.
  public let HTTP_MAX_BODY_BYTES: Nat = 1_900_000;
  public let HTTP_CHUNK_BYTES: Nat = 1_900_000;

  public let BUCKET_FILE_PAGE_SIZE: Nat = 20;

  // Canister-owned account that collects launch fees. Fixed, so it matches no
  // user's derived subaccount and deposits into it write no phantom history row.
  public let REVENUE_SUBACCOUNT: Blob = "\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00";

  public let MAX_TOKEN_NAME_LENGTH: Nat = 32;
  public let MIN_TOKEN_NAME_LENGTH: Nat = 1;
  public let MAX_TOKEN_SYMBOL_LENGTH: Nat = 8;
  public let MIN_TOKEN_SYMBOL_LENGTH: Nat = 2;
  public let MAX_TOKEN_DESCRIPTION_LENGTH: Nat = 500;
  public let MAX_TOKEN_LINK_LENGTH: Nat = 256;
  // ICRC-1 permits up to 255, but a logo is stored inline in the token record
  // and served to every holder, so it is capped well below what fits.
  public let MAX_TOKEN_LOGO_BYTES: Nat = 32_000;
  public let MAX_TOKEN_DECIMALS: Nat8 = 18;

  // Update-call throttles. Queries are free on the IC, so only update calls are
  // gated. Each policy is {maxPerWindow, windowSeconds}, enforced per caller,
  // one Window per named policy so a caller held off one path can still use
  // the others.
  public let RATE_LAUNCH_TOKEN = { maxPerWindow = 1; windowSeconds = 3600 }; // 5 ICP, one attempt per hour is enough
  public let RATE_PURCHASE_USERNAME = { maxPerWindow = 3; windowSeconds = 60 }; // the paid buy -- double-spend / price abuse
  public let RATE_CLAIM_USERNAME = { maxPerWindow = 5; windowSeconds = 60 }; // register / updateUsername, the free claim path
  public let RATE_TRANSFER = { maxPerWindow = 5; windowSeconds = 60 }; // repeated transfer attempts, any destination shape
  public let RATE_WITHDRAW = { maxPerWindow = 5; windowSeconds = 60 };
  public let RATE_SYNC_DEPOSITS = { maxPerWindow = 10; windowSeconds = 60 }; // hits the ledger index canister -- real cost
  public let RATE_UPDATE_SETTINGS = { maxPerWindow = 10; windowSeconds = 300 }; // cheap but writes state

  // Swap module
  public let ICPSWAP_FACTORY: Text = "4mmnk-kiaaa-aaaag-qbllq-cai";
  public let SWAP_PLATFORM_FEE_BPS: Nat = 100;   // 100 basis points = 1%
  public let MAX_SWAP_RETRIES: Nat = 10;         // pending swap auto-retry ceiling
  public let RATE_SWAP = { maxPerWindow = 3; windowSeconds = 60 };

  // ICPay Cloud — separate maps in main.mo so create/upload/renew do not share a counter.
  public let RATE_BUCKET_CREATE = { maxPerWindow = 3; windowSeconds = 60 };
  public let RATE_BUCKET_UPLOAD = { maxPerWindow = 40; windowSeconds = 60 };
  public let RATE_BUCKET_RENEW = { maxPerWindow = 5; windowSeconds = 60 };
  public let RATE_BUCKET_API_KEY = { maxPerWindow = 10; windowSeconds = 60 };
  public let RATE_BUCKET_MUTATE = { maxPerWindow = 30; windowSeconds = 60 };

  /** Max paths per bulk delete/move/copy call — IC instruction budget. */
  public let BUCKET_BULK_MAX: Nat = 20;
};
