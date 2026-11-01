import { loadAllData } from './lib/load';
import { summarizeIssues, validateDataset } from '../src/lib/domain/validateDataset';

const asOf = process.env.VALIDATION_AS_OF ?? new Date().toISOString().slice(0, 10);

async function main(): Promise<void> {
  const { bundle, contents, issues: loadIssues } = await loadAllData();
  const issues = [...loadIssues, ...validateDataset(bundle, contents, { asOf })];
  const { errors, warnings } = summarizeIssues(issues);

  console.log('TechCompetitionHub 数据校验');
  console.log(`基准日期：${asOf}`);
  console.log(
    `记录：竞赛 ${bundle.competitions.length}，技能 ${bundle.skills.length}，项目 ${bundle.projects.length}，资源 ${bundle.resources.length}，路线 ${bundle.roadmaps.length}，评分模型 ${bundle.scoringModels.length}，文章 ${contents.length}，社区评价 ${bundle.reviews.length}`,
  );

  for (const item of issues.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'error' ? -1 : 1;
    return a.path.localeCompare(b.path);
  })) {
    const label = item.severity === 'error' ? 'ERROR' : 'WARN ';
    console.log(`${label} [${item.code}] ${item.path}: ${item.message}`);
  }

  console.log(`结果：${errors} 个错误，${warnings} 个警告`);

  if (errors > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error('数据校验脚本失败：', error);
  process.exitCode = 1;
});
