import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Radio, Signal, Zap, Smartphone, Brain, Calculator } from 'lucide-react'

export function HomePage() {
  const scenarios = [
    {
      id: 'wireless-comm',
      title: 'Wireless Communication System',
      description: 'Compute rates at different processing blocks including sampler, quantizer, source encoder, channel encoder, interleaver, and burst formatting.',
      icon: Signal,
      path: '/wireless-comm',
      color: 'bg-blue-500'
    },
    {
      id: 'ofdm',
      title: 'OFDM Systems',
      description: 'Calculate data rates for resource elements, OFDM symbols, resource blocks, maximum transmission capacity, and spectral efficiency.',
      icon: Zap,
      path: '/ofdm',
      color: 'bg-green-500'
    },
    {
      id: 'link-budget',
      title: 'Link Budget Calculation',
      description: 'Compute transmitted power and received signal strength in flat environments based on transmitter and receiver specifications.',
      icon: Calculator,
      path: '/link-budget',
      color: 'bg-purple-500'
    },
    {
      id: 'cellular',
      title: 'Cellular System Design',
      description: 'Design cellular networks based on user-specified parameters including coverage, capacity, and frequency planning.',
      icon: Smartphone,
      path: '/cellular',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-600 rounded-full">
            <Radio className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          AI-Powered Wireless Network Design
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced web application for wireless and mobile network design with AI-powered 
          explanations and detailed computations for four key scenarios.
        </p>
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <Brain className="h-5 w-5" />
          <span className="font-medium">Powered by Large Language Model AI</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon
          return (
            <Card key={scenario.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${scenario.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{scenario.title}</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  {scenario.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={scenario.path}>
                  <Button className="w-full">
                    Start Calculation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Key Features */}
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">Real-time Calculations</h3>
            <p className="text-gray-600 text-sm">
              Instant computation of network parameters with detailed step-by-step results
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold">AI Explanations</h3>
            <p className="text-gray-600 text-sm">
              Natural language explanations of methodology and results using LLM
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto">
              <Signal className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Input Validation</h3>
            <p className="text-gray-600 text-sm">
              Comprehensive validation of user inputs with helpful error messages
            </p>
          </div>
        </div>
      </div>

      {/* Course Information */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Wireless and Mobile Networks (ENCS5323)
        </h3>
        <p className="text-gray-600">
          Faculty of Engineering and Technology • Department of Electrical and Computer Engineering
        </p>
        <p className="text-gray-600">
          Dr. Mohammad K. Jubran
        </p>
      </div>
    </div>
  )
}

