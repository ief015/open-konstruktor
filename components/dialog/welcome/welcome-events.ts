export type WelcomeDialogAction = 'start-tutorial' | 'play-levels' | 'close';

export class WelcomeDialogActionEvent extends Event {
  static eventType = 'ok/welcome-dialog-action';
  constructor(public action: WelcomeDialogAction) {
    super(WelcomeDialogActionEvent.eventType);
  }
}

export class WelcomeDialogOpenEvent extends Event {
  static eventType = 'ok/welcome-dialog-open';
  constructor() {
    super(WelcomeDialogOpenEvent.eventType);
  }
}
