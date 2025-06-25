import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Smartphone, Calculator, Brain, MapPin } from 'lucide-react'
import cellularDiagram from '../assets/images/cellular_network.png'

export function CellularPage() {
  const [inputs, setInputs] = useState({
    coverageArea: '',
    userDensity: '',
    trafficPerUser: '',
    frequencyBand: '',
    channelBandwidth: '',
    reusePattern: '',
    sectorization: '',
    linkBudgetRange: '',
    interferenceMargin: '',
    fadingMargin: ''
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
          scenario: 'cellular_design', // Corrected scenario name to match backend
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

  const calculateCellularDesign = async () => {
    const {
      coverageArea,
      userDensity,
      trafficPerUser,
      frequencyBand,
      channelBandwidth,
      reusePattern,
      sectorization,
      linkBudgetRange,
      interferenceMargin,
      fadingMargin
    } = inputs

    // Convert inputs to numbers
    const A_total = parseFloat(coverageArea) // km²
    const ρ_user = parseFloat(userDensity) // users/km²
    const T_user = parseFloat(trafficPerUser) // Erlang per user
    const f_c = parseFloat(frequencyBand) * 1e9 // Convert GHz to Hz
    const BW = parseFloat(channelBandwidth) * 1e6 // Convert MHz to Hz
    const N = parseFloat(reusePattern) // Frequency reuse pattern
    const S = parseFloat(sectorization) || 1 // Sectors per cell
    const R_max = parseFloat(linkBudgetRange) // km (max cell range from link budget)
    const I_margin = parseFloat(interferenceMargin) || 3 // dB
    const F_margin = parseFloat(fadingMargin) || 8 // dB
    
    // Calculate total users and traffic
    const totalUsers = A_total * ρ_user;
    const totalTraffic = totalUsers * T_user; // Total Erlang

    // Calculate cell radius based on coverage (assuming circular cells for simplicity)
    // R_max is the maximum cell range from link budget, which defines the coverage radius
    const R_cell_coverage = R_max;
    const A_cell_coverage = Math.PI * Math.pow(R_cell_coverage, 2); // Area of a single cell based on coverage
    const numCellsCoverage = Math.ceil(A_total / A_cell_coverage); // Number of cells needed for coverage

    // Capacity calculation using Erlang B formula (simplified approximation)
    // For a given blocking probability (e.g., 2%), we can find the number of channels (C) for a given traffic (A)
    // A common approximation for Erlang B is C ≈ A + k * sqrt(A) where k depends on blocking probability
    // Let's use a simplified approach for traffic per channel and total channels.
    const trafficPerChannel = 0.02; // Erlang per channel for a typical voice call (simplified)
    const voiceChannelBW = 200e3; // Hz (typical channel bandwidth for GSM, for example)
    const totalAvailableChannels = Math.floor(BW / voiceChannelBW); // Total channels in the system bandwidth
    
    // Calculate capacity per cell (in Erlangs) based on the number of channels per cell and traffic per channel
    // For a given frequency reuse pattern N, the number of channels per cell is totalAvailableChannels / N
    const channelsPerCell = totalAvailableChannels / N; // Channels available per cell
    const capacityPerCellErlang = channelsPerCell * (1 - 0.02); // Simplified Erlang B, assuming 2% blocking

    // Number of cells needed for capacity
    const numCellsCapacity = Math.ceil(totalTraffic / (capacityPerCellErlang * S)); // S is sectorization

    // Final number of cells is the maximum of coverage and capacity requirements
    const numCells = Math.max(numCellsCoverage, numCellsCapacity);
    
    // Recalculate cell radius based on the final number of cells
    const finalCellRadius = Math.sqrt(A_total / (numCells * Math.PI));
    
    // Spectral efficiency (simplified: total bits / total bandwidth)
    // Assuming a typical spectral efficiency for a given modulation and coding scheme
    // This is a very simplified spectral efficiency. A more accurate one would involve bits per symbol, coding rate, etc.
    const spectralEfficiency = (totalTraffic * 64e3) / BW; // Assuming 64 kbps per Erlang for voice traffic
    
    // Frequency reuse efficiency
    const reuseEfficiency = 1 / N;

    const calculatedResults = {
      numCells: numCells.toString(),
      cellRadius: finalCellRadius.toFixed(2),
      totalUsers: totalUsers.toFixed(0),
      totalTraffic: totalTraffic.toFixed(2),
      channelsPerCell: channelsPerCell.toFixed(2), // Fixed: Use calculated channelsPerCell
      capacityPerCell: capacityPerCellErlang.toFixed(2), // Fixed: Use calculated capacityPerCellErlang
      spectralEfficiency: (spectralEfficiency * 100).toFixed(2),
      reuseEfficiency: (reuseEfficiency * 100).toFixed(1)
    }

    setResults(calculatedResults)
    // Fetch AI explanation based on the calculated results
    await fetchAIExplanation(calculatedResults)

    // Generate AI explanation
//     const explanation = `
// Cellular System Design Analysis:

// **System Requirements:**
// - Coverage Area: ${A_total} km²
// - User Density: ${ρ_user} users/km²
// - Traffic per User: ${T_user} Erlang
// - Operating Frequency: ${(f_c / 1e9).toFixed(2)} GHz
// - Channel Bandwidth: ${(BW / 1e6).toFixed(1)} MHz
// - Frequency Reuse Pattern: ${N}
// - Sectorization: ${S} sectors per cell

// **Design Calculations:**

// 1. **Total System Load:**
//    - Total Users: ${totalUsers.toFixed(0)} users
//    - Total Traffic: ${totalTraffic.toFixed(2)} Erlang

// 2. **Coverage Analysis:**
//    - Maximum cell range (from link budget): ${R_max} km
//    - Cells needed for coverage: ${numCellsCoverage} cells
//    - Coverage-limited cell radius: ${R_cell_coverage.toFixed(2)} km

// 3. **Capacity Analysis (Simplified):**
//    - Total available channels: ${totalAvailableChannels}
//    - Channels per cell: ${channelsPerCell.toFixed(2)}
//    - Capacity per cell (simplified Erlang B): ${capacityPerCellErlang.toFixed(2)} Erlang
//    - Cells needed for capacity: ${numCellsCapacity} cells

// 4. **Final Design:**
//    - **Number of Cells Required: ${numCells} cells**
//    - **Cell Radius: ${finalCellRadius.toFixed(2)} km**
//    - Design is ${numCells === numCellsCoverage ? 'coverage-limited' : 'capacity-limited'}

// 5. **System Efficiency:**
//    - Spectral Efficiency: ${(spectralEfficiency * 100).toFixed(2)}%
//    - Frequency Reuse Efficiency: ${(reuseEfficiency * 100).toFixed(1)}%

// **Design Recommendations:**

// ${numCells === numCellsCoverage ? 
//   `🔍 **Coverage-Limited Design:**
// - The system is primarily limited by coverage requirements.
// - Consider increasing base station power, antenna height, or using more sensitive receivers to extend range.
// - Cell splitting might be necessary in areas with high user density to improve coverage and capacity.` :
//   `📊 **Capacity-Limited Design:**
// - The system is primarily limited by traffic capacity.
// - Implement more sectors per cell site to increase capacity within existing cells.
// - Consider using a smaller frequency reuse pattern (smaller N) if interference can be managed.
// - Explore advanced techniques like CDMA or OFDMA to improve spectral efficiency and overall capacity.`}

// **Frequency Planning:**
// - Reuse pattern N=${N} provides ${(reuseEfficiency * 100).toFixed(1)}% frequency efficiency.
// - Co-channel interference management is crucial for optimal performance.
// - ${S > 1 ? `Sectorization (${S} sectors) helps in reducing co-channel interference and improving capacity.` : 'Omnidirectional antennas are used, which might lead to higher interference.'}

// **Quality Considerations:**
// - Interference margin: ${I_margin} dB
// - Fading margin: ${F_margin} dB
// - Total link margin (simplified): ${I_margin + F_margin} dB for reliable service.

// **Note:** This is a simplified cellular design calculation. For more precise results, detailed propagation models, traffic models, and Erlang B tables should be used.
//     `
  //  setAiExplanation("hello world") // Placeholder for AI explanation
  }

  const isFormValid = ['coverageArea', 'userDensity', 'trafficPerUser', 'frequencyBand', 'channelBandwidth', 'reusePattern', 'linkBudgetRange'].every(
    field => inputs[field] !== '' && !isNaN(parseFloat(inputs[field]))
  )

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-orange-600 rounded-full">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Cellular System Design</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Design cellular networks based on coverage, capacity, and frequency planning requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>System Parameters</span>
            </CardTitle>
            <CardDescription>
              Enter the parameters for your cellular network design
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coverageArea">Coverage Area (km²)</Label>
              <Input
                id="coverageArea"
                type="number"
                placeholder="e.g., 100"
                value={inputs.coverageArea}
                onChange={(e) => handleInputChange('coverageArea', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userDensity">User Density (users/km²)</Label>
              <Input
                id="userDensity"
                type="number"
                placeholder="e.g., 1000"
                value={inputs.userDensity}
                onChange={(e) => handleInputChange('userDensity', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trafficPerUser">Traffic per User (Erlang)</Label>
              <Input
                id="trafficPerUser"
                type="number"
                step="0.01"
                placeholder="e.g., 0.025"
                value={inputs.trafficPerUser}
                onChange={(e) => handleInputChange('trafficPerUser', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequencyBand">Operating Frequency (GHz)</Label>
              <Input
                id="frequencyBand"
                type="number"
                step="0.1"
                placeholder="e.g., 1.9"
                value={inputs.frequencyBand}
                onChange={(e) => handleInputChange('frequencyBand', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channelBandwidth">Total Bandwidth (MHz)</Label>
              <Input
                id="channelBandwidth"
                type="number"
                placeholder="e.g., 25"
                value={inputs.channelBandwidth}
                onChange={(e) => handleInputChange('channelBandwidth', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reusePattern">Frequency Reuse Pattern (N)</Label>
              <Select value={inputs.reusePattern} onValueChange={(value) => handleInputChange('reusePattern', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reuse pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">N = 3</SelectItem>
                  <SelectItem value="4">N = 4</SelectItem>
                  <SelectItem value="7">N = 7</SelectItem>
                  <SelectItem value="12">N = 12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectorization">Sectors per Cell</Label>
              <Select value={inputs.sectorization} onValueChange={(value) => handleInputChange('sectorization', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sectorization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (Omnidirectional)</SelectItem>
                  <SelectItem value="3">3 Sectors</SelectItem>
                  <SelectItem value="6">6 Sectors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkBudgetRange">Maximum Cell Range (km)</Label>
              <Input
                id="linkBudgetRange"
                type="number"
                step="0.1"
                placeholder="e.g., 5.0"
                value={inputs.linkBudgetRange}
                onChange={(e) => handleInputChange('linkBudgetRange', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interferenceMargin">Interference Margin (dB)</Label>
              <Input
                id="interferenceMargin"
                type="number"
                placeholder="e.g., 3"
                value={inputs.interferenceMargin}
                onChange={(e) => handleInputChange('interferenceMargin', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fadingMargin">Fading Margin (dB)</Label>
              <Input
                id="fadingMargin"
                type="number"
                placeholder="e.g., 8"
                value={inputs.fadingMargin}
                onChange={(e) => handleInputChange('fadingMargin', e.target.value)}
              />
            </div>

            <Button 
              onClick={calculateCellularDesign} 
              disabled={!isFormValid}
              className="w-full"
            >
              Design Cellular Network
            </Button>
          </CardContent>
        </Card>

        {/* Cellular Network Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>Cellular Network Architecture</CardTitle>
            <CardDescription>
              Typical cellular network topology and components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src={cellularDiagram} 
              alt="Cellular Network Diagram"
              className="w-full h-auto rounded-lg border mb-4"
            />
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Key Components:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Base Stations (Cell Sites)</li>
                <li>Mobile Switching Center (MSC)</li>
                <li>Base Station Controller (BSC)</li>
                <li>Home Location Register (HLR)</li>
                <li>Visitor Location Register (VLR)</li>
              </ul>
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
              <span>Cellular Design Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Number of Cells</h3>
                <p className="text-2xl font-bold text-blue-600">{results.numCells}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Cell Radius</h3>
                <p className="text-2xl font-bold text-green-600">{results.cellRadius} km</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900">Total Users</h3>
                <p className="text-2xl font-bold text-purple-600">{results.totalUsers}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-900">Total Traffic</h3>
                <p className="text-2xl font-bold text-yellow-600">{results.totalTraffic} Erlang</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-900">Channels per Cell</h3>
                <p className="text-2xl font-bold text-red-600">{results.channelsPerCell}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-semibold text-indigo-900">Capacity per Cell</h3>
                <p className="text-2xl font-bold text-indigo-600">{results.capacityPerCell} Erlang</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <h3 className="font-semibold text-pink-900">Spectral Efficiency</h3>
                <p className="text-2xl font-bold text-pink-600">{results.spectralEfficiency}%</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg">
                <h3 className="font-semibold text-teal-900">Reuse Efficiency</h3>
                <p className="text-2xl font-bold text-teal-600">{results.reuseEfficiency}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {aiExplanation && (
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

