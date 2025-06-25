from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
from flask_cors import cross_origin
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

ai_bp = Blueprint('ai', __name__)
# Configure Google AI Studio
genai.configure(api_key=os.getenv('GOOGLE_AI_API_KEY'))


api_key=os.getenv('GOOGLE_AI_API_KEY')
if not api_key:
    raise ValueError(
        "Google API key not found. "
        "Please set GOOGLE_API_KEY in your .env file"
    )

def generate_wireless_comm_explanation(inputs, results):
    """Generate explanation for wireless communication system calculations"""
    prompt = f"""
You are an expert in wireless communication systems. Provide a detailed, educational explanation for the following wireless communication system calculation:

**Input Parameters:**
- Source Data Rate: {inputs.get('sourceDataRate', 'N/A')} bps
- Sampling Rate: {inputs.get('samplingRate', 'N/A')} Hz
- Quantization Bits: {inputs.get('quantizationBits', 'N/A')}
- Source Compression Ratio: {inputs.get('sourceCompressionRatio', 'N/A')}
- Channel Code Rate: {inputs.get('channelCodeRate', 'N/A')}
- Interleaving Factor: {inputs.get('interleavingFactor', 'N/A')}
- Burst Overhead: {inputs.get('burstOverhead', 'N/A')}%

**Calculated Results:**
- Sampler Output: {results.get('samplerOutput', 'N/A')} bps
- Quantizer Output: {results.get('quantizerOutput', 'N/A')} bps
- Source Encoder Output: {results.get('sourceEncoderOutput', 'N/A')} bps
- Channel Encoder Output: {results.get('channelEncoderOutput', 'N/A')} bps
- Interleaver Output: {results.get('interleaverOutput', 'N/A')} bps
- Burst Formatter Output: {results.get('burstFormatterOutput', 'N/A')} bps

Please explain:
1. The purpose and function of each processing block in the wireless communication system
2. How each calculation is performed step-by-step with the given parameters
3. The significance of each result in the context of wireless communication
4. Any important considerations or trade-offs in the system design

Format your response in a clear, educational manner suitable for engineering students.
"""
    return prompt

def generate_ofdm_explanation(inputs, results):
    """Generate explanation for OFDM system calculations"""
    prompt = f"""
You are an expert in OFDM (Orthogonal Frequency Division Multiplexing) systems. Provide a detailed, educational explanation for the following OFDM system calculation:

**Input Parameters:**
- Subcarrier Spacing: {inputs.get('subcarrierSpacing', 'N/A')} kHz
- Symbol Duration: {inputs.get('symbolDuration', 'N/A')} μs
- Cyclic Prefix Length: {inputs.get('cyclicPrefixLength', 'N/A')} μs
- Modulation Scheme: {inputs.get('modulationScheme', 'N/A')}
- Number of Subcarriers: {inputs.get('numSubcarriers', 'N/A')}
- Number of Resource Blocks: {inputs.get('numResourceBlocks', 'N/A')}
- Subcarriers per Resource Block: {inputs.get('subcarriersPerRB', 'N/A')}
- Parallel Resource Blocks: {inputs.get('parallelRBs', 'N/A')}

**Calculated Results:**
- Resource Element Rate: {results.get('resourceElementRate', 'N/A')} kbps
- OFDM Symbol Rate: {results.get('ofdmSymbolRate', 'N/A')} Mbps
- Resource Block Rate: {results.get('resourceBlockRate', 'N/A')} kbps
- Maximum Transmission Capacity: {results.get('maxTransmissionCapacity', 'N/A')} Mbps
- Spectral Efficiency: {results.get('spectralEfficiency', 'N/A')} bps/Hz

Please explain:
1. The fundamental concepts of OFDM and its advantages
2. The role of resource elements, symbols, and resource blocks
3. How each calculation is performed with mathematical formulas
4. The impact of cyclic prefix and modulation scheme on performance
5. The significance of spectral efficiency in OFDM systems

Format your response in a clear, educational manner suitable for engineering students.
"""
    return prompt

