import { AtSign, MessageCircle, Send, type LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';

const LAYERS: { n: string; icon: LucideIcon; face: string; edge: string; top: number }[] = [
  { n: '1', icon: MessageCircle, face: '#f6d05c', edge: '#c49a1c', top: 0 },
  { n: '2', icon: AtSign, face: '#f29bb4', edge: '#c9668a', top: 122 },
  { n: '3', icon: Send, face: '#f7f4ee', edge: '#c4b9a6', top: 244 },
];

/** Visual 2: three isometric slabs, one per thing that happens to a comment. */
export function FlowStack() {
  return (
    <div className="mx-auto flex h-[375px] w-full max-w-[420px] origin-top scale-[0.82] justify-center sm:h-[460px] sm:scale-100">
      <div className="relative h-[460px] w-[220px]">
        {LAYERS.map(({ n, icon: Icon, face, edge, top }, i) => (
          <div key={n} className="absolute left-0" style={{ top, zIndex: 30 - i * 10 }}>
            <div
              className="iso-slab flex h-[220px] w-[220px] items-center justify-center rounded-[2rem]"
              style={{ background: face, color: '#1c1917', '--edge': edge } as CSSProperties}
            >
              <Icon className="h-24 w-24 rotate-45" strokeWidth={1.5} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
