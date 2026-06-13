#!/usr/bin/env node
/*
 * @Author: monet.Lo
 * @FilePath: /reColor/index.js
 * @description: 博客图片主题转换工具（light ↔ dark），基于 Sharp，无系统依赖
 *
 * 用法:
 *   node index.js <文件名> <dark|light>            # 主题转换
 *   node index.js --analyze <文件名>               # 分析主色
 *   node index.js --replace <文件名> #from/#to ... # 颜色替换
 */
const path  = require('path');
const fs    = require('fs/promises');
const { hexToRgb, rawReplace, analyzeColors, convertTheme: convertThemeOp } = require('./lib/imageOps');

function resolvePath(input) {
  const normalized = input.includes('/') ? input : `images/${input}`;
  return path.resolve(path.extname(normalized) ? normalized : `${normalized}.png`);
}

// --analyze: 统计图片主色前 15 名
async function analyzeImage(imgArg) {
  const absPath = resolvePath(imgArg);
  await fs.access(absPath);
  const entries = await analyzeColors(await fs.readFile(absPath));

  console.log(`\n📊 ${path.basename(absPath)} 颜色分析 (前 ${entries.length} 名):\n`);
  console.log('  像素数      占比    Hex');
  console.log('  ───────────────────────');
  for (const { hex, count, pct } of entries) {
    console.log(`  ${String(count).padStart(8)}   ${String(pct).padStart(5)}%   ${hex}`);
  }
}

// --replace: 颜色一对一替换，直接覆盖原文件
async function replaceColors(imgArg, pairs) {
  const absPath = resolvePath(imgArg);
  await fs.access(absPath);

  const buf = await rawReplace(await fs.readFile(absPath), pairs);
  await fs.writeFile(absPath, buf);

  console.log(`✏️  已替换 ${path.basename(absPath)}:`);
  for (const { from, to } of pairs) console.log(`   ${from} → ${to}`);
}

// 主转换：negate + hue-rotate 180° + level-colors，附带 #E0E0E0 归白
async function convertTheme(input, target) {
  const absInput = resolvePath(input);
  await fs.access(absInput);

  const parsed        = path.parse(absInput);
  const isSourceLight = target === 'dark';
  const baseName      = parsed.name.replace(/-(light|dark)$/, '');
  const sourceCopy    = path.join(parsed.dir, `${baseName}${isSourceLight ? '-light' : '-dark'}${parsed.ext}`);
  const invertedFile  = path.join(parsed.dir, `${baseName}-${target}${parsed.ext}`);

  await fs.rename(absInput, sourceCopy);

  const inputBuf = await fs.readFile(sourceCopy);
  const buf = await convertThemeOp(inputBuf, target);
  await fs.writeFile(invertedFile, buf);

  console.log(`📋 原图副本: ${sourceCopy}`);
  console.log(`✨ 目标版本: ${invertedFile}`);
}

async function main() {
  const [,, cmd, ...rest] = process.argv;

  if (cmd === '--analyze') {
    if (!rest[0]) {
      console.error('用法: node index.js --analyze <文件名>');
      process.exit(1);
    }
    await analyzeImage(rest[0]);
    return;
  }

  if (cmd === '--replace') {
    const [imgArg, ...pairArgs] = rest;
    if (!imgArg || pairArgs.length === 0) {
      console.error('用法: node index.js --replace <文件名> <原色>/<新色> [<原色>/<新色> ...]');
      console.error('      颜色格式: #RRGGBB，可在原色或新色后加 :<fuzz%>，默认 8%');
      console.error('      示例: node index.js --replace keda-light #E0E0E0/#FFFFFF #F5F5F5/#FFFFFF:12');
      process.exit(1);
    }
    const pairs = pairArgs.map(p => {
      const parts = p.split('/');
      if (parts.length !== 2) {
        console.error(`❌ 无效颜色对: ${p}，格式应为 #RRGGBB/#RRGGBB`);
        process.exit(1);
      }
      const parseColor = s => {
        const m = s.trim().match(/^(#[0-9A-Fa-f]{6})(?::(\d+))?$/);
        if (!m) { console.error(`❌ 无效颜色: ${s}`); process.exit(1); }
        return { color: m[1].toUpperCase(), fuzz: m[2] ? parseInt(m[2]) : null };
      };
      const fr = parseColor(parts[0]);
      const to = parseColor(parts[1]);
      return { from: fr.color, to: to.color, fuzz: fr.fuzz ?? to.fuzz ?? 8 };
    });
    await replaceColors(imgArg, pairs);
    return;
  }

  const target = rest[0];
  if (!cmd || !['dark', 'light'].includes(target)) {
    console.error('用法: node index.js <文件名> <dark|light>');
    console.error('      node index.js --analyze <文件名>');
    console.error('      node index.js --replace <文件名> <原色>/<新色> [...]');
    process.exit(1);
  }

  await convertTheme(cmd, target);
}

main().catch(err => {
  console.error('❌ 处理失败:', err.message || err);
  process.exit(1);
});
