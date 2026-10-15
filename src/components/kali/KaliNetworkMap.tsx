"use client";

import React, { useState } from "react";
import { NetworkNode } from "@/types/kali";
import {
  Globe,
  Radio,
  Server,
  Laptop,
  ShieldAlert,
  Cpu,
  Wifi,
  Terminal,
  Activity,
  Layers,
  Search,
  CheckCircle,
} from "lucide-react";

interface KaliNetworkMapProps {
  onScanInTerminal?: (cmd: string) => void;
}

const DEFAULT_NODES: NetworkNode[] = [
  {
    id: "kali-host",
    ip: "192.168.1.137",
    mac: "08:00:27:4A:39:A2",
    hostname: "kali-desktop",
    os: "Kali GNU/Linux Rolling 2026.1",
    status: "up",
    type: "kali",
    latency: "0.02ms",
    ports: [
      { port: 22, proto: "tcp", state: "open", service: "ssh", version: "OpenSSH 9.6p1" },
      { port: 8080, proto: "tcp", state: "closed", service: "http-proxy", version: "" },
    ],
  },
  {
    id: "router",
    ip: "192.168.1.1",
    mac: "C4:EA:1D:90:B2:10",
    hostname: "gateway.corp.local",
    os: "OpenWrt 23.05.2 (Linux 5.15)",
    status: "up",
    type: "router",
    latency: "1.45ms",
    ports: [
      { port: 53, proto: "udp", state: "open", service: "domain", version: "dnsmasq-2.89" },
      { port: 80, proto: "tcp", state: "open", service: "http", version: "uHTTPd/1.0.0" },
      { port: 443, proto: "tcp", state: "open", service: "https", version: "LuCI Web Admin" },
    ],
  },
  {
    id: "target-linux",
    ip: "192.168.1.105",
    mac: "52:54:00:12:34:56",
    hostname: "target-prod.corp.internal",
    os: "Ubuntu Linux 22.04 LTS (Jammy)",
    status: "up",
    type: "server",
    latency: "3.20ms",
    vulnerabilities: [
      "CVE-2023-38606: Apache Path Traversal",
      "Weak SSH Ciphers Enabled",
      "MySQL Publicly Accessible Port 3306",
    ],
    ports: [
      { port: 21, proto: "tcp", state: "open", service: "ftp", version: "vsftpd 3.0.3" },
      { port: 22, proto: "tcp", state: "open", service: "ssh", version: "OpenSSH 8.9p1 Ubuntu" },
      { port: 80, proto: "tcp", state: "open", service: "http", version: "Apache httpd 2.4.52" },
      { port: 443, proto: "tcp", state: "open", service: "https", version: "Apache SSL" },
      { port: 3306, proto: "tcp", state: "open", service: "mysql", version: "MySQL 8.0.35" },
      { port: 8080, proto: "tcp", state: "open", service: "http-proxy", version: "Nginx 1.24.0" },
    ],
  },
  {
    id: "target-win",
    ip: "192.168.1.120",
    mac: "00:15:5D:89:FE:33",
    hostname: "CORP-DC01.lab.local",
    os: "Microsoft Windows Server 2022",
    status: "up",
    type: "workstation",
    latency: "4.12ms",
    vulnerabilities: ["SMBv1 Protocol Negotiation Allowed", "Print Spooler Remote Code Exec"],
    ports: [
      { port: 88, proto: "tcp", state: "open", service: "kerberos-sec", version: "Microsoft Kerberos" },
      { port: 135, proto: "tcp", state: "open", service: "msrpc", version: "Microsoft Windows RPC" },
      { port: 139, proto: "tcp", state: "open", service: "netbios-ssn", version: "NetBIOS" },
      { port: 445, proto: "tcp", state: "open", service: "microsoft-ds", version: "Windows SMB" },
      { port: 3389, proto: "tcp", state: "open", service: "ms-wbt-server", version: "MS Terminal Services (RDP)" },
    ],
  },
  {
    id: "iot-cam",
    ip: "192.168.1.44",
    mac: "AC:CF:23:44:11:8A",
    hostname: "IP-CAM-LOBBY",
    os: "Embedded Linux (BusyBox 1.20)",
    status: "up",
    type: "iot",
    latency: "12.8ms",
    vulnerabilities: ["Default Credentials (admin / admin)", "Unauthenticated RTSP Stream"],
    ports: [
      { port: 554, proto: "tcp", state: "open", service: "rtsp", version: "Live555 RTSP Server" },
      { port: 8080, proto: "tcp", state: "open", service: "http", version: "GoAhead WebServer" },
    ],
  },
];

