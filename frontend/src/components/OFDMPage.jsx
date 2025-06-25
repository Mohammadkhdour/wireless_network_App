import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Zap, Calculator, Brain } from 'lucide-react'
import ofdmDiagram from '../assets/images/ofdm_diagram.png'



export function OFDMPage() {
  const [inputs, setInputs] = useState({
    subcarrierSpacing: '',
    symbolDuration: '',
    cyclicPrefixLength: '',
    modulationScheme: '',
    numSubcarriers: '',
    numResourceBlocks: '',
    subcarriersPerRB: '',
    parallelRBs: ''
  })

  const [results, setResults] = useState(null)
  const [aiExplanation, setAiExplanation] = useState('')
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false)

  const modulationBits = {
    'BPSK': 1,
    'QPSK': 2,
    '16QAM': 4,
    '64QAM': 6,
    '256QAM': 8
  }

  const fetchAIExplanation = async (calculatedResults) => {
    setIsLoadingExplanation(true)
    // Clear previous explanation when starting a new fetch
    setAiExplanation(''); 
    try {
      const response = await fetch('http://localhost:3000/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: 'ofdm',
          inputs: inputs,
          results: calculatedResults
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAiExplanation(data.explanation)
      } else {
        setAiExplanation('Unable to generate AI explanation at this time. Please check your backend connection.')
      }
    } catch (error) {
      setAiExplanation('Unable to connect to AI explanation service. Please ensure the backend is running.')
    } finally {
      setIsLoadingExplanation(false)
    }
  }

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const calculateOFDMRates = async () => {
    const {
      subcarrierSpacing,
      symbolDuration,
      cyclicPrefixLength,
      modulationScheme,
      numSubcarriers,
      numResourceBlocks,
      subcarriersPerRB,
      parallelRBs
    } = inputs

    // Convert inputs to numbers
    const deltaF = parseFloat(subcarrierSpacing) * 1000 // Convert kHz to Hz
    const T_symbol = parseFloat(symbolDuration) * 1e-6 // Convert μs to seconds
    const T_cp = parseFloat(cyclicPrefixLength) * 1e-6 // Convert μs to seconds
    const bitsPerSymbol = modulationBits[modulationScheme] || 2
    const N_sc = parseFloat(numSubcarriers)
    const N_rb = parseFloat(numResourceBlocks)
    const N_sc_rb = parseFloat(subcarriersPerRB)
    const N_parallel = parseFloat(parallelRBs)

    // Calculate rates (CORRECTED)
    const T_total = T_symbol + T_cp  // Total symbol time including cyclic prefix
    const resourceElementRate = bitsPerSymbol / T_total
    const ofdmSymbolRate = N_sc * bitsPerSymbol / T_total
    const resourceBlockRate = N_sc_rb * bitsPerSymbol / T_total
    const maxTransmissionCapacity = N_rb * N_sc_rb * bitsPerSymbol / T_total // Total capacity of all RBs
    const spectralEfficiency = (N_sc * bitsPerSymbol / T_total) / (N_sc * deltaF) // (bits/s) / Hz = bits/s/Hz

    const calculatedResults = {
      resourceElementRate: (resourceElementRate / 1000).toFixed(2), // Convert to kbps
      ofdmSymbolRate: (ofdmSymbolRate / 1e6).toFixed(2), // Convert to Mbps
      resourceBlockRate: (resourceBlockRate / 1000).toFixed(2), // Convert to kbps
      maxTransmissionCapacity: (maxTransmissionCapacity / 1e6).toFixed(2), // Convert to Mbps
      spectralEfficiency: spectralEfficiency.toFixed(4)
    }

    setResults(calculatedResults);
    // Fetch AI explanation based on the calculated results
    await fetchAIExplanation(calculatedResults);

    // Generate AI explanation
//     const explanation = `
// OFDM System Analysis Results:

// **Input Parameters:**
// - Subcarrier Spacing: ${inputs.subcarrierSpacing} kHz
// - Symbol Duration: ${inputs.symbolDuration} μs
// - Cyclic Prefix Length: ${inputs.cyclicPrefixLength} μs
// - Modulation Scheme: ${inputs.modulationScheme} (${bitsPerSymbol} bits/symbol)
// - Number of Subcarriers: ${inputs.numSubcarriers}
// - Number of Resource Blocks: ${inputs.numResourceBlocks}
// - Subcarriers per RB: ${inputs.subcarriersPerRB}
// - Parallel RBs: ${inputs.parallelRBs}

// **Calculated Results:**
// - Resource Element Data Rate: ${calculatedResults.resourceElementRate} kbps
// - OFDM Symbol Data Rate: ${calculatedResults.ofdmSymbolRate} Mbps
// - Resource Block Data Rate: ${calculatedResults.resourceBlockRate} kbps
// - Maximum Transmission Capacity: ${calculatedResults.maxTransmissionCapacity} Mbps
// - Spectral Efficiency: ${calculatedResults.spectralEfficiency} bps/Hz

// **Explanation:**

// 1. **Resource Element Data Rate**: This is the data rate carried by the smallest unit in OFDM, which is one subcarrier over one OFDM symbol duration. It depends on the modulation scheme (bits per symbol) and the total symbol duration (including cyclic prefix).
//    - Formula: \( R_{RE} = \frac{\text{Bits per Symbol}}{\text{Total Symbol Duration}} \)

// 2. **OFDM Symbol Data Rate**: This is the total data rate carried by all active subcarriers within a single OFDM symbol. It's the sum of the data rates of all resource elements in one symbol.
//    - Formula: \( R_{OFDM\_symbol} = \frac{\text{Number of Subcarriers} \times \text{Bits per Symbol}}{\text{Total Symbol Duration}} \)

// 3. **Resource Block Data Rate**: A Resource Block (RB) is a fundamental unit of resource allocation in systems like LTE, typically consisting of 12 subcarriers over one slot (multiple OFDM symbols). This calculation shows the rate for a single RB over one symbol duration.
//    - Formula: \( R_{RB} = \frac{\text{Subcarriers per RB} \times \text{Bits per Symbol}}{\text{Total Symbol Duration}} \)

// 4. **Maximum Transmission Capacity**: This represents the theoretical peak data rate achievable across the entire allocated bandwidth, considering all available Resource Blocks transmitting in parallel.
//    - Formula: \( C_{max} = \text{Number of Resource Blocks} \times \text{Subcarriers per RB} \times \frac{\text{Bits per Symbol}}{\text{Total Symbol Duration}} \)
//    - Note: This simplified calculation assumes all RBs are used for data and doesn't account for control signals, guard bands, or coding.

// 5. **Spectral Efficiency**: This metric measures how efficiently the available bandwidth is used to transmit data. It's the data rate per unit of bandwidth (bits/s/Hz). Higher spectral efficiency means more data can be transmitted in the same bandwidth.
//    - Formula: \( \eta = \frac{\text{OFDM Symbol Data Rate}}{\text{Total Bandwidth}} = \frac{\text{Number of Subcarriers} \times \text{Bits per Symbol}}{\text{Total Symbol Duration} \times \text{Number of Subcarriers} \times \text{Subcarrier Spacing}} \)

// **Key Points:**
// - The Cyclic Prefix (CP) is added to each symbol to combat multipath interference, but it reduces the effective data rate as it's overhead.
// - Higher-order modulation schemes (like 64-QAM, 256-QAM) increase the bits per symbol, thus increasing data rates, but require a higher Signal-to-Noise Ratio (SNR) for reliable reception.
// - OFDM divides the total bandwidth into many narrow orthogonal subcarriers, which helps in dealing with frequency-selective fading.
//     `
    // setAiExplanation(explanation)
  }

  const isFormValid = Object.values(inputs).every(value => value !== '')

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-green-600 rounded-full">
            <Zap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">OFDM Systems</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Calculate data rates for OFDM resource elements, symbols, resource blocks, and spectral efficiency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>OFDM Parameters</span>
            </CardTitle>
            <CardDescription>
              Enter the parameters for your OFDM system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subcarrierSpacing">Subcarrier Spacing (kHz)</Label>
              <Input
                id="subcarrierSpacing"
                type="number"
                placeholder="e.g., 15"
                value={inputs.subcarrierSpacing}
                onChange={(e) => handleInputChange('subcarrierSpacing', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbolDuration">Symbol Duration (μs)</Label>
              <Input
                id="symbolDuration"
                type="number"
                placeholder="e.g., 66.7"
                value={inputs.symbolDuration}
                onChange={(e) => handleInputChange('symbolDuration', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cyclicPrefixLength">Cyclic Prefix Length (μs)</Label>
              <Input
                id="cyclicPrefixLength"
                type="number"
                placeholder="e.g., 4.7"
                value={inputs.cyclicPrefixLength}
                onChange={(e) => handleInputChange('cyclicPrefixLength', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modulationScheme">Modulation Scheme</Label>
              <Select value={inputs.modulationScheme} onValueChange={(value) => handleInputChange('modulationScheme', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select modulation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BPSK">BPSK (1 bit/symbol)</SelectItem>
                  <SelectItem value="QPSK">QPSK (2 bits/symbol)</SelectItem>
                  <SelectItem value="16QAM">16-QAM (4 bits/symbol)</SelectItem>
                  <SelectItem value="64QAM">64-QAM (6 bits/symbol)</SelectItem>
                  <SelectItem value="256QAM">256-QAM (8 bits/symbol)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numSubcarriers">Number of Subcarriers</Label>
              <Input
                id="numSubcarriers"
                type="number"
                placeholder="e.g., 1200"
                value={inputs.numSubcarriers}
                onChange={(e) => handleInputChange('numSubcarriers', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numResourceBlocks">Number of Resource Blocks</Label>
              <Input
                id="numResourceBlocks"
                type="number"
                placeholder="e.g., 100"
                value={inputs.numResourceBlocks}
                onChange={(e) => handleInputChange('numResourceBlocks', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcarriersPerRB">Subcarriers per Resource Block</Label>
              <Input
                id="subcarriersPerRB"
                type="number"
                placeholder="e.g., 12"
                value={inputs.subcarriersPerRB}
                onChange={(e) => handleInputChange('subcarriersPerRB', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parallelRBs">Parallel Resource Blocks</Label>
              <Input
                id="parallelRBs"
                type="number"
                placeholder="e.g., 50"
                value={inputs.parallelRBs}
                onChange={(e) => handleInputChange('parallelRBs', e.target.value)}
              />
            </div>

            <Button
              onClick={calculateOFDMRates}
              disabled={!isFormValid}
              className="w-full"
            >
              Calculate OFDM Rates
            </Button>
          </CardContent>
        </Card>

        {/* OFDM Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>OFDM System Diagram</CardTitle>
            <CardDescription>
              OFDM transmitter and receiver block diagram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={ofdmDiagram}
              alt="OFDM System Diagram"
              className="w-full h-auto rounded-lg border"
            />
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>OFDM Calculation Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Resource Element Rate</h3>
                <p className="text-2xl font-bold text-blue-600">{results.resourceElementRate} kbps</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">OFDM Symbol Rate</h3>
                <p className="text-2xl font-bold text-green-600">{results.ofdmSymbolRate} Mbps</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900">Resource Block Rate</h3>
                <p className="text-2xl font-bold text-purple-600">{results.resourceBlockRate} kbps</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-orange-900">Max Transmission Capacity</h3>
                <p className="text-2xl font-bold text-orange-600">{results.maxTransmissionCapacity} Mbps</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-900">Spectral Efficiency</h3>
                <p className="text-2xl font-bold text-red-600">{results.spectralEfficiency} bps/Hz</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Explanation */}
      {(aiExplanation || isLoadingExplanation) && ( // Render if explanation exists OR is loading
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI-Powered Explanation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingExplanation ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Generating AI explanation...</span>
              </div>
            ) : (
              // Only show explanation if it exists (not empty string)
              aiExplanation && (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                    {aiExplanation}
                  </pre>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

