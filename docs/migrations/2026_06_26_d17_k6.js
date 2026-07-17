// d17_k6.js — k6 5000 VUs ramp-up + 1000 VUs sustained
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    health_blast: {
      executor: 'ramping-vus',
      startVUs: 50,
      stages: [
        { duration: '20s', target: 500 },
        { duration: '20s', target: 1500 },
        { duration: '20s', target: 3000 },
        { duration: '15s', target: 5000 },
        { duration: '20s', target: 1000 },
        { duration: '10s', target: 0 },
      ],
      exec: 'healthScenario',
      tags: { scenario: 'health' },
    },
    ebooks_listing: {
      executor: 'constant-vus',
      vus: 200,
      duration: '90s',
      exec: 'ebooksScenario',
      tags: { scenario: 'ebooks' },
    },
    dashboard_browse: {
      executor: 'constant-vus',
      vus: 300,
      duration: '90s',
      exec: 'dashboardScenario',
      tags: { scenario: 'dashboard' },
    },
  },
  thresholds: {
    'http_req_failed': ['rate<0.02'],            // < 2% falhas
    'http_req_duration{scenario:health}':    ['p(95)<500'],
    'http_req_duration{scenario:ebooks}':    ['p(95)<2000'],
    'http_req_duration{scenario:dashboard}': ['p(95)<800'],
  },
};

const BASE = __ENV.BASE || 'https://oneverso.com.br';

export function healthScenario() {
  const r = http.get(`${BASE}/api/health`, { tags: { scenario: 'health' } });
  check(r, { 'health 200': (res) => res.status === 200 });
  sleep(Math.random() * 0.3);
}

export function ebooksScenario() {
  const r = http.get(`${BASE}/api/trpc/marketplaceNexus.listEbooks`, { tags: { scenario: 'ebooks' } });
  check(r, { 'ebooks 200': (res) => res.status === 200, 'has body': (res) => res.body && res.body.length > 1000 });
  sleep(Math.random() * 0.5);
}

export function dashboardScenario() {
  const r = http.get(`${BASE}/dashboard`, { tags: { scenario: 'dashboard' } });
  check(r, { 'dashboard 200': (res) => res.status === 200 });
  sleep(Math.random() * 0.4);
}
