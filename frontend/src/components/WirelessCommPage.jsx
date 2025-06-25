import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Signal, Calculator, Brain } from 'lucide-react'
import wirelessDiagram from '../assets/images/wireless_comm_diagram.png'

export function WirelessCommPage() {
  const [inputs, setInputs] = useState({
    sourceDataRate: '',
    samplingRate: '',
    quantizationBits: '',
    sourceCompressionRatio: '',
    channelCodeRate: '',
    interleavingFactor: '',
    burstOverhead: ''
  })

  const [results, setResults] = useState(null)
  const [aiExplanation, setAiExplanation] = useState('')
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false)

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const fetchAIExplanation = async (calculatedResults) => {
    setIsLoadingExplanation(true)
    try {
      const response = await fetch('http://localhost:3000/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: 'wireless_comm',
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

  const calculateRates = async () => {
    const {
      sourceDataRate,
      samplingRate,
      quantizationBits,
      sourceCompressionRatio,
      channelCodeRate,
      interleavingFactor,
      burstOverhead
    } = inputs

    // Convert inputs to numbers
    const R_source = parseFloat(sourceDataRate)
    const f_s = parseFloat(samplingRate)
    const n_bits = parseFloat(quantizationBits)
    const compression = parseFloat(sourceCompressionRatio)
    const code_rate = parseFloat(channelCodeRate)
    const interleaving = parseFloat(interleavingFactor)
    const overhead = parseFloat(burstOverhead)

    // Calculate rates at each block (CORRECTED)
    const samplerRate = f_s; // Sampling rate
    const quantizerRate = f_s * n_bits; // Quantizer output rate (bits/sec)
    const sourceEncoderRate = quantizerRate * compression; // Source encoder output rate (bits/sec)
    const channelEncoderRate = sourceEncoderRate / code_rate; // Channel encoder output rate (bits/sec)
    const interleaverRate = channelEncoderRate; // Interleaving doesn't change rate
    const burstFormatterRate = interleaverRate * (1 + overhead / 100); // Burst formatter output rate (bits/sec)

    const calculatedResults = {
      samplerOutput: samplerRate.toFixed(2),
      quantizerOutput: quantizerRate.toFixed(2),
      sourceEncoderOutput: sourceEncoderRate.toFixed(2),
      channelEncoderOutput: channelEncoderRate.toFixed(2),
      interleaverOutput: interleaverRate.toFixed(2),
      burstFormatterOutput: burstFormatterRate.toFixed(2),
    };

    setResults(calculatedResults);

    // Fetch AI explanation from backend
    await fetchAIExplanation(calculatedResults);
  }

  const isFormValid = Object.values(inputs).every(value => value !== '' && !isNaN(parseFloat(value)))

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-600 rounded-full">
            <Signal className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Wireless Communication System</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Calculate the data rates at the output of each processing block in a wireless communication system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>System Parameters</span>
            </CardTitle>
            <CardDescription>
              Enter the parameters for your wireless communication system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sourceDataRate">Source Data Rate (bps)</Label>
              <Input
                id="sourceDataRate"
                type="number"
                placeholder="e.g., 1000000"
                value={inputs.sourceDataRate}
                onChange={(e) => handleInputChange('sourceDataRate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="samplingRate">Sampling Rate (Hz)</Label>
              <Input
                id="samplingRate"
                type="number"
                placeholder="e.g., 8000"
                value={inputs.samplingRate}
                onChange={(e) => handleInputChange('samplingRate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantizationBits">Quantization Bits</Label>
              <Input
                id="quantizationBits"
                type="number"
                placeholder="e.g., 8"
                value={inputs.quantizationBits}
                onChange={(e) => handleInputChange('quantizationBits', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceCompressionRatio">Source Compression Ratio</Label>
              <Input
                id="sourceCompressionRatio"
                type="number"
                step="0.1"
                placeholder="e.g., 0.5"
                value={inputs.sourceCompressionRatio}
                onChange={(e) => handleInputChange('sourceCompressionRatio', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channelCodeRate">Channel Code Rate</Label>
              <Input
                id="channelCodeRate"
                type="number"
                step="0.1"
                placeholder="e.g., 0.75"
                value={inputs.channelCodeRate}
                onChange={(e) => handleInputChange('channelCodeRate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interleavingFactor">Interleaving Factor</Label>
              <Input
                id="interleavingFactor"
                type="number"
                step="0.1"
                placeholder="e.g., 1.0"
                value={inputs.interleavingFactor}
                onChange={(e) => handleInputChange('interleavingFactor', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="burstOverhead">Burst Overhead (%)</Label>
              <Input
                id="burstOverhead"
                type="number"
                placeholder="e.g., 10"
                value={inputs.burstOverhead}
                onChange={(e) => handleInputChange('burstOverhead', e.target.value)}
              />
            </div>

            <Button 
              onClick={calculateRates} 
              disabled={!isFormValid}
              className="w-full"
            >
              Calculate Rates
            </Button>
          </CardContent>
        </Card>

        {/* System Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>System Block Diagram</CardTitle>
            <CardDescription>
              Wireless communication system processing blocks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src={wirelessDiagram} 
              alt="Wireless Communication System Diagram"
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
              <span>Calculation Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Sampler Output</h3>
                <p className="text-2xl font-bold text-blue-600">{results.samplerOutput} bps</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Quantizer Output</h3>
                <p className="text-2xl font-bold text-green-600">{results.quantizerOutput} bps</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900">Source Encoder Output</h3>
                <p className="text-2xl font-bold text-purple-600">{results.sourceEncoderOutput} bps</p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-orange-900">Channel Encoder Output</h3>
                <p className="text-2xl font-bold text-orange-600">{results.channelEncoderOutput} bps</p>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-900">Interleaver Output</h3>
                <p className="text-2xl font-bold text-red-600">{results.interleaverOutput} bps</p>
              </div>
              
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-semibold text-indigo-900">Burst Formatter Output</h3>
                <p className="text-2xl font-bold text-indigo-600">{results.burstFormatterOutput} bps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Explanation */}
      {(aiExplanation || isLoadingExplanation) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI-Powered Explanation</span>
            </CardTitle>
            <CardDescription>
              Detailed methodology and step-by-step calculation explanation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingExplanation ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Generating AI explanation...</span>
              </div>
            ) : (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                  {aiExplanation}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}


