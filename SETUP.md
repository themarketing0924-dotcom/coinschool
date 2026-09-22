# 코인스쿨 리드 저장 · 자동 발송 설치 가이드

## 전체 구조
```
신청자 → blockchain-lead.html / enroll.html (폼)
        → Google Apps Script 웹 앱 (검증·스팸 차단) → 구글시트 '신청자' 탭
                                    ↓ (매일 오전 10시 트리거)
                              쿨SMS API → 문자 발송
```

> 이 저장소는 **공개**입니다. 시트 ID·API 키·전화번호는 코드나 문서에 적지 마세요.
> 비밀값은 Apps Script의 **스크립트 속성**에만 저장합니다.

---

## Step 1. 구글시트에서 스크립트 열기

1. 리드를 저장할 구글시트를 엽니다. (시트 공유 설정은 **제한됨** 유지 — "링크가 있는 모든 사용자"로 바꾸지 마세요. 전화번호·이메일이 담깁니다.)
2. 메뉴 **확장 프로그램 → Apps Script** 를 엽니다. (시트에서 열면 시트 ID가 필요 없습니다.)
3. 기본 코드를 지우고 `apps-script.gs` 내용 전체를 붙여넣고 저장합니다.
4. `신청자` 탭이 없어도 첫 신청 때 자동으로 만들어집니다.

## Step 2. 스크립트 속성 등록 (비밀값)

Apps Script 왼쪽 **프로젝트 설정(⚙) → 스크립트 속성 → 속성 추가**

| 속성 | 값 | 필수 |
|---|---|---|
| `COOLSMS_KEY` | 쿨SMS API Key | 문자 발송 시 |
| `COOLSMS_SECRET` | 쿨SMS API Secret | 문자 발송 시 |
| `SENDER_PHONE` | 쿨SMS 등록 발신번호 (하이픈 없이) | 문자 발송 시 |
| `TEST_PHONE` | 테스트 수신 번호 | 선택 |
| `SHEET_ID` | 시트에 연결하지 않은 독립 스크립트일 때만 | 선택 |

리드 저장만 먼저 쓴다면 이 단계는 건너뛰어도 됩니다.

## Step 3. 웹 앱으로 배포

1. 오른쪽 위 **배포 → 새 배포 → 유형: 웹 앱**
2. 실행 계정: **나** / 액세스 권한: **모든 사용자** → 배포
3. 처음 한 번 권한 승인 화면이 뜹니다 (고급 → 이동 → 허용).
4. 나온 `https://script.google.com/macros/s/.../exec` 주소를 복사합니다.

> 코드를 수정한 뒤에는 **배포 관리 → 수정 → 새 버전**으로 다시 배포해야 반영됩니다.

## Step 4. 페이지에 주소 연결

아래 두 곳의 `YOUR_APPS_SCRIPT_WEB_APP_URL`을 Step 3 주소로 바꿉니다.

- `blockchain-lead.html` → `const LEAD_ENDPOINT = '...'`
- `enroll.html` → `const SCRIPT_URL = '...'`

주소가 비어 있으면 두 페이지 모두 "신청 시스템을 준비 중입니다"를 표시하고 완료 화면을 띄우지 않습니다.

## Step 5. 저장 테스트

1. 배포된 페이지에서 본인 정보로 신청 → 시트 `신청자` 탭에 한 줄이 생기는지 확인
2. 같은 번호로 다시 신청 → 새 줄이 생기지 않고 "이미 신청된 연락처" 안내가 나오는지 확인

저장되는 열: 신청일시 · 이름 · 전화번호 · 현재DAY · 완료여부 · 마지막발송 · 교육자료 발송 동의 · 마케팅 수신 동의 · 이메일 · 유입페이지 · 유입경로(UTM)

## 적용된 보안 장치

- 서버 검증: 이름 2자 이상, 이메일·휴대폰 형식, 필수 동의 (브라우저 검증은 우회될 수 있으므로 서버에서 다시 확인)
- 시트 수식 주입 방지: `=`, `+`, `-`, `@`로 시작하는 입력은 텍스트로 저장
- 스팸 차단: 숨김 입력칸(허니팟), 너무 빠른 제출 차단, 분당 신청 상한, 동시 접수 잠금
- 중복 방지: 하이픈·앞자리 0 여부와 상관없이 같은 번호는 한 번만 저장
- 내부 오류 내용을 브라우저에 노출하지 않고 고정된 결과 코드만 반환
- 시트 ID·쿨SMS 키는 코드가 아닌 스크립트 속성에 보관

## 문자 자동 발송 (선택)

1. [coolsms.co.kr](https://coolsms.co.kr) 가입 → 발신번호 등록(본인인증) → API Key/Secret 발급
2. Step 2의 속성 3개 등록
3. Apps Script **트리거(시계 아이콘) → 트리거 추가**: 함수 `sendDailyCourse`, 시간 기반, 매일, 오전 10~11시
4. `testSendToMe`를 실행해 본인 번호로 테스트 문자 수신 확인

## GitHub Pages

`github.com/themarketing0924-dotcom/coinschool` → Settings → Pages → Branch: main → Save

- 리드 랜딩: `https://themarketing0924-dotcom.github.io/coinschool/blockchain-lead.html`
- 신청 페이지: `https://themarketing0924-dotcom.github.io/coinschool/enroll.html`
- 학습실: `https://themarketing0924-dotcom.github.io/coinschool/study-room.html`
