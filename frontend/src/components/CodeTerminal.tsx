import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NeonCard } from "@/components/ui/neon-card";
import { Loader2, Play, TerminalSquare } from "lucide-react";
import { apiService } from "@/services/api";

interface CodeTerminalProps {
  slug?: string; // If provided, runs against challenge-specific endpoint
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onRunChange?: (info: { allPassed: boolean; language: string; results: Array<{ input: any; expected: any; actual: any; passed: boolean; error?: string }> }) => void;
  onLanguageChange?: (language: string) => void;
  disabled?: boolean;
}

export function CodeTerminal({ slug, initialCode = "", onCodeChange, onRunChange, onLanguageChange, disabled }: CodeTerminalProps) {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Array<{ input: any; expected: any; actual: any; passed: boolean; error?: string }>>([]);
  const [runError, setRunError] = useState<string | undefined>(undefined);
  const [stderr, setStderr] = useState<string | undefined>(undefined);
  const [compileOutput, setCompileOutput] = useState<string | undefined>(undefined);

  // Extract language-specific code from initialCode
  const getLanguageSpecificCode = (fullCode: string, lang: string): string => {
    if (!fullCode) return "";
    
    const lines = fullCode.split('\n');
    let inLanguageBlock = false;
    let languageCode: string[] = [];
    
    // Define language markers
    const markers = {
      javascript: '// JavaScript:',
      python: '// Python:',
      java: '// Java:',
      cpp: '// C++:',
      c: '// C:'
    };
    
    const currentMarker = markers[lang as keyof typeof markers];
    if (!currentMarker) return fullCode; // Fallback to full code if language not found
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line starts a language block
      if (line.trim() === currentMarker) {
        inLanguageBlock = true;
        continue; // Skip the marker line itself
      }
      
      // Check if this line starts a different language block
      if (line.trim().startsWith('// ') && line.trim().endsWith(':') && line.trim() !== currentMarker) {
        inLanguageBlock = false;
        continue;
      }
      
      // If we're in the current language block, add the line (without comments)
      if (inLanguageBlock) {
        const cleanLine = line.replace(/\s*\/\/.*$/, '').replace(/\s*#.*$/, '');
        if (cleanLine.trim()) {
          languageCode.push(cleanLine);
        }
      }
    }
    
    return languageCode.join('\n').trim();
  };

  // Update code when language changes
  useEffect(() => {
    const languageCode = getLanguageSpecificCode(initialCode, language);
    if (languageCode) {
      setCode(languageCode);
      onCodeChange?.(languageCode);
    } else {
      setCode(initialCode);
      onCodeChange?.(initialCode);
    }
    onLanguageChange?.(language);
  }, [language, initialCode, onCodeChange, onLanguageChange]);

  const handleChange = (value: string) => {
    setCode(value);
    onCodeChange?.(value);
  };

  const run = async () => {
    if (!code.trim()) return;
    setRunning(true);
    setRunError(undefined);
    setResults([]);
    setStderr(undefined);
    setCompileOutput(undefined);
    try {
      const data = slug
        ? await apiService.runCode(slug, code, language)
        : await apiService.runCodeSandbox(code, undefined, language);
      const nextResults = data.results || [];
      setResults(nextResults);
      if (data.error) setRunError(data.error);
      if (data.stderr) setStderr(data.stderr);
      if (data.compile_output) setCompileOutput(data.compile_output);
      const allPassed = Array.isArray(nextResults) && nextResults.length > 0 && nextResults.every(r => r.passed);
      onRunChange?.({ allPassed, language, results: nextResults });
    } catch (e: any) {
      setRunError(e?.message || "Run failed");
      onRunChange?.({ allPassed: false, language, results: [] });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-3">
      <NeonCard variant="violet" glow>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TerminalSquare className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Coding Terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={language} 
              onChange={(e) => { setLanguage(e.target.value); onLanguageChange?.(e.target.value); }}
              className="px-2 py-1 text-xs bg-input border border-primary/20 rounded"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
            <Button variant="cyber" size="sm" onClick={run} disabled={disabled || running}>
              {running ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Run
                </>
              )}
            </Button>
          </div>
        </div>
        <textarea
          placeholder="Write your code here... define function `solution(input)`"
          className="w-full h-48 p-3 rounded-lg bg-input border border-primary/20 focus:border-primary font-mono text-sm outline-none resize-y"
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
        />
      </NeonCard>

      {(results.length > 0 || runError || stderr || compileOutput) && (
        <NeonCard variant="cyan" glow>
          <div className="space-y-2">
            <div className="text-sm font-semibold">Run Results</div>
            {runError && <div className="text-xs text-red-400">Error: {runError}</div>}
            {stderr && <div className="text-xs text-red-400">Runtime Error: {stderr}</div>}
            {compileOutput && <div className="text-xs text-yellow-400">Compile: {compileOutput}</div>}
            {results.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left p-2">Input</th>
                      <th className="text-left p-2">Expected</th>
                      <th className="text-left p-2">Actual</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => (
                      <tr key={idx} className="border-t border-primary/10">
                        <td className="p-2 font-mono">{JSON.stringify(r.input)}</td>
                        <td className="p-2 font-mono">{JSON.stringify(r.expected)}</td>
                        <td className="p-2 font-mono">{r.error ? `Error: ${r.error}` : JSON.stringify(r.actual)}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${r.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {r.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </NeonCard>
      )}
    </div>
  );
}

export default CodeTerminal;


