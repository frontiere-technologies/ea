export type FieldType = "text" | "select" | "switch" | "date" | "rich-text";

export interface AppFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  section: string;
  options?: { value: string; label: string }[];
  multiple?: boolean;
  conditional?: (values: Record<string, any>) => boolean;
}

export const applicationFields: AppFieldConfig[] = [
  // --- Basic information ---
  { name: "name", label: "Name", type: "text", section: "Basic information" },
  {
    name: "description",
    label: "Description",
    type: "rich-text",
    section: "Basic information",
  },
  {
    name: "ownerships",
    label: "Ownerships",
    type: "text",
    section: "Basic information",
  },

  // --- Application details ---
  {
    name: "application_type",
    label: "Application type",
    type: "select",
    section: "Application details",
    multiple: false,
    options: [
      { value: "Mobile Application", label: "Mobile application" },
      { value: "Web Application", label: "Web application" },
      { value: "Desktop Application", label: "Desktop application" },
      { value: "BackEnd Application", label: "Backend application" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    name: "complexity",
    label: "Complexity",
    type: "select",
    section: "Application details",
    multiple: false,
    options: [
      { value: "High", label: "High" },
      { value: "Medium", label: "Medium" },
      { value: "Low", label: "Low" },
      { value: "Critical", label: "Critical" },
      { value: "Unknown", label: "Unknown" },
    ],
  },
  {
    name: "criticality",
    label: "Criticality",
    type: "select",
    section: "Application details",
    multiple: false,
    options: [
      { value: "High", label: "High" },
      { value: "Medium", label: "Medium" },
      { value: "Low", label: "Low" },
      { value: "Critical", label: "Critical" },
      { value: "Unknown", label: "Unknown" },
    ],
  },
  {
    name: "effort",
    label: "Effort",
    type: "select",
    section: "Application details",
    multiple: false,
    options: [
      { value: "High", label: "High" },
      { value: "Medium", label: "Medium" },
      { value: "Low", label: "Low" },
      { value: "Critical", label: "Critical" },
      { value: "Unknown", label: "Unknown" },
    ],
  },
  {
    name: "processes",
    label: "Processes",
    type: "select",
    section: "Application details",
    multiple: true,
    options: [
      { value: "People", label: "People" },
      { value: "Finance", label: "Finance" },
      { value: "Contract Logistics", label: "Contract logistics" },
      { value: "LTL / B2C", label: "LTL / B2C" },
      { value: "Sales", label: "Sales" },
      { value: "FTL", label: "FTL" },
      { value: "Workshop Management", label: "Workshop management" },
      { value: "Air&Sea", label: "Air & sea" },
      { value: "Direct Purchasing", label: "Direct purchasing" },
      { value: "Security", label: "Security" },
      { value: "Sustainability & HSE", label: "Sustainability & HSE" },
      { value: "Tech 4 Tech", label: "Tech 4 tech" },
    ],
  },
  {
    name: "scope",
    label: "Scope",
    type: "select",
    section: "Application details",
    multiple: false,
    options: [
      { value: "Data & AI", label: "Data & AI" },
      { value: "Document & Content", label: "Document & content" },
      { value: "Finance", label: "Finance" },
      { value: "HR", label: "HR" },
      { value: "Infrastructure", label: "Infrastructure" },
      { value: "Integration/EDI", label: "Integration/EDI" },
      { value: "Purchasing", label: "Purchasing" },
      { value: "Sales", label: "Sales" },
      { value: "Sustainability", label: "Sustainability" },
      { value: "TMS", label: "TMS" },
      { value: "Traceability", label: "Traceability" },
      { value: "Workshop", label: "Workshop" },
    ],
  },
  {
    name: "organization_family",
    label: "Organization family",
    type: "select",
    section: "Application details",
    multiple: true,
    options: [
      { value: "Core Services", label: "Core Services" },
      { value: "Data & AI", label: "Data & AI" },
      { value: "Enterprise", label: "Enterprise" },
      { value: "Infrastructure", label: "Infrastructure" },
    ],
  },

  // --- Infrastructure ---
  {
    name: "hosting",
    label: "Hosting",
    type: "select",
    section: "Infrastructure",
    multiple: false,
    options: [
      { value: "Engineering Data Center", label: "Engineering data center" },
      { value: "GCP (Go Reply)", label: "GCP (Go Reply)" },
      { value: "Standalone", label: "Standalone" },
      { value: "Azure (Arcese)", label: "Azure (Arcese)" },
      { value: "Supplier Private Cloud", label: "Supplier private cloud" },
      { value: "Azure (Microsoft)", label: "Azure (Microsoft)" },
    ],
  },
  {
    name: "bi",
    label: "BI",
    type: "select",
    section: "Infrastructure",
    multiple: false,
    options: [
      { value: "Unknown", label: "Unknown" },
      { value: "Actual BI", label: "Actual BI" },
      { value: "To manage", label: "To manage" },
      { value: "Partial BI", label: "Partial BI" },
      { value: "Data Platform", label: "Data platform" },
    ],
  },
  {
    name: "user_license_type",
    label: "User license type",
    type: "select",
    section: "Infrastructure",
    multiple: false,
    options: [
      { value: "Licenza concorrente", label: "Licenza concorrente" },
      { value: "Licenza nominale", label: "Licenza nominale" },
      {
        value: "Licenza non applicata all'utente",
        label: "Licenza non applicata all'utente",
      },
      { value: "Nessuna licenza", label: "Nessuna licenza" },
    ],
  },
  {
    name: "access_type",
    label: "Access type",
    type: "select",
    section: "Infrastructure",
    multiple: true,
    options: [
      { value: "Utenza Applicativa", label: "Utenza applicativa" },
      { value: "Password ADFS (O365)", label: "Password ADFS (O365)" },
      { value: "Password applicazione", label: "Password applicazione" },
      {
        value: "Password di domino (LDAP)",
        label: "Password di domino (LDAP)",
      },
    ],
  },

  // --- Documentation ---
  {
    name: "sw_supplier",
    label: "Software supplier",
    type: "text",
    section: "Documentation",
  },
  {
    name: "links_to_sharepoint_documentation",
    label: "SharePoint documentation links",
    type: "text",
    section: "Documentation",
  },
  {
    name: "links_to_documentation",
    label: "Documentation links",
    type: "text",
    section: "Documentation",
  },

  // --- Contacts ---
  {
    name: "internal_application_specialists",
    label: "Internal application specialists",
    type: "text",
    section: "Contacts",
  },
  {
    name: "business_partner_business_contacts",
    label: "Business partner contacts",
    type: "text",
    section: "Contacts",
  },
  {
    name: "business_contacts",
    label: "Business contacts",
    type: "text",
    section: "Contacts",
  },
  {
    name: "internal_developers",
    label: "Internal developers",
    type: "text",
    section: "Contacts",
  },
  {
    name: "smes_factory",
    label: "SMEs factory",
    type: "text",
    section: "Contacts",
  },

  // --- AMS information ---
  { name: "ams", label: "AMS", type: "switch", section: "AMS information" },
  {
    name: "ams_service",
    label: "AMS service",
    type: "select",
    section: "AMS information",
    multiple: false,
    options: [
      { value: "No", label: "No" },
      { value: "On Demand", label: "On demand" },
    ],
  },
  {
    name: "ams_expire_date",
    label: "AMS expiry date",
    type: "date",
    section: "AMS information",
    conditional: (values) => values.ams === true,
  },
  {
    name: "ams_supplier",
    label: "AMS supplier",
    type: "text",
    section: "AMS information",
    conditional: (values) => values.ams === true,
  },
  {
    name: "ams_contacts_email",
    label: "AMS contacts email",
    type: "text",
    section: "AMS information",
    conditional: (values) => values.ams === true,
  },
  {
    name: "ams_contacts_phone",
    label: "AMS contacts phone",
    type: "text",
    section: "AMS information",
    conditional: (values) => values.ams === true,
  },
  {
    name: "ams_portal",
    label: "AMS portal",
    type: "text",
    section: "AMS information",
    conditional: (values) => values.ams === true,
  },
  {
    name: "ams_type",
    label: "AMS type",
    type: "text",
    section: "AMS information",
    conditional: (values) => values.ams === true,
  },

  // --- Status and flags ---
  {
    name: "active",
    label: "Active",
    type: "switch",
    section: "Status and flags",
  },
  {
    name: "disaster_recovery",
    label: "Disaster recovery",
    type: "switch",
    section: "Status and flags",
  },
  {
    name: "to_be_decommissioned",
    label: "To be decommissioned",
    type: "switch",
    section: "Status and flags",
  },
  {
    name: "decommission_date",
    label: "Decommission date",
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
