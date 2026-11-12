import { loadFont } from "@remotion/google-fonts/Inter";
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "800"] });

const INK = "#1f2937";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";
const TONES = { accent: "#4f46e5", red: "#dc2626", green: "#16a34a", amber: "#d97706", ink: INK };
type Tone = keyof typeof TONES;

type Item = { icon?: string; label: string; sub?: string; stamp?: string; tone?: Tone };
type Stat = { value: number; prefix?: string; suffix?: string; label: string; tone?: Tone };
type Side = { icon: string; label: string; points: string[] };
type Point = { icon: string; text: string };

export type Scene = {
  scene: "title" | "flow" | "stats" | "cards" | "grid" | "compare" | "bullets" | "outro";
  text: string;
  from: number;
  duration: number;
  title?: string;
  kicker?: string;
  big?: string;
  emoji?: string;
  note?: string;
  tone?: Tone;
  steps?: Item[];
  items?: (Item & Stat)[];
  total?: number;
  highlighted?: number;
  icon?: string;
  highlightIcon?: string;
  left?: Side;
  right?: Side;
  points?: Point[];
};
export type ExplainerProps = { total: number; scenes: Scene[]; audio?: string };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const usePop = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 140 } });
};

const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: interpolate(frame, [delay, delay + 12], [0, 1], clamp),
        translate: interpolate(frame, [delay, delay + 18], ["0px 40px", "0px 0px"], { ...clamp, easing: ease }),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: "#fff", border: `3px solid ${LINE}`, borderRadius: 28, boxShadow: "0 20px 60px rgba(31,41,55,.10)", ...style }}>{children}</div>
);

const Heading: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 64, color = INK }) => (
  <Rise>
    <div style={{ fontSize: size, fontWeight: 800, color, letterSpacing: "-0.02em", textAlign: "center", maxWidth: 1600 }}>{children}</div>
  </Rise>
);

const Stage: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 60 }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap }}>{children}</AbsoluteFill>
);

const stagger = (count: number, duration: number, i: number) => 15 + i * Math.min(35, (duration * 0.55) / Math.max(count, 1));

const Title: React.FC<{ s: Scene }> = ({ s }) => {
  const p = usePop(8);
  const big = s.big ?? "";
  return (
    <Stage gap={30}>
      {s.kicker && <Heading size={56} color={MUTED}>{s.kicker}</Heading>}
      <div style={{ display: "flex", alignItems: "center", gap: 40, scale: p }}>
        {s.emoji && <div style={{ fontSize: 200 }}>{s.emoji}</div>}
        <div style={{ fontSize: big.length <= 4 ? 340 : big.length <= 10 ? 200 : 120, fontWeight: 800, color: TONES[s.tone ?? "accent"], lineHeight: 1, letterSpacing: "-0.03em" }}>{big}</div>
      </div>
      {s.note && (
        <Rise delay={30}>
          <div style={{ fontSize: 44, color: MUTED }}>{s.note}</div>
        </Rise>
      )}
    </Stage>
  );
};

const Flow: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const steps = s.steps ?? [];
  return (
    <Stage>
      {s.title && <Heading>{s.title}</Heading>}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {steps.map((st, i) => {
          const at = stagger(steps.length, s.duration, i);
          return (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ fontSize: 64, color: TONES.accent, opacity: interpolate(frame, [at - 6, at + 4], [0, 1], clamp) }}>→</div>}
              <Rise delay={at}>
                <Card style={{ width: 300, padding: "36px 20px", textAlign: "center", borderColor: TONES[st.tone ?? "accent"] }}>
                  <div style={{ fontSize: 96 }}>{st.icon}</div>
                  <div style={{ fontSize: 34, fontWeight: 700, marginTop: 16 }}>{st.label}</div>
                </Card>
              </Rise>
            </React.Fragment>
          );
        })}
      </div>
    </Stage>
  );
};

