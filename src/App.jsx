import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  Github,
  ListChecks,
  Radar,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

const demoList = `工业富联
沪电股份
新易盛
中际旭创
胜宏科技`

const profiles = [
  {
    result: '重点观察',
    grade: 'S',
    score: 88,
    reason: '趋势未破，尾盘资金回流，板块有共振',
    risk: '明天重点看开盘承接，不能高开低走',
  },
  {
    result: '重点观察',
    grade: 'A',
    score: 79,
    reason: '14:30后有承接，趋势结构还在',
    risk: '位置略高，明天不能缩量冲高回落',
  },
  {
    result: '只看不追',
    grade: 'B',
    score: 66,
    reason: '有尾盘异动，但量能确认不足',
    risk: '不适合追，等明天开盘验证资金延续',
  },
  {
    result: '今日排除',
    grade: 'C',
    score: 48,
    reason: '尾盘冲高回落，承接不够清楚',
    risk: '疑似诱多，先移出今日尾盘结果',
  },
  {
    result: '今日排除',
    grade: 'C',
    score: 42,
    reason: '短线涨幅偏大，尾盘量能不足',
    risk: '不追高，等下一次回踩确认',
  },
]

function hashText(text) {
  let h = 0
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0
  }
  return h
}

function parseStockList(text) {
  return text
    .split(/[\n,，、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function analyzeStocks(text, mode) {
  const stocks = parseStockList(text)
  return stocks.map((name, index) => {
    const h = hashText(`${name}-${mode}-${index}`)
    let p = profiles[h % profiles.length]

    if (mode === 'steady' && p.grade === 'S') p = { ...p, grade: 'A', result: '重点观察', score: 82 }
    if (mode === 'attack' && p.grade === 'B') p = { ...p, grade: 'A', result: '重点观察', score: 76, risk: '进攻模式下可观察，但要严格看承接' }
    if (mode === 'avoid' && p.grade !== 'C' && h % 3 === 0) {
      p = { result: '今日排除', grade: 'C', score: 45, reason: '避坑模式识别：尾盘动作不够干净', risk: '先排除，避免情绪盘追高' }
    }

    return { name, ...p }
  })
}

function gradeClass(grade) {
  if (grade === 'S') return 'border-red-400/40 bg-red-500/15 text-red-100'
  if (grade === 'A') return 'border-amber-400/40 bg-amber-500/15 text-amber-100'
  if (grade === 'B') return 'border-sky-400/40 bg-sky-500/15 text-sky-100'
  return 'border-zinc-500/40 bg-zinc-700/40 text-zinc-200'
}

function resultClass(result) {
  if (result === '重点观察') return 'text-red-200'
  if (result === '只看不追') return 'text-sky-200'
  return 'text-zinc-300'
}

export default function App() {
  const [stockText, setStockText] = useState(demoList)
  const [mode, setMode] = useState('steady')
  const [copied, setCopied] = useState(false)

  const rows = useMemo(() => analyzeStocks(stockText, mode), [stockText, mode])
  const counts = useMemo(() => {
    return rows.reduce(
      (acc, item) => {
        if (item.result === '重点观察') acc.focus += 1
        else if (item.result === '只看不追') acc.watch += 1
        else acc.reject += 1
        return acc
      },
      { focus: 0, watch: 0, reject: 0 },
    )
  }, [rows])

  const copyResult = async () => {
    const content = rows
      .map((item, index) => `${index + 1}. ${item.name}｜${item.result}｜${item.reason}｜风险：${item.risk}`)
      .join('\n')
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/70 shadow-2xl backdrop-blur">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-100"
              >
                <Clock3 className="h-4 w-4" /> 每天14:30后启动
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
              >
                尾盘Skill
                <span className="block text-red-400">30分钟决策器</span>
              </motion.h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                输入一份自选股，输出一张尾盘结果表。它不预测明天涨跌，只判断今天尾盘哪些更值得观察，哪些应该排除。
              </p>

              <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
                {[
                  ['steady', '稳健模式', '只看趋势和承接'],
                  ['attack', '进攻模式', '允许强势异动'],
                  ['avoid', '避坑模式', '专找诱多风险'],
                ].map(([key, title, desc]) => (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      mode === key ? 'border-red-400/60 bg-red-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-black">{title}</div>
                    <div className="mt-1 text-xs text-zinc-400">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-black/40 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-400">今日尾盘结果</div>
                  <div className="mt-1 text-3xl font-black text-red-300">一张表看完</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <Radar className="h-8 w-8 text-red-300" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <div className="text-3xl font-black">{counts.focus}</div>
                  <div className="mt-1 text-sm text-zinc-400">重点观察</div>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <div className="text-3xl font-black">{counts.watch}</div>
                  <div className="mt-1 text-sm text-zinc-400">只看不追</div>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <div className="text-3xl font-black">{counts.reject}</div>
                  <div className="mt-1 text-sm text-zinc-400">今日排除</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                前端MVP演示版使用模拟评分。接入行情接口后，用户只输入股票名，后台自动补齐尾盘资金、均线、板块强弱等数据。
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-red-300" />
              <h2 className="text-xl font-black">输入自选股</h2>
            </div>
            <p className="mt-2 text-sm text-zinc-400">一行一个。可以输入股票名，也可以输入代码。</p>
            <textarea
              value={stockText}
              onChange={(event) => setStockText(event.target.value)}
              className="mt-4 h-72 w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 text-base leading-8 text-zinc-100 outline-none ring-red-500/40 transition focus:ring-2"
              placeholder="工业富联\n沪电股份\n新易盛"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => setStockText(demoList)}
                className="rounded-2xl bg-red-500 px-5 py-3 font-bold text-white shadow-lg shadow-red-900/30 transition hover:bg-red-400"
              >
                载入示例
              </button>
              <button
                onClick={() => setStockText('')}
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-zinc-200 transition hover:bg-white/10"
              >
                清空
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5 shadow-2xl backdrop-blur">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">尾盘结果表</h2>
                <p className="mt-2 text-sm text-zinc-400">只保留三个结果：重点观察、只看不追、今日排除。</p>
              </div>
              <button
                onClick={copyResult}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-white/10"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? '已复制' : '复制结果'}
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-zinc-950 text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">股票</th>
                    <th className="px-4 py-3">结果</th>
                    <th className="px-4 py-3">评分</th>
                    <th className="px-4 py-3">一句话理由</th>
                    <th className="px-4 py-3">风险点</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {rows.map((item, index) => (
                    <tr key={`${item.name}-${index}`} className="bg-white/[0.02] hover:bg-white/[0.05]">
                      <td className="px-4 py-4 font-bold text-white">{item.name}</td>
                      <td className="px-4 py-4">
                        <div className={`font-black ${resultClass(item.result)}`}>{item.result}</div>
                        <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-black ${gradeClass(item.grade)}`}>
                          {item.grade}级
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-lg font-black">{item.score}</div>
                        <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-red-400" style={{ width: `${item.score}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-zinc-300">{item.reason}</td>
                      <td className="px-4 py-4 text-zinc-300">{item.risk}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-zinc-500">
                        请先输入股票名单
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            <Sparkles className="h-6 w-6 text-red-300" />
            <h3 className="mt-4 text-lg font-black">用户怎么用</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">每天14:30后，输入自己关注的股票名单，点击生成，得到一张尾盘结果表。</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            <TrendingUp className="h-6 w-6 text-red-300" />
            <h3 className="mt-4 text-lg font-black">后台算什么</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">趋势、尾盘资金、位置舒服度、板块共振、风险控制。用户不用手填复杂字段。</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            <ShieldAlert className="h-6 w-6 text-red-300" />
            <h3 className="mt-4 text-lg font-black">合规表达</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">不写买入，不承诺收益，只输出观察、只看不追、排除和风险点。</p>
          </div>
        </section>

        <section className="mt-6 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-7 text-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              风险提示：本工具仅用于行情结构分析和投资研究辅助，不构成任何投资建议。股票市场有风险，历史信号不代表未来收益。
            </p>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-center gap-3 py-8 text-xs text-zinc-500">
          <Github className="h-4 w-4" /> weipan-skill · 早盘看情绪，尾盘看真金
        </footer>
      </main>
    </div>
  )
}
