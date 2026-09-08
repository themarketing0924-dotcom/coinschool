// ════════════════════════════════════════════════════════════
//  코인스쿨 — Google Apps Script
//  역할: ① 신청 폼 수신 → 구글시트 저장
//        ② 매일 오전 10시 트리거 → 쿨SMS로 오늘 강의 문자 발송
// ════════════════════════════════════════════════════════════

// ★★★ 아래 3가지를 본인 정보로 교체하세요 ★★★
const CONFIG = {
  SHEET_ID:     'YOUR_GOOGLE_SHEET_ID',      // 구글시트 ID (URL에서 복사)
  COOLSMS_KEY:  'YOUR_COOLSMS_API_KEY',      // 쿨SMS API Key
  COOLSMS_SECRET: 'YOUR_COOLSMS_API_SECRET', // 쿨SMS API Secret
  SENDER_PHONE: '01000000000',               // 발신자 번호 (쿨SMS 등록 번호, 하이픈 없이)
  BASE_URL:     'https://themarketing0924-dotcom.github.io/coinschool', // GitHub Pages URL
};

// 5일 커리큘럼
const COURSES = [
  { day: 1, title: 'EP.01 블록체인 혁명',         url: CONFIG.BASE_URL + '/ep01-blockchain.html' },
  { day: 2, title: 'EP.02 DeFi — 은행 없는 금융', url: CONFIG.BASE_URL + '/ep02-defi.html' },
  { day: 3, title: 'EP.03 공기코인의 민낯',        url: CONFIG.BASE_URL + '/ep03-rwa.html' },
  { day: 4, title: 'EP.04 거인들의 돈은 어디로',  url: CONFIG.BASE_URL + '/ep04-money.html' },
  { day: 5, title: 'EP.05 고래를 추적하라',        url: CONFIG.BASE_URL + '/ep05-whale.html' },
];

// ────────────────────────────────────────────────────────────
//  ① 폼 수신 (POST) → 구글시트 저장
// ────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('신청자');

    // 헤더가 없으면 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '신청일시', '이름', '전화번호', '현재DAY', '완료여부', '마지막발송',
        '교육자료 발송 동의', '마케팅 수신 동의'
      ]);
    } else if (sheet.getLastColumn() < 8) {
      sheet.getRange(1, 7, 1, 2).setValues([['교육자료 발송 동의', '마케팅 수신 동의']]);
    }

    // 전화번호 정규화 (하이픈 제거)
    const phone = data.phone.replace(/\D/g, '');

    // 중복 체크
    const existing = sheet.getDataRange().getValues();
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][2].toString().replace(/\D/g, '') === phone) {
        return ContentService
          .createTextOutput(JSON.stringify({ status: 'duplicate' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 신규 저장
    sheet.appendRow([
      new Date(),
      data.name,
      phone,
      0,          // 현재 DAY (0 = 아직 시작 전)
      'N',        // 완료여부
      '',         // 마지막발송
      data.educationConsent === true ? 'Y' : 'N',
      data.marketingConsent === true ? 'Y' : 'N'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', msg: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ────────────────────────────────────────────────────────────
//  ② 매일 트리거 → 오늘의 강의 SMS 발송
//  (트리거 설정: 편집 → 트리거 → 시간 기반 → 매일 오전 10시)
// ────────────────────────────────────────────────────────────
function sendDailyCourse() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('신청자');
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return; // 데이터 없음

  const today = new Date();

  for (let i = 1; i < rows.length; i++) {
    const [joinDate, name, phone, currentDay, done, lastSent, educationConsent] = rows[i];
    if (educationConsent === 'N') continue;
    if (done === 'Y') continue; // 5일 완료

    const dayNum = Number(currentDay) + 1;
    if (dayNum > COURSES.length) {
      sheet.getRange(i + 1, 5).setValue('Y');
      continue;
    }

    const course = COURSES[dayNum - 1];
    const msg = [
      `[코인스쿨] ${name}님, Day ${dayNum} 강의가 도착했어요! 📚`,
      ``,
      `${course.title}`,
      `👇 지금 학습하기`,
      `${course.url}`,
      ``,
      `수신거부: 답장으로 '수신거부' 입력`
    ].join('\n');

    const success = sendSMS(phone, msg);

    if (success) {
      sheet.getRange(i + 1, 4).setValue(dayNum);          // 현재DAY 업데이트
      sheet.getRange(i + 1, 6).setValue(today.toLocaleString('ko-KR')); // 마지막발송
    }

    Utilities.sleep(300); // API 과호출 방지
  }
}

// ────────────────────────────────────────────────────────────
//  쿨SMS API 발송 함수
// ────────────────────────────────────────────────────────────
function sendSMS(to, text) {
  try {
    const timestamp = Date.now().toString();
    const signature = makeSignature(timestamp);

    const payload = {
      message: {
        to:   to,
        from: CONFIG.SENDER_PHONE,
        text: text,
        type: 'LMS'  // 90바이트 초과 시 LMS 자동 처리
      }
    };

    const res = UrlFetchApp.fetch('https://api.coolsms.co.kr/messages/v4/send', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': `HMAC-SHA256 apiKey=${CONFIG.COOLSMS_KEY}, date=${timestamp}, salt=${timestamp}, signature=${signature}`
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const result = JSON.parse(res.getContentText());
    Logger.log('SMS 발송: ' + to + ' → ' + JSON.stringify(result));
    return res.getResponseCode() === 200;

  } catch(err) {
    Logger.log('SMS 오류: ' + err.toString());
    return false;
  }
}

// HMAC-SHA256 서명 생성
function makeSignature(timestamp) {
  const salt = timestamp;
  const data = timestamp + salt;
  const key = CONFIG.COOLSMS_SECRET;
  const signature = Utilities.computeHmacSha256Signature(data, key);
  return signature.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

// ────────────────────────────────────────────────────────────
//  수신거부 처리 (문자 답장 '수신거부' 확인용 — 수동 처리)
// ────────────────────────────────────────────────────────────
function unsubscribeByPhone(phoneNumber) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('신청자');
  const rows = sheet.getDataRange().getValues();
  const phone = phoneNumber.replace(/\D/g, '');

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2].toString().replace(/\D/g, '') === phone) {
      sheet.getRange(i + 1, 5).setValue('거부');
      Logger.log('수신거부 처리: ' + phone);
      return;
    }
  }
}

// ────────────────────────────────────────────────────────────
//  테스트 — 스크립트 에디터에서 직접 실행하여 확인
// ────────────────────────────────────────────────────────────
function testSendToMe() {
  const testPhone = '01000000000'; // ← 본인 번호로 교체
  const msg = '[코인스쿨] 테스트 메시지입니다. 발송 시스템 정상 작동 중 ✅';
  const result = sendSMS(testPhone, msg);
  Logger.log('테스트 결과: ' + result);
}
