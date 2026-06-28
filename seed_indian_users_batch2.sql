-- ENABLE pgcrypto if it isn't already (needed for passwords)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  user_0_id uuid := gen_random_uuid();
  user_1_id uuid := gen_random_uuid();
  user_2_id uuid := gen_random_uuid();
  user_3_id uuid := gen_random_uuid();
  user_4_id uuid := gen_random_uuid();
  user_5_id uuid := gen_random_uuid();
  user_6_id uuid := gen_random_uuid();
  user_7_id uuid := gen_random_uuid();
  user_8_id uuid := gen_random_uuid();
  user_9_id uuid := gen_random_uuid();
  user_10_id uuid := gen_random_uuid();
  user_11_id uuid := gen_random_uuid();
  user_12_id uuid := gen_random_uuid();
  user_13_id uuid := gen_random_uuid();
  user_14_id uuid := gen_random_uuid();
  user_15_id uuid := gen_random_uuid();
  user_16_id uuid := gen_random_uuid();
  user_17_id uuid := gen_random_uuid();
  user_18_id uuid := gen_random_uuid();
  user_19_id uuid := gen_random_uuid();
  cat_0_id uuid;
  cat_1_id uuid;
  cat_2_id uuid;
  cat_3_id uuid;
  cat_4_id uuid;
  cat_5_id uuid;
  cat_6_id uuid;
  cat_7_id uuid;
  cat_8_id uuid;
  cat_9_id uuid;
  cat_10_id uuid;
  cat_11_id uuid;
  cat_12_id uuid;
