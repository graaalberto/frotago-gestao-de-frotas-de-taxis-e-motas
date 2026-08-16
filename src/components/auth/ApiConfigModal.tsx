import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Trash2,
  RefreshCw,
  ExternalLink,
  Shield,
  Key,
} from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const {
    apiConfig,
    updateApiConfig,
    testServerConnection,
    apiLogs,
    clearApiLogs,
    token,
    user,
  } = useAuth();

  const [baseUrl, setBaseUrl] = useState(apiConfig.baseUrl);
  const [minioBaseUrl, setMinioBaseUrl] = useState(apiConfig.minioBaseUrl || 'http://localhost:8081');
  const [useMock, setUseMock] = useState(apiConfig.useMockSimulation);
  const [latencyMs, setLatencyMs] = useState(apiConfig.simulateLatencyMs);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; error?: string } | null>(null);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    updateApiConfig({
      baseUrl,
      minioBaseUrl,
      useMockSimulation: useMock,
      simulateLatencyMs: latencyMs,
    });
    setTestResult(null);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testServerConnection();
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, latencyMs: 0, error: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Configuração de APIs Golang & MinIO
                </h2>
                <a
                  href="https://github.com/graaalberto/graaa-golang-auth-api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-md"
                >
                  <span>graaalberto/golang-auth-api</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://github.com/graaalberto/graaa-golang-minio-api-file"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md"
                >
                  <span>graaalberto/golang-minio-api-file</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Gerencie endpoints de autenticação JWT, armazenamento de fotos/mídias com MinIO e teste de latência HTTP.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode selection */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Modo de Execução das APIs
                </label>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    useMock
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                  }`}
                >
                  {useMock ? 'SIMULAÇÃO LOCAL' : 'SERVIDORES REAIS HTTP'}
                </span>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="apiMode"
                    checked={useMock}
                    onChange={() => setUseMock(true)}
                    className="text-amber-500 focus:ring-amber-400"
                  />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Modo Demonstração Integrado (Simulador Golang)
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 pl-5">
                  Simula respostas da golang-auth-api e uploads MinIO em memória com persistência local.
                </p>

                <label className="flex items-center gap-2 cursor-pointer text-sm pt-2">
                  <input
                    type="radio"
                    name="apiMode"
                    checked={!useMock}
                    onChange={() => setUseMock(false)}
                    className="text-amber-500 focus:ring-amber-400"
                  />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Servidores Golang & MinIO Locais / Cloud
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 pl-5">
                  Conexão HTTP direta com as APIs Golang e MinIO via fetch CORS.
                </p>
              </div>
            </div>

            {/* URL and Ping */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  1. URL Base Golang Auth API
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={e => setBaseUrl(e.target.value)}
                    placeholder="http://localhost:8080"
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting}
                    className="px-3.5 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>Ping</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  2. URL Base Golang MinIO File API
                </label>
                <input
                  type="text"
                  value={minioBaseUrl}
                  onChange={e => setMinioBaseUrl(e.target.value)}
                  placeholder="http://localhost:8081"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              {testResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>
                        Servidor Auth conectado com sucesso! Latência:{' '}
                        <strong>{testResult.latencyMs}ms</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{testResult.error || 'Falha de conexão com a API.'}</span>
                    </>
                  )}
                </div>
              )}

              {/* Simulated Latency Slider */}
              {useMock && (
                <div className="pt-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Latência de rede simulada:</span>
                    <span className="font-mono font-semibold">{latencyMs}ms</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1500"
                    step="50"
                    value={latencyMs}
                    onChange={e => setLatencyMs(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs shadow-md transition-colors"
            >
              Guardar Configuração de Rede
            </button>
          </div>

          {/* Current Auth Token Payload */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Token JWT Armazenado em LocalStorage
                </span>
              </div>
              <span className="text-[11px] font-mono text-gray-500">
                Key: fleetgo_access_token
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-gray-900 text-gray-200 font-mono text-xs overflow-x-auto break-all select-all">
              {token || '// Nenhum token JWT ativo no momento'}
            </div>

            {user && (
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  Sessão ativa para: <strong>{user.name}</strong> ({user.email}) | Função: <strong>{user.role}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Request / Response Logger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Inspetor de Requisições HTTP ({apiLogs.length} eventos)
                </h3>
              </div>

              {apiLogs.length > 0 && (
                <button
                  onClick={clearApiLogs}
                  className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Logs</span>
                </button>
              )}
            </div>

            {apiLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                Nenhuma requisição HTTP registrada ainda. Faça login ou utilize os recursos do app para monitorar chamadas da golang-auth-api.
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-800 text-xs">
                  {apiLogs.map(log => {
                    const isSuccess = log.status >= 200 && log.status < 300;
                    return (
                      <div
                        key={log.id}
                        onClick={() => setSelectedLog(log === selectedLog ? null : log)}
                        className="p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.method === 'GET'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                                : log.method === 'POST'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : log.method === 'PUT'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                            }`}
                          >
                            {log.method}
                          </span>
                          <span className="text-gray-900 dark:text-gray-100 font-semibold truncate max-w-xs md:max-w-md">
                            {log.endpoint}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              isSuccess
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                                : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50'
                            }`}
                          >
                            {log.status}
                          </span>
                          <span className="text-gray-400">{log.durationMs}ms</span>
                          <span className="text-gray-400 text-[10px] hidden sm:inline">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Log Drawer Inspector */}
            {selectedLog && (
              <div className="p-4 rounded-xl bg-gray-950 text-gray-200 border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-2">
                  <span>Detalhes da Requisição ({selectedLog.endpoint})</span>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {selectedLog.requestBody && (
                  <div>
                    <span className="text-amber-400 block mb-1 text-[11px] font-bold">Request Payload:</span>
                    <pre className="p-2 rounded bg-gray-900 text-[11px] overflow-x-auto text-emerald-300">
                      {JSON.stringify(selectedLog.requestBody, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <span className="text-amber-400 block mb-1 text-[11px] font-bold">Response Body:</span>
                  <pre className="p-2 rounded bg-gray-900 text-[11px] overflow-x-auto text-sky-300">
                    {JSON.stringify(selectedLog.responseBody || selectedLog.error, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
