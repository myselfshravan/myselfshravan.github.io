'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { trackCommandNonBlocking } from '@/lib/click-tracker';
import { FileText, ArrowDown, X, Minus, Square } from 'lucide-react';
import { GitHubLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { trackExternalLink } from '@/lib/click-tracker';
import { useLLMChat } from '@/hooks/use-llm-chat';
import { DEFAULT_SYSTEM_PROMPTS } from '@/lib/llm';
import portfolioData from '@/lib/portfolio-data.json';

// Terminal Component for reuse
function TerminalInterface({
  terminalOutput,
  currentInput,
  setCurrentInput,
  handleTerminalKeyDown,
  isExpanded = false,
  placeholderText = "Type 'help' or '?' for commands...",
  isAIMode = false,
}: {
  terminalOutput: string[];
  currentInput: string;
  setCurrentInput: (value: string) => void;
  handleTerminalKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isExpanded?: boolean;
  placeholderText?: string;
  isAIMode?: boolean;
}) {
  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Mobile detection for responsive placeholder text
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Terminal output */}
      <div
        ref={terminalOutputRef}
        className={`space-y-1 overflow-y-auto mb-2 scroll-smooth flex-1 ${
          isExpanded ? '' : 'max-h-56'
        }`}
      >
        {terminalOutput.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.15,
              delay: index * 0.02,
              ease: 'easeOut',
            }}
            className={`whitespace-pre-wrap ${
              line.startsWith('shravan_revanna@portfolio:~$')
                ? 'text-green-400'
                : line.startsWith('✔') || line.includes('✔')
                ? 'text-green-500'
                : line.startsWith('ℹ') || line.includes('ℹ')
                ? 'text-blue-400'
                : line.startsWith('⚠') || line.includes('⚠')
                ? 'text-yellow-400'
                : line.startsWith('Command not found') || line.includes('not found')
                ? 'text-red-400'
                : 'text-muted-foreground'
            }`}
          >
            {line}
          </motion.div>
        ))}
      </div>

      {/* Command input */}
      <div className="flex items-center text-green-400">
        <span className="mr-2 truncate min-w-0">
          {isAIMode
            ? isMobile
              ? '🤖 ai>'
              : '🤖 ai mode>'
            : isMobile
            ? '~$'
            : 'shravan_revanna@portfolio:~$'}
        </span>
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleTerminalKeyDown}
          className="flex-1 bg-transparent outline-none text-green-400 font-mono"
          placeholder={
            isAIMode
              ? isMobile
                ? "Ask me anything... or type 'exit'" // short mobile placeholder
                : "Ask me anything... (type 'exit' to return)" // desktop placeholder
              : isMobile
              ? "Type 'help'..." // short mobile placeholder
              : placeholderText // normal desktop one
          }
          autoFocus
        />
      </div>
    </div>
  );
}

