export type SettingsTab = 'customization' | 'history' | 'models' | 'api-keys' | 'attachments';

export interface SettingsTabPanelProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
} 