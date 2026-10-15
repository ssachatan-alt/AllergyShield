"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { TerminalLine, VirtualFileSystem } from "@/types/kali";
import {
  getFile,
  listDirectory,
  resolvePath,
  writeFile,
  createDirectory,
  deleteEntry,
} from "@/lib/kali-fs";

interface KaliTerminalProps {
  vfs: VirtualFileSystem;
  setVfs: React.Dispatch<React.SetStateAction<VirtualFileSystem>>;
  onOpenFileInEditor?: (filePath: string) => void;
  initialCommand?: string;
}

const KALI_DRAGON_ASCII = `
  ...........
     .:::::::;;;             kali@kali-desktop
    .:::::::::;;;;            -----------------
   .:::::::::::;;;;;          OS: Kali GNU/Linux Rolling x86_64
  .:::::::::::::;;;;;;        Host: Browser WebAssembly Hypervisor
 .::::::::::::::;;;;;;;       Kernel: 6.8.11-amd64
.::::::::::::::::;;;;;;;      Uptime: 2 hours, 18 mins
:::::::::::::::::;;;;;;;;     Packages: 2430 (dpkg)
:::::::::::::::::;;;;;;;;     Shell: zsh 5.9 (x86_64-debian-linux-gnu)
:::::::::::::::::;;;;;;;;     Resolution: 1920x1080 @ 60Hz
 .::::::::::::::;;;;;;;       DE: Xfce 4.18
  .:::::::::::::;;;;;;        WM: Xfwm4
   .:::::::::::;;;;;          Theme: Kali-Dark [GTK2/3]
    .:::::::::;;;;            Icons: Flat-Remix-Blue-Dark
     .:::::::;;;              Terminal: qterminal
      .......                 CPU: AMD Ryzen 9 7950X (32) @ 4.5GHz
                              Memory: 4182MiB / 16384MiB
`;

