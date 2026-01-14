import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

export interface GeminiConfig {
  apiKey: string
  model?: string
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI
  private model: GenerativeModel

  constructor(config: GeminiConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey)
    this.model = this.genAI.getGenerativeModel({
      model: config.model || 'gemini-1.5-flash',
    })
  }

  async generateText(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt)
    const response = await result.response
    return response.text()
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    const jsonPrompt = `${prompt}

응답은 반드시 유효한 JSON 형식으로만 제공해주세요. 다른 텍스트 없이 JSON만 반환하세요.`

    const result = await this.model.generateContent(jsonPrompt)
    const response = await result.response
    const text = response.text()

    // JSON 블록 추출
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ||
                      text.match(/```\n?([\s\S]*?)\n?```/) ||
                      [null, text]

    const jsonText = jsonMatch[1] || text

    try {
      return JSON.parse(jsonText.trim()) as T
    } catch (error) {
      console.error('Failed to parse JSON:', jsonText)
      throw new Error('AI 응답을 파싱할 수 없습니다.')
    }
  }

  async chat(messages: Array<{ role: 'user' | 'model'; content: string }>): Promise<string> {
    const chat = this.model.startChat({
      history: messages.slice(0, -1).map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response
    return response.text()
  }
}
