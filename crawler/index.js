const NumazuCityService = require('./NumazuCityService');
const numazuCityService = new NumazuCityService();
const MishimaCityService = require('./MishimaCityService');
const mishimaCityService = new MishimaCityService();
const IzunokuniCityService = require('./IzunokuniCityService');
const izunokuniCityService = new IzunokuniCityService();

const crawlers = [numazuCityService, mishimaCityService, izunokuniCityService];

(async () => {
    for (let crawler of crawlers) {
        await crawler.crawl();
    }
})();
