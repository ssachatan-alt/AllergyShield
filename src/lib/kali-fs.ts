import { VirtualFile, VirtualFileSystem } from "@/types/kali";

export const INITIAL_FILESYSTEM: VirtualFileSystem = {
  "/": {
    name: "/",
    path: "/",
    content: "",
    isDir: true,
    permissions: "drwxr-xr-x",
    type: "dir",
    modified: "2026-10-11 02:00:00",
  },
  "/home": {
    name: "home",
    path: "/home",
    content: "",
    isDir: true,
    permissions: "drwxr-xr-x",
    type: "dir",
    modified: "2026-10-11 02:00:00",
  },
  "/home/kali": {
    name: "kali",
    path: "/home/kali",
    content: "",
    isDir: true,
    permissions: "drwxr-xr-x",
    type: "dir",
    modified: "2026-10-11 02:00:00",
  },
  "/home/kali/Desktop": {
    name: "Desktop",
    path: "/home/kali/Desktop",
    content: "",
    isDir: true,
    permissions: "drwxr-xr-x",
    type: "dir",
    modified: "2026-10-11 02:00:00",
  },
  "/home/kali/Desktop/readme.txt": {
    name: "readme.txt",
    path: "/home/kali/Desktop/readme.txt",
    content: `===================================================================
       KALI LINUX WEB DESKTOP EMULATOR (Client-Side OS)
===================================================================

Welcome, Security Analyst.
This interactive environment runs 100% locally in your browser.

KEY CAPABILITIES:
1. Interactive Terminal:
   - Run standard commands: ls, cd, cat, pwd, mkdir, touch, rm, clear, help
   - Networking & Recon:
     * nmap 192.168.1.105 (or nmap -sV -p 80,443,22 10.0.0.1)
     * ping 8.8.8.8
     * curl https://api.target.internal
     * ifconfig / ip a
     * neofetch
     * python3 /home/kali/scripts/port_scanner.py
     * bash /home/kali/scripts/wifi_deauth.sh
     * hydra -l admin -P /home/kali/Documents/passwords_top20.txt ssh://192.168.1.105

2. Code / Script Editor:
   - Create, edit, and save scripts in Python, Bash, or Plaintext.
   - Click "Run Script" to pipe output live into the Terminal!
   - Shared VFS: anything saved here updates the terminal instantly.

3. Graphical Network Map (Zenmap):
   - Open Zenmap from the top bar or desktop icon.
   - Inspect active subnet hosts, open ports, and topology.

4. Fullscreen Mode:
   - Click the fullscreen toggle in the top-right panel for an
     immersive full-window OS experience.

Happy ethical hacking!
`,
    isDir: false,
    permissions: "-rw-r--r--",
    size: 1140,
    type: "text",
    modified: "2026-10-11 02:01:00",
  },
  "/home/kali/Desktop/target_scope.md": {
    name: "target_scope.md",
    path: "/home/kali/Desktop/target_scope.md",
    content: `# Security Assessment Scope

## Authorization
- **Client**: CyberLabs Defense Corp
- **Status**: Authorized Penetration Testing Engagement
- **Tester**: kali@kali-desktop
- **Window**: October 2026

## In-Scope Targets
| Host / CIDR | Role | Services Identified |
|---|---|---|
| 192.168.1.1 | Gateway Router | DNS (53), WebGUI (80) |
| 192.168.1.105 | Target Ubuntu Server | SSH (22), Apache (80), MySQL (3306) |
| 192.168.1.120 | Windows Domain Controller | Kerberos (88), SMB (445), RDP (3389) |
| 192.168.1.44 | IoT Surveillance Cam | RTSP (554), HTTP (8080) |

## Key Rules of Engagement
- Avoid disruptive DoS attacks.
- Log all successful exploitation attempts.
- Verify findings with evidence screenshots and hashes.
`,
    isDir: false,
    permissions: "-rw-r--r--",
    size: 780,
    type: "markdown",
    modified: "2026-10-11 02:05:00",
  },
  "/home/kali/Documents": {
    name: "Documents",
    path: "/home/kali/Documents",
    content: "",
    isDir: true,
    permissions: "drwxr-xr-x",
    type: "dir",
    modified: "2026-10-11 02:00:00",
  },
  "/home/kali/Documents/cheatsheet.txt": {
    name: "cheatsheet.txt",
    path: "/home/kali/Documents/cheatsheet.txt",
    content: `KALI COMMAND CHEATSHEET
-----------------------
nmap -sS -sV 192.168.1.105       # TCP SYN Stealth Service Scan
ping -c 4 192.168.1.1            # ICMP Ping test
curl -I https://google.com       # Fetch HTTP Headers
ifconfig                         # Inspect Network Interfaces
python3 scripts/port_scanner.py  # Run python script
bash scripts/wifi_deauth.sh      # Run bash script
cat /etc/os-release              # View OS Version
neofetch                         # Kali ASCII & system specs
clear                            # Clear terminal screen
`,
    isDir: false,
    permissions: "-rw-r--r--",
    size: 512,
    type: "text",
    modified: "2026-10-11 02:00:00",
  },
  "/home/kali/Documents/passwords_top20.txt": {
    name: "passwords_top20.txt",
    path: "/home/kali/Documents/passwords_top20.txt",
    content: `password
123456
12345678
admin
qwerty
iloveyou
kali
dragon
hunter2
trustno1
root
admin123
letmein
welcome
monkey
football
shadow
access
p@ssw0rd
secret
`,
    isDir: false,
    permissions: "-rw-r--r--",
    size: 142,
    type: "text",
    modified: "2026-10-11 02:00:00",
  },
  "/home/kali/scripts": {
    name: "scripts",
    path: "/home/kali/scripts",
    content: "",
    isDir: true,
    permissions: "drwxr-xr-x",
    type: "dir",
    modified: "2026-10-11 02:00:00",
  },
  "/home/kali/scripts/port_scanner.py": {
    name: "port_scanner.py",
    path: "/home/kali/scripts/port_scanner.py",
    content: `#!/usr/bin/env python3
"""
Simple Multithreaded TCP Port Scanner
Author: kali
Target: 192.168.1.105
"""
import sys
import time

def scan_target(host, ports):
    print(f"[*] Starting TCP Scan on target: {host}")
    print(f"[*] Scanning {len(ports)} common ports...")
    time.sleep(0.5)

    services = {
        21: "FTP (vsftpd 3.0.3)",
        22: "SSH (OpenSSH 8.9p1 Ubuntu)",
        80: "HTTP (Apache/2.4.52)",
        443: "HTTPS (OpenSSL 3.0.2)",
        3306: "MySQL (8.0.35 Community)",
        8080: "HTTP-Proxy (Nginx reverse proxy)"
    }

    for p in ports:
        if p in services:
            print(f"[+] [OPEN] Port {p}/tcp - Service: {services[p]}")
        else:
            print(f"[-] [CLOSED] Port {p}/tcp")
        time.sleep(0.15)

    print("\n[+] Scan completed. 6 open ports identified.")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "192.168.1.105"
    scan_target(target, [21, 22, 25, 80, 110, 143, 443, 3306, 5432, 8080])
`,
    isDir: false,
    permissions: "-rwxr-xr-x",
    size: 920,
    type: "python",
    modified: "2026-10-11 02:10:00",
  },
  "/home/kali/scripts/wifi_deauth.sh": {
    name: "wifi_deauth.sh",
    path: "/home/kali/scripts/wifi_deauth.sh",
    content: `#!/usr/bin/env bash
# Wireless 802.11 Frame Injection & Deauth Proof-of-Concept
echo "[*] Initializing wireless interface wlan0..."
echo "[*] Setting wlan0 into IEEE 802.11 Monitor mode (mon0)..."
sleep 1
echo "[+] Interface mon0 active on Channel 6 (2.437 GHz)"
echo "[*] Targeting BSSID: [00:14:D1:E8:4A:9C] (CorpNet-5G)"
echo "[*] Transmitting 16 IEEE 802.11 Deauthentication frames..."
sleep 0.8
echo "[+] Frame [1/16] broadcast sent (ACK received)"
echo "[+] Frame [8/16] broadcast sent (ACK received)"
echo "[+] Frame [16/16] broadcast complete."
echo "[*] WPA2 4-way handshake captured: CorpNet-5G.cap [EAPOL]"
echo "[✔] Finished successfully. Handshake saved to /home/kali/Downloads/"
`,
    isDir: false,
    permissions: "-rwxr-xr-x",
    size: 710,
    type: "bash",
    modified: "2026-10-11 02:12:00",
  },
  "/home/kali/scripts/recon_tool.py": {
    name: "recon_tool.py",
    path: "/home/kali/scripts/recon_tool.py",
    content: `#!/usr/bin/env python3
"""
Web Target Header & Technology Recon Tool
"""
import sys

def banner_grab(target_url):
    print(f"[!] Probing target web infrastructure: {target_url}")
    print("[*] Sending HTTP/1.1 GET request with User-Agent: Mozilla/5.0...")
    
    headers = {
        "Status": "200 OK",
        "Server": "nginx/1.24.0 (Ubuntu)",
        "X-Powered-By": "PHP/8.2.14",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "default-src 'self'",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
    }

    for k, v in headers.items():
        print(f"    {k}: {v}")

    print("\n[+] Technology Stack Detected:")
    print("    - Web Server: Nginx 1.24.0")
    print("    - Backend: PHP 8.2")
    print("    - CDN/Proxy: Cloudflare")
    print("[*] Completed header enumeration.")

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "https://target.corp.internal"
    banner_grab(url)
`,
    isDir: false,
    permissions: "-rwxr-xr-x",
    size: 890,
    type: "python",
    modified: "2026-10-11 02:15:00",
  },
  "/home/kali/scripts/hello.py": {
    name: "hello.py",
    path: "/home/kali/scripts/hello.py",
    content: `#!/usr/bin/env python3
# Kali Linux Python 3.12 Script Test
import sys
import os

print("Hello from Kali Linux Web Desktop!")
print("Kernel Environment: WebAssembly Client Container")
print(f"Python interpreter: {sys.version.split()[0]}")
print("System ready for security auditing.")
`,
    isDir: false,
    permissions: "-rwxr-xr-x",
    size: 290,
    type: "python",
    modified: "2026-10-11 02:18:00",
  },
  "/home/kali/Downloads": {
    name: "Downloads",
    path: "/home/kali/Downloads",
    content: "",
    isDir: true,
    permissions: "drwxr-xr-x",
    type: "dir",
    modified: "2026-10-11 02:00:00",
  },
  "/etc": {
    name: "etc",
    path: "/etc",
    content: "",
    isDir: true,
    permissions: "drwxr-xr-x",
    type: "dir",
    modified: "2026-10-11 02:00:00",
  },
  "/etc/os-release": {
    name: "os-release",
    path: "/etc/os-release",
    content: `PRETTY_NAME="Kali GNU/Linux Rolling"
NAME="Kali GNU/Linux"
VERSION_ID="2026.1"
VERSION="2026.1"
VERSION_CODENAME="kali-rolling"
ID=kali
ID_LIKE=debian
HOME_URL="https://www.kali.org/"
SUPPORT_URL="https://forums.kali.org/"
BUG_REPORT_URL="https://bugs.kali.org/"
ANSI_COLOR="1;31"
`,
    isDir: false,
    permissions: "-rw-r--r--",
    size: 260,
    type: "text",
    modified: "2026-10-11 02:00:00",
  },
  "/etc/passwd": {
    name: "passwd",
    path: "/etc/passwd",
    content: `root:x:0:0:root:/root:/usr/bin/zsh
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
kali:x:1000:1000:Kali Live User,,,:/home/kali:/usr/bin/zsh
sshd:x:105:65534::/run/sshd:/usr/sbin/nologin
mysql:x:106:114:MySQL Server,,,:/nonexistent:/bin/false
`,
    isDir: false,
    permissions: "-rw-r--r--",
    size: 320,
    type: "text",
    modified: "2026-10-11 02:00:00",
  },
  "/etc/hosts": {
    name: "hosts",
    path: "/etc/hosts",
    content: `127.0.0.1       localhost
127.0.1.1       kali
192.168.1.1     gateway.local
192.168.1.105   target-server.internal
192.168.1.120   corp-dc01.ad.internal

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
`,
    isDir: false,
    permissions: "-rw-r--r--",
    size: 290,
    type: "text",
    modified: "2026-10-11 02:00:00",
  },
  "/var": {
    name: "var",
    path: "/var",
    content: "",
    isDir: true,
    permissions: "drwxr-xr-x",
    type: "dir",
    modified: "2026-10-11 02:00:00",
  },
  "/var/log": {
    name: "log",
    path: "/var/log",
    content: "",
    isDir: true,
    permissions: "drwxr-xr-x",
    type: "dir",
    modified: "2026-10-11 02:00:00",
  },
  "/var/log/syslog": {
    name: "syslog",
    path: "/var/log/syslog",
    content: `Oct 11 02:00:01 kali kernel: [    0.000000] Linux version 6.8.11-amd64 (devel@kali.org) #1 SMP PREEMPT_DYNAMIC
Oct 11 02:00:01 kali kernel: [    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.8.11-amd64 root=UUID=kali-fs ro quiet splash
Oct 11 02:00:02 kali kernel: [    1.240192] eth0: link up, 1000Mbps, full-duplex, lpa 0xCDE1
Oct 11 02:00:03 kali systemd[1]: Starting NetworkManager.service - Network Manager...
Oct 11 02:00:04 kali NetworkManager[684]: <info>  [1712800004.1] manager: NetworkManager state is now CONNECTED_GLOBAL
Oct 11 02:00:05 kali systemd[1]: Started NetworkManager.service.
Oct 11 02:00:06 kali systemd[1]: Started Light Display Manager.
Oct 11 02:00:08 kali session: user kali logged in on tty7
`,
    isDir: false,
    permissions: "-rw-r--r--",
    size: 670,
    type: "text",
    modified: "2026-10-11 02:00:00",
  },
};

