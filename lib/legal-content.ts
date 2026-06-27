export type LegalLang = "ja" | "en" | "ko";

export interface LegalSection {
  heading: string;
  items: ({ type: "p"; text: string } | { type: "ul"; items: string[] } | { type: "table"; rows: [string, string][] })[];
}

export interface LegalDoc {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
}

// ── Terms ─────────────────────────────────────────────────────────────────────

export const TERMS: Record<LegalLang, LegalDoc> = {
  ja: {
    title: "Angle Log",
    subtitle: "利用規約",
    lastUpdated: "最終更新日：2026年__月__日",
    sections: [
      {
        heading: "第1条（サービスの概要）",
        items: [{ type: "p", text: "Angle Log（以下「本サービス」）は、美容整形のビフォーアフター写真の角度・明るさのズレを数値で可視化するツールです。本サービスは情報提供を目的としており、医学的診断・判断を提供するものではありません。" }],
      },
      {
        heading: "第2条（利用条件）",
        items: [
          { type: "p", text: "本サービスを利用するにあたり、以下の条件に同意するものとします。" },
          { type: "ul", items: [
            "本サービスの利用は18歳以上とします",
            "利用登録が必要な機能（Track・Timeline）においては、正確な情報を登録するものとします",
            "本サービスの結果はあくまで参考情報であり、医学的判断の根拠として使用しないものとします",
          ]},
        ],
      },
      {
        heading: "第3条（禁止事項）",
        items: [
          { type: "p", text: "以下の行為を禁止します。" },
          { type: "ul", items: [
            "第三者の写真・動画を本人の同意なくアップロードする行為",
            "本サービスを医療診断・法的証拠として単独で使用する行為",
            "本サービスのシステムに不正アクセスする行為",
            "本サービスを通じて虚偽の情報を拡散する行為",
            "商業目的での無断利用",
          ]},
        ],
      },
      {
        heading: "第4条（アップロードコンテンツ）",
        items: [
          { type: "p", text: "【チェッカー機能】" },
          { type: "ul", items: [
            "アップロードされた写真はブラウザ内で処理されます",
            "サーバーへの送信は角度計算のためのみに使用します",
            "処理完了後、サーバー上のデータは即時削除されます",
            "写真は保存・蓄積されません",
          ]},
          { type: "p", text: "【Track・Timeline機能（会員向け）】" },
          { type: "ul", items: [
            "アップロードされた写真・動画はユーザーアカウントに紐づけて保存されます",
            "保存データはユーザー本人のみが閲覧できます",
            "アカウント削除時にすべてのデータを削除します",
          ]},
        ],
      },
      {
        heading: "第5条（AIの学習利用）",
        items: [
          { type: "p", text: "本サービスの向上を目的として、以下の条件でAI学習に利用する場合があります。" },
          { type: "ul", items: [
            "対象：Track・Timeline機能でアップロードされた動画・写真",
            "条件：個人を特定できない形に加工・匿名化した上で使用します",
            "目的：角度検出精度の向上・サービス品質の改善のみに使用します",
            "第三者への提供：行いません",
          ]},
        ],
      },
      {
        heading: "第6条（免責事項）",
        items: [{ type: "ul", items: [
          "本サービスの結果は参考情報であり、医学的診断ではありません",
          "本サービスの利用により生じた損害について、運営者は責任を負いません",
          "本サービスの精度・可用性を保証するものではありません",
          "クリニックへの判断・選択はユーザー自身の責任において行ってください",
        ]}],
      },
      {
        heading: "第7条（サービスの変更・終了）",
        items: [{ type: "p", text: "運営者は事前の通知なくサービスの内容を変更・終了する場合があります。" }],
      },
      {
        heading: "第8条（利用規約の変更）",
        items: [{ type: "p", text: "本規約は必要に応じて改定します。重要な変更がある場合はサービス上でお知らせします。" }],
      },
      {
        heading: "第9条（準拠法・管轄裁判所）",
        items: [{ type: "p", text: "本規約は日本法に準拠します。紛争が生じた場合は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。" }],
      },
    ],
  },

  en: {
    title: "Angle Log",
    subtitle: "Terms of Service",
    lastUpdated: "Last updated: 2026/__/__",
    sections: [
      {
        heading: "Article 1 — Service Overview",
        items: [{ type: "p", text: "Angle Log (\"the Service\") is a tool that visualizes discrepancies in angle and brightness in cosmetic surgery before/after photos as numerical values. The Service is provided for informational purposes only and does not constitute medical diagnosis or advice." }],
      },
      {
        heading: "Article 2 — Terms of Use",
        items: [
          { type: "p", text: "By using this Service, you agree to the following:" },
          { type: "ul", items: [
            "Users must be 18 years of age or older",
            "For functions requiring registration (Track & Timeline), you agree to provide accurate information",
            "Results from the Service are for reference only and shall not be used as the sole basis for medical judgment",
          ]},
        ],
      },
      {
        heading: "Article 3 — Prohibited Activities",
        items: [
          { type: "p", text: "The following activities are prohibited:" },
          { type: "ul", items: [
            "Uploading photos or videos of third parties without their consent",
            "Using the Service alone as medical diagnosis or legal evidence",
            "Unauthorized access to the Service's systems",
            "Spreading false information through the Service",
            "Unauthorized commercial use",
          ]},
        ],
      },
      {
        heading: "Article 4 — Uploaded Content",
        items: [
          { type: "p", text: "【Checker Function】" },
          { type: "ul", items: [
            "Uploaded photos are processed within the browser",
            "Data is sent to the server only for angle calculation purposes",
            "Server data is immediately deleted after processing",
            "Photos are not stored or accumulated",
          ]},
          { type: "p", text: "【Track & Timeline Functions (Members)】" },
          { type: "ul", items: [
            "Uploaded photos and videos are stored linked to the user's account",
            "Stored data can only be viewed by the account owner",
            "All data is deleted upon account deletion",
          ]},
        ],
      },
      {
        heading: "Article 5 — AI Training",
        items: [
          { type: "p", text: "Data may be used for AI training to improve the Service under the following conditions:" },
          { type: "ul", items: [
            "Scope: Videos and photos uploaded to Track & Timeline functions",
            "Condition: Used only after anonymization to prevent personal identification",
            "Purpose: Used solely to improve angle detection accuracy and service quality",
            "Third-party provision: None",
          ]},
        ],
      },
      {
        heading: "Article 6 — Disclaimer",
        items: [{ type: "ul", items: [
          "Results from this Service are for reference only and do not constitute medical diagnosis",
          "The operator is not liable for any damages arising from use of the Service",
          "We do not guarantee the accuracy or availability of the Service",
          "Decisions and choices regarding clinics are the sole responsibility of the user",
        ]}],
      },
      {
        heading: "Article 7 — Service Changes and Termination",
        items: [{ type: "p", text: "The operator may change or terminate the Service without prior notice." }],
      },
      {
        heading: "Article 8 — Changes to Terms",
        items: [{ type: "p", text: "These terms may be revised as necessary. In case of significant changes, notice will be provided through the Service." }],
      },
      {
        heading: "Article 9 — Governing Law and Jurisdiction",
        items: [{ type: "p", text: "These terms are governed by the laws of Japan. In the event of a dispute, the Tokyo District Court shall have exclusive jurisdiction as the court of first instance." }],
      },
    ],
  },

  ko: {
    title: "Angle Log",
    subtitle: "이용약관",
    lastUpdated: "최종 수정일: 2026년 __월 __일",
    sections: [
      {
        heading: "제1조 (서비스 개요)",
        items: [{ type: "p", text: "Angle Log(이하 \"본 서비스\")는 미용 성형의 비포/애프터 사진의 각도·밝기 차이를 수치로 가시화하는 도구입니다. 본 서비스는 정보 제공을 목적으로 하며, 의학적 진단·판단을 제공하는 것이 아닙니다." }],
      },
      {
        heading: "제2조 (이용 조건)",
        items: [
          { type: "p", text: "본 서비스를 이용함에 있어 다음 조건에 동의하는 것으로 합니다." },
          { type: "ul", items: [
            "본 서비스의 이용은 18세 이상으로 합니다",
            "이용 등록이 필요한 기능(Track·Timeline)에서는 정확한 정보를 등록하는 것으로 합니다",
            "본 서비스의 결과는 어디까지나 참고 정보이며, 의학적 판단의 근거로 사용하지 않는 것으로 합니다",
          ]},
        ],
      },
      {
        heading: "제3조 (금지 사항)",
        items: [
          { type: "p", text: "다음 행위를 금지합니다." },
          { type: "ul", items: [
            "제3자의 사진·동영상을 본인의 동의 없이 업로드하는 행위",
            "본 서비스를 의료 진단·법적 증거로 단독으로 사용하는 행위",
            "본 서비스의 시스템에 무단 접근하는 행위",
            "본 서비스를 통해 허위 정보를 확산하는 행위",
            "상업적 목적으로의 무단 이용",
          ]},
        ],
      },
      {
        heading: "제4조 (업로드 콘텐츠)",
        items: [
          { type: "p", text: "【체커 기능】" },
          { type: "ul", items: [
            "업로드된 사진은 브라우저 내에서 처리됩니다",
            "서버로의 전송은 각도 계산을 위해서만 사용됩니다",
            "처리 완료 후, 서버 상의 데이터는 즉시 삭제됩니다",
            "사진은 저장·축적되지 않습니다",
          ]},
          { type: "p", text: "【Track·Timeline 기능 (회원용)】" },
          { type: "ul", items: [
            "업로드된 사진·동영상은 사용자 계정에 연결하여 저장됩니다",
            "저장 데이터는 사용자 본인만 열람할 수 있습니다",
            "계정 삭제 시 모든 데이터를 삭제합니다",
          ]},
        ],
      },
      {
        heading: "제5조 (AI 학습 이용)",
        items: [
          { type: "p", text: "본 서비스 향상을 목적으로, 다음 조건으로 AI 학습에 이용하는 경우가 있습니다." },
          { type: "ul", items: [
            "대상: Track·Timeline 기능으로 업로드된 동영상·사진",
            "조건: 개인을 특정할 수 없는 형태로 가공·익명화한 후 사용합니다",
            "목적: 각도 검출 정밀도 향상·서비스 품질 개선에만 사용합니다",
            "제3자 제공: 하지 않습니다",
          ]},
        ],
      },
      {
        heading: "제6조 (면책 사항)",
        items: [{ type: "ul", items: [
          "본 서비스의 결과는 참고 정보이며, 의학적 진단이 아닙니다",
          "본 서비스 이용으로 발생한 손해에 대해 운영자는 책임을 지지 않습니다",
          "본 서비스의 정밀도·가용성을 보증하지 않습니다",
          "클리닉에 대한 판단·선택은 사용자 본인의 책임으로 행하여 주십시오",
        ]}],
      },
      {
        heading: "제7조 (서비스 변경·종료)",
        items: [{ type: "p", text: "운영자는 사전 통지 없이 서비스 내용을 변경·종료하는 경우가 있습니다." }],
      },
      {
        heading: "제8조 (이용약관 변경)",
        items: [{ type: "p", text: "본 약관은 필요에 따라 개정합니다. 중요한 변경이 있는 경우는 서비스 상에서 안내합니다." }],
      },
      {
        heading: "제9조 (준거법·관할 법원)",
        items: [{ type: "p", text: "본 약관은 일본법에 준거합니다. 분쟁이 발생한 경우는 도쿄지방법원을 제1심의 전속적 합의 관할 법원으로 합니다." }],
      },
    ],
  },
};

