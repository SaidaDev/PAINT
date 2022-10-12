//new from video change

const pencilBtn = document.querySelector('.pencil')
const eraserBtn = document.querySelector('.eraser')
const fg = document.querySelector('#fg')
const layer = document.querySelector('#layer')

const redSlider = document.querySelector('.red')
const greenSlider = document.querySelector('.green')
const blueSlider = document.querySelector('.blue')
const colorPick = document.querySelector('.color')

const createCanvasController = (canvas) => {
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)

  const buf = new ArrayBuffer(imageData.data.length)
  const buf8 = new Uint8ClampedArray(buf)
  const data = new Uint32Array(buf)

  const putPixel = (r, g, b, a, x, y) => {
    data[y * canvasWidth + x] =
      (a << 24) | // alpha
      (b << 16) | // blue
      (g << 8) | // green
      r // red
  }
  const clear = () => {
    for (let i = 0; i < data.length; i++) {
      data[i] = 0
    }
    updateImage()
  }
  const drawTemplate = () => {
    const cwInv = 1 / canvasWidth
    const chInv = 1 / canvasHeight

    for (let x = 0; x < canvasWidth; x++) {
      for (let y = 0; y < canvasHeight; y++) {
        const red = (x * 255) / canvasWidth //125*255/512
        const green = (y * 255) / canvasHeight

        putPixel(red, 200, green, 255, x, y)
      }
    }

    updateImage()
  }

  const drawRect = (size, r, g, b, a, x, y) => {
    for (let i = x - size; i < x; i++) {
      for (let k = y - size; k < y; k++) {
        putPixel(r, g, b, a, i, k)
      }
    }
  }

  const drawLine = (size, r, g, b, a, x1, y1, x2, y2) => {
    var dx = Math.abs(x2 - x1)
    var dy = Math.abs(y2 - y1)
    var sx = x1 < x2 ? 1 : -1
    var sy = y1 < y2 ? 1 : -1
    var err = dx - dy

    drawRect(size, r, g, b, a, x1, y1)

    while (!(x1 == x2 && y1 == y2)) {
      var e2 = err << 1
      if (e2 > -dy) {
        err -= dy
        x1 += sx
      }
      if (e2 < dx) {
        err += dx
        y1 += sy
      }
      drawRect(size, r, g, b, a, x1, y1)
    }
  }

  const updateImage = () => {
    imageData.data.set(buf8)
    ctx.putImageData(imageData, 0, 0)
  }

  return {
    drawTemplate: drawTemplate,
    clear: clear,
    putPixel: putPixel,
    drawLine: drawLine,
    updateImage: updateImage,
  }
}

const pencil = {
  onDrawEnd: () => {},
  draw: (x, y) => {
    fgController.drawLine(size, red, green, blue, 255, oldX, oldY, x, y)
    // fgController.putPixel(red, green, blue, 255, x, y)
    fgController.updateImage()
    oldX = x
    oldY = y
  },
}
const rect = {
  onDrawEnd: (x, y) => {
    layerController.clear()
    fgController.drawLine(size, red, green, blue, 255, oldX, oldY, x, oldY)
    fgController.drawLine(size, red, green, blue, 255, oldX, oldY, oldX, y)
    fgController.drawLine(size, red, green, blue, 255, oldX, y, x, y)
    fgController.drawLine(size, red, green, blue, 255, x, y, x, oldY)
    fgController.updateImage()
  },
  draw: (x, y) => {
    layerController.clear()
    layerController.drawLine(size, red, green, blue, 255, oldX, oldY, x, oldY)
    layerController.drawLine(size, red, green, blue, 255, oldX, oldY, oldX, y)
    layerController.drawLine(size, red, green, blue, 255, oldX, y, x, y)
    layerController.drawLine(size, red, green, blue, 255, x, y, x, oldY)
    layerController.updateImage()
  },
}
const cos45 = Math.cos(Math.PI / 4)
const sin45 = Math.sin(Math.PI / 4)

const cosDegree = (degree) => {
  return Math.cos((Math.PI / 180) * degree)
}

const sinDegree = (degree) => {
  return Math.sin((Math.PI / 180) * degree)
}

const circle = {
  onDrawEnd: (x, y) => {
    const deX = Math.abs(x - oldX)
    const deY = Math.abs(y - oldY)
    const radius = Math.floor(Math.sqrt(deX * deX + deY * deY))

    layerController.clear()

    for (let i = 0; i < 360; i++) {
      const newX = Math.floor(oldX + cosDegree(i) * radius)
      const newY = Math.floor(oldY + sinDegree(i) * radius)

      const newX2 = Math.floor(oldX + cosDegree(i + 1) * radius)
      const newY2 = Math.floor(oldY + sinDegree(i + 1) * radius)

      fgController.drawLine(
        size,
        red,
        green,
        blue,
        255,
        newX,
        newY,
        newX2,
        newY2
      )
    }

    fgController.updateImage()
  },
  draw: (x, y) => {
    layerController.clear()
    const deX = Math.abs(x - oldX)
    const deY = Math.abs(y - oldY)
    const radius = Math.sqrt(deX * deX + deY * deY)

    for (let i = 0; i < 360; i++) {
      const newX = Math.floor(oldX + cosDegree(i) * radius)
      const newY = Math.floor(oldY + sinDegree(i) * radius)

      const newX2 = Math.floor(oldX + cosDegree(i + 1) * radius)
      const newY2 = Math.floor(oldY + sinDegree(i + 1) * radius)

      layerController.drawLine(
        size,
        red,
        green,
        blue,
        255,
        newX,
        newY,
        newX2,
        newY2
      )
    }

    layerController.updateImage()
  },
}

