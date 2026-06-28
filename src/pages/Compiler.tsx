import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, Code2, Terminal, Loader2, LayoutTemplate } from 'lucide-react';

const WANDBOX_API_URL = 'https://wandbox.org/api/compile.json';

const Compiler: React.FC = () => {
  const location = useLocation();
  const initialState = location.state as { code?: string; language?: string; htmlCode?: string; cssCode?: string; jsCode?: string } | null;

  // Detect initial mode based on passed language
  const initialIsWebProject = initialState?.language === 'html' || 
                              initialState?.language === 'css' || 
                              initialState?.language === 'web-project';

  // State for standard backend languages
  const [code, setCode] = useState(initialState?.code || '');
  const [language, setLanguage] = useState(initialState?.language || (initialIsWebProject ? 'web-project' : 'web-project'));
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // State for Web Project mode
  const [htmlCode, setHtmlCode] = useState(initialState?.htmlCode || (initialState?.language === 'html' ? initialState.code : ''));
  const [cssCode, setCssCode] = useState(initialState?.cssCode || (initialState?.language === 'css' ? initialState.code : ''));
  const [jsCode, setJsCode] = useState(initialState?.jsCode || (initialState?.language === 'javascript' && initialIsWebProject ? initialState.code : ''));
  const [srcDoc, setSrcDoc] = useState('');

  const supportedLanguages = [
    { value: 'web-project', label: 'Web Project (HTML/CSS/JS)' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
  ];

  // Auto-run standard code if state was passed via navigation
  useEffect(() => {
    if (initialState?.code && language !== 'web-project') {
      handleRunCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update live preview for web project mode with debounce
  useEffect(() => {
    if (language === 'web-project') {
      const timeout = setTimeout(() => {
        setSrcDoc(`
          <html>
            <head>
              <style>${cssCode}</style>
            </head>
            <body>
              ${htmlCode}
              <script>${jsCode}</script>
            </body>
          </html>
        `);
      }, 300); // 300ms debounce
      return () => clearTimeout(timeout);
    }
  }, [htmlCode, cssCode, jsCode, language]);

  const getWandboxCompiler = (lang: string) => {
    const map: { [key: string]: string } = {
      javascript: 'nodejs-20.17.0',
      python: 'cpython-3.14.0',
      typescript: 'typescript-5.6.2',
      java: 'openjdk-jdk-22+36',
      cpp: 'gcc-13.2.0',
      c: 'gcc-13.2.0-c',
      go: 'go-1.23.2',
      rust: 'rust-1.82.0',
      php: 'php-8.3.12',
      ruby: 'ruby-4.0.2',
      swift: 'swift-6.0.1',
      kotlin: 'kotlin-head',
    };
    return map[lang.toLowerCase()] || 'gcc-13.2.0';
  };

  const handleRunCode = async () => {
    if (language === 'web-project') return; // Handled by live preview
    if (!code.trim()) return;
    
    setIsRunning(true);
    setOutput('');

    try {
      const compiler = getWandboxCompiler(language);

      const response = await fetch(WANDBOX_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          compiler: compiler,
          code: code,
          save: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute code. Please try again later.');
      }

      const data = await response.json();
      
      let finalOutput = '';
      if (data.compiler_error) {
        finalOutput += data.compiler_error + '\n';
      }
      if (data.program_message) {
        finalOutput += data.program_message;
      } else if (data.program_output) {
        finalOutput += data.program_output;
      }

      setOutput(finalOutput.trim() || 'Execution finished with no output.');
    } catch (error: any) {
      setOutput(`Error: ${error.message || 'An unknown error occurred'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            {language === 'web-project' ? (
              <LayoutTemplate className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            ) : (
              <Code2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Online Compiler</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {supportedLanguages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          
          {language !== 'web-project' && (
            <button
              onClick={handleRunCode}
              disabled={isRunning || !code.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg shadow-blue-500/30"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run Code
            </button>
          )}
        </div>
      </div>

      {language === 'web-project' ? (
        /* CodePen Style Layout */
        <div className="flex-1 flex flex-col min-h-0 gap-4">
          {/* Top Half: Editors */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
            {/* HTML Editor */}
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/10 flex items-center gap-2">
                <span className="text-sm font-bold text-red-600 dark:text-red-400">HTML</span>
              </div>
              <textarea
                value={htmlCode || ''}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="flex-1 w-full p-4 border-none outline-none resize-none font-mono text-sm bg-transparent text-gray-900 dark:text-white focus:ring-0"
                placeholder="<!-- HTML goes here -->"
                spellCheck={false}
              />
            </div>
            {/* CSS Editor */}
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10 flex items-center gap-2">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">CSS</span>
              </div>
              <textarea
                value={cssCode || ''}
                onChange={(e) => setCssCode(e.target.value)}
                className="flex-1 w-full p-4 border-none outline-none resize-none font-mono text-sm bg-transparent text-gray-900 dark:text-white focus:ring-0"
                placeholder="/* CSS goes here */"
                spellCheck={false}
              />
            </div>
            {/* JS Editor */}
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/10 flex items-center gap-2">
                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">JS</span>
              </div>
              <textarea
                value={jsCode || ''}
                onChange={(e) => setJsCode(e.target.value)}
                className="flex-1 w-full p-4 border-none outline-none resize-none font-mono text-sm bg-transparent text-gray-900 dark:text-white focus:ring-0"
                placeholder="// JavaScript goes here"
                spellCheck={false}
              />
            </div>
          </div>
          
          {/* Bottom Half: Preview */}
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm min-h-0">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4" /> Live Preview
              </span>
            </div>
            <iframe
              title="live-preview"
              srcDoc={srcDoc}
              className="flex-1 w-full h-full border-none bg-white"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      ) : (
        /* Standard Backend Language Layout */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Editor Area */}
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Editor</span>
              </div>
            </div>
            <textarea
              value={code || ''}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full p-4 border-none outline-none resize-none font-mono text-sm bg-transparent text-gray-900 dark:text-white focus:ring-0"
              placeholder={`Write your ${supportedLanguages.find(l => l.value === language)?.label} code here...`}
              spellCheck={false}
            />
          </div>

          {/* Output Area */}
          <div className="flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Terminal Output</span>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap font-medium">
                {output || (
                  <span className="text-gray-600 italic">Run your code to see the output here...</span>
                )}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compiler;
