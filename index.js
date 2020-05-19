import { resolve } from 'path';
import { existsSync } from 'fs';


import { i18n } from '@kbn/i18n';

import csvGeneratorRoute from './server/routes/csvGenerator';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'csv_generator',
    uiExports: {
      app: {
        title: 'Csv Generator',
        description: 'csv generator plugin ',
        main: 'plugins/csv_generator/app',
      },
      styleSheetPaths: [resolve(__dirname, 'public/app.scss'), resolve(__dirname, 'public/app.css')].find(p => existsSync(p)),
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server, options) { // eslint-disable-line no-unused-vars
      const esDriver            = server.plugins.elasticsearch;
      const esServer            = server.plugins;
      const CsvGeneratorService = require('./server/services/CsvGeneratorService');
      const SetupService        = require('./server/services/SetupService');
      const DownloadService     = require('./server/services/DownloadService');
      const RecentCsvService    = require('./server/services/RecentCsvService');
      const csvService          = new CsvGeneratorService(esDriver, esServer);
      const setupService        = new SetupService(esDriver, esServer);
      const downloadService     = new DownloadService(esDriver, esServer);
      const recentCsvService    = new RecentCsvService(esDriver, esServer);
      const services            = { csvService, setupService, downloadService, recentCsvService };

        const xpackMainPlugin = server.plugins.xpack_main;
        if (xpackMainPlugin) {
          const featureId = 'csv_generator';

          xpackMainPlugin.registerFeature({
            id: featureId,
            name: i18n.translate('csvGenerator.featureRegistry.featureName', {
              defaultMessage: 'csvGenerator',
            }),
            navLinkId: featureId,
            icon: 'questionInCircle',
            app: [featureId, 'kibana'],
            catalogue: [],
            privileges: {
              all: {
                api: [],
                savedObject: {
                  all: [],
                  read: [],
                },
                ui: ['show'],
              },
              read: {
                api: [],
                savedObject: {
                  all: [],
                  read: [],
                },
                ui: ['show'],
              },
            },
          });
        }

      // Add server routes and initialize the plugin here
      csvGeneratorRoute(server, options, services);
    }
  });
}
