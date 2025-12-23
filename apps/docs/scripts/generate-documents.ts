import { promises as fs } from "fs"
import path from "path"

import grayMatter from "gray-matter"

import { Paths } from "@/lib/pageroutes"

const docsDir = path.join(process.cwd(), "contents")
const documentsFile = path.join(process.cwd(), "settings/documents.ts")

interface MdxFileInfo {
  title: string
  href: string
  order: number
  category: string
  heading?: string
}

/**
 * Recursively get all MDX files from a directory
 */
async function getMdxFiles(dir: string): Promise<string[]> {
  let files: string[] = []
  const items = await fs.readdir(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      const subFiles = await getMdxFiles(fullPath)
      files = files.concat(subFiles)
    } else if (item.name.endsWith(".mdx")) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Convert file path to href format
 */
function createHref(filePath: string): string {
  const relativePath = path.relative(docsDir, filePath)
  const parsed = path.parse(relativePath)

  // Build the slug path
  const slugPath = parsed.dir ? `${parsed.dir}/${parsed.name}` : parsed.name

  // Normalize path separators
  const normalizedSlug = slugPath.replace(/\\/g, "/")

  // Skip index files as they represent the directory itself
  if (parsed.name === "index") {
    return ""
  }

  return `/${normalizedSlug}`
}

/**
 * Extract metadata from MDX file
 */
async function extractMdxInfo(filePath: string): Promise<MdxFileInfo | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8")
    const { data: frontmatter } = grayMatter(content)

    const href = createHref(filePath)

    // Skip index files (they don't get their own route)
    if (!href) {
      return null
    }

    return {
      title: frontmatter.title || "Untitled",
      href,
      order: frontmatter.order || 999,
      category: frontmatter.category || "other",
      heading: frontmatter.heading,
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
    return null
  }
}

/**
 * Group files by category and directory structure
 */
function groupByCategory(files: MdxFileInfo[]): Map<string, MdxFileInfo[]> {
  const groups = new Map<string, MdxFileInfo[]>()

  for (const file of files) {
    // Extract the top-level directory (e.g., "guides", "api")
    const parts = file.href.split("/").filter(Boolean)
    const topLevel = parts.length > 1 ? parts[0] : "root"

    if (!groups.has(topLevel)) {
      groups.set(topLevel, [])
    }
    groups.get(topLevel)!.push(file)
  }

  return groups
}

/**
 * Get heading name for a category
 */
function getCategoryHeading(category: string): string {
  const headings: Record<string, string> = {
    guides: "Guides",
    api: "API Reference",
    root: "Getting Started",
  }
  return (
    headings[category] || category.charAt(0).toUpperCase() + category.slice(1)
  )
}

/**
 * Generate Paths array from grouped files
 */
function generatePaths(groups: Map<string, MdxFileInfo[]>): Paths[] {
  const paths: Paths[] = []

  // Define order of categories
  const categoryOrder = ["root", "guides", "api"]
  const sortedCategories = Array.from(groups.keys()).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a)
    const bIndex = categoryOrder.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  for (const [index, category] of sortedCategories.entries()) {
    const files = groups.get(category)!

    // Sort files by order
    files.sort((a, b) => a.order - b.order)

    // Add spacer before each section except the first
    if (index > 0) {
      paths.push({ spacer: true })
    }

    // Add files from this category
    for (const [fileIndex, file] of files.entries()) {
      const pathItem: Extract<Paths, { href: string; title: string }> = {
        title: file.title,
        href: file.href,
      }

      // Add heading to the first item in each category
      if (fileIndex === 0) {
        pathItem.heading = file.heading || getCategoryHeading(category)
      }

      paths.push(pathItem)
    }
  }

  return paths
}

/**
 * Generate TypeScript code for the documents file
 */
function generateDocumentsCode(paths: Paths[]): string {
  const pathsJson = JSON.stringify(paths, null, 2)
    .replace(/"(\w+)":/g, "$1:") // Remove quotes from keys
    .replace(/: true/g, ": true") // Keep true as boolean

  return `import { Paths } from "@/lib/pageroutes"

export const Documents: Paths[] = ${pathsJson}
`
}

/**
 * Main function
 */
async function generateDocuments() {
  try {
    console.log("🔍 Scanning MDX files...")

    // Get all MDX files
    const mdxFiles = await getMdxFiles(docsDir)
    console.log(`   Found ${mdxFiles.length} MDX files`)

    // Extract metadata from each file
    console.log("📖 Extracting metadata...")
    const fileInfos: MdxFileInfo[] = []
    for (const file of mdxFiles) {
      const info = await extractMdxInfo(file)
      if (info) {
        fileInfos.push(info)
      }
    }
    console.log(`   Processed ${fileInfos.length} documents`)

    // Group by category
    console.log("📂 Grouping by category...")
    const groups = groupByCategory(fileInfos)
    console.log(
      `   Found ${groups.size} categories:`,
      Array.from(groups.keys())
    )

    // Generate Paths array
    console.log("⚙️  Generating Paths array...")
    const paths = generatePaths(groups)
    console.log(`   Generated ${paths.length} path items`)

    // Generate the TypeScript code
    console.log("✍️  Writing to documents.ts...")
    const code = generateDocumentsCode(paths)
    await fs.writeFile(documentsFile, code, "utf-8")

    console.log("✅ Successfully generated documents.ts!")
    console.log("\nGenerated structure:")
    for (const path of paths) {
      if ("spacer" in path) {
        console.log("   ---")
      } else {
        const prefix = path.heading ? `📚 ${path.heading}` : "   "
        console.log(`   ${prefix} ${path.title} → ${path.href}`)
      }
    }
  } catch (error) {
    console.error("❌ Error generating documents:", error)
    process.exit(1)
  }
}

// Run the script
generateDocuments()
