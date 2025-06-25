import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, Brain, Signal } from 'lucide-react'

export function LinkBudgetPage() {
  const [inputs, setInputs] = useState({
    transmitterPower: '',
    transmitterGain: '',
    receiverGain: '',
    frequency: '',
    distance: '',
    pathLossModel: 'freespace',
    additionalLosses: '',
    noiseFloor: '',
    requiredSNR: ''
  })

  const [results, setResults] = useState(null)
  const [aiExplanation, setAiExplanation] = useState('')
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false)


  const fetchAIExplanation = async (calculatedResults) => {
    setIsLoadingExplanation(true)
    try {
      const response = await fetch('http://localhost:3000/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: 'link_budget', // Corrected scenario name to match backend (link_budget)
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

  const calculateLinkBudget = async() => {
    const {
      transmitterPower,
      transmitterGain,
      receiverGain,
      frequency,
      distance,
      pathLossModel,
      additionalLosses,
      noiseFloor,
      requiredSNR
    } = inputs

    // Convert inputs to numbers
    const P_tx = parseFloat(transmitterPower) // dBm
    const G_tx = parseFloat(transmitterGain) // dBi
    const G_rx = parseFloat(receiverGain) // dBi
    const f = parseFloat(frequency) * 1e9 // Convert GHz to Hz
    const d = parseFloat(distance) * 1000 // Convert km to meters
    const L_add = parseFloat(additionalLosses) || 0 // dB
    const N_floor = parseFloat(noiseFloor) || -100 // dBm
    const SNR_req = parseFloat(requiredSNR) || 10 // dB

    // Calculate path loss based on model (CORRECTED)
    let pathLoss
    if (pathLossModel === 'freespace') {
      // Free space path loss: FSPL (dB) = 20*log10(d_km) + 20*log10(f_MHz) + 92.45
      // Or FSPL (dB) = 20*log10(d_m) + 20*log10(f_Hz) - 147.56 (using c=3e8)
      // Using the common formula: FSPL = 32.45 + 20*log10(f_MHz) + 20*log10(d_km)
      const f_mhz = f / 1e6; // Convert Hz to MHz
      const d_km = d / 1000; // Convert meters to km
      pathLoss = 32.45 + 20 * Math.log10(f_mhz) + 20 * Math.log10(d_km);
    } else if (pathLossModel === 'tworay') {
      // Two-ray ground reflection model: PL = 40*log10(d) - (20*log10(h_tx) + 20*log10(h_rx))
      const h_tx = 30; // Assume 30m transmitter height
      const h_rx = 2; // Assume 2m receiver height
      // Ensure d is not zero or too small for log10
      if (d <= 0) {
          pathLoss = Infinity; // Or handle as an error
      } else {
          pathLoss = 40 * Math.log10(d) - (20 * Math.log10(h_tx) + 20 * Math.log10(h_rx));
      }
    } else if (pathLossModel === 'hata') {
      // Urban Hata model (simplified for medium cities, f in MHz, d in km)
      const f_mhz = f / 1e6; // Convert Hz to MHz
      const d_km = d / 1000; // Convert meters to km
      const h_tx = 30; // Assume 30m transmitter height
      const h_rx = 2; // Assume 2m receiver height
       // Ensure d_km is not zero or too small for log10
      if (d_km <= 0.02) { // Hata is typically valid for d > 20m
          pathLoss = Infinity; // Or handle as an error
      } else {
          const a_h_rx = (1.1 * Math.log10(f_mhz) - 0.7) * h_rx - (1.56 * Math.log10(f_mhz) - 0.8); // Correction factor for receiver antenna height
          pathLoss = 69.55 + 26.16 * Math.log10(f_mhz) - 13.82 * Math.log10(h_tx) - a_h_rx + (44.9 - 6.55 * Math.log10(h_tx)) * Math.log10(d_km);
      }
    } else {
        pathLoss = 0; // Default or error case
    }


    // Calculate received power (CORRECTED)
    const P_rx = P_tx + G_tx + G_rx - pathLoss - L_add;

    // Calculate link margin
    const linkMargin = P_rx - N_floor - SNR_req;

    const calculatedResults = {
      transmittedPowerDbm: P_tx.toFixed(2),
      pathLossDb: isFinite(pathLoss) ? pathLoss.toFixed(2) : 'N/A', // Handle potential Infinity from path loss
      receivedPowerDbm: isFinite(P_rx) ? P_rx.toFixed(2) : 'N/A', // Handle potential Infinity
      linkMarginDb: isFinite(linkMargin) ? linkMargin.toFixed(2) : 'N/A', // Handle potential Infinity
      linkStatus: isFinite(linkMargin) ? (linkMargin > 0 ? 'PASS' : 'FAIL') : 'N/A' // Handle potential Infinity
    }

    setResults(calculatedResults)
   await fetchAIExplanation(calculatedResults)

//     // Generate AI explanation
//     const explanation = `
// Link Budget Analysis Results:

// **System Configuration:**
// - Transmitter Power: ${P_tx} dBm
// - Transmitter Antenna Gain: ${G_tx} dBi
// - Receiver Antenna Gain: ${G_rx} dBi
// - Operating Frequency: ${(f / 1e9).toFixed(2)} GHz
// - Distance: ${(d / 1000).toFixed(2)} km
// - Path Loss Model: ${pathLossModel.toUpperCase()}

// **Calculations:**

// 1. **Path Loss**: ${pathLoss.toFixed(2)} dB
//    ${pathLossModel === 'freespace' ? 
//      `- Free Space Path Loss Formula (FSPL): \( FSPL = 32.45 + 20 \log_{10}(f_{MHz}) + 20 \log_{10}(d_{km}) \)
//    - This model assumes an unobstructed line-of-sight path between the transmitter and receiver in free space.
//    - FSPL = ${pathLoss.toFixed(2)} dB` :
//      pathLossModel === 'tworay' ?
//      `- Two-Ray Ground Reflection Model:
//    - This model considers both the direct path and a single ground-reflected path, providing a more realistic prediction for longer distances over flat terrain.
//    - Path Loss = ${pathLoss.toFixed(2)} dB` :
//      `- Hata Urban Model:
//    - This empirical model is widely used for path loss prediction in urban environments, taking into account frequency, antenna heights, and distance.
//    - Path Loss = ${pathLoss.toFixed(2)} dB`}

// 2. **Received Power**: ${P_rx.toFixed(2)} dBm
//    - Formula: \( P_{rx} = P_{tx} + G_{tx} + G_{rx} - L_{path} - L_{additional} \)
//    - This is the power level of the signal arriving at the receiver antenna.
//    - P_rx = ${P_tx} + ${G_tx} + ${G_rx} - ${pathLoss.toFixed(2)} - ${L_add}
//    - P_rx = ${P_rx.toFixed(2)} dBm

// 3. **Link Margin**: ${linkMargin.toFixed(2)} dB
//    - Formula: \( M_{link} = P_{rx} - N_{floor} - SNR_{req} \)
//    - The link margin indicates how much excess signal strength is available beyond what is minimally required for reliable communication. A positive margin is desirable.
//    - Link Margin = ${P_rx.toFixed(2)} - (${N_floor}) - ${SNR_req}
//    - Link Margin = ${linkMargin.toFixed(2)} dB

// **Link Assessment:**
// ${linkMargin > 0 ? 
//   `✅ LINK VIABLE: Positive link margin of ${linkMargin.toFixed(2)} dB indicates the link will work reliably.
// The system has sufficient power budget to overcome path loss and maintain required signal quality.` :
//   `❌ LINK NOT VIABLE: Negative link margin of ${linkMargin.toFixed(2)} dB indicates insufficient signal strength.
// Consider increasing transmitter power, using higher gain antennas, or reducing distance.`}

// **Recommendations:**
// - For reliable communication, maintain at least 10-15 dB link margin.
// - Consider weather conditions and fading margins in real deployments.
// - Higher frequencies experience greater path loss but offer more bandwidth.
//     `
    // setAiExplanation(explanation)
  }

  const isFormValid = ['transmitterPower', 'transmitterGain', 'receiverGain', 'frequency', 'distance'].every(
    field => inputs[field] !== '' && !isNaN(parseFloat(inputs[field]))
  )

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-purple-600 rounded-full">
            <Calculator className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Link Budget Calculation</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Calculate transmitted power and received signal strength for wireless communication links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Signal className="h-5 w-5" />
              <span>Link Parameters</span>
            </CardTitle>
            <CardDescription>
              Enter the parameters for your wireless link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transmitterPower">Transmitter Power (dBm)</Label>
              <Input
                id="transmitterPower"
                type="number"
                placeholder="e.g., 30"
                value={inputs.transmitterPower}
                onChange={(e) => handleInputChange('transmitterPower', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transmitterGain">Transmitter Antenna Gain (dBi)</Label>
              <Input
                id="transmitterGain"
                type="number"
                placeholder="e.g., 15"
                value={inputs.transmitterGain}
                onChange={(e) => handleInputChange('transmitterGain', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverGain">Receiver Antenna Gain (dBi)</Label>
              <Input
                id="receiverGain"
                type="number"
                placeholder="e.g., 12"
                value={inputs.receiverGain}
                onChange={(e) => handleInputChange('receiverGain', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Operating Frequency (GHz)</Label>
              <Input
                id="frequency"
                type="number"
                step="0.1"
                placeholder="e.g., 2.4"
                value={inputs.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                placeholder="e.g., 5.0"
                value={inputs.distance}
                onChange={(e) => handleInputChange('distance', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pathLossModel">Path Loss Model</Label>
              <Select value={inputs.pathLossModel} onValueChange={(value) => handleInputChange('pathLossModel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select path loss model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freespace">Free Space</SelectItem>
                  <SelectItem value="tworay">Two-Ray Ground</SelectItem>
                  <SelectItem value="hata">Hata Urban</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalLosses">Additional Losses (dB)</Label>
              <Input
                id="additionalLosses"
                type="number"
                placeholder="e.g., 3"
                value={inputs.additionalLosses}
                onChange={(e) => handleInputChange('additionalLosses', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noiseFloor">Noise Floor (dBm)</Label>
              <Input
                id="noiseFloor"
                type="number"
                placeholder="e.g., -100"
                value={inputs.noiseFloor}
                onChange={(e) => handleInputChange('noiseFloor', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredSNR">Required SNR (dB)</Label>
              <Input
                id="requiredSNR"
                type="number"
                placeholder="e.g., 10"
                value={inputs.requiredSNR}
                onChange={(e) => handleInputChange('requiredSNR', e.target.value)}
              />
            </div>

            <Button 
              onClick={calculateLinkBudget} 
              disabled={!isFormValid}
              className="w-full"
            >
              Calculate Link Budget
            </Button>
          </CardContent>
        </Card>

        {/* Link Budget Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>Link Budget Components</CardTitle>
            <CardDescription>
              Key elements affecting wireless link performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Transmitter Side</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Transmitter Power (dBm)</li>
                  <li>• Antenna Gain (dBi)</li>
                  <li>• Cable/Connector Losses</li>
                </ul>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">Path Losses</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Free Space Path Loss</li>
                  <li>• Atmospheric Absorption</li>
                  <li>• Multipath Fading</li>
                  <li>• Obstruction Losses</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Receiver Side</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Antenna Gain (dBi)</li>
                  <li>• Receiver Sensitivity</li>
                  <li>• Noise Figure</li>
                  <li>• Required SNR</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Link Budget Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Transmitted Power</h3>
                <p className="text-2xl font-bold text-blue-600">{results.transmittedPowerDbm} dBm</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-900">Path Loss</h3>
                <p className="text-2xl font-bold text-red-600">{results.pathLossDb} dB</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Received Power</h3>
                <p className="text-2xl font-bold text-green-600">{results.receivedPowerDbm} dBm</p>
              </div>
              <div className={`p-4 rounded-lg ${results.linkStatus === 'PASS' ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                <h3 className={`font-semibold ${results.linkStatus === 'PASS' ? 'text-emerald-900' : 'text-orange-900'}`}>
                  Link Margin
                </h3>
                <p className={`text-2xl font-bold ${results.linkStatus === 'PASS' ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {results.linkMarginDb} dB
                </p>
                <p className={`text-sm font-medium ${results.linkStatus === 'PASS' ? 'text-emerald-700' : 'text-orange-700'}`}>
                  {results.linkStatus}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Explanation */}
      {aiExplanation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI-Powered Explanation</span>
            </CardTitle>
            <CardDescription>
              Detailed link budget analysis and recommendations
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