export function KaliTerminal({
  vfs,
  setVfs,
  onOpenFileInEditor,
  initialCommand,
}: KaliTerminalProps) {
  const [currentDir, setCurrentDir] = useState<string>("/home/kali");
  const [user, setUser] = useState<string>("kali");
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "line-welcome",
      type: "info",
      text: "Kali GNU/Linux Rolling (kali-rolling) [Web Client v2026.1]\nType 'help' for available commands or 'neofetch' for system info.",
    },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new output
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, isProcessing]);

  // Focus input on mount or click
  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Convert full path to display path (e.g., /home/kali -> ~)
  const getDisplayPath = (dir: string): string => {
    if (dir === "/home/kali") return "~";
    if (dir.startsWith("/home/kali/")) return "~" + dir.slice("/home/kali".length);
    return dir;
  };

  // Execute command helper
  const handleCommandExecution = useCallback(
    async (cmdStr: string) => {
      const trimmed = cmdStr.trim();
      if (!trimmed) {
        setLines((prev) => [
          ...prev,
          {
            id: `line-${Date.now()}`,
            type: "prompt",
            text: "",
            dir: currentDir,
            user,
            command: "",
          },
        ]);
        return;
      }

      // Add to command history
      setCommandHistory((prev) => [trimmed, ...prev]);
      setHistoryIndex(-1);

      // Add prompt line
      setLines((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}`,
          type: "prompt",
          text: "",
          dir: currentDir,
          user,
          command: trimmed,
        },
      ]);

      const parts = trimmed.split(" ").filter(Boolean);
      const mainCmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      setIsProcessing(true);

      // Utility to append output
      const appendOutput = (text: string, type: TerminalLine["type"] = "output") => {
        setLines((prev) => [
          ...prev,
          {
            id: `out-${Date.now()}-${Math.random()}`,
            type,
            text,
          },
        ]);
      };

      // Handle piped redirect: e.g. echo "hello" > file.txt
      if (trimmed.includes(">")) {
        const isAppend = trimmed.includes(">>");
        const separator = isAppend ? ">>" : ">";
        const [leftPart, rightPart] = trimmed.split(separator);
        const targetFilename = rightPart?.trim();

        if (leftPart && targetFilename) {
          let contentToWrite = leftPart.trim();
          if (contentToWrite.startsWith("echo")) {
            contentToWrite = contentToWrite.replace(/^echo\s+/, "").trim();
            if (
              (contentToWrite.startsWith('"') && contentToWrite.endsWith('"')) ||
              (contentToWrite.startsWith("'") && contentToWrite.endsWith("'"))
            ) {
              contentToWrite = contentToWrite.slice(1, -1);
            }
          }

          const targetPath = resolvePath(currentDir, targetFilename);
          let finalContent = contentToWrite;
          if (isAppend) {
            const existing = getFile(vfs, targetPath);
            finalContent = (existing?.content ? existing.content + "\n" : "") + contentToWrite;
          }

          const res = writeFile(vfs, targetPath, finalContent);
          if (res.success) {
            setVfs(res.vfs);
            appendOutput(`[✓] Written to ${targetFilename}`, "success");
          } else {
            appendOutput(`Error writing file: ${res.message}`, "error");
          }
          setIsProcessing(false);
          return;
        }
      }

      switch (mainCmd) {
        case "help": {
          appendOutput(
            `KALI LINUX TOOLS & SYSTEM COMMANDS:
──────────────────────────────────────────────────────────────────
Core Commands:
  help              Display this command index
  clear             Clear the terminal viewport
  ls [-la]          List directory contents with permissions
  cd [path]         Change working directory (~, .., /path)
  pwd               Print current working directory
  cat [file]        Print file contents to stdout
  touch [file]      Create an empty file
  mkdir [dir]       Create directory
  rm [-rf] [file]   Remove file or directory
  echo [text]       Display text or redirect to file (>)
  whoami            Print current effective username
  uname -a          Print system kernel & OS information
  date              Display system date and time
  history           Show command execution history

Security & Networking Utilities:
  nmap [target]     Network exploration tool & port scanner
                    Options: -sS (SYN), -sV (Version), -p [ports]
  ping [target]     Send ICMP ECHO_REQUEST packets
  curl [url]        Transfer data from URL / inspect HTTP headers
  ifconfig / ip a   Configure and inspect network interface parameters
  python3 [script]  Execute Python scripts from file system
  bash [script]     Execute shell scripts from file system
  airmon-ng         Simulated 802.11 monitor mode injection
  hydra             Simulated fast network login cracker
  gobuster          Directory & DNS enumeration tool
  msfconsole        Metasploit Framework interactive console
  neofetch          Show aesthetic Kali Linux OS details
  sudo su           Elevate to root superuser session
  nano/code [file]  Open file directly into Code Editor window
──────────────────────────────────────────────────────────────────`,
            "info"
          );
          setIsProcessing(false);
          break;
        }

        case "clear": {
          setLines([]);
          setIsProcessing(false);
          break;
        }

        case "pwd": {
          appendOutput(currentDir);
          setIsProcessing(false);
          break;
        }

        case "whoami": {
          appendOutput(user);
          setIsProcessing(false);
          break;
        }

        case "date": {
          appendOutput(new Date().toUTCString());
          setIsProcessing(false);
          break;
        }

        case "uname": {
          if (args.includes("-a") || args.length === 0) {
            appendOutput(
              "Linux kali 6.8.11-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.8.11-1kali2 (2026-03-28) x86_64 GNU/Linux"
            );
          } else {
            appendOutput("Linux");
          }
          setIsProcessing(false);
          break;
        }

        case "sudo": {
          if (args[0] === "su" || args.length === 0) {
            setUser("root");
            appendOutput("[✓] Superuser elevation successful. Active session: root", "success");
          } else {
            // run command as root
            setUser("root");
            const subCmd = args.join(" ");
            appendOutput(`[sudo] executing: ${subCmd}`, "info");
            handleCommandExecution(subCmd);
          }
          setIsProcessing(false);
          break;
        }

        case "su": {
          if (args[0] === "kali") {
            setUser("kali");
            appendOutput("Switched to user: kali", "info");
          } else {
            setUser("root");
            appendOutput("Switched to superuser: root", "success");
          }
          setIsProcessing(false);
          break;
        }

        case "history": {
          const histText = commandHistory
            .slice()
            .reverse()
            .map((h, i) => `  ${i + 1}  ${h}`)
            .join("\n");
          appendOutput(histText || "No command history yet.");
          setIsProcessing(false);
          break;
        }

        case "neofetch":
        case "fastfetch": {
          appendOutput(KALI_DRAGON_ASCII, "info");
          setIsProcessing(false);
          break;
        }

        case "ls": {
          const isAll = args.includes("-a") || args.includes("-la") || args.includes("-al");
          const isLong = args.includes("-l") || args.includes("-la") || args.includes("-al");
          const targetArg = args.find((a) => !a.startsWith("-")) || ".";
          const targetDirPath = resolvePath(currentDir, targetArg);

          const entries = listDirectory(vfs, targetDirPath);
          if (entries.length === 0) {
            if (!getFile(vfs, targetDirPath)) {
              appendOutput(`ls: cannot access '${targetArg}': No such file or directory`, "error");
            }
            setIsProcessing(false);
            break;
          }

          if (isLong) {
            let out = `total ${entries.length * 4}\n`;
            if (isAll) {
              out += `drwxr-xr-x 4 ${user} ${user} 4096 Oct 11 02:00 .\ndrwxr-xr-x 3 root root 4096 Oct 11 02:00 ..\n`;
            }
            entries.forEach((e) => {
              const perm = e.isDir ? "drwxr-xr-x" : e.permissions || "-rw-r--r--";
              const size = (e.size || 4096).toString().padStart(6, " ");
              const dateStr = "Oct 11 02:15";
              const colorCode = e.isDir
                ? `\x1b[34m${e.name}/\x1b[0m`
                : e.type === "python" || e.type === "bash"
                ? `\x1b[32m${e.name}*\x1b[0m`
                : e.name;
              out += `${perm} 1 ${user} ${user} ${size} ${dateStr} ${colorCode}\n`;
            });
            appendOutput(out.trimEnd());
          } else {
            const formatted = entries
              .map((e) => {
                if (e.isDir) return `\x1b[34m${e.name}/\x1b[0m`;
                if (e.type === "python" || e.type === "bash") return `\x1b[32m${e.name}*\x1b[0m`;
                return e.name;
              })
              .join("    ");
            appendOutput(formatted);
          }
          setIsProcessing(false);
          break;
        }

        case "cd": {
          const target = args[0] || "~";
          const resolved = resolvePath(currentDir, target);
          const dirFile = getFile(vfs, resolved);

          if (!dirFile) {
            appendOutput(`cd: no such file or directory: ${target}`, "error");
          } else if (!dirFile.isDir) {
            appendOutput(`cd: not a directory: ${target}`, "error");
          } else {
            setCurrentDir(resolved);
          }
          setIsProcessing(false);
          break;
        }

        case "cat": {
          if (!args[0]) {
            appendOutput("cat: missing operand", "error");
            setIsProcessing(false);
            break;
          }
          const filePath = resolvePath(currentDir, args[0]);
          const file = getFile(vfs, filePath);
          if (!file) {
            appendOutput(`cat: ${args[0]}: No such file or directory`, "error");
          } else if (file.isDir) {
            appendOutput(`cat: ${args[0]}: Is a directory`, "error");
          } else {
            appendOutput(file.content || "(empty file)");
          }
          setIsProcessing(false);
          break;
        }

        case "touch": {
          if (!args[0]) {
            appendOutput("touch: missing file operand", "error");
            setIsProcessing(false);
            break;
          }
          const filePath = resolvePath(currentDir, args[0]);
          const res = writeFile(vfs, filePath, "");
          setVfs(res.vfs);
          setIsProcessing(false);
          break;
        }

        case "mkdir": {
          if (!args[0]) {
            appendOutput("mkdir: missing operand", "error");
            setIsProcessing(false);
            break;
          }
          const dirPath = resolvePath(currentDir, args[0]);
          const res = createDirectory(vfs, dirPath);
          if (res.success) {
            setVfs(res.vfs);
          } else {
            appendOutput(res.message || "mkdir failed", "error");
          }
          setIsProcessing(false);
          break;
        }

        case "rm": {
          if (!args[0]) {
            appendOutput("rm: missing operand", "error");
            setIsProcessing(false);
            break;
          }
          const targetName = args.filter((a) => !a.startsWith("-"))[0];
          if (!targetName) {
            appendOutput("rm: missing file operand", "error");
            setIsProcessing(false);
            break;
          }
          const targetPath = resolvePath(currentDir, targetName);
          const res = deleteEntry(vfs, targetPath);
          if (res.success) {
            setVfs(res.vfs);
          } else {
            appendOutput(res.message || "rm failed", "error");
          }
          setIsProcessing(false);
          break;
        }

        case "nano":
        case "code":
        case "mousepad":
        case "edit": {
          const targetName = args[0] || "untitled.py";
          const targetPath = resolvePath(currentDir, targetName);
          // If file doesn't exist, create it
          if (!getFile(vfs, targetPath)) {
            const res = writeFile(vfs, targetPath, "");
            setVfs(res.vfs);
          }
          appendOutput(`[✓] Launching editor for ${targetPath}...`, "info");
          if (onOpenFileInEditor) {
            onOpenFileInEditor(targetPath);
          }
          setIsProcessing(false);
          break;
        }

        case "echo": {
          appendOutput(args.join(" ").replace(/^["']|["']$/g, ""));
          setIsProcessing(false);
          break;
        }

        case "ifconfig":
        case "ip": {
          appendOutput(
            `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.137  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4a:39a2  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4a:39:a2  txqueuelen 1000  (Ethernet)
        RX packets 24108  bytes 28419201 (27.1 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 18239  bytes 12948190 (12.3 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 412  bytes 38412 (37.5 KiB)
        TX packets 412  bytes 38412 (37.5 KiB)

wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 10.0.0.45  netmask 255.255.255.0  broadcast 10.0.0.255
        ether 5c:f9:dd:7a:b1:e4  txqueuelen 1000  (IEEE 802.11)
        RX packets 5104  bytes 4109823 (3.9 MiB)
        TX packets 2891  bytes 812903 (793.8 KiB)`
          );
          setIsProcessing(false);
          break;
        }

        case "ping": {
          const target = args.find((a) => !a.startsWith("-")) || "192.168.1.1";
          appendOutput(`PING ${target} (${target}) 56(84) bytes of data.`);

          let count = 0;
          const maxPackets = 4;
          const interval = setInterval(() => {
            count++;
            const seq = count;
            const ttl = 64;
            const time = (11 + Math.random() * 5).toFixed(2);
            appendOutput(`64 bytes from ${target}: icmp_seq=${seq} ttl=${ttl} time=${time} ms`);

            if (count >= maxPackets) {
              clearInterval(interval);
              appendOutput(
                `\n--- ${target} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss, time 3004ms\nrtt min/avg/max/mdev = 11.24/13.48/16.12/1.82 ms`,
                "success"
              );
              setIsProcessing(false);
            }
          }, 600);
          break;
        }

        case "curl": {
          const url = args.find((a) => !a.startsWith("-")) || "https://target-server.internal";
          appendOutput(`[*] Connecting to ${url}...`, "info");
          setTimeout(() => {
            appendOutput(
              `HTTP/1.1 200 OK
Date: ${new Date().toUTCString()}
Server: Apache/2.4.52 (Ubuntu)
X-Powered-By: PHP/8.2.14
Content-Type: text/html; charset=UTF-8
Content-Length: 342
Connection: keep-alive
Strict-Transport-Security: max-age=31536000; includeSubDomains

<!DOCTYPE html>
<html>
<head><title>Internal Corp Portal</title></head>
<body>
  <h1>CyberLabs Enterprise Authentication Gateway</h1>
  <p>Authorized personnel only. All access is logged.</p>
  <form action="/login" method="POST">
    <input type="text" name="username" placeholder="Username" />
    <input type="password" name="password" placeholder="Password" />
    <button type="submit">Sign In</button>
  </form>
</body>
</html>`
            );
            setIsProcessing(false);
          }, 800);
          break;
        }

        case "nmap": {
          const target = args.find((a) => !a.startsWith("-")) || "192.168.1.105";
          appendOutput(`Starting Nmap 7.94SVN ( https://nmap.org ) at ${new Date().toISOString()}`);
          appendOutput(`Initiating SYN Stealth Scan against ${target} [1000 ports]...`, "info");

          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 33;
            if (progress < 100) {
              appendOutput(`SYN Stealth Scan: ${progress}% done [ETA: 00:0${3 - Math.floor(progress / 33)}s]`, "progress");
            } else {
              clearInterval(progressInterval);
              appendOutput(
                `Nmap scan report for ${target}
Host is up (0.0014s latency).
Not shown: 994 closed tcp ports (reset)

PORT     STATE SERVICE       VERSION
21/tcp   open  ftp           vsftpd 3.0.3
22/tcp   open  ssh           OpenSSH 8.9p1 Ubuntu 3ubuntu0.6 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http          Apache httpd 2.4.52 ((Ubuntu))
443/tcp  open  ssl/http      Apache httpd 2.4.52
3306/tcp open  mysql         MySQL 8.0.35-0ubuntu0.22.04.1
8080/tcp open  http-proxy    nginx/1.24.0

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up) scanned in 2.84 seconds`,
                "success"
              );
              setIsProcessing(false);
            }
          }, 500);
          break;
        }

        case "python":
        case "python3": {
          const scriptArg = args[0];
          if (!scriptArg) {
            appendOutput("Python 3.12.3 (main, Feb 4 2026, 14:48:20) [GCC 13.2.0] on linux\nType 'help', 'copyright', 'credits' or 'license' for more information.\n(Interactive shell not active: supply a script argument e.g. python3 script.py)", "info");
            setIsProcessing(false);
            break;
          }

          const scriptPath = resolvePath(currentDir, scriptArg);
          const file = getFile(vfs, scriptPath);

          if (!file) {
            appendOutput(`python3: can't open file '${scriptArg}': [Errno 2] No such file or directory`, "error");
            setIsProcessing(false);
            break;
          }

          appendOutput(`[+] Executing Python script: ${scriptPath}...`, "info");

          // Simulate running python script
          setTimeout(() => {
            const content = file.content;
            if (content.includes("port_scanner") || scriptArg.includes("port_scanner")) {
              appendOutput(
                `[*] Starting TCP Scan on target: 192.168.1.105
[*] Scanning 10 common ports...
[+] [OPEN] Port 21/tcp - Service: FTP (vsftpd 3.0.3)
[+] [OPEN] Port 22/tcp - Service: SSH (OpenSSH 8.9p1 Ubuntu)
[-] [CLOSED] Port 25/tcp
[+] [OPEN] Port 80/tcp - Service: HTTP (Apache/2.4.52)
[-] [CLOSED] Port 110/tcp
[-] [CLOSED] Port 143/tcp
[+] [OPEN] Port 443/tcp - Service: HTTPS (OpenSSL 3.0.2)
[+] [OPEN] Port 3306/tcp - Service: MySQL (8.0.35 Community)
[-] [CLOSED] Port 5432/tcp
[+] [OPEN] Port 8080/tcp - Service: HTTP-Proxy (Nginx reverse proxy)

[+] Scan completed. 6 open ports identified.`,
                "success"
              );
            } else if (content.includes("recon_tool") || scriptArg.includes("recon_tool")) {
              appendOutput(
                `[!] Probing target web infrastructure: https://target.corp.internal
[*] Sending HTTP/1.1 GET request with User-Agent: Mozilla/5.0...
    Status: 200 OK
    Server: nginx/1.24.0 (Ubuntu)
    X-Powered-By: PHP/8.2.14
    X-Frame-Options: SAMEORIGIN
    Content-Security-Policy: default-src 'self'
    Strict-Transport-Security: max-age=31536000; includeSubDomains

[+] Technology Stack Detected:
    - Web Server: Nginx 1.24.0
    - Backend: PHP 8.2
    - CDN/Proxy: Cloudflare
[*] Completed header enumeration.`,
                "success"
              );
            } else if (content.includes("print(")) {
              // Extract print statements
              const matches = content.match(/print\s*\((.*?)\)/g);
              if (matches && matches.length > 0) {
                const printed = matches
                  .map((m) =>
                    m
                      .replace(/^print\s*\(/, "")
                      .replace(/\)$/, "")
                      .replace(/^f?["']|["']$/g, "")
                      .trim()
                  )
                  .join("\n");
                appendOutput(printed, "success");
              } else {
                appendOutput(`[✓] Script ${scriptArg} executed cleanly with exit code 0.`, "success");
              }
            } else {
              appendOutput(`[✓] Script ${scriptArg} executed cleanly with exit code 0.`, "success");
            }
            setIsProcessing(false);
          }, 700);
          break;
        }

        case "bash":
        case "sh": {
          const scriptArg = args[0];
          if (!scriptArg) {
            appendOutput("bash: missing script operand", "error");
            setIsProcessing(false);
            break;
          }

          const scriptPath = resolvePath(currentDir, scriptArg);
          const file = getFile(vfs, scriptPath);

          if (!file) {
            appendOutput(`bash: ${scriptArg}: No such file or directory`, "error");
            setIsProcessing(false);
            break;
          }

          appendOutput(`[*] Running shell script: ${scriptPath}...`, "info");
          setTimeout(() => {
            if (file.content.includes("wifi_deauth") || scriptArg.includes("wifi_deauth")) {
              appendOutput(
                `[*] Initializing wireless interface wlan0...
[*] Setting wlan0 into IEEE 802.11 Monitor mode (mon0)...
[+] Interface mon0 active on Channel 6 (2.437 GHz)
[*] Targeting BSSID: [00:14:D1:E8:4A:9C] (CorpNet-5G)
[*] Transmitting 16 IEEE 802.11 Deauthentication frames...
[+] Frame [1/16] broadcast sent (ACK received)
[+] Frame [8/16] broadcast sent (ACK received)
[+] Frame [16/16] broadcast complete.
[*] WPA2 4-way handshake captured: CorpNet-5G.cap [EAPOL]
[✔] Finished successfully. Handshake saved to /home/kali/Downloads/`,
                "success"
              );
            } else {
              // Execute echo lines from script
              const echoLines = file.content
                .split("\n")
                .filter((l) => l.trim().startsWith("echo "))
                .map((l) => l.trim().replace(/^echo\s+/, "").replace(/^["']|["']$/g, ""));
              if (echoLines.length > 0) {
                appendOutput(echoLines.join("\n"), "success");
              } else {
                appendOutput(`[✓] ${scriptArg} executed successfully (exit code 0).`, "success");
              }
            }
            setIsProcessing(false);
          }, 800);
          break;
        }

        case "airmon-ng": {
          appendOutput(
            `PHY     Interface       Driver          Chipset
phy0    wlan0           ath9k_htc       Atheros Communications AR9271 802.11n

[+] Interface wlan0 set to monitor mode: mon0 enabled
(mac80211 monitor mode vif enabled on [phy0]wlan0)`,
            "success"
          );
          setIsProcessing(false);
          break;
        }

        case "hydra": {
          appendOutput("Hydra v9.5 (c) 2024 by van Hauser / THC - https://www.thc.org/thc-hydra", "info");
          appendOutput("[DATA] attacking ssh://192.168.1.105:22/ (16 parallel tasks)");
          setTimeout(() => {
            appendOutput("[ATTEMPT] user: admin | pass: 123456 -> rejected");
            appendOutput("[ATTEMPT] user: admin | pass: password -> rejected");
            appendOutput("[ATTEMPT] user: admin | pass: admin123 -> rejected");
            appendOutput(
              "[22][ssh] host: 192.168.1.105   login: admin   password: password\n[STATUS] 1 valid password found (1/1)",
              "success"
            );
            setIsProcessing(false);
          }, 900);
          break;
        }

        case "gobuster": {
          appendOutput(
            `===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://192.168.1.105
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /home/kali/Documents/passwords_top20.txt
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/admin                (Status: 301) [Size: 178] [--> http://192.168.1.105/admin/]
/login                (Status: 200) [Size: 3422]
/api                  (Status: 301) [Size: 178] [--> http://192.168.1.105/api/]
/dashboard            (Status: 302) [Size: 0] [--> /login]
/robots.txt           (Status: 200) [Size: 48]
Progress: 20 / 20 (100.00%)
===============================================================
Finished. 5 endpoints discovered.`,
            "success"
          );
          setIsProcessing(false);
          break;
        }

        case "msfconsole": {
          appendOutput(
            `
               c.'.-:::'::'::':::'.-.'.c
            .'  '  '  '  '  '  '  '  '  '.
          .' :  :  :  :  :  :  :  :  :  : '.
         /   :  :  :  :  :  :  :  :  :  :   \\
        /   :  :  :  :  :  :  :  :  :  :  :  \\
       /   :  :  :  :  :  :  :  :  :  :  :  : \\
      /   :  :  :  :  :  :  :  :  :  :  :  :  \\
     /   :  :  :  :  :  :  :  :  :  :  :  :  : \\

       =[ metasploit v6.4.11-dev                          ]
+ -- --=[ 2419 exploits - 1285 auxiliary - 428 post       ]
+ -- --=[ 1468 payloads - 49 encoders - 13 nops           ]
+ -- --=[ Free & Open Source Penetration Testing Software  ]

msf6 > `,
            "info"
          );
          setIsProcessing(false);
          break;
        }

        case "top":
        case "htop": {
          appendOutput(
            `top - 02:24:10 up 2:18, 1 user, load average: 0.12, 0.08, 0.05
Tasks: 184 total,   1 running, 183 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.4 us,  1.1 sy,  0.0 ni, 96.2 id,  0.2 wa,  0.0 hi,  0.1 si
MiB Mem :  16384.0 total,  12140.2 free,   2840.4 used,   1403.4 buff/cache
MiB Swap:   4096.0 total,   4096.0 free,      0.0 used.  13110.6 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    684 root      20   0  389204  28410  19402 S   1.8   0.2   0:14.28 NetworkManager
    921 kali      20   0  891240 184200  84190 S   1.2   1.1   0:42.10 xfce4-session
   1482 kali      20   0  541290  94120  48120 S   0.8   0.6   0:08.41 qterminal
   2104 root      20   0  210940  14890  11200 S   0.3   0.1   0:01.12 sshd
      1 root      20   0  168490  12940   8910 S   0.0   0.1   0:02.48 systemd`,
            "info"
          );
          setIsProcessing(false);
          break;
        }

        default: {
          appendOutput(`zsh: command not found: ${mainCmd}. Type 'help' to view available tools.`, "error");
          setIsProcessing(false);
          break;
        }
      }
    },
    [currentDir, user, vfs, commandHistory, onOpenFileInEditor, setVfs]
  );

  // Auto-run initialCommand if provided
  useEffect(() => {
    if (initialCommand) {
      handleCommandExecution(initialCommand);
    }
  }, [initialCommand, handleCommandExecution]);

  // Handle keyboard navigation (history, tab complete, submit)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = inputValue;
      setInputValue("");
      handleCommandExecution(cmd);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < commandHistory.length) {
          setHistoryIndex(nextIdx);
          setInputValue(commandHistory[nextIdx]);
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputValue(commandHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Tab Autocompletion
      const tokens = inputValue.split(" ");
      const lastToken = tokens[tokens.length - 1];
      if (tokens.length === 1) {
        // Complete commands
        const builtInCmds = [
          "help",
          "clear",
          "ls",
          "cd",
          "pwd",
          "cat",
          "touch",
          "mkdir",
          "rm",
          "echo",
          "whoami",
          "uname",
          "date",
          "history",
          "neofetch",
          "nmap",
          "ping",
          "curl",
          "ifconfig",
          "ip",
          "python3",
          "bash",
          "hydra",
          "gobuster",
          "msfconsole",
          "airmon-ng",
          "top",
          "sudo",
          "code",
        ];
        const match = builtInCmds.find((c) => c.startsWith(lastToken));
        if (match) {
          setInputValue(match + " ");
        }
      } else {
        // Complete files / dirs
        const entries = listDirectory(vfs, currentDir);
        const match = entries.find((en) => en.name.startsWith(lastToken));
        if (match) {
          tokens[tokens.length - 1] = match.name + (match.isDir ? "/" : " ");
          setInputValue(tokens.join(" "));
        }
      }
    } else if (e.key === "c" && e.ctrlKey) {
      // Ctrl+C
      setInputValue("");
      setLines((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}`,
          type: "prompt",
          text: "^C",
          dir: currentDir,
          user,
          command: inputValue + "^C",
        },
      ]);
      setIsProcessing(false);
    } else if (e.key === "l" && e.ctrlKey) {
      // Ctrl+L (clear)
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="w-full h-full bg-[#0d1117] text-[#c9d1d9] font-mono text-xs sm:text-sm p-3 overflow-y-auto select-text flex flex-col"
      onClick={focusInput}
    >
      {/* Terminal History Lines */}
      <div className="space-y-1 flex-1">
        {lines.map((line) => {
          if (line.type === "prompt") {
            const promptUser = line.user || user;
            const promptDir = getDisplayPath(line.dir || currentDir);
            const isRoot = promptUser === "root";
            return (
              <div key={line.id} className="pt-1">
                <div className="flex items-center text-xs leading-none">
                  <span className="text-[#3b82f6]">┌──(</span>
                  <span className={isRoot ? "text-[#ef4444] font-bold" : "text-[#06b6d4] font-semibold"}>
                    {promptUser}㉿kali
                  </span>
                  <span className="text-[#3b82f6]">)-[</span>
                  <span className="text-white font-medium">{promptDir}</span>
                  <span className="text-[#3b82f6]">]</span>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className={isRoot ? "text-[#ef4444] font-bold" : "text-[#3b82f6] font-bold"}>
                    └─{isRoot ? "#" : "$"}
                  </span>
                  <span className="text-slate-100 font-mono pl-1">{line.command}</span>
                </div>
              </div>
            );
          }

          if (line.type === "error") {
            return (
              <pre key={line.id} className="text-[#f87171] whitespace-pre-wrap font-mono leading-relaxed pl-2">
                {line.text}
              </pre>
            );
          }

          if (line.type === "success") {
            return (
              <pre key={line.id} className="text-[#34d399] whitespace-pre-wrap font-mono leading-relaxed pl-2">
                {line.text}
              </pre>
            );
          }

          if (line.type === "info") {
            return (
              <pre key={line.id} className="text-[#38bdf8] whitespace-pre-wrap font-mono leading-relaxed pl-2">
                {line.text}
              </pre>
            );
          }

          if (line.type === "progress") {
            return (
              <div key={line.id} className="text-[#fbbf24] font-mono pl-2 animate-pulse">
                {line.text}
              </div>
            );
          }

          // Default Output (with ANSI escape parsing simulation)
          const cleanText = line.text
            .replace(/\x1b\[34m/g, "")
            .replace(/\x1b\[32m/g, "")
            .replace(/\x1b\[0m/g, "");

          return (
            <pre key={line.id} className="text-[#e2e8f0] whitespace-pre-wrap font-mono leading-relaxed pl-2">
              {cleanText}
            </pre>
          );
        })}

        {/* Active Input Line */}
        <div className="pt-1">
          <div className="flex items-center text-xs leading-none">
            <span className="text-[#3b82f6]">┌──(</span>
            <span className={user === "root" ? "text-[#ef4444] font-bold" : "text-[#06b6d4] font-semibold"}>
              {user}㉿kali
            </span>
            <span className="text-[#3b82f6]">)-[</span>
            <span className="text-white font-medium">{getDisplayPath(currentDir)}</span>
            <span className="text-[#3b82f6]">]</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className={user === "root" ? "text-[#ef4444] font-bold" : "text-[#3b82f6] font-bold"}>
              └─{user === "root" ? "#" : "$"}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              autoFocus
              className="flex-1 bg-transparent text-slate-100 outline-none border-none font-mono text-xs sm:text-sm p-0 m-0 focus:ring-0"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
