export class OpenMenuEvent extends Event {
  static eventType = 'ok/open-menu';
  constructor(public id?: string) {
    super(OpenMenuEvent.eventType);
  }
}
