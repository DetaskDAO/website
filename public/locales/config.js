import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import publicUS from './en/index.json';
import publicCN from './zh/index.json';

import taskUS from './en/task.json';
import taskCN from './zh/task.json';

const resources = {
    "zh": {
        translation: publicCN,
        task: taskCN,
    },
    "en": {
        translation: publicUS,
        task: taskUS,
    }
};

i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
