const versionMap = {
  1.8: '1.8',
  1.9: '1.8',
  '1.10': '1.8',
  1.11: '1.8',
  1.12: '1.12',
  1.13: '1.12',
  1.14: '1.12',
  1.15: '1.12',
  1.16: '1.16',
  1.17: '1.16',
  1.18: '1.16',
  1.19: '1.16',
  '1.20': '1.16'
}
const supportedVersions = Object.keys(versionMap)

/**
 * @param {string} hex hex
 * @returns {[string]}
 */
function hexToByte (hex) {
  if (hex.charAt(0) === '#') {
    hex = hex.substr(1)
  }
  const a = parseInt(hex.slice(0, 2), 16)
  const r = parseInt(hex.slice(2, 4), 16)
  const g = parseInt(hex.slice(4, 6), 16)
  const b = parseInt(hex.slice(6, 8), 16)
  return [r, g, b, a]
}

let customConverter
let convertImage = async (imgBuf) => {
  if (customConverter) return customConverter(imgBuf)
  const sharp = require('sharp')
  return await sharp(imgBuf, {
    raw: {
      width: 128,
      height: 128,
      channels: 4
    }
  })
    .png()
    .toBuffer()
}

const setImageConverter = (newConverter) => {
  customConverter = newConverter
}

async function mapToImage (data, mapId, version) {
  if (!supportedVersions.includes(version)) console.warn(Error(`[mineflayer-item-map-downloader] Version ${version} is not supported yet`))
  const colorVersion = versionMap[version] ?? versionMap['1.20']
  const colorMap = require(`../data/${colorVersion}/colors.json`)

  const buf = new Buffer.from(data)
  if (isNaN(Number(mapId))) throw new Error('Invalid map id')

  const imgBuf = new Uint8ClampedArray(128 * 128 * 4)
  for (let index = 0; index < imgBuf.byteLength; index += 4) {
    const colorArr = hexToByte(colorMap[buf[index / 4]])
    for (let k = 0; k < 4; k++) {
      imgBuf[index + k] = colorArr[k]
    }
  }

  return convertImage(imgBuf)
}

module.exports = {
  hexToByte,
  mapToImage,
  supportedVersions,
  convertImage,
  setImageConverter
}
