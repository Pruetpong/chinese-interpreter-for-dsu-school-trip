
export interface Interpreter {
  name: string;
  specialty: string;
  experience: string;
  focus_areas: string;
  communication_style: string;
  specialty_knowledge: string[];
  common_phrases: string[];
}

export type InterpreterID = keyof typeof import('./constants').INTERPRETERS;

export interface Scenario {
  name: string;
  description: string;
  context: string;
}

export type ScenarioID = keyof typeof import('./constants').SCENARIOS;

export interface UserMode {
  name: string;
  description: string;
  context: string;
}

export type UserModeID = keyof typeof import('./constants').USER_MODES;

export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
}

export enum ChatTab {
  SETUP = 'setup',
  MAIN = 'main',
  CHINESE_INPUT = 'chinese_input',
  CONSULTATION = 'consultation',
}

export interface AppSettings {
  interpreterId: InterpreterID;
  scenarioId: ScenarioID;
  userModeId: UserModeID;
}

export interface Conversation {
  settings: AppSettings;
  messages: Record<Exclude<ChatTab, ChatTab.SETUP>, Message[]>;
  messageCount: number;
}