import json
from pathlib import Path

ROOT = Path("language")

# Translation dictionaries for canister modules & navigation
translations = {
  "ja": {
    "dashboard": {
      "quickActions": "クイックアクション"
    },
    "settings": {
      "sections": {
        "overview": "概要",
        "payments": "支払い",
        "money": "資金",
        "assets": "資産",
        "community": "コミュニティ",
        "services": "サービス",
        "insights": "インサイト",
        "identity": "アイデンティティ",
        "canisters": "キャニスター",
        "storage": "ストレージ",
        "activity": "アクティビティ",
        "more": "その他",
        "preferences": "環境設定",
        "legal": "法的事項"
      }
    },
    "publicSite": {
      "nav": {
        "sectionCanisters": "キャニスター",
        "canisters": {
          "mine": {
            "title": "マイキャニスター",
            "description": "作成または保存したすべてのキャニスターのステータスとクイックアクションを表示。"
          },
          "tools": {
            "title": "キャニスターツール",
            "description": "作成、管理、サイクル発行、チャージ、スナップショットを1つのハブから。"
          },
          "manage": {
            "title": "キャニスター管理",
            "description": "Internet Identity がコントローラーの場合のライブステータス、起動/停止、ログ。"
          },
          "create": {
            "title": "キャニスター作成",
            "description": "ICP を支払い、公式 CMC 経由で新しいキャニスター ID を取得。"
          },
          "cycles": {
            "title": "Cycles ウォレット",
            "description": "サイクル台帳に追加し、任意のキャニスターに出金。"
          },
          "topup": {
            "title": "サイクルチャージ",
            "description": "CMC 経由で任意のキャニスターに ICP をサイクルに変換。"
          },
          "snapshots": {
            "title": "スナップショット",
            "description": "管理しているキャニスターのスナップショットの取得、一覧、読み込み、削除。"
          }
        }
      },
      "footer": {
        "sectionCompany": "会社情報",
        "sectionExplore": "探索",
        "products": {
          "canister": "キャニスター",
          "topup": "サイクルチャージ"
        }
      }
    },
    "canisterHub": {
      "eyebrow": "キャニスター",
      "title": "キャニスターの作成と燃料補給",
      "subtitle": "新しい Internet Computer キャニスターの立ち上げやサイクルのチャージ — 公式 CMC 経由で ICPay ウォレットから直接支払い。dfx は不要です。",
      "createTitle": "キャニスター作成",
      "createDescription": "ICP を支払い、新しいキャニスター ID を取得。Internet Identity 経由であなたがコントローラーになります。",
      "topupTitle": "サイクルチャージ",
      "topupDescription": "任意のキャニスター ID に対して ICP をサイクルに変換。コントローラー権限は任意です。",
      "note": "フロントエンド専用ツールは公式 CMC と ICP レジャーを直接呼び出します。ICPay ウォレットからの出金は II プリンシパルに ICP が必要な場合のみ行われます。",
      "manageTitle": "キャニスター管理",
      "manageDescription": "Internet Identity がコントローラーである場合、リアルタイムステータス、起動/停止、ログを確認できます。",
      "cyclesTitle": "Cycles ウォレット",
      "cyclesDescription": "Cycles レジャーで ICP をサイクルに変換し、任意のキャニスターに出金します。",
      "snapshotsTitle": "スナップショット",
      "snapshotsDescription": "管理しているキャニスターのスナップショットの取得、一覧、読み込み、削除を行います。"
    },
    "canisterIdField": {
      "label": "キャニスター ID",
      "placeholder": "aaaaa-aa…",
      "choose": "マイキャニスター",
      "yours": "あなたのキャニスター",
      "emptyHint": "最初にキャニスターを作成してください — 後で選択できるようここに表示されます。"
    },
    "canisterStatus": {
      "cardTitle": "キャニスターステータス",
      "cardHint": "Internet Computer サブネットからのライブ状態。完全なメトリクスを表示するにはコントローラーである必要があります。",
      "createLink": "キャニスターを作成",
      "errorTitle": "ステータスを読み込めませんでした",
      "cycles": "サイクル",
      "reserved": "予約済みサイクル",
      "memory": "メモリ",
      "wasmMemory": "Wasm メモリ",
      "stableMemory": "Stable メモリ",
      "idleBurn": "アイドル消費",
      "version": "バージョン",
      "moduleHash": "モジュールハッシュ",
      "freezing": "凍結しきい値",
      "compute": "コンピュート割り当て",
      "memoryAlloc": "メモリ割り当て",
      "snapshotsSize": "スナップショットサイズ",
      "controllers": "コントローラー",
      "youControl": "あなたが管理中",
      "liveMetrics": "リアルタイムメトリクス",
      "run": {
        "running": "稼働中",
        "stopping": "停止処理中",
        "stopped": "停止"
      }
    },
    "canisterManage": {
      "eyebrow": "キャニスター",
      "title": "キャニスター管理",
      "subtitle": "ステータスの確認、起動/停止、ログの表示、コントローラーの追加。dfx コマンドラインなしで管理できます。",
      "connectPrompt": "ステータスを読み込んでキャニスターを管理するには Internet Identity でサインインしてください。",
      "lookupTitle": "キャニスターを読み込む",
      "lookupHint": "ステータスとログを読み込むにはあなたがコントローラーである必要があります。任意のキャニスターへのチャージはコントローラー権限不要です。",
      "actions": "アクション",
      "start": "開始",
      "stop": "停止",
      "topUp": "サイクルチャージ",
      "topUpHint": "このキャニスターに ICPay ウォレットからサイクルを追加。",
      "logs": "ログ",
      "logsHint": "キャニスターログをリアルタイムで取得。",
      "noLogs": "利用可能なログはありません。",
      "refresh": "更新",
      "addController": "コントローラー追加",
      "status": "ステータス",
      "statusHint": "公式 Management Canister からのライブメトリクス。"
    },
    "canisterCycles": {
      "eyebrow": "キャニスター",
      "title": "Cycles ウォレット",
      "subtitle": "ICP を Cycles Ledger のサイクルに変換し、任意のキャニスターに出金します。",
      "ledgerBalance": "Cycles Ledger 残高",
      "mintTitle": "サイクルを発行",
      "mintSubtitle": "ICP をデポジットして Cycles Ledger 上のサイクルに変換します。",
      "withdrawTitle": "キャニスターに出金",
      "withdrawSubtitle": "Cycles Ledger から任意のキャニスター ID にサイクルを転送します。",
      "amount": "金額 (ICP)",
      "cyclesAmount": "サイクル量 (T cycles)",
      "targetCanister": "送信先キャニスター ID",
      "mintButton": "サイクルを発行",
      "withdrawButton": "出金",
      "mintSuccess": "サイクルが正常に発行されました。",
      "withdrawSuccess": "サイクルが送信先キャニスターに出金されました。"
    },
    "canisterSnapshots": {
      "eyebrow": "キャニスター",
      "title": "キャニスターのスナップショット",
      "subtitle": "キャニスターのステートスナップショットの作成、読み込み、削除。",
      "takeSnapshot": "スナップショット作成",
      "restoreSnapshot": "復元",
      "deleteSnapshot": "削除",
      "snapshotsList": "スナップショット一覧",
      "noSnapshots": "スナップショットはありません。",
      "snapshotId": "スナップショット ID",
      "takenAt": "作成日時",
      "totalSize": "合計サイズ"
    },
    "myCanisters": {
      "title": "マイキャニスター",
      "subtitle": "管理しているキャニスター、および ID や名前でリンクしたキャニスター。ステータスと操作はここに集約されます。",
      "create": "作成",
      "link": "リンク",
      "loading": "読み込み中…",
      "yourPrincipal": "あなたの Internet Identity (コントローラー)",
      "principalHint": "バックアップアクセス用に、他のアカウントの作成フォームの「追加コントローラー」にこれをコピーしてください。",
      "copyPrincipal": "プリンシパルをコピー",
      "addPlaceholder": "プリンシパル ID",
      "listTitle": "マイリスト",
      "listHint": "このブラウザの II 用にリンクされています。利用可能な場合はインデックス名が表示されます。",
      "count": "{count}",
      "empty": "まだありません。キャニスターを作成するか、管理しているキャニスターをリンクしてください。",
      "back": "戻る",
      "detailTitle": "詳細",
      "detailEmpty": "ステータスと操作を表示するにはキャニスターを選択してください。",
      "metaName": "名前",
      "metaType": "タイプ",
      "metaLanguage": "言語",
      "metaUpdated": "インデックス更新日時",
      "metaSubnet": "サブネット",
      "metaSubnetId": "サブネット ID",
      "metaSubnetType": "サブネットタイプ",
      "metaSubnetNodes": "稼働ノード数",
      "metaSubnetCanisters": "サブネットキャニスター数",
      "metaControllers": "コントローラー",
      "metaUpgrades": "最近のアップグレード",
      "cyclesSource": "canister_status からのリアルタイムサイクル（コントローラーのみ）。",
      "publicApiHint": "サイクル残高は IC インデックスや ICRC API では公開されておらず、コントローラーのみが読み取れます。誰でもチャージは可能です",
      "menuActions": "アクション",
      "view": "表示",
      "more": "その他",
      "createWithBackup": "バックアップコントローラー付きで作成",
      "manage": "管理",
      "topUp": "チャージ",
      "start": "開始",
      "stop": "停止",
      "starting": "開始処理中…",
      "stopping": "停止処理中…",
      "stopConfirmTitle": "このキャニスターを停止しますか？",
      "stopConfirmBody": "停止すると、再開するまで実行が一時停止します。コントローラーのみ実行可能。",
      "topUpTitle": "サイクルチャージ",
      "topUpHint": "CMC 経由でウォレットから ICP を送信し、このキャニスターのサイクル残高に追加します。",
      "topUpEstimate": "≈ {cycles} サイクル",
      "topUpEstimateLabel": "推定サイクル",
      "topUpEstimateHint": "CMC ICP→XDR レートからの概算です。",
      "topUpCancel": "キャンセル",
      "topUpConfirm": "チャージを確定",
      "transfer": "転送",
      "transferTitle": "サイクル転送",
      "transferHint": "公式 Cycles Ledger の出金機能を使用して、サイクル台帳から別のキャニスターに送信します。コントローラーであってもキャニスター自体の残高からサイクルを引き出すことはできません。",
      "transferFromContext": "転送元",
      "transferAmount": "金額 (T cycles)",
      "transferConfirm": "転送を確定",
      "transferCancel": "キャンセル",
      "transferring": "転送中…",
      "transferSuccessTitle": "サイクル転送完了",
      "transferSuccessBody": "Cycles Ledger から送信先キャニスターに入金されました。",
      "transferLedgerEmpty": "Cycles Ledger が空です。",
      "transferMintLink": "最初にサイクルを発行",
      "snapshots": "スナップショット",
      "copyId": "ID をコピー",
      "copied": "コピーしました",
      "topUpHistory": "チャージ履歴",
      "settings": "設定",
      "running": "稼働中",
      "dashboard": "IC ダッシュボード",
      "remove": "リストから削除",
      "rowDenied": "コントローラーではありません",
      "backupHint": "起動と停止にはコントローラー権限が必要です。チャージは任意のキャニスターで機能します。",
      "allTools": "すべての公開ツール",
      "linkTitle": "キャニスターをリンク",
      "linkHint": "作成済みのキャニスター（dfx、NNS など）を紐付けます。NNS の「キャニスターのリンク」と同じで、新しいキャニスターは作成されません。",
      "linkId": "キャニスター ID を入力",
      "linkName": "キャニスター名を入力 (任意)",
      "linkNamePlaceholder": "キャニスター名",
      "linkCancel": "キャンセル",
      "linkConfirm": "確定",
      "linkSuccessTitle": "キャニスターをリンクしました",
      "linkSuccessBody": "このブラウザのマイリストに保存されました。",
      "linkSuccessNamed": "「{name}」として保存されました。",
      "invalidId": "有効なキャニスター ID を入力してください",
      "addController": "コントローラー追加",
      "addControllerTitle": "コントローラー追加",
      "addControllerHint": "update_settings 経由で別のプリンシパルにこのキャニスターの完全な制御権を付与します。コントローラーリストは完全置換されるため、現在のリストを取得して保持し、このプリンシパルのみが末尾に追加されます。",
      "addControllerLabel": "プリンシパル ID",
      "addControllerPlaceholder": "aaaaa-aa…",
      "addControllerFullListHint": "既存のコントローラーはそのまま保持され、追加されます。",
      "addControllerConfirm": "コントローラーを追加",
      "addControllerSubmitting": "追加中…",
      "addControllerSuccessTitle": "コントローラーを追加しました",
      "addControllerSuccessBody": "このプリンシパルでキャニスターを管理できるようになりました。",
      "invalidPrincipal": "有効なプリンシパル ID を入力してください"
    },
    "cyclesTopUp": {
      "eyebrow": "Cycles",
      "title": "キャニスターにサイクルをチャージ",
      "subtitle": "ICPay ウォレットでお支払い。必要に応じて Internet Identity に ICP を送信し、公式 CMC 経由でサイクルを発行します。",
      "formTitle": "チャージ",
      "formHint": "キャニスター ID と金額を入力してください。処理の流れ: ウォレットから送信 → CMC 経由で発行 → 完了。",
      "canisterId": "キャニスター ID",
      "canisterPlaceholder": "aaaaa-aa…",
      "canisterOk": "Internet Computer 上でキャニスターが見つかりました。",
      "canisterNotFound": "IC インデックス上でキャニスターが見つかりません。ID を確認してください。",
      "amount": "金額 (ICP)",
      "estimate": "推定サイクル",
      "estimateSource": "CMC 公式 ICP→XDR 換算レートによる概算です。",
      "rateLine": "1 ICP ≈ {xdr} XDR ≈ {cycles} サイクル",
      "signIn": "Internet Identity でサインイン",
      "connecting": "接続中…",
      "topUp": "ウォレットからチャージ",
      "toppingUp": "チャージ中…",
      "sending": "ウォレットから送信中…",
      "minting": "サイクルを発行中…",
      "stepSend": "ウォレットから送信",
      "stepMint": "サイクル発行",
      "stepDone": "完了",
      "flowHintSend": "チャージ費用を賄うためウォレットから {amount} ICP を送信し、サイクルを発行します。",
      "flowHintMintOnly": "II プリンシパルに十分な ICP があります — 発行のみ行います。",
      "successTitle": "サイクルを送信しました",
      "success": "{cycles} サイクルをキャニスターに発行しました。",
      "successWithdrew": "最初に ICPay ウォレットから ICP が引き落とされました。",
      "successHint": "サイクルが入金されました。ダッシュボードを開いてステータスを確認してください（多くのキャニスターで残高確認はコントローラーのみ可能です）。",
      "viewOnDashboard": "IC ダッシュボードでキャニスターを表示",
      "amountPaid": "支払額",
      "failed": "チャージに失敗しました",
      "blockIndex": "ブロックインデックス",
      "invalidCanister": "有効なキャニスタープリンシパルを入力してください",
      "invalidAmount": "有効な ICP 金額を入力してください",
      "minAmount": "最小金額は 0.01 ICP です",
      "maxAmount": "1回あたりの最大金額は 50 ICP です",
      "insufficient": "ICPay ウォレットの ICP 残高が不足しています (金額 + 手数料)",
      "disclaimer": "コントローラーでなくても誰でも任意のキャニスターにチャージできます。公式の ICP レジャーおよび Cycles Minting Canister を使用します。",
      "rateBadge": "1 ICP ≈ {xdr} XDR",
      "cyclesUnit": "サイクル",
      "copyFailed": "キャニスター ID をコピーできませんでした",
      "stepLabel": "ステップ {n}",
      "previewTitle": "プレビュー",
      "previewRate": "CMC レート",
      "previewStatus": "ステータス",
      "previewReady": "準備完了",
      "previewLiveCycles": "現在のサイクル数",
      "previewNoController": "コントローラーではありません",
      "previewLoadingStatus": "ステータス読み込み中…",
      "liveStatusTitle": "リアルタイムキャニスター状態",
      "runStatus": {
        "running": "稼働中",
        "stopping": "停止処理中",
        "stopped": "停止"
      }
    },
    "canisterCreate": {
      "eyebrow": "キャニスター",
      "title": "キャニスターを作成",
      "subtitle": "ICPay ウォレットでお支払い。必要に応じて Internet Identity に資金を供給し、公式 Cycles Minting Canister 経由で作成します。",
      "formTitle": "作成",
      "formHint": "ステップ: ウォレットから送信 → CMC 経由で作成 → 完了。残りの ICP は初期サイクルになります。",
      "controller": "コントローラー",
      "controllerTip": "CMC は呼び出し元 (あなたの Internet Identity) をコントローラーとして要求します。追加のプリンシパルは以下で追加できます。",
      "extraControllers": "追加コントローラー",
      "extraControllersTip": "任意。キャニスターを同様に管理するプリンシパル（カンマ区切り）。"
    }
  }
}

def deep_update(target, source):
    for k, v in source.items():
        if isinstance(v, dict) and isinstance(target.get(k), dict):
            deep_update(target[k], v)
        else:
            target[k] = v

for code, data in translations.items():
    p = ROOT / code / "common.json"
    curr = json.loads(p.read_text(encoding="utf-8"))
    deep_update(curr, data)
    p.write_text(json.dumps(curr, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {code}")
