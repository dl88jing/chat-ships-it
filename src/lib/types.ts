export type BuildStatus = "queued" | "approved" | "building" | "testing" | "shipped" | "failed" | "reverted";

export type BuildStep = {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "fail";
  detail?: string;
};

export type DiffLine = {
  kind: "add" | "del" | "ctx";
  text: string;
};

export type FeatureRequest = {
  id: string;
  channel: string;
  viewer: string;
  prompt: string;
  createdAt: number;
  status: BuildStatus;
  credit?: string;
  widgetId?: string;
  remixOf?: string;
  steps?: BuildStep[];
  diff?: DiffLine[];
  testPass?: boolean;
};

export type WidgetBundle = {
  id: string;
  name: string;
  credit: string;
  prompt: string;
  html: string;
  createdAt: number;
  active: boolean;
};

export type PatchNote = {
  id: string;
  at: number;
  text: string;
  viewer: string;
};

export type ChatMessage = {
  id: string;
  user: string;
  text: string;
  color: string;
  at: number;
  badges?: string[];
};

export type ChannelState = {
  channel: string;
  displayName: string;
  queue: FeatureRequest[];
  widgets: WidgetBundle[];
  patchNotes: PatchNote[];
  chat: ChatMessage[];
  buildingId: string | null;
  demoMode: boolean;
  connected: boolean;
};
