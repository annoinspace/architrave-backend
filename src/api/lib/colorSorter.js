export const getCategoryFromRGB = (rgb) => {
  const [r, g, b] = rgb
  console.log("rgb before switch cases", { r, g, b })

  switch (true) {
    case r === 255 && g === 255 && b === 255:
      return "white"
    case r >= 150 && g <= 100 && b <= 100:
      return "red"
    case r >= 150 && r - g > 129 && b <= 100:
      return "red"
    case r <= 100 && g <= 100 && b >= 150:
      return "blue"
    case r === 0 && g === b:
      return "blue"
    case r < g && g >= 150 && b <= 100:
      return "green"
    case r <= 100 && g >= 150 && b < g:
      return "green"
    case r >= 200 && g <= 150 && b >= 150:
      return "pink"
    case r >= 200 && g >= 120 && b >= 120:
      return "pink"
    case r >= 150 && g <= 100 && b >= 150:
      return "purple"
    case r === b && g === 0:
      return "purple"
    case r >= 200 && g >= 200 && b <= 100:
      return "yellow"
    case r <= 200 && g === r && r - b >= 40:
      return "yellow"
    case r === g && b === 0:
      return "yellow"
    case r >= 200 && g >= 100 && b <= 100:
      return "orange"
    case r >= 150 && g >= 120 && b <= 100:
      return "orange"
    case r >= 100 && g <= 50 && b <= 50:
      return "brown"
    case r <= 50 && g < 50 && b === g:
      return "brown"
    case r === 0 && g === 0 && b === 0:
      return "black"
    case r === g && r === b && g === b:
      return "gray"
    default:
      return "requires manual sorting"
  }
}

export const componentToHex = (colorComponent) => {
  var hex = colorComponent.toString(16)
  return hex.length == 1 ? "0" + hex : hex
}