export function KaliNetworkMap({ onScanInTerminal }: KaliNetworkMapProps) {
  const [nodes, setNodes] = useState<NetworkNode[]>(DEFAULT_NODES);
  const [selectedNode, setSelectedNode] = useState<NetworkNode>(DEFAULT_NODES[2]);
  const [isScanning, setIsScanning] = useState(false);
  const [targetSubnet, setTargetSubnet] = useState("192.168.1.0/24");
  const [scanProfile, setScanProfile] = useState("Intense Scan (-T4 -A -v)");

  const handleStartScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 2500);
  };

  const handleTerminalScan = (ip: string) => {
    if (onScanInTerminal) {
      onScanInTerminal(`nmap -sS -sV -T4 ${ip}`);
    }
  };

  return (
    <div className="w-full h-full bg-[#0d1017] text-slate-200 flex flex-col font-sans select-none overflow-hidden">
      {/* Zenmap Control Bar */}
      <div className="h-12 bg-[#141824] border-b border-[#222a3d] px-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1 max-w-xl">
          <div className="flex items-center space-x-1.5 bg-[#0b0e14] px-2.5 py-1.5 rounded border border-[#2b354d] text-slate-300 flex-1">
            <span className="text-slate-400 font-semibold text-[11px]">Target:</span>
            <input
              type="text"
              value={targetSubnet}
              onChange={(e) => setTargetSubnet(e.target.value)}
              className="bg-transparent text-sky-400 font-mono text-xs outline-none flex-1"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-[#0b0e14] px-2.5 py-1.5 rounded border border-[#2b354d] text-slate-300">
            <span className="text-slate-400 font-semibold text-[11px] hidden sm:inline">Profile:</span>
            <select
              value={scanProfile}
              onChange={(e) => setScanProfile(e.target.value)}
              className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer"
            >
              <option className="bg-[#141824]" value="Intense Scan (-T4 -A -v)">Intense Scan (-T4 -A -v)</option>
              <option className="bg-[#141824]" value="Quick Port Scan (-sS -F)">Quick Port Scan (-sS -F)</option>
              <option className="bg-[#141824]" value="Ping Sweep (-sn)">Ping Sweep (-sn)</option>
              <option className="bg-[#141824]" value="All TCP Ports (-p-)">All TCP Ports (-p-)</option>
            </select>
          </div>

          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 text-xs transition-all ${
              isScanning
                ? "bg-sky-700/60 text-sky-200 cursor-wait animate-pulse"
                : "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Scanning Subnet..." : "Scan"}</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{nodes.length} Hosts Discovered</span>
          </span>
        </div>
      </div>

      {/* Main Content: Left Topology Visualizer, Right Host Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Topology Visualizer Canvas Area */}
        <div className="flex-1 bg-[#090c12] relative overflow-hidden flex flex-col items-center justify-center p-6 border-r border-[#1e2536]">
          {/* Sonar Radar Background Lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[600px] h-[600px] rounded-full border border-sky-500/40 absolute"></div>
            <div className="w-[420px] h-[420px] rounded-full border border-sky-500/50 absolute"></div>
            <div className="w-[240px] h-[240px] rounded-full border border-sky-500/60 absolute"></div>
            <div className="w-full h-[1px] bg-sky-500/20 absolute"></div>
            <div className="h-full w-[1px] bg-sky-500/20 absolute"></div>
          </div>

          {/* Radar Sweep Effect when scanning */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[600px] h-[600px] rounded-full border-2 border-cyan-400/80 animate-ping"></div>
            </div>
          )}

          {/* Subnet Topology Title */}
          <div className="absolute top-4 left-4 z-10 bg-[#121622]/90 border border-[#232b3d] px-3 py-1.5 rounded text-[11px] font-mono text-slate-300 flex items-center space-x-2">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Subnet: {targetSubnet}</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">Topology: Star (Ethernet 802.3)</span>
          </div>

          {/* Interactive Nodes Map */}
          <div className="relative z-10 w-full max-w-2xl h-full flex items-center justify-around flex-wrap gap-6 p-4">
            {nodes.map((node) => {
              const isSelected = selectedNode.id === node.id;
              const isKali = node.type === "kali";

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`cursor-pointer group flex flex-col items-center p-3 rounded-xl border transition-all duration-200 transform hover:scale-105 ${
                    isSelected
                      ? "bg-[#182033] border-cyan-400 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50"
                      : "bg-[#111624] border-[#222b3e] hover:border-slate-500"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors relative ${
                      isKali
                        ? "bg-red-950/70 text-red-400 border border-red-500/60"
                        : node.type === "router"
                        ? "bg-purple-950/70 text-purple-400 border border-purple-500/60"
                        : node.type === "server"
                        ? "bg-blue-950/70 text-blue-400 border border-blue-500/60"
                        : node.type === "workstation"
                        ? "bg-amber-950/70 text-amber-400 border border-amber-500/60"
                        : "bg-emerald-950/70 text-emerald-400 border border-emerald-500/60"
                    }`}
                  >
                    {isKali ? (
                      <Terminal className="w-6 h-6 text-red-400" />
                    ) : node.type === "router" ? (
                      <Globe className="w-6 h-6 text-purple-400" />
                    ) : node.type === "server" ? (
                      <Server className="w-6 h-6 text-blue-400" />
                    ) : node.type === "workstation" ? (
                      <Laptop className="w-6 h-6 text-amber-400" />
                    ) : (
                      <Radio className="w-6 h-6 text-emerald-400" />
                    )}

                    {/* Ping indicator */}
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d1017]"></span>
                  </div>

                  <span className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300">
                    {node.hostname}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">{node.ip}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">{node.ports.length} ports open</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Host Details Inspector */}
        <div className="w-80 bg-[#10141f] flex flex-col border-l border-[#202738] overflow-y-auto p-4 text-xs select-none">
          <div className="flex items-center justify-between pb-3 border-b border-[#202738]">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">{selectedNode.hostname}</h3>
              <p className="text-[11px] font-mono text-cyan-400">{selectedNode.ip}</p>
            </div>
            <button
              onClick={() => handleTerminalScan(selectedNode.ip)}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium flex items-center space-x-1 shadow transition-colors"
              title="Launch Nmap scan against this target in Terminal"
            >
              <Terminal className="w-3 h-3" />
              <span className="text-[11px]">Nmap</span>
            </button>
          </div>

          {/* System Specs */}
          <div className="py-3 space-y-1.5 border-b border-[#202738] text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Host is UP ({selectedNode.latency})</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MAC Address:</span>
              <span className="font-mono text-slate-300">{selectedNode.mac}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">OS Guess:</span>
              <span className="text-slate-200 text-right max-w-[170px] truncate">{selectedNode.os}</span>
            </div>
          </div>

          {/* Open Ports List */}
          <div className="py-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-300 text-xs uppercase tracking-wider">
                Open Ports ({selectedNode.ports.length})
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">TCP / UDP</span>
            </div>

            <div className="space-y-1.5">
              {selectedNode.ports.map((p) => (
                <div
                  key={`${p.port}-${p.proto}`}
                  className="bg-[#141a29] border border-[#222c42] p-2 rounded flex flex-col gap-0.5 text-[11px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400">
                      {p.port}/{p.proto}
                    </span>
                    <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded text-[10px] font-medium uppercase">
                      {p.state}
                    </span>
                  </div>
                  <div className="text-slate-300 font-medium">{p.service}</div>
                  {p.version && <div className="text-slate-500 text-[10px] font-mono">{p.version}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Vulnerabilities & Findings */}
          {selectedNode.vulnerabilities && selectedNode.vulnerabilities.length > 0 && (
            <div className="pt-3 border-t border-[#202738]">
              <div className="flex items-center space-x-1 text-amber-400 font-semibold mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Security Alerts ({selectedNode.vulnerabilities.length})</span>
              </div>
              <div className="space-y-1">
                {selectedNode.vulnerabilities.map((v, i) => (
                  <div
                    key={i}
                    className="bg-amber-950/30 border border-amber-900/40 text-amber-200 p-1.5 rounded text-[10px]"
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
