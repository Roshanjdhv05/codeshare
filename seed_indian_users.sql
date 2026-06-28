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
BEGIN
  ---------------------------------------------------------
  -- 1. ADD FAKE USERS TO AUTHENTICATION
  ---------------------------------------------------------
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES 
  (user_0_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aarav.sharma@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aarav Sharma"}', now(), now()),
  (user_1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vihaan.p@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vihaan Patel"}', now(), now()),
  (user_2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aditya.singh@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aditya Singh"}', now(), now()),
  (user_3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sai.kumar@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sai Kumar"}', now(), now()),
  (user_4_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ananya.gupta@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ananya Gupta"}', now(), now()),
  (user_5_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'diya.reddy@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Diya Reddy"}', now(), now()),
  (user_6_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ishaan.desai@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ishaan Desai"}', now(), now()),
  (user_7_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kavya.joshi@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kavya Joshi"}', now(), now()),
  (user_8_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'neha.verma@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Neha Verma"}', now(), now()),
  (user_9_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rohan.mehta@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rohan Mehta"}', now(), now()),
  (user_10_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'riya.kapoor@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Riya Kapoor"}', now(), now()),
  (user_11_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aryan.bhat@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aryan Bhat"}', now(), now()),
  (user_12_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'siddharth.nair@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Siddharth Nair"}', now(), now()),
  (user_13_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tara.iyer@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tara Iyer"}', now(), now()),
  (user_14_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kabir.das@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kabir Das"}', now(), now()),
  (user_15_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aisha.pillai@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aisha Pillai"}', now(), now()),
  (user_16_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'arjun.menon@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Arjun Menon"}', now(), now()),
  (user_17_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'meera.rao@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Meera Rao"}', now(), now()),
  (user_18_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'yash.chawla@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Yash Chawla"}', now(), now()),
  (user_19_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'zara.khan@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Zara Khan"}', now(), now());

  ---------------------------------------------------------
  -- 2. CREATE THEIR PUBLIC PROFILES
  ---------------------------------------------------------
  INSERT INTO public.profiles (id, username, full_name, bio) VALUES
  (user_0_id, 'aarav_dev', 'Aarav Sharma', 'Full-stack developer passionate about scalable web apps.'),
  (user_1_id, 'vihaan_codes', 'Vihaan Patel', 'React and Node.js enthusiast.'),
  (user_2_id, 'adi_singh', 'Aditya Singh', 'Data scientist and Python lover.'),
  (user_3_id, 'sai_k', 'Sai Kumar', 'Cloud engineer and DevOps specialist.'),
  (user_4_id, 'ananya_g', 'Ananya Gupta', 'UI/UX designer and frontend dev.'),
  (user_5_id, 'diya_reddy', 'Diya Reddy', 'Building mobile apps with React Native.'),
  (user_6_id, 'ishaan_d', 'Ishaan Desai', 'Cybersecurity analyst by day, coder by night.'),
  (user_7_id, 'kavya_j', 'Kavya Joshi', 'Open source contributor and Rustacean.'),
  (user_8_id, 'neha_v', 'Neha Verma', 'JavaScript ninja and tech blogger.'),
  (user_9_id, 'rohan_m', 'Rohan Mehta', 'Backend engineer focused on Go and microservices.'),
  (user_10_id, 'riya_k', 'Riya Kapoor', 'Machine learning researcher and Python dev.'),
  (user_11_id, 'aryan_b', 'Aryan Bhat', 'Blockchain developer and web3 enthusiast.'),
  (user_12_id, 'sid_nair', 'Siddharth Nair', 'Game developer and C++ expert.'),
  (user_13_id, 'tara_iyer', 'Tara Iyer', 'Data engineering and big data analytics.'),
  (user_14_id, 'kabir_das', 'Kabir Das', 'Building tools for developers.'),
  (user_15_id, 'aisha_p', 'Aisha Pillai', 'Frontend architect and accessibility advocate.'),
  (user_16_id, 'arjun_m', 'Arjun Menon', 'Embedded systems and IoT developer.'),
  (user_17_id, 'meera_rao', 'Meera Rao', 'Database administrator and SQL wizard.'),
  (user_18_id, 'yash_c', 'Yash Chawla', 'Software architect and tech lead.'),
  (user_19_id, 'zara_k', 'Zara Khan', 'Tech community organizer and developer advocate.')
  ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, full_name = EXCLUDED.full_name, bio = EXCLUDED.bio;

  ---------------------------------------------------------
  -- 3. CREATE CATEGORIES
  ---------------------------------------------------------
  INSERT INTO public.categories (name, description, color) VALUES
  ('JavaScript', 'JavaScript related snippets', '#5d769a'),
  ('React', 'React related snippets', '#dea2bd'),
  ('CSS', 'CSS related snippets', '#419a41'),
  ('Python', 'Python related snippets', '#7a6d0f'),
  ('SQL', 'SQL related snippets', '#359701'),
  ('DevOps', 'DevOps related snippets', '#a7cb6d'),
  ('Bash', 'Bash related snippets', '#6257ef'),
  ('Go', 'Go related snippets', '#f451a9'),
  ('HTML', 'HTML related snippets', '#a19d7'),
  ('TypeScript', 'TypeScript related snippets', '#9742b4')
  ON CONFLICT (name) DO NOTHING;

  SELECT id INTO cat_0_id FROM public.categories WHERE name = 'JavaScript';
  SELECT id INTO cat_1_id FROM public.categories WHERE name = 'React';
  SELECT id INTO cat_2_id FROM public.categories WHERE name = 'CSS';
  SELECT id INTO cat_3_id FROM public.categories WHERE name = 'Python';
  SELECT id INTO cat_4_id FROM public.categories WHERE name = 'SQL';
  SELECT id INTO cat_5_id FROM public.categories WHERE name = 'DevOps';
  SELECT id INTO cat_6_id FROM public.categories WHERE name = 'Bash';
  SELECT id INTO cat_7_id FROM public.categories WHERE name = 'Go';
  SELECT id INTO cat_8_id FROM public.categories WHERE name = 'HTML';
  SELECT id INTO cat_9_id FROM public.categories WHERE name = 'TypeScript';

  ---------------------------------------------------------
  -- 4. ADD FAKE PROJECTS / CODE SNIPPETS
  ---------------------------------------------------------
  INSERT INTO public.code_snippets (title, description, code, language, category_id, author_id, is_public, views, likes) VALUES
  ('FastAPI Dependency Injection', 'Basic example of using Depends in FastAPI.', 'from fastapi import Depends, FastAPI

app = FastAPI()

def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons', 'python', cat_3_id, user_0_id, true, 349, 79),
  ('Fetch with Retry', 'A wrapper around fetch that retries the request upon failure.', 'async function fetchWithRetry(url, options = {}, retries = 3, backoff = 300) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}', 'javascript', cat_0_id, user_0_id, true, 408, 73),
  ('CSS Custom Scrollbar', 'Style the scrollbar using CSS.', '::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #888;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}', 'css', cat_2_id, user_0_id, true, 482, 1),
  ('Python List Comprehension', 'Filter and map an array cleanly.', 'numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
# Get squares of even numbers
even_squares = [x**2 for x in numbers if x % 2 == 0]
print(even_squares)', 'python', cat_3_id, user_0_id, true, 207, 69),
  ('Bash For Loop Files', 'Iterate over all .txt files in a directory.', '#!/bin/bash
for file in *.txt; do
  echo "Processing $file"
  # Do something with $file
done', 'bash', cat_6_id, user_1_id, true, 242, 59),
  ('FastAPI Dependency Injection', 'Basic example of using Depends in FastAPI.', 'from fastapi import Depends, FastAPI

app = FastAPI()

def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons', 'python', cat_3_id, user_1_id, true, 417, 29),
  ('Tailwind Card Component', 'A quick card UI using Tailwind CSS utility classes.', '<div class="max-w-sm rounded overflow-hidden shadow-lg bg-white">
  <img class="w-full" src="img.jpg" alt="Display Image">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">Card Title</div>
    <p class="text-gray-700 text-base">Some quick example text to build on the card title and make up the bulk of the card''s content.</p>
  </div>
</div>', 'html', cat_8_id, user_1_id, true, 167, 68),
  ('Bash For Loop Files', 'Iterate over all .txt files in a directory.', '#!/bin/bash
for file in *.txt; do
  echo "Processing $file"
  # Do something with $file
done', 'bash', cat_6_id, user_2_id, true, 318, 98),
  ('PostgreSQL JSON Query', 'How to extract and filter data from a JSONB column.', 'SELECT id, data->>''name'' as name
FROM users
WHERE data->>''role'' = ''admin'';', 'sql', cat_4_id, user_2_id, true, 217, 49),
  ('Bash File Exists Check', 'Check if a file exists before doing an operation.', 'FILE=/etc/resolv.conf
if [ -f "$FILE" ]; then
    echo "$FILE exists."
else 
    echo "$FILE does not exist."
fi', 'bash', cat_6_id, user_2_id, true, 136, 6),
  ('Go HTTP Server', 'A simple HTTP server in Go.', 'package main

import (
    "fmt"
    "net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, World!")
}

func main() {
    http.HandleFunc("/", helloHandler)
    http.ListenAndServe(":8080", nil)
}', 'go', cat_7_id, user_3_id, true, 67, 53),
  ('Docker Multi-stage Build', 'Optimize Docker images for Go apps.', 'FROM golang:1.20 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o myapp

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/myapp .
CMD ["./myapp"]', 'dockerfile', cat_5_id, user_3_id, true, 144, 43),
  ('Docker Multi-stage Build', 'Optimize Docker images for Go apps.', 'FROM golang:1.20 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o myapp

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/myapp .
CMD ["./myapp"]', 'dockerfile', cat_5_id, user_4_id, true, 357, 72),
  ('CSS Custom Scrollbar', 'Style the scrollbar using CSS.', '::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #888;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}', 'css', cat_2_id, user_4_id, true, 126, 81),
  ('Bash For Loop Files', 'Iterate over all .txt files in a directory.', '#!/bin/bash
for file in *.txt; do
  echo "Processing $file"
  # Do something with $file
done', 'bash', cat_6_id, user_4_id, true, 234, 21),
  ('Deep Clone Object', 'A modern way to deep clone objects in JS.', 'const original = { a: 1, b: { c: 2 } };
// Using structuredClone (Modern Browsers/Node)
const clone = structuredClone(original);', 'javascript', cat_0_id, user_4_id, true, 355, 62),
  ('Flatten Array Recursive', 'Flatten an array of arbitrary nested arrays.', 'function flattenArray(arr) {
  return arr.reduce((acc, val) => 
    Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val), []
  );
}', 'javascript', cat_0_id, user_5_id, true, 59, 69),
  ('CSS Custom Scrollbar', 'Style the scrollbar using CSS.', '::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #888;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}', 'css', cat_2_id, user_5_id, true, 31, 54),
  ('Fetch with Retry', 'A wrapper around fetch that retries the request upon failure.', 'async function fetchWithRetry(url, options = {}, retries = 3, backoff = 300) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}', 'javascript', cat_0_id, user_5_id, true, 131, 23),
  ('PostgreSQL JSON Query', 'How to extract and filter data from a JSONB column.', 'SELECT id, data->>''name'' as name
FROM users
WHERE data->>''role'' = ''admin'';', 'sql', cat_4_id, user_6_id, true, 418, 75),
  ('CSS Grid Layout', 'A simple responsive grid layout.', '.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}', 'css', cat_2_id, user_6_id, true, 382, 2),
  ('Centered CSS Layout', 'Perfect centering using CSS Grid.', '.container {
  display: grid;
  place-items: center;
  height: 100vh;
}', 'css', cat_2_id, user_6_id, true, 356, 45),
  ('Deep Clone Object', 'A modern way to deep clone objects in JS.', 'const original = { a: 1, b: { c: 2 } };
// Using structuredClone (Modern Browsers/Node)
const clone = structuredClone(original);', 'javascript', cat_0_id, user_7_id, true, 4, 68),
  ('UUID v4 Generator', 'Generate a random UUID v4 in JavaScript.', 'function generateUUID() {
  return ''xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx''.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == ''x'' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}', 'javascript', cat_0_id, user_7_id, true, 119, 61),
  ('PostgreSQL JSON Query', 'How to extract and filter data from a JSONB column.', 'SELECT id, data->>''name'' as name
FROM users
WHERE data->>''role'' = ''admin'';', 'sql', cat_4_id, user_7_id, true, 455, 77),
  ('Go HTTP Server', 'A simple HTTP server in Go.', 'package main

import (
    "fmt"
    "net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, World!")
}

func main() {
    http.HandleFunc("/", helloHandler)
    http.ListenAndServe(":8080", nil)
}', 'go', cat_7_id, user_8_id, true, 88, 40),
  ('Bash For Loop Files', 'Iterate over all .txt files in a directory.', '#!/bin/bash
for file in *.txt; do
  echo "Processing $file"
  # Do something with $file
done', 'bash', cat_6_id, user_8_id, true, 253, 20),
  ('Go HTTP Server', 'A simple HTTP server in Go.', 'package main

import (
    "fmt"
    "net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, World!")
}

func main() {
    http.HandleFunc("/", helloHandler)
    http.ListenAndServe(":8080", nil)
}', 'go', cat_7_id, user_9_id, true, 238, 69),
  ('CSS Grid Layout', 'A simple responsive grid layout.', '.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}', 'css', cat_2_id, user_9_id, true, 23, 48),
  ('Flatten Array Recursive', 'Flatten an array of arbitrary nested arrays.', 'function flattenArray(arr) {
  return arr.reduce((acc, val) => 
    Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val), []
  );
}', 'javascript', cat_0_id, user_10_id, true, 267, 10),
  ('Go HTTP Server', 'A simple HTTP server in Go.', 'package main

import (
    "fmt"
    "net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, World!")
}

func main() {
    http.HandleFunc("/", helloHandler)
    http.ListenAndServe(":8080", nil)
}', 'go', cat_7_id, user_10_id, true, 232, 29),
  ('Python Read CSV', 'Read a CSV file into a dictionary using csv module.', 'import csv

with open(''data.csv'', mode=''r'') as file:
    csv_reader = csv.DictReader(file)
    for row in csv_reader:
        print(row[''Name''], row[''Age''])', 'python', cat_3_id, user_11_id, true, 70, 77),
  ('JWT Verification Middleware', 'Express middleware to verify JWT tokens.', 'const jwt = require(''jsonwebtoken'');

function authenticateToken(req, res, next) {
  const authHeader = req.headers[''authorization''];
  const token = authHeader && authHeader.split('' '')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}', 'javascript', cat_0_id, user_11_id, true, 292, 78),
  ('Deep Clone Object', 'A modern way to deep clone objects in JS.', 'const original = { a: 1, b: { c: 2 } };
// Using structuredClone (Modern Browsers/Node)
const clone = structuredClone(original);', 'javascript', cat_0_id, user_12_id, true, 175, 30),
  ('Python Asyncio Gather', 'Run multiple coroutines concurrently.', 'import asyncio

async def fetch_data(id):
    await asyncio.sleep(1)
    return f"Data {id}"

async def main():
    tasks = [fetch_data(i) for i in range(5)]
    results = await asyncio.gather(*tasks)
    print(results)

asyncio.run(main())', 'python', cat_3_id, user_12_id, true, 446, 0),
  ('CSS Glassmorphism', 'Create a frosted glass effect.', '.glass {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}', 'css', cat_2_id, user_13_id, true, 252, 34),
  ('Deep Clone Object', 'A modern way to deep clone objects in JS.', 'const original = { a: 1, b: { c: 2 } };
// Using structuredClone (Modern Browsers/Node)
const clone = structuredClone(original);', 'javascript', cat_0_id, user_13_id, true, 286, 66),
  ('useClickOutside Hook', 'React hook to detect clicks outside a specified element.', 'import { useEffect, useRef } from ''react'';

export function useClickOutside(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}', 'typescript', cat_1_id, user_13_id, true, 281, 12),
  ('useClickOutside Hook', 'React hook to detect clicks outside a specified element.', 'import { useEffect, useRef } from ''react'';

export function useClickOutside(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}', 'typescript', cat_1_id, user_14_id, true, 328, 61),
  ('PostgreSQL JSON Query', 'How to extract and filter data from a JSONB column.', 'SELECT id, data->>''name'' as name
FROM users
WHERE data->>''role'' = ''admin'';', 'sql', cat_4_id, user_14_id, true, 50, 68),
  ('FastAPI Dependency Injection', 'Basic example of using Depends in FastAPI.', 'from fastapi import Depends, FastAPI

app = FastAPI()

def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons', 'python', cat_3_id, user_15_id, true, 491, 50),
  ('CSS Grid Layout', 'A simple responsive grid layout.', '.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}', 'css', cat_2_id, user_15_id, true, 265, 24),
  ('Fetch with Retry', 'A wrapper around fetch that retries the request upon failure.', 'async function fetchWithRetry(url, options = {}, retries = 3, backoff = 300) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}', 'javascript', cat_0_id, user_16_id, true, 293, 18),
  ('UUID v4 Generator', 'Generate a random UUID v4 in JavaScript.', 'function generateUUID() {
  return ''xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx''.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == ''x'' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}', 'javascript', cat_0_id, user_16_id, true, 387, 72),
  ('React Error Boundary', 'Catch JavaScript errors anywhere in their child component tree.', 'import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) return <h1>Sorry.. there was an error</h1>;
    return this.props.children;
  }
}', 'typescript', cat_1_id, user_17_id, true, 456, 26),
  ('Centered CSS Layout', 'Perfect centering using CSS Grid.', '.container {
  display: grid;
  place-items: center;
  height: 100vh;
}', 'css', cat_2_id, user_17_id, true, 62, 99),
  ('Deep Clone Object', 'A modern way to deep clone objects in JS.', 'const original = { a: 1, b: { c: 2 } };
// Using structuredClone (Modern Browsers/Node)
const clone = structuredClone(original);', 'javascript', cat_0_id, user_17_id, true, 460, 82),
  ('Python Asyncio Gather', 'Run multiple coroutines concurrently.', 'import asyncio

async def fetch_data(id):
    await asyncio.sleep(1)
    return f"Data {id}"

async def main():
    tasks = [fetch_data(i) for i in range(5)]
    results = await asyncio.gather(*tasks)
    print(results)

asyncio.run(main())', 'python', cat_3_id, user_18_id, true, 15, 64),
  ('Docker Multi-stage Build', 'Optimize Docker images for Go apps.', 'FROM golang:1.20 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o myapp

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/myapp .
CMD ["./myapp"]', 'dockerfile', cat_5_id, user_18_id, true, 327, 99),
  ('JWT Verification Middleware', 'Express middleware to verify JWT tokens.', 'const jwt = require(''jsonwebtoken'');

function authenticateToken(req, res, next) {
  const authHeader = req.headers[''authorization''];
  const token = authHeader && authHeader.split('' '')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}', 'javascript', cat_0_id, user_18_id, true, 98, 51),
  ('Python Read CSV', 'Read a CSV file into a dictionary using csv module.', 'import csv

with open(''data.csv'', mode=''r'') as file:
    csv_reader = csv.DictReader(file)
    for row in csv_reader:
        print(row[''Name''], row[''Age''])', 'python', cat_3_id, user_19_id, true, 234, 67),
  ('CSS Grid Layout', 'A simple responsive grid layout.', '.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}', 'css', cat_2_id, user_19_id, true, 369, 64),
  ('CSS Custom Scrollbar', 'Style the scrollbar using CSS.', '::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #888;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}', 'css', cat_2_id, user_19_id, true, 490, 29);

END $$;
