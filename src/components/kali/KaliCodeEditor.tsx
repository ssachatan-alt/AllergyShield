"use client";

import React, { useState, useEffect, useRef } from "react";
import { VirtualFileSystem, VirtualFile } from "@/types/kali";
import { getFile, writeFile, listDirectory, normalizePath } from "@/lib/kali-fs";
import {
  FileText,
  Play,
  Save,
  Plus,
  Folder,
  FileCode,
  FileSpreadsheet,
  Check,
  RotateCw,
  FolderPlus,
  Terminal,
} from "lucide-react";

interface KaliCodeEditorProps {
  vfs: VirtualFileSystem;
  setVfs: React.Dispatch<React.SetStateAction<VirtualFileSystem>>;
  activeFilePath?: string;
  onRunScript?: (filePath: string, fileContent: string) => void;
}

export function KaliCodeEditor({
  vfs,
  setVfs,
  activeFilePath = "/home/kali/scripts/port_scanner.py",
  onRunScript,
}: KaliCodeEditorProps) {
  // Open tabs list
  const [openTabs, setOpenTabs] = useState<string[]>([
    "/home/kali/scripts/port_scanner.py",
    "/home/kali/scripts/wifi_deauth.sh",
  ]);
  const [currentFile, setCurrentFile] = useState<string>(activeFilePath);
  const [editorContent, setEditorContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // When activeFilePath prop changes from outside (e.g. terminal nano or desktop double click)
  useEffect(() => {
    if (activeFilePath) {
      if (!openTabs.includes(activeFilePath)) {
        setOpenTabs((prev) => [...prev, activeFilePath]);
      }
      setCurrentFile(activeFilePath);
    }
  }, [activeFilePath]);

  // Load content whenever currentFile changes
  useEffect(() => {
    const f = getFile(vfs, currentFile);
    if (f && !f.isDir) {
      setEditorContent(f.content || "");
    } else {
      setEditorContent("");
    }
    setIsDirty(false);
  }, [currentFile, vfs]);

  const handleSave = () => {
    const res = writeFile(vfs, currentFile, editorContent);
    if (res.success) {
      setVfs(res.vfs);
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleCreateNewFile = () => {
    const name = prompt("Enter new file path (e.g., /home/kali/scripts/exploit.py):", "/home/kali/scripts/new_script.py");
    if (!name) return;
    const norm = normalizePath(name);
    const res = writeFile(vfs, norm, "#!/usr/bin/env python3\n# New script\n\nprint('Script initialized')\n");
    if (res.success) {
      setVfs(res.vfs);
      if (!openTabs.includes(norm)) {
        setOpenTabs((prev) => [...prev, norm]);
      }
      setCurrentFile(norm);
    }
  };

  const handleTabClose = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const remaining = openTabs.filter((t) => t !== path);
    setOpenTabs(remaining);
    if (currentFile === path) {
      if (remaining.length > 0) {
        setCurrentFile(remaining[0]);
      } else {
        setCurrentFile("");
        setEditorContent("");
      }
    }
  };

  const handleSelectFile = (path: string) => {
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => [...prev, path]);
    }
    setCurrentFile(path);
  };

  // Keyboard shortcut Ctrl+S
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
      return;
    }

    // Support Tab key indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = "    ";

      const updated = editorContent.substring(0, start) + spaces + editorContent.substring(end);
      setEditorContent(updated);
      setIsDirty(true);

      // Restore cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Update cursor line and col
  const handleKeyUpOrClick = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const textBefore = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBefore.split("\n");
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    setCursorPos({ line: currentLine, col: currentCol });
  };

  const handleRun = () => {
    // If dirty, save first
    if (isDirty) {
      handleSave();
    }
    if (onRunScript && currentFile) {
      onRunScript(currentFile, editorContent);
    }
  };

  // Line numbering calculation
  const lineCount = Math.max(1, editorContent.split("\n").length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // File explorer quick files
  const scriptEntries = listDirectory(vfs, "/home/kali/scripts");
  const docEntries = listDirectory(vfs, "/home/kali/Documents");
  const desktopEntries = listDirectory(vfs, "/home/kali/Desktop");

  const getFileIcon = (file: VirtualFile) => {
    if (file.type === "python") return <FileCode className="w-3.5 h-3.5 text-yellow-400" />;
    if (file.type === "bash") return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
    if (file.type === "markdown") return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    return <FileText className="w-3.5 h-3.5 text-slate-400" />;
  };

  const fileName = currentFile.split("/").pop() || "untitled";
  const ext = fileName.split(".").pop() || "txt";

  return (
    <div className="w-full h-full bg-[#181824] text-slate-200 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Action Bar */}
      <div className="h-10 bg-[#12121a] border-b border-[#282838] px-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="px-2 py-1 bg-[#1e1e2d] hover:bg-[#28283d] rounded text-slate-300 transition-colors flex items-center space-x-1"
            title="Toggle File Tree"
          >
            <Folder className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-medium hidden sm:inline">Files</span>
          </button>

          <button
            onClick={handleCreateNewFile}
            className="px-2 py-1 bg-[#1e1e2d] hover:bg-[#28283d] rounded text-slate-300 transition-colors flex items-center space-x-1"
            title="Create New File"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium hidden sm:inline">New</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!isDirty && !saveSuccess}
            className={`px-2.5 py-1 rounded transition-colors flex items-center space-x-1 font-medium ${
              saveSuccess
                ? "bg-emerald-600 text-white"
                : isDirty
                ? "bg-sky-600 hover:bg-sky-500 text-white"
                : "bg-[#1e1e2d] text-slate-500 cursor-not-allowed"
            }`}
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{saveSuccess ? "Saved" : "Save"}</span>
          </button>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center space-x-3">
          <span className="text-slate-500 text-[11px] hidden md:inline font-mono">
            {currentFile || "No file opened"}
          </span>

          {/* RUN SCRIPT BUTTON */}
          <button
            onClick={handleRun}
            className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded shadow flex items-center space-x-1.5 transition-all active:scale-95"
            title="Run script directly in Kali Terminal emulator"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="text-[11px]">Run Script</span>
          </button>
        </div>
      </div>

      {/* Main Area: Sidebar + Editor Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left File Tree Sidebar */}
        {isSidebarOpen && (
          <div className="w-48 sm:w-56 bg-[#13131c] border-r border-[#262638] flex flex-col text-xs shrink-0 select-none">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-[#202030]">
              <span>Explorer</span>
              <span className="text-slate-600 text-[10px]">VFS</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {/* Scripts Folder */}
              <div>
                <div className="flex items-center space-x-1.5 text-slate-400 font-semibold text-[11px] px-1 py-1">
                  <Folder className="w-3.5 h-3.5 text-yellow-500" />
                  <span>~/scripts</span>
                </div>
                <div className="pl-3 space-y-0.5">
                  {scriptEntries.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => handleSelectFile(file.path)}
                      className={`w-full text-left px-2 py-1 rounded flex items-center space-x-1.5 transition-colors text-[11px] truncate ${
                        currentFile === file.path
                          ? "bg-sky-950/60 text-sky-300 font-medium border-l-2 border-sky-400"
                          : "text-slate-400 hover:bg-[#1c1c2b] hover:text-slate-200"
                      }`}
                    >
                      {getFileIcon(file)}
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Documents Folder */}
              <div>
                <div className="flex items-center space-x-1.5 text-slate-400 font-semibold text-[11px] px-1 py-1">
                  <Folder className="w-3.5 h-3.5 text-sky-500" />
                  <span>~/Documents</span>
                </div>
                <div className="pl-3 space-y-0.5">
                  {docEntries.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => handleSelectFile(file.path)}
                      className={`w-full text-left px-2 py-1 rounded flex items-center space-x-1.5 transition-colors text-[11px] truncate ${
                        currentFile === file.path
                          ? "bg-sky-950/60 text-sky-300 font-medium border-l-2 border-sky-400"
                          : "text-slate-400 hover:bg-[#1c1c2b] hover:text-slate-200"
                      }`}
                    >
                      {getFileIcon(file)}
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Folder */}
              <div>
                <div className="flex items-center space-x-1.5 text-slate-400 font-semibold text-[11px] px-1 py-1">
                  <Folder className="w-3.5 h-3.5 text-purple-500" />
                  <span>~/Desktop</span>
                </div>
                <div className="pl-3 space-y-0.5">
                  {desktopEntries.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => handleSelectFile(file.path)}
                      className={`w-full text-left px-2 py-1 rounded flex items-center space-x-1.5 transition-colors text-[11px] truncate ${
                        currentFile === file.path
                          ? "bg-sky-950/60 text-sky-300 font-medium border-l-2 border-sky-400"
                          : "text-slate-400 hover:bg-[#1c1c2b] hover:text-slate-200"
                      }`}
                    >
                      {getFileIcon(file)}
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editor Center Container */}
        <div className="flex-1 flex flex-col bg-[#14141e] overflow-hidden">
          {/* Tabs Bar */}
          <div className="h-8 bg-[#101017] border-b border-[#242436] flex items-center overflow-x-auto select-none no-scrollbar">
            {openTabs.map((tabPath) => {
              const tabName = tabPath.split("/").pop() || "untitled";
              const isActive = currentFile === tabPath;
              return (
                <div
                  key={tabPath}
                  onClick={() => setCurrentFile(tabPath)}
                  className={`h-full px-3 flex items-center space-x-2 border-r border-[#242436] cursor-pointer text-xs transition-colors shrink-0 ${
                    isActive
                      ? "bg-[#181824] text-sky-300 font-medium border-t-2 border-t-sky-400"
                      : "text-slate-400 hover:bg-[#14141e] hover:text-slate-200"
                  }`}
                >
                  <span className="truncate max-w-[130px]">{tabName}</span>
                  {isActive && isDirty && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                  <button
                    onClick={(e) => handleTabClose(e, tabPath)}
                    className="hover:bg-slate-700/60 p-0.5 rounded text-slate-400 hover:text-slate-100"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Code Textarea & Gutter */}
          <div className="flex-1 flex overflow-hidden relative font-mono text-xs sm:text-sm">
            {/* Line numbers gutter */}
            <div className="w-12 bg-[#12121a] text-slate-600 select-none py-3 pr-2 text-right border-r border-[#222233] shrink-0 overflow-hidden leading-6">
              {lineNumbers.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>

            {/* Editable Text Area */}
            <textarea
              ref={textareaRef}
              value={editorContent}
              onChange={(e) => {
                setEditorContent(e.target.value);
                setIsDirty(true);
              }}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUpOrClick}
              onClick={handleKeyUpOrClick}
              spellCheck={false}
              className="flex-1 bg-transparent text-slate-200 p-3 outline-none resize-none overflow-y-auto leading-6 font-mono selection:bg-sky-800/60"
              placeholder="# Write your Python or Bash code here..."
            />
          </div>

          {/* Bottom Editor Status Bar */}
          <div className="h-6 bg-[#0e0e16] border-t border-[#222233] px-3 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
            <div className="flex items-center space-x-4">
              <span>
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
              <span>{editorContent.length} chars</span>
              <span>{lineCount} lines</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sky-400 uppercase font-semibold">
                {ext === "py" ? "Python 3" : ext === "sh" ? "Bash" : ext}
              </span>
              <span>UTF-8</span>
              <span>Spaces: 4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
