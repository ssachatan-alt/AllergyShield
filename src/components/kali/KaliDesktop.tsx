"use client";

import React, { useState, useEffect, useRef } from "react";
import { WindowItem, AppType, VirtualFileSystem } from "@/types/kali";
import { INITIAL_FILESYSTEM } from "@/lib/kali-fs";
import { KaliTerminal } from "./KaliTerminal";
import { KaliCodeEditor } from "./KaliCodeEditor";
import { KaliNetworkMap } from "./KaliNetworkMap";
import { KaliFileManager } from "./KaliFileManager";
import {
  Terminal as TerminalIcon,
  Code as CodeIcon,
  Globe,
  HardDrive,
  Trash2,
  Maximize2,
  Minimize2,
  X,
  Minus,
  Square,
  Wifi,
  Volume2,
  BatteryCharging,
  Clock,
  Search,
  Settings,
  Shield,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Folder,
  Radio,
  Power,
  RotateCcw,
} from "lucide-react";

// Official Kali Dragon SVG Motif
function KaliDragonLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 5 C25.1 5 5 25.1 5 50 C5 74.9 25.1 95 50 95 C74.9 95 95 74.9 95 50 C95 25.1 74.9 5 50 5 Z M76.2 38.8 C74.8 45.2 70.3 50.4 65.5 54.1 C61.2 57.4 56.1 60.1 51.5 63.2 C47.2 66.1 43.1 69.8 40.2 74.5 C38.5 77.3 37.1 80.5 35.2 83.2 C34.5 84.1 33.1 84.8 32.2 84.2 C31.2 83.4 31.8 81.8 32.2 80.8 C34.4 75.3 38.1 70.6 42.1 66.5 C46.2 62.3 51.1 58.8 55.8 55.2 C59.8 52.1 63.8 48.7 66.8 44.4 C69.1 41.1 70.5 37.1 70.2 33.1 C69.9 29.8 68.1 26.8 65.4 24.9 C62.1 22.5 57.8 22.1 54.1 23.3 C48.5 25.2 44.5 30.1 42.1 35.4 C40.1 39.8 39.5 44.7 39.1 49.5 C38.7 54.5 37.9 59.5 35.8 64.1 C34.8 66.3 33.3 68.4 31.5 70.0 C30.2 71.1 28.5 71.8 26.9 71.1 C25.5 70.5 25.1 68.7 25.4 67.3 C26.6 61.8 29.8 56.9 31.8 51.6 C33.9 46.1 34.5 40.1 36.8 34.8 C39.8 28.1 45.5 22.4 52.6 19.8 C58.2 17.7 64.7 18.2 69.8 21.6 C74.2 24.5 77.1 29.4 77.5 34.7 C77.6 36.1 77.2 37.5 76.2 38.8 Z" />
    </svg>
  );
}

// Background Wallpapers
const WALLPAPERS = [
  { id: "dragon-cyber", name: "Kali Dragon Cyber Glow", style: "from-[#080d1a] via-[#0c1424] to-[#04060a]" },
  { id: "dark-obsidian", name: "Obsidian Stealth", style: "from-[#090b10] via-[#12151d] to-[#050608]" },
  { id: "midnight-neon", name: "Midnight Neon Blue", style: "from-[#030d22] via-[#091838] to-[#020712]" },
  { id: "carbon-matrix", name: "Carbon Grid", style: "from-[#0c0f17] via-[#151926] to-[#080a0f]" },
];

