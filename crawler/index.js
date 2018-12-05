const NumazuCityService = require('./NumazuCityService');
const numazuCityService = new NumazuCityService();

(async () => {
    numazuCityService.crawl();
})();
