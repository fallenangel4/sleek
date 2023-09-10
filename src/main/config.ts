import Store from 'electron-store';
import path from 'path';
import { app, nativeTheme } from 'electron';
import fs from 'fs';
import { mainWindow } from './main';
import buildMenu from './menu';
import { Sorting, File, ConfigData } from './util';
import processDataRequest from './modules/ProcessDataRequest';

const defaultConfigData = {
  sorting: [
    { id: '1', value: 'priority', invert: false },
    { id: '2', value: 'projects', invert: false },
    { id: '3', value: 'contexts', invert: false },
    { id: '4', value: 'due', invert: false },
    { id: '5', value: 't', invert: false },
    { id: '6', value: 'completed', invert: false },
    { id: '7', value: 'created', invert: false },
  ],
  accordionOpenState: [
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false
  ],
  files: [],
  appendCreationDate: false,
  showCompleted: true,
  showHidden: true,
  windowMaximized: false,
  fileSorting: false,
  convertRelativeToAbsoluteDates: true,
  thresholdDateInTheFuture: true,
  dueDateInTheFuture: true,
  colorTheme: 'system',
  shouldUseDarkColors: false,
  notificationsAllowed: false,
};

const userDataDirectory = path.join(app.getPath('userData'), 'userData' + app.getVersion());
if (!fs.existsSync(userDataDirectory)) fs.mkdirSync(userDataDirectory)
console.log('config.ts: sleek userdata is located at: ' + userDataDirectory);

const configPath = path.join(userDataDirectory, 'config.json');
const configStorage = new Store<ConfigData>({ cwd: userDataDirectory, name: 'config' });
const filtersPath = path.join(userDataDirectory, 'filters.json');
const filterStorage = new Store<{}>({ cwd: userDataDirectory, name: 'filters' });

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfigData, null, 2));
}

if (!fs.existsSync(filtersPath)) {
  const defaultFilterData = {};
  fs.writeFileSync(filtersPath, JSON.stringify(defaultFilterData));
}

const handleConfigChange = async (key: string, newValue: any) => {
  // todo: what if search string was set previously? This would remove it
  const [todoObjects, attributes, headers, filters] = await processDataRequest('');
  mainWindow!.webContents.send('requestData', todoObjects, attributes, headers, filters);
  if (key === 'sorting') {
    mainWindow!.webContents.send('updateSorting', newValue);
  }
};

filterStorage.onDidChange('filters' as never, async () => {
  const [todoObjects, attributes, headers, filters] = await processDataRequest('');
  mainWindow!.webContents.send('requestData', todoObjects, attributes, headers, filters);
});

configStorage.onDidChange('files', (files: File[] | undefined) => {
  if (files) {
    buildMenu(files);
    mainWindow!.webContents.send('updateFiles', files);
  }
});

configStorage.onDidChange('showCompleted', () => {
  handleConfigChange('showCompleted', configStorage.get('showCompleted'));
});

configStorage.onDidChange('showHidden', () => {
  handleConfigChange('showHidden', configStorage.get('showHidden'));
});

configStorage.onDidChange('thresholdDateInTheFuture', () => {
  handleConfigChange('thresholdDateInTheFuture', configStorage.get('thresholdDateInTheFuture'));
});

configStorage.onDidChange('dueDateInTheFuture', () => {
  handleConfigChange('dueDateInTheFuture', configStorage.get('dueDateInTheFuture'));
});

configStorage.onDidChange('sorting', (sorting) => {
  handleConfigChange('sorting', sorting);
});

configStorage.onDidChange('fileSorting', (fileSorting) => {
  handleConfigChange('fileSorting', fileSorting);
});

configStorage.onDidChange('colorTheme', (colorTheme) => {
  nativeTheme.themeSource = colorTheme;
});

nativeTheme.on('updated', () => {
  const shouldUseDarkColors = nativeTheme.shouldUseDarkColors;
  configStorage.set('shouldUseDarkColors', shouldUseDarkColors);
  mainWindow!.webContents.send('shouldUseDarkColors', shouldUseDarkColors);
});

export { configStorage, filterStorage };
