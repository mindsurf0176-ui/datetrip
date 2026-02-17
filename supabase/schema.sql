-- DateTrip Database Schema

-- Profiles 테이블 (사용자 프로필)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Couples 테이블 (커플 정보)
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips 테이블 (여행 정보)
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule Items 테이블 (일정 아이템)
CREATE TABLE schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  place_name TEXT NOT NULL,
  place_address TEXT,
  place_phone TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  visit_date DATE NOT NULL,
  visit_time TIME,
  memo TEXT,
  order_index INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist Items 테이블 (위시리스트)
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  place_name TEXT NOT NULL,
  place_address TEXT,
  place_phone TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  source_url TEXT,
  source_type TEXT CHECK (source_type IN ('instagram', 'youtube', 'other')),
  liked_by UUID[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) 정책 설정

-- Profiles: 자신의 프로필만 읽기/수정 가능
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Couples: 커플 멤버만 접근 가능
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view couple" 
  ON couples FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create couple" 
  ON couples FOR INSERT 
  WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Couple members can update couple" 
  ON couples FOR UPDATE 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Trips: 커플 멤버만 접근 가능
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view trips" 
  ON trips FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM couples 
    WHERE couples.id = trips.couple_id 
    AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
  ));

CREATE POLICY "Couple members can create trips" 
  ON trips FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM couples 
    WHERE couples.id = trips.couple_id 
    AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
  ));

CREATE POLICY "Couple members can update trips" 
  ON trips FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM couples 
    WHERE couples.id = trips.couple_id 
    AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
  ));

CREATE POLICY "Couple members can delete trips" 
  ON trips FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM couples 
    WHERE couples.id = trips.couple_id 
    AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
  ));

-- Schedule Items: 커플 멤버만 접근 가능
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view schedule items" 
  ON schedule_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM trips 
    JOIN couples ON trips.couple_id = couples.id
    WHERE trips.id = schedule_items.trip_id 
    AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
  ));

CREATE POLICY "Couple members can manage schedule items" 
  ON schedule_items FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM trips 
    JOIN couples ON trips.couple_id = couples.id
    WHERE trips.id = schedule_items.trip_id 
    AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
  ));

-- Wishlist Items: 커플 멤버만 접근 가능
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view wishlist" 
  ON wishlist_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM couples 
    WHERE couples.id = wishlist_items.couple_id 
    AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
  ));

CREATE POLICY "Couple members can manage wishlist" 
  ON wishlist_items FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM couples 
    WHERE couples.id = wishlist_items.couple_id 
    AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
  ));

-- Destinations 테이블 (추천 여행지)
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  rating DECIMAL(2, 1) DEFAULT 4.5,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses 테이블 (추천 코스)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  destination TEXT,
  days INTEGER DEFAULT 1,
  places_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Destinations: 누구나 조회 가능 (공개 데이터)
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active destinations" 
  ON destinations FOR SELECT 
  USING (is_active = true);

-- Courses: 누구나 조회 가능 (공개 데이터)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view featured courses" 
  ON courses FOR SELECT 
  USING (is_featured = true);

-- Seed data for destinations
INSERT INTO destinations (name, description, rating, tags, order_index) VALUES
  ('제주도', '푸른 바다와 아름다운 오름', 4.8, ARRAY['핫플', '자연', '힐링'], 1),
  ('부산', '해운대와 감천문화마을', 4.7, ARRAY['도시', '맛집', '바다'], 2),
  ('강릉', '커피 거리와 아름다운 항구', 4.6, ARRAY['커피', '핫플', '로맨틱'], 3),
  ('전주', '한옥마을과 전통 음식', 4.5, ARRAY['전통', '맛집', '문화'], 4),
  ('경주', '천년 고도의 역사 여행', 4.6, ARRAY['역사', '문화', '야경'], 5),
  ('여수', '밤바다와 낭만 가득', 4.7, ARRAY['야경', '바다', '로맨틱'], 6);

-- Seed data for courses
INSERT INTO courses (title, author_name, destination, days, places_count, likes_count) VALUES
  ('제주 3박 4일 커플 여행', 'Traveler Kim', '제주도', 4, 12, 2341),
  ('부산 2박 3일 먹방 투어', 'Foodie Lee', '부산', 3, 15, 1856),
  ('강릉 1박 2일 힐링 여행', 'Relax Park', '강릉', 2, 8, 1234),
  ('전주 당일치기 한옥마을', 'Culture Choi', '전주', 1, 6, 987),
  ('경주 2박 3일 역사 탐방', 'History Jung', '경주', 3, 10, 1567);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE trips;
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_items;
