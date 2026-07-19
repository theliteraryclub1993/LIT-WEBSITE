import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const destDir = 'C:\\Users\\Sumukha\\AppData\\Roaming\\npm\\node_modules\\supabase\\node_modules\\@supabase\\cli-windows-x64\\bin'
const tempZip = path.join('D:\\litlife\\literary-club', 'supabase.zip')

async function run() {
    try {
        console.log('Fetching latest Supabase CLI release info...')
        const res = await fetch('https://api.github.com/repos/supabase/cli/releases/latest', {
            headers: { 'User-Agent': 'NodeJS' }
        })
        const data = await res.json()
        const asset = data.assets.find(a => a.name.includes('_windows_amd64.zip'))
        if (!asset) {
            throw new Error('Windows zip asset not found')
        }
        
        console.log(`Downloading asset from: ${asset.browser_download_url}`)
        const downloadRes = await fetch(asset.browser_download_url)
        const buffer = await downloadRes.arrayBuffer()
        fs.writeFileSync(tempZip, Buffer.from(buffer))
        console.log('Zip file saved successfully. Extracting...')

        // Ensure destination folder exists
        fs.mkdirSync(destDir, { recursive: true })

        // Extract using PowerShell Expand-Archive
        execSync(`powershell -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${destDir}' -Force"`)
        console.log('Extraction complete!')

        // Clean up
        fs.unlinkSync(tempZip)
        console.log('Cleaned up temp zip file.')

        // Verify
        const files = fs.readdirSync(destDir)
        console.log('Destination folder contents:', files)
    } catch (e) {
        console.error('Error downloading CLI:', e)
    }
}

run()
