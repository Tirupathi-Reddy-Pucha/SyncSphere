/**
 * Azure Application Insights & Log Analytics Service
 * Real-time Application Performance Monitoring (APM), telemetry, and distributed tracing
 */
const appInsights = require('applicationinsights');
const path = require('path');
const keyVaultService = require('./keyVaultService');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

class AppInsightsService {
    constructor() {
        this.client = null;
        this.initialized = false;
        this.connectionString = null;
        this.appId = 'appi-syncsphere-2026';
        this.workspaceName = 'log-syncsphere-2026';
        this.init();
    }

    init() {
        let connStr = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || process.env.APPINSIGHTS_CONNECTIONSTRING;
        if (!connStr && keyVaultService.cache.has('APPLICATIONINSIGHTS-CONNECTION-STRING')) {
            connStr = keyVaultService.cache.get('APPLICATIONINSIGHTS-CONNECTION-STRING')?.value;
        }

        if (connStr && connStr.trim()) {
            try {
                this.connectionString = connStr.trim();
                appInsights.setup(this.connectionString)
                    .setAutoDependencyCorrelation(true)
                    .setAutoCollectRequests(true)
                    .setAutoCollectPerformance(true, true)
                    .setAutoCollectExceptions(true)
                    .setAutoCollectDependencies(true)
                    .setAutoCollectConsole(true)
                    .setUseDiskRetryCaching(true)
                    .setSendLiveMetrics(true);

                appInsights.start();
                this.client = appInsights.defaultClient;
                this.initialized = true;
                console.log('📊 Azure Application Insights: APM streaming active');
            } catch (err) {
                console.warn('⚠️ Application Insights startup notice:', err.message);
            }
        } else {
            console.log('ℹ️ Application Insights: Waiting for connection string');
        }
    }

    trackEvent(name, properties = {}) {
        if (this.client) {
            try {
                this.client.trackEvent({ name, properties });
            } catch (_) { }
        }
    }

    trackMetric(name, value) {
        if (this.client) {
            try {
                this.client.trackMetric({ name, value });
            } catch (_) { }
        }
    }

    getStatus() {
        return {
            service: 'Azure Application Insights',
            name: this.appId,
            workspace: this.workspaceName,
            status: this.initialized ? 'ACTIVE' : (this.connectionString ? 'CONNECTING' : 'READY'),
            ingestionMode: 'Log Analytics Workspace (PerGB2018)',
            location: 'East Asia',
            liveMetrics: true,
            features: [
                'Live HTTP Request Telemetry',
                'Performance & APM Metrics',
                'Distributed Tracing',
                'Log Analytics 30-Day Retention'
            ]
        };
    }
}

const appInsightsService = new AppInsightsService();
module.exports = appInsightsService;
