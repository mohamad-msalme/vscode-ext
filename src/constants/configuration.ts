// Added Removed Lines status Bar
const SHOW_ADDED_REMOVED_LINE_STATUS_BAR = "showAddedRemovedLineStatusBar";
const ADDED_REMOVED_LINE_STATUS_BAR_PRIORITY =
  "addedRemovedLineStatusBarPriority";
const ADDED_REMOVED_LINE_STATUS_BAR_ALIGNMENT =
  "addedRemovedLineStatusBarAlignment";

export const CONFIG_STATUS_BAR = {
  status: SHOW_ADDED_REMOVED_LINE_STATUS_BAR,
  priority: ADDED_REMOVED_LINE_STATUS_BAR_PRIORITY,
  alignment: ADDED_REMOVED_LINE_STATUS_BAR_ALIGNMENT,
};

type ConfigKeys = keyof typeof CONFIG_STATUS_BAR;

export const CONFIG_STATUS_BAR_WITH_SCOPE: Record<ConfigKeys, string> =
  Object.keys(CONFIG_STATUS_BAR).reduce(
    (acc, key) => ({
      ...acc,
      [key]: `devboost.${CONFIG_STATUS_BAR[key as ConfigKeys]}`,
    }),
    {} as Record<ConfigKeys, string>,
  );
