import type { ProbeInfo } from '@/simulation';

export type FieldProbeAction = 'renamed' | 'added' | 'removed';

export class FieldProbeActionEvent extends Event {
  static readonly eventType = 'ok/field-probe-event';
  constructor(
    public action: FieldProbeAction,
    public probes: ProbeInfo[],
  ) {
    super(FieldProbeActionEvent.eventType);
  }
}

export function dispatchFieldProbeAction(
  action: FieldProbeAction,
  probes: ProbeInfo[],
) {
  const event = new FieldProbeActionEvent(action, probes);
  document.dispatchEvent(event);
}

export type FieldProbeActionListener = (event: FieldProbeActionEvent) => void;

export function useFieldProbeActionListener(
  listener: FieldProbeActionListener,
) {
  return useEventListener(document, FieldProbeActionEvent.eventType, listener);
}
