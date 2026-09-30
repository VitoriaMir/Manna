// Gera versões otimizadas (WebP) das imagens de assets/ para public/images/.
// Uso: npm run images
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..')
const src = path.join(root, 'assets')
const out = path.join(root, 'public', 'images')

async function convertDir(from, to, { width, quality = 78 }) {
  await mkdir(to, { recursive: true })
  const files = (await readdir(from)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  const seen = new Set()
  for (const file of files) {
    const name = file.replace(/\.[^.]+$/, '')
    if (seen.has(name)) continue
    seen.add(name)
    const target = path.join(to, `${name}.webp`)
    const info = await sharp(path.join(from, file))
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toFile(target)
    console.log(`${path.relative(root, target)}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`)
  }
}

await convertDir(path.join(src, 'covers'), path.join(out, 'covers'), { width: 960 })
await convertDir(path.join(src, 'backgrounds'), path.join(out, 'backgrounds'), { width: 1600, quality: 72 })

await mkdir(out, { recursive: true })
for (const size of [192, 512]) {
  await sharp(path.join(src, 'brand', 'manna-logo.png')).resize(size).png({ compressionLevel: 9 }).toFile(path.join(out, `logo-${size}.png`))
}
await sharp(path.join(src, 'brand', 'manna-logo.png')).resize(512).webp({ quality: 82 }).toFile(path.join(out, 'logo.webp'))
console.log('logo ok')
