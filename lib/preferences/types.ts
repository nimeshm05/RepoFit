export type PreferenceProfile = {
  skills?: string[];
  interests?: string[];
  experience?: string;
  goal?: string;
  contributionStyle?: string;
  difficultyPreference?: string;
  timeCommitment?: string;
  careerDirection?: string;
};

export type ElicitationTurn = {
  question: string;
  answer: string;
};

export type ElicitationSession = {
  status: "in_progress" | "complete";
  turns: ElicitationTurn[];
  pendingQuestion: string | null;
  profile?: PreferenceProfile;
  /** Changes on restart so question UI state remounts fresh */
  flowKey: string;
};

export type ElicitationRequest = {
  turns: ElicitationTurn[];
};

export type ElicitationContinueResponse = {
  status: "continue";
  question: string;
};

export type ElicitationCompleteResponse = {
  status: "complete";
  profile: PreferenceProfile;
};

export type ElicitationResponse =
  | ElicitationContinueResponse
  | ElicitationCompleteResponse;
