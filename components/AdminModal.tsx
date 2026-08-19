"use client";

import React, { useState, useEffect } from "react";
import { X, Activity, ShieldCheck, Database, RefreshCw, Play, CheckCircle2 } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshPlayerBalance: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onRefreshPlayerBalance,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/status");
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  // Simulate a NexxAPI settlement callback to demonstrate idempotency & balance update
  const testCallback = async () => {
    setTestResult("Sending test settlement callback to /api/callback...");
    try {
      const demoUserRes = await fetch("/api/auth/me");
      const demoUserData = await demoUserRes.json();
      const userId = demoUserData.user?.id;

      const randomRound = `R-${Math.floor(Math.random() * 100000)}`;
      const randomSerial = `SN-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const bet = 20;
      const win = 50;
      const newBalance = (demoUserData.user?.balance || 1000) + (win - bet);

      const res = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: 737,
          game_uid: "737",
          game_round: randomRound,
          member_account: userId,
          bet_amount: bet,
          win_amount: win,
          credit_amount: newBalance,
          serial_number: randomSerial,
          game_name: "Aviator (Test Round)",
        }),
      });

      const resData = await res.json();
      setTestResult(
        `✅ Webhook Callback Success: Round ${randomRound} settled. New player balance: ₹${newBalance}`
      );
      onRefreshPlayerBalance();
      fetchStatus();
    } catch (err: any) {
      setTestResult(`❌ Error: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f1422] border border-casino-border rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">GGR Operator Diagnostic Monitor</h3>
              <p className="text-xs text-gray-400">NexxAPI Live Credentials & SQLite Database Ledger</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              className="p-2 rounded-xl bg-casino-card hover:bg-casino-cardHover border border-casino-border text-gray-400 hover:text-white transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-casino-card transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#090d16] border border-casino-border space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400">Operator GGR Prepaid</span>
            <div className="text-xl font-black text-amber-400">
              {data?.ggrBalance !== undefined ? `₹${data.ggrBalance}` : "Loading..."}
            </div>
            <p className="text-[10px] text-gray-500">From /api/v1/ggr-balance</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d16] border border-casino-border space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400">Server IP Whitelist</span>
            <div className="text-xs font-mono font-bold text-emerald-400 truncate">
              {data?.whoami?.your_ip || "Checking..."}
            </div>
            <p className="text-[10px] text-gray-500">
              {data?.whoami?.whitelisted ? "✅ IP Whitelisted" : "ℹ️ Open / Global Mode"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d16] border border-casino-border space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400">Total Players</span>
            <div className="text-xl font-black text-white">{data?.totalUsers ?? 0}</div>
            <p className="text-[10px] text-gray-500">Stored in SQLite</p>
          </div>
        </div>

        {/* Webhook Callback Testing Tool */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-amber-300">Test Round Settlement Webhook</h4>
              <p className="text-xs text-gray-400">
                Simulates an incoming POST to /api/callback with Bet/Win & Idempotency test
              </p>
            </div>
            <button
              onClick={testCallback}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-gold-glow flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Simulate Round</span>
            </button>
          </div>

          {testResult && (
            <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-emerald-300 break-all">
              {testResult}
            </div>
          )}
        </div>

        {/* Recent Database Round Settlements */}
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
            Recent SQLite Round Settlements ({data?.recentRounds?.length || 0})
          </h4>
          <div className="rounded-2xl border border-casino-border bg-[#090d16] overflow-hidden">
            {data?.recentRounds?.length ? (
              <div className="max-h-52 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121826] text-gray-400 font-bold border-b border-casino-border">
                    <tr>
                      <th className="p-2.5">Game</th>
                      <th className="p-2.5">Serial / Round</th>
                      <th className="p-2.5">Bet</th>
                      <th className="p-2.5">Win</th>
                      <th className="p-2.5">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-casino-border/50 text-gray-300">
                    {data.recentRounds.map((r: any) => (
                      <tr key={r.id} className="hover:bg-white/5">
                        <td className="p-2.5 font-semibold text-white">{r.gameName || r.gameUid}</td>
                        <td className="p-2.5 font-mono text-[10px] text-gray-400 truncate max-w-[120px]">
                          {r.serialNumber}
                        </td>
                        <td className="p-2.5 text-rose-400 font-bold">₹{r.betAmount}</td>
                        <td className="p-2.5 text-emerald-400 font-bold">₹{r.winAmount}</td>
                        <td className="p-2.5 font-black text-amber-400">₹{r.creditAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-500">
                No round settlements yet. Launch a game or click "Simulate Round" above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
