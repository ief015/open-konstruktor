export type WelcomeDialogAction = 'start-tutorial' | 'play-levels' | 'close';

export class WelcomeDialogActionEvent extends Event {
  static readonly eventType = 'ok/welcome-dialog-action';
  constructor(public action: WelcomeDialogAction) {
    super(WelcomeDialogActionEvent.eventType);
  }
}

export type WelcomeDialogListener = (event: WelcomeDialogActionEvent) => void;

export function useWelcomeDialogListener(listener: WelcomeDialogListener) {
  return useEventListener(
    document,
    WelcomeDialogActionEvent.eventType,
    listener,
  );
}
