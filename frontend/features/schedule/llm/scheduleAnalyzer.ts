import type { ScheduleAnalyzerInput, ScheduleInfo } from "./types"
import { openai } from "@/lib/openai"
import { datetimePrompt, schedulePrompt } from "./prompts"
import { parseDateTimeResponse, parseScheduleResponse } from "./utils/parser"

class ScheduleAnalyzer {
  async analyze(input: ScheduleAnalyzerInput): Promise<ScheduleInfo> {
    const { text, contextDate = new Date() } = input

    // 日時情報の抽出
    const dateTimeInfo = await this.extractDateTime(text, contextDate)

    // スケジュール情報の抽出
    const prompt = schedulePrompt
      .replace("{{text}}", text)
      .replace("{{contextDate}}", contextDate.toISOString())

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const response = JSON.parse(completion.choices[0].message.content!)
    const scheduleInfo = parseScheduleResponse(response)

    // 日時情報を上書き
    return {
      ...scheduleInfo,
      startDate: dateTimeInfo.startDate,
      endDate: dateTimeInfo.endDate,
      isAllDay: dateTimeInfo.isAllDay,
    }
  }

  private async extractDateTime(text: string, contextDate: Date) {
    const prompt = datetimePrompt
      .replace("{{text}}", text)
      .replace("{{contextDate}}", contextDate.toISOString())

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const response = JSON.parse(completion.choices[0].message.content!)
    return parseDateTimeResponse(response)
  }
}

export const scheduleAnalyzer = new ScheduleAnalyzer()
