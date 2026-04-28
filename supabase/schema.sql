-- =====================================================
-- Night Market — Supabase Schema
-- Run this in Supabase SQL Editor (Database > SQL Editor)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  color TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  banned BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  en TEXT NOT NULL,
  th TEXT NOT NULL,
  cat TEXT NOT NULL,
  emoji TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dish_types (
  id TEXT PRIMARY KEY,
  th TEXT NOT NULL,
  en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dishes (
  id TEXT PRIMARY KEY,
  en TEXT NOT NULL,
  th TEXT NOT NULL,
  tag TEXT NOT NULL,
  time INTEGER NOT NULL,
  spicy INTEGER NOT NULL,
  difficulty INTEGER NOT NULL,
  kcal INTEGER NOT NULL,
  vegan BOOLEAN NOT NULL DEFAULT false,
  meal TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  rating REAL NOT NULL DEFAULT 4.5,
  reviews INTEGER NOT NULL DEFAULT 0,
  trending INTEGER,
  color TEXT NOT NULL,
  image TEXT,
  status TEXT NOT NULL DEFAULT 'Stable',
  source TEXT NOT NULL DEFAULT 'built-in',
  youtube TEXT
);

CREATE TABLE IF NOT EXISTS dish_ingredients (
  dish_id TEXT NOT NULL,
  ingredient_id TEXT NOT NULL,
  PRIMARY KEY (dish_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS dish_steps (
  id BIGSERIAL PRIMARY KEY,
  dish_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cooks (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar TEXT NOT NULL,
  color TEXT NOT NULL,
  bio TEXT NOT NULL,
  specialty TEXT NOT NULL,
  location TEXT,
  total_likes INTEGER NOT NULL DEFAULT 0,
  avg_rating REAL NOT NULL DEFAULT 4.5,
  dish_offset INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  avatar TEXT NOT NULL,
  dish TEXT NOT NULL,
  caption TEXT NOT NULL,
  ingredients TEXT,
  steps TEXT,
  youtube TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  color TEXT NOT NULL,
  image TEXT,
  deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  dish_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  stars INTEGER NOT NULL,
  when_text TEXT NOT NULL,
  review_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_saved (
  user_id TEXT NOT NULL,
  dish_id TEXT NOT NULL,
  PRIMARY KEY (user_id, dish_id)
);

CREATE TABLE IF NOT EXISTS user_fridge (
  user_id TEXT NOT NULL,
  ingredient_id TEXT NOT NULL,
  PRIMARY KEY (user_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
  id BIGSERIAL PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
