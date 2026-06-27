"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "ja" | "en" | "ko";
const KEY = "angle-log-lang";

// ── Translation shape ─────────────────────────────────────────────────────────

export interface Translations {
  before: string;
  after: string;
  close: string;

  // Uploader / main page
  tapToSelect: string;
  autoCompress: string;
  changePhoto: string;
  removeAnnotation: string;
  analyzeButton: string;
  analyzing: string;
  metricInfoButton: string;
  serverError: string;
  partialDetectionNotice: string;
  terms: string;
  privacy: string;

  // MetricInfoModal
  modalTitle: string;
  modalSubtitle: string;

  // Metric definitions (modal + result)
  metrics: {
    yaw:        { title: string; sub: string; desc: string };
    brightness: { title: string; sub: string; desc: string };
    pitch:      { title: string; sub: string; desc: string };
    roll:       { title: string; sub: string; desc: string };
  };

  // Result
  notScored: string;
  detailsOpen: string;
  detailsClose: string;
  editScoring: string;
  levelOk: string;
  levelWarn: string;
  levelDanger: string;
  overallOk: string;
  overallWarn: string;
  overallDanger: string;
  overallDescOk: string;
  overallDescWarn: string;
  overallDescDanger: string;

  contextDetail: {
    yaw: {
      dirRight: string; dirLeft: string;
      ok:     (abs: number, dir: string) => string;
      warn:   (abs: number, dir: string) => string;
      danger: (abs: number, dir: string) => string;
    };
    pitch: {
      dirUp: string; dirDown: string;
      ok:   (abs: number, dir: string) => string;
      warn: (abs: number, dir: string) => string;
    };
    roll: {
      dirRight: string; dirLeft: string;
      ok:   (abs: number, dir: string) => string;
      warn: (abs: number, dir: string) => string;
    };
    brightness: {
      ok:     (abs: number) => string;
      warn:   (abs: number) => string;
      danger: (abs: number) => string;
    };
  };

  // SaveCTA
  savedTitle: string;
  timelineLink: string;
  savePrompt: string;
  saveSubtext: string;
  saveButton: string;
  saving: string;
  savePromptGuest: string;
  saveSubtextGuest: string;
  signupButton: string;
  signupModalTitle: string;
  signupModalDesc: string;
  loginLink: string;

  // Nav
  navChecker: string;
  navCapture: string;
  navTimeline: string;
  navSettings: string;
  navLogin: string;
  navLogout: string;
  navUnsavedLeave: string;
  navUnsavedLogout: string;

  // CaptureGuide
  captureGuideTitle: string;
  captureStep1: string;
  captureStep2: string;
  captureStep3: string;
  captureStep4: string;
  captureHint: string;
  captureAngleSection: string;
  captureSelectedCount: (n: number) => string;
  captureAddAngle: string;
  captureAnglePlaceholder: string;
  captureLabelPlaceholder: string;
  captureAdd: string;
  captureAddError: string;
  captureAddFailed: string;
  captureDelete: string;
  captureStartDisabled: string;
  captureStart: (n: number) => string;

  // Photo guide image
  photoGuide: string;
  photoGuideAlt: string;

  // Settings page
  settingsTitle: string;
  settingsAccountSection: string;
  settingsDisplayName: string;
  settingsDisplayNamePlaceholder: string;
  settingsSaved: string;
  settingsSave: string;
  settingsEmail: string;
  settingsAppearanceSection: string;
  settingsTheme: string;
  settingsThemeDesc: string;
  settingsDark: string;
  settingsLight: string;
  settingsScoringSection: string;
  settingsScoringDesc: string;
  settingsPresetSection: string;
  settingsPresetDesc: string;

  // Timeline page
  timelineTitle: string;
  timelineDiaryTab: string;
  timelineCheckerTab: string;
  timelineSearchPlaceholder: string;
  timelineSelectedCount: (n: number) => string;
  timelineDeleteSessionConfirm: (label: string) => string;
  timelineDeleteCaseConfirm: (name: string) => string;
  timelineDeleteCheckerConfirm: string;
  timelineCompareCount: (n: number) => string;
  timelineCompareButton: string;
  timelineEmpty: string;
  timelineEmptyHint: string;
  timelineUncategorized: string;
  timelineSessionCount: (n: number) => string;
  timelineDeleting: string;
  timelineDelete: string;
  timelineNoSessions: string;
  timelineUnlabeled: string;

  // Capture page
  capturePageTitle: string;
  captureTimingOptions: string[];
  captureTimingOther: string;
  capturePreviewTitle: string;
  capturePhotoCount: (n: number) => string;
  captureRetake: string;
  captureProceed: string;
  captureDetailsTitle: string;
  captureCaseLabel: string;
  captureTimingLabel: string;
  captureClearTiming: string;
  captureSuggestedTimingText: (timing: string) => string;
  captureSelectTiming: string;
  captureDateLabel: string;
  captureNotesLabel: string;
  captureNotesPlaceholder: string;
  captureSaveFailed: string;
  captureUploadFailed: string;
  captureBack: string;
  captureSavingText: string;
  captureSaveText: string;
  captureDoneTitle: string;
  captureAddedTo: (name: string) => string;
  captureContinueCapture: string;
  captureGoToTimeline: string;
  captureCustomTimingPlaceholder: string;

  // Case picker
  casePickerTitle: string;
  casePickerDesc: string;
  casePickerNameRequired: string;
  casePickerCreateFailed: string;
  casePickerNewButton: string;
  casePickerCaseNameLabel: string;
  casePickerCaseNamePlaceholder: string;
  casePickerMemoLabel: string;
  casePickerMemoPlaceholder: string;
  casePickerBackButton: string;
  casePickerCreatingText: string;
  casePickerCreateButton: string;
  casePickerBackToPreview: string;

  // Checker timeline
  checkerEmpty: string;
  checkerEmptyHint: string;
  checkerAllLabels: string;
  checkerNoLabel: string;
  checkerResultCount: (n: number) => string;
  checkerNoResults: string;
  checkerAddLabel: string;
  checkerYawLabel: string;
  checkerBrightnessLabel: string;
  checkerCustomInput: string;
  checkerConfirm: string;
  checkerCancel: string;
  checkerLevelAll: string;
  checkerPresetLabels: string[];

  // Disclaimer
  disclaimer: string;

  // ShareButton
  shareClinicLabel: string;
  shareClinicPlaceholder: string;
  shareButton: string;
  shareXButton: string;
  shareLineButton: string;
  shareDownloadButton: string;
  shareModalTitle: string;
  shareGenerating: string;
  shareDownloadHint: string;
  shareError: string;
  shareTweetText: (overall: string, yaw: number, brightness: number, clinic: string, shareUrl?: string) => string;
  shareLineText: (overall: string, yaw: number, brightness: number, clinic: string) => string;
  shareImageOverall: (overall: string) => string;
  shareImageYaw: (diff: number) => string;
  shareImageBrightness: (diff: number) => string;

  // AnglePresetEditor
  presetDelete: string;
  presetAdd: string;
  presetAnglePlaceholder: string;
  presetLabelPlaceholder: string;
  presetAddError: string;
  presetAddFailed: string;
  presetDeleteFailed: string;
  presetDefaultLabel: (yaw: number) => string;

  // CameraCapture hints
  cameraHintFront: string;
  cameraHintTurnRight: string;
  cameraHintTurnLeft: string;
  cameraHintHold: string;
  cameraHintRollRight: string;
  cameraHintRollLeft: string;
  cameraHintPitchDown: string;
  cameraHintPitchUp: string;
  cameraHintMoreFront: string;

  // Annotation modal (InpaintModal)
  annotationTitle: string;
  annotationAutoTab: string;
  annotationManualTab: string;
  annotationAutoHint: string;
  annotationButtonDesc: string;
  annotationDetecting: string;
  annotationNoneDetected: string;
  annotationCornerTL: string;
  annotationCornerTR: string;
  annotationCornerBL: string;
  annotationCornerBR: string;
  annotationColorLabel: string;
  annotationRemove: string;
  annotationRemoving: string;
  annotationManualHint: string;
  annotationBrushLabel: (n: number) => string;
  annotationUndo: string;
  annotationClear: string;
  annotationApply: string;
  annotationApplying: string;
  annotationApplyError: string;

  // Annotation feature intro (main page)
  annotationFeatureTitle: string;
  annotationFeatureDesc: string;

  // Login page
  loginTitle: string;
  loginEmail: string;
  loginPassword: string;
  loginButton: string;
  loginLoading: string;
  loginNoAccount: string;
  loginSignupLink: string;
  loginErrorNotConfirmed: string;
  loginErrorFailed: string;
  loginResendButton: string;
  loginResendLoading: string;
  loginResendSent: string;

  // Signup page
  signupTitle: string;
  signupPassword: string;
  signupPasswordConfirm: string;
  signupSubmitButton: string;
  signupLoading: string;
  signupHasAccount: string;
  signupLoginLink: string;
  signupErrorMismatch: string;
  signupErrorTooShort: string;
  signupErrorFailed: string;
  signupCheckEmailTitle: string;
  signupCheckEmailDesc: (email: string) => string;
  signupCheckEmailSpam: string;
  signupGoToLogin: string;

  // SaveCTA errors
  saveErrorLoginRequired: string;
  saveErrorUploadFailed: string;
  saveErrorDbFailed: string;
  saveErrorGeneric: string;

  // Dashboard hero image
  dashboardHeroImage: string;

  // Dashboard checker warnings
  dashboardDottedLineTitle: string;
  dashboardDottedLineDesc: string;
  dashboardAnnotationTip: string;
  dashboardDecoWarningImage: string;

  // Dashboard
  dashboardTagline: string;
  dashboardHeroTitle: string;
  dashboardHeroP1: string;
  dashboardHeroP2: string;
  dashboardCheckerTag: string;
  dashboardCheckerTitle: string;
  dashboardCheckerDesc: string;
  dashboardCheckerCTA: string;
  dashboardMetricCTA: string;
  dashboardCaptureTag: string;
  dashboardCaptureTitle: string;
  dashboardCaptureDesc: string;
  dashboardCaptureCTA: string;
  dashboardTimelineTag: string;
  dashboardTimelineTitle: string;
  dashboardTimelineDesc: string;
  dashboardTimelineCTA: string;

  // SiteHeader unsaved-warning
  unsavedLeave: string;
  unsavedLogout: string;

  // Consent modal
  consentModalTitle: string;
  consentModalDesc: string;
  consentModalBullets: string[];
  consentPre: string;
  consentMid: string;
  consentPost: string;
  consentAgree: string;

