const NumazuCityService = require('./NumazuCityService');
const numazuCityService = new NumazuCityService();
const MishimaCityService = require('./MishimaCityService');
const mishimaCityService = new MishimaCityService();

const crawlers = [numazuCityService, mishimaCityService];

(async () => {
    for (let crawler of crawlers) {
        await crawler.crawl();
    }
})();
