import type { Competition } from '../../lib/domain/types';
import { getScoringModel } from '../../services/scoringService';

const WIDTH = 320;
const HEIGHT = 300;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const RADIUS = 92;

const SHORT_LABELS: Record<string, string> = {
  technical_depth: '技术深度',
  recognition: '行业认可',
  practical_value: '实践价值',
  competitiveness: '竞争难度',
  growth_value: '成长收益',
  cost_accessibility: '成本可接受',
};

function pointAt(index: number, ratio: number): [number, number] {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / 6;
  return [CENTER_X + Math.cos(angle) * RADIUS * ratio, CENTER_Y + Math.sin(angle) * RADIUS * ratio];
}

function polygonPoints(ratios: number[]): string {
  return ratios.map((ratio, index) => pointAt(index, ratio).join(',')).join(' ');
}

export function CompetitionRadarChart({ competition }: { competition: Competition }) {
  const model = getScoringModel();
  const scores = competition.scores;
  if (!scores) return null;

  const values = model.dimensions.map(
    (dimension) => scores.dimension_scores[dimension.id]?.score ?? null,
  );
  if (values.some((value) => value === null)) {
    return (
      <p className="rounded-xl border border-dashed border-line-strong bg-surface p-4 text-xs leading-5 text-ink-500">
        维度数据不完整，暂不绘制雷达图。缺失维度不会被当作 0 分。
      </p>
    );
  }

  const ratios = values.map((value) => (value ?? 0) / 100);
  const labelPoints = model.dimensions.map((_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 6;
    const anchor: 'start' | 'middle' | 'end' =
      Math.cos(angle) > 0.3 ? 'start' : Math.cos(angle) < -0.3 ? 'end' : 'middle';
    return {
      x: CENTER_X + Math.cos(angle) * (RADIUS + 25),
      y: CENTER_Y + Math.sin(angle) * (RADIUS + 25),
      anchor,
    };
  });
  const description = model.dimensions
    .map((dimension, index) => `${dimension.name} ${values[index]}`)
    .join('；');

  return (
    <div className="w-full max-w-[340px]">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`六维评分雷达图：${description}`}
        className="h-auto w-full overflow-visible"
      >
        <title>六维评分雷达图</title>
        <desc>{description}</desc>
        {[0.2, 0.4, 0.6, 0.8, 1].map((ratio) => (
          <polygon
            key={ratio}
            points={polygonPoints(Array.from({ length: 6 }, () => ratio))}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={ratio === 1 ? 1.2 : 0.8}
          />
        ))}
        {model.dimensions.map((dimension, index) => {
          const [x, y] = pointAt(index, 1);
          const label = labelPoints[index];
          return (
            <g key={dimension.id}>
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={x}
                y2={y}
                stroke="var(--color-line)"
                strokeWidth={0.8}
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                dominantBaseline="middle"
                fill="var(--color-ink-500)"
                className="text-[10px]"
              >
                {SHORT_LABELS[dimension.id] ?? dimension.name}
              </text>
            </g>
          );
        })}
        <polygon
          points={polygonPoints(ratios)}
          fill="var(--color-brand-500)"
          fillOpacity={0.16}
          stroke="var(--color-brand-600)"
          strokeWidth={2}
          strokeLinejoin="round"
          className="radar-area"
        />
        {ratios.map((ratio, index) => {
          const [x, y] = pointAt(index, ratio);
          return (
            <circle
              key={model.dimensions[index].id}
              cx={x}
              cy={y}
              r={3.5}
              fill="var(--color-surface)"
              stroke="var(--color-brand-600)"
              strokeWidth={2}
            />
          );
        })}
      </svg>
      <p className="mt-1 text-center text-[11px] leading-5 text-ink-500">
        六维分数来自平台评分记录，随数据更新自动重绘。
      </p>
    </div>
  );
}