  // Login — forgot password link
  loginForgotLink: string;

  // Forgot password page
  forgotPasswordTitle: string;
  forgotPasswordDesc: string;
  forgotPasswordButton: string;
  forgotPasswordLoading: string;
  forgotPasswordSentTitle: string;
  forgotPasswordSentDesc: (email: string) => string;
  forgotPasswordBackToLogin: string;

  // Reset password page
  resetPasswordTitle: string;
  resetPasswordNew: string;
  resetPasswordConfirm: string;
  resetPasswordButton: string;
  resetPasswordLoading: string;
  resetPasswordSuccessTitle: string;
  resetPasswordSuccessDesc: string;
  resetPasswordGoToLogin: string;
  resetPasswordErrorMismatch: string;
  resetPasswordErrorTooShort: string;
  resetPasswordErrorFailed: string;
  resetPasswordErrorExpired: string;

  // Password change (settings page)
  settingsPasswordSection: string;
  settingsPasswordNew: string;
  settingsPasswordConfirm: string;
  settingsPasswordSave: string;
  settingsPasswordSaving: string;
  settingsPasswordSaved: string;
  settingsPasswordErrorMismatch: string;
  settingsPasswordErrorTooShort: string;
  settingsPasswordErrorFailed: string;

  // Account deletion (settings page)
  deleteAccountSection: string;
  deleteAccountDesc: string;
  deleteAccountButton: string;
  deleteAccountConfirmTitle: string;
  deleteAccountConfirmDesc: string;
  deleteAccountConfirmButton: string;
  deleteAccountCancel: string;
  deleteAccountDeleting: string;
  deleteAccountError: string;

  // 404 not-found page
  notFoundTitle: string;
  notFoundDesc: string;
  notFoundHome: string;
}

// ── Japanese ──────────────────────────────────────────────────────────────────

