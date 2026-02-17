-- Migration: Add destinations and courses tables
-- DateTrip 추천 여행지/코스 기능을 위한 테이블 추가

-- Destinations 테이블 (추천 여행지)
CREATE TABLE IF NOT EXISTS destinations (
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
CREATE TABLE IF NOT EXISTS courses (
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

DROP POLICY IF EXISTS "Anyone can view active destinations" ON destinations;
CREATE POLICY "Anyone can view active destinations" 
  ON destinations FOR SELECT 
  USING (is_active = true);

-- Courses: 누구나 조회 가능 (공개 데이터)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view featured courses" ON courses;
CREATE POLICY "Anyone can view featured courses" 
  ON courses FOR SELECT 
  USING (is_featured = true);

-- Seed data for destinations (기존 데이터 없을 때만)
INSERT INTO destinations (name, description, rating, tags, order_index) 
SELECT '제주도', '푸른 바다와 아름다운 오름', 4.8, ARRAY['핫플', '자연', '힐링'], 1
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = '제주도');

INSERT INTO destinations (name, description, rating, tags, order_index) 
SELECT '부산', '해운대와 감천문화마을', 4.7, ARRAY['도시', '맛집', '바다'], 2
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = '부산');

INSERT INTO destinations (name, description, rating, tags, order_index) 
SELECT '강릉', '커피 거리와 아름다운 항구', 4.6, ARRAY['커피', '핫플', '로맨틱'], 3
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = '강릉');

INSERT INTO destinations (name, description, rating, tags, order_index) 
SELECT '전주', '한옥마을과 전통 음식', 4.5, ARRAY['전통', '맛집', '문화'], 4
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = '전주');

INSERT INTO destinations (name, description, rating, tags, order_index) 
SELECT '경주', '천년 고도의 역사 여행', 4.6, ARRAY['역사', '문화', '야경'], 5
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = '경주');

INSERT INTO destinations (name, description, rating, tags, order_index) 
SELECT '여수', '밤바다와 낭만 가득', 4.7, ARRAY['야경', '바다', '로맨틱'], 6
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = '여수');

-- Seed data for courses (기존 데이터 없을 때만)
INSERT INTO courses (title, author_name, destination, days, places_count, likes_count)
SELECT '제주 3박 4일 커플 여행', 'Traveler Kim', '제주도', 4, 12, 2341
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = '제주 3박 4일 커플 여행');

INSERT INTO courses (title, author_name, destination, days, places_count, likes_count)
SELECT '부산 2박 3일 먹방 투어', 'Foodie Lee', '부산', 3, 15, 1856
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = '부산 2박 3일 먹방 투어');

INSERT INTO courses (title, author_name, destination, days, places_count, likes_count)
SELECT '강릉 1박 2일 힐링 여행', 'Relax Park', '강릉', 2, 8, 1234
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = '강릉 1박 2일 힐링 여행');

INSERT INTO courses (title, author_name, destination, days, places_count, likes_count)
SELECT '전주 당일치기 한옥마을', 'Culture Choi', '전주', 1, 6, 987
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = '전주 당일치기 한옥마을');

INSERT INTO courses (title, author_name, destination, days, places_count, likes_count)
SELECT '경주 2박 3일 역사 탐방', 'History Jung', '경주', 3, 10, 1567
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = '경주 2박 3일 역사 탐방');