def generate_link_budget_explanation(inputs, results):
    """Generate explanation for link budget calculations"""
    prompt = f"""
You are an expert in wireless link budget analysis. Provide a detailed, educational explanation for the following link budget calculation:

**Input Parameters:**
- Transmitter Power: {inputs.get('transmitterPower', 'N/A')} dBm
- Transmitter Antenna Gain: {inputs.get('transmitterGain', 'N/A')} dBi
- Receiver Antenna Gain: {inputs.get('receiverGain', 'N/A')} dBi
- Operating Frequency: {inputs.get('frequency', 'N/A')} GHz
- Distance: {inputs.get('distance', 'N/A')} km
- Path Loss Model: {inputs.get('pathLossModel', 'N/A')}
- Additional Losses: {inputs.get('additionalLosses', 'N/A')} dB
- Noise Floor: {inputs.get('noiseFloor', 'N/A')} dBm
- Required SNR: {inputs.get('requiredSNR', 'N/A')} dB

**Calculated Results:**
- Transmitted Power: {results.get('transmittedPowerDbm', 'N/A')} dBm
- Path Loss: {results.get('pathLossDb', 'N/A')} dB
- Received Power: {results.get('receivedPowerDbm', 'N/A')} dBm
- Link Margin: {results.get('linkMarginDb', 'N/A')} dB
- Link Status: {results.get('linkStatus', 'N/A')}

Please explain:
1. The fundamental principles of link budget analysis
2. How path loss is calculated using the specified model
3. The step-by-step calculation of received power
4. The importance of link margin and its interpretation
5. Factors affecting link performance and design recommendations

Format your response in a clear, educational manner suitable for engineering students.
"""
    return prompt

def generate_cellular_explanation(inputs, results):
    """Generate explanation for cellular system design calculations"""
    prompt = f"""
You are an expert in cellular network design. Provide a detailed, educational explanation for the following cellular system design calculation:

**Input Parameters:**
- Coverage Area: {inputs.get('coverageArea', 'N/A')} km²
- User Density: {inputs.get('userDensity', 'N/A')} users/km²
- Traffic per User: {inputs.get('trafficPerUser', 'N/A')} Erlang
- Operating Frequency: {inputs.get('frequencyBand', 'N/A')} GHz
- Total Bandwidth: {inputs.get('channelBandwidth', 'N/A')} MHz
- Frequency Reuse Pattern: {inputs.get('reusePattern', 'N/A')}
- Sectorization: {inputs.get('sectorization', 'N/A')} sectors per cell
- Maximum Cell Range: {inputs.get('linkBudgetRange', 'N/A')} km
- Interference Margin: {inputs.get('interferenceMargin', 'N/A')} dB
- Fading Margin: {inputs.get('fadingMargin', 'N/A')} dB

**Calculated Results:**
- Number of Cells: {results.get('numCells', 'N/A')}
- Cell Radius: {results.get('cellRadius', 'N/A')} km
- Total Users: {results.get('totalUsers', 'N/A')}
- Total Traffic: {results.get('totalTraffic', 'N/A')} Erlang
- Channels per Cell: {results.get('channelsPerCell', 'N/A')}
- Capacity per Cell: {results.get('capacityPerCell', 'N/A')} Erlang
- Spectral Efficiency: {results.get('spectralEfficiency', 'N/A')}%
- Reuse Efficiency: {results.get('reuseEfficiency', 'N/A')}%

Please explain:
1. The principles of cellular network design and frequency reuse
2. Coverage vs. capacity analysis and which factor is limiting
3. The role of sectorization in improving system performance
4. How Erlang traffic theory applies to cellular systems
5. The trade-offs between cell size, capacity, and interference

Format your response in a clear, educational manner suitable for engineering students.
"""
    return prompt

@ai_bp.route('/explain', methods=['POST'])
@cross_origin()
def generate_explanation():
    """Generate AI explanation for wireless network calculations"""
    try:
        data = request.get_json()
        scenario = data.get('scenario')
        inputs = data.get('inputs', {})
        results = data.get('results', {})
        
        # Generate appropriate prompt based on scenario
        if scenario == 'wireless_comm':
            prompt = generate_wireless_comm_explanation(inputs, results)
        elif scenario == 'ofdm':
            prompt = generate_ofdm_explanation(inputs, results)
        elif scenario == 'link_budget':
            prompt = generate_link_budget_explanation(inputs, results)
        elif scenario == 'cellular_design':
            prompt = generate_cellular_explanation(inputs, results)
        else:
            return jsonify({'error': 'Invalid scenario'}), 400
        
        # Generate explanation using Google AI Studio
        try:
            model = genai.GenerativeModel("models/gemini-1.5-flash")
            print("Generating explanation with Google AI Studio...")
            response = model.generate_content(prompt)
            print("Prompt being sent to Gemini model:\n", response.text)

            explanation = response.text
        except Exception as e:
            # Fallback explanation if AI service is unavailable
            explanation = f"""
AI Explanation Service Temporarily Unavailable {e}

The calculation has been completed successfully with the provided parameters. 
Here's a basic summary of the results:

Scenario: {scenario.replace('_', ' ').title()}
Input Parameters: {len(inputs)} parameters provided
Calculated Results: {len(results)} results generated

For detailed explanations of the methodology and significance of these calculations, 
please refer to your course materials or contact your instructor.

Note: To enable AI-powered explanations, please configure the Google AI Studio API key 
in the environment variables (GOOGLE_AI_API_KEY).
"""
        
        return jsonify({'explanation': explanation})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