export function KaliDesktop() {
  const [vfs, setVfs] = useState<VirtualFileSystem>(INITIAL_FILESYSTEM);
  const [windows, setWindows] = useState<WindowItem[]>([
    {
      id: "win-terminal",
      title: "qterminal — kali@kali-desktop: ~",
      appType: "terminal",
      icon: "terminal",
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      position: { x: 40, y: 50 },
      size: { width: 720, height: 450 },
    },
    {
      id: "win-editor",
      title: "Mousepad — /home/kali/scripts/port_scanner.py",
      appType: "editor",
      icon: "editor",
      isMinimized: false,
      isMaximized: false,
      zIndex: 9,
      position: { x: 380, y: 110 },
      size: { width: 780, height: 480 },
      activeFilePath: "/home/kali/scripts/port_scanner.py",
    },
  ]);

  const [activeWindowId, setActiveWindowId] = useState<string>("win-terminal");
  const [maxZIndex, setMaxZIndex] = useState<number>(11);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(1);
  const [currentTime, setCurrentTime] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeWallpaper, setActiveWallpaper] = useState(WALLPAPERS[0]);
  const [searchMenuQuery, setSearchMenuQuery] = useState("");
  const [pendingTerminalCommand, setPendingTerminalCommand] = useState<string | undefined>(undefined);

  // Dragging and Resizing State
  const [draggingWindowId, setDraggingWindowId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingWindowId, setResizingWindowId] = useState<string | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

  const desktopRef = useRef<HTMLDivElement>(null);

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for real fullscreen change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Focus Window (Bring to Front)
  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setMaxZIndex((prev) => prev + 1);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: maxZIndex + 1, isMinimized: false } : w))
    );
  };

  // Open / Launch Application
  const openApp = (
    appType: AppType,
    title?: string,
    extraData?: { activeFilePath?: string; initialCommand?: string }
  ) => {
    setIsStartMenuOpen(false);

    // If already exists and minimized, restore and focus
    const existing = windows.find((w) => w.appType === appType);
    if (existing) {
      focusWindow(existing.id);
      if (extraData?.activeFilePath) {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === existing.id
              ? {
                  ...w,
                  isMinimized: false,
                  activeFilePath: extraData.activeFilePath,
                  title: `Mousepad — ${extraData.activeFilePath}`,
                }
              : w
          )
        );
      }
      if (extraData?.initialCommand) {
        setPendingTerminalCommand(extraData.initialCommand);
      }
      return;
    }

    // Otherwise create new window
    const newId = `win-${appType}-${Date.now()}`;
    const defaultTitles: Record<AppType, string> = {
      terminal: "qterminal — kali@kali-desktop: ~",
      editor: `Mousepad — ${extraData?.activeFilePath || "/home/kali/scripts/port_scanner.py"}`,
      zenmap: "Zenmap — Network Topology Visualizer & Port Scanner",
      thunar: "Thunar File Manager — /home/kali",
      help: "Kali Linux Manual & Documentation",
      settings: "Kali Desktop Settings",
    };

    const newWindow: WindowItem = {
      id: newId,
      title: title || defaultTitles[appType],
      appType,
      icon: appType,
      isMinimized: false,
      isMaximized: false,
      zIndex: maxZIndex + 1,
      position: { x: 80 + (windows.length % 5) * 40, y: 70 + (windows.length % 5) * 35 },
      size:
        appType === "terminal"
          ? { width: 720, height: 460 }
          : appType === "editor"
          ? { width: 800, height: 500 }
          : appType === "zenmap"
          ? { width: 860, height: 520 }
          : { width: 750, height: 480 },
      activeFilePath: extraData?.activeFilePath,
      initialCommand: extraData?.initialCommand,
    };

    setMaxZIndex((prev) => prev + 1);
    setWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(newId);
  };

  // Close window
  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  };

  // Minimize window
  const minimizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
  };

  // Maximize / Restore window
  const toggleMaximizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.isMaximized) {
          // Restore
          return {
            ...w,
            isMaximized: false,
            position: w.prevPosition || { x: 60, y: 60 },
            size: w.prevSize || { width: 700, height: 450 },
          };
        } else {
          // Maximize to full desktop (under top panel)
          return {
            ...w,
            isMaximized: true,
            prevPosition: w.position,
            prevSize: w.size,
            position: { x: 0, y: 32 }, // below 32px top bar
            size: {
              width: typeof window !== "undefined" ? window.innerWidth : 1200,
              height: typeof window !== "undefined" ? window.innerHeight - 32 : 800,
            },
          };
        }
      })
    );
  };

  // Start dragging
  const handleMouseDownTitleBar = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const win = windows.find((w) => w.id === id);
    if (!win || win.isMaximized) return;

    focusWindow(id);
    setDraggingWindowId(id);
    setDragOffset({
      x: e.clientX - win.position.x,
      y: e.clientY - win.position.y,
    });
  };

  // Start resizing
  const handleMouseDownResize = (e: React.MouseEvent, id: string, direction: string) => {
    e.stopPropagation();
    const win = windows.find((w) => w.id === id);
    if (!win || win.isMaximized) return;

    focusWindow(id);
    setResizingWindowId(id);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: win.size.width,
      height: win.size.height,
      posX: win.position.x,
      posY: win.position.y,
    });
  };

  // Mouse Move listener for drag & resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingWindowId) {
        setWindows((prev) =>
          prev.map((w) => {
            if (w.id !== draggingWindowId) return w;
            const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
            const newY = Math.max(32, Math.min(window.innerHeight - 50, e.clientY - dragOffset.y));
            return {
              ...w,
              position: { x: newX, y: newY },
            };
          })
        );
      }

      if (resizingWindowId && resizeDirection) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        setWindows((prev) =>
          prev.map((w) => {
            if (w.id !== resizingWindowId) return w;

            let newWidth = resizeStart.width;
            let newHeight = resizeStart.height;
            let newX = resizeStart.posX;
            let newY = resizeStart.posY;

            if (resizeDirection.includes("e")) {
              newWidth = Math.max(360, resizeStart.width + deltaX);
            }
            if (resizeDirection.includes("s")) {
              newHeight = Math.max(220, resizeStart.height + deltaY);
            }
            if (resizeDirection.includes("w")) {
              const proposedWidth = resizeStart.width - deltaX;
              if (proposedWidth >= 360) {
                newWidth = proposedWidth;
                newX = resizeStart.posX + deltaX;
              }
            }
            if (resizeDirection.includes("n")) {
              const proposedHeight = resizeStart.height - deltaY;
              if (proposedHeight >= 220) {
                newHeight = proposedHeight;
                newY = resizeStart.posY + deltaY;
              }
            }

            return {
              ...w,
              position: { x: newX, y: newY },
              size: { width: newWidth, height: newHeight },
            };
          })
        );
      }
    };

    const handleMouseUp = () => {
      setDraggingWindowId(null);
      setResizingWindowId(null);
      setResizeDirection(null);
    };

    if (draggingWindowId || resizingWindowId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingWindowId, resizingWindowId, dragOffset, resizeDirection, resizeStart]);

  // Run script callback from editor: pipes into terminal
  const handleRunScriptFromEditor = (filePath: string, fileContent: string) => {
    const isPython = filePath.endsWith(".py");
    const cmd = isPython ? `python3 ${filePath}` : `bash ${filePath}`;

    // Open terminal and run command
    openApp("terminal", undefined, { initialCommand: cmd });
  };

  // Open file in code editor
  const handleOpenFileInEditor = (filePath: string) => {
    openApp("editor", undefined, { activeFilePath: filePath });
  };

  // Open directory in terminal
  const handleOpenDirInTerminal = (dirPath: string) => {
    openApp("terminal", undefined, { initialCommand: `cd ${dirPath}` });
  };

  // Scan in terminal from Zenmap
  const handleScanInTerminal = (cmd: string) => {
    openApp("terminal", undefined, { initialCommand: cmd });
  };

  return (
    <div
      ref={desktopRef}
      className={`relative w-screen h-screen overflow-hidden select-none bg-gradient-to-br ${activeWallpaper.style} text-slate-100 font-sans`}
      onClick={() => {
        if (isStartMenuOpen) setIsStartMenuOpen(false);
      }}
    >
      {/* =========================================================================
          BACKGROUND WALLPAPER & KALI EMBLEM
      ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Cyber Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Ambient Radial Glow */}
        <div className="absolute w-[800px] h-[800px] rounded-full bg-cyan-600/10 blur-[140px] pointer-events-none"></div>
        <div className="absolute w-[450px] h-[450px] rounded-full bg-blue-600/15 blur-[100px] pointer-events-none"></div>

        {/* Huge Official Kali Dragon Watermark */}
        <div className="relative opacity-[0.14] text-cyan-400 transform scale-125 transition-transform duration-1000">
          <KaliDragonLogo className="w-[580px] h-[580px] filter drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]" />
        </div>
      </div>

      {/* =========================================================================
          TOP PANEL / TASKBAR (XFCE / Kali Classic Top Bar)
      ========================================================================= */}
      <header className="absolute top-0 left-0 right-0 h-8 bg-[#0b0e14]/95 backdrop-blur-md border-b border-[#1b2233] z-50 flex items-center justify-between px-2 text-xs select-none">
        {/* Left Side: Kali Dragon Button + Quick Launchers + Active Windows */}
        <div className="flex items-center space-x-1.5 h-full">
          {/* Kali Whisker Start Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsStartMenuOpen(!isStartMenuOpen);
            }}
            className={`h-6.5 px-2.5 rounded flex items-center space-x-1.5 transition-all ${
              isStartMenuOpen
                ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30"
                : "hover:bg-[#1c2438] text-cyan-400"
            }`}
            title="Applications Menu"
          >
            <KaliDragonLogo className="w-4 h-4" />
            <span className="font-bold text-[11px] tracking-wide text-white">Kali</span>
          </button>

          {/* Quick Launch Icons */}
          <div className="flex items-center space-x-0.5 border-r border-[#20273a] pr-1.5">
            <button
              onClick={() => openApp("terminal")}
              className="p-1 rounded hover:bg-[#1a2030] text-slate-300 hover:text-cyan-400 transition-colors"
              title="Terminal Emulator"
            >
              <TerminalIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openApp("editor")}
              className="p-1 rounded hover:bg-[#1a2030] text-slate-300 hover:text-emerald-400 transition-colors"
              title="Code & Script Editor"
            >
              <CodeIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openApp("thunar")}
              className="p-1 rounded hover:bg-[#1a2030] text-slate-300 hover:text-yellow-400 transition-colors"
              title="File Manager"
            >
              <Folder className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openApp("zenmap")}
              className="p-1 rounded hover:bg-[#1a2030] text-slate-300 hover:text-purple-400 transition-colors"
              title="Zenmap Network Topology"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Running Windows Taskbar Tabs */}
          <div className="flex items-center space-x-1 max-w-[400px] overflow-x-auto no-scrollbar">
            {windows.map((win) => {
              const isActive = activeWindowId === win.id && !win.isMinimized;
              return (
                <button
                  key={win.id}
                  onClick={() => {
                    if (win.isMinimized) {
                      focusWindow(win.id);
                    } else if (activeWindowId === win.id) {
                      minimizeWindow(win.id);
                    } else {
                      focusWindow(win.id);
                    }
                  }}
                  className={`h-6 px-2.5 rounded flex items-center space-x-1.5 text-[11px] max-w-[140px] truncate transition-colors border ${
                    isActive
                      ? "bg-[#162033] border-cyan-500/50 text-cyan-300 font-medium"
                      : win.isMinimized
                      ? "bg-[#0f131c] border-transparent text-slate-500 hover:bg-[#161c2b]"
                      : "bg-[#111624] border-transparent text-slate-300 hover:bg-[#192136]"
                  }`}
                >
                  {win.appType === "terminal" ? (
                    <TerminalIcon className="w-3 h-3 text-cyan-400 shrink-0" />
                  ) : win.appType === "editor" ? (
                    <CodeIcon className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : win.appType === "zenmap" ? (
                    <Globe className="w-3 h-3 text-purple-400 shrink-0" />
                  ) : (
                    <Folder className="w-3 h-3 text-yellow-400 shrink-0" />
                  )}
                  <span className="truncate">{win.title.split("—")[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center / Right: Workspace Switcher + Indicators + Fullscreen + Clock */}
        <div className="flex items-center space-x-2 text-slate-300">
          {/* Workspace Switcher [1] [2] [3] [4] */}
          <div className="flex items-center bg-[#0d111a] border border-[#1e2538] rounded p-0.5 space-x-0.5">
            {[1, 2, 3, 4].map((ws) => (
              <button
                key={ws}
                onClick={() => setActiveWorkspace(ws)}
                className={`w-4.5 h-4.5 rounded text-[10px] font-bold transition-colors ${
                  activeWorkspace === ws
                    ? "bg-cyan-500 text-black"
                    : "text-slate-400 hover:text-white hover:bg-[#1b2234]"
                }`}
              >
                {ws}
              </button>
            ))}
          </div>

          {/* Network Indicator */}
          <div className="flex items-center space-x-1 px-1.5 py-1 rounded hover:bg-[#1a2030] cursor-pointer" title="eth0: 192.168.1.137 Connected">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          {/* Audio Volume */}
          <div className="flex items-center space-x-1 px-1.5 py-1 rounded hover:bg-[#1a2030] cursor-pointer" title="Volume: 85%">
            <Volume2 className="w-3.5 h-3.5 text-slate-300" />
          </div>

          {/* Battery */}
          <div className="flex items-center space-x-1 px-1.5 py-1 rounded hover:bg-[#1a2030] cursor-pointer" title="Battery: 100% (AC Powered)">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          {/* REAL BROWSER FULLSCREEN TOGGLE (F11 / HTML5 Fullscreen API) */}
          <button
            onClick={toggleFullscreen}
            className={`px-2 py-1 rounded flex items-center space-x-1 transition-all ${
              isFullscreen
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                : "hover:bg-[#1a2030] text-slate-300"
            }`}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Browser Fullscreen (F11)"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
            )}
            <span className="text-[11px] font-medium hidden sm:inline">
              {isFullscreen ? "Exit" : "Fullscreen"}
            </span>
          </button>

          {/* Live Date / Clock */}
          <div className="px-2 py-0.5 font-mono text-[11px] text-slate-200 bg-[#0e121a] border border-[#1b2233] rounded flex items-center space-x-1.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{currentTime || "Sun Oct 11, 02:30"}</span>
          </div>

          {/* User Session Profile Button */}
          <button
            onClick={() => {
              if (confirm("Log out of current Kali session?")) {
                setWindows([]);
              }
            }}
            className="p-1 rounded hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
            title="Session / Shutdown"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          APPLICATION LAUNCHER POPUP (Whisker Menu)
      ========================================================================= */}
      {isStartMenuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-9 left-2 w-80 sm:w-96 bg-[#0f1420]/95 backdrop-blur-xl border border-[#222c42] rounded-xl shadow-2xl z-50 flex flex-col text-xs overflow-hidden animate-in fade-in duration-150"
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-[#20293d] bg-[#0c101a]/90 flex items-center space-x-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <input
              type="text"
              placeholder="Search tools & applications..."
              value={searchMenuQuery}
              onChange={(e) => setSearchMenuQuery(e.target.value)}
              autoFocus
              className="bg-transparent text-slate-100 text-xs outline-none flex-1 placeholder:text-slate-500"
            />
          </div>

          {/* Application Menu Grid / Categories */}
          <div className="p-3 grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto">
            {/* Terminal */}
            <button
              onClick={() => openApp("terminal")}
              className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] hover:border-cyan-500/50 border border-[#202a40] text-left transition-all group"
            >
              <div className="p-2 rounded-md bg-cyan-950/70 text-cyan-400 border border-cyan-500/30">
                <TerminalIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-100 group-hover:text-cyan-300">Terminal</div>
                <div className="text-[10px] text-slate-400">qterminal emulator</div>
              </div>
            </button>

            {/* Code / Script Editor */}
            <button
              onClick={() => openApp("editor")}
              className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] hover:border-emerald-500/50 border border-[#202a40] text-left transition-all group"
            >
              <div className="p-2 rounded-md bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
                <CodeIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-100 group-hover:text-emerald-300">Code Editor</div>
                <div className="text-[10px] text-slate-400">Mousepad / IDE</div>
              </div>
            </button>

            {/* Zenmap Network Map */}
            <button
              onClick={() => openApp("zenmap")}
              className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] hover:border-purple-500/50 border border-[#202a40] text-left transition-all group"
            >
              <div className="p-2 rounded-md bg-purple-950/70 text-purple-400 border border-purple-500/30">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-100 group-hover:text-purple-300">Zenmap</div>
                <div className="text-[10px] text-slate-400">Network Topology</div>
              </div>
            </button>

            {/* File Manager */}
            <button
              onClick={() => openApp("thunar")}
              className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] hover:border-yellow-500/50 border border-[#202a40] text-left transition-all group"
            >
              <div className="p-2 rounded-md bg-yellow-950/70 text-yellow-400 border border-yellow-500/30">
                <Folder className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-100 group-hover:text-yellow-300">File Manager</div>
                <div className="text-[10px] text-slate-400">Thunar Places</div>
              </div>
            </button>

            {/* Simulated Tool: Nmap Port Scanner */}
            <button
              onClick={() => openApp("terminal", undefined, { initialCommand: "nmap 192.168.1.105" })}
              className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] border border-[#202a40] text-left transition-all group"
            >
              <div className="p-2 rounded-md bg-blue-950/70 text-blue-400 border border-blue-500/30">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-100 group-hover:text-blue-300">Nmap Scanner</div>
                <div className="text-[10px] text-slate-400">SYN Port Recon</div>
              </div>
            </button>

            {/* Simulated Tool: Hydra Cracker */}
            <button
              onClick={() => openApp("terminal", undefined, { initialCommand: "hydra -l admin -P /home/kali/Documents/passwords_top20.txt ssh://192.168.1.105" })}
              className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] border border-[#202a40] text-left transition-all group"
            >
              <div className="p-2 rounded-md bg-red-950/70 text-red-400 border border-red-500/30">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-100 group-hover:text-red-300">THC-Hydra</div>
                <div className="text-[10px] text-slate-400">Login Cracker</div>
              </div>
            </button>

            {/* Simulated Tool: Wifi Deauth */}
            <button
              onClick={() => openApp("terminal", undefined, { initialCommand: "bash /home/kali/scripts/wifi_deauth.sh" })}
              className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] border border-[#202a40] text-left transition-all group"
            >
              <div className="p-2 rounded-md bg-teal-950/70 text-teal-400 border border-teal-500/30">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-100 group-hover:text-teal-300">Aircrack / Deauth</div>
                <div className="text-[10px] text-slate-400">802.11 Injection</div>
              </div>
            </button>

            {/* Neofetch */}
            <button
              onClick={() => openApp("terminal", undefined, { initialCommand: "neofetch" })}
              className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] border border-[#202a40] text-left transition-all group"
            >
              <div className="p-2 rounded-md bg-amber-950/70 text-amber-400 border border-amber-500/30">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-100 group-hover:text-amber-300">Neofetch</div>
                <div className="text-[10px] text-slate-400">System Specs</div>
              </div>
            </button>
          </div>

          {/* Bottom Menu Bar */}
          <div className="p-2.5 bg-[#0a0d14] border-t border-[#1d2536] flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-slate-300">kali@kali-rolling</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const nextIdx = (WALLPAPERS.indexOf(activeWallpaper) + 1) % WALLPAPERS.length;
                  setActiveWallpaper(WALLPAPERS[nextIdx]);
                }}
                className="hover:text-cyan-400 flex items-center space-x-1"
                title="Cycle Wallpaper Theme"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Theme</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DESKTOP ICONS GRID (Left Side)
      ========================================================================= */}
      <div className="absolute top-12 left-4 z-10 flex flex-col space-y-5">
        {/* File System */}
        <div
          onDoubleClick={() => openApp("thunar")}
          className="w-20 flex flex-col items-center group cursor-pointer p-1.5 rounded-lg hover:bg-cyan-500/10 hover:border hover:border-cyan-500/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#141c2b]/90 border border-[#263550] flex items-center justify-center text-slate-200 group-hover:text-cyan-400 group-hover:scale-105 transition-all shadow-md">
            <HardDrive className="w-6 h-6 text-sky-400" />
          </div>
          <span className="text-[11px] font-medium text-slate-200 text-center mt-1 drop-shadow-md group-hover:text-cyan-300">
            File System
          </span>
        </div>

        {/* Terminal */}
        <div
          onDoubleClick={() => openApp("terminal")}
          className="w-20 flex flex-col items-center group cursor-pointer p-1.5 rounded-lg hover:bg-cyan-500/10 hover:border hover:border-cyan-500/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#141c2b]/90 border border-[#263550] flex items-center justify-center text-slate-200 group-hover:text-cyan-400 group-hover:scale-105 transition-all shadow-md">
            <TerminalIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-[11px] font-medium text-slate-200 text-center mt-1 drop-shadow-md group-hover:text-cyan-300">
            Terminal
          </span>
        </div>

        {/* Code / Script Editor */}
        <div
          onDoubleClick={() => openApp("editor")}
          className="w-20 flex flex-col items-center group cursor-pointer p-1.5 rounded-lg hover:bg-cyan-500/10 hover:border hover:border-cyan-500/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#141c2b]/90 border border-[#263550] flex items-center justify-center text-slate-200 group-hover:text-emerald-400 group-hover:scale-105 transition-all shadow-md">
            <CodeIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-[11px] font-medium text-slate-200 text-center mt-1 drop-shadow-md group-hover:text-emerald-300">
            Code Editor
          </span>
        </div>

        {/* Network Map (Zenmap) */}
        <div
          onDoubleClick={() => openApp("zenmap")}
          className="w-20 flex flex-col items-center group cursor-pointer p-1.5 rounded-lg hover:bg-cyan-500/10 hover:border hover:border-cyan-500/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#141c2b]/90 border border-[#263550] flex items-center justify-center text-slate-200 group-hover:text-purple-400 group-hover:scale-105 transition-all shadow-md">
            <Globe className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-[11px] font-medium text-slate-200 text-center mt-1 drop-shadow-md group-hover:text-purple-300">
            Network Map
          </span>
        </div>

        {/* Trash */}
        <div
          onDoubleClick={() => alert("Trash is currently empty.")}
          className="w-20 flex flex-col items-center group cursor-pointer p-1.5 rounded-lg hover:bg-cyan-500/10 hover:border hover:border-cyan-500/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#141c2b]/90 border border-[#263550] flex items-center justify-center text-slate-200 group-hover:text-rose-400 group-hover:scale-105 transition-all shadow-md">
            <Trash2 className="w-6 h-6 text-rose-400" />
          </div>
          <span className="text-[11px] font-medium text-slate-200 text-center mt-1 drop-shadow-md group-hover:text-rose-300">
            Trash
          </span>
        </div>
      </div>

      {/* =========================================================================
          FLOATING, DRAGGABLE & RESIZABLE WINDOW MANAGER
      ========================================================================= */}
      {windows.map((win) => {
        if (win.isMinimized) return null;
        const isActive = activeWindowId === win.id;

        return (
          <div
            key={win.id}
            onMouseDown={() => focusWindow(win.id)}
            style={{
              position: "absolute",
              left: win.position.x,
              top: win.position.y,
              width: win.size.width,
              height: win.size.height,
              zIndex: win.zIndex,
            }}
            className={`flex flex-col rounded-lg overflow-hidden border shadow-2xl transition-shadow ${
              isActive
                ? "border-cyan-500/70 shadow-[0_12px_45px_rgba(0,0,0,0.85)] ring-1 ring-cyan-500/30"
                : "border-[#263045] shadow-[0_8px_30px_rgba(0,0,0,0.7)] opacity-95"
            }`}
          >
            {/* Window Header Titlebar (Draggable Handle) */}
            <div
              onMouseDown={(e) => handleMouseDownTitleBar(e, win.id)}
              onDoubleClick={() => toggleMaximizeWindow(win.id)}
              className={`h-8 px-3 flex items-center justify-between text-xs select-none cursor-move ${
                isActive
                  ? "bg-[#161c28] border-b border-[#242e44] text-slate-100"
                  : "bg-[#10141f] border-b border-[#1c2438] text-slate-400"
              }`}
            >
              {/* Window Icon & Title */}
              <div className="flex items-center space-x-2 truncate">
                {win.appType === "terminal" ? (
                  <TerminalIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ) : win.appType === "editor" ? (
                  <CodeIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : win.appType === "zenmap" ? (
                  <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                )}
                <span className="font-semibold text-[11px] truncate">{win.title}</span>
              </div>

              {/* Window Controls: Minimize, Maximize, Close */}
              <div className="flex items-center space-x-1 shrink-0">
                {/* Minimize */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    minimizeWindow(win.id);
                  }}
                  className="w-5 h-5 rounded hover:bg-[#28354f] flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors"
                  title="Minimize"
                >
                  <Minus className="w-3 h-3" />
                </button>

                {/* Maximize / Restore */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMaximizeWindow(win.id);
                  }}
                  className="w-5 h-5 rounded hover:bg-[#28354f] flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors"
                  title={win.isMaximized ? "Restore Window" : "Maximize Window"}
                >
                  <Square className="w-2.5 h-2.5" />
                </button>

                {/* Close */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(win.id);
                  }}
                  className="w-5 h-5 rounded hover:bg-red-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  title="Close Window"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Window Content Body */}
            <div className="flex-1 overflow-hidden relative">
              {win.appType === "terminal" && (
                <KaliTerminal
                  vfs={vfs}
                  setVfs={setVfs}
                  onOpenFileInEditor={handleOpenFileInEditor}
                  initialCommand={pendingTerminalCommand || win.initialCommand}
                />
              )}

              {win.appType === "editor" && (
                <KaliCodeEditor
                  vfs={vfs}
                  setVfs={setVfs}
                  activeFilePath={win.activeFilePath}
                  onRunScript={handleRunScriptFromEditor}
                />
              )}

              {win.appType === "zenmap" && (
                <KaliNetworkMap onScanInTerminal={handleScanInTerminal} />
              )}

              {win.appType === "thunar" && (
                <KaliFileManager
                  vfs={vfs}
                  setVfs={setVfs}
                  onOpenFileInEditor={handleOpenFileInEditor}
                  onOpenDirectoryInTerminal={handleOpenDirInTerminal}
                />
              )}
            </div>

            {/* Resizing Edge Handles (Only active if not maximized) */}
            {!win.isMaximized && (
              <>
                <div
                  onMouseDown={(e) => handleMouseDownResize(e, win.id, "e")}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize"
                />
                <div
                  onMouseDown={(e) => handleMouseDownResize(e, win.id, "s")}
                  className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize"
                />
                <div
                  onMouseDown={(e) => handleMouseDownResize(e, win.id, "se")}
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                />
                <div
                  onMouseDown={(e) => handleMouseDownResize(e, win.id, "w")}
                  className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize"
                />
                <div
                  onMouseDown={(e) => handleMouseDownResize(e, win.id, "sw")}
                  className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
