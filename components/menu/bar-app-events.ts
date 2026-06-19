export class MenuBarActionEvent extends Event {
  static readonly eventType = 'ok/menu-bar-action';
  constructor(public id?: string) {
    super(MenuBarActionEvent.eventType);
  }
}

export type MenuBarListener = (event: MenuBarActionEvent) => void;

export function useMenuBarListener(listener: MenuBarListener) {
  return useEventListener(document, MenuBarActionEvent.eventType, listener);
}
