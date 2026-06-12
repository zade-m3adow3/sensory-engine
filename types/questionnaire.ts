export interface QuestionData {
  id: string;
  prompt: string;
  type: "TextInput" | "Slider" | "MultiChoice" | "MultiSelect";
  options?: string[];
  isLong?: boolean;
}
