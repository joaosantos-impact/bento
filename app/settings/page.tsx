"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/form/card";
import { Select } from "@/components/form/field";
import { useToast } from "@/components/ui/toast";
import { getSettings, saveSettings, type Settings } from "@/lib/storage/settings";
import { DEFAULT_MODEL_FALLBACK, FALLBACK_MODEL_OPTIONS } from "@/lib/openrouter";

type ModelInfo = {
  id: string;
  name?: string;
  pricing?: { prompt?: string; completion?: string };
  architecture?: {
    input_modalities?: string[];
    modality?: string;
  };
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  // Fetch available models whenever a key is present.
  useEffect(() => {
    const key = settings?.openrouterKey?.trim();
    if (!key) {
      setModels([]);
      setModelsError(null);
      return;
    }
    let cancelled = false;
    async function load() {
      setModelsLoading(true);
      setModelsError(null);
      try {
        const res = await fetch("/api/openrouter/models", {
          headers: { "X-Openrouter-Key": key! },
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setModelsError(json.error ?? "Falha a obter modelos");
          setModels([]);
          return;
        }
        const list = (json.data as ModelInfo[]) ?? [];
        // Keep only multimodal models — we send images for the Vision step.
        const multimodal = list.filter((m) => {
          const inputs = m.architecture?.input_modalities ?? [];
          const modality = m.architecture?.modality ?? "";
          return inputs.includes("image") || modality.includes("image");
        });
        // Sort: anthropic/openai/google first, then alphabetic by id.
        const priority = (id: string) => {
          if (id.startsWith("anthropic/")) return 0;
          if (id.startsWith("openai/")) return 1;
          if (id.startsWith("google/")) return 2;
          return 3;
        };
        multimodal.sort((a, b) => {
          const pa = priority(a.id);
          const pb = priority(b.id);
          if (pa !== pb) return pa - pb;
          return a.id.localeCompare(b.id);
        });
        setModels(multimodal);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Erro de rede";
        setModelsError(message);
        setModels([]);
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [settings?.openrouterKey]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...(prev ?? {}), [key]: value }));
  }

  function handleSave() {
    if (!settings) return;
    saveSettings(settings);
    toast("Definições guardadas", "success");
  }

  async function handleTest() {
    if (!settings?.openrouterKey?.trim()) {
      toast("Mete a chave antes de testar.", "error");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/test", {
        method: "POST",
        headers: {
          "X-Openrouter-Key": settings.openrouterKey.trim(),
          ...(settings.openrouterModel?.trim()
            ? { "X-Openrouter-Model": settings.openrouterModel.trim() }
            : {}),
        },
      });
      const json = await res.json();
      if (!res.ok) {
        setTestResult(`Erro: ${json.error ?? "desconhecido"}`);
        toast("Teste falhou", "error");
      } else {
        setTestResult(`OK — modelo "${json.model}" respondeu.`);
        toast("Chave válida", "success");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erro desconhecido";
      setTestResult(`Erro: ${message}`);
      toast("Teste falhou", "error");
    } finally {
      setTesting(false);
    }
  }

  if (settings === null) {
    return <p className="text-sm text-zinc-500">A carregar…</p>;
  }

  const hasKey = Boolean(settings.openrouterKey?.trim());

  // Pick which list of options to show.
  const modelOptions = (() => {
    if (models.length > 0) {
      return models.map((m) => ({
        value: m.id,
        label: formatModelLabel(m),
      }));
    }
    return FALLBACK_MODEL_OPTIONS;
  })();

  // If the saved value is not in the live list, prepend it so the user keeps
  // their choice visible (and can still re-test it).
  const currentModel = settings.openrouterModel || DEFAULT_MODEL_FALLBACK;
  const isInList = modelOptions.some((o) => o.value === currentModel);
  const finalOptions = isInList
    ? modelOptions
    : [{ value: currentModel, label: `${currentModel} (não encontrado na lista)` }, ...modelOptions];

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Definições</h1>
        <p className="mt-1 text-sm text-zinc-500">
          A chave fica guardada localmente no browser (não é enviada para nenhum servidor além do
          OpenRouter quando geras texto).
        </p>
      </header>

      <Card
        title="OpenRouter"
        description="Necessário para geração automática de texto, routing de inputs e análise de fotos."
      >
        <div>
          <div className="mb-1 flex items-end justify-between gap-2">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              API Key (sk-or-…)
            </span>
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {showKey ? "Esconder" : "Mostrar"}
            </button>
          </div>
          <input
            type={showKey ? "text" : "password"}
            value={settings.openrouterKey ?? ""}
            onChange={(e) => update("openrouterKey", e.target.value)}
            placeholder="sk-or-v1-…"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <p className="mt-1 text-xs text-zinc-400">
            Cria em{" "}
            <a
              href="https://openrouter.ai/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              openrouter.ai/settings/keys
            </a>
            .
          </p>
        </div>

        <div>
          <Select
            label={
              modelsLoading
                ? "Modelo (a carregar lista live…)"
                : models.length > 0
                  ? `Modelo (${models.length} disponíveis com visão)`
                  : "Modelo"
            }
            name="openrouterModel"
            value={currentModel}
            onChange={(v) => update("openrouterModel", v)}
            options={finalOptions}
            hint={
              modelsError
                ? `Não consegui obter a lista live: ${modelsError}. Mostro fallback.`
                : models.length > 0
                  ? "Lista actualizada em tempo real do OpenRouter. Filtrei por modelos multimodais (suportam imagens)."
                  : "Cola a chave para ver a lista actualizada."
            }
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !hasKey}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:border-zinc-400 disabled:opacity-50 dark:border-zinc-700"
          >
            {testing ? "A testar…" : "Testar chave"}
          </button>
          {testResult && (
            <span
              className={
                "ml-2 text-xs " +
                (testResult.startsWith("OK") ? "text-emerald-600" : "text-red-600")
              }
            >
              {testResult}
            </span>
          )}
        </div>
      </Card>

      <Card title="Estado">
        <ul className="space-y-1 text-sm">
          <li>
            <span className={hasKey ? "text-emerald-600" : "text-amber-600"}>●</span>{" "}
            Chave OpenRouter: {hasKey ? "configurada" : "em falta"}
          </li>
          <li>
            <span className={models.length > 0 ? "text-emerald-600" : "text-zinc-400"}>●</span>{" "}
            Modelos disponíveis com visão:{" "}
            {modelsLoading ? "a carregar…" : models.length > 0 ? `${models.length}` : "—"}
          </li>
          <li>
            <span className="text-zinc-400">●</span> Web Speech API: usa o reconhecimento de voz
            nativo do Chrome (sem chave, sem custo).
          </li>
        </ul>
      </Card>
    </div>
  );
}

function formatModelLabel(m: ModelInfo): string {
  const name = m.name ?? m.id;
  const promptPrice = m.pricing?.prompt ? `$${m.pricing.prompt}/Mtok` : null;
  if (promptPrice) return `${name} — ${promptPrice}`;
  return name;
}
