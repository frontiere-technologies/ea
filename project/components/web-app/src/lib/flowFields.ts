export type FieldType = "text" | "select" | "switch" | "date" | "rich-text";

export interface FlowFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  section: string;
  options?: { value: string; label: string }[];
  multiple?: boolean;
  conditional?: (values: Record<string, any>) => boolean;
}

export const flowFields: FlowFieldConfig[] = [
  // --- Basic information ---
  { name: "name", label: "Name", type: "text", section: "Basic information" },
  {
    name: "description",
    label: "Description",
    type: "rich-text",
    section: "Basic information",
  },

  // --- Flow details ---
  {
    name: "initiator_application",
    label: "Initiator Application",
    type: "text", // è un select ma dinamico → trattato come text per ora
    section: "Flow details",
  },
  {
    name: "target_application",
    label: "Target Application",
    type: "text", // idem
    section: "Flow details",
  },
  {
    name: "communication_mode",
    label: "Communication Mode",
    type: "select",
    section: "Flow details",
    options: [
      { value: "Synchronous", label: "Synchronous" },
      { value: "Asynchronous", label: "Asynchronous" },
    ],
  },
  {
    name: "intent",
    label: "Intent",
    type: "select",
    section: "Flow details",
    options: [
      { value: "read", label: "read" },
      { value: "write", label: "write" },
      { value: "read:query", label: "read:query" },
      { value: "read:dequeue", label: "read:dequeue" },
      { value: "read:subscribe", label: "read:subscribe" },
      { value: "write:command", label: "write:command" },
      { value: "write:insert", label: "write:insert" },
      { value: "write:enqueue", label: "write:enqueue" },
      { value: "write:publish", label: "write:publish" },
      { value: "unknown", label: "unknown" },
    ],
  },
  {
    name: "message_format",
    label: "Message Format",
    type: "select",
    section: "Flow details",
    options: [
      { value: "binary", label: "Binary" },
      { value: "csv", label: "CSV" },
      { value: "doc", label: "Doc" },
      { value: "image", label: "Image" },
      { value: "json", label: "JSON" },
      { value: "pdf", label: "PDF" },
      { value: "text", label: "Text" },
      { value: "xml", label: "XML" },
      { value: "multiple-formats", label: "Multiple formats" },
      { value: "unknown", label: "Unknown" },
    ],
  },
  {
    name: "data_flow",
    label: "Data Flow",
    type: "select",
    section: "Flow details",
    options: [
      { value: "in", label: "In" },
      { value: "out", label: "Out" },
    ],
  },
  {
    name: "protocol",
    label: "Protocol",
    type: "select",
    section: "Flow details",
    options: [
      { value: "api", label: "api" },
      { value: "cdc:debezium", label: "cdc:debezium" },
      { value: "db", label: "db" },
      { value: "db:stored-procedure", label: "db:stored-procedure" },
      { value: "edi:generic", label: "edi:generic" },
      { value: "email", label: "email" },
      { value: "folder", label: "folder" },
      { value: "ftp", label: "ftp" },
      { value: "http", label: "http" },
      { value: "http:azure-blob-storage", label: "http:azure-blob-storage" },
      { value: "human-manual-task", label: "human-manual-task" },
      { value: "ldap", label: "ldap" },
      { value: "queue", label: "queue" },
      { value: "queue:azure-service-bus", label: "queue:azure-service-bus" },
      { value: "soap", label: "soap" },
      { value: "topic", label: "topic" },
      { value: "topic:kafka", label: "topic:kafka" },
      { value: "wcf", label: "wcf" },
      { value: "web-api", label: "web-api" },
      { value: "unknown", label: "unknown" },
    ],
  },
  {
    name: "labels",
    label: "Labels",
    type: "text",
    section: "Flow details",
  },

  // --- Details ---
  {
    name: "frequency",
    label: "Frequency",
    type: "text",
    section: "Details",
  },
  {
    name: "estimated_calls_per_day",
    label: "Estimated Calls per Day",
    type: "text",
    section: "Details",
  },
  {
    name: "average_execution_time_in_sec",
    label: "Average Execution Time (sec)",
    type: "text",
    section: "Details",
  },
  {
    name: "average_message_size_in_kb",
    label: "Average Message Size (KB)",
    type: "text",
    section: "Details",
  },

  // --- Status and flags ---
  {
    name: "api_gateway",
    label: "API Gateway",
    type: "switch",
    section: "Status and flags",
  },
  {
    name: "release_date",
    label: "Release Date",
    type: "date",
    section: "Status and flags",
  },

  // --- Additional information ---
  {
    name: "notes",
    label: "Notes",
    type: "rich-text",
    section: "Additional information",
  },
];
