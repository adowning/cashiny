const fs = require('fs')
const path = require('path')

// Configuration
const rootDir = process.cwd() // Current working directory
const outputDir = path.join(rootDir, 'copied_html_files')

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
  console.log(`Created output directory: ${outputDir}`)
}

// Function to find all index.html files recursively
function findIndexHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      findIndexHtmlFiles(filePath, fileList)
    } else if (file === 'index.html') {
      fileList.push(filePath)
    }
  })

  return fileList
}

// Function to copy files with parent directory name
function copyIndexFiles(indexFiles) {
  console.log(`Found ${indexFiles.length} index.html files to copy`)

  indexFiles.forEach((filePath) => {
    // Get parent directory name
    const parentDir = path.basename(path.dirname(filePath))
    const destFileName = `${parentDir}.html`
    const destPath = path.join(outputDir, destFileName)

    // Copy the file
    fs.copyFileSync(filePath, destPath)
    console.log(`Copied: ${filePath} -> ${destPath}`)
  })
}

// Main execution
try {
  const indexFiles = findIndexHtmlFiles(rootDir)
  copyIndexFiles(indexFiles)
  console.log('All index.html files have been copied successfully!')
} catch (error) {
  console.error('Error copying files:', error)
}