const ja: Translations = {
  before: "ビフォー",
  after: "アフター",
  close: "閉じる",

  tapToSelect: "タップして写真を選択",
  autoCompress: "5MB 超は自動圧縮",
  changePhoto: "写真を変更",
  removeAnnotation: "✏ 加工を外す",
  analyzeButton: "角度・明るさを解析する",
  analyzing: "解析中...",
  metricInfoButton: "評価基準とは？",
  serverError: "サーバーとの通信に失敗しました。しばらく待ってから再試行してください。",
  partialDetectionNotice: "顔全体を検出できなかったため、角度は概算値または未計測です。横顔・パーツ単体の写真では明るさの比較を参考にしてください。",
  terms: "利用規約",
  privacy: "プライバシーポリシー",

  modalTitle: "評価基準について",
  modalSubtitle: "アニメーションで動きを確認できます",

  metrics: {
    yaw: {
      title: "左右のズレ（Yaw）",
      sub:   "最も重要な指標",
      desc:  "正面を向いたときの左右への回転差です。術後写真だけ少し横を向いていると、鼻筋が細く見えたり、輪郭が変わって見えたりします。5°以内が理想的です。",
    },
    brightness: {
      title: "明るさの差",
      sub:   "照明操作を検出",
      desc:  "写真全体の平均明るさの差です。術後だけ照明を強くすると、肌のトーンが均一に見え、腫れや赤みのダウンタイムが目立たなくなります。",
    },
    pitch: {
      title: "上下のズレ（Pitch）",
      sub:   "あごを引く・上げる方向",
      desc:  "顔の上下方向の傾きです（あごを引く・上げる動き）。撮影時に自然に変動しやすく、左右ズレよりは見た目への影響が小さいため、デフォルトでは採点対象外です。",
    },
    roll: {
      title: "首の傾き（Roll）",
      sub:   "首を左右に傾ける方向",
      desc:  "首を左右に傾けたときの回転差です。体勢や撮影アングルで変動しやすく、術前後で自然に発生しやすいため、デフォルトでは採点対象外です。",
    },
  },

  notScored: "採点対象外",
  detailsOpen: "詳しく見る ▼",
  detailsClose: "閉じる ▲",
  editScoring: "採点項目を変更する",
  levelOk: "許容範囲",
  levelWarn: "やや気になる",
  levelDanger: "相当ずれている",
  overallOk: "ほぼ正確",
  overallWarn: "黄色信号",
  overallDanger: "怪しい",
  overallDescOk: "角度・明るさともに許容範囲内。比較写真として信頼できます。",
  overallDescWarn: "一部の項目が気になる水準。参考にはなりますが注意が必要です。",
  overallDescDanger: "大きなズレが確認されました。写真の条件が揃っておらず、見た目の差が施術効果とは限りません。",

  contextDetail: {
    yaw: {
      dirRight: "右",
      dirLeft:  "左",
      ok:     (abs, dir) => `ビフォーとアフターで${abs}°の左右差（${dir}向き）です。許容範囲内ですが、5°以内が理想的です。`,
      warn:   (abs, dir) => `ビフォーとアフターで${abs}°の左右差（${dir}向き）があります。顔の向きが変わると鼻筋や輪郭の印象が大きく変わるため、注意が必要です。`,
      danger: (abs, dir) => `ビフォーとアフターで${abs}°の大きな左右差（${dir}向き）があります。この角度差では見た目に顕著な違いが出ます。クリニックに確認することをおすすめします。`,
    },
    pitch: {
      dirUp:   "上向き",
      dirDown: "あごを引いた方向",
      ok:   (abs, dir) => `ビフォーとアフターで${abs}°の上下差（${dir}）があります。大きな影響はありません。`,
      warn: (abs, dir) => `ビフォーとアフターで${abs}°の上下差（${dir}）があります。あごの位置が変わると首の長さや輪郭の見え方が変化します。`,
    },
    roll: {
      dirRight: "右",
      dirLeft:  "左",
      ok:   (abs, dir) => `ビフォーとアフターで${abs}°の首の傾き差（${dir}傾き）があります。自然な変動の範囲内です。`,
      warn: (abs, dir) => `ビフォーとアフターで${abs}°の首の傾き差（${dir}傾き）があります。撮影時の姿勢の差が見た目に影響する場合があります。`,
    },
    brightness: {
      ok:     (abs) => `ビフォーとアフターで${abs}%の明るさ差があります。許容範囲内です。`,
      warn:   (abs) => `ビフォーとアフターで${abs}%の明るさ差があります。照明の違いが肌のコンディションの見え方に影響している可能性があります。`,
      danger: (abs) => `ビフォーとアフターで${abs}%の大きな明るさ差があります。腫れや赤みが照明によって目立ちにくくなっている可能性があります。`,
    },
  },

  savedTitle: "保存しました",
  timelineLink: "タイムラインで確認 →",
  savePrompt: "この結果を保存しますか？",
  saveSubtext: "タイムラインのチェッカー履歴に保存されます",
  saveButton: "保存する",
  saving: "保存中…",
  savePromptGuest: "結果を保存しませんか？",
  saveSubtextGuest: "会員登録すると複数アングルの撮影・タイムライン保存ができます",
  signupButton: "無料で会員登録する",
  signupModalTitle: "保存するには会員登録が必要です",
  signupModalDesc: "登録すると複数アングル撮影・タイムライン保存・比較機能が使えます",
  loginLink: "ログイン",

  navChecker: "チェッカー",
  navCapture: "撮影",
  navTimeline: "タイムライン",
  navSettings: "設定",
  navLogin: "ログイン",
  navLogout: "ログアウト",
  navUnsavedLeave: "撮影した写真がまだ保存されていません。\nこのページを離れますか？",
  navUnsavedLogout: "撮影した写真がまだ保存されていません。\nログアウトしますか？",

  captureGuideTitle: "顔の動かし方",
  captureStep1: "正面を向く（自動撮影）",
  captureStep2: "ゆっくり右を向く（指定角度で自動撮影）",
  captureStep3: "正面に戻る",
  captureStep4: "ゆっくり左を向く（指定角度で自動撮影）",
  captureHint: "各角度で止まると自動でシャッターが切れます。\nゆっくり動かすほど精度が上がります。",
  captureAngleSection: "撮影角度",
  captureSelectedCount: (n) => `${n}角度選択中`,
  captureAddAngle: "角度を追加",
  captureAnglePlaceholder: "角度",
  captureLabelPlaceholder: "ラベル（省略可）",
  captureAdd: "追加",
  captureAddError: "角度は -180〜180 で入力してください",
  captureAddFailed: "追加に失敗しました",
  captureDelete: "削除",
  captureStartDisabled: "角度を1つ以上選択してください",
  captureStart: (n) => `カメラを起動して開始（${n}角度）`,

  photoGuide: "/photo-guide.jpg",
  photoGuideAlt: "写真の撮り方ガイド",

  settingsTitle: "設定",
  settingsAccountSection: "アカウント",
  settingsDisplayName: "表示名",
  settingsDisplayNamePlaceholder: "例：田中クリニック",
  settingsSaved: "保存済み ✓",
  settingsSave: "保存",
  settingsEmail: "メールアドレス",
  settingsAppearanceSection: "外観",
  settingsTheme: "テーマ",
  settingsThemeDesc: "ダークモード・ライトモードを切り替えます。",
  settingsDark: "ダーク",
  settingsLight: "ライト",
  settingsScoringSection: "チェッカー — 採点指標",
  settingsScoringDesc: "チェッカーで最初から採点に含める指標を選べます。結果画面でも個別に変更できます。",
  settingsPresetSection: "撮影角度プリセット",
  settingsPresetDesc: "正の値 = 右向き、負の値 = 左向き",

  timelineTitle: "タイムライン",
  timelineDiaryTab: "顔日記",
  timelineCheckerTab: "チェッカー",
  timelineSearchPlaceholder: "ケース名・メモで検索…",
  timelineSelectedCount: (n) => `${n}件選択中`,
  timelineDeleteSessionConfirm: (label) => `「${label}」を削除しますか？`,
  timelineDeleteCaseConfirm: (name) => `ケース「${name}」とその中の全セッションを削除しますか？\nこの操作は取り消せません。`,
  timelineDeleteCheckerConfirm: "このチェッカー結果を削除しますか？",
  timelineCompareCount: (n) => `${n}件を比較`,
  timelineCompareButton: "比較する →",
  timelineEmpty: "まだデータがありません",
  timelineEmptyHint: "「撮影」から始めてください",
  timelineUncategorized: "未分類",
  timelineSessionCount: (n) => `${n}件`,
  timelineDeleting: "削除中…",
  timelineDelete: "削除",
  timelineNoSessions: "セッションがありません",
  timelineUnlabeled: "未選択",

  capturePageTitle: "撮影",
  captureTimingOptions: ["術前", "術後当日", "術後3日", "術後1週間", "術後2週間", "術後1ヶ月", "術後2ヶ月", "術後3ヶ月", "術後6ヶ月", "術後1年"],
  captureTimingOther: "その他",
  capturePreviewTitle: "撮影した写真を確認",
  capturePhotoCount: (n) => `${n}枚撮影しました`,
  captureRetake: "再撮影する",
  captureProceed: "これで進む →",
  captureDetailsTitle: "撮影情報を入力",
  captureCaseLabel: "ケース：",
  captureTimingLabel: "撮影時期",
  captureClearTiming: "未選択に戻す",
  captureSuggestedTimingText: (timing) => `手術日から自動計算 → ${timing} を選択中`,
  captureSelectTiming: "時期を選択する（任意）",
  captureDateLabel: "撮影日",
  captureNotesLabel: "コメント（任意）",
  captureNotesPlaceholder: "気になる点、変化など…",
  captureSaveFailed: "保存に失敗しました",
  captureUploadFailed: "写真のアップロードに失敗しました",
  captureBack: "戻る",
  captureSavingText: "保存中…",
  captureSaveText: "保存する",
  captureDoneTitle: "保存しました",
  captureAddedTo: (name) => `${name} に追加されました`,
  captureContinueCapture: "続けて撮影",
  captureGoToTimeline: "タイムラインへ",
  captureCustomTimingPlaceholder: "例：術後4ヶ月",

  casePickerTitle: "どのケースに保存しますか？",
  casePickerDesc: "症例や患者ごとにまとめられます",
  casePickerNameRequired: "ケース名を入力してください",
  casePickerCreateFailed: "作成に失敗しました",
  casePickerNewButton: "＋ 新しく追加",
  casePickerCaseNameLabel: "ケース名",
  casePickerCaseNamePlaceholder: "例：症例①　鼻",
  casePickerMemoLabel: "メモ（任意）",
  casePickerMemoPlaceholder: "例：鼻尖縮小・隆鼻",
  casePickerBackButton: "戻る",
  casePickerCreatingText: "作成中…",
  casePickerCreateButton: "作成して選択",
  casePickerBackToPreview: "← 写真の確認に戻る",

  checkerEmpty: "チェッカー結果がまだありません",
  checkerEmptyHint: "チェッカーで写真を解析して「保存する」を押してください",
  checkerAllLabels: "すべてのラベル",
  checkerNoLabel: "ラベルなし",
  checkerResultCount: (n) => `${n}件`,
  checkerNoResults: "該当する結果がありません",
  checkerAddLabel: "＋ラベル",
  checkerYawLabel: "左右ズレ",
  checkerBrightnessLabel: "明るさ差",
  checkerCustomInput: "カスタム入力…",
  checkerConfirm: "決定",
  checkerCancel: "キャンセル",
  checkerLevelAll: "全て",
  checkerPresetLabels: ["鼻", "目", "目元", "輪郭", "顎", "頬", "唇", "額", "フェイスライン"],

  disclaimer: "本ツールの結果は参考情報であり、医学的・専門的な判断ではありません。",

  shareClinicLabel: "クリニック名（任意）",
  shareClinicPlaceholder: "例：〇〇クリニック",
  shareButton: "SNSでシェア",
  shareXButton: "Xでシェア",
  shareLineButton: "LINEでシェア",
  shareDownloadButton: "画像をダウンロード",
  shareModalTitle: "シェア先を選択",
  shareGenerating: "準備中…",
  shareDownloadHint: "画像をダウンロードしました。投稿画面で画像を添付してシェアしてください。",
  shareError: "シェアに失敗しました",
  shareTweetText: (overall, yaw, brightness, clinic, shareUrl) => {
    const clinicPart = clinic.trim() ? `【${clinic.trim()}】 ` : "";
    const urlPart = shareUrl ? `\n${shareUrl}` : "";
    return `${clinicPart}ビフォーアフター写真を診断しました\n\n総合判定：${overall}\n左右ズレ: ${yaw > 0 ? "+" : ""}${yaw}°　明るさ差: ${brightness > 0 ? "+" : ""}${brightness}%${urlPart}\n\n#AngleLog #美容整形`;
  },
  shareLineText: (overall, yaw, brightness, clinic) => {
    const clinicPart = clinic.trim() ? `【${clinic.trim()}】 ` : "";
    return `${clinicPart}ビフォーアフター写真を診断しました\n総合判定：${overall}\n左右ズレ: ${yaw > 0 ? "+" : ""}${yaw}°　明るさ差: ${brightness > 0 ? "+" : ""}${brightness}%\nAngle Log で無料チェック`;
  },
  shareImageOverall: (overall) => `判定：${overall}`,
  shareImageYaw: (diff) => `左右ズレ ${diff > 0 ? "+" : ""}${diff}°`,
  shareImageBrightness: (diff) => `明るさ差 ${diff > 0 ? "+" : ""}${diff}%`,

  presetDelete: "削除",
  presetAdd: "追加",
  presetAnglePlaceholder: "角度 (例: 30)",
  presetLabelPlaceholder: "ラベル (省略可)",
  presetAddError: "角度は -180〜180 の数値で入力してください",
  presetAddFailed: "追加に失敗しました",
  presetDeleteFailed: "削除に失敗しました",
  presetDefaultLabel: (yaw) => {
    if (yaw === 0) return "正面";
    const dir = yaw > 0 ? "右" : "左";
    return `斜め${Math.abs(yaw)}°${dir}`;
  },
  cameraHintFront:     "正面を向いてください",
  cameraHintTurnRight: "ゆっくり右を向いてください",
  cameraHintTurnLeft:  "ゆっくり左を向いてください",
  cameraHintHold:      "そのまま静止してください",
  cameraHintRollRight: "頭を少し右に傾けてください",
  cameraHintRollLeft:  "頭を少し左に傾けてください",
  cameraHintPitchDown: "少し下を向いてください",
  cameraHintPitchUp:   "少し上を向いてください",
  cameraHintMoreFront: "もう少し正面を向いてください",

  annotationTitle: "加工を外す",
  annotationAutoTab: "自動検出",
  annotationManualTab: "手動",
  annotationAutoHint: "写真に加えられた矢印・文字・透かし（クリニック名など）を自動検出して除去します",
  annotationButtonDesc: "写真に加えられた矢印・文字・透かしを自動検出して除去できます",
  annotationDetecting: "検出中…",
  annotationNoneDetected: "アノテーションは検出されませんでした",
  annotationCornerTL: "左上のテキスト/透かし",
  annotationCornerTR: "右上のテキスト/透かし",
  annotationCornerBL: "左下のテキスト/透かし",
  annotationCornerBR: "右下のテキスト/透かし",
  annotationColorLabel: "カラーアノテーション（矢印・マーキングなど）",
  annotationRemove: "選択した部分を消す",
  annotationRemoving: "処理中…",
  annotationManualHint: "消したい線・矢印の上を指でなぞってください",
  annotationBrushLabel: (n) => `ブラシ ${n}px`,
  annotationUndo: "元に戻す",
  annotationClear: "クリア",
  annotationApply: "修復する",
  annotationApplying: "修復中…",
  annotationApplyError: "修復に失敗しました",

  annotationFeatureTitle: "写真に線や矢印が入っている場合",
  annotationFeatureDesc: "クリニックが写真に加えた矢印・文字・透かし（白線など）を自動検出して除去できます。写真をアップロードした後、「加工を外す」ボタンから起動してください。",

  loginTitle: "ログイン",
  loginEmail: "メールアドレス",
  loginPassword: "パスワード",
  loginButton: "ログイン",
  loginLoading: "ログイン中...",
  loginNoAccount: "アカウントがない方は",
  loginSignupLink: "新規登録",
  loginErrorNotConfirmed: "メールアドレスの確認が完了していません。届いたメールのリンクをクリックしてください。",
  loginErrorFailed: "ログインに失敗しました。メールアドレスとパスワードをご確認ください。",
  loginResendButton: "確認メールを再送する",
  loginResendLoading: "送信中...",
  loginResendSent: "再送しました。メールをご確認ください。",

  signupTitle: "新規登録",
  signupPassword: "パスワード（8文字以上）",
  signupPasswordConfirm: "パスワード（確認）",
  signupSubmitButton: "アカウントを作成",
  signupLoading: "登録中...",
  signupHasAccount: "すでにアカウントをお持ちの方は",
  signupLoginLink: "ログイン",
  signupErrorMismatch: "パスワードが一致しません",
  signupErrorTooShort: "パスワードは8文字以上で設定してください",
  signupErrorFailed: "登録に失敗しました。しばらくしてからお試しください",
  signupCheckEmailTitle: "確認メールを送りました",
  signupCheckEmailDesc: (email) => `${email} に確認メールを送信しました。\nメール内のリンクをクリックして登録を完了してください。`,
  signupCheckEmailSpam: "メールが届かない場合は迷惑メールフォルダをご確認ください。",
  signupGoToLogin: "ログインへ",

  saveErrorLoginRequired: "ログインが必要です",
  saveErrorUploadFailed: "画像のアップロードに失敗しました",
  saveErrorDbFailed: "保存に失敗しました",
  saveErrorGeneric: "保存に失敗しました",

  dashboardHeroImage: "/hero.jpg",
  dashboardDottedLineTitle: "白い点線にも注意",
  dashboardDottedLineDesc: "ビフォーアフター写真の点線は\n鼻を低く見せることも、高く見せることもできる。",
  dashboardAnnotationTip: "チェッカーの「加工を外す」機能で、点線・矢印・透かしを除いてから比較することができます。",
  dashboardDecoWarningImage: "/deco-warning.jpg",

  dashboardTagline: "Angle Log とは",
  dashboardHeroTitle: "整形写真の角度を、数値で見る。",
  dashboardHeroP1: "美容整形のビフォーアフター写真には\n角度・明るさの差が生じることがある。",
  dashboardHeroP2: "人の目では気づきにくいそのズレを\nAngle Log は数値で可視化する。",
  dashboardCheckerTag: "チェッカー",
  dashboardCheckerTitle: "写真のズレを数値で確認する",
  dashboardCheckerDesc: "ビフォーとアフターの写真をアップロードすると、角度と明るさのズレを数値で表示する。",
  dashboardCheckerCTA: "チェッカーを使う",
  dashboardMetricCTA: "評価基準とは？",
  dashboardCaptureTag: "撮影",
  dashboardCaptureTitle: "同じ角度で撮り続ける",
  dashboardCaptureDesc: "動画を撮影し、正面・45度・30度など指定した角度で自動的に切り取る。\n同じ角度で撮り続けることで術後の変化を正確に記録できる。",
  dashboardCaptureCTA: "撮影を始める",
  dashboardTimelineTag: "タイムライン",
  dashboardTimelineTitle: "記録を時系列で見返す",
  dashboardTimelineDesc: "チェッカーと撮影で記録した写真を時系列で見返せる。\nラベルをつけて部位ごとに管理できる。",
  dashboardTimelineCTA: "タイムラインを見る",

  unsavedLeave: "撮影した写真がまだ保存されていません。\nこのページを離れますか？",
  unsavedLogout: "撮影した写真がまだ保存されていません。\nログアウトしますか？",

  consentModalTitle: "ご利用の前に",
  consentModalDesc: "Angle Logは美容整形のビフォーアフター写真の角度・明るさのズレを数値で可視化するサービスです。ご利用いただく前に以下をご確認ください。",
  consentModalBullets: [
    "本サービスの結果は参考情報であり、医学的診断ではありません",
    "アップロードする写真・動画はご自身のものか、本人の同意を得たものに限ります",
    "18歳以上の方を対象としています",
  ],
  consentPre: "続けることで、",
  consentMid: "と",
  consentPost: "に同意したものとみなします。",
  consentAgree: "同意してはじめる",

  loginForgotLink: "パスワードをお忘れの方",

  forgotPasswordTitle: "パスワードをお忘れの方",
  forgotPasswordDesc: "登録済みのメールアドレスを入力してください。パスワード再設定のメールをお送りします。",
  forgotPasswordButton: "再設定メールを送る",
  forgotPasswordLoading: "送信中...",
  forgotPasswordSentTitle: "メールを送信しました",
  forgotPasswordSentDesc: (email: string) => `${email} に再設定リンクを送信しました。メールをご確認ください。`,
  forgotPasswordBackToLogin: "ログインページへ戻る",

  resetPasswordTitle: "新しいパスワードを設定",
  resetPasswordNew: "新しいパスワード",
  resetPasswordConfirm: "パスワード（確認）",
  resetPasswordButton: "パスワードを更新する",
  resetPasswordLoading: "更新中...",
  resetPasswordSuccessTitle: "パスワードを更新しました",
  resetPasswordSuccessDesc: "新しいパスワードでログインできます。",
  resetPasswordGoToLogin: "ログインする",
  resetPasswordErrorMismatch: "パスワードが一致しません。",
  resetPasswordErrorTooShort: "パスワードは8文字以上で入力してください。",
  resetPasswordErrorFailed: "パスワードの更新に失敗しました。リンクの有効期限が切れている可能性があります。",
  resetPasswordErrorExpired: "リンクの有効期限が切れています。もう一度パスワード再設定をお試しください。",

  settingsPasswordSection: "パスワード変更",
  settingsPasswordNew: "新しいパスワード",
  settingsPasswordConfirm: "パスワード（確認）",
  settingsPasswordSave: "変更する",
  settingsPasswordSaving: "変更中...",
  settingsPasswordSaved: "変更しました ✓",
  settingsPasswordErrorMismatch: "パスワードが一致しません。",
  settingsPasswordErrorTooShort: "パスワードは8文字以上で入力してください。",
  settingsPasswordErrorFailed: "パスワードの変更に失敗しました。",

  deleteAccountSection: "アカウント削除",
  deleteAccountDesc: "アカウントを削除すると、すべての記録・写真・動画が完全に削除されます。この操作は取り消せません。",
  deleteAccountButton: "アカウントを削除する",
  deleteAccountConfirmTitle: "本当に削除しますか？",
  deleteAccountConfirmDesc: "削除すると、チェッカーの記録・タイムラインの写真・動画すべてが失われます。この操作は元に戻せません。",
  deleteAccountConfirmButton: "削除する",
  deleteAccountCancel: "キャンセル",
  deleteAccountDeleting: "削除中...",
  deleteAccountError: "削除に失敗しました。しばらく時間をおいてから再度お試しください。",

  notFoundTitle: "ページが見つかりません",
  notFoundDesc: "お探しのページは存在しないか、移動した可能性があります。",
  notFoundHome: "トップページへ",
};

