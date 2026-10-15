"use client";

import React, { useState } from "react";
import { VirtualFileSystem, VirtualFile } from "@/types/kali";
import {
  listDirectory,
  normalizePath,
  createDirectory,
  writeFile,
  deleteEntry,
} from "@/lib/kali-fs";
import {
  Folder,
  FileCode,
  FileText,
  Terminal,
  Home,
  HardDrive,
  Download,
  Trash2,
  ArrowLeft,
  ArrowUp,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

interface KaliFileManagerProps {
  vfs: VirtualFileSystem;
  setVfs: React.Dispatch<React.SetStateAction<VirtualFileSystem>>;
  onOpenFileInEditor?: (filePath: string) => void;
  onOpenDirectoryInTerminal?: (dirPath: string) => void;
}

export function KaliFileManager({
  vfs,
  setVfs,
  onOpenFileInEditor,
  onOpenDirectoryInTerminal,
}: KaliFileManagerProps) {
  const [currentPath, setCurrentPath] = useState<string>("/home/kali");
  const [history, setHistory] = useState<string[]>(["/home/kali"]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const navigateTo = (path: string) => {
    const norm = normalizePath(path);
    setCurrentPath(norm);
    setSelectedItem(null);
    setHistory((prev) => [...prev.slice(0, historyIdx + 1), norm]);
    setHistoryIdx((prev) => prev + 1);
  };

  const handleGoBack = () => {
    if (historyIdx > 0) {
      const prevPath = history[historyIdx - 1];
      setHistoryIdx(historyIdx - 1);
      setCurrentPath(prevPath);
      setSelectedItem(null);
    }
  };

  const handleGoUp = () => {
    if (currentPath === "/") return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    navigateTo("/" + parts.join("/"));
  };

  const handleCreateFolder = () => {
    const name = prompt("New folder name:", "New Folder");
    if (!name) return;
    const target = normalizePath(`${currentPath}/${name}`);
    const res = createDirectory(vfs, target);
    if (res.success) {
      setVfs(res.vfs);
    } else {
      alert(res.message);
    }
  };

  const handleCreateFile = () => {
    const name = prompt("New file name:", "untitled.txt");
    if (!name) return;
    const target = normalizePath(`${currentPath}/${name}`);
    const res = writeFile(vfs, target, "");
    if (res.success) {
      setVfs(res.vfs);
    }
  };

  const handleDelete = (path: string) => {
    if (confirm(`Are you sure you want to delete ${path}?`)) {
      const res = deleteEntry(vfs, path);
      if (res.success) {
        setVfs(res.vfs);
        setSelectedItem(null);
      }
    }
  };

  const entries = listDirectory(vfs, currentPath).filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (file: VirtualFile) => {
    if (file.isDir) {
      return <Folder className="w-10 h-10 text-sky-400 fill-sky-400/20" />;
    }
    if (file.type === "python") {
      return <FileCode className="w-10 h-10 text-yellow-400" />;
    }
    if (file.type === "bash") {
      return <Terminal className="w-10 h-10 text-emerald-400" />;
    }
    return <FileText className="w-10 h-10 text-slate-400" />;
  };

  // Breadcrumbs segments
  const pathSegments = currentPath.split("/").filter(Boolean);

  return (
    <div className="w-full h-full bg-[#12141c] text-slate-200 flex flex-col font-sans select-none overflow-hidden text-xs">
      {/* Top Toolbar */}
      <div className="h-10 bg-[#161a24] border-b border-[#242b3d] px-3 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1">
          <button
            onClick={handleGoBack}
            disabled={historyIdx === 0}
            className="p-1.5 rounded hover:bg-[#202738] disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
            title="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleGoUp}
            disabled={currentPath === "/"}
            className="p-1.5 rounded hover:bg-[#202738] disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
            title="Up directory"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Path Breadcrumbs Bar */}
        <div className="flex-1 bg-[#0d1017] border border-[#273045] rounded px-2.5 py-1 flex items-center space-x-1 overflow-x-auto no-scrollbar font-mono text-[11px]">
          <button
            onClick={() => navigateTo("/")}
            className="text-sky-400 hover:underline px-1 py-0.5 rounded"
          >
            /
          </button>
          {pathSegments.map((seg, idx) => {
            const segPath = "/" + pathSegments.slice(0, idx + 1).join("/");
            return (
              <React.Fragment key={segPath}>
                <span className="text-slate-500">›</span>
                <button
                  onClick={() => navigateTo(segPath)}
                  className="text-slate-300 hover:text-sky-300 hover:underline px-1 py-0.5 rounded truncate"
                >
                  {seg}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center bg-[#0d1017] border border-[#273045] rounded px-2 py-1 text-slate-400">
            <Search className="w-3 h-3 mr-1" />
            <input
              type="text"
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none w-20 sm:w-28"
            />
          </div>

          <button
            onClick={handleCreateFolder}
            className="p-1.5 rounded bg-[#202738] hover:bg-[#2c364e] text-slate-200"
            title="Create Folder"
          >
            <Folder className="w-3.5 h-3.5 text-yellow-400" />
          </button>

          <button
            onClick={handleCreateFile}
            className="p-1.5 rounded bg-[#202738] hover:bg-[#2c364e] text-slate-200"
            title="Create File"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {onOpenDirectoryInTerminal && (
            <button
              onClick={() => onOpenDirectoryInTerminal(currentPath)}
              className="p-1.5 rounded bg-[#202738] hover:bg-[#2c364e] text-sky-400"
              title="Open Terminal in this directory"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Container: Sidebar + Items Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Places Sidebar */}
        <div className="w-44 bg-[#10131a] border-r border-[#202738] p-2 space-y-1 select-none shrink-0 hidden sm:block">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">Places</div>
          <button
            onClick={() => navigateTo("/home/kali")}
            className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left ${
              currentPath === "/home/kali" ? "bg-sky-950/60 text-sky-300 font-medium" : "text-slate-300 hover:bg-[#1a202e]"
            }`}
          >
            <Home className="w-3.5 h-3.5 text-sky-400" />
            <span>Home</span>
          </button>
          <button
            onClick={() => navigateTo("/home/kali/Desktop")}
            className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left ${
              currentPath === "/home/kali/Desktop" ? "bg-sky-950/60 text-sky-300 font-medium" : "text-slate-300 hover:bg-[#1a202e]"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => navigateTo("/home/kali/scripts")}
            className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left ${
              currentPath === "/home/kali/scripts" ? "bg-sky-950/60 text-sky-300 font-medium" : "text-slate-300 hover:bg-[#1a202e]"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scripts</span>
          </button>
          <button
            onClick={() => navigateTo("/home/kali/Documents")}
            className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left ${
              currentPath === "/home/kali/Documents" ? "bg-sky-950/60 text-sky-300 font-medium" : "text-slate-300 hover:bg-[#1a202e]"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Documents</span>
          </button>
          <button
            onClick={() => navigateTo("/home/kali/Downloads")}
            className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left ${
              currentPath === "/home/kali/Downloads" ? "bg-sky-950/60 text-sky-300 font-medium" : "text-slate-300 hover:bg-[#1a202e]"
            }`}
          >
            <Download className="w-3.5 h-3.5 text-yellow-400" />
            <span>Downloads</span>
          </button>

          <div className="pt-2 text-[10px] uppercase font-bold text-slate-500 px-2 py-1">Devices</div>
          <button
            onClick={() => navigateTo("/")}
            className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left ${
              currentPath === "/" ? "bg-sky-950/60 text-sky-300 font-medium" : "text-slate-300 hover:bg-[#1a202e]"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>File System (/)</span>
          </button>
        </div>

        {/* Files Grid View */}
        <div className="flex-1 bg-[#0b0e14] p-4 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Folder className="w-12 h-12 stroke-[1] mb-2 opacity-40" />
              <p>Folder is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {entries.map((item) => {
                const isSelected = selectedItem === item.path;
                return (
                  <div
                    key={item.path}
                    onClick={() => setSelectedItem(item.path)}
                    onDoubleClick={() => {
                      if (item.isDir) {
                        navigateTo(item.path);
                      } else if (onOpenFileInEditor) {
                        onOpenFileInEditor(item.path);
                      }
                    }}
                    className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-sky-950/50 border-sky-500 shadow-md ring-1 ring-sky-500/40"
                        : "bg-[#121622] border-[#1f2638] hover:border-slate-600 hover:bg-[#171d2b]"
                    }`}
                  >
                    <div className="mb-2">{getFileIcon(item)}</div>
                    <span className="text-xs font-medium text-slate-200 text-center truncate max-w-full">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {item.isDir ? "Folder" : `${item.size || 0} bytes`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 bg-[#0d1017] border-t border-[#1f2638] px-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>{entries.length} items</span>
        <div className="flex items-center space-x-3">
          {selectedItem && (
            <button
              onClick={() => handleDelete(selectedItem)}
              className="text-red-400 hover:text-red-300 flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete selected</span>
            </button>
          )}
          <span>Free space: 42.8 GB</span>
        </div>
      </div>
    </div>
  );
}
