const fs = require('fs');
const path = require('path');

const users = [
  { name: 'Ritika Chauhan', email: 'ritika.chauhan@example.com', handle: 'ritika_dev', bio: 'Frontend wizard crafting pixel-perfect UIs with React and Tailwind.' },
  { name: 'Gaurav Shukla', email: 'gaurav.shukla@example.com', handle: 'gaurav_sh', bio: 'DevOps engineer automating everything from builds to deployments.' },
  { name: 'Pallavi Dubey', email: 'pallavi.dubey@example.com', handle: 'pallavi_d', bio: 'Data engineer building robust ETL pipelines with Spark and Airflow.' },
  { name: 'Sameer Qureshi', email: 'sameer.qureshi@example.com', handle: 'sameer_q', bio: 'Android developer passionate about Material Design and Jetpack Compose.' },
  { name: 'Anjali Khanna', email: 'anjali.khanna@example.com', handle: 'anjali_k', bio: 'Technical writer and open source contributor to documentation.' },
  { name: 'Vikrant Rathore', email: 'vikrant.rathore@example.com', handle: 'vikrant_r', bio: 'Systems programmer working on compilers and language runtimes.' },
  { name: 'Ishita Bose', email: 'ishita.bose@example.com', handle: 'ishita_b', bio: 'AI/ML engineer building recommendation systems at scale.' },
  { name: 'Harshit Garg', email: 'harshit.garg@example.com', handle: 'harshit_g', bio: 'Backend developer focused on distributed systems and event-driven architecture.' },
  { name: 'Ruchi Pandey', email: 'ruchi.pandey@example.com', handle: 'ruchi_p', bio: 'Blockchain developer and DeFi enthusiast building on Ethereum.' },
  { name: 'Saurabh Tripathi', email: 'saurabh.tripathi@example.com', handle: 'saurabh_t', bio: 'Cloud architect designing resilient multi-region AWS infrastructure.' },
  { name: 'Deepika Nair', email: 'deepika.nair@example.com', handle: 'deepika_n', bio: 'Full-stack developer with a passion for developer tooling and DX.' },
  { name: 'Mohit Bansal', email: 'mohit.bansal@example.com', handle: 'mohit_b', bio: 'Game developer using Unity and C# for mobile and VR experiences.' },
  { name: 'Swati Misra', email: 'swati.misra@example.com', handle: 'swati_m', bio: 'Site reliability engineer ensuring 99.99% uptime for production systems.' },
  { name: 'Kunal Srivastava', email: 'kunal.sriv@example.com', handle: 'kunal_sv', bio: 'Python developer specializing in scientific computing and bioinformatics.' },
  { name: 'Priyanka Malhotra', email: 'priyanka.m@example.com', handle: 'priyanka_m', bio: 'GraphQL and API design specialist, love building great developer experience.' },
  { name: 'Abhinav Jain', email: 'abhinav.jain@example.com', handle: 'abhinav_j', bio: 'Performance engineer obsessed with profiling and optimizing code.' },
  { name: 'Sneha Kulkarni', email: 'sneha.kulkarni@example.com', handle: 'sneha_k', bio: 'TypeScript enthusiast and maintainer of several open-source npm packages.' },
  { name: 'Rajat Verma', email: 'rajat.verma@example.com', handle: 'rajat_v', bio: 'Linux kernel contributor and systems software engineer.' },
  { name: 'Madhuri Rao', email: 'madhuri.rao@example.com', handle: 'madhuri_r', bio: 'UX engineer bridging the gap between design and engineering.' },
  { name: 'Siddhanth Kapoor', email: 'siddhanth.k@example.com', handle: 'siddhanth_k', bio: 'Senior engineer building real-time data streaming pipelines with Kafka.' }
];

