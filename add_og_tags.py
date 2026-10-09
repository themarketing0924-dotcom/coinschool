#!/usr/bin/env python3
"""
coinschool OG 태그 일괄 삽입 스크립트
coinschool 폴더에서 실행: python3 add_og_tags.py
"""
import os, re

BASE_URL = "https://themarketing0924-dotcom.github.io/coinschool"
OG_IMAGE = f"{BASE_URL}/og-image.png"

PAGES = {
    "index.html":           {"title": "코인스쿨 — 블록체인 마스터클래스", "desc": "블록체인 초보자를 위한 무료 7강 마스터클래스. DeFi, RWA, 고래추적, 온체인 분석까지."},
    "blockchain-lead.html": {"title": "블록체인 마스터클래스 EP.01~07 | 무료 수강 신청", "desc": "코린이 99%가 모르는 블록체인 구조를 7강으로 완전 이해. 무료로 시작하세요."},
    "enroll.html":          {"title": "무료 수강 신청 — 코인스쿨 블록체인 7강", "desc": "지금 신청하면 EP.01~07 전 강의를 무료로 받아볼 수 있습니다."},
    "study-room.html":      {"title": "무료 7강 학습실 | 코인스쿨", "desc": "블록체인 마스터클래스 EP.01~07 학습실. 영상으로 바로 시작하세요."},
    "bridge.html":          {"title": "7강 완주 후 다음 단계 — RWA 마스터클래스", "desc": "무료 7강을 마쳤다면, 이제 실물자산 토큰화(RWA)의 세계로. 다음 단계를 확인하세요."},
    "masterclass.html":     {"title": "RWA 마스터클래스 — 실물자산 토큰화 완전 정복", "desc": "게임이 바뀌었다. 기관이 움직이는 실물자산 토큰화(RWA) 투자 전략."},
    "thankyou.html":        {"title": "수강 신청 완료 — 코인스쿨", "desc": "신청이 완료됐습니다. 이메일을 확인해주세요."},
    "ep01-blockchain.html": {"title": "EP.01 블록체인 혁명 — 코인스쿨", "desc": "기술이 세상을 바꾸는 방식. 블록체인의 구조와 작동 원리를 쉽게 이해합니다."},
    "ep02-defi.html":       {"title": "EP.02 DeFi — 은행 없는 금융 | 코인스쿨", "desc": "탈중앙화 금융(DeFi)의 구조와 수익 창출 원리를 완전히 이해합니다."},
    "ep03-rwa.html":        {"title": "EP.03 공기코인의 민낯 — 코인스쿨", "desc": "89%가 사라지는 코인의 진실. 진짜 코인과 사기 코인을 구별하는 법."},
    "ep04-money.html":      {"title": "EP.04 거인들의 돈 — 코인스쿨", "desc": "기관 자금 흐름 추적. 스마트머니가 움직이는 방향을 읽는 법."},
    "ep05-whale.html":      {"title": "EP.05 고래를 추적하라 — 코인스쿨", "desc": "온체인 스마트머니 분석 실전. 고래 지갑의 움직임으로 투자에 활용."},
    "ep06.html":            {"title": "EP.06 진짜 코인 vs 사기 코인 — 코인스쿨", "desc": "코인 해부학. 러그풀을 사전에 판별하는 체크리스트."},
    "ep07.html":            {"title": "EP.07 블록체인으로 먹고사는 법 — 코인스쿨", "desc": "커리어와 수익화 로드맵. 블록체인 기술로 실제 수익을 만드는 방법."},
    "rwa-masterclass.html": {"title": "RWA 마스터클래스 — 실물자산 토큰화의 시대", "desc": "게임이 바뀌었다. 기관이 주도하는 실물자산 토큰화(RWA) 완전 분석."},
}

def og_block(slug, info):
    url = f"{BASE_URL}/{slug}"
    return f"""  <meta property="og:type" content="website">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{info['title']}">
  <meta property="og:description" content="{info['desc']}">
  <meta property="og:image" content="{OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="코인스쿨">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="{OG_IMAGE}">
  <meta name="description" content="{info['desc']}">"""

updated = []
skipped = []

for slug, info in PAGES.items():
    if not os.path.exists(slug):
        skipped.append(slug)
        continue
    with open(slug, encoding="utf-8") as f:
        html = f.read()
    # 이미 og:url 있으면 교체
    if 'property="og:url"' in html:
        html = re.sub(
            r'  <meta property="og:type".*?<meta name="description"[^>]+>',
            og_block(slug, info), html, flags=re.DOTALL
        )
    else:
        html = html.replace("</head>", og_block(slug, info) + "\n</head>", 1)
    with open(slug, "w", encoding="utf-8") as f:
        f.write(html)
    updated.append(slug)
    print(f"✅ {slug}")

print(f"\n완료: {len(updated)}개 업데이트 / {len(skipped)}개 건너뜀")
if skipped:
    print("건너뜀:", skipped)
