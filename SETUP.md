# 코인스쿨 자동 발송 시스템 설치 가이드

## 전체 구조
```
신청자 → enroll.html (폼) → Google Apps Script → 구글시트 저장
                                                ↓ (매일 오전 10시)
                                      5일간 쿨SMS API → 문자 발송
```

---

## Step 1. 구글시트 생성

1. [sheets.google.com](https://sheets.google.com) → 새 스프레드시트 생성
2. 시트 이름: **신청자** (탭 더블클릭 → 이름 변경)
3. URL에서 Sheet ID 복사: `https://docs.google.com/spreadsheets/d/★이부분★/edit`

`apps-script.gs`가 첫 신청 시 교육자료 발송 동의와 선택 마케팅 수신 동의 열을 함께 생성합니다.

---

## Step 2. Google Apps Script 설정

1. [script.google.com](https://script.google.com) → 새 프로젝트
2. `apps-script.gs` 파일 내용 전체 복사 → 붙여넣기
3. `CONFIG` 상단 값 교체:
   - `SHEET_ID`: Step 1에서 복사한 ID
   - `COOLSMS_KEY`: 쿨SMS API Key
   - `COOLSMS_SECRET`: 쿨SMS API Secret
   - `SENDER_PHONE`: 발신 번호 (쿨SMS에 등록된 번호)

4. **배포** → 웹 앱으로 배포 → 액세스 권한: **모든 사용자** → 배포
5. 나타나는 URL 복사

---

## Step 3. enroll.html에 URL 연결

`enroll.html` 파일에서 아래 줄 찾아 URL 교체:
```js
const SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';
// ↓ 교체
const SCRIPT_URL = 'https://script.google.com/macros/s/★★★/exec';
```

---

## Step 4. 쿨SMS 계정 설정

1. [coolsms.co.kr](https://coolsms.co.kr) → 회원가입
2. 발신번호 등록 (본인인증 필요)
3. API Key/Secret 발급: 마이페이지 → API Key 관리

---

## Step 5. 일일 자동 발송 트리거 설정

1. Apps Script 편집기 → **트리거** (시계 아이콘)
2. 트리거 추가:
   - 실행할 함수: `sendDailyCourse`
   - 이벤트 소스: **시간 기반**
   - 유형: **매일**
   - 시간: **오전 10시 ~ 오전 11시**
3. 저장

---

## Step 6. 테스트

Apps Script 편집기에서:
1. `testSendToMe` 함수에 본인 번호 입력
2. 실행 → 문자 수신 확인

---

## GitHub Pages 활성화

`github.com/themarketing0924-dotcom/coinschool` → Settings → Pages → Branch: main → Save

접속 주소: `https://themarketing0924-dotcom.github.io/coinschool/enroll.html`

학습실 주소: `https://themarketing0924-dotcom.github.io/coinschool/study-room.html`
