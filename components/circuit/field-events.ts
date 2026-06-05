export class ResetViewEvent extends Event {
  static eventType = 'ok/reset-view';
  constructor() {
    super(ResetViewEvent.eventType);
  }
}
