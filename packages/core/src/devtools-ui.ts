/**
 * Vira DevTools UI - Встроенная панель отладки
 * 
 * Табы:
 * - Signals (values)
 * - Components (diff)
 * - Graph (dependencies)
 * - Timeline (events)
 * - Perf (fps / updates)
 */

import { devTools, DevToolsEvent, StateGraphNode } from "./devtools-integration";

/**
 * Создание DevTools UI панели
 */
export function createDevToolsUI() {
  const iframe = document.createElement("iframe");
  iframe.id = "vira-devtools";
  iframe.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    border: none;
    background: white;
    z-index: 999999;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  `;

  // Создаём HTML содержимое для iframe
  const html = generateDevToolsHTML();

  iframe.srcdoc = html;
  document.body.appendChild(iframe);

  // Связываем с window.__VIRA_DEVTOOLS__
  (window as any).__VIRA_DEVTOOLS_PORT__ = {
    getGraph: () => devTools.getGraph(),
    getEvents: () => devTools.getEvents(),
    clear: () => devTools.clear(),
  };

  return iframe;
}

/**
 * Генерация HTML для DevTools
 */
function generateDevToolsHTML(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Vira DevTools</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      background: #f5f5f5;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      background: #2d2d2d;
      color: white;
      padding: 8px 12px;
      font-weight: 600;
      border-bottom: 1px solid #444;
    }
    
    .tabs {
      display: flex;
      background: #2d2d2d;
      border-bottom: 1px solid #444;
    }
    
    .tab {
      padding: 8px 16px;
      cursor: pointer;
      color: #aaa;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    
    .tab:hover {
      color: white;
      background: #3d3d3d;
    }
    
    .tab.active {
      color: #4fc3f7;
      border-bottom-color: #4fc3f7;
    }
    
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }
    
    .signal-item {
      background: white;
      padding: 8px;
      margin-bottom: 8px;
      border-radius: 4px;
      border-left: 3px solid #4fc3f7;
    }
    
    .signal-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }
    
    .signal-value {
      color: #666;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      word-break: break-all;
    }
    
    .graph-node {
      background: white;
      padding: 8px;
      margin-bottom: 8px;
      border-radius: 4px;
      border-left: 3px solid #66bb6a;
    }
    
    .graph-deps {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #eee;
      font-size: 11px;
      color: #999;
    }
    
    .event-item {
      background: white;
      padding: 8px;
      margin-bottom: 8px;
      border-radius: 4px;
      border-left: 3px solid #ffa726;
      font-size: 11px;
    }
    
    .event-time {
      color: #999;
      font-size: 10px;
    }
    
    .perf-metric {
      background: white;
      padding: 8px;
      margin-bottom: 8px;
      border-radius: 4px;
    }
    
    .perf-label {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .perf-value {
      font-size: 18px;
      color: #4fc3f7;
    }
  </style>
</head>
<body>
  <div class="header">Vira DevTools</div>
  <div class="tabs">
    <div class="tab active" data-tab="signals">Signals</div>
    <div class="tab" data-tab="graph">Graph</div>
    <div class="tab" data-tab="timeline">Timeline</div>
    <div class="tab" data-tab="perf">Perf</div>
  </div>
  <div class="content" id="content">
    <div id="signals-tab">
      <div id="signals-list"></div>
    </div>
    <div id="graph-tab" style="display: none;">
      <div id="graph-list"></div>
    </div>
    <div id="timeline-tab" style="display: none;">
      <div id="timeline-list"></div>
    </div>
    <div id="perf-tab" style="display: none;">
      <div id="perf-list"></div>
    </div>
  </div>
  
  <script>
    const port = window.__VIRA_DEVTOOLS_DATA__ || (window.parent && window.parent.__VIRA_DEVTOOLS_PORT__);
    
    let activeTab = 'signals';
    let updateInterval = null;
    
    function updateSignals() {
      if (!port) return;
      
      const graph = port.getGraph();
      const signals = graph.filter(node => node.type === 'signal');
      
      const container = document.getElementById('signals-list');
      container.innerHTML = signals.map(signal => \`
        <div class="signal-item">
          <div class="signal-name">\${signal.name}</div>
          <div class="signal-value">\${JSON.stringify(signal.value, null, 2)}</div>
        </div>
      \`).join('');
    }
    
    function updateGraph() {
      if (!port) return;
      
      const graph = port.getGraph();
      
      const container = document.getElementById('graph-list');
      container.innerHTML = graph.map(node => \`
        <div class="graph-node">
          <div class="signal-name">\${node.name} (\${node.type})</div>
          <div class="signal-value">\${JSON.stringify(node.value, null, 2)}</div>
          \${node.dependencies.length > 0 ? \`
            <div class="graph-deps">
              Dependencies: \${node.dependencies.join(', ')}
            </div>
          \` : ''}
        </div>
      \`).join('');
    }
    
    function updateTimeline() {
      if (!port) return;
      
      const events = port.getEvents();
      const recentEvents = events.slice(-50).reverse();
      
      const container = document.getElementById('timeline-list');
      container.innerHTML = recentEvents.map(event => \`
        <div class="event-item">
          <div class="signal-name">\${event.type}: \${event.name}</div>
          <div class="signal-value">\${JSON.stringify(event.value, null, 2)}</div>
          <div class="event-time">\${new Date(event.timestamp).toLocaleTimeString()}</div>
        </div>
      \`).join('');
    }
    
    function updatePerf() {
      // Простая метрика FPS
      let lastTime = performance.now();
      let frames = 0;
      let fps = 0;
      
      function measure() {
        frames++;
        const now = performance.now();
        
        if (now >= lastTime + 1000) {
          fps = frames;
          frames = 0;
          lastTime = now;
        }
        
        const container = document.getElementById('perf-list');
        container.innerHTML = \`
          <div class="perf-metric">
            <div class="perf-label">FPS</div>
            <div class="perf-value">\${fps}</div>
          </div>
        \`;
        
        requestAnimationFrame(measure);
      }
      
      measure();
    }
    
    function showTab(tabName) {
      activeTab = tabName;
      
      // Обновляем активную вкладку
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelector(\`[data-tab="\${tabName}"]\`).classList.add('active');
      
      // Показываем контент
      document.querySelectorAll('[id$="-tab"]').forEach(content => {
        content.style.display = 'none';
      });
      document.getElementById(\`\${tabName}-tab\`).style.display = 'block';
      
      // Обновляем данные
      if (tabName === 'signals') updateSignals();
      else if (tabName === 'graph') updateGraph();
      else if (tabName === 'timeline') updateTimeline();
      else if (tabName === 'perf') updatePerf();
    }
    
    // Обработчики вкладок
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        showTab(tab.dataset.tab);
      });
    });
    
    // Автообновление
    updateInterval = setInterval(() => {
      if (activeTab === 'signals') updateSignals();
      else if (activeTab === 'graph') updateGraph();
      else if (activeTab === 'timeline') updateTimeline();
    }, 1000);
    
    // Инициализация
    updateSignals();
  </script>
</body>
</html>
  `;
}

/**
 * Показать DevTools UI
 */
export function showDevTools() {
  const existing = document.getElementById("vira-devtools");
  if (existing) {
    existing.remove();
    return;
  }

  createDevToolsUI();
}

/**
 * Автоматическое открытие DevTools в development режиме
 */
if (typeof window !== "undefined") {
  // Открывается по Ctrl+Shift+D
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      e.preventDefault();
      showDevTools();
    }
  });
}

