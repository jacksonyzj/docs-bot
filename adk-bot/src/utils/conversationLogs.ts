import { context, user } from '@botpress/runtime'
import { ConversationLogsTable, type ConversationOutcome, type Topic } from '../tables/ConversationLogsTable'
import { classifyTopic } from './topicClassifier'

export async function logConversationTurn({
  question,
  answer,
  outcome,
  topic,
  wasAnswered,
}: {
  question: string
  answer: string
  outcome?: ConversationOutcome
  topic?: Topic
  wasAnswered?: boolean
}) {
  const trimmedQuestion = question.trim()
  if (!trimmedQuestion) return

  const conversation = context.get('conversation', { optional: true })
  const resolvedTopic = topic ?? classifyTopic(trimmedQuestion, answer)
  const resolvedOutcome: ConversationOutcome = outcome ?? (wasAnswered ? 'answered' : 'unanswered')

  await ConversationLogsTable.createRows({
    rows: [
      {
        question: trimmedQuestion,
        answer,
        topic: resolvedTopic,
        userId: user.id,
        conversationId: conversation?.id ?? 'unknown',
        outcome: resolvedOutcome,
        wasAnswered: resolvedOutcome === 'answered',
      },
    ],
  })
}
