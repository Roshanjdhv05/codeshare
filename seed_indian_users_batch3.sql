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
  (user_0_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ritika.chauhan@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ritika Chauhan"}', now(), now()),
  (user_1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'gaurav.shukla@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Gaurav Shukla"}', now(), now()),
  (user_2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pallavi.dubey@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pallavi Dubey"}', now(), now()),
  (user_3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sameer.qureshi@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sameer Qureshi"}', now(), now()),
  (user_4_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anjali.khanna@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Anjali Khanna"}', now(), now()),
  (user_5_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vikrant.rathore@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vikrant Rathore"}', now(), now()),
  (user_6_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ishita.bose@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ishita Bose"}', now(), now()),
  (user_7_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'harshit.garg@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Harshit Garg"}', now(), now()),
  (user_8_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ruchi.pandey@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ruchi Pandey"}', now(), now()),
  (user_9_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'saurabh.tripathi@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Saurabh Tripathi"}', now(), now()),
  (user_10_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'deepika.nair@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Deepika Nair"}', now(), now()),
  (user_11_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mohit.bansal@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mohit Bansal"}', now(), now()),
  (user_12_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'swati.misra@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Swati Misra"}', now(), now()),
  (user_13_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kunal.sriv@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kunal Srivastava"}', now(), now()),
  (user_14_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priyanka.m@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priyanka Malhotra"}', now(), now()),
  (user_15_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'abhinav.jain@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Abhinav Jain"}', now(), now()),
  (user_16_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sneha.kulkarni@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sneha Kulkarni"}', now(), now()),
  (user_17_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rajat.verma@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rajat Verma"}', now(), now()),
  (user_18_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'madhuri.rao@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Madhuri Rao"}', now(), now()),
  (user_19_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'siddhanth.k@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Siddhanth Kapoor"}', now(), now());

  ---------------------------------------------------------
  -- 2. CREATE THEIR PUBLIC PROFILES
  ---------------------------------------------------------
  INSERT INTO public.profiles (id, username, full_name, bio) VALUES
  (user_0_id, 'ritika_dev', 'Ritika Chauhan', 'Frontend wizard crafting pixel-perfect UIs with React and Tailwind.'),
  (user_1_id, 'gaurav_sh', 'Gaurav Shukla', 'DevOps engineer automating everything from builds to deployments.'),
  (user_2_id, 'pallavi_d', 'Pallavi Dubey', 'Data engineer building robust ETL pipelines with Spark and Airflow.'),
  (user_3_id, 'sameer_q', 'Sameer Qureshi', 'Android developer passionate about Material Design and Jetpack Compose.'),
  (user_4_id, 'anjali_k', 'Anjali Khanna', 'Technical writer and open source contributor to documentation.'),
  (user_5_id, 'vikrant_r', 'Vikrant Rathore', 'Systems programmer working on compilers and language runtimes.'),
  (user_6_id, 'ishita_b', 'Ishita Bose', 'AI/ML engineer building recommendation systems at scale.'),
  (user_7_id, 'harshit_g', 'Harshit Garg', 'Backend developer focused on distributed systems and event-driven architecture.'),
  (user_8_id, 'ruchi_p', 'Ruchi Pandey', 'Blockchain developer and DeFi enthusiast building on Ethereum.'),
  (user_9_id, 'saurabh_t', 'Saurabh Tripathi', 'Cloud architect designing resilient multi-region AWS infrastructure.'),
  (user_10_id, 'deepika_n', 'Deepika Nair', 'Full-stack developer with a passion for developer tooling and DX.'),
  (user_11_id, 'mohit_b', 'Mohit Bansal', 'Game developer using Unity and C# for mobile and VR experiences.'),
  (user_12_id, 'swati_m', 'Swati Misra', 'Site reliability engineer ensuring 99.99% uptime for production systems.'),
  (user_13_id, 'kunal_sv', 'Kunal Srivastava', 'Python developer specializing in scientific computing and bioinformatics.'),
  (user_14_id, 'priyanka_m', 'Priyanka Malhotra', 'GraphQL and API design specialist, love building great developer experience.'),
  (user_15_id, 'abhinav_j', 'Abhinav Jain', 'Performance engineer obsessed with profiling and optimizing code.'),
  (user_16_id, 'sneha_k', 'Sneha Kulkarni', 'TypeScript enthusiast and maintainer of several open-source npm packages.'),
  (user_17_id, 'rajat_v', 'Rajat Verma', 'Linux kernel contributor and systems software engineer.'),
  (user_18_id, 'madhuri_r', 'Madhuri Rao', 'UX engineer bridging the gap between design and engineering.'),
  (user_19_id, 'siddhanth_k', 'Siddhanth Kapoor', 'Senior engineer building real-time data streaming pipelines with Kafka.')
  ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, full_name = EXCLUDED.full_name, bio = EXCLUDED.bio;

  ---------------------------------------------------------
  -- 3. CREATE CATEGORIES
  ---------------------------------------------------------
  INSERT INTO public.categories (name, description, color) VALUES
  ('Android', 'Android related snippets', '#3DDC84'),
  ('Java', 'Java related snippets', '#ed8b00'),
  ('Python', 'Python related snippets', '#3776AB'),
  ('API', 'API related snippets', '#f59e0b'),
  ('Unity', 'Unity related snippets', '#000000'),
  ('CSS', 'CSS related snippets', '#264DE4'),
  ('React', 'React related snippets', '#61DAFB'),
  ('Go', 'Go related snippets', '#00ADD8'),
  ('TypeScript', 'TypeScript related snippets', '#3178c6'),
  ('JavaScript', 'JavaScript related snippets', '#f7df1e'),
  ('DevOps', 'DevOps related snippets', '#f97316'),
  ('SQL', 'SQL related snippets', '#336791'),
  ('Bash', 'Bash related snippets', '#4EAA25')
  ON CONFLICT (name) DO NOTHING;

  SELECT id INTO cat_0_id FROM public.categories WHERE name = 'Android';
  SELECT id INTO cat_1_id FROM public.categories WHERE name = 'Java';
  SELECT id INTO cat_2_id FROM public.categories WHERE name = 'Python';
  SELECT id INTO cat_3_id FROM public.categories WHERE name = 'API';
  SELECT id INTO cat_4_id FROM public.categories WHERE name = 'Unity';
  SELECT id INTO cat_5_id FROM public.categories WHERE name = 'CSS';
  SELECT id INTO cat_6_id FROM public.categories WHERE name = 'React';
  SELECT id INTO cat_7_id FROM public.categories WHERE name = 'Go';
  SELECT id INTO cat_8_id FROM public.categories WHERE name = 'TypeScript';
  SELECT id INTO cat_9_id FROM public.categories WHERE name = 'JavaScript';
  SELECT id INTO cat_10_id FROM public.categories WHERE name = 'DevOps';
  SELECT id INTO cat_11_id FROM public.categories WHERE name = 'SQL';
  SELECT id INTO cat_12_id FROM public.categories WHERE name = 'Bash';

  ---------------------------------------------------------
  -- 4. ADD FAKE PROJECTS / CODE SNIPPETS
  ---------------------------------------------------------
  INSERT INTO public.code_snippets (title, description, code, language, category_id, author_id, is_public, views, likes) VALUES
  ('Unity Player Movement', 'A simple character movement script in Unity C#.', 'using UnityEngine;

public class PlayerMovement : MonoBehaviour {
    public float speed = 5f;
    private Rigidbody rb;

    void Start() {
        rb = GetComponent<Rigidbody>();
    }

    void FixedUpdate() {
        float moveX = Input.GetAxis("Horizontal");
        float moveZ = Input.GetAxis("Vertical");
        Vector3 movement = new Vector3(moveX, 0, moveZ);
        rb.MovePosition(transform.position + movement * speed * Time.fixedDeltaTime);
    }
}', 'csharp', cat_4_id, user_0_id, true, 229, 205),
  ('Golang Goroutine Pool', 'A simple worker pool pattern using goroutines and channels.', 'package main

import (
    "fmt"
    "sync"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for job := range jobs {
        results <- job * job
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    var wg sync.WaitGroup

    for w := 1; w <= 5; w++ {
        wg.Add(1)
        go worker(w, jobs, results, &wg)
    }

    for i := 1; i <= 20; i++ { jobs <- i }
    close(jobs)
    wg.Wait()
    close(results)
    for r := range results { fmt.Println(r) }
}', 'go', cat_7_id, user_0_id, true, 106, 200),
  ('PostgreSQL Full Text Search', 'Efficient full-text search using tsvector and tsquery.', '-- Add a tsvector column for efficient search
ALTER TABLE articles ADD COLUMN search_vector tsvector;

-- Update the column with concatenated fields
UPDATE articles SET search_vector =
    to_tsvector(''english'', coalesce(title, '''') || '' '' || coalesce(body, ''''));

-- Create a GIN index for fast lookups
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- Search query
SELECT id, title
FROM articles
WHERE search_vector @@ plainto_tsquery(''english'', ''javascript async programming'')
ORDER BY ts_rank(search_vector, plainto_tsquery(''english'', ''javascript async programming'')) DESC
LIMIT 10;', 'sql', cat_11_id, user_0_id, true, 801, 123),
  ('Redis Pub/Sub in Node.js', 'Publish and subscribe to channels using ioredis.', 'const Redis = require(''ioredis'');
const publisher = new Redis();
const subscriber = new Redis();

// Subscriber listens on ''notifications'' channel
subscriber.subscribe(''notifications'', (err, count) => {
  console.log(`Subscribed to ${count} channel(s)`);
});

subscriber.on(''message'', (channel, message) => {
  console.log(`[${channel}] ${message}`);
});

// Publisher sends a message
setTimeout(() => {
  publisher.publish(''notifications'', JSON.stringify({ type: ''alert'', msg: ''New login!'' }));
}, 1000);', 'javascript', cat_9_id, user_0_id, true, 639, 190),
  ('Python Singleton Pattern', 'Thread-safe Singleton implementation in Python.', 'import threading

class Singleton:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if not cls._instance:
                cls._instance = super().__new__(cls)
        return cls._instance

a = Singleton()
b = Singleton()
print(a is b)  # True', 'python', cat_2_id, user_1_id, true, 916, 210),
  ('React Infinite Scroll', 'Implement infinite scroll using IntersectionObserver API.', 'import { useEffect, useRef, useCallback } from ''react'';

function useInfiniteScroll(callback: () => void) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        callback();
      }
    });
    if (node) observer.current.observe(node);
  }, [callback]);

  return lastElementRef;
}', 'typescript', cat_6_id, user_1_id, true, 773, 176),
  ('Apache Kafka Producer', 'Send messages to a Kafka topic using KafkaProducer in Java.', 'Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

try (KafkaProducer<String, String> producer = new KafkaProducer<>(props)) {
    ProducerRecord<String, String> record = new ProducerRecord<>("my-topic", "key", "Hello Kafka!");
    producer.send(record, (metadata, exception) -> {
        if (exception != null) exception.printStackTrace();
        else System.out.println("Sent to partition " + metadata.partition());
    });
}', 'java', cat_1_id, user_1_id, true, 930, 163),
  ('Shell Backup Script', 'A cron-ready shell script to backup a directory with timestamps.', '#!/bin/bash

SOURCE_DIR="/var/www/myapp"
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

# Create backup directory if it doesn''t exist
mkdir -p "$BACKUP_DIR"

# Create compressed archive
tar -czf "$BACKUP_FILE" "$SOURCE_DIR"

# Keep only last 7 backups
cd "$BACKUP_DIR" && ls -t | tail -n +8 | xargs rm -f

echo "Backup created: $BACKUP_FILE"', 'bash', cat_12_id, user_1_id, true, 236, 133),
  ('GraphQL Schema Definition', 'A basic GraphQL schema with Query and Mutation types.', 'type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
  createPost(title: String!, body: String!, authorId: ID!): Post!
}', 'graphql', cat_3_id, user_2_id, true, 512, 183),
  ('Golang Goroutine Pool', 'A simple worker pool pattern using goroutines and channels.', 'package main

import (
    "fmt"
    "sync"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for job := range jobs {
        results <- job * job
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    var wg sync.WaitGroup

    for w := 1; w <= 5; w++ {
        wg.Add(1)
        go worker(w, jobs, results, &wg)
    }

    for i := 1; i <= 20; i++ { jobs <- i }
    close(jobs)
    wg.Wait()
    close(results)
    for r := range results { fmt.Println(r) }
}', 'go', cat_7_id, user_2_id, true, 909, 73),
  ('TypeScript Mapped Types', 'Create powerful utility types using TypeScript mapped types.', 'type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Optional<T> = { [P in keyof T]?: T[P] };
type Nullable<T> = { [P in keyof T]: T[P] | null };

interface User {
  id: number;
  name: string;
  email: string;
}

// All fields read-only
type ReadonlyUser = Readonly<User>;
// All fields optional
type UpdateUser = Optional<User>;
// All fields nullable
type NullableUser = Nullable<User>;', 'typescript', cat_8_id, user_2_id, true, 763, 165),
  ('Apache Kafka Producer', 'Send messages to a Kafka topic using KafkaProducer in Java.', 'Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

try (KafkaProducer<String, String> producer = new KafkaProducer<>(props)) {
    ProducerRecord<String, String> record = new ProducerRecord<>("my-topic", "key", "Hello Kafka!");
    producer.send(record, (metadata, exception) -> {
        if (exception != null) exception.printStackTrace();
        else System.out.println("Sent to partition " + metadata.partition());
    });
}', 'java', cat_1_id, user_2_id, true, 493, 35),
  ('React Infinite Scroll', 'Implement infinite scroll using IntersectionObserver API.', 'import { useEffect, useRef, useCallback } from ''react'';

function useInfiniteScroll(callback: () => void) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        callback();
      }
    });
    if (node) observer.current.observe(node);
  }, [callback]);

  return lastElementRef;
}', 'typescript', cat_6_id, user_3_id, true, 801, 102),
  ('Unity Player Movement', 'A simple character movement script in Unity C#.', 'using UnityEngine;

public class PlayerMovement : MonoBehaviour {
    public float speed = 5f;
    private Rigidbody rb;

    void Start() {
        rb = GetComponent<Rigidbody>();
    }

    void FixedUpdate() {
        float moveX = Input.GetAxis("Horizontal");
        float moveZ = Input.GetAxis("Vertical");
        Vector3 movement = new Vector3(moveX, 0, moveZ);
        rb.MovePosition(transform.position + movement * speed * Time.fixedDeltaTime);
    }
}', 'csharp', cat_4_id, user_3_id, true, 906, 163),
  ('GraphQL Schema Definition', 'A basic GraphQL schema with Query and Mutation types.', 'type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
  createPost(title: String!, body: String!, authorId: ID!): Post!
}', 'graphql', cat_3_id, user_3_id, true, 778, 207),
  ('Bioinformatics DNA Sequence', 'Parse and analyze a DNA sequence string in Python.', 'def analyze_dna(sequence: str) -> dict:
    sequence = sequence.upper()
    length = len(sequence)
    count = {base: sequence.count(base) for base in ''ATCG''}
    gc_content = (count[''G''] + count[''C'']) / length * 100
    complement = sequence.translate(str.maketrans(''ATCG'', ''TAGC''))
    reverse_complement = complement[::-1]

    return {
        ''length'': length,
        ''composition'': count,
        ''gc_content'': round(gc_content, 2),
        ''reverse_complement'': reverse_complement
    }

result = analyze_dna("ATCGGCTATGCAATCG")
print(result)', 'python', cat_2_id, user_3_id, true, 461, 99),
  ('Bioinformatics DNA Sequence', 'Parse and analyze a DNA sequence string in Python.', 'def analyze_dna(sequence: str) -> dict:
    sequence = sequence.upper()
    length = len(sequence)
    count = {base: sequence.count(base) for base in ''ATCG''}
    gc_content = (count[''G''] + count[''C'']) / length * 100
    complement = sequence.translate(str.maketrans(''ATCG'', ''TAGC''))
    reverse_complement = complement[::-1]

    return {
        ''length'': length,
        ''composition'': count,
        ''gc_content'': round(gc_content, 2),
        ''reverse_complement'': reverse_complement
    }

result = analyze_dna("ATCGGCTATGCAATCG")
print(result)', 'python', cat_2_id, user_4_id, true, 86, 44),
  ('Golang Goroutine Pool', 'A simple worker pool pattern using goroutines and channels.', 'package main

import (
    "fmt"
    "sync"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for job := range jobs {
        results <- job * job
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    var wg sync.WaitGroup

    for w := 1; w <= 5; w++ {
        wg.Add(1)
        go worker(w, jobs, results, &wg)
    }

    for i := 1; i <= 20; i++ { jobs <- i }
    close(jobs)
    wg.Wait()
    close(results)
    for r := range results { fmt.Println(r) }
}', 'go', cat_7_id, user_4_id, true, 899, 51),
  ('GraphQL Schema Definition', 'A basic GraphQL schema with Query and Mutation types.', 'type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
  createPost(title: String!, body: String!, authorId: ID!): Post!
}', 'graphql', cat_3_id, user_4_id, true, 101, 77),
  ('React Infinite Scroll', 'Implement infinite scroll using IntersectionObserver API.', 'import { useEffect, useRef, useCallback } from ''react'';

function useInfiniteScroll(callback: () => void) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        callback();
      }
    });
    if (node) observer.current.observe(node);
  }, [callback]);

  return lastElementRef;
}', 'typescript', cat_6_id, user_4_id, true, 228, 36),
  ('CSS Container Queries', 'Style components based on their container size, not viewport.', '.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  padding: 1rem;
  font-size: 1rem;
}

@container card (min-width: 400px) {
  .card {
    padding: 2rem;
    font-size: 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}', 'css', cat_5_id, user_5_id, true, 851, 137),
  ('Jetpack Compose Button', 'A styled button component in Jetpack Compose with ripple effect.', '@Composable
fun PrimaryButton(text: String, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge
        )
    }
}', 'kotlin', cat_0_id, user_5_id, true, 130, 112),
  ('Apache Kafka Producer', 'Send messages to a Kafka topic using KafkaProducer in Java.', 'Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

try (KafkaProducer<String, String> producer = new KafkaProducer<>(props)) {
    ProducerRecord<String, String> record = new ProducerRecord<>("my-topic", "key", "Hello Kafka!");
    producer.send(record, (metadata, exception) -> {
        if (exception != null) exception.printStackTrace();
        else System.out.println("Sent to partition " + metadata.partition());
    });
}', 'java', cat_1_id, user_5_id, true, 402, 204),
  ('Python FastAPI WebSocket', 'A real-time WebSocket endpoint with FastAPI.', 'from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Client {client_id} says: {data}")
    except Exception:
        print(f"Client {client_id} disconnected")', 'python', cat_2_id, user_5_id, true, 915, 57),
  ('AWS Lambda Handler (Python)', 'A basic AWS Lambda function that processes API Gateway events.', 'import json

def lambda_handler(event, context):
    body = json.loads(event.get(''body'', ''{}''))
    name = body.get(''name'', ''World'')
    
    return {
        ''statusCode'': 200,
        ''headers'': {
            ''Content-Type'': ''application/json'',
            ''Access-Control-Allow-Origin'': ''*''
        },
        ''body'': json.dumps({''message'': f''Hello, {name}!''})
    }', 'python', cat_2_id, user_6_id, true, 910, 209),
  ('Redis Pub/Sub in Node.js', 'Publish and subscribe to channels using ioredis.', 'const Redis = require(''ioredis'');
const publisher = new Redis();
const subscriber = new Redis();

// Subscriber listens on ''notifications'' channel
subscriber.subscribe(''notifications'', (err, count) => {
  console.log(`Subscribed to ${count} channel(s)`);
});

subscriber.on(''message'', (channel, message) => {
  console.log(`[${channel}] ${message}`);
});

// Publisher sends a message
setTimeout(() => {
  publisher.publish(''notifications'', JSON.stringify({ type: ''alert'', msg: ''New login!'' }));
}, 1000);', 'javascript', cat_9_id, user_6_id, true, 586, 112),
  ('CSS Container Queries', 'Style components based on their container size, not viewport.', '.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  padding: 1rem;
  font-size: 1rem;
}

@container card (min-width: 400px) {
  .card {
    padding: 2rem;
    font-size: 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}', 'css', cat_5_id, user_6_id, true, 389, 34),
  ('GraphQL Schema Definition', 'A basic GraphQL schema with Query and Mutation types.', 'type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
  createPost(title: String!, body: String!, authorId: ID!): Post!
}', 'graphql', cat_3_id, user_7_id, true, 879, 174),
  ('Zod Schema Validation', 'Validate and parse form data with Zod in TypeScript.', 'import { z } from ''zod'';

const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don''t match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof RegisterSchema>;

function register(data: unknown) {
  const result = RegisterSchema.safeParse(data);
  if (!result.success) {
    console.error(result.error.flatten());
    return;
  }
  console.log("Valid data:", result.data);
}', 'typescript', cat_8_id, user_7_id, true, 845, 116),
  ('Python FastAPI WebSocket', 'A real-time WebSocket endpoint with FastAPI.', 'from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Client {client_id} says: {data}")
    except Exception:
        print(f"Client {client_id} disconnected")', 'python', cat_2_id, user_8_id, true, 88, 196),
  ('Apache Kafka Producer', 'Send messages to a Kafka topic using KafkaProducer in Java.', 'Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

try (KafkaProducer<String, String> producer = new KafkaProducer<>(props)) {
    ProducerRecord<String, String> record = new ProducerRecord<>("my-topic", "key", "Hello Kafka!");
    producer.send(record, (metadata, exception) -> {
        if (exception != null) exception.printStackTrace();
        else System.out.println("Sent to partition " + metadata.partition());
    });
}', 'java', cat_1_id, user_8_id, true, 389, 189),
  ('Zod Schema Validation', 'Validate and parse form data with Zod in TypeScript.', 'import { z } from ''zod'';

const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don''t match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof RegisterSchema>;

function register(data: unknown) {
  const result = RegisterSchema.safeParse(data);
  if (!result.success) {
    console.error(result.error.flatten());
    return;
  }
  console.log("Valid data:", result.data);
}', 'typescript', cat_8_id, user_8_id, true, 214, 129),
  ('Spark Word Count', 'A classic MapReduce word count example using PySpark.', 'from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("WordCount").getOrCreate()
sc = spark.sparkContext

text = sc.textFile("hdfs:///data/input.txt")

word_counts = (
    text
    .flatMap(lambda line: line.split())
    .map(lambda word: (word.lower(), 1))
    .reduceByKey(lambda a, b: a + b)
    .sortBy(lambda x: -x[1])
)

word_counts.saveAsTextFile("hdfs:///data/output/")
spark.stop()', 'python', cat_2_id, user_8_id, true, 787, 127),
  ('Jetpack Compose Button', 'A styled button component in Jetpack Compose with ripple effect.', '@Composable
fun PrimaryButton(text: String, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge
        )
    }
}', 'kotlin', cat_0_id, user_9_id, true, 618, 26),
  ('Unity Player Movement', 'A simple character movement script in Unity C#.', 'using UnityEngine;

public class PlayerMovement : MonoBehaviour {
    public float speed = 5f;
    private Rigidbody rb;

    void Start() {
        rb = GetComponent<Rigidbody>();
    }

    void FixedUpdate() {
        float moveX = Input.GetAxis("Horizontal");
        float moveZ = Input.GetAxis("Vertical");
        Vector3 movement = new Vector3(moveX, 0, moveZ);
        rb.MovePosition(transform.position + movement * speed * Time.fixedDeltaTime);
    }
}', 'csharp', cat_4_id, user_9_id, true, 190, 37),
  ('Zod Schema Validation', 'Validate and parse form data with Zod in TypeScript.', 'import { z } from ''zod'';

const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don''t match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof RegisterSchema>;

function register(data: unknown) {
  const result = RegisterSchema.safeParse(data);
  if (!result.success) {
    console.error(result.error.flatten());
    return;
  }
  console.log("Valid data:", result.data);
}', 'typescript', cat_8_id, user_10_id, true, 582, 92),
  ('CSS Container Queries', 'Style components based on their container size, not viewport.', '.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  padding: 1rem;
  font-size: 1rem;
}

@container card (min-width: 400px) {
  .card {
    padding: 2rem;
    font-size: 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}', 'css', cat_5_id, user_10_id, true, 375, 148),
  ('TypeScript Mapped Types', 'Create powerful utility types using TypeScript mapped types.', 'type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Optional<T> = { [P in keyof T]?: T[P] };
type Nullable<T> = { [P in keyof T]: T[P] | null };

interface User {
  id: number;
  name: string;
  email: string;
}

// All fields read-only
type ReadonlyUser = Readonly<User>;
// All fields optional
type UpdateUser = Optional<User>;
// All fields nullable
type NullableUser = Nullable<User>;', 'typescript', cat_8_id, user_11_id, true, 560, 112),
  ('Zod Schema Validation', 'Validate and parse form data with Zod in TypeScript.', 'import { z } from ''zod'';

const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don''t match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof RegisterSchema>;

function register(data: unknown) {
  const result = RegisterSchema.safeParse(data);
  if (!result.success) {
    console.error(result.error.flatten());
    return;
  }
  console.log("Valid data:", result.data);
}', 'typescript', cat_8_id, user_11_id, true, 403, 118),
  ('Python Singleton Pattern', 'Thread-safe Singleton implementation in Python.', 'import threading

class Singleton:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if not cls._instance:
                cls._instance = super().__new__(cls)
        return cls._instance

a = Singleton()
b = Singleton()
print(a is b)  # True', 'python', cat_2_id, user_11_id, true, 312, 131),
  ('AWS Lambda Handler (Python)', 'A basic AWS Lambda function that processes API Gateway events.', 'import json

def lambda_handler(event, context):
    body = json.loads(event.get(''body'', ''{}''))
    name = body.get(''name'', ''World'')
    
    return {
        ''statusCode'': 200,
        ''headers'': {
            ''Content-Type'': ''application/json'',
            ''Access-Control-Allow-Origin'': ''*''
        },
        ''body'': json.dumps({''message'': f''Hello, {name}!''})
    }', 'python', cat_2_id, user_12_id, true, 411, 47),
  ('PostgreSQL Full Text Search', 'Efficient full-text search using tsvector and tsquery.', '-- Add a tsvector column for efficient search
ALTER TABLE articles ADD COLUMN search_vector tsvector;

-- Update the column with concatenated fields
UPDATE articles SET search_vector =
    to_tsvector(''english'', coalesce(title, '''') || '' '' || coalesce(body, ''''));

-- Create a GIN index for fast lookups
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- Search query
SELECT id, title
FROM articles
WHERE search_vector @@ plainto_tsquery(''english'', ''javascript async programming'')
ORDER BY ts_rank(search_vector, plainto_tsquery(''english'', ''javascript async programming'')) DESC
LIMIT 10;', 'sql', cat_11_id, user_12_id, true, 388, 104),
  ('Event Emitter in JS', 'A lightweight custom EventEmitter class from scratch.', 'class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
    return this;
  }

  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
    return this;
  }

  emit(event, ...args) {
    (this.events[event] || []).forEach(listener => listener(...args));
    return this;
  }
}

const emitter = new EventEmitter();
emitter.on(''data'', (msg) => console.log(''Received:'', msg));
emitter.emit(''data'', ''Hello World'');', 'javascript', cat_9_id, user_12_id, true, 900, 23),
  ('Golang Goroutine Pool', 'A simple worker pool pattern using goroutines and channels.', 'package main

import (
    "fmt"
    "sync"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for job := range jobs {
        results <- job * job
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    var wg sync.WaitGroup

    for w := 1; w <= 5; w++ {
        wg.Add(1)
        go worker(w, jobs, results, &wg)
    }

    for i := 1; i <= 20; i++ { jobs <- i }
    close(jobs)
    wg.Wait()
    close(results)
    for r := range results { fmt.Println(r) }
}', 'go', cat_7_id, user_12_id, true, 873, 35),
  ('Jetpack Compose Button', 'A styled button component in Jetpack Compose with ripple effect.', '@Composable
fun PrimaryButton(text: String, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge
        )
    }
}', 'kotlin', cat_0_id, user_13_id, true, 666, 107),
  ('CSS Container Queries', 'Style components based on their container size, not viewport.', '.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  padding: 1rem;
  font-size: 1rem;
}

@container card (min-width: 400px) {
  .card {
    padding: 2rem;
    font-size: 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}', 'css', cat_5_id, user_13_id, true, 837, 120),
  ('Redis Pub/Sub in Node.js', 'Publish and subscribe to channels using ioredis.', 'const Redis = require(''ioredis'');
const publisher = new Redis();
const subscriber = new Redis();

// Subscriber listens on ''notifications'' channel
subscriber.subscribe(''notifications'', (err, count) => {
  console.log(`Subscribed to ${count} channel(s)`);
});

subscriber.on(''message'', (channel, message) => {
  console.log(`[${channel}] ${message}`);
});

// Publisher sends a message
setTimeout(() => {
  publisher.publish(''notifications'', JSON.stringify({ type: ''alert'', msg: ''New login!'' }));
}, 1000);', 'javascript', cat_9_id, user_13_id, true, 683, 67),
  ('Spark Word Count', 'A classic MapReduce word count example using PySpark.', 'from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("WordCount").getOrCreate()
sc = spark.sparkContext

text = sc.textFile("hdfs:///data/input.txt")

word_counts = (
    text
    .flatMap(lambda line: line.split())
    .map(lambda word: (word.lower(), 1))
    .reduceByKey(lambda a, b: a + b)
    .sortBy(lambda x: -x[1])
)

word_counts.saveAsTextFile("hdfs:///data/output/")
spark.stop()', 'python', cat_2_id, user_14_id, true, 527, 147),
  ('Nginx Reverse Proxy Config', 'Configure Nginx as a reverse proxy for a Node.js app with SSL.', 'server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection ''upgrade'';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}', 'nginx', cat_10_id, user_14_id, true, 963, 67),
  ('React Suspense & Lazy', 'Code-split your app using React.lazy and Suspense.', 'import React, { Suspense, lazy } from ''react'';

const Dashboard = lazy(() => import(''./pages/Dashboard''));
const Profile = lazy(() => import(''./pages/Profile''));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Router>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Router>
    </Suspense>
  );
}', 'typescript', cat_6_id, user_15_id, true, 165, 79),
  ('Zod Schema Validation', 'Validate and parse form data with Zod in TypeScript.', 'import { z } from ''zod'';

const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don''t match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof RegisterSchema>;

function register(data: unknown) {
  const result = RegisterSchema.safeParse(data);
  if (!result.success) {
    console.error(result.error.flatten());
    return;
  }
  console.log("Valid data:", result.data);
}', 'typescript', cat_8_id, user_15_id, true, 572, 103),
  ('Bioinformatics DNA Sequence', 'Parse and analyze a DNA sequence string in Python.', 'def analyze_dna(sequence: str) -> dict:
    sequence = sequence.upper()
    length = len(sequence)
    count = {base: sequence.count(base) for base in ''ATCG''}
    gc_content = (count[''G''] + count[''C'']) / length * 100
    complement = sequence.translate(str.maketrans(''ATCG'', ''TAGC''))
    reverse_complement = complement[::-1]

    return {
        ''length'': length,
        ''composition'': count,
        ''gc_content'': round(gc_content, 2),
        ''reverse_complement'': reverse_complement
    }

result = analyze_dna("ATCGGCTATGCAATCG")
print(result)', 'python', cat_2_id, user_15_id, true, 357, 147),
  ('Apache Kafka Producer', 'Send messages to a Kafka topic using KafkaProducer in Java.', 'Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

try (KafkaProducer<String, String> producer = new KafkaProducer<>(props)) {
    ProducerRecord<String, String> record = new ProducerRecord<>("my-topic", "key", "Hello Kafka!");
    producer.send(record, (metadata, exception) -> {
        if (exception != null) exception.printStackTrace();
        else System.out.println("Sent to partition " + metadata.partition());
    });
}', 'java', cat_1_id, user_15_id, true, 588, 19),
  ('Nginx Reverse Proxy Config', 'Configure Nginx as a reverse proxy for a Node.js app with SSL.', 'server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection ''upgrade'';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}', 'nginx', cat_10_id, user_16_id, true, 862, 181),
  ('Python FastAPI WebSocket', 'A real-time WebSocket endpoint with FastAPI.', 'from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Client {client_id} says: {data}")
    except Exception:
        print(f"Client {client_id} disconnected")', 'python', cat_2_id, user_16_id, true, 454, 71),
  ('Bioinformatics DNA Sequence', 'Parse and analyze a DNA sequence string in Python.', 'def analyze_dna(sequence: str) -> dict:
    sequence = sequence.upper()
    length = len(sequence)
    count = {base: sequence.count(base) for base in ''ATCG''}
    gc_content = (count[''G''] + count[''C'']) / length * 100
    complement = sequence.translate(str.maketrans(''ATCG'', ''TAGC''))
    reverse_complement = complement[::-1]

    return {
        ''length'': length,
        ''composition'': count,
        ''gc_content'': round(gc_content, 2),
        ''reverse_complement'': reverse_complement
    }

result = analyze_dna("ATCGGCTATGCAATCG")
print(result)', 'python', cat_2_id, user_16_id, true, 442, 167),
  ('Unity Player Movement', 'A simple character movement script in Unity C#.', 'using UnityEngine;

public class PlayerMovement : MonoBehaviour {
    public float speed = 5f;
    private Rigidbody rb;

    void Start() {
        rb = GetComponent<Rigidbody>();
    }

    void FixedUpdate() {
        float moveX = Input.GetAxis("Horizontal");
        float moveZ = Input.GetAxis("Vertical");
        Vector3 movement = new Vector3(moveX, 0, moveZ);
        rb.MovePosition(transform.position + movement * speed * Time.fixedDeltaTime);
    }
}', 'csharp', cat_4_id, user_17_id, true, 820, 28),
  ('AWS Lambda Handler (Python)', 'A basic AWS Lambda function that processes API Gateway events.', 'import json

def lambda_handler(event, context):
    body = json.loads(event.get(''body'', ''{}''))
    name = body.get(''name'', ''World'')
    
    return {
        ''statusCode'': 200,
        ''headers'': {
            ''Content-Type'': ''application/json'',
            ''Access-Control-Allow-Origin'': ''*''
        },
        ''body'': json.dumps({''message'': f''Hello, {name}!''})
    }', 'python', cat_2_id, user_17_id, true, 642, 191),
  ('Spark Word Count', 'A classic MapReduce word count example using PySpark.', 'from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("WordCount").getOrCreate()
sc = spark.sparkContext

text = sc.textFile("hdfs:///data/input.txt")

word_counts = (
    text
    .flatMap(lambda line: line.split())
    .map(lambda word: (word.lower(), 1))
    .reduceByKey(lambda a, b: a + b)
    .sortBy(lambda x: -x[1])
)

word_counts.saveAsTextFile("hdfs:///data/output/")
spark.stop()', 'python', cat_2_id, user_17_id, true, 945, 17),
  ('PostgreSQL Full Text Search', 'Efficient full-text search using tsvector and tsquery.', '-- Add a tsvector column for efficient search
ALTER TABLE articles ADD COLUMN search_vector tsvector;

-- Update the column with concatenated fields
UPDATE articles SET search_vector =
    to_tsvector(''english'', coalesce(title, '''') || '' '' || coalesce(body, ''''));

-- Create a GIN index for fast lookups
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- Search query
SELECT id, title
FROM articles
WHERE search_vector @@ plainto_tsquery(''english'', ''javascript async programming'')
ORDER BY ts_rank(search_vector, plainto_tsquery(''english'', ''javascript async programming'')) DESC
LIMIT 10;', 'sql', cat_11_id, user_17_id, true, 97, 62),
  ('Event Emitter in JS', 'A lightweight custom EventEmitter class from scratch.', 'class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
    return this;
  }

  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
    return this;
  }

  emit(event, ...args) {
    (this.events[event] || []).forEach(listener => listener(...args));
    return this;
  }
}

const emitter = new EventEmitter();
emitter.on(''data'', (msg) => console.log(''Received:'', msg));
emitter.emit(''data'', ''Hello World'');', 'javascript', cat_9_id, user_18_id, true, 705, 51),
  ('Zod Schema Validation', 'Validate and parse form data with Zod in TypeScript.', 'import { z } from ''zod'';

const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don''t match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof RegisterSchema>;

function register(data: unknown) {
  const result = RegisterSchema.safeParse(data);
  if (!result.success) {
    console.error(result.error.flatten());
    return;
  }
  console.log("Valid data:", result.data);
}', 'typescript', cat_8_id, user_18_id, true, 699, 188),
  ('Nginx Reverse Proxy Config', 'Configure Nginx as a reverse proxy for a Node.js app with SSL.', 'server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection ''upgrade'';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}', 'nginx', cat_10_id, user_18_id, true, 358, 211),
  ('GraphQL Schema Definition', 'A basic GraphQL schema with Query and Mutation types.', 'type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
  createPost(title: String!, body: String!, authorId: ID!): Post!
}', 'graphql', cat_3_id, user_19_id, true, 439, 193),
  ('CSS Container Queries', 'Style components based on their container size, not viewport.', '.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  padding: 1rem;
  font-size: 1rem;
}

@container card (min-width: 400px) {
  .card {
    padding: 2rem;
    font-size: 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}', 'css', cat_5_id, user_19_id, true, 409, 208);

END $$;
