export class MenuBarActionEvent extends Event {
  static eventType = 'ok/menu-bar-action';
  constructor(public id?: string) {
    super(MenuBarActionEvent.eventType);
  }
}
