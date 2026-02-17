# DateTrip TODO - QA 결과 (2026-02-18)

## 🔴 Critical Bugs (기능 완전히 누락)

### 1. 여행 수정 기능 없음 ✅ FIXED
- **위치**: `src/app/(main)/trips/[id]/page.tsx`
- **문제**: 여행 제목, 목적지, 날짜를 수정하는 기능이 전혀 없음
- **해결**: TripEditDialog 컴포넌트 생성 및 연결

### 2. 여행 삭제 기능 없음 ✅ FIXED
- **위치**: `src/app/(main)/trips/[id]/page.tsx`
- **문제**: 여행 자체를 삭제하는 버튼/로직이 없음
- **해결**: 여행 삭제 확인 다이얼로그 및 삭제 로직 추가

---

## 🟠 Medium Bugs (기능 일부 문제)

### 3. 게스트 모드 커플 데이터 불일치 ✅ FIXED
- **위치**: `src/auth/AuthContext.tsx` - `loginAsGuest()`
- **문제**: `user2_id`를 빈 문자열(`''`)로 설정하는데, DB 스키마상 `null`이어야 함
- **영향**: 커플 연결 상태 UI가 잘못 표시될 수 있음
- **해결**: 
  - `user2_id: null`로 변경
  - `types/index.ts`의 Couple 인터페이스에 `user2_id: string | null` 타입 수정

### 4. 홈페이지 여행 fetch 시 검증 누락
- **위치**: `src/app/(main)/page.tsx` - `fetchMyTrips()`
- **문제**: `couple?.id`가 undefined일 때 API 호출하면 에러 발생 가능
- **상태**: 실제로는 couple 존재 여부 체크 후 호출하므로 Low priority

### 5. 장소 추가 UI 가드 필요
- **위치**: `src/app/(main)/trips/[id]/page.tsx`
- **문제**: user가 null인 상태에서도 "장소 추가" 버튼이 보일 수 있음
- **상태**: 실제로는 인증된 사용자만 접근 가능하므로 Low priority

---

## 🟡 Low Priority (개선 필요)

### 6. ScheduleEditDialog 에러 처리 개선
- **위치**: `src/components/ScheduleEditDialog.tsx`
- **문제**: API 에러 발생 시 다이얼로그가 닫히지 않고 에러 메시지 표시해야 함
- **현재**: handleSave에서 에러 시 alert만 표시

### 7. 검색 기능 미구현
- **위치**: `src/app/(main)/page.tsx`
- **문제**: 검색 입력 UI는 있지만 실제 검색 로직 없음
- **계획**: 향후 구현 예정

### 8. 추천 기능 Mock 데이터
- **위치**: `src/app/(main)/page.tsx`
- **문제**: recommendedDestinations, recommendedCourses가 하드코딩됨
- **계획**: 백엔드 API 연동 시 실제 데이터로 교체

---

## ✅ 정상 작동 확인된 기능

1. **여행 생성** - ✅ 정상
   - 커플 연결 상태 체크
   - 날짜 검증 (시작일 < 종료일)
   - Supabase insert 정상

2. **장소 추가** - ✅ 정상
   - 카카오맵 API 연동
   - 디바운싱 검색
   - 카테고리 필터

3. **장소 수정** - ✅ 정상
   - ScheduleEditDialog 동작
   - 장소명, 시간, 메모 수정

4. **장소 삭제** - ✅ 정상
   - ConfirmDialog 확인
   - Supabase delete 정상

5. **장소 순서 변경** - ✅ 정상
   - dnd-kit 드래그앤드롭
   - order_index 업데이트

6. **커플 연결** - ✅ 정상
   - 초대 코드 생성
   - 초대 코드 입력 검증
   - 커플 연결 완료 UI

7. **실시간 동기화** - ✅ 정상
   - Supabase Realtime
   - INSERT/UPDATE/DELETE 이벤트 처리
   - syncStatus 표시
