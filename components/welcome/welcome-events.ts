export type WelcomeAction = 'start-tutorial' | 'play-levels';

export class WelcomeActionEvent extends Event {
  static readonly eventType = 'ok/welcome-action';
  constructor(public action: WelcomeAction) {
    super(WelcomeActionEvent.eventType);
  }
}

export type WelcomeActionListener = (event: WelcomeActionEvent) => void;

export function useWelcomeActionListener(listener: WelcomeActionListener) {
  return useEventListener(document, WelcomeActionEvent.eventType, listener);
}