export function Hero() {
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const fullText = `shravan_revanna@portfolio:~$ whoami`;

  // AI Chat functionality
  const { isLoading, sendMessage, clearMessages } = useLLMChat({
    systemPrompt: DEFAULT_SYSTEM_PROMPTS.terminal,
  });

  // Track visits

  // Mobile detection for responsive placeholder text
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (mediaQuery.matches) {
      setText(fullText);
      setShowCursor(false);
      return;
    }

    let frameId: number;
    let cursorFrameId: number;
    let startTime: number | null = null;
    const typingSpeed = 60; // ms per character - improved for smoother typing

    const type = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const index = Math.min(Math.floor(elapsed / typingSpeed), fullText.length);

      setText(fullText.slice(0, index));

      if (index < fullText.length) {
        frameId = requestAnimationFrame(type);
      }
    };

    frameId = requestAnimationFrame(type);

    let lastCursorToggle = 0;
    const cursorSpeed = 530; // Slightly slower for better visibility

    const blink = (timestamp: number) => {
      if (timestamp - lastCursorToggle >= cursorSpeed) {
        setShowCursor((prev) => !prev);
        lastCursorToggle = timestamp;
      }

      cursorFrameId = requestAnimationFrame(blink);
    };

    cursorFrameId = requestAnimationFrame(blink);

    return () => {
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(cursorFrameId);
    };
  }, [fullText]);

  // Stop main cursor blinking when interactive mode is active
  useEffect(() => {
    if (isInteractive) {
      setShowCursor(false);
    }
  }, [isInteractive]);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Single-click activation for red dot
  const handleRedDotClick = () => {
    if (!isInteractive) {
      setIsInteractive(true);
      setTerminalOutput(['ℹ Terminal activated! Type "help" for commands.', '']);
    } else {
      // If already interactive, clicking red dot exits interactive mode
      setIsInteractive(false);
      setTerminalOutput([]);
      setCurrentInput('');
    }
  };

  // Single-click activation for green dot (expand to dialog)
  const handleGreenDotClick = () => {
    setIsDialogOpen(true);
    if (!isInteractive) {
      setIsInteractive(true);
      setTerminalOutput([
        '✔ Terminal expanded! Welcome to fullscreen mode.',
        'ℹ Type "help" for available commands.',
        '',
      ]);
    }
  };

  // Handle AI mode input separately
  const handleAIInput = async (input: string) => {
    const cmd = input.toLowerCase().trim();

    // Check for exit commands in AI mode
    if (cmd === 'exit' || cmd === 'exit ai' || cmd === 'quit') {
      setIsAIMode(false);
      setTerminalOutput((prev) => [...prev, '🤖 ai> ' + input, '👋 Exiting AI mode...', '']);
      return;
    }

    if (cmd === 'clear' || cmd === 'clear ai') {
      clearMessages();
      setTerminalOutput((prev) => [...prev, '🤖 ai> ' + input, '🧹 AI chat history cleared.', '']);
      return;
    }

    // Add user input to terminal output
    setTerminalOutput((prev) => [...prev, '🤖 ai> ' + input]);

    // Show loading indicator
    if (isLoading) {
      setTerminalOutput((prev) => [...prev, '⏳ AI is thinking...']);
    }

    try {
      // Use sendMessage and get the response directly
      const response = await sendMessage(input);

      if (response?.content) {
        setTerminalOutput((prev) => [...prev, '🤖 ' + response.content, '']);

        // Track AI conversation to Firebase
        trackCommandNonBlocking(input, response.content, 'ai');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setTerminalOutput((prev) => [...prev, `❌ AI Error: ${errorMessage}`, '']);

      // Track failed AI conversation
      trackCommandNonBlocking(input, `Error: ${errorMessage}`, 'ai');
    }
  };

  // Command parsing and execution
  const executeCommand = async (command: string) => {
    // If in AI mode, handle input differently
    if (isAIMode) {
      await handleAIInput(command);
      return;
    }

    const cmd = command.toLowerCase().trim();
    const prompt = 'shravan_revanna@portfolio:~$';

    // Add command to history and track it (non-blocking)
    if (cmd && !commandHistory.includes(cmd)) {
      setCommandHistory((prev) => [...prev, cmd]);
      trackCommandNonBlocking(command, undefined, 'terminal'); // Now non-blocking!
    }

    // Add command to output
    setTerminalOutput((prev) => [...prev, `${prompt} ${command}`]);

    switch (cmd) {
      case 'help':
      case '?':
        setTerminalOutput((prev) => [
          ...prev,
          '✔ Available commands:',
          '  help      - Show this help message',
          '  ai        - Enter AI assistant mode',
          '  clear     - Clear terminal screen',
          '  whoami    - Display user info',
          '  about     - About this portfolio',
          '  projects  - List recent projects',
          '  contact   - Contact information',
          '  skills    - Technical skills',
          '  ls        - List directory contents',
          '  pwd       - Print working directory',
          '  cat       - Display file contents',
          '  ai mode   - Activate AI assistant mode',
          '  exit      - Exit interactive mode',
          '  expand    - Expand terminal to fullscreen',
          '',
          '🤖 AI Mode:',
          '  "ai mode" or "activate ai" - Start LLM interaction',
          '  In AI mode: "exit" to return, "clear" to reset chat',
          '',
        ]);
        break;

      case 'clear':
        setTerminalOutput([]);
        break;

      case 'whoami':
        setTerminalOutput((prev) => [...prev, portfolioData.personal.description, '']);
        break;

      case 'about':
        setTerminalOutput((prev) => [
          ...prev,
          portfolioData.personal.bio,
          `Location: ${portfolioData.personal.location}`,
          `Email: ${portfolioData.personal.email}`,
          '',
        ]);
        break;

      case 'projects':
      case 'cd projects':
      case 'cd projects/':
        const recentProjects = portfolioData.projects.personal.slice(0, 3);
        setTerminalOutput((prev) => [
          ...prev,
          '✔ Recent Projects:',
          ...recentProjects.map((p) => `  • ${p.name} - ${p.description}`),
          '',
          'ℹ Type "visit projects" to see all projects.',
          '',
        ]);
        break;

      case 'contact':
        setTerminalOutput((prev) => [
          ...prev,
          '✔ Contact Information:',
          `  📧 ${portfolioData.personal.email}`,
          `  📱 ${portfolioData.personal.phone}`,
          `  🐙 ${portfolioData.social.github}`,
          `  💼 ${portfolioData.social.linkedin}`,
          '',
        ]);
        break;

      case 'skills':
      case 'cd skills':
      case 'cd skills/':
        setTerminalOutput((prev) => [
          ...prev,
          '✔ Technical Skills:',
          `  💻 Core: ${portfolioData.skills.core.map((s) => s.name).join(', ')}`,
          `  ⚛️ Frameworks: ${portfolioData.skills.frameworks.map((s) => s.name).join(', ')}`,
          `  🗄️ Databases: ${portfolioData.skills.databases.map((s) => s.name).join(', ')}`,
          `  🚀 DevOps: ${portfolioData.skills.devops.map((s) => s.name).join(', ')}`,
          '',
        ]);
        break;

      case 'exit':
        setIsInteractive(false);
        setTerminalOutput([]);
        setCurrentInput('');
        break;

      case 'ls':
        setTerminalOutput((prev) => [
          ...prev,
          'portfolio/     projects/     skills/     experience/',
          'about.txt      contact.info  resume.pdf  blog/',
          '',
        ]);
        break;

      case 'pwd':
        setTerminalOutput((prev) => [...prev, '/home/shravan_revanna/portfolio', '']);
        break;

      case 'cat':
        setTerminalOutput((prev) => [
          ...prev,
          'Usage: cat [filename]',
          'Available files: about.txt, contact.info, resume.pdf',
          '',
        ]);
        break;

      case 'cat about.txt':
      case 'cd about.txt':
        setTerminalOutput((prev) => [
          ...prev,
          portfolioData.personal.bio,
          `Current Role: MLE at Graphene`,
          `Projects Shipped: 150+`,
          `Passionate about: AI, Full-Stack Development, Automation`,
          '',
        ]);
        break;

      case 'cat contact.info':
      case 'cd contact.info':
        setTerminalOutput((prev) => [
          ...prev,
          `📧 ${portfolioData.personal.email}`,
          `📱 ${portfolioData.personal.phone}`,
          `📍 ${portfolioData.personal.location}`,
          `💼 ${portfolioData.social.linkedin}`,
          `🐙 ${portfolioData.social.github}`,
          '',
        ]);
        break;

      case 'sudo':
        setTerminalOutput((prev) => [
          ...prev,
          'Nice try! 😄',
          'shravan_revanna is not in the sudoers file. This incident will be reported.',
          '',
        ]);
        break;

      case 'sudo rm -rf /':
        setTerminalOutput((prev) => [
          ...prev,
          '🚨 SYSTEM BREACH DETECTED! 🚨',
          'Just kidding! This is a portfolio, not a real terminal 😉',
          'But I appreciate the classic hacker humor!',
          '',
        ]);
        break;

      case 'expand':
        if (!isInteractive) {
          setIsInteractive(true);
          setTerminalOutput(['✔ Terminal activated! Type "help" for available commands.', '']);
        }
        setIsDialogOpen(true);
        break;

      case 'ai mode':
      case 'activate ai':
      case 'ai':
        setIsAIMode(true);
        setTerminalOutput((prev) => [
          ...prev,
          '🤖 AI Mode activated! Now you can ask anything related to Shravan.',
          "Type your questions. Yeah! its kinda like shravan's clone 😅.",
          'Type "clear" to clear the chat history and "exit" to return to terminal.',
          '',
        ]);
        break;

      case 'visit projects':
      case 'cd projects':
        setTerminalOutput((prev) => [...prev, '✔ Scroling to projects page...', '']);
        scrollToSection('#projects');
        break;

      default:
        if (cmd.includes('sudo')) {
          setTerminalOutput((prev) => [
            ...prev,
            "sudo: command not found (and you probably shouldn't try that here! 😅)",
            '',
          ]);
        } else {
          setTerminalOutput((prev) => [
            ...prev,
            `Command not found: ${cmd}`,
            'Type "help" for available commands.',
            '',
          ]);
        }
    }
  };

  // Available commands for tab completion
  const availableCommands = [
    'help',
    'clear',
    'whoami',
    'about',
    'projects',
    'contact',
    'skills',
    'exit',
    'ls',
    'pwd',
    'cat',
    'ai mode',
    'activate ai',
    'ai',
    'sudo',
  ];

  // Handle keyboard input for terminal
  const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const input = currentInput.toLowerCase();
      const matches = availableCommands.filter((cmd) => cmd.startsWith(input));

      if (matches.length === 1) {
        setCurrentInput(matches[0]);
      } else if (matches.length > 1) {
        // Show available options
        setTerminalOutput((prev) => [
          ...prev,
          `shravan_revanna@portfolio:~$ ${currentInput}`,
          matches.join('  '),
          '',
        ]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    } else if (e.key === 'Escape') {
      setCurrentInput('');
      setHistoryIndex(-1);
    }
  };

  return (
    <section className="hero-section min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Terminal-style background grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      <div className="container mx-auto w-full px-2 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
        <div className="text-center space-y-8">
          {/* Terminal Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card/70 backdrop-blur-sm border border-primary/20 rounded-lg p-3 sm:p-6 font-mono text-left max-w-2xl mx-auto shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:border-primary/40 hover:bg-card/80 overflow-auto"
          >
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-primary/30">
              {/* Red Dot - Close/Activate */}
              <div
                className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-all cursor-pointer group relative flex items-center justify-center hover:scale-110"
                onClick={handleRedDotClick}
                title={isInteractive ? 'Click to close terminal' : 'Click to activate terminal'}
              >
                <X className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-900" />
              </div>

              {/* Yellow Dot - Minimize */}
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-all cursor-pointer group relative flex items-center justify-center">
                <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity text-yellow-900" />
              </div>

              {/* Green Dot - Expand */}
              <div
                className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-all cursor-pointer group relative flex items-center justify-center hover:scale-110"
                onClick={handleGreenDotClick}
                title="Click to expand terminal to fullscreen"
              >
                <Square className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity text-green-900" />
              </div>

              <span className="ml-2 text-xs text-primary">
                terminal {isInteractive && <span className="text-green-400">• interactive</span>}
                {isAIMode && <span className="text-blue-400"> • ai mode</span>}
              </span>
            </div>

            <div className="space-y-2 text-sm min-h-[120px]">
              {!isInteractive ? (
                // Static terminal display
                <>
                  <div className="text-green-400">
                    {text}
                    <span
                      className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                    >
                      |
                    </span>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 0.3 }}
                    className="text-muted-foreground"
                  >
                    {portfolioData.personal.description}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5, duration: 0.3 }}
                    className="text-muted-foreground pt-2"
                  >
                    Currently Machine Learning Engineer @{''}
                    <a
                      href="https://grapheneai.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                    >
                      Graphene
                    </a>{' '}
                    | Deep-tech automation specialist and AI Agentic Workflows | Ex-SDE Intern @<a
                      href="https://udaan.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                    >
                      udaan
                    </a>{" "}+{" "}
                    <a
                      href="https://udaancapital.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                    >
                      udaanCapital
                    </a>
                  </motion.div>
                </>
              ) : (
                // Interactive terminal
                <TerminalInterface
                  terminalOutput={terminalOutput}
                  currentInput={currentInput}
                  setCurrentInput={setCurrentInput}
                  handleTerminalKeyDown={handleTerminalKeyDown}
                  isAIMode={isAIMode}
                  placeholderText={
                    isMobile ? "Type 'help'..." : "Type 'help' or '?' for commands..."
                  }
                />
              )}
            </div>
          </motion.div>

          {/* Expanded Terminal Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-none w-[90vw] h-[60vh] max-h-[60vh] bg-card/95 backdrop-blur-md border border-primary/20 p-0 overflow-hidden rounded-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fixed">
              <DialogTitle className="sr-only">Interactive Terminal - Expanded View</DialogTitle>
              <div className="bg-card/70 backdrop-blur-sm border-b border-primary/20 rounded-t-lg p-4 font-mono h-full flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  {/* Dialog Terminal Header */}
                  <div
                    className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-all cursor-pointer group relative flex items-center justify-center"
                    onClick={() => setIsDialogOpen(false)}
                    title="Close expanded terminal"
                  >
                    <X className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-900" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-all cursor-pointer group relative flex items-center justify-center">
                    <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity text-yellow-900" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-all cursor-pointer group relative flex items-center justify-center">
                    <Square className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity text-green-900" />
                  </div>
                  <span className="ml-2 text-xs text-primary">
                    terminal • expanded <span className="text-green-400">• interactive</span>
                    {isAIMode && <span className="text-blue-400"> • ai mode</span>}
                  </span>
                </div>

                {/* Expanded Terminal Interface */}
                <div className="text-sm flex-1 overflow-hidden">
                  <TerminalInterface
                    terminalOutput={terminalOutput}
                    currentInput={currentInput}
                    setCurrentInput={setCurrentInput}
                    handleTerminalKeyDown={handleTerminalKeyDown}
                    isExpanded={true}
                    isAIMode={isAIMode}
                    placeholderText={
                      isMobile ? "Type 'help'..." : "Type 'help' or '?' for commands..."
                    }
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Bio Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-lg text-muted-foreground leading-relaxed">
              {portfolioData.personal.bio}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {/* <Button
              size="lg"
              onClick={() => scrollToSection('#projects')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3"
            >
              <Terminal className="mr-2 h-4 w-4" />
              view projects
            </Button> */}

            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                trackExternalLink(portfolioData.social.linkedin, 'LinkedIn Profile');
                window.open(portfolioData.social.linkedin, '_blank');
              }}
              className="px-6 py-3 border-primary/20 hover:bg-primary/5"
            >
              <LinkedInLogoIcon className="mr-2 h-4 w-4" />
              connect
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                trackExternalLink(portfolioData.writing.blog_url, 'Personal Blog');
                window.open(portfolioData.writing.blog_url, '_blank');
              }}
              className="px-6 py-3 border-primary/20 hover:bg-primary/5"
            >
              <FileText className="mr-2 h-4 w-4" />
              read blog
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                trackExternalLink(portfolioData.social.github, 'GitHub Profile');
                window.open(portfolioData.social.github, '_blank');
              }}
              className="px-6 py-3 border-primary/20 hover:bg-primary/5"
            >
              <GitHubLogoIcon className="mr-2 h-4 w-4" />
              source code
            </Button>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex justify-center gap-6 text-sm text-muted-foreground"
          >
            <button
              onClick={() => scrollToSection('#projects')}
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              projects
            </button>
            <button
              onClick={() => scrollToSection('#work')}
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              work
            </button>
            <button
              onClick={() => {
                trackExternalLink(`/${portfolioData.personal.resumeFile}`, 'Resume PDF');
                window.open(`/${portfolioData.personal.resumeFile}`, '_blank');
              }}
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              resume
            </button>
            <button
              onClick={() => scrollToSection('#contact')}
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              contact
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scrollToSection('#projects')}
          className="rounded-full hover:bg-primary/10"
        >
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
        </Button>
      </motion.div>
    </section>
  );
}
