import axios from 'axios'
import { ERROR_MESSAGES, REPORT_MESSAGES } from '../constants/messages'

export type ReportFailure =
  | { outcome: 'already'; message: string }
  | { outcome: 'gone'; message: string }
  | { outcome: 'own'; message: string }
  | { outcome: 'session'; message: null }
  | { outcome: 'retry'; message: string }

export function retryWaitText(seconds: number): string | null {
  if (!Number.isFinite(seconds) || seconds <= 0) return null
  if (seconds < 60) return 'em instantes'
  const minutes = Math.ceil(seconds / 60)
  return `em ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
}

export function classifyReportError(error: unknown): ReportFailure {
  if (!axios.isAxiosError(error) || !error.response) {
    return { outcome: 'retry', message: ERROR_MESSAGES.reportReview }
  }

  const { status, headers } = error.response
  if (status === 409) {
    return { outcome: 'already', message: REPORT_MESSAGES.alreadyReported }
  }
  if (status === 404) {
    return { outcome: 'gone', message: REPORT_MESSAGES.unavailable }
  }
  if (status === 403) {
    return { outcome: 'own', message: REPORT_MESSAGES.ownReview }
  }
  if (status === 401) {
    return { outcome: 'session', message: null }
  }
  if (status === 429) {
    const wait = retryWaitText(Number(headers?.['retry-after']))
    return {
      outcome: 'retry',
      message: wait
        ? REPORT_MESSAGES.tooManyReports(wait)
        : REPORT_MESSAGES.tooManyReportsNoWait,
    }
  }
  return { outcome: 'retry', message: ERROR_MESSAGES.reportReview }
}
