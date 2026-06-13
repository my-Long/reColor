const sharp = require('sharp');

const LEVEL_COLORS = {
  multiplier: [223 / 255, 222 / 255, 219 / 255, 1],
  offset:     [32,        33,        36,        0],
};

const E0_FIX = [{ from: '#E0E0E0', to: '#FFFFFF', fuzz: 8 }];

function hexToRgb(hex) {
  const h = hex.replace('#', '').toUpperCase();
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

async function rawReplace(inputBuf, pairs) {
  const { data, info } = await sharp(inputBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;

  for (const { from, to, fuzz = 8 } of pairs) {
    const [fR, fG, fB] = hexToRgb(from);
    const [tR, tG, tB] = hexToRgb(to);
    const threshold = (fuzz / 100) * Math.sqrt(3) * 255;
    for (let i = 0; i < data.length; i += ch) {
      const d = Math.sqrt(
        (data[i] - fR) ** 2 + (data[i + 1] - fG) ** 2 + (data[i + 2] - fB) ** 2
      );
      if (d > threshold) continue;
      if (threshold === 0 || d === 0) {
        data[i] = tR; data[i + 1] = tG; data[i + 2] = tB;
      } else {
        // 按比例混合：距离越近替换越完整，保留抗锯齿边缘的背景色
        const alpha = 1 - d / threshold;
        const clamp = v => Math.min(255, Math.max(0, Math.round(v)));
        data[i]     = clamp(data[i]     + alpha * (tR - fR));
        data[i + 1] = clamp(data[i + 1] + alpha * (tG - fG));
        data[i + 2] = clamp(data[i + 2] + alpha * (tB - fB));
      }
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: ch } })
    .png()
    .toBuffer();
}

async function analyzeColors(inputBuffer) {
  const { data, info } = await sharp(inputBuffer).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const freq = new Map();

  for (let i = 0; i < data.length; i += ch) {
    const hex = '#' + [data[i], data[i + 1], data[i + 2]]
      .map(c => c.toString(16).padStart(2, '0').toUpperCase()).join('');
    freq.set(hex, (freq.get(hex) || 0) + 1);
  }

  const total = [...freq.values()].reduce((s, v) => s + v, 0);
  return [...freq.entries()]
    .map(([hex, count]) => ({ hex, count, pct: +((count / total) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

async function convertTheme(inputBuffer, target) {
  const isSourceLight = target === 'dark';
  let buf = inputBuffer;

  if (isSourceLight) buf = await rawReplace(buf, E0_FIX);

  buf = await sharp(buf)
    .ensureAlpha()
    .negate({ alpha: false })
    .modulate({ hue: 180 })
    .toBuffer();

  buf = await sharp(buf)
    .linear(LEVEL_COLORS.multiplier, LEVEL_COLORS.offset)
    .toBuffer();

  if (!isSourceLight) buf = await rawReplace(buf, E0_FIX);

  return buf;
}

module.exports = { hexToRgb, rawReplace, analyzeColors, convertTheme };