export function normalizePath(path: string): string {
  if (!path) return "/";
  let clean = path.replace(/\\/g, "/");
  if (!clean.startsWith("/")) clean = "/" + clean;
  // Resolve . and ..
  const segments = clean.split("/").filter(Boolean);
  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === ".") continue;
    if (seg === "..") {
      resolved.pop();
    } else {
      resolved.push(seg);
    }
  }
  return "/" + resolved.join("/");
}

export function resolvePath(currentDir: string, targetPath: string): string {
  if (!targetPath || targetPath === ".") return currentDir;
  if (targetPath === "~" || targetPath.startsWith("~/")) {
    const sub = targetPath.slice(1);
    return normalizePath("/home/kali" + (sub.startsWith("/") ? sub : "/" + sub));
  }
  if (targetPath.startsWith("/")) {
    return normalizePath(targetPath);
  }
  return normalizePath(`${currentDir}/${targetPath}`);
}

export function getFile(vfs: VirtualFileSystem, path: string): VirtualFile | undefined {
  const norm = normalizePath(path);
  return vfs[norm];
}

export function listDirectory(vfs: VirtualFileSystem, dirPath: string): VirtualFile[] {
  const norm = normalizePath(dirPath);
  const prefix = norm === "/" ? "/" : `${norm}/`;
  const result: VirtualFile[] = [];

  for (const [p, file] of Object.entries(vfs)) {
    if (p === norm) continue;
    if (p.startsWith(prefix)) {
      const rest = p.slice(prefix.length);
      // Only direct children (no additional slashes)
      if (!rest.includes("/")) {
        result.push(file);
      }
    }
  }

  // Sort directories first, then alphabetical
  return result.sort((a, b) => {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return a.name.localeCompare(b.name);
  });
}

