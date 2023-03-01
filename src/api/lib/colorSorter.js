export const getCategoryFromRGB = (rgb) => {
  const [r, g, b] = rgb
  console.log("rgb before switch cases", { r, g, b })
  // Find the highest and smallest RGB values
  const highestValue = Math.max(r, g, b)
  const smallestValue = Math.min(r, g, b)

  switch (true) {
    case r === 255 && g === 255 && b === 255:
      return "white"
    case r >= 240 && g >= 240 && b >= 240:
      return "white"
    case r === 0 && g === 0 && b === 0:
      return "gray"
    case r === g && r === b && g === b:
      return "gray"
    case r === g && r === b && g === b:
      return "gray"
    case r >= 150 && g <= 100 && b <= 100:
      return "red"
    case r >= 150 && r - g > 129 && b <= 100:
      return "red"
    case r > g && g === b && b >= 40:
      return "red"
    case r === 0 && g === 0 && b >= 50:
      return "blue"
    case r <= 100 && g <= 100 && b >= 150:
      return "blue"
    case r >= 0 && g - r >= 15 && b === highestValue:
      return "blue"
    case r === 0 && g === b && b > 0:
      return "blue"
    case r === smallestValue && g === b && b > 0:
      return "blue"
    case r < g && g >= 150 && b <= 100:
      return "green"
    case r < b && g >= 200 && b >= 100:
      return "green"
    case r <= 100 && g >= 150 && b < g:
      return "green"
    case r === b && g === highestValue && b > 0:
      return "green"
    case r === g && b === smallestValue && b > 0:
      return "green"
    case g === highestValue && b === smallestValue && b <= 50 && r > 0:
      return "green"
    case r >= 200 && g <= 150 && b >= 150:
      return "pink"
    case r >= 245 && g < b && b >= 80:
      return "pink"
    case r === b && g === 0 && b > 0:
      return "pink"
    case r < 50 && g < 50 && b >= 50 && b <= 120:
      return "purple"
    case r >= 150 && g <= 100 && b >= 150:
      return "purple"
    case b - r > 10 && r - g >= 5 && b >= 50:
      return "purple"
    case r <= 200 && g === r && r - b >= 40:
      return "yellow"
    case r >= 180 && r - g <= 15 && b < g:
      return "yellow"
    case r === g && b === 0 && r > 0:
      return "yellow"
    case r >= 200 && g >= 100 && b <= 100:
      return "orange"
    case r >= 150 && g >= 120 && b <= 100:
      return "orange"
    case r >= 150 && g >= 120 && g - b >= 20:
      return "orange"
    case r >= 100 && g <= 50 && b <= 50:
      return "brown"
    case r <= 50 && g < 50 && b === g && b > 0:
      return "brown"
    case highestValue - smallestValue <= 15:
      return "gray"
    default:
      return "requires manual sorting"
  }
}

export const componentToHex = (colorComponent) => {
  var hex = colorComponent.toString(16)
  return hex.length == 1 ? "0" + hex : hex
}
