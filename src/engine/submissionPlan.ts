export type ActionJsFill = {
  type: 'jsFill';
  name: string;
  value: string;
};
export type ActionJsSelect = {
  type: 'jsSelect';
  name: string;
  text: string;
};
export type ActionJsCheck = {
  type: 'jsCheck';
  name: string;
  checked: boolean;
};
export type ActionUpload = {
  type: 'upload';
  locator: string;
  path: string;
};
export type ActionClick = {
  type: 'click';
  locator: string;
};
export type ActionWaitForFunction = {
  type: 'waitForFunction';
  expression: string;
  timeout?: number;
};
export type ActionWait = {
  type: 'wait';
  ms: number;
};
export type SubmissionAction =
  | ActionJsFill
  | ActionJsSelect
  | ActionJsCheck
  | ActionUpload
  | ActionClick
  | ActionWaitForFunction
  | ActionWait;
export interface SubmissionPlan {
  siteId: string;
  siteUrl: string;
  waitForReady: ActionWaitForFunction;
  actions: SubmissionAction[];
  submitAction: ActionClick;
  declareAction?: ActionJsCheck;
}