// ── English ───────────────────────────────────────────────────────────────────

const en: Translations = {
  before: "Before",
  after: "After",
  close: "Close",

  tapToSelect: "Tap to select a photo",
  autoCompress: "Auto-compressed if over 5MB",
  changePhoto: "Change photo",
  removeAnnotation: "✏ Remove edits",
  analyzeButton: "Analyze angle & brightness",
  analyzing: "Analyzing...",
  metricInfoButton: "About the metrics",
  serverError: "Failed to connect to server. Please try again later.",
  partialDetectionNotice: "Could not detect the full face. Angles are estimated or unavailable. For profile shots or single-part photos, use the brightness comparison as reference.",
  terms: "Terms of Use",
  privacy: "Privacy Policy",

  modalTitle: "About the metrics",
  modalSubtitle: "See how each metric works with animations",

  metrics: {
    yaw: {
      title: "Horizontal angle (Yaw)",
      sub:   "Most important metric",
      desc:  "The left-right rotation difference when facing forward. Even a slight turn in the after photo can make the nose bridge appear slimmer or change the jawline. Within 5° is ideal.",
    },
    brightness: {
      title: "Brightness difference",
      sub:   "Detects lighting manipulation",
      desc:  "The average brightness difference across the full photo. Brighter lighting only in the after photo can make skin tone appear more even and mask swelling or redness from downtime.",
    },
    pitch: {
      title: "Vertical angle (Pitch)",
      sub:   "Chin up / down direction",
      desc:  "The up-down tilt of the face (chin up or down). This naturally varies during photo sessions and has less visual impact than horizontal angle, so it is not scored by default.",
    },
    roll: {
      title: "Head tilt (Roll)",
      sub:   "Side-to-side tilt",
      desc:  "The rotational difference when tilting the head sideways. This varies with posture and camera angle and naturally occurs between pre- and post-procedure, so it is not scored by default.",
    },
  },

  notScored: "Not scored",
  detailsOpen: "Details ▼",
  detailsClose: "Close ▲",
  editScoring: "Edit scoring items",
  levelOk: "Acceptable",
  levelWarn: "Slightly off",
  levelDanger: "Significantly off",
  overallOk: "Accurate",
  overallWarn: "Caution",
  overallDanger: "Suspicious",
  overallDescOk: "Both angle and brightness are within acceptable range. The photos are reliable for comparison.",
  overallDescWarn: "Some metrics are at a concerning level. Useful as reference but review carefully.",
  overallDescDanger: "Significant discrepancies detected. The photos were taken under different conditions — the visual difference may not reflect actual results.",

  contextDetail: {
    yaw: {
      dirRight: "right",
      dirLeft:  "left",
      ok:     (abs, dir) => `There is a ${abs}° horizontal difference (turned ${dir}). Within acceptable range, but within 5° is ideal.`,
      warn:   (abs, dir) => `There is a ${abs}° horizontal difference (turned ${dir}). Changes in head angle significantly affect the appearance of the nose and jawline.`,
      danger: (abs, dir) => `There is a large ${abs}° horizontal difference (turned ${dir}). At this angle, the visual appearance will differ noticeably. We recommend checking with the clinic.`,
    },
    pitch: {
      dirUp:   "upward",
      dirDown: "chin down",
      ok:   (abs, dir) => `There is a ${abs}° vertical difference (${dir}). This has minimal visual impact.`,
      warn: (abs, dir) => `There is a ${abs}° vertical difference (${dir}). Changes in chin position can affect the perceived neck length and jawline.`,
    },
    roll: {
      dirRight: "right",
      dirLeft:  "left",
      ok:   (abs, dir) => `There is a ${abs}° head tilt difference (tilted ${dir}). This is within the natural variation range.`,
      warn: (abs, dir) => `There is a ${abs}° head tilt difference (tilted ${dir}). Posture differences during shooting may affect appearance.`,
    },
    brightness: {
      ok:     (abs) => `There is a ${abs}% brightness difference. Within acceptable range.`,
      warn:   (abs) => `There is a ${abs}% brightness difference. The lighting difference may be affecting how skin condition appears.`,
      danger: (abs) => `There is a large ${abs}% brightness difference. Such a gap may make swelling or redness less visible due to lighting.`,
    },
  },

  savedTitle: "Saved",
  timelineLink: "View in timeline →",
  savePrompt: "Save these results?",
  saveSubtext: "Saved to your checker history in Timeline",
  saveButton: "Save",
  saving: "Saving…",
  savePromptGuest: "Want to save your results?",
  saveSubtextGuest: "Sign up to capture multiple angles and save to timeline",
  signupButton: "Sign up for free",
  signupModalTitle: "Sign up to save results",
  signupModalDesc: "Sign up to capture multiple angles, save to timeline, and compare photos",
  loginLink: "Log in",

  navChecker: "Checker",
  navCapture: "Capture",
  navTimeline: "Timeline",
  navSettings: "Settings",
  navLogin: "Log in",
  navLogout: "Log out",
  navUnsavedLeave: "Your captured photos have not been saved yet.\nLeave this page?",
  navUnsavedLogout: "Your captured photos have not been saved yet.\nLog out anyway?",

  captureGuideTitle: "How to move your face",
  captureStep1: "Face forward (auto-captured)",
  captureStep2: "Turn slowly to the right (auto-captured at target angle)",
  captureStep3: "Return to center",
  captureStep4: "Turn slowly to the left (auto-captured at target angle)",
  captureHint: "The shutter fires automatically when you hold the angle.\nMoving slowly improves accuracy.",
  captureAngleSection: "Capture angles",
  captureSelectedCount: (n) => `${n} angle${n === 1 ? "" : "s"} selected`,
  captureAddAngle: "Add angle",
  captureAnglePlaceholder: "Angle",
  captureLabelPlaceholder: "Label (optional)",
  captureAdd: "Add",
  captureAddError: "Angle must be between -180 and 180",
  captureAddFailed: "Failed to add",
  captureDelete: "Delete",
  captureStartDisabled: "Select at least one angle",
  captureStart: (n) => `Start camera (${n} angle${n === 1 ? "" : "s"})`,

  photoGuide: "/photo-guide-en.jpg",
  photoGuideAlt: "Photo guide",

  settingsTitle: "Settings",
  settingsAccountSection: "Account",
  settingsDisplayName: "Display name",
  settingsDisplayNamePlaceholder: "e.g. Tanaka Clinic",
  settingsSaved: "Saved ✓",
  settingsSave: "Save",
  settingsEmail: "Email address",
  settingsAppearanceSection: "Appearance",
  settingsTheme: "Theme",
  settingsThemeDesc: "Switch between dark mode and light mode.",
  settingsDark: "Dark",
  settingsLight: "Light",
  settingsScoringSection: "Checker — Scoring metrics",
  settingsScoringDesc: "Choose which metrics to include in scoring by default. You can also change these per result.",
  settingsPresetSection: "Capture angle presets",
  settingsPresetDesc: "Positive = right, Negative = left",

  timelineTitle: "Timeline",
  timelineDiaryTab: "Face diary",
  timelineCheckerTab: "Checker",
  timelineSearchPlaceholder: "Search by case name or notes…",
  timelineSelectedCount: (n) => `${n} selected`,
  timelineDeleteSessionConfirm: (label) => `Delete "${label}"?`,
  timelineDeleteCaseConfirm: (name) => `Delete case "${name}" and all its sessions?\nThis action cannot be undone.`,
  timelineDeleteCheckerConfirm: "Delete this checker result?",
  timelineCompareCount: (n) => `Compare ${n}`,
  timelineCompareButton: "Compare →",
  timelineEmpty: "No data yet",
  timelineEmptyHint: "Start by going to \"Capture\"",
  timelineUncategorized: "Uncategorized",
  timelineSessionCount: (n) => `${n}`,
  timelineDeleting: "Deleting…",
  timelineDelete: "Delete",
  timelineNoSessions: "No sessions",
  timelineUnlabeled: "Unlabeled",

  capturePageTitle: "Capture",
  captureTimingOptions: ["Pre-op", "Post-op day 0", "Post-op 3 days", "Post-op 1 week", "Post-op 2 weeks", "Post-op 1 month", "Post-op 2 months", "Post-op 3 months", "Post-op 6 months", "Post-op 1 year"],
  captureTimingOther: "Other",
  capturePreviewTitle: "Review captured photos",
  capturePhotoCount: (n) => `${n} photo${n === 1 ? "" : "s"} captured`,
  captureRetake: "Retake",
  captureProceed: "Continue →",
  captureDetailsTitle: "Enter session details",
  captureCaseLabel: "Case:",
  captureTimingLabel: "Timing",
  captureClearTiming: "Clear",
  captureSuggestedTimingText: (timing) => `Auto-calculated from surgery date → ${timing} selected`,
  captureSelectTiming: "Select timing (optional)",
  captureDateLabel: "Date",
  captureNotesLabel: "Notes (optional)",
  captureNotesPlaceholder: "Observations, changes…",
  captureSaveFailed: "Failed to save",
  captureUploadFailed: "Failed to upload photos",
  captureBack: "Back",
  captureSavingText: "Saving…",
  captureSaveText: "Save",
  captureDoneTitle: "Saved",
  captureAddedTo: (name) => `Added to ${name}`,
  captureContinueCapture: "Keep capturing",
  captureGoToTimeline: "Go to timeline",
  captureCustomTimingPlaceholder: "e.g. 4 months post-op",

  casePickerTitle: "Which case to save to?",
  casePickerDesc: "Organize by procedure or patient",
  casePickerNameRequired: "Please enter a case name",
  casePickerCreateFailed: "Failed to create",
  casePickerNewButton: "＋ New case",
  casePickerCaseNameLabel: "Case name",
  casePickerCaseNamePlaceholder: "e.g. Case 1 – Nose",
  casePickerMemoLabel: "Notes (optional)",
  casePickerMemoPlaceholder: "e.g. tip rhinoplasty",
  casePickerBackButton: "Back",
  casePickerCreatingText: "Creating…",
  casePickerCreateButton: "Create & select",
  casePickerBackToPreview: "← Back to photo review",

  checkerEmpty: "No checker results yet",
  checkerEmptyHint: "Analyze photos in the Checker and press \"Save\"",
  checkerAllLabels: "All labels",
  checkerNoLabel: "No label",
  checkerResultCount: (n) => `${n} result${n === 1 ? "" : "s"}`,
  checkerNoResults: "No matching results",
  checkerAddLabel: "＋ Label",
  checkerYawLabel: "Yaw diff",
  checkerBrightnessLabel: "Brightness diff",
  checkerCustomInput: "Custom…",
  checkerConfirm: "OK",
  checkerCancel: "Cancel",
  checkerLevelAll: "All",
  checkerPresetLabels: ["Nose", "Eyes", "Eye area", "Jawline", "Chin", "Cheeks", "Lips", "Forehead", "Face line"],

  disclaimer: "Results from this tool are for reference only and do not constitute medical or professional advice.",

  shareClinicLabel: "Clinic name (optional)",
  shareClinicPlaceholder: "e.g. Your Clinic",
  shareButton: "Share on SNS",
  shareXButton: "Share on X",
  shareLineButton: "Share on LINE",
  shareDownloadButton: "Download image",
  shareModalTitle: "Choose where to share",
  shareGenerating: "Preparing…",
  shareDownloadHint: "Image downloaded. Attach it when posting.",
  shareError: "Failed to share",
  shareTweetText: (overall, yaw, brightness, clinic, shareUrl) => {
    const clinicPart = clinic.trim() ? `[${clinic.trim()}] ` : "";
    const urlPart = shareUrl ? `\n${shareUrl}` : "";
    return `${clinicPart}Analyzed before/after photos\n\nOverall: ${overall}\nYaw: ${yaw > 0 ? "+" : ""}${yaw}°  Brightness: ${brightness > 0 ? "+" : ""}${brightness}%${urlPart}\n\n#AngleLog #CosmeticSurgery`;
  },
  shareLineText: (overall, yaw, brightness, clinic) => {
    const clinicPart = clinic.trim() ? `[${clinic.trim()}] ` : "";
    return `${clinicPart}Analyzed before/after photos\nOverall: ${overall}\nYaw: ${yaw > 0 ? "+" : ""}${yaw}°  Brightness: ${brightness > 0 ? "+" : ""}${brightness}%\nCheck yours free on Angle Log`;
  },
  shareImageOverall: (overall) => `Result: ${overall}`,
  shareImageYaw: (diff) => `Yaw ${diff > 0 ? "+" : ""}${diff}°`,
  shareImageBrightness: (diff) => `Brightness ${diff > 0 ? "+" : ""}${diff}%`,

  presetDelete: "Delete",
  presetAdd: "Add",
  presetAnglePlaceholder: "Angle (e.g. 30)",
  presetLabelPlaceholder: "Label (optional)",
  presetAddError: "Angle must be between -180 and 180",
  presetAddFailed: "Failed to add",
  presetDeleteFailed: "Failed to delete",
  presetDefaultLabel: (yaw) => {
    if (yaw === 0) return "Front";
    const dir = yaw > 0 ? "Right" : "Left";
    return `${Math.abs(yaw)}° ${dir}`;
  },
  cameraHintFront:     "Face forward",
  cameraHintTurnRight: "Turn slowly to the right",
  cameraHintTurnLeft:  "Turn slowly to the left",
  cameraHintHold:      "Hold still",
  cameraHintRollRight: "Tilt your head slightly right",
  cameraHintRollLeft:  "Tilt your head slightly left",
  cameraHintPitchDown: "Look slightly down",
  cameraHintPitchUp:   "Look slightly up",
  cameraHintMoreFront: "Turn a bit more toward the front",

  annotationTitle: "Remove edits",
  annotationAutoTab: "Auto-detect",
  annotationManualTab: "Manual",
  annotationAutoHint: "Automatically detects and removes editing overlays such as arrows, text, and watermarks added to the photo",
  annotationButtonDesc: "Detects and removes editing overlays (arrows, text, watermarks) added to the photo",
  annotationDetecting: "Detecting…",
  annotationNoneDetected: "No annotations detected",
  annotationCornerTL: "Top-left text/watermark",
  annotationCornerTR: "Top-right text/watermark",
  annotationCornerBL: "Bottom-left text/watermark",
  annotationCornerBR: "Bottom-right text/watermark",
  annotationColorLabel: "Colored annotations (arrows, markings, etc.)",
  annotationRemove: "Remove selected",
  annotationRemoving: "Processing…",
  annotationManualHint: "Trace over the lines or arrows you want to remove",
  annotationBrushLabel: (n) => `Brush ${n}px`,
  annotationUndo: "Undo",
  annotationClear: "Clear",
  annotationApply: "Restore",
  annotationApplying: "Restoring…",
  annotationApplyError: "Failed to restore",

  annotationFeatureTitle: "If the photo has lines or arrows on it",
  annotationFeatureDesc: "Arrows, text, and watermarks (such as white lines) added by the clinic can be automatically detected and removed. Upload a photo and tap \"Remove edits\" to launch.",

  loginTitle: "Log in",
  loginEmail: "Email",
  loginPassword: "Password",
  loginButton: "Log in",
  loginLoading: "Logging in...",
  loginNoAccount: "Don't have an account?",
  loginSignupLink: "Sign up",
  loginErrorNotConfirmed: "Your email address has not been confirmed. Please click the link in the email we sent you.",
  loginErrorFailed: "Login failed. Please check your email and password.",
  loginResendButton: "Resend confirmation email",
  loginResendLoading: "Sending...",
  loginResendSent: "Sent. Please check your inbox.",

  signupTitle: "Sign up",
  signupPassword: "Password (min. 8 characters)",
  signupPasswordConfirm: "Confirm password",
  signupSubmitButton: "Create account",
  signupLoading: "Creating...",
  signupHasAccount: "Already have an account?",
  signupLoginLink: "Log in",
  signupErrorMismatch: "Passwords do not match",
  signupErrorTooShort: "Password must be at least 8 characters",
  signupErrorFailed: "Registration failed. Please try again later.",
  signupCheckEmailTitle: "Check your email",
  signupCheckEmailDesc: (email) => `We sent a confirmation email to ${email}.\nClick the link in the email to complete your registration.`,
  signupCheckEmailSpam: "If you don't see it, please check your spam folder.",
  signupGoToLogin: "Go to login",

  saveErrorLoginRequired: "Login required",
  saveErrorUploadFailed: "Image upload failed",
  saveErrorDbFailed: "Save failed",
  saveErrorGeneric: "Save failed",

  dashboardHeroImage: "/hero-en.jpg",
  dashboardDottedLineTitle: "Watch out for white dotted lines",
  dashboardDottedLineDesc: "Dotted lines in before/after photos\ncan make the nose look lower — or higher.",
  dashboardAnnotationTip: "Use the \"Remove edits\" feature in the Checker to strip out dotted lines, arrows, and watermarks before comparing.",
  dashboardDecoWarningImage: "/deco-warning-en.jpg",

  dashboardTagline: "What is Angle Log?",
  dashboardHeroTitle: "See cosmetic surgery photos by the numbers.",
  dashboardHeroP1: "Before/after photos in cosmetic surgery\ncan differ in angle and brightness.",
  dashboardHeroP2: "Angle Log makes those subtle differences\nvisible as measurable values.",
  dashboardCheckerTag: "Checker",
  dashboardCheckerTitle: "Verify photo discrepancies with numbers",
  dashboardCheckerDesc: "Upload before and after photos to display angle and brightness differences as numbers.",
  dashboardCheckerCTA: "Use Checker",
  dashboardMetricCTA: "About the metrics?",
  dashboardCaptureTag: "Capture",
  dashboardCaptureTitle: "Keep shooting at the same angle",
  dashboardCaptureDesc: "Record a video and automatically extract frames at specified angles like front, 45°, 30°.\nShoot consistently to accurately track post-surgery changes.",
  dashboardCaptureCTA: "Start capturing",
  dashboardTimelineTag: "Timeline",
  dashboardTimelineTitle: "Review your records over time",
  dashboardTimelineDesc: "Browse photos recorded with Checker and Capture in chronological order.\nAdd labels to manage by body area.",
  dashboardTimelineCTA: "View Timeline",

  unsavedLeave: "Captured photos have not been saved yet.\nLeave this page?",
  unsavedLogout: "Captured photos have not been saved yet.\nLog out?",

  consentModalTitle: "Before you start",
  consentModalDesc: "Angle Log is a service that visualizes angle and brightness discrepancies in cosmetic surgery before/after photos as numerical values. Please review the following before continuing.",
  consentModalBullets: [
    "Results are for reference only and do not constitute medical diagnosis",
    "Only upload photos or videos of yourself or those with the subject's consent",
    "This service is intended for users 18 years of age and older",
  ],
  consentPre: "By continuing, you agree to our ",
  consentMid: " and ",
  consentPost: ".",
  consentAgree: "Agree and continue",

  loginForgotLink: "Forgot your password?",

  forgotPasswordTitle: "Reset your password",
  forgotPasswordDesc: "Enter your registered email address. We'll send you a link to reset your password.",
  forgotPasswordButton: "Send reset link",
  forgotPasswordLoading: "Sending...",
  forgotPasswordSentTitle: "Email sent",
  forgotPasswordSentDesc: (email: string) => `We sent a reset link to ${email}. Please check your inbox.`,
  forgotPasswordBackToLogin: "Back to login",

  resetPasswordTitle: "Set a new password",
  resetPasswordNew: "New password",
  resetPasswordConfirm: "Confirm password",
  resetPasswordButton: "Update password",
  resetPasswordLoading: "Updating...",
  resetPasswordSuccessTitle: "Password updated",
  resetPasswordSuccessDesc: "You can now log in with your new password.",
  resetPasswordGoToLogin: "Go to login",
  resetPasswordErrorMismatch: "Passwords do not match.",
  resetPasswordErrorTooShort: "Password must be at least 8 characters.",
  resetPasswordErrorFailed: "Failed to update password. The link may have expired.",
  resetPasswordErrorExpired: "This link has expired. Please request a new password reset.",

  settingsPasswordSection: "Change password",
  settingsPasswordNew: "New password",
  settingsPasswordConfirm: "Confirm password",
  settingsPasswordSave: "Update",
  settingsPasswordSaving: "Updating...",
  settingsPasswordSaved: "Updated ✓",
  settingsPasswordErrorMismatch: "Passwords do not match.",
  settingsPasswordErrorTooShort: "Password must be at least 8 characters.",
  settingsPasswordErrorFailed: "Failed to update password.",

  deleteAccountSection: "Delete account",
  deleteAccountDesc: "Deleting your account will permanently remove all records, photos, and videos. This cannot be undone.",
  deleteAccountButton: "Delete my account",
  deleteAccountConfirmTitle: "Are you sure?",
  deleteAccountConfirmDesc: "All checker records, timeline photos, and videos will be permanently lost. This action cannot be reversed.",
  deleteAccountConfirmButton: "Delete",
  deleteAccountCancel: "Cancel",
  deleteAccountDeleting: "Deleting...",
  deleteAccountError: "Deletion failed. Please try again later.",

  notFoundTitle: "Page not found",
  notFoundDesc: "The page you're looking for doesn't exist or has been moved.",
  notFoundHome: "Back to home",
};

