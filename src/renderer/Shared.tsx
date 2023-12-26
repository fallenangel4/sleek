import { i18n } from './Settings/LanguageSelector';

const { ipcRenderer, store } = window.api;

export const handleFilterSelect = (key: string, value: string | string[], filters: Filters, isCtrlKeyPressed: boolean) => {
  try {
    const updatedFilters: Filters = { ...filters };
    const filterList: Filter[] = updatedFilters[key] || [];

    if(typeof value === 'string') {
      const values = value.split(',');
      values.forEach((singleValue) => {
        const filterIndex: number = filterList.findIndex((filter) => filter.value === singleValue);
        if(filterIndex !== -1) {
          filterList.splice(filterIndex, 1);
          if(isCtrlKeyPressed) {
            filterList.push({ value: singleValue, exclude: true });
          }
        } else {
          filterList.push({ value: singleValue, exclude: isCtrlKeyPressed });
        }
      });
    } else {
      const filterIndex = filterList.findIndex((filter: Filter) => filter.value === value);
      if(filterIndex !== -1) {
        filterList.splice(filterIndex, 1);
        if(isCtrlKeyPressed) {
          filterList.push({ value, exclude: true });
        }
      } else {
        filterList.push({ value, exclude: isCtrlKeyPressed });
      }
    }
    updatedFilters[key] = filterList;
    store.setFilters(updatedFilters);
    ipcRenderer.send('requestData');
  } catch (error: any) {
    console.error(error);
  }
};

export const translatedAttributes = (t: typeof i18n.t) => ({
  t: t('shared.attributeMapping.t'),
  due: t('shared.attributeMapping.due'),
  projects: t('shared.attributeMapping.projects'),
  contexts: t('shared.attributeMapping.contexts'),
  priority: t('shared.attributeMapping.priority'),
  rec: t('shared.attributeMapping.rec'),
  pm: t('shared.attributeMapping.pm'),
  created: t('shared.attributeMapping.created'),
  completed: t('shared.attributeMapping.completed'),
});