export function writeFile(
  vfs: VirtualFileSystem,
  filePath: string,
  content: string
): { success: boolean; vfs: VirtualFileSystem; message?: string } {
  const norm = normalizePath(filePath);
  const existing = vfs[norm];

  const ext = norm.split(".").pop() || "";
  let type: VirtualFile["type"] = "text";
  if (ext === "py") type = "python";
  else if (ext === "sh") type = "bash";
  else if (ext === "md") type = "markdown";
  else if (ext === "json") type = "json";

  const name = norm.split("/").pop() || "untitled";
  const updatedFile: VirtualFile = {
    name,
    path: norm,
    content,
    isDir: false,
    permissions: existing ? existing.permissions : "-rw-r--r--",
    size: new Blob([content]).size,
    type,
    modified: new Date().toISOString().replace("T", " ").substring(0, 19),
  };

  return {
    success: true,
    vfs: {
      ...vfs,
      [norm]: updatedFile,
    },
  };
}

export function createDirectory(
  vfs: VirtualFileSystem,
  dirPath: string
): { success: boolean; vfs: VirtualFileSystem; message?: string } {
  const norm = normalizePath(dirPath);
  if (vfs[norm]) {
    return { success: false, vfs, message: `mkdir: cannot create directory '${norm}': File exists` };
  }

  const name = norm.split("/").pop() || "dir";
  const newDir: VirtualFile = {
    name,
    path: norm,
    content: "",
    isDir: true,
    permissions: "drwxr-xr-x",
    type: "dir",
    modified: new Date().toISOString().replace("T", " ").substring(0, 19),
  };

  return {
    success: true,
    vfs: {
      ...vfs,
      [norm]: newDir,
    },
  };
}

export function deleteEntry(
  vfs: VirtualFileSystem,
  path: string
): { success: boolean; vfs: VirtualFileSystem; message?: string } {
  const norm = normalizePath(path);
  if (!vfs[norm]) {
    return { success: false, vfs, message: `rm: cannot remove '${norm}': No such file or directory` };
  }

  const nextVfs = { ...vfs };
  // If directory, remove all children as well
  const prefix = norm === "/" ? "/" : `${norm}/`;
  for (const p of Object.keys(nextVfs)) {
    if (p === norm || p.startsWith(prefix)) {
      delete nextVfs[p];
    }
  }

  return { success: true, vfs: nextVfs };
}
