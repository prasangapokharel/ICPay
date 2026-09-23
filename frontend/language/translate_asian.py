import json
from pathlib import Path

ROOT = Path("language")

def deep_update(target, source):
    for k, v in source.items():
        if isinstance(v, dict) and isinstance(target.get(k), dict):
            deep_update(target[k], v)
        else:
            target[k] = v

asian_translations = {
  "zh": {
    "dashboard": { "quickActions": "快捷操作" },
    "settings": {
      "sections": {
        "overview": "概览", "payments": "支付", "money": "资金", "assets": "资产",
        "community": "社区", "services": "服务", "insights": "洞察", "identity": "身份",
        "canisters": "容器 Canister", "storage": "存储", "activity": "动态", "more": "更多",
        "preferences": "偏好设置", "legal": "法律条款"
      }
    },
    "publicSite": {
      "nav": {
        "sectionCanisters": "容器 Canisters",
        "canisters": {
          "mine": { "title": "我的容器", "description": "查看您创建或保存的所有容器 — 状态和快捷操作。" },
          "tools": { "title": "容器工具", "description": "在一个中心创建、管理、铸造 Cycles、充值和快照。" },
          "manage": { "title": "容器管理", "description": "当您的 Internet Identity 是控制者时的实时状态、启停与日志。" },
          "create": { "title": "创建容器", "description": "支付 ICP 并通过官方 CMC 获取新的容器 ID。" },
          "cycles": { "title": "Cycles 钱包", "description": "铸造 Cycles 到账本，然后提取到任意容器。" },
          "topup": { "title": "充值 Cycles", "description": "通过 CMC 为任意容器将 ICP 转换为 Cycles。" },
          "snapshots": { "title": "快照管理", "description": "创建、列出、加载和删除容器快照。" }
        }
      },
      "footer": {
        "sectionCompany": "公司", "sectionExplore": "探索",
        "products": { "canister": "容器 Canisters", "topup": "充值 Cycles" }
      }
    },
    "canisterHub": {
      "eyebrow": "容器 Canisters",
      "title": "创建与充值容器",
      "subtitle": "快速启动新的 Internet Computer 容器或充值 Cycles — 通过官方 CMC 从您的 ICPay 钱包直接支付。无需 dfx。",
      "createTitle": "创建容器",
      "createDescription": "支付 ICP，获取新容器 ID。您通过 Internet Identity 成为控制者。",
      "topupTitle": "充值 Cycles",
      "topupDescription": "为任意容器 ID 将 ICP 转换为 Cycles。无需是控制者。",
      "note": "前端工具直接调用官方 CMC 和 ICP 账本。仅在您的 II Principal 需要 ICP 时才从 ICPay 钱包提取。",
      "manageTitle": "管理容器",
      "manageDescription": "当您的 Internet Identity 是控制者时，查看实时状态、启停及日志。",
      "cyclesTitle": "Cycles 钱包",
      "cyclesDescription": "在 Cycles 账本上将 ICP 铸造为 Cycles，然后提取到任意容器。",
      "snapshotsTitle": "快照",
      "snapshotsDescription": "为您控制的容器创建、列出、加载和删除快照。"
    },
    "canisterIdField": {
      "label": "容器 ID", "placeholder": "aaaaa-aa…", "choose": "我的容器",
      "yours": "您的容器", "emptyHint": "请先创建一个容器 — 创建后将显示在此处供选择。"
    },
    "canisterStatus": {
      "cardTitle": "容器状态",
      "cardHint": "来自 Internet Computer 子网的实时状态。必须是控制者才能查看完整指标。",
      "createLink": "创建容器", "errorTitle": "无法加载状态", "cycles": "Cycles",
      "reserved": "保留 Cycles", "memory": "内存", "wasmMemory": "Wasm 内存",
      "stableMemory": "Stable 稳定内存", "idleBurn": "空闲销毁", "version": "版本",
      "moduleHash": "模块哈希", "freezing": "冻结阈值", "compute": "计算分配",
      "memoryAlloc": "内存分配", "snapshotsSize": "快照大小", "controllers": "控制者",
      "youControl": "您正在控制", "liveMetrics": "实时指标",
      "run": { "running": "运行中", "stopping": "正在停止", "stopped": "已停止" }
    },
    "canisterManage": {
      "eyebrow": "容器 Canisters", "title": "容器管理",
      "subtitle": "检查状态、启动/停止、查看日志并添加控制者。无需 dfx 命令行。",
      "connectPrompt": "请使用 Internet Identity 登录以加载状态并管理您的容器。",
      "lookupTitle": "加载容器",
      "lookupHint": "您必须是控制者才能读取状态和日志。为任意容器充值无需控制者权限。",
      "actions": "操作", "start": "启动", "stop": "停止", "topUp": "充值 Cycles",
      "topUpHint": "从 ICPay 钱包向此容器添加 Cycles。", "logs": "日志",
      "logsHint": "实时获取容器日志。", "noLogs": "暂无可用日志。", "refresh": "刷新",
      "addController": "添加控制者", "status": "状态", "statusHint": "来自官方管理容器的实时指标。"
    },
    "canisterCycles": {
      "eyebrow": "容器 Canisters", "title": "Cycles 钱包",
      "subtitle": "在 Cycles 账本上将 ICP 铸造为 Cycles，并提取到任意容器。",
      "ledgerBalance": "Cycles 账本余额", "mintTitle": "铸造 Cycles",
      "mintSubtitle": "存入 ICP 以在 Cycles 账本上铸造 Cycles。",
      "withdrawTitle": "提取到容器", "withdrawSubtitle": "将 Cycles 从 Cycles 账本转移到任意容器 ID。",
      "amount": "金额 (ICP)", "cyclesAmount": "Cycles 数量 (T cycles)",
      "targetCanister": "目标容器 ID", "mintButton": "铸造 Cycles",
      "withdrawButton": "提取", "mintSuccess": "Cycles 铸造成功。",
      "withdrawSuccess": "Cycles 已提取到目标容器。"
    },
    "canisterSnapshots": {
      "eyebrow": "容器 Canisters", "title": "容器快照",
      "subtitle": "创建、恢复和删除容器状态快照。",
      "takeSnapshot": "创建快照", "restoreSnapshot": "恢复快照",
      "deleteSnapshot": "删除快照", "snapshotsList": "快照列表",
      "noSnapshots": "暂无快照。", "snapshotId": "快照 ID",
      "takenAt": "创建时间", "totalSize": "总大小"
    },
    "myCanisters": {
      "title": "我的容器",
      "subtitle": "您控制的容器，以及您通过 ID 和可选名称关联的容器。状态和操作均汇集在此。",
      "create": "创建", "link": "关联", "loading": "加载中…",
      "yourPrincipal": "您的 Internet Identity (控制者)",
      "principalHint": "将此复制到其他账户创建表单中的“额外控制者”以备用访问。",
      "copyPrincipal": "复制 Principal", "addPlaceholder": "Principal ID",
      "listTitle": "我的容器", "listHint": "已在此浏览器中为您的 II 关联。索引名称可用时会显示。",
      "count": "{count}", "empty": "暂无容器。创建新容器或关联您已控制的容器。",
      "back": "返回", "detailTitle": "详情", "detailEmpty": "选择一个容器以查看状态和操作。",
      "metaName": "名称", "metaType": "类型", "metaLanguage": "语言",
      "metaUpdated": "索引已更新", "metaSubnet": "子网", "metaSubnetId": "子网 ID",
      "metaSubnetType": "子网类型", "metaSubnetNodes": "运行节点数",
      "metaSubnetCanisters": "子网容器数", "metaControllers": "控制者",
      "metaUpgrades": "近期升级", "cyclesSource": "来自 canister_status 的实时 Cycles (仅限控制者)。",
      "publicApiHint": "Cycle 余额在 IC 索引或 ICRC API 上不公开 — 仅控制者可读取。任何人仍可",
      "menuActions": "操作", "view": "查看", "more": "更多",
      "createWithBackup": "带备份控制者创建", "manage": "管理", "topUp": "充值",
      "start": "启动", "stop": "停止", "starting": "正在启动…", "stopping": "正在停止…",
      "stopConfirmTitle": "停止此容器？",
      "stopConfirmBody": "停止将暂停执行，直到您再次启动。仅限控制者。",
      "topUpTitle": "充值 Cycles", "topUpHint": "通过 CMC 从钱包发送 ICP 到此容器的 Cycles 余额中。",
      "topUpEstimate": "≈ {cycles} Cycles", "topUpEstimateLabel": "预计 Cycles",
      "topUpEstimateHint": "根据 CMC ICP→XDR 汇率的粗略预估。", "topUpCancel": "取消",
      "topUpConfirm": "确认充值", "transfer": "转移", "transferTitle": "转移 Cycles",
      "transferHint": "通过官方 Cycles 账本提取功能，从您的 Cycles 账本发送到另一个容器。控制者无法从容器自身的余额中提取 Cycles。",
      "transferFromContext": "来源", "transferAmount": "数量 (T cycles)",
      "transferConfirm": "确认转移", "transferCancel": "取消", "transferring": "正在转移…",
      "transferSuccessTitle": "Cycles 已转移", "transferSuccessBody": "已从您的 Cycles 账本存入目标容器。",
      "transferLedgerEmpty": "您的 Cycles 账本为空。", "transferMintLink": "先铸造 Cycles",
      "snapshots": "快照", "copyId": "复制 ID", "copied": "已复制",
      "topUpHistory": "充值历史", "settings": "设置", "running": "运行中",
      "dashboard": "IC 仪表板", "remove": "从列表中移除", "rowDenied": "非控制者",
      "backupHint": "启动和停止需要您作为控制者。充值适用于任何容器。",
      "allTools": "所有公开工具", "linkTitle": "关联容器",
      "linkHint": "关联您已创建的容器（dfx、NNS 或其他）。与 NNS 关联容器相同 — 不会创建新容器。",
      "linkId": "输入容器 ID", "linkName": "输入容器名称 (可选)",
      "linkNamePlaceholder": "容器名称", "linkCancel": "取消", "linkConfirm": "确认",
      "linkSuccessTitle": "容器已关联", "linkSuccessBody": "已保存到此浏览器的我的容器中。",
      "linkSuccessNamed": "已保存为“{name}”。", "invalidId": "请输入有效的容器 ID",
      "addController": "添加控制者", "addControllerTitle": "添加控制者",
      "addControllerHint": "通过 update_settings 授予另一个 Principal 对此容器的完全控制权。控制者列表是完全替换机制 — 当前列表会被保留，该 Principal 将追加到末尾。",
      "addControllerLabel": "Principal ID", "addControllerPlaceholder": "aaaaa-aa…",
      "addControllerFullListHint": "现有控制者将保持不变，新增此控制者。",
      "addControllerConfirm": "添加控制者", "addControllerSubmitting": "正在添加…",
      "addControllerSuccessTitle": "控制者已添加", "addControllerSuccessBody": "此 Principal 现在可以管理该容器。",
      "invalidPrincipal": "请输入有效的 Principal ID"
    },
    "cyclesTopUp": {
      "eyebrow": "Cycles", "title": "为容器充值",
      "subtitle": "使用您的 ICPay 钱包支付。需要时我们会向您的 Internet Identity 发送 ICP，然后通过官方 CMC 铸造 Cycles。",
      "formTitle": "充值", "formHint": "粘贴容器 ID 和金额。步骤：从钱包发送 → 通过 CMC 铸造 → 完成。",
      "canisterId": "容器 ID", "canisterPlaceholder": "aaaaa-aa…",
      "canisterOk": "在 Internet Computer 上找到容器。",
      "canisterNotFound": "在 IC 索引中未找到容器。请检查 ID。",
      "amount": "金额 (ICP)", "estimate": "预计 Cycles",
      "estimateSource": "根据 CMC 官方 ICP→XDR 转换率估算。",
      "rateLine": "1 ICP ≈ {xdr} XDR ≈ {cycles} Cycles",
      "signIn": "使用 Internet Identity 登录", "connecting": "连接中…",
      "topUp": "从钱包充值", "toppingUp": "充值中…",
      "sending": "正在从钱包发送…", "minting": "正在铸造 Cycles…",
      "stepSend": "从钱包发送", "stepMint": "铸造 Cycles", "stepDone": "完成",
      "flowHintSend": "将从您的钱包发送 {amount} ICP 以支付此次充值，然后进行铸造。",
      "flowHintMintOnly": "您的 II Principal 已有足够的 ICP — 仅执行铸造。",
      "successTitle": "Cycles 已发送", "success": "已向容器铸造 {cycles} Cycles。",
      "successWithdrew": "ICP 已先从您的 ICPay 钱包扣除。",
      "successHint": "Cycles 已存入。打开仪表板确认状态（大多数容器的余额仅控制者可见）。",
      "viewOnDashboard": "在 IC 仪表板上查看容器", "amountPaid": "支付金额",
      "failed": "充值失败", "blockIndex": "区块高度", "invalidCanister": "请输入有效的容器 Principal",
      "invalidAmount": "请输入有效的 ICP 金额", "minAmount": "最小金额为 0.01 ICP",
      "maxAmount": "每次调用最多 50 ICP", "insufficient": "ICPay 钱包中的 ICP 余额不足 (金额 + 手续费)",
      "disclaimer": "任何人都可以为任何容器充值 — 您无需是控制者。使用官方 ICP 账本和 Cycles Minting Canister。",
      "rateBadge": "1 ICP ≈ {xdr} XDR", "cyclesUnit": "cycles",
      "copyFailed": "无法复制容器 ID", "stepLabel": "步骤 {n}",
      "previewTitle": "预览", "previewRate": "CMC 汇率", "previewStatus": "状态",
      "previewReady": "就绪", "previewLiveCycles": "实时 Cycles",
      "previewNoController": "非控制者", "previewLoadingStatus": "正在加载状态…",
      "liveStatusTitle": "实时容器状态",
      "runStatus": { "running": "运行中", "stopping": "正在停止", "stopped": "已停止" }
    },
    "canisterCreate": {
      "eyebrow": "容器 Canisters", "title": "创建容器",
      "subtitle": "使用您的 ICPay 钱包支付。需要时为您的 Internet Identity 充值，然后通过官方 Cycles Minting Canister 创建。",
      "formTitle": "创建", "formHint": "步骤：从钱包发送 → 通过 CMC 创建 → 完成。剩余 ICP 转换为初始 Cycles。",
      "controller": "控制者", "controllerTip": "CMC 要求调用者 (您的 Internet Identity) 作为控制者。可在下方添加额外 Principal。",
      "extraControllers": "额外控制者", "extraControllersTip": "可选。同样控制该容器的逗号分隔 Principal 列表。",
      "extraControllersPlaceholder": "principal-1, principal-2",
      "subnet": "子网", "subnetTip": "默认让 CMC 选择子网。打开菜单可选择其他子网 — 仅在打开时加载详情。",
      "subnetDefault": "默认 (CMC 选择)", "amount": "金额 (ICP)",
      "estimate": "从 ICP 估算的 Cycles", "estimateSource": "根据 CMC ICP→XDR 汇率粗略估算。扣除创建费后，剩余部分转换为 Cycles。",
      "rateBadge": "1 ICP ≈ {xdr} XDR", "signIn": "使用 Internet Identity 登录",
      "connecting": "连接中…", "create": "从钱包创建", "creating": "创建中…",
      "sending": "正在从钱包发送…", "stepSend": "从钱包发送", "stepCreate": "通过 CMC 创建",
      "stepDone": "完成", "stepLabel": "步骤 {n}",
      "flowHintSend": "将从您的钱包发送 {amount} ICP 支付创建费用，然后通知 CMC。",
      "flowHintCreateOnly": "您的 II Principal 已有足够 ICP — 仅执行创建。",
      "successTitle": "容器已创建", "success": "已创建容器 {canister}。",
      "successWithdrew": "ICP 已先从您的 ICPay 钱包转出。",
      "successHint": "您是控制者。使用 dfx 或您的开发工具安装代码，并在余额偏低时充值 Cycles。",
      "viewOnDashboard": "在 IC 仪表板上查看", "topUpNext": "充值 Cycles",
      "amountPaid": "金额", "blockIndex": "区块高度", "canisterId": "容器 ID",
      "failed": "创建失败", "invalidAmount": "请输入有效的 ICP 金额",
      "minAmount": "最小金额为 {min} ICP (创建费 + 初始 Cycles)", "maxAmount": "最大金额为 50 ICP",
      "insufficient": "钱包余额不足 (金额 + 手续费)", "invalidController": "无效的 Principal: {p}",
      "disclaimer": "使用官方 Cycles Minting Canister。您（及添加的额外 Principal）是唯一的控制者。",
      "cyclesUnit": "cycles", "copyFailed": "无法复制容器 ID",
      "previewTitle": "预览", "previewRate": "CMC 汇率", "previewFee": "创建费用",
      "previewInitialCycles": "初始 Cycles"
    }
  },
  "ko": {
    "dashboard": { "quickActions": "빠른 작업" },
    "settings": {
      "sections": {
        "overview": "개요", "payments": "결제", "money": "자금", "assets": "자산",
        "community": "커뮤니티", "services": "서비스", "insights": "인사이트", "identity": "신원",
        "canisters": "캐니스터 Canisters", "storage": "저장소", "activity": "활동", "more": "더보기",
        "preferences": "환경설정", "legal": "법적 정보"
      }
    },
    "publicSite": {
      "nav": {
        "sectionCanisters": "캐니스터",
        "canisters": {
          "mine": { "title": "내 캐니스터", "description": "생성하거나 저장한 모든 캐니스터의 상태와 빠른 작업을 확인하세요." },
          "tools": { "title": "캐니스터 도구", "description": "한 곳에서 생성, 관리, 사이클 발행, 충전, 스냅샷을 수행하세요." },
          "manage": { "title": "캐니스터 관리", "description": "Internet Identity가 컨트롤러일 때 실시간 상태, 시작/중지 및 로그." },
          "create": { "title": "캐니스터 생성", "description": "ICP를 지불하고 공식 CMC를 통해 새 캐니스터 ID를 발급받으세요." },
          "cycles": { "title": "Cycles 지갑", "description": "원장에 사이클을 발행한 후 모든 캐니스터로 출금하세요." },
          "topup": { "title": "사이클 충전", "description": "CMC를 통해 모든 캐니스터에 ICP를 사이클로 변환하세요." },
          "snapshots": { "title": "스냅샷", "description": "캐니스터 스냅샷 생성, 목록 확인, 불러오기 및 삭제." }
        }
      },
      "footer": {
        "sectionCompany": "회사", "sectionExplore": "탐색",
        "products": { "canister": "캐니스터", "topup": "사이클 충전" }
      }
    },
    "canisterHub": {
      "eyebrow": "캐니스터",
      "title": "캐니스터 생성 및 연료 공급",
      "subtitle": "공식 CMC를 통해 ICPay 지갑에서 새 Internet Computer 캐니스터를 가동하거나 사이클을 충전하세요. dfx가 필요 없습니다.",
      "createTitle": "캐니스터 생성",
      "createDescription": "ICP를 지불하고 새 캐니스터 ID를 얻으세요. Internet Identity를 통해 컨트롤러가 됩니다.",
      "topupTitle": "사이클 충전",
      "topupDescription": "모든 캐니스터 ID에 대해 ICP를 사이클로 변환하세요. 컨트롤러 권한은 선택 사항입니다.",
      "note": "프론트엔드 도구는 공식 CMC 및 ICP 원장을 직접 호출합니다. ICPay 지갑 출금은 II 프린시펄에 ICP가 필요할 때만 사용됩니다.",
      "manageTitle": "캐니스터 관리",
      "manageDescription": "Internet Identity가 컨트롤러일 때 실시간 상태, 시작/중지 및 로그를 확인하세요.",
      "cyclesTitle": "Cycles 지갑",
      "cyclesDescription": "Cycles 원장에서 ICP를 사이클로 발행한 다음 모든 캐니스터로 출금하세요.",
      "snapshotsTitle": "스냅샷",
      "snapshotsDescription": "제어하는 캐니스터의 스냅샷을 생성, 나열, 로드 및 삭제하세요."
    },
    "canisterIdField": {
      "label": "캐니스터 ID", "placeholder": "aaaaa-aa…", "choose": "내 캐니스터",
      "yours": "내 캐니스터 목록", "emptyHint": "먼저 캐니스터를 생성하세요 — 나중에 선택할 수 있도록 여기에 표시됩니다."
    },
    "canisterStatus": {
      "cardTitle": "캐니스터 상태",
      "cardHint": "Internet Computer 서브넷의 실시간 상태입니다. 전체 지표를 보려면 컨트롤러여야 합니다.",
      "createLink": "캐니스터 생성", "errorTitle": "상태를 불러올 수 없습니다", "cycles": "사이클",
      "reserved": "예약된 사이클", "memory": "메모리", "wasmMemory": "Wasm 메모리",
      "stableMemory": "Stable 메모리", "idleBurn": "유휴 소모량", "version": "버전",
      "moduleHash": "모듈 해시", "freezing": "동결 임계값", "compute": "연산 할당량",
      "memoryAlloc": "메모리 할당량", "snapshotsSize": "스냅샷 크기", "controllers": "컨트롤러",
      "youControl": "제어 중", "liveMetrics": "실시간 지표",
      "run": { "running": "실행 중", "stopping": "중지 중", "stopped": "중지됨" }
    },
    "canisterManage": {
      "eyebrow": "캐니스터", "title": "캐니스터 관리",
      "subtitle": "상태 확인, 시작/중지, 로그 보기 및 컨트롤러 추가. dfx 명령줄 없이 관리하세요.",
      "connectPrompt": "상태를 로드하고 캐니스터를 관리하려면 Internet Identity로 로그인하세요.",
      "lookupTitle": "캐니스터 로드",
      "lookupHint": "상태와 로그를 읽으려면 컨트롤러여야 합니다. 모든 캐니스터 충전에는 컨트롤러 권한이 필요하지 않습니다.",
      "actions": "작업", "start": "시작", "stop": "중지", "topUp": "사이클 충전",
      "topUpHint": "ICPay 지갑에서 이 캐니스터에 사이클을 추가합니다.", "logs": "로그",
      "logsHint": "실시간으로 캐니스터 로그를 가져옵니다.", "noLogs": "사용 가능한 로그가 없습니다.", "refresh": "새로고침",
      "addController": "컨트롤러 추가", "status": "상태", "statusHint": "공식 관리 캐니스터의 실시간 지표입니다."
    },
    "canisterCycles": {
      "eyebrow": "캐니스터", "title": "Cycles 지갑",
      "subtitle": "Cycles 원장에서 ICP를 사이클로 발행하고 모든 캐니스터로 출금합니다.",
      "ledgerBalance": "Cycles 원장 잔액", "mintTitle": "사이클 발행",
      "mintSubtitle": "ICP를 입금하여 Cycles 원장에 사이클을 발행합니다.",
      "withdrawTitle": "캐니스터로 출금", "withdrawSubtitle": "Cycles 원장에서 대상 캐니스터 ID로 사이클을 전송합니다.",
      "amount": "금액 (ICP)", "cyclesAmount": "사이클 수량 (T cycles)",
      "targetCanister": "대상 캐니스터 ID", "mintButton": "사이클 발행",
      "withdrawButton": "출금", "mintSuccess": "사이클이 성공적으로 발행되었습니다.",
      "withdrawSuccess": "사이클이 대상 캐니스터로 출금되었습니다."
    },
    "canisterSnapshots": {
      "eyebrow": "캐니스터", "title": "캐니스터 스냅샷",
      "subtitle": "캐니스터 상태 스냅샷을 생성, 복원 및 삭제합니다.",
      "takeSnapshot": "스냅샷 생성", "restoreSnapshot": "복원",
      "deleteSnapshot": "삭제", "snapshotsList": "스냅샷 목록",
      "noSnapshots": "스냅샷이 없습니다.", "snapshotId": "스냅샷 ID",
      "takenAt": "생성 일시", "totalSize": "총 크기"
    },
    "myCanisters": {
      "title": "내 캐니스터",
      "subtitle": "제어하는 캐니스터와 ID 및 이름으로 연결한 캐니스터 목록입니다. 상태와 작업이 여기에 모입니다.",
      "create": "생성", "link": "연결", "loading": "로딩 중…",
      "yourPrincipal": "내 Internet Identity (컨트롤러)",
      "principalHint": "백업 액세스를 위해 다른 계정의 생성 양식에 있는 '추가 컨트롤러'에 복사하세요.",
      "copyPrincipal": "프린시펄 복사", "addPlaceholder": "프린시펄 ID",
      "listTitle": "내 목록", "listHint": "이 브라우저에서 내 II에 연결되었습니다. 인덱스 이름이 있는 경우 표시됩니다.",
      "count": "{count}", "empty": "아직 없습니다. 새 캐니스터를 생성하거나 제어 중인 캐니스터를 연결하세요.",
      "back": "뒤로", "detailTitle": "상세 정보", "detailEmpty": "상태와 작업을 보려면 캐니스터를 선택하세요.",
      "metaName": "이름", "metaType": "유형", "metaLanguage": "언어",
      "metaUpdated": "인덱스 업데이트됨", "metaSubnet": "서브넷", "metaSubnetId": "서브넷 ID",
      "metaSubnetType": "서브넷 유형", "metaSubnetNodes": "가동 노드 수",
      "metaSubnetCanisters": "서브넷 캐니스터 수", "metaControllers": "컨트롤러",
      "metaUpgrades": "최근 업그레이드", "cyclesSource": "canister_status의 실시간 사이클 (컨트롤러 전용).",
      "publicApiHint": "사이클 잔액은 IC 인덱스 또는 ICRC API에서 공개되지 않으며 컨트롤러만 읽을 수 있습니다. 누구나 충전할 수 있습니다.",
      "menuActions": "작업", "view": "보기", "more": "더보기",
      "createWithBackup": "백업 컨트롤러와 함께 생성", "manage": "관리", "topUp": "충전",
      "start": "시작", "stop": "중지", "starting": "시작 중…", "stopping": "중지 중…",
      "stopConfirmTitle": "이 캐니스터를 중지하시겠습니까?",
      "stopConfirmBody": "중지하면 다시 시작할 때까지 실행이 일시 중지됩니다. 컨트롤러 전용.",
      "topUpTitle": "사이클 충전", "topUpHint": "CMC를 통해 지갑에서 ICP를 보내 이 캐니스터의 사이클 잔액에 추가합니다.",
      "topUpEstimate": "≈ {cycles} 사이클", "topUpEstimateLabel": "예상 사이클",
      "topUpEstimateHint": "CMC ICP→XDR 환율 기준 대략적 추정치입니다.", "topUpCancel": "취소",
      "topUpConfirm": "충전 확인", "transfer": "전송", "transferTitle": "사이클 전송",
      "transferHint": "공식 Cycles 원장 출금을 통해 내 Cycles 원장에서 다른 캐니스터로 전송합니다. 컨트롤러라도 캐니스터 자체 잔액에서 사이클을 인출할 수는 없습니다.",
      "transferFromContext": "출처", "transferAmount": "수량 (T cycles)",
      "transferConfirm": "전송 확인", "transferCancel": "취소", "transferring": "전송 중…",
      "transferSuccessTitle": "사이클 전송 완료", "transferSuccessBody": "Cycles 원장에서 대상 캐니스터로 입금되었습니다.",
      "transferLedgerEmpty": "Cycles 원장이 비어 있습니다.", "transferMintLink": "먼저 사이클 발행하기",
      "snapshots": "스냅샷", "copyId": "ID 복사", "copied": "복사됨",
      "topUpHistory": "충전 내역", "settings": "설정", "running": "실행 중",
      "dashboard": "IC 대시보드", "remove": "목록에서 제거", "rowDenied": "컨트롤러 아님",
      "backupHint": "시작 및 중지에는 컨트롤러 권한이 필요합니다. 충전은 모든 캐니스터에 대해 작동합니다.",
      "allTools": "모든 공개 도구", "linkTitle": "캐니스터 연결",
      "linkHint": "이미 생성된 캐니스터(dfx, NNS 등)를 연결합니다. NNS 연결과 동일하며 새 캐니스터가 생성되지 않습니다.",
      "linkId": "캐니스터 ID 입력", "linkName": "캐니스터 이름 입력 (선택사항)",
      "linkNamePlaceholder": "캐니스터 이름", "linkCancel": "취소", "linkConfirm": "확인",
      "linkSuccessTitle": "캐니스터 연결됨", "linkSuccessBody": "이 브라우저의 내 목록에 저장되었습니다.",
      "linkSuccessNamed": "“{name}”(으)로 저장되었습니다.", "invalidId": "올바른 캐니스터 ID를 입력하세요",
      "addController": "컨트롤러 추가", "addControllerTitle": "컨트롤러 추가",
      "addControllerHint": "update_settings를 통해 다른 프린시펄에 이 캐니스터의 완전한 제어 권한을 부여합니다. 컨트롤러 목록은 완전 대체 방식이며 현재 목록이 유지되고 새 프린시펄이 끝에 추가됩니다.",
      "addControllerLabel": "프린시펄 ID", "addControllerPlaceholder": "aaaaa-aa…",
      "addControllerFullListHint": "기존 컨트롤러는 그대로 유지되며 추가됩니다.",
      "addControllerConfirm": "컨트롤러 추가", "addControllerSubmitting": "추가 중…",
      "addControllerSuccessTitle": "컨트롤러 추가됨", "addControllerSuccessBody": "이 프린시펄로 이제 캐니스터를 관리할 수 있습니다.",
      "invalidPrincipal": "올바른 프린시펄 ID를 입력하세요"
    },
    "cyclesTopUp": {
      "eyebrow": "Cycles", "title": "캐니스터 충전",
      "subtitle": "ICPay 지갑으로 결제하세요. 필요한 경우 Internet Identity에 ICP를 보내고 공식 CMC를 통해 사이클을 발행합니다.",
      "formTitle": "충전", "formHint": "캐니스터 ID와 금액을 입력하세요. 절차: 지갑에서 전송 → CMC를 통해 발행 → 완료.",
      "canisterId": "캐니스터 ID", "canisterPlaceholder": "aaaaa-aa…",
      "canisterOk": "Internet Computer에서 캐니스터를 찾았습니다.",
      "canisterNotFound": "IC 인덱스에서 캐니스터를 찾을 수 없습니다. ID를 확인하세요.",
      "amount": "금액 (ICP)", "estimate": "예상 사이클",
      "estimateSource": "CMC 공식 ICP→XDR 환율 기준 추정치입니다.",
      "rateLine": "1 ICP ≈ {xdr} XDR ≈ {cycles} 사이클",
      "signIn": "Internet Identity로 로그인", "connecting": "연결 중…",
      "topUp": "지갑에서 충전", "toppingUp": "충전 중…",
      "sending": "지갑에서 전송 중…", "minting": "사이클 발행 중…",
      "stepSend": "지갑에서 전송", "stepMint": "사이클 발행", "stepDone": "완료",
      "flowHintSend": "충전을 위해 지갑에서 {amount} ICP를 전송한 후 발행합니다.",
      "flowHintMintOnly": "II 프린시펄에 이미 충분한 ICP가 있습니다 — 발행만 진행합니다.",
      "successTitle": "사이클 전송됨", "success": "캐니스터에 {cycles} 사이클이 발행되었습니다.",
      "successWithdrew": "먼저 ICPay 지갑에서 ICP가 출금되었습니다.",
      "successHint": "사이클이 입금되었습니다. 대시보드를 열어 상태를 확인하세요 (대부분의 캐니스터에서 잔액 확인은 컨트롤러 전용입니다).",
      "viewOnDashboard": "IC 대시보드에서 보기", "amountPaid": "지불 금액",
      "failed": "충전 실패", "blockIndex": "블록 인덱스", "invalidCanister": "올바른 캐니스터 프린시펄을 입력하세요",
      "invalidAmount": "올바른 ICP 금액을 입력하세요", "minAmount": "최소 금액은 0.01 ICP입니다",
      "maxAmount": "호출당 최대 50 ICP입니다", "insufficient": "ICPay 지갑의 ICP 잔액이 부족합니다 (금액 + 수수료)",
      "disclaimer": "컨트롤러가 아니어도 누구나 캐니스터를 충전할 수 있습니다. 공식 ICP 원장과 Cycles Minting Canister를 사용합니다.",
      "rateBadge": "1 ICP ≈ {xdr} XDR", "cyclesUnit": "cycles",
      "copyFailed": "캐니스터 ID를 복사할 수 없습니다", "stepLabel": "단계 {n}",
      "previewTitle": "미리보기", "previewRate": "CMC 환율", "previewStatus": "상태",
      "previewReady": "준비됨", "previewLiveCycles": "실시간 사이클",
      "previewNoController": "컨트롤러 아님", "previewLoadingStatus": "상태 로딩 중…",
      "liveStatusTitle": "실시간 캐니스터 상태",
      "runStatus": { "running": "실행 중", "stopping": "중지 중", "stopped": "중지됨" }
    },
    "canisterCreate": {
      "eyebrow": "캐니스터", "title": "캐니스터 생성",
      "subtitle": "ICPay 지갑으로 결제하세요. 필요한 경우 Internet Identity에 자금을 지원하고 공식 Cycles Minting Canister를 통해 생성합니다.",
      "formTitle": "생성", "formHint": "단계: 지갑에서 전송 → CMC를 통해 생성 → 완료. 남은 ICP는 초기 사이클이 됩니다.",
      "controller": "컨트롤러", "controllerTip": "CMC는 호출자(내 Internet Identity)를 컨트롤러로 요구합니다. 아래에 추가 프린시펄을 추가할 수 있습니다.",
      "extraControllers": "추가 컨트롤러", "extraControllersTip": "선택 사항. 캐니스터를 함께 제어할 쉼표로 구분된 프린시펄 목록입니다.",
      "extraControllersPlaceholder": "principal-1, principal-2",
      "subnet": "서브넷", "subnetTip": "기본값은 CMC가 서브넷을 선택하도록 합니다. 메뉴를 열어 다른 서브넷을 선택할 수 있습니다.",
      "subnetDefault": "기본값 (CMC 선택)", "amount": "금액 (ICP)",
      "estimate": "ICP 기준 예상 사이클", "estimateSource": "CMC ICP→XDR 환율 기준 대략적 추정치입니다. 생성 수수료 차감 후 나머지가 사이클로 남습니다.",
      "rateBadge": "1 ICP ≈ {xdr} XDR", "signIn": "Internet Identity로 로그인",
      "connecting": "연결 중…", "create": "지갑에서 생성", "creating": "생성 중…",
      "sending": "지갑에서 전송 중…", "stepSend": "지갑에서 전송", "stepCreate": "CMC를 통해 생성",
      "stepDone": "완료", "stepLabel": "단계 {n}",
      "flowHintSend": "생성 비용을 충당하기 위해 지갑에서 {amount} ICP를 전송하고 CMC에 알립니다.",
      "flowHintCreateOnly": "II 프린시펄에 충분한 ICP가 있습니다 — 생성만 진행합니다.",
      "successTitle": "캐니스터 생성됨", "success": "{canister} 캐니스터가 생성되었습니다.",
      "successWithdrew": "먼저 ICPay 지갑에서 ICP가 이동되었습니다.",
      "successHint": "귀하가 컨트롤러입니다. dfx 또는 개발 도구로 코드를 설치하고 잔액이 부족해지면 사이클을 충전하세요.",
      "viewOnDashboard": "IC 대시보드에서 보기", "topUpNext": "사이클 충전",
      "amountPaid": "금액", "blockIndex": "블록 인덱스", "canisterId": "캐니스터 ID",
      "failed": "생성 실패", "invalidAmount": "올바른 ICP 금액을 입력하세요",
      "minAmount": "최소 금액은 {min} ICP입니다 (생성 수수료 + 초기 사이클)", "maxAmount": "최대 금액은 50 ICP입니다",
      "insufficient": "지갑 잔액이 부족합니다 (금액 + 수수료)", "invalidController": "잘못된 프린시펄: {p}",
      "disclaimer": "공식 Cycles Minting Canister를 사용합니다. 귀하(및 추가한 프린시펄)가 유일한 컨트롤러입니다.",
      "cyclesUnit": "cycles", "copyFailed": "캐니스터 ID를 복사할 수 없습니다",
      "previewTitle": "미리보기", "previewRate": "CMC 환율", "previewFee": "생성 수수료",
      "previewInitialCycles": "초기 사이클"
    }
  }
}

for code, data in asian_translations.items():
    p = ROOT / code / "common.json"
    curr = json.loads(p.read_text(encoding="utf-8"))
    deep_update(curr, data)
    p.write_text(json.dumps(curr, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {code}")
