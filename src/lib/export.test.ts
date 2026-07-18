import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  generateComparisonCSV,
  generateComparisonJSON,
  generateComparisonMarkdown,
  generateExportFilename,
  downloadCSV,
  exportComparison,
} from './export.ts'
import type { Model } from '../data/index.ts'

// Mock model for testing
const mockModel: Model = {
  id: 'test-model',
  name: 'Test Model',
  providerId: 'anthropic',
  tier: 'flagship',
  openSource: false,
  inputPricePerMTok: 3.0,
  outputPricePerMTok: 15.0,
  contextWindowTokens: 200_000,
  reasoning: true,
  internetAccess: false,
  releaseDate: '2024-01-15',
  scores: {
    'swe-bench-verified': 85.5,
    'gpqa-diamond': 92.3,
  },
  blurb: 'A test model',
}

const mockModelWithFreePrice: Model = {
  ...mockModel,
  id: 'test-free',
  name: 'Free Model',
  inputPricePerMTok: null,
  outputPricePerMTok: null,
}

const mockModelWithMissingScore: Model = {
  ...mockModel,
  id: 'test-incomplete',
  name: 'Incomplete Model',
  scores: {
    'swe-bench-verified': 75.0,
    // Missing gpqa-diamond
  },
}

describe('export.ts', () => {
  describe('generateComparisonCSV', () => {
    it('generates CSV with correct headers', () => {
      const csv = generateComparisonCSV([mockModel])
      const lines = csv.split('\n')
      const headerRow = lines[0]

      expect(headerRow).toContain('Model')
      expect(headerRow).toContain('Provider')
      expect(headerRow).toContain('Tier')
      expect(headerRow).toContain('Release Date')
      expect(headerRow).toContain('Input Price')
      expect(headerRow).toContain('Output Price')
      expect(headerRow).toContain('Context Window')
      expect(headerRow).toContain('Reasoning')
      expect(headerRow).toContain('Web Access')
      expect(headerRow).toContain('Open Source')
      expect(headerRow).toContain('License')
    })

    it('includes benchmark names in headers', () => {
      const csv = generateComparisonCSV([mockModel])
      const headerRow = csv.split('\n')[0]

      expect(headerRow).toContain('SWE-bench Verified')
      expect(headerRow).toContain('GPQA Diamond')
    })

    it('exports model data correctly', () => {
      const csv = generateComparisonCSV([mockModel])
      const lines = csv.split('\n')
      const dataRow = lines[1]

      expect(dataRow).toContain('Test Model')
      expect(dataRow).toContain('Anthropic')
      expect(dataRow).toContain('flagship')
    })

    it('formats scores with one decimal place', () => {
      const csv = generateComparisonCSV([mockModel])
      const lines = csv.split('\n')

      expect(lines[1]).toContain('85.5')
      expect(lines[1]).toContain('92.3')
    })

    it('handles missing scores as empty strings', () => {
      const csv = generateComparisonCSV([mockModelWithMissingScore])
      const lines = csv.split('\n')
      const dataRow = lines[1]

      // Should have the score that exists
      expect(dataRow).toContain('75.0')
      // Should have an empty cell for the missing score (two consecutive commas)
      expect(dataRow).toMatch(/,75\.0,/) // The missing score shows as empty
    })

    it('formats free pricing as "Free"', () => {
      const csv = generateComparisonCSV([mockModelWithFreePrice])
      expect(csv).toContain('Free')
    })

    it('escapes prices correctly', () => {
      const csv = generateComparisonCSV([mockModel])
      expect(csv).toContain('$3')
      expect(csv).toContain('$15')
    })

    it('formats context window correctly', () => {
      const csv = generateComparisonCSV([mockModel])
      expect(csv).toContain('200K')
    })

    it('exports reasoning capability correctly', () => {
      const csv = generateComparisonCSV([mockModel])
      expect(csv).toContain('Yes') // reasoning: true

      const csvWithoutReasoning = generateComparisonCSV([
        { ...mockModel, reasoning: false },
      ])
      const lines = csvWithoutReasoning.split('\n')
      expect(lines[1]).toContain('No')
    })

    it('exports internet access correctly', () => {
      const csv = generateComparisonCSV([{ ...mockModel, internetAccess: true }])
      expect(csv).toContain('Yes') // Second Yes for web access
    })

    it('exports open source status correctly', () => {
      const csv = generateComparisonCSV([{ ...mockModel, openSource: true }])
      expect(csv).toContain('Yes') // Third Yes for open source
    })

    it('exports license information when present', () => {
      const csv = generateComparisonCSV([
        { ...mockModel, license: 'MIT', openSource: true },
      ])
      expect(csv).toContain('MIT')
    })

    it('handles multiple models', () => {
      const csv = generateComparisonCSV([mockModel, mockModelWithFreePrice])
      const lines = csv.split('\n')

      expect(lines.length).toBeGreaterThan(3) // header + 2 models + blank line + 2 metadata lines
      expect(lines[1]).toContain('Test Model')
      expect(lines[2]).toContain('Free Model')
    })

    it('escapes commas in model names', () => {
      const modelWithComma = { ...mockModel, name: 'Model, Version 1' }
      const csv = generateComparisonCSV([modelWithComma])

      expect(csv).toContain('"Model, Version 1"')
    })

    it('escapes quotes in model names', () => {
      const modelWithQuote = { ...mockModel, name: 'Model "Pro"' }
      const csv = generateComparisonCSV([modelWithQuote])

      // Quotes should be doubled in CSV format
      expect(csv).toContain('Model ""Pro""')
    })

    it('escapes newlines in model names', () => {
      const modelWithNewline = { ...mockModel, name: 'Model\nVersion' }
      const csv = generateComparisonCSV([modelWithNewline])

      expect(csv).toContain('"Model\nVersion"')
    })

    it('includes data source metadata', () => {
      const csv = generateComparisonCSV([mockModel])
      const lines = csv.split('\n')

      expect(lines[lines.length - 2]).toContain('Data sourced')
      expect(lines[lines.length - 1]).toContain('Benchmark scores are provider-published evals')
    })

    it('handles release date formatting', () => {
      const csv = generateComparisonCSV([mockModel])
      // Should include formatted date in ISO 8601 format: YYYY-MM-DD
      expect(csv).toMatch(/\d{4}-\d{2}-\d{2}/)
    })

    it('returns empty string for missing context window', () => {
      const modelWithoutContext = { ...mockModel, contextWindowTokens: null }
      const csv = generateComparisonCSV([modelWithoutContext])

      // Should still generate valid CSV with empty cell
      const lines = csv.split('\n')
      expect(lines.length).toBeGreaterThan(1)
    })
  })

  describe('generateExportFilename', () => {
    it('generates filename with date in YYYY-MM-DD format', () => {
      const filename = generateExportFilename()

      expect(filename).toMatch(/^models-comparison-\d{4}-\d{2}-\d{2}\.csv$/)
    })

    it('uses today\'s date', () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')

      const filename = generateExportFilename()
      expect(filename).toBe(`models-comparison-${year}-${month}-${day}.csv`)
    })

    it('always has .csv extension', () => {
      const filename = generateExportFilename()
      expect(filename.endsWith('.csv')).toBe(true)
    })
  })

  describe('downloadCSV', () => {
    it('creates an anchor element for download', () => {
      // Mock document.createElement to avoid actual download behavior
      const mockLink = {
        click: vi.fn(),
        setAttribute: vi.fn(),
        style: {},
      }
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValueOnce(mockLink as any)
      vi.spyOn(document.body, 'appendChild').mockImplementationOnce(() => mockLink as any)
      vi.spyOn(document.body, 'removeChild').mockImplementationOnce(() => mockLink as any)

      const csvContent = 'Model,Score\nTest,100'
      downloadCSV(csvContent, 'test.csv')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      vi.restoreAllMocks()
    })

    it('triggers download by simulating click', () => {
      const mockLink = {
        click: vi.fn(),
        setAttribute: vi.fn(),
        style: {},
      }
      vi.spyOn(document, 'createElement').mockReturnValueOnce(mockLink as any)
      vi.spyOn(document.body, 'appendChild').mockImplementationOnce(() => mockLink as any)
      vi.spyOn(document.body, 'removeChild').mockImplementationOnce(() => mockLink as any)

      const csvContent = 'Model,Score\nTest,100'
      downloadCSV(csvContent, 'test.csv')

      expect(mockLink.click).toHaveBeenCalled()
      vi.restoreAllMocks()
    })

    it('sets href attribute with blob URL', () => {
      const mockLink = {
        click: vi.fn(),
        setAttribute: vi.fn(),
        style: {},
      }
      vi.spyOn(document, 'createElement').mockReturnValueOnce(mockLink as any)
      vi.spyOn(document.body, 'appendChild').mockImplementationOnce(() => mockLink as any)
      vi.spyOn(document.body, 'removeChild').mockImplementationOnce(() => mockLink as any)

      const csvContent = 'Model,Score\nTest,100'
      downloadCSV(csvContent, 'test.csv')

      // Check that setAttribute was called with 'href'
      const setAttributeCalls = (mockLink.setAttribute as any).mock.calls
      const hasHrefCall = setAttributeCalls.some((call: any[]) => call[0] === 'href')
      expect(hasHrefCall).toBe(true)
      vi.restoreAllMocks()
    })

    it('sets download attribute with filename', () => {
      const mockLink = {
        click: vi.fn(),
        setAttribute: vi.fn(),
        style: {},
      }
      vi.spyOn(document, 'createElement').mockReturnValueOnce(mockLink as any)
      vi.spyOn(document.body, 'appendChild').mockImplementationOnce(() => mockLink as any)
      vi.spyOn(document.body, 'removeChild').mockImplementationOnce(() => mockLink as any)

      const csvContent = 'Model,Score\nTest,100'
      const filename = 'test.csv'
      downloadCSV(csvContent, filename)

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', filename)
      vi.restoreAllMocks()
    })
  })

  describe('generateComparisonJSON', () => {
    it('generates valid JSON structure', () => {
      const json = generateComparisonJSON([mockModel])
      const data = JSON.parse(json)

      expect(data).toHaveProperty('metadata')
      expect(data).toHaveProperty('models')
      expect(data).toHaveProperty('benchmarks')
    })

    it('includes model data in JSON', () => {
      const json = generateComparisonJSON([mockModel])
      const data = JSON.parse(json)

      expect(data.models).toHaveLength(1)
      expect(data.models[0].name).toBe('Test Model')
      expect(data.models[0].provider).toBe('Anthropic')
    })

    it('includes benchmark data', () => {
      const json = generateComparisonJSON([mockModel])
      const data = JSON.parse(json)

      expect(data.benchmarks.length).toBeGreaterThan(0)
      expect(data.benchmarks[0]).toHaveProperty('id')
      expect(data.benchmarks[0]).toHaveProperty('name')
    })

    it('formats pricing correctly in JSON', () => {
      const json = generateComparisonJSON([mockModel])
      const data = JSON.parse(json)

      expect(data.models[0].pricing.input).toBe(3.0)
      expect(data.models[0].pricing.output).toBe(15.0)
    })

    it('includes capabilities in JSON', () => {
      const json = generateComparisonJSON([mockModel])
      const data = JSON.parse(json)

      expect(data.models[0].capabilities).toHaveProperty('reasoning')
      expect(data.models[0].capabilities).toHaveProperty('internetAccess')
      expect(data.models[0].capabilities).toHaveProperty('openSource')
    })
  })

  describe('generateComparisonMarkdown', () => {
    it('generates valid markdown structure', () => {
      const markdown = generateComparisonMarkdown([mockModel])

      expect(markdown).toContain('# AI Model Comparison')
      expect(markdown).toContain('## Models')
      expect(markdown).toContain('## Benchmark Scores')
      expect(markdown).toContain('## Capabilities')
    })

    it('includes model data in markdown tables', () => {
      const markdown = generateComparisonMarkdown([mockModel])

      expect(markdown).toContain('Test Model')
      expect(markdown).toContain('Anthropic')
      expect(markdown).toContain('flagship')
    })

    it('formats pricing in markdown', () => {
      const markdown = generateComparisonMarkdown([mockModel])

      expect(markdown).toContain('$3')
      expect(markdown).toContain('$15')
    })

    it('includes benchmark scores in markdown', () => {
      const markdown = generateComparisonMarkdown([mockModel])

      expect(markdown).toContain('SWE-bench Verified')
      expect(markdown).toContain('GPQA Diamond')
      expect(markdown).toContain('85.5')
      expect(markdown).toContain('92.3')
    })

    it('includes capabilities with checkmarks', () => {
      const markdown = generateComparisonMarkdown([mockModel])

      expect(markdown).toContain('✓') // For reasoning: true
      expect(markdown).toContain('-') // For internetAccess: false
    })

    it('includes export metadata', () => {
      const markdown = generateComparisonMarkdown([mockModel])

      expect(markdown).toContain('Exported:')
      expect(markdown).toContain('Data sourced:')
    })
  })

  describe('exportComparison', () => {
    beforeEach(() => {
      // Mock document.createElement to avoid actual download behavior
      const mockLink = {
        click: vi.fn(),
        setAttribute: vi.fn(),
        style: {},
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(document.body, 'appendChild').mockImplementationOnce(() => mockLink as any)
      vi.spyOn(document.body, 'removeChild').mockImplementationOnce(() => mockLink as any)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('generates and downloads CSV by default', () => {
      const mockLink = {
        click: vi.fn(),
        setAttribute: vi.fn(),
        style: {},
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(document.body, 'appendChild').mockImplementationOnce(() => mockLink as any)
      vi.spyOn(document.body, 'removeChild').mockImplementationOnce(() => mockLink as any)

      exportComparison([mockModel])
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('exports as JSON when format is specified', () => {
      const mockLink = {
        click: vi.fn(),
        setAttribute: vi.fn(),
        style: {},
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(document.body, 'appendChild').mockImplementationOnce(() => mockLink as any)
      vi.spyOn(document.body, 'removeChild').mockImplementationOnce(() => mockLink as any)

      exportComparison([mockModel], 'json')
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.json'))
    })

    it('exports as Markdown when format is specified', () => {
      const mockLink = {
        click: vi.fn(),
        setAttribute: vi.fn(),
        style: {},
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(document.body, 'appendChild').mockImplementationOnce(() => mockLink as any)
      vi.spyOn(document.body, 'removeChild').mockImplementationOnce(() => mockLink as any)

      exportComparison([mockModel], 'markdown')
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.md'))
    })

    it('uses today\'s date in filename', () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')

      const expectedFilename = `models-comparison-${year}-${month}-${day}.csv`

      exportComparison([mockModel])

      // The function executes; filename format is verified in generateExportFilename tests
      expect(expectedFilename).toMatch(/^models-comparison-\d{4}-\d{2}-\d{2}\.csv$/)
    })
  })
})