// ── Korean ────────────────────────────────────────────────────────────────────

const ko: Translations = {
  before: "비포어",
  after: "애프터",
  close: "닫기",

  tapToSelect: "탭하여 사진 선택",
  autoCompress: "5MB 초과 시 자동 압축",
  changePhoto: "사진 변경",
  removeAnnotation: "✏ 편집 제거",
  analyzeButton: "각도・밝기 분석하기",
  analyzing: "분석 중...",
  metricInfoButton: "평가 기준이란？",
  serverError: "서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  partialDetectionNotice: "얼굴 전체를 감지하지 못했습니다. 각도는 추정값이거나 측정 불가입니다. 옆모습이나 부분 사진의 경우 밝기 비교를 참고해 주세요.",
  terms: "이용약관",
  privacy: "개인정보처리방침",

  modalTitle: "평가 기준에 대해",
  modalSubtitle: "애니메이션으로 각 지표의 움직임을 확인할 수 있습니다",

  metrics: {
    yaw: {
      title: "좌우 각도 차이 (Yaw)",
      sub:   "가장 중요한 지표",
      desc:  "정면을 향했을 때의 좌우 회전 차이입니다. 시술 후 사진에서 약간만 옆을 향해도 콧날이 더 날카롭게 보이거나 윤곽이 달라 보일 수 있습니다. 5° 이내가 이상적입니다.",
    },
    brightness: {
      title: "밝기 차이",
      sub:   "조명 조작 탐지",
      desc:  "사진 전체의 평균 밝기 차이입니다. 시술 후 사진에만 밝은 조명을 사용하면 피부 톤이 균일하게 보이고 붓기나 홍조가 눈에 띄지 않게 됩니다.",
    },
    pitch: {
      title: "상하 각도 차이 (Pitch)",
      sub:   "턱을 당기거나 드는 방향",
      desc:  "얼굴의 상하 기울기입니다(턱을 당기거나 드는 동작). 촬영 시 자연스럽게 변동하기 쉽고 좌우 차이보다 외관에 미치는 영향이 작아 기본값에서는 채점 대상에서 제외됩니다.",
    },
    roll: {
      title: "고개 기울기 (Roll)",
      sub:   "좌우로 고개를 기울이는 방향",
      desc:  "고개를 좌우로 기울였을 때의 회전 차이입니다. 자세나 촬영 각도에 따라 변동하기 쉽고 시술 전후에 자연스럽게 발생하기 쉬워 기본값에서는 채점 대상에서 제외됩니다.",
    },
  },

  notScored: "채점 제외",
  detailsOpen: "자세히 보기 ▼",
  detailsClose: "닫기 ▲",
  editScoring: "채점 항목 변경",
  levelOk: "허용 범위",
  levelWarn: "약간 신경 쓰임",
  levelDanger: "상당히 차이남",
  overallOk: "거의 정확",
  overallWarn: "주의 필요",
  overallDanger: "의심스러움",
  overallDescOk: "각도와 밝기 모두 허용 범위 내입니다. 비교 사진으로 신뢰할 수 있습니다.",
  overallDescWarn: "일부 항목이 신경 쓰이는 수준입니다. 참고는 되지만 주의가 필요합니다.",
  overallDescDanger: "큰 차이가 확인되었습니다. 사진 조건이 맞지 않아 외관상 차이가 시술 효과를 나타내는 것이 아닐 수 있습니다.",

  contextDetail: {
    yaw: {
      dirRight: "오른쪽",
      dirLeft:  "왼쪽",
      ok:     (abs, dir) => `비포어와 애프터에서 ${abs}°의 좌우 차이(${dir} 방향)가 있습니다. 허용 범위 내이지만 5° 이내가 이상적입니다.`,
      warn:   (abs, dir) => `비포어와 애프터에서 ${abs}°의 좌우 차이(${dir} 방향)가 있습니다. 얼굴 방향이 달라지면 콧날이나 윤곽의 인상이 크게 변할 수 있어 주의가 필요합니다.`,
      danger: (abs, dir) => `비포어와 애프터에서 ${abs}°의 큰 좌우 차이(${dir} 방향)가 있습니다. 이 각도 차이는 외관에 현저한 차이를 만들어 냅니다. 클리닉에 확인하시기 바랍니다.`,
    },
    pitch: {
      dirUp:   "위를 향한 방향",
      dirDown: "턱을 당긴 방향",
      ok:   (abs, dir) => `비포어와 애프터에서 ${abs}°의 상하 차이(${dir})가 있습니다. 큰 영향은 없습니다.`,
      warn: (abs, dir) => `비포어와 애프터에서 ${abs}°의 상하 차이(${dir})가 있습니다. 턱 위치가 달라지면 목의 길이나 윤곽이 달라 보일 수 있습니다.`,
    },
    roll: {
      dirRight: "오른쪽",
      dirLeft:  "왼쪽",
      ok:   (abs, dir) => `비포어와 애프터에서 ${abs}°의 고개 기울기 차이(${dir}쪽 기울기)가 있습니다. 자연스러운 변동 범위 내입니다.`,
      warn: (abs, dir) => `비포어와 애프터에서 ${abs}°의 고개 기울기 차이(${dir}쪽 기울기)가 있습니다. 촬영 시 자세 차이가 외관에 영향을 줄 수 있습니다.`,
    },
    brightness: {
      ok:     (abs) => `비포어와 애프터에서 ${abs}%의 밝기 차이가 있습니다. 허용 범위 내입니다.`,
      warn:   (abs) => `비포어와 애프터에서 ${abs}%의 밝기 차이가 있습니다. 조명 차이가 피부 상태의 보임새에 영향을 줄 가능성이 있습니다.`,
      danger: (abs) => `비포어와 애프터에서 ${abs}%의 큰 밝기 차이가 있습니다. 이 정도 차이가 있으면 붓기나 홍조가 조명에 의해 눈에 띄지 않게 될 가능성이 있습니다.`,
    },
  },

  savedTitle: "저장되었습니다",
  timelineLink: "타임라인에서 확인 →",
  savePrompt: "이 결과를 저장하시겠습니까?",
  saveSubtext: "타임라인의 체커 기록에 저장됩니다",
  saveButton: "저장",
  saving: "저장 중…",
  savePromptGuest: "결과를 저장하시겠습니까?",
  saveSubtextGuest: "회원가입하면 멀티 앵글 촬영과 타임라인 저장을 사용할 수 있습니다",
  signupButton: "무료 회원가입",
  signupModalTitle: "저장하려면 회원가입이 필요합니다",
  signupModalDesc: "가입하면 멀티 앵글 촬영, 타임라인 저장, 비교 기능을 사용할 수 있습니다",
  loginLink: "로그인",

  navChecker: "체커",
  navCapture: "촬영",
  navTimeline: "타임라인",
  navSettings: "설정",
  navLogin: "로그인",
  navLogout: "로그아웃",
  navUnsavedLeave: "촬영한 사진이 아직 저장되지 않았습니다.\n이 페이지를 떠나시겠습니까?",
  navUnsavedLogout: "촬영한 사진이 아직 저장되지 않았습니다.\n로그아웃하시겠습니까?",

  captureGuideTitle: "얼굴 움직이는 방법",
  captureStep1: "정면을 향하기（자동 촬영）",
  captureStep2: "천천히 오른쪽을 향하기（지정 각도에서 자동 촬영）",
  captureStep3: "정면으로 돌아오기",
  captureStep4: "천천히 왼쪽을 향하기（지정 각도에서 자동 촬영）",
  captureHint: "각 각도에서 멈추면 자동으로 셔터가 눌립니다.\n천천히 움직일수록 정확도가 높아집니다.",
  captureAngleSection: "촬영 각도",
  captureSelectedCount: (n) => `${n}개 각도 선택됨`,
  captureAddAngle: "각도 추가",
  captureAnglePlaceholder: "각도",
  captureLabelPlaceholder: "레이블（생략 가능）",
  captureAdd: "추가",
  captureAddError: "각도는 -180〜180 범위로 입력해 주세요",
  captureAddFailed: "추가에 실패했습니다",
  captureDelete: "삭제",
  captureStartDisabled: "각도를 하나 이상 선택해 주세요",
  captureStart: (n) => `카메라 시작（${n}개 각도）`,

  photoGuide: "/photo-guide-ko.jpg",
  photoGuideAlt: "사진 가이드",

  settingsTitle: "설정",
  settingsAccountSection: "계정",
  settingsDisplayName: "표시 이름",
  settingsDisplayNamePlaceholder: "예: 다나카 클리닉",
  settingsSaved: "저장됨 ✓",
  settingsSave: "저장",
  settingsEmail: "이메일 주소",
  settingsAppearanceSection: "외관",
  settingsTheme: "테마",
  settingsThemeDesc: "다크 모드・라이트 모드를 전환합니다.",
  settingsDark: "다크",
  settingsLight: "라이트",
  settingsScoringSection: "체커 — 채점 지표",
  settingsScoringDesc: "체커에서 처음부터 채점에 포함할 지표를 선택할 수 있습니다. 결과 화면에서도 개별적으로 변경할 수 있습니다.",
  settingsPresetSection: "촬영 각도 프리셋",
  settingsPresetDesc: "양수 = 오른쪽, 음수 = 왼쪽",

  timelineTitle: "타임라인",
  timelineDiaryTab: "얼굴 일기",
  timelineCheckerTab: "체커",
  timelineSearchPlaceholder: "케이스명・메모로 검색…",
  timelineSelectedCount: (n) => `${n}개 선택됨`,
  timelineDeleteSessionConfirm: (label) => `「${label}」을(를) 삭제하시겠습니까?`,
  timelineDeleteCaseConfirm: (name) => `케이스 「${name}」과 그 안의 모든 세션을 삭제하시겠습니까?\n이 작업은 취소할 수 없습니다.`,
  timelineDeleteCheckerConfirm: "이 체커 결과를 삭제하시겠습니까?",
  timelineCompareCount: (n) => `${n}개 비교`,
  timelineCompareButton: "비교하기 →",
  timelineEmpty: "아직 데이터가 없습니다",
  timelineEmptyHint: "「촬영」에서 시작하세요",
  timelineUncategorized: "미분류",
  timelineSessionCount: (n) => `${n}건`,
  timelineDeleting: "삭제 중…",
  timelineDelete: "삭제",
  timelineNoSessions: "세션이 없습니다",
  timelineUnlabeled: "미선택",

  capturePageTitle: "촬영",
  captureTimingOptions: ["수술 전", "수술 당일", "수술 3일 후", "수술 1주 후", "수술 2주 후", "수술 1개월 후", "수술 2개월 후", "수술 3개월 후", "수술 6개월 후", "수술 1년 후"],
  captureTimingOther: "기타",
  capturePreviewTitle: "촬영한 사진 확인",
  capturePhotoCount: (n) => `${n}장 촬영했습니다`,
  captureRetake: "다시 촬영",
  captureProceed: "이대로 진행 →",
  captureDetailsTitle: "촬영 정보 입력",
  captureCaseLabel: "케이스：",
  captureTimingLabel: "촬영 시기",
  captureClearTiming: "선택 해제",
  captureSuggestedTimingText: (timing) => `수술일로부터 자동 계산 → ${timing} 선택됨`,
  captureSelectTiming: "시기 선택（선택 사항）",
  captureDateLabel: "촬영일",
  captureNotesLabel: "메모（선택 사항）",
  captureNotesPlaceholder: "신경 쓰이는 점, 변화 등…",
  captureSaveFailed: "저장에 실패했습니다",
  captureUploadFailed: "사진 업로드에 실패했습니다",
  captureBack: "뒤로",
  captureSavingText: "저장 중…",
  captureSaveText: "저장",
  captureDoneTitle: "저장되었습니다",
  captureAddedTo: (name) => `${name}에 추가되었습니다`,
  captureContinueCapture: "계속 촬영",
  captureGoToTimeline: "타임라인으로",
  captureCustomTimingPlaceholder: "예: 수술 4개월 후",

  casePickerTitle: "어느 케이스에 저장할까요？",
  casePickerDesc: "시술이나 환자별로 정리할 수 있습니다",
  casePickerNameRequired: "케이스명을 입력해 주세요",
  casePickerCreateFailed: "생성에 실패했습니다",
  casePickerNewButton: "＋ 새로 추가",
  casePickerCaseNameLabel: "케이스명",
  casePickerCaseNamePlaceholder: "예: 케이스① 코",
  casePickerMemoLabel: "메모（선택 사항）",
  casePickerMemoPlaceholder: "예: 코끝 성형・융비술",
  casePickerBackButton: "뒤로",
  casePickerCreatingText: "생성 중…",
  casePickerCreateButton: "생성하여 선택",
  casePickerBackToPreview: "← 사진 확인으로 돌아가기",

  checkerEmpty: "체커 결과가 아직 없습니다",
  checkerEmptyHint: "체커에서 사진을 분석하고 「저장」을 눌러 주세요",
  checkerAllLabels: "모든 레이블",
  checkerNoLabel: "레이블 없음",
  checkerResultCount: (n) => `${n}건`,
  checkerNoResults: "해당하는 결과가 없습니다",
  checkerAddLabel: "＋레이블",
  checkerYawLabel: "좌우 차이",
  checkerBrightnessLabel: "밝기 차이",
  checkerCustomInput: "직접 입력…",
  checkerConfirm: "확인",
  checkerCancel: "취소",
  checkerLevelAll: "전체",
  checkerPresetLabels: ["코", "눈", "눈 주위", "윤곽", "턱", "볼", "입술", "이마", "페이스 라인"],

  disclaimer: "이 도구의 결과는 참고 정보이며, 의학적·전문적인 판단이 아닙니다.",

  shareClinicLabel: "클리닉명（선택 사항）",
  shareClinicPlaceholder: "예: ○○ 클리닉",
  shareButton: "SNS로 공유",
  shareXButton: "X로 공유",
  shareLineButton: "LINE으로 공유",
  shareDownloadButton: "이미지 다운로드",
  shareModalTitle: "공유할 SNS를 선택",
  shareGenerating: "준비 중…",
  shareDownloadHint: "이미지를 다운로드했습니다. 투고 화면에서 첨부하여 공유해 주세요.",
  shareError: "공유에 실패했습니다",
  shareTweetText: (overall, yaw, brightness, clinic, shareUrl) => {
    const clinicPart = clinic.trim() ? `[${clinic.trim()}] ` : "";
    const urlPart = shareUrl ? `\n${shareUrl}` : "";
    return `${clinicPart}비포 애프터 사진을 분석했습니다\n\n종합 판정: ${overall}\n좌우 차이: ${yaw > 0 ? "+" : ""}${yaw}°  밝기 차이: ${brightness > 0 ? "+" : ""}${brightness}%${urlPart}\n\n#AngleLog #성형외과`;
  },
  shareLineText: (overall, yaw, brightness, clinic) => {
    const clinicPart = clinic.trim() ? `[${clinic.trim()}] ` : "";
    return `${clinicPart}비포 애프터 사진을 분석했습니다\n종합 판정: ${overall}\n좌우 차이: ${yaw > 0 ? "+" : ""}${yaw}°  밝기 차이: ${brightness > 0 ? "+" : ""}${brightness}%\nAngle Log에서 무료로 확인`;
  },
  shareImageOverall: (overall) => `판정: ${overall}`,
  shareImageYaw: (diff) => `좌우 ${diff > 0 ? "+" : ""}${diff}°`,
  shareImageBrightness: (diff) => `밝기 ${diff > 0 ? "+" : ""}${diff}%`,

  presetDelete: "삭제",
  presetAdd: "추가",
  presetAnglePlaceholder: "각도 (예: 30)",
  presetLabelPlaceholder: "레이블 (생략 가능)",
  presetAddError: "각도는 -180〜180 사이의 숫자로 입력해 주세요",
  presetAddFailed: "추가에 실패했습니다",
  presetDeleteFailed: "삭제에 실패했습니다",
  presetDefaultLabel: (yaw) => {
    if (yaw === 0) return "정면";
    const dir = yaw > 0 ? "오른쪽" : "왼쪽";
    return `${Math.abs(yaw)}° ${dir}`;
  },
  cameraHintFront:     "정면을 향해 주세요",
  cameraHintTurnRight: "천천히 오른쪽을 향해 주세요",
  cameraHintTurnLeft:  "천천히 왼쪽을 향해 주세요",
  cameraHintHold:      "그대로 정지해 주세요",
  cameraHintRollRight: "머리를 조금 오른쪽으로 기울여 주세요",
  cameraHintRollLeft:  "머리를 조금 왼쪽으로 기울여 주세요",
  cameraHintPitchDown: "조금 아래를 향해 주세요",
  cameraHintPitchUp:   "조금 위를 향해 주세요",
  cameraHintMoreFront: "좀 더 정면을 향해 주세요",

  annotationTitle: "편집 제거",
  annotationAutoTab: "자동 감지",
  annotationManualTab: "수동",
  annotationAutoHint: "사진에 추가된 화살표, 텍스트, 워터마크 등 편집 요소를 자동으로 감지하여 제거합니다",
  annotationButtonDesc: "사진에 추가된 화살표, 텍스트, 워터마크 등 편집 요소를 자동으로 감지하여 제거할 수 있습니다",
  annotationDetecting: "감지 중…",
  annotationNoneDetected: "주석이 감지되지 않았습니다",
  annotationCornerTL: "왼쪽 상단 텍스트/워터마크",
  annotationCornerTR: "오른쪽 상단 텍스트/워터마크",
  annotationCornerBL: "왼쪽 하단 텍스트/워터마크",
  annotationCornerBR: "오른쪽 하단 텍스트/워터마크",
  annotationColorLabel: "컬러 주석（화살표, 마킹 등）",
  annotationRemove: "선택한 부분 제거",
  annotationRemoving: "처리 중…",
  annotationManualHint: "지우고 싶은 선이나 화살표 위를 손가락으로 따라 그어 주세요",
  annotationBrushLabel: (n) => `브러시 ${n}px`,
  annotationUndo: "실행 취소",
  annotationClear: "지우기",
  annotationApply: "복원",
  annotationApplying: "복원 중…",
  annotationApplyError: "복원에 실패했습니다",

  annotationFeatureTitle: "사진에 선이나 화살표가 있는 경우",
  annotationFeatureDesc: "클리닉이 사진에 추가한 화살표, 텍스트, 워터마크(흰 선 등)를 자동으로 감지하여 제거할 수 있습니다. 사진을 업로드한 후 「편집 제거」 버튼에서 실행하세요.",

  loginTitle: "로그인",
  loginEmail: "이메일",
  loginPassword: "비밀번호",
  loginButton: "로그인",
  loginLoading: "로그인 중...",
  loginNoAccount: "계정이 없으신가요?",
  loginSignupLink: "회원가입",
  loginErrorNotConfirmed: "이메일 주소 확인이 완료되지 않았습니다. 받은 메일의 링크를 클릭해 주세요.",
  loginErrorFailed: "로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.",
  loginResendButton: "인증 메일 재전송",
  loginResendLoading: "전송 중...",
  loginResendSent: "전송했습니다. 메일을 확인해 주세요.",

  signupTitle: "회원가입",
  signupPassword: "비밀번호 (8자 이상)",
  signupPasswordConfirm: "비밀번호 확인",
  signupSubmitButton: "계정 만들기",
  signupLoading: "등록 중...",
  signupHasAccount: "이미 계정이 있으신가요?",
  signupLoginLink: "로그인",
  signupErrorMismatch: "비밀번호가 일치하지 않습니다",
  signupErrorTooShort: "비밀번호는 8자 이상이어야 합니다",
  signupErrorFailed: "등록에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  signupCheckEmailTitle: "확인 이메일을 보냈습니다",
  signupCheckEmailDesc: (email) => `${email}으로 확인 이메일을 보냈습니다.\n이메일의 링크를 클릭하여 등록을 완료해 주세요.`,
  signupCheckEmailSpam: "이메일이 오지 않으면 스팸 폴더를 확인해 주세요.",
  signupGoToLogin: "로그인으로",

  saveErrorLoginRequired: "로그인이 필요합니다",
  saveErrorUploadFailed: "이미지 업로드에 실패했습니다",
  saveErrorDbFailed: "저장에 실패했습니다",
  saveErrorGeneric: "저장에 실패했습니다",

  dashboardHeroImage: "/hero-ko.jpg",
  dashboardDottedLineTitle: "흰 점선에도 주의",
  dashboardDottedLineDesc: "비포/애프터 사진의 점선은\n코를 낮게 보이게도, 높게 보이게도 할 수 있다.",
  dashboardAnnotationTip: "체커의 「편집 제거」 기능으로 점선·화살표·워터마크를 제거한 후 비교할 수 있습니다.",
  dashboardDecoWarningImage: "/deco-warning-ko.jpg",

  dashboardTagline: "Angle Log란?",
  dashboardHeroTitle: "성형 사진의 각도를, 수치로 본다.",
  dashboardHeroP1: "미용 성형의 비포/애프터 사진에는\n각도·밝기의 차이가 생길 수 있다.",
  dashboardHeroP2: "육안으로는 알아차리기 어려운 그 차이를\nAngle Log가 수치로 가시화한다.",
  dashboardCheckerTag: "체커",
  dashboardCheckerTitle: "사진의 차이를 수치로 확인한다",
  dashboardCheckerDesc: "비포와 애프터 사진을 업로드하면 각도와 밝기의 차이를 수치로 표시한다.",
  dashboardCheckerCTA: "체커 사용하기",
  dashboardMetricCTA: "평가 기준이란？",
  dashboardCaptureTag: "촬영",
  dashboardCaptureTitle: "같은 각도로 계속 촬영한다",
  dashboardCaptureDesc: "동영상을 촬영하여 정면·45도·30도 등 지정한 각도로 자동 추출한다.\n같은 각도로 계속 촬영하여 수술 후 변화를 정확히 기록한다.",
  dashboardCaptureCTA: "촬영 시작",
  dashboardTimelineTag: "타임라인",
  dashboardTimelineTitle: "기록을 시간순으로 돌아본다",
  dashboardTimelineDesc: "체커와 촬영으로 기록한 사진을 시간순으로 확인할 수 있다.\n라벨을 붙여 부위별로 관리할 수 있다.",
  dashboardTimelineCTA: "타임라인 보기",

  unsavedLeave: "촬영한 사진이 아직 저장되지 않았습니다.\n이 페이지를 떠나시겠습니까？",
  unsavedLogout: "촬영한 사진이 아직 저장되지 않았습니다.\n로그아웃하시겠습니까？",

  consentModalTitle: "이용 전 확인 사항",
  consentModalDesc: "Angle Log는 미용 성형의 비포/애프터 사진의 각도·밝기 차이를 수치로 가시화하는 서비스입니다. 이용 전 아래 내용을 확인해 주세요.",
  consentModalBullets: [
    "본 서비스의 결과는 참고 정보이며, 의학적 진단이 아닙니다",
    "업로드하는 사진·동영상은 본인 또는 본인의 동의를 받은 것에 한합니다",
    "18세 이상을 대상으로 합니다",
  ],
  consentPre: "계속 진행하면 ",
  consentMid: " 및 ",
  consentPost: "에 동의한 것으로 간주됩니다.",
  consentAgree: "동의하고 시작하기",

  loginForgotLink: "비밀번호를 잊으셨나요?",

  forgotPasswordTitle: "비밀번호 재설정",
  forgotPasswordDesc: "등록된 이메일 주소를 입력해 주세요. 비밀번호 재설정 링크를 보내드립니다.",
  forgotPasswordButton: "재설정 메일 보내기",
  forgotPasswordLoading: "전송 중...",
  forgotPasswordSentTitle: "메일을 보냈습니다",
  forgotPasswordSentDesc: (email: string) => `${email}로 재설정 링크를 보냈습니다. 메일을 확인해 주세요.`,
  forgotPasswordBackToLogin: "로그인 페이지로 돌아가기",

  resetPasswordTitle: "새 비밀번호 설정",
  resetPasswordNew: "새 비밀번호",
  resetPasswordConfirm: "비밀번호 확인",
  resetPasswordButton: "비밀번호 업데이트",
  resetPasswordLoading: "업데이트 중...",
  resetPasswordSuccessTitle: "비밀번호가 업데이트되었습니다",
  resetPasswordSuccessDesc: "새 비밀번호로 로그인할 수 있습니다.",
  resetPasswordGoToLogin: "로그인하기",
  resetPasswordErrorMismatch: "비밀번호가 일치하지 않습니다.",
  resetPasswordErrorTooShort: "비밀번호는 8자 이상이어야 합니다.",
  resetPasswordErrorFailed: "비밀번호 업데이트에 실패했습니다. 링크가 만료되었을 수 있습니다.",
  resetPasswordErrorExpired: "링크가 만료되었습니다. 비밀번호 재설정을 다시 시도해 주세요.",

  settingsPasswordSection: "비밀번호 변경",
  settingsPasswordNew: "새 비밀번호",
  settingsPasswordConfirm: "비밀번호 확인",
  settingsPasswordSave: "변경",
  settingsPasswordSaving: "변경 중...",
  settingsPasswordSaved: "변경됨 ✓",
  settingsPasswordErrorMismatch: "비밀번호가 일치하지 않습니다.",
  settingsPasswordErrorTooShort: "비밀번호는 8자 이상이어야 합니다.",
  settingsPasswordErrorFailed: "비밀번호 변경에 실패했습니다.",

  deleteAccountSection: "계정 삭제",
  deleteAccountDesc: "계정을 삭제하면 모든 기록·사진·동영상이 영구적으로 삭제됩니다. 이 작업은 취소할 수 없습니다.",
  deleteAccountButton: "계정 삭제하기",
  deleteAccountConfirmTitle: "정말로 삭제하시겠습니까?",
  deleteAccountConfirmDesc: "체커 기록·타임라인 사진·동영상 등 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.",
  deleteAccountConfirmButton: "삭제",
  deleteAccountCancel: "취소",
  deleteAccountDeleting: "삭제 중...",
  deleteAccountError: "삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",

  notFoundTitle: "페이지를 찾을 수 없습니다",
  notFoundDesc: "찾으시는 페이지가 존재하지 않거나 이동되었을 수 있습니다.",
  notFoundHome: "홈으로 돌아가기",
};

// ── Context ───────────────────────────────────────────────────────────────────

const TRANSLATIONS: Record<Lang, Translations> = { ja, en, ko };

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ja",
  setLang: () => {},
  t: ja,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ja");

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Lang | null;
    if (saved && saved in TRANSLATIONS) setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem(KEY, l);
    document.documentElement.lang = l;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT() {
  return useContext(LanguageContext);
}
