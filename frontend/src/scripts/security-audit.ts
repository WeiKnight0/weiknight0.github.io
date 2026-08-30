import { siteApi, SiteApiError } from '@/utils/site-api';
import { escapeHtml } from './html';

interface AuditEvent {
  occurredAt: string;
  eventType: string;
  actor: string;
  requestMethod: string;
  requestPath: string;
  responseStatus: number;
  clientIp: string;
}

const element = <T extends Element>(selector: string) => {
  const matched = document.querySelector<T>(selector);
  if (!matched) throw new Error(`Required security log element is missing: ${selector}`);
  return matched;
};

const events = element<HTMLElement>('#security-events');
const count = element<HTMLElement>('#security-count');
const error = element<HTMLElement>('#security-error');
const filter = element<HTMLSelectElement>('#security-event-type');
const labels: Record<string, string> = {
  LOGIN_SUCCESS: 'Login success',
  LOGIN_FAILURE: 'Login failure',
  API_MUTATION: 'Data change',
};

const formatTime = (value: string) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'medium',
}).format(new Date(value));

const render = (items: AuditEvent[]) => {
  count.textContent = `${items.length} event${items.length === 1 ? '' : 's'} shown`;
  if (!items.length) {
    events.innerHTML = '<tr><td colspan="6" class="px-5 py-12 text-center text-white/45">No matching security events.</td></tr>';
    return;
  }
  events.innerHTML = items.map((item) => `<tr class="align-top transition hover:bg-white/[0.025]">
    <td class="whitespace-nowrap px-5 py-4 text-white/65">${escapeHtml(formatTime(item.occurredAt))}</td>
    <td class="px-5 py-4 font-bold ${item.eventType === 'LOGIN_FAILURE' ? 'text-amber-200' : 'text-real-accent'}">${escapeHtml(labels[item.eventType] || item.eventType)}</td>
    <td class="px-5 py-4 text-white/75">${escapeHtml(item.actor)}</td>
    <td class="px-5 py-4 font-real-mono text-xs text-white/60"><span class="mr-2 text-real-accent">${escapeHtml(item.requestMethod)}</span>${escapeHtml(item.requestPath)}</td>
    <td class="px-5 py-4"><span class="border px-2 py-1 font-real-mono text-xs ${item.responseStatus >= 400 ? 'border-red-300/30 text-red-200' : 'status-success border-emerald-300/25 text-emerald-200'}">${item.responseStatus}</span></td>
    <td class="px-5 py-4 font-real-mono text-xs text-white/50">${escapeHtml(item.clientIp)}</td>
  </tr>`).join('');
};

const load = async () => {
  error.hidden = true;
  try {
    const query = filter.value ? `?eventType=${encodeURIComponent(filter.value)}` : '';
    render(await siteApi<AuditEvent[]>(`/admin/security-events${query}`));
  } catch (reason) {
    const apiError = reason as SiteApiError;
    if (apiError.status === 403) {
      location.replace('/login/');
      return;
    }
    error.textContent = apiError.message;
    error.hidden = false;
  }
};

filter.addEventListener('change', () => { void load(); });
void load();
