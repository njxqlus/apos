import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      configuration: "Configuration",
      runtime_architecture: "Runtime Architecture",
      throughput: "Throughput (RPS)",
      payload_size: "Payload Size",
      estimation: "Infrastructure Estimation",
      export: "Export",
      copy_markdown: "Copy as Markdown",
      export_pdf: "Download PDF",
      copied: "Copied!",
      downloading: "Downloading...",
      protocol: "Protocol",
      bandwidth: "Bandwidth",
      cpu_cores: "CPU Cores",
      ram: "RAM",
      latency: "Latency",
      cpu_util: "CPU Util",
      Native_Performance: "Native / Compiled",
      Managed_Runtime: "Managed / JIT",
      Enterprise_Abstraction: "Enterprise / Abstracted",
      theme_light: "Light",
      theme_dark: "Dark",
      theme_system: "System",
      metric_help_aria: "About {{title}}",
      runtime_help_aria: "About Runtime Architectures",
      runtime_architectures: "Runtime Architectures",
      runtime_choose_tier:
        "Choose the performance tier of your application's execution environment.",
      tier: "Tier",
      characteristics: "Characteristics",
      examples: "Examples",
      native_compiled: "Native / Compiled",
      managed_jit: "Managed / JIT",
      enterprise_abstracted: "Enterprise / Abstracted",
      native_desc:
        "Direct machine code execution, manual or highly efficient memory management.",
      managed_desc:
        "Fast execution but requires a Virtual Machine and significant Garbage Collection (GC) overhead.",
      enterprise_desc:
        "Heavy use of reflection, dependency injection, and deep middleware stacks.",
      rps_scale: "RPS SCALE",
      payload_scale: "Payload Scale",
      min: "Min",
      max: "Max",
      summary_framework: "Framework",
      summary_efficiency: "Framework Efficiency",
      summary_ram_penalty: "Baseline RAM Penalty",
      summary_workload: "Workload",
      summary_payload: "Payload Size",
      disclaimer: {
        title: "What this calculator estimates",
        intro:
          "This tool models server-side resource consumption for a single receiving node processing incoming requests over a secure (TLS) connection. It estimates the load on the <1>consumer/receiver</1> — the application server that accepts requests, processes them, and writes to fast storage (e.g. Redis, in-memory cache).",
        included_title: "What is included in the model:",
        included_items: [
          "Network bandwidth based on payload + protocol overhead + TLS framing",
          "CPU cores based on protocol efficiency, framework tier, and payload size penalty",
          "RAM based on concurrency (Little's Law) + per-request buffers + framework baseline",
          "Latency based on RTT + TLS handshake + protocol processing + framework overhead",
          "Utilization-based latency growth at high load",
        ],
        not_included_title: "What is NOT modeled:",
        not_included_items: [
          "Database or downstream service latency",
          "Horizontal scaling across multiple nodes",
          "Broker-side resources for Kafka/AMQP (only the consumer client is modeled)",
          "Network infrastructure (load balancers, proxies, firewalls)",
          "GC pauses, JVM warmup, or runtime-specific behavior",
          "Disk I/O",
          "Burst traffic and autoscaling behavior",
        ],
        accuracy:
          "<0>Accuracy:</0> estimates are within ±15–20% for typical workloads (1KB–10KB payload, up to 100k RPS). Accuracy degrades at extreme combinations of high RPS and large payloads (100k RPS × 100KB+) where memory bandwidth becomes the bottleneck and the model may overestimate CPU requirements.",
        use_case:
          "<0>Use this tool for:</0> initial capacity planning, architecture trade-off comparisons, and protocol selection. Do not use as a substitute for load testing.",
      },
      metrics: {
        bandwidth: {
          title: "Network Bandwidth",
          description:
            "The total network throughput required to handle the given RPS and payload size. This includes the request payload, response data, and estimated protocol-specific overhead (headers, framing, etc.) in both directions.",
        },
        cpuCores: {
          title: "CPU Cores",
          description:
            "The estimated number of virtual CPU cores (vCPUs) required to process the workload. This takes into account protocol-specific parsing efficiency and a penalty for larger payloads that require more processing time per byte.",
        },
        ram: {
          title: "Memory Allocation",
          description:
            "The estimated RAM footprint of the infrastructure. For stateless protocols, this is based on in-flight requests and their payload sizes. For stateful protocols (like Kafka/AMQP), it adds baseline overhead and message buffering requirements.",
        },
        latency: {
          title: "Network Latency",
          description:
            "The projected end-to-end response time. This includes network round-trip time (RTT, 30 ms), protocol internal processing latency, and additional queuing delays that occur when CPU utilization exceeds 70%.",
        },
        utilization: {
          title: "CPU Utilization",
          description:
            "The average processor load across all allocated cores. Maintaining utilization below 70-80% is recommended to prevent 'tail latency' spikes where queuing delays cause unpredictable slow responses.",
        },
      },
      footer: {
        useful: "Find Useful?",
        star: "Give a star on github",
        check: "Check out real-time testops platform",
        testtrain: "TestTrain",
      },
    },
  },
  es: {
    translation: {
      configuration: "Configuración",
      runtime_architecture: "Arquitectura de Ejecución",
      throughput: "Rendimiento (RPS)",
      payload_size: "Tamaño de Carga",
      estimation: "Estimación de Infraestructura",
      export: "Exportar",
      copy_markdown: "Copiar como Markdown",
      export_pdf: "Descargar PDF",
      copied: "¡Copiado!",
      downloading: "Descargando...",
      protocol: "Protocolo",
      bandwidth: "Ancho de Banda",
      cpu_cores: "Núcleos de CPU",
      ram: "RAM",
      latency: "Latencia",
      cpu_util: "Uso de CPU",
      Native_Performance: "Nativo / Compilado",
      Managed_Runtime: "Gestionado / JIT",
      Enterprise_Abstraction: "Empresarial / Abstraído",
      theme_light: "Claro",
      theme_dark: "Oscuro",
      theme_system: "Sistema",
      metric_help_aria: "Sobre {{title}}",
      runtime_help_aria: "Sobre las Arquitecturas de Ejecución",
      runtime_architectures: "Arquitecturas de Ejecución",
      runtime_choose_tier:
        "Elija el nivel de rendimiento del entorno de ejecución de su aplicación.",
      tier: "Nivel",
      characteristics: "Características",
      examples: "Ejemplos",
      native_compiled: "Nativo / Compilado",
      managed_jit: "Gestionado / JIT",
      enterprise_abstracted: "Empresarial / Abstraído",
      native_desc:
        "Ejecución directa de código máquina, gestión de memoria manual o altamente eficiente.",
      managed_desc:
        "Ejecución rápida pero requiere una Máquina Virtual y una sobrecarga significativa de Recolección de Basura (GC).",
      enterprise_desc:
        "Uso intensivo de reflexión, inyección de dependencias y pilas de middleware profundas.",
      rps_scale: "ESCALA RPS",
      payload_scale: "Escala de Carga",
      min: "Mín",
      max: "Máx",
      summary_framework: "Entorno",
      summary_efficiency: "Eficiencia del Entorno",
      summary_ram_penalty: "Penalización de RAM Base",
      summary_workload: "Carga de Trabajo",
      summary_payload: "Tamaño de Carga",
      disclaimer: {
        title: "Qué estima esta calculadora",
        intro:
          "Esta herramienta modela el consumo de recursos en el lado del servidor para un solo nodo receptor que procesa solicitudes entrantes sobre una conexión segura (TLS). Estima la carga en el <1>consumidor/receptor</1> — el servidor de aplicaciones que acepta solicitudes, las procesa y escribe en un almacenamiento rápido (por ejemplo, Redis, caché en memoria).",
        included_title: "Lo que se incluye en el modelo:",
        included_items: [
          "Ancho de banda de red basado en carga útil + sobrecarga de protocolo + tramas TLS",
          "Núcleos de CPU basados en la eficiencia del protocolo, el nivel del entorno y la penalización por tamaño de carga",
          "RAM basada en la concurrencia (Ley de Little) + búferes por solicitud + base del entorno",
          "Latencia basada en RTT + saludo TLS + procesamiento de protocolo + sobrecarga del entorno",
          "Crecimiento de latencia basado en el uso con cargas altas",
        ],
        not_included_title: "Lo que NO se modela:",
        not_included_items: [
          "Latencia de base de datos o servicios descendentes",
          "Escalado horizontal en múltiples nodos",
          "Recursos del lado del broker para Kafka/AMQP (solo se modela el cliente consumidor)",
          "Infraestructura de red (balanceadores de carga, proxies, firewalls)",
          "Pausas de GC, calentamiento de JVM o comportamiento específico del tiempo de ejecución",
          "E/S de disco",
          "Tráfico en ráfagas y comportamiento de autoescalado",
        ],
        accuracy:
          "<0>Precisión:</0> las estimaciones están dentro de un ±15–20% para cargas de trabajo típicas (carga de 1KB–10KB, hasta 100k RPS). La precisión se degrada en combinaciones extremas de alto RPS y cargas grandes (100k RPS × 100KB+) donde el ancho de banda de la memoria se convierte en el cuello de botella y el modelo puede sobreestimar los requisitos de CPU.",
        use_case:
          "<1>Use esta herramienta para:</1> planificación inicial de capacidad, comparaciones de arquitectura y selección de protocolo. No utilizar como sustituto de las pruebas de carga.",
      },
      metrics: {
        bandwidth: {
          title: "Ancho de Banda de Red",
          description:
            "La demanda total de red necesaria para manejar el RPS y el tamaño de carga dados. Esto incluye la carga útil de la solicitud, los datos de respuesta y la sobrecarga estimada específica del protocolo (cabeceras, tramas, etc.) en ambas direcciones.",
        },
        cpuCores: {
          title: "Núcleos de CPU",
          description:
            "El número estimado de núcleos de CPU virtuales (vCPUs) requeridos para procesar la carga de trabajo. Esto tiene en cuenta la eficiencia de procesamiento específica del protocolo y una penalización para cargas más grandes que requieren más tiempo de procesamiento por byte.",
        },
        ram: {
          title: "Asignación de Memoria",
          description:
            "La huella de RAM estimada de la infraestructura. Para protocolos sin estado, esto se basa en las solicitudes en curso y sus tamaños de carga. Para protocolos con estado (como Kafka/AMQP), añade una sobrecarga base y requisitos de almacenamiento intermedio de mensajes.",
        },
        latency: {
          title: "Latencia de Red",
          description:
            "El tiempo de respuesta proyectado de extremo a extremo. Esto incluye el tiempo de ida y vuelta de la red (RTT, 30 ms), la latencia de procesamiento interno del protocolo y los retrasos de cola adicionales que ocurren cuando el uso de la CPU supera el 70%.",
        },
        utilization: {
          title: "Uso de CPU",
          description:
            "La carga promedio del procesador en todos los núcleos asignados. Se recomienda mantener el uso por debajo del 70-80% para evitar picos de 'latencia de cola' donde los retrasos de cola causan respuestas lentas impredecibles.",
        },
      },
      footer: {
        useful: "¿Te resultó útil?",
        star: "Danos una estrella en github",
        check: "Prueba la plataforma TestOps en tiempo real",
        testtrain: "TestTrain",
      },
    },
  },
  ru: {
    translation: {
      configuration: "Конфигурация",
      runtime_architecture: "Архитектура исполнения",
      throughput: "Пропускная способность (RPS)",
      payload_size: "Размер полезной нагрузки",
      estimation: "Оценка инфраструктуры",
      export: "Экспорт",
      copy_markdown: "Копировать как Markdown",
      export_pdf: "Скачать PDF",
      copied: "Скопировано!",
      downloading: "Загрузка...",
      protocol: "Протокол",
      bandwidth: "Пропускная способность",
      cpu_cores: "Ядра CPU",
      ram: "ОЗУ",
      latency: "Задержка",
      cpu_util: "Загрузка CPU",
      Native_Performance: "Native / Компилируемый",
      Managed_Runtime: "Managed / JIT",
      Enterprise_Abstraction: "Enterprise / Абстрагированный",
      theme_light: "Светлая",
      theme_dark: "Темная",
      theme_system: "Системная",
      metric_help_aria: "О {{title}}",
      runtime_help_aria: "Об архитектурах исполнения",
      runtime_architectures: "Архитектуры исполнения",
      runtime_choose_tier:
        "Выберите уровень производительности среды исполнения вашего приложения.",
      tier: "Уровень",
      characteristics: "Характеристики",
      examples: "Примеры",
      native_compiled: "Native / Компилируемый",
      managed_jit: "Managed / JIT",
      enterprise_abstracted: "Enterprise / Абстрагированный",
      native_desc:
        "Прямое выполнение машинного кода, ручное или высокоэффективное управление памятью.",
      managed_desc:
        "Быстрое выполнение, но требуется виртуальная машина и значительные накладные расходы на сборку мусора (GC).",
      enterprise_desc:
        "Активное использование рефлексии, внедрения зависимостей (DI) и глубоких стеков промежуточного ПО.",
      rps_scale: "ШКАЛА RPS",
      payload_scale: "Шкала нагрузки",
      min: "Мин",
      max: "Макс",
      summary_framework: "Среда",
      summary_efficiency: "Эффективность среды",
      summary_ram_penalty: "Базовый штраф ОЗУ",
      summary_workload: "Нагрузка",
      summary_payload: "Размер полезной нагрузки",
      disclaimer: {
        title: "Что оценивает этот калькулятор",
        intro:
          "Этот инструмент моделирует потребление ресурсов на стороне сервера для одного принимающего узла, обрабатывающего входящие запросы через защищенное соединение (TLS). Он оценивает нагрузку на <1>потребителя/получателя</1> — сервер приложения, который принимает запросы, обрабатывает их и записывает в быстрое хранилище (например, Redis, кэш в памяти).",
        included_title: "Что включено в модель:",
        included_items: [
          "Пропускная способность сети на основе полезной нагрузки + накладных расходов протокола + фрейминга TLS",
          "Ядра CPU на основе эффективности протокола, уровня среды исполнения и штрафа за размер полезной нагрузки",
          "ОЗУ на основе конкурентности (закон Литтла) + буферы на каждый запрос + база среды исполнения",
          "Задержка на основе RTT + TLS handshake + обработка протокола + накладные расходы среды",
          "Рост задержки в зависимости от утилизации при высокой нагрузке",
        ],
        not_included_title: "Что НЕ моделируется:",
        not_included_items: [
          "Задержка базы данных или нижестоящих сервисов",
          "Горизонтальное масштабирование на несколько узлов",
          "Ресурсы на стороне брокера для Kafka/AMQP (моделируется только клиент-потребитель)",
          "Сетевая инфраструктура (балансировщики нагрузки, прокси, файерволы)",
          "Паузы GC, прогрев JVM или специфическое поведение среды исполнения",
          "Дисковый ввод-вывод",
          "Всплески трафика и поведение автомасштабирования",
        ],
        accuracy:
          "<0>Точность:</0> оценки находятся в пределах ±15–20% для типичных нагрузок (полезная нагрузка 1КБ–10КБ, до 100k RPS). Точность снижается при экстремальных сочетаниях высокого RPS и больших нагрузок (100k RPS × 100КБ+), где пропускная способность памяти становится узким местом, и модель может завышать требования к CPU.",
        use_case:
          "<1>Используйте этот инструмент для:</1> первоначального планирования мощностей, сравнения архитектурных компромиссов и выбора протокола. Не используйте как замену нагрузочному тестированию.",
      },
      metrics: {
        bandwidth: {
          title: "Пропускная способность сети",
          description:
            "Общая пропускная способность сети, необходимая для обработки заданного RPS и размера полезной нагрузки. Включает полезную нагрузку запроса, данные ответа и расчетные накладные расходы протокола (заголовки, фрейминг и т.д.) в обоих направлениях.",
        },
        cpuCores: {
          title: "Ядра CPU",
          description:
            "Оценочное количество виртуальных ядер CPU (vCPU), необходимых для обработки рабочей нагрузки. Учитывает эффективность парсинга протокола и штраф за большие нагрузки, требующие больше времени обработки на байт.",
        },
        ram: {
          title: "Распределение памяти",
          description:
            "Оценочный объем ОЗУ инфраструктуры. Для протоколов без сохранения состояния рассчитывается на основе запросов 'в полете' и их размеров. Для протоколов с сохранением состояния (например, Kafka/AMQP) добавляются базовые накладные расходы и требования к буферизации сообщений.",
        },
        latency: {
          title: "Сетевая задержка",
          description:
            "Прогнозируемое конечное время ответа. Включает время кругового обхода сети (RTT, 30 мс), внутреннюю задержку обработки протокола и дополнительные задержки в очередях, возникающие при превышении загрузки CPU более 70%.",
        },
        utilization: {
          title: "Загрузка CPU",
          description:
            "Средняя нагрузка процессора на все выделенные ядра. Рекомендуется поддерживать загрузку ниже 70-80% для предотвращения всплесков 'хвостовой задержки', когда задержки в очередях вызывают непредсказуемо медленные ответы.",
        },
      },
      footer: {
        useful: "Полезно?",
        star: "Поставьте звезду на GitHub",
        check: "Попробуйте TestOps-платформу реального времени",
        testtrain: "TestTrain",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

// Synchronize HTML lang attribute
if (typeof document !== "undefined") {
  i18n.on("languageChanged", (lng) => {
    document.documentElement.lang = lng;
  });
}

export default i18n;
