
export enum MessageSender {
  USER,
  BOT,
}

export interface ChatMessage {
  sender: MessageSender;
  text: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  content: string;
  type: 'faq' | 'pdf';
}