const snippetsPool = [
  {
    title: 'Jetpack Compose Button',
    desc: 'A styled button component in Jetpack Compose with ripple effect.',
    lang: 'kotlin', cat: 'Android',
    code: `@Composable\nfun PrimaryButton(text: String, onClick: () -> Unit) {\n    Button(\n        onClick = onClick,\n        shape = RoundedCornerShape(12.dp),\n        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)\n    ) {\n        Text(\n            text = text,\n            style = MaterialTheme.typography.labelLarge\n        )\n    }\n}`
  },
  {
    title: 'Apache Kafka Producer',
    desc: 'Send messages to a Kafka topic using KafkaProducer in Java.',
    lang: 'java', cat: 'Java',
    code: `Properties props = new Properties();\nprops.put("bootstrap.servers", "localhost:9092");\nprops.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");\nprops.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");\n\ntry (KafkaProducer<String, String> producer = new KafkaProducer<>(props)) {\n    ProducerRecord<String, String> record = new ProducerRecord<>("my-topic", "key", "Hello Kafka!");\n    producer.send(record, (metadata, exception) -> {\n        if (exception != null) exception.printStackTrace();\n        else System.out.println("Sent to partition " + metadata.partition());\n    });\n}`
  },
  {
    title: 'Python Singleton Pattern',
    desc: 'Thread-safe Singleton implementation in Python.',
    lang: 'python', cat: 'Python',
    code: `import threading\n\nclass Singleton:\n    _instance = None\n    _lock = threading.Lock()\n\n    def __new__(cls):\n        with cls._lock:\n            if not cls._instance:\n                cls._instance = super().__new__(cls)\n        return cls._instance\n\na = Singleton()\nb = Singleton()\nprint(a is b)  # True`
  },
  {
    title: 'GraphQL Schema Definition',
    desc: 'A basic GraphQL schema with Query and Mutation types.',
    lang: 'graphql', cat: 'API',
    code: `type User {\n  id: ID!\n  name: String!\n  email: String!\n  posts: [Post!]!\n}\n\ntype Post {\n  id: ID!\n  title: String!\n  body: String!\n  author: User!\n}\n\ntype Query {\n  users: [User!]!\n  user(id: ID!): User\n  posts: [Post!]!\n}\n\ntype Mutation {\n  createUser(name: String!, email: String!): User!\n  createPost(title: String!, body: String!, authorId: ID!): Post!\n}`
  },
  {
    title: 'Unity Player Movement',
    desc: 'A simple character movement script in Unity C#.',
    lang: 'csharp', cat: 'Unity',
    code: `using UnityEngine;\n\npublic class PlayerMovement : MonoBehaviour {\n    public float speed = 5f;\n    private Rigidbody rb;\n\n    void Start() {\n        rb = GetComponent<Rigidbody>();\n    }\n\n    void FixedUpdate() {\n        float moveX = Input.GetAxis("Horizontal");\n        float moveZ = Input.GetAxis("Vertical");\n        Vector3 movement = new Vector3(moveX, 0, moveZ);\n        rb.MovePosition(transform.position + movement * speed * Time.fixedDeltaTime);\n    }\n}`
  },
  {
    title: 'CSS Neon Glow Text',
    desc: 'Create a vibrant neon text glow effect with CSS.',
    lang: 'css', cat: 'CSS',
    code: `.neon-text {\n  color: #fff;\n  text-shadow:\n    0 0 5px #fff,\n    0 0 10px #fff,\n    0 0 20px #ff00de,\n    0 0 40px #ff00de,\n    0 0 80px #ff00de;\n  animation: flicker 1.5s infinite alternate;\n}\n\n@keyframes flicker {\n  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }\n  20%, 24%, 55% { opacity: 0.4; }\n}`
  },
  {
    title: 'React Suspense & Lazy',
    desc: 'Code-split your app using React.lazy and Suspense.',
    lang: 'typescript', cat: 'React',
    code: `import React, { Suspense, lazy } from 'react';\n\nconst Dashboard = lazy(() => import('./pages/Dashboard'));\nconst Profile = lazy(() => import('./pages/Profile'));\n\nfunction App() {\n  return (\n    <Suspense fallback={<div>Loading...</div>}>\n      <Router>\n        <Route path="/dashboard" element={<Dashboard />} />\n        <Route path="/profile" element={<Profile />} />\n      </Router>\n    </Suspense>\n  );\n}`
  },
  {
    title: 'Python FastAPI WebSocket',
    desc: 'A real-time WebSocket endpoint with FastAPI.',
    lang: 'python', cat: 'Python',
    code: `from fastapi import FastAPI, WebSocket\n\napp = FastAPI()\n\n@app.websocket("/ws/{client_id}")\nasync def websocket_endpoint(websocket: WebSocket, client_id: int):\n    await websocket.accept()\n    try:\n        while True:\n            data = await websocket.receive_text()\n            await websocket.send_text(f"Client {client_id} says: {data}")\n    except Exception:\n        print(f"Client {client_id} disconnected")`
  },
  {
    title: 'Golang Goroutine Pool',
    desc: 'A simple worker pool pattern using goroutines and channels.',
    lang: 'go', cat: 'Go',
    code: `package main\n\nimport (\n    "fmt"\n    "sync"\n)\n\nfunc worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {\n    defer wg.Done()\n    for job := range jobs {\n        results <- job * job\n    }\n}\n\nfunc main() {\n    jobs := make(chan int, 100)\n    results := make(chan int, 100)\n    var wg sync.WaitGroup\n\n    for w := 1; w <= 5; w++ {\n        wg.Add(1)\n        go worker(w, jobs, results, &wg)\n    }\n\n    for i := 1; i <= 20; i++ { jobs <- i }\n    close(jobs)\n    wg.Wait()\n    close(results)\n    for r := range results { fmt.Println(r) }\n}`
  },
  {
    title: 'AWS Lambda Handler (Python)',
    desc: 'A basic AWS Lambda function that processes API Gateway events.',
    lang: 'python', cat: 'Python',
    code: `import json\n\ndef lambda_handler(event, context):\n    body = json.loads(event.get('body', '{}'))\n    name = body.get('name', 'World')\n    \n    return {\n        'statusCode': 200,\n        'headers': {\n            'Content-Type': 'application/json',\n            'Access-Control-Allow-Origin': '*'\n        },\n        'body': json.dumps({'message': f'Hello, {name}!'})\n    }`
  },
  {
    title: 'TypeScript Mapped Types',
    desc: 'Create powerful utility types using TypeScript mapped types.',
    lang: 'typescript', cat: 'TypeScript',
    code: `type Readonly<T> = { readonly [P in keyof T]: T[P] };\ntype Optional<T> = { [P in keyof T]?: T[P] };\ntype Nullable<T> = { [P in keyof T]: T[P] | null };\n\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\n// All fields read-only\ntype ReadonlyUser = Readonly<User>;\n// All fields optional\ntype UpdateUser = Optional<User>;\n// All fields nullable\ntype NullableUser = Nullable<User>;`
  },
  {
    title: 'Redis Pub/Sub in Node.js',
    desc: 'Publish and subscribe to channels using ioredis.',
    lang: 'javascript', cat: 'JavaScript',
    code: `const Redis = require('ioredis');\nconst publisher = new Redis();\nconst subscriber = new Redis();\n\n// Subscriber listens on 'notifications' channel\nsubscriber.subscribe('notifications', (err, count) => {\n  console.log(\`Subscribed to \${count} channel(s)\`);\n});\n\nsubscriber.on('message', (channel, message) => {\n  console.log(\`[\${channel}] \${message}\`);\n});\n\n// Publisher sends a message\nsetTimeout(() => {\n  publisher.publish('notifications', JSON.stringify({ type: 'alert', msg: 'New login!' }));\n}, 1000);`
  },
  {
    title: 'Spark Word Count',
    desc: 'A classic MapReduce word count example using PySpark.',
    lang: 'python', cat: 'Python',
    code: `from pyspark.sql import SparkSession\n\nspark = SparkSession.builder.appName("WordCount").getOrCreate()\nsc = spark.sparkContext\n\ntext = sc.textFile("hdfs:///data/input.txt")\n\nword_counts = (\n    text\n    .flatMap(lambda line: line.split())\n    .map(lambda word: (word.lower(), 1))\n    .reduceByKey(lambda a, b: a + b)\n    .sortBy(lambda x: -x[1])\n)\n\nword_counts.saveAsTextFile("hdfs:///data/output/")\nspark.stop()`
  },
  {
    title: 'CSS Container Queries',
    desc: 'Style components based on their container size, not viewport.',
    lang: 'css', cat: 'CSS',
    code: `.card-container {\n  container-type: inline-size;\n  container-name: card;\n}\n\n.card {\n  padding: 1rem;\n  font-size: 1rem;\n}\n\n@container card (min-width: 400px) {\n  .card {\n    padding: 2rem;\n    font-size: 1.25rem;\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n  }\n}`
  },
  {
    title: 'Zod Schema Validation',
    desc: 'Validate and parse form data with Zod in TypeScript.',
    lang: 'typescript', cat: 'TypeScript',
    code: `import { z } from 'zod';\n\nconst RegisterSchema = z.object({\n  username: z.string().min(3).max(20),\n  email: z.string().email(),\n  password: z.string().min(8),\n  confirmPassword: z.string()\n}).refine((data) => data.password === data.confirmPassword, {\n  message: "Passwords don't match",\n  path: ["confirmPassword"],\n});\n\ntype RegisterFormData = z.infer<typeof RegisterSchema>;\n\nfunction register(data: unknown) {\n  const result = RegisterSchema.safeParse(data);\n  if (!result.success) {\n    console.error(result.error.flatten());\n    return;\n  }\n  console.log("Valid data:", result.data);\n}`
  },
  {
    title: 'Nginx Reverse Proxy Config',
    desc: 'Configure Nginx as a reverse proxy for a Node.js app with SSL.',
    lang: 'nginx', cat: 'DevOps',
    code: `server {\n    listen 80;\n    server_name yourdomain.com;\n    return 301 https://$host$request_uri;\n}\n\nserver {\n    listen 443 ssl;\n    server_name yourdomain.com;\n\n    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;\n\n    location / {\n        proxy_pass http://localhost:3000;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection 'upgrade';\n        proxy_set_header Host $host;\n        proxy_cache_bypass $http_upgrade;\n    }\n}`
  },
  {
    title: 'React Infinite Scroll',
    desc: 'Implement infinite scroll using IntersectionObserver API.',
    lang: 'typescript', cat: 'React',
    code: `import { useEffect, useRef, useCallback } from 'react';\n\nfunction useInfiniteScroll(callback: () => void) {\n  const observer = useRef<IntersectionObserver | null>(null);\n\n  const lastElementRef = useCallback((node: HTMLElement | null) => {\n    if (observer.current) observer.current.disconnect();\n    observer.current = new IntersectionObserver(entries => {\n      if (entries[0].isIntersecting) {\n        callback();\n      }\n    });\n    if (node) observer.current.observe(node);\n  }, [callback]);\n\n  return lastElementRef;\n}`
  },
  {
    title: 'PostgreSQL Full Text Search',
    desc: 'Efficient full-text search using tsvector and tsquery.',
    lang: 'sql', cat: 'SQL',
    code: `-- Add a tsvector column for efficient search\nALTER TABLE articles ADD COLUMN search_vector tsvector;\n\n-- Update the column with concatenated fields\nUPDATE articles SET search_vector =\n    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''));\n\n-- Create a GIN index for fast lookups\nCREATE INDEX idx_articles_search ON articles USING GIN(search_vector);\n\n-- Search query\nSELECT id, title\nFROM articles\nWHERE search_vector @@ plainto_tsquery('english', 'javascript async programming')\nORDER BY ts_rank(search_vector, plainto_tsquery('english', 'javascript async programming')) DESC\nLIMIT 10;`
  },
  {
    title: 'Bioinformatics DNA Sequence',
    desc: 'Parse and analyze a DNA sequence string in Python.',
    lang: 'python', cat: 'Python',
    code: `def analyze_dna(sequence: str) -> dict:\n    sequence = sequence.upper()\n    length = len(sequence)\n    count = {base: sequence.count(base) for base in 'ATCG'}\n    gc_content = (count['G'] + count['C']) / length * 100\n    complement = sequence.translate(str.maketrans('ATCG', 'TAGC'))\n    reverse_complement = complement[::-1]\n\n    return {\n        'length': length,\n        'composition': count,\n        'gc_content': round(gc_content, 2),\n        'reverse_complement': reverse_complement\n    }\n\nresult = analyze_dna("ATCGGCTATGCAATCG")\nprint(result)`
  },
  {
    title: 'Shell Backup Script',
    desc: 'A cron-ready shell script to backup a directory with timestamps.',
    lang: 'bash', cat: 'Bash',
    code: `#!/bin/bash\n\nSOURCE_DIR="/var/www/myapp"\nBACKUP_DIR="/backups"\nTIMESTAMP=$(date +%Y%m%d_%H%M%S)\nBACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"\n\n# Create backup directory if it doesn't exist\nmkdir -p "$BACKUP_DIR"\n\n# Create compressed archive\ntar -czf "$BACKUP_FILE" "$SOURCE_DIR"\n\n# Keep only last 7 backups\ncd "$BACKUP_DIR" && ls -t | tail -n +8 | xargs rm -f\n\necho "Backup created: $BACKUP_FILE"`
  },
  {
    title: 'Event Emitter in JS',
    desc: 'A lightweight custom EventEmitter class from scratch.',
    lang: 'javascript', cat: 'JavaScript',
    code: `class EventEmitter {\n  constructor() {\n    this.events = {};\n  }\n\n  on(event, listener) {\n    if (!this.events[event]) this.events[event] = [];\n    this.events[event].push(listener);\n    return this;\n  }\n\n  off(event, listener) {\n    if (!this.events[event]) return;\n    this.events[event] = this.events[event].filter(l => l !== listener);\n    return this;\n  }\n\n  emit(event, ...args) {\n    (this.events[event] || []).forEach(listener => listener(...args));\n    return this;\n  }\n}\n\nconst emitter = new EventEmitter();\nemitter.on('data', (msg) => console.log('Received:', msg));\nemitter.emit('data', 'Hello World');`
  }
];

