const tableRows = document.querySelectorAll('table tr')
const button = document.querySelector('button')
const avatar = document.querySelector('.avatar')
const colorPicker = document.getElementById('colorPicker')
const rootStyle = document.documentElement
const colorPalette = document.getElementById('color-palette')

// Function to extract CSS variables and their values
function getCSSVariables() {
  const variables = {}
  const styleSheet = document.styleSheets[0]
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    const rule = styleSheet.cssRules[i]
    if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
      for (let j = 0; j < rule.style.length; j++) {
        const propertyName = rule.style[j]
        if (propertyName.startsWith('--p-')) {
          variables[propertyName] = rule.style.getPropertyValue(propertyName)
        }
      }
    }
  }
  return variables
}

// Function to create color swatches and input elements
function populateColorPalette(variables) {
  for (const variable in variables) {
    if (variables.hasOwnProperty(variable)) {
      const colorValue = variables[variable]

      const colorContainer = document.createElement('div')
      colorContainer.classList.add('color-container')

      const colorBox = document.createElement('button')
      colorBox.classList.add('color-box')
      colorBox.style.backgroundColor = colorValue
      colorBox.addEventListener('click', () => {
        const newColor = colorBox.style.backgroundColor
        rootStyle.style.setProperty(variable, newColor)
      })

      const label = document.createElement('label')
      label.textContent = variable

      const colorInput = document.createElement('input')
      colorInput.type = 'color'
      colorInput.value = colorValue
      colorInput.dataset.variable = variable
      colorInput.addEventListener('input', (event) => {
        const newColor = event.target.value
        rootStyle.style.setProperty(variable, newColor)
        colorBox.style.backgroundColor = newColor
      })

      colorContainer.appendChild(colorBox)
      colorContainer.appendChild(label)
      colorContainer.appendChild(colorInput)
      colorPalette.appendChild(colorContainer)
    }
  }
}

// Get CSS variables and populate the color palette
const cssVariables = getCSSVariables()
populateColorPalette(cssVariables)

tableRows.forEach((row) => {
  row.addEventListener('click', () => {
    colorPicker.click()
    colorPicker.onchange = function (e) {
      row.style.backgroundColor = e.target.value
    }
  })
})

button.addEventListener('click', () => {
  colorPicker.click()
  colorPicker.onchange = function (e) {
    button.style.backgroundColor = e.target.value
  }
})

avatar.addEventListener('click', () => {
  colorPicker.click()
  colorPicker.onchange = function (e) {
    avatar.style.backgroundColor = e.target.value
  }
})