const Counter: React.FC<{ st: Stat; delay: number }> = ({ st, delay }) => {
  const frame = useCurrentFrame();
  const decimals = (String(st.value).split(".")[1] ?? "").length;
  const v = interpolate(frame, [delay, delay + 40], [0, st.value], { ...clamp, easing: ease });
  return (
    <Rise delay={delay}>
      <Card style={{ width: 520, padding: "50px 30px", textAlign: "center" }}>
        <div style={{ fontSize: 104, fontWeight: 800, color: TONES[st.tone ?? "accent"], lineHeight: 1 }}>
          {st.prefix}
          {v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
          {st.suffix}
        </div>
        <div style={{ fontSize: 36, color: MUTED, marginTop: 20 }}>{st.label}</div>
      </Card>
    </Rise>
  );
};

const Stats: React.FC<{ s: Scene }> = ({ s }) => {
  const items = s.items ?? [];
  return (
    <Stage>
      {s.title && <Heading>{s.title}</Heading>}
      <div style={{ display: "flex", gap: 50 }}>
        {items.map((st, i) => (
          <Counter key={i} st={st} delay={stagger(items.length, s.duration, i)} />
        ))}
      </div>
    </Stage>
  );
};

const CardItem: React.FC<{ it: Item; delay: number }> = ({ it, delay }) => {
  const stamp = usePop(delay + 25);
  const color = TONES[it.tone ?? "accent"];
  return (
    <Rise delay={delay}>
      <Card style={{ width: 500, padding: 36, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {it.icon && <div style={{ fontSize: 96 }}>{it.icon}</div>}
          <div>
            <div style={{ fontSize: 40, fontWeight: 800 }}>{it.label}</div>
            {it.sub && <div style={{ fontSize: 30, color: MUTED, marginTop: 8 }}>{it.sub}</div>}
          </div>
        </div>
        {it.stamp && (
          <div
            style={{
              position: "absolute",
              right: -30,
              bottom: -30,
              padding: "10px 24px",
              border: `6px solid ${color}`,
              color,
              borderRadius: 14,
              fontSize: 38,
              fontWeight: 800,
              background: "#fff",
              rotate: "-12deg",
              scale: interpolate(stamp, [0, 1], [2.2, 1]),
              opacity: stamp,
            }}
          >
            {it.stamp}
          </div>
        )}
      </Card>
    </Rise>
  );
};

const Cards: React.FC<{ s: Scene }> = ({ s }) => {
  const items = s.items ?? [];
  return (
    <Stage gap={70}>
      {s.title && <Heading>{s.title}</Heading>}
      <div style={{ display: "flex", gap: 50, scale: items.length > 2 ? 0.9 : 1 }}>
        {items.map((it, i) => (
          <CardItem key={i} it={it} delay={stagger(items.length, s.duration, i)} />
        ))}
      </div>
    </Stage>
  );
};

const Grid: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const total = s.total ?? 10;
  const color = TONES[s.tone ?? "red"];
  return (
    <Stage gap={70}>
      {s.title && <Heading>{s.title}</Heading>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(total, 5)}, 170px)`, gap: 36 }}>
        {Array.from({ length: total }, (_, i) => {
          const hot = i < (s.highlighted ?? 0);
          const flip = interpolate(frame, [30 + i * 8, 40 + i * 8], [0, 1], clamp);
          const on = flip > 0.5;
          return (
            <div
              key={i}
              style={{
                height: 170,
                borderRadius: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 90,
                background: hot ? `color-mix(in srgb, ${color} ${12 * flip}%, white)` : "#fff",
                border: `4px solid ${on && hot ? color : LINE}`,
              }}
            >
              {on && hot ? s.highlightIcon ?? s.icon : s.icon}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const SideCard: React.FC<{ side: Side; tone: Tone; delay: number }> = ({ side, tone, delay }) => (
  <Rise delay={delay}>
    <Card style={{ width: 640, padding: 44, borderColor: TONES[tone] }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ fontSize: 90 }}>{side.icon}</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: TONES[tone] }}>{side.label}</div>
      </div>
      {side.points.map((p, i) => (
        <div key={i} style={{ fontSize: 36, marginTop: 22, color: INK }}>
          • {p}
        </div>
      ))}
    </Card>
  </Rise>
);

const Compare: React.FC<{ s: Scene }> = ({ s }) => (
  <Stage>
    {s.title && <Heading>{s.title}</Heading>}
    <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
      {s.left && <SideCard side={s.left} tone="red" delay={15} />}
      <Rise delay={30}>
        <div style={{ fontSize: 56, fontWeight: 800, color: MUTED }}>vs</div>
      </Rise>
      {s.right && <SideCard side={s.right} tone="green" delay={Math.min(60, s.duration * 0.35)} />}
    </div>
  </Stage>
);

const Bullets: React.FC<{ s: Scene }> = ({ s }) => {
  const points = s.points ?? [];
  return (
    <Stage gap={50}>
      {s.title && <Heading>{s.title}</Heading>}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {points.map((p, i) => (
          <Rise key={i} delay={stagger(points.length, s.duration, i)}>
            <Card style={{ width: 1200, padding: "26px 36px", display: "flex", alignItems: "center", gap: 30 }}>
              <div style={{ fontSize: 72 }}>{p.icon}</div>
              <div style={{ fontSize: 44, fontWeight: 600 }}>{p.text}</div>
            </Card>
          </Rise>
        ))}
      </div>
    </Stage>
  );
};

const Outro = () => {
  const p = usePop(0);
  return (
    <Stage gap={30}>
      <Img src={staticFile("logo.png")} style={{ width: 200, height: 200, scale: p }} />
      <Heading size={96}>Engineering Digest</Heading>
      <Rise delay={20}>
        <div style={{ fontSize: 44, color: TONES.accent, fontWeight: 600 }}>vishwajeet-13.github.io/eng-digest</div>
      </Rise>
    </Stage>
  );
};

const VIEWS: Record<Scene["scene"], React.FC<{ s: Scene }>> = { title: Title, flow: Flow, stats: Stats, cards: Cards, grid: Grid, compare: Compare, bullets: Bullets, outro: Outro };

const Caption: React.FC<{ text: string; duration: number }> = ({ text, duration }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  const shown = interpolate(frame, [0, duration * 0.92], [0, words.length], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 1500, fontSize: 40, lineHeight: 1.35, fontWeight: 600, textAlign: "center", background: "rgba(255,255,255,.92)", padding: "14px 34px", borderRadius: 18 }}>
        {words.map((w, i) => (
          <span key={i} style={{ color: i < shown ? INK : "#c7cad1" }}>
            {w}{" "}
          </span>
        ))}
      </div>
    </div>
  );
};

const SceneFrame: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const View = VIEWS[s.scene];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: interpolate(frame, [s.duration - 8, s.duration], [1, 0], clamp), paddingBottom: 140 }}>
        <View s={s} />
      </AbsoluteFill>
      {s.scene !== "outro" && <Caption text={s.text} duration={s.duration} />}
    </AbsoluteFill>
  );
};

export const Explainer: React.FC<ExplainerProps> = ({ total, scenes, audio }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#fff", fontFamily, color: INK }}>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, background: TONES.accent, width: `${(frame / total) * 100}%` }} />
      <div style={{ position: "absolute", top: 40, left: 56, display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 800, color: MUTED }}>
        <Img src={staticFile("logo.png")} style={{ width: 40, height: 40 }} /> Engineering Digest
      </div>
      {scenes.map((s) => (
        <Sequence key={s.from} from={s.from} durationInFrames={s.duration}>
          <SceneFrame s={s} />
        </Sequence>
      ))}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