let sql = `-- ENABLE pgcrypto if it isn't already (needed for passwords)\nCREATE EXTENSION IF NOT EXISTS pgcrypto;\n\nDO $$\nDECLARE\n`;

users.forEach((u, i) => { sql += `  user_${i}_id uuid := gen_random_uuid();\n`; });

const categories = [...new Set(snippetsPool.map(s => s.cat))];
categories.forEach((c, i) => { sql += `  cat_${i}_id uuid;\n`; });

sql += `BEGIN\n`;

sql += `  ---------------------------------------------------------\n  -- 1. ADD FAKE USERS TO AUTHENTICATION\n  ---------------------------------------------------------\n`;
sql += `  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES \n`;
sql += users.map((u, i) => `  (user_${i}_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '${u.email}', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"${u.name}"}', now(), now())`).join(',\n') + ';\n\n';

sql += `  ---------------------------------------------------------\n  -- 2. CREATE THEIR PUBLIC PROFILES\n  ---------------------------------------------------------\n`;
sql += `  INSERT INTO public.profiles (id, username, full_name, bio) VALUES\n`;
sql += users.map((u, i) => `  (user_${i}_id, '${u.handle}', '${u.name}', '${u.bio}')`).join(',\n') + `\n  ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, full_name = EXCLUDED.full_name, bio = EXCLUDED.bio;\n\n`;