// ── Privacy ───────────────────────────────────────────────────────────────────

export const PRIVACY: Record<LegalLang, LegalDoc> = {
  ja: {
    title: "Angle Log",
    subtitle: "プライバシーポリシー",
    lastUpdated: "最終更新日：2026年__月__日",
    sections: [
      {
        heading: "1. 収集する情報",
        items: [
          { type: "p", text: "【自動的に収集する情報】" },
          { type: "ul", items: [
            "アクセスログ（IPアドレス・ブラウザ情報・アクセス日時）",
            "Cookie・ローカルストレージのデータ（設定情報）",
          ]},
          { type: "p", text: "【ユーザーが提供する情報】" },
          { type: "ul", items: [
            "メールアドレス（会員登録時）",
            "写真・動画（チェッカー・Track機能使用時）",
          ]},
          { type: "p", text: "【収集しない情報】" },
          { type: "ul", items: [
            "氏名・住所・電話番号",
            "クレジットカード情報",
            "その他の個人を特定できる情報",
          ]},
        ],
      },
      {
        heading: "2. 情報の利用目的",
        items: [{ type: "table", rows: [
          ["メールアドレス", "アカウント管理・重要なお知らせ"],
          ["写真（チェッカー）", "角度・明るさの計算のみ・即時削除"],
          ["写真・動画（Track）", "時系列記録の表示・AI学習（匿名化後）"],
          ["アクセスログ", "サービス改善・不正利用防止"],
        ]}],
      },
      {
        heading: "3. 第三者への提供",
        items: [
          { type: "p", text: "収集した情報を第三者に提供することはありません。ただし以下の場合を除きます。" },
          { type: "ul", items: [
            "法令に基づく開示要求がある場合",
            "ユーザーの同意がある場合",
          ]},
        ],
      },
      {
        heading: "4. データの保存と削除",
        items: [{ type: "table", rows: [
          ["チェッカーの写真", "サーバー（一時）→ 処理後即時削除"],
          ["Trackの写真・動画", "サーバー → アカウント削除まで"],
          ["アクセスログ", "サーバー → 90日間"],
          ["メールアドレス", "サーバー → アカウント削除まで"],
        ]}],
      },
      {
        heading: "5. ユーザーの権利",
        items: [
          { type: "ul", items: [
            "保存されたデータの開示請求",
            "データの修正・削除請求",
            "アカウントの削除",
          ]},
          { type: "p", text: "上記の請求はお問い合わせ先までご連絡ください。" },
        ],
      },
      {
        heading: "6. Cookieの使用",
        items: [
          { type: "p", text: "本サービスではCookieおよびローカルストレージを以下の目的で使用します。" },
          { type: "ul", items: [
            "ログイン状態の維持",
            "ダークモード・ライトモードの設定保存",
            "サービス利用状況の分析（匿名）",
          ]},
        ],
      },
      {
        heading: "7. セキュリティ",
        items: [{ type: "ul", items: [
          "通信はSSL/TLSで暗号化されます",
          "サーバー上のデータは適切なアクセス制御のもとで管理されます",
          "定期的なセキュリティ監査を実施します",
        ]}],
      },
      {
        heading: "8. 未成年者の利用",
        items: [{ type: "p", text: "本サービスは18歳以上を対象としています。18歳未満の方の利用はお断りしています。" }],
      },
      {
        heading: "9. プライバシーポリシーの変更",
        items: [{ type: "p", text: "本ポリシーは必要に応じて改定します。重要な変更がある場合はサービス上でお知らせします。" }],
      },
      {
        heading: "10. お問い合わせ",
        items: [{ type: "ul", items: [
          "運営：Angle Log",
          "メール：anglelog0624@gmail.com",
          "受付時間：平日10:00〜18:00（日本時間）",
        ]}],
      },
    ],
  },

  en: {
    title: "Angle Log",
    subtitle: "Privacy Policy",
    lastUpdated: "Last updated: 2026/__/__",
    sections: [
      {
        heading: "1. Information We Collect",
        items: [
          { type: "p", text: "【Automatically collected】" },
          { type: "ul", items: [
            "Access logs (IP address, browser information, access date/time)",
            "Cookie and local storage data (settings)",
          ]},
          { type: "p", text: "【Provided by users】" },
          { type: "ul", items: [
            "Email address (at registration)",
            "Photos and videos (when using Checker / Track functions)",
          ]},
          { type: "p", text: "【Information we do NOT collect】" },
          { type: "ul", items: [
            "Name, address, or phone number",
            "Credit card information",
            "Any other personally identifiable information",
          ]},
        ],
      },
      {
        heading: "2. Purpose of Use",
        items: [{ type: "table", rows: [
          ["Email address", "Account management and important notices"],
          ["Photos (Checker)", "Angle/brightness calculation only — deleted immediately"],
          ["Photos/videos (Track)", "Timeline display and AI training (after anonymization)"],
          ["Access logs", "Service improvement and fraud prevention"],
        ]}],
      },
      {
        heading: "3. Third-Party Disclosure",
        items: [
          { type: "p", text: "Collected information will not be provided to third parties, except in the following cases:" },
          { type: "ul", items: [
            "When required by law",
            "With the user's consent",
          ]},
        ],
      },
      {
        heading: "4. Data Storage and Deletion",
        items: [{ type: "table", rows: [
          ["Checker photos", "Server (temporary) → deleted immediately after processing"],
          ["Track photos/videos", "Server → until account deletion"],
          ["Access logs", "Server → 90 days"],
          ["Email address", "Server → until account deletion"],
        ]}],
      },
      {
        heading: "5. Your Rights",
        items: [
          { type: "ul", items: [
            "Request disclosure of stored data",
            "Request correction or deletion of data",
            "Delete your account",
          ]},
          { type: "p", text: "Please contact us using the details below for any of the above requests." },
        ],
      },
      {
        heading: "6. Use of Cookies",
        items: [
          { type: "p", text: "This Service uses cookies and local storage for the following purposes:" },
          { type: "ul", items: [
            "Maintaining login status",
            "Saving dark/light mode preferences",
            "Anonymous analysis of service usage",
          ]},
        ],
      },
      {
        heading: "7. Security",
        items: [{ type: "ul", items: [
          "Communications are encrypted with SSL/TLS",
          "Server data is managed with appropriate access controls",
          "Regular security audits are conducted",
        ]}],
      },
      {
        heading: "8. Minors",
        items: [{ type: "p", text: "This Service is intended for users 18 years of age and older. Users under 18 are not permitted." }],
      },
      {
        heading: "9. Changes to This Policy",
        items: [{ type: "p", text: "This policy may be revised as necessary. In case of significant changes, notice will be provided through the Service." }],
      },
      {
        heading: "10. Contact",
        items: [{ type: "ul", items: [
          "Operator: Angle Log",
          "Email: anglelog0624@gmail.com",
          "Hours: Weekdays 10:00–18:00 (Japan Standard Time)",
        ]}],
      },
    ],
  },

  ko: {
    title: "Angle Log",
    subtitle: "개인정보처리방침",
    lastUpdated: "최종 수정일: 2026년 __월 __일",
    sections: [
      {
        heading: "1. 수집하는 정보",
        items: [
          { type: "p", text: "【자동으로 수집하는 정보】" },
          { type: "ul", items: [
            "액세스 로그 (IP 주소·브라우저 정보·액세스 일시)",
            "쿠키·로컬 스토리지 데이터 (설정 정보)",
          ]},
          { type: "p", text: "【사용자가 제공하는 정보】" },
          { type: "ul", items: [
            "이메일 주소 (회원 등록 시)",
            "사진·동영상 (체커·Track 기능 사용 시)",
          ]},
          { type: "p", text: "【수집하지 않는 정보】" },
          { type: "ul", items: [
            "성명·주소·전화번호",
            "신용카드 정보",
            "기타 개인을 특정할 수 있는 정보",
          ]},
        ],
      },
      {
        heading: "2. 정보의 이용 목적",
        items: [{ type: "table", rows: [
          ["이메일 주소", "계정 관리·중요 공지"],
          ["사진 (체커)", "각도·밝기 계산에만 사용·즉시 삭제"],
          ["사진·동영상 (Track)", "시계열 기록 표시·AI 학습 (익명화 후)"],
          ["액세스 로그", "서비스 개선·부정 이용 방지"],
        ]}],
      },
      {
        heading: "3. 제3자 제공",
        items: [
          { type: "p", text: "수집한 정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우는 제외합니다." },
          { type: "ul", items: [
            "법령에 근거한 공개 요청이 있는 경우",
            "사용자의 동의가 있는 경우",
          ]},
        ],
      },
      {
        heading: "4. 데이터 보존 및 삭제",
        items: [{ type: "table", rows: [
          ["체커의 사진", "서버 (일시적) → 처리 후 즉시 삭제"],
          ["Track의 사진·동영상", "서버 → 계정 삭제까지"],
          ["액세스 로그", "서버 → 90일간"],
          ["이메일 주소", "서버 → 계정 삭제까지"],
        ]}],
      },
      {
        heading: "5. 사용자의 권리",
        items: [
          { type: "ul", items: [
            "저장된 데이터의 열람 청구",
            "데이터의 수정·삭제 청구",
            "계정 삭제",
          ]},
          { type: "p", text: "위 청구는 아래 문의처로 연락해 주십시오." },
        ],
      },
      {
        heading: "6. 쿠키 사용",
        items: [
          { type: "p", text: "본 서비스에서는 쿠키 및 로컬 스토리지를 다음 목적으로 사용합니다." },
          { type: "ul", items: [
            "로그인 상태 유지",
            "다크 모드·라이트 모드 설정 저장",
            "서비스 이용 현황 분석 (익명)",
          ]},
        ],
      },
      {
        heading: "7. 보안",
        items: [{ type: "ul", items: [
          "통신은 SSL/TLS로 암호화됩니다",
          "서버 상의 데이터는 적절한 접근 제어하에 관리됩니다",
          "정기적인 보안 감사를 실시합니다",
        ]}],
      },
      {
        heading: "8. 미성년자 이용",
        items: [{ type: "p", text: "본 서비스는 18세 이상을 대상으로 합니다. 18세 미만의 이용은 사절합니다." }],
      },
      {
        heading: "9. 개인정보처리방침 변경",
        items: [{ type: "p", text: "본 방침은 필요에 따라 개정합니다. 중요한 변경이 있는 경우는 서비스 상에서 안내합니다." }],
      },
      {
        heading: "10. 문의",
        items: [{ type: "ul", items: [
          "운영: Angle Log",
          "이메일: anglelog0624@gmail.com",
          "접수 시간: 평일 10:00~18:00 (일본 시간)",
        ]}],
      },
    ],
  },
};
