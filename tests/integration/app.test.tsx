import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../../src/app/App';

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe('核心页面', () => {
  it('首页使用真实数据渲染定位、统计与入口', () => {
    renderApp('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('参加什么竞赛');
    expect(screen.getByText('已收录竞赛')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /浏览竞赛|全部竞赛/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/平台评分/).length).toBeGreaterThan(0);
  });

  it('竞赛目录支持关键词筛选并保持 URL 状态', async () => {
    const user = userEvent.setup();
    renderApp('/competitions?q=机器人');
    expect(screen.getByRole('heading', { level: 1, name: '竞赛目录' })).toBeInTheDocument();
    expect(screen.getByLabelText('关键词')).toHaveValue('机器人');
    expect(screen.getByRole('link', { name: 'RoboMaster 机甲大师高校系列赛' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '全国大学生数学建模竞赛' })).not.toBeInTheDocument();

    const search = screen.getByLabelText('关键词');
    await user.clear(search);
    await user.type(search, '数学建模');
    expect(await screen.findByRole('link', { name: '全国大学生数学建模竞赛' })).toBeInTheDocument();
  });

  it('无结果时显示可理解的空状态', () => {
    renderApp('/competitions?q=不存在的竞赛关键词xyz');
    expect(screen.getByText('没有符合筛选条件的竞赛')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看全部竞赛' })).toBeInTheDocument();
  });

  it('深层详情链接直接可用并展示来源与评分解释', () => {
    renderApp('/competitions/cumcm');
    expect(
      screen.getByRole('heading', { level: 1, name: '全国大学生数学建模竞赛' }),
    ).toBeInTheDocument();
    expect(screen.getByText('全国大学生数学建模竞赛官网首页')).toBeInTheDocument();
    expect(screen.getAllByText(/85\.0/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/不是官方排名/).length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', { level: 2, name: '外部竞赛目录（不参与评分）' }),
    ).toBeInTheDocument();
    expect(screen.getByText('目录不等于认可度或技术含量')).toBeInTheDocument();
  });

  it('类别页展示机器人方向竞赛', async () => {
    renderApp('/categories/robotics');
    expect(await screen.findByRole('heading', { level: 1, name: '机器人' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /全国大学生机器人大赛 ROBOCON/ })).toBeInTheDocument();
    expect(screen.getAllByText(/RoboMaster|RoboCup|ROBOCON/).length).toBeGreaterThan(0);
  });

  it('未知类别返回 404 内容', async () => {
    renderApp('/categories/not-real');
    expect(
      await screen.findByRole('heading', { level: 1, name: '这个类别不存在' }),
    ).toBeInTheDocument();
  });

  it('未知竞赛 ID 返回 404 内容', () => {
    renderApp('/competitions/not-real');
    expect(screen.getByRole('heading', { level: 1, name: '这个页面不存在' })).toBeInTheDocument();
  });

  it('排行榜只列出满足准入条件的条目并解释排除原因', () => {
    renderApp('/rankings');
    expect(screen.getByRole('heading', { level: 1, name: '竞赛价值榜' })).toBeInTheDocument();
    expect(screen.getAllByText(/正式评分/).length).toBeGreaterThan(0);
    expect(screen.getByText(/未进入正式排名的条目/)).toBeInTheDocument();
    expect(screen.getAllByText(/资料不足|尚未提供平台评分/).length).toBeGreaterThan(0);
  });

  it('技能详情展示 L0–L4、任务验收标准与资源', () => {
    renderApp('/skills/python-programming');
    expect(screen.getByRole('heading', { level: 1, name: 'Python 编程' })).toBeInTheDocument();
    expect(screen.getByText('L0 尚未接触')).toBeInTheDocument();
    expect(screen.getAllByText('验收标准').length).toBeGreaterThan(0);
    expect(screen.getByText('Python 官方教程（中文）')).toBeInTheDocument();
  });

  it('成长规划器可生成包含阶段与验收标准的计划', async () => {
    const user = userEvent.setup();
    renderApp('/planner?target=competition:cumcm');
    expect(
      screen.getByRole('heading', { level: 1, name: '把目标拆成下一步能做的事' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '生成成长计划' }));
    expect(await screen.findByText('阶段 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '复制 Markdown' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下载 Markdown' })).toBeInTheDocument();
    expect(screen.getAllByText(/自评/).length).toBeGreaterThan(0);
  });

  it('移动导航可打开、可键盘关闭并跳转', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const toggle = screen.getByRole('button', { name: '打开菜单' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const mobileNav = screen.getByRole('navigation', { name: '移动导航' });
    expect(within(mobileNav).getByRole('link', { name: '排行榜' })).toBeInTheDocument();
    await user.click(within(mobileNav).getByRole('link', { name: '排行榜' }));
    await waitFor(() => {
      expect(screen.queryByRole('navigation', { name: '移动导航' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { level: 1, name: '竞赛价值榜' })).toBeInTheDocument();
  });

  it('经验文章按需加载并渲染 Markdown', async () => {
    renderApp('/guides/choose-first-competition');
    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: '如何选择第一场科技竞赛' },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('先说结论')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(0);
  });

  it('用户可以生成竞赛 JSON 草稿并看到 needs_review', async () => {
    const user = userEvent.setup();
    renderApp('/submit-competition');
    await screen.findByRole('heading', { level: 1, name: '提交一条竞赛' });
    await user.type(screen.getByLabelText('竞赛名称'), '测试竞赛');
    await user.type(screen.getByLabelText('官方入口'), 'https://example.org/contest');
    await user.type(
      screen.getByLabelText('一句话说明'),
      '这是一个用于测试的竞赛说明，长度足够通过校验。',
    );
    await user.type(
      screen.getByLabelText('详细说明'),
      '这是一个用于测试竞赛草稿生成流程的详细说明，包含来源、领域与待核验字段；内容需要超过五十个字符，才能通过前端校验并生成 JSON 草稿。',
    );
    await user.click(screen.getByRole('checkbox', { name: '机器人' }));
    await user.click(screen.getByRole('button', { name: '生成 JSON 草稿' }));
    expect(await screen.findByText(/"verification_status": "needs_review"/)).toBeInTheDocument();
    expect(screen.getByText(/"scores": null/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '复制 JSON' })).toBeInTheDocument();
  });

  it('用户可以生成带公开背景信息的参赛评价', async () => {
    const user = userEvent.setup();
    renderApp('/submit-review?competition=cumcm');
    await screen.findByRole('heading', { level: 1, name: '提交参赛评价' });
    await user.type(screen.getByLabelText('赛道/组别'), '本科组');
    await user.type(screen.getByLabelText('参赛年份'), '2025');
    await user.type(screen.getByLabelText('学校（可选，公开展示）'), '示例大学');
    await user.type(
      screen.getByLabelText('评价'),
      '这是一条用于测试的参赛评价，包含赛制体验、准备过程与对后来者的建议，长度足够。',
    );
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: '生成评价草稿' }));
    expect(await screen.findByText(/是否参加过：是/)).toBeInTheDocument();
    expect(screen.getByText(/学校（公开）：示例大学/)).toBeInTheDocument();
    expect(screen.getByText(/不参与平台六维评分或正式排名/)).toBeInTheDocument();
  });

  it('竞赛详情在无社区评价时显示空状态与提交入口', () => {
    renderApp('/competitions/cumcm');
    expect(screen.getByText('暂无已审核的社区评分')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '提交参赛评价' })).toBeInTheDocument();
  });

  it('社区页链接到实际存在的 Discussions 分类', () => {
    renderApp('/community');
    expect(
      screen.getByRole('heading', { level: 1, name: '在公开、可搜索的地方交流' }),
    ).toBeInTheDocument();
    const links = screen.getAllByRole('link').map((link) => link.getAttribute('href') ?? '');
    const categoryLinks = links.filter((href) => href.includes('/discussions/categories/'));
    expect(categoryLinks.length).toBeGreaterThanOrEqual(6);
    const allowed = ['announcements', 'q-a', 'show-and-tell', 'general', 'ideas', 'polls'];
    for (const href of categoryLinks) {
      const slug = href.split('/discussions/categories/')[1]?.split(/[?#]/)[0] ?? '';
      expect(allowed).toContain(slug);
    }
    expect(links.some((href) => href.endsWith('/discussions'))).toBe(true);
    expect(links.filter((href) => href.startsWith('/forum/')).length).toBeGreaterThanOrEqual(6);
  });

  it('论坛分类页展示规则、模板与 GitHub 入口', async () => {
    renderApp('/forum/q-a');
    expect(await screen.findByRole('heading', { level: 1, name: /Q&A/ })).toBeInTheDocument();
    expect(screen.getByText('竞赛咨询模板')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '进入 GitHub 分类' })).toHaveAttribute(
      'href',
      expect.stringContaining('/discussions/categories/q-a'),
    );
  });

  it('未知论坛分类返回 404 内容', () => {
    renderApp('/forum/not-real');
    expect(
      screen.getByRole('heading', { level: 1, name: '这个论坛分类不存在' }),
    ).toBeInTheDocument();
  });

  it('首页通过基础可访问性自动检查', async () => {
    const { container } = renderApp('/');
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('竞赛目录通过基础可访问性自动检查', async () => {
    const { container } = renderApp('/competitions');
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  const auditRoutes = [
    '/',
    '/competitions',
    '/competitions/cumcm',
    '/categories',
    '/categories/robotics',
    '/rankings',
    '/projects',
    '/skills',
    '/skills/python-programming',
    '/planner?target=competition:cumcm',
    '/guides',
    '/guides/choose-first-competition',
    '/community',
    '/forum',
    '/forum/q-a',
    '/submit-competition',
    '/submit-review',
    '/about',
    '/contribute',
    '/data-policy',
    '/scoring-method',
    '/privacy',
  ];

  it.each(auditRoutes)('页面 %s 通过基础可访问性检查', async (path) => {
    const { container } = renderApp(path);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