sql += `  ---------------------------------------------------------\n  -- 3. CREATE CATEGORIES\n  ---------------------------------------------------------\n`;
const catColors = { Android: '#3DDC84', Java: '#ed8b00', Python: '#3776AB', API: '#f59e0b', Unity: '#000000', CSS: '#264DE4', React: '#61DAFB', Go: '#00ADD8', TypeScript: '#3178c6', JavaScript: '#f7df1e', DevOps: '#f97316', SQL: '#336791', Bash: '#4EAA25' };
sql += `  INSERT INTO public.categories (name, description, color) VALUES\n`;
sql += categories.map(c => `  ('${c}', '${c} related snippets', '${catColors[c] || '#6b7280'}')`).join(',\n') + `\n  ON CONFLICT (name) DO NOTHING;\n\n`;

categories.forEach((c, i) => { sql += `  SELECT id INTO cat_${i}_id FROM public.categories WHERE name = '${c}';\n`; });
sql += `\n`;

sql += `  ---------------------------------------------------------\n  -- 4. ADD FAKE PROJECTS / CODE SNIPPETS\n  ---------------------------------------------------------\n`;
sql += `  INSERT INTO public.code_snippets (title, description, code, language, category_id, author_id, is_public, views, likes) VALUES\n`;

const rows = [];
users.forEach((u, i) => {
  const count = Math.floor(Math.random() * 3) + 2;
  const shuffled = [...snippetsPool].sort(() => 0.5 - Math.random()).slice(0, count);
  shuffled.forEach(s => {
    const catIndex = categories.indexOf(s.cat);
    const views = Math.floor(Math.random() * 900) + 80;
    const likes = Math.floor(Math.random() * 200) + 15;
    rows.push(`  ('${s.title}', '${s.desc}', '${s.code.replace(/'/g, "''")}', '${s.lang}', cat_${catIndex}_id, user_${i}_id, true, ${views}, ${likes})`);
  });
});

sql += rows.join(',\n') + ';\n\nEND $$;\n';

const outFile = path.join(__dirname, 'seed_indian_users_batch3.sql');
fs.writeFileSync(outFile, sql, 'utf8');
console.log(`Generated seed_indian_users_batch3.sql — ${users.length} users, ${rows.length} snippets.`);
