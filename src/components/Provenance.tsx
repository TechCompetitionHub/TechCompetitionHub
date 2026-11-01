import { Link } from 'react-router-dom';
import type { Competition } from '../lib/domain/types';
import { formatDate } from '../lib/utils/format';
import { StatusBadge } from './StatusBadge';

export function Provenance({
  competition,
  showSources = true,
}: {
  competition: Competition;
  showSources?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-500">
      <StatusBadge status={competition.verification_status} />
      <span>
        最后核验：
        <time dateTime={competition.last_verified_at ?? undefined}>
          {formatDate(competition.last_verified_at)}
        </time>
      </span>
      {showSources ? <span>来源数：{competition.sources.length}</span> : null}
      <Link to="/data-policy" className="link-inline text-xs">
        数据政策
      </Link>
    </div>
  );
}
