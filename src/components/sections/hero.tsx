'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { trackVisit, trackCommand } from '@/lib/analytics';
import { Terminal, FileText, ArrowDown, X, Minus, Square } from 'lucide-react';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import portfolioData from '@/lib/portfolio-data.json';

// Terminal Component for reuse
function TerminalInterface({
  terminalOutput,
  currentInput,
  setCurrentInput,
  handleTerminalKeyDown,
  isExpanded = false,
  placeholderText = "Type 'help' or '?' for commands...",
}: {
  terminalOutput: string[];
  currentInput: string;
  setCurrentInput: (value: string) => void;
  handleTerminalKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isExpanded?: boolean;
  placeholderText?: string;
}) {
  const terminalOutputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, [terminalOutput]);

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
        <span className="mr-2">shravan_revanna@portfolio:~$</span>
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleTerminalKeyDown}
          className="flex-1 bg-transparent outline-none text-green-400 font-mono"
          placeholder={placeholderText}
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
  const [redClickCount, setRedClickCount] = useState(0);
  const [greenClickCount, setGreenClickCount] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const fullText = `shravan_revanna@portfolio:~$ whoami`;

  // Track visits
  useEffect(() => {
    trackVisit().catch(console.error);
  }, []);

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

  // Triple-click detection for red dot
  const handleRedDotClick = () => {
    setRedClickCount((prev) => prev + 1);
    setTimeout(() => setRedClickCount(0), 500); // Reset after 500ms

    if (redClickCount === 2) {
      // Third click (0-indexed)
      setIsInteractive(true);
      setTerminalOutput(['ℹ Terminal activated!', '']);
    }
  };

  // Triple-click detection for green dot (expand to dialog)
  const handleGreenDotClick = () => {
    setGreenClickCount((prev) => prev + 1);
    setTimeout(() => setGreenClickCount(0), 500); // Reset after 500ms

    if (greenClickCount === 2) {
      // Third click (0-indexed)
      setIsDialogOpen(true);
      if (!isInteractive) {
        setIsInteractive(true);
        setTerminalOutput([
          '✔ Terminal expanded! Welcome to fullscreen mode.',
          'ℹ Type "help" for available commands.',
          '',
        ]);
      }
    }
  };

  // Command parsing and execution
  const executeCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    const prompt = 'shravan_revanna@portfolio:~$';

    // Add command to history and track it
    if (cmd && !commandHistory.includes(cmd)) {
      setCommandHistory((prev) => [...prev, cmd]);
      await trackCommand(command);
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
          '  clear     - Clear terminal screen',
          '  whoami    - Display user info',
          '  about     - About this portfolio',
          '  projects  - List recent projects',
          '  contact   - Contact information',
          '  skills    - Technical skills',
          '  ls        - List directory contents',
          '  pwd       - Print working directory',
          '  cat       - Display file contents',
          '  exit      - Exit interactive mode',
          '  expand    - Expand terminal to fullscreen',
          // '',
          // 'ℹ Pro tips:',
          // '  • Use Tab for command completion',
          // '  • Use ↑/↓ arrows for command history',
          // '  • Try some classic Unix commands for fun!',
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
        setTerminalOutput((prev) => [
          ...prev,
          portfolioData.personal.bio,
          `Current Role: SE Intern at udaanCapital`,
          `Projects Shipped: 150+`,
          `Passionate about: AI, Full-Stack Development, Automation`,
          '',
        ]);
        break;

      case 'cat contact.info':
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

      case 'visit projects':
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

      <div className="container mx-auto px-2 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
        <div className="text-center space-y-8">
          {/* Terminal Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card/70 backdrop-blur-sm border border-primary/20 rounded-lg p-3 sm:p-6 font-mono text-left max-w-2xl mx-auto shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:border-primary/40 hover:bg-card/80"
          >
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-primary/30">
              {/* Red Dot - Close/Activate */}
              <div
                className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-all cursor-pointer group relative flex items-center justify-center"
                onClick={handleRedDotClick}
                title={
                  isInteractive ? 'Interactive mode active' : 'Triple-click to activate terminal'
                }
              >
                <X className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-900" />
              </div>

              {/* Yellow Dot - Minimize */}
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-all cursor-pointer group relative flex items-center justify-center">
                <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity text-yellow-900" />
              </div>

              {/* Green Dot - Expand */}
              <div
                className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-all cursor-pointer group relative flex items-center justify-center"
                onClick={handleGreenDotClick}
                title="Triple-click to expand terminal"
              >
                <Square className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity text-green-900" />
              </div>

              <span className="ml-2 text-xs text-primary">
                terminal {isInteractive && <span className="text-green-400">• interactive</span>}
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
                    Currently SDE Intern @{' '}
                    <a
                      href="https://udaancapital.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                    >
                      udaanCapital
                    </a>{' '}
                    | Deep-tech automation specialist
                  </motion.div>
                </>
              ) : (
                // Interactive terminal
                <TerminalInterface
                  terminalOutput={terminalOutput}
                  currentInput={currentInput}
                  setCurrentInput={setCurrentInput}
                  handleTerminalKeyDown={handleTerminalKeyDown}
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
            <Button
              size="lg"
              onClick={() => scrollToSection('#projects')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3"
              trackingCategory="navigation"
              trackingId="view_projects"
              trackingAction="click_hero_cta"
              trackingContext={{
                section: 'hero',
                metadata: { ctaType: 'primary', destination: 'projects' }
              }}
            >
              <Terminal className="mr-2 h-4 w-4" />
              view projects
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(portfolioData.writing.blog_url, '_blank')}
              className="px-6 py-3 border-primary/20 hover:bg-primary/5"
              trackingCategory="navigation"
              trackingId="read_blog"
              trackingAction="click_hero_cta"
              trackingContext={{
                section: 'hero',
                url: portfolioData.writing.blog_url,
                metadata: { ctaType: 'secondary', destination: 'blog' }
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              read blog
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(portfolioData.social.github, '_blank')}
              className="px-6 py-3 border-primary/20 hover:bg-primary/5"
              trackingCategory="social"
              trackingId="github"
              trackingAction="click_hero_cta"
              trackingContext={{
                section: 'hero',
                url: portfolioData.social.github,
                metadata: { ctaType: 'secondary', destination: 'github' }
              }}
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
              onClick={() => window.open(`/${portfolioData.personal.resumeFile}`, '_blank')}
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
          trackingCategory="navigation"
          trackingId="scroll_indicator"
          trackingAction="click_scroll_down"
          trackingContext={{
            section: 'hero',
            metadata: { source: 'scroll_indicator', destination: 'projects' }
          }}
        >
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
        </Button>
      </motion.div>
    </section>
  );
}