// const eraser = {
//   onDrawEnd: () => {},
//   draw: (x, y) => {
//     fgController.drawLine(size, 255, 255, 255, 0, oldX, oldY, x, y)
//     fgController.updateImage()
//   },
// }

let red = 0
let green = 0
let blue = 0
let isDrawing = false
let oldX = 0
let oldY = 0
let prevX = 0
let prevY = 0
let size = 1
let activeTool = pencil

const fgController = createCanvasController(fg)
const bgController = createCanvasController(bg)
const layerController = createCanvasController(layer)
bgController.drawTemplate()

layer.addEventListener('mousedown', (event) => {
  isDrawing = true
  oldX = event.offsetX
  oldY = event.offsetY
})

layer.addEventListener('mousemove', (event) => {
  if (isDrawing) {
    activeTool.draw(event.offsetX, event.offsetY)
  }
  prevX = event.offsetX
  prevY = event.offsetY
})

window.addEventListener('mouseup', () => {
  if (isDrawing) {
    activeTool.onDrawEnd(prevX, prevY)
    isDrawing = false
  }
})

layer.addEventListener('mouseup', (event) => {
  activeTool.onDrawEnd(event.offsetX, event.offsetY)
  // event.stopPropagation()
  isDrawing = false
})

const $ = (selector) => document.querySelector(selector)

$('#pencil').addEventListener('click', (event) => {
  activeTool = pencil
})
$('#rect').addEventListener('click', () => {
  activeTool = rect
})

$('#circle').addEventListener('click', () => {
  activeTool = circle
})
$('#eraser').addEventListener('click', (event) => {
  // activeTool = eraser
  // event.stopPropagation()
  fgController.clear()
  reset()
  updateColorSlider()
})

$('#color-red').addEventListener('click', (event) => {
  red = 255
  green = 0
  blue = 0
  updateColorSlider()
})

$('#color-green').addEventListener('click', (event) => {
  red = 0
  green = 255
  blue = 0
  updateColorSlider()
})
$('#color-blue').addEventListener('click', (event) => {
  red = 0
  green = 0
  blue = 255
  updateColorSlider()
})
$('#size-1').addEventListener('click', (event) => {
  size = 1
})

$('#size-10').addEventListener('click', (event) => {
  size = 10
})
$('#size-15').addEventListener('click', (event) => {
  size = 15
})

const removeAllActiveClasses = (elementsArray) => {
  for (let i = 0; i < elementsArray.length; i++) {
    elementsArray[i].classList.remove('active')
  }
}

const addActiveClass = (element) => {
  element.classList.add('active')
}

$('#tools').addEventListener('click', (event) => {
  removeAllActiveClasses($('#tools').children)
  addActiveClass(event.target)
})

$('#colors').addEventListener('click', (event) => {
  removeAllActiveClasses($('#colors').children)
  addActiveClass(event.target)
})

$('#sizes').addEventListener('click', (event) => {
  removeAllActiveClasses($('#sizes').children)
  addActiveClass(event.target)
})
redSlider.addEventListener('input', (event) => {
  red = Number(event.target.value)
  updateColorPick()
})

greenSlider.addEventListener('input', (event) => {
  green = Number(event.target.value)
  updateColorPick()
})

blueSlider.addEventListener('input', (event) => {
  blue = Number(event.target.value)
  updateColorPick()
})

const updateColorPick = () => {
  colorPick.style.backgroundColor =
    'rgb(' + red + ',' + green + ',' + blue + ')'
}
updateColorPick()

const updateColorSlider = () => {
  redSlider.value = red
  greenSlider.value = green
  blueSlider.value = blue
  updateColorPick()
}
const reset = () => {
  red = 0
  green = 0
  blue = 0
  activeTool = pencil
  size = 1
  removeAllActiveClasses($('#colors').children)
  removeAllActiveClasses($('#tools').children)
  removeAllActiveClasses($('#sizes').children)
  addActiveClass($('#pencil'))
  addActiveClass($('#size-1'))
}
// onMouseDown => set isMouseDown = true
// onMouseUp => set isMouseDown = false

// onMouseMove =>
//    if isMouseDown => get coords => activeTool.draw(x, y)

// onPencilButton => activeTool = pencil
// onEraserButton => activeTool = eraser

// pencil.draw(x, y) => global color, coords => putPixel(r, g, b, x, y)
// brush.draw(x, y) => global color, center => for loop: draw filled rect
// eraser.draw(x, y) => white color, center => for loop: draw filled rect

// color button => set global color