BEGIN
  ---------------------------------------------------------
  -- 1. ADD FAKE USERS TO AUTHENTICATION
  ---------------------------------------------------------
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES 
  (user_0_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pranav.kulkarni@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pranav Kulkarni"}', now(), now()),
  (user_1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'shreya.agarwal@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Shreya Agarwal"}', now(), now()),
  (user_2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nikhil.mishra@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nikhil Mishra"}', now(), now()),
  (user_3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pooja.saxena@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pooja Saxena"}', now(), now()),
  (user_4_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rahul.tiwari@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rahul Tiwari"}', now(), now()),
  (user_5_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'simran.kaur@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Simran Kaur"}', now(), now()),
  (user_6_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dhruv.shah@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dhruv Shah"}', now(), now()),
  (user_7_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nandini.joshi@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nandini Joshi"}', now(), now()),
  (user_8_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aman.bajpai@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aman Bajpai"}', now(), now()),
  (user_9_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya.nambiar@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Nambiar"}', now(), now()),
  (user_10_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vivek.soni@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vivek Soni"}', now(), now()),
  (user_11_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tanvi.ghosh@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tanvi Ghosh"}', now(), now()),
  (user_12_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'karan.oberoi@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Karan Oberoi"}', now(), now()),
  (user_13_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lakshmi.sub@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lakshmi Subramaniam"}', now(), now()),
  (user_14_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hardik.trivedi@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hardik Trivedi"}', now(), now()),
  (user_15_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anushka.bhatt@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Anushka Bhatt"}', now(), now()),
  (user_16_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mihir.patel@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mihir Patel"}', now(), now()),
  (user_17_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sanjana.yadav@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sanjana Yadav"}', now(), now()),
  (user_18_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'akash.rawat@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Akash Rawat"}', now(), now()),
  (user_19_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'divya.krish@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Divya Krishnamurthy"}', now(), now());

  ---------------------------------------------------------
  -- 2. CREATE THEIR PUBLIC PROFILES
  ---------------------------------------------------------
  INSERT INTO public.profiles (id, username, full_name, bio) VALUES
  (user_0_id, 'pranav_k', 'Pranav Kulkarni', 'DevOps engineer obsessed with automation and CI/CD pipelines.'),
  (user_1_id, 'shreya_dev', 'Shreya Agarwal', 'Full-stack developer who loves clean code and coffee.'),
  (user_2_id, 'nikhil_m', 'Nikhil Mishra', 'Competitive programmer and algorithm enthusiast.'),
  (user_3_id, 'pooja_s', 'Pooja Saxena', 'Mobile app developer specializing in Flutter and Dart.'),
  (user_4_id, 'rahul_t', 'Rahul Tiwari', 'Backend architect building high-performance APIs.'),
  (user_5_id, 'simran_k', 'Simran Kaur', 'UI developer passionate about animations and micro-interactions.'),
  (user_6_id, 'dhruv_s', 'Dhruv Shah', 'Cloud-native engineer working with Kubernetes and Terraform.'),
  (user_7_id, 'nandini_j', 'Nandini Joshi', 'Data analyst turning raw data into actionable insights.'),
  (user_8_id, 'aman_b', 'Aman Bajpai', 'Security researcher and penetration tester.'),
  (user_9_id, 'priya_n', 'Priya Nambiar', 'Open source advocate and Golang developer.'),
  (user_10_id, 'vivek_s', 'Vivek Soni', 'Embedded systems developer working on IoT firmware.'),
  (user_11_id, 'tanvi_g', 'Tanvi Ghosh', 'NLP researcher and Python enthusiast.'),
  (user_12_id, 'karan_o', 'Karan Oberoi', 'React Native developer building cross-platform apps.'),
  (user_13_id, 'lakshmi_s', 'Lakshmi Subramaniam', 'Database engineer specializing in PostgreSQL and Redis.'),
  (user_14_id, 'hardik_t', 'Hardik Trivedi', 'Java and Spring Boot developer building enterprise apps.'),
  (user_15_id, 'anushka_b', 'Anushka Bhatt', 'Frontend developer with a love for accessible design.'),
  (user_16_id, 'mihir_p', 'Mihir Patel', 'Rust and systems programming enthusiast.'),
  (user_17_id, 'sanjana_y', 'Sanjana Yadav', 'Machine learning engineer working on computer vision.'),
  (user_18_id, 'akash_r', 'Akash Rawat', 'Web3 and Solidity developer building dApps.'),
  (user_19_id, 'divya_k', 'Divya Krishnamurthy', 'Tech writer and JavaScript full-stack developer.')
  ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, full_name = EXCLUDED.full_name, bio = EXCLUDED.bio;

  ---------------------------------------------------------
  -- 3. CREATE CATEGORIES
  ---------------------------------------------------------
  INSERT INTO public.categories (name, description, color) VALUES
  ('DevOps', 'DevOps related snippets', '#f97316'),
  ('Python', 'Python related snippets', '#3776AB'),
  ('Flutter', 'Flutter related snippets', '#54C5F8'),
  ('JavaScript', 'JavaScript related snippets', '#f7df1e'),
  ('SQL', 'SQL related snippets', '#336791'),
  ('React', 'React related snippets', '#61DAFB'),
  ('Go', 'Go related snippets', '#00ADD8'),
  ('Web3', 'Web3 related snippets', '#8b5cf6'),
  ('CSS', 'CSS related snippets', '#264DE4'),
  ('Java', 'Java related snippets', '#ed8b00'),
  ('Rust', 'Rust related snippets', '#CE422B'),
  ('TypeScript', 'TypeScript related snippets', '#3178c6'),
  ('Bash', 'Bash related snippets', '#6b7280')
  ON CONFLICT (name) DO NOTHING;

  SELECT id INTO cat_0_id FROM public.categories WHERE name = 'DevOps';
  SELECT id INTO cat_1_id FROM public.categories WHERE name = 'Python';
  SELECT id INTO cat_2_id FROM public.categories WHERE name = 'Flutter';
  SELECT id INTO cat_3_id FROM public.categories WHERE name = 'JavaScript';
  SELECT id INTO cat_4_id FROM public.categories WHERE name = 'SQL';
  SELECT id INTO cat_5_id FROM public.categories WHERE name = 'React';
  SELECT id INTO cat_6_id FROM public.categories WHERE name = 'Go';
  SELECT id INTO cat_7_id FROM public.categories WHERE name = 'Web3';
  SELECT id INTO cat_8_id FROM public.categories WHERE name = 'CSS';
  SELECT id INTO cat_9_id FROM public.categories WHERE name = 'Java';
  SELECT id INTO cat_10_id FROM public.categories WHERE name = 'Rust';
  SELECT id INTO cat_11_id FROM public.categories WHERE name = 'TypeScript';
  SELECT id INTO cat_12_id FROM public.categories WHERE name = 'Bash';

  ---------------------------------------------------------
  -- 4. ADD FAKE PROJECTS / CODE SNIPPETS
  ---------------------------------------------------------
  INSERT INTO public.code_snippets (title, description, code, language, category_id, author_id, is_public, views, likes) VALUES
  ('Redis Cache Wrapper', 'A simple Node.js cache utility using ioredis.', 'const Redis = require(''ioredis'');
const redis = new Redis();

async function getOrSet(key, ttl, fetchFn) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

module.exports = { getOrSet };', 'javascript', cat_3_id, user_0_id, true, 812, 150),
  ('NLP Tokenizer in Python', 'Tokenize and clean text using NLTK.', 'import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

nltk.download(''punkt'')
nltk.download(''stopwords'')

text = "Natural language processing enables computers to understand human language."
tokens = word_tokenize(text.lower())
stop_words = set(stopwords.words(''english''))
filtered = [w for w in tokens if w.isalpha() and w not in stop_words]
stemmer = PorterStemmer()
stemmed = [stemmer.stem(w) for w in filtered]
print(stemmed)', 'python', cat_1_id, user_0_id, true, 750, 127),
  ('Golang REST Handler', 'A minimal HTTP handler using Go standard library.', 'package main

import (
    "encoding/json"
    "net/http"
)

type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

func getUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    user := User{ID: 1, Name: "Pranav"}
    json.NewEncoder(w).Encode(user)
}

func main() {
    http.HandleFunc("/user", getUser)
    http.ListenAndServe(":8080", nil)
}', 'go', cat_6_id, user_1_id, true, 316, 30),
  ('Kubernetes Health Check', 'A liveness and readiness probe config for a Node.js app.', 'livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5', 'yaml', cat_0_id, user_1_id, true, 116, 142),
  ('Redis Cache Wrapper', 'A simple Node.js cache utility using ioredis.', 'const Redis = require(''ioredis'');
const redis = new Redis();

async function getOrSet(key, ttl, fetchFn) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

module.exports = { getOrSet };', 'javascript', cat_3_id, user_1_id, true, 725, 148),
  ('CSS Keyframe Animation', 'A smooth bouncing ball animation using CSS keyframes.', '@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(-30px);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.ball {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 50%;
  animation: bounce 1s infinite;
}', 'css', cat_8_id, user_2_id, true, 424, 10),
  ('Kubernetes Health Check', 'A liveness and readiness probe config for a Node.js app.', 'livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5', 'yaml', cat_0_id, user_2_id, true, 828, 85),
  ('Python Decorator Pattern', 'A simple logging decorator in Python.', 'import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper_timer(*args, **kwargs):
        start = time.perf_counter()
        value = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"Finished {func.__name__!r} in {end - start:.4f} secs")
        return value
    return wrapper_timer

@timer
def slow_function():
    time.sleep(1)
    return 42', 'python', cat_1_id, user_2_id, true, 565, 147),
  ('Vim Basic Config', 'A minimal but useful .vimrc configuration.', 'set number
set relativenumber
set tabstop=2
set shiftwidth=2
set expandtab
set autoindent
set smartindent
set incsearch
set hlsearch
set ignorecase
set smartcase
set nowrap
syntax on
colorscheme desert
set cursorline', 'vim', cat_12_id, user_3_id, true, 193, 149),
  ('Python Pandas Group By', 'Aggregating sales data with pandas groupby.', 'import pandas as pd

df = pd.read_csv(''sales.csv'')

# Group by region and calculate total and average sales
summary = df.groupby(''region'').agg(
    total_sales=(''sales'', ''sum''),
    avg_sales=(''sales'', ''mean''),
    num_transactions=(''sales'', ''count'')
).reset_index()

print(summary)', 'python', cat_1_id, user_3_id, true, 806, 157),
  ('SQL Window Functions', 'Using ROW_NUMBER and RANK in PostgreSQL.', 'SELECT
  employee_id,
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as row_num,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;', 'sql', cat_4_id, user_3_id, true, 783, 58),
  ('TypeScript Generic Function', 'A reusable generic identity and array filter function.', 'function identity<T>(arg: T): T {
  return arg;
}

function filterArray<T>(arr: T[], predicate: (item: T) => boolean): T[] {
  return arr.filter(predicate);
}

const numbers = [1, 2, 3, 4, 5, 6];
const evens = filterArray(numbers, n => n % 2 === 0);
console.log(evens); // [2, 4, 6]', 'typescript', cat_11_id, user_4_id, true, 126, 49),
  ('Vim Basic Config', 'A minimal but useful .vimrc configuration.', 'set number
set relativenumber
set tabstop=2
set shiftwidth=2
set expandtab
set autoindent
set smartindent
set incsearch
set hlsearch
set ignorecase
set smartcase
set nowrap
syntax on
colorscheme desert
set cursorline', 'vim', cat_12_id, user_4_id, true, 484, 84),
  ('Vim Basic Config', 'A minimal but useful .vimrc configuration.', 'set number
set relativenumber
set tabstop=2
set shiftwidth=2
set expandtab
set autoindent
set smartindent
set incsearch
set hlsearch
set ignorecase
set smartcase
set nowrap
syntax on
colorscheme desert
set cursorline', 'vim', cat_12_id, user_5_id, true, 760, 73),
  ('Next.js API Route', 'A simple API route handler in Next.js 14 App Router.', 'import { NextRequest, NextResponse } from ''next/server'';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get(''name'') || ''World'';
  return NextResponse.json({ message: `Hello, ${name}!` });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ received: body }, { status: 201 });
}', 'typescript', cat_5_id, user_5_id, true, 614, 140),
  ('TypeScript Generic Function', 'A reusable generic identity and array filter function.', 'function identity<T>(arg: T): T {
  return arg;
}

function filterArray<T>(arr: T[], predicate: (item: T) => boolean): T[] {
  return arr.filter(predicate);
}

const numbers = [1, 2, 3, 4, 5, 6];
const evens = filterArray(numbers, n => n % 2 === 0);
console.log(evens); // [2, 4, 6]', 'typescript', cat_11_id, user_6_id, true, 326, 84),
  ('Spring Boot REST API', 'A simple CRUD endpoint in Spring Boot with Java.', '@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User saved = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}', 'java', cat_9_id, user_6_id, true, 785, 102),
  ('CSS Keyframe Animation', 'A smooth bouncing ball animation using CSS keyframes.', '@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(-30px);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.ball {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 50%;
  animation: bounce 1s infinite;
}', 'css', cat_8_id, user_7_id, true, 434, 12),
  ('Golang REST Handler', 'A minimal HTTP handler using Go standard library.', 'package main

import (
    "encoding/json"
    "net/http"
)

type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

func getUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    user := User{ID: 1, Name: "Pranav"}
    json.NewEncoder(w).Encode(user)
}

func main() {
    http.HandleFunc("/user", getUser)
    http.ListenAndServe(":8080", nil)
}', 'go', cat_6_id, user_7_id, true, 146, 88),
  ('Terraform S3 Bucket', 'Create a private S3 bucket with versioning enabled.', 'resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-app-bucket-prod"
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.my_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_acl" "acl" {
  bucket = aws_s3_bucket.my_bucket.id
  acl    = "private"
}', 'hcl', cat_0_id, user_7_id, true, 618, 72),
  ('Solidity ERC-20 Token', 'A minimal ERC-20 token contract in Solidity.', '// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "MyToken";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        return true;
    }
}', 'solidity', cat_7_id, user_8_id, true, 537, 149),
  ('Kubernetes Health Check', 'A liveness and readiness probe config for a Node.js app.', 'livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5', 'yaml', cat_0_id, user_8_id, true, 178, 62),
  ('TypeScript Generic Function', 'A reusable generic identity and array filter function.', 'function identity<T>(arg: T): T {
  return arg;
}

function filterArray<T>(arr: T[], predicate: (item: T) => boolean): T[] {
  return arr.filter(predicate);
}

const numbers = [1, 2, 3, 4, 5, 6];
const evens = filterArray(numbers, n => n % 2 === 0);
console.log(evens); // [2, 4, 6]', 'typescript', cat_11_id, user_8_id, true, 494, 114),
  ('Next.js API Route', 'A simple API route handler in Next.js 14 App Router.', 'import { NextRequest, NextResponse } from ''next/server'';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get(''name'') || ''World'';
  return NextResponse.json({ message: `Hello, ${name}!` });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ received: body }, { status: 201 });
}', 'typescript', cat_5_id, user_9_id, true, 823, 86),
  ('Python Decorator Pattern', 'A simple logging decorator in Python.', 'import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper_timer(*args, **kwargs):
        start = time.perf_counter()
        value = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"Finished {func.__name__!r} in {end - start:.4f} secs")
        return value
    return wrapper_timer

@timer
def slow_function():
    time.sleep(1)
    return 42', 'python', cat_1_id, user_9_id, true, 566, 88),
  ('SQL Window Functions', 'Using ROW_NUMBER and RANK in PostgreSQL.', 'SELECT
  employee_id,
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as row_num,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;', 'sql', cat_4_id, user_9_id, true, 324, 58),
  ('Vim Basic Config', 'A minimal but useful .vimrc configuration.', 'set number
set relativenumber
set tabstop=2
set shiftwidth=2
set expandtab
set autoindent
set smartindent
set incsearch
set hlsearch
set ignorecase
set smartcase
set nowrap
syntax on
colorscheme desert
set cursorline', 'vim', cat_12_id, user_9_id, true, 256, 113),
  ('Rust Error Handling', 'Idiomatic error handling in Rust using Result and ? operator.', 'use std::fs;
use std::io;

fn read_username_from_file() -> Result<String, io::Error> {
    let username = fs::read_to_string("username.txt")?;
    Ok(username.trim().to_string())
}

fn main() {
    match read_username_from_file() {
        Ok(name) => println!("Username: {}", name),
        Err(e) => eprintln!("Error: {}", e),
    }
}', 'rust', cat_10_id, user_10_id, true, 259, 117),
  ('Docker Compose for Next.js', 'A complete docker-compose.yml for a Next.js + Postgres app.', 'version: ''3.8''
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pg_data:/var/lib/postgresql/data
volumes:
  pg_data:', 'yaml', cat_0_id, user_10_id, true, 127, 59),
  ('React Context API', 'A clean pattern for managing global state with Context + useReducer.', 'import React, { createContext, useContext, useReducer } from ''react'';

type State = { count: number };
type Action = { type: ''increment'' | ''decrement'' };

const CountContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ''increment'': return { count: state.count + 1 };
    case ''decrement'': return { count: state.count - 1 };
    default: return state;
  }
}

export function CountProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return <CountContext.Provider value={{ state, dispatch }}>{children}</CountContext.Provider>;
}

export const useCount = () => {
  const ctx = useContext(CountContext);
  if (!ctx) throw new Error(''useCount must be used within CountProvider'');
  return ctx;
};', 'typescript', cat_5_id, user_10_id, true, 601, 93),
  ('Kubernetes Health Check', 'A liveness and readiness probe config for a Node.js app.', 'livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5', 'yaml', cat_0_id, user_11_id, true, 157, 10),
  ('TypeScript Generic Function', 'A reusable generic identity and array filter function.', 'function identity<T>(arg: T): T {
  return arg;
}

function filterArray<T>(arr: T[], predicate: (item: T) => boolean): T[] {
  return arr.filter(predicate);
}

const numbers = [1, 2, 3, 4, 5, 6];
const evens = filterArray(numbers, n => n % 2 === 0);
console.log(evens); // [2, 4, 6]', 'typescript', cat_11_id, user_11_id, true, 339, 52),
  ('SQL Window Functions', 'Using ROW_NUMBER and RANK in PostgreSQL.', 'SELECT
  employee_id,
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as row_num,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;', 'sql', cat_4_id, user_11_id, true, 277, 29),
  ('CSS Responsive Typography', 'Fluid typography using CSS clamp() for responsive scaling.', '/* Fluid typography: scales between 16px and 24px */
body {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
}

h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}

h2 {
  font-size: clamp(1.5rem, 3.5vw, 2.5rem);
}', 'css', cat_8_id, user_12_id, true, 166, 140),
  ('Redis Cache Wrapper', 'A simple Node.js cache utility using ioredis.', 'const Redis = require(''ioredis'');
const redis = new Redis();

async function getOrSet(key, ttl, fetchFn) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

module.exports = { getOrSet };', 'javascript', cat_3_id, user_12_id, true, 323, 98),
  ('Python Decorator Pattern', 'A simple logging decorator in Python.', 'import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper_timer(*args, **kwargs):
        start = time.perf_counter()
        value = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"Finished {func.__name__!r} in {end - start:.4f} secs")
        return value
    return wrapper_timer

@timer
def slow_function():
    time.sleep(1)
    return 42', 'python', cat_1_id, user_13_id, true, 515, 140),
  ('Spring Boot REST API', 'A simple CRUD endpoint in Spring Boot with Java.', '@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User saved = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}', 'java', cat_9_id, user_13_id, true, 382, 123),
  ('Kubernetes Health Check', 'A liveness and readiness probe config for a Node.js app.', 'livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5', 'yaml', cat_0_id, user_13_id, true, 766, 133),
  ('Python Pandas Group By', 'Aggregating sales data with pandas groupby.', 'import pandas as pd

df = pd.read_csv(''sales.csv'')

# Group by region and calculate total and average sales
summary = df.groupby(''region'').agg(
    total_sales=(''sales'', ''sum''),
    avg_sales=(''sales'', ''mean''),
    num_transactions=(''sales'', ''count'')
).reset_index()

print(summary)', 'python', cat_1_id, user_13_id, true, 418, 90),
  ('NLP Tokenizer in Python', 'Tokenize and clean text using NLTK.', 'import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

nltk.download(''punkt'')
nltk.download(''stopwords'')

text = "Natural language processing enables computers to understand human language."
tokens = word_tokenize(text.lower())
stop_words = set(stopwords.words(''english''))
filtered = [w for w in tokens if w.isalpha() and w not in stop_words]
stemmer = PorterStemmer()
stemmed = [stemmer.stem(w) for w in filtered]
print(stemmed)', 'python', cat_1_id, user_14_id, true, 107, 125),
  ('Docker Compose for Next.js', 'A complete docker-compose.yml for a Next.js + Postgres app.', 'version: ''3.8''
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pg_data:/var/lib/postgresql/data
volumes:
  pg_data:', 'yaml', cat_0_id, user_14_id, true, 176, 87),
  ('Flutter Stateful Widget', 'A simple counter app using StatefulWidget in Flutter.', 'import ''package:flutter/material.dart'';

class CounterWidget extends StatefulWidget {
  const CounterWidget({super.key});
  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  int _count = 0;
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(''Count: $_count''),
        ElevatedButton(
          onPressed: () => setState(() => _count++),
          child: const Text(''Increment''),
        ),
      ],
    );
  }
}', 'dart', cat_2_id, user_14_id, true, 751, 28),
  ('React Context API', 'A clean pattern for managing global state with Context + useReducer.', 'import React, { createContext, useContext, useReducer } from ''react'';

type State = { count: number };
type Action = { type: ''increment'' | ''decrement'' };

const CountContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ''increment'': return { count: state.count + 1 };
    case ''decrement'': return { count: state.count - 1 };
    default: return state;
  }
}

export function CountProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return <CountContext.Provider value={{ state, dispatch }}>{children}</CountContext.Provider>;
}

export const useCount = () => {
  const ctx = useContext(CountContext);
  if (!ctx) throw new Error(''useCount must be used within CountProvider'');
  return ctx;
};', 'typescript', cat_5_id, user_14_id, true, 524, 81),
  ('Docker Compose for Next.js', 'A complete docker-compose.yml for a Next.js + Postgres app.', 'version: ''3.8''
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pg_data:/var/lib/postgresql/data
volumes:
  pg_data:', 'yaml', cat_0_id, user_15_id, true, 531, 147),
  ('Solidity ERC-20 Token', 'A minimal ERC-20 token contract in Solidity.', '// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "MyToken";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        return true;
    }
}', 'solidity', cat_7_id, user_15_id, true, 390, 59),
  ('Flutter Stateful Widget', 'A simple counter app using StatefulWidget in Flutter.', 'import ''package:flutter/material.dart'';

class CounterWidget extends StatefulWidget {
  const CounterWidget({super.key});
  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  int _count = 0;
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(''Count: $_count''),
        ElevatedButton(
          onPressed: () => setState(() => _count++),
          child: const Text(''Increment''),
        ),
      ],
    );
  }
}', 'dart', cat_2_id, user_15_id, true, 338, 87),
  ('Python Pandas Group By', 'Aggregating sales data with pandas groupby.', 'import pandas as pd

df = pd.read_csv(''sales.csv'')

# Group by region and calculate total and average sales
summary = df.groupby(''region'').agg(
    total_sales=(''sales'', ''sum''),
    avg_sales=(''sales'', ''mean''),
    num_transactions=(''sales'', ''count'')
).reset_index()

print(summary)', 'python', cat_1_id, user_15_id, true, 435, 93),
  ('CSS Keyframe Animation', 'A smooth bouncing ball animation using CSS keyframes.', '@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(-30px);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.ball {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 50%;
  animation: bounce 1s infinite;
}', 'css', cat_8_id, user_16_id, true, 617, 64),
  ('TypeScript Generic Function', 'A reusable generic identity and array filter function.', 'function identity<T>(arg: T): T {
  return arg;
}

function filterArray<T>(arr: T[], predicate: (item: T) => boolean): T[] {
  return arr.filter(predicate);
}

const numbers = [1, 2, 3, 4, 5, 6];
const evens = filterArray(numbers, n => n % 2 === 0);
console.log(evens); // [2, 4, 6]', 'typescript', cat_11_id, user_16_id, true, 728, 142),
  ('SQL Window Functions', 'Using ROW_NUMBER and RANK in PostgreSQL.', 'SELECT
  employee_id,
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as row_num,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;', 'sql', cat_4_id, user_16_id, true, 335, 22),
  ('SQL Window Functions', 'Using ROW_NUMBER and RANK in PostgreSQL.', 'SELECT
  employee_id,
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as row_num,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;', 'sql', cat_4_id, user_17_id, true, 740, 40),
  ('Golang REST Handler', 'A minimal HTTP handler using Go standard library.', 'package main

import (
    "encoding/json"
    "net/http"
)

type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

func getUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    user := User{ID: 1, Name: "Pranav"}
    json.NewEncoder(w).Encode(user)
}

func main() {
    http.HandleFunc("/user", getUser)
    http.ListenAndServe(":8080", nil)
}', 'go', cat_6_id, user_17_id, true, 544, 62),
  ('Spring Boot REST API', 'A simple CRUD endpoint in Spring Boot with Java.', '@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User saved = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}', 'java', cat_9_id, user_18_id, true, 373, 24),
  ('CSS Keyframe Animation', 'A smooth bouncing ball animation using CSS keyframes.', '@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(-30px);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.ball {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 50%;
  animation: bounce 1s infinite;
}', 'css', cat_8_id, user_18_id, true, 672, 28),
  ('Spring Boot REST API', 'A simple CRUD endpoint in Spring Boot with Java.', '@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User saved = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}', 'java', cat_9_id, user_19_id, true, 303, 138),
  ('Terraform S3 Bucket', 'Create a private S3 bucket with versioning enabled.', 'resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-app-bucket-prod"
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.my_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_acl" "acl" {
  bucket = aws_s3_bucket.my_bucket.id
  acl    = "private"
}', 'hcl', cat_0_id, user_19_id, true, 449, 102),
  ('Rust Error Handling', 'Idiomatic error handling in Rust using Result and ? operator.', 'use std::fs;
use std::io;

fn read_username_from_file() -> Result<String, io::Error> {
    let username = fs::read_to_string("username.txt")?;
    Ok(username.trim().to_string())
}

fn main() {
    match read_username_from_file() {
        Ok(name) => println!("Username: {}", name),
        Err(e) => eprintln!("Error: {}", e),
    }
}', 'rust', cat_10_id, user_19_id, true, 728, 28);

END $$;
