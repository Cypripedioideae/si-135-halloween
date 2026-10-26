"use client";

interface Hint {
  id: number;
  title: string;
  status: "unlocked" | "active" | "pending" | "locked";
  hintText?: string;
  missionPoem?: string;
  missionTitle?: string;
  missionDescription?: string;
  imageCap?: number;
}

interface HintCardProps {
  hint: Hint;
  onOpenMission: (hint: Hint) => void;
}

export default function HintCard({ hint, onOpenMission }: HintCardProps) {
  const isUnlocked = hint.status === "unlocked";
  const isActive = hint.status === "active";
  const isPending = hint.status === "pending";
  const isLocked = hint.status === "locked";

  return (
    <div
      className={`relative rounded-2xl p-6 transition-all duration-300 border flex flex-col justify-between ${
        isUnlocked
          ? "bg-amber-950/20 border-amber-500/40 shadow-lg shadow-orange-500/10"
          : isActive
            ? "bg-orange-950/30 border-orange-500 hover:border-orange-400 hover:scale-[1.02] shadow-xl shadow-orange-600/20"
            : isPending
              ? "bg-purple-950/20 border-purple-500/50"
              : "bg-zinc-900/50 border-zinc-800 opacity-65"
      }`}
    >
      {/* Top Header Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
          Hint #{hint.id}
        </span>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            isUnlocked
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : isActive
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/30 animate-pulse"
                : isPending
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {isUnlocked
            ? "UNLOCKED"
            : isActive
              ? "READY"
              : isPending
                ? "PENDING REVIEW"
                : "LOCKED"}
        </span>
      </div>

      {/* Middle Content */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xl font-bold text-white tracking-wide">
          {hint.missionTitle || hint.title}
        </h3>

        {/* Content depending on status */}
        {isUnlocked && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
            <p className="text-xs font-semibold uppercase text-amber-400 mb-1">
              Hint Revealed:
            </p>
            <p className="text-sm font-medium">{hint.hintText}</p>
          </div>
        )}

        {isActive && (
          <p className="text-sm text-zinc-400 line-clamp-2">
            {hint.missionDescription || "Click to see mission details and submit proof."}
          </p>
        )}

        {isPending && (
          <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs text-purple-300">
            Submission under review by the council.
          </div>
        )}

        {isLocked && (
          <p className="text-sm text-zinc-600">
            Complete previous missions to reveal this hint.
          </p>
        )}
      </div>

      {/* Action Button */}
      <div>
        {isActive && (
          <button
            onClick={() => onOpenMission(hint)}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-orange-600 hover:bg-orange-500 text-white transition duration-200 shadow-lg shadow-orange-600/30 cursor-pointer"
          >
            Open Mission
          </button>
        )}
        {isPending && (
          <button
            onClick={() => onOpenMission(hint)}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-zinc-800 hover:bg-zinc-700 text-purple-300 transition duration-200 border border-purple-500/30 cursor-pointer"
          >
            View Submission
          </button>
        )}
        {isUnlocked && (
          <button
            onClick={() => onOpenMission(hint)}
            className="w-full py-2 px-4 rounded-xl font-medium text-xs bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Review Mission
          </button>
        )}
        {isLocked && (
          <div className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-zinc-900 border border-zinc-800 text-zinc-600 text-center cursor-not-allowed">
            🔒 Locked
          </div>
        )}
      </div>
    </div>
  );
}
